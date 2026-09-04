class ThemePicker extends HTMLElement {
	constructor() {
		super();

		// Absorb the properties from the global scope (safe from minification)
		this.store = themes.store;
		this.keys = themes.keys;
		this.defaults = themes.defaults;
		this.eventName = themes.eventName;
		this.save = themes.save.bind(themes);
		this.customThemeFormId = this.dataset.formId;

		// Events handlers
		this.addEventListener('click', this);
		this.addEventListener('change', this);
		this.addEventListener(this.eventName, this);
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
		if (H[0] !== '#') {
			H = `#${H};`; // Prepend the hash/pound/octothorpe symbol if it's not the first character
		}

		// Shorthand #f00 syntax
		if (H.length === 4) {
			return {
				r: '0x' + H[1] + H[1],
				g: '0x' + H[2] + H[2],
				b: '0x' + H[3] + H[3],
			};
		}

		// This will discard any alpha component
		return {
			r: '0x' + H[1] + H[2],
			g: '0x' + H[3] + H[4],
			b: '0x' + H[5] + H[6],
		};
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
		if (delta === 0) {
			h = 0; // Greyscale
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

		let l = (cmax + cmin) / 2;
		let s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return { h, s, l };
	}

	/** Convert #hex to HSL */
	hexToHsl(H) {
		return this.rgbToHsl(this.hexToRgb(H));
	}

	setTheme(theme, applyTheme, skipViewTransition = false) {
		let updatedPromised;
		const isSameThemeKey = document.documentElement.dataset.theme === theme || (typeof document.documentElement.dataset.theme === 'undefined' && !theme);
		const isDefaultSameSource = !document.documentElement.dataset.theme && theme === this.defaults[this.getPreferredScheme()];
		const isDefaultSameTarget = !theme && document.documentElement.dataset.theme === this.defaults[this.getPreferredScheme()];
		const isSameTheme = isSameThemeKey || isDefaultSameTarget || isDefaultSameSource; // If the visual result is the same, skip the transition
		const useFallback =
			isSameTheme || skipViewTransition || !document.startViewTransition || typeof ViewTransitionTypeSet !== 'function' || this.getPreferredMotion() === 'reduce';

		const restoreAnim = async () => {
			if (useFallback) {
				await new Promise((r, _) => requestAnimationFrame(() => setTimeout(r)));
			}
		};

		if (useFallback) {
			updatedPromised = Promise.resolve(applyTheme());
		} else {
			updatedPromised = document.startViewTransition({ update: applyTheme, types: ['--theme'] }).finished;
		}

		return updatedPromised.then(restoreAnim);
	}

	updateCustomThemeStyles() {
		const form = document.getElementById(this.customThemeFormId);
		const values = Object.fromEntries(new FormData(form));
		const canvasHsl = this.hexToHsl(values['color-canvas']);
		const accentHsl = this.hexToHsl(values['color-accent']);
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
						Peritel: 'Peritel, sans-serif',
						didone: 'Didot, Bodoni MT, Noto Serif Display, URW Palladio L, P052, Sylfaen, serif',
						MDNichrome: 'MDNichrome, sans-serif',
						Rajdhani: 'Rajdhani, sans-serif',
						TeXGyreAdventor: 'OPTIAuvantGothic, ITC Avant Garde, sans-serif',
						Switzer: 'Switzer, sans-serif',
						LibreFranklin: 'LibreFranklin, Libre Franklin, Franklin Gothic, HEX Franklin, sans-serif',
						Outfit: 'Outfit, Century Gothic, sans-serif',
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

		this.customSheet.replaceSync(`html[data-theme]:not([data-theme='custom']) [data-theme-condition='custom'] {
			display: none !important;
		}
		:root[data-theme="custom"] {
			--color-scheme: ${isDark ? 'dark' : 'light'};
			${remappedValues.join('\n\t\t\t')}
			--font-heading-style: ${values['font-heading-family'] === 'XanhMono' ? 'italic' : 'normal'};
			--font-heading-size-adjust: none;
			${values['font-heading-transform'] === 'uppercase' ? '--HERO-title-factor: 1.75;' : ''}
			--header-bg-color: color-mix(in oklch, var(--color-surface), var(--color-canvas));
			--stroke-linecap: ${values.corner};
			--shadow-color: ${shadowColor};
			${values['font-body-family'] === 'monospace' ? 'font-size-adjust: 0.45;' : ''}
		}`);

		document.adoptedStyleSheets = [this.customSheet];
		window.localStorage.setItem(this.styleStore, JSON.stringify(values)); // To re-apply upon subsequent page loads
	}

	connectedCallback() {
		const savedJson = (window.localStorage.getItem(this.styleStore) || '').replace(/"C-([a-z-]+)":/g, `"color-$1":`); // Legacy handling of C-{color} names
		const savedStyles = JSON.parse(savedJson || null);
		const form = document.getElementById(this.customThemeFormId);
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

			Array.from(form.querySelectorAll(`input[type="color"][data-color-key]`)).forEach((colorField) => {
				colorField.value = defaultColors[colorField.dataset.colorKey];
			});

			Array.from(form.querySelectorAll('[data-default]')).forEach((defaultOption) => {
				const selectField = defaultOption.closest('select');
				const radioField = defaultOption.closest('input[type="radio"]');

				if (selectField) {
					selectField.value = defaultOption.value;
				} else if (radioField) {
					if (radioField.dataset.default === 'from-media') {
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

	handleEvent(e) {
		if (e.type === 'click') {
			const dialog = this.querySelector('dialog'); // There should only be one
			const isTargetDialogBackdrop = e.target === dialog;
			const customDialog = e.target.closest('[data-theme-custom-action]');

			if (customDialog || isTargetDialogBackdrop) {
				const action = customDialog && customDialog.dataset.themeCustomAction;

				if (action === 'apply' || isTargetDialogBackdrop) {
					this.updateCustomThemeStyles();
					dialog.close();
				} else if (action === 'open') {
					this.updateCustomThemeStyles();
					this.save('custom');
					requestAnimationFrame(() => {
						dialog.showModal();
					});
				}
			}
		}

		if (e.type === this.eventName) {
			this.setTheme(e.detail.theme, e.detail.callback);
		}

		if (e.type === 'keyup') {
			const isModifierPressed = e.altKey || e.shiftKey || e.ctrlKey || e.metaKey;
			if (e.key === 'Escape' && !isModifierPressed) {
				const themePickerToggleButton = document.querySelector(`[aria-controls=${this.id}]`);
				if (themePickerToggleButton && themePickerToggleButton.getAttribute('aria-pressed') === 'true') {
					themePickerToggleButton.setAttribute('aria-pressed', 'false');
					themePickerToggleButton.focus(); // Restore focus to the toggler
				}
			} else if (e.key >= 0 && e.key <= this.keys.length && !e.target?.closest?.('input, textarea, [contenteditable]') && !isModifierPressed) {
				const pressedDigit = parseInt(e.key, 10);
				this.save(this.keys[pressedDigit - 1] || ''); // For pressedDigit === 0, we get an index of -1, which is undefined, so the fallback of empty string gives us the system default
			}
		}

		if (e.type === 'change') {
			this.updateCustomThemeStyles();
		}
	}
}

customElements.define('theme-picker', ThemePicker);

class ThemeButton extends HTMLElement {
	constructor() {
		super();

		this.addEventListener('click', this);

		// Remove the fallback content if provided (CSS handles the visibility of the button, JS handles the presence of the fallback content)
		this.querySelector('[data-fallback]')?.remove();

		// Set the button to pressed if it applies the current theme
		this.button = this.querySelector('[data-theme-set]');
		const isInitiallyActive = this.button.dataset.themeSet === themes.get();
		this.button.setAttribute('aria-pressed', isInitiallyActive.toString());
	}

	handleEvent(e) {
		if (e.type === 'click') {
			const themeButton = e.target.closest('[data-theme-set]');
			const themeKey = themeButton.dataset.themeSet;
			const targetKey = themeKey && themes.get() === themeKey ? '' : themeKey; // Allow unsetting the theme
			themes.save(targetKey); // This will use a view transition by default
		}
	}
}

customElements.define('theme-button', ThemeButton);
