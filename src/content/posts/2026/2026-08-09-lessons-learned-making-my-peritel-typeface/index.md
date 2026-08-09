---
title: "Lessons Learned Making my Peritel Typeface"
summary: "The why and the how of my latest font project."
tags: ['font']
time: '00:15:00'
toc: true
---
{{ set themeCta }}{{ if !metadata.nakedJs }}{{ component 'cta', {
        type: 'button',
        label: `Vintage theme`,
        ctaAttr: `data-theme-set="vintage"`,
        ctaClass: 'button hide-when-nojs',
        icon: `theme-vintage`,
        inline: true,
    }
}}<span class="hide-when-js">Vintage theme</span>{{ else }}Vintage theme{{ /if }}{{ /set }}

Being unsatisfied with the heading typeface used on my {{ themeCta |> trim }}, I set out to find the perfect typeface encapsulating the ‘80s and ‘90s, especially computer (entertainment) systems, but there was always something that fell short: boring `s`, ugly `r`, or way-too-sharp angles. After looking at more fonts than I could count (I seriously had dreams about fonts for a couple days), I decided I would make my own, from scratch. I’ve made a few (inspired) [fonts](/fonts/) before, *how hard could it be?*

{{ callout }}I will refer to a typeface as a font interchangeably. I *know* this is technically not the same, but please, there are other gardens to tend to.{{ /callout }}

A nice and gentle way to get the right feel for a font is to create some main characters* which inform the entire set’s angles, line thickness, and curves. For a Latin alphabet, starting with `SOAP` is helpful to get all those details in place. For lowercase letters, you need a few more depending on the type* of work you’re aiming for, but in my case*, a few letters like `new pals` got me a good baseline* to expand upon.
_\* these are all typography puns and I will not apologise._

{{ set imageUrl = './notepad.jpg' |> toRoot }}
{{ image imageUrl, "A semi-blurry black and white photo of a page in my notepad, scribbled with a bunch of different letters and symbols.", "I spent some time drawing sketches on paper, which I think is a good way to try out a few ideas instead of staying stuck in a rigid framework for every line and curve", { ratio: "932/1024" } }}

## A few tips

### Repeat strain injury

Most important point in this post: RSI comes at you fast. Don’t design a font on your laptop while sitting on the couch, **trust me** (don’t ask how I know). I’ve done it before when making [Ottselesque](/fonts/ottselesque), and recognised the signs right away. I dislike being at my work-from-home desk to do non-work things (well, arguably this is work… “not my day job”, let’s say), but this was necessary to have better posture and not have a wrist making micro movements while at an angle every four milliseconds. If you’re making a typeface: sit down at a desk, work ergonomically.

### Get in the groove

I built my glyphs in Adobe Illustrator, but I’m sure Inkscape is fine as well, or you could use Figma (not recommended though) or Sketch (I’ve built a font with it before, it was… an experience), or straight-up in a typeface application like Glyphs or FontForge, but I have my idiosyncrasies with Illustrator that make it my weapon of choice. Whatever floats your boat, hypes your type, or graces your fontface!

One thing I can also recommend is that you shouldn’t get too stuck in the grid you set up. Have some rules like same ascender/descender/capital/x-height throughout, because consistency is nice and make for a coherent result, but not every angle or curve needs to be exactly the same. While it can definitely be beneficial to some projects, opening myself up to whatever felt natural was better and more organic, despite the geometric basis.

### Tracking and Kerning

Secondly: remember to kern only when you have adjusted the tracking for each glyph, to reduce the amount of work needed on the kerning bit. Kerning too early will result in repeated work, which… I know nothing about.

Okay, *fine*, that was a lie: I kerned everything, then realised it was all *way* too tight, so I cleared every single glyph’s tracking *and* kerning information, and started over, which was humbling but very necessary. The `VA` pair needs to be tight, but not so much that you could barely see the space on smaller sizes… One other thing that made this restart painfully obvious, was that I started kerning the whitespace character. I don’t know the golden rules of typography, but this seemed like a *kern smell*. So take a step back if you’re making a font, you might just notice that things need to breathe!

### Pen and paper

Also: use paper! It is not only very fun to doodle on paper, but you might discover a different letter shape that would wouldn’t have when simply using a mouse on a computer screen. Plus it’s a convenient place to leave a little note to yourself like “do you really need to create the full Greek alphabet?”. As somebody who does not speak or read Greek, I didn’t feel comfortable just cranking out 48 characters that might not look correct to a native reader. I do know Pi, Omega, and a few others well enough to get those in there, though!

### App-specific tips

- In Illustrator, despite setting a perfect ascender-to-descender block of 1,000 points, when pasted into Glyphs, it would show up as 100 points tall. So I had to scale every shape by 1,000%, copy it, and then it would paste at the right scale in Glyphs. Might just be a me problem, though.
- In Glyphs, you can reuse spacing and kerning from other characters or groups — use the living hell out of it, it saves a lot of time. Pretty sure any typeface software worth its salt will have this, too. So my `U` and `l` have the same left-side kerning group, for example, and my `W` is a 1:1 copy of my `V`. Just double-check you’re not grouping things that are a little off, like `C` and `G` are very similar, but the right sides will not be 1:1 matches against a hyphen, for example.
- Glyphs lets you copy letters, like “Sum” (the math symbol) and “Epsilon” (the Greek letter) so you don’t need to create it twice (unless you want to). A similar story goes for the diacritics. You don’t need to create `e` and `é` separately, just `e` and `´`, and it will combine them for you (I have a link on how to do that in the resources!). But be sure to check diacritics don’t get in the way: `Te` and `Té` can need different kerning values, for example.
- Glyphs Mini exports all your glyphs, but does not “attach” the stylistic alternates in the exported font features (OTF and WOFF2). But in FontForge, you can! Open out the exported OTF in FontForge, then you can manually implement your alternates in Element → Font Info… → Lookups → GSUB tab. Click “Add Lookup”, give it a type of “Single Substitution”, assign it a feature like `ss01` and give it a name. Then you can press “Add Subtable” and pass in the substitutions, like in my case `a` → `a.ss01` (and every accented variant). You can then name those lookups in the “StyleSet Names” menu, like “ss01 → Single-Storey a”. Generate your font, and you’re good to go. (note that the flagship Glyphs app does handle all this by default!)

## A few notes

The name comes from the very popular SCART connector that I used for most of my childhood, growing up in France, called the Péritel standard. I was initially set on calling this Cathode due to the CRT displays you’d use for these old-school computers and consoles, but found out [such a font already exists](https://www.t26.com/fonts/568-Cathode), and looks the part, too!

I spend a long time making the [specimen page](/fonts/peritel/) for this font as well. It was a labour of love, and while imperfect I’m sure, it captures what I was after. I’ve made a few fonts before, all with their own dedicated specimen page, but they were all templated. This one is, too, but I went way off-script, creating a bunch of custom controls and showcase section, not to mention going absolutely wild with the CSS. Safari made it… interesting, but I had a few tricks up my sleeve to get it to cooperate.

Also: this font is not either in italics or with different weights because that becomes a whole new order of magnitude in terms of the number of hours I’d need to sink into this. I’d love to, but as this is just a project on the side, I cannot justify the time spent on it.

## A few tools

Here are all the tools I used to make this font

- Adobe Illustrator: I have access to the Creative Suite through my job — nothing wrong with using Inkscape though. This is how I built everything, with a file that has all the constructed parts of each glyphs, and a merged, clean, single-path version as well for importing into Glyphs.
- [Glyphs Mini](https://glyphsapp.com/buy): I’ve used Glyphs before, the flagship one, to build Ottselesque, but within 30 days of the trial period, as I couldn’t justify a $300+ expense for a free font. I had also used up the 30-day trial of Glyphs Mini for RG Dimensions, so I decided to bite the bullet and for $50, it’s well worth it. [Mac only](https://glyphsapp.com/learn/why-there-is-no-windows-version-of-glyphs), though!
- [FontForge](https://fontforge.org/): this is an open-source, free application that came in very handy once I realised Glyphs Mini didn’t export my OpenType features. It’s a little more clunky UI but has all the features you’d expect. I made a donation to show my appreciation as it saved me from releasing a less comprehensive font.
- [Wakamaifondue](https://wakamaifondue.com/): this amazing web site with an amazing name lets you drop a font file (OTF, WOFF, whatever) and gives you a bunch of metadata, lets you test it, and outlines every feature available — it even spits out fully featured CSS! This is when I realised Glyphs Mini didn’t export my stylistic sets, and also where I realised my kerning was totally out of whack. [Roel](https://pixelambacht.nl/) doesn’t take donations so please be sure to use this wonderful tool if you are either making a font, or just bought a new font (like, oh I don’t know, Peritel?) to see what it’s capable of, and maybe send a few nice words to say how it’s helped you.

## A few pangrams I omitted

- Lemon & kumquat juice brings extra zesty flavors to a hummus dip bowl.
- For a zebra is calm and quiet when lynx or jackal grips are avoided.

## A few resources

- [Glyphs on diacritics](https://glyphsapp.com/learn/diacritics)
- [Glyphs on re-using characters and parts (like diacritics)](https://handbook.glyphsapp.com/components/)
- [Glyphs on stylistic sets (includes how to add diacritics to a variant)](https://glyphsapp.com/learn/stylistic-sets)
- [The random forum post that saved my stylistic sets in FontForge](https://typedrawers.com/discussion/3648/fontforge-how-do-i-create-stylistic-set)
- [The named Unicode list I used to name all glyphs in my specimen page](https://unicode.org/Public/UNIDATA/UnicodeData.txt)
- [A handful of tools to create pangrams, check kerning pairs, and get the unicode names](https://codepen.io/editor/chriskirknielsen/pen/019fbe20-33eb-7d7a-a140-c4b981d45430)

And that’s the tale of Peritel. You can check out the [specimen page](/fonts/peritel/), or [buy Peritel for $5](https://buymeacoffee.com/chriskirknielsen/e/562657) instead of $8. That's right: as a reader of this here blog, you get a discount with code `YAYFONTS`. Thanks for reading all what I typed about my typeface. And that's enough font puns for now…

{{ if !metadata.nakedJs }}
<script>
document.addEventListener('click', (e) => {
	const inlineSetter = e.target.closest('main [data-theme-set]');
	if (!inlineSetter) { return; }
	const theme = inlineSetter.getAttribute('data-theme-set')
	const picker = document.querySelector('theme-picker');
	picker.querySelector(`[data-theme-set="${theme}"]`).click();
});
</script>
{{ /if }}