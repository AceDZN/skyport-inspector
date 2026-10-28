/**
 * Bounded native placement/contact diagnostic. Explicit matched-support lab
 * fixtures, not browser/completion proof. Authored spawn/cargo setup is fixed
 * before construction; no runtime body/velocity/portal/history/goal writes.
 * All portal mutations use ray-checked aimed placement; all travel is W only.
 */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import RAPIER from '@dimforge/rapier3d-compat';
import {CoreWorld,initializePhysics} from '../src/core/world';
import {ChamberBuilder} from '../src/core/level-kit';
import type {CoreLevel} from '../src/core/level';
import {V,type Input} from '../src/physics';

const enabled=process.env.RIFT_LOW_WALL_ENTRY==='1',dt=1/120,idle:Input={forward:0,strafe:0,jump:false},forward:Input={...idle,forward:1};
const output=join('docs/chamber-qa/low-wall-entry',process.env.RIFT_LOW_WALL_RUN??'unlabelled');
before(async()=>{if(enabled)await initializePhysics();});

function fixture(support:number,reverse:boolean):CoreLevel{
 return {number:1,name:'Low aimed wall-entry lab',mission:'Walk through the linked opening.',he:'עברו דרך הפתח המחובר.',chapter:'Native diagnostic',architecture:{height:7,halfWidth:6,style:'ceramic'},recoveryY:support-4,sources:[],blueprint:()=>{
  const b=new ChamberBuilder(),w=b.world;w.spawn=[0,support+.87,reverse?-4.5:4.5];
  b.floor('actual-flat-support',-6,6,-8,8,support);
  b.box('south-host',[0,support+3.5,8.2],[12.8,7,.4]);b.box('north-host',[0,support+3.5,-8.2],[12.8,7,.4]);
  for(const x of[-6.2,6.2])b.box('side-'+x,[x,support+3.5,0],[.4,7,16.8]);
  b.box('ceiling',[0,support+7.2,0],[12.8,.4,16.8]);
  b.panel('south-white','south-host',[0,support+3.5,7.985],[0,0,-1],10,7);
  b.panel('north-white','north-host',[0,support+3.5,-7.985],[0,0,1],10,7);
  b.cube('actual-carry-cube',[2,support+.55,reverse?-4.5:4.5]);
  return b.finish();
 }};
}

function attempt(support:number,aimHeight:number,reverse:boolean,held:boolean){
 const events:unknown[]=[],frames:unknown[]=[],inputs:unknown[]=[];
 let w:CoreWorld|undefined,error:unknown;
 const initial=reverse?1:0,origin=reverse?'north-white':'south-white',destination=reverse?'south-white':'north-white';
 const record=()=>({player:w!.snapshot().player,cube:w!.snapshot().crates,held:w!.heldId,portals:w!.snapshot().portals,contacts:Array.from({length:w!.controller.numComputedCollisions()},(_,i)=>w!.controller.computedCollision(i)!).map(c=>({id:c.collider?w!.fixed.get(c.collider.handle)?.id:undefined,normal:{...c.normal1},applied:{...c.translationDeltaApplied},remaining:{...c.translationDeltaRemaining}}))});
 const tick=(seconds:number,input:Input=idle)=>{inputs.push({type:'ordinary-step',seconds,input:{...input},yaw:w!.yaw,pitch:w!.pitch});for(let i=0;i<Math.ceil(seconds/dt);i++){w!.step(dt,input);if(i%12===0)frames.push({time:w!.time,...record()});}};
 const aim=(target:ReturnType<typeof V>)=>{const d=target.clone().sub(w!.eye());w!.yaw=Math.atan2(-d.x,-d.z);w!.pitch=Math.asin(d.y/d.length());};
 try{
  w=new CoreWorld(1,(type,data)=>events.push({type,...data}),fixture(support,reverse));
  assert.ok(w.player.pos.distanceTo(V(0,support+.87,reverse?-4.5:4.5))<.05,'Use only the authored initial pose');tick(.3);
  for(const[index,id,z]of[[0,'south-white',7.985],[1,'north-white',-7.985]]as const){
   const p=V(0,support+aimHeight,z),surface=w.surfaces.find(s=>s.id===id)!;aim(p);const ray=p.clone().sub(w.eye()),length=ray.length();
   const hit=w.physics.castRay(new RAPIER.Ray(w.eye(),ray.normalize()),length-.07,true,undefined,undefined,w.characterCollider,undefined,c=>w!.fixed.get(c.handle)?.id!==surface.solidId);
   assert.equal(hit,null,'Actual opaque ray blocks the aimed surface');inputs.push({type:'aimed-native-placement',index,id,requested:p.toArray()});
   assert.equal(w.place(index,id,p),true,'Ordinary low aimed shot rejected');
  }
  if(held){
   const c=w.crates.find(c=>c.id==='actual-carry-cube')!;aim(c.pos);assert.match(w.interactionHint(),/Pick up/);inputs.push({type:'actual-E-pickup'});w.grabDrop();w.step(dt,idle);assert.equal(w.heldId,c.id);
  }
  const p=w.portals[initial]!;aim(p.center.clone().addScaledVector(p.normal,-2));
  // Looking level at the portal's far side does not inject upward motion. A
  // natural low wall shot must be walkable without a compensating Space press.
  const prior=w.player.crossings,startEvents=events.length;tick(1.8,forward);
  assert.ok(w.player.crossings>=prior+1,'W-only low wall entry did not cross '+origin+' → '+destination);
  assert.equal(w.respawns,0);assert.ok(w.player.grounded,'The flat destination must retain actual support');
  const native=w.character.translation();assert.ok(w.player.pos.distanceTo(V(native.x,native.y,native.z))<.002,'Native/proxy body disagrees');
  const foot=w.player.pos.y-w.player.half.y;assert.ok(foot>=support-.02&&foot<=support+.06,'Grounded bit hides penetration or an airborne body');
  assert.equal((events.slice(startEvents)as{type:string}[]).some(e=>e.type==='jump'),false,'No Space or synthetic jump may compensate for placement');
  if(held){const c=w.crates.find(c=>c.id==='actual-carry-cube')!;assert.equal(w.heldId,c.id);assert.ok(c.crossings>=1,'Actual held rigid did not traverse');assert.ok(c.pos.y-c.half.y>=support-.03,'Held cube penetrated support');}
 }catch(e){error=e;}finally{
  mkdirSync(output,{recursive:true});
  const name=`support-${support}-aim-${aimHeight}-${reverse?'north-south':'south-north'}-${held?'held':'empty'}`;
  writeFileSync(join(output,name+'.json'),JSON.stringify({scope:'Native matched-support lab setup only, not actual campaign/browser proof. No runtime actor/cargo/velocity/history/goal writes.',support,aimHeight,reverse,held,error:error?String(error):null,inputs,events,frames,final:w?record():null},null,2)+'\n');w?.dispose();
 }
 return error?String(error):null;
}

for(const support of[0,3.4])for(const aimHeight of[1.55,1.65,1.75,1.85])test(`native low wall support${support} aimed${aimHeight} both directions empty and held`,{skip:!enabled},()=>{
 const failures:string[]=[];
 // Fresh authored fixtures keep reverse/held observations independent even when
 // the empty forward attempt fails. This is the finite requested32 attempts,
 // grouped into8 source-height contracts, not an unbounded air-control search.
 for(const reverse of[false,true])for(const held of[false,true]){const err=attempt(support,aimHeight,reverse,held);if(err)failures.push(`${reverse?'north→south':'south→north'} ${held?'held':'empty'}: ${err}`);}
 assert.deepEqual(failures,[],failures.join('\n'));
});
