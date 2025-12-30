export default {
	layout: 'post.vto',
	tags: ['_posts', '_og'],
	section: 'post',
	time: '00:00:00',
	eleventyComputed: {
		date: function (data) {
			const date = new Date(data.date || data.page.date);
			if (data.time) {
				const datetime = new Date(date.toISOString().replace('00:00:00', data.time)); // A little faster than individually replacing hours/minutes/seconds
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
			let baseSlug = data.slug; // By default, use the provided slug, if any (considered a hardcoded override, so no other logic should run if this exists)

			if (!baseSlug) {
				baseSlug = data.page.fileSlug; // Fall back to the computed file slug (date prefix is discarded)
				const postYMD = (data.date || data.page.date).toISOString().split('T').shift(); // Extract the Y-M-D date of the post

				// If the post slug is equal to the date, it's likely a containing folder without a Y-M-D-slug format, so we can use the title as a base string instead
				if (postYMD === data.page.fileSlug) {
					baseSlug = data.title; // This gets slugified, it's fine
				}
			}

			return `blog/${this.slugify(baseSlug)}/index.html`; // Build the permalink by slugifying the final string used a slug, to ensure it is safe to use
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
