import {Box3,Vector3} from 'three';
import {poseMatrix,type Solid,type Surface} from '../physics';

const halfWidth=.9,halfHeight=1.55;
/** Align a low upright opening to its real walking floor, never the actor. */
export function alignWallPortalToFloor(surface:Surface,desired:Vector3,solids:Solid[]):Vector3 {
 const alongX=Math.abs(Math.abs(surface.normal.x)-1)<.00001&&Math.abs(surface.normal.z)<.00001;
 const alongZ=Math.abs(Math.abs(surface.normal.z)-1)<.00001&&Math.abs(surface.normal.x)<.00001;
 if(surface.floor||Math.abs(surface.normal.y)>.00001||surface.up.y<.99999||
  Math.abs(surface.up.x)>.00001||Math.abs(surface.up.z)>.00001||(!alongX&&!alongZ))return desired;
 const tangent=alongX?'z':'x',normal=alongX?'x':'z';
 const direction=surface.normal[normal];
 const near=desired[normal]+direction*.025,far=desired[normal]+direction*.65;
 const inverse=poseMatrix(surface.center,surface.normal,surface.up).invert();
 const floors=solids.filter(s=>s.kind==='floor');
 const touchesOpening=(floor:Solid,center:Vector3)=>
  center[tangent]+halfWidth>floor.min[tangent]&&center[tangent]-halfWidth<floor.max[tangent]&&
  center[normal]>=floor.min[normal]-.06&&center[normal]<=floor.max[normal]+.06;
 const supports=floors.filter(floor=>{
  const gap=desired.y-halfHeight-floor.max.y;
  return gap>=-.01&&gap<=.400001&&
   floor.min[tangent]<=desired[tangent]-.30&&floor.max[tangent]>=desired[tangent]+.30&&
   floor.min[normal]<=Math.min(near,far)&&floor.max[normal]>=Math.max(near,far);
 }).sort((a,b)=>b.max.y-a.max.y);
 for(const floor of supports){
  const center=desired.clone();center.y=floor.max.y+halfHeight;
  const local=center.clone().applyMatrix4(inverse);
  if(Math.abs(local.x)>surface.width/2-halfWidth+.000001||Math.abs(local.y)>surface.height/2-halfHeight+.000001)continue;
  if(floors.some(f=>touchesOpening(f,center)&&center.y-halfHeight<f.max.y-.01&&center.y+halfHeight>f.min.y))continue;
  const half=new Vector3(alongX?.07:halfWidth,halfHeight,alongX?halfWidth:.07);
  const opening=new Box3(center.clone().sub(half),center.clone().add(half));
  if(solids.some(s=>s.id!==surface.solidId&&(s.kind==='wall'||s.kind==='glass')&&opening.intersectsBox(new Box3(s.min,s.max))))continue;
  return center;
 }
 return desired;
}
