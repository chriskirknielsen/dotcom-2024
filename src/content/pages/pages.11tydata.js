import assetsPath from '../../_data/assets.js';
export default {
	tags: ['_pages'],
	section: 'page',
	permalink: (data) => `/${data.page.fileSlug}/index.html`,
	layout: 'page.vto',
	eleventyComputed: {
		customMetaImage: function (data) {
			if (data.permalink) {
				return this.toOgImage(data);
			}

			return this.toPath([assetsPath.images, data.ogImageBackup || 'metaimage.jpg']);
		},
	},
};
