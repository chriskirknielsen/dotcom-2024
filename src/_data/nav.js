// import metadata from './metadata.js';
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
	{ path: '/music/', label: '/music' },
];
const gamesLibrary = { path: '/games/library/', label: 'Gaming Library' };
const email = { path: `mailto:${encodeURIComponent('chriskirknielsen+dot-com@gmail.com')}`, label: 'Email' };

export default {
	rss, // Expose it via global data
	navbar,
	slashPages,
	footerGroups: [
		[{ path: '/', label: 'Home' }],
		[...navbar],
		[...slashPages],
		[
			{ path: '/colophon/', label: 'Colophon' },
			{ path: '/search/', label: 'Search' },
			{ path: '/fonts/', label: 'Custom Fonts' },
			{ path: '/blogroll/', label: 'Blogroll' },
			{ path: '/webring/', label: 'Webring' },
		],
		[
			gamesLibrary,
			{ path: '/archives/', label: 'Archives' },
			{ path: '', label: 'Report Issue', isRepoFileLink: true }, // Empty link that gets replaced on every page with the GitHub one
		],
		[{ ...rss, label: 'RSS' }, ...socialFromEntry],
		[email],
	],
};
