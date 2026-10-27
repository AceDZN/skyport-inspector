/**
 * Execution status: all22 native cases pass after the lead's bounded C7 carpentry fix.
 * Original failures and later passing runs remain separate in native-routes logs.
 * Coordinate a serial native slot with QA before running any further cases.
 * These are native authored-spawn route checks, never browser/curriculum-mastery proof.
 * Only step(WASD), camera aim, visibly ray-checked place(), and the ordinary E dispatcher
 * affect the world. No body pose/velocity, machine choice, goal, history or save is written.
 * Later language batches must test full clause/order/maintained-condition demands; these
 * selected modal/permission examples do not establish whole chapters or justify repeating
 * a last-word compass hunt. Actual alternative actions/pressures/transport are asserted.
 */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {Vector3} from 'three';
import {CoreWorld,initializePhysics} from '../src/core/world';
import {draftPermissionLevels} from '../src/core/levels/permissions';
import {V,type Input} from '../src/physics';

const idle:Input={forward:0,strafe:0,jump:false},forward:Input={...idle,forward:1};
const hz=120,dt=1/hz;
before(initializePhysics);

class NativeRoute {
 readonly w:CoreWorld;
 readonly events:{type:string;data:Record<string,unknown>}[]=[];
 readonly ridingFrames=new Map<string,number>();
 readonly looseGaps=new Map<string,number[]>();
 constructor(number:number,contrast=false){
  const level=draftPermissionLevels.find(d=>d.number===number);assert.ok(level,'Missing explicit draft '+number);
  this.w=new CoreWorld(number,(type,data)=>this.events.push({type,data:data??{}}),level,contrast);
  assert.ok(this.w.player.pos.distanceTo(V(...this.w.blueprint.spawn))<.05,'Route did not begin at authored spawn');
  for(const authored of this.w.blueprint.cargo)assert.ok(this.cube(authored.spec.id).pos.distanceTo(V(...authored.position))<.05,'Cargo did not begin at its authored location');
  this.tick(.5);
 }
 dispose(){this.w.dispose();}
 detail(){
  const contacts=Array.from({length:this.w.controller.numComputedCollisions()},(_,i)=>this.w.controller.computedCollision(i)).filter(c=>!!c).map(c=>({solid:c.collider?this.w.fixed.get(c.collider.handle)?.id:undefined,toi:c.toi,normal:c.normal1,witness:c.witness1,applied:c.translationDeltaApplied,remaining:c.translationDeltaRemaining}));
  return JSON.stringify({player:this.w.player.pos.toArray(),velocity:this.w.player.vel.toArray(),grounded:this.w.player.grounded,held:this.w.heldId,cargo:this.w.snapshot().crates,devices:this.w.machines.snapshot(),pads:this.w.snapshot().pads,signals:{...this.w.machines.flags},kcc:{offset:this.w.controller.offset(),minWidth:this.w.controller.autostepMinWidth(),maxHeight:this.w.controller.autostepMaxHeight(),contacts},events:this.events.slice(-8)});
 }
 cube(id:string){const c=this.w.crates.find(c=>c.id===id);assert.ok(c,'Missing cargo '+id);return c;}
 device(id:string){const d=this.w.machines.devices.find(d=>d.spec.id===id);assert.ok(d,'Missing device '+id);return d;}
 pad(id:string){const p=this.w.pads.find(p=>p.id===id);assert.ok(p,'Missing pressure '+id);return p;}
 step(input:Input=idle){
  this.w.step(dt,input);
  for(const d of this.w.machines.devices.filter(d=>['lift','moving-platform'].includes(d.spec.kind)&&d.moving)){
   const top=d.position.y+d.spec.size[1]/2,p=this.w.player,inside=(x:number,z:number)=>Math.abs(x-d.position.x)<d.spec.size[0]/2&&Math.abs(z-d.position.z)<d.spec.size[2]/2;
   if(p.grounded&&inside(p.pos.x,p.pos.z)&&Math.abs(p.pos.y-p.half.y-top)<.16)this.ridingFrames.set(d.spec.id,(this.ridingFrames.get(d.spec.id)??0)+1);
   for(const c of this.w.crates)if(!c.held&&inside(c.pos.x,c.pos.z)){
    const key=d.spec.id+'/'+c.id,samples=this.looseGaps.get(key)??[];samples.push(c.pos.y-c.half.y-top);this.looseGaps.set(key,samples);
   }
  }
 }
 tick(seconds:number,input:Input=idle){for(let i=0;i<Math.ceil(seconds*hz);i++)this.step(input);}
 until(predicate:()=>boolean,seconds:number,label:string,input:Input=idle){
  for(let i=0;i<Math.ceil(seconds*hz);i++){if(predicate())return;this.step(input);}
  assert.ok(predicate(),label+'; '+this.detail());
 }
 look(target:Vector3){const d=target.clone().sub(this.w.eye());assert.ok(d.length()>.001);this.w.yaw=Math.atan2(-d.x,-d.z);this.w.pitch=Math.asin(d.y/d.length());}
 walk(x:number,z:number,seconds=14){
  for(let i=0;i<Math.ceil(seconds*hz);i++){
   if(this.w.campaignResult)return;
   const dx=x-this.w.player.pos.x,dz=z-this.w.player.pos.z;
   if(Math.hypot(dx,dz)<.16){this.tick(.1);return;}
   this.w.yaw=Math.atan2(-dx,-dz);this.w.pitch=0;this.step(forward);
  }
  assert.fail('Native WASD blocked toward '+[x,z]+'; '+this.detail());
 }
 /** The projector intentionally sees through game glass; cargo and opaque Rapier shapes occlude. */
 clearRay(target:Vector3,ignoreIds:string[]=[],throughGlass=false){
  const eye=this.w.eye(),delta=target.clone().sub(eye),distance=delta.length();
  const hit=this.w.physics.castRay(new RAPIER.Ray(eye,delta.normalize()),Math.max(0,distance-.07),true,undefined,undefined,this.w.characterCollider,undefined,c=>{
   const fixed=this.w.fixed.get(c.handle);if(fixed&&(ignoreIds.includes(fixed.id)||(throughGlass&&fixed.kind==='glass')))return false;
   for(const [id,body]of this.w.doors)if(body.collider.handle===c.handle&&ignoreIds.includes(id))return false;
   return true;
  });
  assert.equal(hit,null,'Actual native ray is occluded before '+target.toArray()+'; '+this.detail());
 }
 shot(index:0|1,surfaceId:string,point:Vector3){
  const surface=this.w.surfaces.find(s=>s.id===surfaceId);assert.ok(surface,'Missing white host '+surfaceId);
  assert.ok(this.w.eye().clone().sub(surface.center).dot(surface.normal)>0,'Shot approaches host from behind');
  this.look(point);this.clearRay(point,[surface.solidId],true);
  assert.equal(this.w.place(index,surfaceId,point),true,'Aimed visible aperture rejected; '+this.detail());
  assert.ok(this.w.portals[index]!.center.distanceTo(point)<.04,'Placement unexpectedly clamped away from the planned walking anchor');
 }
 enter(index:0|1){
  const p=this.w.portals[index];assert.ok(p);const before=this.w.player.crossings;
  this.look(p.center.clone().addScaledVector(p.normal,-2));
  this.until(()=>this.w.player.crossings>before,3,'Ordinary portal approach never crosses',forward);
  assert.equal(this.w.player.crossings,before+1);this.tick(.18);
 }
 /** Same dispatch as KeyE: visible control first, otherwise actual pickup/drop. */
 e(){if(!this.w.interact())this.w.grabDrop();this.step();}
 pickup(id:string){
  assert.equal(this.w.heldId,undefined);
  // Reacquire the actual moving/settled cube after every step. Authored coordinates
  // only define route waypoints; they are never treated as a pickup target later.
  let ready=false;
  for(let i=0;i<4*hz;i++){
   const c=this.cube(id),delta=c.pos.clone().sub(this.w.player.pos),horizontal=Math.hypot(delta.x,delta.z);
   assert.ok(horizontal>.001,'Player overlaps pickup target; '+this.detail());
   const local=V(delta.x/horizontal,0,delta.z/horizontal).applyQuaternion(c.rotation.clone().invert());
   const support=Math.abs(local.x)*c.half.x+Math.abs(local.y)*c.half.y+Math.abs(local.z)*c.half.z;
   assert.ok(horizontal>support+this.w.player.half.x+.06,'Pickup approach already touched/pushed actual cargo; '+this.detail());
   this.look(c.pos);
   if(horizontal<=2&&c.pos.distanceTo(this.w.eye())<3){ready=true;break;}
   this.step(forward);
  }
  assert.ok(ready,'Could not approach current actual cargo without contact; '+this.detail());
  this.look(this.cube(id).pos);
  assert.match(this.w.interactionHint(),/Pick up/,'Native E cannot see/reach requested cargo; '+this.detail());
  this.e();assert.equal(this.w.heldId,id,'E picked the wrong thing; '+this.detail());
 }
 control(id:string){
  assert.equal(this.w.heldId,undefined,'Native controls cannot be used while holding cargo');
  const d=this.device(id),point=d.position.clone().add(V(...(d.spec.controlOffset??[0,0,0])));
  this.look(point);this.clearRay(point,[id]);assert.match(this.w.interactionHint(),/Use/,'Control is not a visible reachable E target; '+this.detail());
  assert.equal(this.w.interact(),true);this.step();
 }
 dropAt(id:string,x:number,z:number,aimY:number,standX:number,standZ:number){
  assert.equal(this.w.heldId,id);this.walk(standX,standZ);this.look(V(x,aimY,z));this.tick(.35);this.e();
  assert.equal(this.w.heldId,undefined);this.tick(.8);
 }
 dropPad(id:string,pad:string,standX:number,standZ:number){
  const p=this.pad(pad);this.dropAt(id,p.pos.x,p.pos.z,p.pos.y+1.06,standX,standZ);
  assert.equal(p.crateId,id,'Actual released cargo does not maintain pressure; '+this.detail());
 }
 arrive(id:string,label:string,seconds=12){
  const d=this.device(id),stop=d.spec.stops?.find(s=>s.label===label);assert.ok(stop,'Missing authored stop '+label);
  this.until(()=>!d.moving&&d.position.distanceTo(V(...stop.position))<.03,seconds,'Carrier never reaches actual '+label);
  this.tick(.15);assert.equal(this.w.machines.flags['at:'+id+':'+label],true);
 }
 finish(id:string){assert.equal(this.w.campaignResult?.exit,id,this.detail());assert.equal(this.w.campaignResult?.goalMatched,true);assert.equal(this.w.respawns,0,'Route relied on an unrequested respawn');}
 noCargoAction(){assert.equal(this.events.filter(e=>e.type==='pickup').length,0);}
}

function withRoute(number:number,contrast:boolean,run:(r:NativeRoute)=>void){const r=new NativeRoute(number,contrast);try{run(r);}finally{r.dispose();}}
function upperSix(r:NativeRoute){
 r.walk(5,8);r.shot(0,'source-east',V(7.985,1.55,8));r.shot(1,'upper-west',V(-7.985,4.35,-8));
 r.walk(6.7,8);r.enter(0);assert.ok(r.w.player.pos.y>3.5);r.walk(-4,-8);r.walk(-4,-11);r.walk(-4,-14.7);r.finish('north-exit');
}
function enterPowerSix(r:NativeRoute){
 r.walk(0,2);r.shot(0,'source-east',V(7.985,1.55,2));r.shot(1,'power-west',V(-7.985,1.55,2));r.walk(6.7,2);r.enter(0);r.walk(-6.8,2);
}
function hubSeven(r:NativeRoute){
 r.shot(0,'operations-white',V(0,1.55,14.985));r.shot(1,'hub-white',V(.55,1.55,2.765));r.walk(0,13.7);r.enter(0);r.walk(-4,4);
}
function eastSeven(r:NativeRoute){r.walk(-7,3);r.control('transfer-deck');r.arrive('transfer-deck','east');}
function northExitSeven(r:NativeRoute){r.walk(-4,4);r.walk(-4,-6);r.walk(-4,-12.5);r.finish('north-exit');}
function eastExitSeven(r:NativeRoute,expectWin=true){r.walk(3,3);r.walk(3,0);r.walk(12,-1);r.walk(16.5,-1);if(expectWin)r.finish('east-exit');}
function freightEight(r:NativeRoute,heldDuringAscent:boolean){
 r.walk(-5,8.8);r.pickup('cube');r.walk(0,3);r.dropAt('cube',0,-.6,1.2,0,1.2);
 assert.ok(Math.abs(r.cube('cube').pos.y-.55)<.12,'Cargo was not really staged on deck');r.control('freight-lift');
 if(heldDuringAscent){r.tick(.15);r.pickup('cube');r.look(V(0,r.w.eye().y,-3));}
 r.arrive('freight-lift','upper');assert.ok(r.w.player.pos.y>4.95&&r.w.player.grounded,r.detail());
 assert.ok((r.ridingFrames.get('freight-lift')??0)>120,'No actual capsule carriage was observed');
 if(!heldDuringAscent){
  const gaps=r.looseGaps.get('freight-lift/cube')??[];assert.ok(gaps.length>120,'No real loose-cargo transit samples');assert.ok(gaps.every(g=>Math.abs(g)<.18),'Loose cargo failed actual deck support');
  assert.equal(r.cube('cube').held,false);assert.ok(r.cube('cube').pos.y>4.6);r.pickup('cube');
 }else assert.equal(r.w.heldId,'cube');
 r.walk(0,-3);r.walk(0,-6);r.walk(5,-6);r.dropPad('cube','upper-button',5,-5.2);
 r.walk(0,-6);r.walk(-5,-8);r.walk(-5,-12.7);r.finish('upper-exit');
}
function retrieveNineA(r:NativeRoute){
 r.shot(0,'source-south',V(0,1.55,13.985));r.shot(1,'low-west',V(-10.985,1.55,-8));r.walk(0,12.7);r.enter(0);
 r.walk(-8.8,-8);r.pickup('cube-a');r.walk(-9.7,-8);r.enter(1);assert.equal(r.w.heldId,'cube-a');assert.ok(r.cube('cube-a').crossings>0);
}
function retrieveNineB(r:NativeRoute){
 r.walk(7,3);r.walk(7,-2);r.control('storage-lift');r.arrive('storage-lift','gallery');assert.ok(r.w.player.pos.y>4.15&&r.w.player.grounded);
 r.walk(7,-7.2);r.pickup('cube-b');r.walk(4,-6);r.walk(4,-3);
 // An actual held descent beside the well is valid delivery, not a hidden must-ride-down chore.
 r.until(()=>r.w.player.grounded&&r.w.player.pos.y<1,3,'Cargo route never lands on real lower floor');assert.equal(r.w.heldId,'cube-b');
 r.walk(4,3);
}
function stairsTen(r:NativeRoute){r.walk(-10,10.8);r.walk(-10,-2);assert.ok(r.w.player.pos.y>2.8);r.walk(-4.2,-2);assert.ok(r.w.player.pos.y>4.95&&r.w.player.grounded,r.detail());}
function upperExitTen(r:NativeRoute){
 r.walk(-4.2,-5);r.dropPad('cube','upper-button',-4.2,-5);r.walk(-4.2,-4);r.walk(-9,-4);r.walk(-10.5,-5);r.walk(-14.7,-5);r.finish('upper-exit');
}

for(const number of [6,7,8,9,10])test('native C'+number+' base/contrast retain identical physical inventory and wiring',{concurrency:false},()=>{
 const a=new NativeRoute(number),b=new NativeRoute(number,true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.deepEqual(a.w.level.optics,b.w.level.optics);}finally{a.dispose();b.dispose();}
});
test('native C6 base preserves initial north pressure while using the raised portal route',{concurrency:false},()=>withRoute(6,false,r=>{
 assert.equal(r.pad('north-button').crateId,'cube');assert.ok(r.device('north-door').progress>.5);upperSix(r);assert.equal(r.pad('north-button').crateId,'cube');r.noCargoAction();
}));
test('native C6 pickup really closes north and physical replacement restores a complete north route',{concurrency:false},()=>withRoute(6,false,r=>{
 enterPowerSix(r);r.pickup('cube');r.walk(-6.5,3.5);r.tick(1);assert.equal(r.pad('north-button').pressed,false);assert.ok(r.device('north-door').progress<.05,r.detail());
 r.dropPad('cube','north-button',-6.8,2);r.tick(.8);assert.ok(r.device('north-door').progress>.95);r.walk(-6.7,2);r.enter(1);upperSix(r);
 assert.equal(r.events.filter(e=>e.type==='pickup').length,1);
}));
test('native C6 contrast carries the same cube to south and opens the real opposed route',{concurrency:false},()=>withRoute(6,true,r=>{
 enterPowerSix(r);r.pickup('cube');r.walk(-6.7,2);r.enter(1);assert.equal(r.w.heldId,'cube');r.dropPad('cube','south-button',5.8,6);
 assert.equal(r.pad('north-button').pressed,false);assert.ok(r.device('north-door').progress<.05);assert.ok(r.device('south-door').progress>.95);r.walk(4,10.5);r.walk(4,14.7);r.finish('south-exit');
}));
test('native C7 base walks the already parked north bridge without a control command',{concurrency:false},()=>withRoute(7,false,r=>{
 hubSeven(r);northExitSeven(r);assert.equal(r.events.filter(e=>e.type==='lift-motor').length,0);r.noCargoAction();
}));
test('native C7 contrast selects actual east alignment and crosses its different dock',{concurrency:false},()=>withRoute(7,true,r=>{
 hubSeven(r);eastSeven(r);assert.equal(r.w.machines.flags['at:transfer-deck:north'],false);eastExitSeven(r);
}));
test('native C7 wrong east destination stays recoverable and restoring north removes the actual mistake',{concurrency:false},()=>withRoute(7,false,r=>{
 hubSeven(r);eastSeven(r);eastExitSeven(r,false);assert.equal(r.w.campaignResult,undefined);assert.ok(r.events.some(e=>e.type==='wrong-exit'&&e.data.exit==='east-exit'));
 r.walk(12,-1);r.walk(3,0);r.walk(3,3);r.control('transfer-deck');r.arrive('transfer-deck','north');northExitSeven(r);
}));
test('native C7 an actual missed edge lands in the basin and returns by authored stairs',{concurrency:false},()=>withRoute(7,false,r=>{
 hubSeven(r);r.walk(-7,5.8);r.look(V(-12,r.w.eye().y,5.8));r.tick(.65,forward);
 r.until(()=>r.w.player.grounded&&r.w.player.pos.y< -3.3,3,'Actual fall missed bounded catch floor');assert.equal(r.w.respawns,0);
 // Lead-authored broad Z-flight replaces the failed narrow X-flight. The real west
 // aisle reaches its north low end; its real top landing then joins the hub.
 r.walk(-14.2,5.7);r.walk(-14.2,-9.5);r.walk(-12.5,-9.5);r.walk(-12.5,4.4);r.walk(-7.5,4.4);
 assert.ok(r.w.player.pos.y>.8&&r.w.player.grounded,'Authored catch stairs do not return to hub; '+r.detail());northExitSeven(r);
}));
for(const held of [false,true])test('native C8 actual freight ascent and upper delivery; held during movement='+held,{concurrency:false},()=>withRoute(8,false,r=>freightEight(r,held)));
test('native C8 contrast keeps cargo at lower receiving pressure and uses its real door',{concurrency:false},()=>withRoute(8,true,r=>{
 r.walk(-5,8.8);r.pickup('cube');r.dropPad('cube','lower-button',-5,4.8);assert.equal(r.pad('upper-button').pressed,false);assert.ok(r.device('upper-door').progress<.05);assert.ok(r.device('lower-door').progress>.95);
 r.walk(-3,5);r.walk(6,5);r.walk(8,7);r.walk(11.7,7);r.finish('lower-exit');
}));
for(const choice of ['cube-a','cube-b'] as const)test('native C9 permission accepts the actual '+choice+' retrieval route for east',{concurrency:false},()=>withRoute(9,false,r=>{
 if(choice==='cube-a')retrieveNineA(r);else retrieveNineB(r);r.dropPad(choice,'east-button',6,8.8);r.walk(8,9);r.walk(13.7,9);r.finish('east-exit');
  assert.equal(r.events.filter(e=>e.type==='pickup'&&e.data.body!==choice).length,0,'The optional other cube was incorrectly required');
}));
for(const swapped of [false,true])test('native C9 both-pressure contrast accepts either actual assignment and recovers removal; swapped='+swapped,{concurrency:false},()=>withRoute(9,true,r=>{
 const a=swapped?'west-button-b':'west-button-a',b=swapped?'west-button-a':'west-button-b';
 retrieveNineA(r);r.dropPad('cube-a',a,r.pad(a).pos.x,6.8);assert.ok(r.device('west-door').progress<.05,'One cube replaces the required two pressures');
 r.walk(3,8);retrieveNineB(r);r.walk(4,8.8);assert.equal(r.pad(a).crateId,'cube-a','Second-cargo approach disturbed the first real pressure; '+r.detail());
 r.dropPad('cube-b',b,r.pad(b).pos.x,6.8);assert.ok(r.device('west-door').progress>.95,r.detail());assert.notEqual(r.pad(a).crateId,r.pad(b).crateId);
 r.walk(r.pad(a).pos.x,6.8);r.pickup('cube-a');r.walk(r.pad(a).pos.x,8.8);r.tick(1);assert.equal(r.pad(a).pressed,false);assert.ok(r.device('west-door').progress<.05);
 r.dropPad('cube-a',a,r.pad(a).pos.x,6.8);r.walk(-8,8);r.walk(-10,9);r.walk(-13.7,9);r.finish('west-exit');
}));
test('native C10 base permits actual cargo ascent on the broad stairs without riding',{concurrency:false},()=>withRoute(10,false,r=>{
 r.walk(-5.2,10);r.pickup('cube');r.walk(-7,11);r.walk(-10,11);stairsTen(r);upperExitTen(r);assert.equal(r.events.filter(e=>e.type==='lift-motor').length,0);
}));
test('native C10 base also permits actual lift carriage instead of treating optional as forbidden',{concurrency:false},()=>withRoute(10,false,r=>{
 r.walk(-5.2,10);r.pickup('cube');r.walk(-1.8,3);r.dropAt('cube',.4,-.7,1.2,.4,1.1);r.walk(-1.4,1);r.control('service-lift');r.arrive('service-lift','upper');
 assert.ok((r.ridingFrames.get('service-lift')??0)>120);assert.ok(r.cube('cube').pos.y>4.6);r.pickup('cube');r.walk(-4.2,0);r.walk(-4.2,-2);upperExitTen(r);
}));
test('native C10 contrast parks the upper bridge from fixed floor and reaches SIDE without a ride/cargo chore',{concurrency:false},()=>withRoute(10,true,r=>{
 const untouched=r.cube('cube').pos.clone();r.walk(-4,3);r.walk(-2.2,2.6);r.control('service-lift');
 r.tick(.3);assert.equal(r.w.machines.flags['at:service-lift:upper'],false);assert.ok(r.device('side-door').progress<.05,'Selected stop powered a door before physical docking');
 r.arrive('service-lift','upper');assert.ok(r.w.player.pos.y<1&&r.w.player.grounded);assert.equal(r.ridingFrames.get('service-lift')??0,0);
 r.until(()=>r.device('side-door').progress>.95,1.2,'Docked side leaf did not finish its actual opening');assert.ok(r.device('side-door').progress>.95,r.detail());
 r.walk(-4,3);r.walk(-4,11);r.walk(-10,11);stairsTen(r);r.walk(-4.2,0);r.walk(0,0);r.walk(4.2,0);r.walk(14.7,0);r.finish('side-exit');r.noCargoAction();assert.ok(r.cube('cube').pos.distanceTo(untouched)<.05,'Unrelated cargo was disturbed/required');
}));
