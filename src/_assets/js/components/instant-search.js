function normalizeApostrophe(str) {
	return str.replace(/(‘|’)/, "'");
}
function getTypeLabel(type) {
	switch (type) {
		case '*':
			return 'All';
		case '_fonts':
			return 'Typeface';
		case '_designs':
			return 'Design';
		case '_projects':
			return 'Project';
		case '_pages':
			return 'Page';
		case '_posts':
		default:
			return 'Blogpost';
	}
}

class InstantSearch extends HTMLElement {
	hasRunOnce = false;

	constructor() {
		super();

		this.database = fetch('/search.json').then((response) => response.json()); // Immediately fetch the "database"
		this.lastSearch = '';
	}

	connectedCallback() {
		const searchInputId = this.dataset.searchInput;
		const formEl = this.querySelector('form');
		const inputEl = this.querySelector(`[name="${searchInputId}"]`);
		const resultsEl = this.querySelector('[data-results-list]');
		const resultItemTemplate = this.querySelector('template');
		const resultCountEl = this.querySelector('[data-results-count]');
		const resultFilterEl = this.querySelector('[data-results-filter]');

		const getDatabase = async () => this.database;

		// Based on https://daily-dev-tips.com/posts/eleventy-creating-a-static-javascript-search/
		const runQuery = async () => {
			let query = normalizeApostrophe(inputEl.value.toLowerCase().trim());
			if (query.length < 1) {
				return;
			}

			// Alias some search terms
			switch (query) {
				case '11ty':
					query = 'eleventy';
					break;
				case 'javascript':
					query = 'js';
					break;
			}

			if (this.lastSearch === query) {
				return; // No change, no faked reload
			}

			// First time?
			if (!this.hasRunOnce) {
				this.firstRunCallback();
			}

			resultsEl.innerHTML = `<tr><td colspan="3">Loading…</td></tr>`; // Instant feedback: search is running
			resultFilterEl.innerHTML = '<option value="*">All</option>'; // Reset after every search

			let data = await getDatabase();
			let result = data.filter(
				(item) =>
					normalizeApostrophe(item.title.toLowerCase()).includes(query) ||
					normalizeApostrophe(item.summary.toLowerCase()).includes(query) ||
					normalizeApostrophe(item.tags.join(' ').toLowerCase()).includes(query)
			);

			this.lastSearch = query; // Track the latest query to avoid running it again on blur

			setTimeout(() => {
				resultFilterEl.disabled = result.length === 0;

				if (result.length === 0) {
					resultCountEl.innerText = `(0)`;
					resultsEl.innerHTML = `<tr><td colspan="3">No results found 😢</td></tr>`;
					return;
				}

				const resultsFragment = new DocumentFragment();
				resultsEl.innerHTML = '';
				let resultsTypes = new Set();

				result.forEach((page) => {
					const type = page.type;
					const tpl = resultItemTemplate.content.cloneNode(true);
					const listItemEl = tpl.querySelector('[data-result-type]');
					const typeEl = tpl.querySelector('[data-result-slot="type"]');
					const dateEl = tpl.querySelector('[data-result-slot="date"]');
					const anchorEl = tpl.querySelector('[data-result-slot="link"]');
					const langEl = tpl.querySelector('[data-result-slot="lang"]');

					const dateInIso = new Date(page.date).toISOString().split('T').shift();
					const typePretty = getTypeLabel(type);
					resultsTypes.add(type);

					listItemEl.setAttribute('data-result-type', type);
					typeEl.innerText = `${typePretty}`;
					anchorEl.setAttribute('href', page.url);
					anchorEl.setAttribute('hreflang', page.lang);
					anchorEl.innerHTML = page.title;

					if (['_posts', '_designs'].includes(type)) {
						dateEl.setAttribute('datetime', dateInIso);
						dateEl.innerText = dateInIso;
					} else {
						dateEl.parentElement.innerHTML = ''; // Remove the date element altogether
					}

					// If the result is not in English, indicate it
					if (page.lang !== 'en') {
						langEl.innerText = `(${page.lang})`;
					} else {
						langEl.hidden = true;
					}

					resultsFragment.append(tpl);
				});

				resultCountEl.innerText = `(${result.length})`;
				resultsEl.append(resultsFragment);

				const availableTypes = Array.from(resultsTypes).sort();
				availableTypes.forEach((type) => {
					const opt = Object.assign(document.createElement('option'), { value: type, innerText: getTypeLabel(type) });
					resultFilterEl.appendChild(opt);
				});
			}, 100); // Fake a loading period
		};

		inputEl.addEventListener('blur', function (e) {
			runQuery();
		});

		formEl.addEventListener('submit', function (e) {
			e.preventDefault();

			runQuery();

			return false;
		});

		resultFilterEl.addEventListener('change', function (e) {
			const selection = resultFilterEl.value || '*';
			Array.from(resultsEl.querySelectorAll('[data-result-type]')).forEach((result) => {
				result.hidden = selection !== '*' && result.getAttribute('data-result-type') !== selection;
			});
		});
	}

	firstRunCallback() {
		Array.from(this.querySelectorAll('[data-show-on-first-run]')).forEach((el) => {
			el.hidden = false;
		});

		this.hasRunOnce = true;
	}
}

customElements.define('instant-search', InstantSearch);
