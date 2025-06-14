---
title: ":nth-next-sibling? No need."
summary: "Target N elements after an arbitrary element in CSS."
time: '19:00:00'
updated: 2024-09-23
tags:
    - css
    - quick-tip
---

Yesterday, I discovered a new wish I had in CSS: when selecting the next few siblings of an element, instead of having to do `.el + *, .el + * + *, .el + * + * + *`, I’d love to have something like `:nth-next-sibling(-n + 3 of .el)`. But writing that down, the `of` made me think “Oh bother, that syntax would be confusing with `:nth-child(n of .el)`" *and then* the epiphany followed: I can already achieve my goal with `:nth-child`.

The selector is more complex to understand at a glance, and is probably slightly less performant, but it works exactly as I expected, and it very easy to maintain if the item count needs to change:

```css
/* Selects 3 sibling elements after .el */
li:nth-child(-n + 3 of .el ~ *) { background: hotpink; }
```

{{ codepen "https://codepen.io/chriskirknielsen/pen/yLdWpvY/", "css,result", 480 }}

For my specific use-case on my [About](/about/) page, the selector is a bit more… *exotic*, but It Just Works™:

```css
:nth-child(-n + 4 of cycling-expander:has(.expander[data-open='true']) ~ *) { /*...*/ }
```

I really need to stop discovering [star-selector solutions](/blog/select-an-element-which-doesnt-descend-from-another-in-css/) to all my problems.

## Update: and :nth-previous-sibling?
By the way, if we wanted to do the same for the previous siblings of `.el`, the counting happens the other way around, so we can use `:nth-last-child` with the same principle:

```css
li:nth-last-child(-n + 2 of *:has(~ .el)) { background: yellow; }
```

PS: As [CSS magician Roman points out](https://blog.kizu.dev/recent-css-bookmarks-018/#:~:text=I%C2%A0disagree%20with%20the%20title), we could benefit from a true `:nth-sibling` selector (there’s a [CSSWG issue](https://github.com/w3c/csswg-drafts/issues/3813)); my post title would be better worded as "No need… for my specific use-case!" but I always welcome more superpowers in CSS!