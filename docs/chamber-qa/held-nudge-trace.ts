/** Read-only instrumentation of the unchanged held velocity test histories. Only public player KCC nudge differs. */
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import RAPIER from '@dimforge/rapier3d-compat';
import {Matrix4,Vector3} from 'three';
import {CoreWorld,initializePhysics} from '../../src/core/world';
await initializePhysics();
const idle={forward:0,strafe:0,jump:false};
const defaults=new RAPIER.World({x:0,y:0,z:0}),defaultController=defaults.createCharacterController(.015),defaultNudge=defaultController.normalNudgeFactor();defaults.free();
function look(w:CoreWorld,t:Vector3){const d=t.clone().sub(w.eye());w.yaw=Math.atan2(-d.x,-d.z);w.pitch=Math.asin(d.y/d.length());}
function collisions(w:CoreWorld,held=false){const controller=held?w.holdController:w.controller,hits=[];for(let i=0;i<controller.numComputedCollisions();i++){const h=controller.computedCollision(i)!;hits.push({id:h.collider?(w.fixed.get(h.collider.handle)?.id??[...w.doors].find(([,v])=>v.collider.handle===h.collider!.handle)?.[0]??'body'):'none',normal:h.normal1,toi:h.toi,remaining:h.translationDeltaRemaining});}return hits;}
function run(nudge:number,regrab:boolean){
 const w=new CoreWorld(1),frames:any[]=[];let phase='initial',held:any;
 try{
  const sourceNudge=w.controller.normalNudgeFactor();w.controller.setNormalNudgeFactor(nudge);
  const originalUpdate=w.updateHeld.bind(w);
  // Wrap only to read the values supplied to and produced by the original method.
  w.updateHeld=(dt,next=w.player.pos)=>{
   const cube=w.crates.find(c=>c.id===w.heldId);
   if(cube){const target=w.carryTarget(next).applyMatrix4(new Matrix4().fromArray(w.snapshot().holdSpaceTransform));held={dt,playerCurrent:w.player.pos.toArray(),playerNext:next.toArray(),playerNextDelta:next.clone().sub(w.player.pos).toArray(),playerComputed:{...w.controller.computedMovement()},playerHits:collisions(w),cubeCurrent:cube.pos.toArray(),cubeNativeCurrent:{...cube.rigid.translation()},target:target.toArray(),targetMinusCube:target.clone().sub(cube.pos).toArray(),boundedDesired:target.clone().sub(cube.pos).clampLength(0,18*dt).toArray()};}
   originalUpdate(dt,next);
   if(cube&&held){held.holdComputed={...w.holdController.computedMovement()};held.holdGrounded=w.holdController.computedGrounded();held.holdHits=collisions(w,true);held.cubeNativeNext={...cube.rigid.nextTranslation()};held.cubeNativeNextDelta=new Vector3().copy(cube.rigid.nextTranslation()).sub(new Vector3().copy(cube.rigid.translation())).toArray();}
  };
  function step(dt:number,input=idle){const before=w.player.pos.clone(),cubeBefore=w.crates[0].pos.clone();held=undefined;w.step(dt,input);frames.push({index:frames.length,phase,dt,held,playerAfter:w.player.pos.toArray(),playerActualDelta:w.player.pos.clone().sub(before).toArray(),playerVelocity:w.player.vel.toArray(),cubeAfter:w.crates[0].pos.toArray(),cubeActualDelta:w.crates[0].pos.clone().sub(cubeBefore).toArray(),cubeVelocity:w.crates[0].vel.toArray(),cubeSpeed:w.crates[0].vel.length(),playerCrossings:w.player.crossings,cubeCrossings:w.crates[0].crossings});}
  // Exact setup and settling counts from tests/core-held-velocity.test.ts.
  w.player.pos.set(3,3.665,-9.8);w.player.vel.set(0,0,0);w.character.setTranslation(w.player.pos,true);w.character.setNextKinematicTranslation(w.player.pos);w.physics.step();
  look(w,w.crates[0].pos);w.grabDrop();phase='grab settle';for(let i=0;i<40;i++)step(1/120);
  if(regrab){w.grabDrop();phase='drop settle';for(let i=0;i<120;i++)step(1/120);look(w,w.crates[0].pos);w.grabDrop();}
  look(w,new Vector3(10,4.315,-9.8));phase='turn settle';for(let i=0;i<40;i++)step(1/120);assert.equal(w.heldId,'weighted-cube');
  phase='mixed-dt walk';for(let i=0;i<60;i++)step(i%2?.0001:1/120,{...idle,forward:1});
  const walking=frames.filter(f=>f.phase==='mixed-dt walk'),peak=walking.reduce((a,f)=>f.cubeSpeed>a.cubeSpeed?f:a),peakPlayer=Math.max(...walking.map(f=>Math.hypot(...f.playerVelocity)));
  const invariants={playerPeakBelow4_81:peakPlayer<4.81,zeroPlayerCrossings:w.player.crossings===0,zeroCubeCrossings:w.crates[0].crossings===0,cubePeakBelow8:peak.cubeSpeed<8};
  return{sourceNudge,nudge,regrab,heldControllerNudge:w.holdController.normalNudgeFactor(),peak:peak.cubeSpeed,peakPlayer,peakFrame:peak.index,invariants,frames};
 }finally{w.dispose();}
}
const results=[.005,defaultNudge].flatMap(nudge=>[false,true].map(regrab=>run(nudge,regrab)));
const report={scope:'Unchanged original held grab/regrab histories. Public player normalNudgeFactor comparison only; wrapper reads the original updateHeld inputs/results and does not replace motion. No portal crossings, no source edits, not browser proof.',defaultNudge,results};
writeFileSync(new URL('./held-nudge-trace.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({defaultNudge,results:results.map(({frames,...r})=>({...r,peakFrameDetail:frames[r.peakFrame],precedingFrame:frames[r.peakFrame-1]}))},null,2));
