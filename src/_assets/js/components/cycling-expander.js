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

		// Randomise the list after grabbing each item and extracting the contents into an HTML string
		this.itemsList = this.shuffle(
			Array.from(this.querySelectorAll('[data-expander="content-items"] > li')).map(
				(itemEl) => `<span aria-hidden="true">${itemEl.getAttribute('data-item-emoji')}</span>&ensp;${itemEl.textContent}`
			)
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
		this.outputContainer = this.spawn('p', { className: contentWrap.className, hidden: true });

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

		this.ctaButton.addEventListener('click', () => {
			const newItemIndex = (this.currentItemIndex + 1) % this.itemsList.length;

			if (this.outputContainer.hidden || this.currentItemIndex === -1) {
				this.outputContainer.hidden = false;
				this.blockDiv.setAttribute('data-open', 'true');
			}

			this.outputContainer.innerHTML = this.itemsList[newItemIndex];
			this.currentItemIndex = newItemIndex; // Using modulo above, we cycle between all values and fall back to zero, so users can't click a bazillion times and exceed the MAX_INTEGER value (better safe than sorry I guess!)
		});
	}
}

customElements.define('cycling-expander', CyclingExpander);
