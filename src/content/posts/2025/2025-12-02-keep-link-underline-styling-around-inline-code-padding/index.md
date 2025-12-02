---
title: "Keeping link underline styles around inline code with padding"
summary: "Preserving the tiny underline is nearly effortless with CSS pseudo-elements."
tags: [css, quick-tip]
time: '04:00:00'
ogBackground: "./underline-gap-examples.jpg"
---

Recently, ~~`text-decoration-trim`~~ [`text-decoration-inset`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration-inset) was added to Firefox behind a flag, and I was hoping it could fix a little visual thing that has bugged me on my website: the gap in underlines for inline code when it’s part of a link (e.g.: `<a href="...">A <code>special</code> link</a>`). You can see this happen on popular sites like GitHub or Notion, to name a couple.

{{ set imageUrl = "./underline-gap-examples.jpg" |> toRoot }}
{{ image imageUrl, "Some blocks of text with an underlined link, and within the text of each, a small code element with a slightly different background colour is visible, and around which the link underline is interrupted.", "GitHub, Notion, and this very website (previously)", { ratio: 614/432 } }}

It’s not unusual for inline code to have a slightly different background colour, and in turn, padding to give the code some breathing room in the rectangle, preventing the text from being stuck against the edge of the box. But that’s the issue: the padding will separate the inline element a little, causing the underline in the parent link to break around the code element. What can we do?

{{ callout "Seem familiar?" }}This problem is kind of the opposite from my post from last year, [Removing link underline styles between icons and text](/blog/remove-link-underline-styling-between-icon-and-text/).{{ /callout }}

## New CSS to the rescue?

I tried using the new CSS property `text-decoration-trim` (at the time of writing, Firefox has not updated to the new name) with a value of `calc(var(--p) * -1)` (with `--p` being my inline padding amount of `0.125em`). Sadly, the padding still causes the underline to be skipped. I then tried adding `text-decoration: inherit;` alongside with the negative inset, but that gave the same result. Okay, bummer, but my understanding is that the padding is basically a non-inline thing, so it’s not underline-able, or something — fair enough.

Back to the drawing board.

## Old CSS to the rescue!

Sometimes you gotta go back to move forwards. Instead of trying to fix this with brand new CSS, I used… some old-ass CSS. Instead of `padding-inline`, I added some `::before` and `::after` pseudo-elements with a `content` set to a hairspace (Unicode sequence `U+200A`):

```css
:not(pre) > code {
	/* All of the other styles like font-family, color, background, border-radius… */

	&::before,
	&::after {
		content: '\200a';
		font-size: 0.5em; /* I need to split hairs: it was still too wide */
	}
}
```

Job done! Right? *Weeeeeell…*

If that hairspace lands right at the end of a line but the actual code cannot fit, then it can be a lone hairspace on one line, and the code on the next: not great. The fix is to use a word joiner (`U+2060`). That will ensure the two hairspaces are connected to their respective first and last characters in the `code` element. More magic unicode incantations and there we go: `content: '\2060\200a\2060';` The word joiners are not necessary on both sides, but this makes the code more concise, and does no harm, I think? Feel free to split up the two.

{{ callout }}I’m not sure assistive technology is going to bother with these whitespace characters, so setting alternative text with the newer `content: '\2060\200a\2060' / '';` syntax seems irrelevant here but if I’m wrong, let me know!{{ /callout }}

The only downside here is that if your code takes up two lines, the padding cannot be repeated at the end of the first line and start of the second with `box-decoration-break: clone`, but that is something I am willing to live with.

And with that yes, now we are done. Ship it, turn off the computer, and take a long walk.

PS: no, this is not even the worst post title I could think of, why do you ask?