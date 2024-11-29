(()=>{var g=Object.defineProperty;var w=(i,t,e)=>t in i?g(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var p=(i,t,e)=>(w(i,typeof t!="symbol"?t+"":t,e),e);var o=class o extends HTMLElement{static random(t,e){return t+Math.floor(Math.random()*(e-t)+1)}generateCss(t,e){let a=[];a.push(`
:host([mode="element"]) {
	display: block;
	position: relative;
	overflow: hidden;
}
:host([mode="page"]) {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
}
:host([mode="page"]),
:host([mode="element"]) > * {
	pointer-events: none;
}
:host([mode="element"]) ::slotted(*) {
	pointer-events: all;
}
* {
	position: absolute;
	width: var(--snow-fall-size, 10px);
	height: var(--snow-fall-size, 10px);
	background: var(--snow-fall-color, rgba(255,255,255,.5));
	border-radius: 50%;
}
`);let l={width:100,height:100},n={x:"vw",y:"vh"};t==="element"&&(l={width:this.firstElementChild.clientWidth,height:this.firstElementChild.clientHeight},n={x:"px",y:"px"});for(let s=1;s<=e;s++){let r=o.random(1,100)*l.width/100,m=o.random(-10,10)*l.width/100,c=Math.round(o.random(30,100)),f=c*l.height/100,u=l.height,d=o.random(1,1e4)*1e-4,$=o.random(10,30),y=o.random(0,30)*-1;a.push(`
:nth-child(${s}) {
	opacity: ${o.random(0,1e3)*.001};
	transform: translate(${r}${n.x}, -10px) scale(${d});
	animation: fall-${s} ${$}s ${y}s linear infinite;
}

@keyframes fall-${s} {
	${c}% {
		transform: translate(${r+m}${n.x}, ${f}${n.y}) scale(${d});
	}

	to {
		transform: translate(${r+m/2}${n.x}, ${u}${n.y}) scale(${d});
	}
}`)}return a.join(`
`)}connectedCallback(){if(this.shadowRoot||!("replaceSync"in CSSStyleSheet.prototype))return;let t=parseInt(this.getAttribute(o.attrs.count))||100,e;this.hasAttribute(o.attrs.mode)?e=this.getAttribute(o.attrs.mode):(e=this.firstElementChild?"element":"page",this.setAttribute(o.attrs.mode,e));let a=new CSSStyleSheet;a.replaceSync(this.generateCss(e,t));let l=this.attachShadow({mode:"open"});l.adoptedStyleSheets=[a];let n=document.createElement("div");for(let s=0,r=t;s<r;s++)l.appendChild(n.cloneNode());l.appendChild(document.createElement("slot"))}};p(o,"attrs",{count:"count",mode:"mode"});var h=o;customElements.define("snow-fall",h);})();
