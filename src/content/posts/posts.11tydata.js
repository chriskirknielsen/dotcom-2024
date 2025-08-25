export default {
	layout: 'post.vto',
	tags: ['_posts', '_og'],
	section: 'post',
	eleventyComputed: {
		date: function (data) {
			const date = new Date(data.date || data.page.date);
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
			if (data.permalink) {
				return this.toOgImage(data);
			}
			return this.toPath([data.assets.images, 'metaimage-blog.jpg']);
		},
		ogImageSummary: function (data) {
			const date = new Date(data.date || data.page.date);
			if (data.time) {
				const datetime = new Date(date.toISOString().replace('00:00:00', data.time));
				if (datetime !== 'Invalid DateTime') {
					return new Intl.DateTimeFormat('en-GB', {
						year: 'numeric',
						month: 'long',
						day: 'numeric',
						timeZone: 'UTC',
					}).format(datetime);
				}
			}
			return null;
		},
	},
};
