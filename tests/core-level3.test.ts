/** Independent fixture/circuit contracts. Unit poses do not count as gameplay proof. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {CoreWorld,initializePhysics} from '../src/core/world';
const idle={forward:0,strafe:0,jump:false};
before(async()=>{await initializePhysics();});
function tick(w:CoreWorld,seconds=1){for(let i=0;i<seconds*120;i++)w.step(1/120,idle);}
function cubeOn(w:CoreWorld,pad:string){const p=w.pads.find(p=>p.id===pad)!;const c=w.crates[0];c.pos.set(p.pos.x,p.pos.y+c.half.y,p.pos.z);c.rigid.setTranslation(c.pos,true);c.rigid.setLinvel({x:0,y:0,z:0},true);w.physics.propagateModifiedBodyPositionsToColliders();}
function playerAt(w:CoreWorld,z:number){w.player.pos.set(-4,.865,z);w.player.vel.set(0,0,0);w.character.setTranslation(w.player.pos,true);w.character.setNextKinematicTranslation(w.player.pos);w.physics.propagateModifiedBodyPositionsToColliders();}
test('window wording contrast keeps identical physical fixtures and changes only the requested real exit',()=>{
 const base=new CoreWorld(3),other=new CoreWorld(3,undefined,undefined,true);try{assert.deepEqual(other.blueprint,base.blueprint);assert.equal(base.level.expectedExit,'north-exit');assert.equal(other.level.expectedExit,'south-exit');assert.ok(base.blueprint.spawn[0]<0);assert.ok(base.pads.find(p=>p.id==='front-button')!.pos.x<0);assert.ok(base.pads.find(p=>p.id==='behind-button')!.pos.x>0);assert.ok(base.solids.some(s=>s.id==='observation-window'&&s.min.x<0&&s.max.x>0));}finally{base.dispose();other.dispose();}
});
test('front and behind cube placements drive genuinely different physical doors and recover normally',()=>{
 const w=new CoreWorld(3);try{cubeOn(w,'front-button');tick(w);assert.equal(w.pads.find(p=>p.id==='front-button')!.pressed,true);assert.ok(w.machines.devices.find(d=>d.spec.id==='south-door')!.progress>.9);assert.equal(w.machines.devices.find(d=>d.spec.id==='north-door')!.progress,0);cubeOn(w,'behind-button');tick(w);assert.equal(w.pads.find(p=>p.id==='front-button')!.pressed,false);assert.ok(w.machines.devices.find(d=>d.spec.id==='north-door')!.progress>.9);assert.ok(w.machines.devices.find(d=>d.spec.id==='south-door')!.progress<.1);}finally{w.dispose();}
});
test('base south destination gives one recoverable error, then the physically powered north destination completes',()=>{
 const w=new CoreWorld(3);try{cubeOn(w,'front-button');tick(w);playerAt(w,16.6);tick(w,.1);assert.equal(w.campaignResult,undefined);assert.equal(w.events.filter(e=>e.type==='wrong-exit').length,1);tick(w,.1);assert.equal(w.events.filter(e=>e.type==='wrong-exit').length,1,'Wrong route floods error events');cubeOn(w,'behind-button');tick(w);playerAt(w,-16.6);tick(w,.1);assert.equal(w.campaignResult?.goalMatched,true);assert.equal(w.campaignResult?.exit,'north-exit');}finally{w.dispose();}
});
test('contrast counts the same front/south physical answer that the base wording rejected',()=>{
 const w=new CoreWorld(3,undefined,undefined,true);try{cubeOn(w,'front-button');tick(w);playerAt(w,16.6);tick(w,.1);assert.equal(w.campaignResult?.goalMatched,true);assert.equal(w.campaignResult?.exit,'south-exit');}finally{w.dispose();}
});
