import 'dotenv/config';
import { AssetCache } from '@11ty/eleventy-fetch';
import { Client as NotionClient } from '@notionhq/client';

export default async function () {
	// Set up Notion stuff
	const notionClient = new NotionClient({ auth: process.env.NOTION_BEARER_TOKEN });
	const databaseId = process.env.NOTION_DATABASE_ID_LUDOTHEQUE;

	// Initialise the asset caches
	const dbInfoCache = new AssetCache('ludotheque_database_last_edit');
	const dbDataCache = new AssetCache('ludotheque_database_content');

	// Local dev: allow complete bypass
	const LOCAL_DEV_SKIP_NOW_CACHE = process?.env?.LOCAL_DEV_SKIP_NOW_CACHE ? [true, 'true'].includes(process.env.LOCAL_DEV_SKIP_NOW_CACHE) : false;
	if (LOCAL_DEV_SKIP_NOW_CACHE) {
		console.log('collection.js: Skipping data pull for local development.');
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
			console.log('collection.js: Found and reused cached data.');
			return dbCache;
		}
	}

	console.log('collection.js: No cached data, fetching latest data.');

	// Based on the DB info, build a list of the IDs for the properties needed for the Now page based on their name
	const databaseProps = dbInfo.properties;
	const propsToUse = ['Title', 'Sort Title', 'Edition', 'Platform', 'Year', 'Sub-item'];
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
		filter: {
			and: [
				{
					property: 'Platform',
					select: { is_not_empty: true },
				},
				{
					property: 'Platform',
					select: { does_not_equal: 'PC' },
				},
				{
					property: 'Platform',
					select: { does_not_equal: 'GameBoy' },
				},
				{
					property: 'Platform',
					select: { does_not_equal: 'GameBoy Advance' },
				},
				{
					property: 'Loan/Sold',
					checkbox: { equals: false },
				},
				{
					property: 'Hidden',
					checkbox: { equals: false },
				},
				{
					property: 'Parent item',
					relation: { is_empty: true },
				},
			],
		},
	};

	while (data.has_more) {
		const queryCursor = data.next_cursor !== -1 ? { start_cursor: data.next_cursor } : {};
		const query = Object.assign(queryCursor, queryObject);
		data = await notionClient.databases.query(query);

		dbData = [...dbData, ...data.results];
	}

	// Only keep useful data
	const dbDataCleaned = dbData.map((entry) => {
		const props = entry.properties;

		return {
			title: props.Title.title.pop().plain_text,
			sortTitle: props['Sort Title'].rich_text.map((textBlock) => textBlock.plain_text).join(''),
			edition: props.Edition.rich_text.map((textBlock) => textBlock.plain_text).join(''),
			platform: props.Platform.select?.name,
			year: props.Year.number || null,
			subItems: props['Sub-item'].relation || [],
		};
	});

	// If this did changed, save the new last edit date value after we know that the DB access was successful
	dbInfoCache.save(dbLastEdit, 'text');

	// Save the data in the cache
	dbDataCache.save(dbDataCleaned, 'json');

	// And finally, return the data
	return dbDataCleaned;
}
