/** Actual authored13 booth/cover routes; feedback changes no interaction permission. */
import test,{before} from 'node:test';import assert from 'node:assert/strict';
import {initializePhysics} from '../src/core/world';import {V} from '../src/physics';
import {route} from './helpers/sequence-route';
before(initializePhysics);
test('covered REVERSE explains its actual cover, then opening and clear states remain usable',()=>route(13,false,'covered-control-feedback',r=>{
 r.shot(0,'source-south',V(7.55,1.55,11.985));r.walk(9.7,11);r.walk(9.7,-4.5);r.walk(1,-4.5);r.shot(1,'booth-white',V(1,1.55,9.485));r.walk(9.7,-4.5);r.walk(9.7,11);r.walk(7.55,10.7);r.enter(0);
 r.walk(2,7.5);r.control('belt-power');r.tick(.9);r.walk(0,7.4);r.look(V(-2,1.3,6.05));
 assert.equal(r.w.interactionHint(),'Stop the belt to uncover REVERSE.');assert.equal(r.w.interact(),false);r.w.grabDrop();assert.equal(r.w.events.at(-1)?.reason,'Stop the belt to uncover REVERSE.');assert.equal(r.device('reverse').on,false);
 r.look(V(0,1.5,12));assert.equal(r.w.interactionHint(),'','Covered-control hint leaks while looking away');
 r.control('belt-power');r.look(V(-2,1.3,6.05));assert.equal(r.w.interactionHint(),'Wait for the REVERSE cover to open.');assert.equal(r.w.interact(),false);
 r.tick(1);r.look(V(-2,1.3,6.05));assert.equal(r.w.interactionHint(),'E · Use REVERSE');r.control('reverse');assert.equal(r.device('reverse').on,true);assert.equal(r.w.respawns,0);assert.equal(r.w.campaignResult,undefined);
}));
