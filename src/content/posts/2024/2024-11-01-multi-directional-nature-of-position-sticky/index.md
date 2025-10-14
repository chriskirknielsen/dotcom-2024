---
title: "The Multi-Directional Nature of position: sticky"
summary: "You can use it any way you’d like."
time: '19:20:00'
tags: [css, quick-tip]
---

I was working on a product page where the "Add to Cart" button should appear fixed on the page in the "above-the-fold" section. All good, slap `position: sticky` and `bottom: 1rem` on the button and it’ll work. But I got curious… could it also stay stuck to the top of the page, after scrolling down, if the section is a bit taller? And… yes, it does. If you give it `top: 1rem` in addition to the rest, it will work just fine.

So you can set `top` and `bottom`, or if there’s horizontal scroll, `left` and `right`. And, well, you guessed it, you can set all four, too (or use `inset` to set them all at once!):

{{ codepen "https://codepen.io/chriskirknielsen/pen/YzmvNbd" }}

I knew you could set one for each axis (`top` and `left` for example), but never tried both sides of the same axis. Cool stuff!