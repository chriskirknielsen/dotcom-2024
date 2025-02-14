export default function (eleventyConfig, options = {}) {
	if (!options || !options.hasOwnProperty('markdownEngine')) {
		throw new Error('The `options` argument expects a `markdownEngine` property to use as a Markdown renderer.');
	}

	const { markdownEngine } = options;

	eleventyConfig.addPairedShortcode('callout', function (content, heading = '', emoji = '', renderOptions = {}) {
		const uniqueId = `co-${parseInt(String(Math.random()).split('.')[1], 10).toString(36)}`;
		const emojiStyleAttr = emoji ? `style="--callout-emoji: '${emoji}'"` : '';
		heading ||= 'Note';
		const renderMode = renderOptions.hasOwnProperty('mode') ? renderOptions.mode : 'inline';
		const wrapperClass = renderOptions.hasOwnProperty('class') ? renderOptions.class : '';
		let renderOutput;
		switch (renderMode) {
			case 'markup': {
				renderOutput = content.trim();
				break;
			}
			case 'block': {
				renderOutput = markdownEngine.render(content.trim());
				break;
			}
			default: {
				renderOutput = `<p>${markdownEngine.renderInline(content.trim())}</p>`;
				break;
			}
		}

		// Little trick to avoid additional whitespace
		return ''.concat(
			`<section class="callout ${wrapperClass}" aria-labelledby="${uniqueId}">`,
			`<p id="${uniqueId}" class="callout-label | h3" ${emojiStyleAttr}>${heading}</p>`,
			renderOutput.trim(),
			`</section>`
		);
	});
}
