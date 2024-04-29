---
title: Colophon
summary: "How did this get here?"
permalink: '/colophon/'
---

## Tech Stack

### Build
This site is built with [Eleventy](https://www.11ty.dev/), a simple static site generator that does a lot. I've got a pre-build step to process my design tokens, bundle my CSS partials with [LightningCSS](https://lightningcss.dev/) (no Sass!), and minify JS with [ESBuild](https://esbuild.github.io/). Font scales are calculated with [Utopia](https://utopia.fyi/type/calculator/), the base shadow styles are generated via Josh Comeau's [Shadow Palette](https://www.joshwcomeau.com/shadow-palette/), and the bouncy theme menu opening animation is built via Jake Archibald's [Linear Easing Generator](https://linear-easing-generator.netlify.app/). Outside the build, I use [SVGOMG](https://jakearchibald.github.io/svgomg/) to optimise SVGs, and [Glyphhanger](https://github.com/zachleat/glyphhanger) to subset my fonts. You can view the source code on GitHub to see how it's all set up. I only ask that you don't steal my code and slap your own name on it.

### Hosting & Domain
The hosting is provided by [Netlify](http://netlify.com/) and the domain is registered with [Namecheap](https://www.namecheap.com), though I'm thinking of switching to something else next time renewal rolls around!

### Synthesizer
The synth on the [About page](/about/) is based on [Bret Cameron's tutorial](https://css-tricks.com/how-to-code-a-playable-synth-keyboard/), and extended with envelope shaping and lowpass filtering by peeking at [Daniel Schulz's code](https://iamschulz.com/building-a-synthesizer-in-javascript/).

### Gaming Library
The [Gaming Library page](/games/library/) is built with a couple of APIs: [Notion's API](https://developers.notion.com/), and [psn-api](https://psn-api.achievements.app/). I first referenced all the games I have in a Notion database, with (too many) columns, including a "Sort Title" to keep everything consistent. It was, at first, just for my own benefit, but given there's an API to query it, I figured I might as well use it (and maybe I like organising things). After going through that ordeal, I used the `psn-api` to get the list of every single game for which I have earned trophies (about 300).

I then manually copied the internal ID for each game from the PSN to the matching row in my Notion database (it took a couple hours, automating it would have taken just as long and not have been 100% reliable as titles sometimes have extra symbols like a trademark sign), which now allows me at build time to query both APIs, and cross-reference the PSN data with the Notion data to populate the dialog that appears when you click a title. I query a tiny slice of data for both: if Notion or the PSN have updates (respectively checking the last update date and latest trophy date against their cached values), I can hit the APIs and store the results for future builds with [eleventy-fetch](https://www.11ty.dev/docs/plugins/fetch/).

## Themes
My website has distinct themes with distinct typefaces (some paid, some free) and visuals, making it, in effect, my very own [CSS Zen Garden](https://csszengarden.com/). You'll find some more details below for each theme (the Dusk, Campfire and Cyberpunk themes are remixes of themes from my website's previous version, so they may look familiar), but if you still have questions, please feel free to ask!

First off, the homepage wordmark for my name is a custom edit of the [Sprat typeface](https://www.collletttivo.it/typefaces/sprat) with everything tightened up and minor corrections. When I first saw it, I knew I had to use it: it's got a vibe reminiscent of Stephen King books and other designs using ITC Benguiat (you know, the Stranger Things logo!). The reveal animation is very simple but does the trick and is pretty performant compared to the [last version](/archives/)!

### Dawn
The default Light Mode theme is set in [Canela Bold](https://type.today/en/canela) for headings and overall is aiming for some vintage print design, hence the off-white background and sharp red contrasting headings, going for an old book that's sat in the sun too long kind of feel. (ironically enough, I sampled some colours from a gorgeous [OmniChord OM84](http://www.suzukimusic.co.uk/omnichord-heaven/models/om36-84.html) electronic instrument)

### Vapor
This vaporwave theme tries to stay minimal while being loud with colours. The headings are set in [Xahn Mono Italic](https://fonts.google.com/specimen/Xanh+Mono) with exaggerated tracking, a serif-monospace hybrid that looks lovely.

### Vintage
Who doesn't love some gold-and-burgundy colours? Old school computers and gaming consoles had those vibes going, and the Nintendo Famicom especially… which inspired most of this theme. Using a very Swiss-like typeface for headings aptly named [Switzer](https://www.fontshare.com/fonts/switzer) as the Nintendo font is a little chonky and perhaps copyrighted!

### Quill
This is my peace-and-quiet theme. It uses [Gambarino](https://www.fontshare.com/fonts/gambarino) for headings, reminiscent of Apple's Garamond Condensed, and is very desaturated, nearly black-on-white-but-not-fully. The footer illustrations are from [Hamonshū](https://archive.org/search.php?query=creator%3A%22Mori%2C+Yu%CC%84zan%2C+-1917%22), that I only know of thanks to [Eric Meyer](https://meyerweb.com/), who uses those exquisitely well on his website. I also took a page out of Sara Soueidan's book with the `<hr>` element, so I guess this theme is for homages!

### Dusk
The default Dark Mode theme is set in [MD Nichrome Bold](https://mass-driver.com/typefaces/md-nichrome), which has that sci-fi look I'm after (it look me a while to settle on it after testing several matches!). The neon glow from buttons and the synthwave-y `<hr>` (horizontal rule, horizon… get it?) elements are pretty cool, and the footer just… belongs.

### Cyberpunk
The cyberpunk aesthetic is pretty fascinating, and the game Cyberpunk 2077 made great use of that. So I made great use of that game's interface, reusing the same [Rajdhani](https://fonts.google.com/specimen/Rajdhani) typeface and other visual cues. I drew a little nonsensical circuitboard for the footer, it looks right at home.

### Campfire
I want to be more outdoorsy, but living in a city, this will have to do for now, with a theme heavily inspired by US national parks and more specifically, the art for the Firewatch video game by [Olly Moss](http://ollymoss.com/#/firewatch/). I used the [Chinook](https://fontesk.com/chinook-font/) typeface to get the retro vibe I was after, and made a vector landscape of Mont Blanc, the mountain peak close to my hometown of Lyon, in France. ([Alistair](https://alistairshepherd.uk/) did this too, but like, way better)

### Director
If you've every played Control, this one will seem familiar. It draws from the game's look and feel (brutalist with hints of colour), and the inverted pyramids. The headings are set in [TeX Gyre Adventor](https://www.fontsquirrel.com/fonts/tex-gyre-adventor), a close match to the original ITC Avant-Garde Gothic used in the game.

Thank you so much for stopping by!