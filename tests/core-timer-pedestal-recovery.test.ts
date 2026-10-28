/** One bounded native C12 contact history; not browser/control acceptance. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {initializePhysics} from '../src/core/world';
import {V,type Input} from '../src/physics';
import {SequenceRoute,forward} from './helpers/sequence-route';

const enabled=process.env.RIFT_C12_TIMER_RECOVERY==='1',dt=1/120;
test('native C12 actual EAST CYCLE west contact permits ordinary A S back-out and strafe recovery',{skip:!enabled},async()=>{
 await initializePhysics();
 const r=new SequenceRoute(12,false,'east-clock-recovery'),frames:unknown[]=[],phases:unknown[]=[],trials:{name:string;start:number[];end:number[];distance:number;clear:boolean;grounded:boolean}[]=[];
 const out=process.env.RIFT_C12_TIMER_OUT??'docs/chamber-qa/C12-timer-pedestal-recovery-v3/first';
 let error:unknown;
 const state=()=>({time:r.w.time,player:r.w.player.pos.toArray(),native:{...r.w.character.translation()},velocity:r.w.player.vel.toArray(),grounded:r.w.player.grounded,computed:{...r.w.controller.computedMovement()},contacts:r.contacts(),timer:{position:r.device('east-clock').position.toArray(),native:{...r.w.doors.get('east-clock')!.rigid.translation()},next:{...r.w.doors.get('east-clock')!.rigid.nextTranslation()},linear:{...r.w.doors.get('east-clock')!.rigid.linvel()},type:r.w.doors.get('east-clock')!.rigid.bodyType(),on:r.device('east-clock').on}});
 const step=(label:string,input:Input)=>{const before=state();r.step(input);const after=state();frames.push({label,dt,input:{...input},yaw:r.w.yaw,pitch:r.w.pitch,before,after});assert.ok(r.w.player.pos.distanceTo(V(after.native.x,after.native.y,after.native.z))<1e-5,'Proxy/native capsule disagree');};
 const hold=(label:string,seconds:number,input:Input)=>{const start=state();for(let i=0;i<Math.ceil(seconds/dt);i++)step(label,input);phases.push({label,start,end:state()});};
 const walk=(label:string,x:number,z:number)=>{const start=state();let reached=false;for(let i=0;i<360;i++){if(Math.hypot(r.w.player.pos.x-x,r.w.player.pos.z-z)<.025){reached=true;break;}r.look(V(x,r.w.eye().y,z));step(label,forward);}phases.push({label,target:[x,z],reached,start,end:state()});return reached;};
 const timerContact=()=>r.contacts().some(c=>c.id==='east-clock');
 const touch=()=>{
  // Reapproach through the real clear aisle, with no body/fixture relocation.
  if(!(timerContact()&&r.w.player.pos.x<.65&&r.w.player.pos.z>4&&r.w.player.pos.z<5)){
   assert.ok(walk('ordinary-clear-aisle',0,3.4),'Could not reach the ordinary north clear aisle');
   assert.ok(walk('ordinary-west-side-aisle',.43,3.4),'Could not reach west-side aisle');
   assert.ok(walk('ordinary-west-face-approach',.43,4.5575),'Could not reach actual pedestal west-side approach');
  }
  r.look(V(4,r.w.eye().y,4));let contacted=false;
  for(let i=0;i<180;i++){step('diagonal-W-toward-4-4',forward);if(timerContact()){contacted=true;break;}}
  assert.ok(contacted,'Setup never actually touched EAST CYCLE');
  hold('continued-diagonal-push',.6,forward);
  phases.push({label:'actual-west-contact-before-recovery',state:state()});
  assert.ok(r.w.player.pos.x<.65&&r.w.player.pos.z>3.9&&r.w.player.pos.z<5.1,'Not a genuine west-side contact history');
 };
 try{
  r.shot(0,'booth-source',V(.55,1.55,13.985));r.shot(1,'waiting-white',V(.55,1.55,2.665));
  assert.ok(walk('ordinary-source-approach',.55,12.7));r.look(V(.55,r.w.eye().y,16));
  hold('original-750ms-W-through-pair',.75,forward);assert.equal(r.w.player.crossings,1,'Actual walking pair must cross');
  phases.push({label:'native-end-after-old-750ms-not-forced-to-browser-pose',state:state()});
  for(const name of ['A-retained-diagonal-heading','S-retained-diagonal-heading','W-facing-west-back-out','A-facing-north-strafe-away']){
   touch();const start=r.w.player.pos.clone();
   let input:Input={forward:0,strafe:-1,jump:false};
   if(name==='S-retained-diagonal-heading')input={forward:-1,strafe:0,jump:false};
   if(name==='W-facing-west-back-out'){r.look(V(-4,r.w.eye().y,r.w.player.pos.z));input=forward;}
   if(name==='A-facing-north-strafe-away')r.look(V(r.w.player.pos.x,r.w.eye().y,-4));
   hold(name,1,input);
   trials.push({name,start:start.toArray(),end:r.w.player.pos.toArray(),distance:r.w.player.pos.distanceTo(start),clear:r.w.player.pos.x<.15||r.w.player.pos.z<4||r.w.player.pos.z>5,grounded:r.w.player.grounded});
   // Preserve each first result. If stuck, try the remaining controls at the same
   // contact rather than relocating/boosting the capsule to manufacture recovery.
  }
  for(const trial of trials){assert.ok(trial.distance>.4,trial.name+' did not produce ordinary movement');assert.ok(trial.clear,trial.name+' did not leave actual timer clearance');assert.ok(trial.grounded,trial.name+' lost normal floor support');}
  assert.equal(r.w.respawns,0);assert.equal(r.events.some(e=>e.type==='jump'),false);assert.equal(r.w.player.crossings,1);
 }catch(e){error=e;throw e;}finally{
  mkdirSync(out,{recursive:true});writeFileSync(out+'/trajectory.json',JSON.stringify({scope:'ONE authored-spawn native C12 case. Existing ray-checked aimed portal commands and ordinary camera/WASD at120Hz. No actor/cargo/velocity/device/clock-machine/save/history/goal assignments; no browser/build. Old750ms native endpoint is observed, never forced to browser pose.',error:error?String(error):null,trials,phases,frames,events:r.events,final:r.w.snapshot()},null,2)+'\n');r.w.dispose();
 }
});
