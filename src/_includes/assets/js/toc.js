(()=>{document.addEventListener("DOMContentLoaded",()=>{let o=Array.from(document.querySelectorAll(".toc ~ :is(h2, h3, h4)"));if(o.length===0)return;let u=e=>e.closest(".toc-list li").setAttribute("data-current",""),f=e=>e.closest(".toc-list li").removeAttribute("data-current"),g=e=>document.querySelector(`.toc-list a[href="#${e.id}"]`),c=()=>Math.floor(document.body.clientHeight),m=.5,i=new Set,a,r,l=c();function d(e){let h=new IntersectionObserver(s=>{s.forEach(t=>{t.isIntersecting?i.add(t.target):i.delete(t.target)});let b=Array.from(i.values()).sort((t,n)=>o.indexOf(n)-o.indexOf(t))[0];o.forEach(t=>{let n=g(t);t===b?u(n):f(n)})},{rootMargin:`${e}px 0px -${m*100}% 0px`,threshold:1});return o.forEach(s=>h.observe(s)),h}r=d(l),window.addEventListener("resize",()=>{clearTimeout(a),a=setTimeout(()=>{let e=c();l!==e&&(r&&r.disconnect(),r=d(e))},200)})});})();
