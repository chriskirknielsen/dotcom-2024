import { PurgeCSS } from 'purgecss';

export default function (eleventyConfig, options = {}) {
	if (!options.placeholder) {
		throw new Error('The `options` argument expects a `placeholder` property (string) to enable find and replace in the HTML document.');
	}
	if (!options.pathToCss) {
		throw new Error('The `options` argument expects a `pathToCss` property (string or string[]) to pass in CSS.');
	}

	// Default values
	options = Object.assign(
		{
			keyframes: true, // Removes unused keyframes
			safelist: [],
			blocklist: [],
			dynamicAttributes: [],
			getPageList: (path) => [],
		},
		options
	);

	if (!Array.isArray(options.pathToCss)) {
		options.pathToCss = [options.pathToCss];
	}

	const { pathToCss, placeholder, keyframes, getPageList, dynamicAttributes } = options;

	eleventyConfig.addTransform('purge-and-inline-css', async (content, outputPath) => {
		if (!outputPath || !outputPath.endsWith('.html') || content.includes(placeholder) === false) {
			return content;
		}

		const pageList = getPageList(outputPath) || {};
		const safelist = options.safelist.concat(pageList.safe || []);
		const blocklist = options.blocklist.concat(pageList.block || []);
		const purgeCSSResults = await new PurgeCSS().purge({
			content: [{ raw: content }],
			css: pathToCss,
			keyframes,
			safelist,
			blocklist,
			dynamicAttributes,
		});

		return content.replace(placeholder, purgeCSSResults[0].css || '');
	});
}
