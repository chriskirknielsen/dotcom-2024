---
title: "Vertical slider fitting the tallest element in pure CSS"
summary: "Using transforms to create overflow."
time: '00:25:00'
tags:
    - css
    - quick-tip
---

I was working on a project requiring this kind of vertical slider. Each slide needed to have the same height so it wouldn't look jarring as you scrolled, and I just knew I was going to use the trusty `grid-area: 1 / 1 / -1 / -1;` solution to make all the slides fit the same space in the slider. I suspect a column-oriented flexbox solution with `flex: 1 0 0` is equally viable.

If you want all elements to take up the same height but don't need a slider , `grid-auto-rows: 1fr;` will do. But if you want them to all take up the same space and be scrollable one by one, a little trickery is needed…

I did not want any JS to handle which slide was visible — I wanted a pure CSS solution with a classic scrollbar (scroll-snapping makes it look good). Well, good news for us: transforms introduce scrolling. In my case, I could very easily apply a vertical translate of 100% multiplied by the slide index: `transform: translateY(calc(var(--i) * 100%))`. Since they are all the same height, the next one begins where the previous one ends — just what I needed.

{% codepen "https://codepen.io/chriskirknielsen/pen/zxOowyy" %}

A couple of caveats: the slide index needs to be provided one way or another. I went with an inline `style` attribute providing a `--i` custom property, but you could use a list of `:nth-child(1) { --i: 0; }` and so on and so forth (until we get `sibling-index()` that is) if you wanted to handle it in CSS only.

And a second caveat: if the content is taller than the viewport, then, well, it's going to have an unpleasant result for users requiring scrolling the body _and_ the slider independently to read everything, so use with caution (or if it contains only images, `max-block-size`/`max-height` is probably a good idea).

Setting up the horizontal variation in my demo, I think I've done this before with less complexity… but the width is usually easier to account for than the height, so maybe this isn't useless? If this is over-engineered and can be simplified, I'm all ears!

Anyways, just another "tales from work" that seemed cool to share!