---
title: "Some thoughts on the item-flow proposal"
summary: 'Solving for masonry could have beneficial side effects for other layout methods.'
tags: [css]
toc: true
---

There’s a brand-new proposal to solve for masonry layout in CSS from Webkit. If you haven’t already, you should definitely read it: [Item Flow, Part 1: A new unified concept for layout](https://webkit.org/blog/16587/item-flow-part-1-a-new-unified-concept-for-layout/).

I really like this idea! My thoughts were too long for a post on Mastodon so… to the blog it goes!

## Direction 

```css
item-direction: row | column | row-reverse | column-reverse
```

This one seems very straightforward, no notes.

## Wrap

```css
item-wrap: auto | nowrap | wrap | normal | reverse | wrap-reverse
```

I do like the `nowrap` addition to grid, despite not liking how it looks… but that’s how it is for `white-space` and flexbox — [that ship has sailed](https://wiki.csswg.org/ideas/mistakes#:~:text=nowrap).

## Pack

```css
item-pack: normal | dense | collapse | balance
```

While I presume this is mainly to "solve" for masonry, I have to say that flexbox with `item-pack: balance` would be very, very nice. Currently, if we want to balance non-text items, for example a list of icons, we need to use a non-flexbox approach such as:

```css
.icon-list {
	display: block;
	text-align: center;
	text-wrap: balance;
}
.icon-item { display: inline-block; }
```

Being able to do this in flex would let us keep gaps and likely space things out a little better, too!

If I am correctly understanding the table at the end of the post, `balance dense` would also be possible (the single vs double pipes are confusing for non-spec speakers like me). In my mind, they are kind of at odds, but also would pair up very nicely.

Speaking of `item-pack: dense`… cramming an extra item in flexbox, if it respects flex-shrink, seems perfectly reasonable, though I think I like the alternative better, moving items into more appropriate spaces would likely avoid extra squished items. The only issue I take with that second option is the order of items. However, given that is a major issue with masonry in general, I would imagine that a solution for `read-order` (or whatever it is named) would land alongside `item-pack` to alleviate the issue altogether.

## Slack
```css
item-slack: normal | <length-percentage> | infinite
```

In the context of flexbox cramming (gotta say, "to cram" sounds like bad practice haha), I think it’s a good idea to give authors control over how much the limit is. In the masonry context… now that’s powerful. I like that idea a whole lot, and given it’s opt-in, you get very predictable behaviour out of the box, and then you can adjust if your layout calls for it. I would probably just repeat the `gap` value — maybe that could be an `auto` value?

## Naming opinions

{{ callout }}I know these are all temporary names, but I’ll still offer some thoughts on the current proposed names, just for argument’s sake.{{ /callout }}

### The item prefix
I think `item-*` is a bit weird, given we have `align-items` and `justify-items` in plural form. Since this is a control given to the parent, it would make more sense to have `items-flow`, but I may be looking at this from the wrong angle… maybe it’s the flow of the parent item, so it is better as a singular noun? I guess that goes to show how hard it is to name things!

With that said, let’s take a look at the other side of the hyphen…

### The direction and wrap suffixes
I think `item-direction` and `item-wrap` are great as-is: reusing existing concepts, let’s not mess with that.

### The pack suffix
`item-pack` isn’t too bad, though I would have been fine with `item-fill(-mode?)` (though I could see confusion with `animation-fill-mode`…). I thought of `item-arrange` or maybe even `item-distribution` (or `distribute`) but that’s a mouthful, not quite as precise (feels more like it describes `justify-content`), and "collapsed distribution" (versus "collapsed packing") sounds more like a commentary on a post-apocalyptic economy than a layout method.

### The slack suffix
`item-slack` is probably the weakest one, but [there’s an issue dedicated to finding it a better name](https://github.com/w3c/csswg-drafts/issues/10884), which is nice. For non-native English speakers, "slack" is not clear, despite being a great candidate for this purpose, I will admit. I grew up in France and can’t remember ever coming across that word in my English classes, I suspect many will be in a similar situation, perhaps more so thinking of the popular professional communications app for their team.

The alternatives laid out seem like a better fit. Despite being a little longer, "tolerance" maps to a physical concept used in manufacturing, basically the margin for error, like you’d see for fitting two pieces together. I do also like "threshold" (how very pleasant to say) but that’s a five-dollar word some folks might struggle with. As for "strictness", "adjust", and "sensitivity", they all carry the right _concept_, but ironically enough, feel too loose to map directly onto that property’s definition.

Do I have ideas? Yes, but given it’s `item-flex` which would be extremely confusing, and `item-yield` which is not friendly either, I think I’d rather let smarter people think about this.

### The flow suffix
I think this is an elegant way to unite all these concepts under a single term, and matches the existing conventions of flex and grid, so I take no issue here.

## The Overall Plan

This helpful matrix from the original article is an image, so… _tadaaa_ (hopefully I didn’t muck up semantics, but the `tfoot` is probably not super appropriate):

{{ codepen "https://codepen.io/chriskirknielsen/pen/YPzJLOx", "result", 610 }}

## More reading
- [Item Flow, Part 1: A new unified concept for layout](https://webkit.org/blog/16587/item-flow-part-1-a-new-unified-concept-for-layout/)
- [Item Flow – Part 2: next steps for Masonry](https://webkit.org/blog/17219/item-flow-part-2-next-steps-for-masonry/)
- [Robin Rendle’s thoughts on their blog](https://robinrendle.com/notes/item-flow/)
- [Andy Bell’s thoughts via Piccalilli](https://piccalil.li/links/item-flow-part-1-a-new-unified-concept-for-layout/)
- [Ahmad Shadeed’s (interactive!) notes on their blog](https://ishadeed.com/article/item-flow/)
- [Eric Meyer’s thoughts on their website](https://meyerweb.com/eric/thoughts/2025/05/21/masonry-item-flow-and-gulp/)