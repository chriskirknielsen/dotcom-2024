(()=>{function A(e,a){return`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24" viewBox="0 0 24 24" class="gaming-details-trophies-icon | inline-icon">
		<title>${a} trophies</title>
		<use xlink:href="#${e}" width="24" height="24"></use>
	</svg>`}function w(e,a){return e?`<ul class="gaming-details-trophies | inline-list" data-flow="run-in">
		${Object.keys(e).filter(t=>e[t]>0).map(t=>`<li><span class="gaming-details-trophies-badge" data-trophy-level="${t}">${A(a,t)} ${e[t]}</span></li>`).join("")}
	</ul>`:""}var m=(e,a,t=document)=>Array.from(t.querySelectorAll(e)).forEach(a),c=0,p=["I'm sorry, but that's not how that works.","If I have time I'll finish it.","Listen, if it's that great, you can let me know and I'll add it to my backlog.","Oh look, I'm literally about to beat the final level!","Screw it. You win. I'm done."],o=null,v=()=>{o=null,document.getElementById("gaming-details-dialog").style.removeProperty("--cover-url")};document.addEventListener("DOMContentLoaded",function(e){document.querySelector("[data-gaming-toolbar]").hidden=!1,m(".gaming-box",a=>{let t=document.createElement("button");a.getAttributeNames().forEach(i=>t.setAttribute(i,a.getAttribute(i))),t.type="button",t.classList.add("button-reset"),Array.from(a.childNodes).forEach(i=>t.appendChild(i)),a.replaceWith(t)})});document.addEventListener("click",function(e){let a;if(a=e.target.closest("[data-games-toggled]")){let t=a.getAttribute("aria-pressed")!=="true";a.setAttribute("aria-pressed",String(t)),m("details",i=>{i.open=t})}else if(a=e.target.closest(".gaming-box")){o=a.closest(".gaming-box-wrap");let t=JSON.parse(a.closest("[data-game]").getAttribute("data-game")),i=document.getElementById("gaming-details-dialog"),g=document.getElementById("gaming-details-dialog-template"),y=g.getAttribute("data-trophy-svg-id"),l=g.content.cloneNode(!0),f="gaming-details-dialog-title",h="disc";switch(t.platform){case"PSV":case"Switch":{h="cartridge";break}}if(m("[data-slot-show], [data-slot]:not([data-slot-show] *)",r=>{let n=r.getAttribute("data-slot-show")||r.getAttribute("data-slot"),s=t[n];r.hidden=Array.isArray(s)?s.length===0:!s},l),["title","edition","region","platform","dlc","year"].forEach(r=>{l.querySelector(`[data-slot="${r}"]`).innerText=t[r]}),l.querySelector('[data-slot="title"]').setAttribute("id",f),l.querySelector('[data-slot-computed="format"]').innerText=t.discs?t.discs>1?`${t.discs} ${h}s`:h:"digital",t.rating){let r=l.querySelector("#svg-star-icon"),n=parseInt(r.getAttribute("width"),10),s=parseInt(r.getAttribute("height"),10),d=r.getAttribute("viewBox").split(" ").map(u=>parseFloat(u)),b=`${t.rating} / 5`,S=`<span class="visually-hidden">${b}</span>`,$=`<svg
				xmlns="http://www.w3.org/2000/svg"
				width="${n*5}"
				height="${s}"
				viewBox="${d.map((u,x)=>x===2?u*5:u).join(" ")}"
				class="inline-icon linecap-auto"
				aria-hidden="true"
			>
				<title>${b}</title>
				<defs>
					<pattern id="star-pattern-stroke" x="0" y="0" width="20%" height="100%" fill="none" stroke="currentColor">
						${r.innerHTML}
					</pattern>
					<pattern id="star-pattern-fill" x="0" y="0" width="20%" height="100%" fill="currentColor" patternUnits="userSpaceOnUse">
						${r.innerHTML}
					</pattern>
				</defs>
				<rect fill="url(#star-pattern-stroke)" width="${d[2]*5}" height="${d[3]}" />
				<rect fill="url(#star-pattern-fill)" width="${d[2]*t.rating}" height="${d[3]}" />
			</svg>`;l.querySelector('[data-slot-computed="rating"]').innerHTML=`${S}${$}`}if(t.completed===null?(l.querySelector('[data-slot-checkbox="completed"]').indeterminate=!0,l.querySelector('[data-slot-computed="completed"]').innerText="Partially"):(l.querySelector('[data-slot-checkbox="completed"]').checked=t.completed,l.querySelector('[data-slot-computed="completed"]').innerText=t.completed?"Yes":"No"),l.querySelector('[data-slot-checkbox="completed"]').setAttribute("data-clean-value",String(t.completed)),l.querySelector('[data-slot-computed="subItems"]').innerHTML=t.subItems.length>0?`<h3 class="visually-hidden" id="gaming-library-subitems-heading">Included games</h3>
				<ul aria-labelledby="gaming-library-subitems-heading">${t.subItems.map(r=>`<li class="gaming-details-subitem">
								<p class="gaming-details-subitem-main">
									<input type="checkbox" aria-hidden="true" ${r.completed?"checked":""} readonly class="gaming-details-subitem-checkbox">
									<span class="gaming-details-subitem-label">
										${r.title}
										<span class="visually-hidden">${r.completed?"(completed)":"(not completed)"}</span>
									</span>
								</p>
								${r.trophyEarned?w(r.trophyEarned,y):""}
							</li>`).join("")}</ul>`:"",t.trophyIcon){let r=parseInt(l.querySelector('[data-slot-img="trophyIcon"]').getAttribute("height"),10),n=["PS3","PS4","PSV"].includes(t.platform)?r*(320/176):r;l.querySelector('[data-slot-img="trophyIcon"]').src=t.trophyIcon,l.querySelector('[data-slot-img="trophyIcon"]').setAttribute("width",n)}l.querySelector('[data-slot-computed="trophyEarned"]').innerHTML=t.trophyEarned?`<span class="gaming-details-trophies-percentage ${t.trophyProgress===100?"fontWeight-bold":""}">${t.trophyProgress}%:</span> ${w(t.trophyEarned,y)}`:"",Array.from(i.childNodes).forEach(r=>r.remove()),i.append(l),i.setAttribute("aria-labelledby",f),i.style.setProperty("--cover-url",`url(${t.boxart.url})`);try{i.showModal()}catch{i.setAttribute("open","")}}else if(e.target.closest("[data-hide-game-info]")||e.target.matches(".gaming-details-dialog")){let t=document.getElementById("gaming-details-dialog");if(v(),!t)return;try{t.close()}catch{t.removeAttribute("open")}}else{if(e.target.closest('[type="checkbox"][readonly]'))return e.preventDefault(),!1;if(a=e.target.closest('[data-slot-checkbox="completed"]')){if(a.getAttribute("data-clean-value")==="true"){e.preventDefault(),alert("I wish I could unbeat a game and relive it for the first time. Alas, such delights are not meant for us mere mortals\u2026");return}if(c<p.length&&alert(p[c]),c>=p.length-1){c++,e.target.parentElement.querySelector('[data-slot-computed="completed"]').innerText=e.target.checked?"Yes":"No";return}c++,e.preventDefault()}}});document.addEventListener("submit",function(e){if(e.target.closest("[data-gaming-toolbar]"))return e.preventDefault(),!1});document.addEventListener("change",function(e){let a;if(a=e.target.closest("[data-games-sizing]")){let t=a.value||"md",i={sm:"0.75em",md:"1em",lg:"1.25em"};m("[data-gaming-platform]",g=>g.style.fontSize=i[t])}});document.addEventListener("keyup",function(e){let a;if(a=document.querySelector(".gaming-details-dialog")){if(a.matches("[open]")||v(),!o||e.altKey||e.shiftKey||e.ctrlKey||e.metaKey)return;let t=null;if(e.key==="ArrowLeft"?t=o.previousElementSibling||o.parentElement.lastElementChild:e.key==="ArrowRight"&&(t=o.nextElementSibling||o.parentElement.firstElementChild),t){let i=t.querySelector(".gaming-spine-label");i&&i.click()}}});})();
