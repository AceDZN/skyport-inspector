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
type DoorArt={state:DeviceState;leaf:T.Group;indicators:T.MeshStandardMaterial[]};
type CratePieces={source:T.Material[];copies:{group:T.Group;materials:T.Material[]}[]};
type ButtonArt={top:T.Mesh;lights:T.MeshStandardMaterial;restY:number};

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
 declare private circuitGlow:T.MeshStandardMaterial|undefined;
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
 private texture(t:T.Texture){this.ownedTextures.add(t);return t;}
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
  const a=axis==='x'?'z':'x',u1=min[a],u2=max[a],y1=min.y,y2=max.y,plane=sign>0?max[axis]:min[axis],normal=axis==='x'?V(sign,0,0):V(0,0,sign);
  const cols=Math.max(1,Math.ceil((u2-u1)/2)),rows=Math.max(1,Math.ceil((y2-y1)/2));
  for(let u=0;u<cols;u++)for(let v=0;v<rows;v++){
   const cw=(u2-u1)/cols,ch=(y2-y1)/rows,pu=u1+cw*(u+.5),py=y1+ch*(v+.5);
   const behindPortal=this.core.surfaces.some(s=>!s.floor&&Math.abs(s.normal[axis])>.8&&s.normal[axis]===sign&&Math.abs(s.center[axis]-plane)<.15&&Math.abs(s.center[a]-pu)<s.width/2+cw/2+.12&&Math.abs(s.center.y-py)<s.height/2+ch/2+.12);
   if(this.core.number===2&&behindPortal)continue;
   const p=axis==='x'?[plane+sign*.015,py,pu]:[pu,py,plane+sign*.015],sz=axis==='x'?[.045,ch-.025,cw-.025]:[cw-.025,ch-.025,.045];this.staticPart(p,sz,this.core.number===1?this.finishes.ceramic:this.finishes.graphite,undefined,true);
   if(cw>1.2&&ch>1.2){for(const su of[-1,1])for(const sy of[-1,1]){const bolt=axis==='x'?[plane+sign*.042,py+sy*(ch/2-.09),pu+su*(cw/2-.09)]:[pu+su*(cw/2-.09),py+sy*(ch/2-.09),plane+sign*.042];this.staticPart(bolt,axis==='x'?[.009,.022,.022]:[.022,.022,.009],this.finishes.graphite);}}
  }
  // Continuous kick plate and top service channel, in the same physical wall plane.
  for(const [y,h]of[[Math.max(y1+.23,.23),.42],[y2-.25,.45]]){
   if(y<y1||y>y2)continue;const p=axis==='x'?[plane+sign*.04,y,(u1+u2)/2]:[(u1+u2)/2,y,plane+sign*.04];this.staticPart(p,axis==='x'?[.09,h,u2-u1]:[u2-u1,h,.09],this.finishes.graphite);
  }
  void normal;
 }
 private architecture(){
  const f=this.finishes,b=this.core.blueprint,height=this.core.number===1?7:11,half=this.core.number===1?8:9;
  for(const s of this.core.solids){const size=s.max.clone().sub(s.min),p=s.min.clone().add(s.max).multiplyScalar(.5);
   if(s.kind==='glass'){const m=this.material(new T.MeshPhysicalMaterial({color:0xc3d3d8,transparent:true,opacity:.10,roughness:.08,metalness:.1,clearcoat:1,envMapIntensity:.75,depthWrite:false,side:T.DoubleSide}));const pane=this.mesh(this.geo(new T.BoxGeometry(size.x,size.y,size.z)),m);pane.position.copy(p);pane.castShadow=false;continue;}
   const ceiling=/ceiling/.test(s.id),mat=s.kind==='floor'?f.floor:ceiling?f.recess:f.graphite;const mesh=this.mesh(s.kind==='floor'?this.floorGeometry(size,p):this.geo(new T.BoxGeometry(size.x,size.y,size.z)),mat);mesh.position.copy(p);mesh.userData.solid=s.id;this.targets.push(mesh);
   if(s.id==='raised-cube-alcove'){this.wallCladding(s.min,s.max,'z',1);this.staticPart([p.x,s.max.y-.04,s.max.z+.04],[size.x,.12,.16],f.graphite);for(const x of[s.min.x+.08,s.max.x-.08])this.staticPart([x,p.y,s.max.z+.055],[.14,size.y,.14],f.graphite);}
   if(!ceiling&&s.kind==='wall'&&!s.id.startsWith('vestibule')){if(size.x<.7&&size.z>.8){this.wallCladding(s.min,s.max,'x',1);this.wallCladding(s.min,s.max,'x',-1);}else if(size.z<.7&&size.x>.8){this.wallCladding(s.min,s.max,'z',1);this.wallCladding(s.min,s.max,'z',-1);}}
  }
  // Ceiling coffers have real depth and recessed perforated service lanes.
  for(let z=-14;z<14;z+=4){for(let x=-half+1;x<half;x+=2){this.staticPart([x,height-.08,z+1],[1.96,.12,3.94],f.graphite,undefined,true);this.staticPart([x,height-.16,z+1],[1.77,.045,3.72],f.recess);}this.staticPart([0,height-.3,z],[half*2,.24,.18],f.graphite);}
  for(const x of[-half+.12,half-.12]){this.staticPart([x,height-.42,-1],[.28,.8,30],f.graphite);for(let z=-12;z<=12;z+=4){if(this.core.machines.devices.some(d=>d.spec.kind==='shutter'&&d.spec.size[0]<d.spec.size[2]&&Math.abs(d.spec.position[0]-x)<.5&&Math.abs(d.spec.position[2]-z)<d.spec.size[2]/2+.2))continue;if(!this.core.solids.some(s=>s.id.startsWith('structural-rib-')&&Math.abs((s.min.x+s.max.x)/2-x)<.05&&Math.abs((s.min.z+s.max.z)/2-z)<.05))this.staticPart([x,height/2,z],[.22,height,.18],f.graphite);this.staticPart([x*.994,height-.86,z],[.035,.13,.7],f.light);}}
  for(const x of[-half*.55,half*.55])for(const z of[-10,-4,3,10]){this.staticPart([x,height-.26,z],[.43,.22,3.4],f.aluminum,undefined,true);this.staticPart([x,height-.39,z],[.25,.035,3.08],f.light);}
  if(this.core.number===1){
   for(const x of[-8,-4,0,4,8])this.staticPart([x,3.5,.015],[.065,7,.16],f.graphite);
   for(const y of[.08,6.93])this.staticPart([0,y,.015],[16,.12,.2],f.aluminum);
   // Restrained etched registration marks establish that the divider is glass without world-space prose.
   for(let x=-7;x<=7;x+=2)for(const sign of[-1,1])this.staticPart([x,.95,sign*.087],[.15,.025,.002],f.white);
   
  }else{
   
   // Guard rails stop short of the actual high-wall landing corridor, preserving its clear flight envelope.
   for(const z of[1.02])for(const x of[-5.1,5.1]){this.staticPart([x,3.94,z],[3.7,.055,.065],f.aluminum);for(const px of[x-1.8,x+1.8])this.staticPart([px,3.91,z],[.055,1.02,.055],f.graphite);}
   for(const x of[-7.02,7.02])for(const z of[-6,-3,.9])this.staticPart([x,3.94,z],[.055,1.06,.055],f.graphite);
   for(const x of[-7.02,7.02])this.staticPart([x,4.45,-3],[.055,.055,8],f.aluminum);
   this.staticPart([0,3.1,1.04],[14,.58,.11],f.graphite);this.staticPart([0,3.43,1.06],[14,.035,.04],f.warm);
   // Low service lights expose the depth of the enclosed pit.
   for(const x of[-8.88,8.88])for(const z of[-10,-3,4,11]){this.staticPart([x,-5.8,z],[.04,.46,.18],f.warm);}
  }
  // Small inlaid bay number: architectural wayfinding rather than floating labels.
  const plaque=this.label(this.core.number===1?'01':'02',.5,.4,'#252b30','#bbc4c6',160);plaque.position.set(-half+.14,1.55,11);plaque.rotation.y=Math.PI/2;this.root.add(plaque);
  for(const s of b.surfaces){const visualMaterial=this.core.number===1?this.material(new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})):f.white;const face=this.mesh(this.geo(new T.PlaneGeometry(s.width,s.height)),visualMaterial);face.matrix.copy(poseMatrix(s.center.clone().addScaledVector(s.normal,this.core.number===1?.05:.008),s.normal,s.up));face.matrix.decompose(face.position,face.quaternion,face.scale);face.userData.surface=s.id;this.targets.unshift(face);
   // Full eligible wall regions are integrated surfaces, not labelled predetermined rectangles.

  }
 }
 private doorSurround(x:number,y:number,z:number,width:number,axis:'x'|'z'){
  const f=this.finishes,push=(u:number,h:number,d:number,size:number[],mat:T.Material,round=false)=>this.staticPart(axis==='x'?[x+d,y+h,z-u]:[x+u,y+h,z+d],axis==='x'?[size[2],size[1],size[0]]:size,mat,undefined,round);
  for(const side of[-1,1]){push(side*(width/2+.16),1.65,0,[.32,3.3,.4],f.graphite,true);push(side*(width/2-.02),1.5,.22,[.04,2.85,.08],f.aluminum);push(side*(width/2+.31),1.55,.11,[.055,.64,.065],f.warm);}
  push(0,3.27,0,[width+.65,.3,.43],f.graphite,true);push(0,3.29,.24,[.72,.09,.035],f.warm);push(0,.016,0,[width+.2,.035,.45],f.aluminum);
 }
 private mechanisms(){const f=this.finishes;this.doors=[];this.buttons=new Map();
  for(const d of this.core.machines.devices.filter(d=>d.spec.kind==='shutter')){const alongX=d.spec.size[0]<d.spec.size[2],w=Math.max(d.spec.size[0],d.spec.size[2]),h=d.spec.size[1],depth=Math.min(d.spec.size[0],d.spec.size[2]);this.doorSurround(d.spec.position[0]+(alongX?depth*.55:0),d.spec.position[1]-h/2,d.spec.position[2]+(alongX?0:depth*.55),w,alongX?'x':'z');const leaf=new T.Group();leaf.position.copy(d.position);if(alongX)leaf.rotation.y=Math.PI/2;this.root.add(leaf);
   this.part(leaf,[0,0,0],[w,h,depth],f.graphite,.035);
   for(const side of[-1,1]){this.part(leaf,[side*w*.25,0,depth*.55],[w*.475,h-.14,.09],f.ceramic,.035);this.part(leaf,[side*.075,0,depth*.75],[.055,.55,.055],f.aluminum,.01);}
   for(const y of[-h*.34,h*.34])this.part(leaf,[0,y,depth*.75],[w-.16,.025,.035],f.graphite,.004);
   const status=this.material(new T.MeshStandardMaterial({color:0xedb54f,emissive:0xffb437,emissiveIntensity:1.4}));this.part(leaf,[0,h*.42,depth*.75],[.45,.06,.035],status,.006);leaf.traverse(o=>{if(o instanceof T.Mesh)this.targets.push(o);});this.doors.push({state:d,leaf,indicators:[status]});
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
  if(this.core.pads.length){this.circuitGlow=this.material(new T.MeshStandardMaterial({color:0x68593b,emissive:0xffb541,emissiveIntensity:.18,roughness:.4,metalness:.5}));const pad=this.core.pads[0].pos,door=this.core.machines.devices.find(d=>d.spec.kind==='shutter')!,points=[V(pad.x,.018,pad.z),V(door.spec.position[0]+.35,.018,pad.z),V(door.spec.position[0]+.35,.018,door.spec.position[2])];const line=new T.CurvePath<T.Vector3>();for(let i=1;i<points.length;i++)line.add(new T.LineCurve3(points[i-1],points[i]));this.mesh(this.geo(new T.TubeGeometry(line,32,.018,6,false)),this.circuitGlow);}
 }
 private pressed(p:{crateId?:string}){return (p as {pressed?:boolean}).pressed??!!p.crateId;}
 private lighting(){
  for(const child of [...this.scene.children])if(child instanceof T.Light||child.userData.chamberLight){if(child instanceof T.SpotLight||child instanceof T.DirectionalLight)child.shadow.dispose();this.scene.remove(child);}
  RectAreaLightUniformsLib.init();this.scene.background=new T.Color(0x10151a);this.scene.fog=new T.Fog(0x10151a,38,70);this.scene.environmentIntensity=.48;this.renderer.toneMappingExposure=1.08;
  this.scene.add(new T.HemisphereLight(0xcbdce5,0x3b3028,.48));
  const ceiling=this.core.number===1?7:11;
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
  this.ownedGeometries?.forEach(g=>g.dispose());this.ownedMaterials?.forEach(m=>m.dispose());this.ownedTextures?.forEach(t=>t.dispose());this.ownedGeometries=new Set();this.ownedMaterials=new Set();this.ownedTextures=new Set();this.batches=new Map();this.cratePieces=new Map();this.prepareFinishes();this.architecture();this.mechanisms();this.flushBatches();for(const c of this.core.crates)this.createCrate(c.id);this.buildPortalVisuals();this.lighting();
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
  const tool=this.instrument=new T.Group();this.viewScene.add(tool);tool.position.set(.43,-.37,-.92);tool.scale.setScalar(.58);tool.rotation.set(.15,.32,-.055);const f=this.finishes;
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
 fire(index:number){this.recoil=.032;this.pulse=.16;this.shotIndex=index;}
 override renderLinkedViews(){this.portalRenderer??=new PortalRenderer(this.renderer,this.scene);if(!this.software||this.frame++%3===0)this.portalRenderer.render(this.camera,this.core.portals,this.portalViews);}
 override resize(){super.resize();if(this.viewCamera){this.viewCamera.aspect=this.camera.aspect;this.viewCamera.updateProjectionMatrix();}}
 override setWorld(world:RiftWorld|CoreWorld){super.setWorld(world as unknown as RiftWorld);this.viewScene=undefined;this.viewCamera=undefined;this.instrument=undefined;this.buildInstrument();this.lastPortalSignature=undefined;this.recoil=0;}
 override update(dt:number){
  this.artClock=(this.artClock??0)+dt;const signature=this.core.portals.map(p=>p?p.surfaceId+':'+p.center.toArray().map(v=>v.toFixed(2)).join(','):'').join('|');if(this.lastPortalSignature!==undefined&&signature!==this.lastPortalSignature)this.recoil=.035;this.lastPortalSignature=signature;this.recoil=Math.max(0,(this.recoil??0)-dt*.17);
  for(const d of this.doors){d.leaf.position.copy(d.state.position);for(const m of d.indicators){m.color.set(d.state.progress>.85?0x96c7a1:0xedb54f);m.emissive.set(d.state.progress>.85?0x68bb88:0xffb437);}}
  for(const p of this.core.pads){const art=this.buttons.get(p.id)!;art.top.position.y=art.restY-(this.pressed(p)?.065:0);art.lights.emissiveIntensity=this.pressed(p)?2:.22;}
  if(this.circuitGlow)this.circuitGlow.emissiveIntensity=this.core.pads.some(p=>this.pressed(p))?2.6:.10;
  for(let i=0;i<2;i++){const p=this.core.portals[i],light=this.portalLights[i];light.intensity=p?7:0;if(p)light.position.copy(p.center).addScaledVector(p.normal,.28);}
  this.syncCratePieces();
  super.update(dt);
  for(const c of this.core.crates){const visual=this.crateVisuals.get(c.id);if(visual&&c.rotation)visual.quaternion.copy(c.rotation);}
  if(this.instrument&&this.viewScene&&this.viewCamera){const speed=Math.hypot(this.core.player.vel.x,this.core.player.vel.z),sway=this.reducedMotion?0:Math.sin(this.artClock*7)*Math.min(.004,speed*.0008);this.instrument.position.set(.43,-.37+sway,(this.core.heldId?-.88:-.92)+this.recoil);this.instrument.rotation.z=-.055+(this.reducedMotion?0:Math.sin(this.artClock*1.4)*.003);this.instrumentA!.emissiveIntensity=this.core.portals[0]?2.8:.25;this.instrumentB!.emissiveIntensity=this.core.portals[1]?2.8:.25;const color=this.shotIndex===1?0xffb23d:0x49ccef;this.emitterCore!.emissive.set(color);this.emitterCore!.emissiveIntensity=1.3+(this.pulse??0)*12;this.pulse=Math.max(0,(this.pulse??0)-dt);const clear=this.renderer.autoClear;this.renderer.autoClear=false;this.renderer.clearDepth();this.renderer.render(this.viewScene,this.viewCamera);this.renderer.autoClear=clear;}
 }
}
