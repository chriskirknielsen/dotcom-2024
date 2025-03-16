(()=>{function I(e,a){return`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24" viewBox="0 0 24 24" class="gaming-details-trophies-icon | inline-icon">
		<title>${a} trophies</title>
		<use xlink:href="#${e}" width="24" height="24"></use>
	</svg>`}function v(e,a){return e?`<ul class="gaming-details-trophies | inline-list" data-flow="run-in">
		${Object.keys(e).filter(t=>e[t]>0).map(t=>`<li><span class="gaming-details-trophies-badge" data-trophy-level="${t}">${I(a,t)} ${e[t]}</span></li>`).join("")}
	</ul>`:""}function b(e,a,t=document){return Array.from(t.querySelectorAll(e)).forEach(a)}function A(e,a=0){h=e.closest(".gaming-box-wrap");let t=JSON.parse(e.closest("[data-game]").getAttribute("data-game")),i=document.getElementById("gaming-details-dialog"),s=document.getElementById("gaming-details-dialog-template"),u=s.getAttribute("data-trophy-svg-id"),n=s.content.cloneNode(!0),r="gaming-details-dialog-title",l="disc";switch(t.platform){case"PSV":case"Switch":{l="cartridge";break}}if(b("[data-slot-show], [data-slot]:not([data-slot-show] *)",o=>{let c=o.getAttribute("data-slot-show")||o.getAttribute("data-slot"),d=t[c];o.hidden=Array.isArray(d)?d.length===0:!d},n),["title","edition","region","platform","dlc","year"].forEach(o=>{n.querySelector(`[data-slot="${o}"]`).innerText=t[o]}),n.querySelector('[data-slot="title"]').setAttribute("id",r),n.querySelector('[data-slot-computed="format"]').innerText=t.discs?t.discs>1?`${t.discs} ${l}s`:l:"digital",t.rating){let o=n.querySelector("#svg-star-icon"),c=parseInt(o.getAttribute("width"),10),d=parseInt(o.getAttribute("height"),10),m=o.getAttribute("viewBox").split(" ").map(y=>parseFloat(y)),f=`${t.rating} / 5`,E=`<span class="visually-hidden">${f}</span>`,$=`<svg
				xmlns="http://www.w3.org/2000/svg"
				width="${c*5}"
				height="${d}"
				viewBox="${m.map((y,k)=>k===2?y*5:y).join(" ")}"
				class="inline-icon inline-icon--center linecap-auto"
				aria-hidden="true"
			>
				<title>${f}</title>
				<defs>
					<pattern id="star-pattern-stroke" x="0" y="0" width="20%" height="100%" fill="none" stroke="currentColor">
						${o.innerHTML}
					</pattern>
					<pattern id="star-pattern-fill" x="0" y="0" width="20%" height="100%" fill="currentColor" patternUnits="userSpaceOnUse">
						${o.innerHTML}
					</pattern>
				</defs>
				<rect fill="url(#star-pattern-stroke)" width="${m[2]*5}" height="${m[3]}" />
				<rect fill="url(#star-pattern-fill)" width="${m[2]*t.rating}" height="${m[3]}" />
			</svg>`;n.querySelector('[data-slot-computed="rating"]').innerHTML=`${E}${$}`}if(t.completed===null?(n.querySelector('[data-slot-checkbox="completed"]').indeterminate=!0,n.querySelector('[data-slot-computed="completed"]').innerText="Partially"):(n.querySelector('[data-slot-checkbox="completed"]').checked=t.completed,n.querySelector('[data-slot-computed="completed"]').innerText=t.completed?"Yes":"No"),n.querySelector('[data-slot-checkbox="completed"]').setAttribute("data-clean-value",String(t.completed)),n.querySelector('[data-slot-computed="subItems"]').innerHTML=t.subItems.length>0?`<h3 class="visually-hidden" id="gaming-library-subitems-heading">Included games</h3>
				<ul aria-labelledby="gaming-library-subitems-heading">${t.subItems.map(o=>`<li class="gaming-details-subitem">
								<p class="gaming-details-subitem-main">
									<input type="checkbox" aria-hidden="true" ${o.completed?"checked":""} readonly class="gaming-details-subitem-checkbox">
									<span class="gaming-details-subitem-label">
										${o.title}
										<span class="visually-hidden">${o.completed?"(completed)":"(not completed)"}</span>
									</span>
								</p>
								${o.trophyEarned?v(o.trophyEarned,u):""}
							</li>`).join("")}</ul>`:"",t.trophyIcon){let o=parseInt(n.querySelector('[data-slot-img="trophyIcon"]').getAttribute("height"),10),c=["PS3","PS4","PSV"].includes(t.platform)?o*(320/176):o;n.querySelector('[data-slot-img="trophyIcon"]').src=t.trophyIcon,n.querySelector('[data-slot-img="trophyIcon"]').setAttribute("width",c)}n.querySelector('[data-slot-computed="trophyEarned"]').innerHTML=t.trophyEarned?`<span class="gaming-details-trophies-percentage ${t.trophyProgress===100?"fontWeight-bold":""}">${t.trophyProgress}%:</span> ${v(t.trophyEarned,u)}`:"",Array.from(i.childNodes).forEach(o=>o.remove()),i.append(n),i.setAttribute("aria-labelledby",r),i.style.setProperty("--cover-url",`url(${t.boxart.url})`);try{i.showModal()}catch{i.setAttribute("open","")}let g=()=>{i.style.opacity="",i.style.translate=""};window.matchMedia("(prefers-reduced-motion: no-preference)").matches&&a!==0?(i.getAnimations().forEach(o=>o.finish()),i.animate([{translate:`${a*100}px 0`,opacity:.5},{translate:"0 0",opacity:1}],{duration:200,ease:"ease-out"}).finished.then(g)):g()}var p=0,w=["I'm sorry, but that's not how that works.","If I have time I'll finish it.","Listen, if it's that great, you can let me know and I'll add it to my backlog.","Oh look, I'm literally about to beat the final level!","Screw it. You win. I'm done."],h=null,S=()=>{h=null,document.getElementById("gaming-details-dialog").style.removeProperty("--cover-url")};document.addEventListener("DOMContentLoaded",function(e){document.querySelector("[data-gaming-toolbar]").hidden=!1,b(".gaming-box",a=>{let t=document.createElement("button");a.getAttributeNames().forEach(i=>t.setAttribute(i,a.getAttribute(i))),t.type="button",t.classList.add("button-reset"),Array.from(a.childNodes).forEach(i=>t.appendChild(i)),a.replaceWith(t)})});document.addEventListener("click",function(e){let a;if(a=e.target.closest("[data-games-toggle-all]")){let t=a.getAttribute("aria-pressed")!=="true";a.setAttribute("aria-pressed",String(t)),a.setAttribute("data-indeterminate","false"),b("details",i=>{i.open=t})}else if(a=e.target.closest(".gaming-box"))A(a);else if(e.target.closest("[data-hide-game-info]")||e.target.matches(".gaming-details-dialog")){let t=document.getElementById("gaming-details-dialog");if(S(),!t)return;try{t.close()}catch{t.removeAttribute("open")}}else{if(e.target.closest('[type="checkbox"][readonly]'))return e.preventDefault(),!1;if(a=e.target.closest('[data-slot-checkbox="completed"]')){if(a.getAttribute("data-clean-value")==="true"){e.preventDefault(),alert("I wish I could unbeat a game and relive it for the first time. Alas, such delights are not meant for us mere mortals\u2026");return}if(p<w.length&&alert(w[p]),p>=w.length-1){p++,e.target.parentElement.querySelector('[data-slot-computed="completed"]').innerText=e.target.checked?"Yes":"No";return}p++,e.preventDefault()}}});document.addEventListener("toggle",function(e){let a;if(a=e?.target?.closest(".expander-group .expander")){let t=a.closest(".expander-group");if(!t||!t.id)return;let i=document.querySelector(`[data-games-toggle-all="${t.id}"]`),s=Array.from(t.querySelectorAll(".expander")),n=new Set(s.map(r=>r.open)).size===1;i.setAttribute("data-indeterminate",(!n).toString())}},{capture:!0});document.addEventListener("submit",function(e){if(e.target.closest("[data-gaming-toolbar]"))return e.preventDefault(),!1});document.addEventListener("change",function(e){let a;if(a=e.target.closest("[data-games-sizing]")){let t=a.value||"md",i={sm:"0.75em",md:"1em",lg:"1.25em"};b("[data-gaming-platform]",s=>s.style.fontSize=i[t])}});function x(e,a){let t=null,i;if(e?(i=-1,t=h.previousElementSibling||h.parentElement.lastElementChild):a&&(i=1,t=h.nextElementSibling||h.parentElement.firstElementChild),t){let s=t.querySelector(".gaming-spine-label");s&&A(s,i)}}document.addEventListener("keyup",function(e){let a;if(a=document.querySelector(".gaming-details-dialog")){a.matches("[open]")||S();let t=e.altKey||e.shiftKey||e.ctrlKey||e.metaKey,i=e.key==="ArrowLeft"||e.key==="ArrowRight";if(!h||t||!i)return;let s=()=>x(e.key==="ArrowLeft",e.key==="ArrowRight");if(window.matchMedia("(prefers-reduced-motion: no-preference)").matches){let u=e.key==="ArrowLeft"?1:e.key==="ArrowRight"?-1:0;a.getAnimations().forEach(n=>n.finish()),a.animate([{translate:`${u*100}px 0`,opacity:.5}],{duration:200/2,ease:"ease-in"}).finished.then(s)}else s()}});document.addEventListener("ckn:swipe",function(e){if(e.target.closest(".gaming-details-dialog")){let a=e.detail.swipeDirection.x;x(a==="right",a==="left")}});(()=>{let e=".gaming-details-dialog",a=0,t=0,i=0,s=0;document.addEventListener("touchstart",function(n){n.target.closest(e)&&(a=n.changedTouches[0].screenX,t=n.changedTouches[0].screenY)},!1),document.addEventListener("touchmove",function(n){let r=n.target.closest(e);if(r){let l=n.changedTouches[0].screenX-a,g=n.changedTouches[0].screenY-t,o=Math.abs(l),c=Math.abs(g);if(o<c)return;r.style.opacity=1-Math.min(Math.min(Math.max(0,o-100/2),100)/100,.5),window.matchMedia("(prefers-reduced-motion: no-preference)").matches?r.style.translate=`${Math.max(-1*100,Math.min(100,l))}px 0`:r.style.translate=""}},!1),document.addEventListener("touchend",function(n){let r=n.target.closest(e);r&&(i=n.changedTouches[0].screenX,s=n.changedTouches[0].screenY,u(r))},!1);function u(n){let r=i-a,l=s-t,g=Math.abs(r),o=Math.abs(l),c=100/2,d=()=>{n.style.opacity="",n.style.translate=""};if(g<o||r===0&&l===0||g<c){window.matchMedia("(prefers-reduced-motion: no-preference)").matches?(n.getAnimations().forEach(f=>f.finish()),n.animate([{translate:"0 0",opacity:1}],{duration:200,ease:"ease-out"}).finished.then(d)):d();return}let m=new CustomEvent("ckn:swipe",{bubbles:!0,detail:{swipeX:r,swipeY:l,swipeDirection:{x:r>0?"right":"left",y:l>0?"down":"up"}}});n.dispatchEvent(m)}})();})();
