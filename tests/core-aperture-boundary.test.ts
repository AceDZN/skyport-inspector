/** Native Rapier boundary contracts. Explicit unit poses are not browser completion evidence.
 * Contract is the rectangular clearance envelope with 0.015m tolerance, not an exact ellipse hull.
 */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {Vector3,Quaternion} from 'three';
import {CoreWorld,initializePhysics} from '../src/core/world';
import {getCoreLevel} from '../src/core/levels';
const idle={forward:0,strafe:0,jump:false};
before(async()=>{await initializePhysics();});
function wallProbe(kind:'player'|'cube',offset:number,angle=0,highEntry=false){
 const w=new CoreWorld(1);try{assert.ok(w.place(0,'near-wall',new Vector3(-7.985,highEntry?2.1:1.55,6)));assert.ok(w.place(1,'far-wall',new Vector3(3,highEntry?4.9:4.35,-11.985)));
 const body=kind==='player'?w.player:w.crates[0];body.pos.set(-7.1,kind==='player'?.87:1.55,6+offset);
 if(kind==='player'){w.character.setTranslation(body.pos,true);w.character.setNextKinematicTranslation(body.pos);w.yaw=Math.PI/2;}else{const c=w.crates[0];c.rigid.setTranslation(c.pos,true);c.rigid.setGravityScale(0,true);c.rotation.copy(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),angle));c.rigid.setRotation(c.rotation,true);c.rigid.setLinvel({x:-4,y:0,z:0},true);}
 w.physics.propagateModifiedBodyPositionsToColliders();for(let i=0;i<90;i++)w.step(1/120,{...idle,forward:kind==='player'?1:0});return {crossings:body.crossings,position:body.pos.toArray()};
 }finally{w.dispose();}
}
test('wall aperture admits centered capsule and blocks its 0.08m horizontal frame overhang',()=>{
 assert.equal(wallProbe('player',0).crossings,1);const edge=wallProbe('player',.7);assert.equal(edge.crossings,0,'Capsule support extends beyond the portal frame');assert.ok(edge.position[0]>-7.99,'Blocked capsule passes behind solid host wall');
});
test('wall aperture blocks a ground capsule below a deliberately raised portal opening beyond floor alignment',()=>{
 assert.equal(wallProbe('player',0,0,true).crossings,0,'Feet below opening pass through adjacent host wall');
});
for(const angle of [0,Math.PI/4])test(`wall aperture uses full cube support at yaw${angle}`,()=>{
 assert.equal(wallProbe('cube',0,angle).crossings,1);const edge=wallProbe('cube',angle?.2:.5,angle);assert.equal(edge.crossings,0,'Oriented cube protrudes through wall outside the physical aperture');assert.ok(edge.position[0]>-7.99,'Blocked rigid cube escapes behind entry host');
});
for(const kind of ['player','cube'] as const)test(`floor aperture uses full horizontal support for ${kind}`,()=>{
 for(const offset of [0,kind==='player'?.95:.75]){
  const base=getCoreLevel(2);
  // The cube is an explicit isolated test fixture; public Chamber2 has no cargo.
  const definition=kind==='cube'?{...base,blueprint:()=>{const b=base.blueprint();b.cargo=[{spec:{id:'floor-cube',label:'CUBE',shape:'diamond' as const,size:'large' as const,start:'front' as const},position:[offset,.55,6]}];return b;}}:undefined;
  const w=new CoreWorld(2,undefined,definition);try{
   assert.ok(w.place(0,'drop-floor',new Vector3(0,-2.975,6)));assert.ok(w.place(1,'high-wall',new Vector3(0,6,-11.985)));
   const body=kind==='player'?w.player:w.crates[0];
   if(kind==='player'){body.pos.set(offset,.87,6);w.character.setTranslation(body.pos,true);w.character.setNextKinematicTranslation(body.pos);}
   w.physics.propagateModifiedBodyPositionsToColliders();for(let i=0;i<150;i++)w.step(1/120,idle);
   assert.equal(body.crossings,offset===0?1:0,'Floor portal accepts body footprint beyond its rectangular envelope');
  }finally{w.dispose();}
 }
});
