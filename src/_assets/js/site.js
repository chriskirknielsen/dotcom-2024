function toggleInertForMenu(newState = false) {
	Array.from(document.body.querySelectorAll(':scope > :not(header)')).forEach((el) => (el.inert = newState));
}

document.addEventListener('click', function (e) {
	let target;
	if ((target = e.target.closest('[data-toggle-pressed]'))) {
		const newPressedValue = target.getAttribute('aria-pressed') !== 'true';
		target.setAttribute('aria-pressed', newPressedValue.toString());

		if (target.matches('.header-menu-toggle')) {
			toggleInertForMenu(newPressedValue);
		}
	} else {
		target = e.target;
		// Auto-close the theme picker if clicking outside of its container
		if (!target.closest('.header-themepicker')) {
			document.querySelector('.header-themepicker-toggle').setAttribute('aria-pressed', 'false');
		}
	}
});

document.addEventListener('keyup', function (e) {
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
	`%c
           Howdy fellow explorer of the Internet.
                 Thanks for stoppin' on by.


-----------------------------♥︎------------------------------


     CCCCCCCCCCCCCCCCC        KKKKKKKK NNNNNNNNNNNNNNNN     
  CCCCCCCCCCCCCCCCCCCC      KKKKKKKK   NNNNNNNNNNNNNNNNNNN  
 CCCCCCCCCCCCCCCCCCCCC    KKKKKKKK     NNNNNNNNNNNNNNNNNNNN 
CCCCCCC          CCCCC  KKKKKKKK       NNNNNN        NNNNNNN
CCCCCC           CCC  KKKKKKKK         NNNNNN         NNNNNN
CCCCCC              KKKKKKKK           NNNNNN         NNNNNN
CCCCCC             KKKKKKKK            NNNNNN         NNNNNN
CCCCCC              KKKKKKKK           NNNNNN         NNNNNN
CCCCCC           CCC  KKKKKKKK         NNNNNN         NNNNNN
CCCCCCC          CCCCC  KKKKKKKK       NNNNNN         NNNNNN
 CCCCCCCCCCCCCCCCCCCCC    KKKKKKKK     NNNNNN         NNNNNN
  CCCCCCCCCCCCCCCCCCCC      KKKKKKKK   NNNNNN         NNNNNN
     CCCCCCCCCCCCCCCCC       KKKKKKKKK NNNNNN         NNNNNN

	 
-----------------------------!------------------------------


This place is not a place of honor...no highly esteemed deed
       is commemorated here...nothing valued is here.`,
	`font-family:monospace;`
);
