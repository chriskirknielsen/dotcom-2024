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

window.matchMedia(`(min-width:${globalBreakpoint})`).addEventListener('change', function (e) {
	Array.from(document.body.querySelectorAll('.header-menu-toggle, .header-themepicker-toggle')).forEach((el) => el.setAttribute('aria-pressed', 'false'));
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
