// import tokens from './tokens.json' assert { type: 'json' }; // This works as proved by a console.log but then throws, so I give up: fs it is!
import * as fs from 'fs';
const tokens = JSON.parse(fs.readFileSync('./src/_data/tokens.json'));
const themes = tokens.themes;
const themesWithLabel = Object.entries(themes).map(([themeKey, themeData]) => ({
	key: themeKey,
	label: themeData.label,
	default: themeData.isDefaultScheme,
	scheme: themeData.scheme,
}));
export default themesWithLabel;
