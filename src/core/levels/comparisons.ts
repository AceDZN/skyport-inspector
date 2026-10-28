/** Unregistered explicit comparison drafts16–20; acceptance requires actual native/public routes. */
import type {CoreLevel} from '../level';
import {ChamberBuilder} from '../level-kit';
import {comparisonsEnglish} from './comparisons-english';
import type {Circuit} from '../../systems';

/** Two genuine floor depths, an opposed high wall and a bounded recovery basin. */
function twinShafts(distanceVariant=false){
 const b=new ChamberBuilder(),w=b.world;w.family='launch-spire';w.spawn=[-1,.87,11];
 const basin=-22,ceiling=distanceVariant?11.5:13,maxX=distanceVariant?40:30,midX=(maxX-8)/2,width=maxX+8;
 b.floor('recovery-basin',-8,maxX,-12,14,basin);
 b.box('west-launch-wall',[-8.2,(ceiling+basin)/2,1],[.4,ceiling-basin,26.8]);
 b.box('north-enclosure',[midX,(ceiling+basin)/2,-12.2],[width+.8,ceiling-basin,.4]);
 b.box('south-enclosure',[midX,(ceiling+basin)/2,14.2],[width+.8,ceiling-basin,.4]);
 b.box('twin-shaft-ceiling',[midX,ceiling+.2,1],[width+.8,.4,26.8]);
 // Substantial observation deck, with a real4×4 recovery-deck opening.
 b.floor('approach-front',-8,8,6,8);b.floor('approach-west',-8,-7,8,14);
 b.floor('approach-east',-3,8,8,14);b.floor('approach-rear',-7,-3,12,14);
 for(const [id,a,c]of [['west',-8,-7],['middle',-3,1],['east',5,8]] as const)b.floor('shaft-sidewalk-'+id,a,c,-4,6);
 b.floor('shaft-north-walk',-8,8,-5,-4);
 // No walking drop directly from the observation deck onto receiving floors.
 // Lead-approved bounded C17 candidate after actual intermediate-profile bypass.
 // Native profile/barrier checks must accept this before registration; C16 stays unchanged.
 const eastGlazingTop=distanceVariant?7:3.2;
 b.box('approach-east-glazing',[8.1,eastGlazingTop/2,.5],[.16,eastGlazingTop,11.4],'glass');
 b.box('approach-north-glazing',[0,1.6,-5.1],[16.4,3.2,.16],'glass');
 for(const [id,x,y]of [['shallow',-5,-3],['deep',3,-18]] as const){
  b.floor(id+'-bottom',x-2,x+2,-4,6,y);
  b.panel(id+'-floor',id+'-bottom',[x,y+.025,1],[0,1,0],4,10,true);
  for(const side of [-1,1])b.box(id+'-shaft-side-'+side,[x+side*2.1,y/2,1],[.2,-y,10],'glass');
  b.box(id+'-shaft-south',[x,y/2,6.1],[4.4,-y,.2]);
  // A real3m-high opening at each bottom lets a missed aperture reach the basin.
  if(y< -3)b.box(id+'-shaft-north-glazing',[x,(y+3)/2,-4.1],[4.4,-y-3,.16],'glass');
  w.marks.push({text:id.toUpperCase(),position:[x,-.15,6.225],normal:[0,0,1],width:1.6,height:.27});
 }
 // Exact3.1m-high band fixes the vertical launch anchor at9m. Its lower edge
 // cannot be reached by the ordinary1.125m jump from the observation deck.
 b.panel('launch-white','west-launch-wall',[-7.985,9,distanceVariant?0:-6],[1,0,0],distanceVariant?22:4,3.1);
 const landings=distanceVariant?
  [{id:'near',x1:8,x2:maxX,z1:-9,z2:-3,y:-4,front:8},{id:'far',x1:24,x2:maxX,z1:1,z2:11,y:-4,front:24}]:
  [{id:'lower',x1:6,x2:maxX,z1:-10,z2:-2,y:-8,front:6},{id:'higher',x1:15,x2:maxX,z1:-10,z2:-2,y:5,front:15}];
 if(distanceVariant)b.box('receiving-lane-divider',[(8+maxX)/2,(ceiling-4)/2,-1],[maxX-8,ceiling+4,.3],'glass');
 for(const l of landings){
  const z=(l.z1+l.z2)/2;
  b.floor(l.id+'-gallery',l.x1,l.x2,l.z1,l.z2,l.y);
  // Source/raster arrival rails are deliberately absent from the measured landing edge.
  b.box(l.id+'-vestibule-floor',[maxX+2,l.y-.3,z],[4.4,.6,2.8],'floor');
  b.box(l.id+'-vestibule-ceiling',[maxX+2,l.y+3.2,z],[4.8,.4,3.6]);
  for(const side of [-1,1])b.box(l.id+'-vestibule-side-'+side,[maxX+2,l.y+1.5,z+side*1.6],[4.8,3,.4]);
  b.box(l.id+'-vestibule-end',[maxX+4.2,l.y+1.5,z],[.4,3,3.6]);
  b.exitCorridor(l.id+'-exit',l.id+'-vestibule-floor');
  w.marks.push({text:l.id.toUpperCase(),position:[maxX,l.y+3.25,z],normal:[-1,0,0],width:1.8,height:.27});
 }
 // East closure is explicitly tessellated around the two real vestibule openings.
 const openings=landings.map(l=>({z:(l.z1+l.z2)/2,y:l.y}));
 const zCuts=Array.from(new Set([-12,14,...openings.flatMap(o=>[o.z-1.4,o.z+1.4])])).sort((a,c)=>a-c);
 for(let i=0;i<zCuts.length-1;i++){
  const z1=zCuts[i],z2=zCuts[i+1],same= openings.filter(o=>(z1+z2)/2>o.z-1.4&&(z1+z2)/2<o.z+1.4);
  const yCuts=Array.from(new Set([basin,ceiling,...same.flatMap(o=>[o.y,o.y+3])])).sort((a,c)=>a-c);
  for(let j=0;j<yCuts.length-1;j++){
   const y1=yCuts[j],y2=yCuts[j+1];if(same.some(o=>(y1+y2)/2>o.y&&(y1+y2)/2<o.y+3))continue;
   b.box('east-boundary-'+i+'-'+j,[maxX+.2,(y1+y2)/2,(z1+z2)/2],[.4,y2-y1,z2-z1]);
  }
 }
 // Familiar empty recovery elevator returns ONLY to the observation deck.
 b.device({id:'recovery-lift',kind:'lift',label:'RETURN',speed:4,position:[-5,basin-.2,10],size:[4,.4,4],target:[-5,-.2,10],stops:[{label:'BASIN',position:[-5,basin-.2,10]},{label:'APPROACH',position:[-5,-.2,10]}],controlOffset:[1.3,.9,1.3],controlFacing:[0,0,1]});
 b.box('recovery-call-post',[-2.4,basin+.6,12.95],[.22,1.2,.24]);
 b.device({id:'basin-call',kind:'switch',label:'CALL RETURN',position:[-2.4,basin+1.2,12.8],size:[.4,.7,.3],controlOffset:[.25,0,0],controlFacing:[1,0,0],calls:{device:'recovery-lift',stop:0}});
 w.routePoints={spawn:[-1,.87,11],'shallow-lip':[-5,.87,6.45],'deep-lip':[3,.87,6.45],'shallow-portal':[-5,-2.975,3.1],'deep-portal':[3,-17.975,-1.1],'launch-portal':[-7.985,9,distanceVariant?6:-6],'recovery-control':[-3.7,basin+.7,11.3],'basin-call-wait':[-1.2,basin+.865,12.8],'basin-call-control':[-2.15,basin+1.2,12.8]};
 for(const l of landings)w.routePoints[l.id+'-exit']=[maxX+3,l.y+.865,(l.z1+l.z2)/2];
 w.notes.push('DRAFT16/17: parent twin-shaft-target-v2.png plus README/inspection/prompts independently inspected before authoring. Raster rails, perspective and metric geometry are not authoritative. Existing original split-coil projector remains unchanged.','Two actual shaft floors are at−3 and−18, approached from the same0m deck. Native−16 gravity,32 terminal speed,6 jump and8 air acceleration remain untouched. Wall-band3.1m height fixes launch anchor9; offset and jump/air-control abuse require measured native proof.','Floor/source aperture selection and ordinary WASD supply all motion. Both landings and exits always exist. No minimum speed, usedDeep/launch/ride flag or event count gates completion. A clever physically equivalent route remains valid.','Missed apertures/landings reach a real basin at−22, leaving3.4m clear under the deepest floor slab. The recovery elevator and authored3m bottom openings provide a non-reset return; every approach and return must pass native capsule/E checks. Upper boarding opens onto the observation deck, never a destination gallery.','Native input-only route measurements, worst valid aperture offsets, jump/air-control counterexamples and normal-input sightline/landing/recovery review are pending. Do not register from source inspection.');
 return b.finish();
}

/** Real doorway carpentry; no opening or exit is generated from the instruction. */
function sideDoor(b:ChamberBuilder,id:string,x:number,z:number,y:number,top:number,zMin:number,zMax:number,circuit:Circuit,bottom=0){
 const inward=x>0?-1:1;
 b.box(id+'-north-jamb',[x,(top+bottom)/2,(zMin+z-1.4)/2],[.4,top-bottom,z-1.4-zMin]);
 b.box(id+'-south-jamb',[x,(top+bottom)/2,(z+1.4+zMax)/2],[.4,top-bottom,zMax-z-1.4]);
 b.box(id+'-header',[x,(y+3+top)/2,z],[.4,top-y-3,2.8]);
 if(y>bottom)b.box(id+'-sill',[x,(y+bottom)/2,z],[.4,y-bottom,2.8]);
 b.device({id,kind:'shutter',label:id==='upper-door'?'UPPER':id==='lower-door'?'LOWER':'EXIT',position:[x+inward*.08,y+1.5,z],size:[.3,3,2.8],target:[x+inward*.08,y+5,z],direction:[inward,0,0],circuit});
 const outward=-inward,near=x-outward*.4,end=x+outward*4,mid=x+outward*1.8;
 b.floor(id+'-vestibule',Math.min(near,end),Math.max(near,end),z-1.4,z+1.4,y);
 b.box(id+'-vestibule-roof',[mid,y+3.2,z],[4.8,.4,3.6]);
 for(const side of [-1,1])b.box(id+'-vestibule-side-'+side,[mid,y+1.5,z+side*1.6],[4.8,3,.4]);
 b.box(id+'-vestibule-end',[end+outward*.2,y+1.5,z],[.4,3,3.6]);
 const floor=b.world.solids.find(s=>s.id===id+'-vestibule')!;
 b.exitCorridor(id.replace('-door','-exit'),id+'-vestibule',{minX:outward>0?x+.4:floor.min.x+.02,maxX:outward>0?floor.max.x-.02:x-.4,minZ:z-1.38,maxZ:z+1.38});
 b.world.marks.push({text:id==='upper-door'?'UPPER':id==='lower-door'?'LOWER':'EXIT',position:[x+inward*.26,y+3.35,z],normal:[inward,0,0],width:1.5,height:.25});
}
function northExit(b:ChamberBuilder,id:string,x:number,z:number,y:number,top:number,left:number,right:number,circuit:Circuit,bottom=0){
 b.box(id+'-west-jamb',[(left+x-1.4)/2,(top+bottom)/2,z],[x-1.4-left,top-bottom,.4]);
 b.box(id+'-east-jamb',[(x+1.4+right)/2,(top+bottom)/2,z],[right-x-1.4,top-bottom,.4]);
 b.box(id+'-header',[x,(y+3+top)/2,z],[2.8,top-y-3,.4]);
 if(y>bottom)b.box(id+'-sill',[x,(y+bottom)/2,z],[2.8,y-bottom,.4]);
 b.device({id:id+'-door',kind:'shutter',label:id.toUpperCase(),position:[x,y+1.5,z+.08],size:[2.8,3,.3],target:[x,y+5,z+.08],direction:[0,0,1],circuit});
 b.floor(id+'-vestibule',x-1.4,x+1.4,z-4,z+.4,y);
 b.box(id+'-roof',[x,y+3.2,z-1.8],[3.6,.4,4.8]);
 for(const side of [-1,1])b.box(id+'-side-'+side,[x+side*1.6,y+1.5,z-1.8],[.4,3,4.8]);
 b.box(id+'-end',[x,y+1.5,z-4.2],[3.6,3,.4]);
 b.exitCorridor(id+'-exit',id+'-vestibule',{minX:x-1.38,maxX:x+1.38,minZ:z-3.98,maxZ:z-.4});
 b.world.marks.push({text:id.toUpperCase(),position:[x,y+3.35,z+.26],normal:[0,0,1],width:2,height:.25});
}

/** Equal native path length and unequal actual cycle travel time. */
function twoTravelSpeeds(){
 const b=new ChamberBuilder(),w=b.world;w.family='bridge-rotunda';w.spawn=[0,.87,15];
 const bottom=-5.4,top=9;
 b.floor('carrier-catch',-15,15,-20,18,bottom);
 // Cut an actual stair well; an intact0m slab must not cover the rising return.
 b.floor('near-bank-main',-11.5,15,4,18);b.floor('near-bank-west-edge',-15,-14.5,4,18);
 b.floor('return-top-landing',-14.5,-11.5,14.2,18);
 for(let i=0;i<27;i++){const y=bottom+(i+1)*.2;b.box('return-step-'+i,[-13,y-.15,-2+(i+.5)*.6],[2.5,.3,.6],'floor');}
 b.box('carrier-ceiling',[0,top+.2,-1],[30.8,.4,38.8]);
 for(const x of [-15.2,15.2])b.box('carrier-side-'+x,[x,(top+bottom)/2,-1],[.4,top-bottom,38.8]);
 b.box('carrier-south-wall',[0,(top+bottom)/2,18.2],[30.8,top-bottom,.4]);
 // Sealed far destinations; no jump can exchange lanes around the back wall.
 b.box('far-lane-divider',[0,(top+bottom)/2,-16],[.4,top-bottom,8.4]);
 b.box('far-west-closure',[-12.6,(top+bottom)/2,-20.2],[5.2,top-bottom,.4]);
 b.box('far-east-closure',[12.6,(top+bottom)/2,-20.2],[5.2,top-bottom,.4]);
 for(const [id,x,period]of [['inspection',-6,6],['service',6,12]]as const){
  b.floor(id+'-bank',x-4,x+4,-20,-12);
  b.device({id:id+'-carrier',kind:'moving-platform',automatic:true,label:id==='inspection'?'2 m/s':'1 m/s',position:[x,-.2,2],size:[4,.4,4],target:[x,-.2,-10],targetLabel:'FAR',period,dwell:8,stops:[{label:'NEAR',position:[x,-.2,2]},{label:'FAR',position:[x,-.2,-10]}]});
  northExit(b,id,x,-20.2,0,top,x-4,x+4,{all:['at:'+id+'-carrier:FAR']},bottom);
  // Rails remain2.1m below bank height; even a missed carrier has a bounded catch.
  for(const side of [-1,1])b.box(id+'-guide-'+side,[x+side*1.5,-2.25,-4],[.18,.3,12]);
  w.marks.push({text:id==='inspection'?'12 m · 6 s':'12 m · 12 s',position:[x,2.2,4.35],normal:[0,0,1],width:2,height:.25});
 }
 // Full north closure between the separately constructed destination sections.
 b.box('far-north-middle',[0,(top+bottom)/2,-20.2],[4,top-bottom,.4]);
 // Familiar observation booth introduces actual portal navigation before boarding.
 for(const x of [-3.2,3.2])b.box('carrier-booth-side-'+x,[x,top/2,13],[.4,top,10.4]);
 b.box('carrier-booth-glass',[0,top/2,7.95],[6.4,top,.16],'glass');
 b.box('carrier-waiting-host',[0,1.75,5.5],[3.8,3.5,.3]);
 b.panel('carrier-source','carrier-south-wall',[0,1.75,17.985],[0,0,-1],5,3.5);
 b.panel('carrier-waiting','carrier-waiting-host',[0,1.75,5.665],[0,0,1],3.5,3.5);
 w.routePoints={'source-portal':[0,1.55,17.985],'waiting-portal':[.55,1.55,5.665],'inspection-board':[-6,.865,3.5],'service-board':[6,.865,3.5],'inspection-exit':[-6,.865,-23],'service-exit':[6,.865,-23],'catch-approach':[-13,bottom+.865,-2.6],'return-landing':[-13,.865,15.4]};
 w.notes.push('DRAFT18. Selected chamber-18-target.png independently displayed/read before geometry. Dry enclosed basin, equal lanes and original compact decks accepted; illustrated walkable guideways rejected.','Both actual carrier paths measure12m. Moving-platform cycle travel6/12s yields2/1m/s, with8s safe dwell at each end. Lane centres±6 provide8m clear separation between deck edges. No speed/history flag or countdown awards progress.','Only near-bank booth/waiting hosts are eligible. Portal through the booth, observe actual motion, board the requested real lane and cross its far bank. The far dock shutter uses actual stopped physical at:carrier:FAR contact, not a selected destination or remembered ride.','A real central far-bay wall prevents an arrival-lane exchange. Guide rails top−2.1 cannot jump back up to bank0; missed carriers reach catch−5.4.27 actual .6m-deep/.2m-rise treads return only to the near bank through its cut stair well.','Native docking/corner-jump/recovery, both actual speeds/routes and ordinary-input visible control/boarding acceptance remain pending.');
 return b.finish();
}

/** Two native12kg cargo bodies differ only in collider dimensions, never weight. */
function sizeSorter(){
 const b=new ChamberBuilder(),w=b.world;w.family='dual-vault';w.spawn=[0,.87,11];
 b.floor('sorter-floor',-10,10,-14,14);b.box('sorter-ceiling',[0,8.2,0],[20.8,.4,28.8]);
 for(const x of [-10.2,10.2])b.box('sorter-side-'+x,[x,4,0],[.4,8,28.8]);
 b.box('sorter-south',[0,4,14.2],[20.8,8,.4]);
 // A1.2m-thick wall has three genuine openings, not transparent painted sockets.
 const ports=[{x:-4,width:1.04,height:1.04,id:'narrow'},{x:0,width:2.8,height:3,id:'service'},{x:4,width:1.4,height:1.4,id:'wide'}];
 let left=-10;
 for(const p of ports){const edge=p.x-p.width/2;b.box(p.id+'-west-pier',[(left+edge)/2,4,0],[edge-left,8,1.2]);b.box(p.id+'-lintel',[p.x,(p.height+8)/2,0],[p.width,8-p.height,1.2]);left=p.x+p.width/2;}
 b.box('sorter-east-pier',[(left+10)/2,4,0],[10-left,8,1.2]);
 b.device({id:'service-door',kind:'shutter',label:'SERVICE',position:[0,1.5,0],size:[2.8,3,.3],target:[0,5,0],direction:[0,0,1],circuit:{any:['narrow-receiver','wide-receiver']}});
 // Flush .07m plates leave useful clearance inside the1.04m cargo opening.
 b.button('narrow-receiver',[-4,.07,-1.4]);b.button('wide-receiver',[4,.07,-1.4]);
 b.cube('small-cube',[-4,.42,7],'small','SMALL');b.cube('large-cube',[4,.55,7],'large','LARGE');
 northExit(b,'sorter',0,-14.2,0,8,-10,10,{all:['narrow-receiver','wide-receiver']});
 // Neither side has a white bypass behind the slot/pressure tradeoff.
 for(const [text,x,y]of [['NARROW',-4,1.5],['SERVICE',0,3.35],['WIDE',4,1.85]]as const)w.marks.push({text,position:[x,y,.625],normal:[0,0,1],width:1.3,height:.23});
 w.routePoints={'small-cube':[-4,.42,7],'large-cube':[4,.55,7],'narrow-approach':[-4,.865,.95],'wide-approach':[4,.865,.95],'narrow-receiver':[-4,.07,-1.4],'wide-receiver':[4,.07,-1.4],'service-approach':[0,.865,2],'service-far':[0,.865,-3],'sorter-exit':[0,.865,-17]};
 w.notes.push('DRAFT19. Selected chamber-19-target.png independently inspected first. Original diamond small/large modules, thick wall and separate SERVICE path accepted; invented conveyor, loft and identity sockets rejected.','Native cargo masses are both12kg; this room compares dimensions only: .84m versus1.10m. Clear narrow slot1.04×1.04 excludes every orientation of the larger cube. Wide cargo port1.4×1.4 accepts upright large; a rotated object may instead use the real full-size2.8×3 SERVICE route.','Either real .07m pressure plate opens SERVICE. Both actual pressures open the remote exit AND. No cargo identity, weight category, delivery history or slot-use flag exists. Both assignments are valid; a physically equivalent full-size delivery is accepted.','Base: aim/hold the small cube low through the narrow slot, release it stably on the near edge of its far plate. Then deliver large through WIDE or use now-open SERVICE. Contrast: small first to WIDE opens SERVICE; carry large through that full-size route to the other plate. No plate requires a particular cube id.','A wrong large-slot push must remain accessible on the near floor. Current actual orientation/position and ordinary E determine pickup/recovery. Both pressures are over12m from the exit, so transient held/player pressure cannot replace independent cargo support at completion. Native ordinary slot delivery, all-orientation rejection, both assignments and recovery remain pending.');
 return b.finish();
}

/** Two observable receiver elevations select different real optical circuits. */
function receiverComparison(){
 const b=new ChamberBuilder(),w=b.world;w.family='relay-garden';w.spawn=[0,.87,12];
 b.floor('receiver-floor',-11,11,-14,14);b.box('receiver-ceiling',[0,10.2,0],[22.8,.4,28.8]);
 b.box('receiver-north-wall',[0,5,-14.2],[22.8,10,.4]);b.box('receiver-south-wall',[0,5,14.2],[22.8,10,.4]);
 sideDoor(b,'lower-door',-11.2,-10,0,10,-14,14,{all:['lower-light']});
 sideDoor(b,'upper-door',11.2,-10,3.4,10,-14,14,{all:['upper-light']});
 b.box('receiver-upper-gallery',[6,1.7,-10],[10,3.4,8],'floor');
 b.panel('beam-source','upper-door-south-jamb',[10.985,1.75,8],[-1,0,0],5,3.5);
 b.panel('lower-return','receiver-north-wall',[-5,1.75,-13.985],[0,0,1],5,3.5);
 b.panel('upper-return','receiver-north-wall',[5,5.15,-13.985],[0,0,1],5,3.5);
 b.button('emitter-power',[-4,.14,8]);b.cube('power-cube',[-6,.55,10]);
 b.box('comparison-emitter-housing',[6.65,.8,8],[.5,1.6,.7]);
 for(const [id,x,y]of [['lower',-5,0],['upper',5,3.4]]as const){
  b.box(id+'-receiver-pillar',[x,y+.85,-7.1],[.9,1.7,.5]);
  b.box(id+'-receiver-body',[x,y+.9,-7.22],[.7,.7,.4]);
  w.marks.push({text:id.toUpperCase()+' RECEIVER',position:[x,y+2,-7.42],normal:[0,0,-1],width:2,height:.23});
 }
 w.routePoints={'power-button':[-4,.14,8],'source-portal':[10.985,1.55,8],'lower-portal':[-5,1.55,-13.985],'upper-portal':[5,4.95,-13.985],'source-approach':[9.5,.865,8],'upper-clear-beam':[7.5,4.265,-12],'lower-clear-beam':[-7.5,.865,-12],'upper-exit':[14,4.265,-10],'lower-exit':[-14,.865,-10]};
 w.notes.push('DRAFT20. Selected chamber-20-target.png independently inspected first: deliberately unpowered construction reference only. Earlier active-ray image rejected. Exact native lens poses/normals and authored eligible bands govern optics; original runtime prop retained.','Real emitter pressure enables the source. East source anchorY1.55 preserves beam offset−.65; lower/upper north return anchors1.55/4.95 emit atY.9/4.3 into actual receiver lenses. Upper floor occupiesX[1,11],Z[−14,−6],top3.4 beneath its walking return; both rays hit their lenses before opaque housings.','Higher receiver powers the actual upper shutter, lower receiver powers the actual lower shutter. Both devices, routes and circuits remain fixed under the changed comparative/defining clause. No last-word direction or remembered connection flag awards progress.','Leave the cube on POWER, configure source plus requested return, walk through the pair and step aside from its beam. A player temporarily occludes the real optical path; moving clear restores power. Upper walking anchor is exactly gallery floor+1.55, with a real floor beneath it.','Both optical poses, lens-before-housing occlusion, current pressure power, full upright transport, gallery lip aiming, transient player blockage and actual opposite door closure need native/ordinary-input verification. No whole passive/relative/comparison chapter or language-mastery claim.');
 return b.finish();
}

export const draftComparisonLevels:CoreLevel[]=[
 {number:16,...comparisonsEnglish[16],architecture:{height:13,halfWidth:30,style:'graphite'},recoveryY:-25,expectedExit:'higher-exit',blueprint:()=>twinShafts(false),wrongExitFeedback:'This is the lower gallery. Return to the observation deck; a deeper fall provides more launch momentum for the higher landing.',contrast:{...comparisonsEnglish[16].contrast!,expectedExit:'lower-exit',wrongExitFeedback:'This is the higher gallery. The requested lower landing is a different real floor beneath it.'}},
 {number:17,...comparisonsEnglish[17],architecture:{height:11.5,halfWidth:40,style:'graphite'},recoveryY:-25,expectedExit:'far-exit',blueprint:()=>twinShafts(true),wrongExitFeedback:'This is the nearer, narrower gallery. The wider gallery starts farther from the launch wall.',contrast:{...comparisonsEnglish[17].contrast!,expectedExit:'near-exit',wrongExitFeedback:'This is the farther, wider gallery. Reach the nearer, narrower landing instead.'}},
 {number:18,...comparisonsEnglish[18],architecture:{height:9,halfWidth:15,style:'graphite'},recoveryY:-8,expectedExit:'inspection-exit',blueprint:twoTravelSpeeds,wrongExitFeedback:'This is the slower carrier’s service bay. Return on that carrier, compare equal-length travel and board the faster lane.',contrast:{...comparisonsEnglish[18].contrast!,expectedExit:'service-exit',wrongExitFeedback:'This is the faster carrier’s inspection bay. The changed instruction asks for the slower carrier.'}},
 {number:19,...comparisonsEnglish[19],architecture:{height:8,halfWidth:10,style:'ceramic'},expectedExit:'sorter-exit',blueprint:sizeSorter,contrast:{...comparisonsEnglish[19].contrast!,expectedExit:'sorter-exit'}},
 {number:20,...comparisonsEnglish[20],architecture:{height:10,halfWidth:11,style:'ceramic'},expectedExit:'upper-exit',blueprint:receiverComparison,optics:{emitters:[{id:'comparison-emitter',position:[7,.9,8],direction:[1,0,0],range:90,circuit:{all:['emitter-power']}}],receivers:[{id:'lower-light',position:[-5,.9,-7.5],normal:[0,0,-1],radius:.34},{id:'upper-light',position:[5,4.3,-7.5],normal:[0,0,-1],radius:.34}]},wrongExitFeedback:'This door is powered by the lower receiver. Aim the return at the higher receiver to power the requested door.',contrast:{...comparisonsEnglish[20].contrast!,expectedExit:'lower-exit',wrongExitFeedback:'This door is powered by the higher receiver. The changed instruction identifies the lower receiver.'}},
];
