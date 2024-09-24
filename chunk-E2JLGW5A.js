import{Gb as p,L as y,P as u,Q as h,R as P,S as m,T as g,_ as M,ga as d,h as f,n as v,o as E,sb as L}from"./chunk-XP36KMKK.js";function b(e){return e.replace(/[a-z][A-Z]/g,n=>`${n[0]}-${n[1].toLowerCase()}`)}var a=class{supports(n){return n.includes(this.modifier)}addGlobalEventListener(){return()=>{}}unwrap(n){return n.split(".").filter(r=>!this.modifier.includes(r)).join(".")}},F=(()=>{class e extends a{constructor(){super(...arguments),this.modifier="$"}addEventListener(r,t){r[t]=r[t]||f;let i=this.getMethod(r,t),o=this.manager.getZone().onStable,s=v(o.pipe(y(()=>r[t]===f)),E(()=>r[t])).subscribe(i);return()=>s.unsubscribe()}getMethod(r,t){let[,i,o,s=""]=t.split(".");return t.endsWith(".attr")?c=>c===null?r.removeAttribute(i):r.setAttribute(i,String(c)):i==="class"?c=>r.classList.toggle(o,!!c):i==="style"?c=>r.style.setProperty(b(o),`${c}${s}`):c=>r[i]=c}}return e.\u0275fac=(()=>{let n;return function(t){return(n||(n=d(e)))(t||e)}})(),e.\u0275prov=u({token:e,factory:e.\u0275fac}),e})(),I=new P("[GLOBAL_HANDLER]: Global event target handler",{factory:()=>{let e=g(L);return n=>n==="body"?e.body:e.defaultView[n]||e.createElement("div")}}),D=(()=>{class e extends a{constructor(){super(...arguments),this.handler=g(I),this.modifier=">"}addEventListener(r,t,i){return this.manager.addEventListener(this.handler(t.split(">")[0]),t.split(">")[1],i)}}return e.\u0275fac=(()=>{let n;return function(t){return(n||(n=d(e)))(t||e)}})(),e.\u0275prov=u({token:e,factory:e.\u0275fac}),e})(),_=(()=>{class e extends a{constructor(){super(...arguments),this.modifier="capture.once.passive"}supports(r){return r.includes(".")&&!this.unwrap(r).includes(".")}addEventListener(r,t,i){return r.addEventListener(this.unwrap(t),i,{once:t.includes(".once"),passive:t.includes(".passive"),capture:t.includes(".capture")}),()=>r.removeEventListener(this.unwrap(t),i,t.includes(".capture"))}}return e.\u0275fac=(()=>{let n;return function(t){return(n||(n=d(e)))(t||e)}})(),e.\u0275prov=u({token:e,factory:e.\u0275fac}),e})(),w=(()=>{class e extends a{constructor(){super(...arguments),this.modifier=".prevent"}addEventListener(r,t,i){let o=s=>{s.preventDefault(),i(s)};return this.manager.addEventListener(r,this.unwrap(t),o)}}return e.\u0275fac=(()=>{let n;return function(t){return(n||(n=d(e)))(t||e)}})(),e.\u0275prov=u({token:e,factory:e.\u0275fac}),e})(),j=(()=>{class e extends a{constructor(){super(...arguments),this.modifier=".self"}addEventListener(r,t,i){let o=s=>{s.target===s.currentTarget&&i(s)};return this.manager.addEventListener(r,this.unwrap(t),o)}}return e.\u0275fac=(()=>{let n;return function(t){return(n||(n=d(e)))(t||e)}})(),e.\u0275prov=u({token:e,factory:e.\u0275fac}),e})(),l=(()=>{class e extends a{constructor(){super(...arguments),this.modifier=".silent"}addEventListener(r,t,i){return e.ngZone=this.manager.getZone(),e.ngZone.runOutsideAngular(()=>this.manager.addEventListener(r,this.unwrap(t),i))}}return e.\u0275fac=(()=>{let n;return function(t){return(n||(n=d(e)))(t||e)}})(),e.\u0275prov=u({token:e,factory:e.\u0275fac}),e})(),B=(()=>{class e extends a{constructor(){super(...arguments),this.modifier=".stop"}addEventListener(r,t,i){let o=s=>{s.stopPropagation(),i(s)};return this.manager.addEventListener(r,this.unwrap(t),o)}}return e.\u0275fac=(()=>{let n;return function(t){return(n||(n=d(e)))(t||e)}})(),e.\u0275prov=u({token:e,factory:e.\u0275fac}),e})(),S=(()=>{class e extends a{constructor(){super(...arguments),this.modifier=".init"}addEventListener(){return console.warn(".init plugin is no longer necessary as of v3.1.0"),()=>{}}}return e.\u0275fac=(()=>{let n;return function(t){return(n||(n=d(e)))(t||e)}})(),e.\u0275prov=u({token:e,factory:e.\u0275fac}),e})(),G=[l,F,D,_,w,j,B,S],k=G.map(e=>({provide:p,multi:!0,useClass:e}));function U(e){return(n,r,t)=>{let{value:i}=t;t.value=function(...o){e.apply(this,o)&&(l.ngZone?l.ngZone.run(()=>i.apply(this,o)):i.apply(this,o))}}}var R=(()=>{class e{constructor([r]){console.assert(!(r instanceof l)||e.initialized,"EventPluginsModule must come after BrowserModule in imports"),e.initialized=!0}}return e.initialized=!1,e.\u0275fac=function(r){return new(r||e)(m(p))},e.\u0275mod=M({type:e}),e.\u0275inj=h({providers:k}),e})();export{U as a,R as b};
