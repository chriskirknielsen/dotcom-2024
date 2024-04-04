export default {
	layout: 'project.njk',
	tags: ['_projects'],
	permalink: function (data) {
		return `/projects/${this.slug(data.slug || data.page.fileSlug)}/index.html`;
	},
	eleventyComputed: {
		customMetaImage: function (data) {
			return `${this.removeTrailingSlash(data.page.url)}/${data.customMetaImage}`;
		},
	},
};
