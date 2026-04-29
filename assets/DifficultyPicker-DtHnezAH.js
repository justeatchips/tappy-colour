import{V as $,c as Y}from"./BaseView-DKZ_zKSj.js";import{m as D,P as q,U as I,a as _}from"./main-Bk1YyjfQ.js";import{M as K,B as W}from"./objectUrl-DzFBoVO2.js";import{decodeAndDownscale as X}from"./imageImport-COAoLpFE.js";const Z=[{id:"easy",label:"EASY",sliderValue:0},{id:"medium",label:"MEDIUM",sliderValue:.5},{id:"hard",label:"HARD",sliderValue:1}];function G(n){const e=Math.round(n.gridSize*n.gridSize*n.paletteSize/100);return Math.max(1,Math.ceil(e/60))}function Q(n){return Z.map(e=>{const t=D(e.sliderValue,{autoFillEnabled:n});return{...e,settings:t,estimatedMinutes:G(t),tinyCells:t.gridSize>=64}})}function B(n){return Math.abs(16807*(n%2147483646)%2147483647)}function J(n,e,t=20,i=42){const a=n.length/4,r=Math.min(e,Math.max(1,a)),s=[],u=new Uint32Array(1);u[0]=B(i),s.push(B(u[0])%a);const l=new Float64Array(a);l.fill(1/0);for(let d=1;d<r;d++){tt(n,a,s,l);let p=0;for(let w=0;w<a;w++)p+=l[w];let C=B(u[0])/4294967296*p;u[0]=B(u[0]);let x=0;for(let w=0;w<a;w++)if(x+=l[w],x>=C){s.push(w);break}}const m=new Float64Array(r),c=new Float64Array(r),o=new Float64Array(r);for(let d=0;d<r;d++){const p=s[d];m[d]=n[p*4],c[d]=n[p*4+1],o[d]=n[p*4+2]}const h=new Uint8Array(a);for(let d=0;d<t;d++){let p=0,C=0,x=0;const w=new Float64Array(r),v=new Float64Array(r),M=new Float64Array(r),y=new Int32Array(r);for(let f=0;f<a;f++){const N=n[f*4],R=n[f*4+1],V=n[f*4+2];let A=1/0,E=0;for(let k=0;k<r;k++){const F=N-m[k],L=R-c[k],z=V-o[k],U=F*F+L*L+z*z;U<A&&(A=U,E=k)}h[f]!==E&&p++,h[f]=E,A>C&&(C=A,x=f),w[E]+=N,v[E]+=R,M[E]+=V,y[E]++}const T=[];for(let f=0;f<r;f++)y[f]===0?T.push(f):(m[f]=w[f]/y[f],c[f]=v[f]/y[f],o[f]=M[f]/y[f]);for(const f of T)m[f]=n[x*4],c[f]=n[x*4+1],o[f]=n[x*4+2];if(p===0)break}const g=[];for(let d=0;d<r;d++)g.push({r:Math.max(0,Math.min(255,Math.round(m[d]))),g:Math.max(0,Math.min(255,Math.round(c[d]))),b:Math.max(0,Math.min(255,Math.round(o[d]))),a:255});return{centroids:g,assignments:h}}function tt(n,e,t,i){const a=t[t.length-1],r=n[a*4],s=n[a*4+1],u=n[a*4+2];for(let l=0;l<e;l++){const m=n[l*4],c=n[l*4+1],o=n[l*4+2],h=m-r,g=c-s,d=o-u,p=h*h+g*g+d*d;i[l]=Math.min(i[l],p)}}const et=.45,nt=.05,it=.9,at=42;function P(n,e,t){return e*t+n}function rt(n,e){const t=[];for(let i=0;i<n;i++)t.push({col:i,row:0}),e>1&&t.push({col:i,row:e-1});for(let i=1;i<e-1;i++)t.push({col:0,row:i}),n>1&&t.push({col:n-1,row:i});return t}function st(n,e){const t=n.r-e.r,i=n.g-e.g,a=n.b-e.b;return Math.sqrt(t*t+i*i+a*a)}function ot(n,e){const t=new Int32Array(n.centroids.length);for(const{col:r,row:s}of e){const u=n.paletteIndices[P(r,s,n.columns)];u<t.length&&t[u]++}let i=-1,a=0;for(let r=0;r<t.length;r++)t[r]>a&&(i=r,a=t[r]);return i>=0&&a/e.length>=et?i:null}function lt(n){const e=n.columns*n.rows;if(e===0||n.centroids.length===0)return[];const t=rt(n.columns,n.rows),i=ot(n,t);if(i===null)return[];const a=n.centroids[i],r=new Set(n.centroids.map((c,o)=>({colour:c,index:o})).filter(({colour:c})=>st(a,c)<=at).map(({index:c})=>c)),s=new Uint8Array(e),u=[],l=[];for(const c of t){const o=P(c.col,c.row,n.columns),h=n.paletteIndices[o];r.has(h)&&l.push(c)}for(let c=0;c<l.length;c++){const{col:o,row:h}=l[c];if(o<0||o>=n.columns||h<0||h>=n.rows)continue;const g=P(o,h,n.columns);if(s[g])continue;s[g]=1;const d=n.paletteIndices[g];r.has(d)&&(u.push({col:o,row:h}),l.push({col:o-1,row:h},{col:o+1,row:h},{col:o,row:h-1},{col:o,row:h+1}))}const m=u.length/e;return m<nt||m>=it?[]:u}const ct=typeof OffscreenCanvas<"u";function O(n,e){const t=q.create(n.columns,n.rows,n.paletteIndices,n.centroids.length);return e.autoFillEnabled&&t.paintCells(lt(n)),t}async function dt(n,e){const t=Math.min(n.width,n.height),i=(n.width-t)/2,a=(n.height-t)/2;let r;ct?r=new OffscreenCanvas(e.gridSize,e.gridSize):(r=document.createElement("canvas"),r.width=e.gridSize,r.height=e.gridSize);const s=r.getContext("2d");s.drawImage(n,i,a,t,t,0,0,e.gridSize,e.gridSize);const u=s.getImageData(0,0,e.gridSize,e.gridSize),{centroids:l,assignments:m}=J(u.data,e.paletteSize);return{paletteIndices:m,centroids:l,columns:e.gridSize,rows:e.gridSize}}async function ut(n,e){const t=await fetch(n);if(!t.ok)throw new Error(`Failed to fetch image: ${t.statusText}`);const i=await t.blob(),a=await createImageBitmap(i);try{return await dt(a,e)}finally{a.close()}}let b=null,mt=0;const S=new Map;function ht(n){return"message"in n&&n.message?new Error(n.message):new Error("Worker error")}function ft(n){for(const e of S.values())e.reject(n);S.clear()}function pt(n){const e=b;b=null,ft(n),e?.terminate()}function j(n){n.preventDefault?.(),pt(ht(n))}function gt(){return b||(b=new Worker(new URL("/tappy-colour/assets/conversion.worker-ChQCZfHx.js",import.meta.url),{type:"module"}),b.addEventListener("message",n=>{const{id:e,result:t,error:i}=n.data,a=S.get(e);a&&(S.delete(e),i?a.reject(new Error(i)):a.resolve(t))}),b.addEventListener("error",j),b.addEventListener("messageerror",j)),b}function wt(n,e){return new Promise((t,i)=>{const a=gt(),r=++mt;S.set(r,{resolve:t,reject:i});try{a.postMessage({id:r,bitmap:n,settings:e},[n])}catch(s){S.delete(r),i(s instanceof Error?s:new Error("Worker postMessage failed"))}})}function H(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}class xt{el;currentCount=0;constructor(){if(this.el=document.createElement("div"),this.el.className="chick-row",this.el.style.cssText=`
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      min-height: 40px;
      align-items: center;
      justify-content: center;
    `,!document.getElementById("chick-row-styles")){const e=document.createElement("style");e.id="chick-row-styles",e.textContent=`
        @keyframes chick-enter {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes chick-exit {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.5);
          }
        }
        .chick-enter {
          animation: chick-enter 0.3s ease-out;
        }
        .chick-exit {
          animation: chick-exit 0.3s ease-in;
        }
      `,document.head.appendChild(e)}}get element(){return this.el}update(e){const t=Math.max(1,Math.floor(1+e*9));if(t>this.currentCount)for(let i=this.currentCount;i<t;i++){const a=document.createElement("img");a.src="/tappy-colour/images/chick.png",a.alt="chick",a.className="chick-enter",a.style.cssText=`
          width: 32px;
          height: 32px;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        `,this.el.appendChild(a)}else if(t<this.currentCount){const i=this.el.querySelectorAll("img");for(let a=i.length-1;a>=t;a--){const r=i[a];r.classList.remove("chick-enter"),r.classList.add("chick-exit");const s=()=>{r.remove(),r.removeEventListener("animationend",s)};r.addEventListener("animationend",s)}}this.currentCount=t}}const vt=256,yt=1024;async function Ct(n,e=vt){const t=document.createElement("canvas");return t.width=e,t.height=e,t.getContext("2d").drawImage(n,0,0,e,e),new Promise((a,r)=>{t.toBlob(s=>s?a(s):r(new Error("toBlob failed")),"image/jpeg",.8)})}async function bt(n,e=yt){const t=Math.min(1,e/Math.max(n.width,n.height)),i=Math.max(1,Math.round(n.width*t)),a=Math.max(1,Math.round(n.height*t)),r=document.createElement("canvas");r.width=i,r.height=a;const s=r.getContext("2d");return s.fillStyle="#fff",s.fillRect(0,0,i,a),s.drawImage(n,0,0,i,a),new Promise((u,l)=>{r.toBlob(m=>m?u(m):l(new Error("toBlob failed")),"image/jpeg",.9)})}class Mt extends ${constructor(e,t,i,a){super(),this.router=e,this.store=t,this.bundledName=i,this.staged=a}root=null;sliderValue=I.get().defaultSliderValue;chickRow=null;startBtn=null;sliderInput=null;previewCards=[];previewCanvases=[];objectUrls=new K;mount(e){this.root=e,Y(e);const t=document.createElement("div");t.className="difficulty-screen";const i=document.createElement("div");i.className="difficulty-topbar";const a=document.createElement("button");a.className="px-button px-button--ghost",a.id="diff-back-btn",a.textContent="← BACK",a.addEventListener("click",()=>this.router.navigate("#/")),i.appendChild(a);const r=document.createElement("div");r.className="px-title px-title--md difficulty-title",r.textContent="HOW HARD?",i.appendChild(r);const s=document.createElement("div");s.className="difficulty-topbar__spacer",i.appendChild(s),t.appendChild(i);const u=document.createElement("div");u.className="difficulty-layout";const l=document.createElement("div");l.className="difficulty-preview-col";const m=I.get();l.appendChild(this.makePreviewPanel(m.autoFillEnabled)),u.appendChild(l);const c=document.createElement("div");c.className="difficulty-controls-col";const o=document.createElement("div");o.className="px-panel",o.style.cssText="padding: 20px;";const h=document.createElement("div");h.style.cssText=`
      font-family: var(--tc-font-display);
      font-size: 14px;
      letter-spacing: 0.5px;
      color: var(--tc-ink-soft);
      margin-bottom: 12px;
    `,h.textContent="★ DIFFICULTY METER ★",o.appendChild(h);const g=document.createElement("div");g.id="diff-meter",g.style.cssText=`
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 4px;
      padding: 12px 4px;
      min-height: 60px;
      background: var(--tc-bg-alt);
      border: 3px solid var(--tc-ink-black);
      margin-bottom: 18px;
    `,this.chickRow=new xt,this.chickRow.update(this.sliderValue),g.appendChild(this.chickRow.element),o.appendChild(g);const d=document.createElement("input");d.type="range",d.id="diff-slider",d.min="0",d.max="100",d.value=String(Math.round(this.sliderValue*100)),this.sliderInput=d,d.style.cssText=`
      width: 100%;
      height: 36px;
      margin-bottom: 18px;
      accent-color: var(--tc-primary);
      cursor: pointer;
    `,d.addEventListener("input",y=>{this.setSliderValue(y.target.valueAsNumber/100)}),o.appendChild(d);const p=document.createElement("div");p.className="difficulty-stat-row";const C=this.makeStat("GRID","diff-stat-grid"),x=this.makeStat("COLOURS","diff-stat-colours"),w=this.makeStat("TIME EST.","diff-stat-time");p.appendChild(C),p.appendChild(x),p.appendChild(w),o.appendChild(p),c.appendChild(o);const v=document.createElement("button");v.className="px-button px-button--primary px-button--lg difficulty-start-btn",v.id="diff-start-btn",v.textContent="▶ START!",this.startBtn=v,v.addEventListener("click",()=>{this.startGame()}),v.addEventListener("touchend",y=>{y.preventDefault(),this.startGame()}),c.appendChild(v),u.appendChild(c),t.appendChild(u),e.appendChild(t);const M=D(this.sliderValue,{autoFillEnabled:I.get().autoFillEnabled});this.updateStatsDisplay(M),this.updatePreviewSelection(),this.renderPreviewCanvases()}makePreviewPanel(e){this.previewCards=[],this.previewCanvases=[];const t=document.createElement("div");t.className="px-panel",t.style.cssText="padding: 18px;";const i=document.createElement("div");i.className="px-title px-title--sm",i.style.cssText="text-align: center; margin-bottom: 14px;",i.textContent="PREVIEW",t.appendChild(i);const a=document.createElement("div");a.className="difficulty-preview-grid";for(const r of Q(e))a.appendChild(this.makePreviewCard(r));return t.appendChild(a),t}makePreviewCard(e){const t=document.createElement("button");t.type="button",t.setAttribute("data-difficulty-preview",e.id),t.style.cssText=`
      min-width: 0;
      min-height: 44px;
      padding: 8px;
      background: var(--tc-surface);
      border: 3px solid var(--tc-ink-black);
      border-radius: 4px;
      box-shadow: 0 4px 0 0 var(--tc-ink-black);
      cursor: pointer;
      font-family: inherit;
      text-align: center;
    `,t.addEventListener("click",()=>{this.setSliderValue(e.sliderValue)});const i=document.createElement("canvas");i.width=96,i.height=96,i.setAttribute("aria-hidden","true"),i.style.cssText=`
      width: 100%;
      aspect-ratio: 1;
      display: block;
      background: var(--tc-bg-alt);
      border: 2px solid rgba(31,46,74,0.16);
      image-rendering: pixelated;
      margin-bottom: 8px;
    `,this.previewCanvases.push({canvas:i,gridSize:e.settings.gridSize}),t.appendChild(i);const a=document.createElement("div");a.style.cssText=`
      font-family: var(--tc-font-display);
      font-size: 12px;
      letter-spacing: 1px;
      color: var(--tc-ink);
    `,a.textContent=e.label,t.appendChild(a);const r=document.createElement("div");if(r.style.cssText=`
      margin-top: 5px;
      font-family: var(--tc-font-display);
      font-size: 10px;
      line-height: 1.45;
      color: var(--tc-ink-soft);
      letter-spacing: 0.5px;
    `,r.textContent=`${e.settings.gridSize}x${e.settings.gridSize} - ${e.estimatedMinutes}m`,t.appendChild(r),e.tinyCells){const s=document.createElement("div");s.setAttribute("data-difficulty-warning","tiny-cells"),s.style.cssText=`
        margin-top: 6px;
        padding: 4px 3px;
        background: #fef3c7;
        border: 2px solid #92400e;
        border-radius: 3px;
        font-family: var(--tc-font-display);
        font-size: 9px;
        color: #92400e;
        letter-spacing: 0.5px;
      `,s.textContent="TINY CELLS",t.appendChild(s)}return this.previewCards.push({sliderValue:e.sliderValue,element:t}),t}makeStat(e,t){const i=document.createElement("div");i.className="diff-stat",i.style.cssText="text-align: center;";const a=document.createElement("div");a.className="diff-stat__value",a.id=t,a.style.cssText=`
      font-family: var(--tc-font-display);
      font-size: 22px;
      color: var(--tc-ink);
      letter-spacing: 1px;
    `,a.textContent="—";const r=document.createElement("div");return r.className="diff-stat__label",r.style.cssText=`
      font-family: var(--tc-font-display);
      font-size: 10px;
      color: var(--tc-ink-soft);
      margin-top: 6px;
      letter-spacing: 1px;
    `,r.textContent=e,i.appendChild(a),i.appendChild(r),i}setSliderValue(e){this.sliderValue=Math.max(0,Math.min(1,e)),this.sliderInput&&(this.sliderInput.value=String(Math.round(this.sliderValue*100)));const t=D(this.sliderValue,{autoFillEnabled:I.get().autoFillEnabled});this.updateStatsDisplay(t),this.chickRow?.update(this.sliderValue),this.updatePreviewSelection()}updatePreviewSelection(){let e=null;for(const t of this.previewCards)(!e||Math.abs(t.sliderValue-this.sliderValue)<Math.abs(e.sliderValue-this.sliderValue))&&(e=t);for(const t of this.previewCards){const i=t===e;t.element.style.background=i?"var(--tc-primary-soft)":"var(--tc-surface)",t.element.style.transform=i?"translateY(2px)":"translateY(0)",t.element.style.boxShadow=i?"0 2px 0 0 var(--tc-ink-black)":"0 4px 0 0 var(--tc-ink-black)",t.element.setAttribute("aria-pressed",String(i))}}renderPreviewCanvases(){const e=this.previewSource();if(e){this.drawAllPreviews(e);return}const t=W.find(a=>a.id===this.bundledName);if(!t)return;const i=new Image;i.onload=()=>{this.root&&this.drawAllPreviews(i)},i.src=t.src}previewSource(){return this.staged?.bitmap?this.staged.bitmap:null}drawAllPreviews(e){for(const t of this.previewCanvases)this.drawPixelPreview(t.canvas,e,t.gridSize)}drawPixelPreview(e,t,i){let a=null;try{a=e.getContext("2d")}catch{return}if(!a)return;const r="naturalWidth"in t&&t.naturalWidth?t.naturalWidth:t.width,s="naturalHeight"in t&&t.naturalHeight?t.naturalHeight:t.height,u=Math.min(r,s),l=(r-u)/2,m=(s-u)/2,c=document.createElement("canvas");c.width=i,c.height=i;let o=null;try{o=c.getContext("2d")}catch{return}o&&(o.drawImage(t,l,m,u,u,0,0,i,i),a.imageSmoothingEnabled=!1,a.clearRect(0,0,e.width,e.height),a.drawImage(c,0,0,e.width,e.height))}updateStatsDisplay(e){const t=document.getElementById("diff-stat-grid");t&&(t.textContent=`${e.gridSize}×${e.gridSize}`);const i=document.getElementById("diff-stat-colours");i&&(i.textContent=`${e.paletteSize}`);const a=G(e),r=document.getElementById("diff-stat-time");r&&(r.textContent=`${a}m`)}unmount(){this.objectUrls.revokeAll(),this.sliderInput=null,this.previewCards=[],this.previewCanvases=[],this.releaseStaged(),this.root&&(this.root.innerHTML="",this.root=null)}releaseStaged(){this.staged&&(this.staged.bitmap.close(),this.staged=null)}async startGame(){if(this.startBtn){this.startBtn.textContent="Converting...",this.startBtn.disabled=!0;try{const e=D(this.sliderValue,{autoFillEnabled:I.get().autoFillEnabled});let t,i,a,r,s,u=!1;if(this.staged){const l=this.staged;let m=null;try{m=await X(l.imageBlob),[i,a]=await Promise.all([Ct(m),bt(m)]);const x=wt(m,e);m=null,t=await x}finally{m?.close()}const c=l.origin,o=l.attribution,h=Date.now();r=l.suggestedTitle,u=!0;const g=t.centroids.map((x,w)=>({rgba:x,number:w+1})),d=new _(g),p=O(t,e),C=c==="search"&&o?{kind:"search",capturedAt:h,attribution:o}:{kind:"user",capturedAt:h,origin:c};s={id:H(),title:r,source:C,thumbnailBlob:i,sourceImageBlob:a,createdAt:Date.now(),lastModifiedAt:Date.now(),isComplete:!1,conversionSettings:e,palette:d,grid:p}}else{const l=W.find(h=>h.id===this.bundledName);if(!l)throw new Error("Bundled image not found");t=await ut(l.src,e),r=l.title;const m=t.centroids.map((h,g)=>({rgba:h,number:g+1})),c=new _(m),o=O(t,e);s={id:H(),title:r,source:{kind:"bundled",bundledImageName:this.bundledName},createdAt:Date.now(),lastModifiedAt:Date.now(),isComplete:!1,conversionSettings:e,palette:c,grid:o}}await this.store.saveImmediate(s),u&&this.releaseStaged(),this.router.navigate(`#/puzzle/${s.id}`)}catch(e){console.error("Conversion failed:",e),this.startBtn&&(this.startBtn.textContent="▶ START!",this.startBtn.disabled=!1)}}}}export{Mt as DifficultyPicker};
