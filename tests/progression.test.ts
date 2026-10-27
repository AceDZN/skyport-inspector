import test from'node:test';import assert from'node:assert/strict';import{CampaignProgress,SAVE_KEY,parseSave,type RunEvidence}from'../src/progression';
import{readFileSync}from'node:fs';
const store=()=>{const data=new Map<string,string>();return{getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>void data.set(k,v),removeItem:(k:string)=>void data.delete(k)}};
const evidence=(goalMatched=true,assistance=0):RunEvidence=>({goalMatched,assistance,retries:0,seconds:30,portalCrossings:2,mechanisms:['portal','cargo']});
test('fresh campaign unlocks only1; a physically complete wrong English objective cannot unlock2',()=>{const p=new CampaignProgress(store());assert.equal(p.canPlay(1),true);assert.equal(p.canPlay(2),false);assert.equal(p.observe(1,evidence(false)),false);assert.equal(p.save.highestUnlocked,1);assert.equal(p.status(1),'unlocked');});
test('help never blocks a correct mission from completing and unlocking the next level',()=>{const p=new CampaignProgress(store());assert.equal(p.observe(1,evidence(true,2)),true);assert.equal(p.status(1),'completed');assert.equal(p.canPlay(2),true);assert.equal(p.save.records[1].unaided,false);});
test('save/reopen resumes at correct unlocked level and replay does not lose frontier',()=>{const s=store();let p=new CampaignProgress(s);for(let i=1;i<=12;i++)assert.equal(p.observe(i,evidence()),true);p=new CampaignProgress(s);assert.equal(p.save.resumeLevel,13);assert.equal(p.save.highestUnlocked,13);assert.equal(p.enter(3),true);p.observe(3,evidence());assert.equal(p.save.resumeLevel,13);assert.equal(p.save.highestUnlocked,13);assert.equal(p.canPlay(14),false);});
test('clean sequential1→50 completion stops unlock at50 and preserves final completed replay state',()=>{const p=new CampaignProgress(store());for(let i=1;i<=50;i++){assert.equal(p.enter(i),true);assert.equal(p.observe(i,evidence()),true);}assert.equal(p.complete,true);assert.equal(p.save.highestUnlocked,50);assert.equal(p.save.resumeLevel,50);assert.equal(Object.values(p.save.records).filter(r=>r.completed).length,50);assert.equal(p.canPlay(51),false);});
test('reset requires confirmation after progress and can restore the backed-up run',()=>{const p=new CampaignProgress(store());p.observe(1,evidence());assert.equal(p.newGame(),false);assert.equal(p.save.highestUnlocked,2);assert.equal(p.newGame(true),true);assert.equal(p.save.highestUnlocked,1);assert.equal(p.restorePrevious(),true);assert.equal(p.status(1),'completed');assert.equal(p.save.highestUnlocked,2);});
test('malformed saves and unavailable storage recover without making locked levels playable',()=>{for(const raw of ['not JSON','{}','{"version":2,"highestUnlocked":999,"resumeLevel":1,"records":{}}'])assert.equal(parseSave(raw).highestUnlocked,1);const p=new CampaignProgress({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){}});assert.equal(p.canPlay(1),true);assert.equal(p.observe(1,evidence()),true);assert.ok(p.warning);});
test('Rapier campaign uses an isolated key and imports only contiguous real core wins with unknown measurements',()=>{const s=store();const rejected=new CampaignProgress(s);for(let n=1;n<=50;n++)rejected.observe(n,evidence());const key='rapier-test';const p=new CampaignProgress(s,key);assert.equal(p.save.highestUnlocked,1);assert.equal(p.importCoreCompletions([1,2,50]),true);assert.equal(p.save.highestUnlocked,3);assert.deepEqual(Object.keys(p.save.records),['1','2']);assert.equal(p.save.records[1].last.seconds,null);assert.equal(p.save.records[1].unaided,false);assert.equal(p.save.records[1].runs,0);p.observe(1,evidence());assert.equal(p.save.records[1].bestRetries,0);assert.equal(p.save.highestUnlocked,3);assert.equal(new CampaignProgress(s,key).save.highestUnlocked,3);assert.equal(new CampaignProgress(s).complete,true);});
test('noncontiguous legacy wins cannot open later rooms; reset backup remains isolated',()=>{const s=store();const p=new CampaignProgress(s,'new-core');assert.equal(p.importCoreCompletions([2]),false);assert.equal(p.save.highestUnlocked,1);p.observe(1,evidence());p.newGame(true);assert.equal(p.save.highestUnlocked,1);assert.equal(p.restorePrevious(),true);assert.equal(p.save.highestUnlocked,2);assert.equal(new CampaignProgress(s).save.highestUnlocked,1);});
test('contrast replay keeps its meaning and preserves base evidence and frontier',()=>{const s=store();const p=new CampaignProgress(s);p.observe(1,{...evidence(),variant:'base',seconds:45,portalCrossings:2});p.observe(1,{...evidence(),variant:'contrast',seconds:10,portalCrossings:0});const reopened=new CampaignProgress(s);assert.equal(reopened.save.records[1].last.variant,'contrast');assert.equal(reopened.save.records[1].variants?.base?.seconds,45);assert.equal(reopened.save.records[1].variants?.contrast?.seconds,10);assert.equal(reopened.save.highestUnlocked,2);});

const coreKey='rift-runner-rapier-campaign-v1';
const completed=(p:CampaignProgress)=>Object.entries(p.save.records).filter(([,r])=>r.completed).map(([n])=>Number(n));
function earned(s:ReturnType<typeof store>,levels=3){const p=new CampaignProgress(s,coreKey);for(let n=1;n<=levels;n++)assert.equal(p.observe(n,{...evidence(),variant:'base',seconds:20+n}),true);return p;}

test('a stale fresh instance entering1 cannot replace another instance earned frontier',()=>{
 const s=store(),stale=new CampaignProgress(s,coreKey),a=earned(s);
 assert.equal(stale.enter(1),true);assert.deepEqual(completed(stale),[1,2,3]);
 const reopened=new CampaignProgress(s,coreKey);assert.equal(reopened.save.highestUnlocked,4);assert.equal(reopened.save.resumeLevel,4);assert.deepEqual(completed(reopened),completed(a));
});
test('two live instances preserve independently observed base and contrast evidence',()=>{
 const s=store(),base=new CampaignProgress(s,coreKey),contrast=new CampaignProgress(s,coreKey);
 base.observe(1,{...evidence(),variant:'base',seconds:45});contrast.observe(1,{...evidence(),variant:'contrast',seconds:10});base.enter(1);
 const r=new CampaignProgress(s,coreKey).save.records[1];assert.equal(r.variants?.base?.seconds,45);assert.equal(r.variants?.contrast?.seconds,10);assert.equal(r.last.variant,'contrast');assert.equal(r.runs,2);assert.equal(r.completions,2);
});
test('an already loaded old client overwriting main is recovered from the journal on reopen',()=>{
 const s=store();earned(s);
 s.setItem(coreKey,JSON.stringify({version:2,highestUnlocked:1,resumeLevel:1,records:{},updatedAt:Date.now()+100000}));
 const reopened=new CampaignProgress(s,coreKey);assert.deepEqual(completed(reopened),[1,2,3]);assert.equal(reopened.save.highestUnlocked,4);assert.equal(reopened.diagnostics().primaryNeedsRepair,true);
 assert.equal(reopened.enter(1),true);assert.deepEqual(JSON.parse(s.getItem(coreKey)!).records,JSON.parse(s.getItem(coreKey+'-journal')!).records);
});
test('explicit reset generation rejects stale results, including old room1, until a new entry',()=>{
 const s=store(),a=earned(s),stale=new CampaignProgress(s,coreKey),oldGeneration=stale.save.generation;
 assert.equal(a.newGame(true),true);assert.notEqual(a.save.generation,oldGeneration);
 assert.equal(stale.observe(1,evidence()),false);assert.deepEqual(completed(new CampaignProgress(s,coreKey)),[]);
 assert.equal(stale.enter(3),false);assert.equal(stale.enter(1),true);assert.equal(stale.observe(1,evidence()),true);
 const reopened=new CampaignProgress(s,coreKey);assert.deepEqual(completed(reopened),[1]);assert.equal(reopened.save.highestUnlocked,2);
});
test('reset journal defeats an old client resurrection and suppresses legacy remigration',()=>{
 const s=store(),a=earned(s),old=s.getItem(coreKey)!;s.setItem('rift-core-v1',JSON.stringify({completed:[1,2]}));
 assert.equal(a.newGame(true),true);const resetGeneration=a.save.generation;
 s.setItem(coreKey,old);const reopened=new CampaignProgress(s,coreKey);
 assert.equal(reopened.save.generation,resetGeneration);assert.deepEqual(completed(reopened),[]);assert.equal(reopened.canImportCoreCompletions,false);assert.equal(reopened.importCoreCompletions([1,2]),false);
 assert.equal(reopened.enter(1),true);assert.deepEqual(completed(new CampaignProgress(s,coreKey)),[]);
});
test('confirmed reset backs up real metrics and restore creates a new authoritative generation',()=>{
 const s=store(),a=earned(s),actual=structuredClone(a.save.records);assert.equal(a.newGame(true),true);
 const staleReset=new CampaignProgress(s,coreKey),resetGeneration=a.save.generation;
 assert.deepEqual(JSON.parse(s.getItem(coreKey+'-backup')!).records,actual);assert.equal(a.restorePrevious(),true);assert.notEqual(a.save.generation,resetGeneration);assert.deepEqual(a.save.records,actual);
 assert.equal(staleReset.observe(1,evidence()),false);assert.equal(staleReset.enter(1),true);assert.deepEqual(completed(new CampaignProgress(s,coreKey)),[1,2,3]);
});
test('unreadable main recovers a genuine backup and preserves exact raw bytes before replacement',()=>{
 const s=store(),a=earned(s,2),backup=s.getItem(coreKey)!,bad='{"broken":';s.setItem(coreKey+'-backup',backup);s.removeItem(coreKey+'-journal');s.setItem(coreKey,bad);
 const p=new CampaignProgress(s,coreKey);assert.deepEqual(completed(p),[1,2]);assert.equal(s.getItem(coreKey),bad);assert.equal(p.diagnostics().recovery,'backup');assert.equal(p.enter(3),true);
 assert.ok(p.diagnostics().preservedUnreadableKeys.some(k=>s.getItem(k)===bad));assert.deepEqual(new CampaignProgress(s,coreKey).save.records,a.save.records);assert.equal(s.getItem(coreKey+'-backup'),backup);
});
test('valid journal recovers malformed main without inferring any additional wins',()=>{
 const s=store();earned(s,2);const bad='not JSON';s.setItem(coreKey,bad);const p=new CampaignProgress(s,coreKey);
 assert.deepEqual(completed(p),[1,2]);assert.equal(p.save.highestUnlocked,3);assert.equal(p.enter(3),true);assert.ok(p.diagnostics().preservedUnreadableKeys.some(k=>s.getItem(k)===bad));
});
test('legacy import is allowed after unreadable main only while preserving that original',()=>{
 const s=store(),bad='not readable campaign data';s.setItem(coreKey,bad);const p=new CampaignProgress(s,coreKey);
 assert.equal(p.canImportCoreCompletions,true);assert.equal(p.importCoreCompletions([1,2,50]),true);assert.deepEqual(completed(p),[1,2]);assert.equal(p.save.records[1].last.seconds,null);assert.equal(p.save.records[1].runs,0);assert.ok(p.diagnostics().preservedUnreadableKeys.some(k=>s.getItem(k)===bad));
});
test('both unreadable main and journal are quarantined before a fresh replacement',()=>{
 const s=store(),badMain='',badJournal='{"version":99}';s.setItem(coreKey,badMain);s.setItem(coreKey+'-journal',badJournal);
 const p=new CampaignProgress(s,coreKey);assert.deepEqual(completed(p),[]);assert.equal(p.canPlay(2),false);assert.equal(p.enter(1),true);
 const copies=p.diagnostics().preservedUnreadableKeys.map(k=>s.getItem(k));assert.ok(copies.includes(badMain));assert.ok(copies.includes(badJournal));assert.deepEqual(completed(new CampaignProgress(s,coreKey)),[]);
});
test('failure to preserve unreadable bytes blocks every destructive write',()=>{
 const s=store(),bad='{"version":999,"doNotLose":"original"}';s.setItem(coreKey,bad);
 const blocked={...s,setItem(k:string,v:string){if(k.includes('-unreadable-'))throw Error('quota');s.setItem(k,v);}};
 const p=new CampaignProgress(blocked,coreKey);assert.equal(p.observe(1,evidence()),true);assert.equal(s.getItem(coreKey),bad);assert.equal(s.getItem(coreKey+'-journal'),null);assert.equal(p.diagnostics().lastWrite,'blocked');assert.match(p.warning!,/not been replaced/);
});
test('reset refuses to destroy a campaign when its real backup cannot be written',()=>{
 const s=store();earned(s,2);const before=s.getItem(coreKey);
 const blocked={...s,setItem(k:string,v:string){if(k===coreKey+'-backup')throw Error('quota');s.setItem(k,v);}};
 const p=new CampaignProgress(blocked,coreKey);assert.equal(p.newGame(true),false);assert.equal(s.getItem(coreKey),before);assert.deepEqual(completed(p),[1,2]);
});
test('unreadable previous backup is preserved before a confirmed reset updates that slot',()=>{
 const s=store(),p=earned(s,2),bad='bad previous backup';s.setItem(coreKey+'-backup',bad);
 assert.equal(p.newGame(true),true);assert.ok(p.diagnostics().preservedUnreadableKeys.some(k=>s.getItem(k)===bad));assert.equal(p.restorePrevious(),true);assert.deepEqual(completed(p),[1,2]);
});
test('journal-first saves and reset stay durable when only primary writes fail',()=>{
 const s=store(),blocked={...s,setItem(k:string,v:string){if(k===coreKey)throw Error('primary unavailable');s.setItem(k,v);}};
 const p=new CampaignProgress(blocked,coreKey);assert.equal(p.observe(1,evidence()),true);assert.deepEqual(completed(new CampaignProgress(s,coreKey)),[1]);assert.match(p.warning!,/protected in the save journal/);
 assert.equal(p.newGame(true),true);assert.deepEqual(completed(new CampaignProgress(s,coreKey)),[]);assert.equal(p.restorePrevious(),true);assert.deepEqual(completed(new CampaignProgress(s,coreKey)),[1]);
});
test('unreadable storage cannot be overwritten, and later read recovery merges earned progress',()=>{
 const s=store();earned(s,2);let unreadable=true,writes=0;
 const flaky={...s,getItem(k:string){if(unreadable&&k===coreKey)throw Error('blocked read');return s.getItem(k);},setItem(k:string,v:string){writes++;s.setItem(k,v);}};
 const p=new CampaignProgress(flaky,coreKey);assert.deepEqual(completed(p),[1,2]);assert.equal(p.enter(1),true);assert.equal(writes,0);assert.equal(p.diagnostics().lastWrite,'blocked');
 unreadable=false;assert.equal(p.enter(3),true);assert.equal(p.observe(3,evidence()),true);assert.deepEqual(completed(new CampaignProgress(s,coreKey)),[1,2,3]);
});
test('partial record decoding keeps the original raw copy instead of silently discarding it',()=>{
 const s=store(),r={completed:true,runs:1,completions:1,unaided:true,bestRetries:0,last:evidence()},raw=JSON.stringify({version:2,highestUnlocked:3,resumeLevel:3,records:{1:r,2:{completed:true,runs:'unreadable'}},updatedAt:1});
 s.setItem(coreKey,raw);const p=new CampaignProgress(s,coreKey);assert.deepEqual(completed(p),[1]);assert.equal(p.enter(1),true);assert.ok(p.diagnostics().preservedUnreadableKeys.some(k=>s.getItem(k)===raw));assert.equal(p.save.records[2],undefined);
});
test('a valid same-generation backup recovers records omitted by a partial main save',()=>{
 const s=store();earned(s,2);const backup=s.getItem(coreKey)!;s.setItem(coreKey+'-backup',backup);s.removeItem(coreKey+'-journal');
 const broken=JSON.parse(backup);broken.records[2].runs='unreadable';const raw=JSON.stringify(broken);s.setItem(coreKey,raw);
 const p=new CampaignProgress(s,coreKey);assert.deepEqual(completed(p),[1,2]);assert.equal(p.enter(3),true);assert.ok(p.diagnostics().preservedUnreadableKeys.some(k=>s.getItem(k)===raw));
});
test('journal write failure leaves the only valid primary copy untouched',()=>{
 const s=store();earned(s,1);const before=s.getItem(coreKey),journal=s.getItem(coreKey+'-journal');
 const blocked={...s,setItem(k:string,v:string){if(k===coreKey+'-journal')throw Error('quota');s.setItem(k,v);}};
 const p=new CampaignProgress(blocked,coreKey);assert.equal(p.observe(2,evidence()),true);assert.equal(s.getItem(coreKey),before);assert.equal(s.getItem(coreKey+'-journal'),journal);assert.equal(p.newGame(true),false);assert.equal(s.getItem(coreKey),before);
});
test('an unreadable restore backup reports its failure without replacing current progress',()=>{
 const s=store(),p=earned(s,2),before=s.getItem(coreKey);s.setItem(coreKey+'-backup','bad backup');
 assert.equal(p.restorePrevious(),false);assert.equal(s.getItem(coreKey),before);assert.equal(s.getItem(coreKey+'-backup'),'bad backup');assert.match(p.warning!,/backup could not be read/);
});
test('genuine CJ/Bh exports retain real null legacy metrics, variant evidence and key isolation',()=>{
 for(const name of ['level3-run','level3-affected-replay','clean-five-run','final-controls-replay']){
  const file=JSON.parse(readFileSync(new URL('../docs/chamber-qa/'+name+'/earned-game-only-storage.json',import.meta.url),'utf8'));
  const entry=file.origins.find((o:{origin:string})=>o.origin==='http://localhost:4261').localStorage.find((v:{name:string})=>v.name===coreKey),actual=JSON.parse(entry.value),s=store();s.setItem(coreKey,entry.value);
  const p=new CampaignProgress(s,coreKey);assert.deepEqual(p.save.records,actual.records);assert.equal(p.save.highestUnlocked,actual.highestUnlocked);assert.equal(p.canImportCoreCompletions,false);assert.equal(p.enter(1),true);
  const reopened=new CampaignProgress(s,coreKey);assert.deepEqual(completed(reopened),Object.keys(actual.records).map(Number));assert.equal(new CampaignProgress(s).save.highestUnlocked,1);assert.equal(s.getItem(SAVE_KEY+'-journal'),null);
  if(name==='level3-affected-replay'){assert.equal(reopened.save.records[1].last.seconds,null);assert.equal(reopened.save.records[1].runs,0);assert.ok(reopened.save.records[3].variants?.base);assert.ok(reopened.save.records[3].variants?.contrast);}
  if(name==='level3-run'){assert.equal(reopened.save.records[3].last.variant,undefined);assert.ok(reopened.save.records[3].unattributed?.length);}
 }
});
