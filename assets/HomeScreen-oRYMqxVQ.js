import{V as _,c as z}from"./BaseView-DKZ_zKSj.js";import{M as j,B as L}from"./objectUrl-DzFBoVO2.js";import{c as N,u as S}from"./sound-DoNUpyMD.js";import{s as B}from"./ConfirmDialog-C4iBZsNr.js";import{ImportStaging as D}from"./ImportStaging-BV-acV1w.js";import{pickImageFromLibrary as M,decodeAndDownscale as I,captureImageFromCamera as O}from"./imageImport-COAoLpFE.js";import{U as P,g as $}from"./main-Bk1YyjfQ.js";import{l as R,r as H,m as F,g as G}from"./Mascots-CxJs8EPR.js";function Y(h){const{artwork:e,imageSrc:t,onDelete:l}=h,n=document.createElement("button");n.style.cssText=`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border-radius: 6px;
    background: var(--tc-surface);
    border: 4px solid var(--tc-ink-black);
    box-shadow: 0 6px 0 0 var(--tc-ink-black);
    cursor: pointer;
    transition: transform 80ms steps(2), box-shadow 80ms steps(2);
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-y;
    font-family: inherit;
  `,n.addEventListener("mouseover",()=>{n.style.transform="translateY(-2px)",n.style.boxShadow="0 8px 0 0 var(--tc-ink-black)"}),n.addEventListener("mouseout",()=>{n.style.transform="translateY(0)",n.style.boxShadow="0 6px 0 0 var(--tc-ink-black)"});const s=document.createElement("div");s.className="gallery-card__thumb",s.style.cssText=`
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    background: var(--tc-bg-alt);
    margin-bottom: 8px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    border: 2px solid rgba(31,46,74,0.1);
  `;const r=document.createElement("img");if(r.alt=e.title,r.style.cssText="width: 100%; height: 100%; object-fit: cover;",t?r.src=t:e.thumbnailBlob?r.src=h.objectUrls.create(e.thumbnailBlob):r.style.background="var(--tc-bg-alt)",s.appendChild(r),e.isComplete){const a=document.createElement("div");a.style.cssText=`
      position: absolute;
      top: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
      background: var(--tc-primary);
      border-radius: 4px;
      border: 2px solid var(--tc-ink-black);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 2px 0 0 var(--tc-ink-black);
    `,a.textContent="★",s.appendChild(a)}const i=document.createElement("button");i.textContent="🗑",i.setAttribute("aria-label","Delete"),i.style.cssText=`
    position: absolute;
    top: 6px;
    left: 6px;
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    background: var(--tc-ink-black);
    color: white;
    border: 2px solid var(--tc-ink-black);
    border-radius: 4px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
    padding: 0;
    transition: background 80ms steps(2);
  `,i.addEventListener("mouseover",()=>{i.style.background="var(--tc-primary)"}),i.addEventListener("mouseout",()=>{i.style.background="var(--tc-ink-black)"}),i.addEventListener("click",a=>{a.stopPropagation(),l()}),i.style.touchAction="manipulation",N(i,a=>{a.stopPropagation(),l()}),s.appendChild(i),n.appendChild(s);const d=document.createElement("h3");d.className="gallery-card__title",d.textContent=e.title,d.style.cssText=`
    margin: 0;
    font-family: var(--tc-font-display);
    font-size: 14px;
    letter-spacing: 1px;
    margin-bottom: 4px;
    color: var(--tc-ink);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,n.appendChild(d);const f=e.grid.columns*e.grid.rows,u=f-e.grid.unpaintedCount,c=Math.round(100*u/f);if(e.isComplete){const a=document.createElement("div");a.className="gallery-card__done",a.textContent="★ DONE",n.appendChild(a)}else{const a=document.createElement("div");a.className="gallery-card__progress-bar",a.style.cssText=`
      height: 8px;
      background: var(--tc-bg-alt);
      border: 2px solid var(--tc-ink-black);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 4px;
    `;const g=document.createElement("div");g.className="gallery-card__progress-fill",g.style.cssText=`
      height: 100%;
      background: var(--tc-primary);
      width: ${c}%;
    `,a.appendChild(g),n.appendChild(a);const p=document.createElement("div");p.className="gallery-card__pct",p.style.cssText=`
      font-family: var(--tc-font-display);
      font-size: 12px;
      color: var(--tc-ink-soft);
      text-align: center;
      letter-spacing: 0.5px;
    `,p.textContent=`${c}% DONE`,n.appendChild(p)}return n.addEventListener("click",()=>{S(),h.onOpen()}),N(n,()=>{S(),h.onOpen()}),n}class ee extends _{constructor(e,t){super(),this.router=e,this.store=t}root=null;unsub=null;objectUrls=new j;galleryLoaded=!1;mount(e){this.root=e,this.galleryLoaded=!1,z(e),this.render(),this.unsub=this.store.on("changed",()=>{this.objectUrls.revokeAll(),this.render()}),window.addEventListener("online",this.handleConnectivityChange),window.addEventListener("offline",this.handleConnectivityChange),this.store.fetchAll().catch(()=>[]).then(()=>{this.root&&(this.galleryLoaded=!0,this.objectUrls.revokeAll(),this.render())}),R().then(()=>{this.root&&this.render()}).catch(()=>{})}unmount(){this.unsub?.(),this.unsub=null,window.removeEventListener("online",this.handleConnectivityChange),window.removeEventListener("offline",this.handleConnectivityChange),this.objectUrls.revokeAll(),this.root&&(this.root.innerHTML="",this.root=null)}render(){if(!this.root)return;this.root.innerHTML="";const e=document.createElement("div");e.style.cssText=`
      padding: 28px;
      max-width: 1080px;
      margin: 0 auto;
    `;const t=document.createElement("header");t.className="home-header",t.style.cssText=`
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 26px;
    `;const l=document.createElement("div");l.className="px-panel",l.style.cssText="padding: 8px; line-height: 0;";const n=P.get(),s=H(n.mascotId),r=document.createElement("img");r.className="mascot-art mascot-art--header mascot-bob",r.src=F(s),r.alt="Mascot buddy",l.appendChild(r),t.appendChild(l);const i=document.createElement("div");i.style.cssText="flex: 1;";const d=document.createElement("div");d.style.cssText=`
      font-family: var(--tc-font-display);
      font-size: 12px;
      letter-spacing: 1px;
      color: var(--tc-ink-soft);
    `;const f=G(s);d.textContent=`HI ${f?.name?.toUpperCase()||"BUDDY"}!`,i.appendChild(d);const u=document.createElement("div");u.className="px-title px-title--md",u.textContent="TAPPY COLOUR",i.appendChild(u),t.appendChild(i);const c=document.createElement("button");c.className="px-button px-button--ghost",c.style.cssText="width: 60px;",c.textContent="⚙",c.id="home-settings-btn",c.addEventListener("click",()=>this.router.navigate("#/settings")),t.appendChild(c),e.appendChild(t);const a=document.createElement("div");a.style.cssText=`
      display: flex;
      gap: 14px;
      margin-bottom: 28px;
      justify-content: center;
      flex-wrap: wrap;
    `;const g=this.makeActionBtn("📷","CAMERA","home-action-btn--primary",()=>this.handleCamera()),p=this.makeActionBtn("🖼","PHOTOS","home-action-btn--accent",()=>this.handleLibrary()),E=$(n,navigator.onLine),m=this.makeActionBtn("🔍","SEARCH","home-action-btn--accent",()=>this.router.navigate("#/search"));E.allowed||(m.disabled=!0,m.setAttribute("aria-disabled","true"),m.title=E.reason==="offline"?"Connect to the internet to search.":"Turn on Internet Search in Settings.",m.style.opacity="0.55",m.style.cursor="not-allowed"),a.appendChild(g),a.appendChild(p),a.appendChild(m),e.appendChild(a);const b=document.createElement("div");if(b.className="px-title px-title--sm",b.style.cssText="text-align: center; margin-bottom: 12px;",b.textContent="★ TAP A PICTURE ★",e.appendChild(b),!this.galleryLoaded){const o=document.createElement("div");o.id="home-gallery-loading",o.className="px-panel",o.style.cssText=`
        padding: 18px;
        text-align: center;
        font-family: var(--tc-font-display);
        font-size: 14px;
        color: var(--tc-ink-soft);
      `,o.textContent="LOADING PICTURES...",e.appendChild(o),this.root.appendChild(e);return}const T=this.store.cache,A=L.filter(o=>!this.store.getByBundledName(o.id)),k=[];for(const o of T)k.push({artwork:o,isStarter:!1});for(const o of A){const x={id:"__starter__"+o.id,title:o.title,source:{kind:"bundled",bundledImageName:o.id},createdAt:0,lastModifiedAt:0,isComplete:!1,conversionSettings:{sliderValue:0,gridSize:16,paletteSize:6,autoFillEnabled:!0},palette:null,grid:{columns:1,rows:1,unpaintedCount:1}};k.push({artwork:x,isStarter:!0,bundledName:o.id})}const y=document.createElement("div");y.className="home-gallery-grid",y.id="home-gallery";for(const{artwork:o,isStarter:x,bundledName:v}of k){const U=v?L.find(w=>w.id===v):null,C=Y({artwork:o,imageSrc:U?.src??null,objectUrls:this.objectUrls,onOpen:()=>{x&&v?this.router.navigate(`#/difficulty/${v}`):this.router.navigate(`#/puzzle/${o.id}`)},onDelete:x?()=>{}:()=>this.handleDelete(o)});if(C.className="px-panel gallery-card",C.style.cssText="cursor: pointer; text-align: center; padding: 10px; font-family: inherit; width: 100%;",x){const w=C.querySelector('button[aria-label="Delete"]');w&&(w.style.display="none")}y.appendChild(C)}if(e.appendChild(y),T.length===0&&A.length===0){const o=document.createElement("p");o.textContent="No pictures yet — tap a button above to get started!",o.style.cssText="color: var(--tc-ink-soft); font-size: 16px; text-align: center;",e.appendChild(o)}this.root.appendChild(e)}makeActionBtn(e,t,l,n){const s=document.createElement("button");s.className=`px-button home-action-btn ${l}`,s.style.cssText=`
      flex: 0 1 300px;
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 22px;
      padding: 20px 18px;
      color: white;
      font-family: var(--tc-font-display);
      letter-spacing: 0.5px;
    `;const r=document.createElement("span");r.style.cssText="font-size: 28px;",r.textContent=e;const i=document.createElement("span");return i.textContent=t,s.appendChild(r),s.appendChild(i),s.addEventListener("click",n),s}handleConnectivityChange=()=>{this.render()};async handleLibrary(){try{const e=await M(),t=await I(e),l=e.name.replace(/\.\w+$/,"")||"My Photo";D.set({bitmap:t,imageBlob:e,suggestedTitle:l,origin:"library"}),this.router.navigate("#/difficulty/import")}catch(e){e instanceof Error&&e.message!=="No file selected"&&this.showToast(e.message)}}async handleCamera(){try{const e=await O(),t=await I(e),n=`Photo ${new Date().toLocaleDateString()}`;D.set({bitmap:t,imageBlob:e,suggestedTitle:n,origin:"camera"}),this.router.navigate("#/difficulty/import")}catch(e){e instanceof Error&&e.message!=="No file selected"&&this.showToast(e.message)}}async handleDelete(e){!await B(`Delete "${e.title}"?`)||!await B(`Delete "${e.title}" forever?`)||await this.store.delete(e.id)}showToast(e){const t=document.createElement("div");t.textContent=e,t.style.cssText=`
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--tc-ink-black);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 999;
      max-width: 90vw;
      text-align: center;
    `,document.body.appendChild(t),setTimeout(()=>t.remove(),3500)}}export{ee as HomeScreen};
