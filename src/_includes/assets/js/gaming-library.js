(()=>{function h(e,a){if(!e)throw new Error("Cannot convert to Cloudinary CDN: `url` value missing!");let t="https://res.cloudinary.com/chriskirknielsen";if(e.startsWith(t))return e;let r=`${t}/image/fetch`,i=String(a||""),c=encodeURI(e);return[r,i,c].filter(Boolean).join("/")}function y(e,a){return`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24" viewBox="0 0 24 24" class="gaming-details-trophies-icon | inline-icon">
		<title>${a} trophies</title>
		<use xlink:href="#${e}" width="24" height="24"></use>
	</svg>`}function f(e,a){return e?`<ul class="gaming-details-trophies | inline-list" data-flow="run-in">
		${Object.keys(e).filter(t=>e[t]>0).map(t=>`<li><span class="gaming-details-trophies-badge" data-trophy-level="${t}">${y(a,t)} ${e[t]}</span></li>`).join("")}
	</ul>`:""}var d=(e,a,t=document)=>Array.from(t.querySelectorAll(e)).forEach(a),s=0,p=["I'm sorry, but that's not how that works.","If I have time I'll finish it.","Listen, if it's that great, you can let me know and I'll add it to my backlog.","Oh look, I'm literally about to beat the final level!","Screw it. You win. I'm done."],l=null;document.addEventListener("DOMContentLoaded",function(e){document.querySelector("[data-gaming-toolbar]").hidden=!1,d(".gaming-box",a=>{let t=document.createElement("button");a.getAttributeNames().forEach(r=>t.setAttribute(r,a.getAttribute(r))),t.type="button",t.classList.add("button-reset"),t.innerHTML=a.innerHTML,a.replaceWith(t)})});document.addEventListener("click",function(e){let a;if(a=e.target.closest("[data-games-toggled]")){let t=a.getAttribute("aria-pressed")!=="true";a.setAttribute("aria-pressed",String(t)),d("details",r=>{r.open=t})}else if(a=e.target.closest(".gaming-box")){l=a.closest(".gaming-box-wrap");let t=JSON.parse(a.closest("[data-game]").getAttribute("data-game")),r=document.getElementById("gaming-details-dialog"),i=document.getElementById("gaming-details-dialog-template"),c=i.getAttribute("data-trophy-svg-id"),n=i.content.cloneNode(!0),g="gaming-details-dialog-title";if(d("[data-slot-show], [data-slot]:not([data-slot-show] *)",o=>{let m=o.getAttribute("data-slot-show")||o.getAttribute("data-slot"),u=t[m];o.hidden=Array.isArray(u)?u.length===0:!u},n),["title","edition","region","platform","dlc","year"].forEach(o=>{n.querySelector(`[data-slot="${o}"]`).innerText=t[o]}),n.querySelector('[data-slot="title"]').setAttribute("id",g),n.querySelector('[data-slot-computed="format"]').innerText=t.discs?t.discs>1?`${t.discs} discs`:"disc":"digital",t.completed===null?(n.querySelector('[data-slot-checkbox="completed"]').indeterminate=!0,n.querySelector('[data-slot-computed="completed"]').innerText="Partially"):(n.querySelector('[data-slot-checkbox="completed"]').checked=t.completed,n.querySelector('[data-slot-computed="completed"]').innerText=t.completed?"Yes":"No"),n.querySelector('[data-slot-checkbox="completed"]').setAttribute("data-clean-value",String(t.completed)),n.querySelector('[data-slot-computed="subItems"]').innerHTML=t.subItems.length>0?`<ul aria-label="Included games">${t.subItems.map(o=>`<li class="gaming-details-subitem">
								<p class="gaming-details-subitem-main">
									<input type="checkbox" aria-hidden="true" ${o.completed?"checked":""} readonly class="gaming-details-subitem-checkbox">
									<span class="gaming-details-subitem-label">
										${o.title}
										<span class="visually-hidden">${o.completed?"(completed)":"(not completed)"}</span>
									</span>
								</p>
								${o.trophyEarned?f(o.trophyEarned,c):""}
							</li>`).join("")}</ul>`:"",t.trophyIcon){let o=parseInt(n.querySelector('[data-slot-img="trophyIcon"]').getAttribute("height"),10),m=["PS3","PS4","PSV"].includes(t.platform)?o*(320/176):o;n.querySelector('[data-slot-img="trophyIcon"]').src=h(t.trophyIcon,`c_fit,h_${o}/q_80/f_auto`),n.querySelector('[data-slot-img="trophyIcon"]').setAttribute("width",m)}n.querySelector('[data-slot-computed="trophyEarned"]').innerHTML=t.trophyEarned?`<span class="gaming-details-trophies-percentage ${t.trophyProgress===100?"fontWeight-bold":""}">${t.trophyProgress}%:</span> ${f(t.trophyEarned,c)}`:"",Array.from(r.childNodes).forEach(o=>o.remove()),r.append(n),r.setAttribute("aria-labelledby",g);try{r.showModal()}catch{r.setAttribute("open","")}}else if(e.target.closest("[data-hide-game-info]")||e.target.matches(".gaming-details-dialog")){let t=document.getElementById("gaming-details-dialog");if(l=null,!t)return;try{t.close()}catch{t.removeAttribute("open")}}else{if(e.target.closest('[type="checkbox"][readonly]'))return e.preventDefault(),!1;if(a=e.target.closest('[data-slot-checkbox="completed"]')){if(a.getAttribute("data-clean-value")==="true"){e.preventDefault(),alert("I wish I could unbeat a game and relive it for the first time. Alas, such delights are not meant for us mere mortals\u2026");return}if(s<p.length&&alert(p[s]),s>=p.length-1){s++,e.target.parentElement.querySelector('[data-slot-computed="completed"]').innerText=e.target.checked?"Yes":"No";return}s++,e.preventDefault()}}});document.addEventListener("change",function(e){let a;if(a=e.target.closest("[data-games-sizing]")){let t=a.value||"md",r={sm:"0.75em",md:"1em",lg:"1.25em"};d("[data-gaming-platform]",i=>i.style.fontSize=r[t])}});document.addEventListener("keyup",function(e){let a;if(a=document.querySelector(".gaming-details-dialog")){if(a.matches("[open]")||(l=null),!l||e.altKey||e.shiftKey||e.ctrlKey||e.metaKey)return;let t=null;if(e.key==="ArrowLeft"?t=l.previousElementSibling||l.parentElement.lastElementChild:e.key==="ArrowRight"&&(t=l.nextElementSibling||l.parentElement.firstElementChild),t){let r=t.querySelector(".gaming-spine-label");r&&r.click()}}});})();
