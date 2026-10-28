/** Explicit synthetic safety fixtures. Not authored/browser play. Native poses come only from construction. */
import test,{before} from 'node:test';import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';import {Matrix4,Quaternion} from 'three';
import {CoreWorld,initializePhysics} from '../src/core/world';import {ChamberBuilder} from '../src/core/level-kit';import type {CoreLevel} from '../src/core/level';import {V,portalMatrix} from '../src/physics';
const enabled=process.env.RIFT_C4_CONNECTED_SAFETY==='1';before(async()=>{if(enabled)await initializePhysics();});
type Scenario='endpoint-A'|'endpoint-B'|'opaque-before'|'opaque-after'|'outside-aperture'|'outside-range'|'ordinary-local'|'release-90'|'relink-drop';
for(const scenario of ['endpoint-A','endpoint-B','opaque-before','opaque-after','outside-aperture','outside-range','ordinary-local','release-90','relink-drop'] as Scenario[])test('synthetic connected pickup safety '+scenario,{skip:!enabled},()=>{
 const b=new ChamberBuilder();b.world.spawn=scenario==='endpoint-B'?[10,.87,-4.8]:[-2.8,.87,0];b.floor('A-floor',-4,2,-4,4);b.floor('B-floor',6,14,-6,2);
 b.box('A-host',[-4.2,2,0],[.4,4,8]);b.box('B-host',[10,2,-6.2],[8,4,.4]);b.panel('A-white','A-host',[-3.985,2,0],[1,0,0],4,4);b.panel('B-white','B-host',[10,2,-5.985],[0,0,1],4,4);
 const cube: [number,number,number]=scenario==='endpoint-B'?[-2.9,.55,0]:scenario==='ordinary-local'?[-1,.55,0]:scenario==='outside-aperture'?[11.8,.55,-4.9]:scenario==='outside-range'?[10,.55,-3.5]:[10,.55,-4.9];b.cube('safety-cube',cube);
 if(scenario==='opaque-before')b.box('opaque-before-entry',[-3.5,1.5,0],[.1,3,3]);if(scenario==='opaque-after')b.box('opaque-after-exit',[10,1.5,-5.7],[3,3,.12]);
 const level:CoreLevel={number:91,name:'Connected pickup safety',mission:'Safety fixture',he:'',chapter:'Synthetic native safety',sources:[],architecture:{height:5,halfWidth:14,style:'graphite'},blueprint:()=>b.finish()},w=new CoreWorld(91,undefined,level),c=w.crates[0],out=process.env.RIFT_C4_CONNECTED_SAFETY_OUT;assert.ok(out);const readings:unknown[]=[];let error:unknown;
 const read=()=>({snapshot:w.snapshot(),native:{type:c.rigid.bodyType(),position:{...c.rigid.translation()},nextPosition:{...c.rigid.nextTranslation()},rotation:{...c.rigid.rotation()},nextRotation:{...c.rigid.nextRotation()},linear:{...c.rigid.linvel()},angular:{...c.rigid.angvel()}}});
 const look=(point:ReturnType<typeof V>)=>{const d=point.clone().sub(w.eye());w.yaw=Math.atan2(-d.x,-d.z);w.pitch=Math.asin(d.y/d.length());};const mapNear=(actual:number[],expected:number[])=>actual.every((v,i)=>Math.abs(v-expected[i])<1e-6);
 try{
  assert.equal(w.place(0,'A-white',V(-3.985,1.55,0)),true);assert.equal(w.place(1,'B-white',V(10,1.55,-5.985)),true);const entry=scenario==='endpoint-B'?1:0,map=portalMatrix(w.portals[entry]!,w.portals[1-entry]!),apparent=scenario==='ordinary-local'?c.pos.clone():c.pos.clone().applyMatrix4(map.clone().invert());look(apparent);readings.push({stage:'before-E',entry,apparent:apparent.toArray(),range:apparent.distanceTo(w.eye()),state:read()});
  if(scenario==='outside-aperture')assert.ok(apparent.distanceTo(w.eye())<3.1,'Aperture-negative must not be a range-negative');if(scenario==='outside-range')assert.ok(apparent.distanceTo(w.eye())>3.1);
  w.grabDrop();readings.push({stage:'immediately-after-E',state:read()});const forbidden=['opaque-before','opaque-after','outside-aperture','outside-range'].includes(scenario);
  if(forbidden){assert.equal(w.snapshot().held,null,'Opaque/aperture/range rejection must remain solid');return;}
  assert.equal(w.snapshot().held,'safety-cube');assert.ok(mapNear(w.snapshot().holdSpaceTransform,scenario==='ordinary-local'?new Matrix4().elements:map.elements),'Initial selected hold-space map is wrong');
  if(scenario==='release-90'||scenario==='relink-drop'){
   look(V(-6,w.eye().y,0));const hold=new Matrix4().fromArray(w.snapshot().holdSpaceTransform),expected=w.player.vel.clone().addScaledVector(w.forward(),.5).applyQuaternion(new Quaternion().setFromRotationMatrix(hold)),beforePosition={...c.rigid.translation()};
   if(scenario==='release-90')w.grabDrop();else assert.equal(w.place(0,'A-white',V(-3.985,1.55,1)),true);
   readings.push({stage:scenario,expectedVelocity:expected.toArray(),state:read()});assert.equal(w.snapshot().held,null);assert.ok(V().copy(c.rigid.linvel()).distanceTo(expected)<1e-6,'Release velocity must be mapped before resetting carry space');assert.deepEqual({...c.rigid.translation()},beforePosition,'Drop/relink may not nudge actual cube pose');assert.ok(mapNear(w.snapshot().holdSpaceTransform,new Matrix4().elements));
  }
 }catch(e){error=e;throw e;}finally{mkdirSync(out,{recursive:true});writeFileSync(out+'/'+scenario+'.json',JSON.stringify({scope:'Synthetic safety fixture only; authored position inventory set once through blueprint construction. Ordinary camera/portal placement/grabDrop commands afterward; no body pose/velocity/clock/history/save setters. Not browser play.',scenario,error:error?String(error):null,readings,final:read()},null,2)+'\n');w.dispose();}
});
