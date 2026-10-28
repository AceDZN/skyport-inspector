/** Read-only observations of native rigid-body poses, never actuator commands. */
import {Vector3} from 'three';
import type {DeviceSpec} from '../systems';
type Point={x:number;y:number;z:number};
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
export function observeLeaf(spec:DeviceSpec,position:Point,velocity:Point){
 const base=new Vector3(...spec.position),target=new Vector3(...(spec.target??[spec.position[0],spec.position[1]+spec.size[1]+.3,spec.position[2]]));
 const stopped=Math.hypot(velocity.x,velocity.y,velocity.z)<=1e-5;
 const displacement=new Vector3(position.x,position.y,position.z).sub(base);
 // A translated box vacates its original doorway when one separating axis
 // exceeds that leaf's full extent. A selected target is never a pose.
 const clear=([displacement.x,displacement.y,displacement.z] as const).some((value,axis)=>Math.abs(value)>=spec.size[axis]+.015);
 return {closed:stopped&&distance(position,base)<.015,open:stopped&&clear&&distance(position,target)<.015,clear,stopped};
}
export function observeDock(spec:DeviceSpec,position:Point,velocity:Point){
 if(Math.hypot(velocity.x,velocity.y,velocity.z)>1e-5)return undefined;
 return spec.stops?.find(stop=>distance(position,new Vector3(...stop.position))<.015)?.label;
}
