export default function (eleventyConfig) {
	/** Runs Object.keys() on an object. */
	eleventyConfig.addFilter('keys', (obj) => Object.keys(obj));

	/** Runs Object.values() on an object. */
	eleventyConfig.addFilter('values', (obj) => Object.values(obj));

	/** Transform an object of key=>values into a string of HTML attributes. Array-type values are joined with commas. */
	eleventyConfig.addFilter('objToAttr', (obj) =>
		Object.entries(obj)
			.map(([prop, val]) => `${prop}="${(Array.isArray(val) ? val.join(',') : val).trim()}"`)
			.join(' ')
	);
}
