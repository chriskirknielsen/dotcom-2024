import Module from 'node:module';
const require = Module.createRequire(import.meta.url);
import 'dotenv/config';
import apiCache from './api-cache.js';
const { exchangeNpssoForCode, exchangeCodeForAccessToken, getUserTitles } = require('psn-api');

const PSN_API_MAX_PAGE_SIZE = 800; // This is a hardcoded limit to the number of titles that can be returned in a single getUserTitles call
const psnApiPageSize = Math.min(500, PSN_API_MAX_PAGE_SIZE); // Preferred page size, but not more than the max

/** Retrieve trophy data from the PlayStation Network. */
export default async function () {
	// Set up access to the PSN API
	const accessCode = await exchangeNpssoForCode(process.env.PLAYSTATION_NPSSO_TOKEN);
	const authorization = await exchangeCodeForAccessToken(accessCode);

	// Get the cache data, and if missing or stale, provide the complete data query logic
	const cachedData = apiCache({
		label: 'psn-api.js',
		infoDateMarkers: ['lastUpdatedDateTime'],
		getInfo: async () => getUserTitles({ accessToken: authorization.accessToken }, 'me', { limit: 1 }).then((t) => t.trophyTitles[0]),
		getData: async function (dbInfo) {
			let trophyTitlesResponse = []; // Initialise array to hold all the values
			let nextOffset = 0; // Start at the beginning

			// Loop through the pages of the API
			while (nextOffset !== undefined) {
				// Get the slice of data based on the current page
				let responseSlice = await getUserTitles({ accessToken: authorization.accessToken }, 'me', { limit: psnApiPageSize, offset: nextOffset });

				// Append the data from this page
				trophyTitlesResponse = trophyTitlesResponse.concat(responseSlice.trophyTitles);

				// This value will be `undefined` if there is no more data, stopping the loop as a result
				nextOffset = responseSlice.nextOffset;
			}

			// Remove hidden titles
			const trophyTitles = trophyTitlesResponse.filter((t) => !t.hiddenFlag);

			// Return that sweet, sweet data
			return trophyTitles;
		},
	});

	return cachedData;
}
