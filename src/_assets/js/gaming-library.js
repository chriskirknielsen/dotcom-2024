// Helpers
const navAnimOffset = 100; // How far to move the dialog when navigating between games (in px)
const navAnimOpacity = 0; // How opaque to show the dialog when navigating between games (within [0;1])
const navAnimDuration = 200; // How fast to transition states for the dialog box (in ms)

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
function eachDom(s, fn, scope = document) {
	return Array.from(scope.querySelectorAll(s)).forEach(fn);
}

/** Creates the dialog markup for the game details to display. */
function loadAndPopulateGameDetailDialog(target, navAnimSign = 0) {
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
		? `<span class="gaming-details-trophies-percentage">${Object.values(gameData.trophyEarned).reduce((p, c) => p + c, 0)} <span${
				gameData.trophyProgress === 100 ? ' class="fontWeight-bold"' : ''
		  }>(${gameData.trophyProgress}%)</span>:</span> ${toTrophyList(gameData.trophyEarned, trophySvgId)}`
		: '';

	Array.from(dialog.childNodes).forEach((el) => el.remove());
	dialog.append(clone);
	dialog.setAttribute('aria-labelledby', dialogTitleRefId);
	if (gameData.boxart) {
		dialog.style.setProperty('--cover-url', `url(${gameData.boxart.url})`);
	} else {
		dialog.style.setProperty('--cover-url', `url(#null)`);
	}

	try {
		dialog.showModal();
	} catch (error) {
		dialog.setAttribute('open', '');
	}

	// Reset the "move" effect
	const resetMoveEffect = () => {
		dialog.style.opacity = '';
		dialog.style.translate = '';
	};

	// Animate if using a navigation shortcut
	if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches && navAnimSign !== 0) {
		dialog.getAnimations().forEach((a) => a.finish());
		dialog
			.animate(
				[
					{ translate: `${navAnimSign * navAnimOffset}px 0`, opacity: navAnimOpacity },
					{ translate: '0 0', opacity: 1 },
				],
				{ duration: navAnimDuration, ease: 'ease-out' }
			)
			.finished.then(resetMoveEffect);
	} else {
		resetMoveEffect();
	}
}

// Funny little messages if you try to change the checkbox state
let cbox = 0;
let msgs = [
	`I’m sorry, but that's not how that works.`,
	`If I have time I’ll finish it.`,
	`Listen, if it's that great, you can let me know and I’ll add it to my backlog.`,
	`Oh look, I’m literally about to beat the final level!`,
	`Screw it. You win. I’m done.`,
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
	if ((target = e.target.closest('[data-games-toggle-all]'))) {
		const newPressed = target.getAttribute('aria-pressed') !== 'true';
		target.setAttribute('aria-pressed', String(newPressed));
		target.setAttribute('data-indeterminate', 'false');
		eachDom('details', (d) => {
			d.open = newPressed;
		});
	} else if ((target = e.target.closest('.gaming-box'))) {
		loadAndPopulateGameDetailDialog(target);
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

document.addEventListener(
	'toggle',
	function (e) {
		let target;
		if ((target = e?.target?.closest?.('.expander-group .expander'))) {
			const group = target.closest('.expander-group');
			if (!group || !group.id) {
				return;
			}
			const toggleAllButton = document.querySelector(`[data-games-toggle-all="${group.id}"]`);
			const expanders = Array.from(group.querySelectorAll('.expander'));
			const allExpanderStates = new Set(expanders.map((exp) => exp.open));
			const allStatesIdentical = allExpanderStates.size === 1;
			toggleAllButton.setAttribute('data-indeterminate', Boolean(!allStatesIdentical).toString());
		}
	},
	{ capture: true }
);

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

/**
 * Reusable function to change the currently displayed game details in the dialog.
 * @param {boolean} prevCondition Condition to satisfy to load the previous game.
 * @param {boolean} nextCondition Condition to satisfy to load the next game
 */
function gameNavShortcut(prevCondition, nextCondition) {
	let targetGame = null;
	let direction;

	if (prevCondition) {
		direction = -1;
		targetGame = openGame.previousElementSibling || openGame.parentElement.lastElementChild;
	} else if (nextCondition) {
		direction = 1;
		targetGame = openGame.nextElementSibling || openGame.parentElement.firstElementChild;
	}

	if (targetGame) {
		let targetSpine = targetGame.querySelector('.gaming-spine-label');
		if (targetSpine) {
			loadAndPopulateGameDetailDialog(targetSpine, direction);
		}
	}
}

document.addEventListener('keyup', function (e) {
	let target;
	if ((target = document.querySelector('.gaming-details-dialog'))) {
		// If the dialog was closed via native means (e.g. Esc key), the openGame variable won't be up to date: let's fix that
		if (!target.matches('[open]')) {
			hideOpenGame();
		}

		const isModifierPressed = e.altKey || e.shiftKey || e.ctrlKey || e.metaKey;
		const isLeftOrRightArrow = e.key === 'ArrowLeft' || e.key === 'ArrowRight';

		// If there is no open game, or the user had a modifier key pressed, or didn't press the relevant arrow keys, ignore this event
		if (!openGame || isModifierPressed || !isLeftOrRightArrow) {
			return;
		}

		const doNav = () => gameNavShortcut(e.key === 'ArrowLeft', e.key === 'ArrowRight');

		if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
			let navAnimSign = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' ? -1 : 0;
			target.getAnimations().forEach((a) => a.finish());
			target.animate([{ translate: `${navAnimSign * navAnimOffset}px 0`, opacity: navAnimOpacity }], { duration: navAnimDuration / 2, ease: 'ease-in' }).finished.then(doNav);
		} else {
			doNav();
		}
	}
});

document.addEventListener('ckn:swipe', function (e) {
	if (e.target.closest('.gaming-details-dialog')) {
		let swipeDirectionX = e.detail.swipeDirection.x;
		gameNavShortcut(swipeDirectionX === 'right', swipeDirectionX === 'left');
	}
});

(() => {
	const swipeTargetSelector = '.gaming-details-dialog';
	let touchstartX = 0;
	let touchstartY = 0;
	let touchendX = 0;
	let touchendY = 0;

	document.addEventListener(
		'touchstart',
		function (event) {
			if (event.target.closest(swipeTargetSelector)) {
				touchstartX = event.changedTouches[0].screenX;
				touchstartY = event.changedTouches[0].screenY;
			}
		},
		false
	);
	document.addEventListener(
		'touchmove',
		function (event) {
			let target = event.target.closest(swipeTargetSelector);
			if (target) {
				let touchMoveX = event.changedTouches[0].screenX - touchstartX;
				let touchMoveY = event.changedTouches[0].screenY - touchstartY;
				let touchDeltaX = Math.abs(touchMoveX);
				let touchDeltaY = Math.abs(touchMoveY);

				if (touchDeltaX < touchDeltaY) {
					return;
				}

				// Only start fading after the offset threshold (half) has been met
				target.style.opacity = 1 - Math.min(Math.min(Math.max(0, touchDeltaX - navAnimOffset / 2), navAnimOffset) / navAnimOffset, navAnimOpacity);
				if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
					target.style.translate = `${Math.max(-1 * navAnimOffset, Math.min(navAnimOffset, touchMoveX))}px 0`;
				} else {
					target.style.translate = '';
				}
			}
		},
		false
	);
	document.addEventListener(
		'touchend',
		function (event) {
			const targetEl = event.target.closest(swipeTargetSelector);
			if (targetEl) {
				touchendX = event.changedTouches[0].screenX;
				touchendY = event.changedTouches[0].screenY;

				handleGesture(targetEl);
			}
		},
		false
	);

	function handleGesture(targetEl) {
		const moveX = touchendX - touchstartX;
		const moveY = touchendY - touchstartY;
		const deltaX = Math.abs(moveX);
		const deltaY = Math.abs(moveY);
		const thresholdX = navAnimOffset / 2;

		// Reset swipe tracking effect
		const resetSwipe = () => {
			targetEl.style.opacity = '';
			targetEl.style.translate = '';
		};

		// Only dispatch significant horizontal swipes, ignore all the rest
		if (deltaX < deltaY || (moveX === 0 && moveY === 0) || deltaX < thresholdX) {
			if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
				targetEl.getAnimations().forEach((a) => a.finish());
				targetEl.animate([{ translate: '0 0', opacity: 1 }], { duration: navAnimDuration, ease: 'ease-out' }).finished.then(resetSwipe);
			} else {
				resetSwipe();
			}
			return;
		}

		const event = new CustomEvent('ckn:swipe', {
			bubbles: true,
			detail: {
				swipeX: moveX,
				swipeY: moveY,
				swipeDirection: {
					x: moveX > 0 ? 'right' : 'left',
					y: moveY > 0 ? 'down' : 'up',
				},
			},
		});
		targetEl.dispatchEvent(event);
	}
})();
