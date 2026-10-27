/** Focused authored-coordinate probes; API placement is explicitly NOT normal-input completion evidence. */
import assert from 'node:assert/strict';
import{CoreWorld,initializePhysics}from'../../../src/core/world';
import{earlyLevels,draftEarlyLevels}from'../../../src/core/levels/early';
import{V}from'../../../src/physics';
import{Ray,Box3}from'three';
await initializePhysics();
const rows=[];
for(const level of[...earlyLevels,...draftEarlyLevels]){
 const w=new CoreWorld(level.number,()=>{},level);
 try{
  for(let i=0;i<120;i++)w.step(1/120,{forward:0,strafe:0,jump:false});
  assert(w.player.grounded,'Spawn does not settle on a real floor');assert(w.player.pos.distanceTo(w.spawn)<.1,'Spawn moved or fell');
  const points=level.number===3?[['west-ceramic',[-7.985,1.55,6]],['east-ceramic',[7.985,1.55,6]]]:level.number===4?[['source-west',[-7.985,1.55,6]],['remote-north',[-4,1.55,-11.985]]]:[['source-south',[4,1.55,13.985]],['low-north',[-5,1.55,-11.985]],['high-north',[5,4.95,-11.985]]];
  for(const[id,p]of points as[string,[number,number,number]][]){w.portals=[undefined,undefined];assert(w.place(0,id,V(...p)),'Named route portal does not fit '+id);}
  const blocked=(a:[number,number,number],b:[number,number,number])=>{const from=V(...a),delta=V(...b).sub(from),distance=delta.length(),ray=new Ray(from,delta.normalize());return w.activeSolids().filter(s=>{const hit=ray.intersectBox(new Box3(s.min,s.max),V());return hit&&hit.distanceTo(from)<distance-.05;}).map(s=>s.id);};
  const observations:Record<string,unknown>={};
  if(level.number===4){
   const before=blocked([-4,1.52,2],[-4,1.55,-11.985]);assert(before.includes('access-door'),'Opaque closed access door does not block the actual remote aim');
   for(let i=0;i<1000;i++){const dx=-4-w.player.pos.x,dz=2-w.player.pos.z;if(Math.hypot(dx,dz)<.15)break;w.yaw=Math.atan2(-dx,-dz);w.step(1/120,{forward:1,strafe:0,jump:false});}
   for(let i=0;i<120;i++)w.step(1/120,{forward:0,strafe:0,jump:false});
   assert(w.pads[0].pressed,'Normal physical walk does not press maintenance button');assert(w.machines.devices.every(d=>d.progress>.99),'Button does not actually open both shutters');
   const after=blocked(w.eye().toArray() as[number,number,number],[-4,1.55,-11.985]);assert.equal(after.length,0,'Raised access still occludes remote aiming');observations.closedAimBlockedBy=before;observations.playerPressureOpensBoth=true;observations.openAimBlockedBy=after;
  }
  if(level.number===5){const back=blocked([4,1.515,13.35],[5,4.95,-11.985]);assert.equal(back.length,0,'Rear source aim does not actually clear the gallery');observations.highRearAimBlockedBy=back;}
  rows.push({number:level.number,spawnGrounded:w.player.grounded,portalPoints:points,...observations,normalRoute:'UNPLAYED: unit coordinate fit / focused physical probe only'});
 }finally{w.dispose();}
}
console.log(JSON.stringify({status:'Authored fixture spawn/portal fit PASS; not completion evidence',rows},null,2));
