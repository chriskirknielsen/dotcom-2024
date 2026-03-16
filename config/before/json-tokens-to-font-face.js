export default function (string, fontsDir) {
	let outputRoot = ''; // Compose a CSS string from the JSON tokens
	const json = JSON.parse(string);
	const themes = json.themes;
	const themeFonts = Object.keys(themes)
		.map((t) => themes[t].font.heading)
		.filter((f) => f.filename); // No filename means we're expecting to use a local font
	const extraFonts = json.extraFonts || [];
	const allFonts = [].concat(themeFonts, extraFonts);

	for (let themeHeadingFont of allFonts) {
		const filename = themeHeadingFont.filename || themeHeadingFont.family;
		const fontSrcList = [`url("${fontsDir}/${filename}.woff2") format("woff2")`].filter(Boolean);
		const extraPropsMap = {
			'font-weight': 'weight',
			'font-style': 'style',
			'size-adjust': 'size-adjust',
			'ascent-override': 'ascent',
			'descent-override': 'descent',
			'line-gap-override': 'line-gap',
		};
		const extraProps = Object.entries(extraPropsMap)
			.map(([prop, fontDataKey]) => (themeHeadingFont.hasOwnProperty(fontDataKey) ? `${prop}: ${themeHeadingFont[fontDataKey]};` : ''))
			.filter(Boolean);
		const fontFaceDeclaration = `
@font-face {
	font-family: "${themeHeadingFont.family}";
	src: ${fontSrcList.join(', ')};
	${extraProps.join(`
	`)}
	font-display: swap;
}`;
		outputRoot += fontFaceDeclaration;
	}

	return outputRoot.trim();
}
