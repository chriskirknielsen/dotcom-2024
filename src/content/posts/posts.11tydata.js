export default {
	layout: 'post.njk',
	tags: ['_posts'],
	section: 'post',
	eleventyComputed: {
		date: function (data) {
			const date = data.date || data.page.date;
			if (data.time) {
				const datetime = new Date(date.toISOString().replace('00:00:00', data.time));
				if (datetime !== 'Invalid DateTime') {
					return datetime;
				}
			}
			return date;
		},
		year: function (data) {
			return new Date(data.date || data.page.date).getFullYear();
		},
		permalink: function (data) {
			return `blog/${this.slugify(data.slug || data.page.fileSlug)}/index.html`;
		},
		customMetaImage: function (data) {
			return this.toPath([data.assets.images, 'metaimage-blog.jpg']);
		},
	},
};
