export default function (eleventyConfig, options = {}) {
	if (!options || !options.hasOwnProperty('markdownEngine')) {
		throw new Error('The `options` argument expects a `markdownEngine` property to use as a Markdown renderer.');
	}

	const { markdownEngine } = options;

	eleventyConfig.addPairedShortcode('callout', function (content, heading = '', emoji = '', isInline = true) {
		const uniqueId = `co-${parseInt(String(Math.random()).split('.')[1], 10).toString(36)}`;
		const emojiStyleAttr = emoji ? `style="--callout-emoji: '${emoji}'"` : '';
		heading ||= 'Note';
		let render = isInline ? `<p>${markdownEngine.renderInline(content.trim())}</p>` : markdownEngine.render(content.trim());

		// Little trick to avoid additional whitespace
		return ''.concat(
			`<div class="callout" aria-labelledby="${uniqueId}">`,
			`<p id="${uniqueId}" class="callout-label | h4" ${emojiStyleAttr}>${heading}</p>`,
			render.trim(),
			`</div>`
		);
	});
}
