/** Actual authored C16 spawn/history; native route, never browser or earned-save proof.
 * Only camera aim, ordinary 120Hz input, visible E and physically ray-clear portal
 * placement are used. No actor/cargo pose, velocity, history, goal or reset writes.
 */
import test,{before}from'node:test';
import assert from'node:assert/strict';
import{mkdirSync,writeFileSync}from'node:fs';
import{pathToFileURL}from'node:url';
import RAPIER from'@dimforge/rapier3d-compat';
import{Vector3}from'three';
import{CoreWorld as RuntimeWorld,initializePhysics as runtimeInit}from'../src/core/world';
import{draftComparisonLevels}from'../src/core/levels/comparisons';
import{V,portalMatrix,type Input}from'../src/physics';
const selected=process.env.RIFT_PARTIAL_WORLD_SOURCE?await import(pathToFileURL(process.env.RIFT_PARTIAL_WORLD_SOURCE).href):{CoreWorld:RuntimeWorld,initializePhysics:runtimeInit};
const CoreWorld=selected.CoreWorld as typeof RuntimeWorld;
before(async()=>{await selected.initializePhysics();});
const dt=1/120,idle:Input={forward:0,strafe:0,jump:false},forward:Input={...idle,forward:1};

test('partial C16 floor entry losing mapped wall fit retains solid support and recovers through real basin lift',()=>{
 const level=draftComparisonLevels.find(l=>l.number===16)!;
 const w=new CoreWorld(16,undefined,level),trace:any[]=[],events:any[]=[];
 let error:unknown,maxNativeDisagreement=0,lossWhileIntersecting=false;
 const contacts=()=>Array.from({length:w.controller.numComputedCollisions()},(_,i)=>w.controller.computedCollision(i)!).map(c=>({id:c.collider?w.fixed.get(c.collider.handle)?.id:undefined,normal:c.normal1,witness:c.witness1,applied:c.translationDeltaApplied,remaining:c.translationDeltaRemaining}));
 const fit=(position=w.player.pos)=>{
  const entry=w.portals[0],exit=w.portals[1];if(!entry||!exit)return undefined;
  const distance=position.clone().sub(entry.center).dot(entry.normal),projected=position.clone().addScaledVector(entry.normal,-distance),mapped=projected.applyMatrix4(portalMatrix(entry,exit)).addScaledVector(exit.normal,.015);
  return{source:w.aperture(w.player,entry,position),destination:w.aperture(w.player,exit,mapped),distance,intersecting:distance>0&&distance<w.player.half.y,mapped:mapped.toArray()};
 };
 const note=(label:string)=>trace.push({label,time:w.time,player:w.snapshot().player,native:w.character.translation(),nextNative:w.character.nextTranslation(),fit:fit(),contacts:contacts()});
 // Observe the actual native candidate before the runtime can safely roll it
 // back. This wrapper forwards the original arguments/result unchanged and
 // writes only this test's telemetry, never any physics/actor state.
 const originalCross=(w as any).cross;
 (w as any).cross=function(body:unknown,previous:Vector3,rotation:unknown){
  if(body===w.player){const current=fit(),prior=fit(previous);if(current?.intersecting&&(!current.source||!current.destination)&&prior?.source&&prior.destination){lossWhileIntersecting=true;note('actual-partial-entry-fit-loss-before-runtime-correction');trace.at(-1).previousFit=prior;}}
  return originalCross.call(this,body,previous,rotation);
 };
 const step=(input=idle)=>{
  w.step(dt,input);
  maxNativeDisagreement=Math.max(maxNativeDisagreement,w.player.pos.distanceTo(new Vector3().copy(w.character.translation())));
  assert.equal(w.respawns,0,'Route reset instead of recovering through physical geometry');
 };
 const tick=(seconds:number,input=idle)=>{for(let i=0;i<Math.ceil(seconds/dt);i++)step(input);};
 const look=(point:Vector3)=>{const d=point.clone().sub(w.eye());w.yaw=Math.atan2(-d.x,-d.z);w.pitch=Math.asin(d.y/d.length());};
 const walk=(x:number,z:number,limit=20)=>{
  for(let i=0;i<Math.ceil(limit/dt);i++){const dx=x-w.player.pos.x,dz=z-w.player.pos.z;if(Math.hypot(dx,dz)<.12){tick(.12);return;}w.yaw=Math.atan2(-dx,-dz);w.pitch=0;step(forward);}
  note('blocked-walk');assert.fail('Ordinary walk blocked toward '+[x,z]+' at '+w.player.pos.toArray());
 };
 const shot=(index:0|1,id:string,point:Vector3)=>{
  const surface=w.surfaces.find(s=>s.id===id)!;assert.ok(surface);look(point);assert.ok(w.eye().clone().sub(surface.center).dot(surface.normal)>0);
  const d=point.clone().sub(w.eye()),range=d.length(),hit=w.physics.castRay(new RAPIER.Ray(w.eye(),d.normalize()),range-.07,true,undefined,undefined,w.characterCollider,undefined,c=>{const solid=w.fixed.get(c.handle);return !(solid&&(solid.id===surface.solidId||solid.kind==='glass'));});
  assert.equal(hit,null,'Real opaque geometry obstructs planned shot');assert.ok(w.place(index,id,point),'Real full aperture rejected planned shot');
 };
 const assertSupportedAbove=(id:string)=>{
  const floor=w.solids.find(s=>s.id===id)!;assert.ok(floor);const feet=w.player.pos.y-w.player.half.y;
  assert.ok(w.player.grounded,'Terminal body lacks actual grounded outcome');
  assert.ok(feet>=floor.max.y-.02,`Grounded capsule penetrates ${id}: feet ${feet}, floor top ${floor.max.y}`);
  assert.ok(feet<=floor.max.y+.05,`Grounded capsule floats above ${id}`);
  assert.ok(w.player.pos.x>=floor.min.x&&w.player.pos.x<=floor.max.x&&w.player.pos.z>=floor.min.z&&w.player.pos.z<=floor.max.z);
 };
 const basinRecovery=()=>{
  if(w.player.pos.y>-21){walk(-5,-5.2);tick(2);}
  assertSupportedAbove('recovery-basin');note('actual-bottom-opening-to-basin');
  walk(-1,10);walk(-5,10);const lift=w.machines.devices.find(d=>d.spec.id==='recovery-lift')!;assert.ok(lift);look(lift.position.clone().add(V(...lift.spec.controlOffset!)));
  assert.match(w.interactionHint(),/Use/);assert.equal(w.interact(),true,'Ordinary E did not reach actual RETURN control');
  for(let i=0;i<25/dt&&lift.position.y<-.201;i++)step();
  assert.ok(lift.position.y>-.201,'Actual recovery elevator failed to reach top dock');
  assert.ok(w.player.grounded&&w.player.pos.y>.8,'Actual capsule was not carried back to approach');walk(-1,10);note('actual-recovery-lift-return');
 };
 try{
  assert.ok(w.player.pos.distanceTo(V(...w.blueprint.spawn))<.05);tick(.3);
  walk(-1,7.3);walk(-5,7.3);walk(-5,6.45);
  shot(0,'shallow-floor',V(-5,-2.975,.9));shot(1,'launch-white',V(-7.985,9,-6));note('unchanged-authored-offset-jump-setup');
  w.yaw=0;w.pitch=0;
  for(let i=0;i<4/dt;i++){step({...forward,jump:true});if(i%12===0)note('ordinary-offset-jump-'+i);}
  note('terminal-unchanged-four-second-history');
  assert.equal(w.player.crossings,0,'This changing-fit history must not cross an invalid destination');
  assert.equal(lossWhileIntersecting,true,'History did not actually lose fit during partial entry');
  // A blocked portal must restore source support before reporting grounded.
  // Select the physical terminal floor rather than accepting a deep centre with
  // a grounded bit, or requiring a particular new corrective landing choice.
  assertSupportedAbove(w.player.pos.y<-21?'recovery-basin':'shallow-bottom');
  assert.ok(maxNativeDisagreement<.002,'Native capsule/proxy disagree after fit-loss rollback');
  assert.equal(w.campaignResult,undefined);basinRecovery();
  // Recenter the same shallow portal through ordinary placement, then fall
  // without a jump. This checks recovery without clearing portal/body history.
  walk(-1,7.3);walk(-5,7.3);walk(-5,6.45);shot(0,'shallow-floor',V(-5,-2.975,3.1));note('legitimate-recentered-source');w.yaw=0;w.pitch=0;
  for(let i=0;i<4/dt&&w.player.crossings===0;i++)step(forward);
  assert.equal(w.player.crossings,1,'Recentered legal source retains stale fit-loss blockage');
  assert.equal(w.aperture(w.player,w.portals[1]!),true,'Recentered actual upright destination fit fails');note('actual-recentered-gravity-crossing');
  const enter=w.events.filter(e=>e.type==='enter'&&e.body==='player').at(-1)!;assert.ok(enter);assert.ok(Math.abs(Number(enter.speed)-Number(enter.exitSpeed))<1e-6,'Recovery changes portal energy');
  for(let i=0;i<6/dt&&!w.player.grounded;i++)step();assertSupportedAbove('lower-gallery');assert.equal(w.campaignResult,undefined);note('real-lower-landing-after-recenter');
  assert.equal(w.respawns,0);assert.ok(maxNativeDisagreement<.002);
 }catch(e){error=e;throw e;}
 finally{
  events.push(...w.events);const folder=process.env.RIFT_PARTIAL_RUN?new URL('../docs/chamber-qa/partial-fit/'+process.env.RIFT_PARTIAL_RUN+'/',import.meta.url):new URL('../work/chamber-qa/partial-fit/unit-'+Date.now()+'/',import.meta.url);mkdirSync(folder,{recursive:true});
  writeFileSync(new URL('C16-authored-offset-jump.json',folder),JSON.stringify({scope:'Actual authored C16 spawn. Native120Hz ordinary camera/WASD/Space/E/clear portal shots only; no pose/velocity/history/reset/save writes. Not browser or earned progress.',source:process.env.RIFT_PARTIAL_WORLD_SOURCE??'current runtime source',error:error?String(error):null,lossWhileIntersecting,maxNativeDisagreement,trace,events,final:w.snapshot()},null,2)+'\n');w.dispose();
 }
});
