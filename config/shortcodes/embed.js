export default function (eleventyConfig, options = {}) {
	if (!options || !options.hasOwnProperty('markdownEngine')) {
		throw new Error('The `options` argument expects a `markdownEngine` property to use as a Markdown renderer.');
	}

	const { markdownEngine } = options;

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

	eleventyConfig.addPairedShortcode('remotequote', function (content, author, url, date) {
		let authorLine = author;
		let domain;
		let citePrefix = '—';
		if (date && !isNaN(Date.parse(date))) {
			authorLine += `, ${eleventyConfig.getFilter('dateFormat')(new Date(date), { format: 'nice' })}`;
		}
		if (url) {
			authorLine = `<a href="${url}" rel="noreferrer noopener">${authorLine}</a>`;
			try {
				domain = new URL(url).hostname.replace(/^www\./, ''); // Get the domain (drop www if provided) // TODO Use URL.parse when using Node 22+
				if (domain) {
					authorLine += ` (on ${domain})`;
					citePrefix = `<img src="https://v1.indieweb-avatar.11ty.dev/https%3A%2F%2F${domain}%2F/" alt="" class="inline-icon inline-icon--center" loading="lazy" width="16" height="16">`;
				}
			} catch (e) {
				console.warn('Failed to parse URL provided to remotequote shortcode.', e);
			}
		}

		// Return as one line so the Markdown parser doesn't kick in — ugly as sin but it works!
		return `<blockquote class="remote-quote | flow">${markdownEngine.render(content.trim())}<footer><cite>${citePrefix} ${authorLine}</cite></footer></blockquote>`;
	});
}
