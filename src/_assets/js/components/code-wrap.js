class CodeWrap extends HTMLElement {
	constructor() {
		super();

		// Add copy button
		this.copyLabel = this.getAttribute('copy-label') || 'Copy';
		this.copyDoneLabel = this.getAttribute('copy-done-label') || 'Done';
		this.copyClass = this.getAttribute('copy-class') || '';
		this.toolbar = this.querySelector('.codeblock-toolbar');
		this.copyButton = Object.assign(document.createElement('button'), { type: 'button', className: this.copyClass, innerText: this.copyLabel });
		this.copyButtonTimeout = null;
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

				// If the button is clicked many times, clear the timeout
				clearTimeout(this.copyButtonTimeout);

				// Track the clipboard action
				const copyAction = navigator.clipboard.writeText(codeBlock.innerText);
				copyAction
					.then(() => {
						this.copyButton.innerText = this.copyDoneLabel; // Update successful label
					})
					.catch((e) => {
						console.error(e);
						this.copyButton.innerText = '❌ Error!'; // Update error label
					})
					.finally(() => {
						this.copyButtonTimeout = setTimeout(() => {
							this.copyButton.innerText = this.copyLabel; // After a time, rever to original label
						}, 2000);
					});
			}
		}
	}
}

customElements.define('code-wrap', CodeWrap);
