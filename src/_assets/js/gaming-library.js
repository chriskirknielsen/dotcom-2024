// Helper functions
/** Get the SVG icon in the document to re-use. */
function getTrophySvg(svgId, lvl) {
	return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24" viewBox="0 0 24 24" class="gaming-details-trophies-icon | inline-icon">
		<title>${lvl} trophies</title>
		<use xlink:href="#${svgId}" width="24" height="24"></use>
	</svg>`;
}

/** Convert an object of trophies to an HTML list with icon. */
function toTrophyList(trophies, svgId) {
	if (!trophies) {
		return '';
	}

	return `<ul class="gaming-details-trophies | inline-list" data-flow="run-in">
		${Object.keys(trophies)
			.filter((lvl) => trophies[lvl] > 0)
			.map((lvl) => `<li><span class="gaming-details-trophies-badge" data-trophy-level="${lvl}">${getTrophySvg(svgId, lvl)} ${trophies[lvl]}</span></li>`)
			.join('')}
	</ul>`;
}

/** Shortcut for running forEach on a set of DOM elements matching a selector. */
const eachDom = (s, fn, scope = document) => Array.from(scope.querySelectorAll(s)).forEach(fn);

// Funny little messages if you try to change the checkbox state
let cbox = 0;
let msgs = [
	`I'm sorry, but that's not how that works.`,
	`If I have time I'll finish it.`,
	`Listen, if it's that great, you can let me know and I'll add it to my backlog.`,
	`Oh look, I'm literally about to beat the final level!`,
	`Screw it. You win. I'm done.`,
];
let openGame = null;
const hideOpenGame = () => {
	openGame = null;
	document.getElementById('gaming-details-dialog').style.removeProperty('--cover-url');
};

document.addEventListener('DOMContentLoaded', function (e) {
	document.querySelector('[data-gaming-toolbar]').hidden = false; // Reveal the toolbar now that JS is enabled

	eachDom('.gaming-box', (spine) => {
		const button = document.createElement('button');
		spine.getAttributeNames().forEach((attr) => button.setAttribute(attr, spine.getAttribute(attr)));
		button.type = 'button';
		button.classList.add('button-reset');
		Array.from(spine.childNodes).forEach((n) => button.appendChild(n)); // Move all contents to the new element
		spine.replaceWith(button);
	});
});

document.addEventListener('click', function (e) {
	let target;
	if ((target = e.target.closest('[data-games-toggled]'))) {
		const newPressed = target.getAttribute('aria-pressed') !== 'true';
		target.setAttribute('aria-pressed', String(newPressed));
		eachDom('details', (d) => {
			d.open = newPressed;
		});
	} else if ((target = e.target.closest('.gaming-box'))) {
		openGame = target.closest('.gaming-box-wrap'); // Update to the currently open game's list item
		const gameData = JSON.parse(target.closest('[data-game]').getAttribute('data-game'));
		const dialog = document.getElementById('gaming-details-dialog');
		const template = document.getElementById('gaming-details-dialog-template');
		const trophySvgId = template.getAttribute('data-trophy-svg-id');
		const clone = template.content.cloneNode(true);
		const dialogTitleRefId = 'gaming-details-dialog-title';
		let physicalType = 'disc';
		switch (gameData.platform) {
			case 'PSV':
			case 'Switch': {
				physicalType = 'cartridge';
				break;
			}
		}

		eachDom(
			'[data-slot-show], [data-slot]:not([data-slot-show] *)',
			(s) => {
				const prop = s.getAttribute('data-slot-show') || s.getAttribute('data-slot');
				const dataToTest = gameData[prop];
				s.hidden = Array.isArray(dataToTest) ? dataToTest.length === 0 : !Boolean(dataToTest);
			},
			clone
		);

		['title', 'edition', 'region', 'platform', 'dlc', 'year'].forEach((p) => {
			clone.querySelector(`[data-slot="${p}"]`).innerText = gameData[p];
		});

		clone.querySelector('[data-slot="title"]').setAttribute('id', dialogTitleRefId);
		clone.querySelector('[data-slot-computed="format"]').innerText = !gameData.discs ? 'digital' : gameData.discs > 1 ? `${gameData.discs} ${physicalType}s` : physicalType;
		if (gameData.rating) {
			const starRef = clone.querySelector('#svg-star-icon');
			const svgW = parseInt(starRef.getAttribute('width'), 10);
			const svgH = parseInt(starRef.getAttribute('height'), 10);
			const svgViewBox = starRef
				.getAttribute('viewBox')
				.split(' ')
				.map((v) => parseFloat(v));
			const ratingTitle = `${gameData.rating} / 5`;
			const ratingLabel = `<span class="visually-hidden">${ratingTitle}</span>`;
			const ratingImage = `<svg
				xmlns="http://www.w3.org/2000/svg"
				width="${svgW * 5}"
				height="${svgH}"
				viewBox="${svgViewBox.map((vb, i) => (i === 2 ? vb * 5 : vb)).join(' ')}"
				class="inline-icon inline-icon--center linecap-auto"
				aria-hidden="true"
			>
				<title>${ratingTitle}</title>
				<defs>
					<pattern id="star-pattern-stroke" x="0" y="0" width="20%" height="100%" fill="none" stroke="currentColor">
						${starRef.innerHTML}
					</pattern>
					<pattern id="star-pattern-fill" x="0" y="0" width="20%" height="100%" fill="currentColor" patternUnits="userSpaceOnUse">
						${starRef.innerHTML}
					</pattern>
				</defs>
				<rect fill="url(#star-pattern-stroke)" width="${svgViewBox[2] * 5}" height="${svgViewBox[3]}" />
				<rect fill="url(#star-pattern-fill)" width="${svgViewBox[2] * gameData.rating}" height="${svgViewBox[3]}" />
			</svg>`;
			clone.querySelector('[data-slot-computed="rating"]').innerHTML = `${ratingLabel}${ratingImage}`;
		}
		if (gameData.completed === null) {
			clone.querySelector('[data-slot-checkbox="completed"]').indeterminate = true;
			clone.querySelector('[data-slot-computed="completed"]').innerText = 'Partially';
		} else {
			clone.querySelector('[data-slot-checkbox="completed"]').checked = gameData.completed;
			clone.querySelector('[data-slot-computed="completed"]').innerText = gameData.completed ? 'Yes' : 'No';
		}
		clone.querySelector('[data-slot-checkbox="completed"]').setAttribute('data-clean-value', String(gameData.completed));
		clone.querySelector('[data-slot-computed="subItems"]').innerHTML =
			gameData.subItems.length > 0
				? `<h3 class="visually-hidden" id="gaming-library-subitems-heading">Included games</h3>
				<ul aria-labelledby="gaming-library-subitems-heading">${gameData.subItems
					.map(
						(s) => `<li class="gaming-details-subitem">
								<p class="gaming-details-subitem-main">
									<input type="checkbox" aria-hidden="true" ${s.completed ? 'checked' : ''} readonly class="gaming-details-subitem-checkbox">
									<span class="gaming-details-subitem-label">
										${s.title}
										<span class="visually-hidden">${s.completed ? '(completed)' : '(not completed)'}</span>
									</span>
								</p>
								${s.trophyEarned ? toTrophyList(s.trophyEarned, trophySvgId) : ''}
							</li>`
					)
					.join('')}</ul>`
				: '';
		if (gameData.trophyIcon) {
			const iconHeight = parseInt(clone.querySelector('[data-slot-img="trophyIcon"]').getAttribute('height'), 10);
			const iconWidth = ['PS3', 'PS4', 'PSV'].includes(gameData.platform) ? iconHeight * (320 / 176) : iconHeight; // PS5 icons are square, PS3/PS4/Vita are 320x176
			clone.querySelector('[data-slot-img="trophyIcon"]').src = gameData.trophyIcon;
			clone.querySelector('[data-slot-img="trophyIcon"]').setAttribute('width', iconWidth);
		}
		clone.querySelector('[data-slot-computed="trophyEarned"]').innerHTML = gameData.trophyEarned
			? `<span class="gaming-details-trophies-percentage ${gameData.trophyProgress === 100 ? 'fontWeight-bold' : ''}">${gameData.trophyProgress}%:</span> ${toTrophyList(
					gameData.trophyEarned,
					trophySvgId
			  )}`
			: '';

		Array.from(dialog.childNodes).forEach((el) => el.remove());
		dialog.append(clone);
		dialog.setAttribute('aria-labelledby', dialogTitleRefId);
		dialog.style.setProperty('--cover-url', `url(${gameData.boxart.url})`);

		try {
			dialog.showModal();
		} catch (error) {
			dialog.setAttribute('open', '');
		}
	} else if (e.target.closest('[data-hide-game-info]') || e.target.matches('.gaming-details-dialog')) {
		const dialog = document.getElementById('gaming-details-dialog');
		hideOpenGame();

		if (!dialog) {
			return;
		}

		try {
			dialog.close();
		} catch (error) {
			dialog.removeAttribute('open');
		}
	} else if (e.target.closest('[type="checkbox"][readonly]')) {
		e.preventDefault();
		return false;
	} else if ((target = e.target.closest('[data-slot-checkbox="completed"]'))) {
		// Big inspiration from henry.codes and their NYC checklist site
		if (target.getAttribute('data-clean-value') === 'true') {
			e.preventDefault();
			alert(`I wish I could unbeat a game and relive it for the first time. Alas, such delights are not meant for us mere mortals…`);
			return;
		}

		if (cbox < msgs.length) {
			alert(msgs[cbox]);
		}

		if (cbox >= msgs.length - 1) {
			cbox++;
			e.target.parentElement.querySelector('[data-slot-computed="completed"]').innerText = e.target.checked ? 'Yes' : 'No';
			return;
		}

		cbox++;
		e.preventDefault();
	}
});

document.addEventListener('submit', function (e) {
	let target = e.target.closest('[data-gaming-toolbar]');
	if (target) {
		e.preventDefault();
		return false;
	}
});

document.addEventListener('change', function (e) {
	let target;
	if ((target = e.target.closest('[data-games-sizing]'))) {
		const selectedValue = target.value || 'md';
		const sizeMap = { sm: '0.75em', md: '1em', lg: '1.25em' };
		eachDom('[data-gaming-platform]', (g) => (g.style.fontSize = sizeMap[selectedValue]));
	}
});

document.addEventListener('keyup', function (e) {
	let target;
	if ((target = document.querySelector('.gaming-details-dialog'))) {
		// If the dialog was closed via native means (e.g. Esc key), the openGame variable won't be up to date: let's fix that
		if (!target.matches('[open]')) {
			hideOpenGame();
		}

		// If there is no open game, or the user had a modifier key pressed, ignore this event
		if (!openGame || e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
			return;
		}

		// Look for the previous or next game of the same group; if the bounds have been reached, loop back around
		let targetGame = null;
		if (e.key === 'ArrowLeft') {
			targetGame = openGame.previousElementSibling || openGame.parentElement.lastElementChild;
		} else if (e.key === 'ArrowRight') {
			targetGame = openGame.nextElementSibling || openGame.parentElement.firstElementChild;
		}
		if (targetGame) {
			let targetSpine = targetGame.querySelector('.gaming-spine-label');
			if (targetSpine) {
				targetSpine.click();
			}
		}
	}
});
