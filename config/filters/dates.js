import { DateTime } from 'luxon';
import metadata from '../../src/_data/metadata.js';

const dateFormat = (date, opts = {}) => {
	const format = opts.format || 'machine';
	const lang = opts.lang || metadata.lang;
	const dateObj = new Date(date);
	const utcDate = DateTime.fromJSDate(dateObj).toUTC();

	switch (format) {
		case 'obj': {
			return new Date(utcDate.toISO());
		}
		case 'rfc2822': {
			return utcDate.toRFC2822();
		}
		case 'iso': {
			return utcDate.toISO();
		}
		case 'year': {
			return utcDate.toFormat('yyyy');
		}
		case 'machine': {
			return utcDate.toFormat('yyyy-MM-dd');
		}
		case 'nice': {
			// In French, you usually say "1st" instead of "1" for the first of the month, but the rest of the days can be said as "13 October 1984", no ordinal needed
			if (lang === 'fr' && parseInt(utcDate.toFormat('d'), 10) === 1) {
				return `1er ${utcDate.toFormat('LLLL yyyy')}`;
			}
			return utcDate.setLocale(lang).toFormat('d LLLL yyyy');
		}
		case 'ms': {
			return utcDate.toMillis();
		}
	}
};

export default function (eleventyConfig, options = {}) {
	/** Formats a date into a preferred format. */
	eleventyConfig.addFilter('dateFormat', dateFormat);

	/** Formats a date and wraps it in a <time> element with the appropriate attribute. */
	eleventyConfig.addFilter('timeTag', (date, opts = {}) => `<time datetime="${dateFormat(date)}">${dateFormat(date, Object.assign({ format: 'nice' }, opts))}</time>`);
}
