export default {
	tags: ['_pages'],
	section: 'page',
	permalink: (data) => `/${data.page.fileSlug}/index.html`,
	eleventyComputed: {
		layout: (data) => `page.${data.page.inputPath.endsWith('vto') ? 'vto' : 'njk'}`,
	},
};
