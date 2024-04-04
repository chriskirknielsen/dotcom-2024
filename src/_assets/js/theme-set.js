//? This file is included in head.njk, which provides the themes variable via the datafile of the same name
window.themeStore = 'cknTheme';
const themeSelected = localStorage.getItem(window.themeStore);
if (window.themeKeys.includes(themeSelected)) {
	docEl.setAttribute('data-theme', themeSelected);
} else {
	localStorage.removeItem(window.themeStore);
}
