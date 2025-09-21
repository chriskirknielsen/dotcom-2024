---
title: Taking VentoJS for a spin in Eleventy
summary: "There’s a new kid on the templating block."
tags: [javascript, eleventy, vento]
toc: true
templateEngineOverride: md # Ensure the Vento/Nunjucks isn't processed
layout: 'post.vto'
time: 03:51:00
updated: 2025-04-28
---

In a recent rebuild for another blog of mine, where I switched from Hugo to Eleventy, I decided to give [VentoJS](https://vento.js.org/) a try, which is the new kid on the block, as far as templating languages go. There are [IDE integrations](https://vento.js.org/editor-integrations/) that make it feel right at home in VS Code (for me), and an [Eleventy plugin](https://github.com/noelforte/eleventy-plugin-vento) to make it painless to start using with my favourite static site generator. Thanks to both Óscar Otero for making Vento, and Noel Forte for the Eleventy plugin!

Vento might seem like a variation on the “JavaScript framework of the week” meme, but I assure you it packs a punch!

Vento draws inspiration from Nunjucks, Liquid, Eta, and Mustache. I’ve personally used Nunjucks a lot (on this website!) and really like it, but it has issues. I’ve also used Liquid on Shopify stores and on the first version of my website, and it has a couple niceties, but I usually prefer Nunjucks. I had never heard of Eta, and never used Mustache (but what a lovely name given the syntax!).

Óscar lists some of the issues they had with all those languages, such as:

- the lack of maintenance
- the sometimes awkward delimiters (`{%` and `<%`)
- the need to unescape every output in Nunjucks with the `safe` filter
- the difficulty to work with asynchronous data
- the inability to call functions and/or awkward filter usage

As a Nunjucks user myself, I can agree to lots of this. I believe a semi-official v4 is in the works for Nunjucks, but that’s not quite ready, so we’re stuck with the current version. I also frequently type the delimiters incorrectly, which is not a bit deal, but still annoying. `safe` is great in principle but when I’m building my own site, I trust my output, so it’s one step I’d like to avoid for sure. And finally, yeah, with async data and filters, it can get messy!

After the rebuild, here are my thoughts on Vento — please keep in mind this is presented through the lens of an Eleventy build via Noel’s plugin, so there may be some not-purely-Vento things. But one thing that is certain is that I will be comparing this a lot to Nunjucks — sorry in advance, it’s my baseline for templating!

## Doubly curly

The double curly braces used for everything is a nice simplification, as I have frequently typed `%{ if ...` or `{5 if ...` if I release <kbd>Shift</kbd> too early. It does make it more ambiguous if you have a variable and a filter/shortcode with the same name, but I’d argue you run into the same problem in regular JS, so it’s not a major issue, and if anything, it might force you to be more expressive with your naming. It hasn’t caused any issues for me.

## Pipe operator and filters

The filter pipe operator `|>` is nice, though coming from Nunjucks I did use `|` more than once before realising why the template wasn’t building, but I do like the aesthetics of it, it feels expressive. It is also a [proposed JavaScript feature](https://github.com/tc39/proposal-pipeline-operator) but it’s not there yet.

More importantly, the ability to write actual JS is a gamechanger — no need to create new filters or whatnot: it can all be executed right there! You can use filters, inline JS, or mix-and-match, so for example this is valid: `{{ posts |> getAuthors |> sort((a, b) => a.localeCompare(b)) |> join(', ') }}`. I like that freedom because that means a special operation I only plan on using once can be declared in-context, instead of creating a global filter (which is far from being an actual problem, but still nice to have a choice). Nunjucks does offer *some* JavaScript syntax here and there but it’s never guaranteed it’ll work, whereas Vento embraces it fully. I guess I like sprinkling JavaScript into my templates in a way — I don’t mind using other syntaxes but as a front-end developer, I use JS a lot, so not needing that “context switching” is nice.

One extra nice thing is that you can pipe any content, so if you wanted to write a bit of Markdown, you could use `{{ echo |> md }}Now *this* is **neat**!{{ /echo }}` (you’d need to define a `md` filter, though!), or even more wild, a layout or an include, but let’s talk about those.

## Powerful includes

Includes are super practical. The plugin for Eleventy has an option to set your include path, by the way! You can include a file like `{{ include "my/nice/component.vto" }}` but what if you wanted to include a Markdown file? Not a problem: `{{ include "my/sweet/content.md" |> md }}`. Another thing I miss from Liquid that [Nunjucks really needs](https://github.com/mozilla/nunjucks/issues/539), is context! With Vento you can pass the context as a second argument: `{{ include "my/cool/paginator.vto" { pagination } }}` — just like that.

## With some sugar

One feature I like from JS is trailing commas. It lets you rearrange objects pretty easily, so I aim to always add them (if Prettier doesn’t already!). Nunjucks will tell you to take a hike if you use them (though hikes are nice), but Vento’s happy to have them. Another cool thing? That last pagination example didn’t say `{ pagination: pagination }` because in JavaScript, you can omit the object value if its key matches an existing variable (I worded that poorly but you get it, right?), that makes it slightly more readable, though I don’t mind the verbosity, to be honest. Oh and another thing: ternaries! Nunjucks kinda has it with `trueValue if trueCondition else falseValue` but I like the expressive and succinct JS ternaries of `trueCondition ? trueValue : falseValue`. Vento’s fine with that, too. Speaking of conditions: `||` and `&&` are welcome!

I also have to say how nice it is to use template literals. ``{{ set permalink = `/tags/${tag}/page/${p}/index.html` }}`` instead of `{% set permalink = '/tags/'+tag+'/page/'+p+'/index.html' %}` is just such a small yet incredible difference. I may be repeating myself here, but using a familiar syntax from JS just makes it feel cleaner (though I am fully aware the Nunjucks version shown here is valid JS as well, it’s just not as _nice_).

You can also run literal JavaScript with the `{{> ... }}` tag, should you need it. And `await` is allowed!

## Layouts and functions

Layouts are kind of like Nunjucks’ `{% extends ... %}` but they offer more control in my eyes, as you can pass up data from the content to the layout, the same way you do as includes. There’s one particular issue I have in my current website with that which would be fixed with Vento’s approach so… Oh no, I am talking myself into a full refactor, aren’t I?

If `{{ layout }}` is `{% extends %}`, then `{{ function }}` is `{% macro %}` (though I haven’t used a whole lot of macros in Nunjucks, so I may be off, here). With functions, you can write reusable bits of code, and they can be `export`-ed then `import`-ed in another template, it’s really nice how flexible Vento is!

## The rough edges

**Update: _Good news everyone!_ See the updates at the end of this section.**

I’ve sung praises, I know, but it’s not *perfect*. I ran into issues that may be more related to the Eleventy plugin that Vento itself, but I think it is a problem with the templating engine: error reporting is sometimes opaque. It won’t always tell you what’s wrong, and might point at something unhelpful as the error, when it is actually somewhere else. This requires you to be a little more diligent about what you write, which can be difficult when you’re converting code from one templating language to another. [It’s acknowledged by both Óscar and Noel in this thread by (11ty superuser) uncenter](https://github.com/ventojs/vento/issues/85), so it’s at least on their minds, which is nice to see, but it’s hard to address.

On my other blog, I migrated from Hugo, which isn’t too far off from either Nunjucks or Vento, but I missed a `| filterName` that needed to be `|> filterName` a couple of times, and the error doesn’t point at that directly (which may be due to the fact that `|` is valid JavaScript as a [bitwise OR operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR)?).

The other trouble I ran into was a nested shortcode scenario: I have a shortcode for displaying images, and a *paired* shortcode for creating a gallery (a glorified `display: flex` wrapper). However, no matter what I tried, the closing tag on my gallery shortcode consistently threw an error which, as you can see, is not very helpful:

```
[11ty] Problem writing Eleventy templates:
[11ty] 1. Having trouble rendering vto template ./src/content/posts/some-cool-post.md (via TemplateContentRenderError)
some-cool-post.md:32:1
[11ty] {{ /gallery }} (via TemplateError)
[11ty] Original error stack trace: TemplateError: Error in template src/content/posts/some-cool-post.md:32:1
[11ty] {{ /gallery }}
```

Modifying the Eleventy plugin to log errors before throwing them helped me discover the engine thinks this is an incomplete regular expression — well, dang.

```
[meriyah] [138:22-138:46]: Unterminated regular expression while parsing compiled template function:`
138 __exports.content += (/gallery) ?? "";
```

The last thing that sucks is specifically for the Eleventy plugin (I think): if I try to update certain global files such as `.eleventy.js`, the include path seems to be re-parsed incorrectly, so the first build (while in server mode, locally) will work fine (which is nice for deploys, too), but subsequent builds append the original folder so it looks for `src` twice: `src/src/_includes/parts/paginator.vto` — weird!

```
[11ty] File changed: .eleventy.js
src/content/pages/index.vto undefined 63 [NotFound [Error]: ENOENT: no such file or directory, open 'src/src/_includes/parts/paginator.vto'] {
	code: 'ENOENT'
}
[11ty] Problem writing Eleventy templates:
[11ty] 1. Having trouble rendering vto template ./src/content/pages/index.vto (via TemplateContentRenderError)
[11ty] 2. Error in template src/content/pages/index.vto:1:64
[11ty] <empty file> (via TemplateError)
[11ty] Original error stack trace: TemplateError: Error in template src/content/pages/index.vto:1:64
```

I haven’t figured out exactly why these problems occur, but I will report them on GitHub once I create a repo with a test case, I promise!

🚨 **Update #1:** I filed an [issue for the first shortcode bug](https://github.com/ventojs/vento/issues/103) on Vento's repo, and another [issue for the second bug](https://github.com/noelforte/eleventy-plugin-vento/issues/216) on the eleventy-plugin-vento repo.

🚨 **Update #2:** The shortcode issue actually stemmed from the plugin and has been fixed, with both Óscar and Noel taking a look. The second bug was seemingly due to a bug in Eleventy itself, and Noel helped me figure out what was going on! I guess I now have no excuse not to refactor this site… Cherry on top: Noel found out that error reporting gets way better in Eleventy `3.1.0-beta.1`, should that influence your decision (I was running 3.0.0 stable).

## A bright future
While the issues are frustrating, I still think there’s a bright future ahead for Vento. It is packed with features and seems like it has it all, while being actively maintained — it’s quite impressive. Thanks again to Óscar for doing something about the frustrations of modern templating languages, and to Noel for making it super accessible to Eleventy users!

I’d recommend you read through the [syntax on the Vento documentation](https://vento.js.org/syntax/): it is relatively short but if you’re somewhat familiar with JS, it’ll feel very intuitive.

I hope this little overview is at least making you consider testing it out — I don’t have a stake in this, but the more of us use it, the more likely it will improve.

Now to find some time between doomscrolling and voidscreaming to refactor this website… maybe.