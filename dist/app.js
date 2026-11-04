import {blank,select,timeline,selectMagic,magicResult,normalizeBuffs} from './mechanics.js';
import {words,resolveLanguage} from './i18n.js';
import {normalizeActionTextSize} from './preferences.js';
const browserLanguages=navigator.languages?.length?navigator.languages:[navigator.language];
let state=blank(),lang=resolveLanguage(null,browserLanguages),resultsSide='right',actionTextSize=100;
const choices={truth:['true','fake'],water:['water','thunder'],timing:['early','late'],chaos:['true','fake'],element:['fire','wave'],accel:['early','late']};
try{
  actionTextSize=normalizeActionTextSize(localStorage.getItem('dmu-action-text-size'));
  lang=resolveLanguage(localStorage.getItem('dmu-lang'),browserLanguages);
  const savedSide=localStorage.getItem('dmu-results-side-v2');if(['left','right'].includes(savedSide))resultsSide=savedSide;
  const saved=JSON.parse(sessionStorage.getItem('dmu-input-v3')||'null');
  for(const gc of ['gc1','gc2'])for(const field of Object.keys(state[gc])){
    if(field==='gaze')state[gc][field]=saved?.[gc]?.[field]===true;
    else if(choices[field]?.includes(saved?.[gc]?.[field]))state[gc][field]=saved[gc][field];
  }
  for(const stage of ['charge','out'])for(const element of ['ice','thunder'])if(['true','fake'].includes(saved?.magic?.[stage]?.[element]))state.magic[stage][element]=saved.magic[stage][element];
  normalizeBuffs(state);
}catch{}
const t=k=>words[lang][k]||k;
const magicElements=['thunder','ice'];
const settingsIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9.2 3-.5 2.1-1.4.8-2.1-.6-2.8 4.8 1.6 1.5v1.6l-1.6 1.5 2.8 4.8 2.1-.6 1.4.8.5 2.1h5.6l.5-2.1 1.4-.8 2.1.6 2.8-4.8-1.6-1.5v-1.6l1.6-1.5-2.8-4.8-2.1.6-1.4-.8-.5-2.1Z"/><circle cx="12" cy="12" r="3"/></svg>';
function settingsDialog(){return `<dialog id="settings-dialog" class="settings-dialog" aria-labelledby="settings-title"><div class="dialog-heading"><h2 id="settings-title">${t('settings')}</h2><button type="button" data-action="settings-close" class="icon-button" aria-label="${t('close')}">×</button></div><div class="text-size-heading"><label for="action-text-size">${t('actionTextSize')}</label><output for="action-text-size" data-text-size-output>${actionTextSize}%</output></div><div class="text-size-controls"><button type="button" data-action="text-smaller" aria-label="${t('smallerText')}">A−</button><input id="action-text-size" type="range" min="80" max="150" step="5" value="${actionTextSize}" data-action-text-size><button type="button" data-action="text-larger" aria-label="${t('largerText')}">A+</button></div><div class="text-size-preview" aria-hidden="true"><span class="route-word water">${t('stack')}</span><span class="route-word stop">${t('stop')}</span><span class="route-word gaze">${t('away')}</span></div><button type="button" class="demo-button settings-default" data-action="text-default">${t('defaultTextSize')}</button></dialog>`;}
function applyActionTextSize(value,persist=true){
  actionTextSize=normalizeActionTextSize(value);
  const root=document.documentElement;
  root.style.setProperty('--action-text-scale',actionTextSize/100);
  root.style.setProperty('--action-text-growth',Math.max(0,actionTextSize/100-1));
  root.dataset.actionTextSize=actionTextSize===100?'default':'custom';
  const input=document.querySelector('#action-text-size');
  if(input){input.value=actionTextSize;input.setAttribute('aria-valuetext',`${actionTextSize}%`);}
  const output=document.querySelector('[data-text-size-output]');if(output)output.textContent=`${actionTextSize}%`;
  const smaller=document.querySelector('[data-action="text-smaller"]'),larger=document.querySelector('[data-action="text-larger"]');
  if(smaller)smaller.disabled=actionTextSize<=80;if(larger)larger.disabled=actionTextSize>=150;
  const preview=document.querySelector('.text-size-preview'),results=document.querySelector('.results');
  if(preview&&results){const style=getComputedStyle(results);for(const key of ['--route-value-size','--route-value-line'])preview.style.setProperty(key,style.getPropertyValue(key));}
  sizeEnglishColumn();
  if(persist)try{localStorage.setItem('dmu-action-text-size',String(actionTextSize));}catch{}
}
function sizeEnglishColumn(){
  if(lang!=='en'||!window.matchMedia?.('(min-width:801px)').matches)return;
  const results=document.querySelector('.results'),wordStyle=getComputedStyle(results.querySelector('.route-word')),label=results.querySelector('.route-label'),badge=results.querySelector('.route-badge');
  const context=document.createElement('canvas').getContext('2d');if(!context)return;
  const measure=(text,style,weight=style.fontWeight)=>{context.font=`${weight} ${style.fontSize} ${style.fontFamily}`;return context.measureText(text).width;};
  const personal=!!(state.gc1.water||state.gc2.water),keys=['stack','spread','away','in','out','middle'];
  if(!personal)keys.push('thunderSpread','waterSpread');
  const labelStyle=getComputedStyle(label),badgeStyle=getComputedStyle(badge);
  const badgeExtra=['paddingLeft','paddingRight','borderLeftWidth','borderRightWidth'].reduce((sum,key)=>sum+parseFloat(badgeStyle[key]||0),0);
  const heading=measure(t('waterRow'),labelStyle)+measure(t(personal?'personal':'party'),badgeStyle)+badgeExtra+parseFloat(labelStyle.columnGap||0);
  const base=parseFloat(getComputedStyle(results).getPropertyValue('--route-base-first'))*actionTextSize/100;
  const breathingRoom=parseFloat(wordStyle.fontSize)*.5;
  results.style.setProperty('--route-first',`${Math.ceil(Math.max(base,heading,...keys.map(key=>measure(t(key),wordStyle,'700')))+breathingRoom)}px`);
}
const icon=k=>`<img class="status-icon" src="./assets/${k}.png" alt="" width="48" height="64">`;
const truthMark=value=>`<span class="truth-mark ${value}" aria-hidden="true"><img src="./assets/truth-${value}.svg" alt="" width="64" height="64"></span>`;
const svg=type=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${type==='sun'?'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>':type==='moon'?'<path d="M20 15A9 9 0 0 1 9 4 9 9 0 1 0 20 15Z"/>':type==='reset'?'<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>':'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .6-1.5 1-1.5 3m0 3h.01"/>'}</svg>`;
function choice(gc,field,value,content,cls=''){const selected=state[gc][field]===value;return `<button type="button" data-gc="${gc}" data-field="${field}" data-value="${value}" class="choice ${cls} ${selected?'selected':''}" aria-pressed="${selected}">${content}</button>`;}
function truthChoices(gc,field){return `<div class="choices truth-choices" role="group" aria-label="${t(field==='truth'?'truth':'chaos')}">${['true','fake'].map(v=>choice(gc,field,v,`${truthMark(v)}<span>${t(v)}</span>`,v+' paired-choice')).join('')}</div>`;}
function card(gc,n){
  const s=state[gc],element=n===1?s.element:state.gc1.element?(state.gc1.element==='fire'?'wave':'fire'):null;
  return `<section class="input-card" aria-labelledby="${gc}-title"><h2 id="${gc}-title">${t(gc)}<span class="mode-label">${t(state.gc1.water||state.gc2.water?'personal':'party')}</span></h2>${truthChoices(gc,'truth')}
    <fieldset class="water-field"><legend>${t('waterLabel')}<small>${t('optional')}</small></legend><div class="choices">${['water','thunder'].map(k=>choice(gc,'water',k,`${icon(k)}<span>${t(k)}</span>`,'with-icon paired-choice')).join('')}</div><div class="choices timing-choices" role="group" aria-label="${t('timingLabel')}">${['early','late'].map(k=>choice(gc,'timing',k,`<b>${t(k)}</b><small>${n===1?(k==='early'?'51s':'76s'):(k==='early'?'36s':'61s')}</small>`)).join('')}</div></fieldset>
    <div class="buff-controls" role="group" aria-label="${t('debuffLabel')}">${choice(gc,'gaze',true,`${icon('gaze')}<span>${t('gaze')}</span>`,'with-icon buff-choice')}${['early','late'].map(k=>choice(gc,'accel',k,`${icon('accel')}<span>${t('accel')} ${t(k)}</span>`,'with-icon buff-choice')).join('')}</div>
    <fieldset class="chaos-field"><legend>${t('chaos')}${n===2?`<span class="auto-element ${element?'':'slot-empty'}" title="${t('autoElement')}" aria-hidden="${!element}">${icon(element||'wave')}${t(element||'wave')}<small>${t('auto')}</small></span>`:''}</legend>${truthChoices(gc,'chaos')}${n===1?`<div class="choices element-choices" role="group" aria-label="${t('element')}">${['fire','wave'].map(k=>choice(gc,'element',k,`${icon(k)}<span>${t(k)}</span>`,'with-icon paired-choice')).join('')}</div>`:''}</fieldset></section>`;
}
function action(a){return `<div class="route-values"><span class="route-word ${a.kind} ${a.action||'unknown'}">${t(a.action||'unset')}</span>${a.kind==='gaze'&&a.center?`<span class="route-word center">${t('center')}</span>`:''}</div>`;}
function call(a,label,mode=''){return `<div class="route-call ${a.kind}-call"><div class="route-label"><span>${t(label)}</span>${mode?`<span class="route-badge">${t(mode)}</span>`:''}</div>${action(a)}</div>`;}
function row(r,i){
  const primary=r.actions[0],acceleration=r.actions.find(a=>a.kind==='accel');
  const content=r.type==='water'?`${call(primary,'waterRow',primary.mode)}<div class="route-extra ${acceleration?'':'slot-empty'}" aria-hidden="${!acceleration}">${call(acceleration||{kind:'accel',action:null},'accel')}</div>`:`${call(primary,r.type==='gaze'?'gazeRow':primary.icon)}${i===5?magicSafe():''}`;
  return `<li class="route-entry ${r.type} ${i===5?'with-safe':''}"><div class="route-body"><span class="route-step">${i+1}</span>${content}</div></li>`;
}
function magicChoices(stage,element){return `<div class="choices magic-truth" role="group" aria-label="${t(stage==='out'?'magicOut':stage)} · ${t(element)}">${['true','fake'].map(value=>`<button type="button" class="choice ${value} ${state.magic[stage][element]===value?'selected':''}" data-magic-stage="${stage}" data-element="${element}" data-value="${value}" aria-pressed="${state.magic[stage][element]===value}">${truthMark(value)}<span>${t(value)}</span></button>`).join('')}</div>`;}
function magicStage(stage){return `<section class="magic-stage input-card" aria-labelledby="magic-${stage}"><h2 id="magic-${stage}">${t(stage==='out'?'magicOut':stage)}</h2>${magicElements.map(element=>`<div class="magic-input-row"><span class="magic-element">${t(element)}</span>${magicChoices(stage,element)}</div>`).join('')}</section>`;}
function magicSafe(){const result=magicResult(state.magic);return `<section class="route-call safe-call" aria-live="polite" aria-atomic="true"><div class="route-label"><span>${t('safeTitle')}</span><div class="resolved-truth">${magicElements.map(element=>`<span class="effective-${result[element]||'unknown'}">${t(element)} <b>${t(result[element]||'unset')}</b></span>`).join('')}</div></div><p class="route-word ${result.complete?'safe':'unknown'}">${t(result.safe||'unset')}</p></section>`;}
function render(){
  const route=timeline(state);document.documentElement.dataset.resultsSide=resultsSide;document.documentElement.lang=lang==='zh'?'zh-Hant':lang;document.title=`DMU · ${t('title')}`;
  document.querySelector('#app').innerHTML=`
    <main class="workspace"><div class="inputs">${card('gc1',1)}${card('gc2',2)}${magicStage('charge')}${magicStage('out')}</div><section class="results" aria-labelledby="result-title"><h2 id="result-title">${t('result')}<span class="result-tools"><button class="reset-button" data-action="reset">${svg('reset')}<span>${t('reset')}</span></button><button class="position-button" data-action="side" title="${t(resultsSide==='left'?'toRight':'toLeft')}" aria-label="${t(resultsSide==='left'?'toRight':'toLeft')}">⇄</button></span></h2><div id="live-route" aria-live="polite" aria-atomic="true">${['early','late'].map((timing,index)=>`<section class="resolution"><h3>${t(index===0?'first':'second')}</h3><ol start="${index*3+1}">${route.rows.slice(index*3,index*3+3).map((r,i)=>row(r,index*3+i)).join('')}</ol></section>`).join('')}</div></section></main><footer class="toolbar"><h1>DMU <span>${t('title')}</span></h1><div class="toolbar-controls"><div class="languages" role="group" aria-label="Language">${[['zh','中'],['ja','日'],['en','EN']].map(([k,label])=>`<button data-lang="${k}" aria-pressed="${lang===k}" class="${lang===k?'active':''}">${label}</button>`).join('')}</div><button class="icon-button" data-action="theme" aria-label="${t(document.documentElement.dataset.theme==='dark'?'light':'dark')}">${svg(document.documentElement.dataset.theme==='dark'?'sun':'moon')}</button><button type="button" class="icon-button settings-button" data-action="settings" title="${t('settings')}" aria-label="${t('settings')}">${settingsIcon}</button><button class="icon-button help-button" data-action="help" aria-label="${t('help')}">${svg('help')}</button></div></footer>
    <dialog id="help-dialog"><div class="dialog-heading"><h2>${t('helpTitle')}</h2><button data-action="close" class="icon-button" aria-label="${t('close')}">×</button></div>${[1,2,3,4,5,6,7].map(i=>`<p>${t('help'+i)}</p>`).join('')}<button class="demo-button" data-action="demo">${t('demo')}</button></dialog>${settingsDialog()}`;
  applyActionTextSize(actionTextSize,false);
  try{sessionStorage.setItem('dmu-input-v3',JSON.stringify(state));localStorage.setItem('dmu-lang',lang);localStorage.setItem('dmu-results-side-v2',resultsSide);}catch{}
}
let previous=null,toastTimer;
function clearToast(){document.querySelector('#toast').classList.remove('show');document.querySelector('#toast').replaceChildren();}
function toast(message,undo=false){clearTimeout(toastTimer);const el=document.querySelector('#toast');el.innerHTML=`<span>${message}</span>${undo?`<button data-action="undo">${t('undo')}</button>`:''}`;el.classList.add('show');toastTimer=setTimeout(clearToast,5000);}
let backdropDialog=null;
function isDialogBackdrop(event){
  if(!event.target.matches?.('dialog[open]'))return false;
  const rect=event.target.getBoundingClientRect();
  return event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom;
}
document.addEventListener('pointerdown',event=>{backdropDialog=isDialogBackdrop(event)?event.target:null;});
document.addEventListener('click',event=>{
  if(backdropDialog===event.target&&isDialogBackdrop(event)){backdropDialog.close();backdropDialog=null;return;}
  backdropDialog=null;
  const b=event.target.closest('button');if(!b)return;const {gc,field,value,action}=b.dataset;
  if(action==='settings'){document.querySelector('#settings-dialog').showModal();return;}
  if(action==='settings-close'){document.querySelector('#settings-dialog').close();return;}
  if(['text-smaller','text-larger','text-default'].includes(action)){applyActionTextSize(action==='text-default'?100:actionTextSize+(action==='text-smaller'?-5:5));return;}
  if(b.dataset.magicStage){const stage=b.dataset.magicStage,element=b.dataset.element;selectMagic(state,stage,element,value);render();document.querySelector(`[data-magic-stage="${stage}"][data-element="${element}"][data-value="${value}"]`)?.focus({preventScroll:true});return;}
  if(gc&&state[gc]&&field in state[gc]){select(state,gc,field,['gaze'].includes(field)?true:value);render();document.querySelector(`[data-gc="${gc}"][data-field="${field}"][data-value="${value}"]`)?.focus({preventScroll:true});return;}
  if(b.dataset.lang){const left=window.scrollX,top=window.scrollY;lang=b.dataset.lang;render();document.querySelector(`[data-lang="${lang}"]`)?.focus({preventScroll:true});window.scrollTo({left,top,behavior:'instant'});requestAnimationFrame(()=>window.scrollTo({left,top,behavior:'instant'}));return;}
  if(action==='side'){resultsSide=resultsSide==='left'?'right':'left';render();document.querySelector('[data-action="side"]').focus({preventScroll:true});}
  if(action==='theme'){document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('dmu-theme',document.documentElement.dataset.theme);}catch{}render();document.querySelector('[data-action="theme"]').focus({preventScroll:true});}
  if(action==='reset'){previous=structuredClone(state);state=blank();render();toast(t('resetToast'),true);document.querySelector('[data-action="reset"]').focus({preventScroll:true});}
  if(action==='undo'&&previous){state=previous;previous=null;render();clearToast();}
  if(action==='help')document.querySelector('#help-dialog').showModal();if(action==='close')document.querySelector('#help-dialog').close();
  if(action==='demo'){state=blank();Object.assign(state.gc1,{truth:'true',timing:'early',gaze:true,accel:'early',chaos:'fake',element:'fire'});Object.assign(state.gc2,{truth:'fake',timing:'late',water:'water',chaos:'true'});state.magic={charge:{ice:'fake',thunder:'true'},out:{ice:'fake',thunder:'fake'}};render();}
});
document.addEventListener('input',event=>{if(event.target.matches('[data-action-text-size]'))applyActionTextSize(event.target.value);});
render();
window.addEventListener?.('resize',()=>applyActionTextSize(actionTextSize,false));
document.fonts?.ready.then(sizeEnglishColumn);
