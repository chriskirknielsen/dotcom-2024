export default {
	tags: ['_pages'],
	section: 'page',
	permalink: (data) => `/${data.page.fileSlug}/index.html`,
	layout: 'page.vto',
};
