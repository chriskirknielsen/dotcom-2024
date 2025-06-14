---
title: Devographics Surveys
summary: Making logos and t-shirt designs to celebrate the web ecosystem for yearly surveys.
customMetaImage: devographics-cover.jpg
externalUrl: https://www.devographics.com/
date: 2024-07-19
projectButtonLabel: Visit site
projectImportance: 3
projectOrder: 8
extraCta: [{ label: 'Get shirts', url: 'https://cottonbureau.com/people/state-of-js' }]
toc: true
---

This project is an ongoing collaboration between myself and Sacha Greif, the maintainer of the various _State of `{web tech}`_ surveys, which is collected under the Devographics project.

For each of these designs, while Sacha reached out for my design skills, he is himself capable and so these logos and shirt designs are collaborative, bouncing ideas of each other, and as such I can't take full credit but will say it is a fun process, from idea to final design. Below you’ll find the various "branding" projects I’ve worked on for the Devographics surveys.

## State of CSS

{{ set cssShirtData = designs |> findBy('slug', 'css-retro-vhs') }}
After seeing my WWW design series, Sacha Greif, maintainer of the State of CSS and JS surveys, reached out to me to design the logo and t-shirt design for the [2021 edition](https://2021.stateofcss.com/en-US/). It took a few weeks but we landed on a pretty solid design, if I do say so myself!

{{ gallery }}
{{ set imageUrl = './soc2021-cover.jpg' |> toRoot }}
{{ image imageUrl, "A logo for the State of CSS, with CSS written in quarter-circles on top of a triple-layered yellow-to-hot pink gradient diamond.", "", { ratio: "600/600", group: true } }}
{{ image '/' + assets.images + '/designs/' + cssShirtData.img, "A rework of the logo for the survey rearranged to look like an old blank VHS tape, on a black t-shirt.", 'Get yours at <a href="'+cssShirtData.links.CottonBureau+'">CottonBureau</a>', { ratio: "600/600", group: true } }}
{{ /gallery }}

I also animated it for the survey landing page, because animations are fun! Click to restart the animation.

{{ codepen "https://codepen.io/chriskirknielsen/pen/ExwgLNO" }}

### The State of Ass

When the survey was first opened, it had been pointed out to us that the logo didn't necessarily read as "CSS"… and while Sacha and I had seen it, we thought "No way anyone will read this as anything but CSS, right?".

We were wrong. So I adjusted the logo, but for your entertainment, here is the logo for… State of Ass:

{{ set imageUrl = "./state-of-ass.jpg" |> toRoot }}
{{ image imageUrl, 'A logo that should read as CSS made of quarter-circles, but the C can be mistaken for a lowercase A, spelling out "ass" instead…', "The State of Ass may be a thing but I am not involved", { width: 1280, height: 640 } }}

## State of JS

{{ set jsShirtData = designs |> findBy('slug', 'js-retro-vhs') }}
Following a pretty successful collaboration on the CSS shirt, Sacha asked me once more if I’d be up to design a VHS-styled logo and shirt, but for the [State of JS](https://2021.stateofjs.com/en-US/) this time around. This one was a little more tricky to nail down as balancing "simple" with "massive ecosystem" is a tall order.

We went through quite a few iterations, especially for the background shape that ended up being this tesseract-looking thing with multiple light sources.

{{ gallery }}
{{ set imageUrl = './soj2021-cover.jpg' |> toRoot }}
{{ image imageUrl, "A logo for the State of JS, with JS written in stacked lines on top of a multi-faceted hexagon with blue, cyan, and pink highlights. Inside of it is another hexagon with three colours covering it fully: yellow, red, and blue.", "", { ratio: "600/600", group: true } }}
{{ image '/' + assets.images + '/designs/' + jsShirtData.img, "A rework of the logo for the survey rearranged to look like an old blank VHS tape, on a black t-shirt.", 'Get yours at <a href="'+jsShirtData.links.CottonBureau+'">CottonBureau</a>', { ratio: "600/600", group: true } }}
{{ /gallery }}

Just like the CSS design, I animated this one for extra fun. Click to restart the animation.

{{ codepen "https://codepen.io/chriskirknielsen/pen/wvPPWKq" }}

I was also quite happy with this detail for the t-shirt, coming up with a symbol for optional chaining, which in JavaScript, lets you access a property if it exists on an object with the syntax, e.g. a `breed` property on a `dog` object: `dog?.breed`.

{{ set imageUrl = "./optional-chaining.jpg" |> toRoot }}
{{ image imageUrl, "A close-up for the Optional Chaining section on the shirt, featuring a chain link, with one of them being a question mark", "", { width: 1280, height: 720 } }}

## State of HTML

{{ set htmlShirtData = designs |> findBy('slug', 'html-retro-vhs') }}
Sacha Greif reached out to me for a new project: the [State of HTML survey](https://2023.stateofhtml.com/en-US/). The work for both the State of CSS and State of JS surveys was, in my eyes, a great collaboration, so we kept it going!

This took a while to nail down, with the chevron-and-slash combo going through a lot of changes, as well as the HTML logo, but I think the final result works nicely.

{{ gallery }}
{{ set imageUrl = './soh2023-cover.jpg' |> toRoot }}
{{ image imageUrl, "A logo for the State of HTML, with HTML written in bright blocky letters, slanted, contained inside a pair of colourful chevrons that go from yellow to orange to midnight purple. In the background, some stylised slashes extend past the chevrons and are filled with a progressive electric green to indigo gradient.", "", { ratio: "600/600", group: true } }}
{{ image '/' + assets.images + '/designs/' + htmlShirtData.img, "A rework of the logo for the survey rearranged to look like an old blank VHS tape, on a black t-shirt.", 'Get yours at <a href="'+htmlShirtData.links.CottonBureau+'">CottonBureau</a>', { ratio: "600/600", group: true } }}
{{ /gallery }}

This logo is also animated, as a treat. Click to restart the animation.

{{ codepen 'https://codepen.io/chriskirknielsen/pen/zYyZzyN' }}

## State of React

{{ set reactShirtData = designs |> findBy('slug', 'react-retro-vhs') }}
We had tried to find time previous years to collaborate on a design for the React survey, and finally got around to it for the [2023 survey](https://2023.stateofreact.com/en-US/). Sacha was more hands-on since I am not knowledgeable at all in React-land. He suggested a different style, this time taking inspiration from anime and science-fiction user interfaces. (below you’ll see the 2024 version instead)

While React is not my area of expertise, I think this looks pretty cool! Sacha set up most of the ideas (and due to my limited Japanese knowledge, the kanji as well), and after I drew custom katakana, he made even cooler ones, which just goes to show how this kind of collaboration can be fruitful!

{{ gallery }}
{{ set imageUrl = './sor2024-cover.jpg' |> toRoot }}
{{ image imageUrl, "A logo for the State of React, with an atom depicted with three rings in the center, framed by a hexagon. Above, the word “React” is written, and below, in Japanese katakana.", "", { ratio: "600/600", group: true } }}
{{ image '/' + assets.images + '/designs/' + reactShirtData.img, "A rework of the logo for the survey rearranged to look like a science-fiction and/or anime interface, on a midnight blue t-shirt.", 'Get yours at <a href="'+reactShirtData.links.CottonBureau+'">CottonBureau</a>', { ratio: "600/600", group: true } }}
{{ /gallery }}

Surprise! It’s animated. Click to restart the animation.

{{ codepen "https://codepen.io/chriskirknielsen/pen/mdNNYKP" }}