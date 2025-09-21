---
title: '2024 redesign'
summary: Some notes about this 2024 redesign.
tags:
    - eleventy
    - meta
toc: true
time: '16:04:24'
---

It seems I’ve been doing a site refresh every even year, and started getting the itch for it in late 2023. A few months have passed, and here we are! I changed up ~~my CSS Zen Garden~~ *the themes* a little bit (even purchased some typefaces! I spent *money*!) and upgraded to Eleventy v3 (canary). If you’ve been here before, it will be feel pretty familiar (plus some new looks), as the content is globally the same, and I didn’t refactor anything that already worked well. This is especially true as [my website is a worry stone](https://ethanmarcotte.com/wrote/let-a-website-be-a-worry-stone/), so I’m always making changes between “versions” anyways. With that, I’d like to go over some of those updates, in case they should be useful for other people.

## Eleventy stuff
### Eleventy v3 canary

The third version of Eleventy fully supports ESM ([EcmaScript Modules](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)). That’s cool! And also, what the heck is ESM? I didn’t know, but now I do! It’s a different syntax if you’re used to the CJS (CommonJS, a.k.a. how it was before) `const thingimabob = require('thingimabob')` in your NodeJS scripts, which is now `import thingimabob from 'thingimabob'` — you just need to remember to change your Node `package.json` file accordingly.

A downside is that these modules can no longer be directly added inline. I love the [plugin architecture shared by Lene Saile](https://www.lenesaile.com/en/blog/organizing-the-eleventy-config-file/), in which you directly add your plugins via a require like so: `eleventyConfig.addPlugin(require('thingamabob'))`. Instead, I now have a list of imports at the start of my config and add in the plugins later. You *can* make it inline-able again, mind you, but it felt like retrofitting CJS practices into ESM — eh, it’s not a cardinal sin but I’m fine without this. For vanity’s sake, here’s how I would do it, though:

```js
const importInline = async (path, name = 'default') => (await import(path))[name];

// Then inside the config, used like so:
eleventyConfig.addPlugin(await importInline('./config/filters/strings.js'), { ...options });

// Or, a chaotic neutral version would be…
eleventyConfig.importPlugin = async function (path, options = {}, name = 'default') {
	return eleventyConfig.addPlugin((await import(path))[name], options);
} // …and then…
eleventyConfig.importPlugin('./config/filters/strings.js', { ...options });
```

Overall, the upgrade was very easy: after converting a bunch of `module.exports = ...` to `export default ...` (and searching the web for a few ESM syntax pointers 👀), all was well. I continue to be impressed by the capability, simplicity, and flexibility offered by Eleventy, so I recently put my money where my… uh… heart was?… and became a recurring contributor instead of a couple one-off (two-offs?) donations on [OpenCollective](https://opencollective.com/11ty). You should too, if you have the means, and if you love using Eleventy. Yay, open source!

### Eleventy bundle plugin

I inline the crap out of my styles and scripts, minified and “tree-shaken” (though not programmatically so I’m misusing that term), so for this update I decided to look into the [Eleventy bundle plugin](https://github.com/11ty/eleventy-plugin-bundle/), which allows me to define a “bucket” for CSS or JS, and define where the contents of those buckets should go. It feels a little cleaner to work this way, compared to my previous approach of capturing a file into a variable, passing it into a minifier, and dumping it right then and there in a style/script tag.

With the bundle plugin, I can collect all my scripts into the appropriate bucket, and inject it somewhere else that makes more sense. For instance, instead of injecting a web component script right below the custom element, I can bucket it, and have it all live at the bottom, right before `</body>`. My site is likely not very impacted by the change in terms of performance, but every bit helps.

Another cool thing about the plugin is that you can run a custom transformer on your buckets. In my case, I can minify everything at once instead of piece by piece. This means I can cache the minified result and distribute it across all pages instead of minifiying once for every page.

If you do not cache your minification, this next part is irrelevant, but if you do, there’s a gotcha! If your homepage requires, say `global.js` and your blog page requires `global.js` *and* `blog.js`, then you cannot include them both in the same bucket. Because I cache the results as a compound key based on the bucket type and name (e.g. `js_foot`), whichever page is processed first would cache the result for what that page calls, and you’d either see the `blog.js` code on the homepage, or not see it on the blog page. The solution is pretty simple: multiple buckets! I still drop them all in the same place and it works just fine. A little less elegant, I will grant you, but the benefits are worth it:

```html{{ echo }}
<script>
	{% getBundle "js", "foot" %}
	{% getBundle "js", "foot-codewrap" %}
	{% getBundle "js", "foot-about" %}
</script>
{{ /echo }}```

## Themes

I break down each theme in detail over on the [Colophon](/colophon/) page, but I initially wanted to just have two themes: light mode and dark mode. However, Figma being a good tool to iterate, I ended up adding one more, then two… then landed back to the six I previously had… and then two more! My final CSS file is of course a little massive, clocking in at `77 Kb`, but running PurgeCSS takes that number down significantly, around `45 Kb` depending on the page.

A blank page clocks in at a grand total of `79 Kb`, which is still a lot for my little personal site, but given the importance of themes and they add around `2.7 Kb` of inlined JavaScript, I feel like it’s a good compromise, especially since the site works fine without. (though I am planning to see how I can lower that number… feels like a _lot_ just for a theme picker!)

Oh! Another thing that was missing was the option to revert to the system theme — that oversight has been corrected!

### Color Token Contrast Checker

I set up the foundation for each design in Figma using variables. Super handy to prototype with, but I didn’t set up a plugin to check contrasts, as I might tweak values in my JSON file, so instead, when I process those tokens, each theme, which has a strictly defined list of either “foreground” or “background” colours, is checked for contrast. Using the excellent [Color.js](https://colorjs.io/) library at built-time, I can check that all the colour tokens have a contrast ratio of at least `4.5`.

If a pair fails, I emit a warning in the console, specifying the associated theme, and build a link to [oddcontrast.com](http://oddcontrast.com) (also excellent, also uses Color.js!) pre-populated with my colours, so that I can quickly make a couple changes and get back on the 4.5+ track, update my tokens file, and look at my updated theme to verify it doesn’t look too crappy. That’s a very tight iteration loop for me that I can appreciate. I know this won’t catch 100% of the contrast issues, but it certainly reduces them!

```txt
[11ty] Warning: "dusk" theme colors have low contrast: canvas vs text = 1.11 — fix this at https://www.oddcontrast.com/#hsl__hsl(264_45.45~_12.94~)__hsl(240_100~_25.1~)
```

## Dropping Sass

I’ve been using Sass (well, SCSS) for over a decade now, and I still think it’s got its uses. But for this refresh, I decided to see if I could live without it, and I can! It’s requires a little more finesse when it comes to my tokens, but I don’t miss it too much. Using LightningCSS, I can compile all the `@import` instructions to a single flat CSS file, and also make use of nesting without worrying about support: once enough browsers support it, I can turn off a flag and that’ll be it. No CSS changes. I’m also making good use of the custom media transformation. This makes media queries more succinct and easy to remember:

```css
/* My custom media query that will be transformed: */
@custom-media --prefers-dark (prefers-color-scheme: dark);

/* My original code here: */
@media (--prefers-dark) {
	html { accent-color: deeppink; }
}
/* then becomes: */
@media (prefers-color-scheme: dark) {
	html { accent-color: deeppink; }
}
```

The most useful one is what I set up as the desktop breakpoint. That value is accessible in my tokens file (set to `960px`), and when processing the tokens, I can create a bit of extra code at the top of the output to inject that dynamic token value into the media query (since they don’t accept custom properties yet):

```css
@custom-media --breakpoint-desktop (min-width: 960px);
```

Which means my actual files don’t have a hardcoded width I need to edit in several spots: I just edit one token and… voilà, it cascades into my cascading stylesheet!

It still feels a little dirty to generate a handful of CSS with JavaScript but since it’s happening at build-time, I have no remorse.

## No longer multilingual

For this version, I’ve removed the localised French and Danish parts of my site. As fun as it was to handle internationalisation (I really liked my previous approach!), it did add a substantial amount of work when a new page needed to go up that probably two people would read (one of them being myself). I decided to go full English for this one — *désolé* and *undskyld*, you can still reach out to me in those languages though! I added some redirects to be safe, and for the two French posts I made, those are available on the blog with a `(fr)` tag. Also, inserting raw text is easier than managing three languages in separate files…

## Minor highlights

### Calculating hero heading scales

My global Hero component can accept any title, and is used everywhere except the homepage, meaning titles can be vastly different. To ensure I don’t hardcode it to a specific size, my component runs the title through a filter which returns a scale, passed on to CSS. If a title has only a couple words, the scale remains at `1`, but if it’s basically a sentence, that number is lowered so the hero component doesn't take up the entire page.

The logic is rather simple as it takes in the number of letters and words, maps them both on separate min/max scales, then averages the results and returns a number between `0.75` (long titles) and `1` (short titles). It’s running both because you can have a lot of short words, or very few long words — with this average, it’s kind of safe either way. It’s not scientific but it works! Here’s the code if you’re curious (or if you have a better algorithm to suggest):

```js
const remapNum = (number, inMin, inMax, outMin, outMax) => ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
const clampNum = (min, number, max) => Math.min(max, Math.max(min, number));
eleventyConfig.addFilter('sizeFactor', function (string) {
	string = string || '';
	const minWords = 5;
	const maxWords = 10;
	const minLetters = 24;
	const maxLetters = 64;
	const invertedMinRatio = 0.75;
	const invertedMaxRatio = 1;
	const words = string.split(' ');
	const wordCount = words.length;
	const letterCount = words.join('').length; // Remove spaces
	const letterScale = clampNum(invertedMinRatio, remapNum(letterCount, minLetters, maxLetters, invertedMaxRatio, invertedMinRatio), invertedMaxRatio);
	const wordScale = clampNum(invertedMinRatio, remapNum(wordCount, minWords, maxWords, invertedMaxRatio, invertedMinRatio), invertedMaxRatio);
	return ((wordScale + letterScale) * 1e2 / 2) / 1e2; // Get the average between word count scale and letter count scale, rounded to 2 decimal places
});
```

### Code-Wrap updates

I wanted to wrap my code blocks in a custom element instead of some hardcoded mess, so this made me update my plugin to allow this. That way I could use some JS to add the button and all the event handling instead of some weird half-baked stuff that is modified during a post-build Eleventy transform (which works, but is expensive to run on every page!). I can then be a little smart about it and in my main template, add this bit of code to detect a code-wrap closing tag, and if so, I inject the code for the custom element:

```njk{{ echo }}
{% if ("</code-wrap>" in content) %}
	{% js 'foot-codewrap' %}{%- include "assets/js/components/code-wrap.js" -%}{% endjs %}
{% endif %}
{{ /echo }}```

### Smarter SVGs

I went all in for this version to use the [Cheerio library](https://cheerio.js.org/). This allows me to write standard SVG files instead of NJK with conditionally injected attributes. It’s a lot cleaner, and doesn't require any code edits after I’m done optimising the SVG. I can provide all the attributes I need to the bespoke `svg` shortcode I made (see [my article about SVGs in Eleventy](/blog/manage-your-svg-files-with-eleventys-render-plugin/), though note that Cheerio wasn’t used at that time) and not worry about the right format and whatnot.

It is more costly to run Cheerio instead of inlining NJK instructions, but I don’t use a lot of SVGs, and also, if the options are identical, I cache the processed result so that if two different pages use the same SVG, it only gets run once, saving a little bit of time.

## Some CSS issues

I ran into more than a few issues in CSS relating to different behaviour across browsers. Chrome came out on top of this one with no major issues to report, but I did elect to use an inherited grid instead of subgrid, as [support is still pretty fresh](https://caniuse.com/?search=subgrid), so I’ll give it another year or two.

### Safari

I am running Safari on version 16.5, as I like to stay a little behind to experience what a typical user would. Turns out, you can crash the current tab if you try to use `color-mix` with `currentColor` specifically on the `text-shadow` property (`filter: drop-shadow()` and `box-shadow` worked fine). I did not experience this on Safari Technology Preview, so hopefully it’s been fixed for a while.

```css
/* Running this code may crash your Safari tab! */
p {
	text-shadow: 0 0 0 color-mix(in hsl, currentColor, black);
}
```

I also noticed some issue with the homepage wordmark (or my "large" logo, if you will), notably the circles which would grow past the limit of the grid cell they were in. For this one, a little `max-block-size` with a magic number did the trick… I should file a bug, huh?

And something comical: the "welcome" text around my name on the homepage? It’s got responsive sizing, but Safari is doing something funky, so every time I refresh the page, the font size grows. Not present in Technology Preview but this one’s weird. And funny!

{{ video "./safari-font-size-refresh.mp4", "This website’s homepage being refreshed many times, and each time a piece of text grows bigger until it takes up the entire screen.", "", { width: 1279, height: 782, loop: false, poster: "./safari-font-size-refresh.jpg" } }}

### Firefox

With Firefox, I had to file a few bugs, and found existing ones that corresponded to what I was seeing.

First, my homepage wordmark is a little beast of a grid to get the elements to layer correctly, and sadly an `aspect-ratio` alongside an auto-sized column doesn’t work ([bug 1719273](https://bugzilla.mozilla.org/show_bug.cgi?id=1719273)). I worked around it by using `justify-self: center` so the element would still be in the right place — phew!

Still related to this wordmark, I was trying to animate the “decorative” pieces in the circle. `vector-effect: non-scaling-stroke` doesn’t work with `scale` transform ([bug 1734476](https://bugzilla.mozilla.org/show_bug.cgi?id=1734476)), and working around it with a near-zero starting scale also causes issues ([bug 1883285](https://bugzilla.mozilla.org/show_bug.cgi?id=1883285), pretty much the same problem).

Finally, I was trying to animate strokes on this same section, and with the `stroke-dasharray`/`stroke-dashoffset` trick, I was hoping to make my life easy with the `pathLength` attribute. Wrong! Due to the non-scaling stroke, this doesn’t match, so I figured, “fine, I’ll hardcode a ratio and throw this all in a `calc()`”, but being SVG elements, I didn’t provide a unit, which Firefox considers a mistake (see [bug 1884525](https://bugzilla.mozilla.org/show_bug.cgi?id=1884525)). Be that as it may, it works on Chrome and Safari, so it feels like the spec should update to allow this since you can provide the property as a unitless number, just not a unitless calculation…

```css
stroke-dashoffset: var(--CTX-dashoffset, 1); /* ✅ okay */
stroke-dashoffset: calc(var(--CTX-dashoffset, 1) * var(--CTX-ratio)); /* ❌ nope */
stroke-dashoffset: calc(var(--CTX-dashoffset, 1) * var(--CTX-ratio) * 1px); /* ✅ okay */
```

I also found a little rendering issue with `box-shadow` where the inset colour would kind of bleed outside of a solid border if using a `border-radius` ([bug 1887572](https://bugzilla.mozilla.org/show_bug.cgi?id=1887572)). Pretty minor, but it’d be nice to see this fixed so I can remove my half-pixel outline hack to cover this!

## Performance?

I’ve tried to reduce the amount of filters in my configuration, and be a little more strategic, but generally speaking, I’m still using a lot of the same code, so Eleventy-wise, it’s pretty close to the previous build (but converted to ESM!). A couple of post-build transforms and the internationalisation pieces are gone, so I think this version is slightly faster, but not dramatically (10–20%, at best). My `before` script of the build is 3 to 4 times faster though (from 240–300ms to 60–100ms), which might be telling me my Sass files were slow to compile.

As far as the files that are spit out, I end up with slightly heavier files due to the themes being pretty different, but the homepage “intro” section is no longer a complex SVG animation (as cool as it was!) so I don’t have as many FPS drops.

## Takeaways

ESM is pretty cool, custom elements are super cool, open source is amazing, and if you read through _all_ of this ramble, thank you, and congratulations: I am not good a trimming down content!

If anything, I hope you have fun with the theme picker. It’s my happy place.

And if you notice anything strange, while I don’t expect free labour, if you could let me know what’s wrong, I would truly appreciate it. Thank you!