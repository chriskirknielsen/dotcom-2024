class SideScroller extends HTMLElement {
	static register(registry) {
		if (!registry && 'customElements' in globalThis) {
			registry = globalThis.customElements;
		}

		registry?.define('side-scroller', this);
	}

	static css = `slot:not([name]) {
		display: block;
		inline-size: max-content;
	}`;

	constructor() {
		super();

		if (CSS.supports('scrollbar-width: none') === false) {
			throw new DOMException('Unable to register SideScroller due to unsupported CSS `scrollbar-width: none`.', 'NotSupportedError');
		}

		this.tabIndex = 0; // I think it's redundant for focusable scrollers but I don't trust all browsers
		this.shadow = this.attachShadow({ mode: 'open' });
		this.shadow.innerHTML = '<slot></slot><slot name="scroller"></slot>';
		this._slider = Object.assign(document.createElement('input'), {
			type: 'range',
			value: 0,
			step: 0.001,
			min: 0,
			max: 1,
			className: 'side-scroller-input',
			ariaLabel: 'Scroll progression', // Maybe this should be `ariaHidden: 'true'` instead?
			tabIndex: '-1', // Because the very small steps means arrow key changes are too slow compared to the real scroller
			slot: 'scroller',
		});
		this.append(this._slider); // Added into the light DOM but pulled into the shadow DOM slot

		// We'll track the catch-all slot's size, ensuring it is displayed as block so it can be measured
		this._content = this.shadow.querySelector('slot:not([name]');
		const sheet = new CSSStyleSheet();
		sheet.replaceSync(SideScroller.css);
		this.shadow.adoptedStyleSheets = [sheet];
	}

	connectedCallback() {
		this._handleOrientation(); // Adjust to account for orientation
		this._handleRatio(); // Calculate the ratio right away

		this.addEventListener('scroll', this._handleScroll);
		this._slider.addEventListener('input', this._handleSlide.bind(this));
		window.addEventListener('resize', this._handleRatio.bind(this)); // Needed for zoom changes
		// ^ Re-binding these so `this` maps to the component, not the original event target (i.e. the slider and the window)

		// Create an observer to update the ratio when the content size changes
		this._resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.contentRect) {
					this._handleRatio();
				}
			}
		});
		this._resizeObserver.observe(this._content);
	}

	disconnectedCallback() {
		this.removeEventListener('scroll', this._handleScroll);
		this._slider.removeEventListener('input', this._handleSlide);
		window.removeEventListener('resize', this._handleRatio);
		this._resizeObserver.disconnect();
	}

	_handleOrientation() {
		this._computedStyles = window.getComputedStyle(this);
		const writingMode = this._computedStyles.writingMode;
		this._scrollFactor = 1;
		if (writingMode.includes('horizontal')) {
			this._props = { scrollStart: 'scrollLeft', scrollSize: 'scrollWidth', size: 'clientWidth' };
		} else {
			this._props = { scrollStart: 'scrollTop', scrollSize: 'scrollHeight', size: 'clientHeight' };
			if (writingMode === 'sideways-lr') {
				this._scrollFactor = -1;
			}
		}
	}

	_handleScroll(e) {
		const progress = Math.max(0, Math.min(1, (this[this._props.scrollStart] * this._scrollFactor) / (this[this._props.scrollSize] - this[this._props.size])));
		this._slider.value = progress;
	}

	_handleSlide(e) {
		const progress = Math.max(0, Math.min(1, e.target.valueAsNumber || 0));
		this[this._props.scrollStart] = progress * (this[this._props.scrollSize] - this[this._props.size]) * this._scrollFactor;
	}

	_handleRatio(e) {
		const ratio = Math.max(0, Math.min(1, this[this._props.size] / this[this._props.scrollSize]));
		this.style.setProperty('--_sidescroller-ratio', ratio.toFixed(3));
		this._slider.hidden = ratio >= 1; // Hide the scrollbar if there is no overflow
	}
}

SideScroller.register();
