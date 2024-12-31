// Basic (bad) "highlighter" of the TOC link for the current section in view
document.addEventListener('DOMContentLoaded', () => {
	const headings = document.querySelectorAll('.toc ~ h2 .heading-anchor');
	const visibleHeadings = new Set();

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					visibleHeadings.add(entry.target);
				} else {
					visibleHeadings.delete(entry.target);
				}
				const visibleHeadingsList = Array.from(visibleHeadings.values());
				const lastVisible = visibleHeadingsList.slice().reverse()[0];
				if (!lastVisible) return;

				headings.forEach((h) => {
					const tocLink = document.querySelector(`.toc-list a[href="${h.getAttribute('href')}"]`);
					if (h === lastVisible) {
						tocLink.style.setProperty('--LINK-decoration-thickness', 'calc(var(--link-decoration-thickness, 1px) + 2px)');
					} else {
						tocLink.style.removeProperty('--LINK-decoration-thickness');
					}
				});
			});
		},
		{ rootMargin: `${document.body.clientHeight}px 0px -33% 0px`, threshold: 1 } // Extend the detection above the heading so it's always considered as intersecting if above the current scrollport window
	);

	headings.forEach((heading) => observer.observe(heading));
});
