export const blank = () => ({magic:{charge:{ice:null,thunder:null},out:{ice:null,thunder:null}},gc1:{truth:null,water:null,timing:null,gaze:false,accel:null,chaos:null,element:null},gc2:{truth:null,water:null,timing:null,gaze:false,accel:null,chaos:null}});
export const opposite = v => v==='early'?'late':v==='late'?'early':null;
export const wlAction = (kind,truth) => !truth?null:((kind==='water')===(truth==='true')?'stack':'spread');
export const globalWLAction = truth => !truth?null:truth==='true'?'thunderSpread':'waterSpread';
export const gazeAction = truth => !truth?null:truth==='true'?'away':'in';
export const accelAction = truth => !truth?null:truth==='true'?'stop':'move';
export const chaosAction = (element,truth) => !element||!truth?null:(element==='fire')===(truth==='true')?'out':'middle';
// Gaze can coexist only with its matching acceleration timing.
export function accelTiming(gc){return ['early','late'].includes(gc.accel)?gc.accel:null;}
export function normalizeBuffs(state){for(const gc of ['gc1','gc2']){const g=state[gc],matching=gc==='gc1'?'early':'late';if(g.water){g.gaze=false;g.accel=null;}else if(g.accel){g.gaze=g.accel===matching;}else if(g.gaze)g.accel=matching;}}
export function setTiming(s,gc,v){const next=s[gc].timing===v?null:v;s[gc].timing=next;s[gc==='gc1'?'gc2':'gc1'].timing=opposite(next);}
export function timeline(s){
  const gcs=[s.gc1,s.gc2],personal=gcs.some(g=>g.water),elements=[s.gc1.element,s.gc1.element?(s.gc1.element==='fire'?'wave':'fire'):null],rows=[];
  for(const timing of ['early','late']){
    const wi=gcs.findIndex(g=>g.timing===timing),wl=wi>=0?gcs[wi]:null;
    const actions=[{kind:'water',icon:wl?.water||'water',action:wl?(personal?(wl.water?wlAction(wl.water,wl.truth):(wl.truth?'stack':null)):globalWLAction(wl.truth)):null,source:wi>=0?wi+1:null,mode:personal?'personal':'party'}];
    gcs.forEach((g,i)=>{if(accelTiming(g,i+1)===timing)actions.push({kind:'accel',icon:'accel',action:accelAction(g.truth),source:i+1});});
    rows.push({type:'water',timing,actions});
    const gi=timing==='early'?0:1,g=gcs[gi];
    rows.push({type:'gaze',timing,actions:[{kind:'gaze',icon:'gaze',action:gazeAction(g.truth),source:gi+1,center:g.gaze}]});
    const element=timing==='early'?'fire':'wave',ci=elements.indexOf(element);
    rows.push({type:'chaos',timing,actions:[{kind:'chaos',icon:element,action:ci>=0?chaosAction(element,gcs[ci].chaos):null,source:ci>=0?ci+1:null}]});
  }
  const buffOwner=gcs.findIndex(g=>g.gaze||accelTiming(g));
  const untimed=gcs.flatMap((g,i)=>(buffOwner<0||buffOwner===i)&&accelTiming(g)===null?[{kind:'accel',icon:'accel',action:accelAction(g.truth),source:i+1}]:[]);
  return {rows,untimed,complete:rows.every(r=>r.actions.every(a=>!!a.action))&&untimed.length===0};
}

// Simple mode ignores personal debuffs without changing the detailed inputs.
export function simpleTimeline(state,accelOwner=null){
  const projected={...state};
  for(const gc of ['gc1','gc2'])projected[gc]={...state[gc],water:null,gaze:false,accel:null};
  const route=timeline(projected);
  const source=['gc1','gc2'].includes(accelOwner)?accelOwner:null;
  route.untimed=[{kind:'accel',icon:'accel',action:source?accelAction(state[source].truth):null,source:source==='gc1'?1:source==='gc2'?2:null}];
  route.complete=route.rows.every(r=>r.actions.every(a=>!!a.action))&&!!route.untimed[0].action;
  return route;
}

// The latest selection owns its cross-GC group. Gaze and Accel may coexist in that GC.
export function select(state,gc,field,value){
  if(field==='timing'){setTiming(state,gc,value);return;}
  const other=state[gc==='gc1'?'gc2':'gc1'];
  const current=state[gc];
  current[field]=field==='gaze'?!current.gaze:current[field]===value?null:value;
  if(field==='gaze')current.accel=current.gaze?(gc==='gc1'?'early':'late'):null;
  if(field==='accel')current.gaze=current.accel===(gc==='gc1'?'early':'late');
  if(field==='water'&&current.water){other.water=null;current.gaze=false;current.accel=null;}
  if((field==='gaze'&&current.gaze)||(field==='accel'&&current.accel)){current.water=null;other.gaze=false;other.accel=null;}
}

// The supplied truth table is XNOR: matching truth values resolve True.
export function combineTruth(charge,out){
  if(!['true','fake'].includes(charge)||!['true','fake'].includes(out))return null;
  return charge===out?'true':'fake';
}
export function selectMagic(state,stage,element,value){
  if(!['charge','out'].includes(stage)||!['ice','thunder'].includes(element)||!['true','fake'].includes(value))return;
  state.magic[stage][element]=state.magic[stage][element]===value?null:value;
}
export function magicResult(magic){
  const ice=combineTruth(magic?.charge?.ice,magic?.out?.ice);
  const thunder=combineTruth(magic?.charge?.thunder,magic?.out?.thunder);
  const safe=ice&&thunder?(ice==='true'?(thunder==='true'?'avoidBoth':'inThunder'):(thunder==='true'?'inIce':'inBoth')):null;
  return {ice,thunder,safe,complete:!!safe};
}
