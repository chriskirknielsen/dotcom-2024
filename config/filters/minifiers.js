import esbuild from 'esbuild';
import { transform } from 'lightningcss';

let CACHE = { js: {}, css: {} };

async function cachedMinify(code, cacheKey, type, transformer) {
	try {
		if (cacheKey && CACHE[type] && CACHE[type].hasOwnProperty(cacheKey)) {
			const cacheValue = await Promise.resolve(CACHE[type][cacheKey]); // Wait for the data, wrapped in a resolved promise in case the original value already was resolved
			return cacheValue.code.trim(); // Access the code property of the cached value
		} else {
			const minified = transformer(code);
			if (cacheKey) {
				CACHE[type][cacheKey] = minified; // Store the promise which has the minified output (an object with a code property)
			}
			return (await minified).code.trim(); // Await and use the return value in the callback
		}
	} catch (err) {
		console.error(`${type.toUpperCase()} minify error:`, err);
		return code; // Fail gracefully.
	}
}

async function cachedJsmin(code, cacheKey = null) {
	const transformer = (code) => esbuild.transform(code, { minify: true });
	return cachedMinify(code, cacheKey, 'js', transformer);
}

async function cachedCssmin(code, cacheKey = null) {
	const transformer = (code) => transform({ code: Buffer.from(code), minify: true, sourceMap: false });
	return cachedMinify(code, cacheKey, 'css', transformer);
}

export default async function (eleventyConfig, options = {}) {
	if (options.useCache) {
		eleventyConfig.on('eleventy.before', function () {
			// Reset cache
			CACHE.js = {};
			CACHE.css = {};
			return true; // Ensure the event callback is signaled as completed
		});
	}

	/** Minify a block of JavaScript code and optionally caches the result for reuse if a key is provided. */
	eleventyConfig.addNunjucksAsyncFilter('jsmin', async function (code, ...rest) {
		const callback = rest.pop();
		const cacheKey = rest.length > 0 ? rest[0] : null;
		const cachedCode = await cachedJsmin(code, cacheKey);
		callback(null, cachedCode); // Fail gracefully.
	});

	/** Add ability to minify inline CSS. */
	eleventyConfig.addNunjucksAsyncFilter('cssmin', async function (code, ...rest) {
		const callback = rest.pop();
		const cacheKey = rest.length > 0 ? rest[0] : null;
		const cachedCode = await cachedCssmin(code, cacheKey);
		callback(null, cachedCode); // Fail gracefully.
	});
}
export { cachedCssmin, cachedJsmin };
