---
title: "From Nunjucks to Vento in Eleventy: a migration guide (kinda)"
summary: "A few tips to refactor your njk into vto."
tags: [javascript, eleventy, nunjucks, vento]
toc: true
time: 04:51:23
updated: 2025-07-20
featured: true
changelog: {
	'2025-06-05': "Change plugin import demo to remove `autotrim` option as it is the default. Add link to plugin’s readme/docs.",
	'2025-06-07': "Update to reflect new `eleventy-plugin-vento` version.",
	'2025-06-15': "Add [a note](#this-is-missing-some-context) about `this.ctx` in Nunjucks.",
	'2025-07-20': "Added a note about `loopIndex` for simple array iteration.",
}
---

I already wrote a little about [refactoring a blog of mine with Vento](/blog/taking-vento-js-for-a-spin-in-eleventy) recently ([check out Helen’s post](https://helenchong.dev/blog/posts/2025-05-21-vento-in-eleventy/), too!), but it was a rather simple codebase, making it relatively easy to work with. This website (or [chriskirknielsen.com](https://chriskirknielsen.com) if you’re reading this via the RSS feed!), while not a web-behemoth, has its fair share of complexity, so I wanted to see if a full refactor was feasible. Thus, over the past few weeks, I’ve been working on a separate branch, converting Nunjucks to Vento, page by page, and template by template. There were some pain points which I’ll cover, along some solutions to help you make the switch if you fancy it. I’m sure you can to apply most of this stuff to a Liquid codebase, by the way. I believe in you!

{{ callout "Disclaimer" }}
I am by no means a Vento expert, but I’m fairly competent with JavaScript, which can be handy. If you run into issues, I’d recommend posting in the [11ty Discord](https://www.11ty.dev/blog/discord/) (I know, I know… walled gardens and all that, but right now it’s the best we got) where I would be glad to help!
{{ /callout }}

At the time of writing, I am using `@11ty/eleventy` v3.1.1, with `eleventy-plugin-vento` v4.4.2 using `ventojs` on version 1.13.2. (updated on the 7th of June)

## Step 1: install eleventy-plugin-vento

Just like we would any other plugin, we will install `eleventy-plugin-vento` to allow us to use the Vento templating language, which is included in the plugin’s dependencies. I use npm, so that’s as easy as `npm i eleventy-plugin-vento`. If you use anything else like pnpm, deno, or bun, I have to assume you’re a little bit of a nerd, too, and know how to install a package with that manager’s syntax.

Then, the plugin must be loaded into our Eleventy configuration file (likely `.eleventy.js` or `eleventy.config.js` for most of us):

[.eleventy.js]
```js
import { VentoPlugin } from 'eleventy-plugin-vento';
/* More imports ... */

export default async function (eleventyConfig) {
	/* Most of the 11ty config, including all other plugins ... */
	
	eleventyConfig.addPlugin(VentoPlugin); // autotrim is false by default
	
	return { ... };
}
```

{{ callout }}Because plugin order can affect which features are available to other plugins, it is recommended to load the Vento plugin as late as possible.{{ /callout }}

You may want to review any mentions of `njk` in you config, to see if you need to add on, or replace with, `vto`. In my case, `templateLanguages` in the `return` object is an array to which I added `vto`.

One important thing: Vento, the language, is created by Óscar Otero, while the plugin is by Noel Forte. They are both actively involved in their respective projects, and even help out across each other’s from what I’ve seen with a couple of bugs of mine, so if you find a bug, it’s very likely it will get fixed. For this refactor, the bug I found and reported on the plugin’s repo was actually a Vento issue. Noel “forwarded” the issue onto the Vento repo, and it was fixed within a day, with the plugin being updated in quick succession. So if you run into problems, don’t be discouraged!

With that out of the way, we can start refactoring!

## Step 2: find and replace

We’re going to need to replace all of the Nunjucks syntax with Vento. Because they are similar, it’s not a massive effort, but that also means it’s easy to confuse them and think "yep that’s Vento code!" when it is, in fact, still Nunjucks.

I use VS Code, which has a nice “find and replace” feature allowing you to include or exclude files, as well as using regular expressions. I’m sure your IDE of choice has that option built-in as well, so hopefully everything I say can be adjusted to your environment.

While you can rename all your `.njk` files to `.vto` all at once, I’d recommend a small batch approach: update your template or content files one at a time. If a render error occurs, it’s a lot easier to find the culprit within a single file, rather than a hundred of them. Also, if you happen to write articles *about Nunjucks*, you may want to exclude your posts folder for now from the search!

Any of the find-and-replace operations below can be applied to the entire project (but be sure to only include `.vto` files!), or can be done by opening each file one bye one and running these actions. Your call!

### Update all the opening and closing tags

The first thing to find and replace is going to be every single Nunjucks tag you are using.
{{ echo }}
**Find:** `{%`
**Replace:** `{{`
{{ /echo }}

And then, as you can expect, the closing tags:
{{ echo }}
**Find:** `%}`
**Replace:** `}}`
{{ /echo }}

If you use `autotrim: true` in the Vento plugin option (the default is `false`), you can now do an extra pass to remove all the trimming dashes: {{ echo }}`{{-` becomes `{{` and `-}}` becomes `}}`{{ /echo }}. If you do not want auto-trimming, like me, then we will handle special cases below.

We still need to adjust the `end` tags, since Vento uses a “closing slash” (e.g. `endif` becomes `/if`). However, you may have, like me, whitespace-stripping dashes, such as {{ echo }}`{%- endif %}`{{ /echo }}, and a plain find and replace on {{ echo }}`{{ end`{{ /echo }} (after our first tag replacement operations) won’t do, so we can either do the replace in sequence ({{ echo }}`{{ end` to `{{ /`, then `{{- end` to `{{- /`{{ /echo }}), or use a regular expression (yes I know: what is wrong with me?!). Whichever method you choose is definitely a must: in some cases, an incorrectly closed tag doesn’t throw an error and you’ll be left scratching your head.

**Find (RegExp):** `\{\{(-? ?)end`: this will find the partially converted end tags, optionally with a dash and optionally with a space, and capture that in group #1
**Replace:** {{ echo }}`{{$1/`{{ /echo }} : this will replace our `end` with a slash, and the optional dash and/or space before it, thanks to capture group #1 (`$1`)

Okay, now, one last replace… comments! Nunjucks has simple curly braces, whereas Vento uses two. Respectively, replace them to ensure your comments don’t show up as plain text.
**Find:** {{ echo }}`{#` and `#}`{{ /echo }}
**Replace:** {{ echo }}`{{#` and `#}}`{{ /echo }}

At this point, it’s good to take a minute to review a converted page and see if all these replacements worked as expected. Our code will likely remain be broken due to other syntax changes, but we’ll get there!

### Smooth operators

This one requires some manual verification, because we’re replacing plain English words, which may be part of the page if there’s templating logic mixed into the content (I certainly have a lot!).

VS Code lets you find and replace matches one by one with a button appearing when you hover the match in the results panel. This is where our manual verification happens. Oh! And use the case-sensitive match, and full word-only option as well, to avoid finding false-positive matches inside of words. Respectively replace these 4:

**Find:** `and` / `or` / `not` / `in`
**Replace:** `&&` / `||` / `!` / `of`

While the first three are pretty self-explanatory, the `in` keyword is used for all types of iteration in Nunjucks: in Vento, that’s a job for `of`. (`for ... of`, hehe, get it?)

### Rebuilding blocks

There is some overlap between Nunjucks and Vento’s blocks (or [tags](https://mozilla.github.io/nunjucks/templating.html#tags)), such as `set`, `for`, and `include`. The nice thing is that Vento remains async-friendly either way, so we do not need `setAsync` (which I think is not standard but provided by Eleventy?) or `asyncEach`. Replacing these is easy enough, but we _do_ need to ensure that any asynchronous value is also `await`ed, so that does require checking things… though you’ll quickly notice if your content outputs `[object Promise]`!

{{ echo }}
```vto
{{ set icon = 'arrow-right' |> await getIconSvg }}

{{ for await item of getItems() }}
	{{ item }}
{{ /for }}
```
{{ /echo }}

#### From extends to layout
With Eleventy, you can declare `layout: page.njk` in your frontmatter, and it basically will chain from your content all the way up to the top-level layout (for example, `post.njk` calls `page.njk` which calls `base.njk`). You can keep doing this with Vento, but for some cases, `extends` was a better fit, in order to pass named `block` content to the parent layout. We can still do this, but blocks aren’t their own thing in Vento. Let’s take a look at Nunjucks first:

{{ echo }}
[post.njk]
```njk
{% extends 'layout/page.njk' %}

{% block aside %}
	<p>Some content unrelated to this post.</p>
{% endblock %}

{{ content }}
```

[page.njk]
```njk
{% extends 'layout/base.njk' %}

<article>{{ content }}</article>
<aside>
{% block aside %}
	<p>I’m default aside content!</p>
{% endblock %}
</aside>
```
{{ /echo }}

To do this with Vento, we need to pass in our blocks explicitly:
{{ echo }}
[post.vto]
```vto
{{ set aside }}
	<p>Some content unrelated to this post.</p>
{{ /set }}

{{ layout 'layout/page.vto' { aside } }}
	{{ content }}
{{ /layout }}
```

[page.vto]
```vto
{{ layout 'layout/base.vto' }}
	<article>{{ content }}</article>
	<aside>
	{{ if aside }}
		{{ aside }}
	{{ else }}
		<p>I’m default aside content!</p>
	{{ /if }}
	</aside>
{{ /layout }}
```
{{ /echo }}

As you can see, our `block` capture becomes a standard `set`, which is then given to the `layout` block as additional data (we don’t need to repeat the key in the object because JavaScript is fine with that, but it’s the same as writing `{ aside: aside }`). We can pass in as many blocks as needed, but we also need to if/else every block that needs default content. A small price to pay, though you could use something like {{ echo }}`{{ aside || 'Some content' }}`{{ /echo }} if you wanted, but I would recommend reserving that for small bits of text, not a chunky block of HTML, in order to keep everything readable.

We’re also able to use {{ echo }}`{{ include 'path/to/file.vto' { someData } }}`{{ /echo }} should we need to include a file with some provided data — something I’ve wished from Nunjucks more than once!

#### From macro to function
Another big deal of a block is `macro` — this is basically a function, which can almost be replaced one-to-one, except that Vento supports asynchronous data (with the `async` keyword), unlike macros. However, we lose access to Nunjucks’s convenient `caller` feature, which allows you to run the macro "around" a block of content, so in Vento it needs to be captured, then fed into the function. You win some, you lose some… Here’s a quick refactored example:
{{ echo }}
```njk
{% macro myFigCaptionator(caption = '') %}
<figure class="media">
	{{ caller() }}
	<figcaption>{{ caption }}</figcaption>
</figure>
{% endmacro %}

{% call myFigCaptionator("Meow") %}
	<img src="cat.jpg" alt="A kitten with large and curious blue eyes" width="400" height="300">
{% endcall %}
```
{{ /echo }}

{{ echo }}
```vto
{{ function myFigCaptionator(content, caption = '') }}
<figure class="media">
	{{ content }}
	<figcaption>{{ caption }}</figcaption>
</figure>
{{ /function }}

{{ set figContent }}
	<img src="cat.jpg" alt="A kitten with large and curious blue eyes" width="400" height="300">
{{ /set }}
{{ myFigCaptionator(figContent, "Meow") }}
```
{{ /echo }}

We can export and import these functions across our templates, too! Here is an example from my own website:

{{ echo }}
[layouts/font-specimen.vto]
```vto
{{ export async function fontPreviewer(contents, previewOptions = '', defaultText = 'Type Anything', warningMessages = '') }}
	{{# Bunch of code ... #}}
{{ /export }}
```

Be sure to close your exports with `/export`! I stayed stuck on `/function` for longer than I’d like to admit…

[fonts/ottselesque/index.vto]
```vto
{{ import { fontPreviewer } from 'layouts/font-specimen.vto' }}
{{# A little further down ... #}}
{{ await fontPreviewer(previewContents, previewOptions, fontSpecimenSampleDefault) }}
```
{{ /echo }}

### Ce filtre n’est pas une pipe

Vento uses a pipe operator inspired by F# that looks like `|>`, so we’ll get that adjusted via a very simple replace. Note that I am adding spaces around the pipes as I like how that looks, but also, we don’t want to accidentally replace a Markdown code block that has something like `value || default` with `value |>|> default`!

**Find:** <code> | </code>
**Replace:** <code> |&gt; </code>

I personally like to separate my CSS classes into groups using a pipe (e.g.: `class="flex-list flex-list--center | fontSize-small"`), so this involved additional manual verification, but if you aren’t doing that, you should be able to bulk replace rather quickly.

With that, we’re starting to get closer to having something that *could* run. But filters are going to need a little more attention…

### Ternary conditions applied

While Nunjucks has a pseudo-ternary syntax, Vento implements JavaScript’s, so we will need to modify any of those.

{{ echo }}
```njk
{{ "true" if foo else "false" }}
```
… turns into:
```vto
{{ foo ? "true" : "false" }}
```
{{ /echo }}

Note that unlike Nunjucks, the ternary _requires_ an `else` path. If you absolutely want to skip it, a standard {{ echo }}`{{ if }}`{{ /echo }} block will be needed.

### They’re only chasing safety

Nunjucks escapes everything by default. If you’re building your Eleventy site, you most likely have control over a majority of the content, and by gosh and golly if it isn’t the bestest and safest code you’ve ever written!

**Find:** <code> | safe</code> (note the initial space before the pipe)
**Replace:** (empty string)

If you have third-party code you *don’t* trust, you can use the `escape` filter on that code like so: {{ echo }}`{{ someUnsafeValue |> escape }}`{{ /echo }}. Isn’t it nice not having to unescape everything?

### The meta side of things

If you happen to run a blog with articles about code, you may have posts with a block of Nunjucks code that should *not* be converted. In this case, you’ll need to use Vento’s `echo` tag instead to render your Nunjucks code blocks verbatim (since there is some overlap, it can cause issues, even for Nunjucks code in a Vento template):
{{ echo }}
**Find:** <code>{&percnt; raw &percnt;}</code> and <code>{&percnt; endraw &percnt;}</code>
**Replace:** <code>&#123;&#123; echo &#125;&#125;</code> and <code>&#123;&#123; /echo &#125;&#125;</code>
{{ /echo }}

One last thing to mention that I’ve never used in Nunjucks (and honestly didn’t know existed): `filter`. You can pipe filters to blocks in Vento so anything that may have looked like {{ echo }}`{% filter trim %}  Hello world  {% endfilter %}`{{ /echo }} you can replicate with <code>&#123;&#123; echo &#124;&gt; trim &#125;&#125;  Hello world  &#123;&#123; /echo &#125;&#125;</code>.

At this point, you might be able to run your code, and you’ll start seeing what errors are left over. This next section will try to cover what I imagine are the common issues.

## Step 3: gotchas & workarounds

Nunjucks does offer some nice syntactical sugar, and generally speaking, good features for templating, that aren’t exactly one-liners in JavaScript. We’re going to need to rework some filters as well as some iteration logic to migrate fully from Nunjucks.

### Re-implementing Nunjucks-specific filters

Nunjucks has a bunch of filters that aren’t necessarily 1:1 matches of native JavaScript functions, so we need to re-create those, and add them to our Eleventy configuration. I can’t go over [all 41 of them](https://mozilla.github.io/nunjucks/templating.html#builtin-filters), but the good news is that some *do have* 1:1 JavaScript equivalents, and that Nunjucks it is already implemented in JavaScript, so if there’s a filter we aren’t quite sure how to recreate, we can copy the code from `node_modules/nunjucks/src/filters.js` (with a few adjustments, most likely).

Below, you will find partial implementations of Nunjucks’s `sort` and `groupby` filters, which use a `getDeepProp` helper function I wrote. This will let us bulk replace any “complex” sort (i.e. any `sort` filter with additional parameters) with `sortBy`, and because I like camelCasing, `groupby` with `groupBy`. I opted to remove the sorting option as it wasn’t being kept in place, more on that later.

```js
function getDeepProp(obj, prop = null) {
	// If there is no property, return the value as-is
	if (!prop) { return obj; }

	// Create a list of properties to pluck one by one
	const propChain = prop.split('.');
	let groupVal = obj; // Start with the original value
	const chain = propChain.slice();
	while (chain.length > 0 && groupVal !== null) {
		const subProp = chain.shift().trim();
		groupVal = groupVal[subProp] ?? null;
	}
	return groupVal;
}

/** Groups array of objects by a property value (note: array in, object out). */
eleventyConfig.addFilter('groupBy', (array, prop) => {
	if (Array.isArray(array) === false) { throw new Error(`groupBy filter expects an array, was given ${typeof array}`); }
	if (!prop || typeof prop !== 'string') { throw new Error(`groupBy filter expects a property key (or dot-separated path), was given ${typeof prop}`); }
	
	const groups = {};

	for (let item of array) {
		let groupVal = getDeepProp(item, prop);

		if (groups.hasOwnProperty(groupVal) === false) {
			groups[groupVal] = [];
		}

		groups[groupVal].push(item);
	}

	return groups;
});

/** Sorts array of objects by a property value. */
eleventyConfig.addFilter('sortBy', (array, reverse = false, caseSens = false, prop = null) => {
	if (Array.isArray(array) === false) { throw new Error(`sortBy filter expects an array, was given ${typeof array}`); }
	if (prop && typeof prop !== 'string') { throw new Error(`groupBy filter expects a property key (or dot-separated path), was given ${typeof pro}`); }
	
	const sortedArray = array.slice();
	const factor = reverse ? -1 : 1;

	return sortedArray.sort((a, b) => {
		const valA = getDeepProp(a, prop);
		const valB = getDeepProp(b, prop);
		return String(valA || '').localeCompare(String(valB || ''), 'en', { sensitivity: caseSens ? 'case' : 'variant' }) * factor;
	});
});
```

For other specific stuff like `striptags`, I copied and pasted directly from the Nunjucks package: it’s about 15 lines of code, way easier than using a new dedicated package (as excellent as one of those may be), and at least I can rest assured that whatever was working before will keep working exactly the same way. And yes, I also camelCased it!

{{ callout "A word of warning", "⚠️" }}Fundamentally, Vento executes JavaScript. This means that we can use `Object.keys` as a filter, but that also means that we need to be more careful with how we name our filters in Eleventy to avoid naming collisions.{{ /callout }}

I *believe* that filters that don’t exist have a passthrough behaviour to avoid failing, meaning you don’t get an error or warning about it, but your value doesn’t get transformed (or is spat out as undefined?), so: beware!

### Iteration complications

Iteration is one of the bigger thorns I’ve run into with my refactor.

Nunjucks has a very handy `range(a, b)` helper to create specifically-indexed loops from `a` to `b`. We can easily work around this, as Vento offers a shortcut: `for i of b` where `b` is the number of iterations, but it starts the index at 1, which is not always desired. To start at 0, what we can do is:
{{ echo }}
```vto
{{ for i1 of 42 }}
	{{ set i = i1 - 1 }}
	...
{{ /for }}
```
{{ /echo }}

Another sweet Nunjucks feature is the auto-magic `loop` variable, which includes, among others, the current index (both provided as 0- and 1-indexed), the total length, and whether a loop is at the first or last iteration. Given loops can operate over arrays or objects, it’s not as convenient to figure out what the length of the loop is to determine the equivalent of `loop.last`, but we can accomplish it like so (note the {{ echo }}`{{> ... }}`{{ /echo }} syntax is to [execute pure JS code](https://vento.js.org/syntax/javascript/), which I prefer because of the `loopIndex++` within the loop itself, which is concise):
{{ echo }}
```vto
{{> let loopIndex = 0 }}
{{> let loopLength = Array.isArray(list) ? list.length : Object.keys(list).length) }}
{{ for thing of list }}
	{{> loopIndex++ }}{{# 1-based, like Nunjucks — you could put this at the end to get a loop.index0 equivalent #}}
	{{ set loopFirst = loopIndex === 1 }}
	{{ set loopLast = loopIndex === loopLength }}
	{{# Iteration logic #}}
{{ /for }}
```
{{ /echo }}

{{ callout }}You can use {{ echo }}`{{ for loopIndex, item of list }}`{{ /echo }} for Arrays (zero-indexed, mind!), but the above will still be necessary for iterating through objects as `key, value` (you can use `Object.keys` or `Object.entries` if you want to have both index and key/key-value).
{{ /callout }}

Okay… now we’re done fixing our loops, right? Well, almost. I ran into a peculiar issue I should report as a bug, but basically the sort order was seemingly reset for objects being iterated (maybe the objects are recreated instead of referenced or copied verbatim?), when that object was manipulated somewhere else (like a filter). So, instead of sorting the object directly, I opted to extract the keys into a plain array, sort those, and loop over them; the value is grabbed inside the loop instead. Less squeaky clean, but unless I’m doing something wrong, the sort order from the object appears to reset every time. The original Nunjucks loop:

{{ echo }}
```njk
{% for year, posts of postList | groupby('date.year', 'desc') %}
	{# More stuff ... #}
{% endfor %}
```
{{ /echo }}

… became:
{{ echo }}
```vto
{{ set postsByYear = postList |> groupBy('date.year') }}
{{ for year of postsByYear |> Object.keys |> sort |> reverse }}
	{{ set posts = postsByYear[year] }}
	{{# More stuff ... #}}
{{ /for }}
```
{{ /echo }}

### Data override side-effects

Now that I’m done rambling about loops, here’s a gotcha that perplexed me for a while! It seems that if you have a value passed to a template file, let’s say some global data `{ foo: false, bar: 'abc' }`, then the following block:

{{ echo }}
```vto
 {{ if foo }}{{ set bar = 'xyz' }}{{ /if }}
```
{{ /echo }}

… will reset `bar` to `undefined` if `foo` is `false`. To give you a better example, from my CTA component (button and button-looking links), I was re-assigning the `url` variable if a `path` property was passed. So if there’s a `path` value but no `url`, set `url` to `path` — easy! However, when there already was a `url` value, it turned into `undefined` after this bit of logic!

{{ echo }}
```vto
{{> console.log('before', {url, path}) }}
{{ if !url && path }}{{ set url = path }}{{ /if }}
{{> console.log('after', {url, path}) }}
```
{{ /echo }}

This logs, for a truthy `url` and falsy `path`:

```
before { url: '/designs/', path: undefined }
after { url: undefined, path: undefined }
```

Not exactly what I was after! So if you run into this, you can create a new variable (you have to, even without an `if` block) to avoid re-assigning the existing variable. For this example, that’d be a brand new `href` variable:
{{ echo }}
```vto
{{ set href = url || path || false }}
```
{{ /echo }}

If you also used `foo = foo or bar` here and there in Nunjucks… find the potential cases in your codebase with a handy named group RegExp: `\{\{ set (?<var>[a-zA-Z0-9_]+) = (\k<var>) or`. For the if-wrapped scenario, though, that all depends on the context of the file, so no RegExp can help us…

I have reported [this bug on the Vento repository](https://github.com/ventojs/vento/issues/108), and **it has been fixed as of Vento v1.13.2**, ~~but not [merged into the plugin yet](https://github.com/noelforte/eleventy-plugin-vento/pull/262). If I happen to post this article before it gets merged, and you want to use the fix, you can force it in your npm package via [a package override](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides)~~ and it has now been updated with `eleventy-plugin-vento` version 4.4.2!

### Interjected filter rejection

I haven’t looked too much into it, but you cannot inject filters mid-way into an expression in every scenario, like on a property value in a basic object. So this doesn’t work:
{{ echo }}
```vto
{{ set trophiesByLevel = {
	bronze: trophies |> pluck('bronze') |> sum,
	silver: trophies |> pluck('silver') |> sum,
	gold: trophies |> pluck('gold') |> sum,
	platinum: trophies |> pluck('platinum') |> sum
} }}
```
{{ /echo }}

That throws an error: `Invalid filter: sum`. But this works:

{{ echo }}
```vto
{{ component 'hero', {
	ext: 'vto',
	heroTags: tags |> sort((a,b) => a.localeCompare(b)),
	heroTitle: title,
	heroSup: dateInfo,
	pageContext: page
} }}
```
{{ /echo }}

Maybe it’s because one is a set operation and the other is a shortcode… either way, we need to keep track of this, which caused me to create a few extra variables to declare the value separately, but it’s not the end of the world. Plus, you can write native JS, so it’s not difficult to work around, but it can still be a little confusing so I figured it’d be good to call it out given Nunjucks will happily apply filters anywhere.

### Shortsighted shortcodes

I ran into this with my (web)component shortcodes: they just wouldn’t work. The error was `Cannot use 'in' operator to search for 'data' in undefined (via TypeError)`. It wasn’t super helpful on its own, but it sounded like `something.data` was expected, but the `something` was `undefined`. After a lot of debugging (this is where keeping a `njk` template around is helpful!), I figured it out: the function I was calling didn’t have a *context*, or rather: its `this` was `undefined`. So, I figured I should try something I usually *never* (need to) do: `.bind(this)` on the function, and… voilà. That fixed it:

```js
// Before:
const content = eleventyConfig.getShortcode('renderFile')(filePath, componentOptions, ext);

// After:
const renderer = eleventyConfig.getShortcode('renderFile').bind(this);
const content = renderer(filePath, componentOptions, ext);
```

You may need to do something similar if you have any code making use of Nunjucks’s `this.ctx`, but that all depends on your custom shortcode or filter.

### Render plugin with limited availability

One more thing related to the Render Plugin in my case: the supplied shortcodes don’t work, but it seems to be an issue with how Eleventy exposes those filters/shortcodes strictly to Liquid, Nunjucks and JavaScript data file. So neither Vento nor the 11ty plugin are to blame, and as such I reported it on the [Eleventy repository with issue 3841](https://github.com/11ty/eleventy/issues/3841). I have a workaround, though — for example, for `renderTemplate`, we can wrap a new global shortcode function around the Nunjucks-only version to get the desired behaviour:

```js
eleventyConfig.addAsyncShortcode('renderTemplateGlobal', async function (filename, ext, context = {}) {
	if (!ext) { throw new Error(`renderTemplateGlobal expected a template language (njk, vto, md, ...), but none was provided.`); }
	const renderer = eleventyConfig.nunjucks.asyncShortcodes.renderTemplate.bind(this);
	const content = renderer(filename, { ...(this.ctx || {}), ...context }, ext);
	return content;
});
```

### This is missing some context
**Update on 2025-06-15:** `this.ctx`, which is happily passed through by Nunjucks (I think Liquid does this too via `this.context`, but not other templating languages), is not available in Vento filters and shortcodes. We do have access to `this.page`, but that provides information about the raw source file (such as `inputPath`, `fileSlug`, `date`, `rawInput`, and so on), not its full context, so the Eleventy data cascade is not exposed. It’s a “magic property” from Nunjucks, so I knew it was risky and limited how much I used it, so finding an alternative wasn’t too difficult. This may be addressed in the plugin via Eleventy directly. See relevant [issue #72 in the plugin repo](https://github.com/noelforte/eleventy-plugin-vento/issues/72) and [issue #2844 in the Eleventy repo](https://github.com/11ty/eleventy/issues/2844).

## Step 4: go forth and blow us away

I hope this is helpful to get your migrated over to Vento, or to help you see that it’s not a huge leap from using Nunjucks. If you feel like any of this is confusing (incoherent rambling is kinda my thing), or if I missed some crucial point since we all use Eleventy and/or Nunjucks a little differently, please let me know — I’d be happy to expand this “guide” to cover more cases as needed.

For transparency, I’ve kept all my posts in Markdown files with Nunjucks templating for now. I only really use <code>{&percnt; raw &percnt;}</code> to prevent Nunjucks in my code blocks from being rendered, as well as my custom shortcodes {{ echo }}`{% callout %}` and `{% codepen %}`{{ /echo }}. It should be a pretty quick update with replacing `raw` with `echo`, but I ran out of weekend/steam/willpower/excuses (pick one).

Also, I quickly hacked together Vento syntax highlighting via Prism for this article, it isn’t perfect but I do hope it makes the reading experience a little better than a monochrome block of text. And I do hope you enjoyed all these “fun” section heading titles as much as I did making them!

## More reading
- [Vento’s documentation](https://vento.js.org/syntax/)
- [eleventy-plugin-vento’s documentation](https://github.com/noelforte/eleventy-plugin-vento/blob/main/readme.md)
- [Nunjucks’s documentation](https://mozilla.github.io/nunjucks/templating.html)
- [My first experience with Vento](/blog/taking-vento-js-for-a-spin-in-eleventy) 

PS: Escaping all the tags in this article was a nightmare, 0/11 do not recommend.