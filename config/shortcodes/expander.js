export default function (eleventyConfig, options = {}) {
	eleventyConfig.addPairedShortcode('expander', function (content, title = 'Expand', config = {}) {
		const { showArrow, isExpanded, summaryId, name } = Object.assign({ showArrow: true, isExpanded: false, summaryId: null, name: null }, config);
		const arrow = showArrow
			? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" class="expander-button-arrow" aria-hidden="true"><path d="M9 5 3 1.54v6.92z" /></svg> `
			: '';
		//! Adding an extra line before the content output so Markdown doesn't get messed up
		return `<details class="expander"${isExpanded ? ' open' : ''}${name ? ` name="${name}"` : ''}>
			<summary class="expander-button | button | inline-size-100pc"${summaryId ? ` id="${summaryId}"` : ''}>${arrow}${title}</summary>
			<div class="expander-content | flow">
			${content}</div>
		</details>`;
	});
}
