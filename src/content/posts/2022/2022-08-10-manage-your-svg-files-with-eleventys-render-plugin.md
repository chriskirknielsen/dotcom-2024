---
slug: manage-your-svg-files-with-eleventys-render-plugin
title: 'Manage your SVG files with Eleventy’s Render plugin'
summary: Using renderFile to keep things tidy.
date: 2022-08-10
updated: 2022-10-02
tags: [eleventy, svg]
toc: true
---

{{ callout "Update", "🚨" }}[Wait! I have a new method below.](#updated-method){{ /callout }}

Recently, I’ve been working on a new version of my site, still using Eleventy, and wanted to explore new ways to make things easier to maintain. One area that’s been a bit of a pain point for me was injecting SVGs into my templates (inline all the things!) with data. This is especially relevant if the SVG has a `<title>` element I want to localise in a different language based on the context, or change its `class` attribute based on where it’s injected. Let me tell you how my file got flipped-turned upside down!

## My previous approach

In earlier versions of Eleventy, I would typically do something like this:

```njk{{ echo }}
{% set svgRssIconData = { class: 'icon', title: 'RSS' } %}
{% include 'assets/svg/rss.svg.njk' %}
{{ /echo }}```

And within the `rss.svg.njk` file, I’d look for that `svgRssIconData` variable to add the class and title.

This works fine, but there are some improvements that can be made:

1. I’d like not to have to write a unique variable name in both the template and the SVG file
2. I’d like to have scoped data passed to the SVG file
3. I’d like the include path to be automatically calculated based on the file name

## My new and improved approach

With [Eleventy’s render plugin in v1.0.0](https://www.11ty.dev/docs/plugins/render/), this all becomes quite possible with the `renderFile` shortcode! After importing the plugin info my configuration file, this is how it looks:

```njk{{ echo }}
{% renderFile './src/_includes/assets/svg/rss.svg.njk', { class: 'icon', title: 'RSS' } %}
{{ /echo }}```

As you can see, it’s all on a single line, which scientifically means It’s Totally Better™, and the data that’s passed down is scoped — no more variables polluting the template! This crosses off the two first items on my list. What about the path?

Being a developer, I will look for solutions that allow me to be lazy and write as little as possible. I couldn’t just apply a custom filter to a string and be done, could I? That’d be too easy…

If you weren’t aware, Eleventy makes things so easy, it’s amazing. So, of course I can! Here’s a basic filter to make a full path out of the filename:

```js
eleventyConfig.addFilter('svgUrl', (filename) => `./src/_includes/assets/svg/${filename}.svg.njk`);
```

And with the example above, I can now only use the filename and let the filter expand that into the full path, which the `renderFile` shortcode can use:

```njk{{ echo }}
{% renderFile 'rss' | svgUrl, { class: 'icon', title: 'RSS' } %}
{{ /echo }}```

That looks pretty concise and easy to remember in my book! I do wish I could wrap the string and filter in parentheses (like `('rss' | svgUrl)`) to compartmentalise each bit of code but sadly it doesn’t like that — if you know why please let me know!

## Adding options

Just to push this a little bit further, I have some SVG files that do not require any custom data and as such, are saved as plain `.svg` files in the same folder as the “dynamic” ones. I added an optional parameter on the filter to take this into account:

```js
eleventyConfig.addFilter('svgUrl', (filename, isNjk = true) => `./src/_includes/assets/svg/${filename}.svg${isNjk ? '.njk' : ''}`);
```

Since `isNjk` defaults to `true` here, I can ignore it in most cases, and set `false` in the few cases I need it:

```njk{{ echo }}
{% renderFile 'grid' | svgUrl(false) %}
{{ /echo }}```

What’s this `Unknown engine for ./src/_includes/assets/svg/grid.svg`? A render error? Well, the solution is to tell it to render as plain HTML using the shortcode’s third parameter to override the target file’s template engine — meaning the second argument must also be passed (`null` will do!):

```njk{{ echo }}
{% renderFile 'grid' | svgUrl(false), null, 'html' %}
{{ /echo }}```

I’m sure you could tell Eleventy to use the plain HTML engine instead in the configuration file but since this is a very rare case for me, I don’t mind handling the three parameters once in a while.

<del>I suppose there would be a way to pull in the plugin’s code and make a custom shortcode that wraps around this one to automate the path name and avoid adding the filter, but as you read before, I’m a bit lazy…</del> <ins>See the update below!</ins>

I hope this is helpful to more than just myself! I’m fairly certain there are dozens of ways to inject SVGs into templates in Eleventy. I just happen to like this one the best (for now).

<hr>

## Updated method

Turns out you can access the compiler within the Eleventy config file thanks to `eleventyConfig.nunjucksAsyncShortcodes.renderFile`. I now have a shorter (asynchronous!) shortcode that takes a filename and optional parameters. The `isNjk` parameter is folded into the SVG options to declutter things, so it’s even easier to write!

```js
eleventyConfig.addAsyncShortcode('svg', async function (filename, svgOptions = {}) {
	const isNjk = svgOptions.hasOwnProperty('isNjk') ? svgOptions.isNjk : true;
	const filePath = `./src/_includes/assets/svg/${filename}.svg${isNjk ? '.njk' : ''}`;
	const engine = svgOptions.hasOwnProperty('engine') ? svgOptions.engine : (isNjk ? 'njk' : 'html'); // HTML engine for vanilla SVG if none is provided
	const content = eleventyConfig.nunjucksAsyncShortcodes.renderFile(filePath, svgOptions, engine);
	return content;
});
```

And to call a file, you’d write the following:

```njk{{ echo }}
{% svg "rss", { class: "icon", title: "RSS" } %}
{{ /echo }}```

… or, for a regular SVG file, with the `isNjk` property set to `false`:

```njk{{ echo }}
{% svg "grid", { isNjk: false } %}
{{ /echo }}```

No filter required for the path, all a bit cleaner and simpler. Neat!