/** Authored12–15 native routes. Coordinate serial native slots; no browser/earned-unlock proof. */
import test,{before}from'node:test';import assert from'node:assert/strict';
import{initializePhysics}from'../src/core/world';import{V}from'../src/physics';
import{route,SequenceRoute,forward}from'./helpers/sequence-route';
before(initializePhysics);
function waitingRoom(r:SequenceRoute,side:'east'|'west'){
 r.shot(0,'booth-source',V(.55,1.55,13.985));r.shot(1,'waiting-white',V(.55,1.55,2.665));r.walk(.55,12.7);r.enter(0);assert.equal(r.w.player.crossings,1);
 const x=side==='east'?4:-4;r.walk(x,4);r.walk(x,-.8);r.note('actual-waiting-side-'+side);return x;
}
function openPulse(r:SequenceRoute,side:'east'|'west'){r.until(()=>r.device(side+'-clock').on&&r.device(side+'-shutter').progress>.99,15,'Actual '+side+' gate never opens');}
function beltBooth(r:SequenceRoute){
 r.shot(0,'source-south',V(7.55,1.55,11.985));r.walk(9.7,11);r.walk(9.7,-4.5);r.walk(1,-4.5);
 // Off-centre white target clears both the initial cargo and the known central glazing line.
 r.shot(1,'booth-white',V(1,1.55,9.485));r.walk(9.7,-4.5);r.walk(9.7,11);r.walk(7.55,10.7);r.enter(0);r.note('actual-booth-entry');
}
function beltPower(r:SequenceRoute){r.walk(2,7.5);r.control('belt-power');}
function beltReverse(r:SequenceRoute){r.walk(-2,7.7);r.control('reverse');}
function coveredReverse(r:SequenceRoute){r.tick(.9);r.walk(-2,7.7);r.look(V(-2,1.3,6.05));const prior=r.device('reverse').on;assert.ok(r.device('reverse-cover').progress<.01);assert.throws(()=>r.clearRay(V(-2,1.3,6.05),['reverse']),/Native ray obstructed/);assert.equal(r.w.interact(),false,'Opaque cover did not physically prevent reverse E');assert.equal(r.device('reverse').on,prior);r.note('powered-cover-physically-blocks-reverse');}
function receiveBelt(r:SequenceRoute,side:'east'|'west'){r.until(()=>r.pad(side+'-receiver').crateId==='cargo',65,'Actual cargo never reaches '+side);for(let i=0;i<240;i++){r.step();assert.equal(r.pad(side+'-receiver').crateId,'cargo','Receiving pressure was not maintained');}assert.ok(r.device(side+'-door').progress>.99);r.note('maintained-'+side+'-receiving-pressure');}
function leaveBooth(r:SequenceRoute,side:'east'|'west'){r.walk(1,8.2);r.enter(1);const x=side==='east'?9.7:-9.7;r.walk(x,11);r.walk(x,8);r.walk(side==='east'?13.7:-13.7,8);r.finish(side+'-exit');assert.equal(r.events.filter(e=>e.type==='pickup').length,0);}
function powerPlant(r:SequenceRoute){r.walk(-4.2,10.5);r.walk(-4.2,8);r.pickup('power-cube');r.dropPad('power-cube','power-button',-4.8,8);r.note('actual-pressure-enables-plant-emitter');}
function plantPair(r:SequenceRoute,dark=false){r.walk(-4.8,10.5);r.walk(7,11);r.shot(0,'power-source',V(10.985,1.55,dark?11:9));r.shot(1,'power-return',V(-5,1.55,-13.985));r.tick(.9);r.note(dark?'actual-offset-pair-keeps-receiver-dark':'actual-energized-optical-connection');}
function plantMaintained(r:SequenceRoute){assert.equal(r.pad('power-button').crateId,'power-cube');assert.equal(r.w.machines.flags['plant-light'],true);}
function plantUpper(r:SequenceRoute){
 r.walk(6,2.5);const lift=r.device('plant-lift');plantMaintained(r);
 // Wait for an actual fresh return, rather than assuming enough of an old dwell remains.
 r.until(()=>lift.moving,22,'Automatic plant lift never moves',()=>plantMaintained(r));r.until(()=>!lift.moving&&Math.abs(lift.position.y+.2)<.02,22,'Automatic plant lift never returns to real base',()=>plantMaintained(r));
 r.walk(6,-3.5);r.note('real-plant-lift-boarding');r.until(()=>r.w.player.grounded&&r.w.player.pos.y>4.95,16,'Real plant lift failed to carry player',()=>plantMaintained(r));assert.ok((r.ridingFrames.get('plant-lift')??0)>120,'No actual player carriage');r.walk(6,-9);r.walk(6,-16.7);r.finish('upper-exit');plantMaintained(r);
}
function clearancePair(r:SequenceRoute){
 // Balanced off-centre pair: sourceZ11.45 and returnX.55 still route the real beam at X0.
 // This avoids the known central glazing line; actual decorative visibility stays browser-pending.
 r.shot(0,'clearance-source',V(-10.985,1.55,11.45));r.shot(1,'clearance-return',V(.55,1.55,13.985));r.tick(.2);const beam=r.w.beams.get('clearance-emitter');assert.equal(beam?.hops,1);assert.equal(beam?.stop,'obstacle');assert.equal(beam?.obstacle,'cargo');assert.equal(r.w.machines.flags['transfer-light'],false);assert.equal(r.device('clearance-shuttle').moving,false);r.note('actual-initial-cargo-blocks-routed-beam');
}
function clearancePower(r:SequenceRoute){r.walk(7.3,13);r.control('belt-power');}
function clearanceReverse(r:SequenceRoute){r.walk(4.8,13);r.control('reverse');}
function clearanceDelivery(r:SequenceRoute,side:'east'|'west'){
 r.until(()=>r.w.machines.flags['transfer-light']===true,10,'Cargo failed to clear actual low beam');assert.equal(r.pad('east-receiver').pressed,false);assert.equal(r.pad('west-receiver').pressed,false);assert.equal(r.device('clearance-shuttle').moving,false,'Light alone departed before actual delivery');assert.ok(Math.abs(r.device('clearance-shuttle').position.z)<.01);r.note('beam-clear-alone-does-not-start-shuttle');receiveBelt(r,side);
}
function clearanceMaintained(r:SequenceRoute,side:'east'|'west'){assert.equal(r.pad(side+'-receiver').crateId,'cargo');assert.equal(r.w.machines.flags['transfer-light'],true);}
function clearanceRide(r:SequenceRoute,side:'east'|'west'){
 r.walk(9.7,12.5);r.walk(9.7,2.8);r.walk(4,2.8);const shuttle=r.device('clearance-shuttle');clearanceMaintained(r,side);r.until(()=>shuttle.moving,24,'Actual shuttle never moves',()=>clearanceMaintained(r,side));r.until(()=>!shuttle.moving&&Math.abs(shuttle.position.z)<.02,24,'Actual shuttle never returns to near bank',()=>clearanceMaintained(r,side));r.walk(4,0);r.note('real-clearance-shuttle-boarding');r.until(()=>!shuttle.moving&&Math.abs(shuttle.position.z+6)<.02,14,'Actual loaded shuttle never reaches far dock',()=>clearanceMaintained(r,side));assert.ok((r.ridingFrames.get('clearance-shuttle')??0)>120,'No actual player carriage');assert.ok(r.w.player.grounded&&r.w.player.pos.z< -5.8);r.walk(4,-9);r.note('actual-far-bank-landing');const x=side==='east'?9.7:-9.7;r.walk(x,-11);r.walk(side==='east'?13.7:-13.7,-11);r.finish(side+'-exit');clearanceMaintained(r,side);assert.equal(r.events.filter(e=>e.type==='pickup').length,0);
}
for(const number of [12,13,14,15])test('native S'+number+' base/contrast use identical actual geometry and machinery',()=>{const a=new SequenceRoute(number),b=new SequenceRoute(number,true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.deepEqual(a.w.level.optics,b.w.level.optics);}finally{a.w.dispose();b.w.dispose();}});
test('native S12 base misses a window, cannot push a closed leaf open, then waits and crosses east',()=>route(12,false,'closed-wait-recovery',r=>{
 waitingRoom(r,'east');r.until(()=>!r.device('east-clock').on&&r.device('east-shutter').progress<.01,15,'East did not reach real closure');r.look(V(4,r.w.eye().y,-3));r.tick(.4,forward);r.note('closed-east-blocks-ordinary-approach');assert.equal(r.w.campaignResult,undefined);assert.ok(r.w.player.pos.z> -2.2);assert.ok(r.device('east-shutter').progress<.01,'Approaching closed gate incorrectly reopens it');
 openPulse(r,'east');r.walk(4,-9.5);r.finish('east-exit');assert.equal(r.device('east-clock').on,true);assert.equal(r.events.filter(e=>e.type==='jump').length,0);
}));
test('native S12 contrast waits for the actual opposed west window and crosses its physical passage',()=>route(12,true,'west-window',r=>{
 waitingRoom(r,'west');openPulse(r,'west');r.walk(-4,-9.5);r.finish('west-exit');assert.equal(r.device('west-clock').on,true);assert.equal(r.events.filter(e=>e.type==='jump').length,0);
}));
test('native S12 wrong west crossing remains recoverable through real gates before correct east',()=>route(12,false,'wrong-west-recovery',r=>{
 waitingRoom(r,'west');openPulse(r,'west');r.walk(-4,-9.5);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'&&e.data.exit==='west-exit'));r.note('actual-wrong-west-passage');r.walk(-4,1);r.walk(4,1);openPulse(r,'east');r.walk(4,-9.5);r.finish('east-exit');assert.equal(r.w.player.crossings,1);assert.equal(r.events.filter(e=>e.type==='jump').length,0);
}));
test('native S13 base enters the actual booth, reverses before power, then uses maintained west delivery',()=>route(13,false,'reverse-before-power',r=>{
 beltBooth(r);assert.equal(r.device('belt-power').on,false);assert.ok(r.device('reverse-cover').progress>.99);beltReverse(r);assert.equal(r.device('reverse').on,true);assert.equal(r.device('belt-power').on,false);beltPower(r);coveredReverse(r);receiveBelt(r,'west');
 const rev=r.events.findIndex(e=>e.type==='switch-toggle'&&e.data.id==='reverse'&&e.data.value===true),power=r.events.findIndex(e=>e.type==='switch-toggle'&&e.data.id==='belt-power'&&e.data.value===true);assert.ok(rev>=0&&power>rev);leaveBooth(r,'west');
}));
test('native S13 contrast keeps real east direction, powers the belt and takes the opposed physical exit',()=>route(13,true,'east-direction',r=>{
 beltBooth(r);beltPower(r);coveredReverse(r);assert.equal(r.device('reverse').on,false);receiveBelt(r,'east');leaveBooth(r,'east');
}));
test('native S13 wrong east delivery recovers through actual stop, uncovered reverse and west restart',()=>route(13,false,'east-to-west-recovery',r=>{
 beltBooth(r);beltPower(r);receiveBelt(r,'east');coveredReverse(r);beltPower(r);r.until(()=>r.device('reverse-cover').progress>.99,1.5,'Stopped reverse cover never opens');assert.equal(r.device('belt-power').on,false);beltReverse(r);beltPower(r);r.until(()=>!r.pad('east-receiver').pressed,12,'Old east pressure did not release');assert.ok(r.device('east-door').progress<1);receiveBelt(r,'west');assert.equal(r.pad('east-receiver').pressed,false);leaveBooth(r,'west');
}));
test('native S14 real cube pressure energizes beam and maintains actual lift-to-upper route',()=>route(14,false,'pressure-beam-lift',r=>{
 powerPlant(r);assert.equal(r.w.machines.flags['plant-light'],false);plantPair(r);assert.equal(r.w.beams.get('plant-emitter')?.receiver,'plant-light');plantUpper(r);
}));
test('native S14 dark contrast keeps pressure, uses an offset traversable pair and west inspection',()=>route(14,true,'dark-inspection',r=>{
 powerPlant(r);plantPair(r,true);assert.equal(r.pad('power-button').crateId,'power-cube');assert.equal(r.w.machines.flags['plant-light'],false);assert.ok(r.device('plant-access').progress<.01);assert.ok(r.device('upper-door').progress<.01);assert.ok(r.device('inspection-door').progress>.99);r.walk(9.7,11);r.enter(0);r.walk(-8,-12);r.walk(-8,-10);r.walk(-13.7,-10);r.finish('inspection-exit');assert.equal(r.w.machines.flags['plant-light'],false);
}));
test('native S14 unlit placement is allowed, removing actual pressure brakes and replacement recovers',()=>route(14,false,'pressure-interruption',r=>{
 plantPair(r);assert.equal(r.w.machines.flags['plant-light'],false);assert.equal(r.w.beams.has('plant-emitter'),false);powerPlant(r);plantMaintained(r);const lift=r.device('plant-lift');r.until(()=>lift.moving&&lift.position.y>.3&&lift.position.y<3,10,'Real unloaded lift never enters measurable ascent',()=>plantMaintained(r));r.pickup('power-cube');r.walk(-5.8,8);r.until(()=>!r.pad('power-button').pressed&&!r.w.machines.flags['plant-light'],1,'Removing actual cargo failed to remove optical power');const stopped=lift.position.clone();r.tick(1);assert.ok(lift.position.distanceTo(stopped)<1e-5,'Power loss failed to brake at current height');r.note('actual-pressure-removal-brakes-in-place');r.dropPad('power-cube','power-button',-4.8,8);plantMaintained(r);let previous=lift.position.clone();for(let i=0;i<30;i++){r.step();assert.ok(lift.position.distanceTo(previous)<.02,'Restored power jumps phase');previous.copy(lift.position);}plantUpper(r);
}));
test('native S15 actual east cargo clears beam, receiving pressure enables loaded shuttle and east exit',()=>route(15,false,'east-shuttle',r=>{
 clearancePair(r);clearancePower(r);clearanceDelivery(r,'east');clearanceRide(r,'east');
}));
test('native S15 contrast reverses actual cargo west before the maintained beam and loaded crossing',()=>route(15,true,'west-shuttle',r=>{
 clearancePair(r);clearanceReverse(r);clearancePower(r);clearanceDelivery(r,'west');clearanceRide(r,'west');
}));
test('native S15 actual pressure loss brakes midrail and opposite delivery resumes without phase jump',()=>route(15,true,'delivery-brake-recovery',r=>{
 clearancePair(r);clearancePower(r);clearanceDelivery(r,'east');r.walk(4.8,13);const shuttle=r.device('clearance-shuttle');r.until(()=>shuttle.moving&&shuttle.delta.z>0&&shuttle.position.z< -4.5,24,'No actual return motion to interrupt',()=>clearanceMaintained(r,'east'));r.control('reverse');r.until(()=>!r.pad('east-receiver').pressed&&!r.pad('west-receiver').pressed,12,'Actual reversal failed to release both receiving conditions');assert.equal(shuttle.moving,false);assert.ok(shuttle.position.z> -5.9&&shuttle.position.z< -.1,'Interruption did not occur midrail');const stopped=shuttle.position.clone();r.tick(1);assert.ok(shuttle.position.distanceTo(stopped)<1e-5);r.note('actual-delivery-loss-brakes-midrail');r.until(()=>r.pad('west-receiver').crateId==='cargo',65,'Opposite actual delivery never arrives',()=>{if(!r.pad('west-receiver').pressed)assert.ok(shuttle.position.distanceTo(stopped)<1e-5);});let previous=shuttle.position.clone();for(let i=0;i<30;i++){r.step();assert.ok(shuttle.position.distanceTo(previous)<.02,'Restored delivery jumps global phase');previous.copy(shuttle.position);}for(let i=0;i<240;i++){r.step();clearanceMaintained(r,'west');}assert.equal(r.pad('east-receiver').pressed,false);r.note('actual-opposite-delivery-resumes-own-phase');clearanceRide(r,'west');
}));
test('native S15 catch returns by actual authored treads without jump or reset',()=>route(15,false,'catch-clearance',r=>{
 r.walk(9.7,12.5);r.walk(9.7,2.8);r.walk(7,2.8);r.look(V(7,r.w.eye().y,-2));r.tick(.8,forward);r.until(()=>r.w.player.grounded&&r.w.player.pos.y< -3.3,3,'Actual miss failed to land in catch basin');assert.equal(r.w.respawns,0);r.note('real-catch-landing');
 const treads=r.w.solids.filter(s=>s.id.startsWith('clearance-return-step-')).sort((a,b)=>a.max.y-b.max.y);assert.equal(treads.length,22);const first=treads[0],last=treads.at(-1)!,x=(first.min.x+first.max.x)/2,approach=r.w.blueprint.routePoints['catch-stair-low-end']?.[2]??first.min.z-1;
 // Approach the actual low end along the clear west side; never enter through a riser side.
 r.walk(7.5,approach);r.walk(x,approach);r.note('actual-low-end-approach');r.checkpoints.at(-1).stairGeometry={count:treads.length,width:first.max.x-first.min.x,depth:first.max.z-first.min.z,firstTop:first.max.y,lastTop:last.max.y,approach};r.walk(x,3);
 assert.ok(r.w.player.grounded&&r.w.player.pos.y>.8,'Actual tread flight does not return to near bank; '+r.detail());assert.equal(r.w.respawns,0);assert.equal(r.events.filter(e=>e.type==='jump').length,0);assert.equal(r.w.campaignResult,undefined);r.note('near-bank-recovered-without-jump');
}));
