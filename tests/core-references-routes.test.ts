/** New authored reference routes; ordinary native input, not browser/earned progression. */
import test,{before} from 'node:test';import assert from 'node:assert/strict';
import {initializePhysics} from '../src/core/world';import {V} from '../src/physics';
import {ReferenceRoute,route} from './helpers/reference-route';
before(initializePhysics);
function beamCargo(r:ReferenceRoute,pad='service-pressure',z=2){
 r.shot(0,'jobs-source',V(5,1.55,13.985));r.shot(1,'jobs-return',V(-10.985,1.55,-2));r.walk(5,12.6);r.enter(0);
 r.walk(-8.9,-3);r.pickup('beam-cube');r.walk(-8.9,-2);r.enter(1);assert.equal(r.w.player.crossings,2);
 r.walk(9.5,12);r.walk(9.5,z);r.dropPad('beam-cube',pad,8,z);assert.equal(r.w.machines.flags['job-light'],true);r.note('actual-blocker-carried-out-through-portals');
}
function lowerAllocation(r:ReferenceRoute){r.walk(8,7);r.pickup('power-cube');r.dropPad('power-cube','service-pressure',8,2);assert.equal(r.pad('lift-power').pressed,false);assert.equal(r.w.machines.flags['job-light'],false);r.note('actual-pressure-reallocated-with-beam-blocked');}
function upper(r:ReferenceRoute){
 const lift=r.device('job-lift');assert.equal(r.pad('lift-power').pressed,true);assert.equal(r.w.machines.flags['job-light'],true);
 r.walk(9.5,-3);r.walk(6,-3);r.until(()=>lift.moving,25,'Real lift never departs');r.until(()=>!lift.moving&&Math.abs(lift.position.y+.2)<.01,25,'Real lift never returns to its lower dock');
 r.walk(6,-6);r.note('actual-lift-boarding');r.until(()=>!lift.moving&&lift.position.y>3.99&&r.w.player.grounded,15,'Actual loaded lift never reaches upper dock');assert.ok((r.ridingFrames.get('job-lift')??0)>120,'No actual lift carriage');
 r.walk(6,-10);r.walk(6,-16.5);r.finish('upper-exit');
}
function lower(r:ReferenceRoute){r.walk(9.5,2);r.walk(9.5,-5);r.walk(14,-5);}
test('R21 language alternatives keep identical physical fixtures and initial live jobs',()=>{
 const a=new ReferenceRoute(21),b=new ReferenceRoute(21,true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.equal(a.pad('lift-power').crateId,'power-cube');assert.equal(a.w.beams.get('job-emitter')?.obstacle,'beam-cube');assert.equal(a.w.machines.flags['job-light'],false);assert.equal(a.pad('service-pressure').pressed,false);}finally{a.w.dispose();b.w.dispose();}
});
test('R21 clear the actual blocker through portals while pressure supplies the real upper lift',()=>route(21,false,'blocker-upper',r=>{beamCargo(r);assert.equal(r.pad('lift-power').crateId,'power-cube');upper(r);}));
test('R21 contrast leaves optical obstruction and reallocates real pressure to lower service',()=>route(21,true,'pressure-lower',r=>{lowerAllocation(r);lower(r);r.finish('lower-exit');assert.equal(r.w.player.crossings,0);assert.equal(r.w.beams.get('job-emitter')?.obstacle,'beam-cube');}));
test('R21 wrong lower route remains recoverable through restored pressure and blocker retrieval',()=>route(21,false,'wrong-lower-recovery',r=>{
 lowerAllocation(r);lower(r);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'));r.walk(9.5,-5);r.walk(9.5,2);r.walk(8,2);r.pickup('power-cube');r.dropPad('power-cube','lift-power',8,7);beamCargo(r);upper(r);
}));
test('R21 physically equivalent cargo swap is accepted without an identity or untouched-history gate',()=>route(21,false,'equivalent-swap',r=>{
 lowerAllocation(r);beamCargo(r,'lift-power',7);assert.equal(r.pad('lift-power').crateId,'beam-cube');assert.equal(r.pad('service-pressure').crateId,'power-cube');upper(r);
}));

function supplyPair(r:ReferenceRoute){r.shot(0,'supply-source',V(7,1.55,13.985));r.shot(1,'supply-return',V(-6,1.55,-13.985));r.tick(.2);assert.equal(r.w.beams.get('supply-emitter')?.receiver,'window-light');}
function receiverUpper(r:ReferenceRoute){const lift=r.device('receiver-lift');r.walk(-6,11);r.walk(-6,-3);r.until(()=>lift.moving,25,'Receiver lift never moves');r.until(()=>!lift.moving&&Math.abs(lift.position.y+.2)<.01,25,'Receiver lift never returns');r.walk(-6,-6);r.until(()=>!lift.moving&&lift.position.y>3.99&&r.w.player.grounded,15,'Actual receiver lift failed to carry player');assert.ok((r.ridingFrames.get('receiver-lift')??0)>120);r.walk(-6,-10);r.walk(-6,-16.5);}
function floorSupply(r:ReferenceRoute){r.walk(2,11);r.walk(2,10);r.pickup('supply-cube');r.dropPad('supply-cube','floor-supply',8,6);assert.equal(r.pad('floor-supply').crateId,'supply-cube');}
function pressureCross(r:ReferenceRoute){const carrier=r.device('button-carrier');r.walk(6,4.6);r.until(()=>carrier.moving,30,'Actual pressure carrier never moves');r.until(()=>!carrier.moving&&Math.abs(carrier.position.z-2)<.01,30,'Actual pressure carrier never returns');r.walk(6,2);r.until(()=>!carrier.moving&&Math.abs(carrier.position.z+8)<.01&&r.w.player.grounded,16,'Loaded pressure carrier never reaches far dock');assert.ok((r.ridingFrames.get('button-carrier')??0)>200);r.walk(6,-11);r.walk(6,-16.5);}
test('R22 both relative clauses retain identical supplies and transport geometry',()=>{const a=new ReferenceRoute(22),b=new ReferenceRoute(22,true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.deepEqual(a.w.level.optics,b.w.level.optics);}finally{a.w.dispose();b.w.dispose();}});
test('R22 receiver object relative selects real optical supply and upper lift',()=>route(22,false,'receiver-upper',r=>{supplyPair(r);receiverUpper(r);r.finish('receiver-exit');assert.equal(r.pad('floor-supply').pressed,false);}));
test('R22 floor-button object relative selects real pressure and low horizontal carrier',()=>route(22,true,'pressure-low',r=>{floorSupply(r);pressureCross(r);r.finish('pressure-exit');assert.equal(r.w.machines.flags['window-light'],false);}));
test('R22 pressure removal brakes the actual carrier and replacement resumes its phase',()=>route(22,true,'pressure-brake',r=>{
 floorSupply(r);const carrier=r.device('button-carrier');r.until(()=>carrier.moving&&carrier.position.z<1&&carrier.position.z>-6,15,'No real motion to interrupt');r.pickup('supply-cube');r.walk(9,8);r.until(()=>!r.pad('floor-supply').pressed,1,'Physically removed cargo did not release pressure');const stopped=carrier.position.clone();r.tick(1);assert.ok(carrier.position.distanceTo(stopped)<1e-5);assert.equal(carrier.moving,false);r.dropPad('supply-cube','floor-supply',8,6);let prior=carrier.position.clone();for(let i=0;i<30;i++){r.step();assert.ok(carrier.position.distanceTo(prior)<.02,'Pressure restore jumps global phase');prior.copy(carrier.position);}pressureCross(r);r.finish('pressure-exit');
}));
test('R22 wrong upper route returns by actual lift before corrected pressure crossing',()=>route(22,true,'wrong-upper-recovery',r=>{
 supplyPair(r);receiverUpper(r);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'));const lift=r.device('receiver-lift');r.walk(-6,-10);r.until(()=>!lift.moving&&lift.position.y>3.99,25,'No actual upper return');r.walk(-6,-6);r.until(()=>!lift.moving&&Math.abs(lift.position.y+.2)<.01&&r.w.player.grounded,16,'No actual return to lower floor');r.walk(-6,11);floorSupply(r);pressureCross(r);r.finish('pressure-exit');
}));
test('R22 real miss returns over authored catch stairs without jumping or reset',()=>route(22,false,'catch-stairs',r=>{
 r.walk(2.5,11);r.walk(2.5,4.6);r.look(V(2.5,r.w.eye().y,-2));r.tick(.8,{forward:1,strafe:0,jump:false});r.until(()=>r.w.player.grounded&&r.w.player.pos.y< -3,3,'Real fall did not land on dry catch');r.note('actual-catch');r.walk(7.7,-9.8);r.walk(9.5,-9.8);r.walk(9.5,5);assert.ok(r.w.player.grounded&&r.w.player.pos.y>.8);assert.equal(r.w.respawns,0);assert.equal(r.w.events.some(e=>e.type==='jump'),false);assert.equal(r.w.campaignResult,undefined);
}));

function blockedInput(r:ReferenceRoute){const beam=r.w.beams.get('screen-emitter');assert.equal(beam?.stop,'obstacle');assert.equal(beam?.hops,0);assert.ok(Math.abs(beam!.segments.at(-1)!.to[0]-(r.device('input-screen').position.x-.15))<.01,'Beam did not terminate on actual broad screen face');}
function screenPair(r:ReferenceRoute){r.walk(-9.5,8);r.shot(0,'screen-source',V(-1.015,1.55,0));r.shot(1,'screen-return',V(-6,1.55,-13.985));r.tick(.15);}
function inputPressure(r:ReferenceRoute){r.walk(-8,11.8);r.walk(8,11.8);r.walk(7,10);r.pickup('screen-cube');r.dropPad('screen-cube','screen-pressure',7,6);}
function outputPassage(r:ReferenceRoute){r.walk(8,9);r.walk(-8,9);assert.equal(r.pad('screen-pressure').pressed,true);r.walk(-8,-11);r.walk(-14,-11);}
function servicePassage(r:ReferenceRoute){r.walk(-8,6);r.walk(-8,3);r.walk(-14,3);}
test('R23 clauses keep the same real input screen, receiver output and dark side passage',()=>{const a=new ReferenceRoute(23),b=new ReferenceRoute(23,true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.deepEqual(a.w.level.optics,b.w.level.optics);blockedInput(a);assert.equal(a.w.machines.flags['screen-light'],false);assert.equal(a.w.machines.flags['closed:input-screen'],true);assert.equal(a.w.machines.interact('output-leaf'),false);}finally{a.w.dispose();b.w.dispose();}});
test('R23 real pressure opens input screen and portal-directed receiver controls separate output',()=>route(23,false,'receiver-output',r=>{
 screenPair(r);blockedInput(r);inputPressure(r);r.until(()=>r.w.machines.flags['screen-light']===true,3,'Real light failed to turn from opened input to separate receiver');r.tick(1);assert.equal(r.w.machines.flags['closed:input-screen'],false);r.note('actual-input-open-and-distinct-output-supplied');outputPassage(r);r.finish('output-exit');
}));
test('R23 contrast keeps real input seated closed and uses the passage beside it',()=>route(23,true,'closed-input-service',r=>{blockedInput(r);r.tick(1);servicePassage(r);r.finish('service-exit');assert.equal(r.pad('screen-pressure').pressed,false);}));
test('R23 wrong beside-screen passage returns and corrects to receiver-controlled output',()=>route(23,false,'wrong-service-recovery',r=>{
 r.tick(1);servicePassage(r);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'));r.walk(-8,3);screenPair(r);inputPressure(r);r.until(()=>r.w.machines.flags['screen-light']===true,3,'Corrected optical supply failed');r.tick(1);outputPassage(r);r.finish('output-exit');
}));
test('R23 removing pressure really closes input before service becomes available again',()=>route(23,true,'open-input-recovery',r=>{
 screenPair(r);inputPressure(r);r.until(()=>r.w.machines.flags['screen-light']===true,3,'No actual optical power');r.tick(1);r.walk(7,6);r.pickup('screen-cube');r.look(V(8,r.w.eye().y,9));for(let i=0;i<240&&r.pad('screen-pressure').pressed;i++)r.step({forward:1,strafe:0,jump:false});assert.equal(r.pad('screen-pressure').pressed,false);assert.equal(r.w.machines.flags['closed:input-screen'],false,'A close command cannot stand in for a seated native leaf');
 r.walk(8,9);r.until(()=>r.w.machines.flags['closed:input-screen']===true,3,'Input leaf never actually closed');assert.equal(r.w.machines.flags['screen-light'],false);r.look(V(9,1,9));r.e();r.tick(1);servicePassage(r);r.finish('service-exit');
}));

function openingPair(r:ReferenceRoute){r.shot(0,'opening-source',V(.55,1.55,13.985));r.shot(1,'opening-return',V(.55,1.55,4.665));}
function openingVestibule(r:ReferenceRoute){r.walk(.55,12.7);r.enter(0);assert.ok(r.w.player.pos.z<7.7);r.walk(5.5,5.7);}
function openingBooth(r:ReferenceRoute){r.walk(5.5,5.7);r.walk(.55,5.9);r.enter(1);assert.ok(r.w.player.pos.z>8.2);}
function manualControl(r:ReferenceRoute){r.walk(8,12.8);r.walk(6,12.4);r.control('opening-manual');}
function stopTimer(r:ReferenceRoute){r.walk(-8,12.8);r.walk(-7,11);r.pickup('timer-cube');r.walk(-7,9.6);r.look(V(-5,1.1,9.6));r.tick(.4);r.e();r.tick(.8);assert.equal(r.pad('timer-pressure').pressed,false);}
function timedPassage(r:ReferenceRoute){r.walk(-5,5.7);r.walk(-5,-8.5);r.until(()=>r.device('timed-opening').progress>.999,15,'Timed leaf never fully opens');r.walk(-5,-12.5);}
function manualPassage(r:ReferenceRoute){r.walk(5,5.7);r.walk(5,-8.5);r.until(()=>r.device('manual-opening').progress>.999,3,'Manual leaf never fully opens');r.walk(5,-12.5);}
test('R24 alternative agents share fixed timer, switch, portals and both physical passages',()=>{const a=new ReferenceRoute(24),b=new ReferenceRoute(24,true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.equal(a.pad('timer-pressure').crateId,'timer-cube');assert.equal(a.device('opening-manual').on,false);}finally{a.w.dispose();b.w.dispose();}});
test('R24 omitted object relative selects actual periodic opening with manual off',()=>route(24,false,'timer-passage',r=>{openingPair(r);openingVestibule(r);timedPassage(r);r.finish('timed-exit');assert.equal(r.pad('timer-pressure').crateId,'timer-cube');assert.equal(r.device('opening-manual').on,false);}));
test('R24 changed opening agent removes current timer pressure and enables manual passage',()=>route(24,true,'manual-passage',r=>{stopTimer(r);manualControl(r);openingPair(r);openingVestibule(r);manualPassage(r);r.finish('manual-exit');}));
test('R24 MANUAL on cannot open its passage while the timer is still supplied',()=>route(24,true,'powered-manual-recovery',r=>{manualControl(r);r.tick(1);assert.equal(r.device('manual-opening').progress,0);assert.equal(r.device('timed-opening').progress,0);stopTimer(r);openingPair(r);openingVestibule(r);manualPassage(r);r.finish('manual-exit');}));
test('R24 wrong manual exit can return through the real pair and restore the timed route',()=>route(24,false,'wrong-manual-recovery',r=>{
 stopTimer(r);manualControl(r);openingPair(r);openingVestibule(r);manualPassage(r);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'));r.walk(5,-8.5);openingBooth(r);manualControl(r);r.walk(-8,12.8);r.walk(-7,9.6);r.pickup('timer-cube');r.dropPad('timer-cube','timer-pressure',-7,11);openingVestibule(r);timedPassage(r);r.finish('timed-exit');
}));
test('R24 a missed timer window safely closes and reopens from real maintained power',()=>route(24,false,'next-window',r=>{
 openingPair(r);openingVestibule(r);r.walk(-5,5.7);r.walk(-5,-8.5);r.until(()=>r.device('timed-opening').progress>.999,15,'No initial open window');r.until(()=>r.device('timed-opening').progress<.001,15,'No actual closed interval');r.note('actual-window-missed-safe-wait');assert.ok(r.w.player.pos.z> -9);r.until(()=>r.device('timed-opening').progress>.999,15,'No next physical window');r.walk(-5,-12.5);r.finish('timed-exit');assert.equal(r.w.respawns,0);
}));

function freightPair(r:ReferenceRoute){r.shot(0,'freight-source',V(6,1.55,15.985));r.shot(1,'freight-return',V(-6,1.55,-15.985));}
function carrierCargo(r:ReferenceRoute,pad='balcony-pressure',z=4){
 freightPair(r);const carrier=r.device('freight-carrier'),cube=r.cube('travelling-cube');r.until(()=>carrier.moving,20,'Carrier never transports its authored loose cargo');r.until(()=>!carrier.moving&&Math.abs(carrier.position.z+8)<.01,20,'Carrier never reaches real retrieval dock');assert.ok(cube.pos.z< -7&&Math.abs(cube.pos.x+6)<1.8,'Cargo did not really travel on carrier');r.note('actual-loose-cargo-transported-to-retrieval');
 r.walk(6,14.7);r.enter(0);r.walk(-6,-11.2);r.pickup('travelling-cube');r.walk(-8.8,-12.5);r.walk(-6,-14.65);r.enter(1);assert.equal(r.w.player.crossings,2);
 r.walk(10,14);r.walk(10,z);r.dropPad('travelling-cube',pad,9,z);r.note('actual-travelling-cargo-carried-back-through-pair');
}
function freightUpper(r:ReferenceRoute){const lift=r.device('balcony-lift');assert.equal(r.pad('hatch-pressure').pressed,true);assert.equal(r.pad('balcony-pressure').pressed,true);r.walk(10,6.5);r.walk(10,-5);r.walk(7,-5);r.until(()=>lift.moving,25,'Supplied lift never departs');r.until(()=>!lift.moving&&Math.abs(lift.position.y+.2)<.01,25,'Supplied lift never returns');r.walk(7,-8);r.until(()=>!lift.moving&&lift.position.y>3.99&&r.w.player.grounded,15,'Actual loaded balcony lift never arrives');assert.ok((r.ridingFrames.get('balcony-lift')??0)>120);r.walk(7,-12);r.walk(7,-18.5);r.finish('balcony-exit');}
function hatchToService(r:ReferenceRoute){r.walk(-8,13);r.walk(-8,10);r.pickup('hatch-cube');r.dropPad('hatch-cube','freight-service',9,10);assert.equal(r.pad('hatch-pressure').pressed,false);r.walk(10,7);r.walk(16,7);}
test('R25 both instructions retain actual travelling cargo, maintained hatch and independent return circuits',()=>{const a=new ReferenceRoute(25),b=new ReferenceRoute(25,true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.equal(a.pad('hatch-pressure').crateId,'hatch-cube');assert.equal(a.pad('balcony-pressure').pressed,false);assert.equal(a.pad('freight-service').pressed,false);}finally{a.w.dispose();b.w.dispose();}});
test('R25 fetches genuinely carrier-transported cargo and returns it through portals for balcony pressure',()=>route(25,false,'freight-balcony',r=>{carrierCargo(r);freightUpper(r);}));
test('R25 changed clause reallocates actual hatch pressure to lower service while other cargo stays aboard',()=>route(25,true,'hatch-service',r=>{hatchToService(r);r.finish('service-exit');const carrier=r.device('freight-carrier'),cube=r.cube('travelling-cube');assert.ok(Math.abs(cube.pos.x-carrier.position.x)<1.8&&Math.abs(cube.pos.z-carrier.position.z)<1.8);assert.equal(r.w.player.crossings,0);}));
test('R25 wrong lower return can restore hatch supply then fetch cargo and ride to balcony',()=>route(25,false,'wrong-service-recovery',r=>{
 hatchToService(r);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'));r.walk(10,7);r.walk(9,10);r.pickup('hatch-cube');r.dropPad('hatch-cube','hatch-pressure',-8,10);r.walk(-8,13);r.walk(6,13);carrierCargo(r);freightUpper(r);
}));
test('R25 equivalent cargo swap preserves genuine HATCH and LIFT allocation without identity gates',()=>route(25,false,'equivalent-swap',r=>{
 carrierCargo(r,'freight-service',10);r.walk(10,13);r.walk(-8,13);r.walk(-8,10);r.pickup('hatch-cube');r.dropPad('hatch-cube','balcony-pressure',9,4);r.walk(10,6.5);r.walk(10,10);r.walk(9,10);r.pickup('travelling-cube');r.dropPad('travelling-cube','hatch-pressure',-8,10);assert.equal(r.pad('hatch-pressure').crateId,'travelling-cube');assert.equal(r.pad('balcony-pressure').crateId,'hatch-cube');r.walk(-8,13);r.walk(10,13);freightUpper(r);
}));
test('R25 actual carrier miss returns over22 physical catch stairs without jump or reset',()=>route(25,false,'catch-stairs',r=>{
 r.walk(-8,13);r.walk(-8,8);r.walk(-6,8);r.walk(-6,4.6);r.walk(-9,4.6);r.look(V(-9,r.w.eye().y,-2));r.tick(.8,{forward:1,strafe:0,jump:false});r.until(()=>r.w.player.grounded&&r.w.player.pos.y< -3,3,'Real miss did not land in catch');r.note('actual-dry-catch');r.walk(-8.8,-10.2);r.walk(-10.8,-10.2);r.walk(-10.8,4.8);assert.ok(r.w.player.grounded&&r.w.player.pos.y>.8);assert.equal(r.w.respawns,0);assert.equal(r.events.some(e=>e.type==='jump'),false);
}));
