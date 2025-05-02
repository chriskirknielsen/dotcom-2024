import { toNetlifyImage, toCloudinary } from '../utils/image-transforms.js';

const removeTrailingSlash = (str) => str.trim().replace(/\/$/g, '');

export default function (eleventyConfig) {
	/** Checks if the provided URL is the current page and returns the correct ARIA attribute. */
	eleventyConfig.addFilter('getIsCurrentPage', (url, page) => (page.url === url ? 'aria-current="page"' : ''));

	/** Removes any slash at the end of a string. */
	eleventyConfig.addFilter('removeTrailingSlash', removeTrailingSlash);

	/** Rewrites a path so the current directory `./` becomes the path from the root, e.g. `./foo.jpg` within /projects/xyz becomes `/projects/xyz/foo.jpg` */
	eleventyConfig.addFilter('toRoot', function (url) {
		return url.replace(/^(\.?\/){1}/, this.ctx.page.url); //! Cannot be fat arrow function to preserve `this`
	});

	/** Joins an array of path parts into a single part, optionally with a different root. Does not preserve trailing slashes for directory paths. */
	eleventyConfig.addFilter('toPath', (parts, root = '/') => {
		const path = parts
			.map((p) => removeTrailingSlash(p.trim()))
			.filter(Boolean)
			.join('/');
		return root + path;
	});

	/** Passes a local or remote URL string to Netlify Image CDN */
	eleventyConfig.addFilter('toNetlifyImage', toNetlifyImage);

	/** Passes a local or remote URL string to Cloudinary CDN */
	eleventyConfig.addFilter('toCloudinary', toCloudinary);
}
