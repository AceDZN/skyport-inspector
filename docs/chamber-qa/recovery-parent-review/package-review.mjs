import fs from 'node:fs';
import {createHash} from 'node:crypto';
const dir=new URL('./',import.meta.url).pathname,raw=dir+'run/';
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const m=JSON.parse(fs.readFileSync(raw+'manifest.json'));
const expectedMain='aabfe1edb6d14912d32c27ec4af35f9057ff905c6d7672713e3a7c43437218b0';
const expectedAudio='5e6dab1738c0f5140ed676a3ce97b39805c3acb02794f8f9bf8888110719c9ed';
for(const v of m.versions)for(const expected of[expectedMain,expectedAudio])if(!v.scripts.some(s=>s.sha256===expected))throw Error('Frozen resource changed');
const checkpoint=label=>{const c=m.checkpoints.find(c=>c.label===label);if(!c)throw Error('Missing actual checkpoint '+label);return c;};
const publicPose=c=>({label:c.label,level:c.state.level,mode:c.state.mode,player:c.state.world.player,respawns:c.state.world.respawns,devices:c.state.world.devices.filter(d=>['recovery-lift','basin-call','inspection-carrier'].includes(d.id)),result:c.state.world.result,completed:c.state.progress.completed});
const wins=m.checkpoints.filter(c=>c.state?.world?.result?.goalMatched);
if(JSON.stringify(wins.map(c=>c.state.level))!==JSON.stringify([16,18]))throw Error('Affected win set differs');
for(const c of wins)if(c.state.world.respawns!==0)throw Error('Affected route reset');
const recovered=checkpoint('16-second-physical-return-without-reset');
if(recovered.state.world.player.crossings!==0||!recovered.state.world.player.grounded)throw Error('Recovery was not a grounded physical ride');
const completed=m.actions.findLast(a=>a.after?.mode==='menu')?.after.progress.completed;
if(JSON.stringify(completed)!==JSON.stringify(Array.from({length:20},(_,i)=>i+1)))throw Error('Saved earned prefix differs');
fs.mkdirSync(dir+'evidence',{recursive:true});
const selected=[2,4,5,6,7,8,9,10,12,13,14,16,17,18];
const images=selected.map(n=>{const c=m.checkpoints[n-1];fs.copyFileSync(raw+c.capture,dir+'evidence/'+c.capture);return{file:'evidence/'+c.capture,label:c.label,sha256:hash(raw+c.capture)};});
const verified={scope:'Affected C16 repeated physical recovery and genuine exit, affected C18 faster-carrier exit, and C6 partial visual replay on one frozen repaired20 build. Imported genuinely earned20 in an independent QA browser. No new main room or fresh campaign proof.',packagedAt:new Date().toISOString(),processTermination:{exitCode:null,note:'Interactive process51782 was no longer available after C6 capture. No clean exit code was observed. Persisted actions and captures establish only their recorded scope.'},inputs:m.actions.length,captures:m.checkpoints.length,commandFailures:m.actions.filter(a=>a.error).map(a=>({input:a.input,error:a.error})),pageErrors:m.errors,consoleErrors:m.consoleErrors,videoRecorded:false,sourceManifest:{file:'run/manifest.json',sha256:hash(raw+'manifest.json')},genuineEarnedStorage:{file:'run/earned-game-only-storage.json',sha256:hash(raw+'earned-game-only-storage.json')},versions:m.versions,successes:wins.map(c=>({label:c.label,level:c.state.level,exit:c.state.world.result.exit,retries:c.state.world.respawns})),recovery:[
'16-first-real-missed-aperture-on-deep-floor','16-first-return-physically-reaches-approach','16-second-miss-deck-still-upstairs','16-visible-fixed-basin-call-control','16-actual-recall-arrives-while-waiting-safely','16-second-physical-return-without-reset'
].map(label=>publicPose(checkpoint(label))),lastReloadCompleted:completed,visualAcceptance:false,visualFindings:['C16 higher gallery is still dark and sparse; its black ceiling and doorway overwhelm the composition.','C18 threshold pool improves local readability, but repeated gray wall bands remain visually flat.','C6 real upper gallery has clearer local doorway lighting; this does not establish whole-campaign visual quality.'],separateFailedC8Launch:{file:'finish-eight.log',sha256:hash(dir+'finish-eight.log'),exitCode:1,error:'net::ERR_CONNECTION_REFUSED at localhost4261 before any game input',gameplayEvidence:false},verifiedBasePrefix:20,remainingMainRooms:30,finalFresh50RunVerified:false,images};
fs.writeFileSync(dir+'VERIFIED.json',JSON.stringify(verified,null,2)+'\n');
fs.writeFileSync(dir+'BUILD.json',JSON.stringify(m.versions,null,2)+'\n');
fs.writeFileSync(dir+'executed-inputs.jsonl',m.actions.filter(a=>typeof a.input==='object').map(a=>JSON.stringify(a.input)).join('\n')+'\n');
console.log(JSON.stringify({inputs:verified.inputs,captures:verified.captures,commandFailures:verified.commandFailures.length,pageErrors:m.errors.length,consoleErrors:m.consoleErrors.length,affectedWins:verified.successes,manifest:verified.sourceManifest.sha256,images:images.length}));
