(()=>{var g=Object.defineProperty;var w=(i,t,o)=>t in i?g(i,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):i[t]=o;var p=(i,t,o)=>w(i,typeof t!="symbol"?t+"":t,o);var e=class e extends HTMLElement{static random(t,o){return t+Math.floor(Math.random()*(o-t)+1)}generateCss(t,o){let a=[];a.push(`
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
`);let l={width:100,height:100},n={x:"vw",y:"vh"};t==="element"&&(l={width:this.firstElementChild.clientWidth,height:this.firstElementChild.clientHeight},n={x:"px",y:"px"});for(let s=1;s<=o;s++){let r=e.random(1,100)*l.width/100,m=e.random(-10,10)*l.width/100,c=Math.round(e.random(30,100)),f=c*l.height/100,u=l.height,d=e.random(1,1e4)*1e-4,$=e.random(10,30),y=e.random(0,30)*-1;a.push(`
:nth-child(${s}) {
	opacity: ${e.random(0,1e3)*.001};
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
`)}connectedCallback(){if(this.shadowRoot||!("replaceSync"in CSSStyleSheet.prototype))return;let t=parseInt(this.getAttribute(e.attrs.count))||100,o;this.hasAttribute(e.attrs.mode)?o=this.getAttribute(e.attrs.mode):(o=this.firstElementChild?"element":"page",this.setAttribute(e.attrs.mode,o));let a=new CSSStyleSheet;a.replaceSync(this.generateCss(o,t));let l=this.attachShadow({mode:"open"});l.adoptedStyleSheets=[a];let n=document.createElement("div");for(let s=0,r=t;s<r;s++)l.appendChild(n.cloneNode());l.appendChild(document.createElement("slot"))}};p(e,"attrs",{count:"count",mode:"mode"});var h=e;customElements.define("snow-fall",h);})();
