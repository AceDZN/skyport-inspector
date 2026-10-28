/** One bounded authored-spawn perimeter diagnostic. Not a broad air search. */
import test,{before}from'node:test';import assert from'node:assert/strict';
import{initializePhysics}from'../src/core/world';import{V}from'../src/physics';
import{conditionalRoute}from'./helpers/conditional-route';
const enabled=process.env.RIFT_CONDITIONAL_PERIMETER==='1';
before(()=>{if(enabled)return initializePhysics();});
test('native C41 catch outer north enclosure blocks actual under-bank outward walk',{skip:!enabled},()=>conditionalRoute(41,false,'outer-north-catch-perimeter',r=>{
 r.walk(8,2.8);r.look(V(8,r.w.eye().y,-2));r.tick(.8,{forward:1,strafe:0,jump:false});r.until(()=>r.w.player.grounded&&r.w.player.pos.y< -3.3,3,'Diagnostic never reached actual bounded catch');r.note('actual-catch-before-perimeter-diagnostic');
 r.walk(8,-12.8);assert.ok(r.w.player.grounded&&r.w.player.pos.y< -3.3);r.note('actual-under-bank-outer-boundary-approach');r.look(V(8,r.w.eye().y,-18));r.tick(.45,{forward:1,strafe:0,jump:false});r.note('actual-bounded-outward-walk');
 assert.ok(r.w.player.pos.z> -14,'Outer wall/foundation allowed a capsule below the bank to leave the catch perimeter');assert.ok(r.w.player.grounded,'Proper outer wall approach lost actual catch support');assert.equal(r.w.respawns,0);assert.equal(r.events.filter(e=>e.type==='jump').length,0);
}));
