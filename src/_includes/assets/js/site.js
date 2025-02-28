(()=>{function e(N=!1){Array.from(document.body.querySelectorAll(":scope > :not(header)")).forEach(C=>C.inert=N)}document.addEventListener("click",function(N){let C;if(C=N.target.closest("[data-toggle-pressed]")){let K=C.getAttribute("aria-pressed")!=="true";C.setAttribute("aria-pressed",K.toString()),C.matches(".header-menu-toggle")&&e(K)}});document.addEventListener("keyup",function(N){let C=document.querySelector('[data-toggle-pressed][aria-pressed="true"]');C&&(N.key==="Escape"||N.keyCode===27)&&(C.setAttribute("aria-pressed","false"),e(!1),C.focus())});window.matchMedia(`(min-width:${globalBreakpoint})`).addEventListener("change",function(N){Array.from(document.body.querySelectorAll(".header-menu-toggle, .header-themepicker-toggle")).forEach(C=>C.setAttribute("aria-pressed","false")),e(!1)});console.log(`%c
           Howdy fellow explorer of the Internet.
                 Thanks for stoppin' on by.


-----------------------------\u2665\uFE0E------------------------------


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
       is commemorated here...nothing valued is here.`,"font-family:monospace;");})();
