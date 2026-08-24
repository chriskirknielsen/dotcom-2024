class ToolTip extends HTMLElement {
	constructor() {
		super();

		this.addEventListener('mouseover', this, { capture: true });
		this.addEventListener('mouseout', this, { capture: true });

		this._trigger = this.querySelector(':scope > :not(.tip-content, script, style)');
		this._content = this.querySelector(':scope > .tip-content');
	}

	static getRandomId(prefix = 'tt') {
		const randStr = parseInt(Math.random().toString().slice(2, 8)).toString(16);
		const composedId = [prefix, randStr].filter(Boolean).join('-');
		const isAvailable = !document.getElementById(composedId);
		if (!isAvailable) {
			return ToolTip.getRandomId();
		}
		return composedId;
	}

	connectedCallback() {
		this._content.id = this._content.id || ToolTip.getRandomId();
		this._content.popover = 'auto';
		this._trigger.setAttribute('popovertarget', this._content.id);
	}

	disconnectedCallback() {
		this._content.removeAttribute('popover');
		this._trigger.removeAttribute('popovertarget');
	}

	handleEvent(e) {
		if (this._trigger.contains(e.target) || this._trigger === e.target) {
			if (e.type === 'mouseover') {
				this._content.showPopover({ source: this._trigger });
			}
			if (e.type === 'mouseout') {
				this._content.hidePopover();
			}
		}
	}
}

customElements.define('tool-tip', ToolTip);
