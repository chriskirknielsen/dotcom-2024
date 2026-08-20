//? This file is included in _includes/parts/head, which provides the `themes` variable via the datafile of the same name
Object.assign(themes, {
	store: 'cknTheme', // Key for the theme's localStorage item
	eventName: 'ckn:themeChanged', // Custom event name to signal the theme has been changed
	get: function () {
		return localStorage.getItem(this.store) || ''; // No stored value (null) is changed to an empty string (= system default)
	},
	has: function (key) {
		return this.keys.includes(key);
	},
	press: function (key) {
		// Update all theme buttons on the page to reflect the correct state
		Array.from(document.querySelectorAll('[data-theme-set]')).forEach((button) => {
			button.setAttribute('aria-pressed', (button.dataset.themeSet === key).toString());
		});
	},
	save: function (key, skipVT = false) {
		if (!key || !this.has(key)) {
			key = ''; // The system default is represented by an empty string
		}

		const save = () => {
			// If there's no theme provided, fall back to the system preference
			if (!key) {
				this.clear();
			} else {
				this.set(key);
			}
			this.press(key);
		};

		if (!skipVT) {
			const specialEvent = new CustomEvent(this.eventName, {
				bubbles: true,
				detail: {
					theme: key,
					callback: save,
				},
			});

			document.querySelector('theme-picker').dispatchEvent(specialEvent); // Pass the responsibility of transitioning the theme to the theme-picker element
		} else {
			save();
		}
	},
	set: function (key) {
		document.documentElement.dataset.theme = key;
		localStorage.setItem(this.store, key);
	},
	clear: function () {
		delete document.documentElement.dataset.theme;
		localStorage.removeItem(this.store);
	},
});

// Trigger as soon as possible to give the active theme-button the appropriate aria-pressed value
let themeOverride = '';
if (window.location.search.includes('theme=')) {
	themeOverride = new URLSearchParams(document.location.search).get('theme');
} else if (window.location.hash.startsWith('#theme:')) {
	themeOverride = window.location.hash.replace('#theme:', '');
}
themeOverride = themeOverride.trim().toLowerCase();

if (themes.has(themeOverride)) {
	const searchWithoutTheme = new URLSearchParams(window.location.search);
	searchWithoutTheme.delete('theme');
	history.replaceState(undefined, '', window.location.pathname + searchWithoutTheme.toString()); // Remove the hash and/or query string
} else {
	themeOverride = null;
}

themes.save(themeOverride || themes.get(), true); // Skip the view transition on page load
