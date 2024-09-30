class ThemePicker extends HTMLElement {
	constructor() {
		super();

		// Absorb the properties from the window (safe from minification)
		this.store = window.themeStore;
		this.keys = window.themeKeys;
		this.defaults = {
			light: this.dataset.light,
			dark: this.dataset.dark,
		};

		// Trigger as soon as possible to give the current theme's trigger the appropriate aria-pressed value
		this.setTheme(this.getTheme());

		// Events handlers
		this.addEventListener('click', this);
		document.addEventListener('keyup', this);
	}

	setTheme(theme) {
		if (!theme || this.keys.includes(theme) === false) {
			theme = ''; // System default is an empty string
		}

		// Prevent weird transition between theme styles for a brief instant
		document.documentElement.style.setProperty('--anim-f', '0');

		if (theme) {
			document.documentElement.setAttribute('data-theme', theme);
			localStorage.setItem(this.store, theme);
		} else {
			document.documentElement.removeAttribute('data-theme');
			localStorage.removeItem(this.store);
		}

		// Once the theme's updated, allow transitions again (RAF+timeout is weird but apparently necessary!)
		requestAnimationFrame(() => {
			setTimeout(() => document.documentElement.style.removeProperty('--anim-f'));
		});

		document.querySelectorAll('[data-theme-set]').forEach(function (btn) {
			btn.setAttribute('aria-pressed', (btn.getAttribute('data-theme-set') === theme).toString());
		});
	}

	getTheme() {
		let activeTheme = localStorage.getItem(this.store);
		if (!activeTheme) {
			return false; // If the user hasn't set an override, respect the `prefers-color-scheme` setting
		}
		if (this.keys.includes(activeTheme) === false) {
			const preferredScheme = window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
			return this.defaults[preferredScheme];
		}
		return activeTheme;
	}

	// Don't really need this
	// connectedCallback() {}

	// Ain't no way the picker is ever getting removed
	// disconnectedCallback() {
	// 	this.removeEventListener('click', this);
	// 	this.removeEventListener('keyup', this);
	// }

	handleEvent(e) {
		if (e.type === 'click') {
			const setter = e.target.closest('[data-theme-set]');
			if (setter) {
				const isPressed = setter.getAttribute('aria-pressed') === 'true';
				this.setTheme(!isPressed ? setter.getAttribute('data-theme-set') : false);
			}
		}

		if (e.type === 'keyup') {
			if (e.key === 'Escape') {
				const themePickerToggleButton = document.querySelector(`[aria-controls=${this.id}]`);
				if (themePickerToggleButton && themePickerToggleButton.getAttribute('aria-pressed') === 'true') {
					themePickerToggleButton.setAttribute('aria-pressed', 'false');
					themePickerToggleButton.focus(); // Restore focus to the toggler
				}
			} else if (e.key >= 0 && e.key <= this.keys.length) {
				const pressedDigit = parseInt(e.key, 10);
				this.querySelectorAll('[data-theme-set]')[pressedDigit]?.click();
			}
		}
	}
}

customElements.define('theme-picker', ThemePicker);
