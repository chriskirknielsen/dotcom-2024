export default function (eleventyConfig, options = {}) {
	eleventyConfig.addPairedShortcode('expander', function (content, title = 'Expand', showArrow = true, isExpanded = false) {
		const arrow = showArrow ? `<span class="expander-button-arrow" aria-hidden="true"></span> ` : '';
		return `<details class="expander"${isExpanded ? ' open' : ''}>
			<summary class="expander-button | button | inline-size-100pc">${arrow}${title}</summary>
			<div class="expander-content | flow">${content}</div>
		</details>`;
	});
}
