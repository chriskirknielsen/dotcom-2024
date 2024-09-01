---
title: "My under-engineered way to avoid a Flash of inAccurate coloR Theme (FART)"
summary: "It all boils down to a single line of JS"
time: '20:55:00'
tags:
    - javascript
    - css
    - themes
---

I’m still seeing some folks use ways to restore a user’s selected theme on websites that are, in my eyes, too complex. Cookies and headers? Delayed render? *Edge functions?* Nah, I’m too lazy for that. One line of JavaScript in the `<head>`:

```html
<script>document.documentElement.dataset.theme = localStorage.getItem('theme');</script>
```

Admittedly, a single line is a little optimistic, but that’s the gist of it. This sets the attribute on the `html` element, and is executed in the `head` element, theoretically before anything starts rendering.

By placing it before any `link` or `style` element, it avoids any flash of inaccurate color theme (a.k.a. [FART](https://css-tricks.com/flash-of-inaccurate-color-theme-fart/)), since it’s not waiting for anything — it’s inline, which should be as fast as it can possibly be.

I like to put the background colour on the `html` element ([you probably shouldn’t set it on the `body`](https://chriskirknielsen.com/blog/future-themes-with-container-style-queries/#background-defined-in-the-body)), so I want this bit of JS to run before my styles load so it doesn't go from `Canvas`, to the default theme, then to the selected theme (fast at that might be).

This means the timeline looks like so: Page is requested and loads → Theme hook is applied to `<head>` from `localStorage` → CSS is loaded → Contents start loading and rendering begins.

To make it more useful with CSS selectors, I'll only add the attribute if the local storage value exists:

```html
<script>
const theme = localStorage.getItem('theme');
if (theme) {
	document.documentElement.dataset.theme = theme;
}
</script>
```

*Ah dang, it’s no longer one line, now I’ll never make it to the front page of Hacker News…*

With this second iteration, I can theme my page with OS defaults (with `prefers-color-scheme` media queries, or the recent `light-dark()` function) if the attribute is missing (this happens on first visit, no theme override, disabled JS...), or set my theme values when it _is_ defined:

```css
html:not([data-theme]) {
	--COLOR: light-dark(aliceblue, midnightblue); /* No media queries! */
	/* other colours... */
}
html[data-theme='light'] {
	--COLOR: aliceblue; /* etc... */
}
html[data-theme='dark'] {
	--COLOR: midnightblue; /* etc... */
}
html[data-theme='pride'] {
	--COLOR: rebeccapurple; /* etc... */
}
```

I leave it up to you to add some JavaScript to set the theme after clicking a button ([see Lea’s implementation](https://codepen.io/learosema/pen/zYmvQJV) or [Max’s article](https://mxb.dev/blog/color-theme-switcher/) which also happens to use this approach — if somebody talented like Max does this, you know it’s a good call). You could use cookies instead of `localStorage` but the latter has a nice browser API to get the value I want without any regular expressions or `.split()` sequences.

I use this idea on my own site right here: it is a little more involved since it’s interwoven with the theme picker, but it’s the same principle. Under-engineering the theme “hook” means this is **super portable**, and that gives me more time to [over-engineer my CSS](https://www.youtube.com/watch?v=k_3pRxdv-cI). No edge-function vendor lock-in, no pre-request header manipulation or whatever: I’m not smart enough to pretend to know how it works… if you want to do it that way, though, that's neat!

But this right here? **Now that’s a nice FART-stopper.** 💨

**PS:** This is in no way a “I've found a new way to do things! I am very smart!” kind of article; however I've been using this for some years and I haven't found anything better. I guess it's a good reminder that you don't need a ton of JavaScript, maybe?