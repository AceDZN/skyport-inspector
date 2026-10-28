/** Opt-in author contracts, not renderer/mouse/English-learning completion proof. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {initializePhysics} from '../src/core/world';
import {ReportedRoute,reportedRoute,reportForward} from './helpers/reported-46-48-route';
import {V} from '../src/physics';
const enabled=process.env.RIFT_REPORTED_ROUTES==='1';
const contract=(name:string,fn:()=>void)=>test(name,{skip:!enabled},fn);
before(async()=>{if(enabled)await initializePhysics();});

contract('native C46 source change keeps both physical alternatives and low access identical',()=>{
 const a=new ReportedRoute(46),b=new ReportedRoute(46,true);try{
  assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.equal(a.w.level.expectedExit,'higher-exit');assert.equal(b.w.level.expectedExit,'lower-exit');
  assert.equal(a.w.surfaces.filter(s=>s.id.startsWith('observation-')).length,2);
  assert.ok(a.w.surfaces.filter(s=>s.id.startsWith('observation-')).every(s=>s.center.y+s.height/2<=3.51));
  assert.equal(a.w.blueprint.cargo.length,0);assert.equal(a.w.blueprint.devices.length,2);
 }finally{a.w.dispose();b.w.dispose();}
});
contract('native C46 reported HIGH walking pair then reconfiguration genuinely reaches upper platform',()=>reportedRoute(46,false,'46-high-upper',r=>{
 r.observation();r.setup(true);r.landed(r.flight(),'higher-gallery');r.finish('higher-exit');assert.ok(r.w.player.crossings>=2);
}));
contract('native C46 reported LOW same hardware shallow fling reaches lower platform',()=>reportedRoute(46,true,'46-low-lower',r=>{
 r.observation();r.setup(false);r.landed(r.flight(),'lower-gallery');r.finish('lower-exit');
}));
contract('native C46 wrong actual LOW destination returns through basin and corrects to HIGH',()=>reportedRoute(46,false,'46-wrong-low-basin-high',r=>{
 r.observation();r.setup(false);r.landed(r.flight(),'lower-gallery');r.walk(33,-6);
 assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'&&e.exit==='lower-exit'));r.note('actual-wrong-low-vestibule');
 r.walk(8,-6);r.walk(8,-.5);r.tick(2);assert.ok(r.w.player.grounded&&r.w.player.pos.y< -21,'Actual lower-gallery edge must fall safely to the basin');
 r.recover();r.setup(true);r.landed(r.flight(),'higher-gallery');r.finish('higher-exit');
}));
contract('native C46 portal colour reversal is an equivalent walking and launch configuration',()=>reportedRoute(46,false,'46-equivalent-reversed-colours',r=>{
 r.observation(true);r.setup(true,true);r.landed(r.flight(0),'higher-gallery');r.finish('higher-exit');
}));
contract('native C46 a missed deep aperture uses real bottom opening and return elevator without reset',()=>reportedRoute(46,false,'46-missed-deep-bottom-recovery',r=>{
 r.observation();r.setup(true);const before=r.w.player.crossings;r.walk(4.2,6.45);r.w.yaw=0;r.w.pitch=0;
 r.until(()=>r.w.player.grounded&&r.w.player.pos.y< -16,3,'Actual offset fall did not reach the deep floor',reportForward);
 assert.equal(r.w.player.crossings,before);assert.ok(Math.abs(r.w.player.pos.y+17.135)<.08);
 r.walk(4.2,-5.2);r.tick(1.5);assert.ok(r.w.player.grounded&&r.w.player.pos.y< -21,'Actual bottom opening never reaches basin');
 r.recover();r.setup(true);r.landed(r.flight(),'higher-gallery');r.finish('higher-exit');
}));

function toolsPair(r:ReportedRoute){
 r.shot(0,'listener-source',V(0,1.55,13.985));r.shot(1,'listener-return',V(.55,1.55,4.915));
 const surface=r.w.surfaces.find(s=>s.id==='listener-return')!;
 assert.ok(r.w.portals[1]!.center.distanceTo(V(.55,1.55,4.915).addScaledVector(surface.normal,.025))<.001,'Use actual +normal placement, not the earlier wrong-sign estimate');
 r.note('actual-tools-pair-configured-unheld');
}
function toolsPickup(r:ReportedRoute,id:string,side:'west'|'east'='west'){r.walk(id==='listener-cube-a'?-4:4,12.8);r.pickup(id);r.walk(0,12.7);r.enter(0);clearToolsReturn(r,side);assert.ok(r.cube(id).crossings>0,'Actual carried cube never crossed the tools pair');}
function clearToolsReturn(r:ReportedRoute,side:'west'|'east'){
 r.walk(.55,5.7);r.walk(side==='west'?-3.5:3.5,5.7);
 assert.ok(r.w.player.grounded&&Math.abs(r.w.player.pos.y-.865)<.06);r.note('actual-normal-depth-then-turn-'+side);
}
function returnToTools(r:ReportedRoute){r.walk(-6.8,7.2);r.walk(.55,7.2);r.walk(.55,6.4);r.enter(1);assert.ok(r.w.player.pos.z>8.4,'Actual tools return missed its original bay');}
function entrySupplies(r:ReportedRoute,swap=false){
 const support=swap?'listener-cube-b':'listener-cube-a',delivery=swap?'listener-cube-a':'listener-cube-b';
 toolsPair(r);toolsPickup(r,support);r.dropPad(support,'listener-access',-6.8,6);
 returnToTools(r);toolsPickup(r,delivery,'east');r.walk(3.5,2);r.walk(-5,2);r.until(()=>r.device('listener-entry-hatch').progress>.99,2,'ACCESS never fully clears the actual walking hatch');
 r.walk(-5,-2);r.dropPad(delivery,'listener-entry-receipt',-6.8,-4);assert.equal(r.pad('listener-access').crateId,support);
 r.note('actual-independent-walking-hatch-and-bay-supplies');
}
function entryExit(r:ReportedRoute){r.until(()=>r.device('entry-door').progress>.99,2,'Current ACCESS and receipt never clear ENTRY exit');r.walk(-8.5,-4);r.walk(-10,-7);r.finish('entry-exit');assert.equal(r.w.campaignResult?.goalMatched,true);assert.equal(r.events.some(e=>e.type==='jump'),false);}
function lowReceipt(r:ReportedRoute,id:string){
 assert.equal(r.w.heldId,id);r.walk(5,3);r.w.yaw=0;r.w.pitch=-.20;
 r.inputs.push({type:'ordinary-low-aim-forward-to-cargo-window',pitch:-.20,targetZ:1});
 r.until(()=>r.w.player.pos.z<=1,3,'Actual low carried window approach blocked',reportForward);r.tick(.5);r.e();r.tick(1);
 assert.equal(r.w.heldId,undefined);assert.equal(r.pad('listener-freight-receipt').crateId,id,'Actual low-window release never reaches FREIGHT pressure');
 for(let i=0;i<240;i++){r.step();assert.equal(r.pad('listener-freight-receipt').crateId,id,'Cargo must retain all240 frames of actual receipt');}
 r.note('actual-low-window-delivery-and-current-stair-supply');
}
function retrieveLowReceipt(r:ReportedRoute,id:string){
 r.walk(5,1.2);r.pickup(id);r.w.yaw=0;r.w.pitch=-.20;
 r.inputs.push({type:'ordinary-S-while-keeping-cube-low',targetZ:3});
 r.until(()=>r.w.player.pos.z>=3,4,'Actual low cube cannot be backed out of the same window',{forward:-1,strafe:0,jump:false});
 assert.equal(r.pad('listener-freight-receipt').pressed,false);r.note('actual-window-regrasp-and-low-backward-return');
}
function freightExit(r:ReportedRoute){
 r.walk(5,3);r.walk(8.2,7.7);r.walk(10.5,7.7);r.until(()=>r.device('listener-stair-gate').progress>.99,2,'Real receipt never clears separate stair gate');
 r.walk(10.5,-.7);assert.ok(r.w.player.grounded&&Math.abs(r.w.player.pos.y-3.265)<.06,'Actual twelve-tread route never reaches upper landing');
 r.walk(10.5,-7);r.until(()=>r.device('freight-door').progress>.99,2,'Real receipt never clears upper freight exit');r.finish('freight-exit');assert.equal(r.w.campaignResult?.goalMatched,true);assert.equal(r.events.some(e=>e.type==='jump'),false);
}

contract('native C47 reported source retains identical real bays interchangeable cargo and row stair cuts',()=>{
 const a=new ReportedRoute(47),b=new ReportedRoute(47,true);try{
  assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.equal(a.w.crates.length,2);assert.ok(a.w.crates.every(c=>Math.abs(c.rigid.mass()-12)<.001));
  assert.ok(a.w.pads.every(p=>!p.pressed));assert.ok(a.w.surfaces.every(s=>s.center.z>4&&s.center.y+s.height/2<=3.51));
  assert.equal(a.device('listener-entry-hatch').progress,0);assert.equal(a.device('listener-stair-gate').progress,0);
  const header=a.w.solids.find(s=>s.id==='listener-stair-row-header')!;assert.ok(Math.abs(header.min.y-5.4)<1e-9);
 }finally{a.w.dispose();b.w.dispose();}
});
contract('native C47 ENTRY maintains walking hatch while independent delivered cargo powers its actual bay exit',()=>reportedRoute(47,false,'47-entry-two-supplies',r=>{entrySupplies(r);entryExit(r);}));
contract('native C47 FREIGHT sends actual cargo through low window then uses its separate stairs',()=>reportedRoute(47,true,'47-freight-low-window-stairs',r=>{toolsPair(r);toolsPickup(r,'listener-cube-a','east');lowReceipt(r,'listener-cube-a');freightExit(r);assert.equal(r.pad('listener-access').pressed,false);}));
contract('native C47 wrong FREIGHT destination returns by actual stairs and reallocates to ENTRY',()=>reportedRoute(47,false,'47-wrong-freight-return-entry',r=>{
 toolsPair(r);toolsPickup(r,'listener-cube-a','east');lowReceipt(r,'listener-cube-a');
 r.walk(8.2,7.7);r.walk(10.5,7.7);r.until(()=>r.device('listener-stair-gate').progress>.99,2,'Wrong-route stair supply absent');r.walk(10.5,-7);r.walk(15,-7);
 assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'&&e.exit==='freight-exit'));r.note('actual-wrong-freight-upper-vestibule');
 r.walk(10.5,-7);r.walk(10.5,7.7);r.walk(8.2,7.7);r.walk(5,2);retrieveLowReceipt(r,'listener-cube-a');
 r.walk(3.5,5.7);r.walk(-3.5,5.7);r.dropPad('listener-cube-a','listener-access',-6.8,6);
 returnToTools(r);toolsPickup(r,'listener-cube-b','east');r.walk(3.5,2);r.walk(-5,2);r.walk(-5,-2);r.dropPad('listener-cube-b','listener-entry-receipt',-6.8,-4);entryExit(r);
}));
contract('native C47 compatible cargo assignments may be swapped without an identity goal',()=>reportedRoute(47,false,'47-equivalent-swapped-cargo',r=>{entrySupplies(r,true);assert.equal(r.pad('listener-access').crateId,'listener-cube-b');assert.equal(r.pad('listener-entry-receipt').crateId,'listener-cube-a');entryExit(r);}));
contract('native C47 ACCESS removal physically closes hatch and exit before replacement recovers',()=>reportedRoute(47,false,'47-maintained-access-removal-recovery',r=>{
 entrySupplies(r);r.walk(-8.5,-4);r.walk(-8.5,-2);r.walk(-5,-2);r.walk(-5,3);r.walk(-6.8,6);r.pickup('listener-cube-a');
 r.walk(-8.5,7.2);r.until(()=>!r.pad('listener-access').pressed&&r.device('listener-entry-hatch').progress<.01&&r.device('entry-door').progress<.01,3,'Actual supply removal never closes both ENTRY leaves');
 assert.equal(r.pad('listener-entry-receipt').crateId,'listener-cube-b');r.note('actual-ACCESS-loss-independent-receipt-persists');
 r.dropPad('listener-cube-a','listener-access',-6.8,6);r.walk(-6.8,7.2);r.walk(-3.5,7.2);r.walk(-3.5,5.7);r.walk(-5,2);r.walk(-5,-2);entryExit(r);
}));
contract('native C47 whole upright body cannot use cargo window and receipt can be retrieved then restored',()=>reportedRoute(47,true,'47-body-window-exclusion-and-receipt-recovery',r=>{
 toolsPair(r);r.walk(0,12.7);r.enter(0);clearToolsReturn(r,'east');r.walk(5,2);r.w.yaw=0;r.w.pitch=0;
 r.until(()=>r.contacts().some(c=>c.id==='listener-cargo-header'),3,'Body did not actually reach the low header',reportForward);
 assert.ok(r.w.player.grounded&&r.w.player.pos.z>.6+r.w.player.half.z-.05,'The upright body passes or becomes embedded in the cargo-only port');
 assert.equal(r.pad('listener-freight-receipt').pressed,false);assert.ok(r.device('listener-stair-gate').progress<.01);r.note('actual-body-blocked-by-low-header-no-receipt');
 r.walk(5,2);r.walk(3.5,7.2);r.walk(.55,7.2);r.walk(.55,6.4);r.enter(1);toolsPickup(r,'listener-cube-a','east');lowReceipt(r,'listener-cube-a');
 retrieveLowReceipt(r,'listener-cube-a');r.until(()=>r.device('listener-stair-gate').progress<.01&&r.device('freight-door').progress<.01,3,'Actual low receipt loss never closes FREIGHT leaves');
 lowReceipt(r,'listener-cube-a');freightExit(r);
}));

function questionEntry(r:ReportedRoute,side:'west'|'east'){
 r.shot(0,'question-source',V(0,1.55,13.985));r.shot(1,'question-return',V(.55,1.55,5.215));r.walk(0,12.7);r.enter(0);
 r.walk(.55,6.2);r.walk(side==='west'?-3.8:3.8,6.2);r.walk(side==='west'?-3.8:2.2,2);r.note('actual-control-booth-access-'+side);
}
function callLoading(r:ReportedRoute){
 r.walk(-1.3,-4);r.control('question-call-loading');assert.equal(r.device('question-freight-lift').choice,1);
 r.until(()=>r.w.machines.flags['at:question-freight-lift:LOADING']&&r.device('question-loading-door').progress>.99,14,'Actual LOADING arrival/leaf never clears');
 r.walk(-1.3,-5.2);r.walk(-3.2,-5.2);r.walk(-3.2,-4);r.walk(-6,-4);r.note('actual-loading-apron-and-well-boarding');
}
function freightVisit(r:ReportedRoute){
 callLoading(r);r.control('question-freight-lift');
 r.until(()=>r.w.machines.flags['at:question-freight-lift:GALLERY']&&r.device('question-gallery-dock').progress>.99&&r.w.player.grounded&&r.w.player.pos.y>6.4,14,'Actual freight ride never reaches stopped gallery');
 assert.ok((r.ridingFrames.get('question-freight-lift')??0)>120);r.walk(-8.8,-4);r.walk(-9,-5.8);r.walk(-12,-5.8);r.walk(-12,-4);r.walk(-17,-4);r.note('actual-freight-upper-vestibule');
}
function freightReturn(r:ReportedRoute){
 r.walk(-12,-4);r.walk(-12,-5.8);r.walk(-8.8,-5.8);r.walk(-8.8,-4);r.control('question-call-gallery');
 r.until(()=>r.w.machines.flags['at:question-freight-lift:GALLERY']&&r.device('question-gallery-dock').progress>.99,14,'Actual gallery recall cannot recover wrong route');r.walk(-6,-4);r.control('question-freight-lift');
 r.until(()=>r.w.machines.flags['at:question-freight-lift:LOADING']&&r.device('question-loading-door').progress>.99&&r.w.player.grounded&&r.w.player.pos.y<1,14,'Actual wrong upper route never returns to Loading');
 r.walk(-3.2,-4);r.walk(-3.2,-5.2);r.walk(-1.3,-5.2);r.walk(-1.3,-4);r.note('actual-freight-return-around-fixed-call-post');
}
function parkService(r:ReportedRoute){
 r.walk(2.2,-4);r.control('question-call-crossing');
 r.until(()=>r.w.machines.flags['at:question-service-deck:CROSSING']&&r.device('question-service-near-dock').progress>.99&&r.device('question-service-far-dock').progress>.99,14,'Actual service deck never parks at Crossing');
 r.note('actual-service-parked-from-fixed-bank');
}
function serviceNearDoor(r:ReportedRoute){r.walk(2.2,-6.8);r.walk(4.8,-6.8);r.walk(4.8,-4);}
function serviceVisit(r:ReportedRoute){
 serviceNearDoor(r);r.walk(9,-4);r.walk(13,-4);r.walk(13,-5.2);r.walk(16,-5.2);r.walk(16,-4);r.walk(21,-4);r.note('actual-service-ground-vestibule');
}
function serviceReturn(r:ReportedRoute){
 r.walk(16,-4);r.walk(16,-5.2);r.walk(13,-5.2);r.walk(13,-4);r.walk(9,-4);r.walk(4.8,-4);r.walk(4.8,-6.8);r.walk(2.2,-6.8);r.walk(2.2,-4);r.note('actual-service-return-around-bank-posts');
}
function requested(r:ReportedRoute,id:string){assert.equal(r.w.campaignResult?.exit,id,r.detail());assert.equal(r.w.campaignResult?.goalMatched,true);assert.equal(r.w.respawns,0);assert.equal(r.events.some(e=>e.type==='jump'),false);}
function positiveVolume(r:ReportedRoute,min:ReturnType<typeof V>,max:ReturnType<typeof V>){return r.w.solids.filter(s=>Math.min(s.max.x,max.x)-Math.max(s.min.x,min.x)>1e-6&&Math.min(s.max.y,max.y)-Math.max(s.min.y,min.y)>1e-6&&Math.min(s.max.z,max.z)-Math.max(s.min.z,min.z)>1e-6).map(s=>s.id);}

contract('native C48 identical dry hardware has clear deck sweep and an actual cut freight well',()=>{
 const a=new ReportedRoute(48),b=new ReportedRoute(48,true);try{
  assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.equal(a.w.crates.length,0);assert.equal(a.w.pads.length,0);
  assert.equal(a.device('question-freight-lift').position.y,5.4);assert.equal(a.w.machines.flags['at:question-freight-lift:LOADING'],false);assert.equal(a.w.machines.flags['at:question-freight-lift:GALLERY'],true);
  assert.equal(a.w.machines.flags['at:question-service-deck:CROSSING'],false);assert.equal(a.w.machines.flags['at:question-service-deck:PARKED'],true);
  assert.ok(a.w.surfaces.every(s=>s.center.z>5&&s.center.y+s.height/2<=3.51));
  assert.deepEqual(positiveVolume(a,V(5.7,-.4,-6),V(12.3,0,7)),[],'The complete service slab sweep intersects static bank/glass/floor');
  assert.deepEqual(positiveVolume(a,V(-8,-.4,-6),V(-4,0,-2)),[],'A duplicate0m floor or shaft wall buries the lower freight deck');
  assert.ok(a.w.solids.filter(s=>s.id.startsWith('question-bank-glass')||s.id.startsWith('question-service-side')).every(s=>s.min.y>=0));
 }finally{a.w.dispose();b.w.dispose();}
});
contract('native C48 reported freight question calls absent LOADING then rides actual upper gallery',()=>reportedRoute(48,false,'48-freight-current-loading-gallery',r=>{questionEntry(r,'west');freightVisit(r);requested(r,'freight-exit');assert.equal(r.ridingFrames.get('question-service-deck')??0,0);}));
contract('native C48 service deck can be parked without riding and crossed on real support',()=>reportedRoute(48,true,'48-service-park-without-riding',r=>{
 questionEntry(r,'east');parkService(r);assert.equal(r.ridingFrames.get('question-service-deck')??0,0);serviceVisit(r);requested(r,'service-exit');assert.equal(r.ridingFrames.get('question-service-deck')??0,0);
}));
contract('native C48 wrong actual service crossing returns and corrects to freight gallery',()=>reportedRoute(48,false,'48-wrong-service-return-freight',r=>{
 questionEntry(r,'east');parkService(r);serviceVisit(r);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'&&e.exit==='service-exit'));
 serviceReturn(r);freightVisit(r);requested(r,'freight-exit');
}));
contract('native C48 wrong upper freight gallery recalls and descends before service correction',()=>reportedRoute(48,true,'48-wrong-freight-descend-service',r=>{
 questionEntry(r,'west');freightVisit(r);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'&&e.exit==='freight-exit'));
 freightReturn(r);parkService(r);serviceVisit(r);requested(r,'service-exit');
}));
contract('native C48 selected CROSSING is not support while real deck still travels',()=>reportedRoute(48,true,'48-selected-is-not-docked',r=>{
 questionEntry(r,'east');r.walk(2.2,-4);r.control('question-call-crossing');assert.equal(r.device('question-service-deck').choice,1);assert.equal(r.w.machines.flags['at:question-service-deck:CROSSING'],false);
 serviceNearDoor(r);assert.equal(r.w.machines.flags['at:question-service-deck:CROSSING'],false,'Premature-entry setup missed the actual travel interval');
 r.look(V(9,r.w.eye().y,-4));r.tick(.45,reportForward);assert.ok(r.contacts().some(c=>c.id==='question-service-near-dock'),'The actual closed dock must block early walking');
 assert.ok(r.w.player.pos.x<5.8&&r.w.player.grounded,'A selected target exposes unsupported gap');r.note('actual-closed-leaf-before-current-arrival');r.walk(4.8,-4);
 r.until(()=>r.w.machines.flags['at:question-service-deck:CROSSING']&&r.device('question-service-near-dock').progress>.99&&r.device('question-service-far-dock').progress>.99,14,'Real later arrival never restores crossing');
 r.walk(9,-4);r.walk(13,-4);r.walk(13,-5.2);r.walk(16,-5.2);r.walk(16,-4);r.walk(21,-4);requested(r,'service-exit');
}));
contract('native C48 a departed earlier arrival loses current support until real recall',()=>reportedRoute(48,true,'48-earlier-arrival-departure-recall',r=>{
 questionEntry(r,'east');parkService(r);r.walk(2.2,1);r.control('question-call-parked');r.until(()=>!r.w.machines.flags['at:question-service-deck:CROSSING']&&r.device('question-service-near-dock').progress<.01,3,'An earlier arrival incorrectly keeps the current leaf open');
 r.note('actual-departure-invalidates-old-current-dock');r.until(()=>r.w.machines.flags['at:question-service-deck:PARKED'],14,'Actual Parked return never completes');parkService(r);serviceVisit(r);requested(r,'service-exit');
}));
contract('native C48 missed service support reaches real catch and cut stairs without jump or reset',()=>reportedRoute(48,true,'48-catch-cut-stair-return',r=>{
 questionEntry(r,'east');parkService(r);serviceNearDoor(r);r.walk(9,-4);r.walk(9,0);
 r.until(()=>r.w.player.grounded&&r.w.player.pos.y< -3.3,4,'Actual service-edge fall never reaches catch');r.note('actual-dry-rotunda-catch');r.walk(8,-8.7);r.walk(-11.5,-8.7);r.walk(-11.5,6);
 assert.ok(r.w.player.grounded&&Math.abs(r.w.player.pos.y-.865)<.06,'The actual cut22-step well never reaches near bank');assert.equal(r.events.some(e=>e.type==='jump'),false);r.note('actual-cut-well-no-jump-return');
 r.walk(-8,6);r.walk(-3.8,2);r.walk(2.2,-4);serviceVisit(r);requested(r,'service-exit');
}));
