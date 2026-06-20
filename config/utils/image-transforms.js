const BUILD_CONTEXT = ['serve', 'watch'].includes(process.env.ELEVENTY_RUN_MODE) ? 'DEV' : 'LIVE';
const NETLIFY_LOCAL = process.env.NETLIFY_LOCAL === 'true';

function toNetlifyImage(url, options = {}) {
	if (BUILD_CONTEXT === 'DEV' && !NETLIFY_LOCAL) {
		return url;
	}

	if (!url) {
		throw new Error('Cannot convert to Netlify Image CDN: `url` value missing!');
	}
	let urlSearchParams = new URLSearchParams();
	if (typeof options === 'string') {
		urlSearchParams = new URLSearchParams(options);
	} else if (typeof options === 'object') {
		for (let [param, value] of Object.entries(options)) {
			urlSearchParams.append(param, value);
		}
	}

	urlSearchParams.append('url', url);

	const queryString = `/.netlify/images?${urlSearchParams.toString()}`;
	return queryString;
}

function toCloudinary(url, options) {
	if (!url) {
		throw new Error('Cannot convert to Cloudinary CDN: `url` value missing!');
	}

	const cloudinaryAccountUrl = `https://res.cloudinary.com/chriskirknielsen`;

	if (url.startsWith(cloudinaryAccountUrl)) {
		return url;
	}

	const prefixStr = `${cloudinaryAccountUrl}/image/fetch`;
	const optionsStr = String(options || '');
	const encodedUrl = encodeURI(url);
	const parts = [prefixStr, optionsStr, encodedUrl].filter(Boolean); // Remove empty parts (it can only be the options, or something is very wrong)
	const joinedParts = parts.join('/');
	return joinedParts;
}

export { toNetlifyImage, toCloudinary };
