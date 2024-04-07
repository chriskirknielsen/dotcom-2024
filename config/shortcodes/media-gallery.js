//* Imports
import pluginImage from '@11ty/eleventy-img';
import { toNetlifyImage } from '../utils/image-transforms.js';

function imageGalleryShortcode(pictures, addClass = []) {
	let galleryClasses = [];
	if (addClass) {
		if (typeof addClass === 'string') {
			addClass = addClass.split(' ').filter((str) => str.length > 0);
		}
		galleryClasses = galleryClasses.concat(addClass);
	}

	return `<div class="${galleryClasses.join(' ')}">${pictures.trim()}</div>`;
}

function mediaShortcode(type, src, alt, caption = '', options = {}) {
	if (!['image', 'video'].includes(type)) {
		throw new Error(`The type parameter must either be image or video.`);
	}
	if (typeof alt === 'undefined') {
		throw new Error(`The ${src} ${type} does not have an alt attribute! (empty string is allowed)`);
	}

	if (!options.ratio && !options.width && !options.height) {
		throw new Error(`The ${src} ${type} does not have a ratio or width/height attributes. At least two of the three must be provided.`);
	}

	const isGroupContext = type === 'image' && options.hasOwnProperty('group') && options.group; // Whether the image is part of a group
	const sizes = ['100vw', '(min-width: 50rem) 50rem'].join(', ');
	const widths = type === 'video' ? [] : options.widths || [480, 800, 1200];
	const srcset = widths.map((w) => `${toNetlifyImage(src, { w: w })} ${w}w`);

	if (alt.indexOf('"') > -1) {
		alt = alt.split('"').join('&quot;');
	}
	if (alt.indexOf('<') > -1) {
		alt = alt.split('<').join('&lt;');
	}

	let attrs = {};

	if (type === 'video') {
		attrs = { controls: '', playsinline: '', muted: '', loop: '', 'aria-label': alt };

		if (options.hasOwnProperty('loop') && options.loop === false) {
			delete attrs.loop;
		}
		if (options.hasOwnProperty('muted') && options.muted === false) {
			delete attrs.muted;
		}

		// Add option for poster in videos
		if (options.poster) {
			attrs.poster = options.poster;
		}
	} else if (type === 'image') {
		attrs = { loading: 'lazy', decoding: 'async', alt: alt, srcset: srcset.join(', '), sizes: sizes };
	}

	// Assign a ratio to the media
	if (options.ratio) {
		// If the ratio is passed as a string, parse it to a number
		if (typeof options.ratio === 'string') {
			attrs['data-ratio'] = options.ratio; // Store the initial ratio provided

			if (options.ratio.includes('/')) {
				let ratioParts = options.ratio.split('/');
				options.ratio = parseFloat(ratioParts[0]) / parseFloat(ratioParts[1]);
			} else {
				options.ratio = parseFloat(options.ratio);
			}
		}

		// If only one dimension was provided, calculate the other based on the ratio
		if (options.width && !options.height) {
			options.height = options.width / options.ratio;
		} else if (!options.width && options.height) {
			options.height = options.height * options.ratio;
		} else if (!options.width && !options.height) {
			// If no dimensions were provided, assume a 1000px height and determine the width based on the ratio
			options.width = Math.floor(options.ratio * 1000);
			options.height = 1000;
		}
	}

	// Set the width and height attributes
	if (options.width) {
		attrs.width = options.width;
	}
	if (options.height) {
		attrs.height = options.height;
	}

	let ratioString = attrs['data-ratio'] || options.ratio ? parseFloat(options.ratio.toFixed(4)).toString() : `${attrs.width} / ${attrs.height}`;
	attrs.style = `aspect-ratio: ${ratioString}; max-width: 100%;`; // max-width is for RSS feeds

	const attrsStr = Object.entries(attrs)
		.map((attr) => `${attr[0]}="${attr[1]}"`)
		.join(' ');

	let mediaMarkup = '';
	if (type === 'video') {
		mediaMarkup = `<video src="${src}" ${attrsStr}></video>`;
	} else if (type === 'image') {
		mediaMarkup = `<a href="${src}"><img src="${toNetlifyImage(src, { w: widths.at(-2) })}" ${attrsStr} /></a>`;
	}

	let output;
	if (caption) {
		output = `<figure>${mediaMarkup}<figcaption>${caption}</figcaption></figure>`;
	} else {
		output = mediaMarkup;
	}

	// If not grouped in a gallery (wrapped in a {% gallery %} shortcode pair), make it a single-media gallery
	if (!isGroupContext) {
		return imageGalleryShortcode(output, options._galleryClasses);
	}

	return output;
}

const imageShortcode = (src, alt, caption = '', options = {}) => mediaShortcode('image', src, alt, caption, options);
const videoShortcode = (src, alt, caption = '', options = {}) => mediaShortcode('video', src, alt, caption, options);

export default function (eleventyConfig, options = {}) {
	const galleryClasses = options.galleryClasses || null;

	function mediaHandler(shortcodeHandler) {
		return function (src, alt = '', caption = '', opts = {}) {
			return shortcodeHandler(src, alt, caption, Object.assign({ _galleryClasses: galleryClasses }, opts));
		};
	}

	eleventyConfig.addShortcode('image', mediaHandler(imageShortcode));
	eleventyConfig.addShortcode('video', mediaHandler(videoShortcode));
	eleventyConfig.addPairedShortcode('gallery', (pictures) => imageGalleryShortcode(pictures, galleryClasses));

	eleventyConfig.addShortcode('footersvg', async function (src, attrs = {}) {
		let metadata = await pluginImage(`src/_includes/assets/svg/${src}`, {
			urlPath: `/assets/svg`,
			outputDir: `./_site/assets/svg/`,
			widths: [1200],
			formats: ['svg'],
			svgShortCircuit: true,
			filenameFormat: function (id, src, width, format, options) {
				const filename = src.split('/').at(-1).replace('.svg', ''); // Last part of the path, minus the extension (hardcoded because "footersvg" innit)
				return `${filename}.${format}`;
			},
		});

		return await pluginImage.generateHTML(metadata, { ...attrs, alt: '', loading: 'lazy', decoding: 'async' }, { pictureAttributes: attrs });
	});
}
