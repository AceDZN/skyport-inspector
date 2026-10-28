/** Authored reference batch. Targets precede each assembly; native/public proof is tracked separately. */
import type {CoreLevel} from '../level';
import {ChamberBuilder} from '../level-kit';
import {referencesEnglish} from './references-english';

function twoJobs(){
 const b=new ChamberBuilder(),w=b.world;w.family='relay-garden';w.spawn=[5,.87,11];
 b.floor('jobs-floor',-11,11,-14,14);b.box('jobs-roof',[0,11.2,0],[22.8,.4,28.8]);
 b.box('jobs-west',[-11.2,5.5,0],[.4,11,28.8]);b.box('jobs-south',[0,5.5,14.2],[22.8,11,.4]);
 // The optical bay is visible, but its full-height glazing requires a real portal visit.
 b.box('jobs-window',[-3,5.5,0],[.16,11,28],'glass');
 b.panel('jobs-source','jobs-south',[5,1.75,13.985],[0,0,-1],5,3.5);
 b.panel('jobs-return','jobs-west',[-10.985,1.75,-2],[1,0,0],6,3.5);
 b.cube('beam-cube',[-7,.55,-3]);b.cube('power-cube',[6,.69,7]);
 b.button('lift-power',[6,.14,7]);b.button('service-pressure',[6,.14,2]);
 w.pads[0].label='POWER';w.pads[1].label='SERVICE';
 b.box('jobs-emitter-housing',[-7,.8,-8.35],[.8,1.6,.6]);
 b.box('jobs-receiver-housing',[-7,.9,2.1],[.8,1.8,.5]);
 // Substantial suspended gallery and actual supporting piers, with a clear four-metre dock.
 b.floor('jobs-upper-gallery',-1,11,-14,-8,4.2);
 for(const x of [-.7,10.7])b.box('jobs-gallery-pier-'+x,[x,1.8,-10],[.45,3.6,.8]);
 for(const x of [1.4,10])b.box('jobs-front-rail-'+x,[x,4.75,-8.05],[3.2,1.1,.15]);
 b.device({id:'job-lift',kind:'lift',automatic:true,cycle:true,label:'UPPER GALLERY',position:[6,-.2,-6],size:[4,.4,4],target:[6,4,-6],period:3,dwell:6,circuit:{all:['job-light','lift-power']},controlOffset:[1.3,.9,1.3],controlFacing:[-1,0,0]});
 // Complete north enclosure around the actual upper opening.
 b.box('upper-north-west',[-3.2,5.5,-14.2],[15.6,11,.4]);
 b.box('upper-north-east',[9.2,5.5,-14.2],[3.6,11,.4]);
 b.box('upper-sill',[6,2.1,-14.2],[2.8,4.2,.4]);b.box('upper-header',[6,9.1,-14.2],[2.8,3.8,.4]);
 b.device({id:'jobs-upper-door',kind:'shutter',label:'UPPER',position:[6,5.7,-14.12],size:[2.8,3,.3],target:[6,9.2,-14.12],direction:[0,0,1],circuit:{all:['job-light','lift-power']}});
 b.floor('jobs-upper-vestibule',4.6,7.4,-18,-13.8,4.2);
 b.box('jobs-upper-vestibule-roof',[6,11.2,-16],[3.6,.4,4.8]);
 for(const x of [4.4,7.6])b.box('jobs-upper-vestibule-side-'+x,[x,7.6,-16],[.4,6.8,4.8]);
 b.box('jobs-upper-end',[6,7.6,-18.2],[3.6,6.8,.4]);
 b.exitCorridor('upper-exit','jobs-upper-vestibule',{minX:4.62,maxX:7.38,minZ:-17.98,maxZ:-14.6});
 // A different actual supply opens the ground-level side passage.
 b.box('jobs-east-north',[11.2,5.5,-10.2],[.4,11,7.6]);b.box('jobs-east-south',[11.2,5.5,5.2],[.4,11,17.6]);
 b.box('jobs-lower-header',[11.2,7,-5],[.4,8,2.8]);
 b.device({id:'jobs-lower-door',kind:'shutter',label:'LOWER SERVICE',position:[11.12,1.5,-5],size:[.3,3,2.8],target:[11.12,5,-5],direction:[-1,0,0],circuit:{all:['service-pressure'],not:['job-light','lift-power']}});
 b.floor('jobs-lower-vestibule',10.8,15.2,-6.4,-3.6);
 b.box('jobs-lower-roof',[13,11.2,-5],[4.8,.4,3.6]);
 for(const z of [-6.6,-3.4])b.box('jobs-lower-side-'+z,[13,5.5,z],[4.8,11,.4]);
 b.box('jobs-lower-end',[15.4,5.5,-5],[.4,11,3.6]);
 b.exitCorridor('lower-exit','jobs-lower-vestibule',{minX:11.6,maxX:15.18,minZ:-6.38,maxZ:-3.62});
 w.marks.push({text:'POWER',position:[10.94,1.3,7],normal:[-1,0,0],width:1.4,height:.25},{text:'SERVICE',position:[10.94,1.3,2],normal:[-1,0,0],width:1.4,height:.25},{text:'UPPER GALLERY',position:[6,7.55,-13.94],normal:[0,0,1],width:2,height:.25});
 w.routePoints={'source-portal':[5,1.55,13.985],'return-portal':[-10.985,1.55,-2],'power-approach':[8,.865,7],'service-approach':[8,.865,2],'lift-wait':[6,.865,-3],'lift-board':[6,.865,-6],'upper-gallery':[6,5.065,-10],'upper-exit':[6,5.065,-16.5],'lower-exit':[14,.865,-5]};
 w.notes.push('Original chamber-21-target.png and its inspection/prompts were independently read/viewed before this explicit fixture. Accepted two visible live cube jobs, enclosed gallery/lift/side passage and ribbed/ivory kit. Raster perspective and rail geometry are not metric proof.','The original blocker is inside a full-height glazed bay, reached through the actual two wall portals. Its always-on low beam really terminates on cargo. Taking it out clears a real receiver; either physical cube can maintain any pad.','Upper lift/door require current receiver light AND POWER pressure. LOWER SERVICE requires current SERVICE pressure AND receiver dark AND POWER unpressed. The same three conditions/hardware/cargo exist under both instructions. No cargo ID, first-moved, untouched-body, ride or previous-error condition gates either exit.','Native floor0 catches an upper miss and permits a real lift return; no decorative safety rail crosses the dock. White hosts are confined below3.5m and cannot replace the4.2m gallery ascent. Native input-only paths/contrasts/swaps/recoveries and ordinary-input visual/audio proof remain pending.');
 w.notes.push('Status: all21–25 authored-spawn native alternatives, wrong-route repairs and specified cargo/catch equivalents now pass; see docs/chamber-qa/references-five-journal-current.txt. Actual mouse/keyboard, visual/audio and earned campaign continuation remain pending.');
 return b.finish();
}
function followSupply(){
 const b=new ChamberBuilder(),w=b.world;w.family='bridge-rotunda';w.spawn=[0,.87,11];const bottom=-4.4,top=11;
 b.floor('supply-catch',-11,11,-14,14,bottom);b.floor('supply-west-floor',-11,-.2,-14,14);b.floor('supply-near-bank',-.2,11,4,14);b.floor('supply-far-bank',.2,11,-14,-10);
 for(const x of [-11.2,11.2])b.box('supply-side-'+x,[x,(top+bottom)/2,0],[.4,top-bottom,28.8]);
 b.box('supply-south',[0,(top+bottom)/2,14.2],[22.8,top-bottom,.4]);b.box('supply-roof',[0,top+.2,0],[22.8,.4,28.8]);
 // The partition reaches the actual far wall: a low-bank jump cannot exchange transport bays.
 b.box('supply-divider',[0,(top+bottom)/2,-5],[.16,top-bottom,18],'glass');
 b.floor('receiver-upper-gallery',-11,-.2,-14,-8,4.2);
 for(const x of [-10.7,-.7])b.box('receiver-gallery-pier-'+x,[x,1.8,-10],[.4,3.6,.8]);
 for(const [x,width]of [[-9.75,2.5],[-2,3.6]])b.box('receiver-front-rail-'+x,[x,4.75,-8.05],[width,1.1,.15]);
 b.device({id:'receiver-lift',kind:'lift',automatic:true,cycle:true,label:'WINDOW SUPPLY',position:[-6,-.2,-6],size:[4,.4,4],target:[-6,4,-6],period:3,dwell:6,circuit:{all:['window-light']},controlOffset:[1.3,.9,1.3],controlFacing:[-1,0,0]});
 b.device({id:'button-carrier',kind:'moving-platform',automatic:true,label:'FLOOR SUPPLY',position:[6,-.2,2],size:[4,.4,4],target:[6,-.2,-8],period:5,dwell:6,stops:[{label:'NEAR',position:[6,-.2,2]},{label:'FAR',position:[6,-.2,-8]}],circuit:{all:['floor-supply']}});
 for(const x of [4.5,7.5])b.box('button-carrier-guide-'+x,[x,-2.25,-3],[.15,.3,10]);
 // Every riser is physical; no guide rail is a substitute bridge to the far bank.
 for(let i=0;i<22;i++){const y=bottom+(i+1)*.2;b.box('supply-return-step-'+i,[9.5,y-.15,-8.9+i*.6],[2.5,.3,.6],'floor');}
 b.cube('supply-cube',[0,.55,10]);b.button('floor-supply',[6,.14,6]);w.pads[0].label='FLOOR BUTTON';
 b.box('supply-emitter-housing',[7,.8,8.65],[.8,1.6,.6]);
 b.box('window-receiver-housing',[-6,.9,-8.45],[.8,1.8,.5]);b.box('receiver-window',[-6,1.2,-8.1],[1.6,2.4,.12],'glass');
 // North carpentry contains two independent real openings at different elevations.
 for(const [id,a,c]of [['west',-11,-7.4],['middle',-4.6,4.6],['east',7.4,11]]as const)b.box('supply-north-'+id,[(a+c)/2,(top+bottom)/2,-14.2],[c-a,top-bottom,.4]);
 for(const [id,x,y,circuit]of [['receiver',-6,4.2,{all:['window-light']}],['pressure',6,0,{all:['floor-supply','at:button-carrier:FAR']}]]as const){
  b.box(id+'-sill',[x,(y+bottom)/2,-14.2],[2.8,y-bottom,.4]);b.box(id+'-header',[x,(y+3+top)/2,-14.2],[2.8,top-y-3,.4]);
  b.device({id:id+'-door',kind:'shutter',label:id==='receiver'?'UPPER BAY':'LOWER BAY',position:[x,y+1.5,-14.12],size:[2.8,3,.3],target:[x,y+5,-14.12],direction:[0,0,1],circuit:{all:[...circuit.all]}});
  b.floor(id+'-vestibule',x-1.4,x+1.4,-18,-13.8,y);b.box(id+'-vestibule-roof',[x,top+.2,-16],[3.6,.4,4.8]);
  for(const s of [-1,1])b.box(id+'-vestibule-side-'+s,[x+s*1.6,(y+top)/2,-16],[.4,top-y,4.8]);b.box(id+'-vestibule-end',[x,(y+top)/2,-18.2],[3.6,top-y,.4]);
  b.exitCorridor(id+'-exit',id+'-vestibule',{minX:x-1.38,maxX:x+1.38,minZ:-17.98,maxZ:-14.6});
 }
 b.panel('supply-source','supply-south',[7,1.75,13.985],[0,0,-1],5,3.5);b.panel('supply-return','receiver-sill',[-6,1.75,-13.985],[0,0,1],2.8,3.5);
 w.marks.push({text:'WINDOW RECEIVER',position:[-6,2.8,-8.02],normal:[0,0,1],width:2,height:.25},{text:'FLOOR BUTTON',position:[10.94,1.3,6],normal:[-1,0,0],width:1.8,height:.25});
 w.routePoints={'source-portal':[7,1.55,13.985],'return-portal':[-6,1.55,-13.985],'receiver-lift-wait':[-6,.865,-3],'receiver-lift-board':[-6,.865,-6],'button-release':[8,.865,6],'carrier-wait':[6,.865,4.6],'carrier-board':[6,.865,2],'receiver-exit':[-6,5.065,-16.5],'pressure-exit':[6,.865,-16.5],'catch-stair-approach':[9.5,bottom+.865,-9.8]};
 w.notes.push('chamber-22-target.png and inspection/prompts independently viewed before this fixture. Accepted separate receiver/lift and floor-button/carrier links, distinct high/low bays and original material kit; reject depicted rail/continuous-guide shortcuts and metric perspective.','Window optical power runs a real4.2m vertical lift; independent floor pressure runs a real10m horizontal carrier. The white return remains below the upper floor; no eligible far host bypasses the physical carrier. The full-height divider seals the transport lanes, with common access only at the near bank.','Receiving the low beam and pressing the floor button are independent conditions. Both supplies may coexist. Actual stopped FAR contact and floor pressure open the low door; no selected-stop, ride count, original-cargo identity or grammar flag replaces physical arrival.','A dry−4.4m catch and22 full.6m-deep/.2m-rise treads return to the near bank. Both ordinary-input route alternatives, supply interruption, wrong-bay return and actual catch walk need native/browser verification.');
 w.notes.push('Status: all21–25 authored-spawn native alternatives, wrong-route repairs and specified cargo/catch equivalents now pass; see docs/chamber-qa/references-five-journal-current.txt. Actual mouse/keyboard, visual/audio and earned campaign continuation remain pending.');
 return b.finish();
}
function screenAndDoor(){
 const b=new ChamberBuilder(),w=b.world;w.family='relay-garden';w.spawn=[-7,.87,11];const top=11;
 b.floor('screen-floor',-11,11,-14,14);b.box('screen-roof',[0,top+.2,0],[22.8,.4,28.8]);
 b.box('screen-east',[11.2,top/2,0],[.4,top,28.8]);b.box('screen-south',[0,top/2,14.2],[22.8,top,.4]);b.box('screen-north',[0,top/2,-14.2],[22.8,top,.4]);
 // Distinct physical input screen and output shutter. Beam strikes the broad leaf before the white turn.
 b.device({id:'input-screen',kind:'shutter',label:'INPUT SCREEN',position:[-4,1.5,0],size:[.3,3,2.8],target:[-4,5,0],direction:[-1,0,0],circuit:{all:['screen-pressure']}});
 for(const z of [-1.65,1.65])b.box('screen-guide-'+z,[-4,3,z],[.55,6,.35]);
 b.box('screen-header',[-4,6.2,0],[.65,.4,3.65]);
 b.box('turn-pier',[-.8,1.75,0],[.4,3.5,5]);
 b.panel('screen-source','turn-pier',[-1.015,1.75,0],[-1,0,0],5,3.5);
 b.panel('screen-return','screen-north',[-6,1.75,-13.985],[0,0,1],4,3.5);
 b.box('screen-emitter-housing',[-9.35,.9,0],[.6,1.8,.8]);
 b.box('screen-receiver-housing',[-6,.9,-8.15],[.8,1.8,.5]);
 b.cube('screen-cube',[5,.55,10]);b.button('screen-pressure',[5,.14,6]);w.pads[0].label='INPUT';
 for(const [id,a,c]of [['south',4.4,14],['middle',-9.6,1.6],['north',-14,-12.4]]as const)b.box('screen-west-'+id,[-11.2,top/2,(a+c)/2],[.4,top,c-a]);
 for(const [id,z,gate,label]of [['output',-11,{all:['screen-light']},'RECEIVER OUTPUT'],['service',3,{all:['closed:input-screen'],not:['screen-light']},'SERVICE']]as const){
  b.box(id+'-west-header',[-11.2,7,z],[.4,8,2.8]);
  b.device({id:id+'-leaf',kind:'shutter',label,position:[-11.12,1.5,z],size:[.3,3,2.8],target:[-11.12,5,z],direction:[1,0,0],circuit:{all:[...gate.all],not:'not' in gate?[...gate.not]:undefined}});
  b.floor(id+'-vestibule',-15.2,-10.8,z-1.4,z+1.4);b.box(id+'-roof',[-13,top+.2,z],[4.8,.4,3.6]);
  for(const side of [-1,1])b.box(id+'-side-'+side,[-13,top/2,z+side*1.6],[4.8,top,.4]);
  b.box(id+'-end',[-15.4,top/2,z],[.4,top,3.6]);
  b.exitCorridor(id+'-exit',id+'-vestibule',{minX:-15.18,maxX:-11.6,minZ:z-1.38,maxZ:z+1.38});
 }
 w.marks.push({text:'INPUT',position:[-4.36,3.45,0],normal:[-1,0,0],width:1.8,height:.25},{text:'RECEIVER OUTPUT',position:[-10.94,3.5,-11],normal:[1,0,0],width:2.5,height:.25},{text:'SERVICE',position:[-10.94,3.5,3],normal:[1,0,0],width:1.6,height:.25});
 w.routePoints={'screen-source':[-1.015,1.55,0],'screen-return':[-6,1.55,-13.985],'portal-aim':[-9.5,.865,8],'pressure-approach':[7,.865,6],'output-approach':[-9.5,.865,-11],'output-exit':[-14,.865,-11],'service-exit':[-14,.865,3]};
 w.notes.push('Original chamber-23-target.png, corrected ray-on-leaf image, prompts and inspection viewed before fixture authorship. Accepted separate input screen, receiver-controlled output and beside-screen SERVICE. Target perspective/rail bounds are not metric evidence. Explicit fixture places emitter west of the broad input leaf; its ray must actually hit that leaf before the white turn.',
 'INPUT pressure physically raises the screen; a wall-to-wall portal turn sends the unblocked beam to a separate receiver. Only current receiver light opens OUTPUT. SERVICE requires the input screen actually seated closed, plus a dark receiver; command state alone cannot open this bypass.',
 'Both clauses share every body, portal host, control and circuit. The receiver-controlled output has no manual E interaction. Real current native leaf state, never a selected word or action-history flag, controls the alternate physical route. Flat catch floor keeps cargo and corrections reachable. Native routes and frozen ordinary-input visual/audio proof pending.');
 w.notes.push('Status: all21–25 authored-spawn native alternatives, wrong-route repairs and specified cargo/catch equivalents now pass; see docs/chamber-qa/references-five-journal-current.txt. Actual mouse/keyboard, visual/audio and earned campaign continuation remain pending.');
 return b.finish();
}
function twoOpenings(){
 const b=new ChamberBuilder(),w=b.world;w.family='dual-vault';w.spawn=[0,.87,11];const top=11;
 b.floor('openings-floor',-11,11,-14,14);b.box('openings-roof',[0,top+.2,0],[22.8,.4,28.8]);
 for(const x of [-11.2,11.2])b.box('openings-side-'+x,[x,top/2,0],[.4,top,28.8]);b.box('openings-south',[0,top/2,14.2],[22.8,top,.4]);
 b.box('control-glass',[0,top/2,7.9],[22,top,.16],'glass');
 b.box('waiting-host',[0,1.75,4.45],[5,3.5,.4]);b.box('opening-pier',[0,top/2,-3],[3,top,14]);
 b.panel('opening-source','openings-south',[.55,1.75,13.985],[0,0,-1],5,3.5);b.panel('opening-return','waiting-host',[.55,1.75,4.665],[0,0,1],5,3.5);
 b.cube('timer-cube',[-5,.69,11]);b.button('timer-pressure',[-5,.14,11]);w.pads[0].label='TIMER POWER';
 b.device({id:'opening-clock',kind:'timer',automatic:true,label:'TIMER',position:[-3.5,1.2,11],size:[.45,.6,.4],pulse:{period:12,onFor:6},circuit:{all:['timer-pressure']},controlFacing:[0,0,1]});
 b.box('manual-post',[6,.6,10.95],[.3,1.2,.3]);b.device({id:'opening-manual',kind:'switch',label:'MANUAL',position:[6,1.3,10.7],size:[.4,.7,.3],controlOffset:[0,0,.2],controlFacing:[0,0,1]});
 for(const [id,a,c]of [['west',-11,-6.4],['middle',-3.6,3.6],['east',6.4,11]]as const)b.box('openings-front-'+id,[(a+c)/2,top/2,-10.2],[c-a,top,.4]);
 for(const [id,x,circuit]of [['timed',-5,{all:['timer-pressure','opening-clock'],not:['opening-manual']}],['manual',5,{all:['opening-manual'],not:['timer-pressure']}]]as const){
  b.box(id+'-front-header',[x,7,-10.2],[2.8,8,.4]);
  b.device({id:id+'-opening',kind:'shutter',label:id==='timed'?'TIMER PASSAGE':'MANUAL PASSAGE',position:[x,1.5,-10.12],size:[2.8,3,.3],target:[x,5,-10.12],direction:[0,0,1],circuit:{all:[...circuit.all],not:[...circuit.not]}});
  b.floor(id+'-return-floor',x-1.4,x+1.4,-14,-9.8);
  for(const side of [-1,1])b.box(id+'-return-side-'+side,[x+side*1.6,top/2,-12],[.4,top,4.8]);b.box(id+'-return-end',[x,top/2,-14.2],[3.6,top,.4]);
  b.exitCorridor(id+'-exit',id+'-return-floor',{minX:x-1.38,maxX:x+1.38,minZ:-13.98,maxZ:-10.6});
  w.marks.push({text:id==='timed'?'TIMER':'MANUAL',position:[x,3.55,-9.94],normal:[0,0,1],width:1.6,height:.25});
 }
 w.routePoints={'source-portal':[.55,1.55,13.985],'return-portal':[.55,1.55,4.665],'manual-control':[6,1.3,10.9],'manual-approach':[6,.865,12.4],'timer-pickup':[-7,.865,11],'timer-wait':[-5,.865,-8.5],'manual-wait':[5,.865,-8.5],'timed-exit':[-5,.865,-12.5],'manual-exit':[5,.865,-12.5]};
 w.notes.push('Original chamber-24-target.png, corrected controls/host scope and target inspection viewed before fixture authorship. Accepted timer-powered cube, separate manual leaf, opaque central pier and common portal waiting vestibule. Raster numbers, railing and far white extent are rejected as metric/portal evidence.',
 'A12s timer with6s powered ON windows runs only from the real TIMER POWER pad. The timed passage also requires MANUAL off. The independent manual passage requires MANUAL on and TIMER POWER absent. Both leaves/circuits are always present; a selected task never rewires them. A missed window can wait safely for the next cycle.',
 'A full-height glazed booth holds supply/switch controls; the familiar aimed pair reaches the common north vestibule. Far return corridors have no white hosts. Ground floors and the reversible walking pair preserve corrections without reset. Optional relative-that omission changes no geometry or acceptance. Native route/collision/window tests and actual browser review pending.');
 w.notes.push('Status: all21–25 authored-spawn native alternatives, wrong-route repairs and specified cargo/catch equivalents now pass; see docs/chamber-qa/references-five-journal-current.txt. Actual mouse/keyboard, visual/audio and earned campaign continuation remain pending.');
 return b.finish();
}
function freightReturn(){
 const b=new ChamberBuilder(),w=b.world;w.family='return-loop';w.spawn=[6,.87,13];const bottom=-4.4,top=12;
 b.floor('freight-catch',-13,13,-16,16,bottom);b.floor('freight-near-bank',-13,0,4,16);b.floor('freight-far-bank',-13,0,-16,-10);b.floor('freight-east-floor',0,13,-16,16);
 b.box('freight-west',[-13.2,(top+bottom)/2,0],[.4,top-bottom,32.8]);b.box('freight-south',[0,(top+bottom)/2,16.2],[26.8,top-bottom,.4]);b.box('freight-roof',[0,top+.2,0],[26.8,.4,32.8]);
 b.box('freight-divider',[0,(top+bottom)/2,-6],[.16,top-bottom,20],'glass');
 // The actual loading hatch spans the west entrance; its maintained supply remains on the near side.
 for(const [id,a,c]of [['west',-13,-7.4],['east',-4.6,0]]as const)b.box('hatch-front-'+id,[(a+c)/2,top/2,6],[c-a,top,.4]);
 b.box('hatch-header',[-6,7.5,6],[2.8,9,.4]);b.device({id:'freight-hatch',kind:'shutter',label:'FREIGHT HATCH',position:[-6,1.5,6],size:[2.8,3,.3],target:[-6,5,6],direction:[0,0,1],circuit:{all:['hatch-pressure']}});
 b.cube('hatch-cube',[-6,.69,10]);b.button('hatch-pressure',[-6,.14,10]);b.button('balcony-pressure',[7,.14,4]);b.button('freight-service',[7,.14,10]);
 w.pads[0].label='HATCH';w.pads[1].label='LIFT';w.pads[2].label='SERVICE';
 b.device({id:'freight-carrier',kind:'moving-platform',automatic:true,label:'CARGO CARRIER',position:[-6,-.2,2],size:[4,.4,4],target:[-6,-.2,-8],period:5,dwell:10,stops:[{label:'LOADING',position:[-6,-.2,2]},{label:'RETURN',position:[-6,-.2,-8]}]});
 b.cube('travelling-cube',[-6,.55,2]);
 for(const x of [-7.5,-4.5])b.box('freight-low-guide-'+x,[x,-2.25,-3],[.15,.3,10]);
 for(let i=0;i<22;i++){const y=bottom+(i+1)*.2;b.box('freight-return-step-'+i,[-10.8,y-.15,-8.9+i*.6],[2.5,.3,.6],'floor');}
 b.floor('freight-balcony',.2,13,-16,-10,4.2);
 for(const x of [.5,12.7])b.box('freight-balcony-pier-'+x,[x,1.8,-13],[.4,3.6,.8]);
 for(const [x,width]of [[2.6,4.8],[11,4]])b.box('freight-balcony-rail-'+x,[x,4.75,-10.05],[width,1.1,.15]);
 b.device({id:'balcony-lift',kind:'lift',automatic:true,cycle:true,label:'BALCONY',position:[7,-.2,-8],size:[4,.4,4],target:[7,4,-8],period:3,dwell:6,circuit:{all:['hatch-pressure','balcony-pressure']},controlOffset:[1.3,.9,1.3],controlFacing:[-1,0,0]});
 // Ground-level return host faces the real retrieval bank, never the upper balcony.
 b.box('freight-north-west',[-3.7,(top+bottom)/2,-16.2],[18.6,top-bottom,.4]);b.box('freight-north-east',[10.7,(top+bottom)/2,-16.2],[4.6,top-bottom,.4]);
 b.box('freight-upper-sill',[7,(bottom+4.2)/2,-16.2],[2.8,4.2-bottom,.4]);b.box('freight-upper-header',[7,(7.2+top)/2,-16.2],[2.8,top-7.2,.4]);
 b.device({id:'balcony-leaf',kind:'shutter',label:'BALCONY RETURN',position:[7,5.7,-16.12],size:[2.8,3,.3],target:[7,9.2,-16.12],direction:[0,0,1],circuit:{all:['hatch-pressure','balcony-pressure']}});
 b.floor('balcony-vestibule',5.6,8.4,-20,-15.8,4.2);b.box('balcony-vest-roof',[7,top+.2,-18],[3.6,.4,4.8]);
 for(const x of [5.4,8.6])b.box('balcony-vest-side-'+x,[x,8.1,-18],[.4,7.8,4.8]);b.box('balcony-vest-end',[7,8.1,-20.2],[3.6,7.8,.4]);
 b.exitCorridor('balcony-exit','balcony-vestibule',{minX:5.62,maxX:8.38,minZ:-19.98,maxZ:-16.6});
 // Full east wall around a real lower return. Extra LIFT pressure is harmless.
 b.box('freight-east-north',[13.2,(top+bottom)/2,-5.2],[.4,top-bottom,21.6]);b.box('freight-east-south',[13.2,(top+bottom)/2,12.2],[.4,top-bottom,7.6]);b.box('freight-service-header',[13.2,7.5,7],[.4,9,2.8]);
 b.device({id:'freight-service-leaf',kind:'shutter',label:'LOWER RETURN',position:[13.12,1.5,7],size:[.3,3,2.8],target:[13.12,5,7],direction:[-1,0,0],circuit:{all:['freight-service'],not:['hatch-pressure']}});
 b.floor('freight-service-vest',12.8,17.2,5.6,8.4);b.box('freight-service-roof',[15,top+.2,7],[4.8,.4,3.6]);
 for(const z of [5.4,8.6])b.box('freight-service-side-'+z,[15,top/2,z],[4.8,top,.4]);b.box('freight-service-end',[17.4,top/2,7],[.4,top,3.6]);
 b.exitCorridor('service-exit','freight-service-vest',{minX:13.6,maxX:17.18,minZ:5.62,maxZ:8.38});
 b.panel('freight-source','freight-south',[6,1.75,15.985],[0,0,-1],5,3.5);b.panel('freight-return','freight-north-west',[-6,1.75,-15.985],[0,0,1],5,3.5);
 w.routePoints={'source-portal':[6,1.55,15.985],'return-portal':[-6,1.55,-15.985],'retrieval-wait':[-8.5,.865,-12],'retrieval-edge':[-6,.865,-10.8],'hatch-pickup':[-8,.865,10],'lift-release':[9,.865,4],'service-release':[9,.865,10],'balcony-lift-wait':[7,.865,-5],'balcony-lift-board':[7,.865,-8],'balcony-exit':[7,5.065,-18.5],'service-exit':[16,.865,7],'catch-stair-low':[-10.8,bottom+.865,-9.8]};
 w.notes.push('Original chamber-25-target.png with corrected HATCH/LIFT/SERVICE allocations, prompts and inspection viewed before this explicit freight assembly. Accepted live hatch cargo, actual loose-cargo carrier in enclosed well and distinct balcony lift/lower return. Guide rails stay2.1m below walking level; no raster bridge or illustrated scale supplies collision proof.',
 'The actual4m carrier transports loose cargo10m between independent ground docks. A walking portal pair reaches the far retrieval bank and returns held cargo. Native travelling support and both full cube/capsule aperture fits require measured routes. A player who retrieves during an available near dwell is an equivalent physical solution; no transported-once or original-cargo identity flag gates the balcony.',
 'Balcony lift and leaf require maintained HATCH and LIFT pressure. Lower return requires SERVICE and HATCH empty. Both cubes are interchangeable ordinary12kg bodies; swaps preserving current conditions remain valid. The4.2m balcony is beyond the ground white band. A−4.4m catch and22 full.6/.2 treads return a miss to the loading bank without reset. Native and ordinary-input visual/audio proof pending.');
 w.notes.push('Status: all21–25 authored-spawn native alternatives, wrong-route repairs and specified cargo/catch equivalents now pass; see docs/chamber-qa/references-five-journal-current.txt. Actual mouse/keyboard, visual/audio and earned campaign continuation remain pending.');
 return b.finish();
}
export const draftReferenceLevels:CoreLevel[]=[{
 number:21,...referencesEnglish[21],architecture:{height:11,halfWidth:11,style:'graphite'},startYaw:.2,expectedExit:'upper-exit',blueprint:twoJobs,
 optics:{emitters:[{id:'job-emitter',position:[-7,.65,-8],direction:[0,0,1],range:40}],receivers:[{id:'job-light',position:[-7,.65,1.8],normal:[0,0,-1],radius:.32}]},
 wrongExitFeedback:'This lower passage needs the beam blocked and POWER empty. Clear the cube that blocks the beam and keep the lift supplied to reach the upper gallery.',
 contrast:{...referencesEnglish[21].contrast!,expectedExit:'lower-exit',wrongExitFeedback:'The upper gallery needs light and POWER. The changed instruction keeps the beam blocked and moves pressure to SERVICE.'},
},{number:22,...referencesEnglish[22],architecture:{height:11,halfWidth:11,style:'graphite'},expectedExit:'receiver-exit',blueprint:followSupply,
 optics:{emitters:[{id:'supply-emitter',position:[7,.65,9],direction:[0,0,1],range:55}],receivers:[{id:'window-light',position:[-6,.65,-8.75],normal:[0,0,-1],radius:.32}]},
 wrongExitFeedback:'This lower platform is supplied by the floor button. The instruction identifies the platform supplied by the window receiver.',contrast:{...referencesEnglish[22].contrast!,expectedExit:'pressure-exit',wrongExitFeedback:'This upper platform is supplied by the receiver. The changed instruction identifies the floor button’s platform.'},
},{number:23,...referencesEnglish[23],architecture:{height:11,halfWidth:11,style:'graphite'},expectedExit:'output-exit',blueprint:screenAndDoor,
 optics:{emitters:[{id:'screen-emitter',position:[-9,.9,0],direction:[1,0,0],range:55}],receivers:[{id:'screen-light',position:[-6,.9,-8.5],normal:[0,0,-1],radius:.32}]},
 wrongExitFeedback:'SERVICE is beside the input screen. The receiver controls the separate OUTPUT passage behind it.',contrast:{...referencesEnglish[23].contrast!,expectedExit:'service-exit',wrongExitFeedback:'OUTPUT is controlled by the receiver. Close the screen that blocks the beam and take SERVICE beside it.'},
},{number:24,...referencesEnglish[24],architecture:{height:11,halfWidth:11,style:'graphite'},expectedExit:'timed-exit',blueprint:twoOpenings,
 wrongExitFeedback:'This passage is opened by MANUAL. Restore TIMER POWER, leave MANUAL off and wait for the timer passage.',contrast:{...referencesEnglish[24].contrast!,expectedExit:'manual-exit',wrongExitFeedback:'The timer opens this passage. The changed instruction requires MANUAL on and TIMER POWER empty.'},
},{number:25,...referencesEnglish[25],architecture:{height:12,halfWidth:13,style:'graphite'},expectedExit:'balcony-exit',blueprint:freightReturn,
 wrongExitFeedback:'The lower return uses SERVICE with HATCH empty. Bring the carrier’s cargo to LIFT and keep HATCH pressed for the balcony.',contrast:{...referencesEnglish[25].contrast!,expectedExit:'service-exit',wrongExitFeedback:'This balcony needs both pressure supplies. The changed instruction moves hatch pressure to SERVICE for the lower return.'},
}];
