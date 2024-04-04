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

	/** Removes any slash at the end of a string. */
	eleventyConfig.addFilter('removeTrailingSlash', (str) => str.trim().replace(/\/$/g, ''));

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
}
