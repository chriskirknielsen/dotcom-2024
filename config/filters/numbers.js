//* Roman Numeral converter
const RomanNumeral = (function () {
	const NVMS = {
		// Each digit group only uses two characters: 1 and 5
		1: { 1: 'I', 5: 'V' }, // Units
		10: { 1: 'X', 5: 'L' }, // Tens
		100: { 1: 'C', 5: 'D' }, // Hundreds
		1000: { 1: 'M' }, // Thousands
	};

	function nvmFormat(digit, group = 1) {
		let addOverline = false;
		let groupNum = parseInt(group, 10);
		// If the number is equal to or over 4000, grab the single digit version and set the overline flag to true
		if ((digit >= 4 && groupNum >= 1000) || groupNum >= 10000) {
			group = (groupNum / 1000).toString();
			addOverline = true;
		}

		let returnVal = ''; // Initialise final output
		let nvms = NVMS[group]; // Get the current digit group value
		let nvmsNext = NVMS[group * 10]; // Get the next order of digit group for 9, 90, 900…

		if (digit < 4) {
			// 1 through 3 simply repeat the numeral for 1
			returnVal = nvms['1'].repeat(digit);
		} else if (digit < 9) {
			// Get the numeral for 5 and get the target length, pad by start for numbers below 5, pad by end for numbers above 5
			let padLength = digit - 5;
			// If the length is below 0, we access the padStart method on the String prototype; if it is above 0, we access padEnd. We use Math.abs to get a positive number and add 1 to account for the character representing 5
			returnVal = nvms['5'][padLength < 0 ? 'padStart' : 'padEnd'](Math.abs(padLength) + 1, nvms['1']);
		} else {
			// Get the numeral for 1 and the next group's 1, to get the "A before B" syntax, e.g. "IX"
			returnVal = `${nvms['1']}${nvmsNext['1']}`;
		}

		// Add an overline on numbers equal to or over 4000
		if (addOverline) {
			// If we have a numeral like 8 (VIII), we want to add the overline on each character: split, add to each char, and re-join
			returnVal = returnVal
				.split('')
				.map((character) => character + '&#773;')
				.join('');
		}

		// We're done, the numeral is ready!
		return returnVal;
	}

	function toRomanNumeral(val) {
		const num = parseInt(val, 10).toString(); // Get a nice, splitable string from the number
		const digits = num.split('').reverse(); // We will process each digit in reverse order, for index purposes

		let nvm = ''; // Initialise the string of numbers
		digits.forEach((n, i) => {
			// The index is used to find the digit group (1, 10, 100, etc.) by padding a 1 by the length of the group (so index 2 gives us '1' + 2x'0')
			let digitGroup = `1${'0'.repeat(i)}`;
			let digit = nvmFormat(n, digitGroup);
			nvm = digit + nvm; // Each group is processed in reverse so the numerals are prepended, not appended
		});

		return nvm;
	}

	// Reveal the conversion function only
	return { toRomanNumeral };
})();
const toRomanNumeral = RomanNumeral.toRomanNumeral;

export default function (eleventyConfig) {
	/** Converts an integer to its modern Roman numeral counterpart. */
	eleventyConfig.addFilter('toRomanNumeral', (num) => toRomanNumeral(num));
}
