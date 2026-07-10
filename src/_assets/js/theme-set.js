//? This file is included in _includes/parts/head, which provides the themes variable via the datafile of the same name
window.themeStore = 'cknTheme';
const themeSelected = localStorage.getItem(window.themeStore);
if (window.themeKeys.includes(themeSelected)) {
	document.documentElement.setAttribute('data-theme', themeSelected);
} else {
	localStorage.removeItem(window.themeStore);
}
