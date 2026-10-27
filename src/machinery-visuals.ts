import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {MachineSystems,DeviceState} from './systems';

type Sign={group:T.Group;canvas:HTMLCanvasElement;texture:T.CanvasTexture;key:string;title:string};
type Visual={device:DeviceState;body:T.Group;sign:Sign;lever?:T.Group;rollers?:T.Mesh[];arrows?:T.Group;head?:T.Group;beam?:T.Group;beamCore?:T.Mesh;beamHalo?:T.Mesh;blockedSign?:Sign;cables?:T.Mesh[];status?:T.MeshStandardMaterial};
type ReceiverVisual={id:string;body:T.Group;lamp:T.MeshStandardMaterial;sign:Sign};
const UP=new T.Vector3(0,1,0),FORWARD=new T.Vector3(0,0,1);

/** Original mechanical art only. MachineSystems remains the sole state/collision authority. */
export class MachineryVisuals {
 readonly root=new T.Group();
 /** E console world positions: lifts ride the deck; other consoles remain at safe fixed bases. */
 readonly controlAnchors=new Map<string,T.Vector3>();
 private visuals:Visual[]=[];
 private receivers:ReceiverVisual[]=[];
 private geometries=new Map<string,T.BufferGeometry>();
 private materials=new Set<T.Material>();
 private textures=new Set<T.Texture>();
 private disposed=false;
 private ceramic=this.material(0xd6d7cd,.12,.48);
 private graphite=this.material(0x28353b,.5,.43);
 private metal=this.material(0x8c9c9e,.78,.32);
 private rubber=this.material(0x111b20,.05,.82);
 private amber=this.material(0xd7ad62,.4,.4);
 private plate=this.plateMaterial();
 private beamMaterial=this.basic(0xffd08a,.9);
 private haloMaterial=this.basic(0xffc365,.13);

 constructor(parent:T.Group,private systems:MachineSystems){
  this.root.name='Rift original machinery visuals';parent.add(this.root);
  for(const device of systems.devices)this.build(device);
  // A relay can refer to spatial receivers without separate DeviceSpec rows.
  for(const device of systems.devices)for(const receiver of device.spec.receivers??[]){
   if(!this.receivers.some(r=>r.id===receiver.id))this.receiver(receiver.id,receiver.id,new T.Vector3(...receiver.position),.54,device.position);
  }
  this.update(0);
 }

 private material(color:number,metalness=0,roughness=.6){const m=new T.MeshStandardMaterial({color,metalness,roughness});this.materials.add(m);return m;}
 private basic(color:number,opacity=1){const m=new T.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:opacity===1,toneMapped:false});this.materials.add(m);return m;}
 private geo(key:string,make:()=>T.BufferGeometry){let g=this.geometries.get(key);if(!g){g=make();this.geometries.set(key,g);}return g;}
 private box(parent:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,mat:T.Material,round=.025){
  w=Math.max(.012,w);h=Math.max(.012,h);d=Math.max(.012,d);const radius=Math.min(round,w*.18,h*.18,d*.18);
  const key=`b:${w.toFixed(4)}:${h.toFixed(4)}:${d.toFixed(4)}:${radius.toFixed(4)}`;
  const m=new T.Mesh(this.geo(key,()=>new RoundedBoxGeometry(w,h,d,2,radius)),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
 }
 private cylinder(parent:T.Object3D,r:number,h:number,mat:T.Material,x=0,y=0,z=0){const key=`c:${r.toFixed(4)}:${h.toFixed(4)}`;const m=new T.Mesh(this.geo(key,()=>new T.CylinderGeometry(r,r,h,20)),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 private ring(parent:T.Object3D,r:number,tube:number,mat:T.Material){const key=`t:${r.toFixed(4)}:${tube.toFixed(4)}`;const m=new T.Mesh(this.geo(key,()=>new T.TorusGeometry(r,tube,6,40)),mat);parent.add(m);return m;}
 private line(parent:T.Object3D,a:T.Vector3,b:T.Vector3,r:number,mat:T.Material){const m=this.cylinder(parent,r,1,mat);this.setLine(m,a,b);return m;}
 private setLine(mesh:T.Mesh,a:T.Vector3,b:T.Vector3){const delta=b.clone().sub(a);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.y=Math.max(.001,delta.length());if(delta.lengthSq())mesh.quaternion.setFromUnitVectors(UP,delta.normalize());}
 private bolts(parent:T.Object3D,positions:T.Vector3[],axis=FORWARD,r=.027){if(!positions.length)return;const g=this.geo(`bolt:${r}`,()=>new T.CylinderGeometry(r,r,.018,8));const mesh=new T.InstancedMesh(g,this.metal,positions.length);const q=new T.Quaternion().setFromUnitVectors(UP,axis),matrix=new T.Matrix4();positions.forEach((p,i)=>{matrix.compose(p,q,new T.Vector3(1,1,1));mesh.setMatrixAt(i,matrix);});mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);}
 private plateMaterial(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d')!;c.fillStyle='#8d9a99';c.fillRect(0,0,256,256);c.strokeStyle='#627172';c.lineWidth=2;
  for(let i=0;i<256;i+=32){c.beginPath();c.moveTo(i,0);c.lineTo(i,256);c.moveTo(0,i);c.lineTo(256,i);c.stroke();}
  for(let x=8;x<256;x+=16)for(let y=8;y<256;y+=16){c.fillStyle='#a5afaa';c.fillRect(x,y,4,1);}
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;this.textures.add(texture);const m=this.material(0xffffff,.6,.57);m.map=texture;return m;
 }
 private sign(title:string,w=1.45,h=.5){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=Math.max(128,Math.round(768*h/w));const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;this.textures.add(texture);
  const material=new T.MeshBasicMaterial({map:texture,toneMapped:false});this.materials.add(material);const g=this.geo(`p:${w}:${h}`,()=>new T.PlaneGeometry(w,h));const group=new T.Group();
  for(const back of [false,true]){const mesh=new T.Mesh(g,material);mesh.position.z=back?-.006:.006;if(back)mesh.rotation.y=Math.PI;group.add(mesh);}
  const s:Sign={group,canvas,texture,key:'',title};this.paint(s,'');return s;
 }
 private paint(sign:Sign,state:string){
  const key=sign.title+'\n'+state;if(sign.key===key)return;sign.key=key;const c=sign.canvas.getContext('2d')!,w=sign.canvas.width,h=sign.canvas.height;
  c.fillStyle='#26373b';c.fillRect(0,0,w,h);c.fillStyle='#bca778';c.fillRect(0,0,7,h);c.strokeStyle='#bca778';c.lineWidth=2;c.beginPath();c.moveTo(22,h/2-9);c.lineTo(30,h/2);c.lineTo(22,h/2+9);c.lineTo(14,h/2);c.closePath();c.stroke();c.textAlign='center';c.textBaseline='middle';
  const title=sign.title.slice(0,62);let fs=Math.min(46,h*.28);c.font=`700 ${fs}px Heebo, Arial, sans-serif`;while(c.measureText(title).width>w-46&&fs>17){fs--;c.font=`700 ${fs}px Heebo, Arial, sans-serif`;}
  c.fillStyle='#eee6cf';c.fillText(title,w/2,state?h*.35:h*.5,w-32);if(state){c.font=`500 ${Math.min(31,h*.22)}px Heebo, Arial, sans-serif`;c.fillStyle='#c6d4cc';c.fillText(state.slice(0,70),w/2,h*.75,w-32);}sign.texture.needsUpdate=true;
 }
 private console(device:DeviceState,interactive=true,riding?:T.Group){const s=device.spec,[w,,d]=s.size;const anchor=riding?new T.Vector3(-w/2+.3,.9,d/2-.2):s.controlOffset?new T.Vector3(...s.position).add(new T.Vector3(...s.controlOffset)):new T.Vector3(s.position[0]-w/2-.45,s.position[1]+.8,s.position[2]+d/2+.35);if(interactive)this.controlAnchors.set(s.id,riding?device.position.clone().add(anchor):anchor.clone());const g=new T.Group();g.position.copy(anchor);(riding??this.root).add(g);this.cylinder(g,.045,.65,this.metal,0,-.49,0);this.box(g,0,-.83,0,.45,.08,.4,this.graphite);if(interactive){this.box(g,0,-.08,0,.48,.25,.32,this.graphite);const pad=this.box(g,0,.055,.01,.36,.045,.23,this.amber);pad.rotation.x=.15;}return anchor;}
 private arrow(parent:T.Object3D,size:number){
  const g=new T.Group();this.box(g,-size*.1,0,0,size*.48,.018,size*.13,this.amber,.005);for(const sign of [-1,1]){const wing=this.box(g,size*.16,0,sign*size*.08,size*.30,.018,size*.10,this.amber,.005);wing.rotation.y=sign*Math.PI/4;}parent.add(g);return g;
 }
 private platform(parent:T.Object3D,w:number,h:number,d:number,guards:boolean){
  this.box(parent,0,0,0,w,h,d,this.graphite,.045);this.box(parent,0,h/2-.035,0,w*.94,.07,d*.94,this.plate,.015);
  for(const x of [-w/2+.05,w/2-.05])this.box(parent,x,h/2+.012,0,.055,.025,d*.91,this.amber,.007);
  for(const z of [-d/2+.05,d/2-.05])this.box(parent,0,h/2+.012,z,w*.91,.025,.055,this.metal,.007);
  this.bolts(parent,[-1,1].flatMap(x=>[-1,1].map(z=>new T.Vector3(x*w*.40,h/2+.012,z*d*.40))),UP,.025);
  if(guards){for(const x of [-w/2+.08,w/2-.08]){for(const z of [-d*.36,d*.36])this.cylinder(parent,.025,.72,this.metal,x,h/2+.36,z);this.line(parent,new T.Vector3(x,h/2+.72,-d*.40),new T.Vector3(x,h/2+.72,d*.40),.026,this.metal);}}
 }
 private tracks(device:DeviceState){
  const s=device.spec,start=new T.Vector3(...s.position),ends=(s.stops??[]).map(stop=>new T.Vector3(...stop.position));if(s.target)ends.push(new T.Vector3(...s.target));if(!ends.length)return;
  const finish=ends.reduce((a,b)=>b.distanceToSquared(start)>a.distanceToSquared(start)?b:a,start.clone());const direction=finish.clone().sub(start);if(direction.lengthSq()<.001)return;
  const side=Math.abs(direction.clone().normalize().y)>.8?new T.Vector3(1,0,0):new T.Vector3().crossVectors(direction,UP).normalize();
  for(const sign of [-1,1]){const off=side.clone().multiplyScalar(sign*s.size[0]*.42);const a=start.clone().add(off),b=finish.clone().add(off);this.line(this.root,a,b,.045,this.graphite);this.line(this.root,a.clone().add(new T.Vector3(0,0,-.045)),b.clone().add(new T.Vector3(0,0,-.045)),.018,this.metal);}
 }

 private build(device:DeviceState){
  const s=device.spec,[w,h,d]=s.size;const body=new T.Group();body.name=`machinery:${s.id}:${s.kind}`;body.position.copy(device.position);this.root.add(body);
  const sign=this.sign(s.label,Math.max(.85,Math.min(1.8,w)),.45);const visual:Visual={device,body,sign};this.visuals.push(visual);
  if(s.kind==='switch'){
   this.box(body,0,-h*.12,0,w*.86,h*.72,d*.78,this.graphite,.045);this.box(body,0,-h*.12,d*.405,w*.72,h*.57,.035,this.ceramic);
   this.box(body,0,-h*.47,0,w,.08,d,this.metal);const lever=new T.Group();lever.position.set(0,-h*.07,d*.43);body.add(lever);visual.lever=lever;lever.rotation.x=device.on?-.58:.58;
   const pin=this.cylinder(lever,w*.095,w*.56,this.metal);pin.rotation.z=Math.PI/2;this.cylinder(lever,w*.045,h*.31,this.metal,0,h*.155,0);const grip=this.cylinder(lever,w*.085,w*.48,this.rubber,0,h*.32,0);grip.rotation.z=Math.PI/2;
   const status=this.material(0x465551,.25,.45);visual.status=status;this.box(body,-w*.25,h*.18,d*.43,w*.13,h*.09,.025,status,.008);
   this.bolts(body,[-1,1].flatMap(x=>[-1,1].map(y=>new T.Vector3(x*w*.31,-h*.12+y*h*.23,d*.435))));sign.group.position.set(0,h*.67,0);body.add(sign.group);this.controlAnchors.set(s.id,new T.Vector3(...s.position));
  }else if(s.kind==='shutter'){
   const base=new T.Vector3(...s.position),target=new T.Vector3(...(s.target??[s.position[0],s.position[1]+h+.3,s.position[2]]));
   for(const x of [-w/2-.10,w/2+.10]){const a=base.clone().add(new T.Vector3(x,-h/2,0)),b=target.clone().add(new T.Vector3(x,h/2,0));this.line(this.root,a,b,.065,this.graphite);this.line(this.root,a.clone().add(new T.Vector3(0,0,d/2+.025)),b.clone().add(new T.Vector3(0,0,d/2+.025)),.022,this.metal);}
   this.box(this.root,base.x,base.y+h/2+.13,base.z,w+.38,.25,d+.2,this.graphite,.035);
   const count=Math.max(4,Math.min(16,Math.ceil(h/.28)));for(let i=0;i<count;i++){const y=-h/2+(i+.5)*h/count;this.box(body,0,y,0,w,h/count-.012,d*.9,i%4===0?this.metal:this.ceramic,.015);this.box(body,0,y-h/count*.34,d*.46,w*.92,.025,.028,this.graphite,.005);}
   this.box(body,0,-h/2+.025,d*.49,w,.05,.035,this.amber,.008);sign.group.position.copy(base).add(new T.Vector3(0,h/2+.55,d/2+.08));this.root.add(sign.group);
  }else if(s.kind==='lift'||s.kind==='moving-platform'){
   this.platform(body,w,h,d,true);this.tracks(device);const riding=s.kind==='lift'?body:undefined,anchor=this.console(device,s.kind==='lift',riding);sign.group.position.copy(anchor).add(new T.Vector3(0,.45,0));(riding??this.root).add(sign.group);
   if(s.kind==='lift'){
    visual.cables=[];for(const x of [-w*.34,w*.34]){const a=device.position.clone().add(new T.Vector3(x,h/2,-d*.34)),maxY=Math.max(s.position[1],s.target?.[1]??s.position[1],...(s.stops??[]).map(stop=>stop.position[1]))+1.2;const cable=this.line(this.root,a,new T.Vector3(a.x,maxY,a.z),.015,this.graphite);visual.cables.push(cable);}
   }
  }else if(s.kind==='conveyor'){
   this.box(body,0,0,0,w,h,d,this.graphite,.04);const dir=new T.Vector3(...(s.direction??[1,0,0]));dir.y=0;if(dir.lengthSq()<.001)dir.set(1,0,0);dir.normalize();const transportX=Math.abs(dir.x)>=Math.abs(dir.z),length=transportX?w:d,span=transportX?d:w;const along=transportX?new T.Vector3(1,0,0):new T.Vector3(0,0,1),axle=transportX?new T.Vector3(0,0,1):new T.Vector3(1,0,0),radius=Math.min(.09,h*.32);visual.rollers=[];
   const count=Math.max(4,Math.min(28,Math.ceil(length/.21)));for(let i=0;i<count;i++){const p=along.clone().multiplyScalar(-length/2+(i+.5)*length/count);const roller=this.cylinder(body,radius,Math.max(.12,span-.17),i%4?this.metal:this.rubber,p.x,h/2-radius*.10,p.z);roller.quaternion.setFromUnitVectors(UP,axle);visual.rollers.push(roller);}
   for(const sign of [-1,1]){const offset=axle.clone().multiplyScalar(sign*(span/2-.04));const rail=this.box(body,offset.x,h/2,offset.z,transportX?w:.08,.10,transportX?.08:d,this.metal,.015);rail.receiveShadow=true;}
   const arrows=new T.Group();arrows.position.y=h/2+radius+.025;for(const p of [-.3,.3]){const arrow=this.arrow(arrows,Math.min(.5,span*.55));arrow.position.copy(along.clone().multiplyScalar(p*length));if(!transportX)arrow.rotation.y=-Math.PI/2;}body.add(arrows);visual.arrows=arrows;
   sign.group.position.copy(new T.Vector3(...s.position)).add(new T.Vector3(0,h/2+.6,d/2+.15));this.root.add(sign.group);
  }else if(s.kind==='junction'){
   // Device position is the pivot; the physical deck begins at local X0.
   const collar=this.cylinder(this.root,Math.min(.63,d*.5),Math.max(.16,h),this.graphite,device.position.x,device.position.y-h*.3,device.position.z);collar.receiveShadow=true;
   const ring=this.ring(this.root,Math.min(.55,d*.46),.035,this.metal);ring.rotation.x=Math.PI/2;ring.position.copy(device.position).add(new T.Vector3(0,h/2+.03,0));
   this.box(body,w/2,0,0,w,h,d,this.graphite,.035);this.box(body,w/2,h/2-.035,0,w*.98,.07,d*.91,this.plate,.012);
   for(const z of [-d/2+.03,d/2-.03]){this.box(body,w/2,-h*.28,z,w,.12,.09,this.metal,.012);this.box(body,w/2,h/2+.02,z,w,.035,.045,this.amber,.008);}
   for(let x=.35;x<w;x+=.7)this.box(body,x,-h/2-.09,0,.08,.16,d*.78,this.metal,.012);const arrow=this.arrow(body,Math.min(.7,d*.7));arrow.position.set(w*.65,h/2+.035,0);
   const anchor=this.console(device);sign.group.position.copy(anchor).add(new T.Vector3(0,.45,0));this.root.add(sign.group);
  }else if(s.kind==='relay'){
   this.box(body,0,-h*.37,0,w,.22*h,d,this.graphite,.035);this.cylinder(body,Math.min(w,d)*.19,h*.44,this.metal,0,-h*.15,0);
   const head=new T.Group();body.add(head);visual.head=head;const radius=Math.max(.09,Math.min(w,h,d)*.32);const outer=this.ring(head,radius,.035,this.metal);outer.rotation.y=Math.PI/2;
   const barrel=this.cylinder(head,radius*.62,Math.max(.16,d*.48),this.graphite);barrel.rotation.x=Math.PI/2;const lens=this.cylinder(head,radius*.50,.025,this.amber,0,0,d*.25);lens.rotation.x=Math.PI/2;
   const prism=new T.Mesh(this.geo(`prism:${radius}`,()=>new T.OctahedronGeometry(radius*.65)),this.ceramic);prism.position.z=d*.28;head.add(prism);
   this.line(head,new T.Vector3(radius,-radius*.2,0),new T.Vector3(radius*1.25,-radius*.7,0),.028,this.metal);const grip=this.cylinder(head,.045,radius*.6,this.rubber,radius*1.25,-radius*.9,0);grip.rotation.x=.2;
   const beam=new T.Group();this.root.add(beam);visual.beam=beam;visual.beamCore=this.cylinder(beam,.017,1,this.beamMaterial);visual.beamHalo=this.cylinder(beam,.055,1,this.haloMaterial);visual.blockedSign=this.sign('BLOCKED',1,.3);this.root.add(visual.blockedSign.group);
   sign.group.position.set(0,h/2+.45,0);body.add(sign.group);this.controlAnchors.set(s.id,new T.Vector3(...s.position));
  }else if(s.kind==='receiver'){
   const source=this.systems.devices.find(d=>d.spec.receivers?.some(r=>r.id===s.id));this.receiver(s.id,s.label,device.position,Math.max(.32,Math.min(w,h)),source?.position);sign.group.visible=false;
  }
 }

 private receiver(id:string,label:string,position:T.Vector3,size:number,source?:T.Vector3){
  const body=new T.Group();body.name='receiver:'+id;body.position.copy(position);if(source)body.quaternion.setFromUnitVectors(FORWARD,source.clone().sub(position).normalize());this.root.add(body);
  this.box(body,0,0,-.055,size,size,.13,this.graphite,.045);this.ring(body,size*.36,.035,this.metal);const lamp=this.material(0x213b3b,.3,.28);const disc=this.cylinder(body,size*.27,.035,lamp,0,0,.035);disc.rotation.x=Math.PI/2;
  this.bolts(body,[-1,1].flatMap(x=>[-1,1].map(y=>new T.Vector3(x*size*.36,y*size*.36,.025))),FORWARD,.018);
  const sign=this.sign(label,Math.max(.75,size*1.4),.33);sign.group.position.set(0,size*.8,0);body.add(sign.group);this.receivers.push({id,body,lamp,sign});
 }

 update(dt:number){
  if(this.disposed)return;const step=Math.max(0,Math.min(dt,.1));
  for(const v of this.visuals){const d=v.device,s=d.spec;v.body.position.copy(d.position);let state=s.stops?.[d.choice]?.label??s.states?.[d.choice]??'';
   if(s.kind==='switch'){if(v.lever)v.lever.rotation.x=T.MathUtils.damp(v.lever.rotation.x,d.on?-.58:.58,16,step);v.status?.color.setHex(d.on?0xd8b267:0x465551);v.status?.emissive.setHex(d.on?0x44300c:0);state=d.on?'ON':'OFF';}
   if(s.kind==='shutter')state=d.progress>.985?'OPEN':d.progress<.015?'CLOSED':d.on?'OPENING':'CLOSING';
   if(s.kind==='lift'||s.kind==='moving-platform'){if(s.kind==='lift')this.controlAnchors.get(s.id)?.copy(d.position).add(new T.Vector3(-s.size[0]/2+.3,.9,s.size[2]/2-.2));state=(state?state+' · ':'')+(d.moving?'MOVING':d.on?'READY':'STOPPED');if(v.cables){const top=Math.max(s.position[1],s.target?.[1]??s.position[1],...(s.stops??[]).map(stop=>stop.position[1]))+1.2;v.cables.forEach((c,i)=>{const a=d.position.clone().add(new T.Vector3((i?1:-1)*s.size[0]*.34,s.size[1]/2,-s.size[2]*.34));this.setLine(c,a,new T.Vector3(a.x,top,a.z));});}}
   if(s.kind==='conveyor'){
    const reverse=!!s.controls&&this.systems.flag(s.controls),direction=new T.Vector3(...(s.direction??[1,0,0]));const axisSign=Math.abs(direction.x)>=Math.abs(direction.z)?Math.sign(direction.x||1):Math.sign(direction.z||1);const sign=axisSign*(reverse?-1:1),angularSign=Math.abs(direction.x)>=Math.abs(direction.z)?-sign:sign;const radius=Math.min(.09,s.size[1]*.32);if(d.on)for(const roller of v.rollers??[])roller.rotateY(angularSign*(s.speed??1.7)*step/Math.max(.025,radius));if(v.arrows)v.arrows.rotation.y=sign<0?Math.PI:0;state=d.on?(reverse?'RUNNING · REVERSED':'RUNNING'):'STOPPED';
   }
   if(s.kind==='junction'){v.body.rotation.y=d.angle;state=(state?state+' · ':'')+(Math.abs((s.angles?.[d.choice]??d.choice*Math.PI/2)-d.angle)>.03?'TURNING':'ALIGNED');}
   if(s.kind==='relay'){
    const receiver=s.receivers?.[d.choice],end=receiver?new T.Vector3(...receiver.position):undefined;
    if(receiver&&end&&d.on){v.head?.quaternion.setFromUnitVectors(FORWARD,end.clone().sub(d.position).normalize());const beamEnd=d.blocked?(d.beamHit?.clone()??end):end;v.beam!.visible=true;this.setLine(v.beamCore!,d.position,beamEnd);this.setLine(v.beamHalo!,d.position,beamEnd);v.blockedSign!.group.visible=d.blocked;v.blockedSign!.group.position.copy(beamEnd).add(new T.Vector3(0,.35,0));state=(receiver.id+' · ')+(d.blocked?'BLOCKED':d.powered?'BEAM CONNECTED':'IDLE');}
    else{v.beam!.visible=false;v.blockedSign!.group.visible=false;state='NO RECEIVER';}
   }
   this.paint(v.sign,state);
  }
  for(const receiver of this.receivers){const powered=this.systems.devices.some(d=>d.spec.kind==='relay'&&d.powered===receiver.id)||this.systems.flags[receiver.id]===true;receiver.lamp.color.setHex(powered?0xf0c16b:0x213b3b);receiver.lamp.emissive.setHex(powered?0xa56117:0);receiver.lamp.emissiveIntensity=powered?.65:0;this.paint(receiver.sign,powered?'POWERED':'IDLE');}
 }

 dispose(){if(this.disposed)return;this.disposed=true;this.root.removeFromParent();this.root.clear();for(const geometry of this.geometries.values())geometry.dispose();for(const material of this.materials)material.dispose();for(const texture of this.textures)texture.dispose();this.geometries.clear();this.materials.clear();this.textures.clear();this.visuals=[];this.receivers=[];this.controlAnchors.clear();}
}
