const tokenVal = (val) => (Array.isArray(val) ? val.join(', ') : val);

export default function (string, fontsDir) {
	let outputRoot = ''; // Compose a CSS string from the JSON tokens
	const json = JSON.parse(string);
	const themes = json.themes;

	for (let themeKey in themes) {
		const themeHeadingFont = themes[themeKey].font.heading;
		const localFontNames = themeHeadingFont.local || [];
		const localFontList = Array.from(new Set([themeHeadingFont.family].concat(localFontNames))).map((localName) => `local("${localName}")`);
		const filename = themeHeadingFont.filename || themeHeadingFont.family;
		const fontSrcList = [].concat(localFontList, [`url("${fontsDir}/${filename}.woff2") format("woff2")`]).filter(Boolean);
		const extraPropsMap = {
			'font-weight': 'weight',
			'font-style': 'style',
			'size-adjust': 'size-adjust',
			'ascent-override': 'ascent-override',
			'descent-override': 'descent-override',
			'line-gap-override': 'line-gap-override',
		};
		const extraProps = Object.entries(extraPropsMap)
			.map(([prop, fontDataKey]) => (themeHeadingFont.hasOwnProperty(fontDataKey) ? `${prop}: ${themeHeadingFont[fontDataKey]};` : ''))
			.filter(Boolean);
		const fontFaceDeclaration = `
        @font-face {
            font-family: "${themeHeadingFont.family}";
            src: ${fontSrcList.join(', ')};
            ${extraProps.join('\n')}
            font-display: swap;
        }`;
		outputRoot += `${fontFaceDeclaration}\n`;
	}

	return outputRoot;
}
