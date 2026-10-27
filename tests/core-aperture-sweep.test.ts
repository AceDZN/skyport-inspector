/** Native previous-pose/current-pose aperture regression. Unit poses are not browser gameplay. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {Vector3,Quaternion} from 'three';
import {CoreWorld,initializePhysics} from '../src/core/world';
before(async()=>{await initializePhysics();});
function probe(kind:'player'|'cube',edge:boolean,angle=0){
 const w=new CoreWorld(1);try{w.place(0,'near-wall',new Vector3(-7.985,1.55,6));w.place(1,'far-wall',new Vector3(3,4.35,-11.985));const body=kind==='player'?w.player:w.crates[0];
 body.pos.set(-7.95,kind==='player'?.87:1.55,6+(kind==='player'?(edge?.62:.4):(edge?(angle?.08:.25):(angle?-.1:0))));
 if(kind==='player'){w.character.setTranslation(body.pos,true);w.character.setNextKinematicTranslation(body.pos);w.player.vel.set(-3.394,0,3.394);w.player.grounded=true;w.yaw=Math.PI/2;}else{const c=w.crates[0];c.rotation.copy(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),angle));c.rigid.setTranslation(c.pos,true);c.rigid.setRotation(c.rotation,true);c.rigid.setGravityScale(0,true);c.rigid.setLinvel({x:-20,y:0,z:20},true);}
 w.physics.propagateModifiedBodyPositionsToColliders();w.step(1/120,{forward:kind==='player'?1:0,strafe:kind==='player'?-1:0,jump:false});
 const native=kind==='player'?w.character.translation():w.crates[0].rigid.translation();
 assert.ok(body.pos.distanceTo(new Vector3().copy(native))<.001,'Rollback moves proxy but leaves native body behind');
 if(!edge){assert.equal(body.crossings,1,'A fitting diagonal center control no longer traverses');return;}
 assert.equal(body.crossings,0,'Fit-losing body is teleported despite frame overhang');
 assert.ok(body.pos.x>=w.portals[0]!.center.x-.001,`Body crossed host plane without a valid aperture: ${body.pos.toArray()}`);
 assert.ok(body.vel.x>=-.01,'Rejected alignment retains inward normal speed');
 assert.ok(body.vel.z>1,'Safe rollback erases tangential recovery motion');
 assert.equal(w.events.some(e=>e.type==='blocked'),false,'Alignment loss is incorrectly described as a blocked exit');
 }finally{w.dispose();}
}
test('ordinary diagonal capsule preserves fitted crossings and rolls back a lost-width crossing',()=>{probe('player',false);probe('player',true);});
for(const angle of [0,Math.PI/4])test(`diagonal dynamic cube uses previous/current projected fit with yaw${angle}`,()=>{probe('cube',false,angle);probe('cube',true,angle);});
