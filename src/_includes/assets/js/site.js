(()=>{function a(t=!1){Array.from(document.body.querySelectorAll(":scope > :not(header,script,style)")).forEach(e=>e.inert=t)}document.addEventListener("click",function(t){let e;if(e=t.target.closest("[data-toggle-pressed]")){let r=e.getAttribute("aria-pressed")!=="true";e.setAttribute("aria-pressed",r.toString()),e.matches(".header-menu-toggle")&&(r&&(document.documentElement.scrollTop=0),a(r))}else if(e=t.target.closest(".header-wrap")){if(t.target.closest(".header"))return;e.querySelector(".header-menu-toggle").setAttribute("aria-pressed",!1),a(!1),e.querySelector(".header-menu-toggle").focus()}else e=t.target,e.closest(".header-themepicker")||document.querySelector(".header-themepicker-toggle").setAttribute("aria-pressed","false")});document.addEventListener("keyup",function(t){let e=document.querySelector('[data-toggle-pressed][aria-pressed="true"]');e&&(t.key==="Escape"||t.keyCode===27)&&(e.setAttribute("aria-pressed","false"),a(!1),e.focus())});document.addEventListener("mouseenter",function(t){let e=t?.target?.closest?.(".footer-message");e&&(e.classList.add("activated"),e.addEventListener("animationend",r=>e.classList.remove("activated"),{once:!0}))},{capture:!0});window.matchMedia(`(min-width:${globalBreakpoint})`).addEventListener("change",function(t){Array.from(document.querySelectorAll(".header-menu-toggle, .header-themepicker-toggle")).forEach(e=>e.setAttribute("aria-pressed","false")),a(!1)});console.log(`
To meet a fellow explorer
In these liminal spaces
Outside hyperlink anchors
Hah, what a nice surprise

I hope not to take much
Of your attention any further
But hope you will keep an eye out
For what is worthy to discover

I wish your quest leads you farther
Someplace you can feel safe, and yet
Where you'd still want whisper:
\u201CHah, what a nice surprise.\u201D
`.trim());})();
