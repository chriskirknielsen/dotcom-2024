const mastodonServer = 'front-end.social';
const mastodonUsername = 'chriskirknielsen';

export default {
	mastodon: {
		label: 'Mastodon',
		url: `https://${mastodonServer}/@${mastodonUsername}`,
		handle: `@${mastodonUsername}@${mastodonServer}`,
	},
	codepen: {
		label: 'CodePen',
		url: 'https://codepen.io/chriskirknielsen',
	},
	github: {
		label: 'GitHub',
		url: 'https://github.com/chriskirknielsen',
	},
};
