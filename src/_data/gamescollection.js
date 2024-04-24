import 'dotenv/config';
import notionDatabaseQuery from '../../config/utils/notion-db.js';

const regions = {
	FR: 'France',
	AU: 'Australia',
	US: 'United States',
	CA: 'Canada',
	JP: 'Japan',
	UK: 'United Kingdom',
	EU: 'Europe',
};

export default notionDatabaseQuery({
	databaseId: process.env.NOTION_DATABASE_ID_LUDOTHEQUE,
	label: 'gamescollection.js',
	propsToUse: ['Title', 'Sort Title', 'Edition', 'Platform', 'Region', 'DLC', 'Completed', 'Discs', 'Year', 'Parent item', 'Sub-item'],
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
			// {
			// 	property: 'Parent item',
			// 	relation: { is_empty: true },
			// },
		],
	},
	entryPostProcess: (entry) => {
		const props = entry.properties;

		return {
			id: entry.id,
			title: props.Title.title.pop().plain_text,
			sortTitle: props['Sort Title'].rich_text.map((textBlock) => textBlock.plain_text).join(''),
			edition: props.Edition.rich_text.map((textBlock) => textBlock.plain_text).join(''),
			platform: props.Platform.select?.name,
			region: regions[props.Region.select?.name] || null,
			dlc: props.DLC.rich_text.map((textBlock) => textBlock.plain_text).join(''),
			discs: props.Discs.number || null,
			year: props.Year.number || null,
			completed: props.Completed.checkbox || false,
			parentItem: props['Parent item'].relation || [],
			subItems: props['Sub-item'].relation || [],
		};
	},
	dataPostProcess: (data) => {
		// Here's a dirty trick… JavaScript provides each item in a loop by reference, which means that it is mutable,
		// so to avoid a .map() directly followed by a .filter(), we can instead use a filter to exclude results we don't want
		// while also looking for the data we want to update, since we have access to the entire array even as we discard items,
		// because .filter() creates a shallow copy and doesn't mutate `data` itself. Nasty trick, but if you're looping over
		// a lot of data, doing a single loop instead of two can be practical to shave off some processing time! (probably about 3ms lol)
		return data.filter((item) => {
			// If there are sub-items, let's find them in the list, grab their title + completion status, and use that as their value
			if (item.subItems.length > 0) {
				let totalCompletion = [];
				const processedSubItem = item.subItems
					.map((sub) => {
						const matched = data.find((entry) => sub.id === entry.id);
						totalCompletion.push(matched.completed);
						return {
							title: matched.title,
							sortTitle: matched.sortTitle,
							completed: matched.completed,
						};
					})
					.sort((a, b) => a.sortTitle.localeCompare(b.sortTitle, 'en', { numeric: true }))
					.map((sub) => {
						delete sub.sortTitle; // We don't need this property once we've sorted the sub-items
						return sub;
					});
				item.subItems = processedSubItem;
				// If all items have the same checked value, we can use that as a parent-level completion indicator, or else use a null to indicate an indeterminate state
				item.completed = totalCompletion.every((c) => c === totalCompletion.at(0)) ? totalCompletion.at(0) : null;
			}

			// We only want to show top-level items, so we can reject sub-items if their have a non-empty parentItem value
			return item.parentItem.length === 0;
		});
	},
});
