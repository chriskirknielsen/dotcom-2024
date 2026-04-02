---
title: "How I nerd-sniped myself into importing Nike Running Club data via the Strava API"
summary: "Taking legacy TCX data from Nike and importing it to Strava"
tags: [personal, api]
time: '13:37:00'
---

{{ callout }}Heads up: this is a long post, but I share all my code in the [tl;dr](#tl-dr) at the end!{{ /callout }}

Last week, I played with the idea of showing statistics related to my running below the other [site-related stats](/stats/). I’ve only been running since some time in 2022, which wouldn’t be such a big thing if it weren’t for the fact I had never been athletic in my life before (except when forced to, i.e. in P.E class, and to avoid missing a bus or subway).

At first, I went to my app, Nike Running Club (a.k.a. NRC) and wrote down in a JSON file each year’s aggregated stats: count, distance, time, and a few other bits and bobs. I figured I’d periodically update this manually, but when I found out Strava had an API, I had done it and needed to make it better: I nerd-sniped myself.

I’ve been on Strava since late December 2024, meaning about 2 years of data was missing. Not great to get a full picture (which is important to one person and one person only: me). And while Strava allows you to connect with NRC, it only captures activities moving forward, not from the past.

I stumbled upon [a helpful reddit comment](https://www.reddit.com/r/Strava/comments/1c9xkly/comment/l63dh0y/) where somebody explained how they migrated data. Basically: [ask Nike to send an archive of your data](https://www.nike.com/help/privacy), specifically TCX files (spoiler alert: it’s just XML), and that’s it. The comment mentions GDPR and such, but on my end, I asked Friday around 3pm, and had the download link around 9pm. They do ask you to confirm your request, but they didn’t seem combative.

The TCX files are named with UUIDs, so not very easy to explore, and in my case, to filter the 2+ years I wanted to import, to avoid duplicates. Luckily, [another comment provides a bash script](https://www.reddit.com/r/Strava/comments/1c9xkly/comment/mibyutb/) to rename all the files prefixed with the date information within. I don’t know what all these commands do, but it works, so thank you, Efficient_Soft773! For Mac/Linux, save this into a file like `rename.sh`, place it in the same folder as your TCX files, and run `sh rename.sh`. Sharing it below in case the Reddit comment vanishes:

```bash
# goal: append filenames with time
for filename in *.tcx; do
  T0=$(sed '7q;d' ${filename} | awk -F'"' '{print $2}' | awk -F 'T' '{print $1}')
  T0_str=$(date -j -f '%Y-%m-%d' "$T0" +'%Y%m%d') 
  fileheader=$(echo $filename | awk -F'.' '{print $1}')
  newfilename="nrc_${T0_str}_${fileheader}.tcx"
  if [[ "$filename" == *"nrc_"* ]]; then
    echo "Already renamed this file." 
  else   
    echo "Renaming ${filename}" 
    mv $filename $newfilename
  fi
done
```

Strava has an [import feature](https://www.strava.com/upload/select) which accepts TCX files, so I figured I would be set from here. However, after uploading those file, I noticed major discrepancies. Some runs were recorded as being about 3 seconds long, or with a total distance of 30 meters. I know I started small but I did run a *little* more than that! Strava does have a “Correct Distance” option in each imported activity, and it helped, but was still off, like a 6.5 Km run that came up as 5.9 Km, presumably because it doesn’t take elevation into account — not a huge difference, but with 151 runs, the drift would be noticeable. Maybe it’s more accurate than NRC, since it’s based on each GPS point, but I’d rather keep it consistent with the Nike tracking.

Also, Strava has rate limiting: 30 files per 24 hours (I think), so after uploading two batches of 15 files (the max per upload), I was stuck. You’re only told an error occurred and to please try later, nothing about the cooldown period — I found that number on reddit. But… the API allows you to upload TCX files directly. Back in the game! Well, kind of: Friday night the API server was down, so it had officially become a weekend project.

After creating a new “app” in the [unlisted API section](https://www.strava.com/settings/api) of my Strava settings, and providing the callback domain matching my local Eleventy development environment (localhost with the hardcoded port, `2024` in my case), I started creating a local app to do all of the communicating with the API to get/refresh auth codes and tokens, read my data, and eventually upload my data, as well. It needs to behave like a website to do these initial callbacks, so you can allow your app to call Strava data on your behalf. You could likely do all this in Postman but it was fun to create a simple app anyways. HTML! CSS! And JavaScript of course.

Uploading a TCX file via the API yielded the same result (shocker), so I tried finding other posts of people affected by these inconsistencies, but the only real fix I read about was to use a GPX file. I tried exporting a “good” run’s GPX file from Strava but it wasn’t very similar to TCX, so my idea of using a good run as a template to convert the bad ones fell apart. Plus, I didn’t want to convert all the files. While The GPS data in those files is supposedly good, I didn’t want to spend a lot of time trying to fix something when I couldn’t even tell where the issue was.

I saw in the API documentation there was a way to insert an activity as a plain object: date, distance, time… no GPS data, but at this point, I didn’t care. It’s kind of fun to have, yes, but not essential: accurate activity logs are more important than showing the same three paths I take most of the time. So I’d need a list of all the activities to log, exported as JSON, without any other data.

I ended up creating a simple Node script that parses the XML files via [fast-xml-parser](https://www.npmjs.com/package/fast-xml-parser) (120 MB of data took a couple seconds, it is true to its name!), collects basic data for each file as an object, and spits out an array as a JSON file. I wanted to load the file into my app buy it’s all local, and it’s a one-time import operation, so I just copy-pasted the contents into the app as a variable, who cares? Work smarter, not harder!

So the next part is to import each activity: it’s a single one per API call, so I looped over the array, and imported the data, with a few tweaks to make sure it was saved as a run. Once one file was done (using `await`), I moved on to the next. I didn’t want to run into rate-limiting issues, and 151 files is relatively fast to go through.

I then refreshed my Strava activity page, and sure enough: a bunch of new activities appeared! All the distances seemed correct, so I am pretty happy with this. It’s historical, basic data, but it is more than enough to track my stats for running.

Okay, then only one thing remains: query the data to use on my stats page. Strava offers an aggregated stats endpoint, and a list of activities endpoint. I am using both, so I call the stats, then loop over paginated data for activities. Though I only have 185 runs, and Strava limits this to 200 activities per page, I made sure to have the loop for future-proofing this little app. I extract only the date, distance and duration for each activity. No point in making this more bloated than needed (he says, over a thousand words into a post about running data).

I can now copy the contents of the stats and all activities, merged into a single object, which I paste into `strava.js` in my Eleventy `_data` folder (prefixing with `export default`). I could likely use a Node package to handle Strava tokens and pull everything automatically in every build, but that means one more third-party API to call during a build, and one more point of failure for said build if the API goes down for any reason. This will do for the time being. It’s still a little manual, but a lot less than copying data by hand from NRC.

And with that: my stats page now contains some basic [running stats](/stats/#running). All in a weekend’s work!

A couple drawbacks that I’ve noticed is that my total running distance is off by about 4 Kilometers, (which is about a quarter of a percent over the total, I’m sure you’ll agree that’s negligible), and the aforementioned lack of GPS data, but I honestly don’t care about earlier data all that much. Beyond that, all the numbers match up between NRC and Strava. Neat!

That’s it for the long explanation, the code and basic steps are provided below. Let me know if I messed something up or if you have questions!

## tl;dr

[Ask Nike for your data](https://www.nike.com/help/privacy).

Rename the TCX files to contain the activity date by running this script in the folder with all TCX files (optional).

```bash
# goal: append filenames with time
for filename in *.tcx; do
  T0=$(sed '7q;d' ${filename} | awk -F'"' '{print $2}' | awk -F 'T' '{print $1}')
  T0_str=$(date -j -f '%Y-%m-%d' "$T0" +'%Y%m%d') 
  fileheader=$(echo $filename | awk -F'.' '{print $1}')
  newfilename="nrc_${T0_str}_${fileheader}.tcx"
  if [[ "$filename" == *"nrc_"* ]]; then
    echo "Already renamed this file." 
  else   
    echo "Renaming ${filename}" 
    mv $filename $newfilename
  fi
done
```

Create a new npm project in the folder containing all your TCX files, install `fast-xml-parser`, create an `index.js` file, and open it:

```
npm init -y && npm i fast-xml-parser && touch index.js && open index.js
```

{{ callout }}If you copy all this verbatim, you’ll likely need to add `"type": "module"` in your `package.json` file.{{ /callout }}

Run a script to parse all the TCX files and save all the data as JSON:

{{ expander 'xml-to-json.js' }}
[xml-to-json.js]
```js
import { XMLParser } from 'fast-xml-parser';
import fs from 'node:fs';
import path from 'node:path';

const inputDir = './';
const outputDir = './json/';
const collected = []; // An array of every activity

try {
	const files = await fs.promises.readdir(inputDir); // Finds all files in the folder

	for await (const file of files) {
		const inputPath = path.join(inputDir, file);
		const stat = await fs.promises.stat(inputPath); // Get some file into

		if (!stat.isFile() || !file.endsWith('.tcx')) {
			continue; // Skip anything that isn't a TCX file
		}

		const XMLdata = await new Promise((res, rej) =>
			fs.readFile(inputPath, 'utf8', (err, data) => {
			  // Yes I'm sure node:fs/promises has a this as a promise, whatever
				if (err) {
					rej(err);
				}
				res(data);
			})
		);

		// Parse the XML and remove outer wrappers on the data we want
		const parser = new XMLParser();
		let jObj = parser.parse(XMLdata);
		jObj = jObj.TrainingCenterDatabase;
		jObj = jObj.Activities;
		jObj = jObj.Activity;
		const date = jObj.Id; // Grab the date before lifting the hierarchy
		jObj = jObj.Lap;

		// Create an object matching Strava's accepted payload
		const stravaData = {
			name: 'Imported Run - TCX', // You could use a dynamic name, but me? Lazy.
			type: 'Run',
			sport_type: 'Run',
			start_date_local: date,
			elapsed_time: jObj.TotalTimeSeconds,
			description: 'Legacy NRC Import',
			distance: jObj.DistanceMeters,
			trainer: 0,
			commute: 0,
		};

		collected.push(stravaData);
	}

	// Save the JSON file in the provided folder
	const outputPath = path.join(outputDir, 'strava.json');
	const content = JSON.stringify(collected);
	await fs.writeFile(outputPath, content, (err) => {
		if (err) {
			console.error(err);
		} else {
			console.log('Saved', toPath);
		}
	});
} catch (err) {
	console.error('Uh-oh. Bad times.', err);
}
```
{{ /expander }}

Create a new Strava “app” on [the API page](https://www.strava.com/settings/api) and keep an eye on those ID and secret values.

Create or update `.env` to include `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET`, which you just kept an eye on (you _did_ do that… right?).

[.env]
```
STRAVA_CLIENT_ID=######
STRAVA_CLIENT_SECRET=########################################
```

Create a small “app” to log into Strava via API and import files, which injects the secrets above into the page’s data cascade via `eleventyComputed`. I am providing HTML (in Nunjucks flavour but it should work exactly the same with Liquid or Vento), CSS, and JavaScript separately as the latter is over 300 lines.

{{ expander 'strava-app.njk' }}
[strava-app.njk]
```njk
{{ echo }}
---js
{
	permalink: '/strava/',
	layout: false,
	tags: [],
	eleventyComputed: {
		stravaEnv: function () {
			return {
				id: process.env.STRAVA_CLIENT_ID || null,
				secret: process.env.STRAVA_CLIENT_SECRET || null
			};
		}
	}
}
---

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Strava Retriever</title>
		<link rel="stylesheet" href="./strava-app.css">
	</head>
	<body>
		<h1>Strava Mini-App</h1>
		<select id="scope" hidden>
			<option value="write" selected>write</option>
			<option vale="read_all">read_all</option>
		</select>
		<a href="" class="button" id="auth" hidden>Authorize Strava</a>

		<button type="button" class="button" id="clear">Clear local storage</button>
		<button type="button" class="button" id="stats" hidden>Get stats</button>
		<button type="button" class="button" id="copy" hidden>Copy relevant stats</button>

		<form id="importer" method="POST" enctype="multipart/form-data" action="https://www.strava.com/api/v3/activities" onsubmit="return false" hidden>
			<button type="submit" class="button" id="import">Import Hardcoded Activities List</button>
		</form>

		<form id="uploader" method="POST" enctype="multipart/form-data" action="https://www.strava.com/api/v3/uploads" onsubmit="return false" hidden>
			<input class="button" type="file" name="file" id="file" />
			<button type="submit" class="button" id="upload">Upload</button>
		</form>

		<pre id="log"></pre>

		<script>
			// Note the first two values below are injected from our eleventyComputed value
			const client_id = Number({{ stravaEnv.id }});
			const client_secret = `{{ stravaEnv.secret }}`;
		</script>
		<script src="./strava-app.js"></script>
	</body>
</html>
{{ /echo }}
```
{{ /expander }}

{{ expander 'strava-app.css' }}
[strava-app.css]
```css
* {
	box-sizing: border-box;
	margin: 0;
}

html {
	block-size: 100%;
	
	color-scheme: light dark;
	font-family: system-ui, sans-serif;
}

body {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	align-items: flex-start;
	margin: 0;
	padding: 1rem;
}

.button:where(:not([type='file'])),
.button:where(input[type='file'])::file-selector-button {
	padding: 0.125em 0.5em;

	font-size: 1rem;
	font-weight: bold;
	text-decoration: none;
	border: 1px solid currentColor;
	border-radius: 0.25em;
	color: white;
	background-color: #fc5200;
}
.button:where(:not([type='file'])):is(:hover, :focus),
.button:where(input[type='file']):is(:hover, :focus)::file-selector-button {
	background-color: #e34a00;
	text-decoration: underline;
}

[hidden] {
	display: none !important;
}

h1,
pre {
	inline-size: 100%;
	flex: 0 0 auto;
}
```
{{ /expander }}

{{ expander 'strava-app.js' }}
[strava-app.js]
```js
const STRAVA_CODE_STORE = `strava_code`;
const STRAVA_TOKEN_STORE = `strava_token`;
const STRAVA_ATHLETE_STORE = `strava_athlete`;
const logEl = document.getElementById('log');
let stats;

// If redirected from the login page
const response = new URLSearchParams(window.location.search);
let code = response.get('code') || null;
if (code && !sessionStorage.getItem(STRAVA_CODE_STORE)) {
	sessionStorage.setItem(STRAVA_CODE_STORE, code);
} else if (!code && sessionStorage.getItem(STRAVA_CODE_STORE)) {
	code = sessionStorage.getItem(STRAVA_CODE_STORE);
}

// If already logged in
let tokens = JSON.parse(sessionStorage.getItem(STRAVA_TOKEN_STORE) || null);
let athlete = JSON.parse(sessionStorage.getItem(STRAVA_ATHLETE_STORE) || null);

function buildAccessUrl(scope = 'read_all') {
	if (scope !== 'write') {
		scope = 'read_all'; // All that's needed, at least for me
	}
	const params = new URLSearchParams({
		client_id,
		redirect_uri: 'http://localhost:2024/strava/', // Remember to update this to match your port
		response_type: 'code',
		approval_prompt: 'auto',
		scope: `activity:${scope}`,
	});
	return new URL(`https://www.strava.com/oauth/authorize?${params.toString()}`);
}

async function getToken(type) {
	const params = {
		client_id: client_id,
		client_secret: client_secret,
	};

	if (type === 'refresh' && tokens && tokens.refresh_token) {
		params.grant_type = 'refresh_token';
		params.refresh_token = tokens.refresh_token;
	} else if (type === 'authorize' && code) {
		params.grant_type = 'authorization_code';
		params.code = code;
	} else {
		logEl.innerHTML += '! Unable to get a token: missing refresh token or auth code.\n';
		return null;
	}

	return fetch(`https://www.strava.com/oauth/token?${new URLSearchParams(params).toString()}`, {
		method: 'POST',
		mode: 'cors',
	})
		.then((res) => {
			return res.ok ? res.json() : new Error('Failed to fetch.');
		})
		.then((res) => {
			if (Error.isError(res) === false) {
				tokens = { token_type: res.token_type, expires_at: res.expires_at * 1000, access_token: res.access_token, refresh_token: res.refresh_token };
				athlete = res.athlete;
				document.getElementById('stats').hidden = false;
				document.getElementById('uploader').hidden = false;
				document.getElementById('importer').hidden = false;

				sessionStorage.setItem(STRAVA_TOKEN_STORE, JSON.stringify(tokens));
				sessionStorage.setItem(STRAVA_ATHLETE_STORE, JSON.stringify(res.athlete));

				logEl.innerHTML += '> Token has been fetched.\n';

				return tokens;
			} else {
				logEl.innerHTML += '! Unable to get a token.\n';
				return null;
			}
		});
}

async function consumeToken() {
	let tokensData = (() => {
		if (!tokens) {
			return getToken('authorize');
		}

		if (tokens.expires_at < Date.now()) {
			return getToken('refresh');
		}

		return tokens;
	})();

	return `${tokensData.token_type} ${tokensData.access_token}`;
}

async function refreshStravaData() {
	return fetch(`https://www.strava.com/api/v3/athlete`, {
		method: 'GET',
		mode: 'cors',
		headers: { Authorization: await consumeToken() },
	}).then((res) => res.json());
}

async function getActivities(expectedCount) {
	const pageSize = 200;
	const pageCount = Math.ceil(expectedCount / pageSize);
	let activities = [];
	let currPage = 1;
	let resolver;
	let rejector;
	const promise = new Promise((res, rej) => {
		resolver = res; // Or use new Promise.withResolvers(), I won't stop you
		rejector = rej;
	});

	while (currPage <= pageCount) {
		await fetch(`https://www.strava.com/api/v3/athlete/activities?page=${currPage}&per_page=${pageSize}`, {
			method: 'GET',
			mode: 'cors',
			headers: { Authorization: await consumeToken() },
		})
			.then((res) => res.json())
			.then((res) => {
				logEl.innerHTML += `> Activities (page ${currPage}, ${res.length} items) have been fetched.\n`;
				const simpleActivities = res.map((activity) => {
					return {
						year: new Date(activity.start_date_local).getUTCFullYear(),
						date: activity.start_date_local,
						distance: activity.distance,
						duration: activity.elapsed_time,
					};
				});
				currPage++;
				activities.push(...simpleActivities);
			})
			.catch((err) => {
				logEl.innerHTML += '! Somethind bad happened.\n';
				rejector(err);
			});
		if (currPage > pageCount) {
			resolver(activities);
		}
	}
	await promise;
	return activities;
}

async function getStats() {
	return fetch(`https://www.strava.com/api/v3/athletes/${athlete.id}/stats`, {
		method: 'GET',
		mode: 'cors',
		headers: { Authorization: await consumeToken() },
	})
		.then((res) => res.json())
		.then((res) => {
			stats = { ...res.all_run_totals };
			logEl.innerHTML += '> Stats have been fetched. Processing...\n';
			document.getElementById('copy').hidden = false;

			getActivities(res.all_run_totals.count).then((activities) => {
				Object.assign(stats, { activities });
				logEl.innerHTML += `${JSON.stringify(stats, null, 4)}\n`;
			});
		})
		.catch((err) => {
			logEl.innerHTML += '! Somethind bad happened.\n';
		});
}

async function uploadFile(formData) {
	return fetch(`https://www.strava.com/api/v3/uploads`, {
		method: 'POST',
		mode: 'cors',
		headers: { Authorization: await consumeToken() },
		body: formData,
	})
		.then((res) => {
			logEl.innerHTML += '> Activity has been uploaded.\n';
			return res.json();
		})
		.then((res) => {
			logEl.innerHTML += `${JSON.stringify(res, null, 4)}\n`;
		})
		.catch((err) => {
			logEl.innerHTML += '! Somethind bad happened.\n';
		});
}

async function importActivity(payload, activity) {
	return fetch(`https://www.strava.com/api/v3/activities`, {
		method: 'POST',
		mode: 'cors',
		headers: { Authorization: await consumeToken() },
		body: payload,
	})
		.then((res) => {
			return res.json();
		})
		.then((res) => {
			logEl.innerHTML += `> Activity from ${activity.start_date_local} has been imported (${res.id || 'NOID'}).\n`;
		})
		.catch((err) => {
			logEl.innerHTML += `! Unable to import (${activity.start_date_local}).\n`;
			throw err;
		});
}

// Paste all the activities that need to be imported "manually"
const allActivities = [
	{
		name: 'Imported Run - TCX',
		type: 'Run',
		sport_type: 'Run',
		start_date_local: 'YYYY-MM-DDThh:mm:ss.msZ',
		elapsed_time: 999,
		description: 'Legacy NRC Import',
		distance: 9999,
		trainer: 0,
		commute: 0,
	},
	// and lots more!
].map((act) => Object.assign({}, act, { name: `Run ${act.start_date_local.split('T')[0]} - NRC TCX` }));

if (!code) {
	const link = document.getElementById('auth');
	const scope = document.getElementById('scope');
	function updateUrl() {
		const scopeVal = document.getElementById('scope').value || 'read_all';
		link.href = buildAccessUrl(scopeVal);
	}
	document.getElementById('scope').addEventListener('change', function (e) {
		updateUrl();
	});
	updateUrl();
	link.hidden = false;
	scope.hidden = false;
} else {
	if (!tokens) {
		getToken('authorize');
	} else {
		document.getElementById('stats').hidden = false;
		document.getElementById('uploader').hidden = false;
		document.getElementById('importer').hidden = false;
	}
}

document.addEventListener('click', function (e) {
	if (e.target.closest('#clear')) {
		[STRAVA_CODE_STORE, STRAVA_TOKEN_STORE, STRAVA_ATHLETE_STORE].forEach((k) => sessionStorage.removeItem(k));
		window.location.href = window.location.href.split('?').shift(); // Remove any query string
	}

	if (e.target.closest('#stats')) {
		getStats();
	}

	if (e.target.closest('#copy')) {
		if (!stats) {
			alert('wtf');
		}
		const copyAction = navigator.clipboard.writeText(JSON.stringify(stats, null, 4));
		copyAction
			.then(() => {
				const prevText = e.target.innerText;
				e.target.innerText = 'Copied!';
				setTimeout(() => {
					e.target.innerText = prevText;
				}, 2000);
			})
			.catch((err) => {
				console.error(err);
				alert('wtf!');
			});
	}

	if (e.target.closest('#import')) {
		const form = document.getElementById('importer');
		(async () => {
			for (const activity of allActivities) {
				const payload = new FormData(form);
				for (let [key, value] of Object.entries(activity)) {
					payload.append(key, value);
				}
				await importActivity(payload, activity); // Import one file at a time thanks to await
			}
		})();
	}

	if (e.target.closest('#upload')) {
		const form = document.getElementById('uploader');
		const file = document.getElementById('file');
		const payload = new FormData(form);
		payload.append('file', file.files[0]);
		payload.append('name', 'Morning Run TCX');
		payload.append('description', 'Nike Running Club TCX file upload');
		payload.append('trainer', '');
		payload.append('commute', '');
		payload.append('data_type', 'tcx');
		payload.append('external_id', '');
		return uploadFile(payload).then(() => form.reset());
	}
});
```
{{ /expander }}

Run Eleventy and open `localhost:####/strava`.

Click “Authorize Strava”, selecting either `read_all` or `write` permissions (if you’re uploading or fetching multiple activities, `write` will be needed).

If you need to upload anything, copy the contents of your `strava.json` file which contains your converted TCX data, and paste it as the value for `allActivities`; save to refresh. Click “Import” and watch every file get imported.

Click Get Stats button, and watch every single piece of data appear.

You can now copy this output into `_data/strava.json` and use it however you like. (note: the “Copy relevant stats” didn’t work for me in Firefox despite being user-activated, so manually copy-pasting was needed… ah well)

This is not amazingly well-written code (`onsubmit` Chris, really?), but it is, except for the bash script from _Efficient_Soft773_, code I have written myself, and for a weekend project, it ain’t too bad. It works and does what it should. It’s probably not very accessible, but this was mainly built for myself.

Oh and because this app to fetch my stats only runs locally, I have added `app-strava` files to `.gitignore` (initially to hide my hardcoded client secret, but with `.env` that’s no problem). The callback URL will most likely not work on the production URL, though, so it’s not really needed to keep around.