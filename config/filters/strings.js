import hyphenMap from '../../src/_data/custom-hyphenation.js';
const hyphenKeys = Object.keys(hyphenMap);
const remapNum = (number, inMin, inMax, outMin, outMax) => ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
const clampNum = (min, number, max) => Math.min(max, Math.max(min, number));

export default function (eleventyConfig) {
	/** Adds soft hyphenation HTML characters (&shy;) to a preset list of words. Remember to use the safe filter in Nunjucks! */
	eleventyConfig.addFilter('shy', function (string) {
		const words = (string || '').split(' ');
		const replacedWords = words.map((word) => (hyphenKeys.includes(word) ? hyphenMap[word] : word));
		return replacedWords.join(' ');
	});

	/** Calculates a factor to use to have a smaller ratio for larger strings */
	eleventyConfig.addFilter('sizeFactor', function (string) {
		string = string || '';
		const minWords = 5;
		const maxWords = 10;
		const minLetters = 24;
		const maxLetters = 64;
		const invertedMinRatio = 0.75;
		const invertedMaxRatio = 1;
		const words = string.split(' ');
		const wordCount = words.length;
		const letterCount = words.join('').length; // Remove spaces
		const letterScale = clampNum(invertedMinRatio, remapNum(letterCount, minLetters, maxLetters, invertedMaxRatio, invertedMinRatio), invertedMaxRatio);
		const wordScale = clampNum(invertedMinRatio, remapNum(wordCount, minWords, maxWords, invertedMaxRatio, invertedMinRatio), invertedMaxRatio);
		return parseFloat(((wordScale + letterScale) / 2).toFixed(2)); // Get the average between word count scale and letter count scale, rounded to 2 decimal places
	});

	/** Calculates a factor to use to have a smaller ratio for larger strings */
	eleventyConfig.addFilter('toTitleCase', function (string) {
		string = String(string || '').trim();
		const words = string
			.split(' ')
			.map((w) => `${w.slice(0, 1).toUpperCase()}${w.slice(1)}`)
			.join(' ');
		return words;
	});

	/**
	 * Analog of jinja's [striptags](https://jinja.palletsprojects.com/en/stable/templates/#jinja-filters.striptags). If `preserve_linebreaks` is `false` (default), strips SGML/XML tags and replaces adjacent whitespace with one space. If `preserve_linebreaks` is `true`, normalizes whitespace, trying to preserve original linebreaks.
	 * @see /node_modules/nunjucks/src/filters.js Directly adapted from the `striptags` function.
	 * @param {string} input Original string to sanitize from HTML tags.
	 * @param {boolean} preserveLinebreaks Optional. Whether to keep line breaks intact. Defaults to `false`.
	 * @returns {string} Markup-less string.
	 */
	eleventyConfig.addFilter('stripTags', function (input = '', preserveLinebreaks = false) {
		if ([false, null, undefined].includes(input)) {
			return '';
		}

		const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>|<!--[\s\S]*?-->/gi;
		const trimmedInput = input.replace(tags, '').trim();

		if (preserveLinebreaks) {
			return trimmedInput
				.replace(/^ +| +$/gm, '') // remove leading and trailing spaces
				.replace(/ +/g, ' ') // squash adjacent spaces
				.replace(/(\r\n)/g, '\n') // normalize linebreaks (CRLF -> LF)
				.replace(/\n\n\n+/g, '\n\n'); // squash abnormal adjacent linebreaks
		}
		return trimmedInput.replace(/\s+/gi, ' ');
	});
}
