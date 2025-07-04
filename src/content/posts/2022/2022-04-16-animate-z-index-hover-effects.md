---
slug: animate-z-index-hover-effects
title: Animate your z-index for cleaner hover effects
summary: Clean up overlap animations on hovered elements.
date: 2022-04-16
tags:
    - css
    - quick-tip
    - z-index
---

I wanted to share a quick tip I’ve been using for a while — it’s nothing new but hey I felt like writing about it!

When you’ve got a component with several items that are snuggling up next to each other, like a grid of tiles, and you have a hover effect where an item grows, you might run into an issue where an item isn’t “above” its next siblings.

You might think “I’ll just add `z-index: 1`”, and you’d be quite right, but you might see that it kind of jumps layers when switching your hover from on element to another.

To fix this, you can transition your `z-index` value. Since it’s a number, you can definitely animate it (though note that only integers are valid!).

To me, animating from `1` to `10` is reasonable, as it gives the value 10 discrete possible steps, (and I’ve noticed some weird “collisions” when only using `1` and `2`), meaning your “shift” should happen when items hit the mid-point value, i.e.: `5`. Having additional steps _might_ also make more sense if you are using custom easing functions that might not be equivalent on entry and exit.

In most cases, there will be some collision at that mid-point between two neighbouring elements since they are taking more space than their dedicated tile, but depending on your expansion style and transition speed, users should be fooled into thinking the layers are moving correctly.

Finally, here’s a little demo to show you the end result:
{{ codepen "https://codepen.io/chriskirknielsen/pen/zYpmzgj/" }}

{{ callout }} Here, I am using a pseudo-element behind the tile that expands via `clip-path` (this allows to have an absolute "growth" size), but this idea can be applied to a tile that grows with something like `transform: scale(1.1)` as well.{{ /callout }}

This demo is pretty bare-bones; there are accessibility consideration like reduced motion you might want to take into account on a real project!
