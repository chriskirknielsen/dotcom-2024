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
		this.addEventListener('change', this);
		document.addEventListener('keyup', this);

		// Set up a constructable stylesheet for user custom styles
		this.styleStore = 'cknCustom';
		this.customSheet = new CSSStyleSheet();
	}

	getPreferredScheme() {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
			const preferredScheme = this.getPreferredScheme();
			return this.defaults[preferredScheme];
		}
		return activeTheme;
	}

	updateCustomThemeStyles() {
		const form = document.getElementById('theme-custom-form');
		const values = Object.fromEntries(new FormData(form));
		this.customSheet.replaceSync(`:root[data-theme="custom"] {
			${Object.entries(values)
				.map(([key, value]) => `--${key}: ${value};`)
				.join('\n')}
			--header-bg-color: var(--C-surface);
		}`);
		document.adoptedStyleSheets = [this.customSheet];
		window.localStorage.setItem(this.styleStore, JSON.stringify(values));
	}

	connectedCallback() {
		const savedStyles = JSON.parse(window.localStorage.getItem(this.styleStore) || null);
		const form = document.getElementById('theme-custom-form');
		if (savedStyles) {
			Array.from(form.querySelectorAll('[name]')).forEach((field) => {
				const name = field.getAttribute('name');
				const type = field.getAttribute('type') || null;
				const value = savedStyles[name];
				if (type === 'radio') {
					field.checked = field.value === value;
				} else {
					field.value = value;
				}
			});
		} else {
			const preferredScheme = this.getPreferredScheme();
			const isDark = preferredScheme === 'dark';
			const defaultColors = {
				canvas: isDark ? '#001111' : '#eeffff',
				surface: isDark ? '#003333' : '#cccccc',
				text: isDark ? '#ffffff' : '#000000',
				heading: isDark ? '#ddffff' : '#003333',
				accent: isDark ? '#00ffff' : '#550000',
			};

			// Array.from(form.querySelectorAll(`[name="color-scheme"]`)).forEach((schemeField) => {
			// 	schemeField.checked = schemeField.value === preferredScheme;
			// });

			Array.from(form.querySelectorAll(`input[type="color"][data-color-key]`)).forEach((colorField) => {
				colorField.value = defaultColors[colorField.getAttribute('data-color-key')];
			});

			Array.from(form.querySelectorAll('[data-default]')).forEach((defaultOption) => {
				const selectField = defaultOption.closest('select');
				const radioField = defaultOption.closest('input[type="radio"]');
				if (selectField) {
					selectField.value = defaultOption.value;
				} else if (radioField) {
					radioField.checked = true;
					console.log(radioField);
				}
			});
		}

		this.updateCustomThemeStyles();
	}

	// Ain't no way the picker is ever getting removed
	// disconnectedCallback() {
	// 	this.removeEventListener('click', this);
	// 	this.removeEventListener('keyup', this);
	// }

	handleEvent(e) {
		if (e.type === 'click') {
			const customDialog = e.target.closest('[data-theme-custom-action]');
			const setter = e.target.closest('[data-theme-set]');

			if (customDialog) {
				const dialog = document.getElementById('theme-custom-controls');
				const action = customDialog.getAttribute('data-theme-custom-action');

				if (action === 'open') {
					dialog.showModal();
					this.updateCustomThemeStyles();
				} else if (action === 'close') {
					dialog.close();
				} else if (action === 'apply') {
					this.updateCustomThemeStyles();
					dialog.close();
				}
			} else if (setter) {
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
			} else if (e.key >= 0 && e.key <= this.keys.length && !e.target?.closest?.('input')) {
				const pressedDigit = parseInt(e.key, 10);
				this.querySelectorAll('[data-theme-set]')[pressedDigit]?.click();
			}
		}

		if (e.type === 'change') {
			this.updateCustomThemeStyles();
		}
	}
}

customElements.define('theme-picker', ThemePicker);
