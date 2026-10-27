/** Native diagnostic only. Real draft spawn/cargo, machine APIs; no body or result assignments. */
import {mkdirSync,writeFileSync} from 'node:fs';
import {Vector3} from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {CoreWorld} from '../../src/core/world';
import {draftSequenceLevels} from '../../src/core/levels/sequences';
export type ReceiverVariant='baseline'|'flush';
const idle={forward:0,strafe:0,jump:false};
export function runBeltLab(number:13|15,variant:ReceiverVariant){
 const base=draftSequenceLevels.find(l=>l.number===number)!;if(!base)throw Error('Missing authored sequence '+number);
 const blueprint=base.blueprint();if(variant==='flush')for(const pad of blueprint.pads.filter(p=>p.id.endsWith('-receiver')))pad.position[1]=0;
 const w=new CoreWorld(number,undefined,variant==='flush'?{...base,blueprint:()=>blueprint}:base),cargo=w.crates.find(c=>c.id==='cargo')!,belt=w.machines.devices.find(d=>d.spec.kind==='conveyor')!;
 const pads=new Map<number,string>();w.physics.forEachCollider(c=>{if(c.shapeType()!==RAPIER.ShapeType.Cylinder)return;const p=c.translation();for(const pad of w.pads)if(Math.abs(p.x-pad.pos.x)<1e-5&&Math.abs(p.y-(pad.pos.y-.07))<1e-5&&Math.abs(p.z-pad.pos.z)<1e-5)pads.set(c.handle,pad.id);});
 const identify=(c:RAPIER.Collider)=>w.fixed.get(c.handle)?.id??[...w.doors].find(([,b])=>b.collider.handle===c.handle)?.[0]??pads.get(c.handle)??(c.handle===cargo.collider.handle?'cargo':'body');
 let firstPadContact:any,firstDriveLoss:any,maxUnrotatedGap=-Infinity,maxOrientedGap=-Infinity,previousDrive=false;
 const samples:any[]=[],stages:any[]=[];
 function contacts(){const pairs:any[]=[];w.physics.contactPairsWith(cargo.collider,other=>{const manifolds:any[]=[];w.physics.contactPair(cargo.collider,other,(m,flipped)=>{manifolds.push({flipped,normal:{...m.normal()},localNormal1:{...m.localNormal1()},localNormal2:{...m.localNormal2()},friction:m.friction(),contacts:Array.from({length:m.numContacts()},(_,i)=>({distance:m.contactDist(i),impulse:m.contactImpulse(i),point1:m.localContactPoint1(i),point2:m.localContactPoint2(i)})),solverContacts:Array.from({length:m.numSolverContacts()},(_,i)=>({point:m.solverContactPoint(i),distance:m.solverContactDist(i),tangentVelocity:m.solverContactTangentVelocity(i)}))});});pairs.push({id:identify(other),position:{...other.translation()},shapeType:other.shapeType(),manifolds});});return pairs;}
 function sample(stage:string){
  const extent=[new Vector3(1,0,0),new Vector3(0,1,0),new Vector3(0,0,1)].reduce((sum,a,i)=>sum+Math.abs(a.applyQuaternion(cargo.rotation).y)*[cargo.half.x,cargo.half.y,cargo.half.z][i],0),top=belt.position.y+belt.spec.size[1]/2,unrotatedGap=cargo.pos.y-cargo.half.y-top,orientedGap=cargo.pos.y-extent-top,drive=w.machines.conveyorVelocity(cargo),sign=w.machines.flag('reverse')?-1:1;
  const hit=w.physics.castRayAndGetNormal(new RAPIER.Ray({x:cargo.pos.x,y:top+.035,z:cargo.pos.z},{x:sign,y:0,z:0}),18,true,undefined,undefined,cargo.collider);
  return{stage,time:w.time,cargo:cargo.pos.toArray(),nativeCargo:{...cargo.rigid.translation()},velocity:cargo.vel.toArray(),rotation:cargo.rotation.toArray(),extent,lowerY:cargo.pos.y-extent,beltTop:top,unrotatedGap,orientedGap,grounded:cargo.grounded,drive:drive.toArray(),driveConditions:{powered:belt.on,held:!!cargo.held,insideX:Math.abs(cargo.pos.x-belt.position.x)<belt.spec.size[0]/2,insideZ:Math.abs(cargo.pos.z-belt.position.z)<belt.spec.size[2]/2,unrotatedGapWithinCurrentTolerance:Math.abs(unrotatedGap)<.12},lowForwardRay:{height:top+.035,sign,hit:hit?{id:identify(hit.collider),distance:hit.timeOfImpact,normal:hit.normal}:null},contacts:contacts(),pads:w.snapshot().pads,doors:w.machines.snapshot().filter(d=>d.kind==='shutter')};
 }
 function tick(seconds:number,stage:string){for(let i=0;i<Math.ceil(seconds*120);i++){
  w.step(1/120,idle);
  if(!belt.on)continue;
  const top=belt.position.y+belt.spec.size[1]/2,unrotatedGap=cargo.pos.y-cargo.half.y-top,extent=[new Vector3(1,0,0),new Vector3(0,1,0),new Vector3(0,0,1)].reduce((sum,a,j)=>sum+Math.abs(a.applyQuaternion(cargo.rotation).y)*[cargo.half.x,cargo.half.y,cargo.half.z][j],0),drive=w.machines.conveyorVelocity(cargo).lengthSq()>0;
  maxUnrotatedGap=Math.max(maxUnrotatedGap,unrotatedGap);maxOrientedGap=Math.max(maxOrientedGap,cargo.pos.y-extent-top);
  if(!firstPadContact&&Math.abs(cargo.pos.x)>5){const pairs=contacts();if(pairs.some(p=>p.id.endsWith('-receiver')&&p.manifolds.some((m:any)=>m.contacts.length)))firstPadContact=sample(stage+' first native pad manifold (may be predictive)');}
  if(!firstDriveLoss&&previousDrive&&!drive&&Math.abs(cargo.pos.x)>5)firstDriveLoss=sample(stage+' first conveyor drive loss');
  previousDrive=drive;
 }}
 function waitFor(id:string,stage:string){for(let i=0;i<120;i++){tick(.5,stage);if(i%10===0)samples.push(sample(stage));if(w.pads.find(p=>p.id===id)?.crateId==='cargo'){tick(1,stage+' settle');const state=sample(stage+' arrived');stages.push({stage,arrived:true,state});return true;}}stages.push({stage,arrived:false,state:sample(stage+' timeout')});return false;}
 function maintain(id:string,stage:string){let pressedFrames=0;const missing:any[]=[];for(let i=0;i<240;i++){tick(1/120,stage);if(w.pads.find(p=>p.id===id)?.crateId==='cargo')pressedFrames++;else if(missing.length<3)missing.push({frame:i,time:w.time,cargo:cargo.pos.toArray()});}return{allFrames:pressedFrames===240,pressedFrames,totalFrames:240,firstMissing:missing};}
 const report:any={number,variant,pureAuthoredDefinition:variant!=='flush'&&w.level.blueprint===base.blueprint,scope:'Native machinery diagnosis of actual authored geometry/spawn/cargo. Machine APIs isolate transport; no body, velocity, portal, completion or save assignments. Flush candidate changes receiving-pad authored Y only, never the support tolerance.',geometry:{belt:{position:belt.position.toArray(),size:belt.spec.size,speed:belt.spec.speed},pads:w.blueprint.pads.map(p=>({id:p.id,position:p.position,physicalCylinder:{radius:.96,halfHeight:.07,centreY:p.position[1]-.07,top:p.position[1]}}))},samples,stages};
 try{
  tick(.8,'initial');samples.push(sample('initial'));report.powerSelected=w.machines.interact('belt-power');
  if(waitFor('east-receiver','east')){report.eastPressure=maintain('east-receiver','east maintained');report.eastMaintained=report.eastPressure.allFrames;samples.push(sample('east maintained'));w.machines.interact('belt-power');tick(.8,'stopped east');samples.push(sample('stopped east'));report.reverseSelected=w.machines.interact('reverse');w.machines.interact('belt-power');if(waitFor('west-receiver','west after reversal')){report.westPressure=maintain('west-receiver','west maintained');report.westMaintained=report.westPressure.allFrames;}report.oldPadReleased=w.pads.find(p=>p.id==='east-receiver')?.pressed===false;}
  report.end=sample('end');report.respawns=w.respawns;report.result=w.campaignResult??null;report.maxUnrotatedGap=maxUnrotatedGap;report.maxOrientedGap=maxOrientedGap;report.firstPadContact=firstPadContact??null;report.firstDriveLoss=firstDriveLoss??null;
  return report;
 }finally{const dir=new URL('./belt-receivers/'+(process.env.RIFT_BELT_RUN??'first-run')+'/',import.meta.url);mkdirSync(dir,{recursive:true});writeFileSync(new URL(number+'-'+variant+'.json',dir),JSON.stringify(report,null,2)+'\n');w.dispose();}
}
