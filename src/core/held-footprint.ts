/** Read-only support geometry for a held body's present pose, never a drop prediction. */
import RAPIER from '@dimforge/rapier3d-compat';
import {Quaternion,Vector3} from 'three';
import type {Portal} from '../physics';
export interface HeldFootprint {cubeId:string;supportId:string;point:Vector3;normal:Vector3;polygon:Vector3[];height:number}
interface CargoPose {id:string;pos:Vector3;half:Vector3;rotation:Quaternion;collider:RAPIER.Collider}
type P2={x:number;z:number};
const turn=(a:P2,b:P2,c:P2)=>(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);
function hull(points:P2[]):P2[]{
 const p=[...new Map(points.map(v=>[v.x.toFixed(7)+':'+v.z.toFixed(7),v])).values()].sort((a,b)=>a.x-b.x||a.z-b.z);
 if(p.length<3)return[];const lower:P2[]=[],upper:P2[]=[];
 for(const v of p){while(lower.length>1&&turn(lower.at(-2)!,lower.at(-1)!,v)<=0)lower.pop();lower.push(v);}
 for(const v of [...p].reverse()){while(upper.length>1&&turn(upper.at(-2)!,upper.at(-1)!,v)<=0)upper.pop();upper.push(v);}
 return lower.slice(0,-1).concat(upper.slice(0,-1));
}
function clip(subject:P2[],boundary:P2[]):P2[]{
 let out=subject;
 for(let i=0;i<boundary.length&&out.length;i++){
  const a=boundary[i],b=boundary[(i+1)%boundary.length],input=out;out=[];
  for(let j=0;j<input.length;j++){
   const s=input[j],e=input[(j+1)%input.length],ds=turn(a,b,s),de=turn(a,b,e),insideS=ds>=-1e-7,insideE=de>=-1e-7;
   if(insideS!==insideE){const t=ds/(ds-de);out.push({x:s.x+(e.x-s.x)*t,z:s.z+(e.z-s.z)*t});}
   if(insideE)out.push(e);
  }
 }
 return out;
}
function supportBoundary(collider:RAPIER.Collider,normal:Vector3):P2[]{
 const shape=collider.shape,q=new Quaternion().copy(collider.rotation()),origin=new Vector3().copy(collider.translation()),points:Vector3[]=[];
 if(shape instanceof RAPIER.Cuboid){
  const axes=[new Vector3(1,0,0),new Vector3(0,1,0),new Vector3(0,0,1)],half=shape.halfExtents;
  const index=axes.map(a=>Math.abs(a.clone().applyQuaternion(q).dot(normal))).indexOf(Math.max(...axes.map(a=>Math.abs(a.clone().applyQuaternion(q).dot(normal)))));
  const sign=Math.sign(axes[index].clone().applyQuaternion(q).dot(normal)),others=[0,1,2].filter(i=>i!==index),h=[half.x,half.y,half.z];
  for(const u of[-1,1])for(const v of[-1,1]){const p=new Vector3().addScaledVector(axes[index],sign*h[index]).addScaledVector(axes[others[0]],u*Math.max(0,h[others[0]]-.012)).addScaledVector(axes[others[1]],v*Math.max(0,h[others[1]]-.012));points.push(p.applyQuaternion(q).add(origin));}
 }else if(shape instanceof RAPIER.Cylinder){
  const up=new Vector3(0,1,0).applyQuaternion(q);if(Math.abs(up.dot(normal))<.99)return[];const sign=Math.sign(up.dot(normal));
  for(let i=0;i<40;i++){const angle=i/40*Math.PI*2;points.push(new Vector3(Math.cos(angle)*Math.max(0,shape.radius-.012),sign*shape.halfHeight,Math.sin(angle)*Math.max(0,shape.radius-.012)).applyQuaternion(q).add(origin));}
 }else return[];
 return hull(points);
}
export function queryHeldFootprint(physics:RAPIER.World,cube:CargoPose,portals:readonly(Portal|undefined)[],identify:(c:RAPIER.Collider)=>string):HeldFootprint|null{
 const corners:Vector3[]=[];
 for(const x of[-1,1])for(const y of[-1,1])for(const z of[-1,1])corners.push(new Vector3(x*cube.half.x,y*cube.half.y,z*cube.half.z).applyQuaternion(cube.rotation).add(cube.pos));
 const connected=portals.length===2&&portals.every(Boolean),active=connected?portals.filter((p):p is Portal=>!!p):[];
 // Partial portal render fragments do not represent two independently supported cargo bodies.
 for(const p of active){const inverse=p.matrix.clone().invert(),local=corners.map(c=>c.clone().applyMatrix4(inverse)),rx=Math.abs(p.normal.y)>.8?1.15:.9,ry=Math.abs(p.normal.y)>.8?1.15:1.55;
  if(Math.min(...local.map(c=>c.z))<.04&&Math.max(...local.map(c=>c.z))>-.04&&Math.min(...local.map(c=>c.x))<rx&&Math.max(...local.map(c=>c.x))>-rx&&Math.min(...local.map(c=>c.y))<ry&&Math.max(...local.map(c=>c.y))>-ry)return null;
 }
 const top=Math.max(...corners.map(c=>c.y))+.02,bottom=Math.min(...corners.map(c=>c.y)),down=new Vector3(0,-1,0),cast=(x:number,z:number)=>physics.castRayAndGetNormal(new RAPIER.Ray({x,y:top,z},down),top-bottom+2.05,true,undefined,undefined,cube.collider,undefined,c=>!c.isSensor());
 const hit=cast(cube.pos.x,cube.pos.z);if(!hit||hit.normal.y<.97)return null;
 const point=new Vector3(cube.pos.x,top-hit.timeOfImpact,cube.pos.z),normal=new Vector3().copy(hit.normal).normalize(),height=bottom-point.y;
 if(height<-.035||height>2)return null;
 const boundary=supportBoundary(hit.collider,normal);if(boundary.length<3)return null;
 const clipped=clip(hull(corners),boundary);if(clipped.length<3)return null;
 const polygon=clipped.map(p=>new Vector3(p.x,point.y-(normal.x*(p.x-point.x)+normal.z*(p.z-point.z))/normal.y,p.z));
 // A floor aperture cannot honestly be presented as a local landing. Suppress even partial overlap.
 for(const p of active.filter(p=>Math.abs(p.normal.y)>.9&&p.center.y<=top&&p.center.y>=point.y-.02)){
  const local=polygon.map(v=>v.clone().applyMatrix4(p.matrix.clone().invert()));
  if(Math.min(...local.map(v=>v.x))<1.15&&Math.max(...local.map(v=>v.x))>-1.15&&Math.min(...local.map(v=>v.y))<1.15&&Math.max(...local.map(v=>v.y))>-1.15)return null;
 }
 // First-obstruction samples must agree with the selected support; never paint through another body.
 const centre=polygon.reduce((v,p)=>v.add(p),new Vector3()).multiplyScalar(1/polygon.length);
 for(const sample of[centre,...polygon.map(p=>p.clone().lerp(centre,.025))]){const check=cast(sample.x,sample.z);if(!check||check.collider.handle!==hit.collider.handle||check.normal.y<.97||Math.abs(top-check.timeOfImpact-sample.y)>.025)return null;}
 return{cubeId:cube.id,supportId:identify(hit.collider),point,normal,polygon,height:Math.max(0,height)};
}
