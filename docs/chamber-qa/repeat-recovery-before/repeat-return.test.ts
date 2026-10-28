/** Unregistered16/17 authored-spawn native paths; never browser or language-mastery proof.
 * Only ordinary step input, camera aim and actual ray-checked portal placement mutate
 * the world. No body pose/velocity, machine choice, goal/history/save or reset writes.
 * Execute only in the lead-assigned serial native slot; preserve every failed run.
 */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createRequire} from 'node:module';
const RAPIER=createRequire('/Users/acedzn/dev/AceDZN-exp/skyport-inspector/package.json')('@dimforge/rapier3d-compat');
import {CoreWorld,initializePhysics} from '/Users/acedzn/dev/AceDZN-exp/skyport-inspector/src/core/world';
import {draftComparisonLevels} from '/Users/acedzn/dev/AceDZN-exp/skyport-inspector/src/core/levels/comparisons';
import {V,type Input} from '/Users/acedzn/dev/AceDZN-exp/skyport-inspector/src/physics';
import type {Vector3} from 'three';
const dt=1/120,idle:Input={forward:0,strafe:0,jump:false},forward:Input={...idle,forward:1};
const evidenceBase=process.env.RIFT_COMPARISON_MACHINERY==='1'?'docs/core-levels/comparisons-18-20':'docs/core-levels/momentum-16-17';
const output='/Users/acedzn/idea-plotter/reports/rift-repeat-recovery/native-run';
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


test('C16 repeated ordinary missed-aperture recovery can recall RETURN from the basin twice',()=>run('16-repeat-return',16,false,r=>{
 for(let attempt=1;attempt<=2;attempt++){
  r.setup(true,-6);r.walk(4.2,6.45);r.w.yaw=0;r.w.pitch=0;
  for(let i=0;i<3/dt&&!(r.w.player.grounded&&r.w.player.pos.y< -16);i++)r.step(forward);
  assert.equal(r.w.player.crossings,0,'Miss unexpectedly traversed');
  assert.ok(r.w.player.grounded&&Math.abs(r.w.player.pos.y+17.135)<.08,'Miss did not reach real deep floor');
  r.walk(4.2,-5.2);r.tick(1.5);assert.ok(r.w.player.grounded&&r.w.player.pos.y< -21,'Bottom opening did not reach basin');
  r.notes.push({stage:'before-real-return-attempt',attempt,state:r.w.snapshot()});
  r.recover();assert.equal(r.w.respawns,0);
 }
}));
