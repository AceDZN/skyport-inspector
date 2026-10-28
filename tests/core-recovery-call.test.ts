/** Actual two-miss return paths from authored spawns. No body/machine/velocity/reset writes. */
import test,{before} from 'node:test';import assert from 'node:assert/strict';
import {initializePhysics} from '../src/core/world';import {getCoreLevel} from '../src/core/levels';import {V} from '../src/physics';
import {MachineSystems} from '../src/systems';import {SequenceRoute as ReferenceRoute,forward} from './helpers/sequence-route';
before(initializePhysics);
function miss(r:ReferenceRoute){
 r.walk(-1,7.3);r.walk(4.2,7.3);r.walk(4.2,6.45);r.shot(0,'deep-floor',V(3,-17.975,-1.1));r.shot(1,'launch-white',V(-7.985,9,r.number===16?-6:6));r.look(V(4.2,r.w.eye().y,-6));
 for(let i=0;i<360&&!(r.w.player.grounded&&r.w.player.pos.y< -16);i++)r.step(forward);
 assert.ok(r.w.player.grounded&&Math.abs(r.w.player.pos.y+17.135)<.08,'Ordinary miss did not reach the actual deep floor');assert.equal(r.w.player.crossings,0);
 r.walk(4.2,-5.2);r.tick(1.5);assert.ok(r.w.player.grounded&&r.w.player.pos.y< -21);assert.equal(r.w.respawns,0);r.note('actual-miss-to-basin');
}
function rideUp(r:ReferenceRoute){const lift=r.device('recovery-lift');r.walk(-1,10);r.walk(-5,10);const ridingBefore=r.ridingFrames.get('recovery-lift')??0;r.control('recovery-lift');const started=r.w.time,expected=22/(lift.spec.speed??1.2);let prior=lift.position.clone(),maxStep=0;r.until(()=>!lift.moving&&lift.position.y>-.201,expected+2,'Actual deck failed to arrive upstairs',()=>{maxStep=Math.max(maxStep,lift.position.distanceTo(prior));prior.copy(lift.position);});const rideSeconds=r.w.time-started,riderFrames=(r.ridingFrames.get('recovery-lift')??0)-ridingBefore;assert.ok(rideSeconds>expected-.1&&rideSeconds<expected+.2,'Return travel is not the configured physical motor duration');assert.ok(riderFrames>expected*120*.8,'No sustained supported capsule carriage');assert.ok(r.w.player.grounded&&r.w.player.pos.y>.8);r.walk(-1,10);r.note('actual-return-to-approach');r.checkpoints.at(-1).ride={rideSeconds,riderFrames,speed:lift.spec.speed,maxStep};return maxStep;}
for(const number of [16,17])test('recovery '+number+' second miss can call the parked deck and ride again without reset',()=>{
 const r=new ReferenceRoute(number,false,'two-miss-fixed-call',getCoreLevel(number));let error:unknown;
 try{
  miss(r);const firstRideMaxStep=rideUp(r);miss(r);const lift=r.device('recovery-lift');assert.ok(lift.position.y>-.201,'Second miss must leave deck genuinely parked upstairs');
  r.walk(-1.2,12.8);r.tick(.6);r.look(V(-2.15,-20.8,12.8));assert.equal(r.w.interactionHint(),'E · Use CALL RETURN');r.control('basin-call');
  let prior=lift.position.clone(),maxStep=0,maxWaitDrift=0;const actor=r.w.player.pos.clone(),recallStarted=r.w.time;
  for(let i=0;i<22*120;i++){if(!lift.moving&&lift.position.y< -22.19)break;r.step();maxStep=Math.max(maxStep,lift.position.distanceTo(prior));maxWaitDrift=Math.max(maxWaitDrift,r.w.player.pos.distanceTo(actor));prior.copy(lift.position);assert.ok(r.w.player.pos.distanceTo(actor)<.025,'Recall moves the waiting capsule or crushes it');}
  const recallSeconds=r.w.time-recallStarted;assert.ok(lift.position.y< -22.19&&!lift.moving,'Fixed call did not physically bring the deck down');assert.ok(recallSeconds>5.3&&recallSeconds<5.8,'Recovery recall is not the intended short physical trip');r.note('actual-fixed-call-and-safe-side-wait');r.checkpoints.at(-1).recall={maxStep,maxWaitDrift,firstRideMaxStep,recallSeconds};
  // The existing motor seats a final <.015m gap at a stop. Recall must use
  // that same bounded path, rather than pretending this actuator had no seat.
  assert.ok(maxStep<=(lift.spec.speed??1.2)/120+.015+.00001,'Call exceeds motor step plus existing stop-seat tolerance');assert.ok(maxStep<=firstRideMaxStep+.00001,'Recall has a larger jump than the actual first ridden trip');
  rideUp(r);assert.equal(r.w.respawns,0);assert.equal(r.w.player.crossings,0);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.filter(e=>e.type==='lift-arrival'&&e.data.value==='APPROACH').length>=2);
 }catch(e){error=e;throw e;}finally{r.dispose(error);}
});
test('per-device recovery speed preserves the ordinary manual lift default',()=>{
 const m=new MachineSystems([{id:'ordinary',kind:'lift',label:'ORDINARY',position:[0,-.2,0],size:[4,.4,4],stops:[{label:'BASE',position:[0,-.2,0]},{label:'UPPER',position:[0,3.8,0]}]},{id:'recovery',kind:'lift',label:'RETURN',speed:4,position:[8,-.2,0],size:[4,.4,4],stops:[{label:'BASE',position:[8,-.2,0]},{label:'UPPER',position:[8,3.8,0]}]}]);
 m.interact('ordinary');m.interact('recovery');m.update(1/120,[],{});assert.ok(Math.abs(m.devices[0].delta.y-1.2/120)<1e-12);assert.ok(Math.abs(m.devices[1].delta.y-4/120)<1e-12);
});
test('call station respects the target stop guard and selection never teleports its lift',()=>{
 // Isolated machine input contract, not an authored-spawn/player completion proof.
 const m=new MachineSystems([{id:'deck',kind:'lift',label:'DECK',position:[0,-.2,0],size:[4,.4,4],stops:[{label:'BASE',position:[0,-.2,0]},{label:'UPPER',position:[0,3.8,0],guard:{all:['power']}}]},{id:'call',kind:'switch',label:'CALL UPPER',position:[3,1,0],size:[.4,.7,.3],calls:{device:'deck',stop:1}}]);
 m.update(1/120,[],{power:false});assert.equal(m.interact('call'),true);assert.equal(m.devices[0].choice,0);assert.equal(m.events.at(-1)?.type,'invalid');
 m.update(1/120,[],{power:true});const before=m.devices[0].position.clone();assert.equal(m.interact('call'),true);assert.equal(m.devices[0].choice,1);assert.ok(m.devices[0].position.equals(before));m.update(1/120,[],{power:true});assert.ok(m.devices[0].position.y>before.y&&m.devices[0].position.y-before.y<=.01001);
});
