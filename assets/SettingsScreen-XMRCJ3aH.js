import{V as y,c as v}from"./BaseView-DKZ_zKSj.js";import{U as x,f as w}from"./main-Bk1YyjfQ.js";import{s as b}from"./ConfirmDialog-C4iBZsNr.js";function g(h){return new Promise(a=>{const t=document.createElement("div");t.style.cssText=`
      position: fixed;
      inset: 0;
      background: rgba(20,30,50,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
      padding: 20px;
      box-sizing: border-box;
    `;const n=document.createElement("div");n.className="px-panel",n.style.cssText=`
      max-width: 360px;
      width: 100%;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    `;const p=h==="verify"?x.makeChallenge():null,r=document.createElement("h2");r.className="px-title px-title--md",r.style.cssText="text-align: center; margin: 0;",r.textContent=h==="setup"?"CREATE PARENT CODE":"PARENT CHECK",n.appendChild(r);const i=document.createElement("p");i.style.cssText=`
      margin: 0;
      font-family: var(--tc-font-body);
      font-size: 13px;
      color: var(--tc-ink-soft);
      text-align: center;
      line-height: 1.5;
    `,h==="setup"?i.textContent="Choose a number 10–30. Solve maths to access settings later.":i.textContent=`What is ${p.question} = ?`,n.appendChild(i);const e=document.createElement("input");e.type="number",e.inputMode="numeric",e.autocomplete="off",e.enterKeyHint="done",e.setAttribute("autocorrect","off"),h==="setup"?(e.min="10",e.max="30",e.placeholder="e.g. 17"):e.placeholder="?",e.style.cssText=`
      font-family: var(--tc-font-display);
      font-size: 28px;
      text-align: center;
      padding: 12px;
      border: 4px solid var(--tc-ink-black);
      border-radius: 6px;
      width: 100%;
      box-sizing: border-box;
      color: var(--tc-ink);
      outline: none;
    `;const o=document.createElement("p");o.style.cssText=`
      margin: 0;
      font-size: 13px;
      color: var(--tc-danger);
      text-align: center;
      min-height: 18px;
      font-weight: 700;
    `,n.appendChild(e),n.appendChild(o);const d=document.createElement("div");d.style.cssText="display: flex; gap: 10px;";const c=document.createElement("button");c.className="px-button px-button--ghost",c.textContent="CANCEL",c.addEventListener("click",()=>f("cancel"));const l=document.createElement("button");l.className="px-button px-button--primary",l.textContent=h==="setup"?"SAVE":"CHECK",l.addEventListener("click",()=>m()),d.appendChild(c),d.appendChild(l),n.appendChild(d);const f=s=>{e.blur(),t.remove(),a(s)},m=()=>{const s=parseInt(e.value,10);if(isNaN(s)){o.textContent="Please enter a number.",u();return}if(h==="setup"){if(s<10||s>30){o.textContent="Pick 10–30.",u();return}x.update({pin:s}),f("pass")}else{if(s!==p.answer){o.textContent="Not quite — try again.",e.value="",u();return}f("pass")}};e.addEventListener("keydown",s=>{s.key==="Enter"&&m()});const u=()=>{n.style.animation="none",n.offsetWidth,n.style.transition="transform 50ms";const s=["-8px","8px","-6px","6px","0"];let C=0;const E=()=>{C>=s.length||(n.style.transform=`translateX(${s[C++]})`,setTimeout(E,50))};E()};t.appendChild(n),document.body.appendChild(t),requestAnimationFrame(()=>w(e))})}class A extends y{constructor(a,t){super(),this.router=a,this.store=t}root=null;mount(a){this.root=a,v(a),this.checkPin().then(t=>{if(!t){this.router.navigate("#/");return}this.render()})}unmount(){this.root&&(this.root.innerHTML="",this.root=null)}async checkPin(){return x.hasPin?await g("verify")==="pass":await g("setup")==="pass"}render(){if(!this.root)return;this.root.innerHTML="";const a=document.createElement("div");a.style.cssText=`
      padding: 28px;
      max-width: 800px;
      margin: 0 auto;
    `;const t=document.createElement("div");t.style.cssText=`
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 26px;
    `;const n=document.createElement("button");n.className="px-button px-button--ghost",n.textContent="← BACK",n.addEventListener("click",()=>this.router.navigate("#/")),t.appendChild(n);const p=document.createElement("h1");p.className="px-title px-title--md",p.style.cssText="flex: 1; text-align: center; margin: 0;",p.textContent="⚙ SETTINGS",t.appendChild(p);const r=document.createElement("div");r.style.cssText="width: 110px;",t.appendChild(r),a.appendChild(t);const i=document.createElement("div");i.className="settings-grid";const e=x.get();i.appendChild(this.makeSettingRow("🔊 Sound Effects","Tap sounds and completion chime",e.soundEnabled,s=>x.update({soundEnabled:s}))),i.appendChild(this.makeSettingRow("🔍 Internet Search","Lets your child search safe images",e.searchEnabled,s=>x.update({searchEnabled:s}))),i.appendChild(this.makeSettingRow("✨ Auto-Fill","Quick-fill adjacent cells same colour",e.autoFillEnabled,s=>x.update({autoFillEnabled:s})));const o=document.createElement("div");o.className="px-panel",o.style.cssText=`
      padding: 14px;
      grid-column: 1 / -1;
    `;const d=document.createElement("div");d.className="setting-row__title",d.textContent="🐣 Default Difficulty",o.appendChild(d);const c=document.createElement("div");c.className="setting-row__sub",c.textContent="Starting level for new puzzles",o.appendChild(c);const l=document.createElement("input");l.type="range",l.min="0",l.max="1",l.step="0.01",l.value=String(e.defaultSliderValue),l.style.cssText=`
      width: 100%;
      margin: 14px 0;
      accent-color: var(--tc-primary);
      cursor: pointer;
    `,l.addEventListener("input",()=>{x.update({defaultSliderValue:parseFloat(l.value)})}),o.appendChild(l);const f=document.createElement("div");f.style.cssText=`
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--tc-ink-soft);
      font-weight: 700;
    `,f.textContent="EASY                                 HARD",o.appendChild(f),i.appendChild(o);const m=document.createElement("button");m.className="px-button px-button--primary",m.style.cssText=`
      grid-column: 1 / -1;
      width: 100%;
    `,m.textContent="🔐 CHANGE PARENT CODE",m.addEventListener("click",async()=>{await g("setup")==="pass"&&this.showToast("Parent code updated.")}),i.appendChild(m);const u=document.createElement("button");u.className="px-button",u.style.cssText=`
      grid-column: 1 / -1;
      width: 100%;
      background: var(--tc-danger);
      color: white;
      border-color: var(--tc-ink-black);
    `,u.textContent="🗑 DELETE ALL PICTURES",u.addEventListener("click",()=>this.handleClearAll()),i.appendChild(u),a.appendChild(i),this.root.appendChild(a)}makeSettingRow(a,t,n,p){const r=document.createElement("div");r.className="px-panel setting-row",r.style.cssText=`
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px;
    `;const i=document.createElement("div"),e=document.createElement("div");e.className="setting-row__title",e.textContent=a;const o=document.createElement("div");o.className="setting-row__sub",o.textContent=t,i.appendChild(e),i.appendChild(o);const d=document.createElement("label");d.className="px-toggle";const c=document.createElement("input");c.type="checkbox",c.checked=n,c.addEventListener("change",()=>p(c.checked));const l=document.createElement("span");return d.appendChild(c),d.appendChild(l),r.appendChild(i),r.appendChild(d),r}async handleClearAll(){!await b("Delete ALL pictures? Cannot undo.")||!await b("Are you absolutely sure? All progress lost.")||(await this.store.clearAll(),this.showToast("All pictures deleted."))}showToast(a){const t=document.createElement("div");t.textContent=a,t.style.cssText=`
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
      font-family: var(--tc-font-body);
    `,document.body.appendChild(t),setTimeout(()=>t.remove(),3e3)}}export{A as SettingsScreen};
