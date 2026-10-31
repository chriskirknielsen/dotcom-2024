---
title: "My Interop 2027 Shortlist"
summary: "I definitely don’t have a bias for CSS."
tags: [css]
time: '18:25:00'
---

Alright, I am a little late to the party but here is my [Interop 2027 ranking](https://interop-rank.fxdx.dev/share/chriskirknielsen-zmgppqbccpsd/) shortlist. Yes, CSS is… a little over-represented in my list. Share [yours](https://interop-rank.fxdx.dev/), too!

## My shortlist

1. 🥇 [CSS `flex-wrap: balance`](https://github.com/web-platform-tests/interop/issues/1350).
I re-implement this with block layout and inline-flex elements too often. Just gimme it.
2. 🥈 [CSS `if()` function](https://github.com/web-platform-tests/interop/issues/1343).
This would be so good to have for my theming shenanigans. And a thousand other things.
3. 🥉 [CSS `filter(image, ...filters)`](https://github.com/web-platform-tests/interop/issues/1449).
How many times have set up pseudo-elements just to lower the opacity of a background image? That’s right, too many.
4. [CSS gap decorations](https://github.com/web-platform-tests/interop/issues/1374).
No more hacky pseudo-elements with `overflow: clip` and negative margins… yeah count me in.
5. [CSS `corner-shape` property](https://github.com/web-platform-tests/interop/issues/1368).
Mainly just for this site’s Cyberpunk theme buttons, but I think it’ll be great to have these tools.
6. [CSS `object-view-box` property](https://github.com/web-platform-tests/interop/issues/1385).
I would have used this in my Uncharted 2 article to create a spritesheet. (also that's ✌️“my”✌️ proposal so you know I’d use it)
7. [Targeted SVG improvements](https://github.com/web-platform-tests/interop/issues/1469).
Hell yeah SVG. Always happy to see SVG get some love, it needs it.
8. [CSS `box-decoration-break` without a vendor prefix](https://github.com/web-platform-tests/interop/issues/1391).
Let’s get rid of vendor prefixes, it’s 2026, come on.
9. [Improve CSS `sibling-count()` and `sibling-index()` functions interop.](https://github.com/web-platform-tests/interop/issues/1460)
Yeah let's get this one cleaned up, I know I sure would be happy not to have to add `style="--i: {​{ index }​}` in my templates!
10. [Element-scoped view transitions](https://github.com/web-platform-tests/interop/issues/1419).
While not desperately needed, I would definitely use view transitions more if I could reliable scope them, including on this here site.
11. [Customizable/stylable `<select>`](https://github.com/web-platform-tests/interop/issues/1393).
We’ve wanted this for a while (20+ years?), and now it can be done without breaking accessibility? Sign me up.
12. [CSS `reading-flow` and `reading-order` properties](https://github.com/web-platform-tests/interop/issues/1349).
Let’s get this done before masonry.
13. [CSS grid lanes (masonry)](https://github.com/web-platform-tests/interop/issues/1445).
I’ve needed this more than a few times, and it's almost ready everywhere anyways, except that we need the `reading-*` properties above to be done… seems like that was pushed back despite concerns. (because accessibility is 👏 not 👏 increasing 👏 shareholder 👏 value!)
14. [CSS `interpolate-size` property and `calc-size()` function](https://github.com/web-platform-tests/interop/issues/1373).
I’d love to use more complex calculations in some cases so I'm interested! And of course, animating disclosure widgets…
15. [CSS `random()` function](https://github.com/web-platform-tests/interop/issues/1354).
Oh yeah this one would let me remove some weird trigonometry-based calculations to get pseudo-random results! (e.g., my concert tickets are tinted via `--hue: calc(mod(5 * var(--i), 7) * 42 * 1deg)`)
16. [JavaScript `Temporal`](https://github.com/web-platform-tests/interop/issues/1381).
Fuck `Date`.
17. [CSS `var()` in size container queries](https://github.com/web-platform-tests/interop/issues/1344).
If we cannot have `@custom-media`, this might help fill the gap in the meantime.
18. [CSS scroll snap events](https://github.com/web-platform-tests/interop/issues/1345).
Already using these as progressive enhancements for custom “carousels” (but not CSS carousels because last I checked those still suuuuuck).
19. [CSS `@function`](https://github.com/web-platform-tests/interop/issues/1357).
Getting near the end of the list so you know it’s not essential, but… damn if it wouldn't be super useful to deduplicate some code! (I could use it instead of `if()` for theming, actually… I’ll take whatever gets baseline first I guess)
20. [HTML `focusgroup` attribute](https://github.com/web-platform-tests/interop/issues/1348).
I’ve created more than a few “tab-like” components, and handling the focus in JS is a nightmare, so I’m all for it, even though it’s not really in all browsers for interop, and rather just a draft spec or something… but I am interested!

Note that I initially had about 30+ items but I’ve reduced the list a little bit, trying to mostly keep it to things that are already in progress, sticking to “interop” and not “wishlist”… but it is admittedly a mixed bag. Do I want `line-clamp`, linked parameters, `:heading`, and responsive iframes? Yeah, absolutely! And we’ll get there… eventually.

## Other people’s lists

We all have different lists, can you believe it?

- [Ana Rodrigues: My Interop feature ranking](https://ohhelloana.blog/my-interop-2027/) (I love the context-dependent lists!)
- [Cyd Stumpel: My picks for interop 2027](https://cydstumpel.nl/my-picks-for-interop-2027/)
- [Declan Chidlow: My Interop 2027 Rankings](https://vale.rocks/micros/20261011-0700)
- [Eric Meyer: My Interop 2027 Rankings](https://meyerweb.com/eric/thoughts/2026/10/14/my-interop-2027-rankings/)
- [Jeremy Keith: Ranking proposals for Interop 2027](https://adactio.com/journal/22805)
- [Paweł Grzybek: My Interop 2027 picks](https://pawelgrzybek.com/my-interop-2027-picks/)
- [Sara Soueidan: My top picks for Interop 2027](https://www.sarasoueidan.com/blog/interop-2027-rankings/)
- [Stuart Robson: My top picks for Interop 2027](https://www.alwaystwisted.com/articles/and-thats-my-rank-2027-edition)
- [Tyler Sticka: My Interop 2027 Ranking](https://tylersticka.com/journal/interop-2027-rank/)