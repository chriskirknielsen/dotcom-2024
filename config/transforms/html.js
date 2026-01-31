import { PurgeCSS } from 'purgecss';
import jsBeautify from 'js-beautify';

export default function (eleventyConfig, options = {}) {
	// Default values
	const config = Object.assign(
		{
			keyframes: true, // Removes unused keyframes
			safelist: [],
			blocklist: [],
			dynamicAttributes: [],
			getPageList: (path) => [],
		},
		options.css || {}
	);

	if (!config.placeholder) {
		throw new Error('The `options` argument expects a `placeholder` property (string) to enable find and replace in the HTML document.');
	}
	if (!config.pathToCss) {
		throw new Error('The `options` argument expects a `pathToCss` property (string or string[]) to pass in CSS.');
	}

	if (!Array.isArray(config.pathToCss)) {
		config.pathToCss = [config.pathToCss];
	}

	const { pathToCss, placeholder, keyframes, getPageList, dynamicAttributes } = config;

	eleventyConfig.addTransform('purge-and-inline-css', async (content, outputPath) => {
		if (!outputPath || !outputPath.endsWith('.html')) {
			return content;
		}

		if (content.includes(placeholder)) {
			const pageList = getPageList(outputPath) || {};
			const safelist = config.safelist.concat(pageList.safe || []);
			const blocklist = config.blocklist.concat(pageList.block || []);
			const purgeCSSResults = await new PurgeCSS().purge({
				content: [{ raw: content }],
				css: pathToCss,
				keyframes,
				safelist,
				blocklist,
				dynamicAttributes,
			});

			content = content.replace(placeholder, purgeCSSResults[0].css || '');
		}

		return jsBeautify.html(content, {
			content_unformatted: ['li', 'pre', 'code'],
			preserve_newlines: true,
			max_preserve_newlines: 1,
			indent_empty_lines: false,
			indent_with_tabs: true,
		});
	});
}
