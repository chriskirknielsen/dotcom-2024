class CodeWrap extends HTMLElement {
	constructor() {
		super();

		// Add copy button
		this.nbsp = ' ';
		this.copyLabel = this.getAttribute('copy-label') || 'Copy';
		this.copyDoneLabel = this.getAttribute('copy-done-label') || 'Done';
		this.copyClass = this.getAttribute('copy-class') || '';
		this.toolbar = this.querySelector('.codeblock-toolbar');
		this.actionWrapper = Object.assign(document.createElement('div'), { className: this.getAttribute('actionwrap-class') || '' });
		this.copyButton = Object.assign(document.createElement('button'), { type: 'button', className: this.copyClass, innerText: this.copyLabel });
		this.alertEl = Object.assign(document.createElement('div'), { role: 'alert', innerText: this.nbsp, ariaHidden: true });
		this.copyButtonTimeout = null;
		this.copyButton.setAttribute('data-codewrap-copy', '');
		this.toolbar.append(this.actionWrapper);
		this.actionWrapper.append(this.copyButton, this.alertEl);
		this.clipboard = Boolean(navigator.clipboard.writeText);

		// Events handlers
		this.addEventListener('click', this);
	}

	// connectedCallback() {
	// }

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
						this.alertEl.innerText = this.copyDoneLabel; // Update successful label
					})
					.catch((e) => {
						console.error(e);
						this.alertEl.innerText = '❌ Error!'; // Update error label
					})
					.finally(() => {
						this.alertEl.ariaHidden = false;
						this.copyButtonTimeout = setTimeout(() => {
							this.alertEl.addEventListener(
								'transitionend',
								() => {
									this.alertEl.innerText = this.nbsp; // After the animation is over, revert to original label
								},
								{ once: true }
							);
							this.alertEl.ariaHidden = true;
						}, 2000);
					});
			}
		}
	}
}

customElements.define('code-wrap', CodeWrap);
