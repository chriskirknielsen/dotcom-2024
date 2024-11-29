import fs from 'fs';
import pluginImage from '@11ty/eleventy-img';
import * as cheerio from 'cheerio';

/**
 * Quickly hash a string in an unsecure way.
 * @link https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0?permalink_comment_id=2694461#gistcomment-2694461
 * @param {string} s String to hash.
 * @returns {string} Hashed string.
 */
function quickHash(s) {
	// Using var allows the h variable to be read outside the for loop
	for (var i = 0, h = 0; i < s.length; i++) {
		h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
	}

	return Math.abs(h).toString(16); // Absolutely unnecessary, purely aesthetic, h would suffice, but the hash look more like a proper hash as a hex…
}

export default function (eleventyConfig, options = {}) {
	if (typeof options.svgAssetFolder !== 'string') {
		throw new Error('The `options` argument expects a `svgAssetFolder` property to use as a folder path for the `svg` shortcode.');
	}
	if (typeof options.componentsFolder !== 'string') {
		throw new Error('The `options` argument expects a `componentsFolder` property to use as a folder path for the `component` shortcode.');
	}

	const { svgAssetFolder, componentsFolder, cacheSvg } = options;
	const svgCache = {}; // If caching is enabled, this object will be used to store recurring SVGs

	/** Render an SVG from the SVG assets folder. */
	eleventyConfig.addAsyncShortcode('svg', async function (filename, svgOptions = {}) {
		const cacheKey = filename + '_' + quickHash(JSON.stringify(svgOptions));

		if (cacheSvg && svgCache.hasOwnProperty(cacheKey)) {
			return svgCache[cacheKey]; // Wait for the data
		}

		const isNjk = svgOptions.isNjk || false; // Expect a simple SVG file by default
		const filePath = `${svgAssetFolder}/${filename}.svg${isNjk ? '.njk' : ''}`;
		const engine = svgOptions.hasOwnProperty('engine') ? svgOptions.engine : isNjk ? 'njk' : 'html'; // HTML for vanilla SVG
		const output = eleventyConfig.nunjucks.asyncShortcodes
			.renderFile(filePath, svgOptions, engine)
			.catch((err) => {
				console.error(err);
				return `<!-- Unable to render ${filename}: ${err} -->`;
			})
			.then((content) => {
				// If there are options that inject attributes (i.e., not isNjk or engine), we can use cheerio to inject them
				if (Object.keys(svgOptions).some((k) => ['isNjk', 'engine'].includes(k) === false)) {
					const $ = cheerio.load(content, null, false);
					const svg = $('svg');

					if (svgOptions.class) {
						svg.addClass(svgOptions.class);
					}

					if (svgOptions.title) {
						const titleEl = svg.find('title').length > 0 ? svg.find('title') : $(`<title></title>`).prependTo(svg);
						titleEl.text(svgOptions.title);
					}

					if (svgOptions.ariaLabel) {
						svg.attr('aria-label', svgOptions.ariaLabel);
					}

					if (!svgOptions.hasOwnProperty('title') && !svgOptions.hasOwnProperty('ariaLabel') && svg.find('title').length === 0) {
						svgOptions.ariaHidden = true; // Ensure SVGs are hidden from the a11y tree if no title or label is provided
					}

					if (svgOptions.ariaHidden) {
						svg.attr('aria-hidden', 'true');
					}

					if (svgOptions.preserveAspectRatio) {
						svg.attr('preserveAspectRatio', svgOptions.preserveAspectRatio);
					}

					return $.root().html();
				} else {
					// Return the SVG content as-is
					return content;
				}
			});

		if (cacheSvg) {
			svgCache[cacheKey] = output;
		}

		return output;
	});

	/** Render an SVG specially built for the footer section from the SVG assets folder. */
	eleventyConfig.addAsyncShortcode('footersvg', async function (filename, attrs = {}) {
		if (svgCache.hasOwnProperty(filename)) {
			return svgCache[filename]; // Memoize those results
		}

		const svgSrc = `src/_includes/assets/svg/${filename}`;

		// If the source SVG doesn't exist, return an empty string to bypass errors
		if (!fs.existsSync(svgSrc)) {
			const returnValue = '';
			svgCache[filename] = returnValue;
			return returnValue;
		}

		const returnValue = pluginImage(svgSrc, {
			urlPath: `/assets/svg`,
			outputDir: `./_site/assets/svg/`,
			widths: [1200],
			formats: ['svg'],
			svgShortCircuit: true,
			filenameFormat: function (id, src, width, format, options) {
				if (filename.endsWith(`.${format}`)) {
					return filename;
				}
				return `${filename}.${format}`;
			},
		}).then((metadata) => {
			return pluginImage.generateHTML(metadata, { ...attrs, alt: '', loading: 'lazy', decoding: 'async' }, { pictureAttributes: attrs });
		});
		svgCache[filename] = returnValue;
		return returnValue;
	});

	/** Render a component from the component folder. */
	eleventyConfig.addAsyncShortcode('webcomponent', async function (filename, attributes = {}, componentData = {}) {
		const filePath = `${componentsFolder}/web/${filename}.njk`;
		const content = eleventyConfig.nunjucks.asyncShortcodes.renderFile(filePath, { ...this.ctx, componentData, componentAttrs: attributes }, 'njk'); // Pass in the global context for web components
		return content;
	});

	/** Render a web component from the component/web folder. */
	eleventyConfig.addAsyncShortcode('component', async function (filename, componentOptions = {}) {
		const filePath = `${componentsFolder}/${filename}.njk`;
		const content = eleventyConfig.nunjucks.asyncShortcodes.renderFile(filePath, componentOptions, 'njk'); // Only pass in the provided data object
		return content;
	});
}
