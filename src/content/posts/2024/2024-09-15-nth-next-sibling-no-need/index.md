---
title: ":nth-next-sibling? No need."
summary: "Target elements after an arbitrary element in CSS"
time: '19:00:00'
tags:
    - css
---

Yesterday, I discovered a new wish I had in CSS: when selecting the next few siblings of an element, instead of having to do `.el + *, .el + * + *, .el + * + * + *`, I'd love to have something like `:nth-next-sibling(-n + 3 of .el)`. But writing that down, the `of` made me think “Oh bother, that syntax would be confusing with `:nth-child(n of .el)`" *and then* the epiphany followed: I can achieve my goal with `:nth-child` already.

The selector is more complex to understand at a glance, and is probably slightly less performant, but it works exactly as I expected, and it very easy to maintain if the item count needs to change:

```css
/* Selects 3 sibling elements after .el */
li:nth-child(-n + 3 of .el ~ *) { background: hotpink; }
```

{% codepen "https://codepen.io/chriskirknielsen/pen/yLdWpvY/", "css,result", 400 %}

For my specific use-case on my [About](/about) page, the selector is a bit more… *exotic*, but It Just Works™:

```css
:nth-child(-n + 4 of cycling-expander:has(.expander[data-open='true']) ~ *) { /*...*/ }
```

I really need to stop discovering [star-selector solutions](https://chriskirknielsen.com/blog/select-an-element-which-doesnt-descend-from-another-in-css/) to all my problems.