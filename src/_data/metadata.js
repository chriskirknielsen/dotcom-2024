import social from './social.js';

const now = new Date().valueOf();
const cssNakedDayStart = new Date(`${new Date().getFullYear()}-04-09 00:00:00 UTC+14:00`).valueOf();
const cssNakedDayEnd = new Date(`${new Date().getFullYear()}-04-10 00:00:00 UTC-12:00`).valueOf();
const jsNakedDayStart = new Date(`${new Date().getFullYear()}-04-24 00:00:00 UTC+14:00`).valueOf();
const jsNakedDayEnd = new Date(`${new Date().getFullYear()}-04-25 00:00:00 UTC-12:00`).valueOf();
const isCssNakedDay = now >= cssNakedDayStart && now < cssNakedDayEnd;
const isJsNakedDay = now >= jsNakedDayStart && now < jsNakedDayEnd;

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
		// bluesky: social.bluesky.url,
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
	nakedCss: isCssNakedDay,
	nakedJs: isJsNakedDay,
};
