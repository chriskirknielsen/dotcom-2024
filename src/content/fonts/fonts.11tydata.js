export default {
	layout: false,
	tags: ['_fonts'],
	permalink: (data) => `/fonts/${data.page.fileSlug}/index.html`,
	isMiniSite: true,
	eleventyComputed: {
		customMetaImage: function (data) {
			return `${this.removeTrailingSlash(data.page.url)}/${data.customMetaImage}`;
		},
	},
};
