// Basic (bad) "highlighter" of the TOC link for the current section in view
document.addEventListener('DOMContentLoaded', () => {
	const headings = document.querySelectorAll('.toc ~ h2 .heading-anchor');
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			console.log(entry.target.href, entry.time);
			if (entry.isIntersecting) {
				headings.forEach((h) => {
					const tocLink = document.querySelector(`.toc-list a[href="${h.getAttribute('href')}"]`);
					if (h === entry.target) {
						tocLink.style.setProperty('--LINK-decoration-thickness', 'calc(var(--link-decoration-thickness, 1px) + 1.5px)');
					} else {
						tocLink.style.removeProperty('--LINK-decoration-thickness');
					}
				});
			}
		});
	});

	headings.forEach((heading) => observer.observe(heading));
});
