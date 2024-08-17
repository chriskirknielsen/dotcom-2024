const designs = [
	{
		slug: 'vhs-css',
		name: 'Blank VHS CSS',
		description: 'In a world where the web runs on VHS tapes…',
		note: 'For posters, RedBubble or Society6 are recommended',
		img: 'vhs-css.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/t-shirt/Retro-Blank-VHS-CSS-by-ckirknielsen/72710420.6VDG0',
			TeePublic: 'https://www.teepublic.com/t-shirt/19996533-retro-blank-vhs-css?store_id=49603',
			Society6: 'https://society6.com/product/retro-blank-vhs-css_print?sku=s6-21377318p4a1v1',
		},
		tags: ['dev', 'www', 'css', 'vhs', 'retro'],
		date: '2021-03-17',
	},
	{
		slug: 'vhs-html',
		name: 'Blank VHS HTML',
		description: 'In a world where the web runs on VHS tapes…',
		note: 'For posters, RedBubble or Society6 are recommended',
		img: 'vhs-html.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/t-shirt/Retro-Blank-VHS-HTML-by-ckirknielsen/73662806.CW2C9.XYZ',
			TeePublic: 'https://www.teepublic.com/t-shirt/20289562-retro-blank-vhs-html?store_id=49603',
			Society6: 'https://society6.com/product/retro-blank-vhs-html_print?sku=s6-21377261p4a1v1',
		},
		tags: ['dev', 'www', 'html', 'vhs', 'retro'],
		date: '2021-03-17',
	},
	{
		slug: 'vhs-svg',
		name: 'Blank VHS SVG',
		description: 'In a world where the web runs on VHS tapes…',
		note: 'For posters, RedBubble or Society6 are recommended',
		img: 'vhs-svg.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/t-shirt/Retro-Blank-VHS-SVG-by-ckirknielsen/80893683.DYMRA',
			TeePublic: 'https://www.teepublic.com/t-shirt/22687532-retro-blank-vhs-svg?store_id=49603',
			Society6: 'https://society6.com/product/retro-blank-vhs-svg8844315_print?sku=s6-28365206p4a1v1',
		},
		tags: ['dev', 'www', 'svg', 'vhs', 'retro'],
		date: '2021-08-11',
	},
	{
		slug: 'vhs-js',
		name: 'Blank VHS JS',
		description: 'In a world where the web runs on VHS tapes…',
		note: 'For posters, RedBubble or Society6 are recommended',
		img: 'vhs-js.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/t-shirt/Retro-Blank-VHS-JavaScript-ECMAScript-by-ckirknielsen/85189202.CW2C9.XYZ',
			TeePublic: 'https://www.teepublic.com/t-shirt/23606086-retro-blank-vhs-javascript-ecmascript?store_id=49603',
			Society6: 'https://society6.com/product/retro-blank-vhs-javascript-ecmascript_print?sku=s6-21377364p4a1v1',
		},
		tags: ['dev', 'www', 'js', 'vhs', 'retro'],
		date: '2021-08-11',
		variant: ['vhs-js-dark'],
	},
	{
		showInGallery: false,
		slug: 'vhs-js-dark',
		name: 'Blank VHS JS (Dark)',
		description: 'In a world where the web runs on VHS tapes…',
		note: 'For posters, RedBubble or Society6 are recommended',
		img: 'vhs-js-dark.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/t-shirt/Retro-Blank-VHS-JavaScript-ECMAScript-Dark-Variant-by-ckirknielsen/132703092.FB110.XYZ',
			TeePublic: 'https://www.teepublic.com/t-shirt/36698589-retro-blank-vhs-javascript-ecmascript-dark-variant',
		},
		tags: ['dev', 'www', 'js', 'vhs', 'retro'],
		date: '2022-11-20',
		variant: ['vhs-js'],
	},
	{
		slug: 'vhs-a11y',
		name: 'Blank VHS A11Y',
		description: 'In a world where the web runs on VHS tapes…',
		note: 'For posters, RedBubble or Society6 are recommended<br>Thanks to <a href="https://benmyers.dev/">Ben Myers</a> for the idea!',
		img: 'vhs-a11y.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/t-shirt/Retro-Blank-VHS-A11Y-by-ckirknielsen/161318764.CW2C9?asc=u',
			TeePublic: 'https://www.teepublic.com/t-shirt/60553454-retro-blank-vhs-a11y',
			Society6: 'https://society6.com/product/retro-blank-vhs-a11y_print?sku=s6-28365165p4a1v1',
		},
		tags: ['dev', 'www', 'vhs', 'retro'],
		date: '2024-05-18',
	},
	{
		slug: 'vhs-www',
		name: 'Blank VHS WWW',
		description: 'In a world where the web runs on VHS tapes…',
		note: 'For posters, RedBubble or Society6 are recommended',
		img: 'vhs-www.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/t-shirt/Retro-Blank-VHS-WWW-by-ckirknielsen/105322869.DYMRA?asc=u',
			TeePublic: 'https://www.teepublic.com/t-shirt/28723641-retro-blank-vhs-www',
		},
		tags: ['dev', 'www', 'vhs', 'retro'],
		date: '2022-03-20',
	},
	{
		slug: 'retro-css',
		name: 'Retro CSS',
		description: 'A totally tubular t-shirt to show off how rad CSS is!',
		img: 'retro-css.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/t-shirt/Retro-CSS-by-ckirknielsen/58081555.DYMRA',
			TeePublic: 'https://www.teepublic.com/t-shirt/14125152-retro-css?store_id=49603',
			DesignByHumans: 'https://www.designbyhumans.com/shop/t-shirt/men/retro-css/1831571/',
		},
		tags: ['dev', 'css', 'retro'],
		date: '2020-09-17',
	},
	{
		slug: 'css-fact-sheet',
		name: 'CSS Fact Sheet',
		description: "A compact fact sheet for CSS that wouldn't be out of place on a crate in a cyberpunk world…",
		img: 'css-fact-sheet.jpg',
		links: {
			RedBubble: 'https://www.redbubble.com/i/sticker/CSS-Fact-Sheet-by-ckirknielsen/58082119.EJUG5',
			TeePublic: 'https://www.teepublic.com/t-shirt/14123881-css-fact-sheet?store_id=49603',
			DesignByHumans: 'https://www.designbyhumans.com/shop/t-shirt/men/css-fact-sheet/1831576/',
		},
		tags: ['dev', 'css'],
		date: '2020-09-17',
	},
	{
		slug: 'duotype-css',
		name: 'Radical Duotype CSS',
		description: 'Represent CSS with radical double-typography style!',
		img: 'duotype-css.jpg',
		links: {
			RedBubble: 'https://www.redbubble.com/i/sticker/Radical-Duotype-Cascading-Stylesheets-by-ckirknielsen/130796947.QK27K',
			TeePublic: 'https://www.teepublic.com/sticker/36307529-radical-duotype-cascading-stylesheets',
			DesignByHumans: 'https://www.designbyhumans.com/shop/sticker/radical-duotype-cascading-stylesheets/1871221/',
		},
		tags: ['dev', 'css'],
		date: '2022-11-06',
	},
	{
		slug: 'duotype-semantic-markup',
		name: 'Radical Duotype HTML',
		description: 'Represent HTML (not just divs) with radical double-typography style!',
		img: 'duotype-semantic-markup.jpg',
		links: {
			RedBubble: 'https://www.redbubble.com/i/sticker/Radical-Duotype-Semantic-Markup-by-ckirknielsen/130797216.QK27K',
			TeePublic: 'https://www.teepublic.com/sticker/36307530-radical-duotype-semantic-markup',
			DesignByHumans: 'https://www.designbyhumans.com/shop/sticker/radical-duotype-semantic-markup/1871223/',
		},
		tags: ['dev', 'html'],
		date: '2022-11-06',
	},
	{
		slug: 'www-explorer',
		name: 'World Wide Web Explorer',
		description: 'Explore the spaces between what connects us all: the World Wide Web!',
		note: 'For a mug with the design on both sides, use RedBubble or Society6.',
		img: 'www-explorer.png',
		links: {
			TeePublic: 'https://www.teepublic.com/t-shirt/28541207-world-wide-web-explorer',
			RedBubble: 'https://www.redbubble.com/i/t-shirt/World-Wide-Web-Explorer-by-ckirknielsen/104638901.SWO0S?asc=u',
			Society6: 'https://society6.com/product/world-wide-web-explorer_t-shirt?sku=s6-23447756p15a4v84a5v18a11v49',
		},
		tags: ['dev', 'www', 'retro'],
		date: '2022-03-14',
	},
	{
		slug: 'vaporwave-css',
		name: 'Vaporwave CSS',
		description: 'Trying my hand at some aestheticss…',
		img: 'vaporwave-css.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/t-shirt/Vaporwave-CSS-by-ckirknielsen/110853198.Y4WIZ',
			TeePublic: 'https://www.teepublic.com/t-shirt/30315700-vaporwave-css',
			DesignByHumans: 'https://www.designbyhumans.com/shop/t-shirt/men/vaporwave-css/1835097/',
		},
		tags: ['dev', 'css', 'retro'],
		date: '2022-05-15',
	},
	{
		slug: 'control',
		name: 'The Oldest House',
		description:
			'The Oldest House has many dangers/risks. Be sure to alert the sitting/standing Director. Objects of Power are dangerous/aggressive and interacting/talking with one may result in termination/death/punishment.',
		img: 'gameart-control.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/art-print/Control-by-ckirknielsen/106874139.1G4ZT',
		},
		tags: ['games'],
		date: '2021-10-23',
		variant: ['control-service-weapon'],
	},
	{
		slug: 'god-of-war',
		name: 'Lake of Nine',
		description: 'A peaceful moment on the Lake of Nine.',
		img: 'gameart-gow.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/art-print/God-of-War-by-ckirknielsen/106870471.1G4ZT',
		},
		tags: ['games'],
		date: '2021-10-23',
		variant: ['god-of-war-leviathan-axe'],
	},
	{
		slug: 'deathloop',
		name: 'Blackreef',
		description: 'Kill all Visionaries. Break the loop. Easy.',
		img: 'gameart-deathloop.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/art-print/DEATHLOOP-by-ckirknielsen/106881338.1G4ZT',
		},
		tags: ['games'],
		date: '2021-12-31',
		variant: ['deathloop-fourpounder'],
	},
	{
		slug: 'dead-space',
		name: 'USG Ishimura',
		description: 'In space, only Necromorphs can hear you scream.',
		img: 'gameart-deadspace.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/art-print/Dead-Space-by-ckirknielsen/106878842.1G4ZT',
		},
		tags: ['games'],
		date: '2022-01-23',
		variant: ['dead-space-plasma-cutter'],
	},
	{
		slug: 'jak-daxter-powercell-hunters',
		name: 'Powercell Hunters',
		description: 'A design inspired by one of my favourite video games: Jak And Daxter.',
		img: 'powercell-hunters.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/t-shirt/Powercell-Hunters-by-ckirknielsen/84952593.2EZFS',
			TeePublic: 'https://www.teepublic.com/t-shirt/23558909-powercell-hunters',
			DesignByHumans: 'https://www.designbyhumans.com/shop/t-shirt/men/powercell-hunters/1809059/',
		},
		tags: ['games'],
		date: '2021-08-09',
		similar: ['crash-bandicoot-wumpa-hoarder', 'sly-cooper-gentleman-thief'],
	},
	{
		slug: 'crash-bandicoot-wumpa-hoarder',
		name: 'Wumpa Hoarder',
		description: 'A design inspired by the wild, Wumpa-loving bandicoot: Crash Bandicoot!',
		img: 'wumpa-hoarder.png',
		links: {
			// RedBubble: 'https://www.redbubble.com/i/t-shirt/Wumpa-Hoarder-by-ckirknielsen/94462053.4AE2Y',
			TeePublic: 'https://www.teepublic.com/t-shirt/25571868-wumpa-hoarder',
			DesignByHumans: 'https://www.designbyhumans.com/shop/t-shirt/men/wumpa-hoarder/1831579/',
		},
		tags: ['games'],
		date: '2021-11-14',
		similar: ['jak-daxter-powercell-hunters', 'sly-cooper-gentleman-thief'],
	},
	{
		showInGallery: false,
		slug: 'sly-cooper-gentleman-thief',
		name: 'Gentleman Thief',
		description: 'A design inspired by the charismatic thief, who also happens to be a raccoon… Sly Cooper.',
		img: 'gentleman-thief.png',
		links: {
			RedBubble: 'https://www.redbubble.com/i/t-shirt/Gentleman-Thief-by-ckirknielsen/107478068.ADAKE.XYZ',
			TeePublic: 'https://www.teepublic.com/t-shirt/29290455-gentleman-thief',
			DesignByHumans: 'https://www.designbyhumans.com/shop/t-shirt/men/gentleman-thief/1831582/',
		},
		tags: ['games'],
		date: '2022-04-10',
		similar: ['jak-daxter-powercell-hunters', 'crash-bandicoot-wumpa-hoarder'],
	},
	{
		slug: 'synth-element',
		name: 'The Synth Element',
		description: 'A cross-over between The Fifth Element and synth waveforms.',
		img: 'synth-element.png',
		links: {
			TeePublic: 'https://www.teepublic.com/t-shirt/19884473-the-synth-element-symbols',
			RedBubble: 'https://www.redbubble.com/i/t-shirt/The-Synth-Element-Symbols-by-ckirknielsen/108913348.DYMRA',
			Society6: 'https://society6.com/product/the-synth-element_coaster',
			DesignByHumans: 'https://www.designbyhumans.com/shop/t-shirt/men/the-synth-element-symbols/1831898/',
		},
		tags: ['tv-movies'],
		date: '2022-04-24',
		variant: ['synth-element-stone'],
	},
	{
		showInGallery: false,
		slug: 'synth-element-stone',
		name: 'The Synth Element (Stones)',
		description: 'A cross-over between The Fifth Element and synth waveforms.',
		img: 'synth-element-stones.png',
		links: {
			TeePublic: 'https://www.teepublic.com/t-shirt/19884472-the-synth-element-stones',
			RedBubble: 'https://www.redbubble.com/i/t-shirt/The-Synth-Element-Stones-by-ckirknielsen/108914203.UHLBD',
			Society6: 'https://society6.com/product/the-synth-element-stones_mug',
			DesignByHumans: 'https://www.designbyhumans.com/shop/t-shirt/men/the-synth-element-stones/1831897/',
		},
		tags: ['tv-movies'],
		date: '2022-04-24',
		variant: ['synth-element'],
	},
	{
		slug: 'outatime-trilogy',
		name: 'OUTATIME Trilogy',
		description: 'Taking a few elements from the movies to form this little sticker-appropriate design for one of my favourite franchises…',
		img: 'outatime-trilogy.jpg',
		links: {
			TeePublic: 'https://www.teepublic.com/sticker/29680717-outatime-trilogy',
			Society6: 'https://society6.com/product/outatime-trilogy6857092_sticker',
		},
		tags: ['tv-movies'],
		date: '2022-04-24',
	},
	{
		slug: 'twin-pines-mall',
		name: 'Twin Pines Mall',
		description: 'Typographically accurate sign for the Twin Pines Mall sign in Hill Valley, California!',
		img: 'twin-pines-mall.jpg',
		links: {
			// RedBubble: 'https://www.redbubble.com/i/sticker/Twin-Pines-Mall-Hill-Valley-CA-by-ckirknielsen/132619127.QK27K',
			TeePublic: 'https://www.teepublic.com/sticker/36675377-twin-pines-mall-hill-valley-ca',
			// DesignByHumans: 'https://www.designbyhumans.com/shop/sticker/twin-pines-mall-hill-valley-ca/1873939/',
		},
		tags: ['tv-movies'],
		date: '2022-11-19',
		variant: ['lone-pine-mall'],
	},
	{
		showInGallery: false,
		slug: 'lone-pine-mall',
		name: 'Lone Pine Mall',
		description: 'Typographically accurate sign for the Lone Pine Mall sign in Hill Valley, California!',
		img: 'lone-pine-mall.jpg',
		links: {
			// RedBubble: 'https://www.redbubble.com/i/sticker/Lone-Pine-Mall-Hill-Valley-CA-by-ckirknielsen/132619380.QK27K',
			TeePublic: 'https://www.teepublic.com/sticker/36675620-lone-pine-mall-hill-valley-ca',
			// DesignByHumans: 'https://www.designbyhumans.com/shop/sticker/lone-pine-mall-hill-valley-ca/1873940/',
		},
		tags: ['tv-movies'],
		date: '2022-11-19',
		variant: ['twin-pines-mall'],
	},
	{
		slug: 'it-crowd-four-five-fire',
		name: 'Four, I mean Five, I mean Fire!',
		description: 'One of my favourite quotes from Maurice Moss in the I.T. Crowd…',
		img: 'it-crowd-four-five-fire.png',
		links: {
			TeePublic: 'https://www.teepublic.com/t-shirt/30106971-four-i-mean-five-i-mean-fire',
			RedBubble: 'https://www.redbubble.com/i/t-shirt/Four-I-mean-Five-I-mean-Fire-by-ckirknielsen/110315180.1482B.XYZ',
			DesignByHumans: 'https://www.designbyhumans.com/shop/t-shirt/men/four-i-mean-five-i-mean-fire/1834133/',
		},
		tags: ['tv-movies'],
		date: '2022-05-09',
	},
	{
		slug: 'cartridge-world',
		name: 'Cartridge World',
		description: 'Memories of the thousands of worlds we held in our hands.',
		img: 'cartridge-world.jpg',
		links: {
			TeePublic: 'https://www.teepublic.com/t-shirt/45538405-raised-in-a-cartridge-world',
			// RedBubble: 'https://www.redbubble.com/i/sticker/Raised-in-a-Cartridge-World-by-ckirknielsen/145765578.EJUG5,
		},
		tags: ['games'],
		date: '2023-05-20',
	},
	{
		slug: 'css-retro-vhs',
		name: 'State of CSS',
		description: "Show your appreciation for everybody's favourite way to style the web with this retro shirt inspired by '90s blank VHS tapes",
		note: 'Commission for the State of CSS survey',
		img: 'css-retro-vhs.png',
		links: {
			CottonBureau: 'https://cottonbureau.com/products/css-retro-vhs#/13046404/tee-men-standard-tee-vintage-black-tri-blend-m',
		},
		tags: ['dev', 'css', 'vhs', 'retro'],
		similar: ['js-retro-vhs', 'html-retro-vhs', 'react-retro-vhs'],
		date: '2021-12-24',
	},
	{
		slug: 'js-retro-vhs',
		name: 'State of JS',
		description: "Wear your JS colours from the perspective of a '90s VHS tape",
		note: 'Commission for the State of JS survey',
		img: 'js-retro-vhs.png',
		links: {
			CottonBureau: 'https://cottonbureau.com/products/javascript-retro-vhs#/13799357/tee-men-standard-tee-vintage-black-tri-blend-m',
		},
		tags: ['dev', 'js', 'vhs', 'retro'],
		similar: ['css-retro-vhs', 'html-retro-vhs', 'react-retro-vhs'],
		date: '2022-03-01',
	},
	{
		slug: 'html-retro-vhs',
		name: 'State of HTML',
		description: 'Celebrate your love of HTML with an original design inspired by retro VHS tape covers',
		note: 'Commission for the State of HTML survey',
		img: 'html-retro-vhs.png',
		links: {
			CottonBureau: 'https://cottonbureau.com/p/8U4SGF/shirt/html-retro-vhs#/20217871/tee-men-standard-tee-vintage-black-tri-blend-m',
		},
		tags: ['dev', 'html', 'vhs', 'retro'],
		similar: ['css-retro-vhs', 'js-retro-vhs', 'react-retro-vhs'],
		date: '2024-05-14',
	},
	{
		slug: 'react-retro-vhs',
		name: 'State of React',
		description:
			'Is it a library? A framework? An unknown element on the verge of mutating into a dangerous, unstable entity? Whatever your feelings about React, you will find them reflected in this design that echoes anime and science-fiction.',
		note: 'Commission for the State of React survey',
		img: 'react-retro-vhs.png',
		links: {
			CottonBureau: 'https://cottonbureau.com/p/NV42G5/shirt/react-atom#/20741664/tee-men-standard-tee-vintage-navy-tri-blend-m',
		},
		tags: ['dev', 'js', 'vhs', 'retro'],
		similar: ['html-retro-vhs', 'css-retro-vhs', 'js-retro-vhs'],
		date: '2024-07-19',
	},
	{
		slug: 'kevin-powell-grid',
		name: 'Grid Layout',
		description: 'Let the world know that you love CSS Grid!',
		note: 'Commission for Kevin Powell',
		img: 'kevin-powell-grid.png',
		links: {
			CottonBureau: 'https://cottonbureau.com/p/Y55DSU/shirt/front-end-friends-css-grid#/19399708/tee-men-standard-tee-vintage-black-tri-blend-m',
		},
		tags: ['dev', 'css', 'vhs', 'retro'],
		similar: ['kevin-powell-css', 'kevin-powell-color-space'],
		date: '2023-12-31',
	},
	{
		slug: 'kevin-powell-css',
		name: 'Cascading Stylesheets',
		description: 'Embrace the cascade, and show others your love for CSS.',
		note: 'Commission for Kevin Powell',
		img: 'kevin-powell-css.png',
		links: {
			CottonBureau: 'https://cottonbureau.com/p/URUZFW/shirt/front-end-friends-cascading-style-sheets#/19399691/tee-men-standard-tee-natural-100percent-cotton-m',
		},
		tags: ['dev', 'css', 'vhs', 'retro'],
		similar: ['kevin-powell-grid', 'kevin-powell-color-space'],
		date: '2023-12-31',
	},
	{
		slug: 'kevin-powell-color-space',
		name: 'Explore Color Space',
		description: "Color spaces have really taken off in CSS (pun intended), and we think that's worth celebrating!",
		note: 'Commission for Kevin Powell',
		img: 'kevin-powell-color-space.png',
		links: {
			CottonBureau: 'https://cottonbureau.com/p/B56YTR/shirt/front-end-friends-explore-color-space#/19399781/tee-men-standard-tee-vintage-black-tri-blend-m',
		},
		tags: ['dev', 'css', 'vhs', 'retro'],
		similar: ['kevin-powell-color-space', 'kevin-powell-css'],
		date: '2023-12-31',
	},

	// Below are designs that are hidden but still accessible via their unique URL

	{
		showInGallery: false,
		slug: 'control-service-weapon',
		name: 'Control, Service Weapon',
		description: 'A poster showcasing a powerful handgun found in Control.',
		img: 'control-service-weapon.jpg',
		links: {
			RedBubble: 'https://www.redbubble.com/i/poster/Control-FBC-Service-Weapon-by-ckirknielsen/89267833.LVTDI',
			TeePublic: 'https://www.teepublic.com/poster-and-art/24392079-control-fbc-service-weapon',
		},
		tags: ['games', 'gaming-arsenal'],
		date: '2021-10-23',
		variant: ['control'],
	},
	{
		showInGallery: false,
		slug: 'deathloop-fourpounder',
		name: 'DEATHLOOP, Fourpounder',
		description: 'A poster showcasing a stylish gun from DEATHLOOP.',
		img: 'deathloop-fourpounder.jpg',
		links: {
			RedBubble: 'https://www.redbubble.com/i/poster/DEATHLOOP-Fourpounder-by-ckirknielsen/97903910.LVTDI',
			TeePublic: 'https://www.teepublic.com/poster-and-art/26802077-deathloop-fourpounder',
		},
		tags: ['games', 'gaming-arsenal'],
		date: '2021-12-31',
		variant: ['deathloop'],
	},
	{
		showInGallery: false,
		slug: 'god-of-war-leviathan-axe',
		name: 'God of War, Leviathan Axe',
		description: 'A poster showcasing a mythical axe from God of War.',
		img: 'gow-axe.jpg',
		links: {
			RedBubble: 'https://www.redbubble.com/i/poster/God-of-War-Leviathan-Axe-by-ckirknielsen/91430397.LVTDI',
			'RedBubble (Alt)': 'https://www.redbubble.com/i/poster/God-of-War-Leviathan-Axe-Alt-Version-by-ckirknielsen/106755016.LVTDI',
			TeePublic: 'https://www.teepublic.com/poster-and-art/24830737-god-of-war-leviathan-axe',
		},
		tags: ['games', 'gaming-arsenal'],
		date: '2021-10-23',
		variant: ['god-of-war'],
	},
	{
		showInGallery: false,
		slug: 'tlou-switchblade',
		name: 'The Last of Us, Switchblade',
		description: "A poster illustrating Ellie's signature knife in The Last of Us.",
		img: 'tlou-switchblade.jpg',
		links: {
			RedBubble: 'https://www.redbubble.com/i/poster/The-Last-of-Us-Switchblade-by-ckirknielsen/106050948.LVTDI',
			TeePublic: 'https://www.teepublic.com/poster-and-art/28918532-the-last-of-us-switchblade',
		},
		tags: ['games', 'gaming-arsenal'],
		date: '2022-03-27',
	},
	{
		showInGallery: false,
		slug: 'ratchet-clank-omniwrench',
		name: 'Ratchet & Clank, Omniwrench',
		description: 'A poster presenting a versatile tool in Ratchet & Clank.',
		img: 'rc-wrench.jpg',
		links: {
			RedBubble: 'https://www.redbubble.com/i/poster/Ratchet-and-Clank-Omniwrench-Millenium-by-ckirknielsen/93357003.LVTDI',
			TeePublic: 'https://www.teepublic.com/poster-and-art/25205497-ratchet-and-clank-omniwrench-millenium',
		},
		tags: ['games', 'gaming-arsenal'],
		date: '2022-04-03',
	},
	{
		showInGallery: false,
		slug: 'dead-space-plasma-cutter',
		name: 'Dead Space, Plasma Cutter',
		description: 'A poster presenting an essential engineering tool in Dead Space.',
		img: 'ds-plasma-cutter.jpg',
		links: {
			RedBubble: 'https://www.redbubble.com/i/poster/Dead-Space-Plasma-Cutter-by-ckirknielsen/99996925.LVTDI',
			TeePublic: 'https://www.teepublic.com/poster-and-art/27453494-dead-space-plasma-cutter',
		},
		tags: ['games', 'gaming-arsenal'],
		date: '2022-01-23',
		variant: ['dead-space'],
	},
];

// By default, if the showInGallery prop is missing, infer the design should be shown
export default designs.map((design) => {
	if (design.hasOwnProperty('showInGallery')) {
		return design;
	}
	return Object.assign(design, { showInGallery: true });
});
