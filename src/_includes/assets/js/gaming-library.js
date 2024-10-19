(()=>{function b(t,a){return`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24" viewBox="0 0 24 24" class="gaming-details-trophies-icon | inline-icon">
		<title>${a} trophies</title>
		<use xlink:href="#${t}" width="24" height="24"></use>
	</svg>`}function y(t,a){return t?`<ul class="gaming-details-trophies | inline-list" data-flow="run-in">
		${Object.keys(t).filter(e=>t[e]>0).map(e=>`<li><span class="gaming-details-trophies-badge" data-trophy-level="${e}">${b(a,e)} ${t[e]}</span></li>`).join("")}
	</ul>`:""}var d=(t,a,e=document)=>Array.from(e.querySelectorAll(t)).forEach(a),n=0,u=["I'm sorry, but that's not how that works.","If I have time I'll finish it.","Listen, if it's that great, you can let me know and I'll add it to my backlog.","Oh look, I'm literally about to beat the final level!","Screw it. You win. I'm done."],i=null,f=()=>{i=null,document.getElementById("gaming-details-dialog").style.removeProperty("--cover-url")};document.addEventListener("DOMContentLoaded",function(t){document.querySelector("[data-gaming-toolbar]").hidden=!1,d(".gaming-box",a=>{let e=document.createElement("button");a.getAttributeNames().forEach(l=>e.setAttribute(l,a.getAttribute(l))),e.type="button",e.classList.add("button-reset"),Array.from(a.childNodes).forEach(l=>e.appendChild(l)),a.replaceWith(e)})});document.addEventListener("click",function(t){let a;if(a=t.target.closest("[data-games-toggled]")){let e=a.getAttribute("aria-pressed")!=="true";a.setAttribute("aria-pressed",String(e)),d("details",l=>{l.open=e})}else if(a=t.target.closest(".gaming-box")){i=a.closest(".gaming-box-wrap");let e=JSON.parse(a.closest("[data-game]").getAttribute("data-game")),l=document.getElementById("gaming-details-dialog"),s=document.getElementById("gaming-details-dialog-template"),h=s.getAttribute("data-trophy-svg-id"),r=s.content.cloneNode(!0),p="gaming-details-dialog-title",c="disc";switch(e.platform){case"PSV":case"Switch":{c="cartridge";break}}if(d("[data-slot-show], [data-slot]:not([data-slot-show] *)",o=>{let g=o.getAttribute("data-slot-show")||o.getAttribute("data-slot"),m=e[g];o.hidden=Array.isArray(m)?m.length===0:!m},r),["title","edition","region","platform","dlc","year"].forEach(o=>{r.querySelector(`[data-slot="${o}"]`).innerText=e[o]}),r.querySelector('[data-slot="title"]').setAttribute("id",p),r.querySelector('[data-slot-computed="format"]').innerText=e.discs?e.discs>1?`${e.discs} ${c}s`:c:"digital",e.completed===null?(r.querySelector('[data-slot-checkbox="completed"]').indeterminate=!0,r.querySelector('[data-slot-computed="completed"]').innerText="Partially"):(r.querySelector('[data-slot-checkbox="completed"]').checked=e.completed,r.querySelector('[data-slot-computed="completed"]').innerText=e.completed?"Yes":"No"),r.querySelector('[data-slot-checkbox="completed"]').setAttribute("data-clean-value",String(e.completed)),r.querySelector('[data-slot-computed="subItems"]').innerHTML=e.subItems.length>0?`<h3 class="visually-hidden" id="gaming-library-subitems-heading">Included games</h3>
				<ul aria-labelledby="gaming-library-subitems-heading">${e.subItems.map(o=>`<li class="gaming-details-subitem">
								<p class="gaming-details-subitem-main">
									<input type="checkbox" aria-hidden="true" ${o.completed?"checked":""} readonly class="gaming-details-subitem-checkbox">
									<span class="gaming-details-subitem-label">
										${o.title}
										<span class="visually-hidden">${o.completed?"(completed)":"(not completed)"}</span>
									</span>
								</p>
								${o.trophyEarned?y(o.trophyEarned,h):""}
							</li>`).join("")}</ul>`:"",e.trophyIcon){let o=parseInt(r.querySelector('[data-slot-img="trophyIcon"]').getAttribute("height"),10),g=["PS3","PS4","PSV"].includes(e.platform)?o*(320/176):o;r.querySelector('[data-slot-img="trophyIcon"]').src=e.trophyIcon,r.querySelector('[data-slot-img="trophyIcon"]').setAttribute("width",g)}r.querySelector('[data-slot-computed="trophyEarned"]').innerHTML=e.trophyEarned?`<span class="gaming-details-trophies-percentage ${e.trophyProgress===100?"fontWeight-bold":""}">${e.trophyProgress}%:</span> ${y(e.trophyEarned,h)}`:"",Array.from(l.childNodes).forEach(o=>o.remove()),l.append(r),l.setAttribute("aria-labelledby",p),l.style.setProperty("--cover-url",`url(${e.boxart.url})`);try{l.showModal()}catch{l.setAttribute("open","")}}else if(t.target.closest("[data-hide-game-info]")||t.target.matches(".gaming-details-dialog")){let e=document.getElementById("gaming-details-dialog");if(f(),!e)return;try{e.close()}catch{e.removeAttribute("open")}}else{if(t.target.closest('[type="checkbox"][readonly]'))return t.preventDefault(),!1;if(a=t.target.closest('[data-slot-checkbox="completed"]')){if(a.getAttribute("data-clean-value")==="true"){t.preventDefault(),alert("I wish I could unbeat a game and relive it for the first time. Alas, such delights are not meant for us mere mortals\u2026");return}if(n<u.length&&alert(u[n]),n>=u.length-1){n++,t.target.parentElement.querySelector('[data-slot-computed="completed"]').innerText=t.target.checked?"Yes":"No";return}n++,t.preventDefault()}}});document.addEventListener("submit",function(t){if(t.target.closest("[data-gaming-toolbar]"))return t.preventDefault(),!1});document.addEventListener("change",function(t){let a;if(a=t.target.closest("[data-games-sizing]")){let e=a.value||"md",l={sm:"0.75em",md:"1em",lg:"1.25em"};d("[data-gaming-platform]",s=>s.style.fontSize=l[e])}});document.addEventListener("keyup",function(t){let a;if(a=document.querySelector(".gaming-details-dialog")){if(a.matches("[open]")||f(),!i||t.altKey||t.shiftKey||t.ctrlKey||t.metaKey)return;let e=null;if(t.key==="ArrowLeft"?e=i.previousElementSibling||i.parentElement.lastElementChild:t.key==="ArrowRight"&&(e=i.nextElementSibling||i.parentElement.firstElementChild),e){let l=e.querySelector(".gaming-spine-label");l&&l.click()}}});})();
