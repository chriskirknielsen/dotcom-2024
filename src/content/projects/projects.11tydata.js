export default {
	layout: 'project.vto',
	tags: ['_projects'],
	permalink: function (data) {
		return `/projects/${this.slugify(data.slug || data.page.fileSlug)}/index.html`;
	},
	eleventyComputed: {
		customMetaImage: function (data) {
			return `${this.removeTrailingSlash(data.page.url)}/${data.customMetaImage}`;
		},
	},
};
