/** Unregistered16/17 authored-spawn native paths; never browser or language-mastery proof.
 * Only ordinary step input, camera aim and actual ray-checked portal placement mutate
 * the world. No body pose/velocity, machine choice, goal/history/save or reset writes.
 * Execute only in the lead-assigned serial native slot; preserve every failed run.
 */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import RAPIER from '@dimforge/rapier3d-compat';
import {CoreWorld,initializePhysics} from '../src/core/world';
import {draftComparisonLevels} from '../src/core/levels/comparisons';
import {V,type Input} from '../src/physics';
import type {Vector3} from 'three';
const dt=1/120,idle:Input={forward:0,strafe:0,jump:false},forward:Input={...idle,forward:1};
const evidenceBase=process.env.RIFT_COMPARISON_MACHINERY==='1'?'docs/core-levels/comparisons-18-20':'docs/core-levels/momentum-16-17';
const output=process.env.RIFT_MOMENTUM_RUN?join(evidenceBase,process.env.RIFT_MOMENTUM_RUN):join('work/chamber-qa/momentum','unit-'+Date.now());
before(initializePhysics);

type Flight={entry?:Record<string,unknown>;exit?:number[];exitVelocity?:number[];exitUprightFit?:boolean;exitLocal?:number[];land?:number[];ground?:string;peak:number;samples:unknown[];approach:unknown[];priorLands:unknown[];ceilingContacts:unknown[]};
type ComparisonNumber=16|17|18|19|20;
class Route {
 readonly w:CoreWorld;readonly events:Record<string,unknown>[]=[];readonly notes:unknown[]=[];readonly barrierContacts:unknown[]=[];
 constructor(readonly number:ComparisonNumber,readonly contrast=false){const definition=draftComparisonLevels.find(l=>l.number===number);assert.ok(definition);this.w=new CoreWorld(number,(type,data)=>this.events.push({type,time:this.w?.time??0,...data}),definition,contrast);assert.ok(this.w.player.pos.distanceTo(V(...this.w.blueprint.spawn))<.05);this.tick(.3);}
 detail(){return JSON.stringify({player:this.w.snapshot().player,portals:this.w.snapshot().portals,respawns:this.w.respawns,result:this.w.campaignResult,contacts:Array.from({length:this.w.controller.numComputedCollisions()},(_,i)=>this.w.controller.computedCollision(i)).filter(Boolean).map(c=>({id:c.collider?this.w.fixed.get(c.collider.handle)?.id:undefined,normal:c.normal1,witness:c.witness1,applied:c.translationDeltaApplied,remaining:c.translationDeltaRemaining})),events:this.events.slice(-8)});}
 step(input:Input=idle){this.w.step(dt,input);for(let i=0;i<this.w.controller.numComputedCollisions();i++){const c=this.w.controller.computedCollision(i),id=c?.collider?this.w.fixed.get(c.collider.handle)?.id:undefined;if(c&&['approach-east-glazing','receiving-lane-divider'].includes(id??''))this.barrierContacts.push({id,time:this.w.time,p:this.w.player.pos.toArray(),v:this.w.player.vel.toArray(),normal:{...c.normal1},applied:{...c.translationDeltaApplied},remaining:{...c.translationDeltaRemaining}});}}
 tick(s:number,input:Input=idle){for(let i=0;i<Math.ceil(s/dt);i++)this.step(input);}
 look(p:Vector3){const v=p.clone().sub(this.w.eye());this.w.yaw=Math.atan2(-v.x,-v.z);this.w.pitch=Math.asin(v.y/v.length());}
 walk(x:number,z:number,limit=18){for(let i=0;i<limit/dt;i++){if(this.w.campaignResult)return;const dx=x-this.w.player.pos.x,dz=z-this.w.player.pos.z;if(Math.hypot(dx,dz)<.12){this.tick(.12);return;}this.w.yaw=Math.atan2(-dx,-dz);this.w.pitch=0;this.step(forward);}assert.fail('WASD blocked toward '+[x,z]+' '+this.detail());}
 until(test:()=>boolean,limit:number,label:string,input:Input=idle){for(let i=0;i<limit/dt;i++){if(test())return;this.step(input);}assert.ok(test(),label+' '+this.detail());}
 cube(id:string){const c=this.w.crates.find(c=>c.id===id);assert.ok(c);return c;}
 pad(id:string){const p=this.w.pads.find(p=>p.id===id);assert.ok(p);return p;}
 machine(id:string){const m=this.w.machines.devices.find(m=>m.spec.id===id);assert.ok(m);return m;}
 e(){if(!this.w.interact())this.w.grabDrop();this.step();}
 pickup(id:string){assert.equal(this.w.heldId,undefined);let ready=false;for(let i=0;i<4/dt;i++){const c=this.cube(id),d=c.pos.clone().sub(this.w.player.pos),horizontal=Math.hypot(d.x,d.z);assert.ok(horizontal>.001);const local=V(d.x/horizontal,0,d.z/horizontal).applyQuaternion(c.rotation.clone().invert()),support=Math.abs(local.x)*c.half.x+Math.abs(local.y)*c.half.y+Math.abs(local.z)*c.half.z;assert.ok(horizontal>support+.28+.06,'Pickup approach touched actual cargo');this.look(c.pos);if(horizontal<=2&&c.pos.distanceTo(this.w.eye())<3){ready=true;break;}this.step(forward);}assert.ok(ready,'Actual moving cargo out of safe reach');this.look(this.cube(id).pos);assert.match(this.w.interactionHint(),/Pick up/);this.e();assert.equal(this.w.heldId,id);}
 dropPad(id:string,padId:string,x:number,z:number){assert.equal(this.w.heldId,id);const p=this.pad(padId);this.walk(x,z);this.look(p.pos.clone());const c=this.cube(id),local=V(0,1,0).applyQuaternion(c.rotation.clone().invert()),support=Math.abs(local.x)*c.half.x+Math.abs(local.y)*c.half.y+Math.abs(local.z)*c.half.z,releaseY=p.pos.y+support+.2;this.w.pitch=Math.asin(Math.max(-.8,Math.min(.8,(releaseY-(this.w.player.pos.y+.15))/1.8)));this.tick(.4);this.e();this.tick(1.2);assert.equal(this.w.heldId,undefined);assert.equal(p.crateId,id,'Released cargo must really maintain pressure '+this.detail());this.notes.push({stage:'actual-pressure-delivery',id,padId,cargo:this.w.snapshot().crates});}
 slotDelivery(id:string,padId:string,x:number,pitch:number){assert.equal(this.w.heldId,id);this.walk(x,3);this.w.yaw=0;this.w.pitch=pitch;this.until(()=>this.w.player.pos.z<=1.0,3,'Native slot approach blocked',forward);this.tick(.5);this.e();this.tick(1);assert.equal(this.w.heldId,undefined);assert.equal(this.pad(padId).crateId,id,'Real cargo never reached receiving pressure '+this.detail());}
 enter(index:0|1){const p=this.w.portals[index];assert.ok(p);const n=this.w.player.crossings;this.look(p.center.clone().addScaledVector(p.normal,-2));this.until(()=>this.w.player.crossings>n,3,'Actual aimed pair never traversed',forward);assert.equal(this.w.player.crossings,n+1);this.tick(.18,forward);}
 shot(i:0|1,id:string,p:Vector3){const host=this.w.surfaces.find(s=>s.id===id);assert.ok(host);this.look(p);assert.ok(this.w.eye().clone().sub(host.center).dot(host.normal)>0,'Back face shot');const v=p.clone().sub(this.w.eye()),range=v.length();const hit=this.w.physics.castRay(new RAPIER.Ray(this.w.eye(),v.normalize()),range-.07,true,undefined,undefined,this.w.characterCollider,undefined,c=>{const s=this.w.fixed.get(c.handle);return !(s&&(s.id===host.solidId||s.kind==='glass'));});assert.equal(hit,null,'Native opaque ray blocked '+id+' '+this.detail());assert.ok(this.w.place(i,id,p),'Rejected full aperture '+this.detail());assert.ok(this.w.portals[i]!.center.distanceTo(p)<.07,'Placement clamped beyond ordinary surface offset');}
 setup(deep:boolean,zOutput:number,sourceZ?:number,sourceX=0,outputZ=0){const x=deep?3:-5,y=deep?-17.975:-2.975,z=sourceZ??(deep?-1.1:3.1);this.walk(-1,7.3);this.walk(x+sourceX,7.3);this.walk(x+sourceX,6.45);this.shot(0,deep?'deep-floor':'shallow-floor',V(x+sourceX,y,z));this.shot(1,'launch-white',V(-7.985,9,zOutput+outputZ));this.notes.push({stage:'prepared',state:this.w.snapshot()});}
 runup(x=-5){this.walk(x,7.65);this.w.yaw=0;this.w.pitch=0;for(let i=0;i<2/dt&&this.w.player.pos.z>6.7;i++)this.step(forward);assert.ok(this.w.player.grounded&&this.w.player.vel.z< -4.5,'Run-up did not build actual grounded speed '+this.detail());}
 flight(options:{jump?:boolean;before?:(frame:number,r:Route)=>Input;after?:(frame:number,r:Route)=>Input}={}):Flight{
  this.w.yaw=0;this.w.pitch=0;const crossings=this.w.player.crossings,firstEvent=this.events.length,result:Flight={peak:-Infinity,samples:[],approach:[],priorLands:[],ceilingContacts:[]};
  for(let i=0;i<4/dt&&this.w.player.crossings===crossings;i++){if(i%12===0)result.approach.push({t:i*dt,p:this.w.player.pos.toArray(),v:this.w.player.vel.toArray(),grounded:this.w.player.grounded});this.step(options.before?.(i,this)??{...forward,jump:!!options.jump});}
  result.priorLands=this.events.slice(firstEvent).filter(e=>e.type==='land');
  if(this.w.player.crossings===crossings)this.notes.push({stage:'untraversed-floor-attempt',...result,state:this.w.snapshot()});
  assert.equal(this.w.player.crossings,crossings+1,'Actual fall did not traverse; inspect aperture alignment and blocked-exit events '+this.detail());
  result.entry=this.events.filter(e=>e.type==='enter'&&e.body==='player').at(-1);result.exit=this.w.player.pos.toArray();result.exitVelocity=this.w.player.vel.toArray();result.priorLands=this.events.slice(firstEvent).filter(e=>e.type==='land');result.exitUprightFit=this.w.aperture(this.w.player,this.w.portals[1]!);result.exitLocal=this.w.player.pos.clone().applyMatrix4(this.w.portals[1]!.matrix.clone().invert()).toArray();
  for(let i=0;i<6/dt;i++){
   result.peak=Math.max(result.peak,this.w.player.pos.y);
   if(i%12===0)result.samples.push({t:i*dt,p:this.w.player.pos.toArray(),v:this.w.player.vel.toArray(),grounded:this.w.player.grounded});
   if(this.w.player.grounded){result.land=this.w.player.pos.toArray();result.ground=this.support();break;}
   if(this.w.campaignResult)break;
   this.step(options.after?.(i,this)??idle);
   for(let j=0;j<this.w.controller.numComputedCollisions();j++){const c=this.w.controller.computedCollision(j);if(c&&c.normal1.y< -.3)result.ceilingContacts.push({t:i*dt,id:c.collider?this.w.fixed.get(c.collider.handle)?.id:undefined,p:this.w.player.pos.toArray(),v:this.w.player.vel.toArray(),velocityTimesDt:this.w.player.vel.clone().multiplyScalar(dt).toArray(),normal:c.normal1,applied:c.translationDeltaApplied,remaining:c.translationDeltaRemaining});}
  }
  this.notes.push({stage:'flight',...result,state:this.w.snapshot()});return result;
 }
 support(){const p=this.w.player;return this.w.solids.find(s=>Math.abs(s.max.y+.865-p.pos.y)<.06&&p.pos.x>s.min.x&&p.pos.x<s.max.x&&p.pos.z>s.min.z&&p.pos.z<s.max.z)?.id;}
 landed(f:Flight,id:string){assert.equal(f.ground,id,'Required actual safe grounded receiving floor; '+this.detail());const floor=this.w.solids.find(s=>s.id===id);assert.ok(floor);const p=this.w.player;assert.ok(p.pos.x-p.half.x>=floor.min.x-.015&&p.pos.x+p.half.x<=floor.max.x+.015&&p.pos.z-p.half.z>=floor.min.z-.015&&p.pos.z+p.half.z<=floor.max.z+.015,'Required full safe capsule footprint on receiving floor');assert.equal(this.w.respawns,0);assert.ok(f.entry);assert.ok(Math.abs(Number(f.entry.speed)-Number(f.entry.exitSpeed))<1e-6,'Momentum magnitude changed at the portal');}
 finish(id:string){const point=this.w.blueprint.routePoints[id];assert.ok(point);this.walk(point[0],point[2]);assert.equal(this.w.campaignResult?.exit,id,'Physical exit not earned '+this.detail());assert.equal(this.w.respawns,0);}
 recover(){this.walk(-1,10);this.walk(-5,10);const d=this.w.machines.devices.find(d=>d.spec.id==='recovery-lift');assert.ok(d);this.look(d.position.clone().add(V(...d.spec.controlOffset!)));assert.ok(this.w.interact(),'Real visible recovery E did not reach riding panel '+this.detail());for(let i=0;i<25/dt&&d.position.y<-.201;i++)this.step();assert.ok(d.position.y>-.201,'Recovery never reached real upper dock');assert.ok(this.w.player.grounded&&this.w.player.pos.y>.8,'Recovery lift did not carry actual capsule');this.walk(-1,10);assert.equal(this.w.respawns,0);this.notes.push({stage:'recovered',state:this.w.snapshot()});}
 close(name:string,error?:unknown){mkdirSync(output,{recursive:true});writeFileSync(join(output,name+'.json'),JSON.stringify({scope:'Unregistered authored-spawn native trajectory/route; no pose/velocity/goal/save/reset injection, no browser claim.',number:this.number,contrast:this.contrast,error:error?String(error):null,notes:this.notes,events:this.events,barrierContacts:this.barrierContacts,final:this.w.snapshot()},null,2)+'\n');this.w.dispose();}
}
function run(name:string,number:ComparisonNumber,contrast:boolean,fn:(r:Route)=>void){const r=new Route(number,contrast);let error:unknown;try{fn(r);}catch(e){error=e;throw e;}finally{r.close(name,error);}}

for(const number of [16,17] as const)test('native C'+number+' comparison keeps identical physical alternatives',()=>{const r=new Route(number),s=new Route(number,true);try{assert.deepEqual(r.w.blueprint,s.w.blueprint);assert.deepEqual(r.w.level.optics,s.w.level.optics);}finally{r.w.dispose();s.w.dispose();}});
test('native C16 deep fall really lands higher and reaches its vestibule',()=>run('16-deep-higher',16,false,r=>{r.setup(true,-6);r.landed(r.flight(),'higher-gallery');r.finish('higher-exit');}));
test('native C16 shallow fall really lands lower and reaches its vestibule',()=>run('16-shallow-lower',16,true,r=>{r.setup(false,-6);r.landed(r.flight(),'lower-gallery');r.finish('lower-exit');}));
test('native C17 deep fall reaches the farther wider floor',()=>run('17-deep-far',17,false,r=>{r.setup(true,6);r.landed(r.flight(),'far-gallery');assert.equal(r.barrierContacts.length,0,'Canonical deep flight must actually clear both physical barriers');r.finish('far-exit');}));
test('native C17 shallow fall reaches the nearer narrower floor',()=>run('17-shallow-near',17,true,r=>{r.setup(false,-6);r.landed(r.flight(),'near-gallery');r.finish('near-exit');}));
test('native C16 changing-fit rim rejection keeps real support and recovers by elevator then recenters',()=>run('16-rim-rejection-recenter',16,false,r=>{
 r.setup(false,-6,.9);r.w.yaw=0;r.w.pitch=0;r.tick(4,{...forward,jump:true});r.notes.push({stage:'actual-rim-rejection',state:r.w.snapshot()});
 assert.equal(r.w.player.crossings,0,'Changing-fit history must reject invalid mapped output');assert.ok(r.w.player.grounded,'Rim rejection must retain actual solid support');
 const floor=r.w.solids.find(s=>s.id===(r.w.player.pos.y< -21?'recovery-basin':'shallow-bottom'));assert.ok(floor);const feet=r.w.player.pos.y-r.w.player.half.y;
 assert.ok(feet>=floor.max.y-.02&&feet<=floor.max.y+.05,'Grounded bit cannot hide a partially embedded capsule');const native=r.w.character.translation();assert.ok(r.w.player.pos.distanceTo(V(native.x,native.y,native.z))<.002,'Native/proxy rim positions disagree');
 if(r.w.player.pos.y> -21){r.walk(-5,-5.2);r.tick(2);}assert.ok(r.w.player.grounded&&r.w.player.pos.y< -21,'Actual bottom opening did not reach basin');r.recover();
 r.setup(false,-6);const f=r.flight();r.landed(f,'lower-gallery');assert.equal(f.priorLands.length,0);assert.equal(f.exitUprightFit,true);assert.equal(r.w.campaignResult,undefined);
}));
test('native C16 a real missed deep aperture can walk out and return without resetting',()=>run('16-deep-missed-aperture-recovery',16,false,r=>{
 r.setup(true,-6);r.walk(4.2,6.45);r.w.yaw=0;r.w.pitch=0;
 for(let i=0;i<3/dt&&!(r.w.player.grounded&&r.w.player.pos.y< -16);i++)r.step(forward);
 assert.equal(r.w.player.crossings,0,'The offset fall unexpectedly entered the aperture');assert.ok(r.w.player.grounded&&Math.abs(r.w.player.pos.y+17.135)<.08,'Miss did not reach the actual deep floor '+r.detail());
 r.walk(4.2,-5.2);r.tick(1.5);assert.ok(r.w.player.grounded&&r.w.player.pos.y< -21,'The real bottom opening is not usable '+r.detail());r.recover();
}));

/** Adversarial legal WASD: alternate lateral directions and select the direction
 * that adds the most northward native air velocity this frame. It changes camera
 * yaw and holds W/Space only; no velocity assignment or synthetic boost exists.
 * Such lateral entry velocity becomes upward exit velocity at the wall portal.
 */
function boostNorth(frame:number,r:Route,jump:boolean):Input{
 if(r.w.player.grounded){r.w.yaw=0;return {...forward,jump};}
 const sign=frame%2?1:-1,v=r.w.player.vel;let best=-1,angle=0;
 for(let i=0;i<=180;i++){const a=i*Math.PI/360,x=sign*Math.sin(a),z=-Math.cos(a),add=Math.min(8*dt,Math.max(0,4.8-v.x*x-v.z*z)),score=-z*add;if(score>best){best=score;angle=a;}}
 r.w.yaw=Math.atan2(-sign*Math.sin(angle),Math.cos(angle));return {...forward,jump};
}
function boostEast(frame:number,r:Route):Input{
 const sign=frame%2?1:-1,v=r.w.player.vel;let best=-1,angle=0;
 for(let i=0;i<=180;i++){const a=i*Math.PI/360,x=Math.cos(a),z=sign*Math.sin(a),add=Math.min(8*dt,Math.max(0,4.8-v.x*x-v.z*z)),score=x*add;if(score>best){best=score;angle=a;}}
 r.w.yaw=Math.atan2(-Math.cos(angle),-sign*Math.sin(angle));return forward;
}
// Deliberately opt-in: the first bounded route run must precede this larger sweep.
// An aperture miss FAILS the case; it cannot count as proof that a shallow launch
// was too weak. Every accepted negative case must genuinely traverse at full fit.
if(process.env.RIFT_MOMENTUM_MATRIX==='1'){
 for(const number of [16,17]as const)for(const jump of [false,true])for(const horizontal of [-.8,0,.8])for(const vertical of [-.68,0,.68]){
  const label=`${number}-shallow-${jump?'jump':'walk'}-x${horizontal}-up${vertical}`;
  test('native comparison matrix '+label,()=>run(label,number,false,r=>{
   // Floor-anchor shift varies actual body entry height at the output. All anchors
   // remain legal on the explicit4×10 source face; wall band fixes output Y9.
   const estimated=jump?1.15:2.45;r.setup(false,number===16?-6:6,estimated+vertical,horizontal,number===16?horizontal:0);if(jump)r.runup(-5+horizontal);
   const f=r.flight({jump,after:(i,route)=>boostEast(i,route)});assert.ok(f.entry,'No actual portal traversal');assert.equal(f.priorLands.length,0,'A bottom landing before entry is not a maximum-energy comparison');assert.equal(f.exitUprightFit,true,'Invalid upright wall fit cannot count as a weak launch');assert.notEqual(f.ground,number===16?'higher-gallery':'far-gallery','Shallow offset/jump route bypasses actual comparison '+r.detail());assert.equal(r.w.campaignResult,undefined);assert.equal(r.w.respawns,0);
  }));
 }
 for(const number of [16,17]as const)for(const jump of [false,true]){
  test('native comparison matrix adversarial air '+number+' jump='+jump,()=>run(number+'-shallow-air-'+jump,number,false,r=>{
   r.setup(false,number===16?-6:6,jump?-1.9:1.5);r.runup();const f=r.flight({before:(i,route)=>boostNorth(i,route,jump),after:boostEast});assert.ok(f.entry);assert.equal(f.priorLands.length,0,'Boosted attempt landed before entering');assert.equal(f.exitUprightFit,true,'Boosted attempt must actually clear the full upright output');assert.notEqual(f.ground,number===16?'higher-gallery':'far-gallery','Legal optimized air input bypasses comparison '+r.detail());assert.equal(r.w.campaignResult,undefined);assert.equal(r.w.respawns,0);
  }));
 }
}

// Bounded diagnostic follow-up is separate from the initial8 and broad matrix.
if(process.env.RIFT_MOMENTUM_ADVANCED==='1'){
 for(const number of [16,17]as const)test('native comparison running jump '+number,()=>run(number+'-running-jump',number,false,r=>{
  r.setup(false,number===16?-6:6,1.15);r.runup();const f=r.flight({jump:true,after:boostEast});assert.equal(f.priorLands.length,0,'First airborne crossing missed; floor landing is not a maximum-energy run-up');assert.equal(f.exitUprightFit,true);assert.notEqual(f.ground,number===16?'higher-gallery':'far-gallery','A genuine shallow running jump reaches requested high/far floor '+r.detail());assert.equal(r.w.campaignResult,undefined);assert.equal(r.w.respawns,0);
 }));
 for(const number of [16,17]as const)for(const jump of [false,true])test('native comparison optimized air '+number+' jump='+jump,()=>run(number+'-optimized-air-'+jump,number,false,r=>{
  r.setup(false,number===16?-6:6,jump?-1.9:1.5);r.runup();const f=r.flight({before:(i,route)=>boostNorth(i,route,jump),after:boostEast});assert.equal(f.priorLands.length,0);assert.equal(f.exitUprightFit,true);assert.notEqual(f.ground,number===16?'higher-gallery':'far-gallery','Optimized legal air inputs bypass the candidate '+r.detail());assert.equal(r.w.campaignResult,undefined);assert.equal(r.w.respawns,0);
 }));
 for(const up of [-.84,.84])test('native comparison mapped-wall rim rejection '+up,()=>run('16-wall-fit-rejection-'+up,16,false,r=>{
  r.setup(false,-6,2.45+up);r.w.yaw=0;r.w.pitch=0;r.tick(4,forward);assert.equal(r.w.player.crossings,0,'Mapped upright fit history must reject rather than pass through its rim');assert.ok(r.w.player.grounded);const floor=r.w.solids.find(s=>s.id===(r.w.player.pos.y< -21?'recovery-basin':'shallow-bottom'));assert.ok(floor);const feet=r.w.player.pos.y-.85;assert.ok(feet>=floor.max.y-.02&&feet<=floor.max.y+.05,'Rim rejection must not embed the grounded capsule');const native=r.w.character.translation();assert.ok(r.w.player.pos.distanceTo(V(native.x,native.y,native.z))<.002);r.notes.push({stage:'boundary-rejection-scope',scope:'Current safe mapped-fit rejection contract. Original expected-traverse diagnostic failures remain preserved separately; rejected entry is not a weak-energy proof.',floorHalfClearance:1.15-.28+.015,wallHalfClearance:1.55-.85+.015,state:r.w.snapshot()});assert.equal(r.w.respawns,0);assert.equal(r.w.campaignResult,undefined);
 }));
}

if(process.env.RIFT_MOMENTUM_SHORTCUT==='1')test('native comparison C17 shallow-near lane cannot jump across to far',()=>run('17-near-to-far-jump',17,false,r=>{
 r.setup(false,-6);r.landed(r.flight(),'near-gallery');r.walk(28,-6);r.w.yaw=Math.PI;r.w.pitch=0;
 for(let i=0;i<2/dt&&r.w.player.pos.z< -3.6;i++)r.step(forward);
 assert.ok(r.w.player.grounded,'Shortcut probe must start with a real grounded near-lane run-up');
 r.step({...forward,jump:true});let reached=false;
 for(let i=0;i<2/dt;i++){r.step(forward);if(r.w.player.grounded&&r.support()==='far-gallery'){reached=true;break;}}
 r.notes.push({stage:'near-to-far-real-jump',reached,state:r.w.snapshot()});assert.equal(reached,false,'Shallow→near route jumps across into far instead of needing the farther fling '+r.detail());assert.equal(r.w.campaignResult,undefined);assert.equal(r.w.respawns,0);
}));

if(process.env.RIFT_MOMENTUM_STAGING==='1'){
 test('native comparison C17 shallow glazing-top jump cannot stage into far',()=>run('17-glazing-top-stage',17,false,r=>{
  r.setup(false,6,1.15);r.runup();const f=r.flight({jump:true,after:boostEast});assert.equal(f.priorLands.length,0);assert.equal(f.exitUprightFit,true);
  assert.ok(r.w.player.grounded&&Math.abs(r.w.player.pos.y-.865-3.2)<.06&&Math.abs(r.w.player.pos.x-8.1)<.5,'Real recipe did not reach the observed glazing support '+r.detail());
  r.notes.push({stage:'actual-glazing-takeoff',state:r.w.snapshot()});r.w.yaw=-Math.PI/2;r.w.pitch=0;r.step({...forward,jump:true});let reached=false;
  for(let i=0;i<3/dt;i++){r.step(forward);if(r.w.player.grounded){reached=r.support()==='far-gallery';break;}}
  r.notes.push({stage:'glazing-stage-outcome',reached,state:r.w.snapshot()});assert.equal(reached,false,'Actual shallow fling→glazing-top→ordinary jump bypasses far comparison '+r.detail());assert.equal(r.w.respawns,0);
 }));
 test('native comparison C17 full-supported near-edge air jump cannot reach far',()=>run('17-near-edge-air-jump',17,false,r=>{
  r.setup(false,-6);r.landed(r.flight(),'near-gallery');r.walk(28,-6);r.w.yaw=Math.PI;r.w.pitch=0;
  for(let i=0;i<2/dt&&r.w.player.pos.z< -3.45;i++)r.step(forward);
  assert.ok(r.w.player.grounded&&r.w.player.pos.z+r.w.player.half.z<=-3,'Near takeoff must remain fully on its real floor');r.notes.push({stage:'full-supported-near-takeoff',state:r.w.snapshot()});r.step({...forward,jump:true});let reached=false;
  for(let frame=0;frame<2/dt;frame++){
   const sign=frame%2?1:-1,v=r.w.player.vel;let best=-1,angle=0;
   for(let i=0;i<=180;i++){const a=i*Math.PI/360,x=sign*Math.sin(a),z=Math.cos(a),add=Math.min(8*dt,Math.max(0,4.8-v.x*x-v.z*z));if(z*add>best){best=z*add;angle=a;}}
   r.w.yaw=Math.atan2(-sign*Math.sin(angle),-Math.cos(angle));r.step(forward);if(r.w.player.grounded){reached=r.support()==='far-gallery';break;}
  }
  r.notes.push({stage:'near-edge-air-outcome',reached,state:r.w.snapshot()});assert.equal(reached,false,'Fully supported shallow→near takeoff with legal air input reaches far '+r.detail());assert.equal(r.w.respawns,0);
 }));
}

if(process.env.RIFT_MOMENTUM_OFFSET==='1')for(const number of [16,17]as const)test('native comparison legal low-entry air '+number,()=>run(number+'-low-entry-optimized-air',number,false,r=>{
 r.setup(false,number===16?-6:6,-2.85);r.runup();const f=r.flight({before:(i,route)=>boostNorth(i,route,true),after:boostEast});assert.equal(f.priorLands.length,0);assert.equal(f.exitUprightFit,true,'This must be a valid mapped upright output');
 assert.notEqual(f.ground,number===16?'higher-gallery':'far-gallery','Legal lower entry offset avoids ceiling and bypasses comparison '+r.detail());assert.equal(r.w.campaignResult,undefined);assert.equal(r.w.respawns,0);
}));

if(process.env.RIFT_MOMENTUM_BARRIERS==='1'){
 test('native C17 revised east barrier physically rejects the old shallow staging route',()=>run('17-revised-east-barrier',17,false,r=>{
  r.setup(false,6,1.15);r.runup();const f=r.flight({jump:true,after:boostEast});assert.equal(f.priorLands.length,0);assert.equal(f.exitUprightFit,true);assert.ok(r.barrierContacts.some((c:any)=>c.id==='approach-east-glazing'&&c.normal.x<-.5),'Must actually collide with the raised physical pane');assert.equal(f.ground,'shaft-sidewalk-east','Must really retain the observed0m approach support');assert.ok(Math.abs(r.w.player.pos.y-.865)<.03);r.walk(6.5,6.7);assert.equal(r.support(),'approach-front');assert.ok(r.w.player.pos.x+.28<8&&r.w.player.pos.z-.28>6&&r.w.player.pos.z+.28<8,'Backstep must earn full safe apron support');r.notes.push({stage:'physical-pane-rejection-safe-backstep',state:r.w.snapshot()});const hits=r.barrierContacts.length;r.setup(true,6);r.landed(r.flight(),'far-gallery');assert.equal(r.barrierContacts.length,hits,'Deep reroute must physically clear the pane');r.finish('far-exit');
 }));
 test('native C17 revised divider physically blocks a full-supported near-to-far air jump',()=>run('17-revised-divider',17,false,r=>{
  r.setup(false,-6);r.landed(r.flight(),'near-gallery');r.walk(28,-6);r.w.yaw=Math.PI;r.w.pitch=0;for(let i=0;i<2/dt&&r.w.player.pos.z< -3.45;i++)r.step(forward);assert.ok(r.w.player.grounded&&r.w.player.pos.z+r.w.player.half.z<=-3);r.step({...forward,jump:true});
  for(let frame=0;frame<2/dt;frame++){const sign=frame%2?1:-1,v=r.w.player.vel;let best=-1,angle=0;for(let i=0;i<=180;i++){const a=i*Math.PI/360,x=sign*Math.sin(a),z=Math.cos(a),add=Math.min(8*dt,Math.max(0,4.8-v.x*x-v.z*z));if(z*add>best){best=z*add;angle=a;}}r.w.yaw=Math.atan2(-sign*Math.sin(angle),-Math.cos(angle));r.step(forward);if(r.w.player.grounded)break;}
  r.notes.push({stage:'revised-divider-outcome',state:r.w.snapshot()});assert.ok(r.barrierContacts.some((c:any)=>c.id==='receiving-lane-divider'&&c.normal.z<-.5),'Must actually strike the authored lane divider');assert.notEqual(r.support(),'far-gallery');assert.equal(r.w.campaignResult,undefined);assert.equal(r.w.respawns,0);
 }));
}

if(process.env.RIFT_MOMENTUM_PROFILES==='1')for(const [target,sourceZ]of [[6.2,0],[8.5,-1.8],[9.5,-2.2]]as const)test('native comparison intermediate-air profile '+target,()=>run('17-profile-'+target,17,false,r=>{
 r.setup(false,6,sourceZ);r.runup();const f=r.flight({before:(i,route)=>{if(!route.w.player.grounded&&-route.w.player.vel.z>=target){route.w.yaw=0;return {...forward,jump:true};}return boostNorth(i,route,true);},after:boostEast});assert.equal(f.priorLands.length,0,'Profile must really enter on first fall');assert.equal(f.exitUprightFit,true);
 let staged=false,reached=f.ground==='far-gallery';const feet=r.w.player.pos.y-.85,paneTop=r.w.solids.find(s=>s.id==='approach-east-glazing')!.max.y;
 if(r.w.player.grounded&&Math.abs(feet-paneTop)<.08&&Math.abs(r.w.player.pos.x-8.1)<.5){staged=true;r.notes.push({stage:'intermediate-actual-pane-top',target,paneTop,state:r.w.snapshot()});r.w.yaw=-Math.PI/2;r.w.pitch=0;r.step({...forward,jump:true});for(let i=0;i<3/dt;i++){r.step(forward);if(r.w.player.grounded)break;}}
 // A first partial-edge support is not allowed to hide an accessible receiver.
 const receiving=r.w.solids.find(s=>s.id==='far-gallery')!;
 if(r.w.player.grounded&&r.w.player.pos.x>receiving.min.x-.4&&Math.abs(r.w.player.pos.y-(receiving.max.y+.865))<r.w.controller.autostepMaxHeight()+.15){r.w.yaw=-Math.PI/2;r.w.pitch=0;r.tick(.5,forward);reached=r.support()==='far-gallery';}
 r.notes.push({stage:'intermediate-profile-outcome',target,staged,reached,state:r.w.snapshot()});if(reached)r.finish('far-exit');assert.equal(reached,false,'Legal intermediate profile stages or directly reaches actual far route '+r.detail());assert.equal(r.w.respawns,0);
}));
if(process.env.RIFT_MOMENTUM_PROFILES==='1')test('native comparison C16 same valid9.5 profile still cannot reach higher',()=>run('16-profile-9.5',16,false,r=>{
 r.setup(false,-6,-2.2);r.runup();const f=r.flight({before:(i,route)=>{if(!route.w.player.grounded&&-route.w.player.vel.z>=9.5){route.w.yaw=0;return {...forward,jump:true};}return boostNorth(i,route,true);},after:boostEast});assert.equal(f.priorLands.length,0);assert.equal(f.exitUprightFit,true);let reached=f.ground==='higher-gallery';const receiving=r.w.solids.find(s=>s.id==='higher-gallery')!;if(r.w.player.grounded&&r.w.player.pos.x>receiving.min.x-.4&&Math.abs(r.w.player.pos.y-(receiving.max.y+.865))<r.w.controller.autostepMaxHeight()+.15){r.w.yaw=-Math.PI/2;r.w.pitch=0;r.tick(.5,forward);reached=r.support()==='higher-gallery';}r.notes.push({stage:'C16-valid-nine-point-five-outcome',reached,state:r.w.snapshot()});if(reached)r.finish('higher-exit');assert.equal(reached,false,'Same legal9.5 shallow entry reaches actual higher route');assert.equal(r.w.respawns,0);
}));

function carrierWaiting(r:Route){r.shot(0,'carrier-source',V(0,1.55,17.985));r.shot(1,'carrier-waiting',V(.55,1.55,5.665));r.walk(0,16.5);r.enter(0);}
function boardCarrier(r:Route,id:'inspection'|'service',finish=true){
 const x=id==='inspection'?-6:6,d=r.machine(id+'-carrier');r.walk(x,6.7);r.walk(x,4.6);
 r.until(()=>!d.moving&&d.position.distanceTo(V(x,-.2,2))<.03,65,'Automatic carrier did not really return');r.walk(x,3);
 r.until(()=>!d.moving&&d.position.distanceTo(V(x,-.2,-10))<.03,30,'Automatic carrier never reached far dock');assert.ok(r.w.player.grounded&&Math.abs(r.w.player.pos.x-x)<1.7&&r.w.player.pos.z< -8,'Actual rider was not transported');
 r.tick(.9);assert.equal(r.w.machines.flags['at:'+id+'-carrier:FAR'],true);r.walk(x,-13.5);if(finish)r.finish(id+'-exit');
}

/** Stronger front-corner counterexample: actual first hop builds legal momentum
 * on the real left bank, then a fully-supported second takeoff curves around
 * the physical divider end. The test never invents an initial launch velocity.
 */
if(process.env.RIFT_COMPARISON_CORNERS==='1')test('native C18 actual front-corner air path cannot exchange arrival banks',()=>run('18-front-corner',18,true,r=>{
 carrierWaiting(r);boardCarrier(r,'inspection',false);const dx=Math.sqrt(3)/2,dz=.5;
 r.walk(-8.732,-15.74);r.w.yaw=Math.atan2(-dx,-dz);r.w.pitch=0;r.until(()=>r.w.player.pos.x>=-7.03,2,'Real first-hop run-up blocked',forward);r.step({...forward,jump:true});
 for(let frame=0;frame<2/dt;frame++){
  const sign=frame%2?1:-1,v=r.w.player.vel;let best=-1,angle=0;
  for(let i=0;i<=180;i++){const a=i*Math.PI/360,x=dx*Math.cos(a)-dz*sign*Math.sin(a),z=dz*Math.cos(a)+dx*sign*Math.sin(a),add=Math.min(8*dt,Math.max(0,4.8-v.x*x-v.z*z)),score=(dx*x+dz*z)*add;if(score>best){best=score;angle=a;}}
  const x=dx*Math.cos(angle)-dz*sign*Math.sin(angle),z=dz*Math.cos(angle)+dx*sign*Math.sin(angle);r.w.yaw=Math.atan2(-x,-z);r.step(forward);if(r.w.player.grounded)break;
 }
 r.notes.push({stage:'actual-buildup-landing',state:r.w.snapshot()});r.w.yaw=Math.atan2(-2.8,-3.9);r.step(forward);r.notes.push({stage:'actual-settled-full-supported-takeoff',state:r.w.snapshot()});const p=r.w.player;assert.ok(p.grounded&&Math.abs(p.pos.y-.865)<.04&&p.pos.x-.28>=-10&&p.pos.x+.28<=-2&&p.pos.z-.28>=-20&&p.pos.z+.28<=-12,'Corner takeoff must be fully supported on the real left bank '+r.detail());
 r.w.yaw=-Math.PI/2;r.w.pitch=0;r.step({...forward,jump:true});r.w.yaw=0;
 for(let i=0;i<2/dt;i++){r.step(forward);if(r.w.player.grounded)break;}
 if(r.w.player.grounded&&Math.abs(r.w.player.pos.y-.865)<.08&&r.w.player.pos.x>1.7){r.w.yaw=0;r.tick(.2,forward);}
 const reached=r.w.player.grounded&&Math.abs(r.w.player.pos.y-.865)<.05&&r.w.player.pos.x-.28>=2&&r.w.player.pos.x+.28<=10&&r.w.player.pos.z+.28<=-12;
 r.notes.push({stage:'actual-front-corner-outcome',reached,state:r.w.snapshot()});if(reached){r.until(()=>r.machine('service-door').progress>.95,65,'Service dock never physically reopened');r.walk(6,-14);r.finish('service-exit');}assert.equal(reached,false,'Actual fast carrier arrival jumps around divider end into slower carrier destination '+r.detail());assert.equal(r.w.respawns,0);
}));
function powerAndAim(r:Route,upper:boolean){
 r.walk(-6,12);r.pickup('power-cube');r.dropPad('power-cube','emitter-power',-6,8);
 r.walk(8.5,12.5);r.shot(0,'beam-source',V(10.985,1.55,8));if(!upper)r.walk(-1,12.5);r.shot(1,upper?'upper-return':'lower-return',V(upper?5:-5,upper?4.95:1.55,-13.985));r.tick(.15);
 assert.equal(r.w.beams.get('comparison-emitter')?.receiver,upper?'upper-light':'lower-light','Real optical path did not reach chosen lens '+r.detail());
}
function receiverExit(r:Route,upper:boolean){
 r.walk(r.w.player.pos.x,12.5);r.walk(8.5,12.5);r.walk(9.5,8);r.enter(0);r.walk(upper?7.5:-7.5,-12);r.tick(.9);
 assert.equal(r.w.machines.flags[upper?'upper-light':'lower-light'],true);assert.ok(r.machine(upper?'upper-door':'lower-door').progress>.95);assert.ok(r.machine(upper?'lower-door':'upper-door').progress<.05);
 r.walk(upper?9:-9,-10);r.finish(upper?'upper-exit':'lower-exit');
}

// Source-only preparation until a separate14-case machinery slot is granted.
if(process.env.RIFT_COMPARISON_MACHINERY==='1'){
 for(const number of [18,19,20]as const)test('native C'+number+' comparison uses identical actual hardware in both missions',()=>{const a=new Route(number),b=new Route(number,true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.deepEqual(a.w.level.optics,b.w.level.optics);}finally{a.w.dispose();b.w.dispose();}});
 for(const contrast of [false,true])test('native C18 actual '+(contrast?'slower':'faster')+' carrier reaches its physical dock',()=>run('18-'+(contrast?'slower':'faster'),18,contrast,r=>{carrierWaiting(r);boardCarrier(r,contrast?'service':'inspection');}));
 test('native C18 equal12m lanes physically travel at2 versus1 metres per second',()=>run('18-actual-speeds',18,false,r=>{
  const a=r.machine('inspection-carrier'),b=r.machine('service-carrier');r.until(()=>r.w.time>=8.5,10,'Actual dwell clock did not advance');assert.ok(a.moving&&b.moving);const pa=a.position.clone(),pb=b.position.clone(),ta=r.w.time;r.tick(.5);const duration=r.w.time-ta;assert.ok(Math.abs(a.position.distanceTo(pa)/duration-2)<.001);assert.ok(Math.abs(b.position.distanceTo(pb)/duration-1)<.001);assert.equal(V(...a.spec.position).distanceTo(V(...a.spec.target!)),12);assert.equal(V(...b.spec.position).distanceTo(V(...b.spec.target!)),12);
 }));
 test('native C18 a real missed bank reaches catch and returns by actual27tread stair',()=>run('18-catch-return',18,false,r=>{
  carrierWaiting(r);r.walk(-10.5,4.8);r.look(V(-10.5,r.w.eye().y,-3));r.tick(1.3,forward);r.until(()=>r.w.player.grounded&&r.w.player.pos.y< -4,3,'Miss did not reach real catch');r.walk(-13,-2.6);r.walk(-13,15.4);assert.ok(r.w.player.grounded&&r.w.player.pos.y>.8);assert.equal(r.w.respawns,0);
 }));
 test('native C19 small actual slot plus large wide receiving delivery opens physical AND exit',()=>run('19-base-delivery',19,false,r=>{
  assert.ok(Math.abs(r.cube('small-cube').rigid.mass()-12)<.001&&Math.abs(r.cube('large-cube').rigid.mass()-12)<.001,'Size comparison must not invent a weight difference');r.walk(-4,9);r.pickup('small-cube');r.slotDelivery('small-cube','narrow-receiver',-4,-.27);assert.ok(r.machine('sorter-door').progress<.05);r.walk(4,9);r.pickup('large-cube');r.slotDelivery('large-cube','wide-receiver',4,-.20);r.until(()=>r.machine('service-door').progress>.95&&r.machine('sorter-door').progress>.95,2,'Actual two-pressure AND failed');r.walk(0,3);r.walk(0,-3);r.finish('sorter-exit');
 }));
 test('native C19 changed assignment delivers large by the genuine fullsize SERVICE path',()=>run('19-contrast-fullsize',19,true,r=>{
  r.walk(-4,9);r.pickup('small-cube');r.slotDelivery('small-cube','wide-receiver',4,-.27);r.until(()=>r.machine('service-door').progress>.95,2,'Small wide delivery never opened SERVICE');r.walk(6.5,3);r.walk(6.5,9);r.walk(4,9);r.pickup('large-cube');r.walk(0,3);r.walk(0,-3);r.dropPad('large-cube','narrow-receiver',-4,-3.2);r.until(()=>r.machine('sorter-door').progress>.95,2,'Swapped real pressure assignment failed');r.walk(0,-4);r.finish('sorter-exit');
 }));
 test('native C19 wrong large narrow-slot attempt stays near and can recover via wide delivery',()=>run('19-large-slot-recovery',19,false,r=>{
  r.walk(4,9);r.pickup('large-cube');r.walk(-4,2.9);r.w.yaw=0;r.w.pitch=-.20;r.tick(.6);assert.ok(r.cube('large-cube').pos.z>1.1,'Larger physical collider passed1.04slot');assert.equal(r.pad('narrow-receiver').pressed,false);assert.equal(r.pad('wide-receiver').pressed,false);assert.ok(r.machine('service-door').progress<.05);r.walk(-4,5);r.slotDelivery('large-cube','wide-receiver',4,-.20);r.walk(-4,9);r.pickup('small-cube');r.notes.push({stage:'real-rotated-small-fullsize-recovery',cargo:r.w.snapshot().crates});r.walk(0,3);r.walk(0,-3);r.dropPad('small-cube','narrow-receiver',-4,-3.2);r.until(()=>r.machine('sorter-door').progress>.95,2,'Corrected fullsize physical delivery did not restore exit');r.walk(0,-4);r.finish('sorter-exit');
 }));
 for(const upper of [true,false])test('native C20 actual '+(upper?'higher':'lower')+' receiver powers only its real door',()=>run('20-'+(upper?'higher':'lower'),20,!upper,r=>{powerAndAim(r,upper);receiverExit(r,upper);}));
 test('native C20 wrong lower receiver can be reconfigured through actual return traversal',()=>run('20-wrong-receiver-recovery',20,false,r=>{
  powerAndAim(r,false);r.walk(9.5,8);r.enter(0);r.walk(-7.5,-12);r.tick(.9);assert.ok(r.machine('upper-door').progress<.05);assert.ok(r.machine('lower-door').progress>.95);r.walk(-5,-12);r.enter(1);r.walk(8.5,12.5);r.shot(1,'upper-return',V(5,4.95,-13.985));r.tick(.2);receiverExit(r,true);
 }));
 test('native C20 removing actual emitter pressure cuts beam and replacement restores it',()=>run('20-pressure-recovery',20,false,r=>{
  powerAndAim(r,true);r.walk(-6,8);r.pickup('power-cube');r.walk(-6,10);r.tick(1);assert.equal(r.w.machines.flags['upper-light'],false);assert.equal(r.w.machines.flags['lower-light'],false);assert.ok(r.machine('upper-door').progress<.05);r.dropPad('power-cube','emitter-power',-6,8);r.tick(.9);assert.equal(r.w.machines.flags['upper-light'],true);receiverExit(r,true);
 }));
}
