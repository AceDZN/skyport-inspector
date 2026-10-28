/** Event/current-state fixtures. Unregistered; journal producer/readout remains lead-owned. */
import type {CoreLevel} from '../level';
import {ChamberBuilder} from '../level-kit';
import type {Circuit,XYZ} from '../../systems';
import {eventsEnglish} from './events-english';

function labelledPad(b:ChamberBuilder,id:string,x:number,z:number,label:string,y=.14){b.button(id,[x,y,z]);b.world.pads.at(-1)!.label=label;}
function northGateExit(b:ChamberBuilder,id:string,x:number,z:number,left:number,right:number,y:number,top:number,circuit:Circuit){
 b.box(id+'-west-jamb',[(left+x-1.6)/2,top/2,z],[x-1.6-left,top,.4]);
 b.box(id+'-east-jamb',[(x+1.6+right)/2,top/2,z],[right-x-1.6,top,.4]);
 b.box(id+'-header',[x,(y+3+top)/2,z],[3.2,top-y-3,.4]);
 if(y>0)b.box(id+'-sill',[x,y/2,z],[3.2,y,.4]);
 b.device({id:id+'-exit-leaf',kind:'shutter',label:id.toUpperCase(),position:[x,y+1.5,z+.08],size:[3.2,3,.3],target:[x,y+5,z+.08],direction:[0,0,1],circuit});
 b.floor(id+'-vestibule',x-1.6,x+1.6,z-4,z+.4,y);
 for(const side of [-1,1])b.box(id+'-vestibule-side-'+side,[x+side*1.8,y+1.5,z-1.8],[.4,3,4.8]);
 b.box(id+'-vestibule-roof',[x,y+3.2,z-1.8],[4,.4,4.8]);b.box(id+'-vestibule-end',[x,y+1.5,z-4.2],[4,3,.4]);
 b.exitCorridor(id+'-exit',id+'-vestibule',{minX:x-1.58,maxX:x+1.58,minZ:z-3.98,maxZ:z-.4});
}
/** A real side opening and enclosed vestibule. No mission-dependent carpentry. */
function sideGateExit(b:ChamberBuilder,id:string,x:number,z:number,z1:number,z2:number,y:number,top:number,circuit:Circuit,outward:1|-1,height=3,target?:XYZ){
 b.box(id+'-north-jamb',[x,top/2,(z1+z-1.6)/2],[.4,top,z-1.6-z1]);
 b.box(id+'-south-jamb',[x,top/2,(z+1.6+z2)/2],[.4,top,z2-z-1.6]);
 b.box(id+'-header',[x,(y+height+top)/2,z],[.4,top-y-height,3.2]);
 if(y>0)b.box(id+'-sill',[x,y/2,z],[.4,y,3.2]);
 b.device({id:id+'-door',kind:'shutter',label:id.toUpperCase(),position:[x-outward*.08,y+height/2,z],size:[.3,height,3.2],target:target??[x-outward*.08,y+height/2+height+.5,z],direction:[-outward,0,0],circuit});
 const start=x-outward*.4,end=x+outward*4,mid=x+outward*1.8;
 b.floor(id+'-vestibule',Math.min(start,end),Math.max(start,end),z-1.6,z+1.6,y);
 b.box(id+'-roof',[mid,y+height+.2,z],[4.8,.4,4]);
 for(const side of [-1,1])b.box(id+'-side-'+side,[mid,y+height/2,z+side*1.8],[4.8,height,.4]);
 b.box(id+'-end',[x+outward*4.2,y+height/2,z],[.4,height,4]);
 b.exitCorridor(id+'-exit',id+'-vestibule',{minX:Math.min(x+outward*.4,end)+.02,maxX:Math.max(x+outward*.4,end)-.02,minZ:z-1.58,maxZ:z+1.58});
}
/** Existing covered-cabinet construction; actual stand-off prevents cover safety abuse. */
function manualCabinet(b:ChamberBuilder){
 b.box('manual-cabinet-back',[6,1.6,7.65],[3.6,3.2,.2]);
 for(const x of [4.3,7.7])b.box('manual-cabinet-side-'+x,[x,1.6,8.1],[.2,3.2,1]);
 b.box('manual-cabinet-sill',[6,.5,8.1],[3.2,1,1]);b.box('manual-cabinet-header',[6,2.7,8.1],[3.2,1,1]);
 b.device({id:'manual-cover',kind:'shutter',label:'MANUAL ROUTES',position:[6,1.6,8.65],size:[3.2,1.2,.2],target:[6,4,8.65],direction:[0,0,1],circuit:{all:['manual-power'],not:['test-power']}});
 for(const [side,x]of [['a',5.2],['b',6.8]]as const)b.device({id:'manual-'+side,kind:'switch',label:'GATE '+side.toUpperCase(),position:[x,1.35,8.15],size:[.4,.6,.25],controlOffset:[0,0,.2],controlCover:{id:'manual-cover',blockedHint:'Switch TEST off and keep MANUAL POWER pressed to uncover the route controls.',openingHint:'Wait for the MANUAL ROUTES cover to open.'}});
}

function afterTheTest(){
 const b=new ChamberBuilder(),w=b.world;w.family='return-loop';w.spawn=[0,.87,12];
 b.floor('test-floor',-10,10,-8.2,14);b.box('test-ceiling',[0,8.2,2.9],[20.8,.4,23]);
 for(const x of [-10.2,10.2])b.box('test-side-'+x,[x,4,2.9],[.4,8,23]);
 b.box('test-south-wall',[0,4,14.2],[20.8,8,.4]);
 // The test exposes actual cargo in A. Separate manual exit leaves prevent a
 // test pulse from completing the room before the independent manual supply.
 b.box('test-west-jamb',[-8.3,4,0],[3.4,8,.4]);b.box('test-middle-jamb',[0,4,0],[6.8,8,.4]);b.box('test-east-jamb',[8.3,4,0],[3.4,8,.4]);
 b.box('test-bay-divider',[0,4,-4.1],[.4,8,8.2]);
 for(const [side,x]of [['a',-5],['b',5]]as const){
  b.box('gate-'+side+'-header',[x,5.5,0],[3.2,5,.4]);
  b.device({id:'gate-'+side,kind:'shutter',label:'GATE '+side.toUpperCase(),position:[x,1.5,0],size:[3.2,3,.3],target:[x,5,0],direction:[0,0,1],circuit:side==='a'?{any:['test-drive','manual-drive-a']}:{all:['manual-drive-b']}});
  northGateExit(b,side,x,-8.2,side==='a'?-10:0,side==='a'?0:10,0,8,{all:['manual-drive-'+side]});
  w.marks.push({text:'GATE '+side.toUpperCase(),position:[x,3.35,.26],normal:[0,0,1],width:1.5,height:.25});
 }
 b.cube('test-cube',[-5,.55,-4.5]);labelledPad(b,'manual-power',-5,6,'MANUAL POWER');
 b.device({id:'test-power',kind:'switch',label:'TEST',position:[2.5,1.25,6],size:[.4,.7,.3],controlOffset:[0,0,.2]});
 b.device({id:'test-clock',kind:'timer',automatic:true,label:'TEST PULSE',position:[-1.2,1.3,3],size:[.8,1.2,.35],pulse:{period:14,onFor:9},circuit:{all:['test-power']}});
 // Visible wired supply indicators are ordinary real circuit nodes, never
 // grammar/history flags. They do not observe or certify an earlier event.
 b.device({id:'test-drive',kind:'receiver',label:'TEST SUPPLY',position:[9,1.2,2],size:[.4,.7,.3],circuit:{all:['test-power','test-clock']}});
 for(const [side,z]of [['a',3.2],['b',4.4]]as const)b.device({id:'manual-drive-'+side,kind:'receiver',label:'MANUAL '+side.toUpperCase(),position:[9,1.2,z],size:[.4,.7,.3],circuit:{all:['manual-power','manual-'+side],not:['test-power']}});
 manualCabinet(b);
 // Inspected booth family. Exit leaves and cargo alcoves have no white bypass.
 for(const x of [-3.2,3.2])b.box('test-booth-side-'+x,[x,4,11],[.4,8,6.4]);
 b.box('test-booth-glass',[0,4,7.9],[6.4,8,.16],'glass');
 b.box('test-waiting-host',[0,1.75,4.5],[3.8,3.5,.3]);
 b.panel('test-source','test-south-wall',[0,1.75,13.985],[0,0,-1],5,3.5);
 b.panel('test-waiting','test-waiting-host',[0,1.75,4.665],[0,0,1],3.5,3.5);
 w.routePoints={'source-portal':[0,1.55,13.985],'waiting-portal':[.55,1.55,4.665],'test-control':[2.5,1.25,6.2],'gate-a':[-5,.865,1.2],'test-cube':[-5,.55,-4.5],'manual-power':[-5,.14,6],'manual-controls':[6,.865,10],'a-exit':[-5,.865,-11.5],'b-exit':[5,.865,-11.5]};
 w.notes.push('UNREGISTERED26. Re-inspected sequences-shutter-12.png and sequences-belt-13.png plus exact prompts before geometry. Reuse two opaque bays/booth and covered-control construction. Deltas: TEST pulses onlyA, B stays closed, one real cube is retrieved, independent manual exit leaves and a POWER/TEST-off control cover. Image letters/old props are not authoritative.','TEST and the real powered14s/9s timer actuate only gate-a. Gate-b and both manual exit leaves stay closed during test. After cargo retrieval, leave the cube pressing MANUAL POWER, switch TEST off with empty hands, and wait for both actual gates to close. Only then does the actual cover uncover independent A/B controls.','The same fixture always contains both real manual routes. Base selects the gate actually opened during the completed test; contrast selects the one actually kept closed. No usedTest, history, minimum pulse, cargo identity or grammar goal flag exists. A physically equivalent correct arrival is accepted.','Journal producer/UI is lead-owned and pending. Fresh history must be empty; an opening report requires actual full clearance, not shutter-open start cue. B remained closed needs complete observation of its real pose throughout a bounded observed TEST interval; truncated/unknown history cannot certify it. These requirements do not gate the exit.','Manual cabinet has a real waist-high stand-off. Its cover requires current MANUAL POWER and TEST off, with read-only actual-cover hint metadata; the native E/ray rules remain unchanged. A wrong selected route returns through still-powered real gates and can be reselected. Native/public routes and journal verification are pending.');
 return b.finish();
}

function releaseAndReuse(){
 const b=new ChamberBuilder(),w=b.world;w.family='relay-garden';w.spawn=[0,.87,12];
 b.floor('reuse-floor',-11,11,-14,14);b.box('reuse-ceiling',[0,11.2,0],[22.8,.4,28.8]);
 b.box('reuse-east',[11.2,5.5,0],[.4,11,28.8]);b.box('reuse-south',[0,5.5,14.2],[22.8,11,.4]);
 sideGateExit(b,'inspection',-11.2,-10,-14,14,0,11,{all:['cargo-light']},-1);
 northGateExit(b,'balcony',5,-14.2,-11,11,4.2,11,{all:['lift-pressure']});
 // Optical sight and pedestrian access are deliberately different real things.
 b.box('reuse-west-window',[-3.8,5.5,0],[14.4,11,.16],'glass');
 b.box('reuse-east-window',[8.8,5.5,0],[4.4,11,.16],'glass');
 b.box('reuse-hatch-header',[5,7,0],[3.2,8,.4]);
 b.device({id:'cargo-hatch',kind:'shutter',latch:true,label:'HOLD-OPEN HATCH',position:[5,1.5,0],size:[3.2,3,.3],target:[5,5,0],direction:[0,0,1],circuit:{all:['cargo-light']}});
 b.floor('reuse-balcony',1,11,-14,-8,4.2);
 for(const x of [1.3,10.7])b.box('reuse-balcony-pier-'+x,[x,1.8,-11],[.5,3.6,.8]);
 b.device({id:'reuse-lift',kind:'lift',automatic:true,cycle:true,label:'BALCONY',position:[5,-.2,-6],size:[4,.4,4],target:[5,4,-6],period:3.5,dwell:6,circuit:{all:['lift-pressure']},controlOffset:[1.3,.9,1.3],controlFacing:[-1,0,0]});
 b.cube('power-cube',[-6,.55,8]);labelledPad(b,'power-pressure',-3,8,'POWER');labelledPad(b,'lift-pressure',7,3,'LIFT');
 b.box('reuse-emitter-housing',[6.5,.8,8],[.6,1.6,.8]);
 b.box('reuse-receiver-body',[-5,.9,-7.1],[.8,1.8,.5]);
 b.panel('reuse-source','reuse-east',[10.985,1.75,8],[-1,0,0],6,3.5);
 b.panel('reuse-return','balcony-west-jamb',[-5,1.75,-13.985],[0,0,1],6,3.5);
 w.marks.push({text:'HOLD-OPEN CATCH',position:[5,3.4,.25],normal:[0,0,1],width:2,height:.25});
 w.routePoints={'source-portal':[10.985,1.55,8],'return-portal':[-5,1.55,-13.985],'power-approach':[-4.8,.865,8],'lift-pressure-approach':[8.8,.865,3],'hatch-approach':[5,.865,1.5],'lift-wait':[5,.865,-3],'lift-board':[5,.865,-6],'balcony-exit':[5,5.065,-17],'inspection-exit':[-14,.865,-10]};
 w.notes.push('UNREGISTERED27. Re-inspected chamber-25-target.png and chamber-20-target.png before explicit geometry; reuse enclosed cargo latch/pressure and optical gallery families. Delta: one cube reallocates POWER to LIFT, vertical pedestrian hatch has real hold-open latch, inspection leaf follows live optical supply. No new cargo mechanics. Raster rails, proportions and white extents are not copied.','Real cargo-light opens both cargo-hatch and inspection-door. Only cargo-hatch has latch:true. Removing POWER extinguishes the emitter and closes inspection; the released hatch persists independently of current light. A real4.2m automatic lift and balcony door require current LIFT pressure. Initial dark/closed state contains no reported earlier opening.','White bands end at3.5m and are ground-aligned; neither can deliver directly to the4.2m gallery. A miss lands on actual floor0 and can wait for the lift return. Either physically equivalent pressure allocation is accepted; no power-cube identity, openedOnce, usedLift or tense flag gates success.','Journal must report actual full hatch clearance separately from internal latch engagement and actual current inspection pose. Shutter-open start cue and the latch bit alone do not certify completed opening. Base/contrast, loss/restoration, full latch clearance and actual lift/cargo routes remain unverified.');
 return b.finish();
}

function freightReturned(){
 const b=new ChamberBuilder(),w=b.world;w.family='conveyor-bay';w.spawn=[7,.87,11];const top=11,bottom=-4.4;
 b.floor('freight-main-floor',-11,11,-6,12);b.box('freight-main-roof',[0,top+.2,3],[22.8,.4,18.8]);
 b.box('freight-main-north',[0,top/2,-6.2],[22.8,top,.4]);b.box('freight-main-south',[0,top/2,12.2],[22.8,top,.4]);
 for(const [id,x]of [['store',11.2],['service',-11.2]]as const){
  b.box(id+'-access-north',[x,top/2,.2],[.4,top,12.4]);b.box(id+'-access-south',[x,top/2,10.8],[.4,top,2.4]);b.box(id+'-access-header',[x,7,8],[.4,8,3.2]);
  w.marks.push({text:id.toUpperCase(),position:[x-Math.sign(x)*.25,3.35,8],normal:[-Math.sign(x),0,0],width:1.6,height:.25});
 }
 // This is the already measured flush receiving-cell construction from13/15.
 b.device({id:'delivery-belt',kind:'conveyor',label:'DELIVERY',position:[0,-.15,0],size:[17,.3,6],direction:[1,0,0],speed:3,controls:'delivery-reverse',circuit:{all:['delivery-power']}});
 b.cube('freight-cube',[0,.55,0]);labelledPad(b,'store-receiver',7.8,0,'STORE',0);labelledPad(b,'service-receiver',-7.8,0,'SERVICE',0);
 for(const x of [-8.5,8.5])b.box('delivery-stop-'+x,[x,1.6,0],[.3,3.2,6.4]);
 b.box('delivery-roof',[0,3.3,0],[17.3,.4,6.4]);for(const z of [-3.1,3.1])b.box('delivery-glass-'+z,[0,1.6,z],[17.3,3.2,.16],'glass');
 for(const x of [-4.2,4.2])b.box('freight-booth-side-'+x,[x,top/2,6.5],[.4,top,6.4]);
 b.box('freight-booth-back',[0,top/2,9.7],[8.8,top,.4]);b.box('freight-booth-window',[0,top/2,3.35],[8.8,top,.16],'glass');
 b.panel('freight-source','freight-main-south',[7,1.75,11.985],[0,0,-1],5,3.5);b.panel('freight-booth','freight-booth-back',[0,1.75,9.485],[0,0,-1],5,3.5);
 b.device({id:'delivery-power',kind:'switch',label:'BELT POWER',position:[2,1.25,5.7],size:[.4,.7,.3],controlOffset:[0,0,.2]});
 b.device({id:'delivery-reverse',kind:'switch',label:'REVERSE',position:[-2,1.3,5.85],size:[.4,.6,.25],controlOffset:[0,0,.2],controlCover:{id:'delivery-cover',blockedHint:'Deliver the cube to STORE to release this cover.',openingHint:'Wait for the delivery cover to open.'}});
 b.box('delivery-cabinet-back',[-2,1.5,5.55],[1.8,3,.2]);for(const x of [-2.8,-1.2])b.box('delivery-cabinet-side-'+x,[x,1.5,5.95],[.2,3,.8]);
 b.box('delivery-cabinet-sill',[-2,.5,5.95],[1.4,1,.8]);b.box('delivery-cabinet-header',[-2,2.5,5.95],[1.4,1,.8]);b.box('delivery-cabinet-stand-off',[-2,.5,6.85],[1.8,1,.15]);
 b.device({id:'delivery-cover',kind:'shutter',latch:true,label:'STORE RELEASE',position:[-2,1.5,6.35],size:[1.4,1,.2],target:[-2,3,6.35],direction:[0,0,1],circuit:{all:['store-receiver']}});
 // STORE supplies a horizontal dry-channel carrier. The guide is below support height.
 b.floor('store-catch',11,29,4,14,bottom);b.floor('store-near-bank',11,15,4,10.2);b.floor('store-far-bank',23,29,4,10.2);
 b.floor('store-return-landing',11,14.4,10.2,14);
 b.box('store-roof',[20,top+.2,9],[18.8,.4,10.8]);
 for(const z of [3.8,14.2])b.box('store-boundary-'+z,[20,(top+bottom)/2,z],[18.8,top-bottom,.4]);
 for(const x of [11.2,29.2])b.box('store-lower-retaining-'+x,[x,bottom/2,9],[.4,-bottom,10.8]);
 b.box('store-west-upper-return-wall',[11.2,top/2,13.1],[.4,top,2.2]);
 b.device({id:'store-carrier',kind:'moving-platform',automatic:true,label:'STORE CARRIER',position:[17,-.2,8],size:[4,.4,4],target:[21,-.2,8],period:4,dwell:7,stops:[{label:'NEAR',position:[17,-.2,8]},{label:'FAR',position:[21,-.2,8]}],circuit:{all:['store-receiver']}});
 for(const z of [6.5,9.5])b.box('store-carrier-guide-'+z,[19,-2, z],[12,.3,.15]);
 // The catch return cannot become a walking bridge to the far bank: this full
 // wall has a low catch entrance at the far end and a ground return only near.
 b.box('store-return-middle',[20.95,(top+bottom)/2,10.2],[11.1,top-bottom,.3]);
 b.box('store-return-near-header',[13.2,7,10.2],[4.4,8,.3]);
 b.box('store-return-far-header',[27.75,4.55,10.2],[3.1,12.9,.3]);
 for(let i=0;i<22;i++){const y=bottom+(i+1)*.2;b.box('store-return-step-'+i,[27.3-i*.6,y-.15,12],[.6,.3,2.5],'floor');}
 sideGateExit(b,'store',29.2,8,4,14,0,top,{all:['store-receiver','at:store-carrier:FAR']},1);
 // SERVICE supplies a different physical machine: an upper inspection lift.
 b.floor('service-floor',-23,-11,0,12);b.floor('service-gallery',-23,-11,0,4,3.4);
 b.box('service-roof',[-17,top+.2,6],[12.8,.4,12.8]);b.box('service-north',[-17,top/2,-.2],[12.8,top,.4]);b.box('service-south',[-17,top/2,12.2],[12.8,top,.4]);
 b.device({id:'service-lift',kind:'lift',automatic:true,cycle:true,label:'SERVICE INSPECTION',position:[-18,-.2,6],size:[4,.4,4],target:[-18,3.2,6],period:3,dwell:7,circuit:{all:['service-receiver']},controlOffset:[1.3,.9,1.3],controlFacing:[-1,0,0]});
 sideGateExit(b,'service',-23.2,2,0,12,3.4,top,{all:['service-receiver']},-1);
 w.routePoints={'source-portal':[7.55,1.55,11.985],'booth-portal':[1,1.55,9.485],'booth-aim':[1,.865,-4.5],'power-control':[2,1.25,5.9],'reverse-control':[-2,1.3,6.05],'store-near-wait':[14.3,.865,8],'store-near':[17,.865,8],'store-far':[25,.865,8],'store-exit':[32,.865,8],'service-lift-wait':[-18,.865,9],'service-lift-board':[-18,.865,6],'service-exit':[-26,4.265,2],'catch-return-low':[28.3,bottom+.865,12],'catch-return-high':[13.7,.865,12]};
 w.notes.push('UNREGISTERED28. Re-inspected sequences-belt-13.png, chamber-18-target.png and chamber-25-target.png before geometry. Reuse sealed flush-cell belt/portal booth, real carrier/dry catch and lift-gallery families. Explicit deltas: STORE delivery physically latches REVERSE cover, STORE powers a4m horizontal carrier travel across an8m bank gap, SERVICE powers a3.4m lift. No raster rail is a walking bridge.','Initial direction is +X toward STORE, power off. Cargo starts beyond ordinary grab reach in the sealed6m-deep belt. Actual STORE pressure opens the real latched cover; reversing then produces a real STORE departure and SERVICE arrival. Base returns it to STORE; contrast leaves SERVICE pressed. No delivery count, reversedOnce or historical arrival flag powers either route.','STORE carrier follows current STORE pressure and its real FAR dock opens its far exit. SERVICE pressure supplies a separate automatic inspection lift and door. Common near archways remain open, so losing power never traps a recovered player outside the controls. Loss of receiving pressure brakes machinery at its current phase. Same cargo, two actual circuits and both routes exist under either mission.','A real catch at-4.4 and22 .6m/.2m stairs return to the near STORE bank. The separating wall admits only a low far catch entrance and a ground-height near return; the stair corridor cannot bypass to the far upper bank. End walls enclose the catch. Full native paths, pressure continuity, cargo arrival/reversal, corner bypasses and both recovery routes remain pending.','Source review before the first native run corrected provisional carrier centre13 to17: its west edge15 now meets the actual near bank edge15, rather than burying the whole deck in fixed bank mass. Target21 reaches far edge23. No passed trajectory or measured support is claimed by this source correction.','Journal must observe actual receiver cargo pressure/pose transitions; an old STORE arrival remains true after departure, NOW becomes EMPTY. Cover latch reports are not complete cargo delivery reports. Reading verification is pending the lead producer.');
 return b.finish();
}

function parkedLink(){
 const b=new ChamberBuilder(),w=b.world;w.family='bridge-rotunda';w.spawn=[5,.87,16];const bottom=-4.4,top=12;
 b.floor('link-catch',-12,12,-14,18,bottom);
 b.floor('link-south-ground',-12,12,2,18);b.floor('link-north-ground',-7.75,12,-14,-2);
 b.floor('link-west-outer',-12,-10.25,-14,2.2);b.floor('link-west-inner',-7.75,-3,-2,2.2);b.floor('link-east-ground',3,12,-2,2.2);
 b.box('link-roof',[0,top+.2,2],[24.8,.4,32.8]);b.box('link-west',[-12.2,(top+bottom)/2,2],[.4,top-bottom,32.8]);
 b.box('link-north',[0,(top+bottom)/2,-14.2],[24.8,top-bottom,.4]);b.box('link-south',[0,(top+bottom)/2,18.2],[24.8,top-bottom,.4]);
 b.box('link-east-north',[12.2,(top+bottom)/2,-11],[.4,top-bottom,6]);b.box('link-east-lower',[12.2,(bottom+2.8)/2,2],[.4,2.8-bottom,32]);
 b.floor('archive-west-walk',-12,-3,-2,3,2.8);b.floor('archive-east-walk',3,12,-2,2,2.8);
 b.floor('inspection-east-walk',3,12,-8,2,5.6);
 b.device({id:'link-lift',kind:'lift',label:'LINK',position:[0,-.2,0],size:[6,.4,4],stops:[{label:'LOADING',position:[0,-.2,0]},{label:'TRANSFER',position:[0,2.6,0]},{label:'INSPECTION',position:[0,5.4,0]}],controlOffset:[-2.2,.9,1.3],controlFacing:[0,0,1]});
 for(let i=0;i<14;i++){const y=(i+1)*.2;b.box('archive-step-'+i,[-9,y-.15,11.1-i*.6],[2.5,.3,.6],'floor');}
 for(let i=0;i<22;i++){const y=bottom+(i+1)*.2;b.box('link-catch-step-'+i,[-9,y-.15,-10.9+i*.6],[2.5,.3,.6],'floor');}
 // Archive roof is physically below the inspection floor. Its shallow leaf
 // slides sideways into a real service recess rather than through that floor.
 sideGateExit(b,'archive',12.2,0,-2,18,2.8,top,{all:['at:link-lift:TRANSFER']},1,2,[12.12,3.8,4]);
 sideGateExit(b,'inspection',12.2,-6,-8,-2,5.6,top,{all:['at:link-lift:INSPECTION']},1);
 // The starting operations bay still requires ordinary portal access.
 for(const x of [1.8,8.2])b.box('link-booth-side-'+x,[x,top/2,15.1],[.4,top,6.2]);b.box('link-booth-glass',[5,top/2,12],[6.4,top,.16],'glass');
 b.box('link-waiting-host',[5,1.75,9],[3.8,3.5,.3]);b.panel('link-source','link-south',[5,1.75,17.985],[0,0,-1],5,3.5);b.panel('link-waiting','link-waiting-host',[5,1.75,9.165],[0,0,1],3.5,3.5);
 w.routePoints={'source-portal':[5.55,1.55,17.985],'waiting-portal':[5.55,1.55,9.165],'loading-control':[-2.2,.7,1.3],'loading-board':[0,.865,0],'archive-stair-base':[-9,.865,12.2],'archive-west':[-5,3.665,0],'archive-east':[6,3.665,0],'archive-exit':[15,3.665,0],'inspection-exit':[15,6.465,-6],'catch-stair-low':[-9,bottom+.865,-12],'catch-stair-high':[-9,.865,2.5],'catch-side-return':[-6,.865,3.8]};
 w.notes.push('UNREGISTERED29. Re-inspected permissions-optional-10.png and permissions-transfer-07.png before explicit geometry. Reuse substantial manual deck, mounted E panel, split gallery, real stairs/catch. Delta: one6x4 deck has three physical vertical stops0/2.8/5.6; TRANSFER is a horizontal archive link and INSPECTION is a separate higher balcony. Metric rasters and white wall placement are not copied.','Actual at:link-lift:TRANSFER and at:link-lift:INSPECTION stopped-pose flags drive separate leaves; destination choice, passing a height and a past arrival row do not. Archive leaf is2m high under2.2m actual clear headroom and slides south to a service recess. Inspection is separately at5.6m.','Archive may be reached by riding then crossing, or by selecting TRANSFER from the mounted control and climbing14 physical .6m/.2m treads to the west gallery. No usedLift, rodeFromLoading or crossDeck history condition rejects an equivalent physically valid route. Ground-only portal hosts do not deliver to either upper gallery.','The catch floor is-4.4. Its22 .6m/.2m treads occupy an explicit opening in the ground floor, under2.2m gallery clearance near their top. After climbing, move east from(-9,2.5)to(-6,2.5), then south to3.8 to avoid entering the upper flight through its tall riser side. No reset/jump recovery is prescribed. All actual native seam/door/stair routes remain unverified.','Journal arrival must use stopped physical dock, and NOW must change immediately on real departure even while an old arrival remains in history. Readout must not claim still parked from a retained event. Fresh history starts empty; event reading and ordinary-input proof remain pending.');
 return b.finish();
}

function reconnectSupply(){
 const b=new ChamberBuilder(),w=b.world;w.family='relay-garden';w.spawn=[0,.87,12];const top=11;
 b.floor('reconnect-floor',-11,11,-14,14);b.box('reconnect-roof',[0,top+.2,0],[22.8,.4,28.8]);b.box('reconnect-south',[0,top/2,14.2],[22.8,top,.4]);b.box('reconnect-north',[0,top/2,-14.2],[22.8,top,.4]);
 sideGateExit(b,'service',-11.2,8,-14,14,0,top,{all:['service-pressure'],not:['gallery-light']},-1);
 sideGateExit(b,'gallery',11.2,-6,-14,14,4.2,top,{all:['gallery-pressure','gallery-light']},1);
 // The opaque return bend prevents a premature diagonal shot into cargo.
 b.box('reconnect-spine',[0,top/2,-7],[.4,top,14]);
 b.box('reconnect-west-left',[-8.8,top/2,0],[4.4,top,.4]);b.box('reconnect-west-right',[-1.7,top/2,0],[3.4,top,.4]);b.box('reconnect-access-header',[-5,7,0],[3.2,8,.4]);
 b.device({id:'cargo-access',kind:'shutter',latch:true,label:'CARGO ACCESS',position:[-5,1.5,0],size:[3.2,3,.3],target:[-5,5,0],direction:[0,0,1],circuit:{all:['gallery-light']}});
 b.box('reconnect-east-window',[5.6,top/2,0],[10.8,top,.16],'glass');
 // The viewing aisle is outside the sealed cargo bay. Its portal host becomes
 // genuinely visible only after walking through released west access.
 b.box('cargo-front-window',[-6,top/2,-4],[10,top,.16],'glass');b.box('cargo-east-window',[-1,top/2,-9],[.16,top,10],'glass');
 b.cube('route-cargo',[-5,.55,-10]);labelledPad(b,'gallery-pressure',7,-6,'GALLERY');labelledPad(b,'service-pressure',-6,8,'SERVICE');
 b.floor('reconnect-gallery',3,11,-10,-4,4.2);for(const x of [3.3,10.7])b.box('reconnect-gallery-pier-'+x,[x,1.8,-8],[.4,3.6,.8]);
 b.device({id:'reconnect-lift',kind:'lift',automatic:true,cycle:true,label:'GALLERY',position:[7,-.2,-2],size:[4,.4,4],target:[7,4,-2],period:3.5,dwell:7,circuit:{all:['gallery-pressure','gallery-light']},controlOffset:[1.3,.9,1.3],controlFacing:[-1,0,0]});
 b.box('reconnect-emitter-housing',[6.5,.8,8],[.6,1.6,.8]);b.box('reconnect-receiver-body',[5,.9,-7.1],[.8,1.8,.5]);
 b.panel('reconnect-source','gallery-south-jamb',[10.985,1.75,8],[-1,0,0],6,3.5);
 b.panel('reconnect-optical-return','reconnect-north',[5,1.75,-13.985],[0,0,1],6,3.5);
 b.panel('reconnect-cargo-return','reconnect-north',[-5,1.75,-13.985],[0,0,1],6,3.5);
 w.routePoints={'source-portal':[10.985,1.55,8],'optical-portal':[5,1.55,-13.985],'cargo-portal':[-5,1.55,-13.985],'cargo-view-aisle':[-5,.865,-2],'cargo-approach':[-5,.865,-12],'gallery-release':[8.8,.865,-6],'gallery-lift-wait':[10,.865,-2],'gallery-lift-board':[7,.865,-2],'gallery-exit':[14,5.065,-6],'service-release':[-7.8,.865,8],'service-exit':[-14,.865,8]};
 w.notes.push('UNREGISTERED30. Re-inspected chamber-20-target.png and chamber-25-target.png before this explicit optical/cargo assembly. Reuse real ground return bands, latched cargo access, current beam/pressure lift and lower return. Delta: one pair has optical and cargo return jobs around an opaque spine; a sealed cargo bay is reached through a new visible return, not a remote-grab shortcut. No new cargo mechanics or static history.','An always-on emitter shoots+X from(7,.9,8). Source(10.985,1.55,8)routes through east north return(5,1.55,-13.985)to actual gallery-light at(5,.9,-7.5). That releases cargo-access. Walk west access into the observation aisle, where only now can cargo-return(-5,1.55,-13.985)be aimed. The full-height spine blocks its diagonal line from the eastern observation window.','Relinking to cargo-return interrupts actual gallery power; access stays open through its real latch. Enter from source, retrieve actual cargo and carry it back. Base restores east optical link, transfers cargo to GALLERY and maintains light AND pressure during the real4.2m lift/upper door. Contrast leaves light dark and puts cargo on SERVICE for the separate lower return. No unbroken-power, interruption-count, original-cargo or grammar flag gates either exit.','White bands end3.5m above ground, below the4.2m gallery. Its underside3.6m leaves real headroom for ground portal arrival, cargo pressure and low optical ray. Receiver housing is a real obstacle; walk east around it after transport. A missed lift lands on actual floor0 and can wait for another cycle. All native full-fit cargo/beam/door/transport/recovery paths remain pending.','Journal may say power returned only after observing a genuine loss then a current lit transition; otherwise say receiver is lit. Real temporary player/cargo occlusion can produce truthful beam transitions. No fake prehistory, repair animation or forced three-toggle completion condition.');
 return b.finish();
}

/** Physical fixtures only. No fabricated journal rows or historical gate conditions. */
export const draftEventLevels:CoreLevel[]=[{
 number:26,...eventsEnglish[26],architecture:{height:8,halfWidth:10,style:'graphite'},expectedExit:'a-exit',blueprint:afterTheTest,
 journal:{watch:[{id:'gate-a',label:'A',kind:'shutter'},{id:'gate-b',label:'B',kind:'shutter'}],tests:[{control:'test-power',label:'TEST',watch:['gate-a','gate-b']}]},
 wrongExitFeedback:'This gate stayed closed during the test. Return to the manual controls and choose the gate you observed opening.',
 contrast:{...eventsEnglish[26].contrast!,expectedExit:'b-exit',wrongExitFeedback:'This gate opened during the test. The changed instruction asks for the gate that stayed closed.'},
},{
 number:27,...eventsEnglish[27],architecture:{height:11,halfWidth:11,style:'graphite'},expectedExit:'balcony-exit',blueprint:releaseAndReuse,
 journal:{watch:[{id:'cargo-hatch',label:'HATCH',kind:'shutter'},{id:'inspection-door',label:'INSPECTION DOOR',kind:'shutter'},{id:'cargo-light',label:'RECEIVER',kind:'light'},{id:'power-pressure',label:'POWER',kind:'pressure'},{id:'lift-pressure',label:'LIFT',kind:'pressure'},{id:'reuse-lift',label:'BALCONY LIFT',kind:'dock'}]},
 optics:{emitters:[{id:'reuse-emitter',position:[7,.9,8],direction:[1,0,0],range:80,circuit:{all:['power-pressure']}}],receivers:[{id:'cargo-light',position:[-5,.9,-7.5],normal:[0,0,-1],radius:.34}]},
 wrongExitFeedback:'This is the continuously powered inspection route. Release the hatch, then move pressure to LIFT for the balcony.',
 contrast:{...eventsEnglish[27].contrast!,expectedExit:'inspection-exit',wrongExitFeedback:'This is the lift route. The changed instruction keeps POWER and the inspection receiver supplied.'},
},{
 number:28,...eventsEnglish[28],architecture:{height:11,halfWidth:29,style:'graphite'},recoveryY:-12,expectedExit:'store-exit',blueprint:freightReturned,
 journal:{watch:[{id:'store-receiver',label:'STORE',kind:'pressure'},{id:'service-receiver',label:'SERVICE',kind:'pressure'},{id:'store-carrier',label:'STORE CARRIER',kind:'dock'},{id:'service-lift',label:'SERVICE LIFT',kind:'dock'}]},
 wrongExitFeedback:'This is SERVICE. Return safely, return the cube to STORE and keep that receiving pad pressed for its carrier.',
 contrast:{...eventsEnglish[28].contrast!,expectedExit:'service-exit',wrongExitFeedback:'This is STORE. The changed instruction leaves the reversed delivery at SERVICE for its inspection lift.'},
},{
 number:29,...eventsEnglish[29],architecture:{height:12,halfWidth:12,style:'ceramic'},recoveryY:-12,expectedExit:'archive-exit',blueprint:parkedLink,
 journal:{watch:[{id:'link-lift',label:'LINK LIFT',kind:'dock'}]},
 wrongExitFeedback:'This is the inspection balcony. Park the same deck at TRANSFER and use the archive link.',
 contrast:{...eventsEnglish[29].contrast!,expectedExit:'inspection-exit',wrongExitFeedback:'This is the archive. The changed instruction takes the loading deck up to INSPECTION.'},
},{
 number:30,...eventsEnglish[30],architecture:{height:11,halfWidth:11,style:'graphite'},expectedExit:'gallery-exit',blueprint:reconnectSupply,
 journal:{watch:[{id:'gallery-light',label:'GALLERY RECEIVER',kind:'light'},{id:'cargo-access',label:'CARGO ACCESS',kind:'shutter'},{id:'gallery-pressure',label:'GALLERY',kind:'pressure'},{id:'service-pressure',label:'SERVICE',kind:'pressure'},{id:'reconnect-lift',label:'GALLERY LIFT',kind:'dock'}]},
 optics:{emitters:[{id:'reconnect-emitter',position:[7,.9,8],direction:[1,0,0],range:80}],receivers:[{id:'gallery-light',position:[5,.9,-7.5],normal:[0,0,-1],radius:.34}]},
 wrongExitFeedback:'This is SERVICE. Restore the gallery receiver and deliver cargo to GALLERY for the upper route.',
 contrast:{...eventsEnglish[30].contrast!,expectedExit:'service-exit',wrongExitFeedback:'This is the powered gallery. The changed instruction leaves its receiver dark and puts cargo on SERVICE.'},
}];
