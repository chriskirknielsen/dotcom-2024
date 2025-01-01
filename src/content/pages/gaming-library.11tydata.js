import 'dotenv/config';
import getPsnTrophyData from '../../../config/utils/psn-api.js';
import notionDatabaseQuery from '../../../config/utils/notion-db.js';
import { toCloudinary } from '../../../config/utils/image-transforms.js';

const regions = {
	FR: 'France',
	AU: 'Australia',
	US: 'United States',
	CA: 'Canada',
	JP: 'Japan',
	UK: 'United Kingdom',
	EU: 'Europe',
};

const gameslibrary = await notionDatabaseQuery({
	databaseId: process.env.NOTION_DATABASE_ID_LUDOTHEQUE,
	label: 'games-library',
	propsToUse: ['Title', 'Sort Title', 'PSN ID', 'Edition', 'Platform', 'Region', 'DLC', 'Completed', 'Discs', 'Year', 'Parent item', 'Sub-item', 'Thumbnail', 'Boxart', 'Rating'],
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
	dataPostProcess: async (data) => {
		const psnTrophyData = await getPsnTrophyData().catch((err) => {
			const errorMessage = err.message
				.split(/\n/)
				.map((s) => s.trim())
				.join(' ')
				.trim();
			console.log(`\x1b[30m[11ty] \x1b[31mpsi-api error: ${errorMessage}\x1b[0m`);
			return []; // If the trophy information is not available, don't fail the build
		});

		const normalizedData = data
			.filter((entry) => {
				return entry.properties.Title.title.length > 0; // Remove Untitled entries
			})
			.map((entry) => {
				const props = entry.properties;

				const processedEntry = {
					id: entry.id,
					title: props.Title.title.pop().plain_text,
					sortTitle: props['Sort Title'].rich_text.map((textBlock) => textBlock.plain_text).join(''),
					edition: props.Edition.rich_text.map((textBlock) => textBlock.plain_text).join(''),
					platform: props.Platform.select?.name,
					region: regions[props.Region.select?.name] || null,
					dlc: props.DLC.rich_text.map((textBlock) => textBlock.plain_text).join(''),
					discs: props.Discs.number || null,
					year: props.Year.number || null,
					rating: props.Rating.number || null,
					completed: props.Completed.checkbox || false,
					parentItem: props['Parent item'].relation || [],
					subItems: props['Sub-item'].relation || [],
					psnId: props['PSN ID'].rich_text
						.map((textBlock) => textBlock.plain_text)
						.join('')
						.trim(),
					boxart:
						props.Boxart.files.length > 0
							? {
									url: props.Boxart.files[0].type === 'external' ? props.Boxart.files[0].external.url : props.Boxart.files[0].file.url,
									width: props.Boxart.files[0].name.split('x')[0],
									height: props.Boxart.files[0].name.split('x')[1],
							  }
							: null,
					trophyIcon:
						props.Thumbnail.files.length > 0
							? props.Thumbnail.files[0].type === 'external'
								? props.Thumbnail.files[0].external.url
								: props.Thumbnail.files[0].file.url
							: null,
				};

				const matchedPsnTrophyData = psnTrophyData.find((game) => game.npCommunicationId === processedEntry.psnId);
				if (matchedPsnTrophyData) {
					processedEntry.trophyIcon = matchedPsnTrophyData.trophyTitleIconUrl;
					processedEntry.trophyProgress = matchedPsnTrophyData.progress;
					processedEntry.trophyEarned = matchedPsnTrophyData.earnedTrophies;
				}

				// If there's an icon, make sure it's resized appropriately
				if (processedEntry.trophyIcon) {
					processedEntry.trophyIcon = toCloudinary(processedEntry.trophyIcon, `c_fit,h_128/q_80/f_auto`);
				} else {
					delete processedEntry.trophyIcon;
				}
				delete processedEntry.psnId; // Once we have trophy data, we can discard the PSN's reference code to it

				return processedEntry;
			});

		// Here's a dirty trick… JavaScript provides each item in a loop by reference, which means that it is mutable,
		// so to avoid a .map() directly followed by a .filter(), we can instead use a filter to exclude results we don't want
		// while also looking for the data we want to update, since we have access to the entire array even as we discard items,
		// because .filter() creates a shallow copy and doesn't mutate `data` itself. Nasty trick, but if you're looping over
		// a lot of data, doing a single loop instead of two can be practical to shave off some processing time! (probably about 3ms lol)
		// Basically I've discovered .reduce() I guess?
		const filteredData = normalizedData.filter((item) => {
			// If there are sub-items, let's find them in the list, grab their title + completion status, and use that as their value
			if (item.subItems.length > 0) {
				let totalCompletion = [];

				const processedSubItem = item.subItems
					.map((sub) => {
						const matched = normalizedData.find((entry) => sub.id === entry.id);
						if (!matched) {
							return false; // Hidden items will not be surfaced
						}
						totalCompletion.push(matched.completed);
						return {
							title: matched.title,
							sortTitle: matched.sortTitle,
							completed: matched.completed,
							trophyProgress: matched.trophyProgress,
							trophyEarned: matched.trophyEarned,
						};
					})
					.filter((t) => Boolean(t))
					.sort((a, b) => a.sortTitle.localeCompare(b.sortTitle, 'en', { numeric: true }))
					.map((sub) => {
						delete sub.sortTitle; // We don't need this property once we've sorted the sub-items
						return sub;
					});
				item.subItems = processedSubItem;
				// If all items have the same checked value, we can use that as a parent-level completion indicator, or else use a null to indicate an indeterminate state
				item.completed = new Set(totalCompletion).size === 1 ? totalCompletion.at(0) : null;
			}

			// We only want to show top-level items, so we can reject sub-items if their have a non-empty parentItem value
			return item.parentItem.length === 0;
		});

		// Provide a compiled list of all trophy levels
		const totalTrophyData = psnTrophyData.map((t) => t.earnedTrophies).reduce((p, c) => Object.fromEntries(Object.keys(p).map((k) => [k, p[k] + c[k]])));

		return {
			meta: { totalTrophyData },
			data: filteredData,
		};
	},
});

export { gameslibrary };
