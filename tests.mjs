import assert from 'node:assert/strict';
import {resolveLanguage} from './dist/i18n.js';
import {blank,timeline,select,setTiming,wlAction,globalWLAction,accelTiming,combineTruth,selectMagic,magicResult,normalizeBuffs} from './dist/mechanics.js';

for(const [saved,preferred,expected]of [
 ['ja',['zh-TW'],'ja'],['en',['ja-JP'],'en'],['zh',['en-US'],'zh'],
 [null,['zh-Hant-TW'],'zh'],[null,['zh-CN'],'zh'],[null,['ja-JP'],'ja'],
 [null,['en-GB'],'en'],[null,['fr-FR','ja-JP','en-US'],'ja'],
 ['invalid',['JA-jp'],'ja'],['__proto__',['zh-TW'],'zh'],
 [null,['fr-FR'],'en'],[null,[],'en']
])assert.equal(resolveLanguage(saved,preferred),expected);
console.log('Language preference, browser locale matching and English fallback passed.');

const s=blank();
select(s,'gc1','water','water');select(s,'gc2','water','thunder');
assert.equal(s.gc1.water,null);assert.equal(s.gc2.water,'thunder');
select(s,'gc1','water','thunder');assert.equal(s.gc2.water,null);
select(s,'gc1','water','thunder');assert.equal(s.gc1.water,null);

select(s,'gc1','gaze',true);
assert.equal(accelTiming(s.gc1),'early','GC1 gaze must select Short Accel');
select(s,'gc1','accel','late');
assert.equal(s.gc1.gaze,false);assert.equal(accelTiming(s.gc1),'late');
select(s,'gc1','gaze',true);
assert.equal(accelTiming(s.gc1),'early','Reselecting gaze must replace conflicting Long Accel');
select(s,'gc1','gaze',true);
assert.equal(s.gc1.gaze,false);assert.equal(s.gc1.accel,null,'Removing gaze must clear matching acceleration');
select(s,'gc2','gaze',true);
assert.equal(accelTiming(s.gc2),'late','GC2 gaze must select Long Accel');
assert.equal(s.gc1.accel,null);assert.equal(s.gc1.gaze,false);
select(s,'gc2','accel','early');
assert.equal(s.gc2.gaze,false);
select(s,'gc1','accel','late');
assert.equal(s.gc2.gaze,false);assert.equal(s.gc2.accel,null);
assert.equal(accelTiming(s.gc1),'late');
select(s,'gc1','accel','early');
assert.equal(accelTiming(s.gc1),'early','Short/Long must be a single-click selection');
assert.equal(s.gc1.gaze,true,'GC1 Short Accel must select Gaze');
select(s,'gc1','accel','early');assert.equal(s.gc1.accel,null);

const initial=blank();initial.gc1.truth='true';initial.gc2.truth='fake';
let route=timeline(initial);
assert.deepEqual(route.untimed.map(x=>x.action),['stop','move']);
assert.equal(route.rows[1].actions[0].action,'away');
assert.equal(route.rows[4].actions[0].action,'in');
select(initial,'gc1','gaze',true);
assert.equal(timeline(initial).untimed.length,0);
assert.equal(timeline(initial).rows[0].actions.find(x=>x.kind==='accel').action,'stop');
assert.equal(timeline(initial).rows[1].actions[0].center,true);
select(initial,'gc1','accel','late');
route=timeline(initial);
assert.equal(route.untimed.length,0);
assert.equal(route.rows[0].actions.filter(x=>x.kind==='accel').length,0);
assert.equal(route.rows[3].actions.find(x=>x.kind==='accel').action,'stop');

// The matching gaze/acceleration pair is cleared together.
const preset=blank();
select(preset,'gc1','accel','late');select(preset,'gc1','gaze',true);
assert.equal(preset.gc1.accel,'early');
select(preset,'gc1','accel','early');assert.equal(preset.gc1.accel,null);
assert.equal(preset.gc1.gaze,false);assert.deepEqual(timeline(preset).untimed.map(x=>x.source),[1,2]);

const timing=blank();setTiming(timing,'gc1','early');assert.equal(timing.gc2.timing,'late');
setTiming(timing,'gc2','early');assert.equal(timing.gc1.timing,'late');
setTiming(timing,'gc2','early');assert.equal(timing.gc1.timing,null);

let configurations=0,transitions=0;
const waterChoices=[null,['gc1','water'],['gc1','thunder'],['gc2','water'],['gc2','thunder']];
const buffChoices=[null,...['gc1','gc2'].flatMap(gc=>[[gc,false,gc==='gc1'?'late':'early'],[gc,true,gc==='gc1'?'early':'late']])];
const actions=['gc1','gc2'].flatMap(gc=>[['water','water'],['water','thunder'],['gaze',true],['accel','early'],['accel','late']].map(([field,value])=>[gc,field,value]));
function invariant(state){
 assert.ok(!(state.gc1.water&&state.gc2.water),'Water group must have only one GC owner');
 assert.ok(!((state.gc1.gaze||state.gc1.accel)&&(state.gc2.gaze||state.gc2.accel)),'Gaze/Accel group must have only one GC owner');
 for(const gc of ['gc1','gc2'])assert.ok(!(state[gc].gaze&&state[gc].accel&&state[gc].accel!==(gc==='gc1'?'early':'late')),'Gaze must not coexist with opposite acceleration');
 for(const gc of ['gc1','gc2']){assert.ok(!(state[gc].water&&(state[gc].gaze||state[gc].accel)),'Water/Thunder excludes Gaze/Accel within the same GC');assert.equal(state[gc].gaze,state[gc].accel===(gc==='gc1'?'early':'late'),'Matching gaze and acceleration must be selected together');}
}
for(const truth1 of ['true','fake'])for(const truth2 of ['true','fake'])for(const chaos1 of ['true','fake'])for(const chaos2 of ['true','fake'])for(const water of waterChoices)for(const buff of buffChoices)for(const early of ['early','late'])for(const element of ['fire','wave']){
 if(water&&buff&&water[0]===buff[0])continue;
 const state=blank();
 Object.assign(state.gc1,{truth:truth1,chaos:chaos1,element});Object.assign(state.gc2,{truth:truth2,chaos:chaos2});
 setTiming(state,'gc1',early);
 if(water)select(state,water[0],'water',water[1]);
 if(buff){
  if(buff[1])select(state,buff[0],'gaze',true);
  if(state[buff[0]].accel!==buff[2])select(state,buff[0],'accel',buff[2]||state[buff[0]].accel);
  if(state[buff[0]].gaze!==buff[1])select(state,buff[0],'gaze',true);
 }
 invariant(state);
 const current=timeline(state);
 for(const [i,g]of[state.gc1,state.gc2].entries()){
  const result=current.rows[g.timing==='early'?0:3].actions[0];
  assert.equal(result.action,water?(g.water?wlAction(g.water,g.truth):'stack'):globalWLAction(g.truth));
  assert.equal(result.mode,water?'personal':'party');
  assert.equal(current.rows[i===0?1:4].actions[0].center,g.gaze);
  assert.equal(accelTiming(g),g.accel);
 }
 const accel=current.rows.flatMap(r=>r.actions).filter(a=>a.kind==='accel');
 assert.equal(accel.length,buff?.[2]?1:0);
 if(accel.length)assert.equal(accel[0].source,buff[0]==='gc1'?1:2);
 for(const args of actions){const copy=structuredClone(state);select(copy,...args);invariant(copy);transitions++;}
 configurations++;
}
console.log('Passed '+configurations+' valid configurations and '+transitions+' selection transitions; gaze presets, manual overrides, mutual exclusion, and timing sync regressions.');

// Acceleration -> Gaze presets are bidirectional for the matching round.
for(const [gc,timing]of [['gc1','early'],['gc2','late']]){
 const state=blank();select(state,gc,'accel',timing);assert.equal(state[gc].gaze,true);
 const other=gc==='gc1'?'gc2':'gc1';assert.equal(state[other].gaze,false);assert.equal(state[other].accel,null);
}
assert.equal(combineTruth('true','true'),'true');assert.equal(combineTruth('true','fake'),'fake');
assert.equal(combineTruth('fake','true'),'fake');assert.equal(combineTruth('fake','fake'),'true');
const zones={};let magicCases=0;
for(const ci of ['true','fake'])for(const ct of ['true','fake'])for(const oi of ['true','fake'])for(const ot of ['true','fake']){
 const state=blank();
 for(const [stage,element,value]of [['charge','ice',ci],['charge','thunder',ct],['out','ice',oi],['out','thunder',ot]])selectMagic(state,stage,element,value);
 const result=magicResult(state.magic);const ice=ci===oi,thunder=ct===ot;
 assert.equal(result.ice,ice?'true':'fake');assert.equal(result.thunder,thunder?'true':'fake');
 const expected=ice?(thunder?'avoidBoth':'inThunder'):(thunder?'inIce':'inBoth');
 assert.equal(result.safe,expected);assert.equal(result.complete,true);zones[expected]=(zones[expected]||0)+1;magicCases++;
 const gcBefore=JSON.stringify([state.gc1,state.gc2]);selectMagic(state,'charge','ice',ci);assert.equal(state.magic.charge.ice,null);assert.equal(magicResult(state.magic).safe,null);assert.equal(JSON.stringify([state.gc1,state.gc2]),gcBefore);
}
assert.deepEqual(zones,{avoidBoth:4,inThunder:4,inIce:4,inBoth:4});
let partial=0;
for(const ci of [null,'true','fake'])for(const ct of [null,'true','fake'])for(const oi of [null,'true','fake'])for(const ot of [null,'true','fake']){
 const result=magicResult({charge:{ice:ci,thunder:ct},out:{ice:oi,thunder:ot}});
 if([ci,ct,oi,ot].includes(null)){assert.equal(result.safe,null);assert.equal(result.complete,false);partial++;}
}
console.log('Passed '+magicCases+' Mana Release truth-table combinations and '+partial+' incomplete configurations; reverse gaze links and magic input isolation passed.');

// Switching between party and personal mode affects both GCs without inventing a debuff.
const personal=blank();setTiming(personal,'gc1','early');personal.gc1.truth='true';personal.gc2.truth='fake';
select(personal,'gc1','water','thunder');
assert.deepEqual([0,3].map(i=>timeline(personal).rows[i].actions[0].action),['spread','stack']);
select(personal,'gc1','water','thunder');
assert.deepEqual([0,3].map(i=>timeline(personal).rows[i].actions[0].mode),['party','party']);
personal.gc2.truth=null;select(personal,'gc1','water','water');
assert.equal(timeline(personal).rows[3].actions[0].action,null,'Missing truth must not guess a personal action');

// Opposite Accel clears Gaze in either GC, and Gaze selects its matching timing again.
for(const [gc,matching,opposite]of [['gc1','early','late'],['gc2','late','early']]){
 const state=blank();select(state,gc,'gaze',true);select(state,gc,'accel',opposite);
 assert.equal(state[gc].gaze,false);assert.equal(state[gc].accel,opposite);
 select(state,gc,'gaze',true);assert.equal(state[gc].gaze,true);assert.equal(state[gc].accel,matching);
 const old=blank();Object.assign(old[gc],{gaze:true,accel:opposite});normalizeBuffs(old);
 assert.equal(old[gc].gaze,false);assert.equal(old[gc].accel,opposite);
 const valid=structuredClone(state);normalizeBuffs(valid);assert.deepEqual(valid,state);
}
console.log('Opposite Accel exclusion and saved-state conflict cleanup passed for both GCs.');

for(const [gc,matching]of [['gc1','early'],['gc2','late']]){
 for(const cancel of ['gaze','accel']){
  const state=blank();select(state,gc,'gaze',true);select(state,gc,cancel,cancel==='gaze'?true:matching);
  assert.equal(state[gc].gaze,false);assert.equal(state[gc].accel,null,'Canceling either linked choice clears both');
 }
 for(const water of ['water','thunder'])for(const field of ['gaze','accel']){
  const state=blank();select(state,gc,'water',water);select(state,gc,field,field==='gaze'?true:matching);
  assert.equal(state[gc].water,null);assert.equal(state[gc].gaze,true);assert.equal(state[gc].accel,matching);
  select(state,gc,'water',water);assert.equal(state[gc].gaze,false);assert.equal(state[gc].accel,null);assert.equal(state[gc].water,water);
 }
 const old=blank();Object.assign(old[gc],{water:'water',gaze:true,accel:matching});normalizeBuffs(old);invariant(old);
}
console.log('Linked cancellation and same-GC Water/Thunder vs Gaze/Accel exclusions passed in both directions.');
