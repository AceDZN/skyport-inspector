/** One same-pose native recomputation. No source change, actor relocation, or result application. */
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {writeFileSync} from 'node:fs';
import {CoreWorld,initializePhysics} from '../../src/core/world';
import {ChamberBuilder} from '../../src/core/level-kit';
await initializePhysics();
const idle={forward:0,strafe:0,jump:false};
const b=new ChamberBuilder();b.world.spawn=[0,.87,7];
b.floor('loading-floor',-8,8,2,12);b.floor('upper-gallery',-8,8,-12,-2,4.2);b.floor('catch-floor',-8,8,-12,12,-4);
b.device({id:'freight',kind:'lift',label:'FREIGHT',position:[0,-.15,0],size:[4,.3,4],stops:[{label:'lower',position:[0,-.15,0]},{label:'upper',position:[0,4.05,0]}],controlOffset:[1.3,.9,1.3]});
b.device({id:'power',kind:'switch',label:'POWER',position:[-4,.7,5],size:[.6,1,.35]});b.cube('sample-cube',[-.6,.55,0]);
const w=new CoreWorld(98,undefined,{number:98,name:'Same-pose KCC diagnostic',mission:'Not a campaign run',he:'',chapter:'Test',sources:[],architecture:{height:9,halfWidth:8,style:'ceramic'},blueprint:()=>b.finish()});
function tick(seconds:number){for(let i=0;i<seconds*120;i++)w.step(1/120,idle);}
function walk(x:number,z:number,seconds=4){for(let i=0;i<seconds*120;i++){const dx=x-w.player.pos.x,dz=z-w.player.pos.z;if(Math.hypot(dx,dz)<.03){tick(.15);return true;}w.yaw=Math.atan2(-dx,-dz);w.pitch=0;w.step(1/120,{forward:1,strafe:0,jump:false});}return false;}
try{
 tick(.5);assert.ok(walk(0,2.3));tick(1);assert.equal(walk(-3,5),false,'The unchanged history must still reproduce the stall before comparing native queries');
 const before={proxy:w.player.pos.toArray(),native:{...w.character.translation()},grounded:w.player.grounded,velocity:w.player.vel.toArray(),movement:{...w.controller.computedMovement()}};
 const results=[];
 for(const [label,desired] of [
  ['actual gravity delta',{x:-.028364501893520355,y:-.0011111111380159855,z:.0282038114964962}],
  ['same actual delta with stationary deck treated as Fixed',{x:-.028364501893520355,y:-.0011111111380159855,z:.0282038114964962}],
 ] as const){
  // Test the maintained KCC's native kinematic-friction contribution, changing only a stationary deck's rigid-body type.
  if(label.includes('Fixed'))w.doors.get('freight')!.rigid.setBodyType(RAPIER.RigidBodyType.Fixed,true);
  // No shape, collider position, player pose or result application changes.
  w.controller.computeColliderMovement(w.characterCollider,desired,undefined,undefined,()=>true);
  const movement={...w.controller.computedMovement()},hits=[];
  for(let i=0;i<w.controller.numComputedCollisions();i++){const c=w.controller.computedCollision(i)!;hits.push({id:c.collider?(w.fixed.get(c.collider.handle)?.id??[...w.doors].find(([,v])=>v.collider.handle===c.collider!.handle)?.[0]??'body'):'none',normal:c.normal1,toi:c.toi,remaining:c.translationDeltaRemaining});}
  const desiredHorizontal=Math.hypot(desired.x,desired.z),computedHorizontal=Math.hypot(movement.x,movement.z);
  const unchanged=JSON.stringify(w.player.pos.toArray())===JSON.stringify(before.proxy)&&JSON.stringify(w.character.translation())===JSON.stringify(before.native);
  assert.ok(unchanged,'A query must not relocate either actor representation');
  results.push({label,desired,movement,computedGrounded:w.controller.computedGrounded(),desiredHorizontal,computedHorizontal,horizontalRatio:computedHorizontal/desiredHorizontal,bounded:computedHorizontal<=desiredHorizontal+.000001&&Math.abs(movement.y)<.08,actorUnchanged:unchanged,hits});
 }
 const report={scope:'Two native KCC queries at exactly the same naturally reproduced stalled pose; second query makes only the stationary deck Fixed to isolate kinematic friction. Neither result is applied; no actor relocation or physics-world source edit.',configuration:{offset:w.controller.offset(),nudge:w.controller.normalNudgeFactor()},before,results};
 writeFileSync(new URL('./seam-body-type-probe.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({...report,results:results.map(({hits,...r})=>({...r,hitCount:hits.length,firstHit:hits[0]}))},null,2));
}finally{w.dispose();}
