---
title: "Vento includes sent me down a caching rabbit hole of my own making"
summary: "Figuring out why assets copied to includes wouldn’t update."
tags: ['vento','eleventy']
time: '20:10:00'
templateEngineOverride: 'md'
---
I spent hours chasing down an issue in my 11ty a.k.a. Eleventy a.k.a. BuildAwesome setup, specifically during local development, which I thought was a caching issue, without knowing where: any time I would update a JS file, I’d have to stop and restart my local development server. Not the end of the world, but not great either.

[I precompile my JS and CSS files](/blog/eleventy-asset-pipeline-precompiled-assets/) from an `/_assets` folder into an `/_includes/assets` folder (which makes files available to inject into templates and layouts). To prevent the files in the includes folder from triggering another “file changed” event, I ignore these files in `_includes`. Were I not to do this, assets will change the includes folder, which signals a file change, which triggers an assets change… and so on, <em lang="la">ad aeternam</em>. Hence I ignore them with `eleventyConfig.watchIgnores.add(...)`.

Okay so, what does this have to do with caching? Well, in some places, I include some JS files into my templates (usually in a [bundle](https://www.11ty.dev/docs/plugins/bundle/)). These includes happen via [Vento](https://vento.js.org/), my templating language of choice, e.g.:

```vto
{{# Adds Hyper-Card as part of a JS bundle named `foot-gameslibrary` #}}
{{ js 'foot-gameslibrary' }}
	{{ include 'assets/js/components/hypercard.js' }}
{{ /js }}
```

This works great, and lets me add some arbitrary JS to be loaded up in the footer of a specific page via another call: `{{ getBundle 'js', 'foot-gameslibrary' }}`. Every page can have a different need, like in this example, the JS only applies to my [gaming library](/games/library/) — the homepage doesn’t need this — so there’s a bunch of bundles, which will cache. This was my first suspicion: are my bundles cached too aggressively? ([which is custom](https://github.com/chriskirknielsen/dotcom-2024/blob/c8e01a63402942309e2868e083084a1512b3d30b/.eleventy.js#L56-L77), bundles don’t cache across local `--serve` builds by default, I don’t think?)

When I edited my `/assets/js/xyz.js` file, I would see the updates in my file system at `/_includes/assets/js/xyz.js`, so I knew my changes were going through, they just weren’t being picked up when bundled…

I moved my include tag out of the bundle, and the JS injected directly onto my page was still out-of-date. Well, then it has to be an issue with includes.

I did some local edits to both the Vento plugin and Eleventy’s source files to log a bunch of stuff. This is where I spent most of my time looking for a culprit. I looked at the cache used by Vento’s plugin, which is the cache in Vento itself, as well as Eleventy’s cache. Lots of things but couldn’t find anything relevant (at first…).

I then tried to see if the same issue occurred in a Nunjucks template instead of Vento, and… nope, all good! So I knew to focus my efforts on Vento. I suppose Nunjucks doesn’t have (as much) caching for files, which is why I didn’t run into this back when my site was built with Nunjucks.

I took another look at Vento, which definitely had a cache, but I wasn’t sure how to access it to clear it manually. The Vento plugin does interface with it, but doesn’t offer an “escape hatch” to manipulate the cache, and to be fair I’m not sure it should, given the ignore I have, plus my custom asset-to-include pipeline.

I looked at how the Vento plugin cleared the cache, which was tied to the Vento engine (`env`) itself:

```js
function createVentoEngine(options) {
	const env = ventojs(options);
	// ... a bunch of code
	
	function removeCachedItems(items) {
		for (let item of items) {
			item = path.normalize(item);
			debug.cache("Delete cache entry for %s", item);
			env.cache.delete(item);
		}
	}
	
	// ... more code
}
```

I modified the source to log which files were in the cache, as well as the value of `items`. I found my JS file in the cache: great start! I also found that, indeed, `items` contained the JS file I changed. The `/_assets` file, but not the `/_includes` file… hey I might be onto something.

I found that this function to remove cached items is called via a special event in Eleventy, `beforeWatch` (only runs in `--serve` or `--watch` modes):

```js
eleventyConfig.on("eleventy.beforeWatch", engine.removeCachedItems);
```

This event accepts a callback function which is passed a list of paths for the modified files. Aha, the includes folder file is watch-ignored… that’s interesting. Another interesting thing is that this is JavaScript, and in JavaScript, objects are passed around by reference instead of some kind of clone. (what would be the difference between `function ($var)` and `function (&$var)` in PHP, I believe) That can be a _huge_ pain in the butt when you inadvertently modify an object in one code block, and find it got changed in a different code block 200 lines after. This is as close as JavaScript gets to quantum entanglement: spooky action at a distance!

But in this case? It’s extremely useful. Oh and the list of files, the array? It’s an object (it’s objects all the way down in JavaScript), which means if I modify it in my own Eleventy configuration, it should modify what’s fed into Vento’s cache removal function…

```js
const rootDir = 'src';
const includesDir = '_includes';
// ... plugins and a lot of other things
export default async function (eleventyConfig) {
	// ... a bunch of code
	
	// Ignore the target asset files copied into the includes folder …
	eleventyConfig.watchIgnores.add(`./${rootDir}/${includesDir}/assets/css/**/*`);
	eleventyConfig.watchIgnores.add(`./${rootDir}/${includesDir}/assets/js/**/*`);
	// … however those are now also ignored by Vento's cache busting mechanism
	eleventyConfig.on('eleventy.beforeWatch', function (changedFiles) {
		for (let file of changedFiles) {
			const isAsset = file.includes(`${rootDir}/_assets/`);
			const isCssOrJs = ['css', 'js'].includes(file.split('.').at(-1));
			if (isAsset && isCssOrJs) {
				changedFiles.push(file.replace(`_assets/`, `${includesDir}/assets/`));
			}
		}
	});
	
	// ... more code
}
```

[And it worked… yes it did!](https://www.youtube.com/watch?v=wwvLlEtxX3o&t=2m12s) Now when logging `removeCachedItems`'s passed items, I see both the assets version, and the includes version. I am lucky that the plugin’s event callback runs after the callback in the “main” configuration (I assume, anyways), meaning I can keep this custom event near my ignore declarations (which are after plugins), instead of adding it at the very top of the configuration.

This isn’t pretty, but it solves my problem, and that’s all I need. This issue doesn’t really occur with my CSS because all the styles are injected per-page, using PurgeCSS, which reads the CSS file directly, so there’s no “handshake” with Vento’s file cache there. I do have one CSS bundle, but it’s for my `@font-face` definitions, which change so rarely that it’s not an issue.

So… I caused this headache for myself due to how I copy files after they are compiled, and ignored the problem for over a year. I’ve finally looked into it and fixed it, yay! And I could probably rework my assets to be located in the includes folder directly, but I like the separate “source” assets folder for the CSS, which is a bunch of partials, not one big sheet (LightningCSS concatenates all the `@import` statements into a single file). And I like having the JS and CSS sources in the same parent folder… Separating them wouldn’t be as clean, you know? Maybe there’s a better fix, but for now, this is fine.