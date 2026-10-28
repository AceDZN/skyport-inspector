/** Metrics/assertions only. Never changes a native body or requested movement. */
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import type {Vector3} from 'three';
import type {CoreWorld} from '../../src/core/world';

export function observeTimerQueryState(w:CoreWorld){
 const timers=w.machines.devices.filter(d=>d.spec.kind==='timer');
 assert.ok(timers.length,'This observer requires actual authored timer bodies');
 const read=()=>timers.map(d=>{const b=w.doors.get(d.spec.id)!.rigid;return{id:d.spec.id,type:b.bodyType(),pose:{...b.translation()},next:{...b.nextTranslation()},linear:{...b.linvel()},angular:{...b.angvel()}};});
 const counts={characterQueries:0,nativeCharacterQueries:0,nativeFixedTimerObservations:0,nativeKinematicTimerObservations:0,restoredBeforePhysics:0,restoredBeforeHeld:0,portalPlacementChecks:0,stateViolations:0};
 const samples:unknown[]=[];let restored:ReturnType<typeof read>|undefined,restoreTime:number|undefined;
 const equal=(a:unknown,b:unknown,label:string)=>{try{assert.deepEqual(a,b,label);}catch(e){counts.stateViolations++;throw e;}};
 const restoredNow=(label:string)=>{
  const actual=read();
  for(const body of actual)equal(body.type,RAPIER.RigidBodyType.KinematicPositionBased,label+' leaked temporary Fixed');
  if(restored&&restoreTime===w.time)equal(actual,restored,label+' changed the restored native timer state');
  return actual;
 };
 const internal=w as unknown as{computeCharacterMovement(requested:Vector3,platformCollider?:number):void};
 const compute=internal.computeCharacterMovement.bind(w);
 internal.computeCharacterMovement=(requested,platformCollider)=>{
  const before=read(),delta=requested.toArray();
  try{return compute(requested,platformCollider);}finally{
   const after=read();equal(after,before,'Character query changed timer type/pose/next/linear/angular');equal(requested.toArray(),delta,'Character query changed desired movement');
   restored=after;restoreTime=w.time;counts.characterQueries++;
   if(samples.length<8)samples.push({stage:'restored-character-query',time:w.time,before,after,requested:delta});
  }
 };
 const native=w.controller.computeColliderMovement.bind(w.controller);
 w.controller.computeColliderMovement=(...args)=>{
  const current=read();counts.nativeCharacterQueries++;
  for(const body of current){assert.ok([RAPIER.RigidBodyType.Fixed,RAPIER.RigidBodyType.KinematicPositionBased].includes(body.type));if(body.type===RAPIER.RigidBodyType.Fixed)counts.nativeFixedTimerObservations++;else counts.nativeKinematicTimerObservations++;}
  if(samples.length<8)samples.push({stage:'inside-actual-native-character-query',time:w.time,timers:current});
  return native(...args);
 };
 const held=w.holdController.computeColliderMovement.bind(w.holdController);
 w.holdController.computeColliderMovement=(...args)=>{
  const before=restoredNow('Before actual held query');counts.restoredBeforeHeld++;
  try{return held(...args);}finally{equal(read(),before,'Actual held query changed timer state');}
 };
 const physics=w.physics.step.bind(w.physics);
 w.physics.step=(...args)=>{restoredNow('Before actual physics.step');counts.restoredBeforePhysics++;return physics(...args);};
 const place=w.place.bind(w);
 w.place=(...args)=>{const before=restoredNow('Before actual aimed portal placement');counts.portalPlacementChecks++;try{return place(...args);}finally{equal(read(),before,'Aimed portal placement changed timer state');}};
 return{counts,samples,final:read};
}
