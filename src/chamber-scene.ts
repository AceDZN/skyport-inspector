/** Original enclosed chamber art and rigid handheld instrument. Collision/state belong to ChamberWorld. */
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {RiftScene} from './scene';
import {poseMatrix,portalMatrix,V,type RiftWorld} from './physics';
import type {CoreWorld} from './core/world';
import {PortalRenderer} from './core/portal-renderer';
import {preloadHeroAssets,heroAssetStatus,requireHeroAssets,instantiateHero,cloneHeroMaterial,heroBounds,disposeHeroAssets,type HeroInstance} from './hero-assets';
/** Read adapter only: the Rapier core owns physics; RiftScene receives its existing render shape. */
export type ChamberSceneWorld=CoreWorld;
import type {DeviceState} from './systems';

type Batch={geometry:T.BufferGeometry;material:T.Material;matrices:T.Matrix4[]};
type DoorArt={state:DeviceState;leaf:T.Group;indicators:T.MeshStandardMaterial[];inputs:{id:string;lamp:T.MeshStandardMaterial}[]};
type CratePieces={source:T.Material[];copies:{group:T.Group;materials:T.Material[]}[];release?:()=>void};
type ButtonArt={top:T.Mesh;lights:T.MeshStandardMaterial;restY:number;plungers?:T.Group;plungerRestY:number;flush?:boolean};
type MachineDisplay={canvas:HTMLCanvasElement;texture:T.CanvasTexture;key:string;title:string};
type BeltArt={canvas:HTMLCanvasElement;texture:T.CanvasTexture;direction:T.Vector3;reversed:boolean;lastTime:number;rollers:T.Mesh[];radius:number};
type MachineArt={state:DeviceState;body:T.Group;display:MachineDisplay;lever?:T.Group;lamp:T.MeshStandardMaterial;belt?:BeltArt};
type OpticalLamp={id:string;kind:'emitter'|'receiver';material:T.MeshStandardMaterial;preserveBase?:boolean};
type BeamArt={core:T.Mesh;halo:T.Mesh;impact:T.Mesh};
type FootprintArt={patch:T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>;outline:T.LineSegments<T.BufferGeometry,T.LineBasicMaterial>;opacity:number;key:string;centre:T.Vector3};

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
 declare private ownedProjectorSerial:number;
 declare private ownedProjectorLateDiscards:number;
 declare private ownedProjectorCleanup:(()=>void)|undefined;
 declare private ownedProjectorDiag:Record<string,unknown>|undefined;
 declare private beamPieces:BeamArt[];
 declare private beamGeometry:T.CylinderGeometry|undefined;
 declare private beamCoreMaterial:T.MeshBasicMaterial|undefined;
 declare private beamHaloMaterial:T.MeshBasicMaterial|undefined;
 declare private portalLights:T.PointLight[];
 declare private portalRenderer:PortalRenderer|undefined;
 declare private refreshLinkedViews:boolean;
 declare private heldFootprintArt:FootprintArt|undefined;
 declare private viewScene:T.Scene|undefined;
 declare private viewCamera:T.PerspectiveCamera|undefined;
 declare private instrument:T.Group|undefined;
 declare private heroInstances:Set<HeroInstance>;
 declare private heroGun:HeroInstance|undefined;
 declare private lastPortalSignature:string|undefined;
 declare private recoil:number;
 declare private artClock:number;
 declare private pulse:number;
 declare private shotIndex:number;

 static preloadHeroAssets(){return preloadHeroAssets();}
 static heroAssetStatus(){return heroAssetStatus();}
 static disposeHeroAssets(){disposeHeroAssets();}
 constructor(canvas:HTMLCanvasElement,world:ChamberSceneWorld){
  requireHeroAssets();
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
  const wall=this.surfaceTextures(),floor=this.surfaceTextures(true),finished=this.core.number>=6,service=finished?this.serviceTextures():{normalMap:wall.normalMap},panelColors:Record<string,number>={'l-gallery':0x7d8587,'bridge-rotunda':0x748088,'lift-shaft':0x828684,'dual-vault':0x78847d,'relay-garden':0x7c827e,'return-loop':0x727b80,'conveyor-bay':0x707d82,'launch-spire':0x7b807b};
  this.finishes={
   ceramic:this.material(new T.MeshStandardMaterial({...wall,color:finished?0xf0f7ff:0xffffff,roughness:.78,metalness:.03,normalScale:new T.Vector2(.6,.6)})),
   white:this.material(new T.MeshStandardMaterial({...wall,color:finished?0xebf4fc:0xe7e8e0,roughness:.62,metalness:.04,normalScale:new T.Vector2(.35,.35)})),
   floor:this.material(new T.MeshStandardMaterial({...floor,color:0xffffff,roughness:this.core.number===5?.54:finished?.65:.7,metalness:this.core.number===5?.36:finished?.26:.42,normalScale:new T.Vector2(this.core.number===5?.62:finished?.55:.8,this.core.number===5?.62:finished?.55:.8)})),
   panel:this.material(new T.MeshStandardMaterial({...service,color:panelColors[this.core.blueprint.family]??0x7c8583,roughness:.88,metalness:.06,normalScale:new T.Vector2(.45,.45)})),
   panelQuiet:this.material(new T.MeshStandardMaterial({color:({'lift-shaft':0x666e6b,'relay-garden':0x656a65,'conveyor-bay':0x606b70,'launch-spire':0x646a68,'dual-vault':0x626c67}as Record<string,number>)[this.core.blueprint.family]??0x636b6e,roughness:.83,metalness:.08,normalMap:wall.normalMap,normalScale:new T.Vector2(.16,.16)})),
   machine:this.material(new T.MeshStandardMaterial({color:0x737c77,roughness:.48,metalness:.56})),
   graphite:this.material(new T.MeshStandardMaterial({color:0x20262c,roughness:.44,metalness:.72})),
   recess:this.material(new T.MeshStandardMaterial({color:0x10161b,roughness:.8,metalness:.28})),
   aluminum:this.material(new T.MeshStandardMaterial({color:0x77858b,roughness:.31,metalness:.86})),
   rubber:this.material(new T.MeshStandardMaterial({color:0x10151a,roughness:.9,metalness:0})),
   red:this.material(new T.MeshStandardMaterial({color:0x7c2623,roughness:.38,metalness:.2})),
   light:this.material(new T.MeshStandardMaterial({color:this.core.number===5?0xffeed8:0xe9f0ed,emissive:this.core.number===5?0xffd49b:0xd9edf6,emissiveIntensity:3.4,roughness:.4})),
   warm:this.material(new T.MeshStandardMaterial({color:0xe4bd72,emissive:0xffbe59,emissiveIntensity:1.8,roughness:.4})),
   ...(this.core.number===25?{freightService:this.material(new T.MeshStandardMaterial({color:0x878f8a,roughness:.78,metalness:.10,normalMap:wall.normalMap,normalScale:new T.Vector2(.12,.12)}))}:{}),
  };
 }
 private serviceTextures(){
  // Original shallow pressed-metal ribs: distinct material language, not new collision geometry.
  const n=256,base=document.createElement('canvas'),normal=document.createElement('canvas');base.width=normal.width=base.height=normal.height=n;const b=base.getContext('2d')!,c=normal.getContext('2d')!,color=b.createImageData(n,n),vectors=c.createImageData(n,n),height=new Float32Array(n),tone=new Float32Array(n);
  for(let x=0;x<n;x++){const phase=(x%16)/16,trough=Math.exp(-Math.pow((phase-.10)/.085,2));height[x]=.012*(1-trough);tone[x]=216-75*trough+10*Math.exp(-Math.pow((phase-.28)/.08,2));}
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4,v=tone[x]+((x*17+y*13)%11-5)*.3,direction=V((height[(x+n-1)%n]-height[(x+1)%n])*18,0,1).normalize();color.data.set([v,v,v,255],i);vectors.data.set([128+direction.x*127,128,128+direction.z*127,255],i);}
  b.putImageData(color,0,0);c.putImageData(vectors,0,0);const map=this.texture(new T.CanvasTexture(base)),normalMap=this.texture(new T.CanvasTexture(normal));map.colorSpace=T.SRGBColorSpace;for(const texture of[map,normalMap]){texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());}return{map,normalMap};
 }
 private floorGeometry(size:T.Vector3,pos:T.Vector3){const g=this.geo(new T.BoxGeometry(size.x,size.y,size.z)),a=g.getAttribute('position'),uv=g.getAttribute('uv'),normal=g.getAttribute('normal');for(let i=0;i<a.count;i++){if(Math.abs(normal.getY(i))>.5)uv.setXY(i,(a.getX(i)+pos.x)/2,(a.getZ(i)+pos.z)/2);else uv.setXY(i,(a.getX(i)+pos.x)/2,(a.getY(i)+pos.y)/2);}return g;}
 private fittedBlueprintMark(text:string,width:number,height:number){
  // Blueprint prose is often much wider than it is tall. Fit the exact inherited label canvas,
  // leaving all other C1/device label() callers and its line placement unchanged.
  const measure=document.createElement('canvas');measure.width=1024;measure.height=Math.round(1024*height/width);const context=measure.getContext('2d')!,lines=text.split('\n');
  let font=Math.max(1,Math.min(220,Math.floor(measure.height*.72/Math.max(1,lines.length))));context.font=`bold ${font}px Arial`;
  const widest=Math.max(1,...lines.map(line=>context.measureText(line).width));font=Math.max(1,Math.floor(font*Math.min(1,920/widest)));
  return this.label(text,width,height,'#20292e','#c7d3d6',font);
 }
 private wallCladding(min:T.Vector3,max:T.Vector3,axis:'x'|'z',sign:number,solidID=''){
  const a=axis==='x'?'z':'x',u1=min[a],u2=max[a],y1=min.y,y2=max.y,plane=sign>0?max[axis]:min[axis];
  const freight=this.core.number===25&&axis==='z'&&['hatch-front-west','hatch-front-east','hatch-header'].includes(solidID);
  const regions=this.core.surfaces.filter(s=>!s.floor&&s.normal[axis]===sign&&Math.abs(s.center[axis]-plane)<.15).map(s=>({u1:s.center[a]-s.width/2,u2:s.center[a]+s.width/2,y1:s.center.y-s.height/2,y2:s.center.y+s.height/2})).filter(r=>r.u2>u1&&r.u1<u2&&r.y2>y1&&r.y1<y2);
  const cols=Math.max(1,Math.ceil((u2-u1)/2)),rows=Math.max(1,Math.ceil((y2-y1)/2)),cuts=(base:number[],extra:number[],lo:number,hi:number)=>[...new Set([...base,...extra.filter(v=>v>lo+.001&&v<hi-.001)].map(v=>Math.round(v*1e5)/1e5))].sort((a,b)=>a-b);
  const us=cuts(Array.from({length:cols+1},(_,i)=>u1+(u2-u1)*i/cols),[...regions.flatMap(r=>[r.u1,r.u2]),...(freight?[-7.64,-7.4,-4.6,-4.36]:[])],u1,u2),ys=cuts(Array.from({length:rows+1},(_,i)=>y1+(y2-y1)*i/rows),[...regions.flatMap(r=>[r.y1,r.y2]),...(freight?[1.1,3,3.24,6]:[])],y1,y2);
  for(let u=0;u<us.length-1;u++)for(let v=0;v<ys.length-1;v++){
   const cw=us[u+1]-us[u],ch=ys[v+1]-ys[v],pu=(us[u]+us[u+1])/2,py=(ys[v]+ys[v+1])/2;if(cw<.005||ch<.005)continue;
   const behindPortal=regions.some(r=>us[u]>=r.u1-.001&&us[u+1]<=r.u2+.001&&ys[v]>=r.y1-.001&&ys[v+1]<=r.y2+.001);
   const ceramic=this.core.level.architecture.style==='ceramic';
   if(!ceramic&&behindPortal)continue;
   const p=axis==='x'?[plane+sign*.015,py,pu]:[pu,py,plane+sign*.015],gap=Math.min(.025,cw*.1,ch*.1),sz=axis==='x'?[.045,ch-gap,cw-gap]:[cw-gap,ch-gap,.045];
   // Service infill stays decisively mid-value. Broad quiet plates alternate with ribbed service lanes;
   // only the exact authored host cells receive clean white ceramic.
   const family=this.core.blueprint.family,quiet=family==='conveyor-bay'?(v===0||u%4===3):family==='relay-garden'||family==='lift-shaft'||family==='bridge-rotunda'?u%3!==1:family==='launch-spire'?(u%4!==1||v%4===0):v%2===0;
   let service=quiet?this.finishes.panelQuiet:this.finishes.panel;
   if(freight){const frame=(py<3.24&&((pu>=-7.64&&pu<=-7.4)||(pu>=-4.6&&pu<=-4.36)))||(py>=3&&py<=3.24&&pu>=-7.4&&pu<=-4.6);service=frame?this.finishes.graphite:py<1.1?this.finishes.panelQuiet:py<6?this.finishes.freightService:this.finishes.panel;}
   this.staticPart(p,sz,ceramic&&(this.core.number===1||behindPortal)?this.finishes.ceramic:this.core.number>=6?service:this.finishes.graphite,undefined,true);
   if(cw>1.2&&ch>1.2&&(this.core.number<6||behindPortal)){for(const su of[-1,1])for(const sy of[-1,1]){const bolt=axis==='x'?[plane+sign*.042,py+sy*(ch/2-.09),pu+su*(cw/2-.09)]:[pu+su*(cw/2-.09),py+sy*(ch/2-.09),plane+sign*.042];this.staticPart(bolt,axis==='x'?[.009,.022,.022]:[.022,.022,.009],this.finishes.graphite);}}
  }
  // Continuous kick plate and top service channel, in the same physical wall plane.
  for(const [y,h]of[[Math.max(y1+.23,.23),.42],[y2-.25,.45]]){
   if(y<y1||y>y2)continue;if(this.core.number>5&&regions.some(r=>r.y1<y+h/2&&r.y2>y-h/2))continue;const p=axis==='x'?[plane+sign*.04,y,(u1+u2)/2]:[(u1+u2)/2,y,plane+sign*.04];this.staticPart(p,axis==='x'?[.09,h,u2-u1]:[u2-u1,h,.09],this.finishes.graphite);
  }
 }
 private finishSplitGallery(min:T.Vector3,max:T.Vector3){
  const f=this.finishes,width=max.x-min.x,height=max.y-min.y,front=max.z,panel=this.material(new T.MeshStandardMaterial({color:0x55564e,roughness:.62,metalness:.3,normalMap:f.ceramic.normalMap,roughnessMap:f.ceramic.roughnessMap,normalScale:new T.Vector2(.28,.28)}));
  // Flush finish on the real retaining wall. Every front detail remains below its physical lip.
  const face=(x:number,y:number,w:number,h:number,material:T.Material,bias=.008)=>{const m=this.mesh(this.geo(new T.PlaneGeometry(w,h)),material);m.position.set(x,y,front+bias);return m;};
  const count=4,bay=(width-.24)/count;for(let i=0;i<count;i++){const x=min.x+.12+bay*(i+.5);face(x,min.y+height/2,bay-.07,height-.48,panel);}
  for(let i=0;i<=count;i++)face(min.x+.12+bay*i,min.y+height/2,.045,height-.24,f.aluminum,.011);
  face((min.x+max.x)/2,min.y+.13,width-.10,.10,f.graphite,.012);face((min.x+max.x)/2,max.y-.10,width-.10,.16,f.graphite,.012);face((min.x+max.x)/2,max.y-.055,width-.18,.027,f.warm,.014);
  // Walking-edge inlay is flat on the existing floor, never a rail across the aimed high portal.
  const inlay=this.material(new T.MeshStandardMaterial({color:0xc8b17a,roughness:.42,metalness:.65}));
  for(let i=0;i<8;i++){const mark=this.mesh(this.geo(new T.PlaneGeometry((width-.16)/8-.055,.10)),inlay);mark.rotation.x=-Math.PI/2;mark.position.set(min.x+.08+(i+.5)*(width-.16)/8,max.y+.003,front-.105);mark.castShadow=false;}
 }
 private finishFreightStairs(steps:{mesh:T.Mesh;min:T.Vector3;max:T.Vector3;id:string}[]){
  // Keep each original exact box in targets with its solid ID; only its visible drawing is replaced.
  const pieces:T.BufferGeometry[][]=[[],[],[]],ids=steps.map(s=>s.id);
  const top=(x1:number,x2:number,z1:number,z2:number,y:number)=>{const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([x1,y,z1,x1,y,z2,x2,y,z2,x2,y,z1],3));geometry.setAttribute('normal',new T.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3));geometry.setAttribute('uv',new T.Float32BufferAttribute([x1/2,z1/2,x1/2,z2/2,x2/2,z2/2,x2/2,z1/2],2));geometry.setIndex([0,1,2,0,2,3]);return geometry;};
  for(const s of steps){const body=s.mesh.geometry.clone(),index=body.getIndex()!,kept:number[]=[];for(const group of body.groups)if(group.materialIndex!==2)for(let i=group.start;i<group.start+group.count;i++)kept.push(index.getX(i));body.clearGroups();body.setIndex(kept);body.translate(s.mesh.position.x,s.mesh.position.y,s.mesh.position.z);pieces[0].push(body);const nose=s.min.z+.012;pieces[1].push(top(s.min.x,s.max.x,nose,s.max.z,s.max.y));pieces[2].push(top(s.min.x,s.max.x,s.min.z,nose,s.max.y));}
  const materials=[this.finishes.freightService,this.finishes.floor,this.finishes.aluminum];
  for(let i=0;i<pieces.length;i++){const geometry=mergeGeometries(pieces[i],false);if(!geometry)throw Error('Freight stair finish merge failed');const mesh=this.mesh(this.geo(geometry),materials[i]);mesh.name='freight-stairs-'+['bodies','treads','nosings'][i];mesh.userData.sourceSolids=ids;mesh.userData.finishOnly=true;for(const part of pieces[i])part.dispose();}
 }
 private ceilingFinishZones(){
  const ids=this.core.number===46?['twin-shaft-ceiling']:this.core.number===48?['question-roof']:this.core.number===50?['vault-roof','transfer-roof']:[],zones:{id:string;x1:number;x2:number;z1:number;z2:number;y:number}[]=[];
  type Zone=typeof zones[number];
  const subtract=(parts:Zone[],cut:{x1:number;x2:number;z1:number;z2:number})=>parts.flatMap(r=>{const x1=Math.max(r.x1,cut.x1),x2=Math.min(r.x2,cut.x2),z1=Math.max(r.z1,cut.z1),z2=Math.min(r.z2,cut.z2);if(x2<=x1||z2<=z1)return[r];return[{...r,x2:x1},{...r,x1:x2},{...r,x1,x2,z2:z1},{...r,x1,x2,z1:z2}].filter(q=>q.x2-q.x1>.001&&q.z2-q.z1>.001);});
  for(const id of ids){const roof=this.core.solids.find(s=>s.id===id);if(!roof)continue;let parts:Zone[]=[{id,x1:roof.min.x+.45,x2:roof.max.x-.45,z1:roof.min.z+.45,z2:roof.max.z-.45,y:roof.min.y}];
   // Hardware stays on actual slab area, clear of every full-height opaque/glazed partition.
   for(const solid of this.core.solids){if(solid===roof||solid.max.y<roof.min.y-.01||solid.min.y>roof.min.y-.10)continue;parts=subtract(parts,{x1:solid.min.x-.06,x2:solid.max.x+.06,z1:solid.min.z-.06,z2:solid.max.z+.06});}
   for(const prior of zones)if(Math.abs(prior.y-roof.min.y)<.01)parts=subtract(parts,prior);
   zones.push(...parts);
  }
  return zones;
 }
 private ceilingLuminaireMounts(){
  const specs=this.core.number===46?[[3,7,'twin-shaft-ceiling'],[1,-6,'twin-shaft-ceiling'],[18.5,-6,'twin-shaft-ceiling'],[26.5,-6,'twin-shaft-ceiling']]:this.core.number===48?[[0,11,'question-roof'],[-11,-4,'question-roof'],[2,-4,'question-roof'],[15,-4,'question-roof']]:this.core.number===50?[[1,7,'vault-roof'],[23,-6,'vault-roof'],[3.5,24,'transfer-roof'],[8.5,36,'transfer-roof']]:[],zones=this.ceilingFinishZones();
  const mounts:{x:number;y:number;z:number;roof:string}[]=[];
  for(const[rawX,rawZ,rawID]of specs){const x=rawX as number,z=rawZ as number,id=rawID as string,roof=this.core.solids.find(s=>s.id===id);if(!roof)continue;const w=3.88,d=1.18,area=w*d,covered=zones.filter(r=>r.id===id).reduce((sum,r)=>sum+Math.max(0,Math.min(r.x2,x+w/2)-Math.max(r.x1,x-w/2))*Math.max(0,Math.min(r.z2,z+d/2)-Math.max(r.z1,z-d/2)),0);
   if(covered>=area-1e-5)mounts.push({x,y:roof.min.y,z,roof:id});
  }
  return mounts;
 }
 private slabCeilingHardware(){
  const f=this.finishes;
  for(const r of this.ceilingFinishZones()){
   if(r.x2-r.x1<.6||r.z2-r.z1<.6)continue;
   for(let x=r.x1;x<r.x2-.05;x+=2)for(let z=r.z1;z<r.z2-.05;z+=4){const w=Math.min(2,r.x2-x),d=Math.min(4,r.z2-z);if(w<.6||d<.6)continue;this.staticPart([x+w/2,r.y-.08,z+d/2],[w-.04,.12,d-.06],f.graphite,undefined,true);this.staticPart([x+w/2,r.y-.16,z+d/2],[w-.23,.045,d-.28],f.panelQuiet);}
   for(let z=r.z1+.10;z<r.z2-.08;z+=4)this.staticPart([(r.x1+r.x2)/2,r.y-.3,z],[r.x2-r.x1-.04,.24,.18],f.graphite);
  }
  for(const p of this.ceilingLuminaireMounts()){
   for(const side of[-1,1])this.staticPart([p.x+side*1.33,p.y-.075,p.z],[.045,.15,.045],f.graphite);
   this.staticPart([p.x,p.y-.26,p.z],[3.8,.22,1.1],f.aluminum,undefined,true);this.staticPart([p.x,p.y-.375,p.z],[3.66,.035,.98],f.light);
  }
 }
 private architecture(){
  const f=this.finishes,b=this.core.blueprint,{height,halfWidth:half,style}=this.core.level.architecture,freightSteps:{mesh:T.Mesh;min:T.Vector3;max:T.Vector3;id:string}[]=[];
  for(const s of this.core.solids){const size=s.max.clone().sub(s.min),p=s.min.clone().add(s.max).multiplyScalar(.5);
   if(s.kind==='glass'){const m=this.material(new T.MeshPhysicalMaterial({color:0xc3d3d8,transparent:true,opacity:.10,roughness:.08,metalness:.1,clearcoat:1,envMapIntensity:.75,depthWrite:false,side:T.DoubleSide}));const pane=this.mesh(this.geo(new T.BoxGeometry(size.x,size.y,size.z)),m);pane.position.copy(p);pane.castShadow=false;continue;}
   const ceiling=/ceiling/.test(s.id),raised=s.kind==='floor'&&size.y>1&&s.id!=='raised-cube-alcove',guide=/guide/.test(s.id)&&size.y>2&&size.x<1&&size.z<1,opticalHousing=/emitter-housing|receiver-pillar|receiver-optic-body/.test(s.id),mat=s.kind==='floor'?(raised?f.graphite:f.floor):ceiling?(this.core.number>=6?f.panelQuiet:f.recess):guide&&this.core.number>=6?f.machine:f.graphite;const mesh=this.mesh(s.kind==='floor'?this.floorGeometry(size,p):opticalHousing?this.rounded(size.x,size.y,size.z,.035):this.geo(new T.BoxGeometry(size.x,size.y,size.z)),mat);mesh.position.copy(p);mesh.userData.solid=s.id;this.targets.push(mesh);
   if(this.core.number===25&&s.id.startsWith('freight-return-step-')){mesh.visible=false;mesh.name='aim-only:'+s.id;mesh.userData.aimOnly=true;freightSteps.push({mesh,min:s.min,max:s.max,id:s.id});}
   if(raised){
    // A raised gallery is built architecture: metal walking surface over a panelled retaining structure.
    for(const axis of['x','z']as const)for(const sign of[-1,1]){if(this.core.number===5&&s.id==='upper-gallery'&&axis==='z'&&sign===1)continue;this.wallCladding(s.min,s.max,axis,sign);}
    if(this.core.number===5&&s.id==='upper-gallery')this.finishSplitGallery(s.min,s.max);
    const topGeometry=this.geo(new T.PlaneGeometry(size.x,size.z)),a=topGeometry.getAttribute('position'),uv=topGeometry.getAttribute('uv');for(let i=0;i<a.count;i++)uv.setXY(i,(a.getX(i)+p.x)/2,(-a.getY(i)+p.z)/2);const top=this.mesh(topGeometry,f.floor);top.rotation.x=-Math.PI/2;top.position.set(p.x,s.max.y+.002,p.z);this.targets.push(top);
    for(const x of[s.min.x+.03,s.max.x-.03])this.staticPart([x,s.max.y+.005,p.z],[.045,.01,size.z-.05],f.aluminum);
    for(const z of[s.min.z+.03,s.max.z-.03])this.staticPart([p.x,s.max.y+.005,z],[size.x-.05,.01,.045],f.aluminum);
    if(this.core.number!==5||s.id!=='upper-gallery')this.staticPart([p.x,s.max.y-.06,s.max.z+.035],[size.x-.15,.025,.022],f.warm);
   }
   if(s.id==='raised-cube-alcove'){this.wallCladding(s.min,s.max,'z',1);this.staticPart([p.x,s.max.y-.04,s.max.z+.04],[size.x,.12,.16],f.graphite);for(const x of[s.min.x+.08,s.max.x-.08])this.staticPart([x,p.y,s.max.z+.055],[.14,size.y,.14],f.graphite);}
   if(guide){const face=this.mesh(this.geo(new T.PlaneGeometry(size.x*.42,size.y-.1)),f.graphite);face.position.set(p.x,p.y,s.max.z+.001);for(let y=s.min.y+.3;y<s.max.y;y+=.6){const band=this.mesh(this.geo(new T.PlaneGeometry(size.x*.82,.035)),f.aluminum);band.position.set(p.x,y,s.max.z+.002);}}
   if(!ceiling&&s.kind==='wall'&&!s.id.startsWith('vestibule')&&!s.id.includes('service-inlay')){if(size.x<.7&&size.z>.8){this.wallCladding(s.min,s.max,'x',1,s.id);this.wallCladding(s.min,s.max,'x',-1,s.id);}else if(size.z<.7&&size.x>.8){this.wallCladding(s.min,s.max,'z',1,s.id);this.wallCladding(s.min,s.max,'z',-1,s.id);}}
  }
  if(freightSteps.length)this.finishFreightStairs(freightSteps);
  // Ceiling coffers have real depth and recessed perforated service lanes.
  if([46,48,50].includes(this.core.number))this.slabCeilingHardware();else for(let z=-14;z<14;z+=4){for(let x=-half+1;x<half;x+=2){this.staticPart([x,height-.08,z+1],[1.96,.12,3.94],f.graphite,undefined,true);this.staticPart([x,height-.16,z+1],[1.77,.045,3.72],this.core.number>=6?f.panelQuiet:f.recess);}this.staticPart([0,height-.3,z],[half*2,.24,.18],f.graphite);}
  for(const x of[-half+.12,half-.12]){if(this.core.number<=5)this.staticPart([x,height-.42,-1],[.28,.8,30],f.graphite);for(let z=-12;z<=12;z+=4){if(this.core.machines.devices.some(d=>d.spec.kind==='shutter'&&d.spec.size[0]<d.spec.size[2]&&Math.abs(d.spec.position[0]-x)<.5&&Math.abs(d.spec.position[2]-z)<d.spec.size[2]/2+.2))continue;const physical=this.core.solids.some(s=>s.id.startsWith('structural-rib-')&&Math.abs((s.min.x+s.max.x)/2-x)<.05&&Math.abs((s.min.z+s.max.z)/2-z)<.05);if(!physical&&this.core.number>5)continue;if(!physical)this.staticPart([x,height/2,z],[.22,height,.18],f.graphite);this.staticPart([x*.994,height-.86,z],[.035,.13,.7],f.light);}}
  if(![46,48,50].includes(this.core.number))for(const x of[-half*.55,half*.55])for(const z of[-10,-4,3,10]){this.staticPart([x,height-.26,z],[.43,.22,3.4],f.aluminum,undefined,true);this.staticPart([x,height-.39,z],[.25,.035,3.08],f.light);}
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
  for(const mark of b.marks){const sign=this.fittedBlueprintMark(mark.text,mark.width??1,mark.height??.22),normal=V(...(mark.normal??[0,0,1]));sign.position.set(...mark.position);
   // Door names belong on the front of the retraction pocket; wall-plane signs were occluded by it.
   const door=this.core.machines.devices.find(d=>d.spec.kind==='shutter'&&d.spec.label===mark.text&&Math.hypot(mark.position[0]-d.spec.position[0],mark.position[2]-d.spec.position[2])<1);
   if(door){sign.position.set(...door.spec.position).addScaledVector(normal,.56);sign.position.y=door.spec.position[1]+door.spec.size[1]/2+.53;}
   sign.quaternion.setFromRotationMatrix(poseMatrix(sign.position,normal,Math.abs(normal.y)>.9?V(0,0,-1):V(0,1,0)));this.root.add(sign);}
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
 private supportedFloorTrace(pad:T.Vector3,door:DeviceState){
  const floor=this.core.solids.filter(s=>s.kind==='floor'&&pad.x>=s.min.x&&pad.x<=s.max.x&&pad.z>=s.min.z&&pad.z<=s.max.z&&s.max.y<=pad.y+.01&&s.max.y>=pad.y-.3).sort((a,b)=>b.max.y-a.max.y)[0];if(!floor)return null;
  const supportY=floor.max.y,half=.018,inset=.025,floors=this.core.solids.filter(s=>s.kind==='floor'&&Math.abs(s.max.y-supportY)<.01),points=[[pad.x,pad.z],[door.spec.position[0]+.35,pad.z],[door.spec.position[0]+.35,door.spec.position[2]]],spans:{x1:number;x2:number;z1:number;z2:number;y:number}[]=[],vertices:number[]=[],normals:number[]=[],indices:number[]=[];
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],alongX=Math.abs(a[0]-b[0])>.0001,axis=alongX?'x':'z',cross=alongX?'z':'x',constant=a[alongX?1:0],start=Math.min(a[alongX?0:1],b[alongX?0:1]),end=Math.max(a[alongX?0:1],b[alongX?0:1]);if(end-start<.001)continue;
   // Require the whole paint width to have same-height static support. Catch floors and decks do not qualify.
   const intervals=floors.filter(s=>constant-half>=s.min[cross]+.002&&constant+half<=s.max[cross]-.002).map(s=>({lo:s.min[axis],hi:s.max[axis]})).sort((a,b)=>a.lo-b.lo),merged:{lo:number;hi:number}[]=[];
   for(const interval of intervals){const last=merged.at(-1);if(last&&interval.lo<=last.hi+.001)last.hi=Math.max(last.hi,interval.hi);else merged.push({...interval});}
   for(const interval of merged){const lo=Math.max(start,interval.lo+inset),hi=Math.min(end,interval.hi-inset);if(hi-lo<.01)continue;const span={x1:alongX?lo:constant-half,x2:alongX?hi:constant+half,z1:alongX?constant-half:lo,z2:alongX?constant+half:hi,y:supportY+.004},base=vertices.length/3;spans.push(span);vertices.push(span.x1,span.y,span.z1,span.x1,span.y,span.z2,span.x2,span.y,span.z2,span.x2,span.y,span.z1);for(let j=0;j<4;j++)normals.push(0,1,0);indices.push(base,base+1,base+2,base,base+2,base+3);}
  }
  if(!spans.length)return null;const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setIndex(indices);return{geometry,spans,supportY};
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
   const flush=this.core.machines.devices.some(d=>d.spec.kind==='conveyor'&&Math.abs(d.position.y+d.spec.size[1]/2-p.pos.y)<.005&&Math.abs(p.pos.x-d.position.x)<d.spec.size[0]/2&&Math.abs(p.pos.z-d.position.z)<d.spec.size[2]/2);
   if(flush){
    // The belt's visible skin is already +1mm: paint sits +2mm, below the native +4/+7mm cue.
    const red=this.material(f.red.clone()),top=this.mesh(this.geo(new T.CircleGeometry(.83,48)),red);top.rotation.x=-Math.PI/2;top.position.copy(p.pos).add(V(0,.002,0));top.name='flush-load-cell:'+p.id;top.castShadow=false;
    const rim=this.mesh(this.geo(new T.RingGeometry(.83,.96,48)),f.aluminum);rim.rotation.x=-Math.PI/2;rim.position.copy(p.pos).add(V(0,.002,0));rim.castShadow=false;
    const glow=this.material(new T.MeshStandardMaterial({color:0xb48a45,emissive:0xffb747,emissiveIntensity:.25}));
    for(let i=0;i<8;i++){const a=i*Math.PI/4,lamp=this.mesh(this.geo(new T.PlaneGeometry(.08,.025)),glow),point=p.pos.clone().add(V(Math.sin(a)*.9,.0028,Math.cos(a)*.9));lamp.matrix.copy(poseMatrix(point,V(0,1,0),V(Math.sin(a),0,Math.cos(a))));lamp.matrix.decompose(lamp.position,lamp.quaternion,lamp.scale);lamp.castShadow=false;}
    this.buttons.set(p.id,{top,lights:glow,restY:p.pos.y+.002,plungerRestY:p.pos.y,flush:true});
    const dummy=new T.Mesh(this.geo(new T.PlaneGeometry(.01,.01)),this.material(new T.MeshStandardMaterial()));dummy.visible=false;this.padVisuals.set(p.id,dummy);continue;
   }
   const base=this.mesh(this.geo(new T.CylinderGeometry(1.04,1.09,.14,48)),f.graphite);base.position.copy(p.pos).add(V(0,-.08,0));
   // Fixed contact disk and real annulus meet the native cylinder top exactly at p.y.
   const rim=this.mesh(this.geo(new T.CylinderGeometry(.96,1,.07,48,1,true)),f.aluminum);rim.position.copy(p.pos).add(V(0,-.035,0));
   const annulus=this.mesh(this.geo(new T.RingGeometry(.83,.96,48)),f.aluminum);annulus.rotation.x=-Math.PI/2;annulus.position.copy(p.pos);
   const red=this.material(f.red.clone()),top=this.mesh(this.geo(new T.CylinderGeometry(.83,.87,.11,48)),red);top.position.copy(p.pos).add(V(0,-.055,0));
   // Exposed peripheral sliders show pressure without moving the load-bearing contact plane.
   const plungers=new T.Group();plungers.position.copy(p.pos).add(V(0,-.04,0));this.root.add(plungers);
   for(let i=0;i<4;i++){const a=i*Math.PI/2,x=Math.sin(a)*1.115,z=Math.cos(a)*1.115,guide=new T.Group();guide.position.copy(p.pos).add(V(x,-.065,z));guide.rotation.y=a;this.root.add(guide);
    this.part(guide,[0,-.035,0],[.13,.025,.095],f.graphite,.008);for(const side of[-1,1])this.part(guide,[side*.047,0,0],[.014,.10,.026],f.aluminum,.004);
    const slider=new T.Group();slider.position.set(x,0,z);slider.rotation.y=a;plungers.add(slider);this.part(slider,[0,0,0],[.072,.032,.065],red,.006);this.part(slider,[0,-.035,0],[.025,.05,.025],f.graphite,.004);
   }
   const glow=this.material(new T.MeshStandardMaterial({color:0xb48a45,emissive:0xffb747,emissiveIntensity:.25}));
   for(let i=0;i<8;i++){const a=i*Math.PI/4;this.part(this.root,[p.pos.x+Math.sin(a)*1.018,p.pos.y-.015,p.pos.z+Math.cos(a)*1.018],[.12,.055,.04],glow,.008).rotation.y=a;}
   this.buttons.set(p.id,{top,lights:glow,restY:p.pos.y-.055,plungers,plungerRestY:p.pos.y-.04});
   const dummy=new T.Mesh(this.geo(new T.PlaneGeometry(.01,.01)),this.material(new T.MeshStandardMaterial()));dummy.visible=false;this.padVisuals.set(p.id,dummy);
  }
  this.circuitTraces=[];
  for(const door of this.core.machines.devices.filter(d=>d.spec.kind==='shutter'))for(const p of this.core.pads){const c=door.spec.circuit;if(![...c?.all??[],...c?.any??[]].includes(p.id))continue;
   const material=this.material(new T.MeshStandardMaterial({color:0x68593b,emissive:0xffb541,emissiveIntensity:.18,roughness:.4,metalness:.5}));if(this.core.number===47||this.core.number===50){const paint=this.supportedFloorTrace(p.pos,door);if(!paint)continue;const mesh=this.mesh(this.geo(paint.geometry),material);mesh.castShadow=false;mesh.name='floor-circuit-paint:'+p.id+':'+door.spec.id;mesh.userData.supportY=paint.supportY;this.circuitTraces.push({material,pad:p.id});continue;}const pad=p.pos,y=pad.y-.122,points=[V(pad.x,y,pad.z),V(door.spec.position[0]+.35,y,pad.z),V(door.spec.position[0]+.35,y,door.spec.position[2])],doorBase=door.spec.position[1]-door.spec.size[1]/2;if(Math.abs(doorBase-y)>.25)points.push(V(door.spec.position[0]+.35,doorBase+.018,door.spec.position[2]));const line=new T.CurvePath<T.Vector3>();for(let i=1;i<points.length;i++)line.add(new T.LineCurve3(points[i-1],points[i]));this.mesh(this.geo(new T.TubeGeometry(line,32,.018,6,false)),material);this.circuitTraces.push({material,pad:p.id});
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
    this.part(body,[0,0,0],[w,h,d],f.graphite,.035);const control=new T.Group();control.position.copy(V(...s.position).add(V(...(s.controlOffset??[0,0,0]))));const normal=V(...(s.controlFacing??s.direction??[0,0,1]));normal.y=0;if(normal.lengthSq()<.001)normal.set(0,0,1);control.quaternion.setFromUnitVectors(V(0,0,1),normal.normalize());this.root.add(control);
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
    this.part(body,[0,-.02,0],[w,Math.max(.04,h-.04),d],this.core.number===25&&s.id==='freight-carrier'?f.freightService:this.core.number>=6?f.machine:f.graphite,.035);
    for(const x of[-1,1])for(const z of[-1,1])this.part(body,[x*w/4,h/2-.015,z*d/4],[w/2-.11,.03,d/2-.11],f.floor,.008);
    for(const x of[-w/2+.045,w/2-.045])this.part(body,[x,h/2-.025,0],[.045,.05,d-.08],f.aluminum,.008);
    for(const z of[-d/2+.045,d/2-.045])this.part(body,[0,h/2-.025,z],[w-.08,.05,.045],f.aluminum,.008);
    for(const x of[-1,1])for(const z of[-1,1]){this.part(body,[x*(w/2-.16),h/2+.002,z*(d/2-.16)],[.20,.008,.05],lamp,.003);this.part(body,[x*(w/2-.10),0,z*(d/2-.3)],[.08,Math.min(.12,h*.65),.22],f.aluminum,.012);}
    const control=new T.Group(),offset=s.kind==='lift'?V(...(s.controlOffset??(s.automatic?[w/2-.6,.9,d/2-.6]:[0,0,0]))):V(0,h/2+.12,d/2-.11);control.position.copy(offset);const normal=s.controlFacing?V(...s.controlFacing):s.kind==='lift'?V(offset.x,0,offset.z):V(0,0,1);normal.y=0;if(normal.lengthSq()<.001)normal.set(0,0,1);control.quaternion.setFromUnitVectors(V(0,0,1),normal.normalize());body.add(control);
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
   if(s.kind==='switch'&&s.calls){
    const target=this.core.machines.devices.find(device=>device.spec.id===s.calls!.device&&device.spec.kind==='lift'),stop=target?.spec.stops?.[s.calls.stop];
    if(target&&stop){const at=!target.moving&&target.position.distanceTo(V(...stop.position))<.03; text=(at?'AT ':'CALL ')+stop.label.toUpperCase();detail=at?'READY':target.choice===s.calls.stop?(target.moving?'RETURNING':'WAITING'):'PRESS E';}
    else{text='UNLINKED';detail='NO LIFT';}
   }
   if(s.kind==='moving-platform')text=d.moving?'MOVING':d.on?'DOCKED':'STOPPED';
   if(s.kind==='conveyor'&&art.belt){const reverse=!!s.controls&&this.core.machines.flag(s.controls);if(reverse!==art.belt.reversed)this.paintBelt(art.belt,reverse);const actual=art.belt.direction.clone().multiplyScalar(reverse?-1:1),elapsed=Math.max(0,this.core.time-art.belt.lastTime);art.belt.lastTime=this.core.time;if(d.on){art.belt.texture.offset.x=(art.belt.texture.offset.x-actual.x*(s.speed??1.7)*elapsed)%1;art.belt.texture.offset.y=(art.belt.texture.offset.y+actual.z*(s.speed??1.7)*elapsed)%1;for(const roller of art.belt.rollers)roller.rotateY((actual.x?-actual.x:actual.z)*(s.speed??1.7)*elapsed/art.belt.radius);}text=d.on?'RUNNING':'STOPPED';detail=Math.abs(actual.x)>.5?(actual.x>0?'EAST':'WEST'):(actual.z>0?'SOUTH':'NORTH');}
   if(s.kind==='timer'){const enabled=this.core.machines.circuit(s.circuit);art.lamp.color.set(enabled?(d.on?0x9ddce0:0xd9b26b):0x39484a);art.lamp.emissive.set(enabled?(d.on?0x45b6c7:0xaf7224):0);art.lamp.emissiveIntensity=enabled?.8:0;this.paintTimer(art.display,d);continue;}
   art.lamp.color.set(d.on?0xc6d9d5:0x39484a);art.lamp.emissive.set(d.on?0x72b8c9:0);art.lamp.emissiveIntensity=d.on?.55:0;this.paintMachine(art.display,text,detail);
  }
 }
 private opticalProps(){
  this.opticalLamps=[];this.beamPieces=[];this.beamGeometry=undefined;const optics=this.core.level.optics;if(!optics)return;const f=this.finishes;
  this.beamGeometry=this.geo(new T.CylinderGeometry(1,1,1,8));this.beamCoreMaterial=this.material(new T.MeshBasicMaterial({color:0xffe8db,toneMapped:false}));this.beamHaloMaterial=this.material(new T.MeshBasicMaterial({color:0xff3f28,transparent:true,opacity:.23,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));
  for(const emitter of optics.emitters){const body=new T.Group();body.name='optical-emitter:'+emitter.id;body.position.set(...emitter.position);body.quaternion.setFromUnitVectors(V(0,0,1),V(...emitter.direction).normalize());this.root.add(body);const fallback=new T.Group();fallback.name='procedural-optical-fallback';body.add(fallback);
   this.part(fallback,[0,0,-.19],[.43,.43,.27],f.graphite,.035);this.part(fallback,[0,0,-.055],[.39,.39,.045],f.aluminum,.025);this.part(fallback,[0,0,-.024],[.31,.31,.025],f.recess,.02);
   const bezel=this.mesh(this.geo(new T.TorusGeometry(.125,.024,8,32)),f.aluminum,fallback);bezel.position.z=-.006;const lamp=this.material(new T.MeshStandardMaterial({color:0x602721,emissive:0xa31a0d,emissiveIntensity:0,roughness:.2,metalness:.35})),lens=this.mesh(this.geo(new T.CircleGeometry(.105,32)),lamp,body);lens.position.z=.001;
   for(const x of[-.16,.16])for(const y of[-.16,.16])this.part(fallback,[x,y,-.025],[.025,.025,.014],f.graphite,.005);for(const side of[-1,1])for(let y=-.12;y<.14;y+=.06)this.part(fallback,[side*.216,y,-.19],[.012,.025,.16],f.aluminum,.004);
   body.traverse(o=>{if(o instanceof T.Mesh)this.targets.push(o);});this.opticalLamps.push({id:emitter.id,kind:'emitter',material:lamp});if(optics.emitters.length===1)this.opticalServicePanel('emitter-housing','EMITTER',lamp);if(this.core.number===11)void this.requestOwnedProjector(body,fallback,lens);
  }
  for(const receiver of optics.receivers){const body=new T.Group(),r=receiver.radius,w=r*2+.18;body.name='optical-receiver:'+receiver.id;body.position.set(...receiver.position);body.quaternion.setFromUnitVectors(V(0,0,1),V(...(receiver.normal??[0,0,1])).normalize());this.root.add(body);
   this.part(body,[0,0,-.15],[w,w,.26],f.graphite,.035);this.part(body,[0,0,-.02],[w-.055,w-.055,.035],f.aluminum,.025);const ring=this.mesh(this.geo(new T.TorusGeometry(r+.012,.025,8,40)),f.graphite,body);ring.position.z=.005;
   // The native receiver is a sphere: its visible dome meets the exact traced endpoint.
   const lamp=this.material(new T.MeshStandardMaterial({color:0x273c41,emissive:0,roughness:.17,metalness:.4}));this.mesh(this.geo(new T.SphereGeometry(r,24,16)),lamp,body);
   for(const x of[-1,1])for(const y of[-1,1])this.part(body,[x*w*.38,y*w*.38,.003],[.025,.025,.018],f.graphite,.004);
   this.part(body,[0,-w/2-.07,-.055],[w,.14,.12],f.graphite,.012);const label=this.label('RECEIVER',w-.04,.09,'#20292e','#c7d3d6',95);label.position.set(0,-w/2-.07,.012);body.add(label);body.traverse(o=>{if(o instanceof T.Mesh)this.targets.push(o);});this.opticalLamps.push({id:receiver.id,kind:'receiver',material:lamp});if(optics.receivers.length===1)this.opticalServicePanel('receiver-pillar','RECEIVER',lamp);
  }
 }
 /** Read-only renderer diagnostics; loaded means an attached actual model, never merely a GET. */
 assetDiagnostics(){return JSON.parse(JSON.stringify({...this.ownedProjectorDiag,lateDiscards:this.ownedProjectorLateDiscards??0,heroes:this.heroAssetDiagnostics()}));}
 disposeOwnedAssets(){this.clearOwnedProjector();}
 private disposeImportedAsset(root:T.Object3D){
  const geometry=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();root.traverse(o=>{if(o instanceof T.Mesh){geometry.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const value of Object.values(m))if(value instanceof T.Texture)textures.add(value);}}});root.removeFromParent();for(const g of geometry)g.dispose();for(const m of materials)m.dispose();for(const t of textures){t.dispose();(t.image as {close?:()=>void}|undefined)?.close?.();}
 }
 private clearOwnedProjector(){
  this.ownedProjectorSerial=(this.ownedProjectorSerial??0)+1;this.ownedProjectorCleanup?.();this.ownedProjectorCleanup=undefined;this.ownedProjectorDiag={state:'not-requested',room:this.core.number,url:'./models/owned-optical-projector.glb',fallback:true,meshIDs:[]};
 }
 private loadOwnedProjectorFile(){return new GLTFLoader().loadAsync('./models/owned-optical-projector.glb');}
 private fittedOwnedProjector(source:T.Group,envelope:T.Box3){
  // Actual GLB rim/triangle measurement, retained in TRIPO_CAMERA_APERTURE.json.
  const aperture=V(-.000620134683,.433312572843,.339661679590),axis=V(-.018528549581,-.107621831751,.994019232299).normalize(),q=new T.Quaternion().setFromUnitVectors(axis,V(0,0,1)),scale=.60,translation=aperture.clone().applyQuaternion(q).multiplyScalar(-scale),alignment=new T.Matrix4().compose(translation,q,V(scale,scale,scale)),group=new T.Group();group.name='owned-tripo-optical-projector';source.updateMatrixWorld(true);let originalTriangles=0,triangles=0;
  const originalGeometry=new Set<T.BufferGeometry>();
  source.traverse(o=>{if(!(o instanceof T.Mesh))return;originalGeometry.add(o.geometry);const input=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();input.applyMatrix4(alignment.clone().multiply(o.matrixWorld));const p=input.getAttribute('position'),n=input.getAttribute('normal'),uv=input.getAttribute('uv'),positions:number[]=[],normals:number[]=[],uvs:number[]=[],masks:number[]=[];originalTriangles+=p.count/3;
   type Vertex={p:T.Vector3;n:T.Vector3;uv:T.Vector2};const mix=(a:Vertex,b:Vertex,t:number):Vertex=>({p:a.p.clone().lerp(b.p,t),n:a.n.clone().lerp(b.n,t).normalize(),uv:a.uv.clone().lerp(b.uv,t)});
   for(let i=0;i<p.count;i+=3){let polygon:Vertex[]=Array.from({length:3},(_,j)=>({p:V().fromBufferAttribute(p,i+j),n:V().fromBufferAttribute(n,i+j),uv:new T.Vector2().fromBufferAttribute(uv,i+j)}));
    // Crop only geometry outside the existing physical pylon + old rendered projector envelope.
    // This removes its long empty sun hood rather than moving the native ray or growing the proxy.
    for(const axis of['x','y','z']as const)for(const sign of[-1,1]){const edge=sign>0?envelope.max[axis]:envelope.min[axis],out:Vertex[]=[];for(let j=0;j<polygon.length;j++){const a=polygon[j],b=polygon[(j+1)%polygon.length],da=(a.p[axis]-edge)*sign,db=(b.p[axis]-edge)*sign;if(da<=0)out.push(a);if((da<=0)!==(db<=0))out.push(mix(a,b,da/(da-db)));}polygon=out;if(polygon.length<3)break;}
    for(let j=1;j<polygon.length-1;j++)for(const v of[polygon[0],polygon[j],polygon[j+1]]){positions.push(...v.p.toArray());normals.push(...v.n.toArray());uvs.push(...v.uv.toArray());masks.push((1-T.MathUtils.smoothstep(Math.hypot(v.p.x,v.p.y),.045,.061))*(1-T.MathUtils.smoothstep(Math.abs(v.p.z),.015,.025)));}
   }
   input.dispose();if(!positions.length)return;const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.setAttribute('ownedLensMask',new T.Float32BufferAttribute(masks,1));geometry.computeBoundingBox();const mesh=new T.Mesh(geometry,o.material);mesh.name=o.name+'-C11-fitted';mesh.castShadow=mesh.receiveShadow=true;mesh.userData.sharedAsset=true;mesh.userData.originalTripoMesh=o.name;group.add(mesh);triangles+=positions.length/9;
  });
  for(const geometry of originalGeometry)geometry.dispose();source.clear();if(!group.children.length)throw Error('Owned optical model has no in-bounds geometry');
  return{group,alignment,aperture,axis,scale,originalTriangles,triangles};
 }
 private ownedProjectorCradle(housing:{min:T.Vector3;max:T.Vector3},body:T.Group){
  const local=new T.Box3(),inverse=body.matrixWorld.clone().invert();for(const x of[housing.min.x,housing.max.x])for(const y of[housing.min.y,housing.max.y])for(const z of[housing.min.z,housing.max.z])local.expandByPoint(V(x,y,z).applyMatrix4(inverse));const group=new T.Group();group.name='optical-projector-service-cradle';body.add(group);const f=this.finishes,min=local.min,max=local.max,c=min.clone().add(max).multiplyScalar(.5),size=max.clone().sub(min),skin=.045;
  // Diffuse service faces keep the imported optic legible; all detail stays inside the native housing.
  const shell=this.material(new T.MeshStandardMaterial({color:0x8a938e,roughness:.72,metalness:.14,normalMap:f.panelQuiet.normalMap,normalScale:new T.Vector2(.10,.10)}));
  this.part(group,[c.x,c.y,min.z+skin/2],[size.x,size.y,skin],f.graphite,.012);for(const side of[-1,1])this.part(group,[side<0?min.x+skin/2:max.x-skin/2,c.y,c.z],[skin,size.y,size.z],f.machine,.012);
  for(const y of[min.y+skin/2,max.y-skin/2])this.part(group,[c.x,y,c.z],[size.x,skin,size.z],f.machine,.012);
  const holeX=.21,holeBottom=-.30,holeTop=.29,frontInset=.004,frontSkin=skin-frontInset,frontZ=max.z-frontInset-frontSkin/2;
  const face=(position:number[],dimensions:number[])=>{const mesh=this.part(group,position,dimensions,shell,.012);mesh.name='optical-service-cap-face';};
  for(const side of[-1,1]){const a=side<0?min.x:holeX,b=side<0?-holeX:max.x;face([(a+b)/2,c.y,frontZ],[b-a,size.y,frontSkin]);}
  for(const[a,b]of[[min.y,holeBottom],[holeTop,max.y]])face([0,(a+b)/2,frontZ],[holeX*2,b-a,frontSkin]);
  // Thin reveal edging is separated from the inset face and never intrudes into the .42m opening.
  const trim=(position:number[],dimensions:number[])=>{const mesh=this.part(group,position,dimensions,f.aluminum,.001);mesh.name='optical-service-reveal-trim';},edgeZ=max.z-.0025;
  for(const side of[-1,1])trim([side*(holeX+.012),(holeBottom+holeTop)/2,edgeZ],[.012,holeTop-holeBottom-.025,.004]);
  for(const y of[holeBottom-.012,holeTop+.012])trim([0,y,edgeZ],[holeX*2-.025,.012,.004]);
  return{group,local,materials:[shell]};
 }
 private async requestOwnedProjector(body:T.Group,fallback:T.Group,lens:T.Mesh){
  if(this.core.number!==11)return;const world=this.core,serial=this.ownedProjectorSerial??0,housing=world.solids.find(s=>s.id==='emitter-housing'),pylon=this.root.children.find(o=>o.userData.solid==='emitter-housing');if(!housing||!pylon)return;
  this.ownedProjectorDiag={state:'loading',room:11,url:'./models/owned-optical-projector.glb',fallback:true,meshIDs:[],sourceSHA256:'f7cf372aae3a68f57ed3799c99c966f8bff918aff922ef7fd6831e381edbd754'};
  const current=()=>serial===this.ownedProjectorSerial&&world===this.core&&body.parent===this.root;
  try{const loaded=await this.loadOwnedProjectorFile();if(!current()){this.disposeImportedAsset(loaded.scene);this.ownedProjectorLateDiscards=(this.ownedProjectorLateDiscards??0)+1;return;}
   body.updateMatrixWorld(true);const inverse=body.matrixWorld.clone().invert(),envelope=new T.Box3().setFromObject(fallback).applyMatrix4(inverse),native=new T.Box3();for(const x of[housing.min.x,housing.max.x])for(const y of[housing.min.y,housing.max.y])for(const z of[housing.min.z,housing.max.z])native.expandByPoint(V(x,y,z).applyMatrix4(inverse));envelope.union(native);
   const fitted=this.fittedOwnedProjector(loaded.scene,envelope),fallbackTargets=new Set<T.Object3D>();fallback.traverse(o=>{if(o instanceof T.Mesh)fallbackTargets.add(o);});fallbackTargets.add(pylon);fallbackTargets.add(lens);this.targets=this.targets.filter(o=>!fallbackTargets.has(o));fallback.visible=pylon.visible=lens.visible=false;body.add(fitted.group);const cradle=this.ownedProjectorCradle(housing,body),ownedTargets=new Set<T.Object3D>();for(const root of[fitted.group,cradle.group])root.traverse(o=>{if(o instanceof T.Mesh){ownedTargets.add(o);this.targets.push(o);}});this.root.updateMatrixWorld(true);
   const meshes:T.Mesh[]=[],assetLamps=new Set<T.MeshStandardMaterial>();fitted.group.traverse(o=>{if(o instanceof T.Mesh){meshes.push(o);for(const material of Array.isArray(o.material)?o.material:[o.material])if(material instanceof T.MeshStandardMaterial){assetLamps.add(material);material.onBeforeCompile=shader=>{shader.vertexShader='attribute float ownedLensMask; varying float vOwnedLensMask;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vOwnedLensMask = ownedLensMask;');shader.fragmentShader='varying float vOwnedLensMask;\n'+shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance *= vOwnedLensMask;');};material.customProgramCacheKey=()=>'owned-projector-lens-mask-v1';material.needsUpdate=true;this.opticalLamps.push({id:'emitter',kind:'emitter',material,preserveBase:true});}}});const apertureWorld=fitted.aperture.clone().applyMatrix4(fitted.alignment).applyMatrix4(body.matrixWorld),axisWorld=fitted.axis.clone().transformDirection(fitted.alignment).transformDirection(body.matrixWorld);
   this.ownedProjectorCleanup=()=>{this.targets=this.targets.filter(o=>!ownedTargets.has(o));this.disposeImportedAsset(fitted.group);cradle.group.removeFromParent();cradle.group.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();this.ownedGeometries.delete(o.geometry);}});for(const material of cradle.materials){material.dispose();this.ownedMaterials.delete(material);}fallback.visible=pylon.visible=lens.visible=true;this.opticalLamps=this.opticalLamps.filter(lamp=>!assetLamps.has(lamp.material));lens.scale.setScalar(1);for(const o of fallbackTargets)if(!this.targets.includes(o))this.targets.push(o);};
   this.ownedProjectorDiag={...this.ownedProjectorDiag,state:'loaded',fallback:false,meshIDs:meshes.map(m=>({id:m.id,uuid:m.uuid,name:m.name,original:m.userData.originalTripoMesh})),apertureWorld:apertureWorld.toArray(),axisWorld:axisWorld.toArray(),nativeOrigin:body.position.toArray(),nativeDirection:V(0,0,1).applyQuaternion(body.quaternion).toArray(),bounds:{min:new T.Box3().setFromObject(fitted.group).min.toArray(),max:new T.Box3().setFromObject(fitted.group).max.toArray()},localEnvelope:{min:envelope.min.toArray(),max:envelope.max.toArray()},scale:fitted.scale,triangles:fitted.triangles,sourceTriangles:fitted.originalTriangles,runtimeTrim:'Original GLB unchanged; long sun hood cropped in memory to pre-existing housing/head envelope',lensResponse:'Actual imported lens vertices, state-driven masked emissive; no opaque overlay'};
  }catch(error){if(current()){this.ownedProjectorCleanup?.();this.ownedProjectorCleanup=undefined;this.ownedProjectorDiag={...this.ownedProjectorDiag,state:'failed',fallback:true,error:String(error),meshIDs:[]};}}
 }

 private opticalServicePanel(id:string,title:string,lamp:T.Material){
  const housing=this.core.solids.find(s=>s.id===id);if(!housing)return;const size=housing.max.clone().sub(housing.min);if(size.x<.35||size.y<.8)return;const f=this.finishes,p=housing.min.clone().add(housing.max).multiplyScalar(.5),w=Math.min(.95,size.x-.10),h=Math.min(.72,size.y-.12),group=new T.Group();group.position.set(p.x,housing.min.y+size.y*.58,housing.max.z+.012);this.root.add(group);
  this.part(group,[0,0,0],[w,h,.035],f.aluminum,.018);this.part(group,[0,0,.022],[w-.045,h-.045,.018],f.recess,.012);this.part(group,[0,-h*.06,.038],[w*.58,.035,.018],lamp,.005);for(const x of[-w*.32,0,w*.32])this.part(group,[x,-h*.30,.039],[w*.18,.025,.018],f.aluminum,.004);const label=this.label(title,w*.90,h*.17,'#172126','#d5e1e2',95);label.position.set(0,h*.28,.042);group.add(label);for(const x of[-w*.43,w*.43])for(const y of[-h*.42,h*.42])this.part(group,[x,y,.033],[.018,.018,.012],f.graphite,.004);group.traverse(o=>{if(o instanceof T.Mesh)this.targets.push(o);});
 }
 private updateOpticalProps(){
  if(!this.core.level.optics)return;
  for(const lamp of this.opticalLamps){const on=lamp.kind==='emitter'?this.core.beams.has(lamp.id):this.core.machines.flags[lamp.id]===true;if(!lamp.preserveBase)lamp.material.color.set(lamp.kind==='emitter'?(on?0xf65c43:0x602721):(on?0xe6c274:0x273c41));lamp.material.emissive.set(lamp.kind==='emitter'?(on?0xff2412:0):(on?0xffb83d:0));lamp.material.emissiveIntensity=on?2.1:0;}
  let used=0;
  for(const result of this.core.beams.values())for(let i=0;i<result.segments.length;i++){
   const segment=result.segments[i],a=V(...segment.from),b=V(...segment.to),delta=b.clone().sub(a),length=delta.length();if(length<.0001)continue;
   let piece=this.beamPieces[used++];if(!piece){const core=this.mesh(this.beamGeometry!,this.beamCoreMaterial!),halo=this.mesh(this.beamGeometry!,this.beamHaloMaterial!),impact=this.mesh(this.geo(new T.SphereGeometry(.035,12,8)),this.beamCoreMaterial!);core.castShadow=halo.castShadow=impact.castShadow=false;piece={core,halo,impact};this.beamPieces.push(piece);}
   for(const[mesh,r]of[[piece.core,.011],[piece.halo,.047]]as const){mesh.visible=true;mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(V(0,1,0),delta.clone().normalize());mesh.scale.set(r,length,r);}
   piece.impact.visible=i===result.segments.length-1&&['receiver','obstacle'].includes(result.stop);piece.impact.position.copy(b);
  }
  for(let i=used;i<this.beamPieces.length;i++){const piece=this.beamPieces[i];piece.core.visible=piece.halo.visible=piece.impact.visible=false;}
 }
 private architecturePracticals(){
  const f=this.finishes;let sources=0;
  // Resolve the visible architectural skin once at build time; core faces can sit behind cladding/coffers.
  this.root.updateMatrixWorld(true);const mounts:T.Object3D[]=[],ray=new T.Raycaster();this.root.traverse(o=>{if(o instanceof T.Mesh&&(o.userData.solid||o instanceof T.InstancedMesh))mounts.push(o);});
  const overlapsWhite=(point:T.Vector3,normal:T.Vector3,w:number,h:number)=>this.core.surfaces.some(s=>{if(s.normal.dot(normal)<.98||Math.abs(point.clone().sub(s.center).dot(s.normal))>.15)return false;const delta=point.clone().sub(s.center),right=s.up.clone().cross(s.normal).normalize();return Math.abs(delta.dot(right))<s.width/2+w/2+.02&&Math.abs(delta.dot(s.up))<s.height/2+h/2+.02;});
  const fixture=(point:T.Vector3,normal:T.Vector3,w:number,h:number,landing?:{id:string;mount:string;target:T.Vector3;reach:number;power?:number;range?:number})=>{
   if(sources>=4)return;
   // Hardware belongs on real opaque masses, never across an authored white host.
   if(overlapsWhite(point,normal,w+.05,h+.05))return;
   const up=Math.abs(normal.y)>.9?V(0,0,1):V(0,1,0),right=up.clone().cross(normal).normalize(),samples=[point,...[-.5,.5].flatMap(x=>[-.5,.5].map(y=>point.clone().addScaledVector(right,x*(w+.05)).addScaledVector(up,y*(h+.05))))];let projection=0;
   // Centre-only mounting can fall inside a panel seam; clear the entire plate footprint.
   for(const sample of samples){ray.set(sample.clone().addScaledVector(normal,.75),normal.clone().negate());ray.near=0;ray.far=1.5;const hit=ray.intersectObjects(mounts,false)[0];if(hit)projection=Math.max(projection,hit.point.clone().sub(sample).dot(normal));}
   const mount=point.clone().addScaledVector(normal,projection);if(overlapsWhite(mount,normal,w+.05,h+.05))return;
   const pose=(bias:number)=>poseMatrix(mount.clone().addScaledVector(normal,bias),normal,up);
   for(const[width,height,material,bias]of[[w+.05,h+.05,f.graphite,.001],[w,h,f.warm,.003]]as const){const face=this.mesh(this.geo(new T.PlaneGeometry(width,height)),material);face.matrix.copy(pose(bias));face.matrix.decompose(face.position,face.quaternion,face.scale);face.castShadow=false;}
   const distance=landing?mount.distanceTo(landing.target):0,light=landing?new T.SpotLight(0xffd19a,landing.power??Math.max(95,distance*distance*2.5),landing.range??(distance+10),T.MathUtils.clamp(Math.atan2(landing.reach,Math.max(1,distance)),.17,.7),.72,2):new T.PointLight(0xffd19a,7,6.5,2);light.position.copy(mount).addScaledVector(normal,.16);light.userData.practicalMount={physicalPoint:point.toArray(),visiblePoint:mount.toArray(),normal:normal.toArray()};
   if(landing&&light instanceof T.SpotLight){light.target.position.copy(landing.target);light.target.userData.chamberLight=true;this.scene.add(light.target);light.userData.landingPractical={floor:landing.id,mount:landing.mount,physicalMountPoint:point.toArray(),mountPoint:mount.toArray(),target:landing.target.toArray()};}
   this.scene.add(light);sources++;
  };
  if(this.core.number===25)fixture(V(-6,3.12,5.8),V(0,0,-1),.60,.04,{id:'freight-near-bank',mount:'hatch-header',target:V(-6,.12,4.5),reach:2,power:62,range:6.5});
  // Authored opaque gallery spine and real service-corridor walls need light at walking height.
  for(const s of this.core.solids){if(s.id==='gallery-spine')fixture(V(s.min.x,(s.min.y+s.max.y)/2,s.max.z-.65),V(-1,0,0),.055,.48);if(s.id.startsWith('side-gallery-wall-')){const sign=(s.min.z+s.max.z)>0?-1:1;fixture(V((s.min.x+s.max.x)/2,s.min.y+1.45,sign>0?s.max.z:s.min.z),V(0,0,sign),.055,.48);}}
  const receiving=(id:string)=>(this.core.number===50&&id==='retrieval-vault')||(/(?:^|-)(?:receiving|landing|dock|gallery)(?:-|$)/.test(id)&&!/(?:source|approach|spawn)/.test(id));
  const floors=this.core.solids.filter(s=>{const size=s.max.clone().sub(s.min);return s.kind==='floor'&&size.x>2&&size.z>2&&(s.max.y>1.5||this.core.solids.some(lower=>lower.kind==='floor'&&lower.max.y<s.min.y-.5&&lower.min.x<s.max.x&&lower.max.x>s.min.x&&lower.min.z<s.max.z&&lower.max.z>s.min.z));}).sort((a,b)=>Number(receiving(b.id))-Number(receiving(a.id))||b.max.y-a.max.y||(b.max.x-b.min.x)*(b.max.z-b.min.z)-(a.max.x-a.min.x)*(a.max.z-a.min.z)).slice(0,this.core.number===25?1:2);
  for(const s of floors){const size=s.max.clone().sub(s.min),x=(s.min.x+s.max.x)/2;
   if(this.core.blueprint.family==='launch-spire'&&receiving(s.id))for(const fraction of[.25,.75]){
    const px=s.min.x+size.x*fraction,pz=(s.min.z+s.max.z)/2,overhead=this.core.solids.filter(roof=>roof!==s&&roof.kind!=='glass'&&roof.min.y>s.max.y+.5&&px>roof.min.x+.05&&px<roof.max.x-.05&&pz>roof.min.z+.05&&pz<roof.max.z-.05).sort((a,b)=>a.min.y-b.min.y)[0];
    if(overhead)fixture(V(px,overhead.min.y,pz),V(0,-1,0),.65,.08,{id:s.id,mount:overhead.id,target:V(px,s.max.y,pz),reach:Math.min(5.5,Math.max(3,size.z*.65))});
   }
   else if(size.y>1){for(const fraction of[.22,.78])fixture(V(s.min.x+size.x*fraction,s.max.y-.18,s.max.z),V(0,0,1),Math.min(.65,size.x*.15),.035);}
   else for(const fraction of(size.x>6?[.25,.75]:[.5]))fixture(V(s.min.x+size.x*fraction,s.min.y,s.max.z-.18),V(0,-1,0),Math.min(.6,size.x*.18),.045);
   if(!overlapsWhite(V(x,s.max.y,s.max.z-.05),V(0,1,0),size.x-.16,.035)){const edge=this.mesh(this.geo(new T.PlaneGeometry(size.x-.16,.035)),f.aluminum);edge.rotation.x=-Math.PI/2;edge.position.set(x,s.max.y+.002,s.max.z-.05);edge.castShadow=false;}
  }
 }
 private exitPracticalWashes(){
  // Two destination thresholds receive the same neutral warm treatment, independent of mission/state.
  const used=new Set<string>();
  for(const exit of this.core.blueprint.exits){
   if(used.size>=2)break;
   const door=this.core.machines.devices.filter(d=>d.spec.kind==='shutter'&&d.spec.size[1]>=2).sort((a,b)=>Math.hypot(a.spec.position[0]-exit.position[0],a.spec.position[2]-exit.position[2])-Math.hypot(b.spec.position[0]-exit.position[0],b.spec.position[2]-exit.position[2]))[0];
   if(!door&&this.core.blueprint.family==='launch-spire'){
    // Open receiving archways have no shutter pocket. Use their actual small vestibule roof,
    // not the distant room ceiling, with identical local warmth on both physical alternatives.
    const floor=this.core.solids.filter(s=>s.kind==='floor'&&Math.abs(s.max.y-(exit.position[1]-exit.size[1]/2))<.05&&exit.position[0]>s.min.x&&exit.position[0]<s.max.x&&exit.position[2]>s.min.z&&exit.position[2]<s.max.z).sort((a,b)=>(a.max.x-a.min.x)*(a.max.z-a.min.z)-(b.max.x-b.min.x)*(b.max.z-b.min.z))[0];
    if(!floor)continue;
    const roof=this.core.solids.filter(s=>s.kind!=='glass'&&/ceiling|roof|header/.test(s.id)&&s.min.y>floor.max.y+2.3&&s.min.y<floor.max.y+5&&exit.position[0]>s.min.x&&exit.position[0]<s.max.x&&exit.position[2]>s.min.z&&exit.position[2]<s.max.z).sort((a,b)=>a.min.y-b.min.y)[0];
    if(!roof)continue;
    const alongX=floor.max.x-floor.min.x>floor.max.z-floor.min.z,axis=alongX?'x':'z',cross=alongX?'z':'x',centre=floor.min.clone().add(floor.max).multiplyScalar(.5),sign=this.core.spawn[axis]<centre[axis]?-1:1,normal=alongX?V(sign,0,0):V(0,0,sign),mouth=sign<0?floor.min[axis]:floor.max[axis],mount=centre.clone();mount[axis]=mouth-sign*.22;mount.y=roof.min.y-.003;
    const strip=this.mesh(this.geo(new T.PlaneGeometry(Math.min(1.8,(floor.max[cross]-floor.min[cross])*.65),.055)),this.finishes.warm);strip.matrix.copy(poseMatrix(mount,V(0,-1,0),normal));strip.matrix.decompose(strip.position,strip.quaternion,strip.scale);strip.castShadow=false;strip.name='archway-practical:'+exit.id;
    // Readable bulkhead caps finish the real roof/jamb front faces. No invented mass or walk obstacle.
    for(const solid of this.core.solids){const size=solid.max.clone().sub(solid.min),isRoof=solid===roof,isJamb=solid.kind==='wall'&&size[axis]>floor.max[axis]-floor.min[axis]&&size[cross]<.65&&Math.abs(solid.min.y-floor.max.y)<.06&&Math.abs(solid.max.y-floor.max.y-3)<.08&&Math.abs((solid.min[cross]+solid.max[cross])/2-centre[cross])<(floor.max[cross]-floor.min[cross])/2+.5;if(!isRoof&&!isJamb)continue;
     const point=solid.min.clone().add(solid.max).multiplyScalar(.5);point[axis]=(sign<0?solid.min[axis]:solid.max[axis])+sign*.003;const face=this.mesh(this.geo(new T.PlaneGeometry(size[cross]-.02,size.y-.02)),this.finishes.machine);face.matrix.copy(poseMatrix(point,normal,V(0,1,0)));face.matrix.decompose(face.position,face.quaternion,face.scale);face.castShadow=false;face.name='archway-mass-cap:'+solid.id;
    }
    const light=new T.SpotLight(0xffd2a0,62,5.5,.82,.75,2);light.position.copy(mount);light.position.y=roof.min.y-.10;light.target.position.copy(centre);light.target.position[axis]=mouth+sign*1.25;light.target.position.y=floor.max.y+.12;
    light.userData.archwayPractical={exit:exit.id,floor:floor.id,roof:roof.id,roofUnderside:roof.min.y,mouth,axis,mount:light.position.toArray(),normal:normal.toArray(),floorY:floor.max.y};light.target.userData.chamberLight=true;this.scene.add(light,light.target);used.add('arch:'+exit.id);continue;
   }
   if(!door||used.has(door.spec.id))continue;used.add(door.spec.id);
   const s=door.spec,alongX=s.size[0]<s.size[2],sign=(alongX?s.direction?.[0]:s.direction?.[2])??1,normal=alongX?V(sign,0,0):V(0,0,sign),base=s.position[1]-s.size[1]/2,depth=Math.min(s.size[0],s.size[2]);
   // Source sits under the existing opaque retraction header, not inside the white wall skin.
   const mount=V(...s.position).addScaledVector(normal,depth*.55+.42);mount.y=base+3.20;
   const light=new T.SpotLight(0xffd2a0,62,8,.88,.8,2);light.position.copy(mount);light.target.position.copy(V(...s.position).addScaledVector(normal,1.25));light.target.position.y=base+.12;
   light.userData.exitPractical={device:s.id,mount:mount.toArray(),normal:normal.toArray(),floorY:base};light.target.userData.chamberLight=true;this.scene.add(light,light.target);
  }
 }
 private lighting(){
  for(const child of [...this.scene.children])if(child instanceof T.Light||child.userData.chamberLight){if(child instanceof T.SpotLight||child instanceof T.DirectionalLight)child.shadow.dispose();this.scene.remove(child);}
  const split=this.core.number===5,finished=this.core.number>=6,warm=split||finished;RectAreaLightUniformsLib.init();this.scene.background=new T.Color(0x10151a);this.scene.fog=new T.Fog(0x10151a,38,70);this.scene.environmentIntensity=split?.38:finished?.24:.48;this.renderer.toneMappingExposure=1.08;
  this.scene.add(new T.HemisphereLight(split?0xe4d9c9:finished?0xd4dce2:0xcbdce5,0x3b3028,split?.34:finished?.24:.48));
  const ceiling=this.core.level.architecture.height;
  if(this.software){const key=new T.DirectionalLight(split?0xffe5c4:finished?0xe3e9ed:0xdce8ed,split?1.1:finished?1.3:1.55);key.position.set(-4,10,5);this.scene.add(key);const fill=new T.DirectionalLight(finished?0xe0e6e9:0xffdcaf,split?.5:finished?.52:.65);fill.position.set(5,6,-8);this.scene.add(fill);}
  if(!this.software&&[46,48,50].includes(this.core.number)){for(const mount of this.ceilingLuminaireMounts()){const area=new T.RectAreaLight(0xe2e9ed,4.4,3.8,1.1);area.position.set(mount.x,mount.y-.45,mount.z);area.rotation.x=-Math.PI/2;area.userData.slabMount=mount;this.scene.add(area);}}
  else if(![46,48,50].includes(this.core.number))for(const x of(this.software?[]:[-4.2,4.2]))for(const z of(finished?[-6,7]:[-9,-1,8])){const area=new T.RectAreaLight(split?0xffe6c7:finished?0xe2e9ed:0xe2edf5,split?5.8:finished?4.4:6.8,3.8,1.1);area.position.set(x,ceiling-.45,z);area.rotation.x=-Math.PI/2;this.scene.add(area);}
  const key=new T.SpotLight(split?0xffd9a8:finished?0xf1f4f5:0xffedcf,this.software?0:finished?240:150,28,.92,.7,2);key.position.set(-4,ceiling-.55,5);key.target.position.set(0,0,-3);key.castShadow=!this.software;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0001;key.shadow.normalBias=.025;this.scene.add(key,key.target);key.userData.chamberLight=true;key.target.userData.chamberLight=true;
  if(!finished)for(const x of[-7.6,7.6]){const fill=new T.PointLight(0xffce8a,14,9,2);fill.position.set(x,.7,-8);this.scene.add(fill);}
  if(finished){this.architecturePracticals();this.exitPracticalWashes();}
  if(split){
   // Practical pools shape the near floor, retaining facade and the whole existing eligible upper bay.
   for(const[p,target,intensity,range,angle]of[[[-4,ceiling-.55,5],[-4,0,4],125,17,.68],[[6.5,ceiling-.55,-4],[5,5.4,-11.9],190,18,.72]]as const){const light=new T.SpotLight(0xffcf91,intensity,range,angle,.85,2);light.position.set(p[0],p[1],p[2]);light.target.position.set(target[0],target[1],target[2]);light.userData.chamberLight=light.target.userData.chamberLight=true;this.scene.add(light,light.target);}
   const gallery=this.core.solids.find(s=>s.id==='upper-gallery');if(gallery)for(const x of[gallery.min.x+.9,gallery.max.x-.9]){const light=new T.PointLight(0xffc47c,17,6,2);light.position.set(x,gallery.max.y-.18,gallery.max.z+.28);this.scene.add(light);}
  }
  this.portalLights=[0,1].map(i=>{const light=new T.PointLight(i===0?0x55c9ee:0xffb535,0,5,2);this.scene.add(light);return light;});
 }
 private buildHeldFootprint(){
  // Native support polygons are convex. Pool both GPU buffers once per room; no target/collision.
  const geometry=this.geo(new T.BufferGeometry());geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(64*9*3),3).setUsage(T.DynamicDrawUsage));geometry.setAttribute('color',new T.BufferAttribute(new Float32Array(64*9*4),4).setUsage(T.DynamicDrawUsage));geometry.setDrawRange(0,0);
  const patch=new T.Mesh(geometry,this.material(new T.MeshBasicMaterial({color:0x20272b,vertexColors:true,transparent:true,opacity:0,depthWrite:false,toneMapped:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})));this.root.add(patch);patch.name='held-cargo-support-patch';patch.castShadow=patch.receiveShadow=false;patch.frustumCulled=false;patch.renderOrder=1;patch.visible=false;
  const edges=this.geo(new T.BufferGeometry());edges.setAttribute('position',new T.BufferAttribute(new Float32Array(2048*3),3).setUsage(T.DynamicDrawUsage));edges.setDrawRange(0,0);
  const outline=new T.LineSegments(edges,this.material(new T.LineBasicMaterial({color:0xc8ceca,transparent:true,opacity:0,depthWrite:false,toneMapped:false})));outline.name='held-cargo-support-outline';outline.frustumCulled=false;outline.renderOrder=2;outline.visible=false;this.root.add(outline);
  this.heldFootprintArt={patch,outline,opacity:0,key:'',centre:V()};
 }
 private updateHeldFootprint(dt:number){
  const art=this.heldFootprintArt;if(!art)return;
  const hit=this.core.heldId?this.core.heldFootprint():null;
  // Never leave stale paint under an obstruction, unsupported edge, dropped cube or portal seam.
  if(!hit||hit.cubeId!==this.core.heldId||hit.polygon.length<3||hit.polygon.length>64){art.patch.visible=art.outline.visible=false;art.opacity=0;art.key='';return;}
  const key=hit.cubeId+':'+hit.supportId;if(key!==art.key){art.key=key;art.opacity=0;}
  const target=1-T.MathUtils.smoothstep(hit.height,.2,2);art.opacity=this.reducedMotion||dt===0?target:T.MathUtils.damp(art.opacity,target,18,Math.max(0,dt));
  art.patch.visible=art.outline.visible=art.opacity>.002;if(!art.patch.visible)return;
  art.centre.set(0,0,0);for(const p of hit.polygon)art.centre.add(p);art.centre.multiplyScalar(1/hit.polygon.length);
  const positions=art.patch.geometry.getAttribute('position') as T.BufferAttribute,colors=art.patch.geometry.getAttribute('color') as T.BufferAttribute,edges=art.outline.geometry.getAttribute('position') as T.BufferAttribute,normal=hit.normal;let count=0,edgeCount=0;
  const vertex=(p:T.Vector3,inner:boolean,alpha:number)=>{const t=inner?.82:1;positions.setXYZ(count,art.centre.x+(p.x-art.centre.x)*t+normal.x*.004,art.centre.y+(p.y-art.centre.y)*t+normal.y*.004,art.centre.z+(p.z-art.centre.z)*t+normal.z*.004);colors.setXYZW(count++,1,1,1,alpha);};
  for(let i=0;i<hit.polygon.length;i++){
   const a=hit.polygon[i],b=hit.polygon[(i+1)%hit.polygon.length];vertex(art.centre,false,1);vertex(a,true,.65);vertex(b,true,.65);vertex(a,true,.65);vertex(a,false,0);vertex(b,false,0);vertex(a,true,.65);vertex(b,false,0);vertex(b,true,.65);
   const length=a.distanceTo(b);for(let start=.025;start<length&&edgeCount+2<=edges.count;start+=.17){for(const distance of[start,Math.min(length,start+.10)]){const t=distance/length;edges.setXYZ(edgeCount++,a.x+(b.x-a.x)*t+normal.x*.007,a.y+(b.y-a.y)*t+normal.y*.007,a.z+(b.z-a.z)*t+normal.z*.007);}}
  }
  positions.needsUpdate=colors.needsUpdate=edges.needsUpdate=true;art.patch.geometry.setDrawRange(0,count);art.outline.geometry.setDrawRange(0,edgeCount);art.patch.material.opacity=.26*art.opacity;art.outline.material.opacity=.58*art.opacity;
 }
 private releaseHeroInstances(){this.heroInstances?.forEach(instance=>instance.dispose());this.heroInstances=new Set();this.heroGun=undefined;}
 heroAssetDiagnostics(){
  const meshes=(root:T.Object3D|undefined)=>{const list:Record<string,unknown>[]=[];root?.traverse(o=>{if(o instanceof T.Mesh&&o.userData.heroAsset)list.push({id:o.id,uuid:o.uuid,name:o.name,source:o.userData.originalTripoMesh,asset:o.userData.heroAsset,vertices:o.geometry.getAttribute('position').count,triangles:(o.geometry.index?.count??o.geometry.getAttribute('position').count)/3});});return list;};
  const status=heroAssetStatus(),gun=status.assets.projector,muzzle=gun.muzzleLocal&&this.instrument?V(...gun.muzzleLocal as[number,number,number]).applyMatrix4(this.instrument.matrixWorld):undefined,axis=gun.axisLocal&&this.instrument?V(...gun.axisLocal as[number,number,number]).transformDirection(this.instrument.matrixWorld):undefined;
  return{...status,gun:{attached:!!this.heroGun,meshes:meshes(this.heroGun?.root),muzzleInView:muzzle?.toArray(),muzzleInWorld:muzzle?.clone().applyMatrix4(this.camera.matrixWorld).toArray(),axisInView:axis?.toArray(),axisInWorld:axis?.clone().transformDirection(this.camera.matrixWorld).toArray()},cargo:[...(this.crateVisuals??new Map<string,T.Group>())].map(([id,root])=>({id,meshes:meshes(root),portalCopies:this.cratePieces?.get(id)?.copies.map(copy=>({visible:copy.group.visible,meshes:meshes(copy.group)}))}))};
 }
 override build(){
  this.releaseHeroInstances();
  this.clearOwnedProjector();
  this.portalRenderer?.dispose();this.portalRenderer=undefined;
  if(this.viewScene)this.disposeObject(this.viewScene);this.viewScene=undefined;this.viewCamera=undefined;this.instrument=undefined;
  this.disposeObject(this.root);this.root.clear();this.portalViews.forEach(v=>v.target.dispose());this.portalViews=[];this.targets=[];this.crateVisuals.clear();this.padVisuals.clear();this.bridgeVisuals.clear();
  this.ownedGeometries?.forEach(g=>g.dispose());this.ownedMaterials?.forEach(m=>m.dispose());this.ownedTextures?.forEach(t=>t.dispose());this.ownedGeometries=new Set();this.ownedMaterials=new Set();this.ownedTextures=new Set();this.batches=new Map();this.cratePieces=new Map();this.prepareFinishes();this.architecture();this.mechanisms();this.nativeMachineProps();this.opticalProps();this.flushBatches();for(const c of this.core.crates)this.createCrate(c.id);this.buildPortalVisuals();this.lighting();this.buildHeldFootprint();
 }
 /** Original renderer assets are constructed synchronously; no legacy cargo replacement race. */
 override async loadModels(){}
 override createCrate(id:string){
  const oldVisual=this.crateVisuals.get(id),oldTargets=new Set<T.Object3D>();oldVisual?.traverse(o=>oldTargets.add(o));this.targets=this.targets.filter(o=>!oldTargets.has(o));
  const previous=this.cratePieces?.get(id);if(previous)for(const copy of previous.copies){this.root.remove(copy.group);copy.materials.forEach(m=>{m.dispose();this.ownedMaterials.delete(m);});}
  previous?.release?.();
  if(oldVisual){this.root.remove(oldVisual);this.disposeObject(oldVisual);}
  const b=this.core.crates.find(c=>c.id===id)!,group=new T.Group(),asset=instantiateHero('cargo');group.name='actual-tripo-cargo:'+id;group.add(asset.root);this.heroInstances.add(asset);group.scale.copy(b.half).multiplyScalar(2);group.position.copy(b.pos);group.quaternion.copy(b.rotation);this.root.add(group);this.crateVisuals.set(id,group);
  const source=asset.materials;source.forEach(material=>{material.clipShadows=true;});
  const copies=[0,1].map(()=>{const copy=group.clone(true),materials:T.Material[]=[],copyMap=new Map<T.Material,T.Material>();copy.visible=false;copy.traverse(o=>{if(o instanceof T.Mesh){o.userData.sharedAsset=true;const mats=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const cached=copyMap.get(m);if(cached)return cached;const c=this.material(cloneHeroMaterial(m,'cargo'));c.clipShadows=true;copyMap.set(m,c);materials.push(c);return c;});o.material=Array.isArray(o.material)?mats:mats[0];}});this.root.add(copy);return{group:copy,materials};});
  group.traverse(o=>{if(o instanceof T.Mesh)this.targets.push(o);});this.cratePieces?.set(id,{source,copies,release:()=>{asset.dispose();this.heroInstances.delete(asset);}});
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
  requireHeroAssets();
  this.viewScene=new T.Scene();this.viewScene.environment=this.scene.environment;this.viewScene.environmentIntensity=.7;this.viewCamera=new T.PerspectiveCamera(54,this.camera.aspect,.01,10);this.viewScene.add(new T.HemisphereLight(0xe8f1f5,0x302c27,.95));const key=new T.DirectionalLight(0xffe2b7,3.1);key.position.set(-2,3,2);const rim=new T.DirectionalLight(0xb8d9ed,.85);rim.position.set(2,1,-3);this.viewScene.add(key,rim);
  const tool=new T.Group();tool.name='actual-tripo-projector-view';this.instrument=tool;this.viewScene.add(tool);const asset=instantiateHero('projector');tool.add(asset.root);this.heroInstances.add(asset);this.heroGun=asset;
 }
 private instrumentFit(){
  const aspect=this.viewCamera?.aspect??this.camera.aspect,ratio=T.MathUtils.clamp(aspect/1.35,.62,1),scale=.64*ratio,bounds=heroBounds('projector').applyMatrix4(new T.Matrix4().makeRotationZ(-.055)),near=.84-bounds.max.z*scale;
  const originalX=Math.min(.40,Math.max(.05,Math.tan(27*Math.PI/180)*.70*aspect-.205*ratio)),safeX=Math.tan(27*Math.PI/180)*aspect*near-bounds.max.x*scale-.02;
  return{scale,x:Math.min(originalX,Math.max(.02,safeX)),y:-.37*Math.sqrt(ratio)};
 }
 fire(index:number){this.recoil=.032;this.pulse=.16;this.shotIndex=index;}
 renderDiagnostics(){return this.portalRenderer?.diagnostics(this.portalViews)??null;}
 override renderLinkedViews(){this.portalRenderer??=new PortalRenderer(this.renderer,this.scene,{software:this.software});if(this.refreshLinkedViews||!this.software||this.frame++%3===0){this.refreshLinkedViews=false;this.portalRenderer.render(this.camera,this.core.portals,this.portalViews);}}
 override resize(){super.resize();this.refreshLinkedViews=true;if(this.viewCamera){this.viewCamera.aspect=this.camera.aspect;this.viewCamera.updateProjectionMatrix();}}
 override setWorld(world:RiftWorld|CoreWorld){super.setWorld(world as unknown as RiftWorld);this.viewScene=undefined;this.viewCamera=undefined;this.instrument=undefined;this.buildInstrument();this.lastPortalSignature=undefined;this.recoil=0;}
 override update(dt:number){
  // A paused dirty/resize frame may be the only render; never throttle away its linked views.
  if(dt===0)this.refreshLinkedViews=true;
  this.artClock=(this.artClock??0)+dt;const signature=this.core.portals.map(p=>p?p.surfaceId+':'+p.center.toArray().map(v=>v.toFixed(2)).join(','):'').join('|');if(this.lastPortalSignature!==undefined&&signature!==this.lastPortalSignature)this.recoil=.035;this.lastPortalSignature=signature;this.recoil=Math.max(0,(this.recoil??0)-dt*.17);
  for(const d of this.doors){d.leaf.position.copy(d.state.position);for(const m of d.indicators){m.color.set(d.state.progress>.85?0x96c7a1:0xedb54f);m.emissive.set(d.state.progress>.85?0x68bb88:0xffb437);}for(const input of d.inputs){const on=this.core.machines.flag(input.id);input.lamp.color.set(on?0xc0d6b8:0x354047);input.lamp.emissive.set(on?0x6fba8c:0);input.lamp.emissiveIntensity=on?1.8:0;}}
  for(const p of this.core.pads){const art=this.buttons.get(p.id)!,pressed=this.pressed(p),target=art.plungerRestY-(pressed?.025:0);art.top.position.y=art.restY;if(art.plungers)art.plungers.position.y=this.reducedMotion||dt===0?target:T.MathUtils.damp(art.plungers.position.y,target,22,Math.max(0,dt));art.lights.emissiveIntensity=pressed?2:.22;}
  for(const trace of this.circuitTraces)trace.material.emissiveIntensity=this.pressed(this.core.pads.find(p=>p.id===trace.pad)!)?2.6:.10;
  this.updateNativeMachineProps(dt);
  this.updateOpticalProps();
  for(let i=0;i<2;i++){const p=this.core.portals[i],light=this.portalLights[i];light.intensity=p?7:0;if(p)light.position.copy(p.center).addScaledVector(p.normal,.28);}
  this.syncCratePieces();
  this.updateHeldFootprint(dt);
  super.update(dt);
  for(const c of this.core.crates){const visual=this.crateVisuals.get(c.id);if(visual&&c.rotation)visual.quaternion.copy(c.rotation);}
  if(this.instrument&&this.viewScene&&this.viewCamera){const fit=this.instrumentFit(),speed=Math.hypot(this.core.player.vel.x,this.core.player.vel.z),sway=this.reducedMotion?0:Math.sin(this.artClock*7)*Math.min(.004,speed*.0008);this.instrument.scale.setScalar(fit.scale);this.instrument.position.set(fit.x,fit.y+sway,(this.core.heldId?-.88:-.92)+this.recoil);this.instrument.rotation.z=-.055+(this.reducedMotion?0:Math.sin(this.artClock*1.4)*.003);const color=this.shotIndex===1?0xffb23d:0x49ccef;for(const material of this.heroGun?.materials??[])if(material instanceof T.MeshStandardMaterial){material.emissive.set(color);material.emissiveIntensity=(this.core.portals[this.shotIndex??0]?1.2:.12)+(this.pulse??0)*14;}this.instrument.updateMatrixWorld(true);this.pulse=Math.max(0,(this.pulse??0)-dt);const clear=this.renderer.autoClear;this.renderer.autoClear=false;this.renderer.clearDepth();this.renderer.render(this.viewScene,this.viewCamera);this.renderer.autoClear=clear;}
 }
}
