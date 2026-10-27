/** Original enclosed chamber art and rigid handheld instrument. Collision/state belong to ChamberWorld. */
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {RiftScene} from './scene';
import {poseMatrix,portalMatrix,V,type RiftWorld} from './physics';
import type {CoreWorld} from './core/world';
import {PortalRenderer} from './core/portal-renderer';
/** Read adapter only: the Rapier core owns physics; RiftScene receives its existing render shape. */
export type ChamberSceneWorld=CoreWorld;
import type {DeviceState} from './systems';

type Batch={geometry:T.BufferGeometry;material:T.Material;matrices:T.Matrix4[]};
type DoorArt={state:DeviceState;leaf:T.Group;indicators:T.MeshStandardMaterial[];inputs:{id:string;lamp:T.MeshStandardMaterial}[]};
type CratePieces={source:T.Material[];copies:{group:T.Group;materials:T.Material[]}[]};
type ButtonArt={top:T.Mesh;lights:T.MeshStandardMaterial;restY:number};
type MachineDisplay={canvas:HTMLCanvasElement;texture:T.CanvasTexture;key:string;title:string};
type BeltArt={canvas:HTMLCanvasElement;texture:T.CanvasTexture;direction:T.Vector3;reversed:boolean;lastTime:number;rollers:T.Mesh[];radius:number};
type MachineArt={state:DeviceState;body:T.Group;display:MachineDisplay;lever?:T.Group;lamp:T.MeshStandardMaterial;belt?:BeltArt};
type OpticalLamp={id:string;kind:'emitter'|'receiver';material:T.MeshStandardMaterial};
type BeamArt={core:T.Mesh;halo:T.Mesh;impact:T.Mesh};

export class ChamberScene extends RiftScene {
 declare world:RiftWorld;
 private get core(){return this.world as unknown as CoreWorld;}
 declare private ownedGeometries:Set<T.BufferGeometry>;
 declare private ownedMaterials:Set<T.Material>;
 declare private ownedTextures:Set<T.Texture>;
 declare private batches:Map<string,Batch>;
 declare private finishes:Record<string,T.MeshStandardMaterial>;
 declare private doors:DoorArt[];
 declare private cratePieces:Map<string,CratePieces>;
 declare private buttons:Map<string,ButtonArt>;
 declare private circuitTraces:{material:T.MeshStandardMaterial;pad:string}[];
 declare private nativeMachines:MachineArt[];
 declare private opticalLamps:OpticalLamp[];
 declare private beamPieces:BeamArt[];
 declare private beamGeometry:T.CylinderGeometry|undefined;
 declare private beamCoreMaterial:T.MeshBasicMaterial|undefined;
 declare private beamHaloMaterial:T.MeshBasicMaterial|undefined;
 declare private portalLights:T.PointLight[];
 declare private portalRenderer:PortalRenderer|undefined;
 declare private viewScene:T.Scene|undefined;
 declare private viewCamera:T.PerspectiveCamera|undefined;
 declare private instrument:T.Group|undefined;
 declare private emitterCore:T.MeshStandardMaterial|undefined;
 declare private instrumentA:T.MeshStandardMaterial|undefined;
 declare private instrumentB:T.MeshStandardMaterial|undefined;
 declare private lastPortalSignature:string|undefined;
 declare private recoil:number;
 declare private artClock:number;
 declare private pulse:number;
 declare private shotIndex:number;

 constructor(canvas:HTMLCanvasElement,world:ChamberSceneWorld){
  super(canvas,world as unknown as RiftWorld);
  this.artClock=0;this.recoil=0;this.pulse=0;this.shotIndex=0;this.buildInstrument();this.resize();
 }
 private geo<G extends T.BufferGeometry>(g:G):G{this.ownedGeometries.add(g);return g;}
 private material<M extends T.Material>(m:M):M{this.ownedMaterials.add(m);return m;}
 private texture<X extends T.Texture>(t:X):X{this.ownedTextures.add(t);return t;}
 private mesh(g:T.BufferGeometry,m:T.Material,parent:T.Object3D=this.root){const o=new T.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 private rounded(w:number,h:number,d:number,r=.03){return this.geo(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w*.2,h*.2,d*.2)));}
 private part(parent:T.Object3D,p:T.Vector3|number[],s:number[],mat:T.Material,r=.03){const o=this.mesh(this.rounded(s[0],s[1],s[2],r),mat,parent);o.position.copy(Array.isArray(p)?V(...p as [number,number,number]):p);return o;}
 private staticPart(p:number[],s:number[],mat:T.Material,rotation?:T.Euler,round=false){
  const key=mat.uuid+(round?'round':'square');let batch=this.batches.get(key);
  if(!batch){batch={geometry:round?this.geo(new RoundedBoxGeometry(1,1,1,2,.015)):this.geo(new T.BoxGeometry(1,1,1)),material:mat,matrices:[]};this.batches.set(key,batch);}
  const q=new T.Quaternion().setFromEuler(rotation??new T.Euler());batch.matrices.push(new T.Matrix4().compose(V(...p as [number,number,number]),q,V(...s as [number,number,number])));
 }
 private flushBatches(){for(const b of this.batches.values()){const m=new T.InstancedMesh(b.geometry,b.material,b.matrices.length);b.matrices.forEach((v,i)=>m.setMatrixAt(i,v));m.castShadow=true;m.receiveShadow=true;this.root.add(m);this.targets.push(m);}this.batches.clear();}
 private surfaceTextures(floor=false){
  const n=256,base=document.createElement('canvas'),rough=document.createElement('canvas'),normal=document.createElement('canvas');base.width=rough.width=normal.width=n;base.height=rough.height=normal.height=n;
  const b=base.getContext('2d')!,r=rough.getContext('2d')!,h=new Float32Array(n*n);const image=b.createImageData(n,n),ri=r.createImageData(n,n);
  const hash=(x:number,y:number)=>{let a=Math.imul(x+31,y+197)^Math.imul(x+73,1274126177);a^=a>>>13;return((Math.imul(a,1597334677)>>>0)%1024)/1024;};
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const i=y*n+x,noise=hash(x,y)-.5,seam=floor&&(x<2||y<2),dx=(x%16)-8,dy=(y%16)-8,dot=floor&&Math.hypot(dx,dy)<3.25;
   const v=floor?79+noise*7-(seam?15:0)+(dot?3:0):176+noise*8;
   image.data.set([v,v+(floor?4:0),v+(floor?7:-5),255],i*4);ri.data.set([floor?151:182,floor?151:182,floor?151:182,255],i*4);h[i]=(dot?.035:0)+(seam?-.055:0)+noise*(floor?.012:.009);
  }
  b.putImageData(image,0,0);r.putImageData(ri,0,0);const nc=normal.getContext('2d')!,ni=nc.createImageData(n,n);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const at=(a:number,c:number)=>h[((c+n)%n)*n+(a+n)%n],dx=at(x-1,y)-at(x+1,y),dy=at(x,y-1)-at(x,y+1),v=V(dx*3,dy*3,1).normalize();ni.data.set([128+v.x*127,128+v.y*127,128+v.z*127,255],(y*n+x)*4);}nc.putImageData(ni,0,0);
  const make=(c:HTMLCanvasElement,color=false)=>{const t=this.texture(new T.CanvasTexture(c));t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());if(color)t.colorSpace=T.SRGBColorSpace;return t;};
  return{map:make(base,true),roughnessMap:make(rough),normalMap:make(normal)};
 }
 private prepareFinishes(){
  const wall=this.surfaceTextures(),floor=this.surfaceTextures(true);
  this.finishes={
   ceramic:this.material(new T.MeshStandardMaterial({...wall,color:0xffffff,roughness:.78,metalness:.03,normalScale:new T.Vector2(.6,.6)})),
   white:this.material(new T.MeshStandardMaterial({...wall,color:0xe7e8e0,roughness:.62,metalness:.04,normalScale:new T.Vector2(.35,.35)})),
   floor:this.material(new T.MeshStandardMaterial({...floor,color:0xffffff,roughness:.7,metalness:.42,normalScale:new T.Vector2(.8,.8)})),
   graphite:this.material(new T.MeshStandardMaterial({color:0x20262c,roughness:.44,metalness:.72})),
   recess:this.material(new T.MeshStandardMaterial({color:0x10161b,roughness:.8,metalness:.28})),
   aluminum:this.material(new T.MeshStandardMaterial({color:0x77858b,roughness:.31,metalness:.86})),
   rubber:this.material(new T.MeshStandardMaterial({color:0x10151a,roughness:.9,metalness:0})),
   red:this.material(new T.MeshStandardMaterial({color:0x7c2623,roughness:.38,metalness:.2})),
   light:this.material(new T.MeshStandardMaterial({color:0xe9f0ed,emissive:0xd9f0ff,emissiveIntensity:3.4,roughness:.4})),
   warm:this.material(new T.MeshStandardMaterial({color:0xe4bd72,emissive:0xffbe59,emissiveIntensity:1.8,roughness:.4})),
  };
 }
 private floorGeometry(size:T.Vector3,pos:T.Vector3){const g=this.geo(new T.BoxGeometry(size.x,size.y,size.z)),a=g.getAttribute('position'),uv=g.getAttribute('uv'),normal=g.getAttribute('normal');for(let i=0;i<a.count;i++){if(Math.abs(normal.getY(i))>.5)uv.setXY(i,(a.getX(i)+pos.x)/2,(a.getZ(i)+pos.z)/2);else uv.setXY(i,(a.getX(i)+pos.x)/2,(a.getY(i)+pos.y)/2);}return g;}
 private wallCladding(min:T.Vector3,max:T.Vector3,axis:'x'|'z',sign:number){
  const a=axis==='x'?'z':'x',u1=min[a],u2=max[a],y1=min.y,y2=max.y,plane=sign>0?max[axis]:min[axis];
  const regions=this.core.surfaces.filter(s=>!s.floor&&s.normal[axis]===sign&&Math.abs(s.center[axis]-plane)<.15).map(s=>({u1:s.center[a]-s.width/2,u2:s.center[a]+s.width/2,y1:s.center.y-s.height/2,y2:s.center.y+s.height/2})).filter(r=>r.u2>u1&&r.u1<u2&&r.y2>y1&&r.y1<y2);
  const cols=Math.max(1,Math.ceil((u2-u1)/2)),rows=Math.max(1,Math.ceil((y2-y1)/2)),cuts=(base:number[],extra:number[],lo:number,hi:number)=>[...new Set([...base,...extra.filter(v=>v>lo+.001&&v<hi-.001)].map(v=>Math.round(v*1e5)/1e5))].sort((a,b)=>a-b);
  const us=cuts(Array.from({length:cols+1},(_,i)=>u1+(u2-u1)*i/cols),regions.flatMap(r=>[r.u1,r.u2]),u1,u2),ys=cuts(Array.from({length:rows+1},(_,i)=>y1+(y2-y1)*i/rows),regions.flatMap(r=>[r.y1,r.y2]),y1,y2);
  for(let u=0;u<us.length-1;u++)for(let v=0;v<ys.length-1;v++){
   const cw=us[u+1]-us[u],ch=ys[v+1]-ys[v],pu=(us[u]+us[u+1])/2,py=(ys[v]+ys[v+1])/2;if(cw<.005||ch<.005)continue;
   const behindPortal=regions.some(r=>us[u]>=r.u1-.001&&us[u+1]<=r.u2+.001&&ys[v]>=r.y1-.001&&ys[v+1]<=r.y2+.001);
   const ceramic=this.core.level.architecture.style==='ceramic';
   if(!ceramic&&behindPortal)continue;
   const p=axis==='x'?[plane+sign*.015,py,pu]:[pu,py,plane+sign*.015],gap=Math.min(.025,cw*.1,ch*.1),sz=axis==='x'?[.045,ch-gap,cw-gap]:[cw-gap,ch-gap,.045];this.staticPart(p,sz,ceramic&&(this.core.number===1||behindPortal)?this.finishes.ceramic:this.finishes.graphite,undefined,true);
   if(cw>1.2&&ch>1.2){for(const su of[-1,1])for(const sy of[-1,1]){const bolt=axis==='x'?[plane+sign*.042,py+sy*(ch/2-.09),pu+su*(cw/2-.09)]:[pu+su*(cw/2-.09),py+sy*(ch/2-.09),plane+sign*.042];this.staticPart(bolt,axis==='x'?[.009,.022,.022]:[.022,.022,.009],this.finishes.graphite);}}
  }
  // Continuous kick plate and top service channel, in the same physical wall plane.
  for(const [y,h]of[[Math.max(y1+.23,.23),.42],[y2-.25,.45]]){
   if(y<y1||y>y2)continue;if(this.core.number>5&&regions.some(r=>r.y1<y+h/2&&r.y2>y-h/2))continue;const p=axis==='x'?[plane+sign*.04,y,(u1+u2)/2]:[(u1+u2)/2,y,plane+sign*.04];this.staticPart(p,axis==='x'?[.09,h,u2-u1]:[u2-u1,h,.09],this.finishes.graphite);
  }
 }
 private architecture(){
  const f=this.finishes,b=this.core.blueprint,{height,halfWidth:half,style}=this.core.level.architecture;
  for(const s of this.core.solids){const size=s.max.clone().sub(s.min),p=s.min.clone().add(s.max).multiplyScalar(.5);
   if(s.kind==='glass'){const m=this.material(new T.MeshPhysicalMaterial({color:0xc3d3d8,transparent:true,opacity:.10,roughness:.08,metalness:.1,clearcoat:1,envMapIntensity:.75,depthWrite:false,side:T.DoubleSide}));const pane=this.mesh(this.geo(new T.BoxGeometry(size.x,size.y,size.z)),m);pane.position.copy(p);pane.castShadow=false;continue;}
   const ceiling=/ceiling/.test(s.id),raised=s.kind==='floor'&&size.y>1&&s.id!=='raised-cube-alcove',opticalHousing=/emitter-housing|receiver-pillar|receiver-optic-body/.test(s.id),mat=s.kind==='floor'?(raised?f.graphite:f.floor):ceiling?f.recess:f.graphite;const mesh=this.mesh(s.kind==='floor'?this.floorGeometry(size,p):opticalHousing?this.rounded(size.x,size.y,size.z,.035):this.geo(new T.BoxGeometry(size.x,size.y,size.z)),mat);mesh.position.copy(p);mesh.userData.solid=s.id;this.targets.push(mesh);
   if(raised){
    // A raised gallery is built architecture: metal walking surface over a panelled retaining structure.
    for(const axis of['x','z']as const)for(const sign of[-1,1])this.wallCladding(s.min,s.max,axis,sign);
    const topGeometry=this.geo(new T.PlaneGeometry(size.x,size.z)),a=topGeometry.getAttribute('position'),uv=topGeometry.getAttribute('uv');for(let i=0;i<a.count;i++)uv.setXY(i,(a.getX(i)+p.x)/2,(-a.getY(i)+p.z)/2);const top=this.mesh(topGeometry,f.floor);top.rotation.x=-Math.PI/2;top.position.set(p.x,s.max.y+.002,p.z);this.targets.push(top);
    for(const x of[s.min.x+.03,s.max.x-.03])this.staticPart([x,s.max.y+.005,p.z],[.045,.01,size.z-.05],f.aluminum);
    for(const z of[s.min.z+.03,s.max.z-.03])this.staticPart([p.x,s.max.y+.005,z],[size.x-.05,.01,.045],f.aluminum);
    this.staticPart([p.x,s.max.y-.06,s.max.z+.035],[size.x-.15,.025,.022],f.warm);
   }
   if(s.id==='raised-cube-alcove'){this.wallCladding(s.min,s.max,'z',1);this.staticPart([p.x,s.max.y-.04,s.max.z+.04],[size.x,.12,.16],f.graphite);for(const x of[s.min.x+.08,s.max.x-.08])this.staticPart([x,p.y,s.max.z+.055],[.14,size.y,.14],f.graphite);}
   if(/guide/.test(s.id)&&size.y>2&&size.x<1&&size.z<1){this.staticPart([p.x,p.y,s.max.z+.012],[Math.min(.09,size.x*.4),size.y-.1,.025],f.aluminum);for(let y=s.min.y+.3;y<s.max.y;y+=.6)this.staticPart([p.x,y,s.max.z+.028],[Math.min(.16,size.x*.65),.035,.025],f.graphite);}
   if(!ceiling&&s.kind==='wall'&&!s.id.startsWith('vestibule')&&!s.id.includes('service-inlay')){if(size.x<.7&&size.z>.8){this.wallCladding(s.min,s.max,'x',1);this.wallCladding(s.min,s.max,'x',-1);}else if(size.z<.7&&size.x>.8){this.wallCladding(s.min,s.max,'z',1);this.wallCladding(s.min,s.max,'z',-1);}}
  }
  // Ceiling coffers have real depth and recessed perforated service lanes.
  for(let z=-14;z<14;z+=4){for(let x=-half+1;x<half;x+=2){this.staticPart([x,height-.08,z+1],[1.96,.12,3.94],f.graphite,undefined,true);this.staticPart([x,height-.16,z+1],[1.77,.045,3.72],f.recess);}this.staticPart([0,height-.3,z],[half*2,.24,.18],f.graphite);}
  for(const x of[-half+.12,half-.12]){if(this.core.number<=5)this.staticPart([x,height-.42,-1],[.28,.8,30],f.graphite);for(let z=-12;z<=12;z+=4){if(this.core.machines.devices.some(d=>d.spec.kind==='shutter'&&d.spec.size[0]<d.spec.size[2]&&Math.abs(d.spec.position[0]-x)<.5&&Math.abs(d.spec.position[2]-z)<d.spec.size[2]/2+.2))continue;const physical=this.core.solids.some(s=>s.id.startsWith('structural-rib-')&&Math.abs((s.min.x+s.max.x)/2-x)<.05&&Math.abs((s.min.z+s.max.z)/2-z)<.05);if(!physical&&this.core.number>5)continue;if(!physical)this.staticPart([x,height/2,z],[.22,height,.18],f.graphite);this.staticPart([x*.994,height-.86,z],[.035,.13,.7],f.light);}}
  for(const x of[-half*.55,half*.55])for(const z of[-10,-4,3,10]){this.staticPart([x,height-.26,z],[.43,.22,3.4],f.aluminum,undefined,true);this.staticPart([x,height-.39,z],[.25,.035,3.08],f.light);}
  if(this.core.number===1){
   for(const x of[-8,-4,0,4,8])this.staticPart([x,3.5,.015],[.065,7,.16],f.graphite);
   for(const y of[.08,6.93])this.staticPart([0,y,.015],[16,.12,.2],f.aluminum);
   // Restrained etched registration marks establish that the divider is glass without world-space prose.
   for(let x=-7;x<=7;x+=2)for(const sign of[-1,1])this.staticPart([x,.95,sign*.087],[.15,.025,.002],f.white);
   
  }else if(b.solids.some(s=>s.id==='receiving-gallery')){
   
   // Guard rails stop short of the actual high-wall landing corridor, preserving its clear flight envelope.
   for(const z of[1.02])for(const x of[-5.1,5.1]){this.staticPart([x,3.94,z],[3.7,.055,.065],f.aluminum);for(const px of[x-1.8,x+1.8])this.staticPart([px,3.91,z],[.055,1.02,.055],f.graphite);}
   for(const x of[-7.02,7.02])for(const z of[-6,-3,.9])this.staticPart([x,3.94,z],[.055,1.06,.055],f.graphite);
   for(const x of[-7.02,7.02])this.staticPart([x,4.45,-3],[.055,.055,8],f.aluminum);
   this.staticPart([0,3.1,1.04],[14,.58,.11],f.graphite);this.staticPart([0,3.43,1.06],[14,.035,.04],f.warm);
   // Low service lights expose the depth of the enclosed pit.
   for(const x of[-8.88,8.88])for(const z of[-10,-3,4,11]){this.staticPart([x,-5.8,z],[.04,.46,.18],f.warm);}
  }
  // Small inlaid bay number: architectural wayfinding rather than floating labels.
  if(this.core.number>2)this.glassFrames();
  const entryInlay=this.core.solids.find(s=>s.id==='entry-service-inlay');
  if(this.core.number<=2||entryInlay){const plaque=this.label(String(this.core.number).padStart(2,'0'),.5,.4,'#252b30','#bbc4c6',160);plaque.position.set(entryInlay?entryInlay.max.x+.03:-half+.14,entryInlay?1.65:1.55,this.core.number===1?12.95:this.core.number===2?11:0);plaque.rotation.y=Math.PI/2;this.root.add(plaque);}
  for(const mark of b.marks){const sign=this.label(mark.text,mark.width??1,mark.height??.22,'#20292e','#c7d3d6',220),normal=V(...(mark.normal??[0,0,1]));sign.position.set(...mark.position);
   // Door names belong on the front of the retraction pocket; wall-plane signs were occluded by it.
   const door=this.core.machines.devices.find(d=>d.spec.kind==='shutter'&&d.spec.label===mark.text&&Math.hypot(mark.position[0]-d.spec.position[0],mark.position[2]-d.spec.position[2])<1);
   if(door){sign.position.set(...door.spec.position).addScaledVector(normal,.56);sign.position.y=door.spec.position[1]+door.spec.size[1]/2+.53;}
   sign.quaternion.setFromRotationMatrix(poseMatrix(sign.position,normal,V(0,1,0)));this.root.add(sign);}
  for(const s of b.surfaces){const integrated=style==='ceramic'&&!s.floor,visualMaterial=integrated?this.material(new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})):f.white;const face=this.mesh(this.geo(new T.PlaneGeometry(s.width,s.height)),visualMaterial);face.matrix.copy(poseMatrix(s.center.clone().addScaledVector(s.normal,integrated?.05:.008),s.normal,s.up));face.matrix.decompose(face.position,face.quaternion,face.scale);face.userData.surface=s.id;this.targets.unshift(face);
   // Full eligible wall regions are integrated surfaces, not labelled predetermined rectangles.

  }
  this.exitFloorMarks();
 }
 private exitFloorMarks(){
  for(const exit of this.core.blueprint.exits){
   const [x,y,z]=exit.position,[sx,sy,sz]=exit.size;
   const floor=this.core.solids.filter(s=>s.kind==='floor'&&x>=s.min.x&&x<=s.max.x&&z>=s.min.z&&z<=s.max.z&&s.max.y<=y+.1&&s.max.y>=y-sy/2-.3).sort((a,b)=>b.max.y-a.max.y)[0];if(!floor)continue;
   const door=this.core.machines.devices.filter(d=>d.spec.kind==='shutter'&&d.spec.size[1]>2).sort((a,b)=>Math.hypot(a.spec.position[0]-x,a.spec.position[2]-z)-Math.hypot(b.spec.position[0]-x,b.spec.position[2]-z))[0];
   const alongX=door?door.spec.size[0]<door.spec.size[2]:sx>sz,sign=Math.sign((alongX?x:z)-(door?door.spec.position[alongX?0:2]:this.core.spawn[alongX?'x':'z']))||1;
   const minX=Math.max(floor.min.x,x-sx/2),maxX=Math.min(floor.max.x,x+sx/2),minZ=Math.max(floor.min.z,z-sz/2),maxZ=Math.min(floor.max.z,z+sz/2),width=alongX?maxZ-minZ:maxX-minX,depth=alongX?maxX-minX:maxZ-minZ;if(width<.3||depth<.3)continue;
   // Paint follows the full authored corridor/goal footprint, never a small point target.
   const canvas=document.createElement('canvas');canvas.width=Math.min(768,Math.max(128,Math.round(width*256)));canvas.height=Math.min(768,Math.max(128,Math.round(depth*256)));const c=canvas.getContext('2d')!,px=canvas.width/width,pz=canvas.height/depth;
   c.fillStyle='rgba(211,205,181,.40)';const edge=.035;c.fillRect(edge*px,edge*pz,(width-edge*2)*px,edge*pz);c.fillRect(edge*px,(depth-edge*2)*pz,(width-edge*2)*px,edge*pz);for(const u of[edge,width-edge*2])c.fillRect(u*px,edge*pz,edge*px,(depth-edge*2)*pz);
   c.fillStyle='rgba(226,220,197,.82)';for(const distance of[.18,.28])c.fillRect(edge*px,canvas.height-distance*pz,(width-edge*2)*px,.045*pz);
   c.textAlign='center';c.textBaseline='middle';c.font=`700 ${Math.round(.24*pz)}px Heebo, Arial, sans-serif`;c.fillText('EXIT',canvas.width/2,canvas.height-Math.min(.68,depth*.6)*pz,Math.min(1.05,width-.16)*px);
   const texture=this.texture(new T.CanvasTexture(canvas));texture.colorSpace=T.SRGBColorSpace;const material=this.material(new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})),mark=this.mesh(this.geo(new T.PlaneGeometry(width,depth)),material);mark.name='exit-floor-mark:'+exit.id;mark.castShadow=false;mark.receiveShadow=false;mark.renderOrder=2;
   const forward=alongX?V(sign,0,0):V(0,0,sign);mark.matrix.copy(poseMatrix(V((minX+maxX)/2,floor.max.y+.006,(minZ+maxZ)/2),V(0,1,0),forward));mark.matrix.decompose(mark.position,mark.quaternion,mark.scale);
   // Deliberately absent from targets/colliders: only the real floor and exit remain interactive.
  }
 }
 private glassFrames(){
  const f=this.finishes;
  for(const pane of this.core.solids.filter(s=>s.kind==='glass')){
   const size=pane.max.clone().sub(pane.min),p=pane.min.clone().add(pane.max).multiplyScalar(.5),alongX=size.x>size.z,length=alongX?size.x:size.z;
   const part=(u:number,y:number,sz:number[])=>this.staticPart(alongX?[p.x+u,y,p.z]:[p.x,y,p.z+u],alongX?sz:[sz[2],sz[1],sz[0]],f.graphite);
   const count=Math.max(1,Math.ceil(length/4));for(let i=0;i<=count;i++)part(-length/2+i*length/count,p.y,[.065,size.y,.16]);
   for(const y of[pane.min.y+.08,pane.max.y-.07])part(0,y,[length,.12,.2]);
   for(let u=-length/2+1;u<length/2;u+=2)for(const sign of[-1,1])this.staticPart(alongX?[p.x+u,pane.min.y+.95,p.z+sign*(size.z/2+.005)]:[p.x+sign*(size.x/2+.005),pane.min.y+.95,p.z+u],alongX?[.15,.025,.002]:[.002,.025,.15],f.white);
  }
 }
 private doorSurround(x:number,y:number,z:number,width:number,axis:'x'|'z',sign=1){
  const f=this.finishes,headerStatus=this.material(new T.MeshStandardMaterial({color:0xedb54f,emissive:0xffb437,emissiveIntensity:1.4,roughness:.35})),push=(u:number,h:number,d:number,size:number[],mat:T.Material,round=false)=>this.staticPart(axis==='x'?[x+sign*d,y+h,z-sign*u]:[x+sign*u,y+h,z+sign*d],axis==='x'?[size[2],size[1],size[0]]:size,mat,undefined,round);
  for(const side of[-1,1]){push(side*(width/2+.16),1.65,0,[.32,3.3,.4],f.graphite,true);push(side*(width/2-.02),1.5,.22,[.04,2.85,.08],f.aluminum);push(side*(width/2+.31),1.55,.11,[.055,.64,.065],f.warm);}
  push(0,3.27,0,[width+.65,.3,.43],f.graphite,true);push(0,3.29,.29,[.72,.09,.035],headerStatus);push(0,.016,0,[width+.2,.035,.45],f.aluminum);
  // The raised leaf retracts into a finished mechanical pocket rather than hovering over the frame.
  const pocketHeight=Math.max(.4,Math.min(this.core.level.architecture.height-.2,y+6.65)-(y+3));push(0,3+pocketHeight/2,-.025,[width+.6,pocketHeight,.55],f.graphite,true);
  push(0,3+pocketHeight/2,.26,[width+.33,pocketHeight-.2,.035],f.recess,true);
  for(let i=0;i<6;i++)push(0,3.65+i*.37,.292,[width-.28,.045,.035],f.graphite);
  for(const side of[-1,1]){push(side*(width/2+.2),3.15,.285,[.08,6.25,.075],f.aluminum);for(const h of[3.3,3+pocketHeight-.2])push(side*(width/2+.15),h,.305,[.04,.04,.02],f.aluminum);}
  return headerStatus;
 }
 private compactShutterSurround(d:DeviceState,alongX:boolean,sign:number){
  const s=d.spec,w=Math.max(s.size[0],s.size[2]),h=s.size[1],depth=Math.min(s.size[0],s.size[2]),rise=Math.max(h,s.target?s.target[1]-s.position[1]:h+.3),f=this.finishes,group=new T.Group();group.position.set(...s.position);group.position.y-=h/2;group.rotation.y=alongX?sign*Math.PI/2:sign<0?Math.PI:0;this.root.add(group);
  for(const x of[-w/2-.04,w/2+.04]){this.part(group,[x,(h+rise)/2,0],[.07,h+rise+.08,depth+.10],f.graphite,.012);this.part(group,[x,(h+rise)/2,depth/2+.045],[.02,h+rise,.02],f.aluminum,.004);}
  this.part(group,[0,h+rise/2+.06,-.01],[w+.18,rise+.12,depth+.16],f.graphite,.022);for(let y=h+.15;y<h+rise;y+=.16)this.part(group,[0,y,depth/2+.08],[w-.08,.025,.018],f.aluminum,.004);const lamp=this.material(new T.MeshStandardMaterial({color:0xc7a76f,emissive:0xffb437,emissiveIntensity:.8}));this.part(group,[0,h+.07,depth/2+.10],[Math.min(.28,w*.5),.035,.016],lamp,.004);group.traverse(o=>{if(o instanceof T.Mesh)this.targets.push(o);});return lamp;
 }
 private mechanisms(){const f=this.finishes;this.doors=[];this.buttons=new Map();
  for(const d of this.core.machines.devices.filter(d=>d.spec.kind==='shutter')){const alongX=d.spec.size[0]<d.spec.size[2],sign=(alongX?d.spec.direction?.[0]:d.spec.direction?.[2])??1,w=Math.max(d.spec.size[0],d.spec.size[2]),h=d.spec.size[1],depth=Math.min(d.spec.size[0],d.spec.size[2]);const frameStatus=h<2?this.compactShutterSurround(d,alongX,sign):this.doorSurround(d.spec.position[0]+(alongX?sign*depth*.55:0),d.spec.position[1]-h/2,d.spec.position[2]+(alongX?0:sign*depth*.55),w,alongX?'x':'z',sign);const leaf=new T.Group();leaf.position.copy(d.position);leaf.rotation.y=alongX?sign*Math.PI/2:sign<0?Math.PI:0;this.root.add(leaf);
   this.part(leaf,[0,0,0],[w,h,depth],f.graphite,.035);
   for(const side of[-1,1]){this.part(leaf,[side*w*.25,0,depth*.55],[w*.475,h-.14,.09],f.ceramic,.035);this.part(leaf,[side*.075,0,depth*.75],[.055,.55,.055],f.aluminum,.01);}
   for(const y of[-h*.34,h*.34])this.part(leaf,[0,y,depth*.75],[w-.16,.025,.035],f.graphite,.004);
   const status=this.material(new T.MeshStandardMaterial({color:0xedb54f,emissive:0xffb437,emissiveIntensity:1.4}));this.part(leaf,[0,h*.42,depth*.75],[.45,.06,.035],status,.006);const clip=new T.Plane(V(0,-1,0),d.spec.position[1]+h/2+.015),clipped=new Map<T.Material,T.Material>();leaf.traverse(o=>{if(o instanceof T.Mesh){const copy=(m:T.Material)=>{let c=clipped.get(m);if(!c){c=m===status?m:this.material(m.clone());c.clippingPlanes=[clip];c.clipShadows=true;clipped.set(m,c);}return c;};o.material=Array.isArray(o.material)?o.material.map(copy):copy(o.material);this.targets.push(o);}});
   const inputs:DoorArt['inputs']=[],all=d.spec.circuit?.all??[];if(all.length>1){const panel=new T.Group();panel.position.set(...d.spec.position);panel.position.y-=h/2;panel.rotation.y=leaf.rotation.y;this.root.add(panel);all.forEach((id,i)=>{const x=(i-(all.length-1)/2)*.27,lamp=this.material(new T.MeshStandardMaterial({color:0x354047,roughness:.3,metalness:.5}));this.part(panel,[x,3.92,.49],[.19,.19,.055],f.aluminum,.018);this.part(panel,[x,3.92,.525],[.11,.11,.025],lamp,.012);inputs.push({id,lamp});});}
   this.doors.push({state:d,leaf,indicators:[status,frameStatus],inputs});
  }
  for(const p of this.core.pads){
   const base=this.mesh(this.geo(new T.CylinderGeometry(1.04,1.09,.14,48)),f.graphite);base.position.copy(p.pos).add(V(0,-.08,0));
   const rim=this.mesh(this.geo(new T.CylinderGeometry(.91,1,.07,48)),f.aluminum);rim.position.copy(p.pos).add(V(0,-.025,0));
   const red=this.material(f.red.clone()),top=this.mesh(this.geo(new T.CylinderGeometry(.83,.87,.11,48)),red);top.position.copy(p.pos).add(V(0,.04,0));
   const glow=this.material(new T.MeshStandardMaterial({color:0xb48a45,emissive:0xffb747,emissiveIntensity:.25}));
   for(let i=0;i<8;i++){const a=i*Math.PI/4;this.part(this.root,[p.pos.x+Math.sin(a)*1.018,p.pos.y-.015,p.pos.z+Math.cos(a)*1.018],[.12,.055,.04],glow,.008).rotation.y=a;}
   this.buttons.set(p.id,{top,lights:glow,restY:p.pos.y+.04});
   const dummy=new T.Mesh(this.geo(new T.PlaneGeometry(.01,.01)),this.material(new T.MeshStandardMaterial()));dummy.visible=false;this.padVisuals.set(p.id,dummy);
  }
  this.circuitTraces=[];
  for(const door of this.core.machines.devices.filter(d=>d.spec.kind==='shutter'))for(const p of this.core.pads){const c=door.spec.circuit;if(![...c?.all??[],...c?.any??[]].includes(p.id))continue;
   const material=this.material(new T.MeshStandardMaterial({color:0x68593b,emissive:0xffb541,emissiveIntensity:.18,roughness:.4,metalness:.5})),pad=p.pos,y=pad.y-.122,points=[V(pad.x,y,pad.z),V(door.spec.position[0]+.35,y,pad.z),V(door.spec.position[0]+.35,y,door.spec.position[2])],doorBase=door.spec.position[1]-door.spec.size[1]/2;if(Math.abs(doorBase-y)>.25)points.push(V(door.spec.position[0]+.35,doorBase+.018,door.spec.position[2]));const line=new T.CurvePath<T.Vector3>();for(let i=1;i<points.length;i++)line.add(new T.LineCurve3(points[i-1],points[i]));this.mesh(this.geo(new T.TubeGeometry(line,32,.018,6,false)),material);this.circuitTraces.push({material,pad:p.id});
  }
 }
 private pressed(p:{crateId?:string}){return (p as {pressed?:boolean}).pressed??!!p.crateId;}
 private machineDisplay(parent:T.Group,title:string,w=.44,h=.2){
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=Math.round(640*h/w);const texture=this.texture(new T.CanvasTexture(canvas));texture.colorSpace=T.SRGBColorSpace;
  const material=this.material(new T.MeshBasicMaterial({map:texture,toneMapped:false}));for(const side of[-1,1]){const face=this.mesh(this.geo(new T.PlaneGeometry(w,h)),material,parent);face.position.z=side*.086;if(side<0)face.rotation.y=Math.PI;}
  return{canvas,texture,key:'',title};
 }
 private paintMachine(display:MachineDisplay,state:string,detail=''){
  const key=display.title+'|'+state+'|'+detail;if(display.key===key)return;display.key=key;const c=display.canvas.getContext('2d')!,w=display.canvas.width,h=display.canvas.height;
  c.fillStyle='#142028';c.fillRect(0,0,w,h);c.fillStyle='#bcab79';c.fillRect(12,14,4,h-28);c.strokeStyle='#bcab79';c.lineWidth=3;c.beginPath();c.moveTo(40,h*.5-8);c.lineTo(48,h*.5);c.lineTo(40,h*.5+8);c.lineTo(32,h*.5);c.closePath();c.stroke();c.textAlign='center';c.textBaseline='middle';c.font=`600 ${Math.round(h*.17)}px Heebo, Arial, sans-serif`;c.fillStyle='#a6bac0';c.fillText(display.title.toUpperCase(),w*.53,h*(detail?.20:.27),w-110);c.font=`700 ${Math.round(h*.25)}px Heebo, Arial, sans-serif`;c.fillStyle='#ecf2ed';c.fillText(state,w*.53,h*(detail?.52:.68),w-90);if(detail){c.font=`500 ${Math.round(h*.14)}px Heebo, Arial, sans-serif`;c.fillStyle='#d7c18e';c.fillText(detail,w*.53,h*.83,w-90);}display.texture.needsUpdate=true;
 }
 private paintTimer(display:MachineDisplay,state:DeviceState){
  const pulse=state.spec.pulse??{period:10,onFor:5},period=Math.max(.1,pulse.period),phase=state.progress*period,enabled=this.core.machines.circuit(state.spec.circuit),left=Math.max(0,(phase<Math.min(period,pulse.onFor)?Math.min(period,pulse.onFor):period)-phase),key=[state.on,enabled,Math.floor(state.progress*24),Math.ceil(left*10)].join('|');if(display.key===key)return;display.key=key;
  const c=display.canvas.getContext('2d')!,w=display.canvas.width,h=display.canvas.height,cx=w/2,cy=h*.51,r=Math.min(w,h)*.31;c.fillStyle='#142028';c.fillRect(0,0,w,h);c.textAlign='center';c.textBaseline='middle';c.fillStyle='#bfced0';c.font=`600 ${h*.09}px Heebo, Arial, sans-serif`;c.fillText(display.title.toUpperCase(),cx,h*.10,w*.9);
  for(let i=0;i<24;i++){const a=-Math.PI/2+(i+.5)*Math.PI*2/24;c.save();c.translate(cx+Math.cos(a)*r,cy+Math.sin(a)*r);c.rotate(a);c.fillStyle=i===Math.floor(state.progress*24)?'#f2f4e9':i/24<pulse.onFor/period?'#4a8891':'#8a7145';c.globalAlpha=enabled?1:.35;c.fillRect(-h*.025,-h*.012,h*.05,h*.024);c.restore();}
  c.fillStyle=enabled?(state.on?'#bce8ea':'#e7c88b'):'#8e9fa5';c.font=`700 ${h*.21}px Heebo, Arial, sans-serif`;c.fillText(left.toFixed(1),cx,h*.49);c.font=`600 ${h*.09}px Heebo, Arial, sans-serif`;c.fillText(enabled?(state.on?'ON':'OFF'):'PAUSED',cx,h*.69);c.fillStyle='#93a8af';c.font=`500 ${h*.07}px Heebo, Arial, sans-serif`;c.fillText('SECONDS',cx,h*.90);display.texture.needsUpdate=true;
 }
 private paintBelt(belt:BeltArt,reversed:boolean){
  belt.reversed=reversed;const c=belt.canvas.getContext('2d')!,n=512;c.fillStyle='#273137';c.fillRect(0,0,n,n);for(let y=0;y<n;y+=32){c.fillStyle=y%64?'#303b40':'#20292f';c.fillRect(0,y,n,3);}const d=belt.direction.clone().multiplyScalar(reversed?-1:1);c.save();c.translate(n/2,n/2);c.rotate(Math.abs(d.x)>.5?(d.x<0?Math.PI:0):(d.z>0?Math.PI/2:-Math.PI/2));c.strokeStyle='#baa16a';c.lineWidth=9;for(const x of[-150,80]){c.beginPath();c.moveTo(x-28,-44);c.lineTo(x+18,0);c.lineTo(x-28,44);c.stroke();}c.restore();belt.texture.needsUpdate=true;
 }
 private nativeMachineProps(){
  const f=this.finishes;this.nativeMachines=[];
  for(const state of this.core.machines.devices.filter(d=>['switch','lift','moving-platform','timer','conveyor'].includes(d.spec.kind))){
   const s=state.spec,[w,h,d]=s.size,body=new T.Group();body.name='native-machine:'+s.id;body.position.copy(state.position);this.root.add(body);
   const lamp=this.material(new T.MeshStandardMaterial({color:0x39484a,roughness:.28,metalness:.55}));let display:MachineDisplay,lever:T.Group|undefined,belt:BeltArt|undefined;
   if(s.kind==='switch'){
    this.part(body,[0,0,0],[w,h,d],f.graphite,.035);const control=new T.Group();control.position.copy(V(...s.position).add(V(...(s.controlOffset??[0,0,0]))));const normal=V(...(s.direction??[0,0,1]));normal.y=0;if(normal.lengthSq()<.001)normal.set(0,0,1);control.quaternion.setFromUnitVectors(V(0,0,1),normal.normalize());this.root.add(control);
    this.part(control,[0,-.06,-.035],[.43,.59,.13],f.aluminum,.025);this.part(control,[0,-.06,.04],[.38,.54,.04],f.recess,.018);const screen=new T.Group();screen.position.y=.13;control.add(screen);display=this.machineDisplay(screen,s.label,.33,.12);
    lever=new T.Group();lever.position.set(0,-.16,.09);control.add(lever);this.part(lever,[0,.105,0],[.028,.21,.035],f.aluminum,.008);this.part(lever,[0,.22,0],[.19,.055,.065],f.rubber,.018);this.part(control,[-.14,-.20,.105],[.055,.055,.026],lamp,.008);
    for(const x of[-.17,.17])for(const y of[-.28,.17])this.part(control,[x,y,.095],[.018,.018,.012],f.graphite,.004);control.traverse(o=>{if(o instanceof T.Mesh)this.targets.push(o);});
   }else if(s.kind==='timer'){
    this.part(body,[0,0,0],[w,h,d],f.graphite,.035);this.part(body,[0,0,d/2+.008],[w-.06,h-.06,.018],f.aluminum,.018);const panel=new T.Group();panel.position.set(0,h*.12,d/2-.072);body.add(panel);display=this.machineDisplay(panel,s.label,w*.84,Math.min(h*.64,w*.84));this.part(body,[0,-h*.34,d/2+.025],[w*.45,.045,.018],lamp,.006);
    const bottom=s.position[1]-h/2,floor=this.core.solids.filter(solid=>solid.kind==='floor'&&s.position[0]>=solid.min.x&&s.position[0]<=solid.max.x&&s.position[2]>=solid.min.z&&s.position[2]<=solid.max.z&&solid.max.y<=bottom).sort((a,b)=>b.max.y-a.max.y)[0];if(floor&&bottom-floor.max.y>.15){const gap=bottom-floor.max.y;this.part(body,[0,-h/2-gap/2,0],[.08,gap,.10],f.aluminum,.012);this.part(body,[0,-h/2-gap+.035,0],[w*.60,.07,d],f.graphite,.015);}
   }else if(s.kind==='conveyor'){
    this.part(body,[0,-h*.28,0],[w,h*.44,d],f.graphite,.025);for(const z of[-d/2+.045,d/2-.045])this.part(body,[0,0,z],[w,h,.09],f.aluminum,.015);for(const x of[-w/2+.045,w/2-.045])this.part(body,[x,0,0],[.09,h,d],f.graphite,.015);
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const texture=this.texture(new T.CanvasTexture(canvas));texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(Math.max(.1,w-.12),Math.max(.1,d-.12));const direction=V(...(s.direction??[1,0,0]));direction.y=0;if(direction.lengthSq()<.001)direction.set(1,0,0);direction.normalize();const radius=Math.min(.08,h*.25),rollers:T.Mesh[]=[];belt={canvas,texture,direction,reversed:false,lastTime:this.core.time,rollers,radius};this.paintBelt(belt,false);
    const alongX=Math.abs(direction.x)>.5;for(const end of[-1,1]){const roller=this.mesh(this.geo(new T.CylinderGeometry(radius,radius,(alongX?d:w)-.16,24)),f.rubber,body);roller.quaternion.setFromUnitVectors(V(0,1,0),alongX?V(0,0,1):V(1,0,0));roller.position.set(alongX?end*(w/2-radius-.035):0,h/2-radius,alongX?0:end*(d/2-radius-.035));rollers.push(roller);}
    const material=this.material(new T.MeshStandardMaterial({map:texture,color:0xffffff,roughness:.82,metalness:.12})),surface=this.mesh(this.geo(new T.PlaneGeometry(w-.12,d-.12)),material,body);surface.rotation.x=-Math.PI/2;surface.position.y=h/2+.001;const panel=new T.Group();panel.position.set(0,0,d/2-.072);body.add(panel);display=this.machineDisplay(panel,s.label,.62,.16);
   }else{
    // Every visible deck top/edge follows the exact native collider, with a clear boarding centre.
    this.part(body,[0,-.02,0],[w,Math.max(.04,h-.04),d],f.graphite,.035);
    for(const x of[-1,1])for(const z of[-1,1])this.part(body,[x*w/4,h/2-.015,z*d/4],[w/2-.11,.03,d/2-.11],f.floor,.008);
    for(const x of[-w/2+.045,w/2-.045])this.part(body,[x,h/2-.025,0],[.045,.05,d-.08],f.aluminum,.008);
    for(const z of[-d/2+.045,d/2-.045])this.part(body,[0,h/2-.025,z],[w-.08,.05,.045],f.aluminum,.008);
    for(const x of[-1,1])for(const z of[-1,1]){this.part(body,[x*(w/2-.16),h/2+.002,z*(d/2-.16)],[.20,.008,.05],lamp,.003);this.part(body,[x*(w/2-.10),0,z*(d/2-.3)],[.08,Math.min(.12,h*.65),.22],f.aluminum,.012);}
    const control=new T.Group(),offset=s.kind==='lift'?V(...(s.controlOffset??(s.automatic?[w/2-.6,.9,d/2-.6]:[0,0,0]))):V(0,h/2+.12,d/2-.11);control.position.copy(offset);const normal=s.kind==='lift'?V(offset.x,0,offset.z):V(0,0,1);if(normal.lengthSq()<.001)normal.set(0,0,1);control.quaternion.setFromUnitVectors(V(0,0,1),normal.normalize());body.add(control);
    if(s.kind==='lift'){const stem=Math.max(.02,offset.y-h/2-.22);this.part(body,[offset.x,h/2+stem/2,offset.z],[.065,stem,.065],f.aluminum,.012);this.part(body,[offset.x,h/2+.018,offset.z],[.28,.036,.24],f.graphite,.012);this.part(control,[0,0,0],[.53,.40,.16],f.graphite,.027);this.part(control,[0,.005,0],[.49,.35,.165],f.aluminum,.018);const screen=new T.Group();screen.position.y=.06;control.add(screen);display=this.machineDisplay(screen,s.label,.43,.19);if(!s.automatic)for(const x of[-.11,.11]){this.part(control,[x,-.135,.105],[.13,.06,.025],f.rubber,.008);this.part(control,[x,-.135,.12],[.06,.022,.012],f.warm,.004);}}
    else{this.part(control,[0,0,0],[.55,.24,.12],f.graphite,.015);display=this.machineDisplay(control,s.label,.49,.18);}
   }
   body.traverse(o=>{if(o instanceof T.Mesh)this.targets.push(o);});this.nativeMachines.push({state,body,display,lever,lamp,belt});
  }
 }
 private updateNativeMachineProps(dt:number){
  for(const art of this.nativeMachines){const d=art.state,s=d.spec;art.body.position.copy(d.position);let text=d.on?'ON':'OFF',detail=s.kind==='switch'?'TOGGLE':'';
   if(s.kind==='switch'&&art.lever)art.lever.rotation.x=T.MathUtils.damp(art.lever.rotation.x,d.on?-.48:.48,16,Math.max(0,dt));
   if(s.kind==='lift'){const stops=s.stops??[{label:'lower',position:s.position},...(s.target?[{label:s.targetLabel??'upper',position:s.target}]:[])],at=stops.find(stop=>d.position.distanceTo(V(...stop.position))<.03),stop=stops[d.on?d.choice:0]?.label??s.states?.[d.on?d.choice:0]??(d.on?s.targetLabel:'LOWER')??'';text=at?'AT '+at.label.toUpperCase():d.moving?(s.automatic?'MOVING':'TO '+stop.toUpperCase()):'PAUSED';if(s.automatic)detail=d.on?'AUTOMATIC':'NO POWER';else{const next=(d.choice+1)%Math.max(2,s.stops?.length??s.states?.length??2),nextStop=s.stops?.[next],name=nextStop?.label??s.states?.[next];if(name)detail=this.core.machines.circuit(nextStop?.guard)?'NEXT '+name.toUpperCase():name.toUpperCase()+' · LOCKED';}}
   if(s.kind==='moving-platform')text=d.moving?'MOVING':d.on?'DOCKED':'STOPPED';
   if(s.kind==='conveyor'&&art.belt){const reverse=!!s.controls&&this.core.machines.flag(s.controls);if(reverse!==art.belt.reversed)this.paintBelt(art.belt,reverse);const actual=art.belt.direction.clone().multiplyScalar(reverse?-1:1),elapsed=Math.max(0,this.core.time-art.belt.lastTime);art.belt.lastTime=this.core.time;if(d.on){art.belt.texture.offset.x=(art.belt.texture.offset.x-actual.x*(s.speed??1.7)*elapsed)%1;art.belt.texture.offset.y=(art.belt.texture.offset.y+actual.z*(s.speed??1.7)*elapsed)%1;for(const roller of art.belt.rollers)roller.rotateY((actual.x?-actual.x:actual.z)*(s.speed??1.7)*elapsed/art.belt.radius);}text=d.on?'RUNNING':'STOPPED';detail=Math.abs(actual.x)>.5?(actual.x>0?'EAST':'WEST'):(actual.z>0?'SOUTH':'NORTH');}
   if(s.kind==='timer'){const enabled=this.core.machines.circuit(s.circuit);art.lamp.color.set(enabled?(d.on?0x9ddce0:0xd9b26b):0x39484a);art.lamp.emissive.set(enabled?(d.on?0x45b6c7:0xaf7224):0);art.lamp.emissiveIntensity=enabled?.8:0;this.paintTimer(art.display,d);continue;}
   art.lamp.color.set(d.on?0xc6d9d5:0x39484a);art.lamp.emissive.set(d.on?0x72b8c9:0);art.lamp.emissiveIntensity=d.on?.55:0;this.paintMachine(art.display,text,detail);
  }
 }
 private opticalProps(){
  this.opticalLamps=[];this.beamPieces=[];this.beamGeometry=undefined;const optics=this.core.level.optics;if(!optics)return;const f=this.finishes;
  this.beamGeometry=this.geo(new T.CylinderGeometry(1,1,1,8));this.beamCoreMaterial=this.material(new T.MeshBasicMaterial({color:0xffe8db,toneMapped:false}));this.beamHaloMaterial=this.material(new T.MeshBasicMaterial({color:0xff3f28,transparent:true,opacity:.23,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));
  for(const emitter of optics.emitters){const body=new T.Group();body.name='optical-emitter:'+emitter.id;body.position.set(...emitter.position);body.quaternion.setFromUnitVectors(V(0,0,1),V(...emitter.direction).normalize());this.root.add(body);
   this.part(body,[0,0,-.19],[.43,.43,.27],f.graphite,.035);this.part(body,[0,0,-.055],[.39,.39,.045],f.aluminum,.025);this.part(body,[0,0,-.024],[.31,.31,.025],f.recess,.02);
   const bezel=this.mesh(this.geo(new T.TorusGeometry(.125,.024,8,32)),f.aluminum,body);bezel.position.z=-.006;const lamp=this.material(new T.MeshStandardMaterial({color:0x602721,emissive:0xa31a0d,emissiveIntensity:0,roughness:.2,metalness:.35})),lens=this.mesh(this.geo(new T.CircleGeometry(.105,32)),lamp,body);lens.position.z=.001;
   for(const x of[-.16,.16])for(const y of[-.16,.16])this.part(body,[x,y,-.025],[.025,.025,.014],f.graphite,.005);for(const side of[-1,1])for(let y=-.12;y<.14;y+=.06)this.part(body,[side*.216,y,-.19],[.012,.025,.16],f.aluminum,.004);
   body.traverse(o=>{if(o instanceof T.Mesh)this.targets.push(o);});this.opticalLamps.push({id:emitter.id,kind:'emitter',material:lamp});if(optics.emitters.length===1)this.opticalServicePanel('emitter-housing','EMITTER',lamp);
  }
  for(const receiver of optics.receivers){const body=new T.Group(),r=receiver.radius,w=r*2+.18;body.name='optical-receiver:'+receiver.id;body.position.set(...receiver.position);body.quaternion.setFromUnitVectors(V(0,0,1),V(...(receiver.normal??[0,0,1])).normalize());this.root.add(body);
   this.part(body,[0,0,-.15],[w,w,.26],f.graphite,.035);this.part(body,[0,0,-.02],[w-.055,w-.055,.035],f.aluminum,.025);const ring=this.mesh(this.geo(new T.TorusGeometry(r+.012,.025,8,40)),f.graphite,body);ring.position.z=.005;
   // The native receiver is a sphere: its visible dome meets the exact traced endpoint.
   const lamp=this.material(new T.MeshStandardMaterial({color:0x273c41,emissive:0,roughness:.17,metalness:.4}));this.mesh(this.geo(new T.SphereGeometry(r,24,16)),lamp,body);
   for(const x of[-1,1])for(const y of[-1,1])this.part(body,[x*w*.38,y*w*.38,.003],[.025,.025,.018],f.graphite,.004);
   this.part(body,[0,-w/2-.07,-.055],[w,.14,.12],f.graphite,.012);const label=this.label('RECEIVER',w-.04,.09,'#20292e','#c7d3d6',95);label.position.set(0,-w/2-.07,.012);body.add(label);body.traverse(o=>{if(o instanceof T.Mesh)this.targets.push(o);});this.opticalLamps.push({id:receiver.id,kind:'receiver',material:lamp});if(optics.receivers.length===1)this.opticalServicePanel('receiver-pillar','RECEIVER',lamp);
  }
 }
 private opticalServicePanel(id:string,title:string,lamp:T.Material){
  const housing=this.core.solids.find(s=>s.id===id);if(!housing)return;const size=housing.max.clone().sub(housing.min);if(size.x<.35||size.y<.8)return;const f=this.finishes,p=housing.min.clone().add(housing.max).multiplyScalar(.5),w=Math.min(.95,size.x-.10),h=Math.min(.72,size.y-.12),group=new T.Group();group.position.set(p.x,housing.min.y+size.y*.58,housing.max.z+.012);this.root.add(group);
  this.part(group,[0,0,0],[w,h,.035],f.aluminum,.018);this.part(group,[0,0,.022],[w-.045,h-.045,.018],f.recess,.012);this.part(group,[0,-h*.06,.038],[w*.58,.035,.018],lamp,.005);for(const x of[-w*.32,0,w*.32])this.part(group,[x,-h*.30,.039],[w*.18,.025,.018],f.aluminum,.004);const label=this.label(title,w*.90,h*.17,'#172126','#d5e1e2',95);label.position.set(0,h*.28,.042);group.add(label);for(const x of[-w*.43,w*.43])for(const y of[-h*.42,h*.42])this.part(group,[x,y,.033],[.018,.018,.012],f.graphite,.004);group.traverse(o=>{if(o instanceof T.Mesh)this.targets.push(o);});
 }
 private updateOpticalProps(){
  if(!this.core.level.optics)return;
  for(const lamp of this.opticalLamps){const on=lamp.kind==='emitter'?this.core.beams.has(lamp.id):this.core.machines.flags[lamp.id]===true;lamp.material.color.set(lamp.kind==='emitter'?(on?0xf65c43:0x602721):(on?0xe6c274:0x273c41));lamp.material.emissive.set(lamp.kind==='emitter'?(on?0xff2412:0):(on?0xffb83d:0));lamp.material.emissiveIntensity=on?2.1:0;}
  let used=0;
  for(const result of this.core.beams.values())for(let i=0;i<result.segments.length;i++){
   const segment=result.segments[i],a=V(...segment.from),b=V(...segment.to),delta=b.clone().sub(a),length=delta.length();if(length<.0001)continue;
   let piece=this.beamPieces[used++];if(!piece){const core=this.mesh(this.beamGeometry!,this.beamCoreMaterial!),halo=this.mesh(this.beamGeometry!,this.beamHaloMaterial!),impact=this.mesh(this.geo(new T.SphereGeometry(.035,12,8)),this.beamCoreMaterial!);core.castShadow=halo.castShadow=impact.castShadow=false;piece={core,halo,impact};this.beamPieces.push(piece);}
   for(const[mesh,r]of[[piece.core,.011],[piece.halo,.047]]as const){mesh.visible=true;mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(V(0,1,0),delta.clone().normalize());mesh.scale.set(r,length,r);}
   piece.impact.visible=i===result.segments.length-1&&['receiver','obstacle'].includes(result.stop);piece.impact.position.copy(b);
  }
  for(let i=used;i<this.beamPieces.length;i++){const piece=this.beamPieces[i];piece.core.visible=piece.halo.visible=piece.impact.visible=false;}
 }
 private lighting(){
  for(const child of [...this.scene.children])if(child instanceof T.Light||child.userData.chamberLight){if(child instanceof T.SpotLight||child instanceof T.DirectionalLight)child.shadow.dispose();this.scene.remove(child);}
  RectAreaLightUniformsLib.init();this.scene.background=new T.Color(0x10151a);this.scene.fog=new T.Fog(0x10151a,38,70);this.scene.environmentIntensity=.48;this.renderer.toneMappingExposure=1.08;
  this.scene.add(new T.HemisphereLight(0xcbdce5,0x3b3028,.48));
  const ceiling=this.core.level.architecture.height;
  if(this.software){const key=new T.DirectionalLight(0xdce8ed,1.55);key.position.set(-4,10,5);this.scene.add(key);const fill=new T.DirectionalLight(0xffdcaf,.65);fill.position.set(5,6,-8);this.scene.add(fill);}
  for(const x of(this.software?[]:[-4.2,4.2]))for(const z of[-9,-1,8]){const area=new T.RectAreaLight(0xe2edf5,6.8,3.8,1.1);area.position.set(x,ceiling-.45,z);area.rotation.x=-Math.PI/2;this.scene.add(area);}
  const key=new T.SpotLight(0xffedcf,this.software?0:150,28,.92,.7,2);key.position.set(-4,ceiling-.55,5);key.target.position.set(0,0,-3);key.castShadow=!this.software;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0001;key.shadow.normalBias=.025;this.scene.add(key,key.target);key.userData.chamberLight=true;key.target.userData.chamberLight=true;
  for(const x of[-7.6,7.6]){const fill=new T.PointLight(0xffce8a,14,9,2);fill.position.set(x,.7,-8);this.scene.add(fill);}
  this.portalLights=[0,1].map(i=>{const light=new T.PointLight(i===0?0x55c9ee:0xffb535,0,5,2);this.scene.add(light);return light;});
 }
 override build(){
  this.portalRenderer?.dispose();this.portalRenderer=undefined;
  if(this.viewScene)this.disposeObject(this.viewScene);this.viewScene=undefined;this.viewCamera=undefined;this.instrument=undefined;
  this.disposeObject(this.root);this.root.clear();this.portalViews.forEach(v=>v.target.dispose());this.portalViews=[];this.targets=[];this.crateVisuals.clear();this.padVisuals.clear();this.bridgeVisuals.clear();
  this.ownedGeometries?.forEach(g=>g.dispose());this.ownedMaterials?.forEach(m=>m.dispose());this.ownedTextures?.forEach(t=>t.dispose());this.ownedGeometries=new Set();this.ownedMaterials=new Set();this.ownedTextures=new Set();this.batches=new Map();this.cratePieces=new Map();this.prepareFinishes();this.architecture();this.mechanisms();this.nativeMachineProps();this.opticalProps();this.flushBatches();for(const c of this.core.crates)this.createCrate(c.id);this.buildPortalVisuals();this.lighting();
 }
 override createCrate(id:string){const oldVisual=this.crateVisuals.get(id),oldTargets=new Set<T.Object3D>();oldVisual?.traverse(o=>oldTargets.add(o));this.targets=this.targets.filter(o=>!oldTargets.has(o));const previous=this.cratePieces?.get(id);if(previous)for(const copy of previous.copies){this.root.remove(copy.group);copy.materials.forEach(m=>{m.dispose();this.ownedMaterials.delete(m);});}super.createCrate(id);const group=this.crateVisuals.get(id)!;for(const child of [...group.children])if(child instanceof T.Mesh&&child.geometry.type==='PlaneGeometry'){group.remove(child);this.disposeObject(child);}const b=this.core.crates.find(c=>c.id===id)!;
  for(const side of[-1,1]){const diamond=new T.Shape();diamond.moveTo(0,.13);diamond.lineTo(.13,0);diamond.lineTo(0,-.13);diamond.lineTo(-.13,0);diamond.closePath();const mark=this.mesh(this.geo(new T.ShapeGeometry(diamond)),this.material(new T.MeshStandardMaterial({color:0xd6c28b,metalness:.65,roughness:.32})),group);mark.position.set(0,0,side*(b.half.z+.014));if(side<0)mark.rotation.y=Math.PI;}
  const source:T.Material[]=[];group.traverse(o=>{if(o instanceof T.Mesh){const mats=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const c=this.material(m.clone());c.clipShadows=true;source.push(c);return c;});o.material=Array.isArray(o.material)?mats:mats[0];}});
  const copies=[0,1].map(()=>{const copy=group.clone(true),materials:T.Material[]=[];copy.visible=false;copy.traverse(o=>{if(o instanceof T.Mesh){o.userData.sharedAsset=true;const mats=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const c=this.material(m.clone());c.clipShadows=true;materials.push(c);return c;});o.material=Array.isArray(o.material)?mats:mats[0];}});this.root.add(copy);return{group:copy,materials};});
  group.traverse(o=>{if(o instanceof T.Mesh)this.targets.push(o);});this.cratePieces?.set(id,{source,copies});
 }
 private syncCratePieces(){
  for(const cube of this.core.crates){const visual=this.crateVisuals.get(cube.id),pieces=this.cratePieces.get(cube.id);if(!visual||!pieces)continue;visual.position.copy(cube.pos);visual.quaternion.copy(cube.rotation);visual.updateMatrixWorld(true);pieces.source.forEach(m=>m.clippingPlanes=null);pieces.copies.forEach(c=>c.group.visible=false);
   if(!this.core.portals.every(Boolean))continue;
   for(let i=0;i<2;i++){const entry=this.core.portals[i]!,exit=this.core.portals[1-i]!,normal=entry.normal,axes=[V(1,0,0),V(0,1,0),V(0,0,1)].map(v=>v.applyQuaternion(cube.rotation)),radius=Math.abs(normal.dot(axes[0]))*cube.half.x+Math.abs(normal.dot(axes[1]))*cube.half.y+Math.abs(normal.dot(axes[2]))*cube.half.z,dist=cube.pos.clone().sub(entry.center).dot(normal),local=cube.pos.clone().applyMatrix4(entry.matrix.clone().invert()),floor=Math.abs(normal.y)>.8;
    if(Math.abs(dist)>radius+.035||Math.abs(local.x)>(floor?1.15:.9)+radius||Math.abs(local.y)>(floor?1.15:1.55)+radius)continue;
    const sourcePlane=new T.Plane().setFromNormalAndCoplanarPoint(normal,entry.center),exitPlane=new T.Plane().setFromNormalAndCoplanarPoint(exit.normal,exit.center),copy=pieces.copies[i];pieces.source.forEach(m=>m.clippingPlanes=[sourcePlane]);copy.materials.forEach(m=>m.clippingPlanes=[exitPlane]);const matrix=portalMatrix(entry,exit).multiply(visual.matrixWorld);matrix.decompose(copy.group.position,copy.group.quaternion,copy.group.scale);copy.group.visible=true;copy.group.updateMatrixWorld(true);break;
   }
  }
 }
 override buildPortalVisuals(){super.buildPortalVisuals();for(const [i,v] of this.portalViews.entries()){for(const child of v.group.children)if(child instanceof T.Mesh&&child.geometry.type==='TubeGeometry'){(child.material as T.MeshBasicMaterial).color.set(i===0?0x55c9ee:0xffb535);}v.plane.material.uniforms.tint.value.set(i===0?0x55c9ee:0xffb535);for(const child of [...v.group.children])if(child instanceof T.Mesh&&child.geometry.type==='PlaneGeometry'){v.group.remove(child);this.disposeObject(child);}}}
 private buildInstrument(){
  this.viewScene=new T.Scene();this.viewScene.environment=this.scene.environment;this.viewScene.environmentIntensity=.65;this.viewCamera=new T.PerspectiveCamera(54,this.camera.aspect,.01,10);this.viewScene.add(new T.HemisphereLight(0xe3efff,0x393a35,1.5));const light=new T.DirectionalLight(0xffe9c8,2.8);light.position.set(-2,3,1);this.viewScene.add(light);
  const tool=this.instrument=new T.Group();this.viewScene.add(tool);const fit=this.instrumentFit();tool.position.set(fit.x,fit.y,-.92);tool.scale.setScalar(fit.scale);tool.rotation.set(.15,.32,-.055);const f=this.finishes;
  // Original rectangular twin-rail field instrument: no barrel/prongs/franchise logo.
  this.part(tool,[0,0,.03],[.31,.23,.38],f.graphite,.045);this.part(tool,[.015,.04,.145],[.29,.16,.20],f.white,.04);this.part(tool,[0,.125,.03],[.22,.035,.31],f.aluminum,.009);this.part(tool,[0,.14,.11],[.095,.014,.14],f.graphite,.006);
  for(const side of[-1,1]){this.part(tool,[side*.132,-.015,-.225],[.065,.145,.34],f.aluminum,.018);this.part(tool,[side*.132,.015,-.23],[.049,.072,.30],f.white,.015);this.part(tool,[side*.132,-.067,-.245],[.045,.028,.28],f.graphite,.007);}
  this.part(tool,[0,-.055,-.18],[.19,.045,.27],f.recess,.012);this.part(tool,[0,.08,-.27],[.25,.038,.12],f.graphite,.01);
  this.part(tool,[0,.075,-.22],[.21,.035,.31],f.graphite,.01);
  this.emitterCore=this.material(new T.MeshStandardMaterial({color:0x71b2c5,emissive:0x45c9ee,emissiveIntensity:1.5,metalness:.3,roughness:.22}));
  for(const side of[-1,1]){this.part(tool,[side*.067,.105,-.22],[.026,.016,.28],this.emitterCore,.006);for(let i=0;i<6;i++)this.part(tool,[side*.135,.077,-.11-i*.044],[.055,.016,.012],f.graphite,.003);}
  this.part(tool,[0,-.004,-.382],[.205,.074,.022],f.rubber,.005);this.part(tool,[0,-.004,-.397],[.13,.031,.009],this.emitterCore,.004);
  // Grip, trigger guard, actual mechanical assembly and static glove — rigid art, no hand rig.
  const grip=this.part(tool,[.025,-.18,.12],[.12,.24,.15],f.rubber,.025);grip.rotation.x=-.24;
  for(let i=0;i<5;i++)this.part(tool,[.085,-.10-i*.032,.13],[.009,.013,.12],f.graphite,.003);
  this.part(tool,[-.06,-.15,.035],[.035,.12,.025],f.aluminum,.007);this.part(tool,[-.045,-.21,.065],[.08,.025,.09],f.aluminum,.007);this.part(tool,[-.034,-.13,.055],[.018,.07,.025],f.graphite,.004);
  const glove=this.material(new T.MeshStandardMaterial({color:0x343b3e,roughness:.86}));const cuff=this.material(new T.MeshStandardMaterial({color:0x626c70,roughness:.84}));
  this.part(tool,[.11,-.25,.19],[.17,.14,.18],glove,.037).rotation.z=-.14;this.part(tool,[.12,-.34,.28],[.19,.17,.23],cuff,.035).rotation.x=-.3;
  for(let i=0;i<3;i++)this.part(tool,[-.003+i*.038,-.194,.195],[.035,.065,.09],glove,.015);
  this.part(tool,[.106,-.17,.04],[.075,.07,.12],glove,.025).rotation.x=-.4;
  const violet=this.instrumentA=this.material(new T.MeshStandardMaterial({color:0x71b9cb,emissive:0x49cbef,emissiveIntensity:.3,roughness:.25})),amber=this.instrumentB=this.material(new T.MeshStandardMaterial({color:0xc7a36b,emissive:0xffb53b,emissiveIntensity:.3,roughness:.25}));
  this.part(tool,[-.07,.145,.09],[.073,.012,.034],violet,.005);this.part(tool,[.04,.145,.09],[.073,.012,.034],amber,.005);
  for(const side of[-1,1])for(const z of[-.015,.19]){const screw=this.mesh(this.geo(new T.CylinderGeometry(.011,.011,.007,12)),f.aluminum,tool);screw.rotation.z=Math.PI/2;screw.position.set(side*.174,.035,z);}
  for(let i=0;i<4;i++)this.part(tool,[.18,.07,.135-i*.033],[.008,.026,.014],f.recess,.002);
  const badge=this.label('RIFT / 02',.15,.035,'#20292e','#a5b2b8',125);badge.position.set(.185,.01,.10);badge.rotation.y=Math.PI/2;tool.add(badge);
 }
 private instrumentFit(){const aspect=this.viewCamera?.aspect??this.camera.aspect,ratio=T.MathUtils.clamp(aspect/1.35,.62,1);return{scale:.58*ratio,x:Math.min(.43,Math.max(.07,Math.tan(27*Math.PI/180)*.70*aspect-.17*ratio)),y:-.37*Math.sqrt(ratio)};}
 fire(index:number){this.recoil=.032;this.pulse=.16;this.shotIndex=index;}
 override renderLinkedViews(){this.portalRenderer??=new PortalRenderer(this.renderer,this.scene);if(!this.software||this.frame++%3===0)this.portalRenderer.render(this.camera,this.core.portals,this.portalViews);}
 override resize(){super.resize();if(this.viewCamera){this.viewCamera.aspect=this.camera.aspect;this.viewCamera.updateProjectionMatrix();}}
 override setWorld(world:RiftWorld|CoreWorld){super.setWorld(world as unknown as RiftWorld);this.viewScene=undefined;this.viewCamera=undefined;this.instrument=undefined;this.buildInstrument();this.lastPortalSignature=undefined;this.recoil=0;}
 override update(dt:number){
  this.artClock=(this.artClock??0)+dt;const signature=this.core.portals.map(p=>p?p.surfaceId+':'+p.center.toArray().map(v=>v.toFixed(2)).join(','):'').join('|');if(this.lastPortalSignature!==undefined&&signature!==this.lastPortalSignature)this.recoil=.035;this.lastPortalSignature=signature;this.recoil=Math.max(0,(this.recoil??0)-dt*.17);
  for(const d of this.doors){d.leaf.position.copy(d.state.position);for(const m of d.indicators){m.color.set(d.state.progress>.85?0x96c7a1:0xedb54f);m.emissive.set(d.state.progress>.85?0x68bb88:0xffb437);}for(const input of d.inputs){const on=this.core.machines.flag(input.id);input.lamp.color.set(on?0xc0d6b8:0x354047);input.lamp.emissive.set(on?0x6fba8c:0);input.lamp.emissiveIntensity=on?1.8:0;}}
  for(const p of this.core.pads){const art=this.buttons.get(p.id)!;art.top.position.y=art.restY-(this.pressed(p)?.065:0);art.lights.emissiveIntensity=this.pressed(p)?2:.22;}
  for(const trace of this.circuitTraces)trace.material.emissiveIntensity=this.pressed(this.core.pads.find(p=>p.id===trace.pad)!)?2.6:.10;
  this.updateNativeMachineProps(dt);
  this.updateOpticalProps();
  for(let i=0;i<2;i++){const p=this.core.portals[i],light=this.portalLights[i];light.intensity=p?7:0;if(p)light.position.copy(p.center).addScaledVector(p.normal,.28);}
  this.syncCratePieces();
  super.update(dt);
  for(const c of this.core.crates){const visual=this.crateVisuals.get(c.id);if(visual&&c.rotation)visual.quaternion.copy(c.rotation);}
  if(this.instrument&&this.viewScene&&this.viewCamera){const fit=this.instrumentFit(),speed=Math.hypot(this.core.player.vel.x,this.core.player.vel.z),sway=this.reducedMotion?0:Math.sin(this.artClock*7)*Math.min(.004,speed*.0008);this.instrument.scale.setScalar(fit.scale);this.instrument.position.set(fit.x,fit.y+sway,(this.core.heldId?-.88:-.92)+this.recoil);this.instrument.rotation.z=-.055+(this.reducedMotion?0:Math.sin(this.artClock*1.4)*.003);this.instrumentA!.emissiveIntensity=this.core.portals[0]?2.8:.25;this.instrumentB!.emissiveIntensity=this.core.portals[1]?2.8:.25;const color=this.shotIndex===1?0xffb23d:0x49ccef;this.emitterCore!.emissive.set(color);this.emitterCore!.emissiveIntensity=1.3+(this.pulse??0)*12;this.pulse=Math.max(0,(this.pulse??0)-dt);const clear=this.renderer.autoClear;this.renderer.autoClear=false;this.renderer.clearDepth();this.renderer.render(this.viewScene,this.viewCamera);this.renderer.autoClear=clear;}
 }
}
