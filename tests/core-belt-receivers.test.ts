/** Pure authored13/15 machinery regression. Native API controls isolate delivery, not browser routes. */
import test,{before}from'node:test';import assert from'node:assert/strict';
import{initializePhysics}from'../src/core/world';import{runBeltLab}from'../docs/chamber-qa/belt-contact-lab';
before(initializePhysics);
for(const number of [13,15]as const)test(`authored draft${number} delivers and reverses cargo with continuous receiving pressure`,()=>{
 const r=runBeltLab(number,'baseline');assert.equal(r.pureAuthoredDefinition,true,'Test substituted authored geometry');assert.ok(r.geometry.pads.every((p:{position:number[]})=>p.position[1]===0),'Actual receiving surfaces must be flush');
 assert.equal(r.stages[0]?.arrived,true,'Actual east delivery stalled');assert.equal(r.eastPressure?.pressedFrames,240);assert.equal(r.eastPressure?.totalFrames,240);assert.equal(r.eastMaintained,true);
 assert.equal(r.reverseSelected,true);assert.equal(r.stages[1]?.arrived,true,'Actual reversed cargo failed west delivery');assert.equal(r.oldPadReleased,true);assert.equal(r.westPressure?.pressedFrames,240);assert.equal(r.westPressure?.totalFrames,240);assert.equal(r.westMaintained,true);assert.ok(r.maxCargoSpeed<3.1,'Authored belt imparted excess speed');assert.ok(r.maxCargoStep<.035,'Cargo displacement jumped');assert.ok(r.maxAbsCargoX<8,'Physical end stop did not bound cargo');assert.equal(r.respawns,0);assert.equal(r.result,null);
});
