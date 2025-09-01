---
title: "Conditional favicon in Eleventy using passthrough copy"
summary: 'Never mix up dev and prod again! (due to identical icons, at least)'
tags:
    - eleventy
	- quick-tip
ogBackground: "./new-tab-icons.png"
---

Let’s see if I can make this short and sweet… okay so you may be like me and jump between the local build and the live (or “production”) versions of your website. How many times have you refreshed your local version for several minutes only to finally realise the changes weren’t showing up because you were refreshing the live site? About 11 million times, you say? Yeah, same.

Having a different favicon for each environment is an idea that’s been around for decades, and it’s a good one! My initial idea of editing the various `<link>` tags in my template to point to a different file based on the environment seemed like it was adding a little complexity where it shouldn’t. This is a file issue, not a template one.

So how could we use the same path for different files? Maybe we could spin up React and inject Three.js to load a WebGL shader to adjust the colours of the file on the fly via a Kubernetes instance running on Bluurf with a Stoj token? On second though, using Eleventy’s passthrough feature to move one of two files at a specific path is probably easier.

## Builder’s ENVy

First we need to know what environment the build is running in. Using an environment variable can provide all the info we need. A reminder: never, _ever_ commit your `.env` file. So in that `.env` file, this line is all we need:

```js
BUILD_CONTEXT=DEV
```

My Netlify deploy settings contain the same variable, set to a value of `LIVE` instead of `DEV`. If you don’t exactly know how to set this in your “live” build environment, that’s okay, the code below will assume no variable means it’s the live environment (though it’s good to figure this out for future tasks!). If you don’t use a build pipeline, you can also pass environment info [via the command line](https://www.11ty.dev/docs/environment-vars/#via-the-command-line) directly.

Now in `.eleventy.js`, we can determine the environment using the following:

```js
import 'dotenv/config'; // Not sure this is still necessary in recent Node versions...?
const BUILD_CONTEXT = process?.env?.BUILD_CONTEXT || 'LIVE'; // No var? We're doing it LIVE
```

## Hue spin me right round

For this next part, it’s all up to you! I have three icons as [Evil Martians recommend in their evergreen Favicon article](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs), so I took my SVG, and changed the colours in the code directly — you might want to change shift the hue 180 degrees, or change the icon fill to red; what matters is that it looks distinct enough that you know exactly which version you’re looking at. I then made it into a PNG, and converted that PNG into an ICO file. There’s dozens upon dozens of favicon converters online — [cloudconvert](https://cloudconvert.com/png-to-ico) does the job should you need it.

For my setup, I saved each with the same name suffixed with `-DEV`: `icon-DEV.svg`, `apple-touch-icon-DEV.png`, and `favicon-DEV.ico`. With the three alternate versions available, we can move on to the Eleventy part!

## Pass on through to the other side

Previously, I would load all the files in my images folder (`_assets/img/`), as well as the root favicon (and more folders we don’t need to look at here), in the passthrough instruction:

```js
eleventyConfig.addPassthroughCopy({
	[`${rootDir}/_assets/img/`]: '/assets/img/',
	[`${rootDir}/favicon.ico`]: '/favicon.ico',
}); // FYI: rootDir maps to `src` in my configuration, it's where all my source files are
```

We need to add some condition to load up the right file and save it at the desired path. I am not particularly savvy with globs, but I did try a few variations like ``[`${rootDir}/_assets/img/{!*-DEV.*}`]: '/assets/img/'`` but that did not work. Luckily, Eleventy does offer [advanced options](https://www.11ty.dev/docs/copy/#advanced-options) via its `recursive-copy` dependency, which includes `filter`. It can take a list, a regular expression, or a function. I think functions are by far the easiest to use and understand so here’s what we can do to exclude all 4 of the images (icon and apple-touch-icon, both original and DEV versions):

```js
eleventyConfig.addPassthroughCopy(
	{ [`${rootDir}/_assets/img/`]: '/assets/img/' },
	{
		filter: function (filename) {
			const isIconFile = filename.includes('-DEV') || ['icon.svg', 'apple-touch-icon.png'].includes(filename);
			return !isIconFile;
		},
	}
);
```

Now when we run our build locally, we can see in the output folder that none of the original favicon files, nor the dev variations, are served (remember to empty your output folder if you still see them in there!). However, we get the sinking feeling that something is missing… Well, a second passthrough will make it all better:

```js
eleventyConfig.addPassthroughCopy({
	[`${rootDir}/_assets/img/icon${BUILD_CONTEXT === 'DEV' ? '-DEV' : ''}.svg`]: '/assets/img/icon.svg',
	[`${rootDir}/_assets/img/apple-touch-icon${BUILD_CONTEXT === 'DEV' ? '-DEV' : ''}.png`]: '/assets/img/apple-touch-icon.png',
	[`${rootDir}/favicon${BUILD_CONTEXT === 'DEV' ? '-DEV' : ''}.ico`]: '/favicon.ico',
});
```

And just like that, we can see our three alternative favicons in the output folder at the specified paths. Your browser might need a second to refresh the cache but you should see the change. On my “New Tab” page, I now see my very frequently visited sites, including my own, and don’t need to hover the link to figure out which is which: the pink (hashtag deepPink is the best colour) now stands out as my dev environment. Convenient!

{{ set imageUrl = "./new-tab-icons.png" |> toRoot }}
{{ image imageUrl, "Two identically labelled suggestions for my website on my New Tab page, except the favicons use different colours, making them easy to distinguish.", "Live and Dev are now disambiguated!", { ratio: 760/380 } }}

Just because that code above is a *little* unsightly, here’s a minor enhancement to conditionally add the suffix:

```js
const getEnvVersion = (filename) => `${filename}${BUILD_CONTEXT === 'DEV' ? '-DEV' : ''}`;
eleventyConfig.addPassthroughCopy({
	[`${rootDir}/_assets/img/${getEnvVersion('icon')}.svg`]: '/assets/img/icon.svg',
	[`${rootDir}/_assets/img/${getEnvVersion('apple-touch-icon')}.png`]: '/assets/img/apple-touch-icon.png',
	[`${rootDir}/${getEnvVersion('favicon')}.ico`]: '/favicon.ico',
});
```

I’m sure this could be more compact with complex globs to get a single passthrough instruction, but I like this approach as it is easy to understand. If you think this could be improved, please share, I’m all ears! (well actually, I’m just _two_ ears and some human in between, but you get the idea)