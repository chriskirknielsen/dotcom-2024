// Basic (bad) "highlighter" of the TOC link for the current section in view
document.addEventListener('DOMContentLoaded', () => {
	// In this site's layout, the table of contents is an element that appears before any other content at the same hierarchy,
	// and level 2 headings (or rather their anchor element within) are the only ones I want to target
	const headings = Array.from(document.querySelectorAll('.toc ~ h2 .heading-anchor'));
	if (headings.length === 0) {
		return; // No headings? No business here
	}

	const visibleHeadings = new Set();
	const markActive = (h) => h.style.setProperty('--LINK-decoration-thickness', 'calc(var(--link-decoration-thickness, 1px) + 2px)');
	const markInactive = (h) => h.style.removeProperty('--LINK-decoration-thickness');

	// On page load we'll mark the first item as active, even if the heading appears a bit further down
	markActive(document.querySelector(`.toc-list a[href="${headings[0].getAttribute('href')}"]`));

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				// Keep track of visible headings
				if (entry.isIntersecting) {
					visibleHeadings.add(entry.target);
				} else {
					visibleHeadings.delete(entry.target);
				}

				// Sort visible (intersecting) headings by inverted order of appearance, then grab the first item (i.e. last visible heading)
				const lastVisible = Array.from(visibleHeadings.values()).sort((a, b) => headings.indexOf(b) - headings.indexOf(a))[0];
				if (!lastVisible) {
					return; // If nothing is visible, weird but let's skip this logic
				}

				headings.forEach((h) => {
					// Find the link in the TOC list matching the heading in this list of h2 elements
					const tocLink = document.querySelector(`.toc-list a[href="${h.getAttribute('href')}"]`);

					// If it's the last visible item, change the underline to make it stand out, else, revert to th default style
					if (h === lastVisible) {
						markActive(tocLink);
					} else {
						markInactive(tocLink);
					}
				});
			});
		},
		{
			// Extend the detection above the heading so it's always considered as intersecting if above the current scrollport window
			rootMargin: `${document.body.clientHeight}px 0px -33% 0px`, // Must be _above_ the 33% line of the bottom of the scrollport
			threshold: 1,
		}
	);

	// And now… observe all the headings
	headings.forEach((heading) => observer.observe(heading));
});
