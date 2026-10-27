import test from 'node:test';
import assert from 'node:assert/strict';
import {rooms,pairedRooms,allRooms,evaluateRoom,type Room,type PhysicalOutcome} from '../src/content.ts';
const get=(id:string)=>allRooms.find(r=>r.id===id)!;
const outcome=(r:Room):PhysicalOutcome=>({...r.target,crateOnPad:true,playerCrossed:true,atExit:true,portalTraversals:2,cratePortalTraversals:1,launchUsed:!!r.momentum,launchBeforePad:!!r.momentum});

test('all three grades have distinct guided, independent and transfer missions',()=>{
 assert.equal(rooms.length,9);assert.equal(allRooms.length,12);
 for(const grade of [7,8,9]){const pack=rooms.filter(r=>r.grade===grade);assert.deepEqual(pack.map(r=>r.stage),['guided','independent','transfer']);assert.equal(new Set(pack.map(r=>r.mission)).size,3);for(const chapter of [10,11,12])assert.ok(pack.some(r=>r.sources.some(s=>s.includes(`/chapter-${chapter}/`))));}
});
for(const room of allRooms){
 test(`${room.id}: reviewed target world actions satisfy the language goal`,()=>{
  const result=evaluateRoom(room,outcome(room));assert.equal(result.physicalComplete,true);assert.equal(result.languageGoal,true);assert.equal(result.unaided,true);assert.equal(result.portalMechanics,true);
 });
 for(const property of ['crateOnPad','playerCrossed','atExit'] as const){
  test(`${room.id}: ${property} is required, matching labels alone cannot win`,()=>{
   const result=evaluateRoom(room,{...outcome(room),[property]:false});assert.equal(result.physicalComplete,false);assert.equal(result.languageGoal,false);
  });
 }
 test(`${room.id}: wrong crate gives no comprehension credit`,()=>{
  const other=room.crates.find(c=>c.id!==room.target.crateId)!;const result=evaluateRoom(room,{...outcome(room),crateId:other.id});assert.equal(result.physicalComplete,true);assert.equal(result.languageGoal,false);assert.equal(result.unaided,false);
 });
 test(`${room.id}: front/behind and east/west change the language goal`,()=>{
  for(const patch of [{pad:room.target.pad==='front'?'behind':'front'},{bridge:room.target.bridge==='east'?'west':'east'}] as const){const result=evaluateRoom(room,{...outcome(room),...patch});assert.equal(result.languageGoal,false);}
 });
 test(`${room.id}: targets name existing original crates and safe bridge configuration`,()=>{
  assert.ok(room.crates.some(c=>c.id===room.target.crateId));assert.notEqual(room.target.bridge,room.blockedBridge);assert.deepEqual(new Set(room.crates.map(c=>c.shape)),new Set(['diamond','triangle']));assert.ok(room.sources.every(s=>s.startsWith('https://english.workbook.co.il/grade-')));
 });
}

test('valid alternate route stands; portal-use evidence is separate from English',()=>{
 const room=get('g7-1-pair'),result=evaluateRoom(room,{...outcome(room),portalTraversals:0,cratePortalTraversals:0});assert.equal(result.physicalComplete,true);assert.equal(result.languageGoal,true);assert.equal(result.portalMechanics,false);
});
for(const property of ['hints','translations','retries'] as const){
 test(`${property} retains successful actions while removing unaided claim`,()=>{
  const room=get('g8-2');const result=evaluateRoom(room,outcome(room),{hints:0,translations:0,retries:0,[property]:1});assert.equal(result.languageGoal,true);assert.equal(result.unaided,false);
 });
}
for(const pair of pairedRooms){
 test(`${pair.id}: same crate skins/start/history, meaning changes required action`,()=>{
  const base=get(pair.id.replace('-pair',''));assert.equal(base.skin,pair.skin);assert.equal(base.layout,pair.layout);assert.deepEqual(base.crates,pair.crates);assert.deepEqual(base.history,pair.history);assert.notDeepEqual(base.target,pair.target);assert.equal(evaluateRoom(base,outcome(pair)).languageGoal,false);assert.equal(evaluateRoom(pair,outcome(base)).languageGoal,false);
 });
}
test('G7 current instruction overrides usual/past location without a tense-name quiz',()=>{
 const room=get('g7-2');assert.ok(room.mission.includes('usually'));assert.ok(room.mission.includes('Yesterday'));assert.ok(room.mission.includes('Today'));assert.equal(room.target.pad,'front');assert.equal(evaluateRoom(room,{...outcome(room),pad:'behind'}).languageGoal,false);
});
test('G7 transfer changes actual size/shape identity and direction',()=>{
 const room=get('g7-3');assert.equal(room.crates.find(c=>c.id===room.target.crateId)?.shape,'triangle');assert.equal(room.crates.find(c=>c.id===room.target.crateId)?.size,'small');assert.equal(room.target.pad,'front');assert.equal(room.target.bridge,'west');
});
test('G8 real action history distinguishes carrying from merely standing beside',()=>{
 const base=get('g8-1'),pair=get('g8-1-pair');assert.equal(base.target.crateId,base.history?.carriedCrateId);assert.equal(base.crates.find(c=>c.id===base.target.crateId)?.history,'carried');assert.equal(pair.crates.find(c=>c.id===pair.target.crateId)?.history,'beside');assert.notEqual(pair.target.crateId,pair.history?.carriedCrateId);
});
test('G8 current scoped update changes only bridge, preserving carried crate and pad',()=>{
 const original=get('g8-1'),updated=get('g8-2');assert.equal(updated.target.crateId,original.target.crateId);assert.equal(updated.target.pad,original.target.pad);assert.equal(original.target.bridge,'east');assert.equal(updated.target.bridge,'west');assert.equal(evaluateRoom(updated,outcome(original)).languageGoal,false);
});
test('G8 transfer uses reset history and rejects tomorrow’s unrelated west update',()=>{
 const room=get('g8-3');assert.equal(room.history?.carriedCrateId,'c2');assert.equal(room.target.crateId,'c2');assert.equal(room.target.pad,'front');assert.equal(room.target.bridge,'east');assert.ok(room.mission.includes('Tomorrow'));
});
test('G9 both grammar versions have explicit present safety; tense alone never decides',()=>{
 for(const id of ['g9-1','g9-1-pair']){const room=get(id);assert.ok(room.mission.includes('safe now'));assert.ok(room.mission.includes('broken again'));assert.ok(room.mission.includes('last week'));assert.ok(room.rule?.includes('CURRENT STATUS'));assert.notEqual(room.target.bridge,room.blockedBridge);}
 assert.equal(get('g9-1').target.bridge,'east');assert.equal(get('g9-1-pair').target.bridge,'west');
});
test('G9 reported instruction preserves speaker’s owner, recipient and place',()=>{
 const room=get('g9-2');assert.ok(room.mission.includes('Mina told Oren'));assert.equal(room.crates.find(c=>c.id===room.target.crateId)?.owner,'Mina');assert.equal(room.crates.find(c=>c.id!==room.target.crateId)?.owner,'Oren');assert.equal(room.target.pad,'front');assert.equal(room.target.bridge,'west');assert.ok(room.rule?.includes('she/her'));assert.ok(room.rule?.includes('he/him'));
});
test('G9 transfer scoped update changes crate while preserving behind/west',()=>{
 const room=get('g9-3');assert.equal(room.crates.find(c=>c.id===room.target.crateId)?.size,'large');assert.equal(room.target.pad,'behind');assert.equal(room.target.bridge,'west');assert.ok(room.rule?.includes('replace only the crate'));assert.equal(evaluateRoom(room,{...outcome(room),crateId:'c1'}).languageGoal,false);
});
test('G9 launch must actually occur before relevant pad activation',()=>{
 const room=get('g9-3');assert.equal(room.momentum,true);
 for(const patch of [{launchUsed:false,launchBeforePad:false},{launchUsed:true,launchBeforePad:false},{launchUsed:true,launchBeforePad:undefined}]){const result=evaluateRoom(room,{...outcome(room),...patch});assert.equal(result.physicalComplete,true);assert.equal(result.languageGoal,false);}
 assert.equal(evaluateRoom(room,outcome(room)).languageGoal,true);
});
