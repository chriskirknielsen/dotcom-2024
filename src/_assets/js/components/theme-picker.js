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
	getPreferredMotion() {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no-preference';
	}

	/** Convert hex to RGB */
	hexToRgb(H) {
		H = H.trim();
		if (H.startsWith('#') === false) {
			H = `#${H};`;
		}

		let r = 0;
		let g = 0;
		let b = 0;
		if (H.length === 4) {
			r = '0x' + H[1] + H[1];
			g = '0x' + H[2] + H[2];
			b = '0x' + H[3] + H[3];
		} else if (H.length === 7) {
			r = '0x' + H[1] + H[2];
			g = '0x' + H[3] + H[4];
			b = '0x' + H[5] + H[6];
		}
		return { r, g, b };
	}

	/** Convert RGB to HSL */
	rgbToHsl({ r, g, b }) {
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b);
		let cmax = Math.max(r, g, b);
		let delta = cmax - cmin;
		let h = 0;
		let s = 0;
		let l = 0;

		if (delta === 0) {
			h = 0;
		} else if (cmax === r) {
			h = ((g - b) / delta) % 6;
		} else if (cmax === g) {
			h = (b - r) / delta + 2;
		} else {
			h = (r - g) / delta + 4;
		}

		h = Math.round(h * 60);

		if (h < 0) {
			h += 360;
		}

		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return { h, s, l };
	}

	/** Convert #hex to HSL */
	hexToHsl(H) {
		return this.rgbToHsl(this.hexToRgb(H));
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
		const canvasHsl = this.hexToHsl(values['C-canvas']);
		const accentHsl = this.hexToHsl(values['C-accent']);
		const isDark = canvasHsl.l < 50; // Guestimation
		const remappedValues = Object.entries(values).map(([key, input]) => {
			let value;
			switch (key) {
				case 'font-heading-family': {
					const map = {
						Canela: 'Canela, serif',
						XanhMono: 'XanhMono, monospace',
						InstrumentSerif: 'InstrumentSerif, serif',
						Chinook: 'Chinook, Cooper Black, serif',
						didone: 'Didot, Bodoni MT, Noto Serif Display, URW Palladio L, P052, Sylfaen, serif',
						Switzer: 'Switzer, sans-serif',
						MDNichrome: 'MDNichrome, sans-serif',
						Rajdhani: 'Rajdhani, sans-serif',
						TeXGyreAdventor: 'TeXGyreAdventor, ITC Avant Garde, sans-serif',
						times: 'Times New Roman, Times',
						comicsans: 'Comic Sans MS, casual, cursive',
						humanist: 'Optima, Candara, Noto Sans, source-sans-pro, sans-serif',
					};
					value = map[input] || 'sans-serif';
					break;
				}
				case 'font-body-family': {
					value = `var(--fontStack-${input})`;
					break;
				}
				case 'corner': {
					value = input === 'round' ? '4px' : '0px';
					break;
				}
				case 'anim-f': {
					value = input === 'reduce' ? '0' : '1';
					break;
				}
				default: {
					value = input;
				}
			}
			return `--${key}: ${value};`;
		});
		const shadowSaturation = canvasHsl.l < 5 || canvasHsl.l >= 95 ? 0 : Math.round(Math.pow((accentHsl.s - canvasHsl.s) / 100, 2) * 100); // Ensure <5% and >=95% BG saturation is greyscale
		const shadowLightness = Math.min(67, Math.round(Math.pow(1 - canvasHsl.l / 100, 2) * 100)); // Make the shadow follow the lightness opposite to the background (light BG = dark shadow, dark BG = glow) to stand out
		const shadowColor = `${accentHsl.h}deg ${shadowSaturation}% ${shadowLightness}%`;

		this.customSheet.replaceSync(`:root[data-theme="custom"] {
			--color-scheme: ${isDark ? 'dark' : 'light'};
			${remappedValues.join('\n\t\t\t')}
			--font-heading-style: ${values['font-heading-family'] === 'XanhMono' ? 'italic' : 'normal'};
			--font-heading-size-adjust: none;
			${values['font-heading-transform'] === 'uppercase' ? '--HERO-title-factor: 1.75;' : ''}
			--header-bg-color: color-mix(in oklch, var(--C-surface), var(--C-canvas));
			--stroke-linecap: ${values.corner};
			--shadow-color: ${shadowColor};
			${values['font-body-family'] === 'monospace' ? 'font-size-adjust: 0.45;' : ''}
		}`);

		document.adoptedStyleSheets = [this.customSheet];
		window.localStorage.setItem(this.styleStore, JSON.stringify(values)); // To re-apply upon subsequent page loads
	}

	connectedCallback() {
		const savedStyles = JSON.parse(window.localStorage.getItem(this.styleStore) || null);
		const form = document.getElementById('theme-custom-form');
		if (savedStyles) {
			Array.from(form.querySelectorAll('[name]')).forEach((field) => {
				const name = field.getAttribute('name');
				const type = field.getAttribute('type') || field.tagName.toLowerCase();
				const value = savedStyles[name];
				if (type === 'radio') {
					field.checked = field.value === value;
				} else if (type === 'select') {
					field.value = field.querySelector(`option[value="${value}"]`) ? value : field.querySelector(`option[data-default]`).value;
				} else {
					field.value = value;
				}
			});
		} else {
			const preferredScheme = this.getPreferredScheme();
			const isDark = preferredScheme === 'dark';
			const defaultColors = {
				canvas: isDark ? '#001111' : '#eeffff',
				surface: isDark ? '#003333' : '#cceeee',
				text: isDark ? '#ffffff' : '#000000',
				heading: isDark ? '#ddffff' : '#003333',
				accent: isDark ? '#33ffff' : '#550000',
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
					if (radioField.getAttribute('data-default') === 'from-media') {
						if (defaultOption.name === 'anim-f') {
							radioField.checked = this.getPreferredMotion() === radioField.value;
						}
					} else {
						radioField.checked = true;
					}
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
			const dialog = document.getElementById('theme-custom-controls');
			const isTargetDialogBackdrop = e.target === dialog;
			const customDialog = e.target.closest('[data-theme-custom-action]');
			const setter = e.target.closest('[data-theme-set]');

			if (customDialog || isTargetDialogBackdrop) {
				const action = customDialog && customDialog.getAttribute('data-theme-custom-action');

				if (action === 'apply' || isTargetDialogBackdrop) {
					this.updateCustomThemeStyles();
					dialog.close();
				} else if (action === 'open') {
					dialog.showModal();
					this.updateCustomThemeStyles();
					this.setTheme('custom');
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
