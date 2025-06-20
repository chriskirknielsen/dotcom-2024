---
title: VisuBezier
summary: A VS Code extension to preview CSS timing functions
customMetaImage: visubezier-cover.png
externalUrl: https://marketplace.visualstudio.com/items?itemName=chriskirknielsen.visubezier
date: 2018-09-03
projectButtonLabel: Get the extension
projectImportance: 2
projectOrder: 2
---

After years of using Notepad++, I landed on using Brackets, a code editor by Adobe. It was pretty simple but had some nice things like an [easing curve editor](./brackets-curve-editor.png). When the VS Code wave hit me, I was left missing such a feature, so I made my own extension to preview what CSS timing functions look like.
{{ set imageUrl = "./visubezier-preview.gif" |> toRoot }}
{{ image imageUrl, "Hovering a CSS timing function in VS Code reveals a little popover with a preview of the animation and the graph of the easing curve.", "", { width: 540, height: 250 } }}

It is held together by duct tape but it works! All this despite being in TypeScript, which I do not use anywhere else. I like [types, to an extent](/blog/fine-types-arent-the-worst/), but this is a step too far for me.

Do note that is only offers a preview of the animation and the resulting easing curve — no editing as of yet. One day, I’ll dig into the core of VS Code and figure out how to replicate, within VisuBezier, the Brackets feature, or something like what you see on the excellent [cubic-bezier.com](https://cubic-bezier.com) by Lea Verou. But until that time comes, this will have to do. And if you use VS Code, please give it a try, I’d love some feedback!
