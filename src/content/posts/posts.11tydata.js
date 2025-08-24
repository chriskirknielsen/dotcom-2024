export default {
	layout: 'post.vto',
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
			if (data.permalink) {
				const absolutePermalink = `${data.metadata.url}/${data.permalink.replace('index.html', 'og.html')}`;
				const ogUrl = `https://v1.screenshot.11ty.dev/${encodeURIComponent(absolutePermalink)}/opengraph/`;
				return ogUrl;
			}
			return this.toPath([data.assets.images, 'metaimage-blog.jpg']);
		},
	},
};
