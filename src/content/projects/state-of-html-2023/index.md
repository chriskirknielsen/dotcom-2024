---
title: State of HTML
summary: Making a logo and a t-shirt design celebrating HTML in a retro style
customMetaImage: soh2023-cover.jpg
externalUrl: https://2023.stateofhtml.com/en-US/
date: 2024-05-14
projectButtonLabel: View survey
extraCta: [{ label: 'Get shirt', url: 'https://cottonbureau.com/p/8U4SGF/shirt/html-retro-vhs#/20217871/tee-men-standard-tee-vintage-black-tri-blend-m' }]
---

{% set shirtData = designs | find('slug', 'html-retro-vhs') %}
Sacha Greif reached out to me for a new project: the State of HTML survey. The work for both the State of CSS and State of JS surveys was, in my eyes, a great collaboration, so we kept it going!

This took a while to nail down, with the chevron-and-slash combo going through a lot of changes, as well as the HTML logo, but I think the final result works nicely.

{% gallery %}
{% image customMetaImage, "A logo for the State of HTML, with HTML written in bright blocky letters, slanted, contained inside a pair of colourful chevrons that go from yellow to orange to midnight purple. In the background, some stylised slashes extend past the chevrons and are filled with a progressive electric green to indigo gradient.", "", { ratio: "600/600", group: true } %}
{% image '/' + assets.images + '/designs/' + shirtData.slug + '.jpg', "A rework of the logo for the survey rearranged to look like an old blank VHS tape, on a black t-shirt.", 'Get yours at <a href="'+shirtData.links.CottonBureau+'">CottonBureau</a>', { ratio: "600/600", group: true } %}
{% endgallery %}

This logo is also animated, as a treat. Click to restart the animation.

{% codepen 'https://codepen.io/chriskirknielsen/pen/zYyZzyN' %}
