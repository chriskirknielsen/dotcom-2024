import social from './social.js';
const rss = { path: '/rss.xml', label: 'RSS Feed' };
const socialFromEntry = Object.entries(social).map(([key, item]) => ({ path: item.url, label: item.label }));

export default {
	rss, // Expose it via global data
	navbar: [
		{ path: '/blog/', label: 'Blog' },
		{ path: '/about/', label: 'About' },
		{ path: '/designs/', label: 'Designs' },
		{ path: '/projects/', label: 'Projects' },
	],
	slashPages: [
		{ path: '/now/', label: '/now' },
		{ path: '/uses/', label: '/uses' },
		{ path: '/games/', label: '/games' },
	],
	footerExtras: [
		rss,
		{ path: '/fonts/', label: 'Custom Fonts' },
		{ path: '/webring/', label: 'Webring' },
		{ path: 'https://tweets.chriskirknielsen.com', label: 'Tweet Archive' },
	],
	footerMisc: [
		{ path: '/colophon/', label: 'Colophon' },
		{ path: '/archives/', label: 'Archives' },
		{ path: '/search/', label: 'Search' },
		{ path: '', label: 'Report Issue', isRepoFileLink: true },
	],
	footerSocial: [{ path: `mailto:${encodeURIComponent('chriskirknielsen+dot-com@gmail.com')}`, label: 'Email' }, ...socialFromEntry],
};
