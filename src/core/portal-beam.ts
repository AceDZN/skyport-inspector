/** Stateless optical transport. Runtime collision queries are supplied by CoreWorld. */
export type Vec3 = readonly [number, number, number];
export interface BeamPortal {
  id: string; linkedTo?: string; center: Vec3; normal: Vec3; up: Vec3;
  /** Match the actual rendered aperture. Wall default: .88 × 1.53 m radii. */
  radii?: readonly [number, number];
}
export interface BeamReceiver { id: string; center: Vec3; radius: number }
export interface BeamObstacle { id: string; distance: number }
export interface BeamSegment { from: Vec3; to: Vec3; portal?: string }
export interface BeamResult {
  segments: BeamSegment[]; receiver?: string; obstacle?: string;
  stop: 'receiver' | 'obstacle' | 'range' | 'portal-limit'; hops: number;
}
export interface BeamInput {
  origin: Vec3; direction: Vec3; maxDistance: number;
  portals: readonly BeamPortal[]; receivers: readonly BeamReceiver[];
  /** Query real world collisions, including portal host walls and dynamic cubes.
   * The callback must return the nearest hit in this segment, measured in metres.
   * The portal aperture plane sits just ahead of its host wall as in the core. */
  castObstacle(origin: Vec3, unitDirection: Vec3, maxDistance: number): BeamObstacle | undefined;
  maxHops?: number; epsilon?: number;
}
const add=(a:Vec3,b:Vec3):Vec3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a:Vec3,b:Vec3):Vec3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul=(a:Vec3,n:number):Vec3=>[a[0]*n,a[1]*n,a[2]*n];
const dot=(a:Vec3,b:Vec3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function unit(v:Vec3):Vec3 { const n=Math.hypot(...v);if(!Number.isFinite(n)||n<1e-10)throw Error('Beam direction and portal basis must be finite and nonzero');return mul(v,1/n); }
function basis(p:BeamPortal){const normal=unit(p.normal),right=unit(cross(p.up,normal)),up=unit(cross(normal,right));return{normal,right,up};}
function rotate(v:Vec3,entry:BeamPortal,exit:BeamPortal):Vec3 {
  const a=basis(entry),b=basis(exit);
  // Local half-turn around up, then destination basis: exit * Ry(pi) * inverse(entry).
  return add(add(mul(b.right,-dot(v,a.right)),mul(b.up,dot(v,a.up))),mul(b.normal,-dot(v,a.normal)));
}
function portalHit(origin:Vec3,direction:Vec3,p:BeamPortal,epsilon:number){
  const b=basis(p),approach=dot(direction,b.normal);if(approach>=-1e-9)return undefined;
  const distance=dot(sub(p.center,origin),b.normal)/approach;if(distance<epsilon)return undefined;
  const local=sub(add(origin,mul(direction,distance)),p.center),r=p.radii??[.88,1.53];
  if(r.some(n=>!Number.isFinite(n)||n<=0))throw Error('Portal radii must be positive');
  return (dot(local,b.right)/r[0])**2+(dot(local,b.up)/r[1])**2<=1+1e-9?distance:undefined;
}
function receiverHit(origin:Vec3,direction:Vec3,r:BeamReceiver){
  if(!Number.isFinite(r.radius)||r.radius<=0)throw Error('Receiver radius must be positive');
  const delta=sub(origin,r.center),b=dot(delta,direction),c=dot(delta,delta)-r.radius*r.radius;
  if(c<=0)return 0;const d=b*b-c;if(d<0)return undefined;const t=-b-Math.sqrt(d);return t>=0?t:undefined;
}
export function tracePortalBeam(input:BeamInput):BeamResult {
  if(!Number.isFinite(input.maxDistance)||input.maxDistance<0)throw Error('Beam distance must be finite and nonnegative');
  const maxHops=input.maxHops??8,epsilon=input.epsilon??.001;
  if(!Number.isInteger(maxHops)||maxHops<0||maxHops>64||!Number.isFinite(epsilon)||epsilon<=0)throw Error('Invalid beam traversal limits');
  if(input.origin.some(n=>!Number.isFinite(n)))throw Error('Beam origin must be finite');
  const portals=new Map(input.portals.map(p=>[p.id,p]));if(portals.size!==input.portals.length)throw Error('Portal ids must be unique');
  for(const p of input.portals){if(p.center.some(n=>!Number.isFinite(n)))throw Error('Portal center must be finite');basis(p);}
  for(const r of input.receivers)if(r.center.some(n=>!Number.isFinite(n)))throw Error('Receiver center must be finite');
  let origin:Vec3=[...input.origin],direction=unit(input.direction),remaining=input.maxDistance,hops=0;
  const segments:BeamSegment[]=[];
  for(;;){
    let hit:{distance:number;kind:'range'|'portal'|'receiver'|'obstacle';id?:string}={distance:remaining,kind:'range'};
    const obstacle=input.castObstacle(origin,direction,remaining);
    if(obstacle){if(!Number.isFinite(obstacle.distance)||obstacle.distance<0)throw Error('Obstacle cast returned an invalid distance');if(obstacle.distance<=remaining)hit={distance:obstacle.distance,kind:'obstacle',id:obstacle.id};}
    for(const p of input.portals){
      if(!p.linkedTo||p.linkedTo===p.id||!portals.has(p.linkedTo))continue;
      const distance=portalHit(origin,direction,p,epsilon);
      if(distance!==undefined&&distance<=hit.distance+1e-8)hit={distance,kind:'portal',id:p.id};
    }
    for(const r of input.receivers){const distance=receiverHit(origin,direction,r);if(distance!==undefined&&(distance<hit.distance-1e-8||(hit.kind==='range'&&distance<=hit.distance)))hit={distance,kind:'receiver',id:r.id};}
    const end=add(origin,mul(direction,hit.distance));segments.push({from:origin,to:end,...(hit.kind==='portal'?{portal:hit.id}:{})});remaining=Math.max(0,remaining-hit.distance);
    if(hit.kind==='range')return{segments,stop:'range',hops};
    if(hit.kind==='obstacle')return{segments,stop:'obstacle',obstacle:hit.id,hops};
    if(hit.kind==='receiver')return{segments,stop:'receiver',receiver:hit.id,hops};
    if(hops>=maxHops)return{segments,stop:'portal-limit',hops};
    const entry=portals.get(hit.id!)!,exit=portals.get(entry.linkedTo!)!;
    const destination=add(exit.center,rotate(sub(end,entry.center),entry,exit));direction=unit(rotate(direction,entry,exit));
    const step=Math.min(epsilon,remaining);origin=add(destination,mul(direction,step));remaining-=step;hops++;
  }
}
