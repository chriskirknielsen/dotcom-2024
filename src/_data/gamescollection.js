import 'dotenv/config';
import notionDatabaseQuery from '../../config/utils/notion-db.js';

export default notionDatabaseQuery({
	databaseId: process.env.NOTION_DATABASE_ID_LUDOTHEQUE,
	label: 'gamescollection.js',
	propsToUse: ['Title', 'Sort Title', 'Edition', 'Platform', 'Format', 'Discs', 'Year', 'Sub-item'],
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
	entryPostProcess: (entry) => {
		const props = entry.properties;

		return {
			title: props.Title.title.pop().plain_text,
			sortTitle: props['Sort Title'].rich_text.map((textBlock) => textBlock.plain_text).join(''),
			edition: props.Edition.rich_text.map((textBlock) => textBlock.plain_text).join(''),
			platform: props.Platform.select?.name,
			format: props.Format.select?.name,
			discs: props.Discs.number || null,
			year: props.Year.number || null,
			subItems: props['Sub-item'].relation || [],
		};
	},
});
