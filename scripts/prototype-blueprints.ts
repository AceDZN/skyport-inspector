import {Vector3}from'three';
import{makeSolid,V,type Solid,type Surface}from'../src/physics';
import type{CatalogueRow,CampaignGoal,Family}from'../src/campaign-types';
import type{CrateSpec}from'../src/content';
import type{DeviceSpec,XYZ,Circuit}from'../src/systems';
export interface CargoStart {spec:CrateSpec;position:XYZ}
export interface CampaignPad {id:string;label:string;position:XYZ}
export interface CampaignBridge {id:string;center:XYZ;size:XYZ;circuit:Circuit;route:string}
export interface CampaignExit {id:string;label:string;position:XYZ;size:XYZ}
export interface Region {id:string;position:XYZ;size:XYZ}
export interface Mark {text:string;position:XYZ;normal?:XYZ;width?:number;height?:number}
export interface WorldBlueprint {family:Family;spawn:XYZ;solids:Solid[];surfaces:Surface[];cargo:CargoStart[];pads:CampaignPad[];bridges:CampaignBridge[];devices:DeviceSpec[];exits:CampaignExit[];regions:Region[];marks:Mark[];presetPortal?:{index:number;surface:string};history?:{actor:string;carried:string;beside:string};routePoints:Record<string,XYZ>;notes:string[]}
const unique=<T>(xs:T[])=>[...new Set(xs)];
export const allGoals=(row:CatalogueRow)=>[row.normalizedGoal,...row.normalizedGoalAlternatives??[],...(row.semanticDecision.changedWordingCheck.normalizedContrastGoal?[row.semanticDecision.changedWordingCheck.normalizedContrastGoal]:[])];
const words=(id:string)=>id.replace(/-/g,' ').toUpperCase();
export function makePrototypeBlueprint(row:CatalogueRow):WorldBlueprint {
 const family=row.family.toLowerCase() as Family,n=row.number;
 const b:WorldBlueprint={family,spawn:[0,.86,10],solids:[],surfaces:[],cargo:[],pads:[],bridges:[],devices:[],exits:[],regions:[],marks:[],routePoints:{},notes:[]};
 const goals=allGoals(row),cargoIds=unique(goals.flatMap(g=>g.cargo?.map(c=>c.id)??[]));
 const padIds=unique(goals.flatMap(g=>g.cargo?.map(c=>c.pad)??[]));for(const alt of row.semanticDecision.plausibleAlternatives??[])if(/pad|platform/.test(alt)){const id=alt.replace(/\s+(pad|platform)$/,'').replace(/\s+/g,'-');if(!padIds.includes(id))padIds.push(id);}
 const exitIds=unique(goals.map(g=>g.exit));
 const floor=(id:string,x:number,z:number,w:number,d:number,y=0)=>b.solids.push(makeSolid(id,x,y-.3,z,w,.6,d,'floor'));
 const wall=(id:string,x:number,y:number,z:number,w:number,h:number,d:number,glass=false)=>b.solids.push(makeSolid(id,x,y,z,w,h,d,glass?'glass':'wall'));
 const panel=(id:string,position:XYZ,normal:XYZ=[0,0,1],host?:string)=>{const p=V(...position),no=V(...normal),isFloor=Math.abs(no.y)>.8;const solidId=host??'host-'+id;if(!host){const back=p.clone().addScaledVector(no,-.2);wall(solidId,back.x,back.y,back.z,Math.abs(no.x)>.8?.35:3.8,isFloor?.3:3.6,Math.abs(no.z)>.8?.35:3.8);}b.surfaces.push({id,center:p,normal:no,up:isFloor?V(0,0,-1):V(0,1,0),width:3.5,height:isFloor?3.5:3.6,solidId,floor:isFloor});b.routePoints[id]=position;};
 const mark=(text:string,p:XYZ,normal:XYZ=[0,0,1],width=3,height=.5)=>b.marks.push({text,position:p,normal,width,height});
 const exit=(id:string,p:XYZ)=>{b.exits.push({id,label:words(id),position:p,size:[2.5,2.8,2.5]});b.routePoints[id]=[p[0],p[1]-.55,p[2]];};
 const pad=(id:string,p:XYZ)=>{b.pads.push({id,label:'P'+(b.pads.length+1),position:p});b.routePoints[id]=p;};
 const switchDevice=(id:string,p:XYZ)=>{if(!b.devices.some(d=>d.id===id))b.devices.push({id,kind:'switch',label:words(id),position:p,size:[.55,1.0,.5]});};
 const bridge=(id:string,center:XYZ,size:XYZ,circuit:Circuit)=>{b.bridges.push({id,center,size,circuit,route:id});b.regions.push({id:'route:'+id,position:[center[0],center[1]+.9,center[2]],size:[size[0],1.5,size[2]]});};
 const northExit=(id:string,x=0,y=0,z=-13)=>{floor('exit-floor-'+id,x,z,4,4,y);exit(id,[x,y+1,z]);};
 const sideExit=(id:string,sign:number,z=-5,y=0)=>{floor('landing-'+id,sign*14,z,4,4,y);exit(id,[sign*14,y+1,z]);};
 // Each family has a different floor graph, not a rotated/recoloured common courtyard.
 if(family==='threshold'){
  floor('start',0,7,12,10);floor('destination',0,-7,16,8);wall('glass',0,2,1,16,4,.18,true);panel('near-panel',[-3,1.7,3]);panel('installed-b',[-3,1.7,-10.5]);b.presetPortal={index:1,surface:'installed-b'};for(let i=0;i<exitIds.length;i++)exit(exitIds[i],[i===0?5:-5,1,-7]);if(exitIds.length===1)exit('west-exit',[-5,1,-7]);mark('START · FACE NORTH',[0,.02,9],[0,1,0]);
 }else if(family==='l-gallery'){
  floor('south-gallery',-4,7,6,12);floor('cross-gallery',2,-6,18,5);wall('inside-corner',-1,1.8,1,3,3.6,3);b.spawn=[-4,.86,11];panel('window-panel',[-6.8,1.7,/shutter|cargo lane/i.test(row.geometryRoute)?1.6:7],[1,0,0]);panel('shelf-panel',[-4,1.7,1.2]);panel('cross-panel',[2,1.7,-4],[0,0,-1]);mark('WINDOW',[-6.9,2.5,2],[1,0,0]);mark('BEAM',[1,2.8,-6],[0,0,1]);for(let i=0;i<exitIds.length;i++)exit(exitIds[i],[/right|east|receiving/.test(exitIds[i])?7:-5,1,-4.5]);if(exitIds.length===1)exit('left-door',[-5,1,-4.5]);
 }else if(family==='split-atrium'||family==='history-depot'){
  const width=family==='history-depot'?20:16;floor('front-hall',0,6,width,12);floor('rear-hall',0,-6,width,12);wall('glass',0,2,0,width+4,4,.18,true);panel('near-panel',[-4,1.7,2.4]);panel('far-panel',[-4,1.7,-11.7]);panel('side-panel',[-width/2+.2,1.7,8],[1,0,0]);mark(family==='history-depot'?'LOADING RACK':'MAINTENANCE WINDOW',[4,2.3,-11.7]);for(let i=0;i<exitIds.length;i++){const sign=/west|left/.test(exitIds[i])?-1:1;sideExit(exitIds[i],sign,-5);}if(exitIds.length===1)sideExit(/west/.test(exitIds[0])?'east-exit':'west-exit',/west/.test(exitIds[0])?1:-1,-5);
 }else if(family==='canal'){
  floor('near-quay',0,8,18,8);floor('far-quay',0,-8,18,8);b.spawn=[0,.86,10];panel('near-panel',[-5,1.7,4.2]);panel('far-panel',[5,1.7,-11.8]);mark('START QUAY',[0,.02,9],[0,1,0]);mark('GARDEN',[-5,2,-11.7]);for(let i=0;i<exitIds.length;i++){const x=/west|garden/.test(exitIds[i])?-5:5;exit(exitIds[i],[x,1,-8]);}if(exitIds.length===1)exit('other-dock-exit',[-(/west|garden/.test(exitIds[0])?-5:5),1,-8]);
  if(n>=21){b.devices.push({id:'garden-ferry',kind:'moving-platform',label:'GARDEN FERRY',position:[-4,-.2,4],target:[-4,-.2,-4],size:[3.5,.4,3.5],period:8});b.devices.push({id:'workshop-ferry',kind:'moving-platform',label:'WORKSHOP FERRY',position:[4,-.2,4],target:[4,-.2,-4],size:[3.5,.4,3.5],period:10});b.routePoints['board-ferry']=[-4,.85,4.5];}
 }else if(family==='return-loop'){
  floor('entrance',0,9,16,5);floor('left-loop',-6,0,4,15);floor('right-loop',6,0,4,15);floor('far-loop',0,-8,16,4);wall('central-block',0,2,0,8,4,11);b.spawn=[0,.86,10];panel('entry-panel',[-5,1.7,6.5]);panel('service-panel',[-5,1.7,-9.7]);for(let i=0;i<exitIds.length;i++)exit(exitIds[i],[/south|return/.test(exitIds[i])?3:-3,1,/south|return/.test(exitIds[i])?9:-8]);mark('CENTRAL DOOR',[0,2.7,5.7]);
 }else if(family==='dual-vault'){
  floor('central-hall',0,4,8,16);floor('west-vault',-8,-3,8,7);floor('east-vault',8,-3,8,7);wall('west-divider',-4,2,-3,.3,4,7);wall('east-divider',4,2,-3,.3,4,7);panel('central-panel',[0,1.7,0]);panel('west-vault-panel',[-11.7,1.7,-3],[1,0,0]);panel('east-vault-panel',[11.7,1.7,-3],[-1,0,0]);northExit(exitIds[0],0,0,-10);if(exitIds.length>1)for(const id of exitIds.slice(1))northExit(id,/south|west/.test(id)?-6:6,0,-10);mark('VAULT WEST',[-8,2.7,-6.2]);mark('VAULT EAST',[8,2.7,-6.2]);
 }else if(family==='lift-shaft'){
  floor('base-hall',0,8,14,8);floor('middle-dock',-3,-1,8,6,2.8);floor('top-dock',3,-8,10,7,5.6);b.spawn=[0,.86,10];panel('base-panel',[-5,1.7,4.2]);panel('middle-panel',[-6.8,4.5,-1],[1,0,0]);panel('top-panel',[6.8,7.3,-10],[-1,0,0]);for(const id of exitIds){const mid=/middle|lower/.test(id);exit(id,[mid?-3:3,(mid?2.8:5.6)+1,mid?-1:-8]);}if(exitIds.length===1)exit('middle-exit',[-3,3.8,-1]);
 }else if(family==='bridge-rotunda'){
  floor('entry-walk',0,8,5,9);floor('hub',0,0,6,6);floor('east-landing',10,0,5,6);floor('west-landing',-10,0,5,6);floor('north-landing',0,-10,6,5);b.spawn=[0,.86,10];panel('entry-panel',[0,1.7,3.7]);panel('hub-panel',[-2.8,1.7,0],[1,0,0]);for(const id of exitIds){const west=/west/.test(id),north=/north/.test(id);exit(id,[west?-10:north?0:10,1,north?-10:0]);}for(const [id,p]of [['north-exit',[0,1,-10]],['east-exit',[10,1,0]],['west-exit',[-10,1,0]]] as const)if(!b.exits.some(e=>e.id===id))exit(id,[...p]);
 }else if(family==='conveyor-bay'){
  floor('infeed',0,8,16,8);floor('outfeed',0,-7,16,8);floor('pedestrian-aisle',-7,0,3,10);wall('cargo-grate',0,2.25,0,10,2,.3);floor('cargo-lane',0,0,6,8);panel('infeed-panel',[5,1.7,4.2]);panel('outfeed-panel',[5,1.7,-10.7]);mark('CARGO ONLY',[0,2.0,.2]);for(const id of exitIds)exit(id,[/west|left/.test(id)?-5:5,1,-8]);
 }else if(family==='relay-garden'){
  floor('garden-start',0,7,18,10);floor('garden-island',0,-6,12,10);floor('western-path',-8,-1,3,13);b.spawn=[0,.86,10];panel('garden-panel',[-5,1.7,2.2]);panel('island-panel',[4,1.7,-10.7]);mark('GARDEN CHANNEL',[0,.03,5],[0,1,0]);for(const id of exitIds){const upper=/upper/.test(id),west=/west/.test(id);const y=upper?3.2:0;const x=west?-5:5;floor('receiver-deck-'+id,x,-8,5,6,y);exit(id,[x,y+1,-9]);}
 }else if(family==='launch-spire'){
  floor('launch-base',0,7,16,10);floor('low-westledge',-6,-9,3,5);floor('low-eastledge',6,-9,3,5);floor('upper-balcony',0,-4,12,5,3.4);wall('launch-backwall',0,4.5,-12,6,9,.4);b.spawn=[0,.86,10];panel('floor-rift',[3,.025,6],[0,1,0],'launch-base');panel('high-rift',[0,6,-11.77],[0,0,1],'launch-backwall');panel('return-panel',[-6,1.7,3]);for(const id of exitIds){const x=/west/.test(id)?-4:4;exit(id,[x,4.4,-4]);}b.regions.push({id:'region:upper-balcony',position:[0,4.4,-4],size:[12,3,5]});mark('LAUNCH WELL',[3,.04,8],[0,1,0]);
 }else{
  floor('relay-lower',0,9,18,8);floor('middle-workshop',-5,-2,8,10,3.2);floor('upper-relay',5,-10,9,9,6.4);floor('side-return',8,2,4,9);panel('lower-panel',[-6,1.7,5.2]);panel('middle-panel',[-8.8,4.9,-2],[1,0,0]);panel('upper-panel',[8.8,8.1,-11],[-1,0,0]);b.spawn=[0,.86,11];for(const id of exitIds)exit(id,[5,7.4,-10]);mark('RELAY STAGE 1',[0,2.4,5.3]);
 }
 // Named pads are placed by actual spatial relations; labels remain neutral P1/P2.
 const placePad=(id:string,i:number):XYZ=>{let x=i%2===0?-2.5:2.5,z=-6,y=0;if(/front|entrance|near|return|waiting|lower/.test(id))z=6;if(/left|west/.test(id))x=-4;if(/right|east/.test(id))x=4;if(/central|terminal|socket/.test(id))x=0;if(/opposite-window/.test(id)){x=4;z=5;}if(/beside-window/.test(id)){x=4;z=-9;}if(/beam/.test(id)){x=/left/.test(id)?-3:3;z=-6;}if(family==='lift-shaft'){y=/middle|lower/.test(id)?2.8:5.6;x=y===2.8?-3:3;z=y===2.8?-1:-8;}if(family==='bridge-rotunda'){x=/upper|north/.test(id)?0:/west/.test(id)?-9:0;z=/upper|north/.test(id)?-10:0;}if(family==='return-loop'){x=/front|return/.test(id)?3:-6;z=/front|return/.test(id)?9:-5;}if(family==='conveyor-bay'){x=/left|west/.test(id)?-3:3;z=-7;}if(family==='dual-vault'){x=/north|central|front/.test(id)?0:/west/.test(id)?-8:8;z=/front/.test(id)?7:-5;}if(family==='launch-spire'){x=/west/.test(id)?-4:4;z=-4;y=3.4;}if(family==='relay-garden'&&/upper/.test(id)){x=5;z=-8;y=3.2;}if(family==='finale'){x=5;z=-10;y=6.4;}return[x,y+.14,z];};
 for(let i=0;i<padIds.length;i++)pad(padIds[i],placePad(padIds[i],i));
 // Every object choice exists; history-role IDs are never printed as an answer.
 for(const alt of row.semanticDecision.plausibleAlternatives??[])if(/crate|cargo|diamond|triangle|cell/.test(alt)&&! /pad|platform|route|door|receiver/.test(alt)&&!cargoIds.includes(alt))cargoIds.push(alt.replace(/\s+/g,'-'));
 if(cargoIds.length===1&&row.number!==1)cargoIds.push('spare-cargo');
 const targetFront=padIds.some(id=>/front|near|return/.test(id));for(let i=0;i<cargoIds.length;i++){const id=cargoIds[i],large=/large|larger|wide/.test(id),triangle=/triangle/.test(id)||i%2===1;let x=-1.5+i*2.5,z=targetFront?-7:7,y=0;if(family==='l-gallery'){x=-4;z=8+i*1.3;}if(family==='dual-vault'){x=i%2===0?-8:8;z=-3;}if(family==='conveyor-bay'){x=-1.5+i*3;z=8;}if(family==='return-loop'){x=-6;z=targetFront?-7:4;}if(family==='bridge-rotunda'){x=i*1.8-1;z=1;}if(family==='lift-shaft'){x=1+i*1.5;z=9;}if(family==='finale'){x=-2+i*2;z=10;}const label=/carried|beside|delivered|crate-[ab]|cargo-\d/.test(id)?(triangle?'TRIANGLE':'DIAMOND'):words(id);b.cargo.push({spec:{id,label,shape:triangle?'triangle':'diamond',size:large?'large':'small',start:z>0?'front':'behind'},position:[x,y+(large?.55:.42),z]});}
 if((row.geometryRoute+' '+row.semanticDecision.required).includes('Rook')&&b.cargo.length>=2){const carried=/stood beside|belt carried|by the conveyor/.test(row.semanticDecision.required)?b.cargo[1]:b.cargo[0];b.history={actor:'Rook',carried:carried.spec.id,beside:b.cargo.find(c=>c!==carried)!.spec.id};}
 // Actual machinery is connected to routes; required state labels are not inert goal flags.
 const deviceGoals=unique(goals.flatMap(g=>g.devices?.map(d=>d.id)??[]));const orders=goals.flatMap(g=>g.order??[]);const shutterNames=unique([...deviceGoals.filter(id=>/shutter|door|gate|lane/.test(id)),...orders.filter(e=>e.startsWith('shutter:')).map(e=>e.split(':')[1])]);
 const switchNames=unique([...deviceGoals.filter(id=>! /lift|junction|receiver|bridge|origin-panel|shutter|door|gate|lane/.test(id)),...orders.filter(e=>e.startsWith('switch:')).map(e=>e.split(':')[1])]);
 for(let i=0;i<switchNames.length;i++)switchDevice(switchNames[i],[-2+i*1.7,.8,8.5]);
 for(let i=0;i<shutterNames.length;i++){const id=shutterNames[i];const controller=switchNames[Math.min(i,switchNames.length-1)]??id+'-lever';if(!switchNames.length)switchDevice(controller,[-2+i*2,.8,8]);const p:XYZ=family==='return-loop'?[-6,1.5,i===0?3:-4]:family==='l-gallery'?[-4,1.5,2.5]:[0,1.5,-1-i*3];b.devices.push({id,kind:'shutter',label:words(id),position:p,size:[family==='return-loop'?3.9:4.5,3,.35],target:[p[0],p[1]+3.5,p[2]],circuit:{all:[controller]}});b.regions.push({id:'route:'+id,position:p,size:[4.5,3,.6]});}
 if(family==='lift-shaft'||deviceGoals.some(id=>/lift/.test(id))){const liftNames=unique(deviceGoals.filter(id=>/lift/.test(id)));if(!liftNames.length)liftNames.push('lift');for(let i=0;i<liftNames.length;i++){const id=liftNames[i],x=i===0?2:-4;const base:XYZ=[x,-.2,3.5];b.devices.push({id,kind:'lift',label:words(id),position:base,size:[3.4,.4,3.4],stops:[{label:'base',position:base},{label:'middle',position:[x,2.6,1]},{label:'upper',position:[x,5.4,-4.5]},{label:'top',position:[x,5.4,-7]}]});b.routePoints[id]=[x,.85,5.1];}}
 if(family==='bridge-rotunda'||deviceGoals.includes('junction')){b.devices.push({id:'junction',kind:'junction',label:'JUNCTION',position:[0,-.15,0],size:[9,.3,2.6],states:['east','north','west'],angles:[0,Math.PI/2,Math.PI]});b.routePoints.junction=[0,.85,2];}
 if(family==='conveyor-bay'||/belt|conveyor/.test(row.semanticDecision.required+' '+row.geometryRoute)){const loop=/loop/.test(row.geometryRoute);b.devices.push({id:loop?'loop-belt':'west-belt',kind:'conveyor',label:loop?'LOOP BELT':'WEST BELT',position:[-1.7,.06,1],size:[2.5,.12,14],direction:[0,0,-1],speed:1.7});if(loop)b.devices.push({id:'loop-belt-return',kind:'conveyor',label:'RETURN BELT',position:[1.7,.06,-5],size:[5.5,.12,2.5],direction:[1,0,0],speed:1.7});}
 for(const relay of goals.flatMap(g=>g.relay?[g.relay]:[])){if(b.devices.some(d=>d.id===relay.id))continue;const candidates=unique(goals.filter(g=>g.relay?.id===relay.id).map(g=>g.relay!.receiver));if(candidates.length===1)candidates.push(/upper/.test(candidates[0])?'lower':'south-receiver');const receivers=candidates.map((id,i)=>({id,position:[i===0?4:-4,/upper/.test(id)?3.4:1.2,-3] as XYZ}));b.devices.push({id:relay.id,kind:'relay',label:words(relay.id),position:[0,1.2,5],size:[.6,1,.6],states:candidates,receivers});for(const receiver of receivers)b.devices.push({id:receiver.id,kind:'receiver',label:words(receiver.id),position:receiver.position,size:[.8,.8,.4]});}
 // Cargo circuits open actual bridges/shutters at distinct gaps.
 if(family==='split-atrium'||family==='history-depot'){const condition: Circuit={any:padIds};for(const e of b.exits){const sign=e.position[0]<0?-1:1;bridge(e.id.replace('exit','bridge'),[sign*10.5,-.15,e.position[2]],[5,.3,3.3],condition);}}
 if(family==='dual-vault'){bridge('north-bridge',[0,-.15,-7],[3,.3,4],{all:padIds});}
 if(family==='canal'&&n<21){for(const x of[-5,5])bridge(x<0?'west-bridge':'east-bridge',[x,-.15,0],[3,.3,8],{any:padIds});}
 // Explicitly marked landing regions support ordered events without teleporting actors into them.
 for(const e of b.exits)b.regions.push({id:'exit:'+e.id,position:e.position,size:e.size});
 return b;
}
