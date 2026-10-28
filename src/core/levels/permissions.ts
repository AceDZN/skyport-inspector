/** Unregistered explicit drafts. Geometry is independent of active mission/contrast. */
import type {CoreLevel} from '../level';
import {ChamberBuilder} from '../level-kit';
import {permissionsEnglish} from './permissions-english';

function keepTheCircuit(){
 const b=new ChamberBuilder(),w=b.world;w.family='l-gallery';w.spawn=[0,.87,10];
 b.floor('maintenance-floor',-8,8,-12,12);
 b.box('maintenance-ceiling',[0,10.2,0],[16.8,.4,24.8]);
 b.box('west-wall',[-8.2,5,0],[.4,10,24.8]);
 b.box('east-wall',[8.2,5,0],[.4,10,24.8]);
 // A real upper receiving gallery, with an opaque return spine and grounded lower recovery.
 b.box('north-gallery',[-4.5,1.4,-8],[7,2.8,8],'floor');
 b.box('gallery-spine',[-2.8,4.8,-7],[.3,4,5]);
 b.box('gallery-east-rail',[-.95,3.2,-8],[.18,.8,8]);
 b.box('gallery-front-rail',[-4.5,3.2,-4.5],[7,.8,.18]);
 // Glazed side power cell is a finite alcove, not a repeated room-length dividing glass wall.
 b.box('power-cell-north',[-5,2,-.2],[6,4,.3]);
 b.box('power-cell-south',[-5,2,5.2],[6,4,.3]);
 b.box('power-cell-roof',[-5,4.2,2.5],[6.2,.4,5.7]);
 b.box('power-cell-window',[-1.95,2,2.5],[.16,4,5.1],'glass');
 b.button('north-button',[-5,.14,2]);
 b.button('south-button',[4,.14,6]);
 // Bottom sits on the actual pressure button's top, so pressure is physical from frame one.
 b.cube('cube',[-5,.69,2]);
 // North upper doorway: real side jambs, sill and header; no eligible wall beyond it.
 b.box('north-west-jamb',[-6.7,5,-12.2],[2.6,10,.4]);
 b.box('north-east-wall',[2.7,5,-12.2],[10.6,10,.4]);
 b.box('north-door-sill',[-4,1.4,-12.2],[2.8,2.8,.4]);
 b.box('north-door-header',[-4,7.9,-12.2],[2.8,4.2,.4]);
 b.device({id:'north-door',kind:'shutter',label:'NORTH',position:[-4,4.3,-12.12],size:[2.8,3,.3],target:[-4,7.8,-12.12],direction:[0,0,1],circuit:{all:['north-button']}});
 b.floor('north-vestibule-floor',-5.4,-2.6,-16,-11.8,2.8);
 b.box('north-vestibule-ceiling',[-4,10.2,-14.1],[3.6,.4,4.6]);
 for(const x of [-5.6,-2.4])b.box('north-vestibule-side-'+x,[x,5,-14.1],[.4,10,4.6]);
 b.box('north-vestibule-end',[-4,5,-16.2],[3.6,10,.4]);
 b.exitCorridor('north-exit','north-vestibule-floor');
 // South is a separate lower branch, powered by the other real pressure circuit.
 b.box('south-west-wall',[-2.7,5,12.2],[10.6,10,.4]);
 b.box('south-east-jamb',[6.7,5,12.2],[2.6,10,.4]);
 b.box('south-door-header',[4,6.5,12.2],[2.8,7,.4]);
 b.device({id:'south-door',kind:'shutter',label:'SOUTH',position:[4,1.5,12.12],size:[2.8,3,.3],target:[4,5,12.12],direction:[0,0,-1],circuit:{all:['south-button']}});
 b.floor('south-vestibule-floor',2.6,5.4,11.8,16);
 b.box('south-vestibule-ceiling',[4,10.2,14.1],[3.6,.4,4.6]);
 for(const x of [2.4,5.6])b.box('south-vestibule-side-'+x,[x,5,14.1],[.4,10,4.6]);
 b.box('south-vestibule-end',[4,5,16.2],[3.6,10,.4]);
 b.exitCorridor('south-exit','south-vestibule-floor');
 // Source bay and two useful destination bays are authored rectangles on real hosts.
 b.panel('source-east','east-wall',[7.985,5,0],[-1,0,0],24,10);
 b.panel('power-west','west-wall',[-7.985,2,2],[1,0,0],5,4);
 b.panel('upper-west','west-wall',[-7.985,5.4,-8],[1,0,0],8,5.2);
 w.marks.push({text:'NORTH',position:[-4,6.1,-11.94],normal:[0,0,1],width:1.2,height:.25},{text:'SOUTH',position:[4,3.35,11.94],normal:[0,0,-1],width:1.2,height:.25});
 w.routePoints={'upper-aim':[5,.87,8],'source-upper':[7.96,1.55,8],'upper-portal':[-7.96,4.35,-8],'power-aim':[0,.87,2],'source-power':[7.96,1.55,2],'power-portal':[-7.96,1.55,2],'north-button':[-5,.14,2],'south-button':[4,.14,6],'south-drop-approach':[5.7,.87,6],'north-exit':[-4,3.66,-14.7],'south-exit':[4,.86,14.7]};
 w.notes.push('DRAFT ONLY. Target permissions-power-06-09.png generated/displayed/inspected before this geometry; this room uses its raised north gallery and separate lower south route.','Base: from upper-aim place source-east A at y1.55,z8 and upper-west B at y4.35,z-8. The 2.8m height difference preserves walking elevation. Leave the prepressed cube alone, traverse to the upper gallery, then take the actual north vestibule.','Contrast: move to power-aim, link source-east y1.55,z2 to power-west y1.55,z2 through its real glass window, retrieve cube and return it to south-button. This closes north and opens south. Either portal index assignment is valid.','Power-cell opaque caps require a real frontal sightline through its glass. Doors and dark vestibules are not portalable. No touched-cube, held-cube or route-count success flags. Native/UI normal-route review remains required.');
 return b.finish();
}

const english6=permissionsEnglish[6];
export const draftPermissionLevels:CoreLevel[]=[{
 number:6,...english6,architecture:{height:10,halfWidth:8,style:'ceramic'},expectedExit:'north-exit',
 wrongExitFeedback:'This is the south branch. The north door needs the cube on the north button. Return to that circuit to recover.',
 blueprint:keepTheCircuit,
 contrast:{...english6.contrast!,expectedExit:'south-exit',wrongExitFeedback:'This is the north branch. Move the cube to the south button to open the requested south door.'},
}];

function bridgeAtRest(){
 const b=new ChamberBuilder(),w=b.world;w.family='bridge-rotunda';w.spawn=[0,.87,12];
 b.floor('catch-basin',-15,14,-10,15,-4.4);
 b.floor('hub-floor',-8,5,2,6);
 b.floor('north-dock',-8,0,-10,-4);
 b.floor('east-dock',10,14,-4,2);
 b.floor('operations-floor',-3,3,9,15);
 b.box('transfer-ceiling',[-.5,8.2,2.5],[29.8,.4,25.8]);
 b.box('west-wall',[-15.2,1.8,2.5],[.4,12.4,25.8]);
 b.box('south-wall',[-.5,1.8,15.2],[29.8,12.4,.4]);
 // Source booth is fully enclosed; the first hub crossing genuinely needs a linked pair.
 for(const x of [-3.2,3.2])b.box('operations-side-'+x,[x,4,12],[.4,8,6.4]);
 b.box('operations-window',[0,4,8.95],[6.4,8,.16],'glass');
 b.box('hub-host',[0,1.75,2.6],[3.8,3.5,.3]);
 b.panel('operations-white','south-wall',[0,2,14.985],[0,0,-1],5,4);
 b.panel('hub-white','hub-host',[0,1.75,2.765],[0,0,1],3.5,3.5);
 // Straight rail: deck sweeps no fixed top-floor volume, and gaps exceed ordinary jumping.
 b.device({id:'transfer-deck',kind:'lift',label:'TRANSFER',position:[-4,-.15,-1],size:[8,.3,6],target:[6,-.15,-1],stops:[{label:'north',position:[-4,-.15,-1]},{label:'east',position:[6,-.15,-1]}],controlOffset:[-3,.9,2.2],controlFacing:[0,0,1]});
 // Native carrier supplies collision. These fixed rails are actual authored solids below its deck.
 for(const z of [-3.25,1.25])b.box('transfer-guide-'+z,[1,-1.9,z],[18,.18,.16]);
 // Broad real catch stairs return to hub. No destination dock can be reached by these stairs.
 // Broad treads leave room for the capsule beyond the KCC's landing probe.
 // The separate west aisle reaches the north end; climb south to a real landing.
 for(let i=0;i<22;i++){const top=-4.2+i*.2;b.box('catch-return-step-'+i,[-12.5,(top-4.7)/2,-8.7+i*.6],[2.5,top+4.7,.6],'floor');}
 b.floor('catch-return-landing',-13.75,-7.8,3.6,5.2);
 // North dock's real aperture/vestibule.
 b.box('north-west-wall',[-10.4,1.8,-10.2],[10,12.4,.4]);
 b.box('north-east-wall',[5.7,1.8,-10.2],[16.6,12.4,.4]);
 b.box('north-header',[-4,5.5,-10.2],[2.8,5,.4]);
 b.box('north-sill',[-4,-2.2,-10.2],[2.8,4.4,.4]);
 b.device({id:'north-dock-door',kind:'shutter',label:'NORTH',position:[-4,1.5,-10.12],size:[2.8,3,.3],target:[-4,5,-10.12],direction:[0,0,1],circuit:{all:['at:transfer-deck:north']}});
 b.floor('north-vestibule-floor',-5.4,-2.6,-14,-9.8);
 b.box('north-vestibule-ceiling',[-4,8.2,-12.1],[3.6,.4,4.6]);
 for(const x of [-5.6,-2.4])b.box('north-vestibule-side-'+x,[x,1.8,-12.1],[.4,12.4,4.6]);
 b.box('north-vestibule-end',[-4,1.8,-14.2],[3.6,12.4,.4]);
 b.exitCorridor('north-exit','north-vestibule-floor');
 // East is separated from the hub by five metres, not a jumpable touching corner.
 b.box('east-north-wall',[14.2,1.8,-6.2],[.4,12.4,7.6]);
 b.box('east-south-wall',[14.2,1.8,7.7],[.4,12.4,14.6]);
 b.box('east-header',[14.2,5.5,-1],[.4,5,2.8]);
 b.box('east-sill',[14.2,-2.2,-1],[.4,4.4,2.8]);
 b.device({id:'east-dock-door',kind:'shutter',label:'EAST',position:[14.12,1.5,-1],size:[.3,3,2.8],target:[14.12,5,-1],direction:[-1,0,0],circuit:{all:['at:transfer-deck:east']}});
 b.floor('east-vestibule-floor',13.8,18,-2.4,.4);
 b.box('east-vestibule-ceiling',[16,8.2,-1],[4.8,.4,3.6]);
 for(const z of [-2.6,.6])b.box('east-vestibule-side-'+z,[16,1.8,z],[4.8,12.4,.4]);
 b.box('east-vestibule-end',[18.2,1.8,-1],[.4,12.4,3.6]);
 b.exitCorridor('east-exit','east-vestibule-floor');
 w.marks.push({text:'NORTH',position:[-4,3.35,-9.94],normal:[0,0,1],width:1.2,height:.25},{text:'EAST',position:[13.94,3.35,-1],normal:[-1,0,0],width:1.2,height:.25});
 w.routePoints={'source-portal':[0,1.55,14.985],'hub-portal':[.55,1.55,2.765],'north-control':[-7,.75,1.2],'east-control':[3,.75,1.2],'north-boarding':[-4,.87,3],'east-boarding':[3,.87,3],'catch-west-aisle':[-14.2,-3.535,5.7],'catch-stair-approach':[-12.5,-3.535,-9.5],'catch-landing':[-7.5,.865,4.4],'north-dock':[-4,.87,-6],'east-dock':[12,.87,-1],'north-exit':[-4,.86,-12.5],'east-exit':[16.5,.86,-1]};
 w.notes.push('DRAFT ONLY; transfer target generated/inspected before authoring. North=-Z, east=+X. An 8x6 deck on a straight rail avoids fixed hub volumes. Both dock shutters use actual stopped-at-dock contacts; a cross-dock running jump can reach the other dock but cannot open its unaligned physical shutter.','The one E panel moves with the deck at controlOffset[-3,.9,2.2]; it is reachable from fixed hub floor at either stopped alignment. Default stays north; changed wording selects east. The same two dock circuits exist under both instructions.','Source booth and hub are the only eligible portal hosts. Both destination vestibules are dark. The catch basin has a real west aisle to the north end of twenty-two .60m-deep/.20m-rise stairs, climbed southward to a landing connected only to the hub. The landing ends atz5.2 so the original miss atz5.8 still reaches the catch floor. No usedPlatform or remembered command flag gates completion.');
 return b.finish();
}
const english7=permissionsEnglish[7];
draftPermissionLevels.push({number:7,...english7,architecture:{height:8,halfWidth:15,style:'graphite'},expectedExit:'north-exit',blueprint:bridgeAtRest,wrongExitFeedback:'This is the east dock. Restore the north deck connection for the requested north route.',contrast:{...english7.contrast!,expectedExit:'east-exit',wrongExitFeedback:'This is the north dock. The east instruction allows moving the deck to the east alignment.'}});

/** Boundary apertures are explicit physical carpentry, unrelated to mission selection. */
function openingZ(b:ChamberBuilder,id:string,x:number,z:number,x1:number,x2:number,y:number,top:number,bottom=-8.3){
 b.box(id+'-left',[(x1+x-1.4)/2,(top+bottom)/2,z],[x-1.4-x1,top-bottom,.4]);
 b.box(id+'-right',[(x+1.4+x2)/2,(top+bottom)/2,z],[x2-x-1.4,top-bottom,.4]);
 b.box(id+'-header',[x,(top+y+3)/2,z],[2.8,top-y-3,.4]);
 b.box(id+'-sill',[x,(y+bottom)/2,z],[2.8,y-bottom,.4]);
}
function openingX(b:ChamberBuilder,id:string,x:number,z:number,z1:number,z2:number,y:number,top:number,bottom=-8.3){
 b.box(id+'-north',[x,(top+bottom)/2,(z1+z-1.4)/2],[.4,top-bottom,z-1.4-z1]);
 b.box(id+'-south',[x,(top+bottom)/2,(z+1.4+z2)/2],[.4,top-bottom,z2-z-1.4]);
 b.box(id+'-header',[x,(top+y+3)/2,z],[.4,top-y-3,2.8]);
 b.box(id+'-sill',[x,(y+bottom)/2,z],[.4,y-bottom,2.8]);
}
function vestibuleZ(b:ChamberBuilder,id:string,x:number,z:number,outward:1|-1,y:number,top:number){
 const a=z-outward*.4,end=z+outward*4,mid=z+outward*1.8;
 b.floor(id+'-floor',x-1.4,x+1.4,Math.min(a,end),Math.max(a,end),y);
 b.box(id+'-ceiling',[x,top+.2,mid],[3.6,.4,4.6]);
 for(const side of [-1,1])b.box(id+'-side-'+side,[x+side*1.6,(top+y)/2,mid],[.4,top-y,4.6]);
 b.box(id+'-end',[x,(top+y)/2,z+outward*4.2],[3.6,top-y,.4]);
 b.exitCorridor(id,id+'-floor');
}
function vestibuleX(b:ChamberBuilder,id:string,x:number,z:number,outward:1|-1,y:number,top:number){
 const a=x-outward*.4,end=x+outward*4,mid=x+outward*1.8;
 b.floor(id+'-floor',Math.min(a,end),Math.max(a,end),z-1.4,z+1.4,y);
 b.box(id+'-ceiling',[mid,top+.2,z],[4.6,.4,3.6]);
 for(const side of [-1,1])b.box(id+'-side-'+side,[mid,(top+y)/2,z+side*1.6],[4.6,top-y,.4]);
 b.box(id+'-end',[x+outward*4.2,(top+y)/2,z],[.4,top-y,3.6]);
 b.exitCorridor(id,id+'-floor');
}

function upperFreight(){
 const b=new ChamberBuilder(),w=b.world;w.family='lift-shaft';w.spawn=[0,.87,11];
 // Real four-strip lower floor leaves a carrier well, rather than overlapping a fixed plate.
 b.floor('west-lower-floor',-9,-2,-10,12);b.floor('east-lower-floor',2,9,-10,12);
 b.floor('south-lower-floor',-2,2,2,12);b.floor('north-lower-floor',-2,2,-10,-2);
 b.floor('freight-catch-floor',-9,9,-10,12,-8.3);
 b.box('freight-ceiling',[0,12.2,1],[18.8,.4,22.8]);
 b.box('freight-west-wall',[-9.2,1.85,1],[.4,20.3,22.8]);
 b.box('freight-south-wall',[0,1.85,12.2],[18.8,20.3,.4]);
 openingZ(b,'upper-boundary',-5,-10.2,-9,9,4.2,12);
 openingX(b,'lower-boundary',9.2,7,-10,12,0,12);
 // Set-back receiving wings and a narrow central landing arm preserve a legitimate low-eye shot.
 b.box('upper-receiving-gallery',[0,2.1,-7.5],[18,4.2,5],'floor');
 b.floor('upper-landing-arm',-2,2,-5,-2,4.2);
 for(const x of [-2.7,2.7])b.box('freight-guide-'+x,[x,4.5,-.6],[.3,9,.4]);
 b.device({id:'freight-lift',kind:'lift',label:'FREIGHT',position:[0,-.15,0],size:[4,.3,4],target:[0,4.05,0],stops:[{label:'lower',position:[0,-.15,0]},{label:'upper',position:[0,4.05,0]}],controlOffset:[1.3,.9,1.3],controlFacing:[-1,0,0]});
 b.button('lower-button',[-5,.14,3]);b.button('upper-button',[5,4.34,-7]);b.cube('cube',[-5,.55,7]);
 b.device({id:'upper-door',kind:'shutter',label:'UPPER',position:[-5,5.7,-10.12],size:[2.8,3,.3],target:[-5,9.2,-10.12],direction:[0,0,1],circuit:{all:['upper-button']}});
 b.device({id:'lower-door',kind:'shutter',label:'LOWER',position:[9.12,1.5,7],size:[.3,3,2.8],target:[9.12,5,7],direction:[-1,0,0],circuit:{all:['lower-button']}});
 vestibuleZ(b,'upper-exit',-5,-10.2,-1,4.2,12);vestibuleX(b,'lower-exit',9.2,7,1,0,12);
 b.panel('source-south','freight-south-wall',[0,6,11.985],[0,0,-1],18,12);
 b.panel('upper-east','lower-boundary-north',[8.985,7,-7],[-1,0,0],5,5.6);
 w.marks.push({text:'UPPER',position:[-5,7.55,-9.94],normal:[0,0,1],width:1.1,height:.25},{text:'LOWER',position:[8.94,3.35,7],normal:[-1,0,0],width:1.1,height:.25});
 w.routePoints={'lift-lower':[0,.87,1],'lift-control-lower':[1.3,.75,1.3],'lift-control-upper':[1.3,4.95,1.3],'upper-aim':[5,.87,11],'source-portal':[4,1.55,11.985],'upper-portal':[8.985,5.75,-7],'cube':[-5,.55,7],'lower-button':[-5,.14,3],'upper-button':[5,4.34,-7],'upper-exit':[-5,5.06,-12.7],'lower-exit':[11.7,.86,7]};
 w.notes.push('DRAFT ONLY; freight08 target generated and inspected before geometry. Actual 4x4 carrier top0→4.2, riding controlOffset[1.3,.9,1.3], selectable lower/upper stops. No fictional fixed call widgets.','The receiving gallery starts z=-5, with only a central x±2 landing arm reaching the shaft at z=-2. From [5,1.52,11], the intended upper-east y5.75 shot clears the set-back gallery; no .65 body-support scaling or compulsory jump is assumed.','Upper pressure physically opens upper exit; lower pressure opens a separate lower exit. Carrier transport, a legitimate independent cube portal delivery or an actual recoverable drop is allowed. No usedLift/heldCargo flag. Native aperture and swept-volume checks pass; normal rider/cube transport, recovery and both routes remain unverified.');
 return b.finish();
}
const english8=permissionsEnglish[8];
draftPermissionLevels.push({number:8,...english8,architecture:{height:12,halfWidth:9,style:'ceramic'},expectedExit:'upper-exit',blueprint:upperFreight,wrongExitFeedback:'This is the lower dock. Take the cube to the upper button to open the requested upper door.',contrast:{...english8.contrast!,expectedExit:'lower-exit',wrongExitFeedback:'This is the upper dock. The changed instruction asks you to leave the cube at the lower dock.'}});

function choiceOfCargo(){
 const b=new ChamberBuilder(),w=b.world;w.family='dual-vault';w.spawn=[0,.87,11];
 b.floor('inspection-west-floor',-11,5,-14,14);b.floor('inspection-east-floor',9,11,-14,14);
 b.floor('inspection-south-floor',5,9,-1,14);b.floor('inspection-north-floor',5,9,-14,-5);
 b.floor('inspection-catch-floor',-11,11,-14,14,-8.3);
 b.box('inspection-ceiling',[0,10.2,0],[22.8,.4,28.8]);
 b.box('inspection-south-wall',[0,.85,14.2],[22.8,18.3,.4]);
 b.box('inspection-north-wall',[0,.85,-14.2],[22.8,18.3,.4]);
 openingX(b,'west-boundary',-11.2,9,-14,14,0,10);
 openingX(b,'east-boundary',11.2,9,-14,14,0,10);
 // Western cargo route is a sealed low glass cell reached by a true portal pair.
 b.box('low-cell-spine',[-2.9,2.5,-8],[.2,5,8.4]);
 b.box('low-cell-north',[-7,2.5,-12.2],[8.4,5,.4]);
 b.box('low-cell-window',[-7,2.5,-3.95],[8,5,.16],'glass');
 b.box('low-cell-roof',[-7,5.2,-8],[8.4,.4,8.4]);
 b.cube('cube-a',[-7,.55,-8]);
 // Eastern cargo uses a real lift/raised gallery; no eligible upper wall skips the new route.
 b.box('service-gallery',[7,1.7,-9.5],[8,3.4,9],'floor');
 b.cube('cube-b',[7,3.95,-9]);
 for(const x of [4.3,9.7])b.box('service-guide-'+x,[x,3.6,-3],[.3,7.2,.4]);
 b.device({id:'storage-lift',kind:'lift',label:'STORAGE',position:[7,-.15,-3],size:[4,.3,4],target:[7,3.25,-3],stops:[{label:'lower',position:[7,-.15,-3]},{label:'gallery',position:[7,3.25,-3]}],controlOffset:[1.3,.9,1.3]});
 b.button('east-button',[6,.14,7]);b.button('west-button-a',[-5,.14,5]);b.button('west-button-b',[-1,.14,5]);
 b.device({id:'east-door',kind:'shutter',label:'EAST',position:[11.12,1.5,9],size:[.3,3,2.8],target:[11.12,5,9],direction:[-1,0,0],circuit:{all:['east-button']}});
 b.device({id:'west-door',kind:'shutter',label:'WEST',position:[-11.12,1.5,9],size:[.3,3,2.8],target:[-11.12,5,9],direction:[1,0,0],circuit:{all:['west-button-a','west-button-b']}});
 vestibuleX(b,'east-exit',11.2,9,1,0,10);vestibuleX(b,'west-exit',-11.2,9,-1,0,10);
 b.panel('source-south','inspection-south-wall',[0,5,13.985],[0,0,-1],22,10);
 b.panel('low-west','west-boundary-north',[-10.985,2,-8],[1,0,0],8,4);
 w.marks.push({text:'EAST',position:[10.94,3.35,9],normal:[-1,0,0],width:1.1,height:.25},{text:'WEST',position:[-10.94,3.35,9],normal:[1,0,0],width:1.1,height:.25});
 w.routePoints={'source-portal':[0,1.55,13.985],'low-portal':[-10.985,1.55,-8],'cube-a':[-7,.55,-8],'storage-control-lower':[8.3,.75,-1.7],'storage-control-upper':[8.3,4.15,-1.7],'cube-b':[7,3.95,-9],'east-button':[6,.14,7],'west-button-a':[-5,.14,5],'west-button-b':[-1,.14,5],'east-exit':[13.7,.86,9],'west-exit':[-13.7,.86,9]};
 w.notes.push('DRAFT ONLY; inspection09 architecture target generated/inspected before geometry; rejected concept props are replaced by existing original diamond cargo. Cubes are identical and interchangeable.','A is in the actual low glass cell, reached via source-south/low-west. B is on a raised service gallery, reached using the native storage lift; upper storage surfaces remain dark so the routes are physically different. Any valid independent delivery remains acceptable.','Either cube presses the east single input. The opposed west door uses two separated simultaneous inputs, not a touch counter; either cube assignment is valid. Inputs are far from west door safety so a player-pressure sprint cannot replace both maintained cubes.');
 return b.finish();
}
const english9=permissionsEnglish[9];
draftPermissionLevels.push({number:9,...english9,architecture:{height:10,halfWidth:11,style:'ceramic'},expectedExit:'east-exit',blueprint:choiceOfCargo,wrongExitFeedback:'This is the west exit. Either cube is sufficient for the requested east button and east door.',contrast:{...english9.contrast!,expectedExit:'west-exit',wrongExitFeedback:'This is the east exit. The west circuit needs both distinct pressure buttons held at once.'}});

function optionalRide(){
 const b=new ChamberBuilder(),w=b.world;w.family='lift-shaft';w.spawn=[-6,.87,10];
 b.floor('service-west-ground',-12,-3,-10,12);b.floor('service-east-ground',3,12,-10,12);
 b.floor('service-south-ground',-3,3,2,12);b.floor('service-north-ground',-3,3,-10,-2);
 b.floor('service-catch-floor',-12,12,-10,12,-8.3);
 b.box('service-ceiling',[0,12.2,1],[24.8,.4,22.8]);
 b.box('service-north-wall',[0,1.85,-10.2],[24.8,20.3,.4]);
 b.box('service-south-wall',[0,1.85,12.2],[24.8,20.3,.4]);
 openingX(b,'upper-boundary',-12.2,-5,-10,12,4.2,12);
 openingX(b,'side-boundary',12.2,0,-10,12,4.2,12);
 // Both optional routes reach only the WEST upper gallery. The EAST side gap stays six metres.
 b.floor('upper-north-wing',-8,-3,-6,-3.5,4.2);
 b.floor('upper-south-wing',-8,-3,-.5,5,4.2);
 b.floor('upper-stair-return',-4.8,-3,-3.5,-.5,4.2);
 b.floor('upper-exit-corridor',-12,-8,-6.4,-3.6,4.2);
 b.floor('isolated-side-gallery',3,12,-2,2,4.2);
 for(const z of [-2.2,2.2])b.box('side-gallery-wall-'+z,[7.5,6.1,z],[9.4,3.8,.4]);
 // Gentle physical stepped walkway: each riser stays below native .23m autostep.
 for(let i=1;i<=21;i++){const top=i*.1;b.box('west-ascent-step-'+i,[-10,(top-.6)/2,9.9-(i-.5)*.4],[2.8,top+.6,.4],'floor');}
 b.floor('west-turn-landing',-11.4,-8.6,-3.5,1.7,2.1);
 for(let i=1;i<=16;i++){const top=2.1+i*(2.1/16);b.box('upper-ascent-step-'+i,[-10+(i-.5)*.325,(top-.6)/2,-2],[.325,top+.6,2.8],'floor');}
 for(const x of [-2.5,2.5])b.box('service-lift-guide-'+x,[x,4.5,-2.7],[.3,9,.4]);
 b.device({id:'service-lift',kind:'lift',label:'SERVICE',position:[0,-.15,0],size:[6,.3,4],target:[0,4.05,0],stops:[{label:'lower',position:[0,-.15,0]},{label:'upper',position:[0,4.05,0]}],controlOffset:[-2.2,.9,1.3],controlFacing:[0,0,1]});
 b.cube('cube',[-7,.55,10]);b.button('upper-button',[-6,4.34,-5]);
 b.device({id:'upper-door',kind:'shutter',label:'UPPER',position:[-12.12,5.7,-5],size:[.3,3,2.8],target:[-12.12,9.2,-5],direction:[1,0,0],circuit:{all:['upper-button']}});
 // Real native dock contact is position+stopped, never a remembered control selection.
 b.device({id:'side-door',kind:'shutter',label:'SIDE',position:[12.12,5.7,0],size:[.3,3,2.8],target:[12.12,9.2,0],direction:[-1,0,0],circuit:{all:['at:service-lift:upper']}});
 vestibuleX(b,'upper-exit',-12.2,-5,-1,4.2,12);vestibuleX(b,'side-exit',12.2,0,1,4.2,12);
 // This original host stands on the west upper wing. No eligible surface exists in the east branch.
 b.box('upper-portal-host',[-8.2,7.2,3],[.4,6,4]);
 b.panel('upper-west','upper-portal-host',[-7.985,7.2,3],[1,0,0],4,6);
 b.panel('source-south','service-south-wall',[0,6,11.985],[0,0,-1],24,12);
 w.marks.push({text:'UPPER',position:[-11.94,7.55,-5],normal:[1,0,0],width:1.1,height:.25},{text:'SIDE',position:[11.94,7.55,0],normal:[-1,0,0],width:1.1,height:.25});
 w.routePoints={'cube':[-7,.55,10],'stairs-start':[-10,.87,10.5],'stairs-turn':[-10,2.96,-2],'stairs-upper':[-4.7,5.06,-2],'upper-button':[-6,4.34,-5],'lift-control-lower':[-2.2,.75,1.3],'lift-control-upper':[-2.2,4.95,1.3],'portal-aim':[-7,.87,11],'source-portal':[-7,1.55,11.985],'upper-portal':[-7.985,5.75,3],'upper-exit':[-14.7,5.06,-5],'side-exit':[14.7,5.06,0]};
 w.notes.push('DRAFT ONLY; optional10 single-frame target generated and inspected before geometry. The broad stepped west route is real .1/.13125m risers, not a fake ramp or invisible route flag. All fixed upper floor remains at x<=-3 except the isolated side gallery x>=3.','Native service lift has a 6x4 deck: upper docking bridges a full six-metre lateral gap that ordinary running/jumping cannot replace. Side door uses at:service-lift:upper, derived from actual position within3cm and !moving. Selecting a stop alone must not power it.','Base: carry cube up the stepped route, use the lift, or deliver through a valid source-south/upper-west pair; all are permitted because do not have to is not prohibition. Leave cube on upper-button to open actual upper exit.','Contrast: reach the moving deck control from adjacent fixed lower landing, park at upper, then reach west gallery by any valid route and walk the real deck bridge to SIDE. No riding event or cube-placement chore is added to this changed instruction.');
 return b.finish();
}
const english10=permissionsEnglish[10];
draftPermissionLevels.push({number:10,...english10,architecture:{height:12,halfWidth:12,style:'graphite'},expectedExit:'upper-exit',blueprint:optionalRide,wrongExitFeedback:'This is the side exit. The base task asks for the cube on the upper button and the upper exit; riding was optional.',contrast:{...english10.contrast!,expectedExit:'side-exit',wrongExitFeedback:'This is the upper-button exit. Park the deck at the upper dock to connect the requested SIDE route.'}});
