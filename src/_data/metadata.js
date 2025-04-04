import social from './social.js';
export default {
	title: 'chriskirknielsen',
	description: 'A creative developer',
	url: 'https://chriskirknielsen.com',
	repo: 'https://github.com/chriskirknielsen/dotcom-2024',
	author: {
		name: 'Christopher Kirk-Nielsen',
		shortname: 'Chris',
		email: 'chriskirknielsen@gmail.com',
		mastodon: social.mastodon.url,
	},
	tweetArchiveUrl: 'https://tweets.chriskirknielsen.com/',
	copyrightStart: 1992,
	currentYear: new Date().getFullYear(),
	lang: 'en',
	merch: {
		RedBubble: 'https://www.redbubble.com/people/ckirknielsen/shop',
		TeePublic: 'https://www.teepublic.com/user/chriskirknielsen/',
		DesignByHumans: 'https://www.designbyhumans.com/shop/chriskirknielsen/',
	},
	nakedCss: new Date().toISOString().split('T')[0].endsWith('04-09'),
	nakedJs: new Date().toISOString().split('T')[0].endsWith('04-24'),
};
