(()=>{var i=class extends HTMLElement{spawn(e,t){return Object.assign(document.createElement(e),t)}shuffle(e){for(let t=e.length-1;t>0;t-=1){let n=Math.floor(Math.random()*(t+1));[e[t],e[n]]=[e[n],e[t]]}return e}constructor(){super(),this.itemsList=this.shuffle(Array.from(this.querySelectorAll('[data-expander="content-items"] > li')).map(s=>`<span aria-hidden="true">${s.getAttribute("data-item-emoji")}</span>&ensp;${s.textContent}`));let e=this.querySelector('[data-expander="wrapper"]');this.blockDiv=this.spawn("div",{className:e.className});let t=this.querySelector('[data-expander="trigger"]'),n=Array.from(t.children);this.ctaButton=this.spawn("button",{className:t.className}),this.ctaButton.style.setProperty("--btn-justify-content",t.style.getPropertyValue("--btn-justify-content"));let a=this.querySelector('[data-expander="content"]');this.outputContainer=this.spawn("p",{className:a.className,hidden:!0}),n.length>0?this.ctaButton.append(...n):this.ctaButton.innerText=t.innerText,this.blockDiv.appendChild(this.ctaButton),this.blockDiv.appendChild(this.outputContainer),e.replaceWith(this.blockDiv),this.currentItemIndex=-1,this.ctaButton.addEventListener("click",()=>{let s=(this.currentItemIndex+1)%this.itemsList.length;(this.outputContainer.hidden||this.currentItemIndex===-1)&&(this.outputContainer.hidden=!1,this.blockDiv.setAttribute("data-open","true")),this.outputContainer.innerHTML=this.itemsList[s],this.currentItemIndex=s})}};customElements.define("cycling-expander",i);})();
