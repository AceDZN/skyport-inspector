/** Source-authored routes; execute only in the assigned serial native slot. */
import test,{before}from'node:test';import assert from'node:assert/strict';
import RAPIER from'@dimforge/rapier3d-compat';
import{initializePhysics}from'../src/core/world';import{V}from'../src/physics';
import{passiveRoute,PassiveRoute}from'./helpers/passive-route';
before(initializePhysics);

function cargoPair(r:PassiveRoute){r.shot(0,'cargo-source',V(6,1.55,13.985));r.shot(1,'cargo-return',V(-11.985,1.55,8));}
function cargoPressure(r:PassiveRoute){
 cargoPair(r);r.walk(6,12.7);r.enter(0);r.walk(-9.8,9);r.pickup('supply-cube');r.walk(-10.7,8);r.enter(1);r.dropPad('supply-cube','floor-button',7.8,6);
 assert.ok(r.cube('supply-cube').crossings>0,'Cargo did not actually cross');assert.ok(r.events.some(e=>e.type==='enter'&&e.body==='player'&&e.held==='supply-cube'));assert.equal(r.w.machines.flags['wall-light'],false);assert.ok(r.device('button-hatch').progress>.99);assert.ok(r.device('receiver-hatch').progress<.01);r.note('actual-independent-floor-pressure');
}
function floorRoute(r:PassiveRoute){r.walk(6,12.7);r.enter(0);r.walk(-8,-8);r.walk(-10.5,-9);r.walk(-15,-9);}
function beamPair(r:PassiveRoute){
 // The east aisle avoids pushing an existing floor-button support during recovery.
 r.walk(9.5,11);r.walk(9.5,1);r.walk(7,1);r.shot(0,'beam-source',V(11.985,1.55,8.55));r.shot(1,'beam-return',V(.55,1.55,3.985));r.tick(1);
 assert.equal(r.w.beams.get('supply-emitter')?.receiver,'wall-light');assert.equal(r.w.beams.get('supply-emitter')?.hops,1);assert.equal(r.w.machines.flags['wall-light'],true);assert.ok(r.device('receiver-hatch').progress>.99);r.note('actual-independent-light-receiver');
}
function upperRoute(r:PassiveRoute){
 const lift=r.device('receiver-lift');r.walk(7,-.5);r.walk(7,-4.5);
 r.until(()=>lift.moving,24,'Receiver lift never begins actual travel');r.until(()=>!lift.moving&&Math.abs(lift.position.y+.2)<.02,24,'Receiver lift never returns to actual base');
 r.walk(7,-7.5);r.note('actual-receiver-lift-boarding');r.until(()=>r.w.player.grounded&&r.w.player.pos.y>5.01,15,'Actual lift failed to carry capsule to gallery');
 assert.ok((r.riding.get('receiver-lift')??0)>120,'No actual sustained player carriage');r.walk(7,-12);r.walk(7,-19);
}

test('native P31 base and contrast keep identical actual inventory geometry optics and wiring',()=>{
 const a=new PassiveRoute(31),b=new PassiveRoute(31,true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.deepEqual(a.w.level.optics,b.w.level.optics);assert.equal(a.pad('floor-button').pressed,false);assert.equal(a.w.machines.flags['wall-light'],false);assert.ok(a.device('button-hatch').progress<.01);assert.ok(a.device('receiver-hatch').progress<.01);}finally{a.w.dispose();b.w.dispose();}
});
test('native P31 floor-button passive source uses actual remote cargo return pressure and storage hatch',()=>passiveRoute(31,false,'pressure-storage',r=>{
 cargoPressure(r);floorRoute(r);r.finish('button-exit');assert.equal(r.pad('floor-button').crateId,'supply-cube');assert.equal(r.w.machines.flags['wall-light'],false);assert.equal(r.w.player.crossings,3);
}));
test('native P31 light-receiver contrast uses real optical slot hatch and sustained lift-to-gallery route',()=>passiveRoute(31,true,'receiver-gallery',r=>{
 beamPair(r);assert.equal(r.pad('floor-button').pressed,false);assert.ok(r.device('button-hatch').progress<.01);upperRoute(r);r.finish('receiver-exit');assert.equal(r.events.filter(e=>e.type==='pickup').length,0);assert.equal(r.w.machines.flags['wall-light'],true);
}));
test('native P31 actual wrong pressure hatch remains recoverable before correct receiver gallery',()=>passiveRoute(31,true,'wrong-pressure-recovery',r=>{
 cargoPressure(r);floorRoute(r);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'&&e.exit==='button-exit'));r.note('actual-wrong-pressure-destination-no-completion');
 r.walk(-10.5,-9);r.walk(-8,8);r.walk(-10.7,8);r.enter(1);beamPair(r);upperRoute(r);r.finish('receiver-exit');assert.equal(r.pad('floor-button').crateId,'supply-cube');
}));

function freightPair(r:PassiveRoute){r.shot(0,'freight-source',V(7,1.55,13.985));r.shot(1,'freight-return',V(-11.985,1.55,11));}
function freightCargo(r:PassiveRoute){
 const deck=r.device('freight-carrier');assert.equal(r.pad('carrier-power').crateId,'power-cube');
 r.walk(7,3.5);r.walk(4,3.5);r.until(()=>!deck.moving&&Math.abs(deck.position.z)<.02,24,'Actual loose freight never reaches the near dock');r.tick(.2);
 const c=r.cube('carried-cube');assert.ok(Math.abs(c.pos.y-c.half.y-(deck.position.y+.2))<.08,'Cargo is not actually supported by its carrier');assert.ok(Math.abs(c.pos.x-deck.position.x)<1.3&&Math.abs(c.pos.z-deck.position.z)<1.3,'Freight fell off rather than travelling on deck');r.note('actual-loose-carried-cargo-at-near-dock');
 r.walk(4,1.8);r.pickup('carried-cube');r.walk(4,3.5);r.walk(7,3.5);r.walk(7,12.7);r.enter(0);r.walk(-10.3,9.8);r.dropPad('carried-cube','release-pressure',-5,9.8);
 assert.equal(r.pad('carrier-power').crateId,'power-cube');assert.equal(r.pad('release-pressure').crateId,'carried-cube');assert.ok(r.cube('carried-cube').crossings>0);r.note('actual-freight-delivery-and-independent-source');
}
function freightUpper(r:PassiveRoute){
 const lift=r.device('release-lift');r.walk(-10.3,9.8);r.walk(-10.3,12);r.until(()=>lift.moving,24,'Freight release lift never moves');r.until(()=>!lift.moving&&Math.abs(lift.position.y+.2)<.02,24,'Freight release lift never returns to actual base');r.walk(-7.5,12);r.note('actual-upper-freight-boarding');r.until(()=>r.w.player.grounded&&r.w.player.pos.y>5.01,15,'Actual freight lift did not carry capsule');assert.ok((r.riding.get('release-lift')??0)>120);r.walk(-7.5,8);r.walk(-7.5,3);r.finish('freight-exit');
}
function takePowerToService(r:PassiveRoute){r.walk(7,12.7);r.enter(0);r.walk(-10.3,8);r.pickup('power-cube');r.walk(-10.7,11);r.enter(1);r.dropPad('power-cube','service-pressure',8.8,9);assert.equal(r.pad('carrier-power').pressed,false);assert.equal(r.device('freight-carrier').moving,false);r.note('actual-source-removed-and-service-maintained');}
function freightService(r:PassiveRoute){r.walk(9.7,9);r.walk(9.7,4);r.walk(15,4);}
test('native P32 base and contrast have identical real cargo platform supplies geometry and wiring',()=>{
 const a=new PassiveRoute(32),b=new PassiveRoute(32,true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.equal(a.pad('carrier-power').crateId,'power-cube');assert.equal(a.pad('release-pressure').pressed,false);assert.equal(a.pad('service-pressure').pressed,false);assert.ok(a.device('freight-service-door').progress<.01);assert.ok(a.device('freight-upper-door').progress<.01);}finally{a.w.dispose();b.w.dispose();}
});
test('native P32 actually carried cube is collected delivered through portal and powers upper freight',()=>passiveRoute(32,false,'carried-delivery',r=>{freightPair(r);freightCargo(r);freightUpper(r);assert.equal(r.pad('carrier-power').crateId,'power-cube');assert.equal(r.pad('release-pressure').crateId,'carried-cube');}));
test('native P32 source-cube contrast physically removes carrier power and uses lower SERVICE',()=>passiveRoute(32,true,'source-service',r=>{freightPair(r);takePowerToService(r);freightService(r);r.finish('service-exit');assert.equal(r.pad('service-pressure').crateId,'power-cube');assert.equal(r.pad('carrier-power').pressed,false);}));
test('native P32 midrail source loss wrong service route and pressure restoration recover to freight',()=>passiveRoute(32,false,'source-loss-recovery',r=>{
 freightPair(r);r.walk(7,12.7);r.enter(0);r.walk(-10.3,8);const deck=r.device('freight-carrier');r.until(()=>deck.moving&&deck.position.z> -6.5&&deck.position.z< -2,16,'Carrier never reaches actual midrail motion');r.pickup('power-cube');r.walk(-10.7,9.8);r.until(()=>!r.pad('carrier-power').pressed,1,'Removing source failed to remove pressure');const stopped=deck.position.clone();r.tick(1);assert.ok(deck.position.distanceTo(stopped)<1e-5,'Unpowered carrier failed to brake in place');r.note('actual-unpowered-midrail-stop');r.walk(-10.7,11);r.enter(1);r.dropPad('power-cube','service-pressure',8.8,9);freightService(r);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'&&e.exit==='service-exit'));r.note('actual-wrong-source-service-destination');
 r.walk(9.7,4);r.walk(8.8,9);r.pickup('power-cube');r.walk(7,12.7);r.enter(0);r.walk(-10.3,9.8);r.dropPad('power-cube','carrier-power',-10.3,8);r.walk(-10.7,11);r.enter(1);freightCargo(r);freightUpper(r);assert.ok((r.maxDeviceStep.get('freight-carrier')??Infinity)<.02,'Restored carrier jumped phase');
}));
test('native P32 swapped equivalent physical cargo allocation is accepted without identity gates',()=>passiveRoute(32,false,'equivalent-swap',r=>{
 freightPair(r);freightCargo(r);r.walk(-10.3,8);r.pickup('power-cube');r.walk(-10.5,8.8);r.look(V(-10.5,1.06,10.6));r.tick(.35);r.e();r.tick(.8);assert.equal(r.w.heldId,undefined);r.walk(-5,9.8);r.pickup('carried-cube');r.walk(-10.3,9.8);r.dropPad('carried-cube','carrier-power',-10.3,8);r.walk(-10.5,8.8);r.pickup('power-cube');r.walk(-10.3,9.8);r.dropPad('power-cube','release-pressure',-5,9.8);freightUpper(r);assert.equal(r.pad('carrier-power').crateId,'carried-cube');assert.equal(r.pad('release-pressure').crateId,'power-cube');
}));
test('native P32 genuine catch and broad low-end stair recovery need neither jump nor reset',()=>passiveRoute(32,false,'catch-return',r=>{
 r.walk(8,2.8);r.look(V(8,r.w.eye().y,-2));r.tick(.8,{forward:1,strafe:0,jump:false});r.until(()=>r.w.player.grounded&&r.w.player.pos.y< -3.3,3,'Actual miss failed to reach catch floor');r.note('actual-catch-landing');r.walk(-8,-11.8);r.walk(-10,-11.8);r.walk(-10,3);assert.ok(r.w.player.grounded&&r.w.player.pos.y>.8,'Real stairs failed to regain near bank');assert.equal(r.events.filter(e=>e.type==='jump').length,0);assert.equal(r.w.campaignResult,undefined);r.note('actual-no-jump-stair-return');
}));

function blockPair(r:PassiveRoute){r.shot(0,'block-source',V(7,1.55,13.985));r.walk(7,6.8);r.shot(1,'block-return',V(-11.985,1.55,0));r.walk(7,12.7);r.enter(0);r.walk(-8,4.8);r.walk(5.5,5.5);r.note('actual-entry-booth-crossing-to-hatch-control');}
function blockOpen(r:PassiveRoute){r.control('hatch-control');r.tick(1);assert.ok(r.device('cargo-hatch').progress>.99);assert.equal(r.w.beams.get('blocked-emitter')?.obstacle,'block-cube');assert.equal(r.w.machines.flags['block-light'],false);r.note('actual-hatch-open-cube-still-blocks-beam');}
function blockCargo(r:PassiveRoute){r.walk(0,3.7);r.walk(0,1.4);r.pickup('block-cube');r.walk(0,3.7);r.until(()=>r.w.machines.flags['block-light']===true,2,'Actual removed cargo failed to clear optical path');r.note('actual-cargo-removal-clears-beam');}
function blockPark(r:PassiveRoute){r.walk(-2.8,5);r.look(V(-1,1.06,5));r.tick(.35);r.e();r.tick(.8);assert.equal(r.w.heldId,undefined);assert.equal(r.w.machines.flags['block-light'],true);assert.equal(r.pad('block-service').pressed,false);r.note('actual-cargo-parked-clear-of-beam');}
function blockUpper(r:PassiveRoute){const lift=r.device('block-lift');r.walk(8,4.5);r.walk(8,-3.5);r.until(()=>lift.moving,24,'Powered lift never moves');r.until(()=>!lift.moving&&Math.abs(lift.position.y+.2)<.02,24,'Powered lift never returns to actual base');r.walk(8,-6.5);r.until(()=>r.w.player.grounded&&r.w.player.pos.y>5.01,15,'Real lift never carries capsule to gallery');assert.ok((r.riding.get('block-lift')??0)>120);r.walk(8,-11);r.walk(8,-17);r.finish('powered-exit');}
function blockDelivery(r:PassiveRoute){r.dropPad('block-cube','block-service',-5.2,8);assert.equal(r.w.machines.flags['block-light'],true);assert.ok(r.device('block-service-door').progress>.99);r.note('actual-service-delivery-and-cleared-beam');}
function blockLower(r:PassiveRoute){r.walk(-5.2,10);r.walk(-9.7,10);r.walk(-9.7,-10);r.walk(-15,-10);}
test('native P33 base and contrast keep both true passive relationships in identical actual hardware',()=>{
 const a=new PassiveRoute(33),b=new PassiveRoute(33,true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.deepEqual(a.w.level.optics,b.w.level.optics);assert.equal(a.w.beams.get('blocked-emitter')?.obstacle,'block-cube');assert.equal(a.w.machines.flags['block-light'],false);assert.ok(a.device('cargo-hatch').progress<.01);assert.equal(a.pad('block-service').pressed,false);}finally{a.w.dispose();b.w.dispose();}
});
test('native P33 closed opaque hatch blocks an otherwise in-range real cube grab',()=>passiveRoute(33,false,'closed-grab-occlusion',r=>{
 blockPair(r);r.walk(0,3.5);r.look(V(0,r.w.eye().y,0));r.tick(.4,{forward:1,strafe:0,jump:false});const cube=r.cube('block-cube'),d=cube.pos.clone().sub(r.w.eye());assert.ok(d.length()<3.1,'Occlusion precondition failed: cargo is merely out of range');r.look(cube.pos);const hit=r.w.physics.castRay(new RAPIER.Ray(r.w.eye(),d.normalize()),cube.pos.distanceTo(r.w.eye()),true,undefined,undefined,r.w.characterCollider);assert.equal(hit?.collider.handle,r.w.doors.get('cargo-hatch')!.collider.handle,'Actual closed leaf is not the grab obstacle');assert.doesNotMatch(r.w.interactionHint(),/Pick up/);r.e();assert.equal(r.w.heldId,undefined);assert.ok(r.device('cargo-hatch').progress<.01);r.note('actual-in-range-cube-occluded-by-hatch');
}));
test('native P33 beam-patient base opens real cargo access clears obstruction and rides powered gallery',()=>passiveRoute(33,false,'beam-clear-lift',r=>{blockPair(r);blockOpen(r);blockCargo(r);blockPark(r);blockUpper(r);assert.equal(r.w.machines.flags['block-light'],true);}));
test('native P33 cargo-patient contrast opens hatch and delivers ordinary cube to SERVICE',()=>passiveRoute(33,true,'cargo-service',r=>{blockPair(r);blockOpen(r);blockCargo(r);blockDelivery(r);blockLower(r);r.finish('service-exit');assert.equal(r.pad('block-service').crateId,'block-cube');}));
test('native P33 wrong actual SERVICE destination recovers through regrasp and powered gallery',()=>passiveRoute(33,false,'wrong-service-recovery',r=>{
 blockPair(r);blockOpen(r);blockCargo(r);blockDelivery(r);blockLower(r);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'&&e.exit==='service-exit'));r.note('actual-wrong-service-destination');r.walk(-9.7,-10);r.walk(-9.7,10);r.walk(-5.2,10);r.walk(-5.2,8);r.pickup('block-cube');r.walk(-5.2,10);r.walk(-2.8,10);blockPark(r);blockUpper(r);assert.equal(r.pad('block-service').pressed,false);
}));
test('native P33 equivalent extra SERVICE pressure is allowed while taking the truly lit base lift',()=>passiveRoute(33,false,'equivalent-extra-supply',r=>{blockPair(r);blockOpen(r);blockCargo(r);blockDelivery(r);blockUpper(r);assert.equal(r.pad('block-service').crateId,'block-cube');assert.equal(r.w.machines.flags['block-light'],true);}));

function processEntry(r:PassiveRoute){r.shot(0,'process-source',V(.55,1.55,13.985));r.shot(1,'process-return',V(.55,1.55,5.665));r.walk(.55,12.7);r.enter(0);r.note('actual-process-booth-crossing');}
function inspectionOpen(r:PassiveRoute){r.until(()=>r.device('inspection-clock').on&&r.device('inspection-first-leaf').progress>.99&&r.device('inspection-second-leaf').progress>.99,16,'Actual two-shutter inspection window never clears');}
function inspectionRoute(r:PassiveRoute,miss=false){
 r.walk(-7,6.8);r.walk(-7,5.5);
 if(miss){r.until(()=>!r.device('inspection-clock').on&&r.device('inspection-first-leaf').progress<.01&&r.device('inspection-second-leaf').progress<.01,16,'Both inspection leaves never physically close');r.look(V(-7,r.w.eye().y,2));r.tick(.45,{forward:1,strafe:0,jump:false});assert.ok(r.w.player.pos.z>3.8,'Closed first leaf did not block ordinary approach');assert.ok(r.device('inspection-first-leaf').progress<.01,'Approaching a closed leaf reopened it');r.note('actual-closed-timer-leaf-blocks-approach');}
 inspectionOpen(r);r.walk(-7,2.8);r.walk(-7,-4.5);assert.ok(r.w.player.grounded&&Math.abs(r.w.player.pos.y-2.665)<.06,'Actual broad steps did not reach1.8m refuge');r.note('actual-stepped-inspection-refuge');r.walk(-7,-17);
}
function processTestControl(r:PassiveRoute){r.walk(5,6.8);r.walk(7,9.8);}
function processRelease(r:PassiveRoute,interlock=true){
 processTestControl(r);r.control('test-release');r.tick(1);assert.equal(r.device('test-release').on,true);assert.ok(r.device('latched-cargo-hatch').progress>.99);assert.equal(r.device('latched-cargo-hatch').latched,true);r.note('actual-test-releases-hold-open-latch');
 if(interlock){const p=r.device('latched-freight-platform').position.clone();r.tick(2);assert.ok(r.device('latched-freight-platform').position.distanceTo(p)<1e-6,'TEST-on carrier interlock did not hold actual deck');assert.equal(r.device('latched-freight-platform').moving,false);assert.ok(r.device('latched-freight-exit-leaf').progress<.01);}
 r.control('test-release');r.tick(1);assert.equal(r.device('test-release').on,false);assert.ok(r.device('latched-cargo-hatch').progress>.99,'Actual cargo hatch did not remain latched after TEST off');assert.equal(r.device('latched-cargo-hatch').latched,true);r.note('actual-test-off-latch-persists');
}
function processFreight(r:PassiveRoute){
 const deck=r.device('latched-freight-platform');r.walk(9,9.8);r.walk(9,6.8);r.walk(7,6.8);r.walk(7,2.8);r.until(()=>!deck.moving&&Math.abs(deck.position.z)<.02,30,'Latched freight deck never reaches actual near dock');r.walk(7,0);r.note('actual-latched-freight-boarding');r.until(()=>!deck.moving&&Math.abs(deck.position.z+8)<.02,18,'Latched freight deck never reaches actual far dock');assert.ok((r.riding.get('latched-freight-platform')??0)>120);assert.ok(r.w.player.grounded&&r.w.player.pos.z< -7.8);r.walk(7,-11);r.walk(7,-17);
}
test('native P34 base and contrast share independent actual timer and TEST-latch circuits',()=>{
 const a=new PassiveRoute(34),b=new PassiveRoute(34,true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.equal(a.device('inspection-clock').on,true);assert.equal(a.device('test-release').on,false);assert.equal(a.device('latched-cargo-hatch').latched,false);assert.ok(a.device('latched-cargo-hatch').progress<.01);assert.equal(a.device('latched-freight-platform').moving,false);}finally{a.w.dispose();b.w.dispose();}
});
test('native P34 actual closed timer leaves block approach then clear stepped inspection route',()=>passiveRoute(34,false,'timer-window',r=>{processEntry(r);inspectionRoute(r,true);r.finish('inspection-exit');assert.equal(r.device('test-release').on,false);assert.equal(r.device('latched-cargo-hatch').latched,false);assert.equal(r.events.filter(e=>e.type==='jump').length,0);}));
test('native P34 actual TEST release persists while TEST off permits loaded freight crossing',()=>passiveRoute(34,true,'latch-freight',r=>{processEntry(r);processRelease(r);processFreight(r);r.finish('latched-exit');assert.equal(r.device('test-release').on,false);assert.equal(r.device('latched-cargo-hatch').latched,true);}));
test('native P34 wrong timed destination returns through real windows before latched freight recovery',()=>passiveRoute(34,true,'wrong-timer-recovery',r=>{
 processEntry(r);inspectionRoute(r);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'&&e.exit==='inspection-exit'));r.note('actual-wrong-inspection-destination');r.walk(-7,-7.2);inspectionOpen(r);r.walk(-7,-4.5);r.walk(-7,2.8);r.walk(-7,6.8);processRelease(r);processFreight(r);r.finish('latched-exit');assert.equal(r.events.filter(e=>e.type==='jump').length,0);
}));
test('native P34 current TEST interlock brakes midrail and real switch-off resumes own phase',()=>passiveRoute(34,true,'test-brake-recovery',r=>{
 processEntry(r);processRelease(r,false);const deck=r.device('latched-freight-platform');r.until(()=>deck.moving&&deck.position.z< -2&&deck.position.z> -6.5,20,'Actual freight never reaches midrail');r.control('test-release');assert.equal(r.device('test-release').on,true);const stopped=deck.position.clone();r.tick(1);assert.ok(deck.position.distanceTo(stopped)<1e-6,'Current TEST did not brake actual carrier');assert.ok(r.device('latched-cargo-hatch').progress>.99);r.note('actual-test-on-midrail-brake');r.control('test-release');r.tick(.2);assert.ok((r.maxDeviceStep.get('latched-freight-platform')??Infinity)<.02,'Restored current supply jumps phase');processFreight(r);r.finish('latched-exit');
}));
test('native P34 actual missed freight bank recovers by broad stairs without jump or reset',()=>passiveRoute(34,true,'process-catch-return',r=>{
 processEntry(r);processRelease(r,false);r.walk(9,9.8);r.walk(9,6.8);r.walk(7,6.8);r.walk(7,2.8);r.walk(3.5,2.8);r.look(V(3.5,r.w.eye().y,-2));r.tick(.8,{forward:1,strafe:0,jump:false});r.until(()=>r.w.player.grounded&&r.w.player.pos.y< -3.3,3,'Actual freight miss did not land on bounded catch');r.note('actual-process-catch-landing');r.walk(9,-11.8);r.walk(10.5,-11.8);r.walk(10.5,3);assert.ok(r.w.player.grounded&&r.w.player.pos.y>.8);assert.equal(r.events.filter(e=>e.type==='jump').length,0);assert.equal(r.w.campaignResult,undefined);r.note('actual-process-low-end-stair-return');
}));

function loopPair(r:PassiveRoute){r.shot(0,'loop-source',V(-12,1.55,9.985));r.shot(1,'loop-return',V(-17.985,1.55,4));}
function loopNearCargo(r:PassiveRoute){r.walk(-12,5.8);r.pickup('loop-near-cube');}
function loopAccessPressure(r:PassiveRoute){r.dropPad('loop-near-cube','access-pressure',-4.8,-7);assert.ok(r.device('loop-access-door').progress>.99);assert.equal(r.w.machines.flags['loop-light'],false);assert.equal(r.device('loop-lift').moving,false);r.note('actual-access-pressure-with-light-still-blocked');}
function loopRetrieveBlocker(r:PassiveRoute){
 r.walk(-12,8.7);r.enter(0);r.walk(-17.2,-2.2);r.pickup('loop-block-cube');r.walk(-17.2,4);r.walk(-16.8,4);r.enter(1);r.until(()=>r.w.machines.flags['loop-light']===true,2,'Actual removed cargo fails to clear both optical slots');assert.ok(r.cube('loop-block-cube').crossings>0);r.note('actual-cubby-retrieval-clears-two-real-optical-slots');
}
function loopParkBlocker(r:PassiveRoute){r.walk(-6.2,4);r.look(V(-8,1.06,4));r.tick(.35);r.e();r.tick(.8);assert.equal(r.w.heldId,undefined);assert.equal(r.w.machines.flags['loop-light'],true);r.note('actual-blocker-parked-clear-without-extra-pressure');}
function loopFar(r:PassiveRoute){r.walk(-3,1.8);r.walk(-1.5,0);r.walk(2,0);assert.ok(r.w.player.pos.x>1.8);}
function loopUpper(r:PassiveRoute){
 loopFar(r);const lift=r.device('loop-lift');r.walk(14,3.5);r.until(()=>lift.moving,24,'Supply-loop lift never moves');r.until(()=>!lift.moving&&Math.abs(lift.position.y+.2)<.02,24,'Supply-loop lift never reaches its actual base');r.walk(14,.5);r.note('actual-loop-lift-boarding');r.until(()=>r.w.player.grounded&&r.w.player.pos.y>5.01,15,'Actual combined supplies do not carry player to gallery');assert.ok((r.riding.get('loop-lift')??0)>120);r.walk(14,-5);r.walk(14,-13);r.finish('control-exit');
}
function loopService(r:PassiveRoute){r.walk(-10.8,7.8);r.walk(-6,7.8);r.walk(-6,13);}
test('native P35 identical hardware starts with actual cube beam obstruction and independent empty supplies',()=>{
 const a=new PassiveRoute(35),b=new PassiveRoute(35,true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.deepEqual(a.w.level.optics,b.w.level.optics);assert.equal(a.w.beams.get('loop-emitter')?.obstacle,'loop-block-cube');assert.equal(a.w.machines.flags['loop-light'],false);assert.equal(a.pad('access-pressure').pressed,false);assert.equal(a.pad('loop-service').pressed,false);assert.ok(a.device('loop-access-door').progress<.01);assert.ok(a.device('loop-service-door').progress<.01);}finally{a.w.dispose();b.w.dispose();}
});
test('native P35 actual cargo pressure and cleared beam maintain both supplies to control gallery',()=>passiveRoute(35,false,'combined-supplies',r=>{loopPair(r);loopNearCargo(r);loopAccessPressure(r);loopRetrieveBlocker(r);loopParkBlocker(r);loopUpper(r);assert.equal(r.pad('access-pressure').crateId,'loop-near-cube');assert.equal(r.w.machines.flags['loop-light'],true);assert.equal(r.pad('loop-service').pressed,false);}));
test('native P35 SERVICE contrast keeps actual receiver dark and opens distinct lower door',()=>passiveRoute(35,true,'dark-service',r=>{loopNearCargo(r);r.dropPad('loop-near-cube','loop-service',-10.8,6);assert.equal(r.w.machines.flags['loop-light'],false);assert.ok(r.device('loop-service-door').progress>.99);assert.equal(r.device('loop-lift').moving,false);loopService(r);r.finish('service-exit');assert.equal(r.cube('loop-block-cube').crossings,0);}));
test('native P35 wrong dark SERVICE returns and restores both physical upper supplies',()=>passiveRoute(35,false,'wrong-service-recovery',r=>{
 loopPair(r);loopNearCargo(r);r.dropPad('loop-near-cube','loop-service',-10.8,6);loopService(r);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'&&e.exit==='service-exit'));r.note('actual-wrong-dark-service-destination');r.walk(-6,7.8);r.walk(-10.8,7.8);r.walk(-10.8,6);r.pickup('loop-near-cube');loopAccessPressure(r);loopRetrieveBlocker(r);loopParkBlocker(r);loopUpper(r);assert.equal(r.pad('loop-service').pressed,false);
}));
test('native P35 one retrieved cube can both clear beam and maintain ACCESS without identity lock',()=>passiveRoute(35,false,'equivalent-one-supply-cube',r=>{
 loopPair(r);loopRetrieveBlocker(r);r.dropPad('loop-block-cube','access-pressure',-4.8,-7);assert.equal(r.w.machines.flags['loop-light'],true);assert.equal(r.pad('access-pressure').crateId,'loop-block-cube');assert.equal(r.events.filter(e=>e.type==='pickup'&&e.body==='loop-near-cube').length,0);loopUpper(r);assert.equal(r.pad('access-pressure').crateId,'loop-block-cube');assert.ok(r.cube('loop-near-cube').pos.distanceTo(V(-12,.55,4))<.05,'Unneeded near cargo was disturbed');
}));
test('native P35 far return remains physical while pressure loss brakes upper supply then recovers',()=>passiveRoute(35,false,'return-and-pressure-loss',r=>{
 loopPair(r);loopNearCargo(r);loopAccessPressure(r);loopRetrieveBlocker(r);loopParkBlocker(r);loopFar(r);r.walk(2.5,-2.2);r.control('loop-return-control');assert.equal(r.device('loop-return-control').on,true);r.walk(2,0);r.walk(-1.5,0);r.walk(-4.8,-7);const lift=r.device('loop-lift');r.until(()=>lift.moving,24,'Combined lift never moves before pressure interruption');r.pickup('loop-near-cube');r.walk(-6.4,-7);r.until(()=>!r.pad('access-pressure').pressed,2,'Held cargo did not really leave ACCESS contact');assert.equal(r.w.machines.flags['loop-light'],true);const stopped=lift.position.clone();r.tick(1);assert.ok(lift.position.distanceTo(stopped)<1e-6,'Manual return wrongly supplies the upper lift');assert.ok(r.device('loop-access-door').progress>.99,'Far-side manual return failed to keep ground escape open');assert.ok(r.device('loop-upper-door').progress<.01);r.note('actual-return-open-upper-pressure-loss-brake');r.dropPad('loop-near-cube','access-pressure',-4.8,-7);assert.ok((r.maxDeviceStep.get('loop-lift')??Infinity)<.02,'Restoring pressure jumps lift phase');loopUpper(r);
}));
