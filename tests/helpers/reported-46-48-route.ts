/** Authored-spawn native input helper. Not a public mouse/renderer completion driver. */
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import RAPIER from '@dimforge/rapier3d-compat';
import type {Vector3} from 'three';
import {CoreWorld} from '../../src/core/world';
import {draftReported4648Levels} from '../../src/core/levels/reported-46-48';
import {V,type Input} from '../../src/physics';

export const reportDt=1/120,reportIdle:Input={forward:0,strafe:0,jump:false},reportForward:Input={...reportIdle,forward:1};
type Flight={entry?:Record<string,unknown>;exit?:number[];exitVelocity?:number[];exitUprightFit?:boolean;land?:number[];ground?:string;peak:number;priorLands:unknown[];samples:unknown[]};
const output=process.env.RIFT_REPORTED_RUN?join('docs/core-levels/reported-native',process.env.RIFT_REPORTED_RUN):join('work/chamber-qa/reported','run-'+Date.now());

export class ReportedRoute{
 readonly w:CoreWorld;readonly events:Record<string,unknown>[]=[];readonly inputs:unknown[]=[];readonly notes:unknown[]=[];readonly ridingFrames=new Map<string,number>();readonly maxDeviceStep=new Map<string,number>();
 constructor(readonly number:46|47|48,readonly contrast=false){
  const def=draftReported4648Levels.find(l=>l.number===number);assert.ok(def);
  this.w=new CoreWorld(number,(type,data)=>this.events.push({type,time:this.w?.time??0,...data}),def,contrast);
  assert.ok(this.w.player.pos.distanceTo(V(...this.w.blueprint.spawn))<.05,'Constructor must use the authored spawn');this.tick(.3);
 }
 detail(){return JSON.stringify({state:this.w.snapshot(),contacts:this.contacts(),events:this.events.slice(-8)});}
 contacts(){return Array.from({length:this.w.controller.numComputedCollisions()},(_,i)=>this.w.controller.computedCollision(i)).filter((c):c is NonNullable<typeof c>=>Boolean(c)).map(c=>({id:c.collider?(this.w.fixed.get(c.collider.handle)?.id??[...this.w.doors].find(([,d])=>d.collider.handle===c.collider!.handle)?.[0]??'body'):undefined,normal:{...c.normal1},applied:{...c.translationDeltaApplied},remaining:{...c.translationDeltaRemaining}}));}
 step(input:Input=reportIdle){
  const old=new Map(this.w.machines.devices.map(d=>[d.spec.id,d.position.clone()]));this.w.step(reportDt,input);
  for(const d of this.w.machines.devices){this.maxDeviceStep.set(d.spec.id,Math.max(this.maxDeviceStep.get(d.spec.id)??0,d.position.distanceTo(old.get(d.spec.id)!)));if(!['lift','moving-platform'].includes(d.spec.kind)||!d.moving)continue;const p=this.w.player,top=d.position.y+d.spec.size[1]/2;if(p.grounded&&Math.abs(p.pos.y-p.half.y-top)<.08&&Math.abs(p.pos.x-d.position.x)<d.spec.size[0]/2&&Math.abs(p.pos.z-d.position.z)<d.spec.size[2]/2)this.ridingFrames.set(d.spec.id,(this.ridingFrames.get(d.spec.id)??0)+1);}
 }
 tick(seconds:number,input:Input=reportIdle){this.inputs.push({type:'step-input',seconds,input:{...input},yaw:this.w.yaw,pitch:this.w.pitch});for(let i=0;i<Math.ceil(seconds/reportDt);i++)this.step(input);}
 note(label:string){this.notes.push({label,state:this.w.snapshot(),contacts:this.contacts()});}
 look(p:Vector3){const v=p.clone().sub(this.w.eye());this.w.yaw=Math.atan2(-v.x,-v.z);this.w.pitch=Math.asin(v.y/v.length());}
 walk(x:number,z:number,seconds=20){
  this.inputs.push({type:'ordinary-WASD-to',x,z,seconds});
  for(let i=0;i<seconds/reportDt;i++){
   if(this.w.campaignResult)return;
   const dx=x-this.w.player.pos.x,dz=z-this.w.player.pos.z;
   if(Math.hypot(dx,dz)<.12){this.tick(.12);return;}
   this.w.yaw=Math.atan2(-dx,-dz);this.w.pitch=0;this.step(reportForward);
  }
  assert.fail('Actual WASD did not reach '+[x,z]+' '+this.detail());
 }
 until(pred:()=>boolean,seconds:number,label:string,input:Input=reportIdle){for(let i=0;i<seconds/reportDt;i++){if(pred())return;this.step(input);}assert.ok(pred(),label+' '+this.detail());}
 cube(id:string){const c=this.w.crates.find(c=>c.id===id);assert.ok(c,'Missing physical cargo '+id);return c;}
 pad(id:string){const p=this.w.pads.find(p=>p.id===id);assert.ok(p,'Missing physical pressure '+id);return p;}
 device(id:string){const d=this.w.machines.devices.find(d=>d.spec.id===id);assert.ok(d,'Missing actual machine '+id);return d;}
 e(){this.inputs.push({type:'ordinary-E'});if(!this.w.interact())this.w.grabDrop();this.step();}
 control(id:string){
  assert.equal(this.w.heldId,undefined);const d=this.device(id),point=d.position.clone().add(V(...(d.spec.controlOffset??[0,0,0])));this.look(point);
  const ray=point.clone().sub(this.w.eye()),length=ray.length();const hit=this.w.physics.castRay(new RAPIER.Ray(this.w.eye(),ray.normalize()),length-.07,true,undefined,undefined,this.w.characterCollider);assert.equal(hit,null,'Actual opaque collider blocks the control');
  assert.match(this.w.interactionHint(),/Use/);this.inputs.push({type:'ordinary-E-control',id,point:point.toArray()});assert.equal(this.w.interact(),true,'Actual visible control cannot be reached');this.step();
 }
 pickup(id:string){assert.equal(this.w.heldId,undefined);const c=this.cube(id),distance=Math.hypot(c.pos.x-this.w.player.pos.x,c.pos.z-this.w.player.pos.z);assert.ok(distance>c.half.x+this.w.player.half.x+.08,'Pickup approach pushes the actual cube');this.look(c.pos);assert.match(this.w.interactionHint(),/Pick up/);this.e();assert.equal(this.w.heldId,id);}
 dropPad(id:string,padId:string,x:number,z:number){assert.equal(this.w.heldId,id);this.walk(x,z);const p=this.pad(padId);this.look(V(p.pos.x,p.pos.y+1.06,p.pos.z));this.tick(.35);this.e();assert.equal(this.w.heldId,undefined);this.until(()=>p.crateId===id,2,'Actual released cargo never supplies '+padId);this.tick(.8);assert.equal(p.crateId,id);this.note('actual-released-pressure-'+padId);}
 shot(index:0|1,id:string,p:Vector3){
  assert.equal(this.w.heldId,undefined,'Configure the pair with empty hands; native instant aim is not held-muzzle proof');
  const s=this.w.surfaces.find(s=>s.id===id);assert.ok(s);this.look(p);
  assert.ok(this.w.eye().clone().sub(s.center).dot(s.normal)>0,'Actual visible front face required');
  const dir=p.clone().sub(this.w.eye()),range=dir.length();
  const hit=this.w.physics.castRay(new RAPIER.Ray(this.w.eye(),dir.normalize()),range-.07,true,undefined,undefined,this.w.characterCollider,undefined,c=>{const solid=this.w.fixed.get(c.handle);return !(solid&&(solid.id===s.solidId||solid.kind==='glass'));});
  assert.equal(hit,null,'An opaque native body blocks the aimed white face '+this.detail());
  this.inputs.push({type:'native-ray-checked-aimed-shot',index,surface:id,p:p.toArray()});
  assert.ok(this.w.place(index,id,p),'Whole actual aperture rejected '+this.detail());
  assert.ok(this.w.portals[index]!.center.distanceTo(p)<.07,'Unexpected anchor clamp');
 }
 enter(index:0|1,departureSeconds=.06){
  const p=this.w.portals[index];assert.ok(p);const prior=this.w.player.crossings;
  this.look(p.center.clone().addScaledVector(p.normal,-2));this.until(()=>this.w.player.crossings>prior,4,'Walking pair did not actually cross',reportForward);
  assert.equal(this.w.player.crossings,prior+1);this.tick(departureSeconds,reportForward);
 }
 observation(reverse=false){
  const a=reverse?1:0,b=reverse?0:1;
  this.shot(a,'observation-source',V(-1,1.55,13.985));this.shot(b,'observation-return',V(-.45,1.55,8.165));this.enter(a);
  this.walk(-.45,8.65);this.walk(2,8.65);this.walk(2,7.3);this.note('actual-low-observation-access');
 }
 setup(deep:boolean,reverse=false,sourceZ?:number){
  const x=deep?3:-5,y=deep?-17.975:-2.975,z=sourceZ??(deep?-1.1:3.1),a=reverse?1:0,b=reverse?0:1;
  this.walk(-1,7.3);this.walk(x,7.3);this.walk(x,6.45);
  this.shot(a,deep?'deep-floor':'shallow-floor',V(x,y,z));this.shot(b,'launch-white',V(-7.985,9,-6));
  this.note('actual-pair-reconfigured-for-fling');
 }
 flight(outputIndex:0|1=1):Flight{
  this.w.yaw=0;this.w.pitch=0;const prior=this.w.player.crossings,start=this.events.length,result:Flight={peak:-Infinity,priorLands:[],samples:[]};
  this.until(()=>this.w.player.crossings>prior,4,'Actual floor fall never traversed',reportForward);
  assert.equal(this.w.player.crossings,prior+1);
  result.entry=this.events.filter(e=>e.type==='enter'&&e.body==='player').at(-1);result.exit=this.w.player.pos.toArray();result.exitVelocity=this.w.player.vel.toArray();result.priorLands=this.events.slice(start).filter(e=>e.type==='land');
  result.exitUprightFit=this.w.aperture(this.w.player,this.w.portals[outputIndex]!);
  for(let i=0;i<6/reportDt;i++){
   result.peak=Math.max(result.peak,this.w.player.pos.y);
   if(i%12===0)result.samples.push({t:i*reportDt,p:this.w.player.pos.toArray(),v:this.w.player.vel.toArray(),grounded:this.w.player.grounded});
   if(this.w.player.grounded){result.land=this.w.player.pos.toArray();result.ground=this.support();break;}
   if(this.w.campaignResult)break;this.step();
  }
  this.notes.push({label:'actual-native-flight',...result,state:this.w.snapshot()});return result;
 }
 support(){const p=this.w.player;return this.w.solids.find(s=>Math.abs(s.max.y+.865-p.pos.y)<.06&&p.pos.x>s.min.x&&p.pos.x<s.max.x&&p.pos.z>s.min.z&&p.pos.z<s.max.z)?.id;}
 landed(f:Flight,id:string){
  assert.equal(f.ground,id,'Actual requested safe receiving floor '+this.detail());const floor=this.w.solids.find(s=>s.id===id);assert.ok(floor);const p=this.w.player;
  assert.ok(p.pos.x-p.half.x>=floor.min.x-.015&&p.pos.x+p.half.x<=floor.max.x+.015&&p.pos.z-p.half.z>=floor.min.z-.015&&p.pos.z+p.half.z<=floor.max.z+.015,'The full capsule footprint must be safely supported');
  assert.ok(f.entry);assert.equal(f.priorLands.length,0,'A bottom landing is not the intended uninterrupted falling route');assert.equal(f.exitUprightFit,true);
  assert.ok(Math.abs(Number(f.entry.speed)-Number(f.entry.exitSpeed))<1e-6,'Portal transform changed momentum magnitude');assert.equal(this.w.respawns,0);
 }
 finish(id:string){const p=this.w.blueprint.routePoints[id];assert.ok(p);this.walk(p[0],p[2]);assert.equal(this.w.campaignResult?.exit,id,'Real named exit not earned '+this.detail());assert.equal(this.w.respawns,0);}
 recover(){
  this.walk(-1,10);this.walk(-5,10);const d=this.w.machines.devices.find(d=>d.spec.id==='recovery-lift');assert.ok(d);
  this.look(d.position.clone().add(V(...d.spec.controlOffset!)));assert.ok(this.w.interact(),'Reach the actual riding panel with E');
  this.until(()=>d.position.y>-.201,25,'Return lift never physically reaches the approach');
  assert.ok(this.w.player.grounded&&this.w.player.pos.y>.8,'Actual capsule did not ride the return');
  this.walk(-5,7.3);this.walk(2,7.3);assert.equal(this.w.respawns,0);this.note('actual-basin-elevator-return-around-booth');
 }
 close(name:string,error?:unknown){this.note(error?'failure':'final');mkdirSync(output,{recursive:true});writeFileSync(join(output,name+'.json'),JSON.stringify({scope:'Unregistered authored-spawn native inputs only; no actor/cargo/machine/velocity/save/history/goal writes; not browser proof.',number:this.number,contrast:this.contrast,error:error?String(error):null,inputs:this.inputs,notes:this.notes,events:this.events,ridingFrames:Object.fromEntries(this.ridingFrames),maxDeviceStep:Object.fromEntries(this.maxDeviceStep),final:this.w.snapshot()},null,2)+'\n');this.w.dispose();}
}

export function reportedRoute(number:46|47|48,contrast:boolean,name:string,fn:(r:ReportedRoute)=>void){const r=new ReportedRoute(number,contrast);let error:unknown;try{fn(r);}catch(e){error=e;throw e;}finally{r.close(name,error);}}
