export default function (eleventyConfig) {
	/** Checks if the provided URL is the current page and returns the correct ARIA attribute. */
	eleventyConfig.addFilter('current', (url, page) => (page.url === url ? 'aria-current="page"' : ''));
}
