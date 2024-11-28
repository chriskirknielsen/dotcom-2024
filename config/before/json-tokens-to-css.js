//* Imports
import 'dotenv/config';
import Color from 'colorjs.io';

//* Constants
const BUILD_CONTEXT = process?.env?.BUILD_CONTEXT || 'LIVE';
const requiredColorTokens = ['canvas', 'surface', 'text', 'heading', 'accent'];
const backgroundColorTokens = ['canvas', 'surface', 'surface-alt'];
const foregroundColorTokens = ['text', 'heading', 'accent', 'accent-alt'];

export default function (string) {
	let outputInRoot = ''; // Compose a CSS string from the JSON tokens
	const json = JSON.parse(string);
	const themes = json.themes;
	const defaults = json.defaults;
	const extraFontProps = ['weight', 'style']; // These are also consumed in @font-face so we cannot simply declare them as typical tokens

	// Helpers
	const tokenVal = (val) => {
		if (typeof val === 'string' && val.indexOf('{{') === 0) {
			const tokenMatch = val.trim().match(/\{\{([a-zA-Z0-9 ._-]+)\}\}/i);
			if (tokenMatch) {
				return tokenMatch[1]
					.trim()
					.split('.')
					.reduce((prev, curr) => prev[curr], json); // Grab the token at the provided path (optimistic approach, does not account for falsy values)
			}
		}

		return Array.isArray(val) ? val.filter(Boolean).join(', ') : val;
	};
	const tokenToCssVar = (name, value, prefix = '') => `--${[prefix, name].flat(Infinity).filter(Boolean).join('-')}: ${tokenVal(value)};`;
	const colorToHsl = (color) => new Color(color).to('hsl').coords.map((c) => parseFloat(c.toFixed(2)));

	// Global properties get defined first
	for (let groupKey in json.global) {
		const group = json.global[groupKey];
		if (typeof group === 'string') {
			const defVal = tokenVal(group);
			outputInRoot += `${tokenToCssVar(groupKey, defVal)}\n`;
		} else {
			for (let defKey in group) {
				const defVal = tokenVal(group[defKey]);
				outputInRoot += `${tokenToCssVar(defKey, defVal, groupKey)}\n`;
			}
		}
	}

	for (let defKey in defaults) {
		const defVal = defaults[defKey];
		outputInRoot += `${tokenToCssVar(`_${defKey}`, `var(--${defKey}, ${defVal})`)}\n`;
	}

	// Iterate over themes
	const allThemes = Object.entries(themes);
	const allThemesKeys = Object.keys(themes);
	const defaultThemes = allThemes.filter(([key, data]) => data.isDefaultScheme === true);
	const extraThemes = allThemes.filter(([key, data]) => data.isDefaultScheme !== true);
	const lightThemeKey = defaultThemes.find(([key, data]) => data.scheme === 'light')[0];
	const darkThemeKey = defaultThemes.find(([key, data]) => data.scheme === 'dark')[0];
	const lightDarkVar = (name, lightVal, darkVal, prefix = '') => {
		return tokenToCssVar(name, `var(--T-${lightThemeKey}, ${lightVal || 'initial'}) var(--T-${darkThemeKey}, ${darkVal || 'initial'})`, prefix);
	};

	// Create tooling values
	const maxContent = json.global.layout['max-content'];
	const breakpoint = json.settings.breakpoint;
	const tocMinWidth = json.settings['toc-min-width'];
	const tocMinHeight = json.settings['toc-min-height'];
	const customMedias = {
		'small-viewport': `(width <= ${breakpoint})`,
		'large-viewport': `(width > ${breakpoint})`,
		'toc-side': `(min-width: calc(${maxContent} + 2 * ${tocMinWidth})) and (min-height: ${tocMinHeight})`,
	};
	let toolsOutput = `${Object.entries(customMedias)
		.map(([key, cond]) => `@custom-media --${key} ${cond};`)
		.join('\n')}
	
	@media (--prefers-light) {
		html:not([data-theme]) [data-theme-condition]:not([data-theme-condition='${lightThemeKey}']) {
			display: none !important;
		}
	}
	
	@media (--prefers-dark) {
		html:not([data-theme]) [data-theme-condition]:not([data-theme-condition='${darkThemeKey}']) {
			display: none !important;
		}
	}`;

	// All themes are disabled by default
	for (let themeKey of allThemesKeys) {
		outputInRoot += `--T-${themeKey}: var(--OFF);\n`;
		toolsOutput += `html[data-theme]:not([data-theme='${themeKey}']) [data-theme-condition='${themeKey}'] {
			display: none !important;
		}\n`;

		// Skip color contrast checks outside of development
		if (BUILD_CONTEXT !== 'DEV') {
			continue;
		}

		// Compare color contrasts for theme tokens
		const themeColors = themes[themeKey].color;
		const missingRequiredColors = requiredColorTokens.filter((t) => themes[themeKey].color.hasOwnProperty(t) === false);
		if (missingRequiredColors.length > 0) {
			throw new Error(`Theme ${themeKey} is missing required color tokens: ${missingRequiredColors.join(', ')}.`);
		}
		for (let bg of backgroundColorTokens) {
			for (let fg of foregroundColorTokens) {
				if (fg in themeColors && bg in themeColors) {
					if (themeColors[bg].includes('var(') || themeColors[fg].includes('var(')) {
						continue;
					}

					const contrast = parseFloat(Color.contrast(themeColors[bg], themeColors[fg], 'WCAG21').toFixed(2));
					if (contrast < 4.5) {
						const bgToHsl = colorToHsl(themeColors[bg]);
						const fgToHsl = colorToHsl(themeColors[fg]);
						const link = `https://www.oddcontrast.com/#hsl__hsl(${bgToHsl[0]}_${bgToHsl[1]}~_${bgToHsl[2]}~)__hsl(${fgToHsl[0]}_${fgToHsl[1]}~_${fgToHsl[2]}~)`;
						console.log(
							`\x1b[30m[11ty] \x1b[33mWarning: "${themeKey}" theme colors have low contrast: ${bg} vs ${fg} = ${contrast.toFixed(2)} — fix this at ${link}\x1b[0m`
						);
					}
				}
			}
		}
	}

	const rootOutput = `:root {\n${outputInRoot}\n}`;

	// A little repetition for system-level preferences to be respected
	let defaultOutput = `@media screen and (prefers-color-scheme: light) {
		html:not([data-theme]) {
			--T-${lightThemeKey}: var(--ON);
		}
	}
	html[data-theme="${lightThemeKey}"] {
		--T-${lightThemeKey}: var(--ON);
	}
	
	@media screen and (prefers-color-scheme: dark) {
		html:not([data-theme]) {
			--T-${darkThemeKey}: var(--ON);
		}
	}
	html[data-theme="${darkThemeKey}"] {
		--T-${darkThemeKey}: var(--ON);
	}\n`;

	// Loop over one of the default themes, since symmetry can be expected from the default themes and their respective tokens
	(function (lightTheme, darkTheme) {
		const uniqueTokenList = Array.from(new Set([].concat(Object.keys(lightTheme.tokens), Object.keys(darkTheme.tokens))));
		const regularTokens = uniqueTokenList.map((defKey) => lightDarkVar(defKey, lightTheme.tokens[defKey], darkTheme.tokens[defKey])).join('\n');

		const colorTokens = Object.keys(lightTheme.color)
			.map((defKey) => lightDarkVar(defKey, lightTheme.color[defKey], darkTheme.color[defKey], 'C'))
			.join('\n');

		const fontTokens = Object.keys(lightTheme.font)
			.map((fontGroup) => {
				let fontDefinition = '';
				const fontStackLight = tokenVal([lightTheme.font[fontGroup].family, lightTheme.font[fontGroup].fallback, `var(--fontStack-${lightTheme.font[fontGroup].stack})`]);
				const fontStackDark = tokenVal([darkTheme.font[fontGroup].family, darkTheme.font[fontGroup].fallback, `var(--fontStack-${darkTheme.font[fontGroup].stack})`]);
				fontDefinition += lightDarkVar('family', fontStackLight, fontStackDark, ['font', fontGroup]);

				extraFontProps.forEach((extraProp) => {
					if (lightTheme.font[fontGroup][extraProp]) {
						fontDefinition += lightDarkVar(extraProp, lightTheme.font[fontGroup][extraProp], darkTheme.font[fontGroup][extraProp], ['font', fontGroup]);
					}
				});

				return fontDefinition;
			})
			.join('\n');

		defaultOutput += `html:not([data-theme]), html[data-theme="${lightThemeKey}"], [data-theme="${darkThemeKey}"] {
			${lightDarkVar('color-scheme', 'light', 'dark')}
			${regularTokens}\n${colorTokens}\n${fontTokens}
		}`;
	})(themes[lightThemeKey], themes[darkThemeKey]);

	// Create a new block for every theme that isn't a default theme
	const extrasOutput = extraThemes
		.map(([themeKey, data]) => {
			const regularTokens = Object.entries(data.tokens)
				.map(([defKey, defVal]) => tokenToCssVar(defKey, defVal))
				.join('\n');

			const colorTokens = Object.entries(data.color)
				.map(([defKey, defVal]) => tokenToCssVar(defKey, defVal, 'C'))
				.join('\n');

			const fontTokens = Object.entries(data.font)
				.map(([fontGroup, fontData]) => {
					let fontDefinition = '';
					const fontStack = `${[fontData.family, fontData.fallback, json.global.fontStack[fontData.stack]].filter(Boolean).join(', ')}`;
					fontDefinition += tokenToCssVar('family', fontStack, ['font', fontGroup]);

					extraFontProps.forEach((extraProp) => {
						if (fontData[extraProp]) {
							fontDefinition += tokenToCssVar(extraProp, fontData[extraProp], ['font', fontGroup]);
						}
					});

					return fontDefinition;
				})
				.join('\n');

			return `html[data-theme="${themeKey}"] {
				--T-${themeKey}: var(--ON);
				--color-scheme: ${data.scheme};
				${regularTokens}
				${colorTokens}
				${fontTokens}
			}`;
		})
		.join('\n');

	// Join all the outputs together
	return [rootOutput, defaultOutput, extrasOutput, toolsOutput].join('\n');
}
