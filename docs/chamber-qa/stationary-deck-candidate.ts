/** Isolated candidate wrapper. The frozen runtime CoreWorld is imported without edits. */
import RAPIER from '@dimforge/rapier3d-compat';
import {Vector3} from 'three';
import {appendFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {CoreWorld as RuntimeWorld} from '../../src/core/world';
import type {Input} from '../../src/physics';
export {initializePhysics} from '../../src/core/world';
export class CoreWorld extends RuntimeWorld {
 queryCandidateEnabled=true;
 readonly candidateAudit={mode:process.env.RIFT_CANDIDATE_MODE??'candidate',steps:0,querySubstitutions:0,queryVelocityBypasses:0,physicsTypeChecks:0,queryStateViolations:[] as unknown[],mechanicalTransitions:[] as unknown[],maxPlayerStep:0,maxCubeStep:0,maxPlayerDeckPenetration:0,maxCubeDeckPenetration:0,maxNativeCubeDeckPenetration:0,maxCubeDeckPenetrationFrame:undefined as unknown,maxPlayerDeckPenetrationFrame:undefined as unknown,maxLooseCubeSpeed:0,maxHeldCubeSpeed:0,transitions:[] as {time:number;id:string;type:string;position:number[];delta:number[]}[]};
 constructor(...args:ConstructorParameters<typeof RuntimeWorld>){
  super(...args);
  if(process.env.RIFT_CANDIDATE_MODE==='baseline')return;
  if(process.env.RIFT_CANDIDATE_MODE==='integrated'){
   const carriers=()=>this.machines.devices.filter(d=>['lift','moving-platform'].includes(d.spec.kind));
   const internal=this as unknown as {computeCharacterMovement(requested:Vector3,platformCollider?:number):void},compute=internal.computeCharacterMovement.bind(this);
   internal.computeCharacterMovement=(requested,platformCollider)=>{
    const delta=requested.toArray(),before=carriers().map(d=>{const body=this.doors.get(d.spec.id)!.rigid;return{id:d.spec.id,body,type:body.bodyType(),state:{translation:{...body.translation()},next:{...body.nextTranslation()},velocity:{...body.linvel()},angular:{...body.angvel()}}};});
    try{return compute(requested,platformCollider);}finally{for(const c of before){const after={translation:{...c.body.translation()},next:{...c.body.nextTranslation()},velocity:{...c.body.linvel()},angular:{...c.body.angvel()}};if(JSON.stringify(c.state)!==JSON.stringify(after))this.candidateAudit.queryStateViolations.push({time:this.time,id:c.id,before:c.state,after});assert.deepEqual(after,c.state,'Integrated query changed native state');assert.equal(c.body.bodyType(),c.type);}assert.deepEqual(requested.toArray(),delta);}
   };
   const native=this.controller.computeColliderMovement.bind(this.controller);
   this.controller.computeColliderMovement=(...parameters)=>{this.candidateAudit.querySubstitutions+=carriers().filter(d=>this.doors.get(d.spec.id)!.rigid.bodyType()===RAPIER.RigidBodyType.Fixed).length;return native(...parameters);};
   const held=this.holdController.computeColliderMovement.bind(this.holdController);
   this.holdController.computeColliderMovement=(...parameters)=>{for(const d of carriers())assert.equal(this.doors.get(d.spec.id)!.rigid.bodyType(),RAPIER.RigidBodyType.KinematicPositionBased,'Integrated temporary Fixed escaped into held query');return held(...parameters);};
   const physics=this.physics.step.bind(this.physics);
   this.physics.step=(...parameters)=>{for(const d of carriers()){assert.equal(this.doors.get(d.spec.id)!.rigid.bodyType(),RAPIER.RigidBodyType.KinematicPositionBased,'Integrated temporary Fixed escaped into physics.step');this.candidateAudit.physicsTypeChecks++;}return physics(...parameters);};
   return;
  }
  if(['query-only','query-still'].includes(process.env.RIFT_CANDIDATE_MODE??'')){
   const carriers=()=>this.machines.devices.filter(d=>['lift','moving-platform'].includes(d.spec.kind));
   const original=this.controller.computeColliderMovement.bind(this.controller);
   this.controller.computeColliderMovement=(...parameters)=>{
    if(!this.queryCandidateEnabled)return original(...parameters);
    const desired=JSON.stringify(parameters[1]),changed=carriers().filter(d=>process.env.RIFT_CANDIDATE_MODE==='query-still'?d.delta.lengthSq()===0:d.delta.lengthSq()<1e-12).filter(d=>{if(process.env.RIFT_CANDIDATE_MODE!=='query-still')return true;const body=this.doors.get(d.spec.id)!.rigid,v=body.linvel(),a=body.angvel(),still=v.x*v.x+v.y*v.y+v.z*v.z<=1e-16&&a.x*a.x+a.y*a.y+a.z*a.z<=1e-16;if(!still)this.candidateAudit.queryVelocityBypasses++;return still;}).map(d=>{const body=this.doors.get(d.spec.id)!.rigid;return{body,id:d.spec.id,type:body.bodyType(),translation:{...body.translation()},next:{...body.nextTranslation()},velocity:{...body.linvel()},angular:{...body.angvel()}};});
    try{for(const c of changed){c.body.setBodyType(RAPIER.RigidBodyType.Fixed,true);this.candidateAudit.querySubstitutions++;}return original(...parameters);}
    finally{for(const c of changed){c.body.setBodyType(c.type,true);const after={translation:{...c.body.translation()},next:{...c.body.nextTranslation()},velocity:{...c.body.linvel()},angular:{...c.body.angvel()}};const before={translation:c.translation,next:c.next,velocity:c.velocity,angular:c.angular};if(JSON.stringify(before)!==JSON.stringify(after))this.candidateAudit.queryStateViolations.push({time:this.time,id:c.id,before,after});assert.deepEqual(after,before,'Temporary query type changes altered deck pose/velocity');assert.equal(c.body.bodyType(),c.type);}assert.equal(JSON.stringify(parameters[1]),desired,'Query wrapper changed requested delta');}
   };
   const held=this.holdController.computeColliderMovement.bind(this.holdController);
   this.holdController.computeColliderMovement=(...parameters)=>{for(const d of carriers())assert.equal(this.doors.get(d.spec.id)!.rigid.bodyType(),RAPIER.RigidBodyType.KinematicPositionBased,'Temporary Fixed escaped into held query');return held(...parameters);};
   const physics=this.physics.step.bind(this.physics);
   this.physics.step=(...parameters)=>{for(const d of carriers()){assert.equal(this.doors.get(d.spec.id)!.rigid.bodyType(),RAPIER.RigidBodyType.KinematicPositionBased,'Temporary Fixed escaped into physics.step');this.candidateAudit.physicsTypeChecks++;}return physics(...parameters);};
   return;
  }
  if(process.env.RIFT_CANDIDATE_MODE==='skip-stationary-next'){
   for(const d of this.machines.devices.filter(d=>['lift','moving-platform'].includes(d.spec.kind))){
    const rigid=this.doors.get(d.spec.id)!.rigid,original=rigid.setNextKinematicTranslation.bind(rigid);
    rigid.setNextKinematicTranslation=(target)=>{
     const current=rigid.translation(),stationary=(target.x-current.x)**2+(target.y-current.y)**2+(target.z-current.z)**2<1e-12,type=stationary?RAPIER.RigidBodyType.Fixed:RAPIER.RigidBodyType.KinematicPositionBased;
     if(rigid.bodyType()!==type){this.candidateAudit.transitions.push({time:this.time,id:d.spec.id,type:stationary?'Fixed':'KinematicPositionBased',position:d.position.toArray(),delta:d.delta.toArray()});rigid.setBodyType(type,true);}
     if(!stationary)original(target);
    };
   }
   return;
  }
  const internal=this as unknown as {updateMachinery(dt:number):void},original=internal.updateMachinery.bind(this);
  internal.updateMachinery=(dt:number)=>{
   original(dt);
   for(const d of this.machines.devices.filter(d=>['lift','moving-platform'].includes(d.spec.kind))){
    const rigid=this.doors.get(d.spec.id)!.rigid,stationary=d.delta.lengthSq()<1e-12,type=stationary?RAPIER.RigidBodyType.Fixed:RAPIER.RigidBodyType.KinematicPositionBased;
    const changed=rigid.bodyType()!==type;
    if(changed)this.candidateAudit.transitions.push({time:this.time,id:d.spec.id,type:stationary?'Fixed':'KinematicPositionBased',position:d.position.toArray(),delta:d.delta.toArray()});
    if(process.env.RIFT_CANDIDATE_MODE!=='transition-only'||changed)rigid.setBodyType(type,true);
    if(!stationary)rigid.setNextKinematicTranslation(d.position);
   }
  };
 }
 override step(dt:number,input:Input){
  const previous=this.player.pos.clone(),oldCrossings=this.player.crossings,cubes=this.crates.map(c=>({position:c.pos.clone(),crossings:c.crossings}));
  const oldDecks=new Map(this.machines.devices.filter(d=>['lift','moving-platform'].includes(d.spec.kind)).map(d=>{const body=this.doors.get(d.spec.id)!.rigid;return[d.spec.id,{native:{...body.translation()},next:{...body.nextTranslation()},type:body.bodyType(),moving:d.moving}];}));
  super.step(dt,input);this.candidateAudit.steps++;
  for(const d of this.machines.devices.filter(d=>['lift','moving-platform'].includes(d.spec.kind)))if(oldDecks.get(d.spec.id)?.moving!==d.moving)this.candidateAudit.mechanicalTransitions.push({time:this.time,id:d.spec.id,moving:d.moving,position:d.position.toArray(),delta:d.delta.toArray()});
  if(this.player.crossings===oldCrossings)this.candidateAudit.maxPlayerStep=Math.max(this.candidateAudit.maxPlayerStep,this.player.pos.distanceTo(previous));
  this.crates.forEach((c,i)=>{if(c.crossings===cubes[i].crossings)this.candidateAudit.maxCubeStep=Math.max(this.candidateAudit.maxCubeStep,c.pos.distanceTo(cubes[i].position));const key=c.held?'maxHeldCubeSpeed':'maxLooseCubeSpeed';this.candidateAudit[key]=Math.max(this.candidateAudit[key],c.vel.length());});
  for(const d of this.machines.devices.filter(d=>['lift','moving-platform'].includes(d.spec.kind))){
   const body=this.doors.get(d.spec.id)!.rigid,top=d.position.y+d.spec.size[1]/2,nativeTop=body.translation().y+d.spec.size[1]/2,inside=(p:Vector3)=>Math.abs(p.x-d.position.x)<d.spec.size[0]/2-.01&&Math.abs(p.z-d.position.z)<d.spec.size[2]/2-.01;
   const context=()=>({time:this.time,dt,planned:d.position.toArray(),plannedPrevious:d.previous.toArray(),movementDelta:d.delta.toArray(),moving:d.moving,native:{...body.translation()},next:{...body.nextTranslation()},nativeType:body.bodyType(),beforeStep:oldDecks.get(d.spec.id),plannedTop:top,nativeTop});
   if(inside(this.player.pos)&&this.player.pos.y>=top){const penetration=top-(this.player.pos.y-.85);if(penetration>this.candidateAudit.maxPlayerDeckPenetration){this.candidateAudit.maxPlayerDeckPenetration=penetration;this.candidateAudit.maxPlayerDeckPenetrationFrame={...context(),player:this.player.pos.toArray(),nativePlayer:{...this.character.translation()},actualStep:this.player.pos.clone().sub(previous).toArray(),penetration};}}
   for(const [i,c] of this.crates.entries())if(inside(c.pos)&&c.pos.y>=top){const extent=[new Vector3(1,0,0),new Vector3(0,1,0),new Vector3(0,0,1)].reduce((sum,a,j)=>sum+Math.abs(a.applyQuaternion(c.rotation).y)*[c.half.x,c.half.y,c.half.z][j],0),penetration=top-(c.pos.y-extent),nativePenetration=nativeTop-(c.rigid.translation().y-extent);this.candidateAudit.maxNativeCubeDeckPenetration=Math.max(this.candidateAudit.maxNativeCubeDeckPenetration,nativePenetration);if(penetration>this.candidateAudit.maxCubeDeckPenetration){this.candidateAudit.maxCubeDeckPenetration=penetration;this.candidateAudit.maxCubeDeckPenetrationFrame={...context(),id:c.id,held:!!c.held,cube:c.pos.toArray(),nativeCube:{...c.rigid.translation()},nextCube:{...c.rigid.nextTranslation()},rotation:c.rotation.toArray(),nativeRotation:{...c.rigid.rotation()},extent,half:c.half.toArray(),actualCubeStep:c.pos.clone().sub(cubes[i].position).toArray(),velocity:c.vel.toArray(),penetration,nativePenetration};}}
  }
 }
 override dispose(){
  const dir=new URL('./stationary-deck-audit/',import.meta.url);mkdirSync(dir,{recursive:true});
  appendFileSync(new URL((process.env.RIFT_AUDIT_PREFIX??'metrics')+'.jsonl',dir),JSON.stringify({number:this.number,name:this.level.name,scope:'Isolated stationary-deck wrapper; portal coordinate jumps excluded from max step; deck penetration measured for body centres inside footprint and above deck top',...this.candidateAudit})+'\n');
  super.dispose();
 }
}
