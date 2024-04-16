const eachDom = (s, fn) => Array.from(document.querySelectorAll(s)).forEach(fn);
let cbox = 0;
let msgs = [
	`I'm sorry but that's not how that works.`,
	`If I have time I'll finish it.`,
	`Listen if it's that great you can let me know and I'll add it to my backlog.`,
	`Oh look, I'm literally about to beat the final level!`,
	`Screw it. You win. I'm done.`,
];
document.addEventListener('DOMContentLoaded', function (e) {
	eachDom('.gaming-spine-label', (spine) => {
		const button = document.createElement('button');
		spine.getAttributeNames().forEach((attr) => button.setAttribute(attr, spine.getAttribute(attr)));
		button.type = 'button';
		button.classList.add('button-reset');
		button.innerHTML = spine.innerHTML;
		spine.replaceWith(button);
	});
});
document.addEventListener('click', function (e) {
	let target;
	if ((target = e.target.closest('[data-games-toggled]'))) {
		target.dataset.gamesToggled = String(target.dataset.gamesToggled !== 'true');
		eachDom('details', (d) => (d.open = target.dataset.gamesToggled === 'true'));
	} else if ((target = e.target.closest('.gaming-spine-label'))) {
		const gameData = JSON.parse(target.closest('[data-game]').getAttribute('data-game'));
		const dialog = document.getElementById('gaming-details-dialog');
		const template = document.getElementById('gaming-details-dialog-template');
		const clone = template.content.cloneNode(true);

		clone.querySelectorAll('[data-slot-show], [data-slot]:not([data-slot-show] *)').forEach((s) => {
			const prop = s.getAttribute('data-slot-show') || s.getAttribute('data-slot');
			const dataToTest = gameData[prop];
			s.hidden = Array.isArray(dataToTest) ? dataToTest.length === 0 : !Boolean(dataToTest);
		});

		['title', 'edition', 'region', 'platform', 'dlc', 'year'].forEach((p) => {
			clone.querySelector(`[data-slot="${p}"]`).innerText = gameData[p];
		});

		clone.querySelector('[data-slot-computed="format"]').innerText = !gameData.discs ? 'digital' : gameData.discs > 1 ? `${gameData.discs} discs` : 'disc';
		clone.querySelector('[data-slot-checkbox="completed"]').checked = gameData.completed;
		clone.querySelector('[data-slot-checkbox="completed"]').setAttribute('data-clean-value', gameData.completed.toString());
		clone.querySelector('[data-slot-computed="completed"]').innerText = gameData.completed ? 'Yes' : 'No';
		clone.querySelector('[data-slot-computed="subItems"]').innerText = gameData.subItems ? `${gameData.subItems.length} games` : '';

		Array.from(dialog.childNodes).forEach((el) => el.remove());
		dialog.append(clone);

		try {
			dialog.showModal();
		} catch (error) {
			dialog.setAttribute('open', '');
		}
	} else if ((target = e.target.closest('[data-hide-game-info]'))) {
		try {
			target.closest('dialog').close();
		} catch (error) {
			dialog.removeAttribute('open');
		}
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
			return;
		}

		cbox++;
		e.preventDefault();
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
