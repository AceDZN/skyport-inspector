/** Native authored-input observer checks; not browser, unlock or completion evidence. */
import test,{before}from'node:test';import assert from'node:assert/strict';
import {initializePhysics,CoreWorld}from'../src/core/world';import {draftEventLevels}from'../src/core/levels/events';
import{ReferenceRoute}from'./helpers/reference-route';import{V}from'../src/physics';import{ChamberBuilder}from'../src/core/level-kit';import type{CoreLevel}from'../src/core/level';
import type{JournalConfig}from'../src/core/machine-journal';
before(initializePhysics);
const config:JournalConfig={watch:[{id:'gate-a',label:'A',kind:'shutter'},{id:'gate-b',label:'B',kind:'shutter'}],tests:[{control:'test-power',label:'TEST',watch:['gate-a','gate-b']}]};
const definition=()=>({...draftEventLevels.find(l=>l.number===26)!,journal:config});
function testStation(r:ReferenceRoute){r.shot(0,'test-source',V(.55,1.55,13.985));r.shot(1,'test-waiting',V(.55,1.55,4.665));r.walk(.55,12.7);r.enter(0);r.walk(2.5,7.4);}
test('native TEST journal observes full A opening, closed B interval and separate actual NOW',()=>{
 const r=new ReferenceRoute(26,false,'journal-test-observations',definition());let error:unknown;try{
  assert.equal(r.w.journal!.snapshot().rows.length,0);testStation(r);r.control('test-power');assert.equal(r.w.journal!.snapshot().rows.some(e=>e.text==='A opened fully.'),false,'Start cue is not a full opening');
  r.until(()=>r.w.journal!.snapshot().now.find(x=>x.id==='gate-a')?.state==='OPEN',3,'Observer did not see actual full opening');r.tick(.2);r.control('test-power');
  r.until(()=>r.w.journal!.snapshot().now.every(x=>x.state==='CLOSED'),3,'Observer did not see actual full closure');const journal=r.w.journal!.snapshot();
  assert.equal(journal.truncated,false);assert.equal(journal.tests[0].status,'ENDED');assert.deepEqual(journal.tests[0].observations,[{label:'A',opened:'YES',remainedClosed:'NO'},{label:'B',opened:'NO',remainedClosed:'YES'}]);assert.equal(journal.rows.filter(x=>x.text==='A opened fully.').length,1);assert.equal(journal.rows.filter(x=>x.text==='A closed fully.').length,1);r.note('actual-complete-test-history-with-both-now-closed');
 }catch(e){error=e;throw e;}finally{r.dispose(error);}
});
test('native retry clears history and negative coverage while preserving actual open machinery',()=>{
 const r=new ReferenceRoute(26,false,'journal-retry-baseline',definition());let error:unknown;try{testStation(r);r.control('test-power');r.until(()=>r.w.journal!.snapshot().now[0].state==='OPEN',3,'No actual open pose');r.w.respawn();const journal=r.w.journal!.snapshot();assert.equal(journal.rows.length,0);assert.equal(journal.now[0].state,'OPEN');assert.equal(journal.tests[0].observations[1].remainedClosed,'UNKNOWN');assert.equal(journal.tests[0].observations[0].opened,'UNKNOWN','Already-open baseline cannot invent an opening during the new attempt');assert.equal(journal.attempt,2);r.note('explicit-retry-observer-contract-not-a-completion');}catch(e){error=e;throw e;}finally{r.dispose(error);}
});
test('journal observes the same native input without changing machinery, bodies, rays or audio events',()=>{
 const plain=new ReferenceRoute(26,false,'observer-disabled',{...draftEventLevels.find(l=>l.number===26)!,journal:undefined}),observed=new ReferenceRoute(26,false,'observer-enabled',definition());try{
  for(const r of [plain,observed]){testStation(r);r.control('test-power');r.tick(1.2);r.control('test-power');r.tick(1.2);}
  const a=plain.w.snapshot(),b=observed.w.snapshot();assert.deepEqual(a.player,b.player);assert.deepEqual(a.crates,b.crates);assert.deepEqual(a.devices,b.devices);assert.deepEqual(a.beams,b.beams);assert.deepEqual(a.signals,b.signals);assert.deepEqual(plain.events,observed.events);
 }finally{plain.w.dispose();observed.w.dispose();}
});
test('native deck journal records stopped arrival, never the selection or passing destination',()=>{
 const level:CoreLevel={number:1,name:'Native observer fixture',mission:'Observer contract',he:'',chapter:'test',architecture:{height:7,halfWidth:7,style:'graphite'},sources:[],journal:{watch:[{id:'deck',label:'DECK',kind:'dock'}]},blueprint:()=>{const b=new ChamberBuilder();b.world.spawn=[0,.87,2.8];b.floor('floor',-7,7,-7,7);b.device({id:'deck',kind:'lift',label:'DECK',position:[0,-.2,0],size:[4,.4,4],target:[0,2.6,0],stops:[{label:'BASE',position:[0,-.2,0]},{label:'TRANSFER',position:[0,2.6,0]}],controlOffset:[1.3,.9,1.3],controlFacing:[0,0,1]});return b.finish();}};
 const r=new ReferenceRoute(1,false,'native-dock-observer',level);try{assert.equal(r.w.journal!.snapshot().rows.length,0);r.control('deck');assert.equal(r.w.journal!.snapshot().rows.length,0);r.until(()=>r.w.journal!.snapshot().now[0].state==='AT TRANSFER',4,'No native stopped TRANSFER observation');assert.equal(r.w.journal!.snapshot().rows[0].text,'DECK arrived at TRANSFER.');r.tick(.2);assert.equal(r.w.journal!.snapshot().rows.length,1);}finally{r.w.dispose();}
});
