export default function (eleventyConfig, options = {}) {
	eleventyConfig.addPairedShortcode('codeview', function (content, type = 'html') {
		return `<div class="codeview" data-codeview-type="${type}">
			<div class="codeview-toolbar">Live Preview</div>
			<div class="codeview-render">${content}</div>
		</div>`;
	});
}
