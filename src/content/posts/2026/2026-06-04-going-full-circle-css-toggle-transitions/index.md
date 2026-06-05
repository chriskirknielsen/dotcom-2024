---
title: "Going Full Circle on CSS Toggle Transitions"
summary: "Spin a marker right round, like a record"
tags: ['css']
time: '04:04:00'
---

I recently worked on some “accordion” component with a custom marker to indicate open and closed states. I had it set up so the marker, a chevron, would rotate by 180 degrees when the component was in its open state. Add a CSS transition (when motion preferences allow it), job done.

But… it would animate backwards upon closing, “rewind” so to speak, which is exactly how CSS should work, but I wanted it to “complete” the rotation, so:

1. idle: start at 0 degrees
2. expanded: go to 180 degrees
3. closed again: go to 360 degrees
4. idle: start at 0 degrees
5. … and so on.

Let’s take a look at what I tried, and which solution I landed on.

{{ callout 'No Gecko, amigo' }}This works in two browser engines, Chromium and WebKit, and my assumption is that they both are working as the specification has been, well… specified. Firefox, however, skips the closing transition. If you have any idea why, please let me know!{{ /callout }}

First, here is the base markup and styles for all the demos:

```html
<details>
	<summary>
		<span>Learn more about this!</span>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="details-marker">
			<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" />
		</svg>
	</summary>
	<div class="details-content">
		<p>I have important things to say!</p>
	</div>
</details>
```

```css
details {
	--DET-transition-duration: 300ms;
	--DET-transition-easing: ease-in-out;
}

/* Rewinds upon closing */
.details-marker {
	@media (prefers-reduced-motion: no-preference) {
		transition: transform var(--DET-transition-easing) var(--DET-transition-duration);
	}

	details[open] & {
		transform: rotate(180deg);
	}
}

/* Aesthetics skipped for brevity but available in the CodePen demos */
```

And here’s what that looks like: it works everywhere but the marker “rewinds” — keep an eye on that chevron at the end of the line there when opening and closing the details/expander/accordion/stretchyboi:

{{ codepen "https://codepen.io/chriskirknielsen/pen/vEyjvrb", "result", 300 }}



I managed to get most of the way using a *registered* custom property to hold the “opened” state until everything was closed, using a transition on this property with a `step-end` timing function, which holds a value at its initial state until the duration has passed (e.g. from `0` to `1` over a second, it’ll stay at `0` for a second, then immediately flip to `1` without any interpolation). My original (and promising) result looked like this:

```css
@property --DET-state {
	syntax: '<number>';
	initial-value: 0;
	inherits: true;
}

details {
	--DET-state: 0;
	--DET-transition-duration: 300ms;
	--DET-transition-easing: ease-in-out;
	
	transition: --DET-state var(--DET-transition-duration) step-end;

	&[open] {
		--DET-state: 1;
	}
}

/* "Works" in Chrome and Safari, but unwinds after closing */
.details-marker {
	@media (prefers-reduced-motion: no-preference) {
		transform: rotate(calc(360deg * var(--DET-state)));
		transition: transform var(--DET-transition-easing) var(--DET-transition-duration);
	}

	details[open] & {
		transform: rotate(180deg);
	}
}
```

{{ codepen "https://codepen.io/chriskirknielsen/pen/OPbZdOb", "result", 300 }}

It did almost everything I wanted (in Chrome and Safari…), going from 0 degrees, to 180, and to 360 on close, except… when the rotation was completed, and `--DET-state` returned to `0`, the marker would also transition from 360 degrees to 0 degrees, so it looked kind of loopy (pun intended, thank you very much, I’ll be here all week).

I tried a few things, like adjusting the timing function between open and closed states. Ultimately, I came to the conclusion that I needed the closing transition to run normally while `--DET-state` was held at `1`, but the second transition due to `--DET-state` flipping back to `0` should be skipped. I could achieve this by adjusting the `transition-duration` itself, but this doesn’t work in Firefox *and* Chrome — Safari does what I expect of it, in version 18.6 as well as Technology Preview:

```css
/* This does not work in Firefox and Chrome! */
.details-marker {
	@media (prefers-reduced-motion: no-preference) {
		transform: rotate(calc(360deg * var(--DET-state)));
		transition-property: transform;
		transition-timing-function: var(--DET-transition-easing);
		transition-duration: calc(var(--DET-state) * var(--DET-transition-duration));

		details[open] & {
			transition-duration: var(--DET-transition-duration);
		}
	}

	details[open] & {
		transform: rotate(180deg);
	}
}
```

{{ codepen "https://codepen.io/chriskirknielsen/pen/XJNqGbL", "result", 300 }}

Instead of quashing the duration, I tried using a negative `transition-delay`, and I clicked in disbelief several times to see the marker animate exactly as I wanted. My final result is as follows:

```css
/* This does not work in Firefox! */
.details-marker {
	@media (prefers-reduced-motion: no-preference) {
		transform: rotate(calc(360deg * var(--DET-state)));
		transition: transform var(--DET-transition-easing) var(--DET-transition-duration);
		transition-delay: calc((var(--DET-state) - 1) * var(--DET-transition-duration));
		/*
			The delay above could also be expressed like so, if you find it easier to read:
			transition-delay: calc(-1 * (1 - var(--DET-state)) * var(--DET-transition-duration));
		*/

		details[open] & {
			transition-delay: 0s;
		}
		
		@-moz-document url-prefix() {
			transition: transform var(--DET-transition-easing) var(--DET-transition-duration); /* Standard look in Firefox */
		}
	}

	details[open] & {
		transform: rotate(180deg);
	}
}
```

{{ codepen "https://codepen.io/chriskirknielsen/pen/NPbMJdB", "result", 300 }}

However, as mentioned at the start of this article, **this does not work in Firefox**. Which sucks! These properties are not exactly bleeding edge… I know I’m manipulating time in weird ways here, but this doesn’t require a flux capacitor… it feels like it should work.

In any case, in Firefox, with a little browser-specific hack, the transition is reverted and the chevron rewinds back to 0 degrees instead, which means it’s still absolutely usable, and I consider this a nice little progressive enhancement.

I am certain there are ways to make this work: maybe some trick using `mod()` off by `0.01deg`, or adding in a CSS keyframe animation (I specifically avoided keyframes as you cannot smoothly reverse the transition if you interrupt it midway). Definitely easy with some JavaScript (either Web Animation API or an event listener), but that’s no fun!

If you have ideas, I’d be happy to hear some details and expand this article accordingly (_eehhh?_).