import esbuild from 'esbuild';
import { transform, Features } from 'lightningcss';

let CACHE = { js: {}, css: {} };

async function cachedMinify(input, cacheKey, type, transformer) {
	try {
		let promiseOutput;
		if (cacheKey && CACHE[type] && CACHE[type].hasOwnProperty(cacheKey)) {
			promiseOutput = CACHE[type][cacheKey]; // Retrieve the cache
		} else {
			promiseOutput = transformer(input);
			if (cacheKey) {
				CACHE[type][cacheKey] = promiseOutput; // Store the promise which has the minified output (an object with a code property)
			}
		}
		return (await promiseOutput).code; // Await and use the return value in the callback
	} catch (err) {
		console.error(`${type.toUpperCase()} minify error:`, err);
		return input; // Fail gracefully.
	}
}

async function cachedJsmin(input, cacheKey = null) {
	const transformer = (code) =>
		esbuild.transform(code, { minify: true }).then((content) => {
			return {
				...content,
				code: content.code.trim(),
			};
		});
	return cachedMinify(input, cacheKey, 'js', transformer);
}

async function cachedCssmin(input, cacheKey = null) {
	const transformer = (code) => transform({ code: Buffer.from(code), minify: true, sourceMap: false, include: Features.Nesting });
	return cachedMinify(input, cacheKey, 'css', transformer);
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
	eleventyConfig.addAsyncFilter('jsmin', async function (code, cacheKey = null) {
		return cachedJsmin(code, cacheKey);
	});

	/** Add ability to minify inline CSS. */
	eleventyConfig.addAsyncFilter('cssmin', async function (code, cacheKey = null) {
		return cachedCssmin(code, cacheKey);
	});

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
