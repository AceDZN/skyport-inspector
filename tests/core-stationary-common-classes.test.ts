/** Two authored C34 class contacts only; no fixture, machine, pose or velocity writes. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {initializePhysics} from '../src/core/world';
import {getCoreLevel} from '../src/core/levels';
import {draftPassiveLevels} from '../src/core/levels/passive';
import {V,type Input} from '../src/physics';
import {SequenceRoute,forward,idle} from './helpers/sequence-route';
import {observeMachineQueryState} from './helpers/machine-query-state-observer';
const enabled=process.env.RIFT_STATIONARY_COMMON_CLASSES==='1',dt=1/120;
before(async()=>{if(enabled)await initializePhysics();});
for(const subject of ['switch','closed-shutter'] as const)test('native authored stationary '+subject+' contact has ordinary A S recovery and exact native state',{skip:!enabled},()=>{
 const level=draftPassiveLevels.find(l=>l.number===34)!;const r=new SequenceRoute(34,false,'class-'+subject,level),observer=observeMachineQueryState(r.w);
 const out=process.env.RIFT_COMMON_CLASSES_OUT;assert.ok(out,'Unique output root required');const id=subject==='switch'?'test-release':'latched-cargo-hatch',machine=r.device(id),rigid=r.w.doors.get(id)!.rigid;
 const native=()=>({type:rigid.bodyType(),pose:{position:{...rigid.translation()},rotation:{...rigid.rotation()}},next:{position:{...rigid.nextTranslation()},rotation:{...rigid.nextRotation()}},linear:{...rigid.linvel()},angular:{...rigid.angvel()}});
 const initial=native(),frames:unknown[]=[],phases:unknown[]=[],trials:unknown[]=[];let error:unknown;
 const state=()=>({time:r.w.time,player:r.w.player.pos.toArray(),velocity:r.w.player.vel.toArray(),grounded:r.w.player.grounded,subject:native(),contacts:r.contacts(),crossings:r.w.player.crossings});
 const step=(label:string,input:Input)=>{const start=state();r.step(input);const end=state();frames.push({label,dt,input:{...input},yaw:r.w.yaw,pitch:r.w.pitch,start,end});assert.deepEqual(native(),initial,'Subject current/queued position/rotation/type/v/omega changed');assert.equal(r.device('test-release').on,false,'No test action may open the closed leaf');if(subject==='closed-shutter'){assert.equal(machine.progress,0);assert.equal(machine.latched,false);assert.equal(machine.on,false);}};
 const hold=(label:string,seconds:number,input:Input)=>{const start=state();for(let i=0;i<Math.ceil(seconds/dt);i++)step(label,input);phases.push({label,start,end:state()});};
 const walk=(label:string,x:number,z:number)=>{for(let i=0;i<480;i++){if(Math.hypot(r.w.player.pos.x-x,r.w.player.pos.z-z)<.025)return;r.look(V(x,r.w.eye().y,z));step(label,forward);}assert.fail('Ordinary class setup walk blocked '+[x,z]);};
 const touching=()=>r.contacts().some(c=>c.id===id);
 const clear=()=>{const p=r.w.player.pos,c=machine.position,s=machine.spec.size;return Math.hypot(Math.max(c.x-s[0]/2-p.x,0,p.x-c.x-s[0]/2),Math.max(c.z-s[2]/2-p.z,0,p.z-c.z-s[2]/2))>.31;};
 const touch=()=>{
  if(!touching()){
   if(subject==='switch'){
    walk('ordinary-switch-clear-aisle',5.8,6.8);walk('ordinary-switch-early-approach',5.8,7.8);hold('ordinary-switch-neutral-brake',.5,idle);
    assert.ok(r.w.player.pos.z>=7.85&&r.w.player.pos.z<=8.15,'Switch approach must actually settle within its flat west face');assert.ok(Math.abs(r.w.player.vel.z)<.005);
   }else{walk('ordinary-closed-leaf-south-approach',7,6);hold('ordinary-closed-leaf-neutral-brake',.5,idle);assert.ok(Math.abs(r.w.player.vel.x)<.005);}
  }
  r.look(subject==='switch'?V(10,r.w.eye().y,r.w.player.pos.z):V(r.w.player.pos.x,r.w.eye().y,2));let contact=false;
  for(let i=0;i<360;i++){step('ordinary-inward-contact',forward);if(touching()){contact=true;break;}}assert.ok(contact,'No real subject collision');
  assert.ok(r.contacts().some(c=>c.id===id&&(subject==='switch'?c.normal.x<-.99&&Math.abs(c.normal.z)<.01:c.normal.z>.99&&Math.abs(c.normal.x)<.01)),'Setup must touch the actual flat face');
  hold('ordinary-inward-hold',.35,forward);phases.push({label:'actual-subject-contact-before-outward-input',state:state()});
 };
 try{
  r.shot(0,'process-source',V(.55,1.55,13.985));r.shot(1,'process-return',V(.55,1.55,5.665));walk('ordinary-booth-source-approach',.55,12.7);r.look(V(.55,r.w.eye().y,16));
  for(let i=0;i<480&&r.w.player.crossings===0;i++)step('ordinary-booth-pair-entry',forward);assert.equal(r.w.player.crossings,1);hold('ordinary-short-pair-clearance',.12,forward);
  walk('ordinary-east-branch-clearance',4.5,6.8);
  for(const direction of ['A','S'] as const){touch();const start=r.w.player.pos.clone();const seconds=subject==='closed-shutter'&&direction==='A'?.75:.5;const input:Input=direction==='A'?{forward:0,strafe:-1,jump:false}:{forward:-1,strafe:0,jump:false};hold('ordinary-outward-'+direction,seconds,input);trials.push({direction,seconds,start:start.toArray(),end:r.w.player.pos.toArray(),distance:r.w.player.pos.distanceTo(start),clear:clear(),grounded:r.w.player.grounded});}
  for(const value of trials){const t=value as{direction:string;distance:number;clear:boolean;grounded:boolean};assert.ok(t.distance>.4,t.direction+' remained pinned');assert.ok(t.clear,t.direction+' did not clear actual subject');assert.ok(t.grounded,t.direction+' lost floor support');}
  assert.equal(r.w.respawns,0);assert.equal(r.events.some(e=>e.type==='jump'),false);assert.equal(r.w.player.crossings,1);assert.equal(observer.counts.violations,0);assert.ok(observer.counts.physics>100);
 }catch(e){error=e;throw e;}finally{mkdirSync(out,{recursive:true});writeFileSync(out+'/'+subject+'.json',JSON.stringify({scope:'Two bounded actual C34 class checks; same physical fixture/spawn. Ordinary native camera/WASD/ray-checked portals only. No E/clock/pose/velocity/fixture/goal/save writes; no browser completion.',subject,id,error:error?String(error):null,trials,phases,frames,observer:{counts:observer.counts,nativeTypes:observer.nativeTypes,samples:observer.samples,final:observer.final(),heldScope:'No cargo in these C34 cases; actual held0 is not held-state proof.'},events:r.events,final:r.w.snapshot()},null,2)+'\n');r.w.dispose();}
});


// Additional authored baselines requested after actual OLD-v3 browser findings.
for(const number of [1,13] as const)test('native authored C'+number+' inactive closed control keeps W600 solid and S400 recovers',{skip:!enabled},()=>{
 const r=new SequenceRoute(number,false,'common-control-'+number,getCoreLevel(number)),observer=observeMachineQueryState(r.w),out=process.env.RIFT_COMMON_CLASSES_OUT;assert.ok(out);
 const id=number===1?'exit-door':'belt-power',machine=r.device(id),rigid=r.w.doors.get(id)!.rigid;
 const body=()=>({type:rigid.bodyType(),pose:{position:{...rigid.translation()},rotation:{...rigid.rotation()}},next:{position:{...rigid.nextTranslation()},rotation:{...rigid.nextRotation()}},linear:{...rigid.linvel()},angular:{...rigid.angvel()}});
 const initial=body(),inputs:unknown[]=[],frames:unknown[]=[],phases:unknown[]=[];let error:unknown;
 const state=()=>({time:r.w.time,player:r.w.player.pos.toArray(),grounded:r.w.player.grounded,velocity:r.w.player.vel.toArray(),subject:body(),contacts:r.contacts(),progress:machine.progress,on:machine.on,crossings:r.w.player.crossings});
 const invariant=()=>{assert.deepEqual(body(),initial,'Inactive subject native current/queued TQ/type/v/omega changed');assert.equal(machine.on,false);assert.equal(machine.progress,0);if(number===1)assert.equal(r.pad('exit-button').pressed,false,'C1 check must not press the exit button');};
 const walk=(x:number,z:number)=>{inputs.push({action:'ordinary-helper-walk',x,z,start:state()});r.walk(x,z);invariant();inputs.push({action:'ordinary-helper-walk-end',state:state()});};
 const shot=(index:0|1,id:string,point:ReturnType<typeof V>)=>{inputs.push({action:'ray-checked-aimed-portal',index,id,point:point.toArray()});r.shot(index,id,point);invariant();};
 const hold=(label:string,seconds:number,input:Input)=>{const start=state();for(let i=0;i<Math.ceil(seconds/dt);i++){const before=state();r.step(input);invariant();frames.push({label,dt,input:{...input},yaw:r.w.yaw,pitch:r.w.pitch,before,after:state()});}phases.push({label,start,end:state()});};
 try{
  if(number===1){walk(-6.5,11);hold('ordinary-C1-neutral-before-closed-exit',.5,idle);r.look(V(-10,r.w.eye().y,r.w.player.pos.z));}
  else{
   shot(0,'source-south',V(7.55,1.55,11.985));walk(9.7,11);walk(9.7,-4.5);walk(1,-4.5);shot(1,'booth-white',V(1,1.55,9.485));walk(9.7,-4.5);walk(9.7,11);walk(7.55,10.7);r.enter(0);invariant();inputs.push({action:'actual-live-booth-entry',state:state()});
   walk(2,7.3);hold('ordinary-C13-neutral-before-inactive-power',.5,idle);assert.ok(r.w.player.pos.x>=1.8&&r.w.player.pos.x<=2.2,'Actual inactive-switch approach must stay within flat south face');r.look(V(r.w.player.pos.x,r.w.eye().y,3));
  }
  hold('actual-W600-into-inactive-solid',.6,forward);assert.ok(r.contacts().some(c=>c.id===id),'W600 must actually contact the named inactive control');invariant();
  if(number===1)assert.ok(r.w.player.pos.x> -7.99,'Closed EXIT must remain solid');else assert.ok(r.w.player.pos.z>5.85,'Inactive switch remains a solid body');
  const start=r.w.player.pos.clone();hold('actual-S400-outward',.4,{forward:-1,strafe:0,jump:false});const distance=r.w.player.pos.distanceTo(start);phases.push({label:'actual-S400-recovery-measurement',distance,start:start.toArray(),end:r.w.player.pos.toArray()});
  assert.ok(distance>.4,'S400 remains pinned against '+id);assert.ok(number===1?r.w.player.pos.x> -7.3:r.w.player.pos.z>6.5,'S400 must actually clear the subject');assert.equal(r.w.player.grounded,true);assert.equal(r.w.respawns,0);assert.equal(r.events.some(e=>e.type==='jump'),false);assert.equal(r.w.player.crossings,number===1?0:1);assert.equal(observer.counts.violations,0);if(number===1)assert.ok(r.w.portals.every(p=>!p));
 }catch(e){error=e;throw e;}finally{mkdirSync(out,{recursive:true});writeFileSync(out+'/authored-C'+number+'.json',JSON.stringify({scope:'Actual authored spawn/route. C1 never touches button/cube or portals; C13 uses proven walking booth pair and never presses E or powers belt. Actual W600/S400 input only, no state/clock/pose/velocity/collider writes. Not browser proof.',number,id,error:error?String(error):null,inputs,frames,phases,observer:{counts:observer.counts,nativeTypes:observer.nativeTypes,samples:observer.samples,final:observer.final(),heldScope:'No held cargo in this check; held0 is not invoked held proof.'},events:r.events,final:r.w.snapshot()},null,2)+'\n');r.w.dispose();}
});
