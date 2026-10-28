/** Unregistered capstone46 source proposal. Native/public routes remain pending. */
import type {CoreLevel} from '../level';
import {ChamberBuilder} from '../level-kit';
import {reported4648English} from './reported-46-48-english';
import type {Circuit} from '../../systems';

/**
 * One explicit twin-depth fling fixture, retaining the measured C16 envelope.
 * A low observation-booth pair must be repurposed for the measured fling.
 * Neither the source nor the requested destination constructs physical geometry.
 */
function reportedLaunch(){
 const b=new ChamberBuilder(),w=b.world;w.family='launch-spire';w.spawn=[-1,.87,12.3];
 const basin=-22,ceiling=13,maxX=30,midX=11,width=38;
 b.floor('recovery-basin',-8,30,-12,14,basin);
 b.box('west-launch-wall',[-8.2,(ceiling+basin)/2,1],[.4,ceiling-basin,26.8]);
 b.box('north-enclosure',[midX,(ceiling+basin)/2,-12.2],[width+.8,ceiling-basin,.4]);
 b.box('south-enclosure',[midX,(ceiling+basin)/2,14.2],[width+.8,ceiling-basin,.4]);
 b.box('twin-shaft-ceiling',[midX,ceiling+.2,1],[width+.8,.4,26.8]);
 b.floor('approach-front',-8,8,6,8);b.floor('approach-west',-8,-7,8,14);
 b.floor('approach-east',-3,8,8,14);b.floor('approach-rear',-7,-3,12,14);
 for(const[id,a,c]of[['west',-8,-7],['middle',-3,1],['east',5,8]]as const)b.floor('shaft-sidewalk-'+id,a,c,-4,6);
 b.floor('shaft-north-walk',-8,8,-5,-4);
 // Root-reviewed low entry/observation partition. All new white ends below3.5m;
 // neither side of this walking pair can substitute for the9m launch face.
 for(const x of[-3.2,1.2])b.box('launch-observation-side-'+x,[x,6.5,11.7],[.4,13,5]);
 b.box('launch-observation-glass',[-1,6.5,9.4],[4,13,.16],'glass');
 b.box('launch-observation-return-host',[-1,1.75,8],[3.8,3.5,.3]);
 b.panel('observation-source','south-enclosure',[-1,1.55,13.985],[0,0,-1],3.5,3.1);
 b.panel('observation-return','launch-observation-return-host',[-1,1.75,8.165],[0,0,1],3.5,3.5);
 b.box('approach-east-glazing',[8.1,1.6,.5],[.16,3.2,11.4],'glass');
 b.box('approach-north-glazing',[0,1.6,-5.1],[16.4,3.2,.16],'glass');
 for(const[id,x,y,station]of[['shallow',-5,-3,'LOW'],['deep',3,-18,'HIGH']]as const){
  b.floor(id+'-bottom',x-2,x+2,-4,6,y);
  b.panel(id+'-floor',id+'-bottom',[x,y+.025,1],[0,1,0],4,10,true);
  for(const side of[-1,1])b.box(id+'-shaft-side-'+side,[x+side*2.1,y/2,1],[.2,-y,10],'glass');
  b.box(id+'-shaft-south',[x,y/2,6.1],[4.4,-y,.2]);
  if(y< -3)b.box(id+'-shaft-north-glazing',[x,(y+3)/2,-4.1],[4.4,-y-3,.16],'glass');
  w.marks.push({text:station+' · '+id.toUpperCase(),position:[x,.004,6.7],normal:[0,1,0],width:2.5,height:.27});
  // Existing opaque south enclosure is the real backing for these procedure
  // plaques. They are authored source text, not fabricated event-history rows.
  w.marks.push(
   {text:station+' · SOURCE TO OPERATOR',position:[x,2.65,13.94],normal:[0,0,-1],width:3.7,height:.25},
   {text:id==='deep'?'Use my deeper shaft.':'Use my shallower shaft.',position:[x,2.15,13.94],normal:[0,0,-1],width:3.7,height:.25},
   {text:id==='deep'?'Land on my upper platform.':'Land on my lower platform.',position:[x,1.7,13.94],normal:[0,0,-1],width:3.7,height:.25},
  );
 }
 // The3.1m face fixes the ordinary centre at9m; it is not a preset shot.
 b.panel('launch-white','west-launch-wall',[-7.985,9,-6],[1,0,0],4,3.1);
 const landings=[
  {id:'lower',station:'LOW',x1:6,x2:30,z1:-10,z2:-2,y:-8},
  {id:'higher',station:'HIGH',x1:15,x2:30,z1:-10,z2:-2,y:5},
 ]as const;
 for(const l of landings){
  const z=(l.z1+l.z2)/2;
  b.floor(l.id+'-gallery',l.x1,l.x2,l.z1,l.z2,l.y);
  b.box(l.id+'-vestibule-floor',[maxX+2,l.y-.3,z],[4.4,.6,2.8],'floor');
  b.box(l.id+'-vestibule-ceiling',[maxX+2,l.y+3.2,z],[4.8,.4,3.6]);
  for(const side of[-1,1])b.box(l.id+'-vestibule-side-'+side,[maxX+2,l.y+1.5,z+side*1.6],[4.8,3,.4]);
  b.box(l.id+'-vestibule-end',[maxX+4.2,l.y+1.5,z],[.4,3,3.6]);
  b.exitCorridor(l.id+'-exit',l.id+'-vestibule-floor');
  w.marks.push({text:l.station+' · '+(l.id==='higher'?'UPPER':'LOWER'),position:[maxX-.06,l.y+3.25,z],normal:[-1,0,0],width:2.4,height:.27});
 }
 // The two actual exit openings are tessellated into the same enclosure.
 const openings=landings.map(l=>({z:(l.z1+l.z2)/2,y:l.y}));
 const zCuts=Array.from(new Set([-12,14,...openings.flatMap(o=>[o.z-1.4,o.z+1.4])])).sort((a,c)=>a-c);
 for(let i=0;i<zCuts.length-1;i++){
  const z1=zCuts[i],z2=zCuts[i+1],same=openings.filter(o=>(z1+z2)/2>o.z-1.4&&(z1+z2)/2<o.z+1.4);
  const yCuts=Array.from(new Set([basin,ceiling,...same.flatMap(o=>[o.y,o.y+3])])).sort((a,c)=>a-c);
  for(let j=0;j<yCuts.length-1;j++){
   const y1=yCuts[j],y2=yCuts[j+1];if(same.some(o=>(y1+y2)/2>o.y&&(y1+y2)/2<o.y+3))continue;
   b.box('east-boundary-'+i+'-'+j,[maxX+.2,(y1+y2)/2,(z1+z2)/2],[.4,y2-y1,z2-z1]);
  }
 }
 // This device returns to the approach only; it cannot reach either landing.
 b.device({id:'recovery-lift',kind:'lift',label:'RETURN',speed:4,position:[-5,basin-.2,10],size:[4,.4,4],target:[-5,-.2,10],stops:[{label:'BASIN',position:[-5,basin-.2,10]},{label:'APPROACH',position:[-5,-.2,10]}],controlOffset:[1.3,.9,1.3],controlFacing:[0,0,1]});
 b.box('recovery-call-post',[-2.4,basin+.6,12.95],[.22,1.2,.24]);
 b.device({id:'basin-call',kind:'switch',label:'CALL RETURN',position:[-2.4,basin+1.2,12.8],size:[.4,.7,.3],controlOffset:[.25,0,0],controlFacing:[1,0,0],calls:{device:'recovery-lift',stop:0}});
 w.routePoints={spawn:[-1,.87,12.3],'observation-source':[-1,1.55,13.985],'observation-return':[-.45,1.55,8.165],'observation-escape':[2,.865,8.65],'shallow-lip':[-5,.87,6.45],'deep-lip':[3,.87,6.45],'shallow-portal':[-5,-2.975,3.1],'deep-portal':[3,-17.975,-1.1],'launch-portal':[-7.985,9,-6],'recovery-control':[-3.7,basin+.7,11.3],'recovery-clear-lane':[-5,.865,7.3],'basin-call-wait':[-1.2,basin+.865,12.8],'basin-call-control':[-2.15,basin+1.2,12.8],'lower-exit':[33,-7.135,-6],'higher-exit':[33,5.865,-6]};
 w.notes.push('SOURCE PROPOSAL46: reread full G9 reported-speech cache and redisplayed chamber-02-target.png plus retained twin-shaft-target-v2.png before writing. Family reuse approved; no new paid generation. Raster rails/perspective are not physical measurements.',
  'Explicit single fixture retains the current measured C16 flight envelope exactly: approach0, shaft floors−3/−18, wall centre9 and3.1m band, lower−8/front6, upper5/front15, basin−22 and return-only elevator. Added full-height4m-wide observation booth changes actual access and requires useful low walking-pair→floor/high-wall reconfiguration. Root approved B backingZ8/front8.15/white8.165 and escape[2,8.65] to clear the side-wall north edge9.2. No new controller, force, speed boost, launch adapter or rescaled trajectory is introduced. Reuse is not new46 route proof.',
  'HIGH/LOW headings bind my in each direct procedure to its in the operator report. Source plaques have existing south-wall backing; shaft lips and receiving vestibules carry the same station names. Both sources and both physical alternatives always exist. Messages are authored procedures, not earlier real-machine or character-event claims.',
  'A real floor-to-wall momentum crossing is needed for either supported receiving gallery. No usedDeep/launch/speed/read/order/history flag is evaluated. A physically sufficient expert alternative reaching the requested gallery is accepted. The return lift only reaches the observation/approach deck; leave its top northward via[-5,7.3] around the new booth rather than walking through its side. Wrong landing, missed aperture and whole-fit rejection must retain ordinary non-reset basin recovery.',
  'Unregistered. Root fixture review, strict source check, authored-spawn base/contrast/wrong/catch/equivalent native routes, and public normal-input source-plaque/flight/control/audio/save proof are all pending. Do not infer universal shallow-air exclusion or fifty-level completion from retained C16 measurements.');
 return b.finish();
}

/** Real side corridor, independently wired to current physical supplies. */
function receivingVestibule(b:ChamberBuilder,id:string,side:-1|1,y:number,circuit:Circuit){
 const x=side*12.2,z=-7,top=10;
 for(const[a,c,part]of[[-10,-8.6,'north'],[-5.4,14,'south']]as const)b.box(id+'-'+part+'-wall',[x,5,(a+c)/2],[.4,10,c-a]);
 b.box(id+'-header',[x,(y+3+top)/2,z],[.4,top-y-3,3.2]);
 if(y>0)b.box(id+'-sill',[x,y/2,z],[.4,y,3.2]);
 b.device({id:id+'-door',kind:'shutter',label:id==='entry'?'ENTRY':'FREIGHT',position:[x-side*.08,y+1.5,z],size:[.3,3,3.2],target:[x-side*.08,y+5,z],direction:[-side,0,0],circuit});
 const near=x-side*.4,end=x+side*4.2,mid=(near+end)/2;
 b.floor(id+'-vestibule',Math.min(near,end),Math.max(near,end),-8.6,-5.4,y);
 b.box(id+'-vestibule-roof',[mid,10.2,z],[5,.4,4]);
 for(const zz of[-8.8,-5.2])b.box(id+'-vestibule-side-'+zz,[mid,5,zz],[5,10,.4]);
 b.box(id+'-vestibule-end',[x+side*4.4,5,z],[.4,10,4]);
 const floor=b.world.solids.find(s=>s.id===id+'-vestibule')!;
 b.exitCorridor(id+'-exit',id+'-vestibule',{minX:side>0?x+.4:floor.min.x+.02,maxX:side>0?floor.max.x-.02:x-.4,minZ:-8.58,maxZ:-5.42});
 b.world.marks.push({text:id.toUpperCase()+' EXIT',position:[x-side*.26,y+3.35,z],normal:[-side,0,0],width:2.4,height:.25});
}

/** A maintained walking hatch and a physically separate cargo-only window/stair. */
function listenersCargo(){
 const b=new ChamberBuilder(),w=b.world;w.family='dual-vault';w.spawn=[0,.87,12];
 b.floor('listener-floor',-12,12,-10,14);
 b.box('listener-south',[0,5,14.2],[24.8,10,.4]);b.box('listener-north',[0,5,-10.2],[24.8,10,.4]);
 b.box('listener-roof',[0,10.2,2],[24.8,.4,24.8]);
 receivingVestibule(b,'entry',-1,0,{all:['listener-access','listener-entry-receipt']});
 receivingVestibule(b,'freight',1,2.4,{all:['listener-freight-receipt']});
 // Main interior is X−12..12,Z−10..14;24×24 is not a square centred on0.
 // A complete glazed tools bay makes the low carried walking pair useful.
 b.box('listener-tools-glass',[0,5,8.4],[24,10,.16],'glass');
 b.cube('listener-cube-a',[-4,.55,11]);b.cube('listener-cube-b',[4,.55,11]);
 b.box('listener-return-host',[0,1.75,4.7],[3.8,3.5,.4]);
 b.panel('listener-source','listener-south',[0,1.75,13.985],[0,0,-1],5,3.5);
 b.panel('listener-return','listener-return-host',[0,1.75,4.915],[0,0,1],3.5,3.5);
 // Three actual cuts in the1.2m-thick row: body ENTRY, low cargo, upper stairs.
 for(const[a,c,id]of[[-12,-6.4,'west'],[-3.6,4.3,'middle'],[5.7,9.1,'east'],[11.9,12,'far-east']]as const)b.box('listener-row-'+id,[(a+c)/2,5,0],[c-a,10,1.2]);
 b.box('listener-entry-header',[-5,6.5,0],[2.8,7,1.2]);
 b.box('listener-cargo-header',[5,5.675,0],[1.4,8.65,1.2]);
 b.box('listener-stair-row-header',[10.5,7.7,0],[2.8,4.6,1.2]);
 b.box('listener-bay-divider',[0,5,-4.7],[.4,10,10.6]);
 b.button('listener-access',[-5,.14,6]);w.pads.at(-1)!.label='ACCESS';
 b.button('listener-entry-receipt',[-5,.14,-4]);w.pads.at(-1)!.label='ENTRY';
 b.button('listener-freight-receipt',[5,0,-1.4]);w.pads.at(-1)!.label='FREIGHT';
 b.device({id:'listener-entry-hatch',kind:'shutter',label:'ENTRY',position:[-5,1.5,.68],size:[2.8,3,.3],target:[-5,5,.68],direction:[0,0,1],circuit:{all:['listener-access']}});
 // Bounded receiving pocket keeps a missed cargo allocation in actual near-side
 // E reach. It is not a cargo-identity socket or a window-used goal sensor.
 for(const x of[4.1,5.9])b.box('listener-receiving-side-'+x,[x,.8,-1.4],[.18,1.6,2]);
 b.box('listener-receiving-stop',[5,.8,-2.35],[2,1.6,.3]);
 // The foot gate precedes the first tread by.05m; broad near approach is7.7.
 b.box('listener-stair-west',[9,5,-1.4],[.2,10,17.2]);
 b.box('listener-stair-foot-header',[10.5,6.5,7],[2.8,7,.4]);
 b.device({id:'listener-stair-gate',kind:'shutter',label:'FREIGHT STAIRS',position:[10.5,1.5,7],size:[2.8,3,.3],target:[10.5,5,7],direction:[0,0,1],circuit:{all:['listener-freight-receipt']}});
 for(let i=0;i<12;i++){
  const top=(i+1)*.2,z=6.8-(i+.5)*.6;
  b.box('listener-stair-'+i,[10.5,(top-.3)/2,z],[2.5,top+.3,.6],'floor');
 }
 b.floor('listener-upper-landing',9.1,12,-8,-.4,2.4);
 b.box('listener-upper-north-guard',[10.6,6.2,-8.1],[3.2,7.6,.16],'glass');
 w.marks.push(
  {text:'ENTRY · SOURCE TO OPERATOR',position:[-9,2.8,.66],normal:[0,0,1],width:4.6,height:.25},
  {text:'Keep my walking hatch open',position:[-9,2.3,.66],normal:[0,0,1],width:4.6,height:.25},
  {text:'while you bring a cube to my bay.',position:[-9,1.8,.66],normal:[0,0,1],width:4.6,height:.25},
  {text:'FREIGHT · SOURCE',position:[7.35,3.2,.66],normal:[0,0,1],width:3.1,height:.25},
  {text:'Send a cube to my low window.',position:[7.35,2.7,.66],normal:[0,0,1],width:3.1,height:.25},
  {text:'Then use my stairs.',position:[7.35,2.2,.66],normal:[0,0,1],width:3.1,height:.25},
  {text:'FREIGHT',position:[5,1.65,.66],normal:[0,0,1],width:1.4,height:.23},
  {text:'FREIGHT STAIRS',position:[10.5,3.35,7.26],normal:[0,0,1],width:2.5,height:.25},
 );
 w.routePoints={spawn:[0,.87,12],'source-portal':[0,1.55,13.985],'return-portal':[.55,1.55,4.915],'return-normal-clear':[.55,.865,5.7],'return-east-escape':[3.5,.865,5.7],'return-west-escape':[-3.5,.865,5.7],'tools-a':[-4,.55,11],'tools-b':[4,.55,11],'access-drop':[-6.8,.865,6],'entry-approach':[-5,.865,2],'entry-receipt-drop':[-6.8,.865,-4],'entry-exit':[-15,.865,-7],'cargo-window-approach':[5,.865,2],'cargo-window-near':[5,.865,.95],'freight-receipt':[5,0,-1.4],'stair-clear-aisle':[8.2,.865,7.7],'stair-approach':[10.5,.865,7.7],'stair-top':[10.5,3.265,-.7],'freight-exit':[15,3.265,-7]};
 w.notes.push('DRAFT47: independently redisplayed retained19 whole-cargo aperture target and08 freight-transfer target; reuse original glazed cargo/pressure/stair families, not08’s lift or raster scale. Root reviewed interior24x24 bounds X−12..12/Z−10..14 and all row/stair cuts. No paid generation, new physics or accepted-completion claim.',
  'Approved low return backing[0,1.75,4.7], front4.9, requested B[.55,1.55,4.915]; derive actual placed centre from World.place, which adds+.025 along+Z (approximately4.94), never hardcode the earlier wrong-sign4.89. First clear straight toZ5.7 then turn atX±3.5. Glass nearface8.32 leaves generous normal held-cube room. Mouse/cargo/roof/native fit and decorative sightlines remain pending.',
  'Real rowZ±.6 has ENTRY clear2.8x3, cargo1.4x1.35 and stair2.8m wide clear up to5.4. ENTRY ACCESS+receipt physically power its exit; cargo receipt powers stair entry/upper exit. Every current pad accepts either ordinary1.10m cube. No original identity, ownership, used-hatch/window, reported-answer, read/order/history or minimum-ride flag is introduced.',
  'Foot gateZ7, approach7.7;12 broad.6/.2 treads startZ6.8 and finish−.4 at2.4; upper landing−8..−.4 joins the actual east vestibule. Row header bottom5.4 leaves3m above top floor. West corridor wall and upper north glass guard prevent dropping into the inaccessible receiving pocket; stairs provide the ordinary safe return. Tools/near/far ground remains0.',
  'Receiving-cell side guides and back stop keep cargo in near-side regrasp range. Removing receipt really closes its gates; replacing either cube recovers. Base may use two independent supplies; contrast needs only its actual receipt and stair. All source-native routes, wrong allocation/recovery/equivalent pressure tests and normal-input save/audio/legibility proof are pending.');
 return b.finish();
}

function questionExit(b:ChamberBuilder,id:string,x:number,z:number,y:number,circuit:Circuit){
 const side=x>0?1:-1,bottom=-4.4,top=12;
 for(const[a,c,part]of[[-10,z-1.6,'north'],[z+1.6,14,'south']]as const)b.box(id+'-outer-'+part,[x,(top+bottom)/2,(a+c)/2],[.4,top-bottom,c-a]);
 b.box(id+'-outer-foundation',[x,(bottom+y)/2,z],[.4,y-bottom,3.2]);
 b.box(id+'-outer-header',[x,(y+3+top)/2,z],[.4,top-y-3,3.2]);
 b.device({id:id+'-exit-door',kind:'shutter',label:id.toUpperCase(),position:[x-side*.08,y+1.5,z],size:[.16,3,3.2],target:[x-side*.08,y+5,z],direction:[-side,0,0],circuit});
 const bankEdge=x-side*.2,end=x+side*4.2,mid=(bankEdge+end)/2;
 b.floor(id+'-vestibule',Math.min(bankEdge,end),Math.max(bankEdge,end),z-1.6,z+1.6,y);
 b.box(id+'-vestibule-roof',[mid,12.2,z],[4.8,.4,4]);
 for(const zz of[z-1.8,z+1.8])b.box(id+'-vestibule-side-'+zz,[mid,(top+bottom)/2,zz],[4.8,top-bottom,.4]);
 b.box(id+'-vestibule-end',[x+side*4.4,(top+bottom)/2,z],[.4,top-bottom,4]);
 const floor=b.world.solids.find(s=>s.id===id+'-vestibule')!;
 b.exitCorridor(id+'-exit',id+'-vestibule',{minX:side>0?x+.4:floor.min.x+.02,maxX:side>0?floor.max.x-.02:x-.4,minZ:z-1.58,maxZ:z+1.58});
 b.world.marks.push({text:id.toUpperCase()+' EXIT',position:[x-side*.26,y+3.35,z],normal:[-side,0,0],width:2.4,height:.25});
}

/** Two manual transports answer current dock questions; there is no cargo. */
function askedIfTheDeckIsThere(){
 const b=new ChamberBuilder(),w=b.world;w.family='bridge-rotunda';w.spawn=[0,.87,11];
 const bottom=-4.4,top=12;
 b.floor('question-catch',-14,18,-10,14,bottom);
 b.box('question-north',[2,(top+bottom)/2,-10.2],[32.8,top-bottom,.4]);b.box('question-south',[2,(top+bottom)/2,14.2],[32.8,top-bottom,.4]);
 b.box('question-roof',[2,12.2,2],[32.8,.4,24.8]);
 questionExit(b,'freight',-14.2,-4,5.6,{all:['at:question-freight-lift:GALLERY']});
 questionExit(b,'service',18.2,-4,0,{all:['at:question-service-deck:CROSSING']});
 // Explicit0m floor tessellation leaves the4x4 freight well X−8..−4/Z−6..−2
 // empty, plus the independent return-stair well X−13..−10/Z−8..5.2.
 b.floor('question-main-east',-4,5.7,-10,14);
 b.floor('question-mid-north',-10,-4,-10,-6);b.floor('question-mid-south',-10,-4,-2,14);
 b.floor('question-west-shaft-apron',-10,-8,-6,-2);
 b.floor('question-west-rim',-14,-13,-10,14);b.floor('question-return-north',-13,-10,-10,-8);b.floor('question-return-south',-13,-10,5.2,14);
 b.floor('question-near-edge-north',5.7,6,-10,-6);b.floor('question-near-edge-south',5.7,6,7,14);
 // Real recessed4cm docking lips span the nominal.3m bank overlaps. Their
 // undersides+.01 clear the deck slab[−.4,0], so no thick bank slab occupies
 // the sweep. Five-centimetre top steps use ordinary native stepping.
 b.box('question-near-dock-lip',[5.85,.03,.5],[.3,.04,13],'floor');
 b.floor('question-service-bank',12.3,18,-6,-2);b.box('question-far-dock-lip',[12.15,.03,-4],[.3,.04,4],'floor');
 // Full observation booth; the only white pair stays on the near bank.
 for(const x of[-3.2,3.2])b.box('question-observation-side-'+x,[x,6,11.2],[.4,12,6]);
 b.box('question-observation-glass',[0,6,8.4],[6,12,.16],'glass');
 b.box('question-return-host',[0,1.75,5],[3.8,3.5,.4]);
 b.panel('question-source','question-south',[0,1.75,13.985],[0,0,-1],5,3.5);
 b.panel('question-return','question-return-host',[0,1.75,5.215],[0,0,1],3.5,3.5);
 // Initial freight pose is genuinely GALLERY, not the requested LOADING stop.
 b.device({id:'question-freight-lift',kind:'lift',label:'FREIGHT LIFT',position:[-6,5.4,-4],size:[4,.4,4],target:[-6,-.2,-4],speed:1.2,stops:[{label:'GALLERY',position:[-6,5.4,-4]},{label:'LOADING',position:[-6,-.2,-4]}],controlOffset:[1.3,.9,1.3],controlFacing:[1,0,0]});
 b.floor('question-freight-gallery',-14,-8,-7,-1,5.6);
 for(const z of[-7.1,-.9])b.box('question-upper-guard-'+z,[-11.1,8.8,z],[6.2,6.4,.16],'glass');
 // The shaft walls sit outside the moving slab. Lower apron is part of the
 // main east floor, beginning exactly at deck edgeX−4, never beneath it.
 for(const z of[-6.1,-1.9])b.box('question-shaft-end-'+z,[-6,6,z],[4.5,12,.16],'glass');
 for(const[z1,z2,id]of[[-6,-5.6,'north'],[-2.4,-2,'south']]as const){
  b.box('question-lower-jamb-'+id,[-3.8,6,(z1+z2)/2],[.16,12,z2-z1],'glass');
  b.box('question-upper-jamb-'+id,[-8.12,6,(z1+z2)/2],[.16,12,z2-z1],'glass');
 }
 b.box('question-lower-header',[-3.8,7.5,-4],[.16,9,3.2],'glass');
 b.box('question-upper-sill',[-8.12,2.8,-4],[.16,5.6,3.2]);b.box('question-upper-header',[-8.12,10.3,-4],[.16,3.4,3.2],'glass');
 b.device({id:'question-loading-door',kind:'shutter',label:'LOADING',position:[-3.8,1.5,-4],size:[.16,3,3.2],target:[-3.8,5,-4],direction:[1,0,0],circuit:{all:['at:question-freight-lift:LOADING']}});
 b.device({id:'question-gallery-dock',kind:'shutter',label:'GALLERY',position:[-8.12,7.1,-4],size:[.16,3,3.2],target:[-8.12,10.6,-4],direction:[1,0,0],circuit:{all:['at:question-freight-lift:GALLERY']}});
 // Manual horizontal lift adapter, already used for selected-stop carriers.
 b.device({id:'question-service-deck',kind:'lift',label:'SERVICE DECK',position:[9,-.2,5],size:[6.6,.4,4],target:[9,-.2,-4],speed:1.8,stops:[{label:'PARKED',position:[9,-.2,5]},{label:'CROSSING',position:[9,-.2,-4]}],controlOffset:[1.3,.9,1.3],controlFacing:[-1,0,0]});
 // Bank glass begins+.05 above the entire slab sweep[−.4,0]. Outer walls,
 // rather than these bank screens, seal the catch perimeter down to−4.4.
 for(const[a,c,id]of[[-10,-6,'north'],[-2,14,'south']]as const)b.box('question-bank-glass-'+id,[6.1,6.025,(a+c)/2],[.16,11.95,c-a],'glass');
 for(const z of[-6.2,-1.8])b.box('question-service-side-'+z,[15,6.025,z],[6,11.95,.16],'glass');
 b.box('question-service-near-header',[6.1,7.5,-4],[.16,9,4],'glass');b.box('question-service-far-header',[12.1,7.5,-4],[.16,9,4],'glass');
 b.device({id:'question-service-near-dock',kind:'shutter',label:'CROSSING',position:[6.1,1.5,-4],size:[.16,3,4],target:[6.1,5,-4],direction:[-1,0,0],circuit:{all:['at:question-service-deck:CROSSING']}});
 b.device({id:'question-service-far-dock',kind:'shutter',label:'CROSSING',position:[12.1,1.5,-4],size:[.16,3,4],target:[12.1,5,-4],direction:[1,0,0],circuit:{all:['at:question-service-deck:CROSSING']}});
 // Calls have real posts and approach-side knobs. Clear walking aisles around
 // these visible posts are explicit route points, not body/hit-query exclusions.
 const calls=[
  {id:'question-call-loading',label:'CALL LOADING',x:-2.7,y:1.25,z:-4,side:1 as const,device:'question-freight-lift',stop:1},
  {id:'question-call-gallery',label:'CALL GALLERY',x:-10,y:6.85,z:-4,side:1 as const,device:'question-freight-lift',stop:0},
  {id:'question-call-crossing',label:'CALL CROSSING',x:3.8,y:1.25,z:-4,side:-1 as const,device:'question-service-deck',stop:1},
  {id:'question-call-parked',label:'PARK DECK',x:3.8,y:1.25,z:1,side:-1 as const,device:'question-service-deck',stop:0},
  {id:'question-service-return',label:'CALL CROSSING',x:14.2,y:1.25,z:-4,side:1 as const,device:'question-service-deck',stop:1},
 ];
 for(const c of calls){
  b.box(c.id+'-post',[c.x,c.y-.65,c.z],[.24,1.2,.3]);
  b.device({id:c.id,kind:'switch',label:c.label,position:[c.x,c.y,c.z],size:[.35,.7,.3],controlOffset:[c.side*.3,0,0],controlFacing:[c.side,0,0],calls:{device:c.device,stop:c.stop}});
 }
 for(let i=0;i<22;i++){
  const y=bottom+(i+1)*.2,z=-8+(i+.5)*.6;
  b.box('question-return-step-'+i,[-11.5,(y+bottom-.3)/2,z],[2.5,y-bottom+.3,.6],'floor');
 }
 w.marks.push(
  {text:'CONTROL · PROCEDURE COPY',position:[-2.94,2.4,11.2],normal:[1,0,0],width:4.8,height:.25},
  {text:'Is the freight lift at LOADING?',position:[-2.94,1.95,11.2],normal:[1,0,0],width:4.8,height:.25},
  {text:'If not, call it and wait.',position:[-2.94,1.5,11.2],normal:[1,0,0],width:4.8,height:.25},
  {text:'SERVICE · CROSSING',position:[5.68,3.53,-4],normal:[-1,0,0],width:2.8,height:.25},
 );
 w.routePoints={spawn:[0,.87,11],'source-portal':[0,1.55,13.985],'return-portal':[.55,1.55,5.215],'return-clear':[.55,.865,6.2],'return-west-escape':[-3.8,.865,6.2],'return-east-escape':[3.8,.865,6.2],'loading-call-stand':[-1.3,.865,-4],'loading-clear-north':[-1.3,.865,-5.2],'loading-clear-west':[-3.2,.865,-5.2],'loading-door-wait':[-3.2,.865,-4],'freight-board':[-6,.865,-4],'upper-call-stand':[-8.8,6.465,-4],'upper-post-north':[-9,6.465,-5.8],'upper-clear-west':[-12,6.465,-5.8],'freight-exit':[-17,6.465,-4],'crossing-call-stand':[2.2,.865,-4],'parked-call-stand':[2.2,.865,1],'service-clear-north':[2.2,.865,-6.8],'service-door-wait':[4.8,.865,-4],'service-deck':[9,.865,-4],'service-bank-near':[13,.865,-4],'service-post-north':[13,.865,-5.2],'service-clear-east':[16,.865,-5.2],'service-return-call':[15.6,.865,-4],'service-exit':[21,.865,-4],'catch-low-approach':[-11.5,-3.535,-8.7],'catch-top':[-11.5,.865,6]};
 w.notes.push('DRAFT48 source only. Re-viewed retained07 selected transfer and10 optional-lift targets and inspected current38 manual stops before coordinates. Root approved dry no-cargo/current-dock plan. Reuse original machinery/booth/return family; no paid generation, rotation, new manual moving-platform behavior or new engine adapter.',
  'The actual freight shaft X−8..−4/Z−6..−2 is cut out of main0 floor. East lower apron starts atX−4, with glazing outside the slab edges, lower boarding leaf and upper opposite dock. Initial actual pose is Gallery5.6 (stop0); fixed CALL LOADING selects stop1 then real travel/arrival, not an initial assertion that the question has a yes answer.',
  'Service slab[−.4,0] translatesZ5→−4. Bank glass begins+.05; thick bank floors are recessed from its sweep, with4cm steel docking lips atY.01.. .05 over the nominal.3m overlaps.6m unsupported foot gap and6.6m deck remain, with native5cm stepping. No static solid may occupy a positive volume of the full swept slab. Outer walls independently seal catch−4.4. Actual geometry/native guards remain pending.',
  'Both machines are manual kindlift stop/call adapters. No cargo or pressure exists. Actual stopped at:device:stop contacts power real dock/exit leaves. A target selection, earlier arrival, told/asked/read flag, ride count or used-deck record supplies no support. Parking from the bank without riding is a valid service solution. A far call and upper/lower calls permit safe ordinary return.',
  '22 broad.6/.2 treads rise from actualcatch−4.4 through a real X−13..−10/Z−8..5.2 floor cut to near0. Freights upper5.6 floor remains well above stair headroom. Intended missed service deck reaches catch; no reset, arbitrary actor-Y correction or narrow precision jump is planned. Ordinary paths detour around visible control posts instead of filtering their real colliders.',
  'CONTROL source/copy procedures are authored instructions, not fabricated past character conversation or machine-event history. Reported askif uses statement order and requires checking actual NOW; no backshift/optional-that conversion is assessed. Unregistered; all new native/source-plaque/render/audio/save acceptance remains pending.');
 return b.finish();
}

export const draftReported4648Levels:CoreLevel[]=[{
 number:46,...reported4648English[46],architecture:{height:13,halfWidth:19,style:'graphite'},recoveryY:-25,expectedExit:'higher-exit',blueprint:reportedLaunch,
 wrongExitFeedback:'This is LOW’s lower platform. HIGH’s instruction refers to its deeper shaft and upper platform. Return through the basin to correct the route.',
 contrast:{...reported4648English[46].contrast!,expectedExit:'lower-exit',wrongExitFeedback:'This is HIGH’s upper platform. LOW’s instruction refers to its shallower shaft and lower platform. Both real routes remain available.'},
},{
 number:47,...reported4648English[47],architecture:{height:10,halfWidth:12,style:'ceramic'},expectedExit:'entry-exit',blueprint:listenersCargo,
 wrongExitFeedback:'This is FREIGHT’s upper receiving route. ENTRY asked you to maintain its walking hatch and bring cargo to its own ground bay.',
 contrast:{...reported4648English[47].contrast!,expectedExit:'freight-exit',wrongExitFeedback:'This is ENTRY’s maintained walking hatch and ground bay. FREIGHT’s request identifies its low receiving window and separate stairs.'},
},{
 number:48,...reported4648English[48],architecture:{height:12,halfWidth:16,style:'graphite'},recoveryY:-7.5,expectedExit:'freight-exit',blueprint:askedIfTheDeckIsThere,
 wrongExitFeedback:'This is the parked service crossing. CONTROL’s report asks about the freight lift at LOADING and its upper freight gallery.',
 contrast:{...reported4648English[48].contrast!,expectedExit:'service-exit',wrongExitFeedback:'This is the upper freight gallery. The changed reported question asks about the service deck at CROSSING and its parked route.'},
}];
