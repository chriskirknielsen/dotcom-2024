---
title: "Select an element which doesn’t descend from another in CSS"
summary: 'Avoid false positives when using :not() to exclude ancestors from a scope.'
tags:
    - css
    - quick-tip
updated: 2023-11-16
ogBackground: "./is-this-scope.jpg"
---

**Update:** This article initially proposed `a:not(.archived a)`, but [Šime Vidas suggested](https://mastodon.social/@simevidas/111294439227937167) `a:not(.archived *)` which avoids repeating the target. This has been adjusted throughout the article. Thanks, Šime!

<hr>

{{ callout "TL;DR", "", { mode: "block" } }}
**Situation:** we want to select all links that aren’t inside an `.archived` element.

**Don’t do this:** `:not(.archived) a`

**Instead, do:** `a:not(.archived *)`
{{ /callout }}

I ran into this issue the other day and was talking with my coworker Joel about this. He reminded me of a neat trick that can come in handy when you’re working with some HTML you don’t control (in our case, a library that loves wrappin’ in `<div>`s!). Since I am likely to forget, I am blogging for myself, and maybe you’ll get something out of it too, dear reader!

If we want to select a link (`<a>` element) that is not a direct descendant of an element with the class `.archived`, our first instinct might be to do `:not(.archived) > a`. If our DOM looks like this, we’ll be able to easily distinguish between archived and non-archived blocks:

```html
<article class="archived">
	<a href="#">Link</a>
</article>
```

However, if we do not know how many elements sit between our negated selector ``.archived`` and our target element `a`, then we’re out of luck if we try to use `:not(.archived) a`, as every `a` will match. Consider the following markup:

```html
<body>
	...
		<article class="archived">
			<p>
				<a href="#">Link</a>
			</p>
		</article>
```

With `:not(.archived) a`, then `<body>` matches `:not(.archived)`, and so does `<p>`, resulting in our `<a>` element being matched. Not what we wanted!

But we know that we _can_ find any element inside of an archived element with `.archived *`, so if we combine that with a negation, we can use `a:not(.archived *)`, which means “select every `a` which is not (an element which is a descendant of `.archived`)”.

With that little tweak, we can now safely use our CSS selector to find links outside of archived blocks. Neat!

Note that if you’re in control of the markup, this is pretty unlikely to be all that useful, but if you’re imposed a library that just hands out `<div>`s like candy on Halloween, then it might be useful! In my case, we were looking for interactive elements in automated browser tests that were not inside a disabled component, but those could wildly vary in terms of markup. So `button:not([aria-disabled=true] *)` resolved it.

{{ set imageUrl = "./is-this-scope.jpg" |> toRoot }}
{{ image imageUrl, "A variation of the meme where an anime character looks at a butterfly and says 'Is this a pigeon?'. This one is captioned 'Is this at-scope?' with the text ':not()' superimposed on the butterfly.", null, { ratio: 1200/630 } }}

It kind of looks like "doughnut/donut scoping" when I think about it. If we wanted to do something like this in a card component but not for links inside of the card content, we might do:

```css
/* Using this trick */
.card a:not(.card-content *) {
	color: var(--accent);
}

/* Using CSS Scope */
@scope (.card) to (.card-content) {
	a {
		color: var(--accent);
	}
}
```

Both of these will technically "scope" the selector, however `@scope` has a few more advantages I’d say, namely specificity won’t go out of control as much, the selector has way better legibility (<del>it’s never good to repeat the target element in the same selector!</del> <ins>no longer an issue after Šime’s suggestion</ins>), and [as Miriam points out](https://shoptalkshow.com/591/#t=41:30), nested scopes won’t work correctly with the `:not()` hack, but it’s still cool we can get to similar results for simpler setups with relatively old browser versions!

**Minor update:** I realise Lea Verou thought of this years ago already… because of course Lea did!

{{ remotequote "@LeaVerou", "https://twitter.com/LeaVerou/status/1354760561087676416", "2021-01-28T11:57:42.000Z" }}
TIL that all modern browsers now support complex selectors in :not()! 😍

Test: [https://dabblet.com/gist/e7769cbe23d3670665e97a03fe0622d3](https://dabblet.com/gist/e7769cbe23d3670665e97a03fe0622d3)

So you can do things like:
- .foo :not(.foo .foo *) to match things inside one .foo wrapper but not two 
- .container :not(.content *) to get simple (shallow) “donut scope”
{{ /remotequote }}