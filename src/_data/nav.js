import metadata from './metadata.js';
import social from './social.js';

const rss = { path: '/rss.xml', label: 'RSS Feed' };
const navbar = [
	{ path: '/blog/', label: 'Blog' },
	{ path: '/about/', label: 'About' },
	{ path: '/designs/', label: 'Designs' },
	{ path: '/projects/', label: 'Projects' },
];
const socialFromEntry = Object.entries(social).map(([key, item]) => ({ path: item.url, label: item.label }));
const slashPages = [
	{ path: '/uses/', label: '/uses' },
	{ path: '/support/', label: '/support' },
	{ path: '/now/', label: '/now' },
	{ path: '/games/', label: '/games' },
];
const gamesLibrary = { path: '/games/library/', label: 'Games Library' };
const email = { path: `mailto:${encodeURIComponent('chriskirknielsen+dot-com@gmail.com')}`, label: 'Email' };

export default {
	rss, // Expose it via global data
	navbar,
	slashPages,
	footerGroups: [
		[...navbar, rss],
		[
			{ path: '/colophon/', label: 'Colophon' },
			{ path: '/search/', label: 'Search' },
			{ path: '/archives/', label: 'Digital Archives' },
			{ path: metadata.tweetArchiveUrl, label: 'Tweet Archive' },
		],
		[
			{ path: '/css-logo/', label: 'CSS Logo' },
			{ path: '/fonts/', label: 'Custom Fonts' },
			{ path: '/blogroll/', label: 'Blogroll' },
			{ path: '/webring/', label: 'Webring' },
			{ path: '', label: 'Report Issue', isRepoFileLink: true },
		],
		[...slashPages, gamesLibrary],
		[email, ...socialFromEntry],
	],
};
