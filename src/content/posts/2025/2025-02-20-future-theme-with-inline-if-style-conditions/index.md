---
title: "A Future of Themes with CSS Inline if() Conditions"
summary: 'Another way to implement themes on a website with style conditions.'
tags: [css, themes]
toc: true
featured: true
---

Hey, so remember when I went down a CSS rabbit hole about using [style queries to create themes in 2023](/blog/future-themes-with-container-style-queries/)? Well I’m back on my bullshit.

Recently, Chrome started prototyping `if()`, enabling it in Chrome Canary 135 (with the Experimental Web Platform Features flag enabled in `chrome://flags`). Some people are seemingly very opposed to this addition in CSS. But me? I am excited about the new opportunities this will open up.

After seeing [the `--light-dark()` demo by Bramus](https://www.bram.us/2025/02/18/css-at-function-and-css-if/), I knew I had to revisit my idea. In this instance, it makes [my CSS variable-only theming solution from 2021](/blog/a-dry-approach-to-color-themes-in-css/) a lot less hacky. So, let’s see what that might look like.

## Simple example

Instead of using `@container` style queries to detect which theme is used, we can use inline style conditions with `if()`. Taking the basic light/dark example:

```css
:root {
	--theme: light;
	@media (prefers-color-scheme: dark) {
		--theme: dark;
	}

	--bg: if(
		style(--theme: dark): midnightblue;
		else: ghostwhite
	);
	background: var(--bg);
}
```

At first glance, it looks like its own not-super-CSS-y syntactic block within a value declaration… and that’s probably exactly what it is. But it sure packs a punch, though I will admit the `if()` syntax is a little verbose (especially when you break it into multiple lines).

## Some DRY theming

While very basic, this example becomes a lot more interesting with the DRY approach I like to rave about, as well as additional themes:

```css
/* No-JS defaults */
html:not([data-theme]) {
	--theme: light;
	@media (prefers-color-scheme: dark) {
		--theme: dark;
	}
}

/* JavaScript-driven data attribute */
:root[data-theme=dark] {
	--theme: dark;
}
:root[data-theme=light] {
	--theme: light;
}
:root[data-theme=pastel] {
	--theme: pastel;
}

/* Theme tokens setup, probably automated */
:root {
	--bg: if(
		style(--theme: pastel): lightpink;
		style(--theme: dark): midnightblue;
		else: ghostwhite
	);
	/* And so on ... */
}

/* Then start styling the page */
html {
	background: var(--bg);
}
```

One very important distinction compared to my style queries approach is this: `:root` can query its own `--theme` value inside of `if()`, meaning we can get rid of the sinful practice of setting the background on the `body` (since a container cannot (yet?) query its own styles). This moves all the logic into the root element, and that is `*Borat voice*` _very nice_.

The other aspect is that the fallback values with the public and private properties I was using for style queries can still be used here. Setting these up is only really necessary if you have more than just a light and a dark theme (Bramus’s aforementioned article will cover everything you need for the two-scheme case).

## Handling fallbacks

For the fallbacks, we can go one of two ways:
1. explicitly provide the `else` condition for every property; or,
2. omit the `else` condition, which is effectively the same as `else: initial`, and continue using public and private property pairs so the fallback is declared inside a `var()` call instead.

Honestly this depends on your preference, both are valid and ultimately do the same thing. Option #1 will condense and co-locate everything, whereas option #2 will allow you to specify all your theme-based tokens, and then your fallbacks. Here’s both approaches with a `font-size` and `font-family`:

```css
:root {
	/* Option #1 */
	--font-size: if(
		style(--theme: pastel): 1.1rem;
		style(--theme: dark): 0.9rem;
		else: 1rem
	);
	 --font-family: if(
		style(--theme: pastel): serif;
		else: sans-serif
	);

	/* Option #2 */
	--_font-size: if(
		style(--theme: pastel): 1.1rem;
		style(--theme: dark): 0.9rem;
	); /* else: initial is implied */
	--_font-family: if(
		style(--theme: pastel): serif;
	); /* Only one of three themes is checked */

	--font-size: var(--_font-size, 1rem);
	--font-family: var(--_font-family, sans-serif);
}
```

Either way, you need an extra line to declare the fallback (unless you one-line all your `if()` values 🙈), so it’s a tie. The only advantage I could see to #2 is if you want to override your variable contextually without losing the original value (e.g. within a component you might want `--font-size: calc(var(--_font-size, 1rem) * 3.14);`, maybe?).

## Ship it?

Nearly two years later, I am _still_ waiting for style queries to be widely available, so I don’t expect to be using this any time soon (though this approach includes fallbacks, so it should be safe, if used carefully).

Regardless, this is a wonderful addition to the CSS programming language which will let us do a lot of very, very cool things, especially with functions, and scopes, and layers, and… holy smokes, **CSS truly is awesome**, isn’t it? I’m already seeing some neat ideas from [Roma Komarov](https://kizu.dev/) mixed in with other new features.

It is frustrating that Chrome is shipping — or rather prototyping — all these cool things (`if()`! `@function`! Extended `attr()`!) and the other major players are lagging behind, meaning this won’t be ready for production for quite some time, but that’s capitalism, baby.

## Demo please

I got you covered, dear reader. Just remember it will only work on a supporting browser, which at this time is just Chrome Canary with a special flag.

{{ codepen "https://codepen.io/chriskirknielsen/details/VYweVOj" }}

## More reading

- [Bramus’s article on `function` and `if()`](https://www.bram.us/2025/02/18/css-at-function-and-css-if/) (linking it again because it is really good)
- [A fantastic demo from Roma Komarov](https://codepen.io/kizu/pen/EaxPgmK)
- [CSS specification on `if()` notation](https://drafts.csswg.org/css-values-5/#if-notation)