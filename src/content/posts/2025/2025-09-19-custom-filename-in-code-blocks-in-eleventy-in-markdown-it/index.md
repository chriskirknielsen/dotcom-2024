---
title: "Adding a custom filename to a code block in Eleventy with markdown-it"
summary: "Making those code blocks a little more personal."
tags:
    - markdown
    - eleventy
time: 03:30:00
---

I made a plugin to have more control over my code blocks ([CodeWrap](/projects/markdown-it-codewrap/), [I wrote about it](/blog/markdown-it-codewrap/)), and I liked the idea of giving a filename to a code block (for example, `.eleventy.js`) instead of just showing “JavaScript”. With my CodeWrap plugin, I can hook into `markdown-it`’s rendering logic and process a value like `` ```js:.eleventy.js``. I then save the filename in a private `_filename` property, and restore the “natural” value of `js` for the code block’s programming language. This works very well! I described this in my aforementioned written entry about the plugin if you want to learn more.

However, this also means I have backed myself into a corner of proprietary syntax, and I must admit that I am not quite fond of this. Plus, while I don’t use it (yet), there is a Markdown standard (extension?) for line highlighting that’d likely be in conflict, so… not great! To “fix” this, my idea was that, instead of adding the filename right next to the language separated by a colon (once again: a custom syntax of mine), I would add it in square brackets, on the line right before the “fence” (the name for triple-backtick-wrapped code), so it looks like:

`````md
[eleventy.js]
```js
// Some interesting code
```
`````

It was easy within my CodeWrap plugin to find the previous paragraph and get its contents (the `markdown-it` renderer provides the full list of tokens, and loops through them, with their index, so going back a couple indices was fine), but sadly, I could not toggle the `hidden` flag, as I believe it renders tokens in sequence, not all at once, so by the time the code block was being processed, the previous paragraph was already rendered.

Makes sense, but that means this approach won’t work. So… what can I do to get the same result, but catch my square-bracket line before it’s rendered? Well of course: another plugin!

Before you say “boo!”, I mean plugin in functionality only — anything passed to the `use` method is considered a plugin to `markdown-it`. I didn’t release anything on npm, I swear, I didn’t over-complicate it this time! I added a new handler in my configuration with the same structure as a plugin, but inline, instead of a reference to a third-party import. So much power!

```js
// Configure the MarkdownIt instance
const mdit = new markdownIt(markdownItOptions)
	.disable('code')
	.use(markdownItAttrs, markdownItAttrsOptions)
	.use(markdownItAnchor, markdownItAnchorOptions)
	.use(function (md) { /* A new inline plugin! */ })
	.use(markdownItCodeWrap, markdownItCodeWrapOptions); /* My existing plugin! */

// Configure the markdown-it library to use
eleventyConfig.setLibrary('md', mdit);
```

I think the square brackets, by themselves and without any following parentheses (as you’d see on a Markdown link), won’t trigger any Markdown behaviour, and should, as such, be safe from wonky parsing. If you think this is bad for some reason, please let me know!

The idea is to process the tokens so that instead of looking back from the code block token for an open paragraph token, the opening paragraph token will look ahead for a code block token: this way, the paragraph can be manipulated before it renders, and that includes its `hidden` property. I also found out `markdown-it` has a useful `meta` property attached to every token, allowing us to add any bit of data we want. A filename sure seems like a good fit.

For this purpose, we’re only interested in finding paragraphs right before code blocks, so looking at the token’s `type` will help: `paragraph_open` for the current token (at position of `idx`), `paragraph_close` for the token after the next (`idx + 2`), and `fence` following that (`idx + 3`). The inner contents of the paragraph are also provided (at `idx + 1`) and that’s what will be — take a deep breath — matched against a *regular expression*.

Like me, you might have long-ish posts with lots of code blocks and paragraphs, so looping through all of them might be a little much to add like 3 filenames here and there. I can’t promise it’s a million time faster, but I tried to ensure the regular expression only ran when it a code block was indeed right after a paragraph.

Okay, I think I’ve explained enough, let’s see some code!

```js
const mdit = new markdownIt(markdownItOptions)
	.disable('code')
	.use(markdownItAttrs, markdownItAttrsOptions)
	.use(markdownItAnchor, markdownItAnchorOptions)
	.use(function (md) {
		// This handles the non-filename scenario: using the default renderer
		const proxy = (tokens, idx, options, env, self) => self.renderToken(tokens, idx, options);
		const defaultRenderer = md.renderer.rules.paragraph_open || proxy;
		// Captures everything between square brackets so long as it's the only content and has a dot and extension
		//? e.g.: `logo.svg`, `darude/sandstorm.js`, `.git`, etc.
		const filenameRegex = /^\[(([/.a-zA-Z0-9_-]+)?\.[a-zA-Z0-9_-]+)\]$/;

		// The markdown rendering function that handles extracting filenames if found
		function customRenderer (tokens, idx, options, env, self) {
			if (tokens.length > 3) {
				const currentToken = tokens[idx]; // The opening paragraph token (definitely)
				const nextToken1 = tokens[idx + 1]; // The paragraph child contents token (likely)
				const nextToken2 = tokens[idx + 2]; // The closing paragraph token (probably)
				const nextToken3 = tokens[idx + 3]; // The code fence token (hopefully)

				// If all the conditions are met via simple string operations, we can run the more intensive regular expression to find a filename
				if (
					currentToken?.type === 'paragraph_open' &&
					nextToken1?.content?.startsWith('[') &&
					nextToken1?.content?.endsWith(']') &&
					nextToken2?.type === 'paragraph_close' &&
					nextToken3?.type === 'fence'
				) {
					const previousParagraphFilenameMatch = nextToken1?.content.match(filenameRegex);
					if (previousParagraphFilenameMatch) {
						nextToken3.meta = nextToken3.meta || {};
						nextToken3.meta.filename = previousParagraphFilenameMatch[1]; // Use everything captured between the square brackets (group 1)

						// The paragraph's contents have been extracted, and it can now be hidden
						currentToken.hidden = true; // Not required but it just feels cleaner to have both opening and closing tokens hidden
						nextToken1.children = []; // If left as-is, this will render raw text, without the wrapping paragraph tag
						nextToken2.hidden = true; // Required on the closing token!

						return '';
					}
				}
			}

			// If the paragraph was not a filename, just return a normal render
			return defaultRenderer(tokens, idx, options, env, self);
		};

		// Apply the custom renderer just to opening paragraph tokens
		md.renderer.rules.paragraph_open = customRenderer;
	})
	.use(markdownItCodeWrap, markdownItCodeWrapOptions);
	
// Configure the markdown-it library to use
eleventyConfig.setLibrary('md', mdit);
```

I know these 50-ish lines of code aren’t the most fun to look at, but I hope the comments make it clear what’s going on: we make nearly-sure we have a filename paragraph, extract the filename via a regular expression (if any), then pass the found filename to the following code block’s `meta` property, and finally hide the paragraph we got the filename from. Phew!

As for how to make use of the `meta` property, if you happen to use my CodeWrap plugin, you’d add a `toolbarLabel` callback. In the code above, that’d be part of `markdownItCodeWrapOptions` — here’s a very simplified version of what I use:

```js
const markdownItCodeWrapOptions = {
	toolbarLabel: (tokens, idx, options, env, self) => {
		const token = tokens[idx];
		// This will display the filename or the language, e.g.: ".eleventy.js" or "JS"
		const toolbarLabel = token?.meta?._filename || token?.info.toUpperCase() || 'Code';
		return `<span class="codeblock-toolbar-label">${toolbarLabel}</span>`;
	}, // ...and then more options
};
```

And there you have it. A custom filename on custom code blocks — neat!

[chris-bot.js]

```js
new Chris().request('Please clap.');
```

At first I thought it’d be pretty cool to use the comment syntax of each language (so the first line in the code block would just be `<!-- index.html -->` or `/* style.css */`), as that makes it 100% compatible everywhere, and it remains mostly clear what’s going on, but I’d have to then pull it out of the contents, and properly parse comments in various languages… I think what I came up with is a little easier, consistent, and reliable, with the same syntax regardless of the language. And if I ever drop all my plugins, it still makes enough sense to see the filename right before a code block, all without breaking basic Markdown rendering.

I don’t know if this is great, or if most of my readers (all three of you!) even care to see a filename, but it’s fun to play around with!