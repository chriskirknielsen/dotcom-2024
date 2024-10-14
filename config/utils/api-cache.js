import { AssetCache } from '@11ty/eleventy-fetch';

/**
 * Query an API to check for updates, and if the data is stale, query it and cache it, else, serve from the cache.
 * @param {object} settings Configuration object for the cacheable API calls.
 * @param {object} settings.label Unique name given to each this particular API in the context of the build. If already in use, it will collide with existing data and serve the wrong cache.
 * @param {boolean} [settings.skipLocalCache] Optional. Whether the cache will be skipped (this should be read from a dot-env value and passed here). Defaults to `false`.
 * @param {string[]} settings.infoDateMarkers List of possible properties from the database info query that will hold useful date information, in order of usefulness.
 * @param {() => Promise<object>} settings.getInfo The async function which queries and processes data from the API to check for cache staleness. Should return an object with at least one property date-marker.
 * @param {(dbInfo: object) => Promise<any>} settings.getData The async function which queries and processes data from the API when the cache is unusable. Receives the `getInfo` result as the sole argument.
 * @returns {any} Data retrived from the API of from the cache.
 */
export default async function (settings) {
	const apiLabel = settings.label;
	const infoApiLabel = `${apiLabel}_info`;
	const dataApiLabel = `${apiLabel}_data`;
	const skipLocalCache = settings.skipLocalCache || false;
	let infoDateMarkers = settings.infoDateMarkers;
	if (infoDateMarkers.length === 0) {
		throw new Error('The `infoDateMarkers` cannot be empty.');
	} else if (!Array.isArray(infoDateMarkers) && typeof infoDateMarkers !== 'string') {
		throw new Error('The `infoDateMarkers` must be a string or an array of strings.');
	} else if (!Array.isArray(infoDateMarkers) && typeof infoDateMarkers === 'string') {
		infoDateMarkers = [infoDateMarkers]; // We need this to be an array
	}
	const getInfo = settings.getInfo;
	const getData = settings.getData;
	const getInfoMarker = (info) => info[infoDateMarkers.find((m) => info.hasOwnProperty(m) && info[m])] || '';

	// Initialise the asset caches
	const dbInfoCache = new AssetCache(infoApiLabel);
	const dbDataCache = new AssetCache(dataApiLabel);

	// Local dev: allow complete bypass
	if (skipLocalCache) {
		console.log(apiLabel + ': Skipping data cache for local development.');
	}

	// Grab the database's latest info (not the content, just metadata about it)
	const dbInfo = await (!skipLocalCache && dbInfoCache.cachedObject ? dbInfoCache.getCachedContents('json') : getInfo());

	// Determine when the database was updated by looking for the first available property
	const dbLastEdit = getInfoMarker(dbInfo);

	// Check if there is a cache object for the value we're after
	const isCachePresent = !skipLocalCache && dbInfoCache.cachedObject && dbDataCache.cachedObject;

	// If we have cached data, check if it's not outdated
	if (isCachePresent) {
		// Get the last cached value for the database info
		const cacheLastEditInfo = (await dbInfoCache.getCachedContents('json')) || {};
		const cacheLastEdit = getInfoMarker(cacheLastEditInfo);

		// If the cached last edit matches the live last edit, return the cached database contents and stop here
		if (dbLastEdit === cacheLastEdit) {
			const dbCache = await dbDataCache.getCachedContents('json');
			console.log(`\x1b[30m[11ty] \x1b[37mAPI Cache — \x1b[34m${apiLabel}: Found and reused cached data.\x1b[0m`);
			return dbCache;
		}
	}

	// We don't have data we can use, call the full APIs and cache the data
	console.log(`\x1b[30m[11ty] \x1b[37mAPI Cache — \x1b[36m${apiLabel}: Empty or stale cache, fetching latest data.\x1b[0m`);
	const dbData = await getData(dbInfo);

	// If this did change, save the new last edit date value after we know that the database access was successful
	dbInfoCache.save(dbInfo, 'json');

	// Save the data in the cache
	dbDataCache.save(dbData, 'json');

	// And finally, return the data
	return dbData;
}
