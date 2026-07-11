document.addEventListener('click', function (e) {
	let target;
	if ((target = e.target.closest('[data-toggle-pressed]'))) {
		const newPressedValue = target.getAttribute('aria-pressed') !== 'true';
		target.setAttribute('aria-pressed', newPressedValue.toString());
	} else {
		target = e.target;
		const toggleEl = document.querySelector('.header-themepicker-toggle');
		// Auto-close the theme picker if clicking outside of its container
		if (!target.closest('.header-themepicker') && toggleEl) {
			toggleEl.setAttribute('aria-pressed', 'false');
		}
	}
});

document.addEventListener('keydown', function (e) {
	// Asks users for a query and directs them right away to the search page with their query filled and executed
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
		pressedToggle.focus();
	}
});
