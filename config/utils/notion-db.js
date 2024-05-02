import 'dotenv/config';
import apiCache from './api-cache.js';
import { Client as NotionClient } from '@notionhq/client';

/**
 * Retrieve data from a Notion database.
 * @param {object} queryConfig The configuration for the database call and data processing.
 * @param {string} queryConfig.databaseId The unique ID for the database to query.
 * @param {string} [queryConfig.label] Optional. Custom label to assign to the query, used for cache key generation and identification in logs. Defaults to the database ID.
 * @param {string[]} [queryConfig.propsToUse] Optional. List of properties to retrieve for each item in the database. Defaults to `['Title']`.
 * @param {object} [queryConfig.filter] Optional. Structured filtering to restrict which results are returned from the database. Defaults to an empty object to load all items. @see https://developers.notion.com/reference/post-database-query-filter
 * @param {(data: any) => any} [queryConfig.dataPostProcess] Optional. Processing function to run on the fetched data before it is cached. Defaults to unprocessed data by default.
 * @returns {object[]} List of results.
 */
export default async function (queryConfig) {
	const databaseId = queryConfig.databaseId;
	const label = queryConfig.label || databaseId;
	const propsToUse = queryConfig.propsToUse || ['Title'];
	const filter = queryConfig.filter || {};
	const dataPostProcess = queryConfig.dataPostProcess || null;

	// Set up Notion stuff
	const notionClient = new NotionClient({ auth: process.env.NOTION_BEARER_TOKEN });

	// Get the cache data, and if missing or stale, provide the complete data query logic
	const cachedData = apiCache({
		label: label,
		infoDateMarkers: ['last_edited_time', 'created_time'],
		getInfo: async () => notionClient.databases.retrieve({ database_id: databaseId }),
		getData: async function (dbInfo) {
			// Based on the database info, build a list of the IDs for the properties needed based on their name
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
			const queryObject = {
				database_id: databaseId,
				filter_properties: propsById,
				filter: filter,
			};

			// Loop as long as there are results
			while (data.has_more) {
				const queryCursor = data.next_cursor !== -1 ? { start_cursor: data.next_cursor } : {};
				const query = Object.assign(queryCursor, queryObject);
				data = await notionClient.databases.query(query);

				dbData = [...dbData, ...data.results];
			}

			// Only keep useful data
			const dbDataProcessed = typeof dataPostProcess === 'function' ? dataPostProcess(dbData) : dbData;

			// Return that sweet, sweet data
			return dbDataProcessed;
		},
	});

	return cachedData;
}
