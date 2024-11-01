---
title: "The Multi-Directional Nature of position: sticky"
summary: "You can use it any way you'd like."
time: '19:20:00'
tags:
    - css
    - quick-tip
---

I was working on a product page where the "Add to Cart" button should appear fixed on the page in the "above-the-fold" section. All good, slap `position: sticky` and `bottom: 1rem` on the button and it'll work. But I got curious… could it also stay stuck to the top of the page, after scrolling down, if the section is a bit taller? And… yes, it does. If you give it `top: 1rem` in addition to the rest, it will work just fine.

Note that you can also set `top` and `left` if there's horizontal scroll, or `bottom` and `right`. And, well, you guessed it, you can set all four, too (or use `inset` to set them all at once!).

{% codepen "https://codepen.io/chriskirknielsen/pen/YzmvNbd" %}

I knew you could do `top` and `left` (or `inset-block-start` and `inset-inline-start`) for example, but never tried both sides of the same direction. Cool stuff!