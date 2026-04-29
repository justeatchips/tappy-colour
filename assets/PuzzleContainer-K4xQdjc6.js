import{V as P,a as I}from"./BaseView-DKZ_zKSj.js";import{E as M,U as z}from"./main-Bk1YyjfQ.js";import{u as L,p as y,a as B,b as A}from"./sound-DoNUpyMD.js";import{s as Y}from"./ConfirmDialog-C4iBZsNr.js";import{r as O,m as $,c as X}from"./Mascots-CxJs8EPR.js";import{M as D,B as R}from"./objectUrl-DzFBoVO2.js";const H=(c,t)=>t*1e4+c;function F(c,t,i){if(t<0||t>=c.columns||i<0||i>=c.rows)return[];const e=c.cell(t,i);if(e.painted)return[];const s=e.paletteIndex,{columns:n,rows:o}=c,r=new Uint8Array(n*o),l=[],a=[i*n+t];for(;a.length>0;){const h=a.pop();if(r[h])continue;r[h]=1;const u=h%n,m=Math.floor(h/n),g=c.cell(u,m);g.painted||g.paletteIndex!==s||(l.push({col:u,row:m}),u+1<n&&a.push(h+1),u-1>=0&&a.push(h-1),m+1<o&&a.push(h+n),m-1>=0&&a.push(h-n))}return l}function V(c,t){return c.unpaintedIndicesForPaletteIndex(t).map(e=>({col:e%c.columns,row:Math.floor(e/c.columns)}))}class j extends M{constructor(t,i){super(),this.store=i,this.originalArtwork=t,this.artworkID=t.id,this.grid=t.grid,this.palette=t.palette,this.isComplete=t.isComplete,this.totalCellsPerColour=new Array(t.palette.colours.length).fill(0);for(let s=0;s<t.grid.columns;s++)for(let n=0;n<t.grid.rows;n++){const o=t.grid.cell(s,n);o.paletteIndex<this.totalCellsPerColour.length&&this.totalCellsPerColour[o.paletteIndex]++}this.currentTool=t.sessionState?.currentTool??"tap";const e=t.sessionState?.selectedPaletteIndex;if(this.validPaletteIndex(e)){this.selectedPaletteIndex=e;return}this.selectedPaletteIndex=0;for(let s=0;s<t.palette.colours.length;s++)if(t.grid.unpaintedForColour(s)>0){this.selectedPaletteIndex=s;break}}artworkID;grid;palette;selectedPaletteIndex;isComplete=!1;numbersVisible=!0;currentTool="tap";lastCompletedPaletteIndex=null;undoStack=[];currentDragPainted=new Set;isDragging=!1;totalCellsPerColour;numbersVisibilityTimeout=null;originalArtwork;validPaletteIndex(t){return t!==void 0&&t>=0&&t<this.palette.colours.length}totalCells(t){return this.totalCellsPerColour[t]||0}paintedCells(t){const i=this.totalCells(t),e=this.grid.unpaintedForColour(t);return i-e}tap(t,i){const e=this.grid.cell(t,i);e.paletteIndex!==this.selectedPaletteIndex||e.painted||(this.grid.paint(t,i),this.undoStack=[[{col:t,row:i}]],this.emit("change","gridChanged"),this.afterPaint())}setTool(t){this.currentTool!==t&&(this.isDragging=!1,this.currentDragPainted.clear(),this.currentTool=t,this.emit("change","toolChanged"),this.saveToStore())}requestHint(){this.grid.unpaintedForColour(this.selectedPaletteIndex)!==0&&this.emit("change","hintRequested")}selectPaletteIndex(t){!this.validPaletteIndex(t)||this.selectedPaletteIndex===t||(this.selectedPaletteIndex=t,this.emit("change","selectionChanged"),this.saveToStore())}bucketFill(t,i){const e=this.grid.cell(t,i);if(e.paletteIndex!==this.selectedPaletteIndex||e.painted)return;const s=F(this.grid,t,i);if(s.length===0)return;const n=this.grid.paintCells(s);n.length!==0&&(this.undoStack=[n],this.emit("change","gridChanged"),this.afterPaint())}fillAllOfSelected(){const t=V(this.grid,this.selectedPaletteIndex);if(t.length===0)return;const i=this.grid.paintCells(t);i.length!==0&&(this.undoStack=[i],this.emit("change","gridChanged"),this.afterPaint())}dragBegan(){this.isDragging=!0,this.currentDragPainted.clear()}dragMoved(t,i){if(!this.isDragging)return;const e=H(t,i);if(this.currentDragPainted.has(e))return;const s=this.grid.cell(t,i);s.paletteIndex!==this.selectedPaletteIndex||s.painted||(this.grid.paint(t,i),this.currentDragPainted.add(e),this.emit("change","gridChanged"))}dragEnded(){if(this.isDragging=!1,this.currentDragPainted.size===0)return;const t=[];for(const i of this.currentDragPainted)t.push({col:i%1e4,row:Math.floor(i/1e4)});this.undoStack=[t],this.currentDragPainted.clear(),this.afterPaint()}undo(){this.isDragging||this.undoStack.length===0||(this.grid.unpaintCells(this.undoStack[0]),this.undoStack=[],this.restoreIncompleteState(),this.emit("change","gridChanged"),this.saveToStore())}replacePaletteColour(t,i){this.palette.replaceColour(t,i),this.emit("change","paletteChanged"),this.saveToStore()}resetPalette(){this.palette.reset(),this.emit("change","paletteChanged"),this.saveToStore()}autoAdvanceIfNeeded(){if(!(this.grid.unpaintedForColour(this.selectedPaletteIndex)>0)){for(let t=this.selectedPaletteIndex+1;t<this.palette.colours.length;t++)if(this.grid.unpaintedForColour(t)>0){this.selectedPaletteIndex=t,this.emit("change","selectionChanged");return}}}checkAndHandleCompletion(){!this.grid.isComplete()||this.isComplete||(this.isComplete=!0,this.emit("change","completionChanged"),this.clearNumbersVisibilityTimeout(),this.numbersVisibilityTimeout=setTimeout(()=>{this.numbersVisible=!1,this.emit("change","numbersVisibilityChanged"),this.numbersVisibilityTimeout=null},500))}afterPaint(){this.emitColourCompletedIfNeeded(),this.autoAdvanceIfNeeded(),this.checkAndHandleCompletion(),this.saveToStore()}emitColourCompletedIfNeeded(){this.grid.unpaintedForColour(this.selectedPaletteIndex)>0||this.totalCells(this.selectedPaletteIndex)!==0&&(this.lastCompletedPaletteIndex=this.selectedPaletteIndex,this.emit("change","colourCompleted"))}destroy(){this.clearNumbersVisibilityTimeout()}toArtworkSnapshot(t=Date.now()){return{id:this.artworkID,title:this.originalArtwork.title,source:this.originalArtwork.source,thumbnailBlob:this.originalArtwork.thumbnailBlob,sourceImageBlob:this.originalArtwork.sourceImageBlob,createdAt:this.originalArtwork.createdAt,lastModifiedAt:t,isComplete:this.isComplete,conversionSettings:this.originalArtwork.conversionSettings,palette:this.palette,grid:this.grid,sessionState:{currentTool:this.currentTool,selectedPaletteIndex:this.selectedPaletteIndex}}}restoreIncompleteState(){const t=this.isComplete,i=!this.numbersVisible;this.clearNumbersVisibilityTimeout(),this.isComplete=!1,this.numbersVisible=!0,t&&this.emit("change","completionChanged"),i&&this.emit("change","numbersVisibilityChanged")}clearNumbersVisibilityTimeout(){this.numbersVisibilityTimeout!==null&&(clearTimeout(this.numbersVisibilityTimeout),this.numbersVisibilityTimeout=null)}saveToStore(){const t=this.toArtworkSnapshot();this.store.save(t).catch(()=>{})}}function N(){return typeof window<"u"&&window.devicePixelRatio?window.devicePixelRatio:1}function w(c,t,i){const e=N();c.width=t*e,c.height=i*e,c.style.width=`${t}px`,c.style.height=`${i}px`;const s=c.getContext("2d");return s.setTransform(e,0,0,e,0,0),s}class q{constructor(t,i){this.session=t,this.container=i,this.canvas=document.createElement("canvas"),this.canvas.style.cssText=`
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      background: white;
      touch-action: none;
    `,this.numbersCanvas=document.createElement("canvas"),this.numbersCanvas.style.cssText=`
      display: block;
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      transition: opacity 0.6s ease-out;
    `,this.boundOnTouchStart=this.onTouchStart.bind(this),this.boundOnTouchMove=this.onTouchMove.bind(this),this.boundOnTouchEnd=this.onTouchEnd.bind(this),this.boundOnWheel=this.onWheel.bind(this)}canvas;ctx=null;numbersCanvas;numbersCtx=null;cellSize=0;offsetX=0;offsetY=0;resizeObserver=null;unsubs=[];boundOnTouchStart;boundOnTouchMove;boundOnTouchEnd;boundOnWheel;scale=1;panX=0;panY=0;minScale=1;maxScale=8;pinchStartDist=0;pinchStartScale=1;pinchStartPanX=0;pinchStartPanY=0;pinchStartMidX=0;pinchStartMidY=0;touchState="idle";pendingTimer=null;hintTimers=[];hintOpacity=0;paintStartCol=-1;paintStartRow=-1;lastTouchX=0;lastTouchY=0;mount(){if(this.container.style.position!=="absolute"&&this.container.style.position!=="fixed"&&(this.container.style.position="relative"),this.container.appendChild(this.canvas),this.container.appendChild(this.numbersCanvas),this.ctx=this.canvas.getContext("2d"),this.numbersCtx=this.numbersCanvas.getContext("2d"),!this.ctx)throw new Error("Failed to get canvas context");if(!this.numbersCtx)throw new Error("Failed to get numbers canvas context");this.numbersCanvas.style.opacity=this.session.numbersVisible?"1":"0",this.resizeObserver=new ResizeObserver(()=>{this.resize()}),this.resizeObserver.observe(this.container),this.resize();const t=this.session.on("change",i=>{if(i==="gridChanged"||i==="paletteChanged"||i==="selectionChanged"||i==="completionChanged"||i==="numbersVisibilityChanged"||i==="hintRequested"){if(i==="numbersVisibilityChanged"&&(this.numbersCanvas.style.opacity=this.session.numbersVisible?"1":"0"),i==="hintRequested"){this.startHint();return}this.render()}});this.unsubs.push(t),this.canvas.addEventListener("touchstart",this.boundOnTouchStart,{passive:!1}),this.canvas.addEventListener("touchmove",this.boundOnTouchMove,{passive:!1}),this.canvas.addEventListener("touchend",this.boundOnTouchEnd,{passive:!1}),this.canvas.addEventListener("touchcancel",this.boundOnTouchEnd,{passive:!1}),this.canvas.addEventListener("wheel",this.boundOnWheel,{passive:!1}),this.unsubs.push(()=>{this.canvas.removeEventListener("touchstart",this.boundOnTouchStart),this.canvas.removeEventListener("touchmove",this.boundOnTouchMove),this.canvas.removeEventListener("touchend",this.boundOnTouchEnd),this.canvas.removeEventListener("touchcancel",this.boundOnTouchEnd),this.canvas.removeEventListener("wheel",this.boundOnWheel)})}unmount(){this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this.pendingTimer!==null&&(clearTimeout(this.pendingTimer),this.pendingTimer=null),this.clearHintTimers(),this.unsubs.forEach(t=>t()),this.unsubs=[],this.canvas.remove(),this.numbersCanvas.remove(),this.ctx=null,this.numbersCtx=null}resize(){const t=this.container.clientWidth,i=this.container.clientHeight,e=this.session.grid.columns,s=this.session.grid.rows;this.cellSize=Math.floor(Math.min(t,i)/Math.max(e,s));const n=this.cellSize*e,o=this.cellSize*s;this.offsetX=Math.floor((t-n)/2),this.offsetY=Math.floor((i-o)/2),this.minScale=1,this.maxScale=Math.max(8,Math.ceil(44/this.cellSize)),this.scale=1,this.panX=this.offsetX,this.panY=this.offsetY,w(this.canvas,t,i),w(this.numbersCanvas,t,i),this.render()}render(){this.renderCells(),this.renderNumbers()}renderCells(){if(!this.ctx)return;this.ctx.clearRect(0,0,this.container.clientWidth,this.container.clientHeight);const t=this.session.grid,i=this.session.palette,e=this.cellSize*this.scale,s=!this.session.isComplete;for(let n=0;n<t.columns;n++)for(let o=0;o<t.rows;o++){const r=this.panX+n*e,l=this.panY+o*e,a=t.cell(n,o),h=!a.painted&&a.paletteIndex===this.session.selectedPaletteIndex;this.ctx.fillStyle=a.painted?i.cssString(a.paletteIndex):h?this.selectedCellFill(a.paletteIndex):"#f5f5f5",this.ctx.fillRect(r,l,e,e),s&&(this.ctx.strokeStyle=h?"#111827":"#ddd",this.ctx.lineWidth=h?Math.max(2,Math.min(4,e*.08)):1,this.ctx.strokeRect(r,l,e,e)),s&&h&&this.hintOpacity>0&&(this.ctx.fillStyle=this.hintCellFill(),this.ctx.fillRect(r,l,e,e),this.ctx.strokeStyle=this.hintStroke(),this.ctx.lineWidth=Math.max(3,Math.min(6,e*.12)),this.ctx.strokeRect(r+1,l+1,e-2,e-2))}}renderNumbers(){if(!this.numbersCtx)return;this.numbersCtx.clearRect(0,0,this.container.clientWidth,this.container.clientHeight);const t=this.session.grid,i=this.session.palette,e=this.cellSize*this.scale;if(e<12)return;const s=Math.min(28,Math.max(9,Math.floor(e*.45)));this.numbersCtx.font=`bold ${s}px -apple-system, system-ui, sans-serif`,this.numbersCtx.textAlign="center",this.numbersCtx.textBaseline="middle",this.numbersCtx.fillStyle="#888";for(let n=0;n<t.columns;n++)for(let o=0;o<t.rows;o++){const r=t.cell(n,o);if(!r.painted){const l=r.paletteIndex===this.session.selectedPaletteIndex,a=i.colours[r.paletteIndex],h=a?a.number:r.paletteIndex+1,u=this.panX+n*e+e/2,m=this.panY+o*e+e/2;l?(this.numbersCtx.font=`900 ${Math.max(s+2,Math.floor(e*.55))}px -apple-system, system-ui, sans-serif`,this.numbersCtx.fillStyle="#111827"):(this.numbersCtx.font=`bold ${s}px -apple-system, system-ui, sans-serif`,this.numbersCtx.fillStyle="#888"),this.numbersCtx.fillText(h.toString(),u,m)}}}selectedCellFill(t){const i=this.session.palette.colours[t]?.rgba;return i?`rgba(${i.r}, ${i.g}, ${i.b}, 0.22)`:"rgba(250, 204, 21, 0.24)"}hintCellFill(){return`rgba(250, 204, 21, ${Math.round(this.hintOpacity*28)/100})`}hintStroke(){return`rgba(17, 24, 39, ${Math.round(this.hintOpacity*90)/100})`}startHint(){this.clearHintTimers(),this.hintOpacity=1,this.render(),this.hintTimers=[setTimeout(()=>{this.hintOpacity=.45,this.render()},700),setTimeout(()=>{this.hintOpacity=0,this.render(),this.clearHintTimers()},1150)]}clearHintTimers(){for(const t of this.hintTimers)clearTimeout(t);this.hintTimers=[]}cellAt(t,i){const e=this.canvas.getBoundingClientRect(),s=this.cellSize*this.scale,n=(t-e.left-this.panX)/s,o=(i-e.top-this.panY)/s,r=Math.floor(n),l=Math.floor(o);return r<0||r>=this.session.grid.columns||l<0||l>=this.session.grid.rows?null:{col:r,row:l}}onTouchStart(t){if(t.touches.length===2){t.preventDefault(),this.touchState==="painting"&&this.session.dragEnded(),this.pendingTimer!==null&&(clearTimeout(this.pendingTimer),this.pendingTimer=null);const s=this.canvas.getBoundingClientRect(),n=t.touches[0],o=t.touches[1];this.pinchStartDist=Math.hypot(o.clientX-n.clientX,o.clientY-n.clientY),this.pinchStartScale=this.scale,this.pinchStartPanX=this.panX,this.pinchStartPanY=this.panY,this.pinchStartMidX=(n.clientX+o.clientX)/2-s.left,this.pinchStartMidY=(n.clientY+o.clientY)/2-s.top,this.touchState="pinching";return}t.preventDefault(),L();const i=y(t);if(!i)return;this.lastTouchX=i.clientX,this.lastTouchY=i.clientY;const e=this.cellAt(i.clientX,i.clientY);e&&(this.paintStartCol=e.col,this.paintStartRow=e.row,this.touchState="pendingPaint",this.pendingTimer=setTimeout(()=>{this.touchState==="pendingPaint"&&t.touches.length===1&&this.session.currentTool==="tap"&&(this.touchState="painting",this.session.dragBegan(),this.session.dragMoved(this.paintStartCol,this.paintStartRow),this.render())},10))}onTouchMove(t){if(this.touchState==="pinching"){if(t.preventDefault(),t.touches.length<2)return;const s=t.touches[0],n=t.touches[1],o=this.canvas.getBoundingClientRect(),r=Math.hypot(n.clientX-s.clientX,n.clientY-s.clientY),l=(s.clientX+n.clientX)/2-o.left,a=(s.clientY+n.clientY)/2-o.top,h=r/this.pinchStartDist,u=Math.max(this.minScale,Math.min(this.maxScale,this.pinchStartScale*h)),m=u/this.pinchStartScale,g=this.pinchStartMidX-(this.pinchStartMidX-this.pinchStartPanX)*m+(l-this.pinchStartMidX),b=this.pinchStartMidY-(this.pinchStartMidY-this.pinchStartPanY)*m+(a-this.pinchStartMidY);this.scale=u,{panX:this.panX,panY:this.panY}=this.clampPan(g,b),this.render();return}if(this.touchState==="idle")return;t.preventDefault();const i=y(t);if(!i)return;const e=this.cellAt(i.clientX,i.clientY);if(this.touchState==="pendingPaint"){const s=i.clientX-this.lastTouchX,n=i.clientY-this.lastTouchY;Math.sqrt(s*s+n*n)>5&&this.session.currentTool==="tap"&&(this.pendingTimer!==null&&(clearTimeout(this.pendingTimer),this.pendingTimer=null),this.touchState="painting",this.session.dragBegan(),e&&this.session.dragMoved(e.col,e.row),this.render())}else this.touchState==="painting"&&e&&this.session.dragMoved(e.col,e.row)}onTouchEnd(t){if(t.preventDefault(),this.touchState==="pinching"){this.touchState="idle";return}this.pendingTimer!==null&&(clearTimeout(this.pendingTimer),this.pendingTimer=null);const i=this.session.currentTool;this.touchState==="pendingPaint"?i==="bucket"?this.session.bucketFill(this.paintStartCol,this.paintStartRow):i==="fillAll"?this.session.fillAllOfSelected():this.session.tap(this.paintStartCol,this.paintStartRow):this.touchState==="painting"&&(i==="tap"?this.session.dragEnded():this.session.dragEnded()),this.touchState="idle"}clampPan(t,i){const e=this.canvas.clientWidth,s=this.canvas.clientHeight,n=this.cellSize*this.scale*this.session.grid.columns,o=this.cellSize*this.scale*this.session.grid.rows,r=60;return{panX:Math.min(e-r,Math.max(r-n,t)),panY:Math.min(s-r,Math.max(r-o,i))}}applyZoom(t,i,e){t=Math.max(this.minScale,Math.min(this.maxScale,t));const s=t/this.scale,n=i-(i-this.panX)*s,o=e-(e-this.panY)*s;this.scale=t,{panX:this.panX,panY:this.panY}=this.clampPan(n,o),this.render()}onWheel(t){t.preventDefault();const i=this.canvas.getBoundingClientRect(),e=t.clientX-i.left,s=t.clientY-i.top,n=t.deltaY<0?1.12:1/1.12;this.applyZoom(this.scale*n,e,s)}resetZoom(){this.scale=1,this.panX=this.offsetX,this.panY=this.offsetY,this.render()}}function W(c,t,i){const e=c/255,s=t/255,n=i/255,o=Math.max(e,s,n),r=Math.min(e,s,n),l=o-r;let a=0;l!==0&&(o===e?a=(s-n)/l%6:o===s?a=(n-e)/l+2:a=(e-s)/l+4,a=Math.round(a*60),a<0&&(a+=360));const h=o===0?0:Math.round(l/o*100),u=Math.round(o*100);return{h:a,s:h,b:u}}function U(c,t,i){const e=t/100,s=i/100,n=s*e,o=n*(1-Math.abs(c/60%2-1)),r=s-n;let l=0,a=0,h=0;return c<60?(l=n,a=o,h=0):c<120?(l=o,a=n,h=0):c<180?(l=0,a=n,h=o):c<240?(l=0,a=o,h=n):c<300?(l=o,a=0,h=n):(l=n,a=0,h=o),{r:Math.round((l+r)*255),g:Math.round((a+r)*255),b:Math.round((h+r)*255),a:255}}const G=[{r:220,g:38,b:38,a:255},{r:239,g:68,b:68,a:255},{r:249,g:115,b:22,a:255},{r:251,g:146,b:60,a:255},{r:234,g:179,b:8,a:255},{r:253,g:224,b:71,a:255},{r:22,g:163,b:74,a:255},{r:74,g:222,b:128,a:255},{r:16,g:185,b:129,a:255},{r:52,g:211,b:153,a:255},{r:6,g:182,b:212,a:255},{r:103,g:232,b:249,a:255},{r:37,g:99,b:235,a:255},{r:96,g:165,b:250,a:255},{r:124,g:58,b:237,a:255},{r:167,g:139,b:250,a:255},{r:219,g:39,b:119,a:255},{r:244,g:114,b:182,a:255},{r:120,g:53,b:15,a:255},{r:180,g:83,b:9,a:255},{r:245,g:158,b:11,a:255},{r:254,g:215,b:170,a:255},{r:253,g:186,b:116,a:255},{r:252,g:165,b:165,a:255},{r:17,g:24,b:39,a:255},{r:75,g:85,b:99,a:255},{r:156,g:163,b:175,a:255},{r:209,g:213,b:219,a:255},{r:243,g:244,b:246,a:255},{r:255,g:255,b:255,a:255}],Z=[{r:0,g:0,b:0,a:255},{r:230,g:159,b:0,a:255},{r:86,g:180,b:233,a:255},{r:0,g:158,b:115,a:255},{r:240,g:228,b:66,a:255},{r:0,g:114,b:178,a:255},{r:213,g:94,b:0,a:255},{r:204,g:121,b:167,a:255}];class _{constructor(t){this.opts=t,this.current={...t.initial},this.overlay=this.build()}overlay;current;previewEl=null;hSlider=null;sSlider=null;bSlider=null;mount(t){t.appendChild(this.overlay)}unmount(){this.overlay.remove()}build(){const t=document.createElement("div");t.dataset.colourPickerOverlay="true",t.style.cssText=`
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 20px;
      box-sizing: border-box;
    `,t.addEventListener("click",p=>{p.target===t&&this.cancel()});const i=document.createElement("div");i.style.cssText=`
      background: white;
      border-radius: 20px;
      padding: 20px;
      width: 100%;
      max-width: 360px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.25);
      max-height: 90vh;
      overflow-y: auto;
      box-sizing: border-box;
    `;const e=document.createElement("div");e.style.cssText="display: flex; justify-content: space-between; align-items: center;";const s=document.createElement("h3");s.textContent="Pick a Colour",s.style.cssText="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;",e.appendChild(s),this.previewEl=document.createElement("div"),this.previewEl.style.cssText=`
      width: 44px;
      height: 44px;
      border-radius: 10px;
      border: 2px solid #e5e7eb;
      flex-shrink: 0;
    `,e.appendChild(this.previewEl),i.appendChild(e);const n=document.createElement("p");n.textContent="Colourblind-friendly",n.style.cssText="margin: 0; font-size: 13px; font-weight: 600; color: #6b7280;",i.appendChild(n);const o=document.createElement("div");o.style.cssText=`
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 6px;
    `;for(const p of Z){const d=document.createElement("button");d.style.cssText=`
        width: 100%;
        aspect-ratio: 1;
        min-height: 36px;
        min-width: 36px;
        border-radius: 8px;
        border: 2px solid transparent;
        background: rgb(${p.r},${p.g},${p.b});
        cursor: pointer;
        padding: 0;
        transition: transform 0.1s, border-color 0.1s;
      `,d.addEventListener("mouseover",()=>{d.style.transform="scale(1.1)"}),d.addEventListener("mouseout",()=>{d.style.transform="scale(1)"});const f=()=>{this.current={...p},this.opts.onPick(this.current)};d.addEventListener("click",f),d.addEventListener("touchend",C=>{C.preventDefault(),f()}),o.appendChild(d)}i.appendChild(o);const r=document.createElement("p");r.textContent="Quick colours",r.style.cssText="margin: 0; font-size: 13px; font-weight: 600; color: #6b7280;",i.appendChild(r);const l=document.createElement("div");l.style.cssText=`
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
    `;for(const p of G){const d=document.createElement("button");d.style.cssText=`
        width: 100%;
        aspect-ratio: 1;
        min-height: 44px;
        min-width: 36px;
        border-radius: 8px;
        border: 2px solid transparent;
        background: rgb(${p.r},${p.g},${p.b});
        cursor: pointer;
        padding: 0;
        transition: transform 0.1s, border-color 0.1s;
      `,d.addEventListener("mouseover",()=>{d.style.transform="scale(1.1)"}),d.addEventListener("mouseout",()=>{d.style.transform="scale(1)"});const f=()=>{this.current={...p},this.opts.onPick(this.current)};d.addEventListener("click",f),d.addEventListener("touchend",C=>{C.preventDefault(),f()}),l.appendChild(d)}i.appendChild(l);const a=document.createElement("p");a.textContent="Custom colour",a.style.cssText="margin: 0; font-size: 13px; font-weight: 600; color: #6b7280;",i.appendChild(a);const h=document.createElement("div");h.style.cssText="display: flex; flex-direction: column; gap: 10px;";const u=W(this.current.r,this.current.g,this.current.b),m=[{label:"Hue",min:0,max:360,initial:u.h,gradient:"linear-gradient(to right,red,yellow,lime,cyan,blue,magenta,red)",ref:"hSlider"},{label:"Saturation",min:0,max:100,initial:u.s,gradient:"linear-gradient(to right,#fff,hsl(0,100%,50%))",ref:"sSlider"},{label:"Brightness",min:0,max:100,initial:u.b,gradient:"linear-gradient(to right,#000,#fff)",ref:"bSlider"}];for(const p of m){const d=document.createElement("div");d.style.cssText="display: flex; align-items: center; gap: 10px;";const f=document.createElement("span");f.textContent=p.label,f.style.cssText="width: 72px; font-size: 12px; font-weight: 600; color: #374151; flex-shrink: 0;";const C=document.createElement("div");C.style.cssText=`flex: 1; height: 24px; border-radius: 4px; background: ${p.gradient}; position: relative;`;const x=document.createElement("input");x.type="range",x.min=p.min.toString(),x.max=p.max.toString(),x.value=p.initial.toString(),x.style.cssText=`
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0.01;
        cursor: pointer;
        margin: 0;
        min-height: 44px;
      `,x.addEventListener("input",()=>this.onSliderChange()),C.appendChild(x),this.hSlider=p.ref==="hSlider"?x:this.hSlider,this.sSlider=p.ref==="sSlider"?x:this.sSlider,this.bSlider=p.ref==="bSlider"?x:this.bSlider,d.appendChild(f),d.appendChild(C),h.appendChild(d)}i.appendChild(h);const g=document.createElement("div");if(g.style.cssText="display: flex; gap: 10px; margin-top: 4px;",this.opts.onReset){const p=document.createElement("button");p.textContent="Reset Palette",p.style.cssText=`
        flex: 1;
        padding: 14px;
        min-height: 52px;
        font-size: 15px;
        font-weight: 600;
        background: #fef2f2;
        color: #dc2626;
        border: none;
        border-radius: 10px;
        cursor: pointer;
      `;const d=()=>{this.unmount(),this.opts.onReset()};p.addEventListener("click",d),p.addEventListener("touchend",f=>{f.preventDefault(),d()}),g.appendChild(p)}const b=document.createElement("button");b.textContent="Cancel",b.style.cssText=`
      flex: 1;
      padding: 14px;
      min-height: 52px;
      font-size: 15px;
      font-weight: 600;
      background: #f3f4f6;
      color: #374151;
      border: none;
      border-radius: 10px;
      cursor: pointer;
    `;const v=()=>{this.cancel()};return b.addEventListener("click",v),b.addEventListener("touchend",p=>{p.preventDefault(),v()}),g.appendChild(b),i.appendChild(g),t.appendChild(i),this.updatePreview(),t}onSliderChange(){if(!this.hSlider||!this.sSlider||!this.bSlider)return;const t=parseInt(this.hSlider.value),i=parseInt(this.sSlider.value),e=parseInt(this.bSlider.value);this.current=U(t,i,e),this.updatePreview(),this.opts.onPick(this.current)}cancel(){this.unmount(),this.opts.onCancel()}updatePreview(){this.previewEl&&(this.previewEl.style.background=`rgb(${this.current.r},${this.current.g},${this.current.b})`)}}class K{constructor(t){this.session=t,this.el=document.createElement("div"),this.el.className="palette-strip",this.el.style.cssText=`
      height: 80px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-top: 1px solid #e5e7eb;
      overflow-x: auto;
      overflow-y: hidden;
    `}el;unsubs=[];activePicker=null;get element(){return this.el}mount(){if(!document.getElementById("palette-strip-styles")){const i=document.createElement("style");i.id="palette-strip-styles",i.textContent=`
        @keyframes swatch-pulse {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.18); }
          100% { transform: scale(1); }
        }
        .swatch-pulse { animation: swatch-pulse 0.5s ease-out; }
      `,document.head.appendChild(i)}const t=this.session.on("change",i=>{i==="selectionChanged"?this.updateSelection(!0):(i==="gridChanged"||i==="paletteChanged")&&this.render()});this.unsubs.push(t),this.render()}unmount(){this.activePicker?.unmount(),this.activePicker=null,this.unsubs.forEach(t=>t()),this.unsubs=[],this.el.innerHTML=""}render(){this.el.innerHTML="";const t=this.session.palette,i=document.createElement("div");i.style.cssText=`
      display: flex;
      gap: 8px;
      padding: 8px;
      min-width: max-content;
    `;for(let e=0;e<t.colours.length;e++){const s=document.createElement("div");s.dataset.paletteEntry=String(e),s.style.cssText=`
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px;
        min-width: 64px;
        cursor: pointer;
        border-radius: 8px;
        border: 3px solid transparent;
        box-sizing: border-box;
        transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
      `,s.addEventListener("mouseover",()=>{e!==this.session.selectedPaletteIndex&&(s.style.background="rgba(0, 0, 0, 0.05)")}),s.addEventListener("mouseout",()=>{e!==this.session.selectedPaletteIndex&&(s.style.background="transparent")});const n=document.createElement("div");n.dataset.paletteSwatch=String(e),n.style.cssText=`
        width: 44px;
        height: 44px;
        border-radius: 8px;
        background: ${t.cssString(e)};
        position: relative;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      `;const o=this.session.paintedCells(e),r=this.session.totalCells(e);if(o===r&&r>0){const h=document.createElement("div");h.style.cssText=`
          position: absolute;
          top: -4px;
          right: -4px;
          width: 24px;
          height: 24px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: bold;
        `,h.textContent="✓",n.appendChild(h)}s.appendChild(n);const l=document.createElement("div");l.dataset.paletteNumber=String(e),l.style.cssText=`
        font-size: 14px;
        font-weight: bold;
        color: #1f2937;
        margin-top: 4px;
        min-width: 28px;
        min-height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
      `,l.textContent=(e+1).toString(),s.appendChild(l);const a=document.createElement("div");a.dataset.paletteProgress=String(e),a.style.cssText=`
        font-size: 12px;
        color: #6b7280;
        margin-top: 2px;
      `,a.textContent=`${o}/${r}`,s.appendChild(a),this.attachEntryHandlers(s,e),i.appendChild(s)}this.el.appendChild(i),this.updateSelection()}attachEntryHandlers(t,i){let e=null,s=!1,n=0,o=0;const r=(h,u)=>{n=h,o=u,s=!1,e=setTimeout(()=>{s=!0,this.openColourPicker(i)},500)},l=()=>{e!==null&&(clearTimeout(e),e=null)};t.addEventListener("touchstart",h=>{const u=h.touches[0];r(u.clientX,u.clientY)},{passive:!0}),t.addEventListener("touchmove",h=>{const u=h.touches[0],m=u.clientX-n,g=u.clientY-o;Math.sqrt(m*m+g*g)>8&&l()},{passive:!0});const a=()=>{this.session.selectPaletteIndex(i),this.updateSelection()};t.addEventListener("touchend",h=>{l(),s||(h.preventDefault(),a())}),t.addEventListener("mousedown",h=>r(h.clientX,h.clientY)),t.addEventListener("mousemove",h=>{const u=h.clientX-n,m=h.clientY-o;Math.sqrt(u*u+m*m)>8&&l()}),t.addEventListener("mouseup",()=>{l()}),t.addEventListener("click",()=>{s||a()})}openColourPicker(t){if(this.activePicker)return;const i=this.session.palette.colours[t]?.rgba??{r:128,g:128,b:128,a:255},e=new _({initial:i,onPick:s=>{this.session.replacePaletteColour(t,s)},onCancel:()=>{this.activePicker=null},onReset:async()=>{this.activePicker=null,await Y("Reset all colours to the suggested palette?")&&this.session.resetPalette()}});this.activePicker=e,e.mount(document.body)}updateSelection(t=!1){this.el.querySelectorAll("[data-palette-entry]").forEach((e,s)=>{const n=e.querySelector("[data-palette-swatch]"),o=e.querySelector("[data-palette-number]"),r=e.querySelector("[data-palette-progress]");s===this.session.selectedPaletteIndex?(e.setAttribute("aria-current","true"),e.style.background="#fef3c7",e.style.borderColor="#111827",e.style.boxShadow="0 0 0 4px #facc15, 0 5px 0 0 #111827",e.style.transform="translateY(-2px)",n&&(n.style.boxShadow="0 0 0 3px #fff, 0 0 0 6px #111827"),o&&(o.style.background="#111827",o.style.color="#fff"),r&&(r.style.color="#111827"),t&&n&&(n.classList.remove("swatch-pulse"),n.offsetWidth,n.classList.add("swatch-pulse"),n.addEventListener("animationend",()=>n.classList.remove("swatch-pulse"),{once:!0}))):(e.removeAttribute("aria-current"),e.style.background="transparent",e.style.borderColor="transparent",e.style.boxShadow="none",e.style.transform="translateY(0)",n&&(n.style.boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"),o&&(o.style.background="transparent",o.style.color="#1f2937"),r&&(r.style.color="#6b7280"))}),this.scrollActiveIntoView()}scrollActiveIntoView(){const t=this.el.querySelector(`[data-palette-entry="${this.session.selectedPaletteIndex}"]`);t&&t.scrollIntoView({behavior:"smooth",block:"nearest",inline:"nearest"})}}const S=[{tool:"tap",label:"Tap",icon:`<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 2C11 2 8 5.5 8 9a3 3 0 006 0c0-3.5-3-7-3-7z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M8 14v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M11 15v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M14 14v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`},{tool:"bucket",label:"Fill Region",icon:`<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 16l8-8 4 4-5 6H4v-2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M10 6l2-2 4 4-2 2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="18" cy="17" r="2" stroke="currentColor" stroke-width="1.8"/>
    </svg>`},{tool:"fillAll",label:"Fill All",icon:`<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
      <rect x="12" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
      <rect x="3" y="12" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
      <rect x="12" y="12" width="7" height="7" rx="1" fill="currentColor" opacity="0.8"/>
    </svg>`}],Q=`<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 18h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M9 21h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M11 2a6 6 0 00-3.4 10.9c.8.6 1.1 1.2 1.1 2.1h4.6c0-.9.3-1.5 1.1-2.1A6 6 0 0011 2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
</svg>`;class J{constructor(t){this.session=t,this.el=document.createElement("div"),this.el.style.cssText=`
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      flex-shrink: 0;
    `,this.buildButtons()}el;buttons=new Map;hintButton=null;unsubs=[];get element(){return this.el}mount(){const t=this.session.on("change",i=>{i==="toolChanged"&&this.updateSelection(),(i==="selectionChanged"||i==="gridChanged")&&this.updateHintAvailability()});this.unsubs.push(t),this.updateSelection()}unmount(){this.unsubs.forEach(t=>t()),this.unsubs=[]}buildButtons(){for(const{tool:n,label:o,icon:r}of S){const l=document.createElement("button");l.setAttribute("aria-label",o),l.innerHTML=r,l.style.cssText=`
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        border: 2px solid transparent;
        border-radius: 10px;
        background: #f3f4f6;
        color: #374151;
        cursor: pointer;
        padding: 0;
        transition: transform 0.15s, background 0.15s, border-color 0.15s;
      `;const a=()=>{this.session.setTool(n),l.style.transform="scale(1.15)",setTimeout(()=>{l.style.transform="scale(1)"},150)};l.addEventListener("click",a),l.addEventListener("touchend",h=>{h.preventDefault(),a()}),this.buttons.set(n,l),this.el.appendChild(l)}const t=this.makeIconButton("Hint",Q);t.title="Hint";const i=()=>{this.session.requestHint(),t.style.transform="scale(1.15)",setTimeout(()=>{t.style.transform="scale(1)"},150)};t.addEventListener("click",i),t.addEventListener("touchend",n=>{n.preventDefault(),i()}),this.hintButton=t,this.el.appendChild(t);const e=document.createElement("div");e.style.flex="1",this.el.appendChild(e);const s=document.createElement("span");s.id="toolbar-tool-label",s.style.cssText="font-size: 12px; color: #6b7280; font-weight: 600;",this.el.appendChild(s)}makeIconButton(t,i){const e=document.createElement("button");return e.setAttribute("aria-label",t),e.innerHTML=i,e.style.cssText=`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      border: 2px solid transparent;
      border-radius: 10px;
      background: #f3f4f6;
      color: #374151;
      cursor: pointer;
      padding: 0;
      transition: transform 0.15s, background 0.15s, border-color 0.15s, opacity 0.15s;
    `,e}updateSelection(){const t=this.session.currentTool;for(const[e,s]of this.buttons)e===t?(s.style.background="#dbeafe",s.style.borderColor="#2563eb",s.style.color="#1d4ed8"):(s.style.background="#f3f4f6",s.style.borderColor="transparent",s.style.color="#374151");const i=this.el.querySelector("#toolbar-tool-label");if(i){const e=S.find(s=>s.tool===t);i.textContent=e?.label??""}this.updateHintAvailability()}updateHintAvailability(){if(!this.hintButton)return;const t=this.session.grid.unpaintedForColour(this.session.selectedPaletteIndex)>0;this.hintButton.disabled=!t,this.hintButton.style.opacity=t?"1":"0.45",this.hintButton.style.cursor=t?"pointer":"not-allowed"}}class tt{canvas;ctx;particles=[];animFrame=null;lastTime=0;isRunning=!1;constructor(){this.canvas=document.createElement("canvas"),this.canvas.style.cssText=`
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 101;
    `,this.ctx=this.canvas.getContext("2d")}get element(){return this.canvas}start(){if(this.isRunning)return;this.isRunning=!0,this.particles=[],this.lastTime=performance.now(),this.canvas.width=window.innerWidth,this.canvas.height=window.innerHeight;const t=["#ff6b6b","#ffd93d","#6bcf7f","#4d96ff","#ff9ff3","#54a0ff"];for(let i=0;i<60;i++){const e=Math.random()*window.innerWidth,s=-10,n=(Math.random()-.5)*300,o=-(Math.random()*300+300),r=Math.random()*Math.PI*2,l=(Math.random()-.5)*8,a=t[Math.floor(Math.random()*t.length)],h=1,u=6+Math.random()*4,m=6+Math.random()*4;this.particles.push({x:e,y:s,vx:n,vy:o,rotation:r,angularVel:l,color:a,opacity:h,width:u,height:m})}this.animate()}stop(){this.isRunning=!1,this.animFrame!==null&&(cancelAnimationFrame(this.animFrame),this.animFrame=null),this.canvas.remove()}animate=()=>{const t=performance.now();let i=(t-this.lastTime)/1e3;this.lastTime=t,i=Math.min(i,.05);for(let e=this.particles.length-1;e>=0;e--){const s=this.particles[e];s.x+=s.vx*i,s.y+=s.vy*i,s.vy+=800*i,s.rotation+=s.angularVel*i,s.opacity-=.5*i,s.opacity<=0&&this.particles.splice(e,1)}this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);for(const e of this.particles)this.ctx.save(),this.ctx.globalAlpha=e.opacity,this.ctx.translate(e.x,e.y),this.ctx.rotate(e.rotation),this.ctx.fillStyle=e.color,this.ctx.fillRect(-e.width/2,-e.height/2,e.width,e.height),this.ctx.restore();this.particles.length>0?this.animFrame=requestAnimationFrame(this.animate):this.stop()}}class et{constructor(t,i,e){this.session=t,this.router=i,this.onDismiss=e,this.el=document.createElement("div"),this.el.setAttribute("data-completion-overlay","true"),this.el.style.cssText=`
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease-out;
    `}el;confetti=null;unsubSession=null;showTimer=null;mount(t){t.appendChild(this.el),this.unsubSession=this.session.on("change",l=>{l==="completionChanged"&&!this.session.isComplete&&this.unmount()});const i=document.createElement("div");i.style.cssText=`
      background: white;
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      max-width: 400px;
    `;const e=document.createElement("h1");e.textContent="You did it! 🎉",e.style.cssText=`
      font-size: 32px;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 20px 0;
    `,i.appendChild(e),this.confetti=new tt,i.appendChild(this.confetti.element);const s=document.createElement("p");s.textContent="You completed the puzzle!",s.style.cssText=`
      font-size: 16px;
      color: #6b7280;
      margin: 20px 0;
    `,i.appendChild(s);const n=document.createElement("div");n.style.cssText=`
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 20px;
    `;const o=document.createElement("button");o.textContent="Keep Looking",o.style.cssText=`
      padding: 14px 20px;
      min-height: 44px;
      background: #f3f4f6;
      color: #1f2937;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    `,o.addEventListener("mouseover",()=>{o.style.background="#e5e7eb"}),o.addEventListener("mouseout",()=>{o.style.background="#f3f4f6"}),o.addEventListener("click",()=>{this.unmount()}),n.appendChild(o);const r=document.createElement("button");r.textContent="Back to Home",r.className="btn-primary",r.style.cssText=`
      padding: 14px 24px;
      min-height: 44px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    `,r.addEventListener("mouseover",()=>{r.style.background="#1d4ed8"}),r.addEventListener("mouseout",()=>{r.style.background="#2563eb"}),r.addEventListener("click",()=>{this.router.navigate("#/")}),n.appendChild(r),i.appendChild(n),this.el.appendChild(i),this.showTimer=setTimeout(()=>{this.showTimer=null,this.el.style.opacity="1",this.confetti?.start(),B()},900)}unmount(){this.showTimer!==null&&(clearTimeout(this.showTimer),this.showTimer=null),this.confetti&&(this.confetti.stop(),this.confetti=null),this.unsubSession&&(this.unsubSession(),this.unsubSession=null),this.el.remove(),this.onDismiss?.()}}const k="tappy-onboarded-v1";function it(){try{return!localStorage.getItem(k)}catch{return!1}}function st(){try{localStorage.setItem(k,"1")}catch{}}class T{overlay=null;unsubs=[];step=0;autoTimer=null;static shouldShow=it;mount(t,i){this.overlay=document.createElement("div"),this.overlay.style.cssText=`
      position: fixed;
      inset: 0;
      z-index: 500;
      pointer-events: none;
    `,t.appendChild(this.overlay),this.showStep(0,i);const e=i.session.on("change",s=>{s==="selectionChanged"&&this.step===0?this.showStep(1,i):s==="gridChanged"&&this.step===1&&this.finish()});this.unsubs.push(e)}showStep(t,i){if(this.step=t,this.autoTimer!==null&&(clearTimeout(this.autoTimer),this.autoTimer=null),!this.overlay)return;this.overlay.innerHTML="";const e=t===0?i.paletteEl.querySelector("button"):i.gridEl;if(!e){this.finish();return}const s=e.getBoundingClientRect(),n=t===0?"Pick a colour! 🎨":"Now tap a square! ✏️",o=document.createElement("div");o.style.cssText=`
      position: fixed;
      background: #1f2937;
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      white-space: nowrap;
      pointer-events: auto;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      cursor: pointer;
    `,o.textContent=n;const r=Math.max(8,s.top-60),l=Math.max(8,Math.min(window.innerWidth-240,s.left+s.width/2-100));o.style.top=`${r}px`,o.style.left=`${l}px`,o.addEventListener("click",()=>{t===0?this.showStep(1,i):this.finish()});const a=document.createElement("div");a.style.cssText=`
      position: fixed;
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 12px solid #1f2937;
      pointer-events: none;
    `,a.style.top=`${r+46}px`,a.style.left=`${l+90}px`,this.overlay.appendChild(o),this.overlay.appendChild(a),this.autoTimer=setTimeout(()=>{t===0?this.showStep(1,i):this.finish()},6e3)}finish(){st(),this.unmount()}unmount(){this.autoTimer!==null&&(clearTimeout(this.autoTimer),this.autoTimer=null),this.unsubs.forEach(t=>t()),this.unsubs=[],this.overlay?.remove(),this.overlay=null}}function nt(){return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1}class ot{el=null;timer=null;show(t,i){this.unmount();const e=z.get(),s=O(e.mascotId),n=nt(),o=document.createElement("div");o.dataset.colourEncouragement="true",o.style.cssText=`
      position: fixed;
      left: 50%;
      bottom: 104px;
      z-index: 95;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px 10px 10px;
      min-height: 64px;
      max-width: min(420px, calc(100vw - 32px));
      background: #fff;
      border: 4px solid var(--tc-ink-black);
      border-radius: 8px;
      box-shadow: 0 6px 0 0 var(--tc-ink-black);
      font-family: var(--tc-font-display);
      color: var(--tc-ink);
      pointer-events: none;
      opacity: ${n?"1":"0"};
      transform: translate(-50%, ${n?"0":"10px"}) scale(${n?"1":"0.96"});
      transition: ${n?"none":"opacity 140ms ease-out, transform 140ms ease-out"};
    `;const r=document.createElement("img");r.src=$(s),r.alt="",r.style.cssText=`
      width: 48px;
      height: 48px;
      flex: 0 0 auto;
      object-fit: contain;
    `,n||(r.className="mascot-bob"),o.appendChild(r);const l=document.createElement("div");l.textContent=X(s,i),l.style.cssText=`
      font-size: 14px;
      line-height: 1.2;
      overflow-wrap: anywhere;
    `,o.appendChild(l),t.appendChild(o),this.el=o,A(),n||requestAnimationFrame(()=>{this.el&&(this.el.style.opacity="1",this.el.style.transform="translate(-50%, 0) scale(1)")}),this.timer=setTimeout(()=>this.unmount(),1600)}unmount(){this.timer!==null&&(clearTimeout(this.timer),this.timer=null),this.el?.remove(),this.el=null}}function rt(c){const t=c.grid.columns*c.grid.rows;return c.isComplete||c.grid.unpaintedCount===t}function lt(c){const t=window.open("","_blank");return t?(t.opener=null,t.document.write(at(c)),t.document.close(),t.focus(),t.print(),!0):!1}function at(c){const t=[];for(let e=0;e<c.grid.rows;e++)for(let s=0;s<c.grid.columns;s++){const n=c.grid.cell(s,e),o=c.palette.colours[n.paletteIndex]?.number??n.paletteIndex+1;t.push(`<span class="cell">${o}</span>`)}const i=c.palette.colours.map(e=>{const s=e.rgba,n=`rgba(${s.r}, ${s.g}, ${s.b}, ${Math.round(s.a/255*100)/100})`;return`
      <div class="legend-item">
        <span class="legend-number">${e.number}</span>
        <span class="swatch" style="background:${n}"></span>
      </div>
    `}).join("");return`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${E(c.title)} - Tappy Colour Sheet</title>
  <style>
    @page { margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #111827;
      font-family: Arial, Helvetica, sans-serif;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 22px;
      text-align: center;
    }
    .meta {
      margin: 0 0 12px;
      color: #4b5563;
      font-size: 12px;
      text-align: center;
    }
    .sheet-grid {
      display: grid;
      grid-template-columns: repeat(${c.grid.columns}, 1fr);
      width: min(100%, 180mm);
      margin: 0 auto;
      border: 1px solid #111827;
      aspect-ratio: ${c.grid.columns} / ${c.grid.rows};
    }
    .cell {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      min-height: 0;
      border-right: 0.5px solid #9ca3af;
      border-bottom: 0.5px solid #9ca3af;
      font-size: clamp(5px, ${Math.max(5,Math.floor(130/c.grid.columns))}px, 14px);
      line-height: 1;
    }
    .legend {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(58px, 1fr));
      gap: 8px;
      margin: 14px auto 0;
      width: min(100%, 180mm);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      break-inside: avoid;
    }
    .legend-number {
      min-width: 20px;
      font-weight: 700;
      text-align: right;
    }
    .swatch {
      width: 22px;
      height: 22px;
      border: 1px solid #111827;
    }
  </style>
</head>
<body>
  <h1>${E(c.title)}</h1>
  <p class="meta">${c.grid.columns}x${c.grid.rows} colour-by-number</p>
  <main class="sheet-grid">${t.join("")}</main>
  <section class="legend">${i}</section>
</body>
</html>`}function E(c){return c.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}class gt extends P{constructor(t,i,e){super(),this.router=t,this.store=i,this.artworkId=e}root=null;session=null;gridCanvas=null;paletteStrip=null;toolbarStrip=null;completionOverlay=null;colourEncouragement=null;onboardingCoach=null;sourceImageEl=null;sourceToggleBtn=null;printBtn=null;showingSourceImage=!1;objectUrls=new D;unsub=null;mount(t){this.root=t,I(t),this.store.get(this.artworkId).then(i=>{if(!i){this.router.navigate("#/");return}this.root&&this.mountGame(t,i)})}mountGame(t,i){const e=new j(i,this.store);this.session=e,this.colourEncouragement=new ot;const s=this.sourceImageUrlFor(i),n=document.createElement("div");n.style.cssText=`
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: #f9fafb;
      position: relative;
    `;const o=document.createElement("div");o.style.cssText=`
      display: flex;
      align-items: center;
      padding: 0 12px;
      height: 52px;
      flex-shrink: 0;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      gap: 8px;
    `;const r=document.createElement("button");r.textContent="← Home",r.style.cssText=`
      padding: 8px 14px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    `,r.addEventListener("click",()=>this.router.navigate("#/"));const l=document.createElement("span");l.textContent=i.title,l.style.cssText=`
      flex: 1;
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
    `;const a=document.createElement("button");a.textContent="⊙",a.title="Reset zoom",a.style.cssText=`
      padding: 8px 14px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    `;const h=document.createElement("button");h.textContent="Undo",h.style.cssText=`
      padding: 8px 14px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    `,h.addEventListener("click",()=>e.undo());const u=document.createElement("button");u.textContent="PRINT",u.setAttribute("data-print-sheet","true"),u.style.cssText=`
      min-height: 44px;
      padding: 8px 14px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      display: none;
      align-items: center;
      justify-content: center;
    `,u.addEventListener("click",()=>{const d=this.printableSnapshot();d&&lt(d)}),this.printBtn=u;const m=document.createElement("button");m.textContent="PHOTO",m.setAttribute("data-source-toggle","true"),m.setAttribute("aria-pressed","false"),m.style.cssText=`
      min-height: 44px;
      padding: 8px 14px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      display: none;
      align-items: center;
      justify-content: center;
    `,m.addEventListener("click",()=>this.toggleSourceImage()),this.sourceToggleBtn=m,o.appendChild(r),o.appendChild(l),o.appendChild(a),o.appendChild(h),o.appendChild(u),o.appendChild(m);const g=document.createElement("div");g.style.cssText=`
      flex: 1;
      min-height: 0;
      position: relative;
    `;const b=new J(e);this.toolbarStrip=b;const v=new K(e);this.paletteStrip=v,n.appendChild(o),n.appendChild(b.element),n.appendChild(g),n.appendChild(v.element),t.appendChild(n);const p=new q(e,g);if(this.gridCanvas=p,p.mount(),s){const d=document.createElement("img");d.src=s,d.alt=`${i.title} source image`,d.setAttribute("data-source-image","true"),d.style.cssText=`
        position: absolute;
        inset: 0;
        z-index: 3;
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: white;
        display: none;
        pointer-events: none;
      `,g.appendChild(d),this.sourceImageEl=d}if(this.updateSourceToggle(),this.updatePrintButton(),a.addEventListener("click",()=>p.resetZoom()),b.mount(),v.mount(),T.shouldShow()){const d=new T;this.onboardingCoach=d,d.mount(t,{paletteEl:v.element,gridEl:g,session:e})}this.unsub=e.on("change",d=>{if(d==="colourCompleted"&&this.root){const f=e.lastCompletedPaletteIndex;f!==null&&this.colourEncouragement?.show(this.root,f+1)}if((d==="gridChanged"||d==="completionChanged")&&this.updatePrintButton(),d==="completionChanged"&&e.isComplete&&this.root){this.updateSourceToggle();const f=new et(e,this.router,()=>{this.completionOverlay=null});f.mount(this.root),this.completionOverlay=f}else d==="completionChanged"&&this.updateSourceToggle()})}sourceImageUrlFor(t){if(t.source.kind==="bundled"){const i=t.source.bundledImageName;return R.find(e=>e.id===i)?.src??null}return t.sourceImageBlob?this.objectUrls.create(t.sourceImageBlob):t.thumbnailBlob?this.objectUrls.create(t.thumbnailBlob):null}toggleSourceImage(){!this.session?.isComplete||!this.sourceImageEl||(this.showingSourceImage=!this.showingSourceImage,this.updateSourceToggle())}printableSnapshot(){if(!this.session)return null;const t=this.session.toArtworkSnapshot();return rt(t)?t:null}updatePrintButton(){this.printBtn&&(this.printBtn.style.display=this.printableSnapshot()?"inline-flex":"none")}updateSourceToggle(){if(!this.sourceToggleBtn)return;const t=!!(this.session?.isComplete&&this.sourceImageEl);t||(this.showingSourceImage=!1),this.sourceToggleBtn.style.display=t?"inline-flex":"none",this.sourceToggleBtn.textContent=this.showingSourceImage?"PAINT":"PHOTO",this.sourceToggleBtn.setAttribute("aria-pressed",String(this.showingSourceImage)),this.sourceImageEl&&(this.sourceImageEl.style.display=t&&this.showingSourceImage?"block":"none")}unmount(){this.unsub?.(),this.unsub=null,this.session?.destroy(),this.session=null,this.gridCanvas?.unmount(),this.gridCanvas=null,this.toolbarStrip?.unmount(),this.toolbarStrip=null,this.paletteStrip?.unmount(),this.paletteStrip=null,this.completionOverlay?.unmount(),this.completionOverlay=null,this.colourEncouragement?.unmount(),this.colourEncouragement=null,this.onboardingCoach?.unmount(),this.onboardingCoach=null,this.sourceImageEl=null,this.sourceToggleBtn=null,this.printBtn=null,this.showingSourceImage=!1,this.objectUrls.revokeAll(),this.root&&(this.root.innerHTML="",this.root=null)}}export{gt as PuzzleContainer};
