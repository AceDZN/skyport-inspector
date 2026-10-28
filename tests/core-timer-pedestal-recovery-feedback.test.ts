/** One bounded native C12 contact history; not browser/control acceptance. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {initializePhysics} from '../src/core/world';
import {V,type Input} from '../src/physics';
import {SequenceRoute,forward} from './helpers/sequence-route';
import {observeTimerQueryState} from './helpers/timer-query-state-observer';

const enabled=process.env.RIFT_C12_TIMER_RECOVERY_FEEDBACK==='1',dt=1/120;
test('native C12 observed-face companion preserves four recovery inputs and exact timer state',{skip:!enabled},async()=>{
 await initializePhysics();
 const r=new SequenceRoute(12,false,'east-clock-recovery'),frames:unknown[]=[],phases:unknown[]=[],trials:{name:string;start:number[];end:number[];distance:number;clear:boolean;grounded:boolean}[]=[];
 const out=process.env.RIFT_C12_TIMER_OUT;assert.ok(out,'A unique companion evidence directory is required');
 const observer=observeTimerQueryState(r.w);let accountedCrossings=0,escapeCrossings=0,extraWalkingReturns=0;
 let error:unknown;
 const state=()=>({time:r.w.time,crossings:r.w.player.crossings,player:r.w.player.pos.toArray(),native:{...r.w.character.translation()},velocity:r.w.player.vel.toArray(),grounded:r.w.player.grounded,computed:{...r.w.controller.computedMovement()},contacts:r.contacts(),timer:{position:r.device('east-clock').position.toArray(),native:{...r.w.doors.get('east-clock')!.rigid.translation()},next:{...r.w.doors.get('east-clock')!.rigid.nextTranslation()},linear:{...r.w.doors.get('east-clock')!.rigid.linvel()},type:r.w.doors.get('east-clock')!.rigid.bodyType(),on:r.device('east-clock').on}});
 const step=(label:string,input:Input)=>{const before=state();r.step(input);const after=state();const crossed=after.crossings-before.crossings;assert.ok(crossed===0||crossed===1,'One ordinary step cannot invent multiple crossings');accountedCrossings+=crossed;frames.push({label,dt,input:{...input},yaw:r.w.yaw,pitch:r.w.pitch,before,after});assert.ok(r.w.player.pos.distanceTo(V(after.native.x,after.native.y,after.native.z))<1e-5,'Proxy/native capsule disagree');};
 const hold=(label:string,seconds:number,input:Input)=>{const start=state();for(let i=0;i<Math.ceil(seconds/dt);i++)step(label,input);phases.push({label,start,end:state()});};
 const walk=(label:string,x:number,z:number)=>{const start=state();let reached=false;for(let i=0;i<360;i++){if(Math.hypot(r.w.player.pos.x-x,r.w.player.pos.z-z)<.025){reached=true;break;}r.look(V(x,r.w.eye().y,z));step(label,forward);}phases.push({label,target:[x,z],reached,start,end:state()});return reached;};
 const timerContact=()=>r.contacts().some(c=>c.id==='east-clock');
 const touch=()=>{
  // A successful northward escape can genuinely enter B and return to the
  // enclosed booth. Reach the waiting side through the actual live pair again.
  if(r.w.player.pos.z>6.25&&Math.abs(r.w.player.pos.x)<2.9){
   assert.equal(r.w.portals[0]?.surfaceId,'booth-source');assert.equal(r.w.portals[1]?.surfaceId,'waiting-white');
   assert.ok(walk('ordinary-booth-return-to-live-source',.55,12.7));
   const prior=r.w.player.crossings,p=r.w.portals[0]!;r.look(p.center.clone().addScaledVector(p.normal,-2));
   for(let i=0;i<480&&r.w.player.crossings===prior;i++)step('ordinary-live-pair-reapproach',forward);
   assert.equal(r.w.player.crossings,prior+1,'Booth recovery must actually traverse the live pair');extraWalkingReturns++;
   hold('ordinary-live-pair-exit-settle',.18,{forward:0,strafe:0,jump:false});
   phases.push({label:'actual-booth-return-by-live-pair',crossingsBefore:prior,crossingsAfter:r.w.player.crossings,state:state()});
  }
  // Reapproach through the real clear aisle, with no body/fixture relocation.
  if(!(timerContact()&&r.w.player.pos.x<.65&&r.w.player.pos.z>4&&r.w.player.pos.z<5)){
   assert.ok(walk('ordinary-clear-aisle',0,3.4),'Could not reach the ordinary north clear aisle');
   assert.ok(walk('ordinary-west-side-aisle',.43,3.4),'Could not reach west-side aisle');
   assert.ok(walk('ordinary-early-west-face-approach',.43,4.15),'Could not reach actual early west-side approach');
   hold('ordinary-neutral-grounded-deceleration',.5,{forward:0,strafe:0,jump:false});
   for(let tap=0;tap<2&&(r.w.player.pos.z<4.325||r.w.player.pos.z>4.675);tap++){
    const direction=r.w.player.pos.z<4.325?1:-1;r.look(V(r.w.player.pos.x,r.w.eye().y,r.w.player.pos.z+direction*3));
    step('ordinary-one-frame-cardinal-Z-tap',forward);hold('ordinary-neutral-after-cardinal-Z-tap',.5,{forward:0,strafe:0,jump:false});
    phases.push({label:'actual-observed-cardinal-tap-result',tap:tap+1,direction,state:state()});
   }
   phases.push({label:'actual-settled-face-height-before-orthogonal-contact',state:state()});
   assert.ok(r.w.player.grounded&&r.w.player.pos.z>=4.325&&r.w.player.pos.z<=4.675,'Actual settled position must lie within authored flat face');
   assert.ok(Math.abs(r.w.player.vel.z)<.005,'Actual tangent velocity must settle through ordinary neutral input');
  }
  r.look(V(4,r.w.eye().y,r.w.player.pos.z));let contacted=false;
  for(let i=0;i<180;i++){step('orthogonal-inward-W-to-west-face',forward);if(timerContact()){contacted=true;break;}}
  assert.ok(contacted,'Setup never actually touched EAST CYCLE');
  phases.push({label:'actual-first-orthogonal-timer-contact',state:state()});
  assert.ok(r.contacts().some(c=>c.id==='east-clock'&&c.normal.x<-.99&&Math.abs(c.normal.z)<.01),'The genuine contact must be the flat west face, not a rounded corner');
  hold('continued-orthogonal-inward-push',.6,forward);
  phases.push({label:'actual-west-contact-before-recovery',state:state()});
  assert.ok(r.w.player.pos.x<.65&&r.w.player.pos.z>3.9&&r.w.player.pos.z<5.1,'Not a genuine west-side contact history');
 };
 try{
  r.shot(0,'booth-source',V(.55,1.55,13.985));r.shot(1,'waiting-white',V(.55,1.55,2.665));
  assert.ok(walk('ordinary-source-approach',.55,12.7));r.look(V(.55,r.w.eye().y,16));
  hold('original-750ms-W-through-pair',.75,forward);assert.equal(r.w.player.crossings,1,'Actual walking pair must cross');
  phases.push({label:'native-end-after-old-750ms-not-forced-to-browser-pose',state:state()});
  for(const name of ['A-retained-diagonal-heading','S-retained-diagonal-heading','W-facing-west-back-out','A-facing-north-strafe-away']){
   touch();if(name==='A-retained-diagonal-heading'||name==='S-retained-diagonal-heading')r.look(V(4,r.w.eye().y,4));
   const start=r.w.player.pos.clone(),crossingsBeforeControl=r.w.player.crossings;
   let input:Input={forward:0,strafe:-1,jump:false};
   if(name==='S-retained-diagonal-heading')input={forward:-1,strafe:0,jump:false};
   if(name==='W-facing-west-back-out'){r.look(V(-4,r.w.eye().y,r.w.player.pos.z));input=forward;}
   if(name==='A-facing-north-strafe-away')r.look(V(r.w.player.pos.x,r.w.eye().y,-4));
   hold(name,1,input);escapeCrossings+=r.w.player.crossings-crossingsBeforeControl;
   trials.push({name,start:start.toArray(),end:r.w.player.pos.toArray(),distance:r.w.player.pos.distanceTo(start),clear:r.w.player.pos.x<.15||r.w.player.pos.z<4||r.w.player.pos.z>5,grounded:r.w.player.grounded});
   // Preserve each first result. If stuck, try the remaining controls at the same
   // contact rather than relocating/boosting the capsule to manufacture recovery.
  }
  for(const trial of trials){assert.ok(trial.distance>.4,trial.name+' did not produce ordinary movement');assert.ok(trial.clear,trial.name+' did not leave actual timer clearance');assert.ok(trial.grounded,trial.name+' lost normal floor support');}
  assert.equal(r.w.respawns,0);assert.equal(r.events.some(e=>e.type==='jump'),false);assert.equal(r.w.player.crossings,accountedCrossings);assert.equal(r.w.player.crossings,1+escapeCrossings+extraWalkingReturns);
  assert.ok(observer.counts.characterQueries>100);assert.ok(observer.counts.nativeFixedTimerObservations>0,'Candidate must actually expose stationary timers as Fixed inside native character queries');assert.equal(observer.counts.stateViolations,0);assert.ok(observer.counts.restoredBeforePhysics>100);
 }catch(e){error=e;throw e;}finally{
  mkdirSync(out,{recursive:true});writeFileSync(out+'/trajectory.json',JSON.stringify({scope:'ONE authored-spawn native C12 case. Existing ray-checked aimed portal commands and ordinary camera/WASD at120Hz. No actor/cargo/velocity/device/clock-machine/save/history/goal assignments; no browser/build. Old750ms native endpoint is observed, never forced to browser pose.',error:error?String(error):null,observer:{counts:observer.counts,samples:observer.samples,final:observer.final(),heldScope:'C12 contains no cargo, so held query hook count0 is NOT invoked held-state proof.'},crossingAccounting:{accountedCrossings,escapeCrossings,extraWalkingReturns},trials,phases,frames,events:r.events,final:r.w.snapshot()},null,2)+'\n');r.w.dispose();
 }
});
