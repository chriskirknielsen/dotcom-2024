import 'dotenv/config';
import notionDatabaseQuery from '../../config/utils/notion-db.js';

/**
 * Group an array of objects by a property.
 * @link https://gist.github.com/robmathers/1830ce09695f759bf2c4df15c29dd22d
 * @param {object[]} data Array of objects to group.
 * @param {string} key Property of each object to use for grouping.
 * @returns {{ keyValue: object[] }[]} Grouped objects
 */
function groupBy(data, key) {
	// `data` is an array of objects, `key` is the key (or property accessor) to group by
	// reduce runs this anonymous function on each element of `data` (the `item` parameter,
	// returning the `storage` parameter at the end
	return data.reduce(function (storage, item) {
		// get the first instance of the key by which we're grouping
		var group = item[key];

		// set `storage` for this instance of group to the outer scope (if not empty) or initialize it
		storage[group] = storage[group] || [];

		// add this item to its group within `storage`
		storage[group].push(item);

		// return the updated storage to the reduce function, which will then loop through the next
		return storage;
	}, {}); // {} is the initial value of the storage
}

/** Converts a Notion rich text block to a Markdown string. */
function richTextBlockToMd(block) {
	const string = block.text.content;
	let wrap = [];
	if (block.annotations.bold) {
		wrap.push('**');
	}
	if (block.annotations.italic) {
		wrap.push('_');
	}
	if (block.annotations.underline) {
		wrap.push('_');
	}
	if (block.annotations.strikethrough) {
		wrap.push('~~');
	}
	if (block.annotations.code) {
		wrap.push('`');
	}
	let mdString = `${wrap.join('')}${string}${wrap.reverse().join('')}`;
	if (block.href) {
		return `[${mdString}](${block.href})`;
	}
	return mdString;
}

export default notionDatabaseQuery({
	databaseId: process.env.NOTION_DATABASE_ID_NOW,
	label: 'now.js',
	propsToUse: ['title', 'detail', 'blurb', 'category', 'link', 'image'],
	filter: {
		and: [
			{
				property: 'category',
				select: { is_not_empty: true },
			},
			{
				property: 'archived',
				checkbox: { equals: false },
			},
		],
	},
	entryPostProcess: (entry) => {
		const props = entry.properties;

		return {
			title: props.title.title.pop().plain_text,
			detail: props.detail.rich_text.map((textBlock) => textBlock.plain_text).join(''),
			blurb: props.blurb.rich_text.map((textBlock) => richTextBlockToMd(textBlock)).join(''),
			category: props.category.select?.name,
			link: props.link.url,
			image: props.image.files.length > 0 ? (props.image.files[0].type === 'external' ? props.image.files[0].external.url : props.image.files[0].file.url) : null,
		};
	},
	dataPostProcess: (data) => groupBy(data, 'category'),
});
