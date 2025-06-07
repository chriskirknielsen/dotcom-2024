export default function (eleventyConfig, options = {}) {
	eleventyConfig.addPairedShortcode('expander', function (content, title = 'Expand', config = {}) {
		const { showArrow, isExpanded, summaryId } = Object.assign({ showArrow: true, isExpanded: false, summaryId: null }, config);
		const arrow = showArrow ? `<span class="expander-button-arrow" aria-hidden="true"></span> ` : '';
		return `<details class="expander"${isExpanded ? ' open' : ''}>
			<summary class="expander-button | button | inline-size-100pc"${summaryId ? ` id="${summaryId}"` : ''}>${arrow}${title}</summary>
			<div class="expander-content | flow">${content}</div>
		</details>`;
	});
}
