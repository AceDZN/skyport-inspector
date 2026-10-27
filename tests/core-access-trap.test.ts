/** Native no-portal ACCESS regression. No forced player pose, doors or completion state.
 * The tight-gap lab preserves the old Z2 placement so a spacing edit cannot mask bad safety logic.
 * Unit steering/definition overrides do not count as browser completion evidence.
 */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {CoreWorld,initializePhysics} from '../src/core/world';
import {draftEarlyLevels} from '../src/core/levels/early';
before(async()=>{await initializePhysics();});
const idle={forward:0,strafe:0,jump:false};
function makeWorld(tight:boolean){const base=draftEarlyLevels.find(l=>l.number===4)!;return new CoreWorld(4,undefined,tight?{...base,blueprint:()=>{const b=base.blueprint();b.pads.find(p=>p.id==='maintenance-button')!.position=[-4,.14,2];return b;}}:base);}
function step(w:CoreWorld,seconds:number){for(let i=0;i<seconds*120;i++)w.step(1/120,idle);}
function walkToButton(w:CoreWorld){const p=w.pads.find(p=>p.id==='maintenance-button')!.pos;for(let i=0;i<600;i++){const dx=p.x-w.player.pos.x,dz=p.z-w.player.pos.z;if(Math.hypot(dx,dz)<.13){step(w,.15);return;}w.yaw=Math.atan2(-dx,-dz);w.step(1/120,{forward:1,strafe:0,jump:false});}assert.fail('Player cannot reach the pressure button through ordinary KCC walking');}
const cases=[{name:'walk',diagonal:false},{name:'diagonal walk',diagonal:true},{name:'jump immediately',diagonal:false,jumpAt:0},{name:'late jump',diagonal:false,jumpAt:.45},{name:'late diagonal jump',diagonal:true,jumpAt:.45}];
for(const tight of [false,true])for(const c of cases)test(`no-portal ACCESS approach stays outside: ${tight?'old tight-gap safety lab':'current fixture'} / ${c.name}`,()=>{
 const w=makeWorld(tight);try{walkToButton(w);step(w,1);const pad=w.pads.find(p=>p.id==='maintenance-button')!,door=w.machines.devices.find(d=>d.spec.id==='access-door')!;assert.equal(pad.pressed,true,'The scenario must actually open the door first');assert.ok(door.progress>.99);assert.ok(w.portals.every(p=>!p));
 const dx=c.diagonal?.9:0,dz=door.spec.position[2]-pad.pos.z;w.yaw=Math.atan2(-dx,-dz);let minZ=w.player.pos.z;let unsafeSafety=false;
 for(let i=0;i<360;i++){const t=i/120,head=w.player.pos.y+w.player.half.y,leafBottom=door.position.y-door.spec.size[1]/2;w.step(1/120,{forward:1,strafe:0,jump:c.jumpAt!==undefined&&t>=c.jumpAt&&t<c.jumpAt+.15});minZ=Math.min(minZ,w.player.pos.z);if(!pad.pressed&&leafBottom<head-.03&&w.machines.flags['safety:access-door'])unsafeSafety=true;}
 assert.equal(unsafeSafety,false,'Approach safety reopens a leaf that cannot clear the actor head');assert.ok(minZ>door.spec.position[2],`Unprepared player entered cube area without portals: minZ=${minZ}`);assert.equal(w.player.crossings,0);assert.equal(w.campaignResult,undefined);assert.ok(w.portals.every(p=>!p));assert.equal(pad.pressed,false);assert.ok(door.progress<.1,'Blocked unprepared approach keeps ACCESS open');
 w.respawn();step(w,.2);assert.equal(w.respawns,1);assert.ok(w.player.pos.distanceTo(w.spawn)<.05,'R-equivalent reset does not restore safe spawn');assert.ok(w.portals.every(p=>!p));
 }finally{w.dispose();}
});
