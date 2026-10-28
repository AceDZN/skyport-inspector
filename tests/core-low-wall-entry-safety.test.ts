/** Follow-up SOURCE ONLY until a separate strict/native grant. No browser proof. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import RAPIER from '@dimforge/rapier3d-compat';
import {CoreWorld,initializePhysics} from '../src/core/world';
import {ChamberBuilder} from '../src/core/level-kit';
import type {CoreLevel} from '../src/core/level';
import {V,type Input} from '../src/physics';

const enabled=process.env.RIFT_LOW_WALL_SAFETY==='1',dt=1/120,idle:Input={forward:0,strafe:0,jump:false},forward:Input={...idle,forward:1};
const contract=(name:string,fn:()=>void)=>test(name,{skip:!enabled},fn);
before(async()=>{if(enabled)await initializePhysics();});
const output=join('docs/chamber-qa/low-wall-entry',process.env.RIFT_LOW_WALL_RUN??'unlabelled-safety');

class Route{
 readonly w:CoreWorld;readonly events:Record<string,unknown>[]=[];readonly inputs:unknown[]=[];readonly notes:unknown[]=[];
 constructor(readonly name:string,definition?:CoreLevel){this.w=new CoreWorld(1,(type,data)=>this.events.push({type,...data}),definition);this.tick(.3);}
 tick(seconds:number,input:Input=idle){this.inputs.push({type:'ordinary-step',seconds,input:{...input},yaw:this.w.yaw,pitch:this.w.pitch});for(let i=0;i<Math.ceil(seconds/dt);i++)this.w.step(dt,input);}
 contacts(){return Array.from({length:this.w.controller.numComputedCollisions()},(_,i)=>this.w.controller.computedCollision(i)!).map(c=>({id:c.collider?this.w.fixed.get(c.collider.handle)?.id:undefined,normal:{...c.normal1},applied:{...c.translationDeltaApplied},remaining:{...c.translationDeltaRemaining}}));}
 note(label:string){this.notes.push({label,state:this.w.snapshot(),contacts:this.contacts()});}
 look(target:ReturnType<typeof V>){const d=target.clone().sub(this.w.eye());this.w.yaw=Math.atan2(-d.x,-d.z);this.w.pitch=Math.asin(d.y/d.length());}
 place(index:0|1,id:string,p:ReturnType<typeof V>,accepted=true){
  assert.equal(this.w.heldId,undefined,'Configure using ordinary empty hands');const surface=this.w.surfaces.find(s=>s.id===id);assert.ok(surface);this.look(p);
  const ray=p.clone().sub(this.w.eye()),length=ray.length();const hit=this.w.physics.castRay(new RAPIER.Ray(this.w.eye(),ray.normalize()),length-.07,true,undefined,undefined,this.w.characterCollider,undefined,c=>{const s=this.w.fixed.get(c.handle);return !(s&&(s.id===surface.solidId||s.kind==='glass'));});
  assert.equal(hit,null,'An actual opaque object blocks the shot centre');this.inputs.push({type:'ray-checked-aimed-placement',index,id,requested:p.toArray()});
  assert.equal(this.w.place(index,id,p),accepted);this.note('actual-aimed-placement-'+id);
 }
 walk(x:number,z:number,seconds=15){this.inputs.push({type:'ordinary-WASD-target',x,z});for(let i=0;i<seconds/dt;i++){if(this.w.campaignResult)return;const dx=x-this.w.player.pos.x,dz=z-this.w.player.pos.z;if(Math.hypot(dx,dz)<.12){this.tick(.12);return;}this.w.yaw=Math.atan2(-dx,-dz);this.w.pitch=0;this.w.step(dt,forward);}assert.fail('Actual walking blocked '+JSON.stringify({p:this.w.player.pos.toArray(),contacts:this.contacts()}));}
 enter(index:0|1){const p=this.w.portals[index];assert.ok(p);const prior=this.w.player.crossings;this.look(p.center.clone().addScaledVector(p.normal,-2));for(let i=0;i<3/dt&&this.w.player.crossings===prior;i++)this.w.step(dt,forward);this.note('actual-W-only-portal-entry');assert.equal(this.w.player.crossings,prior+1,'Flat walking must not require Space');this.tick(.18,forward);}
 e(){this.inputs.push({type:'ordinary-E'});if(!this.w.interact())this.w.grabDrop();this.w.step(dt,idle);}
 close(error?:unknown){this.note(error?'failure':'final');mkdirSync(output,{recursive:true});writeFileSync(join(output,this.name+'.json'),JSON.stringify({scope:'Actual C1 integration or explicit native safety fixture as named. Input-only after authored construction; not browser proof.',error:error?String(error):null,inputs:this.inputs,events:this.events,notes:this.notes},null,2)+'\n');this.w.dispose();}
}
function run(name:string,definition:CoreLevel|undefined,fn:(r:Route)=>void){const r=new Route(name,definition);let error:unknown;try{fn(r);}catch(e){error=e;throw e;}finally{r.close(error);}}

for(const naturalHeight of[1.55,1.65,1.75,1.85])contract('native actual C1 natural low shot '+naturalHeight+' retrieves and returns held cargo W only',()=>run('actual-C1-height-'+naturalHeight,undefined,r=>{
 assert.ok(r.w.player.pos.distanceTo(V(0,.865,10))<.06,'Start from real C1 spawn');
 r.place(0,'near-wall',V(-7.985,naturalHeight,6));r.place(1,'far-wall',V(5,2.8+naturalHeight,-11.985));
 assert.ok(Math.abs(r.w.portals[0]!.center.y-1.55)<.001,'Actual ground-supported A centre must align to1.55');
 assert.ok(Math.abs(r.w.portals[1]!.center.y-4.35)<.001,'Actual2.8m-alcove B centre must align to4.35');
 r.walk(-6.3,6);r.enter(0);assert.ok(r.w.player.grounded&&Math.abs(r.w.player.pos.y-3.665)<.06,'Actual raised-alcove support');
 r.walk(3,-10);r.look(r.w.crates.find(c=>c.id==='weighted-cube')!.pos);assert.match(r.w.interactionHint(),/Pick up/);r.e();assert.equal(r.w.heldId,'weighted-cube');
 r.walk(5,-10.3);r.enter(1);assert.ok(r.w.player.grounded&&Math.abs(r.w.player.pos.y-.865)<.06,'Actual ground return support');
 const cube=r.w.crates.find(c=>c.id==='weighted-cube')!;assert.ok(cube.crossings>=1);assert.equal(r.w.heldId,cube.id);
 r.walk(.2,6);r.look(V(2,1.2,6));r.tick(.35);r.e();r.tick(1.2);assert.equal(r.w.heldId,undefined);assert.equal(r.w.pads[0].crateId,cube.id,'Actual released cube must maintain pressure');
 r.walk(-4,8.8);r.walk(-6,11);r.walk(-10,11);assert.equal(r.w.campaignResult?.goalMatched,true);assert.equal(r.w.campaignResult?.exit,'next-chamber');
 assert.equal(r.w.respawns,0);assert.equal(r.events.some(e=>e.type==='jump'),false,'No Space action may hide the natural entry defect');assert.equal(r.w.pads[0].crateId,cube.id);
}));

function safetyFixture(support:number,kind:'raised'|'no-nearby-support'|'ledge'|'white-bounds'):CoreLevel{return{
 number:1,name:'Low alignment safety lab',mission:'Inspect the wall opening.',he:'בדקו את הפתח בקיר.',chapter:'Native safety diagnostic',architecture:{height:10,halfWidth:6,style:'ceramic'},recoveryY:-7,sources:[],blueprint:()=>{
  const b=new ChamberBuilder(),w=b.world;w.spawn=[0,support+.87,4.5];
  if(kind==='no-nearby-support'){b.floor('near-support',-6,6,0,8,0);b.floor('far-lower-support',-6,6,-8,0,-3);}else b.floor('supported-flat-floor',-6,6,-8,8,support);
  const bottom=kind==='no-nearby-support'?-3:support;
  b.box('south-host',[0,(bottom+support+7)/2,8.2],[12.8,support+7-bottom,.4]);b.box('north-host',[0,(bottom+support+7)/2,-8.2],[12.8,support+7-bottom,.4]);
  for(const x of[-6.2,6.2])b.box('side-'+x,[x,(bottom+support+7)/2,0],[.4,support+7-bottom,16.8]);b.box('ceiling',[0,support+7.2,0],[12.8,.4,16.8]);
  const whiteCentre=kind==='white-bounds'?1.55:support+3.5,whiteHeight=kind==='white-bounds'?3.1:7;
  b.panel('south-white','south-host',[0,whiteCentre,7.985],[0,0,-1],10,whiteHeight);b.panel('north-white','north-host',[0,whiteCentre,-7.985],[0,0,1],10,whiteHeight);
  if(kind==='ledge')b.floor('actual-blocking-ledge',-1.3,1.3,-8,-7,1.6);
  return b.finish();
 }};}

contract('native low alignment leaves genuinely raised2.1m portals raised on both support heights',()=>{
 for(const support of[0,3.4])run('safety-genuinely-raised-'+support,safetyFixture(support,'raised'),r=>{
  r.place(0,'south-white',V(0,support+2.1,7.985));r.place(1,'north-white',V(0,support+2.1,-7.985));
  assert.ok(Math.abs(r.w.portals[0]!.center.y-(support+2.1))<.001);assert.ok(Math.abs(r.w.portals[1]!.center.y-(support+2.1))<.001,'A deliberately raised target must not be pulled down to floor');
  r.look(V(0,support+2.1,8.5));r.tick(1.8,forward);assert.equal(r.w.player.crossings,0,'Do not enlarge full-body aperture clearance to make a raised opening walkable');assert.ok(r.w.player.grounded);assert.ok(Math.abs(r.w.player.pos.y-(support+.865))<.06);assert.equal(r.w.respawns,0);
 });
});
contract('native low alignment uses support at the target rather than the actor floor',()=>run('safety-no-nearby-target-support',safetyFixture(0,'no-nearby-support'),r=>{
 r.place(0,'north-white',V(0,1.75,-7.985));assert.ok(Math.abs(r.w.portals[0]!.center.y-1.75)<.001,'Floor−3 under the far wall is not a nearby0m walking support');
 assert.equal(r.w.player.crossings,0);assert.equal(r.w.respawns,0);
}));
contract('native low alignment still rejects a whole aperture buried in an actual ledge',()=>run('safety-blocking-ledge',safetyFixture(0,'ledge'),r=>{
 r.place(0,'north-white',V(0,1.75,-7.985),false);assert.equal(r.w.portals[0],undefined,'A bounded support adjustment cannot skip ledge/whole-aperture collision');
 assert.equal(r.w.respawns,0);
}));
contract('native low alignment rejects a small floor raise outside the actual white bounds',()=>run('safety-small-floor-raise-white-bounds',safetyFixture(.05,'white-bounds'),r=>{
 const floor=r.w.solids.find(s=>s.id==='supported-flat-floor');assert.ok(floor);assert.ok(Math.abs(floor.max.y-.05)<1e-9);
 const white=r.w.surfaces.find(s=>s.id==='north-white');assert.ok(white);assert.equal(white.center.y-white.height/2,0);assert.equal(white.center.y+white.height/2,3.1);
 // Requested centre1.55 initially fits exactly. Clearing the real+.05 floor
 // would raise the top to3.15, outside the authored white, and must be rejected.
 r.place(0,'north-white',V(0,1.55,-7.985),false);assert.equal(r.w.portals[0],undefined);assert.equal(r.w.respawns,0);
}));
