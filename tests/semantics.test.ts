import test from 'node:test';
import assert from 'node:assert/strict';
import {firstRoom,evaluateRoom,type PhysicalOutcome} from '../src/content.ts';
const correct:PhysicalOutcome={crateId:'c1',pad:'behind',bridge:'east',crateOnPad:true,playerCrossed:true,atExit:true,portalTraversals:2,cratePortalTraversals:1};

test('first mission has real discriminating crate and place candidates',()=>{
 assert.equal(firstRoom.crates.length,2);
 assert.equal(firstRoom.crates.find(c=>c.id===firstRoom.target.crateId)?.size,'small');
 assert.equal(firstRoom.target.pad,'behind');
 assert.equal(firstRoom.target.bridge,'east');
 assert.ok(firstRoom.mission.includes('Then'));
 assert.ok(firstRoom.sources.some(s=>s.endsWith('/prepositions-time-place')));
 assert.ok(firstRoom.sources.some(s=>s.endsWith('/modals-and-imperatives')));
});
test('real target world outcome can complete the instruction',()=>{
 assert.deepEqual(evaluateRoom(firstRoom,correct),{physicalComplete:true,languageGoal:true,unaided:true,portalMechanics:true,reason:'הארגז, המיקום והמסלול תואמים למשפט באנגלית. הפעולה בעולם היא הראיה להבנת ההוראה.'});
});
for(const property of ['crateOnPad','playerCrossed','atExit'] as const){
 test(`${property} is necessary; matching labels alone cannot win`,()=>{
  const result=evaluateRoom(firstRoom,{...correct,[property]:false});
  assert.equal(result.physicalComplete,false);assert.equal(result.languageGoal,false);
 });
}
test('wrong crate can finish physically without language-goal credit',()=>{
 const result=evaluateRoom(firstRoom,{...correct,crateId:'c2'});
 assert.equal(result.physicalComplete,true);assert.equal(result.languageGoal,false);
});
test('front and behind are meaningfully different physical goals',()=>{
 const result=evaluateRoom(firstRoom,{...correct,pad:'front'});
 assert.equal(result.physicalComplete,true);assert.equal(result.languageGoal,false);
});
test('actual bridge choice is evidence, not just reaching any exit',()=>{
 const result=evaluateRoom(firstRoom,{...correct,bridge:'west'});
 assert.equal(result.physicalComplete,true);assert.equal(result.languageGoal,false);
});
test('a valid alternate route stands; portal use is recorded separately',()=>{
 const result=evaluateRoom(firstRoom,{...correct,portalTraversals:0,cratePortalTraversals:0});
 assert.equal(result.physicalComplete,true);assert.equal(result.languageGoal,true);assert.equal(result.portalMechanics,false);
});
for(const property of ['hints','translations','retries'] as const){
 test(`${property} preserves success while removing unaided claim`,()=>{
  const result=evaluateRoom(firstRoom,correct,{hints:0,translations:0,retries:0,[property]:1});
  assert.equal(result.languageGoal,true);assert.equal(result.unaided,false);
 });
}
