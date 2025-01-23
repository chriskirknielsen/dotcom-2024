// Super very basic "highlighter" of the TOC link for the current section in view
document.addEventListener('DOMContentLoaded', () => {
	// In this site's layout, the table of contents is an element that appears before any other content at the same hierarchy level
	const headings = Array.from(document.querySelectorAll('.toc ~ :is(h2, h3, h4)'));
	if (headings.length === 0) {
		return; // No headings? No business here
	}

	// A few helper functions
	const markTocItemActive = (a) => a.closest('.toc-list li').setAttribute('data-current', '');
	const markTocItemInactive = (a) => a.closest('.toc-list li').removeAttribute('data-current');
	const getTocLinkFromHeading = (h) => document.querySelector(`.toc-list a[href="#${h.id}"]`);
	const getDocHeight = () => Math.floor(document.body.clientHeight);

	const entryThreshold = 0.5; // Decimal representation of the percentage of the viewport an element has to be within to be marked as intersecting
	const visibleHeadings = new Set();
	let resizeDebounce;
	let currentObserver;
	let height = getDocHeight();

	function beginObservation(docHeight) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					// Keep track of visible headings
					if (entry.isIntersecting) {
						visibleHeadings.add(entry.target);
					} else {
						visibleHeadings.delete(entry.target);
					}
				});

				// Sort visible (intersecting) headings by inverted order of appearance, then grab the first item (i.e. last visible heading)
				const lastVisible = Array.from(visibleHeadings.values()).sort((a, b) => headings.indexOf(b) - headings.indexOf(a))[0];
				headings.forEach((heading) => {
					// Find the link in the TOC list matching the heading in this list of heading elements
					const tocLink = getTocLinkFromHeading(heading);

					// If it's the last visible item, mark it to make it stand out, else, revert to the default style
					if (heading === lastVisible) {
						markTocItemActive(tocLink);
					} else {
						markTocItemInactive(tocLink);
					}
				});
			},
			{
				//? h: Extend the detection above the heading so it's always considered as intersecting if above the scrollport
				//? -33%: The element won't be considered as intersecting until it has gone _above_ the bottom third of the scrollport
				rootMargin: `${docHeight}px 0px -${entryThreshold * 100}% 0px`,
				threshold: 1, // Only considered intersecting if all the pixels are inside the intersection area
			}
		);

		headings.forEach((heading) => observer.observe(heading));

		return observer;
	}

	// On page load...
	// markTocItemActive(getTocLinkFromHeading(headings[0])); // Mark the first item as active (even if the heading appears a bit further down)
	currentObserver = beginObservation(height); // Start the intersection observer

	// On resize, replace the observer with a new one matching the updated body height, if different
	window.addEventListener('resize', () => {
		clearTimeout(resizeDebounce);
		resizeDebounce = setTimeout(() => {
			const heightAfterResize = getDocHeight();
			if (height !== heightAfterResize) {
				if (currentObserver) {
					currentObserver.disconnect();
				}
				currentObserver = beginObservation(heightAfterResize);
			}
		}, 200);
	});
});
