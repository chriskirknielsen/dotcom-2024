import { toNetlifyImage, toCloudinary } from '../utils/image-transforms.js';

export default function (eleventyConfig) {
	/** Checks if the provided URL is the current page and returns the correct ARIA attribute. */
	eleventyConfig.addFilter('current', (url, page) => (page.url === url ? 'aria-current="page"' : ''));

	eleventyConfig.addFilter('toRoot', function (url) {
		return url.replace(/^(\.?\/){1}/, this.ctx.page.url);
	});

	/** Passes a local or remote URL string to Netlify Image CDN */
	eleventyConfig.addFilter('toNetlifyImage', toNetlifyImage);

	/** Passes a local or remote URL string to Cloudinary CDN */
	eleventyConfig.addFilter('toCloudinary', toCloudinary);
}
