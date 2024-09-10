export default function (eleventyConfig) {
	eleventyConfig.addShortcode('codepen', function (url, tabs = 'result', height = '480', theme = '') {
		const path = new URL(url).pathname;
		const id = path.split('/')[3];
		let markup = `<div class="codepen | cellstack cellstack--center" data-height="${height}" data-theme-id="${theme}" data-default-tab="${tabs}" data-slug-hash="${id}">
			<div class="single-media">
				<img src="https://shots.codepen.io/username/pen/${id}-512.webp?version=${Date.now()}" alt="" class="codepen-thumbnail" width="512" height="288" loading="lazy" decoding="async" style="height: ${height}px;">
			</div>
			<a href="${url}" class="button">View on CodePen</a>
		</div>`;

		// Only inject the CodePen embed once per page
		if (!this.page.hasOwnProperty('__codepen_embed_script_injected__') && !this.ctx.metadata.nakedJs) {
			markup += `<script async src="https://static.codepen.io/assets/embed/ei.js"></script>`;
			this.page.__codepen_embed_script_injected__ = true;
		}

		return markup;
	});
}
