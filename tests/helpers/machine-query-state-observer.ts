/** Pure observation around real native queries; no body-state setters. */
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import type {Vector3} from 'three';
import type {CoreWorld} from '../../src/core/world';
export function observeMachineQueryState(w:CoreWorld){
 const read=()=>w.machines.devices.map(d=>{const b=w.doors.get(d.spec.id)!.rigid;return{id:d.spec.id,kind:d.spec.kind,type:b.bodyType(),pose:{position:{...b.translation()},rotation:{...b.rotation()}},next:{position:{...b.nextTranslation()},rotation:{...b.nextRotation()}},linear:{...b.linvel()},angular:{...b.angvel()}};});
 const counts={character:0,native:0,physics:0,held:0,portal:0,violations:0};const nativeTypes:Record<string,number>={},samples:unknown[]=[];
 let restored:ReturnType<typeof read>|undefined,restoreTime:number|undefined;
 const same=(a:unknown,b:unknown,message:string)=>{try{assert.deepEqual(a,b,message);}catch(e){if(counts.violations===0)samples.push({stage:'first-native-state-violation',message,expected:b,actual:a});counts.violations++;throw e;}};
 const outside=(message:string)=>{const current=read();for(const d of current)same(d.type,RAPIER.RigidBodyType.KinematicPositionBased,message+' leaked temporary Fixed');if(restored&&restoreTime===w.time)same(current,restored,message+' changed restored current/queued pose/rotation/v/omega');return current;};
 const api=w as unknown as{computeCharacterMovement(requested:Vector3,platformCollider?:number):void},compute=api.computeCharacterMovement.bind(w);
 api.computeCharacterMovement=(requested,platformCollider)=>{const before=read(),delta=requested.toArray();try{return compute(requested,platformCollider);}finally{const after=read();same(after,before,'Query changed current/queued position/rotation, type, linear/angular velocity');same(requested.toArray(),delta,'Query changed desired movement');restored=after;restoreTime=w.time;counts.character++;if(samples.length<8)samples.push({stage:'restored-query',before,after});}};
 const native=w.controller.computeColliderMovement.bind(w.controller);
 w.controller.computeColliderMovement=(...args)=>{const current=read();for(const d of current){const key=d.kind+':'+d.type;nativeTypes[key]=(nativeTypes[key]??0)+1;assert.ok(d.type===RAPIER.RigidBodyType.Fixed||d.type===RAPIER.RigidBodyType.KinematicPositionBased,'Unexpected machine query type');}counts.native++;if(samples.length<8)samples.push({stage:'inside-native-query',current});return native(...args);};
 const held=w.holdController.computeColliderMovement.bind(w.holdController);w.holdController.computeColliderMovement=(...args)=>{const before=outside('Before held query');counts.held++;try{return held(...args);}finally{const after=read();same(after,before,'Held query changed machine native state');if(counts.held<=2)samples.push({stage:'actual-invoked-held-query-restoration',before,after});}};
 const physics=w.physics.step.bind(w.physics);w.physics.step=(...args)=>{outside('Before physics.step');counts.physics++;try{return physics(...args);}finally{for(const d of read())same(d.type,RAPIER.RigidBodyType.KinematicPositionBased,'After physics.step leaked temporary Fixed');restored=undefined;restoreTime=undefined;}};
 const place=w.place.bind(w);w.place=(...args)=>{const before=outside('Before aimed portal placement');counts.portal++;try{return place(...args);}finally{same(read(),before,'Portal placement changed machine native state');}};
 return{counts,nativeTypes,samples,final:read};
}
