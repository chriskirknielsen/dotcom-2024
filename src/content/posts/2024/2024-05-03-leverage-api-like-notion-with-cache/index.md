---
title: 'Leveraging APIs like Notion with a nice caching system'
summary: How I implemented Notion and PSN APIs in my Eleventy build for my Now and Gaming pages
tags:
    - eleventy
    - notion
    - api
    - cache
toc: true
time: '03:00:00'
featured: true
---

I recently added a [Gaming Library page](/games/library/), which involved a bunch of API calls via Notion, as well as the PlayStation Network for that extra nerd factor. I initially only used [Notion’s API](https://developers.notion.com/docs/getting-started) for my [Now page](/now), but as I was reusing a lot of code, I ended up consolidating everything into helper functions on multiple levels, leveraging [eleventy-fetch](https://www.11ty.dev/docs/plugins/fetch/)'s `AssetCache` feature along the way (which you can use without Eleventy). Maybe you'll find some of this stuff useful, though, note that this article assumes you are at least a little familiar working with APIs and JavaScript.

## The Setup

My Notion setup is extremely manual for both Gaming Library and Now pages. I won’t go into details here but I had to create a “connection” in Notion, so I could call the API for my workspace, for which I received a secret token. And my PSN data is linked to my account, and is all automatic! (npm packages used: `@11ty/eleventy-fetch @notionhq/client psn-api`)

{% callout "Ramble" %}I really appreciate Notion’s tooling and UI but golly gee, do I hate its sluggish speed. It spits out HTML with inline styles every step of the way and is just so dang slow (web or app on a very fast computer), and it’s near impossible to add custom styles. I almost gave up editing more than once due to the hellish non-responsive interface that would sometimes make me edit a completely different row… But sure let's prioritise adding ✨AI✨ garbage. Anyway, rant over. (and their API is nice and fast, to their credit){% endcallout %}

## The Flow

1. Send a request to the API endpoint for one slice of data (I’ll refer to this as `info`) that is fast to query.
    - Notion allows querying the database itself separately from the actual data, which includes a useful `last_edited_time` property.
    - The PSN API is less granular, but returns results in descending chronological order, so we can query the latest updated game by setting `limit` to `1`, and look at the `lastUpdatedDateTime` property.
2. If there is a cache for this info, check if it’s the same value as the freshly queried info.
    1. If the date is the same, look for the data cache and return it, bypassing further steps.
    2. However, if the date is different, proceed below to get all the data.
3. Query the API for the entire `data`, and if there are paginated results, grab every page (in my case, both Notion and PSN APIs provide this information, so luckily there’s no guesswork involved).
4. Process the `data` to remove any unnecessary properties, and normalise certain values (Notion returns rich text by chunk, so I convert it to Markdown with a custom `richTextBlockToMd` function).
5. Cache both the initial `info` and processed `data` for future use.
6. Return the requested `data`. Done!

As you can see, this logic can be applied to more than just one API. Aside from the properties to check in the `info` response, and the data processing itself, it's generic. As such, I have created a helper function in my `api-cache` file that does all this — greatly reducing code duplication.

By getting that `info` first, I can avoid querying 300 items from the PSN API if the `data` didn't change, for example. I don't think I'll be hitting a rate limit any time soon, but this "sampling" method makes it quick to check if the entire data is stale or not.

## The Abstractions

Here's all my code split by file. This is fully commented but if something is unclear, let me know!

{% expander "api-cache.js" %}
{% renderTemplate "md" %}This is the high-level abstraction described above which takes in methods to query the API (`info` + `data`), process `data`, and handle caching via `eleventy-fetch`'s `AssetCache` (I don't use the `EleventyFetch` function directly because I'm not requesting a specific URL, but using a package that does the fetching behind the scenes). This should be able to work with any standard API, though if there’s no endpoint to grab `info`, it’s not super useful and you should just use `eleventy-fetch` as-is with a short-ish cache duration!{% endrenderTemplate %}

```js
import { AssetCache } from '@11ty/eleventy-fetch';

/**
 * Query an API to check for updates, and if the data is stale, query it and cache it, else, serve from the cache.
 * @param {object} settings Configuration object for the cacheable API calls.
 * @param {object} settings.label Unique name given to each this particular API in the context of the build. If already in use, it will collide with existing data and serve the wrong cache.
 * @param {boolean} [settings.skipLocalCache] Optional. Whether the cache will be skipped (this should be read from a dot-env value and passed here). Defaults to `false`.
 * @param {string[]} settings.infoDateMarkers List of possible properties from the database info query that will hold useful date information, in order of usefulness.
 * @param {() => Promise<object>} settings.getInfo The async function which queries and processes data from the API to check for cache staleness. Should return an object with at least one property date-marker.
 * @param {(dbInfo: object) => Promise<any>} settings.getData The async function which queries and processes data from the API when the cache is unusable. Receives the `getInfo` result as the sole argument.
 * @returns {any} Data retrived from the API of from the cache.
 */
export default async function (settings) {
	const apiLabel = settings.label;
	const infoApiLabel = `${apiLabel}_info`;
	const dataApiLabel = `${apiLabel}_data`;
	const skipLocalCache = settings.skipLocalCache || false;
	let infoDateMarkers = settings.infoDateMarkers;
	if (infoDateMarkers.length === 0) {
		throw new Error('The `infoDateMarkers` cannot be empty.');
	} else if (!Array.isArray(infoDateMarkers) && typeof infoDateMarkers !== 'string') {
		throw new Error('The `infoDateMarkers` must be a string or an array of strings.');
	} else if (!Array.isArray(infoDateMarkers) && typeof infoDateMarkers === 'string') {
		infoDateMarkers = [infoDateMarkers]; // We need this to be an array
	}
	const getInfo = settings.getInfo;
	const getData = settings.getData;
	const getInfoMarker = (info) => info[infoDateMarkers.find((m) => info.hasOwnProperty(m) && info[m])] || '';

	// Initialise the asset caches
	const dbInfoCache = new AssetCache(infoApiLabel);
	const dbDataCache = new AssetCache(dataApiLabel);

	// Local dev: allow complete bypass
	if (skipLocalCache) {
		console.log(apiLabel + ': Skipping data cache for local development.');
	}

	// Grab the database's latest info (not the content, just metadata about it)
	const dbInfo = await (!skipLocalCache && dbInfoCache.cachedObject ? dbInfoCache.getCachedContents('json') : getInfo());

	// Determine when the database was updated by looking for the first available property
	const dbLastEdit = getInfoMarker(dbInfo);

	// Check if there is a cache object for the value we're after
	const isCachePresent = !skipLocalCache && dbInfoCache.cachedObject && dbDataCache.cachedObject;

	// If we have cached data, check if it's not outdated
	if (isCachePresent) {
		// Get the last cached value for the database info
		const cacheLastEditInfo = (await dbInfoCache.getCachedContents('json')) || {};
		const cacheLastEdit = getInfoMarker(cacheLastEditInfo);

		// If the cached last edit matches the live last edit, return the cached database contents and stop here
		if (dbLastEdit === cacheLastEdit) {
			const dbCache = await dbDataCache.getCachedContents('json');
			console.log(apiLabel + ': Found and reused cached data.');
			return dbCache;
		}
	}

	// We don't have data we can use, call the full APIs and cache the data
	console.log(apiLabel + ': No cached data, fetching latest data.');
	const dbData = await getData(dbInfo);

	// If this did change, save the new last edit date value after we know that the database access was successful
	dbInfoCache.save(dbInfo, 'json');

	// Save the data in the cache
	dbDataCache.save(dbData, 'json');

	// And finally, return the data
	return dbData;
}
```
{% renderTemplate "md" %}I don't check the `settings` object thoroughly but you might want to. Also, the `skipLocalCache` option is there in case you never want to cache the data on your local development build. This function should be reusable with most APIs that return data — if you use it, I'd be curious to hear how it worked out for you!{% endrenderTemplate %}
{% endexpander %}

{% expander "notion-db.js" %}
{% renderTemplate "md" %}This is my helper for Notion specifically, which requires a database to query as well as properties to retrieve and potential filters to pass in. It makes use of [Notion's `client` package](https://www.npmjs.com/package/@notionhq/client) to make the API calls easy. This also handles normalising the data from Notion, as it is full of metadata, via the optional `dataPostProcess` function, which can process the result before it gets cached.{% endrenderTemplate %}

```js
import 'dotenv/config';
import apiCache from './api-cache.js';
import { Client as NotionClient } from '@notionhq/client';

/**
 * Retrieve data from a Notion database.
 * @param {object} queryConfig The configuration for the database call and data processing.
 * @param {string} queryConfig.databaseId The unique ID for the database to query.
 * @param {string} [queryConfig.label] Optional. Custom label to assign to the query, used for cache key generation and identification in logs. Defaults to the database ID.
 * @param {string[]} [queryConfig.propsToUse] Optional. List of properties to retrieve for each item in the database. Defaults to `['Title']`.
 * @param {object} [queryConfig.filter] Optional. Structured filtering to restrict which results are returned from the database. Defaults to an empty object to load all items. @see <https://developers.notion.com/reference/post-database-query-filter>
 * @param {(data: any) => any} [queryConfig.dataPostProcess] Optional. Processing function to run on the fetched data before it is cached. Defaults to unprocessed data by default.
 * @returns {object[]} List of results.
 */
export default async function (queryConfig) {
	const databaseId = queryConfig.databaseId;
	const label = queryConfig.label || databaseId;
	const propsToUse = queryConfig.propsToUse || ['Title'];
	const filter = queryConfig.filter || {};
	const dataPostProcess = queryConfig.dataPostProcess || null;

	// Set up Notion stuff
	const notionClient = new NotionClient({ auth: process.env.NOTION_BEARER_TOKEN });

	// Get the cache data, and if missing or stale, provide the complete data query logic
	const cachedData = apiCache({
		label: label,
		infoDateMarkers: ['last_edited_time', 'created_time'],
		getInfo: async () => notionClient.databases.retrieve({ database_id: databaseId }),
		getData: async function (dbInfo) {
			// Based on the database info, build a list of the IDs for the properties needed based on their name
			const databaseProps = dbInfo.properties;
			let propsById = [];
			for (let p in databaseProps) {
				if (propsToUse.includes(p)) {
					propsById.push(databaseProps[p].id);
				}
			}

			// Grab the results from the database
			let dbData = [];
			let data = { has_more: true, next_cursor: -1, results: [] };
			let queryObject = {
				database_id: databaseId,
				filter_properties: propsById,
				filter: filter,
			};

			// Loop as long as there are results
			while (data.has_more) {
				const queryCursor = data.next_cursor !== -1 ? { start_cursor: data.next_cursor } : {};
				const query = Object.assign(queryCursor, queryObject);
				data = await notionClient.databases.query(query);

				dbData = [...dbData, ...data.results];
			}

			// Only keep useful data
			const dbDataProcessed = typeof dataPostProcess === 'function' ? dataPostProcess(dbData) : dbData;

			// Return that sweet, sweet data
			return dbDataProcessed;
		},
	});

	return cachedData;
}
```

{% endexpander %}

{% expander "psn-api.js"  %}
{% renderTemplate "md" %}This is a one-off but keeping it out of my gaming library data file makes everything a little more organised. (and if the API changes in the future, it’s nice to keep the code decoupled) This uses [the `psn-api` package](https://www.npmjs.com/package/psn-api) to easily hit the appropriate endpoints; check out the [Get Started guide](https://psn-api.achievements.app/get-started)!{% endrenderTemplate %}

```js
// The PSN API is still in CommonJS while I use ES Modules, so this little hack allows to use require()
import Module from 'node:module';
const require = Module.createRequire(import.meta.url);
import 'dotenv/config';
import apiCache from './api-cache.js';
const { exchangeNpssoForCode, exchangeCodeForAccessToken, getUserTitles } = require('psn-api');

const PSN_API_MAX_PAGE_SIZE = 800; // This is a hardcoded limit to the number of titles that can be returned in a single getUserTitles call
const psnApiPageSize = Math.min(500, PSN_API_MAX_PAGE_SIZE); // Preferred page size, but not more than the max

/** Retrieve trophy data from the PlayStation Network. */
export default async function () {
	// Set up access to the PSN API
	const accessCode = await exchangeNpssoForCode(process.env.PLAYSTATION_NPSSO_TOKEN);
	const authorization = await exchangeCodeForAccessToken(accessCode);

	// Get the cache data, and if missing or stale, provide the complete data query logic
	const cachedData = apiCache({
		label: 'psn-api.js',
		infoDateMarkers: ['lastUpdatedDateTime'],
		getInfo: async () => getUserTitles({ accessToken: authorization.accessToken }, 'me', { limit: 1 }).then((t) => t.trophyTitles[0]),
		getData: async function (dbInfo) {
			let trophyTitlesResponse = []; // Initialise array to hold all the values
			let nextOffset = 0; // Start at the beginning

			// Loop through the pages of the API
			while (nextOffset !== undefined) {
				// Get the slice of data based on the current page
				let responseSlice = await getUserTitles({ accessToken: authorization.accessToken }, 'me', { limit: psnApiPageSize, offset: nextOffset });

				// Append the data from this page
				trophyTitlesResponse = trophyTitlesResponse.concat(responseSlice.trophyTitles);

				// This value will be `undefined` if there is no more data, stopping the loop as a result
				nextOffset = responseSlice.nextOffset;
			}

			// Remove hidden titles
			const trophyTitles = trophyTitlesResponse.filter((t) => !t.hiddenFlag);

			// Return that sweet, sweet data
			return trophyTitles;
		},
	});

	return cachedData;
}
```

{% renderTemplate "md" %}I was pleasantly surprised to notice the `nextOffset` property was provided, making it very easy to grab every item. What's also nice is that this API returns an icon for the game, so I was able to "decorate" the dialog box you see when clicking a game title!{% endrenderTemplate %}
{% endexpander %}

And I keep all the tokens and database IDs secret in my `.env` file. 🤫

```text
NOTION_BEARER_TOKEN=secret_SOMESECRET
NOTION_DATABASE_ID_NOW=somedatabaseid123
NOTION_DATABASE_ID_GAMES=anotherdatabaseid456
PLAYSTATION_NPSSO_TOKEN=MyVerySecretSsoToken1
```

## Now page

I’m not usually too busy so this page doesn’t change very often. It’s also pretty quick to make changes via Notion (I keep a tab pinned in my browser), by adding a new row, or archiving something that’s no longer current (like finishing a show). Using my function defined in `notion-db`, I can grab items filtered by their archived status of `false` (a checkbox type), then group them by category (music, book, game…). Since I have (formatted) blurbs with each entry, my "rich text to Markdown" conversion happens here. Once everything has been processed, I can cache the final result for next time!

## Gaming Library

My Gaming Library is an old spreadsheet that I moved into Notion last year (though you could do all of this with [Google Sheets](https://www.bobmonsour.com/posts/scratch-that-use-google-sheets-api/) or [Airtable](https://www.cassey.dev/11ty-airtable-fetch/) as well), adding a bunch of metadata that nobody cares about (but me!). I manually entered the PSN API's game IDs into my Notion entries, one by one, to make sure they were accurate (matching by title could fail due to things like apostrophes, trademark symbols, etc.). Setting this up was a real pain, but it’s now quite easy to maintain!

{% image "./notion-grid.png" | toRoot, "A few rows in a Grid in Notion with a lot of columns, such as Sort Title, Platform, Format, Number of discs…", "Quite a handful of columns!", { width: 1280, height: 192 } %}

{% callout "Free idea" %}If you’re starting from scratch, you could invert this process and use the results from the PSN API to add new data to a database via the Notion API instead.{% endcallout %}

This page collects PSN and Notion data in two steps: grab PSN titles first, then match them to Notion items. It skips some platforms like GameBoy and PC (but you best believe I played the shit out of _Pokémon Red_ and _RollerCoaster Tycoon_), filters out hidden rows and irrelevant properties, and includes data for each game within compilations, such as the _Mass Effect Trilogy_, to get a fuller picture. Then, cache and serve! (side note: I'm only including PSN stuff because I have always been in House PlayStation since the PS1 — if I had some Xbox consoles or played regularly on PC, I'd have loved to include those too)

All in all, it’s a very nerdy thing. Not many people care about this level of information, but it was a great opportunity to use some APIs. (also, I might as well have personal stuff on my personal website!) You'll note I didn't provide a full breakdown of how these abstractions are used in my `now.js` and `gameslibrary.js` data files as it's very specific to my setup and might not be useful to everybody, but [my website has a public repository](https://github.com/chriskirknielsen/dotcom-2024/), so you can go digging there (this post is long enough without two additional walls of code!).

## Notion Markdown Converter

Right, I almost forgot… another wall of code. Here's the function I wrote to convert a rich text value from Notion into a standard Markdown string. It is extremely naïve and can break very easily if your text includes any kind of Markdown character (`[(~_*)]`). If you want to build something extra robust, check out [Ryan Boone's article (Rich Text Formatting section)](https://www.falldowngoboone.com/blog/from-notion-to-eleventy-part-2-building-markdown-from-json/#rich-text-formatting).

```js
/** Converts a Notion rich text block to a Markdown string. */
function richTextBlockToMd(block) {
	const string = block.text.content;
	let wrap = [];
	if (block.annotations.bold) {
		wrap.push('**');
	}
	if (block.annotations.italic) {
		wrap.push('_');
	}
	if (block.annotations.underline) {
		wrap.push('_');
	}
	if (block.annotations.strikethrough) {
		wrap.push('~~');
	}
	if (block.annotations.code) {
		wrap.push('`');
	}
	let mdString = `${wrap.join('')}${string}${wrap.reverse().join('')}`;
	if (block.href) {
		return `[${mdString}](${block.href})`;
	}
	return mdString;
}
```

And you can use it like this once you have retrieved the property (rich text is provided as an array, so `.map()` is used to handle conversion, followed by `join('')` to make it into a string):

```js
const myText = row.properties.myText.rich_text.map((text) => richTextBlockToMd(text)).join('');
```

I almost considered writing some kind of Eleventy plugin, but this all feels pretty custom and opinionated, so I held off. In any case, I hope you found this interesting! I certainly learned a lot playing with these two APIs, and consolidating my code into reusable chunks was a great exercise.