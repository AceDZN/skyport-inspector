/** Isolated physical doorway/goal contracts. These native setups are not campaign completion evidence. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {CoreWorld,initializePhysics} from '../src/core/world';
import {getCoreLevel} from '../src/core/levels';
before(async()=>{await initializePhysics();});
const idle={forward:0,strafe:0,jump:false};
type Entry={number:number;exit:string;door:string;axis:'x'|'z';direction:number;start:number;across:number;height:number;lanes:number[];pads:string[];alternate?:boolean};
const entries:Entry[]=[
 {number:1,exit:'next-chamber',door:'exit-door',axis:'x',direction:-1,start:-7,across:-9.6,height:.87,lanes:[10.05,11.95],pads:['exit-button']},
 {number:2,exit:'upper-exit',door:'upper-door',axis:'z',direction:-1,start:-5.8,across:-9.3,height:4.27,lanes:[3.85,6.15],pads:[]},
 {number:3,exit:'north-exit',door:'north-door',axis:'z',direction:-1,start:-13,across:-16,height:.87,lanes:[-5.02,-2.98],pads:['behind-button']},
 {number:3,exit:'south-exit',door:'south-door',axis:'z',direction:1,start:13,across:16,height:.87,lanes:[-5.02,-2.98],pads:['front-button'],alternate:true},
 {number:4,exit:'exit',door:'exit-door',axis:'x',direction:1,start:7,across:10.7,height:.87,lanes:[.85,3.15],pads:['maintenance-button']},
 {number:5,exit:'exit',door:'exit-door',axis:'x',direction:1,start:8,across:11.7,height:4.27,lanes:[-9.15,-6.85],pads:['lower-button','upper-button']},
];
function tick(w:CoreWorld,seconds:number){for(let i=0;i<seconds*120;i++)w.step(1/120,idle);}
function prepare(w:CoreWorld,e:Entry,lane:number){
 // Deliberately isolated unit arrangement: actual dynamic cubes provide real button pressure.
 e.pads.forEach((id,i)=>{const p=w.pads.find(p=>p.id===id)!;assert.ok(p);const c=w.crates[i];assert.ok(c);c.pos.set(p.pos.x,p.pos.y+c.half.y,p.pos.z);c.vel.set(0,0,0);c.rigid.setTranslation(c.pos,true);c.rigid.setLinvel(c.vel,true);c.rigid.setAngvel({x:0,y:0,z:0},true);});
 tick(w,1.2);assert.equal(w.campaignResult,undefined);
 const d=w.machines.devices.find(d=>d.spec.id===e.door)!;assert.ok(d);assert.ok(d.progress>.99,`Real pressure/open circuit must clear ${e.door}`);
 const x=e.axis==='x'?e.start:lane,z=e.axis==='z'?e.start:lane;
 w.player.pos.set(x,e.height,z);w.player.vel.set(0,0,0);w.player.grounded=false;w.character.setTranslation(w.player.pos,true);w.character.setNextKinematicTranslation(w.player.pos);w.physics.propagateModifiedBodyPositionsToColliders();
 w.yaw=e.axis==='x'?-e.direction*Math.PI/2:e.direction===1?Math.PI:0;w.pitch=0;
 tick(w,.12);assert.equal(w.campaignResult,undefined,'Approach side must not count as crossing the doorway');
}
for(const e of entries)for(const [side,lane] of e.lanes.entries())for(const jump of [false,true])test(`Chamber${e.number} ${e.exit} usable ${side?'right':'left'} jamb accepts ${jump?'jump':'walk'} through actual corridor`,()=>{
 const w=new CoreWorld(e.number,undefined,getCoreLevel(e.number),!!e.alternate);try{
  prepare(w,e,lane);const before=w.player.pos.clone();
  for(let i=0;i<180&&!w.campaignResult;i++)w.step(1/120,{forward:1,strafe:0,jump});
  assert.equal(w.campaignResult?.goalMatched,true,`Open physical door failed to complete near usable jamb: ${w.player.pos.toArray()}`);
  assert.equal(w.campaignResult?.exit,e.exit);assert.ok(w.player.pos.distanceTo(before)>.3,'Completion must follow real capsule motion');
  assert.equal(w.player.crossings,0);assert.equal(w.events.some(event=>event.type==='jump'),jump);
  if(jump)assert.equal(w.player.grounded,false,'An airborne legitimate door crossing must not need a grounded-only goal chore');
 }finally{w.dispose();}
});
