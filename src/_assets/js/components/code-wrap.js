class CodeWrap extends HTMLElement {
	constructor() {
		super();

		// Add copy button
		this.copyLabel = this.getAttribute('copy-label') || 'Copy';
		this.copyClass = this.getAttribute('copy-class') || '';
		this.toolbar = this.querySelector('.codeblock-toolbar');
		this.copyButton = Object.assign(document.createElement('button'), { type: 'button', className: this.copyClass, innerText: this.copyLabel });
		this.copyButton.setAttribute('data-codewrap-copy', '');
		this.toolbar.append(this.copyButton);
		this.clipboard = Boolean(navigator.clipboard.writeText);

		// Events handlers
		this.addEventListener('click', this);
	}

	connectedCallback() {
		document.addEventListener('DOMContentLoaded', () => {
			Array.from(document.querySelectorAll('.codeblock-copy')).forEach((btn) => (btn.hidden = !this.clipboard));
		});
	}

	disconnectedCallback() {
		this.removeEventListener('click', this);
	}

	handleEvent(e) {
		if (e.type === 'click') {
			if (this.clipboard) {
				const copyButton = e.target.closest('[data-codewrap-copy]');
				if (!copyButton) {
					return;
				}
				const codeBlock = copyButton.closest('.codeblock').querySelector('code');
				if (!codeBlock) {
					return;
				}
				const copyAction = navigator.clipboard.writeText(codeBlock.innerText);
			}
		}
	}
}

customElements.define('code-wrap', CodeWrap);
