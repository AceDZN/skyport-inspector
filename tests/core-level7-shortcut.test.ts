/** Independent authored-spawn C7 counterexample. Native units, not browser completion/unlock proof.
 * No pose/velocity/machine/goal/history/save assignments. Camera aim, real portal shots,
 * visible native E, ordinary movement and the parent's genuine running-jump vector only.
 */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import RAPIER from '@dimforge/rapier3d-compat';
import {Vector3} from 'three';
import {CoreWorld,initializePhysics} from '../src/core/world';
import {draftPermissionLevels} from '../src/core/levels/permissions';
import type {Input} from '../src/physics';
before(initializePhysics);
const idle:Input={forward:0,strafe:0,jump:false},forward:Input={...idle,forward:1};
const output=process.env.RIFT_C7_RUN?new URL('../docs/chamber-qa/C7-shortcut/'+process.env.RIFT_C7_RUN+'/',import.meta.url):new URL('../work/chamber-qa/C7-shortcut/unit-'+Date.now()+'/',import.meta.url);
class Route {
 readonly w:CoreWorld;readonly checkpoints:any[]=[];readonly events:any[]=[];
 constructor(readonly contrast=false){const level=draftPermissionLevels.find(l=>l.number===7)!;assert.ok(level);this.w=new CoreWorld(7,(type,data)=>this.events.push({type,data}),level,contrast);assert.deepEqual(this.w.player.pos.toArray(),this.w.blueprint.spawn);this.tick(.5);}
 tick(s:number,input=idle){for(let i=0;i<Math.ceil(s*120);i++)this.w.step(1/120,input);}
 look(point:Vector3){const d=point.clone().sub(this.w.eye());this.w.yaw=Math.atan2(-d.x,-d.z);this.w.pitch=Math.asin(d.y/d.length());}
 note(label:string){const contacts=[];for(let i=0;i<this.w.controller.numComputedCollisions();i++){const c=this.w.controller.computedCollision(i)!;contacts.push({id:c.collider?(this.w.fixed.get(c.collider.handle)?.id??[...this.w.doors].find(([,b])=>b.collider.handle===c.collider!.handle)?.[0]??'body'):'none',toi:c.toi,normal:c.normal1});}this.checkpoints.push({label,state:this.w.snapshot(),contacts});}
 walk(x:number,z:number,seconds=8){for(let i=0;i<seconds*120;i++){if(this.w.campaignResult)return false;const dx=x-this.w.player.pos.x,dz=z-this.w.player.pos.z;if(Math.hypot(dx,dz)<.07){this.tick(.2);return true;}this.w.yaw=Math.atan2(-dx,-dz);this.w.pitch=0;this.w.step(1/120,forward);}return false;}
 go(x:number,z:number){assert.ok(this.walk(x,z),`Ordinary walk blocked at ${this.w.player.pos.toArray()} toward ${x},${z}`);}
 device(id:string){const d=this.w.machines.devices.find(d=>d.spec.id===id);assert.ok(d);return d;}
 clearRay(target:Vector3,ignored:string[],throughGlass=false){const direction=target.clone().sub(this.w.eye()),distance=direction.length();const hit=this.w.physics.castRay(new RAPIER.Ray(this.w.eye(),direction.normalize()),distance-.07,true,undefined,undefined,this.w.characterCollider,undefined,c=>{const s=this.w.fixed.get(c.handle);if(s&&(ignored.includes(s.id)||(throughGlass&&s.kind==='glass')))return false;for(const [id,b]of this.w.doors)if(ignored.includes(id)&&b.collider.handle===c.handle)return false;return true;});assert.equal(hit,null,'Native shot/control ray is blocked');}
 shot(index:0|1,id:string,target:Vector3){const s=this.w.surfaces.find(s=>s.id===id)!;assert.ok(s);this.look(target);this.clearRay(target,[s.solidId],true);assert.equal(this.w.place(index,id,target),true);}
 hub(){this.shot(0,'operations-white',new Vector3(0,1.55,14.985));this.shot(1,'hub-white',new Vector3(.55,1.55,2.765));this.go(0,13.7);const portal=this.w.portals[0]!;this.look(portal.center.clone().addScaledVector(portal.normal,-2));for(let i=0;i<360&&this.w.player.crossings===0;i++)this.w.step(1/120,forward);assert.equal(this.w.player.crossings,1);this.tick(.18);this.go(-4,4);this.note('authored-operations-to-hub');}
 useTransfer(){const d=this.device('transfer-deck'),point=d.position.clone().add(new Vector3(...(d.spec.controlOffset??[0,0,0])));this.look(point);this.clearRay(point,['transfer-deck']);assert.match(this.w.interactionHint(),/Use/);assert.equal(this.w.interact(),true);this.w.step(1/120,idle);}
 arrive(label:'north'|'east'){const d=this.device('transfer-deck'),stop=d.spec.stops!.find(s=>s.label===label)!;for(let i=0;i<12*120;i++){if(!d.moving&&d.position.distanceTo(new Vector3(...stop.position))<.02){this.tick(.2);assert.equal(this.w.machines.flags['at:transfer-deck:'+label],true);return;}this.w.step(1/120,idle);}assert.fail('Actual transfer failed to dock '+label);}
 east(){this.go(-7,3);this.useTransfer();this.arrive('east');this.go(3,3);this.note('actual-east-docking');}
 northwestJump(){
  this.go(4,-2.5);this.note('parent-counterexample-runup');
  // Preserve the parent's actual running/jump vector and durations. This jump remains feasible.
  this.w.yaw=Math.atan2(5,2.5);this.w.pitch=0;this.tick(.36,forward);this.note('parent-counterexample-takeoff');
  this.tick(.75,{...forward,jump:true});this.tick(.3);this.note('genuine-north-dock-landing');
  assert.ok(this.w.player.grounded&&this.w.player.pos.x<-.28&&this.w.player.pos.z< -4.28&&this.w.player.pos.y>.8,'Running NW jump no longer genuinely lands on the authored North dock');
  assert.ok(Math.abs(this.device('transfer-deck').position.x-6)<.02,'Jump secretly changed deck alignment');assert.equal(this.w.machines.flags['at:transfer-deck:north'],false);assert.equal(this.w.machines.flags['at:transfer-deck:east'],true);
 }
 blockedNorth(){this.go(-4,-9);assert.equal(this.walk(-4,-12.5,2),false);this.note('closed-north-leaf-blocks-unaligned-shortcut');assert.equal(this.w.campaignResult,undefined);assert.ok(this.w.player.pos.z> -10&&this.w.player.pos.z< -9.5,'Actor bypassed the physical North leaf');assert.ok(this.w.player.grounded);assert.ok(this.device('north-dock-door').progress<.01);assert.ok(this.device('east-dock-door').progress>.99);assert.equal(this.w.respawns,0);}
 reverseJump(){this.go(-2,-6);this.w.yaw=Math.atan2(-5,-2.5);this.w.pitch=0;this.tick(.36,forward);this.tick(.75,{...forward,jump:true});this.tick(.3);this.note('ordinary-jump-return-to-east-deck');const d=this.device('transfer-deck');assert.ok(this.w.player.grounded&&Math.abs(this.w.player.pos.x-d.position.x)<d.spec.size[0]/2-.28&&Math.abs(this.w.player.pos.z-d.position.z)<d.spec.size[2]/2-.28,'Reverse jump did not return to the real East deck');assert.equal(this.w.respawns,0);}
 restoreNorth(){this.go(3,0);this.go(3,3);this.useTransfer();this.tick(.3);assert.equal(this.w.machines.flags['at:transfer-deck:north'],false);assert.ok(this.device('north-dock-door').progress<.01,'Choosing North opened its shutter before real docking');this.arrive('north');this.tick(1);assert.ok(this.device('north-dock-door').progress>.99);assert.ok(this.device('east-dock-door').progress<.01);this.note('actual-north-docking-opens-real-leaf');this.go(-4,4);this.go(-4,-6);for(let i=0;i<360&&!this.w.campaignResult;i++){this.look(new Vector3(-4,this.w.eye().y,-12.5));this.w.step(1/120,forward);}assert.equal(this.w.campaignResult?.exit,'north-exit');assert.equal(this.w.campaignResult?.goalMatched,true);assert.equal(this.w.respawns,0);assert.equal(this.events.filter(e=>e.type==='jump').length,2);this.note('physical-north-exit-after-actual-restoration');}
 finish(error?:unknown){this.note(error?'failure':'final');mkdirSync(output,{recursive:true});writeFileSync(new URL(this.contrast?'contrast.json':'base.json',output),JSON.stringify({scope:'Unregistered C7 authored-spawn native regression; no pose/velocity/machine/goal/history/save assignments or browser completion claim.',contrast:this.contrast,error:error?String(error):null,reference:'Read-only parent level7-cross-dock-probe.mts/result in idea-plotter reports',checkpoints:this.checkpoints,events:this.events},null,2)+'\n');this.w.dispose();}
}
test('independent C7 both instructions retain the same actual dock shutters and contact circuits',()=>{const a=new Route(),b=new Route(true);try{assert.deepEqual(a.w.blueprint,b.w.blueprint);assert.deepEqual(a.device('north-dock-door').spec.circuit,{all:['at:transfer-deck:north']});assert.deepEqual(a.device('east-dock-door').spec.circuit,{all:['at:transfer-deck:east']});assert.ok(a.device('north-dock-door').progress>.5);assert.ok(a.device('east-dock-door').progress<.01);}finally{a.w.dispose();b.w.dispose();}});
for(const contrast of [false,true])test(`independent C7 real East-to-North jump lands but unaligned physical shutter blocks; contrast=${contrast}`,()=>{const r=new Route(contrast);let failure:unknown;try{r.hub();r.east();r.northwestJump();r.blockedNorth();if(!contrast){r.reverseJump();r.restoreNorth();}}catch(error){failure=error;throw error;}finally{r.finish(failure);}});
