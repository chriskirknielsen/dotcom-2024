class CyclingExpander extends HTMLElement {
	/** Helper to filthily create an element with assigned properties */
	spawn(type, properties) {
		return Object.assign(document.createElement(type), properties);
	}

	/** The order of the items is randomised on page load, but then each button click ensures a sequential item so you can see them all if you really want without repetition */
	shuffle(toShuffle) {
		for (let i = toShuffle.length - 1; i > 0; i -= 1) {
			const randomIndex = Math.floor(Math.random() * (i + 1));
			[toShuffle[i], toShuffle[randomIndex]] = [toShuffle[randomIndex], toShuffle[i]];
		}
		return toShuffle;
	}

	constructor() {
		super();

		// Randomise the list after grabbing each item and extracting the contents into a emoji-text pair
		this.itemsList = this.shuffle(
			Array.from(this.querySelectorAll('[data-expander="content-items"] > li')).map((itemEl) => [itemEl.getAttribute('data-item-emoji'), itemEl.textContent])
		);

		// Find the fallback details block and create its equivalent div (yuck, I know!)
		const blockDetails = this.querySelector('[data-expander="wrapper"]');
		this.blockDiv = this.spawn('div', { className: blockDetails.className });

		// Capture the contents of the trigger and create a replica as a button
		const ctaSummary = this.querySelector('[data-expander="trigger"]');
		const ctaChildren = Array.from(ctaSummary.children);
		this.ctaButton = this.spawn('button', { className: ctaSummary.className });
		this.ctaButton.style.setProperty('--btn-justify-content', ctaSummary.style.getPropertyValue('--btn-justify-content'));

		// Find the fallbck
		const contentWrap = this.querySelector('[data-expander="content"]');
		this.outputContainer = this.spawn('p', {
			className: contentWrap.className,
			hidden: true,
			innerHTML: `<span data-item="emoji" aria-hidden="true">&nbsp;</span>&ensp;<span data-item="content">&nbsp;</span>`,
		});

		// Populate the newly created elements
		if (ctaChildren.length > 0) {
			this.ctaButton.append(...ctaChildren); // Move the contents of the original trigger into the new button
		} else {
			this.ctaButton.innerText = ctaSummary.innerText; // Copy the text node
		}
		this.blockDiv.appendChild(this.ctaButton);
		this.blockDiv.appendChild(this.outputContainer);

		// Replace the fallback with the interactive version
		blockDetails.replaceWith(this.blockDiv);

		// Keep track of which item is currently displayed
		this.currentItemIndex = -1;

		// Disable root view transition
		if (document.startViewTransition) {
			const noAnimRootStyle = this.spawn('style', {
				textContent:
					// Disable view transition for root element
					`html { view-transition-name: none; }` +
					// Ensure the button stays clickable by disabling pointer events on transition snapshots
					`::view-transition, ::view-transition-group(root) { pointer-events: none !important; }` +
					// Simple trick to keep aspect ratio acceptable from https://jakearchibald.com/2024/view-transitions-handling-aspect-ratio-changes/
					`::view-transition-old(content), ::view-transition-new(content) { height: 100%; object-fit: none; overflow: clip; }`,
			});
			document.head.append(noAnimRootStyle);
		}

		this.ctaButton.addEventListener('click', () => {
			const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const newItemIndex = (this.currentItemIndex + 1) % this.itemsList.length;
			const newItemData = this.itemsList[newItemIndex];

			if (this.outputContainer.hidden || this.currentItemIndex === -1) {
				this.outputContainer.hidden = false;
				this.blockDiv.setAttribute('data-open', 'true');
			}
			const emojiEl = this.outputContainer.querySelector('[data-item="emoji"]');
			const contentEl = this.outputContainer.querySelector('[data-item="content"]');

			if (document.startViewTransition) {
				emojiEl.style.viewTransitionName = 'emoji';
				contentEl.style.viewTransitionName = 'content';
			}

			const setContent = () => {
				emojiEl.innerText = newItemData[0];
				contentEl.innerText = newItemData[1];
				this.currentItemIndex = newItemIndex; // Using modulo above, we cycle between all values and fall back to zero, so users can't click a bazillion times and exceed the MAX_INTEGER value (better safe than sorry I guess!)
			};

			if (!prefersReducedMotion && document.startViewTransition && this.currentItemIndex > -1) {
				document.startViewTransition(() => setContent());
			} else {
				setContent();
			}
		});
	}
}

customElements.define('cycling-expander', CyclingExpander);
