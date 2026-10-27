/** Static/idle fixture probe only. This does not complete any campaign level or constitute UI play evidence. */
import fs from 'node:fs';
import {Ray,Vector3,Box3} from 'three';
import {CampaignWorld} from '../../src/campaign-world';
import type {CatalogueRow} from '../../src/campaign-types';
const rows=JSON.parse(fs.readFileSync('src/data/campaign.json','utf8')).rows as CatalogueRow[];
const worlds=JSON.parse(fs.readFileSync('src/data/worlds-upper.json','utf8')).worlds;
const report:any={status:'Static geometry and idle runtime probes; no played wins',levels:[]};
for(const raw of worlds){
 const w=new CampaignWorld(rows[raw.number-1]);
 const rays=w.machines.devices.filter(d=>d.spec.kind==='relay').flatMap(d=>(d.spec.receivers??[]).map(r=>{
  const end=new Vector3(...r.position),dir=end.clone().sub(d.position),distance=dir.length(),ray=new Ray(d.position.clone(),dir.normalize());
  const hits=w.solids.filter(s=>s.kind==='wall').filter(s=>{const hit=ray.intersectBox(new Box3(s.min,s.max),new Vector3());return hit&&hit.distanceTo(d.position)>.15&&hit.distanceTo(d.position)<distance-.15;}).map(s=>s.id);
  return {emitter:d.spec.id,receiver:r.id,permanentWallHits:hits};
 }));
 for(let i=0;i<30;i++)w.step(1/120,{forward:0,strafe:0,jump:false});
 const initial=w.machines.snapshot().filter(d=>d.kind==='relay');
 const cargo=w.crates.map(c=>({id:c.id,initial:raw.cargo.find((x:any)=>x.spec.id===c.id).position,afterQuarterSecond:c.pos.toArray(),grounded:c.grounded}));
 if(raw.number===43||raw.number===48)for(let i=30;i<960;i++)w.step(1/120,{forward:0,strafe:0,jump:false});
 const history=raw.history?{facts:w.ledger.filter(e=>e.key.startsWith('actor:')).map(e=>e.key),cargo:w.crates.map(c=>({id:c.id,pos:c.pos.toArray(),grounded:c.grounded}))}:undefined;
 report.levels.push({number:raw.number,rays,initial,cargo,history});
}
const targetRows=worlds.filter((w:any)=>rows[w.number-1].normalizedGoal.cargo?.length===1&&w.cargo.length>1).map((w:any)=>{
 const id=rows[w.number-1].normalizedGoal.cargo![0].id,c=w.cargo.find((c:any)=>c.spec.id===id),xs=w.cargo.map((c:any)=>c.position[0]),dist=(p:number[])=>Math.hypot(...p.map((x,i)=>x-w.spawn[i]));
 return {number:w.number,id,side:c.position[0]===Math.min(...xs)?'left':c.position[0]===Math.max(...xs)?'right':'middle',inventory:w.cargo.indexOf(c)+1,nearest:w.cargo.every((q:any)=>dist(q.position)>=dist(c.position)-.001)};
});
report.candidateBalance={rows:targetRows,sides:Object.fromEntries(['left','middle','right'].map(s=>[s,targetRows.filter((x:any)=>x.side===s).length])),inventory:Object.fromEntries([1,2,3].map(s=>[s,targetRows.filter((x:any)=>x.inventory===s).length])),nearest:targetRows.filter((x:any)=>x.nearest).length,total:targetRows.length};
fs.writeFileSync('docs/campaign-art/UPPER_STATIC_PROBE.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({raysWithPermanentWalls:report.levels.flatMap((l:any)=>l.rays.filter((r:any)=>r.permanentWallHits.length).map((r:any)=>({number:l.number,...r}))),balance:report.candidateBalance,history:report.levels.filter((l:any)=>l.history).map((l:any)=>({number:l.number,history:l.history}))},null,2));
