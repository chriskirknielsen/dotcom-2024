function toggleInertForMenu(newState = false) {
	Array.from(document.body.querySelectorAll(':scope > :not(header, script, style)')).forEach((el) => (el.inert = newState));
}

document.addEventListener('click', function (e) {
	let target;
	if ((target = e.target.closest('[data-toggle-pressed]'))) {
		const newPressedValue = target.getAttribute('aria-pressed') !== 'true';
		target.setAttribute('aria-pressed', newPressedValue.toString());

		if (target.matches('.header-menu-toggle')) {
			if (newPressedValue) {
				document.documentElement.scrollTop = 0;
			}
			toggleInertForMenu(newPressedValue);
		}
	} else if ((target = e.target.closest('.header-wrap'))) {
		// If the click occurred inside the header, do nothing
		if (e.target.closest('.header')) {
			return;
		}

		// Clicked on ::before
		target.querySelector('.header-menu-toggle').setAttribute('aria-pressed', false);
		toggleInertForMenu(false);
		target.querySelector('.header-menu-toggle').focus();
	} else {
		target = e.target;
		// Auto-close the theme picker if clicking outside of its container
		if (!target.closest('.header-themepicker')) {
			document.querySelector('.header-themepicker-toggle').setAttribute('aria-pressed', 'false');
		}
	}
});

document.addEventListener('keydown', function (e) {
	// Asks users for a query and direct them right away to the search page with their query filled and executed
	if (!e.target.closest('input, textarea, button')) {
		const modifierKey = window.navigator.platform ? (/Mac|iPod|iPhone|iPad/.test(window.navigator.platform) ? e.metaKey : e.ctrlKey) : e.metaKey || e.ctrlKey;
		if ((e.key === 'k' || e.keyCode == 75) && modifierKey) {
			e.preventDefault();

			if (window.location.href.includes('/search/')) {
				const searchField = document.getElementById('q');
				if (searchField) {
					searchField.focus();
				}
				return;
			}

			const searchQuery = prompt('Quick search:');
			if (searchQuery) {
				const queryString = new URLSearchParams({ q: searchQuery }).toString();
				window.location.href = `/search/?${queryString}`;
			}
		}
	}
});

document.addEventListener('keyup', function (e) {
	// Close the menu on ESC
	const pressedToggle = document.querySelector('[data-toggle-pressed][aria-pressed="true"]');
	if (pressedToggle && (e.key === 'Escape' || e.keyCode === 27)) {
		pressedToggle.setAttribute('aria-pressed', 'false');
		toggleInertForMenu(false);
		pressedToggle.focus();
	}
});

document.addEventListener(
	'mouseenter',
	function (e) {
		// Keep the footer message animation running even after unhovering it
		let target = e?.target?.closest?.('.footer-message');
		if (target) {
			target.classList.add('activated');
			target.addEventListener('animationend', (evt) => target.classList.remove('activated'), { once: true });
		}
	},
	{ capture: true }
);

window.matchMedia(`(min-width:${globalBreakpoint})`).addEventListener('change', function (e) {
	Array.from(document.querySelectorAll('.header-menu-toggle, .header-themepicker-toggle')).forEach((el) => el.setAttribute('aria-pressed', 'false'));
	toggleInertForMenu(false);
});

console.log(
	`
To meet a fellow explorer
In these liminal spaces
Outside hyperlink anchors
Hah, what a nice surprise

I hope not to take much
Of your attention any further
But hope you will keep an eye out
For what is worthy to discover

I wish your quest leads you farther
Someplace you can feel safe, and yet
Where you'd still want whisper:
“Hah, what a nice surprise.”
`.trim()
); // ckn mmxxv
