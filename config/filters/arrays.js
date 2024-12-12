export default function (eleventyConfig) {
	/** Plucks out the property of each object in a provided list, returns an array of those plucked properties. */
	eleventyConfig.addFilter('pluck', function (list, key) {
		const arr = Array.isArray(list) ? list : Object.values(list); // Make sure our list is an array, if not, turn the values of the object into an array
		return arr.map((o) => o[key]);
	});

	/** Finds the first object in a provided list whose prop matches the value. */
	eleventyConfig.addFilter('find', (array, prop, value) => array.find((item) => item[prop] === value));

	/** Ensure every value of the provided list is unique. */
	eleventyConfig.addFilter('unique', (arr) => [...new Set(arr)]);

	/** Flattens an array to a single level. */
	eleventyConfig.addFilter('flatten', (array) => array.flat(Infinity));

	/** Runs Object.values() on an array of objects. */
	eleventyConfig.addFilter('toValues', (arr) => arr.map((obj) => Object.values(obj)));

	/** Removes values from a list that don't begin with the provided string. Can be reverse with a boolean argument */
	eleventyConfig.addFilter('startsWith', (list, str, flip = false) => list.filter((value) => String(value).startsWith(str) ^ flip)); // Bitwise XOR, wild stuff

	/** Sorts an array of entries (Object.entries-style, an array of arrays e.g. [key, value]) by a provided arbitrary map. */
	eleventyConfig.addFilter('sortentries', (entries, map) =>
		Array.from(entries).sort((a, b) => {
			const aIndex = map.indexOf(a[0]);
			const bIndex = map.indexOf(b[0]);

			if (aIndex === -1) {
				return 99;
			}
			if (bIndex === -1) {
				return -99;
			}

			return aIndex - bIndex;
		})
	); // Sort by the entry key (array[0])
}
