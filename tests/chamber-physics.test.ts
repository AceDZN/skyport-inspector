/** Physics contract regressions with isolated unit setup. These are not normal-input play evidence. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {RiftWorld,makeSolid} from '../src/physics';
import {firstRoom} from '../src/content';

function heldCube(){
 const w=new RiftWorld(firstRoom),cube=w.crates[0];
 w.crates=[cube];w.pads=[];w.bridges=[];w.player.pos.set(0,.85,2);w.player.grounded=true;w.yaw=0;w.pitch=0;
 cube.held=true;w.heldId=cube.id;return {w,cube};
}

test('looking down while holding a cube above an elevated floor cannot put the cube through that floor',()=>{
 const {w,cube}=heldCube(),floor=makeSolid('raised-floor',0,2.7,0,8,.6,8,'floor');w.solids=[floor];w.player.pos.set(0,floor.max.y+w.player.half.y,0);w.pitch=-1.3;w.updateHeld();
 assert.ok(cube.pos.y-cube.half.y>=floor.max.y-.02,`Held cube penetrates upper floor: bottom=${cube.pos.y-cube.half.y}, top=${floor.max.y}`);
});

test('holding a cube against two aligned walls respects the nearest collision regardless of solid order',()=>{
 for(const reverse of [false,true]){
  const {w,cube}=heldCube(),near=makeSolid('near-wall',0,1.5,1.1,5,3,.2,'wall'),far=makeSolid('far-wall',0,1.5,.2,5,3,.2,'wall');w.solids=reverse?[far,near]:[near,far];w.updateHeld();
  assert.ok(cube.pos.z-cube.half.z>=near.max.z-.02,`Held cube crosses nearest wall when reverse=${reverse}: cube=${cube.pos.z}, wall=${near.max.z}`);
 }
});
