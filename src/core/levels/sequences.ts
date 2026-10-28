/** Unregistered authored drafts12–15. No geometry is derived from active language. */
import type {CoreLevel} from '../level';
import {ChamberBuilder} from '../level-kit';
import type {Circuit,XYZ} from '../../systems';
const temporal='https://english.workbook.co.il/grade-8/chapter-11/connectors-and-time-clauses';

/** Explicit boundary carpentry; centre is an actual 2.8m-wide, 3m-high opening. */
function openingX(b:ChamberBuilder,id:string,x:number,z:number,z1:number,z2:number,y:number,top:number,bottom=-4.4){
 b.box(id+'-north',[x,(top+bottom)/2,(z1+z-1.4)/2],[.4,top-bottom,z-1.4-z1]);
 b.box(id+'-south',[x,(top+bottom)/2,(z+1.4+z2)/2],[.4,top-bottom,z2-z-1.4]);
 b.box(id+'-header',[x,(top+y+3)/2,z],[.4,top-y-3,2.8]);
 b.box(id+'-sill',[x,(y+bottom)/2,z],[.4,y-bottom,2.8]);
}
function exitX(b:ChamberBuilder,id:string,x:number,z:number,outward:1|-1,y:number,top:number){
 const a=x-outward*.4,end=x+outward*4,mid=x+outward*1.8;
 b.floor(id+'-floor',Math.min(a,end),Math.max(a,end),z-1.4,z+1.4,y);
 b.box(id+'-ceiling',[mid,top+.2,z],[4.6,.4,3.6]);
 for(const side of [-1,1])b.box(id+'-side-'+side,[mid,(top+y)/2,z+side*1.6],[4.6,top-y,.4]);
 b.box(id+'-end',[x+outward*4.2,(top+y)/2,z],[.4,top-y,3.6]);
 b.exitCorridor(id,id+'-floor');
}
function shutterX(b:ChamberBuilder,id:string,label:string,x:number,z:number,y:number,circuit:Circuit){
 b.device({id,kind:'shutter',label,position:[x,y+1.5,z],size:[.3,3,2.8],target:[x,y+5,z],direction:[-Math.sign(x),0,0],circuit});
}
function openingZ(b:ChamberBuilder,id:string,x:number,z:number,x1:number,x2:number,y:number,top:number,bottom=-4.4){
 b.box(id+'-west',[(x1+x-1.4)/2,(top+bottom)/2,z],[x-1.4-x1,top-bottom,.4]);
 b.box(id+'-east',[(x+1.4+x2)/2,(top+bottom)/2,z],[x2-x-1.4,top-bottom,.4]);
 b.box(id+'-header',[x,(top+y+3)/2,z],[2.8,top-y-3,.4]);
 b.box(id+'-sill',[x,(y+bottom)/2,z],[2.8,y-bottom,.4]);
}
function exitNorth(b:ChamberBuilder,id:string,x:number,z:number,y:number,top:number){
 b.floor(id+'-floor',x-1.4,x+1.4,z-4,z+.4,y);
 b.box(id+'-ceiling',[x,top+.2,z-1.8],[3.6,.4,4.6]);
 for(const side of [-1,1])b.box(id+'-side-'+side,[x+side*1.6,(top+y)/2,z-1.8],[.4,top-y,4.6]);
 b.box(id+'-end',[x,(top+y)/2,z-4.2],[3.6,top-y,.4]);
 b.exitCorridor(id,id+'-floor');
}
function directionMark(b:ChamberBuilder,text:string,x:number,z:number,normal:XYZ){b.world.marks.push({text,position:[x,3.35,z],normal,width:1.5,height:.25});}

function inspectionPulse(){
 const b=new ChamberBuilder(),w=b.world;w.family='return-loop';w.spawn=[0,.87,11];
 b.floor('pulse-floor',-10,10,-12,14);
 b.box('pulse-ceiling',[0,10.2,1],[20.8,.4,26.8]);
 for(const x of [-10.2,10.2])b.box('pulse-side-'+x,[x,5,1],[.4,10,26.8]);
 b.box('pulse-south-wall',[0,5,14.2],[20.8,10,.4]);
 b.box('pulse-north-wall',[0,5,-12.2],[20.8,10,.4]);
 // A complete operations booth needs a portal link through its actual glass front.
 for(const x of [-3.2,3.2])b.box('booth-side-'+x,[x,5,10],[.4,10,8.4]);
 b.box('booth-window',[0,5,5.95],[6.4,10,.16],'glass');
 b.box('waiting-portal-host',[0,1.75,2.5],[3.8,3.5,.3]);
 b.panel('booth-source','pulse-south-wall',[0,1.75,13.985],[0,0,-1],5,3.5);
 b.panel('waiting-white','waiting-portal-host',[0,1.75,2.665],[0,0,1],3.5,3.5);
 // Opposed cycles actuate real opaque gates. Seven-second windows are forgiving.
 b.device({id:'east-clock',kind:'timer',automatic:true,label:'EAST CYCLE',position:[1.2,1.25,4.5],size:[.8,1.2,.35],pulse:{period:14,onFor:7,offset:0}});
 b.device({id:'west-clock',kind:'timer',automatic:true,label:'WEST CYCLE',position:[-1.2,1.25,4.5],size:[.8,1.2,.35],pulse:{period:14,onFor:7,offset:7}});
 // Solid north divider has only the two genuine timed apertures.
 b.box('gate-west-jamb',[-7.8,5,-2],[4.4,10,.4]);
 b.box('gate-centre-pier',[0,5,-2],[4.8,10,.4]);
 b.box('gate-east-jamb',[7.8,5,-2],[4.4,10,.4]);
 for(const [side,x] of [['west',-4],['east',4]] as const){
  b.box(side+'-gate-header',[x,6.5,-2],[3.2,7,.4]);
  b.device({id:side+'-shutter',kind:'shutter',label:side.toUpperCase(),position:[x,1.5,-2],size:[3.2,3,.35],target:[x,5,-2],direction:[0,0,1],circuit:{all:[side+'-clock']}});
  // Separate dark passages end at distinct real destinations; no portal bay bypasses the gate.
  b.exitCorridor(side+'-exit','pulse-floor',{minX:side==='west'?-9.98:.22,maxX:side==='west'?-.22:9.98,minZ:-11.98,maxZ:-2.22});
  w.marks.push({text:side.toUpperCase(),position:[x,3.35,-1.74],normal:[0,0,1],width:1.5,height:.25});
 }
 b.box('north-route-divider',[0,5,-7],[.4,10,10]);
 w.routePoints={'source-portal':[0,1.55,13.985],'waiting-portal':[0,1.55,2.665],'waiting-east':[4,.87,1],'waiting-west':[-4,.87,1],'east-exit':[4,.86,-9.5],'west-exit':[-4,.86,-9.5]};
 w.notes.push('DRAFT ONLY. sequences-shutter-12.png generated/displayed/inspected before this geometry. The existing original runtime projector remains authoritative; the concept tool silhouette is rejected.','Place booth-source and waiting-white at y1.55. Enter the waiting room through that linked pair. Both passages beyond the timed gates are dark, so a portal cannot skip their physical shutter.','East timer is live during phase[0,7) of14; west offset7 supplies the opposite half-cycle. Waiting is safe on either side. The engine doorway safety prevents crushing a body already inside a genuinely open aperture; it must not lift a closed gate from outside.','Default east; contrast west. A missed window simply waits for another cycle. No timing input count or remembered crossing flag gates the actual exit. Native and normal-input route checks remain pending.');
 return b.finish();
}

/** Deep sealed cargo tunnel with receiving load cells flush to the belt plane. */
function cargoBelt(b:ChamberBuilder,id:string,z:number,power:string,reverse:string,slots=false){
 b.device({id,kind:'conveyor',label:'CARGO BELT',position:[0,-.15,z],size:[17,.3,6],direction:[1,0,0],speed:3,controls:reverse,circuit:{all:[power]}});
 b.cube('cargo',[0,.55,z]);b.button('west-receiver',[-7.8,0,z]);b.button('east-receiver',[7.8,0,z]);
 for(const x of [-8.5,8.5])b.box(id+'-end-stop-'+x,[x,1.6,z],[.3,3.2,6.4]);
 b.box(id+'-roof',[0,3.3,z],[17.3,.4,6.4]);
 for(const face of [-1,1]){
  const faceZ=z+face*3.1;
  if(!slots)b.box(id+'-glass-'+face,[0,1.6,faceZ],[17.3,3.2,.16],'glass');
  else{
   // A real .8m×.8m optical hole, not transparent physics. Cargo/players cannot fit.
   b.box(id+'-glass-left-'+face,[-4.525,1.6,faceZ],[8.25,3.2,.16],'glass');
   b.box(id+'-glass-right-'+face,[4.525,1.6,faceZ],[8.25,3.2,.16],'glass');
   b.box(id+'-slit-sill-'+face,[0,.15,faceZ],[.8,.3,.16]);
   b.box(id+'-slit-header-'+face,[0,2.15,faceZ],[.8,2.1,.16]);
  }
 }
}
function returnBelt(){
 const b=new ChamberBuilder(),w=b.world;w.family='conveyor-bay';w.spawn=[7,.87,11];
 b.floor('return-floor',-11,11,-6,12);b.box('return-ceiling',[0,9.2,3],[22.8,.4,18.8]);
 b.box('return-north-wall',[0,4.5,-6.2],[22.8,9,.4]);b.box('return-south-wall',[0,4.5,12.2],[22.8,9,.4]);
 openingX(b,'west-boundary',-11.2,8,-6,12,0,9);openingX(b,'east-boundary',11.2,8,-6,12,0,9);
 cargoBelt(b,'return-belt',0,'belt-power','reverse');
 // Both E controls are inside this physically closed booth. Portal access is real.
 for(const x of [-4.2,4.2])b.box('control-booth-side-'+x,[x,4.5,6.5],[.4,9,6.4]);
 b.box('control-booth-back',[0,4.5,9.7],[8.8,9,.4]);
 b.box('control-booth-glass',[0,4.5,3.35],[8.8,9,.16],'glass');
 b.panel('booth-white','control-booth-back',[0,1.75,9.485],[0,0,-1],5,3.5);
 b.panel('source-south','return-south-wall',[7,1.75,11.985],[0,0,-1],5,3.5);
 b.device({id:'belt-power',kind:'switch',label:'BELT POWER',position:[2,1.25,5.7],size:[.4,.7,.3],controlOffset:[0,0,.2]});
 b.device({id:'reverse',kind:'switch',label:'REVERSE',position:[-2,1.3,5.85],size:[.4,.6,.25],controlOffset:[0,0,.2],controlCover:{id:'reverse-cover',blockedHint:'Stop the belt to uncover REVERSE.',openingHint:'Wait for the REVERSE cover to open.'}});
 // Real opaque service cover hides the reverse control while powered; stop first to reopen it.
 b.box('reverse-cabinet-back',[-2,1.5,5.55],[1.8,3,.2]);
 for(const x of [-2.8,-1.2])b.box('reverse-cabinet-side-'+x,[x,1.5,5.95],[.2,3,.8]);
 b.box('reverse-cabinet-sill',[-2,.5,5.95],[1.4,1,.8]);
 b.box('reverse-cabinet-header',[-2,2.5,5.95],[1.4,1,.8]);
 // Fixed waist-high stand-off keeps the player's floor capsule out of the cover's safety volume;
 // its top is below the normal eye→control ray. It is real visible cabinet construction.
 b.box('reverse-cabinet-stand-off',[-2,.5,6.85],[1.8,1,.15]);
 b.device({id:'reverse-cover',kind:'shutter',label:'STOP TO REVERSE',position:[-2,1.5,6.35],size:[1.4,1,.2],target:[-2,3.0,6.35],direction:[0,0,1],circuit:{not:['belt-power']}});
 shutterX(b,'west-door','WEST',-11.12,8,0,{all:['west-receiver']});shutterX(b,'east-door','EAST',11.12,8,0,{all:['east-receiver']});
 exitX(b,'west-exit',-11.2,8,-1,0,9);exitX(b,'east-exit',11.2,8,1,0,9);
 directionMark(b,'WEST',-10.94,8,[1,0,0]);directionMark(b,'EAST',10.94,8,[-1,0,0]);
 w.routePoints={'source-portal':[7,1.55,11.985],'booth-portal':[0,1.55,9.485],'portal-aim':[0,.87,-4.5],'power-control':[2,1.25,5.9],'reverse-control':[-2,1.3,6.05],'west-receiver':[-7.8,0,0],'east-receiver':[7.8,0,0],'west-exit':[-13.7,.86,8],'east-exit':[13.7,.86,8]};
 w.notes.push('DRAFT ONLY; sequences-belt-13.png generated/displayed/inspected before authoring. The six-metre-deep sealed tunnel, full roof and dark end stops keep central cargo beyond ordinary grab reach. The belt must physically move it.','From the north viewing aisle z=-4.5, shoot through the booth glass to booth-white; source-south is accessible outside. Enter booth through the real pair; reverse before power. Exit by the same linked pair.','The initial belt is off/east. Reverse-cover opens only when power is off, providing visible stop/reverse/start order. A wrong east delivery is recoverable: stop, reverse, restart; no earlier-error memory locks progression. Door-safety behavior at the small service cover still needs normal-input abuse/reach inspection.','Receiving load cells are flush at belt top0. The former .07m lip tilted cargo and interrupted drive before delivery; strict native diagnosis preserves that failure. Flush receiving geometry delivers both ways and keeps pressure through all240 frames of each2s hold, with unchanged conveyor tolerance. End stops hold cargo and reversal releases the old pressure. No conveyor-used or cargo-touch counter gates success.');
 return b.finish();
}

export const draftSequenceLevels:CoreLevel[]=[{
 number:12,name:'Inspection Pulse',chapter:'Timing and Sequence',mission:'Wait for the east shutter to open. Cross before it closes.',he:'חכו שהתריס המזרחי ייפתח. עברו לפני שהוא נסגר.',architecture:{height:10,halfWidth:10,style:'graphite'},expectedExit:'east-exit',blueprint:inspectionPulse,
 sources:[{url:temporal,practice:'Read before as the order between crossing and the next closure. A live periodic opaque gate creates a real open window; no past crossing counter substitutes for it.'}],
 wrongExitFeedback:'This is the west passage. Wait safely for the east shutter, then cross during its actual open window.',
 contrast:{mission:'Wait for the west shutter to open. Cross before it closes.',he:'חכו שהתריס המערבי ייפתח. עברו לפני שהוא נסגר.',physicalChange:'Choose the opposed actual west passage and its phase-shifted shutter window instead of east. Hardware and both live clocks remain identical.',expectedExit:'west-exit',wrongExitFeedback:'This is the east passage. The changed instruction asks for the west shutter window.'},
},{
 number:13,name:'Return Belt',chapter:'Timing and Sequence',mission:'Reverse the belt before you switch it on. Use the west exit after the cube arrives.',he:'הפכו את כיוון המסוע לפני שמפעילים אותו. צאו מערבה אחרי שהקובייה מגיעה.',architecture:{height:9,halfWidth:11,style:'ceramic'},expectedExit:'west-exit',blueprint:returnBelt,
 sources:[{url:temporal,practice:'Read before as the stop/reverse/start procedure and after as delivery preceding access. Real covered controls, belt velocity and maintained receiving pressure produce the consequences; corrected experiments remain recoverable.'}],
 wrongExitFeedback:'This is the east delivery. Stop the belt, reverse it and restart so the same cube reaches the west receiver.',
 contrast:{mission:'Keep the east direction. Switch the belt on. Use the east exit after the cube arrives.',he:'השאירו את הכיוון מזרחה. הפעילו את המסוע. צאו מזרחה אחרי שהקובייה מגיעה.',physicalChange:'Leave reverse off and run the same conveyor east. The cube reaches a different real receiving pad and opens the opposed exit. No cargo identity or earlier button count changes.',expectedExit:'east-exit',wrongExitFeedback:'This is the west delivery. Restore the east direction while stopped, then deliver the cube to the east receiver.'},
}];

function pressureToLight(){
 const b=new ChamberBuilder(),w=b.world;w.family='relay-garden';w.spawn=[0,.87,12];
 // A real service well under the automatic deck, with bounded catch floor.
 b.floor('plant-west-ground',-11,4,-14,14);b.floor('plant-east-ground',8,11,-14,14);
 b.floor('plant-south-ground',4,8,-2,14);b.floor('plant-north-ground',4,8,-14,-6);
 b.floor('plant-catch-floor',-11,11,-14,14,-4.4);
 b.box('plant-ceiling',[0,12.2,0],[22.8,.4,28.8]);
 b.box('plant-east-wall',[11.2,3.8,0],[.4,16.4,28.8]);
 b.box('plant-south-wall',[0,3.8,14.2],[22.8,16.4,.4]);
 openingX(b,'inspection-boundary',-11.2,-10,-14,14,0,12);
 openingZ(b,'upper-boundary',6,-14.2,-11,11,4.2,12);
 // Opaque plant spine/glazed observation partition keeps lower circuitry legible.
 b.box('plant-observation-west',[-3.3,6,1],[15.4,12,.16],'glass');
 b.box('plant-observation-east',[9.3,6,1],[3.4,12,.16],'glass');
 b.box('plant-access-header',[6,7.5,1],[3.2,9,.35]);
 b.device({id:'plant-access',kind:'shutter',label:'POWERED ACCESS',position:[6,1.5,1],size:[3.2,3,.35],target:[6,5,1],direction:[0,0,1],circuit:{all:['plant-light']}});
 b.box('plant-upper-gallery',[6.5,2.1,-10],[9,4.2,8],'floor');
 for(const x of [3.3,8.7])b.box('plant-lift-guide-'+x,[x,4.9,-4],[.3,9.8,.4]);
 b.device({id:'plant-lift',kind:'lift',automatic:true,cycle:true,label:'POWER LIFT',position:[6,-.2,-4],size:[4,.4,4],target:[6,4,-4],targetLabel:'UPPER',period:4,dwell:5,circuit:{all:['plant-light']}});
 b.button('power-button',[-3,.14,8]);b.cube('power-cube',[-6,.55,8]);
 // Physical pressure enables the emitter; an unlit configured portal pair is not a connected beam.
 b.box('plant-emitter-housing',[4.5,.9,9],[.7,1.8,.8]);
 b.box('plant-receiver-pillar',[-5,1.5,-7.6],[1.4,3,.4]);
 b.box('plant-receiver-body',[-5,.9,-8.02],[.8,.8,.4]);
 b.panel('power-source','plant-east-wall',[10.985,1.55,9],[-1,0,0],7,3.1);
 b.panel('power-return','upper-boundary-west',[-5,1.55,-13.985],[0,0,1],6,3.1);
 shutterX(b,'inspection-door','WEST INSPECTION',-11.12,-10,0,{all:['power-button'],not:['plant-light']});
 b.device({id:'upper-door',kind:'shutter',label:'UPPER',position:[6,5.7,-14.12],size:[2.8,3,.3],target:[6,9.2,-14.12],direction:[0,0,1],circuit:{all:['plant-light']}});
 exitX(b,'inspection-exit',-11.2,-10,-1,0,12);exitNorth(b,'upper-exit',6,-14.2,4.2,12);
 directionMark(b,'WEST INSPECTION',-10.94,-10,[1,0,0]);
 w.marks.push({text:'UPPER',position:[6,7.55,-13.94],normal:[0,0,1],width:1.4,height:.25},{text:'POWER',position:[-3,.2,8],normal:[0,1,0],width:1.2,height:.25});
 w.routePoints={'cube':[-6,.55,8],'power-button':[-3,.14,8],'source-portal':[10.985,1.55,9],'return-portal':[-5,1.55,-13.985],'access':[6,.87,2.5],'lift-base':[6,.87,-3.5],'upper-gallery':[6,5.06,-9],'upper-exit':[6,5.06,-16.7],'inspection-exit':[-13.7,.86,-10]};
 w.notes.push('DRAFT ONLY. Reuses inspected original pressure/cargo and laser-lift-target.png construction families; no new prop appearance is introduced. The concept circular cargo face is rejected in favour of existing diamond cargo.','Pressure at POWER physically enables emitter power. Pair power-source at y1.55,z9 with power-return at x-5,y1.55; actual beam at y.9 then reaches plant-light from the north, before its solid housing. Configuring unlit portals first is allowed: the actual energized connection still cannot occur before pressure.','Receiver power opens the real access and upper door and drives the automatic vertical carrier. Keep the cube on POWER throughout transport; removing it stops the emitter and brakes the carrier in place. No usedLift, heldCube or before-action history gate.','Same fixture contrast keeps pressure on POWER but offsets source portal z11, leaving plant-light dark and opening WEST INSPECTION. That offset pair can still deliver the player to the lower rear room. Upper white band ends3.1m, so it cannot bypass the4.2m gallery.','Normal pickup/drop, source sightlines, powered lift boarding, interruption recovery and both destinations remain unverified.');
 return b.finish();
}

function cargoClearance(){
 const b=new ChamberBuilder(),w=b.world;w.family='conveyor-bay';w.spawn=[7,.87,12.5];
 b.floor('clearance-catch',-11,11,-14,14,-4.4);
 b.floor('clearance-near-bank',-11,11,2,14);b.floor('clearance-far-bank',-11,11,-14,-8);
 b.box('clearance-ceiling',[0,10.2,0],[22.8,.4,28.8]);
 b.box('clearance-north-wall',[0,2.8,-14.2],[22.8,14.4,.4]);
 b.box('clearance-south-wall',[0,2.8,14.2],[22.8,14.4,.4]);
 openingX(b,'clearance-west-boundary',-11.2,-11,-14,14,0,10);
 openingX(b,'clearance-east-boundary',11.2,-11,-14,14,0,10);
 cargoBelt(b,'clearance-belt',7,'belt-power','reverse',true);
 b.device({id:'belt-power',kind:'switch',label:'BELT POWER',position:[7.3,1.25,12],size:[.4,.7,.3],controlOffset:[0,0,.2]});
 b.device({id:'reverse',kind:'switch',label:'REVERSE',position:[4.8,1.25,12],size:[.4,.7,.3],controlOffset:[0,0,.2]});
 // Only the near bank is portalable. Exit/dock walls stay dark, so the shuttle is a real route.
 b.panel('clearance-source','clearance-west-boundary-south',[-10.985,1.55,12],[1,0,0],3.4,3.1);
 b.panel('clearance-return','clearance-south-wall',[0,1.55,13.985],[0,0,-1],4,3.1);
 b.box('clearance-emitter-housing',[-4.5,.65,12],[.7,1.3,.8]);
 b.box('clearance-receiver-pillar',[0,1.4,2.9],[1.2,2.8,.4]);
 b.box('clearance-receiver-body',[0,.65,3.19],[.8,.8,.35]);
 // Departure needs actual delivered pressure AND a continuously clear optical path.
 b.device({id:'clearance-shuttle',kind:'lift',automatic:true,cycle:true,label:'TRANSFER',position:[4,-.2,0],size:[4,.4,4],target:[4,-.2,-6],targetLabel:'FAR DOCK',period:5,dwell:5,circuit:{all:['transfer-light'],any:['east-receiver','west-receiver']}});
 for(const x of [2.7,5.3])b.box('clearance-guide-'+x,[x,-1.9,-3],[.16,.18,14]);
 // Generous treads include the capsule landing probe. The lowest section
 // starts in the clear basement beneath the far bank and climbs only to near.
 for(let i=0;i<22;i++){const top=-4.2+i*.2;b.box('clearance-return-step-'+i,[9.5,(top-4.7)/2,-10.9+i*.6],[2.5,top+4.7,.6],'floor');}
 shutterX(b,'east-door','EAST',11.12,-11,0,{all:['east-receiver']});
 shutterX(b,'west-door','WEST',-11.12,-11,0,{all:['west-receiver']});
 exitX(b,'east-exit',11.2,-11,1,0,10);exitX(b,'west-exit',-11.2,-11,-1,0,10);
 directionMark(b,'EAST',10.94,-11,[-1,0,0]);directionMark(b,'WEST',-10.94,-11,[1,0,0]);
 w.routePoints={'source-portal':[-10.985,1.55,12],'return-portal':[0,1.55,13.985],'power-control':[7.3,1.25,12.2],'reverse-control':[4.8,1.25,12.2],'near-boarding':[4,.87,2.8],'near-deck':[4,.87,0],'far-deck':[4,.87,-6],'far-landing':[4,.87,-9],'catch-stair-low-end':[9.5,-3.535,-11.8],'east-exit':[13.7,.86,-11],'west-exit':[-13.7,.86,-11]};
 w.notes.push('DRAFT ONLY; corrected sequences-transfer-15.png generated/displayed/inspected before this geometry. Rejected first along-belt ray/circular portal mounts are preserved separately. Actual beam travels -Z through the two real low .8x.8 air slots, crossing the belt at x0. Glass is a real Rapier occluder, so no solid glass is placed across that ray.','Emitter shoots west at y.65,z12 into clearance-source centred y1.55. Linked clearance-return at x0,y1.55 sends the low ray north through cargo z7 to transfer-light at z3.43. The centred initial cube blocks it; actual conveyor movement clears it.','Receiving load cells are flush with belt top0; strict native delivery/reversal retains full2s pressure at each end. The former raised lip stalled delivery and remains recorded. Automatic shuttle can move only after one real end pad is occupied AND transfer-light stays powered. Losing either condition brakes its own cycle without teleporting. Reverse while powered removes old pressure and pauses transport until the other delivery is real.','Only near-bank surfaces are eligible. Ten-metre bank separation requires the actual moving4m deck; its guides top below-1.8 cannot be a jump-height bypass. A catch floor and real stairs return to near bank. No belt-use, after-delivery event count, ride count or cargo identity gate.','Base delivers east then crosses under maintained beam; contrast reverses west and uses the opposite real door. Wrong route remains closed/open according to actual maintained pressure, with safe automatic return/correction. Full authored-spawn beam/carrier/recovery and normal-input routes remain unverified.');
 return b.finish();
}

draftSequenceLevels.push({
 number:14,name:'Pressure to Light',chapter:'Timing and Sequence',mission:'Put the cube on POWER before you connect the beam. Keep the receiver lit while the lift moves. Use the upper exit.',he:'הניחו את הקובייה על POWER לפני שמחברים את הקרן. השאירו את המקלט מואר בזמן שהמעלית נעה. צאו מהיציאה העליונה.',architecture:{height:12,halfWidth:11,style:'graphite'},expectedExit:'upper-exit',blueprint:pressureToLight,
 optics:{emitters:[{id:'plant-emitter',position:[5,.9,9],direction:[1,0,0],range:90,circuit:{all:['power-button']}}],receivers:[{id:'plant-light',position:[-5,.9,-8.28],normal:[0,0,-1],radius:.34}]},
 sources:[{url:temporal,practice:'Read before as a genuine causal prerequisite (pressure enables the emitter) and while as maintaining real receiver power during lift motion. An already configured unlit pair is permitted; actual energized connection still follows pressure.'}],
 wrongExitFeedback:'This is west inspection. Keep POWER pressed and connect the receiver to power the upper lift route.',
 contrast:{mission:'Put the cube on POWER. Leave the receiver dark. Use west inspection.',he:'הניחו את הקובייה על POWER. השאירו את המקלט חשוך. צאו דרך הבדיקה המערבית.',physicalChange:'The same cube pressure supplies power, but an offset portal pair leaves the receiver dark. That physically opens west inspection instead of access/upper transport. All hardware, inventory and circuits remain unchanged.',expectedExit:'inspection-exit',wrongExitFeedback:'This is the upper route. Keep the receiver dark to open west inspection.'},
},{
 number:15,name:'Cargo Clearance',chapter:'Timing and Sequence',mission:'Send the cube east before you cross. Keep the beam clear while the platform moves. Use the east exit.',he:'שלחו את הקובייה מזרחה לפני שחוצים. השאירו את נתיב הקרן פנוי בזמן שהמשטח נע. צאו דרך היציאה המזרחית.',architecture:{height:10,halfWidth:11,style:'ceramic'},expectedExit:'east-exit',blueprint:cargoClearance,
 optics:{emitters:[{id:'clearance-emitter',position:[-5,.65,12],direction:[-1,0,0],range:90}],receivers:[{id:'transfer-light',position:[0,.65,3.43],normal:[0,0,1],radius:.30}]},
 sources:[{url:temporal,practice:'Read before as actual cargo arrival preceding departure: a receiving pad plus optical power enables transport. Read while as a maintained clear beam during the physical crossing. The cube blocks the ray initially and belt reversal changes a real door route.'}],
 wrongExitFeedback:'This is west delivery. Return safely, send the same cube east and restore the clear optical connection.',
 contrast:{mission:'Send the cube west before you cross. Keep the beam clear while the platform moves. Use the west exit.',he:'שלחו את הקובייה מערבה לפני שחוצים. השאירו את נתיב הקרן פנוי בזמן שהמשטח נע. צאו דרך היציאה המערבית.',physicalChange:'Reverse the actual belt, delivering the same cube to the west receiving pad. It clears the same beam and powers the same physical shuttle, but opens west instead of east. Earlier cargo touches or ride counts never substitute for present pressure/power.',expectedExit:'west-exit',wrongExitFeedback:'This is east delivery. The changed instruction needs the same cube at the west receiver.'},
});
