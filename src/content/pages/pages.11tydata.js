export default {
	layout: 'page.njk',
	tags: ['_pages'],
	section: 'page',
	permalink: (data) => `/${data.page.fileSlug}/index.html`,
};
