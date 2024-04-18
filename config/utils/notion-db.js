import 'dotenv/config';
import { AssetCache } from '@11ty/eleventy-fetch';
import { Client as NotionClient } from '@notionhq/client';

/**
 *
 * @param {object} queryConfig The configuration for the database call and data processing.
 * @param {string} queryConfig.databaseId The unique ID for the database to query.
 * @param {string} [queryConfig.label] Optional. Custom label to assign to the query, used for cache key generation and identification in logs. Defaults to the database ID.
 * @param {string[]} [queryConfig.propsToUse] Optional. List of properties to retrieve for each item in the database. Defaults to `['Title']`.
 * @param {object} [queryConfig.filter] Optional. Structured filtering to restrict which results are returned from the database. Defaults to an empty object to load all items. @see https://developers.notion.com/reference/post-database-query-filter
 * @param {function} [queryConfig.entryPostProcess] Optional. Function to run on each item retrieved from the database. Defaults to unprocessed items by default.
 * @param {function} [queryConfig.dataPostProcess] Optional. Function to run on all of the items at once after they have been run with `entryPostProcess` if provided. Defaults to unprocessed data by default.
 * @returns {object[]} List of results.
 */
export default async function (queryConfig) {
	const databaseId = queryConfig.databaseId;
	const label = queryConfig.label || databaseId;
	const propsToUse = queryConfig.propsToUse || ['Title'];
	const filter = queryConfig.filter || {};
	const entryPostProcess = queryConfig.entryPostProcess || null;
	const dataPostProcess = queryConfig.dataPostProcess || null;

	// Set up Notion stuff
	const notionClient = new NotionClient({ auth: process.env.NOTION_BEARER_TOKEN });

	// Initialise the asset caches
	const dbInfoCache = new AssetCache(label + '_database_last_edit');
	const dbDataCache = new AssetCache(label + '_database_content');

	// Local dev: allow complete bypass
	const LOCAL_DEV_SKIP_NOW_CACHE = process?.env?.LOCAL_DEV_SKIP_NOW_CACHE ? [true, 'true'].includes(process.env.LOCAL_DEV_SKIP_NOW_CACHE) : false;
	if (LOCAL_DEV_SKIP_NOW_CACHE) {
		console.log(label + ': Skipping data pull for local development.');
	}

	// Grab the database's latest info (not the content, just metadata about it)
	const dbInfo =
		!LOCAL_DEV_SKIP_NOW_CACHE && dbInfoCache.cachedObject
			? { last_edited_time: await dbInfoCache.getCachedContents('text') }
			: await notionClient.databases.retrieve({
					database_id: databaseId,
			  });

	// Determine when the DB was last edited, or created
	const dbLastEdit = dbInfo.last_edited_time || dbInfo.created_time || '';

	// Check if there is a cache object for the value we're after
	const isCachePresent = !LOCAL_DEV_SKIP_NOW_CACHE && dbInfoCache.cachedObject && dbDataCache.cachedObject;

	if (isCachePresent) {
		// Get the last cached value for the DB info
		const cacheLastEdit = (await dbInfoCache.getCachedContents('text')) || null;

		// If the cached last edit matches the live last edit, return the cached DB contents and stop here
		if (dbLastEdit === cacheLastEdit) {
			const dbCache = await dbDataCache.getCachedContents('json');
			console.log(label + ': Found and reused cached data.');
			return dbCache;
		}
	}

	console.log(label + ': No cached data, fetching latest data.');

	// Based on the DB info, build a list of the IDs for the properties needed for the Now page based on their name
	const databaseProps = dbInfo.properties;
	let propsById = [];
	for (let p in databaseProps) {
		if (propsToUse.includes(p)) {
			propsById.push(databaseProps[p].id);
		}
	}

	// Grab the results from the database
	let dbData = [];
	let data = { has_more: true, next_cursor: -1, results: [] };
	let queryObject = {
		database_id: databaseId,
		filter_properties: propsById,
		filter: filter,
	};

	while (data.has_more) {
		const queryCursor = data.next_cursor !== -1 ? { start_cursor: data.next_cursor } : {};
		const query = Object.assign(queryCursor, queryObject);
		data = await notionClient.databases.query(query);

		dbData = [...dbData, ...data.results];
	}

	// Only keep useful data
	const dbDataCleaned = typeof entryPostProcess === 'function' ? dbData.map(entryPostProcess) : dbData;
	const dbDataFinal = typeof dataPostProcess === 'function' ? dataPostProcess(dbDataCleaned) : dbDataCleaned;

	// If this did changed, save the new last edit date value after we know that the DB access was successful
	dbInfoCache.save(dbLastEdit, 'text');

	// Save the data in the cache
	dbDataCache.save(dbDataFinal, 'json');

	// And finally, return the data
	return dbDataFinal;
}
