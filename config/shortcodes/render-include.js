import fs from 'node:fs';
import path from 'node:path';
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

/**
 * Replicates #Array.splice's behaviour but for strings.
 * @param {string} content Initial string contents.
 * @param {Number} index Splice start index.
 * @param {string} add Contents to inject at the provided index.
 * @param {Number} [skip] Number of characters after the index to skip. Leave empty to capture the entire remainder.
 * @returns {string} Spliced string.
 */
function stringSplice(content, index, add, skip = 0) {
	if (!content || typeof content !== 'string') {
		return content;
	}

	// Negative index handling
	if (index < 0) {
		index += content.length;

		if (index < 0) {
			index = 0;
		}
	}

	// Splice the string together
	return content.slice(0, index) + (add || '') + content.slice(index + skip);
}

/**
 * Get the ID for the SVG spritesheet.
 * @param {string} [ref] Sprite ID to compose. Omit to retrieve the prefix by itself.
 * @returns {string} Composed sprite ID.
 */
function getSpriteId(ref = '') {
	return `svg__${ref}`;
}

export default function (eleventyConfig, options = {}) {
	if (typeof options.svgAssetFolder !== 'string') {
		throw new Error('The `options` argument expects a `svgAssetFolder` property to use as a folder path for the `svg` shortcode.');
	}
	if (typeof options.componentsFolder !== 'string') {
		throw new Error('The `options` argument expects a `componentsFolder` property to use as a folder path for the `component` shortcode.');
	}

	const { svgAssetFolder, componentsFolder, isSvgCached } = options;
	const svgCache = {}; // If caching is enabled, this object will be used to store reused SVGs
	const cheerioCache = {}; // Sync cache of cheerio manipulations

	/** Fetch the raw contents of an SVG file. */
	async function loadSvg(filename) {
		return eleventyConfig.getShortcode('injectsvg')(filename);
	}

	/** Manipulate the DOM for an SVG element. */
	function processSvg(content, svgOptions, name = null) {
		const key = name ? name + '_' + quickHash(JSON.stringify(svgOptions)) : null;
		if (key && cheerioCache.hasOwnProperty(key)) {
			return cheerioCache[key];
		}

		try {
			// If there are options that inject attributes, we can use cheerio to inject them
			const $ = cheerio.load(content, null, false);
			const svg = $('svg');

			if (svgOptions.id) {
				svg.attr('id', svgOptions.id);
			}

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

			// By default, set the SVG to a 16x16 square
			if (svgOptions.hasOwnProperty('width') === false && !svg.attr('width')) {
				svgOptions.width = 16;
			}
			if (svgOptions.hasOwnProperty('width')) {
				svg.attr('width', svgOptions.width);
			}

			if (svgOptions.hasOwnProperty('height') === false && !svg.attr('height')) {
				svgOptions.height = 16;
			}
			if (svgOptions.hasOwnProperty('height')) {
				svg.attr('height', svgOptions.height);
			}

			if (svgOptions.preserveAspectRatio) {
				svg.attr('preserveAspectRatio', svgOptions.preserveAspectRatio);
			}

			const output = $.root().html();
			if (key) {
				cheerioCache[key] = output;
			}
			return output;
		} catch {
			// Return the SVG content as-is
			return content;
		}
	}

	/** Render an SVG from the SVG assets folder (asynchronous but does not require explicit dimensions as they are provided by the SVG). */
	eleventyConfig.addAsyncShortcode('injectsvg', async function (filename, svgOptions = {}) {
		const cacheKey = filename + '_' + quickHash(JSON.stringify(svgOptions));

		if (isSvgCached && svgCache.hasOwnProperty(cacheKey)) {
			return svgCache[cacheKey]; // Wait for the data
		}

		const filePath = `${svgAssetFolder}/${filename}.svg`;
		const output = eleventyConfig.nunjucks.asyncShortcodes
			.renderFile(filePath, svgOptions, 'html')
			.catch((err) => {
				console.error(err);
				return `<!-- Unable to render ${filename}: ${err} -->`;
			})
			.then((content) => {
				return processSvg(content, svgOptions, filename);
			});

		if (isSvgCached) {
			svgCache[cacheKey] = output;
		}

		return output;
	});

	/** Insert a reference to an SVG "spritesheet" (synchronous!). */
	eleventyConfig.addShortcode('svg', function (filename, svgOptions = {}) {
		const spriteKey = getSpriteId(filename);
		const content = `<svg xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="#${spriteKey}" width="100%" height="100%"></use></svg>`;
		const output = processSvg(content, svgOptions, spriteKey);

		return output;
	});

	/** Inject an SVG spritesheet at the bottom of the content. */
	eleventyConfig.addTransform('svg', async (content, outputPath) => {
		// It's not HTML? Get outta here!
		if (!outputPath || !outputPath.endsWith('.html')) {
			return content;
		}

		// Get a deduplicated list of all SVG <use> references to inject
		const useRegExp = new RegExp(`<use xlink:href="#${getSpriteId()}([^"]+)"+`, 'g');
		const useReferences = Array.from(new Set([...content.matchAll(useRegExp)].map((m) => m[1])));

		// No SVG sprite, no more processing
		if (useReferences.length < 1) {
			return content;
		}

		// Instantiate a new SVG element that will hold the "spritesheet"
		const emptyHiddenSvgElement =
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="visually-hidden" width="0" height="0" aria-hidden="true"></svg>';
		const $ = cheerio.load(emptyHiddenSvgElement, null, false);
		const $svgSprite = $('svg');

		// Loop through all the references, with an await since loading the SVGs is asynchronous
		const symbols = useReferences.map(async (ref) => {
			const cacheKey = ref; // No SVG options attached here, so it will be the original file contents
			if (!isSvgCached || svgCache.hasOwnProperty(cacheKey) === false) {
				svgCache[cacheKey] = loadSvg(ref); // Cache the raw SVG markup in a promise
			}
			const svg = await svgCache[cacheKey]; // Get the raw cache contents
			const symbol = svg.replace('<svg', `<symbol`).replace('</svg>', '</symbol>'); // Convert SVGs to symbols (gross but it works, and doesn't require another Cheerio pass)
			const $symbol = $(symbol); // Make the symbol into a cheerio instance
			$symbol.attr('id', getSpriteId(ref)); // Attach the unique ID
			$symbol.removeAttr('xmlns'); // Remove unnecessary attribute
			$symbol.appendTo($svgSprite);
			return;
		});
		await Promise.all(symbols);

		// Retrieve the final SVG spritesheet
		const svgOutput = $.root().html();
		const bodyCloseIndex = content.lastIndexOf('</body>');
		return stringSplice(content, bodyCloseIndex, svgOutput);
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
			urlPath: `/assets/svg/`,
			// outputDir: `./_site/assets/svg/`,
			outputDir: `.cache/svg/`,
			widths: [1200],
			formats: ['svg'],
			svgShortCircuit: true,
			failOnError: false,
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

	/** Sync the cached SVGs. */
	eleventyConfig.on('eleventy.after', () => {
		fs.cpSync('.cache/svg/', path.join(eleventyConfig.directories.output, '/assets/svg/'), {
			recursive: true,
		});
	});

	/** Render a component from the component folder. */
	eleventyConfig.addAsyncShortcode('webcomponent', async function (filename, attributes = {}, componentData = {}) {
		const ext = componentData.ext || 'vto';
		const filePath = `${componentsFolder}/web/${filename}.${ext}`;
		const renderer = eleventyConfig.nunjucks.asyncShortcodes.renderFile.bind(this);
		const content = renderer(filePath, { ...(this.ctx || {}), componentData, componentAttrs: attributes }, ext); // Pass in the global context for web components
		return content;
	});

	/** Render a web component from the component/web folder. */
	eleventyConfig.addAsyncShortcode('component', async function (filename, componentOptions = {}) {
		const ext = componentOptions.ext || 'vto';
		const filePath = `${componentsFolder}/${filename}.${ext}`;
		const renderer = eleventyConfig.getShortcode('renderFile').bind(this);
		const content = renderer(filePath, componentOptions, ext); // Only pass in the provided data object
		return content;
	});
}
