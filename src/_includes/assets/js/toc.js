(()=>{document.addEventListener("DOMContentLoaded",()=>{let o=document.querySelectorAll(".toc ~ h2 .heading-anchor"),n=new IntersectionObserver(t=>{t.forEach(e=>{console.log(e.target.href,e.time),e.isIntersecting&&o.forEach(r=>{let c=document.querySelector(`.toc-list a[href="${r.getAttribute("href")}"]`);r===e.target?c.style.setProperty("--LINK-decoration-thickness","calc(var(--link-decoration-thickness, 1px) + 1.5px)"):c.style.removeProperty("--LINK-decoration-thickness")})})});o.forEach(t=>n.observe(t))});})();
