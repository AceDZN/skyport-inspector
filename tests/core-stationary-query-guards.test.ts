/** Synthetic native safety units, NOT authored-route/browser/play evidence. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {Quaternion} from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {CoreWorld,initializePhysics} from '../src/core/world';
import {ChamberBuilder} from '../src/core/level-kit';
import type {CoreLevel} from '../src/core/level';
import {V} from '../src/physics';
const enabled=process.env.RIFT_STATIONARY_QUERY_GUARDS==='1';
before(async()=>{if(enabled)await initializePhysics();});
for(const scenario of ['eligible','queued-translation','queued-rotation','residual-linear','residual-angular'] as const)test('synthetic safety stationary query '+scenario+' preserves actual native state/motion',{skip:!enabled},()=>{
 const b=new ChamberBuilder();b.world.spawn=[-4,.87,4];b.floor('lab-floor',-6,6,-6,6);
 b.device({id:'specimen',kind:scenario==='eligible'?'switch':'conveyor',label:'SAFETY UNIT',position:[0,1,0],size:[1,.4,1],direction:[1,0,0],speed:1});
 const level:CoreLevel={number:90,name:'Native guard safety lab',chapter:'SYNTHETIC QA',mission:'Safety unit',he:'',sources:[],architecture:{height:8,halfWidth:6,style:'graphite'},blueprint:()=>b.finish()};
 const w=new CoreWorld(90,undefined,level),rigid=w.doors.get('specimen')!.rigid,out=process.env.RIFT_COMMON_GUARD_OUT;assert.ok(out,'Unique safety-unit evidence root required');
 const native=()=>{const linear={...rigid.linvel()},angular={...rigid.angvel()};return{type:rigid.bodyType(),pose:{position:{...rigid.translation()},rotation:{...rigid.rotation()}},next:{position:{...rigid.nextTranslation()},rotation:{...rigid.nextRotation()}},linear,angular,negativeZeroComponents:[...Object.entries(linear).filter(([,v])=>Object.is(v,-0)).map(([k])=>'v.'+k),...Object.entries(angular).filter(([,v])=>Object.is(v,-0)).map(([k])=>'omega.'+k)]};};
 const readings:unknown[]=[];let error:unknown,before:ReturnType<typeof native>|undefined,after:ReturnType<typeof native>|undefined;
 try{
  // Native queue/state preparation is explicit synthetic setup. No actor setter.
  if(scenario==='queued-translation')rigid.setNextKinematicTranslation({x:.25,y:1,z:0});
  if(scenario==='queued-rotation')rigid.setNextKinematicRotation(new Quaternion().setFromAxisAngle(V(0,1,0),.2));
  if(scenario==='residual-linear'){rigid.setNextKinematicTranslation({x:1e-12,y:1,z:0});w.physics.step();assert.ok(Math.abs(rigid.linvel().x)>0&&Math.abs(rigid.linvel().x)<1e-8,'Real prior native step must produce a small residual linear velocity');}
  if(scenario==='residual-angular'){rigid.setNextKinematicRotation(new Quaternion().setFromAxisAngle(V(0,1,0),1e-3));w.physics.step();assert.ok(Math.abs(rigid.angvel().y)>0,'Finite prior native rotation must produce measured nonzero angular velocity');rigid.setNextKinematicRotation(rigid.rotation());assert.deepEqual({...rigid.nextRotation()},{...rigid.rotation()},'Actual current rotation must be the queued stopped destination');}
  before=native();assert.equal(w.machines.devices[0].delta.lengthSq(),0,'Proxy planned delta remains zero in this native-queue safety unit');
  const seen:number[]=[],original=w.controller.computeColliderMovement.bind(w.controller);
  w.controller.computeColliderMovement=(...args)=>{seen.push(rigid.bodyType());readings.push({stage:'inside-actual-native-character-query',state:native()});return original(...args);};
  const requested=V(.001,-.001,0),saved=requested.toArray();(w as unknown as{computeCharacterMovement(v:ReturnType<typeof V>):void}).computeCharacterMovement(requested);after=native();
  assert.deepEqual(after,before,'Actual native type/current+queued TQ/v/omega must survive the character query');assert.deepEqual(requested.toArray(),saved);
  assert.equal(seen.length,1);assert.equal(seen[0],scenario==='eligible'?RAPIER.RigidBodyType.Fixed:RAPIER.RigidBodyType.KinematicPositionBased,'Unsafe queued/residual state must not be made Fixed');
  readings.push({stage:'restored-before-native-integration',state:after});
  if(scenario==='residual-angular'){w.physics.step();const stopped=native();assert.deepEqual(stopped.pose,after.pose,'Real stopped native integration must preserve current pose');assert.equal(stopped.angular.y,0,'Actual stopped native integration must naturally clear angular velocity');readings.push({stage:'actual-native-stopped-after-nonzero-prior-angular',state:stopped});}
  if(scenario==='queued-translation'){w.physics.step();assert.ok(Math.abs(rigid.translation().x-.25)<1e-6,'Queued native translation was inhibited');readings.push({stage:'actual-native-translated',state:native()});}
  if(scenario==='queued-rotation'){w.physics.step();const q=rigid.rotation(),target=new Quaternion().setFromAxisAngle(V(0,1,0),.2);assert.ok(Math.abs(q.x*target.x+q.y*target.y+q.z*target.z+q.w*target.w)>1-1e-6,'Queued native rotation was inhibited');readings.push({stage:'actual-native-rotated',state:native()});}
 }catch(e){error=e;throw e;}finally{mkdirSync(out,{recursive:true});writeFileSync(out+'/'+scenario+'.json',JSON.stringify({scope:'SYNTHETIC NATIVE SAFETY UNIT ONLY. Explicit native kinematic queue setup; residual velocities generated by real prior physics step; angular uses finite1e-3 rotation then queues actual currentQ as stopped destination. Not authored-route/browser evidence. No actor/goal/save/clock-machine setters.',scenario,error:error?String(error):null,before,after,readings,final:native()},null,2)+'\n');w.dispose();}
});
