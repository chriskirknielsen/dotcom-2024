---
title: "“Simple” Table of Contents Highlighter"
summary: "Highlight your TOC in a tick."
time: '19:19:19'
tags:
    - quick-tip
    - javascript
toc: true
ogBackground: "./toc-intersection-observer.png"
---

I keep making updates to my website, and for this holiday break, amongst other things, I added a highlighter logic to my table of contents (also known as "scroll spy"). It’s gone through a couple of iterations, but I’ve landed on a good one, and it’s following a nice principle: Keep It Simple, Stupid. 💋

My Table of Contents (TOC) component, if you can even call it a component, appears before the content: above on smaller screens, and stuck to the side as you scroll on larger screens. In the latter situation, it will now highlight the section you are (most likely) reading. I have added a TOC on this post for demonstration purposes while you read this (if using a wide enough screen, that is, and if JavaScript is available).

## The Basic Idea
This uses the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver), and is powered by JavaScript. By observing every heading in the content (more accurately, all the `<h2>` elements in my case), I could highlight any visible heading in the table of contents. Easy!

{{ callout }}
There’s a future where Scroll-Driven Animations are supported everywhere, which would allow us to do all of this in CSS alone, and not a hint of JavaScript.
{{ /callout }}

A first hurdle: if there is a lot of content between two headings, then no headings will intersect in the viewport, and nothing gets highlighted, because I’m only observing headings, not headings and all the content between them.

To address this, I only ran the logic when something _was_ intersecting, meaning if you scrolled back up, the last "activated" heading would stay highlighted, even though you were actually reading the section above it. Not perfect, but no one would notice, because people **never** scroll up… right?

I made sure that only the last intersecting element got highlighted by looping over the list of headings in the intersection observer, and basically let the last item marked as intersecting win, and removed highlighting from any previous item.

I also set the `rootMargin` option so that the intersection would only get triggered when the heading went above the bottom third of the screen with `-33%` (negative values will _crop_ the intersection area, while positive values will _extend_ the area in the specified direction).

This works, but could be better…

## The Better Idea
Instead of checking for the heading presence within the window’s "scrollport" (short for [scrolling viewport](https://developer.mozilla.org/en-US/docs/Glossary/Scroll_container)), I set the observer’s top (a.k.a. block-start) margin to extend up, like… way, way up. This meant that once the heading had passed the bottom third, it was **always** considered to be intersecting.

I used the height of the `<body>` element as the extension value for the intersection margin. Since the heading’s coordinates can never go beyond the total document height (well, I sure hope not!), that is a safe value to use. One caveat is that users might resize their window and that height can change, but I still feel pretty confident this would work for nearly every case.
```js
new IntersectionObserver(..., { rootMargin: `${document.body.clientHeight}px 0px -33% 0px` });
```
{{ set imageUrl = './toc-intersection-observer.png' |> toRoot }}
{{ image imageUrl, "A representation of the intersection detection on a sample page.", "A crude representation of what is going on.", { ratio: 1920/1200 } }}

When I noticed highlighting on [Roman Komarov’s blog](https://blog.kizu.dev) (a CSS genius), I got curious and tried to reverse-engineer the feature by inspecting the minified JavaScript to improve my own implementation. I later found out he has an entire [blog post](https://blog.kizu.dev/toc-scroll-markers/) with links to [the source code](https://github.com/kizu/kizu-blog/blob/main/src/components/ScrollMarkers.astro), which I really should have looked for earlier! (the scroll-driven animation code is fascinating, which has [its own write-up](https://kizu.dev/scroll-driven-animations/)) The improvements from here on out directly benefited from Roman’s ideas.

So doing this is great, but now, all the headers above that bottom 33% line were marked as intersecting, so they would all be highlighted… to solve for this, similar to the first idea, I took the list of intersecting headings, sorted them by their reverse DOM order (as far as I know, the `querySelectorAll` method always returns elements in the order in which they appear), and captured the first element of that list (effectively the last intersecting heading). With that, I could mark it as active and ensure all the other ones were inactive.

Nice! But could this be made even better?

## The Best Idea
I ended up improving my code in two parts: the easy one was to observe all heading levels, not just `h2`, which required barely any changes; the more complex one was to invalidate and regenerate a new observer if the document height changes, via a `resize` event listener. At this stage, I have basically recreated Roman’s logic, but went about it a little differently: while he assigns a CSS custom property on the list to handle highlighting with more advanced CSS logic, I toggle a data attribute on the highlighted item to target it in CSS.

One small improvement over Roman’s ideas was to wrap the resize event listener in a [debouncer](https://gomakethings.com/debouncing-your-javascript-events/). I don’t think it really does anything, since an intersection observer is already pretty performant, but I’ve been hardwired to debounce resize events for many years at this point. Since we are getting a [`scrollend` event](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollend_event), one can hope for a `resizeend` event, one day!

## The Code
Evolving this from a “basic idea” to a “best idea”, the code is not as “simple” as the title of this post might suggest. I’m sorry for bamboozling you (and myself), though to be fair I did start off with about 20 lines of code (now, 80 lines… am I a 4× dev now?).
```js
document.addEventListener('DOMContentLoaded', () => {
	// In this site's layout, the table of contents (.toc) is an element that appears before any other content at the same hierarchy level
	const headings = Array.from(document.querySelectorAll('.toc ~ :is(h2, h3, h4)'));
	if (headings.length === 0) {
		return; // No headings? No business here
	}

	// A few helper functions (.toc-list is the top-level ordered list)
	const markTocItemActive = (a) => a.closest('.toc-list li').setAttribute('data-current', '');
	const markTocItemInactive = (a) => a.closest('.toc-list li').removeAttribute('data-current');
	const getTocLinkFromHeading = (h) => document.querySelector(`.toc-list a[href="#${h.id}"]`);
	const getDocHeight = () => Math.floor(document.body.clientHeight);

	const visibleHeadings = new Set();
	let resizeDebounce;
	let currentObserver;
	let height = getDocHeight();

	function beginObservation(docHeight) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					// Keep track of visible headings
					if (entry.isIntersecting) {
						visibleHeadings.add(entry.target);
					} else {
						visibleHeadings.delete(entry.target);
					}
				});

				// Sort visible (intersecting) headings by inverted order of appearance, then grab the first item (i.e. last visible heading)
				const lastVisible = Array.from(visibleHeadings.values()).sort((a, b) => headings.indexOf(b) - headings.indexOf(a))[0];
				if (!lastVisible) {
					return; // If nothing is visible, weird — TOC are opt-in — but let's skip this logic
				}

				headings.forEach((heading) => {
					// Find the link in the TOC list matching the heading in this list of hheding elements
					const tocLink = getTocLinkFromHeading(heading);

					// If it's the last visible item, mark it to make it stand out, else, revert to the default style
					if (heading === lastVisible) {
						markTocItemActive(tocLink);
					} else {
						markTocItemInactive(tocLink);
					}
				});
			},
			{
				//? docHeight: Extend the detection above the heading so it's always considered as intersecting if above the scrollport
				//? -33%: The element won't be considered as intersecting until it has gone _above_ the bottom third of the scrollport
				rootMargin: `${docHeight}px 0px -33% 0px`,
				threshold: 1, // Only considered intersecting if all the pixels are inside the intersection area
			}
		);

		headings.forEach((heading) => observer.observe(heading));

		return observer;
	}

	// On page load...
	markTocItemActive(getTocLinkFromHeading(headings[0])); // Mark the first item as active (even if the heading appears a bit further down)
	currentObserver = beginObservation(height); // Start the intersection observer

	// On resize, replace the observer with a new one matching the updated body height, if different
	window.addEventListener('resize', () => {
		clearTimeout(resizeDebounce);
		resizeDebounce = setTimeout(() => {
			const heightAfterResize = getDocHeight();
			if (height !== heightAfterResize) {
				if (currentObserver) {
					currentObserver.disconnect();
				}
				currentObserver = beginObservation(heightAfterResize);
			}
		}, 200);
	});
});
```

Want some CSS, too? Let’s do it (my actual styles are different but this gives you the idea):
```css
.toc-list li[data-current] > a {
	text-decoration-thickness: calc(0.0625em + 2px);
}

.toc-list:not(:hover) li:not([data-current]) > a {
	opacity: 0.67;
}
```

Once scroll-driven animations make it into baseline as a widely available feature, I’ll revisit this (and probably look at Roman’s code once more to understand the magic going on under the hood), as I am a sucker for a nice CSS-only solution!