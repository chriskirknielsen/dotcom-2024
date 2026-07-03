import { PurgeCSS } from 'purgecss';
import jsBeautify from 'js-beautify';

const BUILD_CONTEXT = ['serve', 'watch'].includes(process.env.ELEVENTY_RUN_MODE) ? 'DEV' : 'LIVE';

export default function (eleventyConfig, options = {}) {
	// Default values
	const config = Object.assign(
		{
			keyframes: false,
			variables: false,
			safelist: [],
			blocklist: [],
			dynamicAttributes: [],
			getPageList: (path) => {},
			getIsBeautifiedHtml: null,
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

	const { pathToCss, placeholder, keyframes, variables, getPageList, dynamicAttributes, getIsBeautifiedHtml } = config;

	eleventyConfig.addTransform('purge-and-inline-css', async (content, outputPath) => {
		if (!outputPath || !outputPath.endsWith('.html')) {
			return content;
		}

		// Run PurgeCSS
		if (content.includes(placeholder)) {
			const pageList = getPageList(outputPath) || {};
			const safelist = config.safelist.concat(pageList.safe || []);
			const blocklist = config.blocklist.concat(pageList.block || []);
			const purgeCSSResults = await new PurgeCSS().purge({
				content: [{ raw: content }],
				css: pathToCss,
				keyframes,
				variables,
				safelist,
				blocklist,
				dynamicAttributes,
			});

			content = content.replace(placeholder, purgeCSSResults[0].css || '');
		}

		// Skip beautifying in dev mode
		if (BUILD_CONTEXT === 'DEV') {
			return content;
		}

		// Skip pages which don't pass the test, if provided
		if (typeof getIsBeautifiedHtml === 'function' && getIsBeautifiedHtml(outputPath) === false) {
			return content;
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
