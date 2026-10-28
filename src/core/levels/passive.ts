/** Unregistered passive31–35 batch. One authored route is proved before expansion.
 * Construction families: inspected core01 glass/cargo; optical lift; reference21/23.
 * Explicit metric fixtures never inspect mission text, expected exit or a goal flag.
 */
import type {CoreLevel} from '../level';
import{ChamberBuilder}from'../level-kit';
import{passiveEnglish}from'./passive-english';

function whichSupply(){
 const b=new ChamberBuilder(),w=b.world;w.family='dual-vault';w.spawn=[6,.87,11];
 b.floor('supply-floor',-12,12,-16,14);
 b.box('supply-roof',[0,11.2,-1],[24.8,.4,30.8]);
 b.box('supply-east',[12.2,5.5,-1],[.4,11,30.8]);
 b.box('supply-south',[0,5.5,14.2],[24.8,11,.4]);
 // West enclosure has one genuine ground hatch at z−9, not an exit painted on wall.
 b.box('supply-west-north',[-12.2,5.5,-13.2],[.4,11,5.6]);
 b.box('supply-west-south',[-12.2,5.5,3.2],[.4,11,21.6]);
 b.box('button-hatch-header',[-12.2,7,-9],[.4,8,2.8]);
 b.device({id:'button-hatch',kind:'shutter',label:'BUTTON HATCH',position:[-12.12,1.5,-9],size:[.3,3,2.8],target:[-12.12,5,-9],direction:[1,0,0],circuit:{all:['floor-button']}});
 b.floor('button-vestibule',-16.5,-11.8,-10.4,-7.6);
 b.box('button-vestibule-roof',[-14.1,11.2,-9],[5.2,.4,3.6]);
 for(const z of [-10.6,-7.4])b.box('button-vestibule-side-'+z,[-14.1,5.5,z],[5.2,11,.4]);
 b.box('button-vestibule-end',[-16.7,5.5,-9],[.4,11,3.6]);
 b.exitCorridor('button-exit','button-vestibule',{minX:-16.48,maxX:-12.6,minZ:-10.38,maxZ:-7.62});
 // Full-height glazing seals the cargo bay. It transmits aimed rifts, not bodies.
 b.box('cargo-window',[-3,5.5,-1],[.16,11,30],'glass');
 b.cube('supply-cube',[-8,.55,9]);b.button('floor-button',[6,.14,6]);w.pads[0].label='FLOOR BUTTON';
 b.panel('cargo-source','supply-south',[6,1.75,13.985],[0,0,-1],5,3.5);
 b.panel('cargo-return','supply-west-south',[-11.985,1.75,8],[1,0,0],6,3.5);
 // Independent optical source remains in the near foyer. A single real low slot
 // through the partition admits light but neither upright capsule nor large cube.
 b.box('beam-emitter-housing',[8.55,.8,8],[.6,1.6,.8]);
 b.panel('beam-source','supply-east',[11.985,1.75,8],[-1,0,0],5,3.5);
 b.box('beam-return-host',[0,1.75,4.2],[3.8,3.5,.4]);
 b.panel('beam-return','beam-return-host',[0,1.75,3.985],[0,0,-1],3.5,3.5);
 // Partition x[−3,12], with only optical x±.4/y.5..1.3 and pedestrian x5.6..8.4.
 b.box('receiver-partition-west',[-1.7,5.5,-2],[2.6,11,.16],'glass');
 b.box('receiver-slot-sill',[0,.25,-2],[.8,.5,.16]);
 b.box('receiver-slot-header',[0,6.15,-2],[.8,9.7,.16]);
 b.box('receiver-partition-middle',[3,5.5,-2],[5.2,11,.16],'glass');
 b.box('receiver-partition-east',[10.2,5.5,-2],[3.6,11,.16],'glass');
 b.box('receiver-hatch-header',[7,7,-2],[2.8,8,.35]);
 b.device({id:'receiver-hatch',kind:'shutter',label:'RECEIVER HATCH',position:[7,1.5,-2],size:[2.8,3,.3],target:[7,5,-2],direction:[0,0,1],circuit:{all:['wall-light']}});
 b.box('wall-receiver-pillar',[0,1.5,-8.2],[1.4,3,.4]);
 b.box('wall-receiver-body',[0,.9,-8.05],[.8,.8,.4]);
 // A thin, supported gallery leaves safe ground below and cannot be bypassed by
 // the low white bands. No rail crosses its actual 4m boarding/arrival edge.
 b.floor('receiver-gallery',-2.5,12,-16,-10,4.2);
 for(const x of [-2.1,11.6])b.box('receiver-gallery-pier-'+x,[x,1.8,-12],[.4,3.6,.8]);
 b.device({id:'receiver-lift',kind:'lift',automatic:true,cycle:true,label:'RECEIVER GALLERY',position:[7,-.2,-8],size:[4,.4,4],target:[7,4,-8],targetLabel:'GALLERY',period:3.5,dwell:6,circuit:{all:['wall-light']},controlOffset:[1.3,.9,1.3],controlFacing:[-1,0,0]});
 // Complete north wall around the genuine elevated doorway.
 b.box('supply-north-west',[-3.2,5.5,-16.2],[17.6,11,.4]);
 b.box('supply-north-east',[10.2,5.5,-16.2],[3.6,11,.4]);
 b.box('receiver-exit-sill',[7,2.1,-16.2],[2.8,4.2,.4]);
 b.box('receiver-exit-header',[7,9.1,-16.2],[2.8,3.8,.4]);
 b.device({id:'receiver-exit-door',kind:'shutter',label:'RECEIVER EXIT',position:[7,5.7,-16.12],size:[2.8,3,.3],target:[7,9.2,-16.12],direction:[0,0,1],circuit:{all:['wall-light']}});
 b.floor('receiver-vestibule',5.6,8.4,-20.4,-15.8,4.2);
 b.box('receiver-vestibule-roof',[7,11.2,-18.1],[3.6,.4,5]);
 for(const x of [5.4,8.6])b.box('receiver-vestibule-side-'+x,[x,7.6,-18.1],[.4,6.8,5]);
 b.box('receiver-vestibule-end',[7,7.6,-20.6],[3.6,6.8,.4]);
 b.exitCorridor('receiver-exit','receiver-vestibule',{minX:5.62,maxX:8.38,minZ:-20.38,maxZ:-16.6});
 w.marks.push(
  {text:'FLOOR BUTTON',position:[11.94,1.3,6],normal:[-1,0,0],width:2,height:.25},
  {text:'BUTTON HATCH',position:[-11.94,3.35,-9],normal:[1,0,0],width:2,height:.25},
  {text:'RECEIVER HATCH',position:[7,3.35,-1.74],normal:[0,0,1],width:2.3,height:.25},
  {text:'RECEIVER EXIT',position:[7,7.55,-15.94],normal:[0,0,1],width:2,height:.25},
 );
 w.routePoints={spawn:[6,.87,11],'cargo-source':[6,1.55,13.985],'cargo-return':[-11.985,1.55,8],'cargo-approach':[-9.8,.865,9],'button-drop':[7.8,.865,6],'button-exit':[-15,.865,-9],'beam-view':[7,.865,1],'beam-source':[11.985,1.55,8.55],'beam-return':[.55,1.55,3.985],'hatch-approach':[7,.865,-.5],'lift-wait':[7,.865,-4.5],'lift-board':[7,.865,-7.5],'gallery':[7,5.065,-12],'receiver-exit':[7,5.065,-19]};
 w.notes.push('Architecture-family reuse, not a new image-generation gate: core chamber01 glass/cargo target, laser-lift target, references21 and23 were independently displayed/read before authorship. Preserve original diamond cargo/rectangular optical art/compact instrument; raster rails, device silhouettes and perspective are not metric data.',
  'Metric deltas:24x30m enclosure; west glazed cargo bay; independent floor-button hatch to west storage; near-foyer optical baffle sends a real low beam through a .8x.8 opening; receiver hatch admits the player to a separate4.2m gallery lift. Continuous floor0 catches every upper miss and returns to the base without reset.',
  'Balanced optical anchors sourceZ8.55/returnX.55 preserve the emitterZ8 ray at receiverX0. White bands end3.5m and are all on the near/cargo side, so they cannot bypass the4.2m gallery or transport the player through the receiver partition. The optical slot admits neither upright capsule nor large cube.',
  'Button hatch is controlled only by current floor-button pressure. Receiver hatch/lift/upper door are controlled only by actual wall-light. All cargo, surfaces, doors and circuits exist unchanged under both instructions. No cargo ID, used hatch/lift/portal count, source-word parser or past-error memory gates success.',
  'Native authored-spawn base/contrast/wrong/recovery and ordinary-input visibility/audio/save proof are pending. This fixture is unregistered and no route is called accepted from source inspection.');
 return b.finish();
}

function carriedOrPowered(){
 const b=new ChamberBuilder(),w=b.world;w.family='return-loop';w.spawn=[7,.87,11];
 b.floor('freight-near-bank',-12,12,2,14);b.floor('freight-far-bank',-12,12,-14,-10);
 b.floor('freight-catch',-12,12,-14,14,-4.4);
 b.box('freight-roof',[0,11.2,0],[24.8,.4,28.8]);
 b.box('freight-west',[-12.2,3.3,0],[.4,15.4,28.8]);
 b.box('freight-north',[0,3.3,-14.2],[24.8,15.4,.4]);
 b.box('freight-south',[0,3.3,14.2],[24.8,15.4,.4]);
 // The actual lower SERVICE doorway is on the near bank, not in the catch well.
 b.box('freight-east-north',[12.2,3.3,-5.7],[.4,15.4,16.6]);
 b.box('freight-east-south',[12.2,3.3,9.7],[.4,15.4,8.6]);
 b.box('freight-service-header',[12.2,7,4],[.4,8,2.8]);
 b.box('freight-service-sill',[12.2,-2.2,4],[.4,4.4,2.8]);
 b.device({id:'freight-service-door',kind:'shutter',label:'LOWER SERVICE',position:[12.12,1.5,4],size:[.3,3,2.8],target:[12.12,5,4],direction:[-1,0,0],circuit:{all:['service-pressure'],not:['carrier-power']}});
 b.floor('freight-service-vestibule',11.8,16.5,2.6,5.4);
 b.box('freight-service-roof',[14.1,11.2,4],[5.2,.4,3.6]);
 for(const z of [2.4,5.6])b.box('freight-service-side-'+z,[14.1,5.5,z],[5.2,11,.4]);
 b.box('freight-service-end',[16.7,5.5,4],[.4,11,3.6]);
 b.exitCorridor('service-exit','freight-service-vestibule',{minX:12.6,maxX:16.48,minZ:2.62,maxZ:5.38});
 // POWER is a real carried-source job, initially supported by one ordinary cube.
 b.button('carrier-power',[-8.5,.14,8]);w.pads.at(-1)!.label='POWER';
 b.button('release-pressure',[-5,.14,8]);w.pads.at(-1)!.label='RELEASE';
 b.button('service-pressure',[7,.14,9]);w.pads.at(-1)!.label='SERVICE';
 b.cube('power-cube',[-8.5,.69,8]);b.cube('carried-cube',[4,.55,-8]);
 b.device({id:'freight-carrier',kind:'moving-platform',automatic:true,label:'CARGO PLATFORM',position:[4,-.2,-8],size:[4,.4,4],target:[4,-.2,0],targetLabel:'NEAR',period:5,dwell:6,circuit:{all:['carrier-power']},stops:[{label:'FAR',position:[4,-.2,-8]},{label:'NEAR',position:[4,-.2,0]}]});
 for(const x of [2.7,5.3])b.box('freight-guide-'+x,[x,-2.1,-4],[.16,.18,12]);
 // The vault's glass side/front require actual portal access. Its upper opening
 // is set in the same front construction, above every eligible white band.
 b.box('power-vault-side',[-3,5.5,10],[.16,11,8],'glass');
 b.box('power-vault-front-west',[-10.45,5.5,6],[3.1,11,.16],'glass');
 b.box('power-vault-front-east',[-4.55,5.5,6],[3.1,11,.16],'glass');
 b.box('freight-upper-sill',[-7.5,2.1,6],[2.8,4.2,.16],'glass');
 b.box('freight-upper-header',[-7.5,9.1,6],[2.8,3.8,.16],'glass');
 b.panel('freight-source','freight-south',[7,1.75,13.985],[0,0,-1],5,3.5);
 b.panel('freight-return','freight-west',[-11.985,1.75,11],[1,0,0],5,3.5);
 b.floor('freight-upper-gallery',-11.8,-3.2,6,10,4.2);
 for(const x of [-11.4,-3.6])b.box('freight-gallery-pier-'+x,[x,1.8,7],[.4,3.6,.5]);
 b.device({id:'release-lift',kind:'lift',automatic:true,cycle:true,label:'FREIGHT GALLERY',position:[-7.5,-.2,12],size:[4,.4,4],target:[-7.5,4,12],targetLabel:'GALLERY',period:3.5,dwell:6,circuit:{all:['carrier-power','release-pressure']},controlOffset:[-1.3,.9,-1.3],controlFacing:[1,0,0]});
 b.device({id:'freight-upper-door',kind:'shutter',label:'FREIGHT EXIT',position:[-7.5,5.7,6],size:[2.8,3,.3],target:[-7.5,9.2,6],direction:[0,0,1],circuit:{all:['carrier-power','release-pressure']}});
 b.floor('freight-upper-vestibule',-8.9,-6.1,2,6.2,4.2);
 b.box('freight-upper-roof',[-7.5,11.2,4.1],[3.6,.4,4.6]);
 for(const x of [-9.1,-5.9])b.box('freight-upper-side-'+x,[x,7.6,4.1],[.4,6.8,4.6]);
 b.box('freight-upper-end',[-7.5,7.6,1.8],[3.6,6.8,.4]);
 b.exitCorridor('freight-exit','freight-upper-vestibule',{minX:-8.88,maxX:-6.12,minZ:2.02,maxZ:5.4});
 // Proven-family broad carpentry, not a nudge/respawn recovery substitute.
 for(let i=0;i<22;i++){const top=-4.2+i*.2;b.box('freight-return-step-'+i,[-10,(top-4.7)/2,-10.9+i*.6],[2.5,top+4.7,.6],'floor');}
 w.marks.push(
  {text:'POWER',position:[-11.94,1.3,8],normal:[1,0,0],width:1.4,height:.25},
  {text:'RELEASE',position:[-3.1,1.3,8],normal:[-1,0,0],width:1.6,height:.25},
  {text:'SERVICE',position:[11.94,1.3,9],normal:[-1,0,0],width:1.6,height:.25},
  {text:'FREIGHT EXIT',position:[-7.5,7.55,6.26],normal:[0,0,1],width:1.9,height:.25},
  {text:'LOWER SERVICE',position:[11.94,3.35,4],normal:[-1,0,0],width:2,height:.25},
 );
 w.routePoints={spawn:[7,.87,11],'source-portal':[7,1.55,13.985],'return-portal':[-11.985,1.55,11],'carrier-wait':[4,.865,3.5],'carrier-pickup':[4,.865,1.8],'power-approach':[-10.3,.865,8],'release-drop':[-5,.865,9.8],'service-drop':[8.8,.865,9],'lift-wait':[-10.3,.865,12],'lift-board':[-7.5,.865,12],'upper-gallery':[-7.5,5.065,8],'freight-exit':[-7.5,5.065,3],'service-exit':[15,.865,4],'catch-low-end':[-10,-3.535,-11.8]};
 w.notes.push('Family references independently displayed/read before this fixture: permissions-freight08, references22 supply/carrier and references25 cargo-carrier/cube-pressure targets. Reuse the original diamond/pressure/lift kit; reject raster carrier guides as bridges, shifted control labels and unmeasured rails.',
  'Metric delta:24x28m enclosure, separate near/far banks over a−4.4m catch,4x4 actual powered carrier travelling8m in5s with6s dwells, and a sealed near-bank west pressure vault reached by a walking portal pair. One cube really rides the deck; the other supplies POWER. No simulated carry history or owner label substitutes for contact.',
  'POWER+RELEASE supplies the4.2m freight lift/upper leaf. SERVICE with POWER absent supplies the independent ground door. Low white bands cannot reach the gallery, and floor/slot/circuit conditions are identical under both instructions. Any equivalent two-body allocation remains valid without IDs or original-role history.',
  'The carrier guides top−2.01 are not bank-height bridges. A22x.6m/.2m broad stair flight climbs from the actual low approach under the far-bank slab to the near bank; head clearance and full capsule landing still need route proof. Removing POWER can brake at any actual pose, and replacement must resume its own phase.',
  'SOURCE ONLY. Complete authored-spawn base/contrast, supply-loss/wrong/recovery, swapped allocation and catch routes are pending native execution. Unregistered; no saved-progress/browser/visibility claim.');
 return b.finish();
}

function whatIsBlocked(){
 const b=new ChamberBuilder(),w=b.world;w.family='l-gallery';w.spawn=[7,.87,11];
 b.floor('block-floor',-12,12,-14,14);b.box('block-roof',[0,11.2,0],[24.8,.4,28.8]);
 b.box('block-east',[12.2,5.5,0],[.4,11,28.8]);b.box('block-south',[0,5.5,14.2],[24.8,11,.4]);
 // The real lower storage opening is separated from the upper optical route.
 b.box('block-west-north',[-12.2,5.5,-12.7],[.4,11,2.6]);b.box('block-west-south',[-12.2,5.5,2.7],[.4,11,22.6]);
 b.box('block-service-header',[-12.2,7,-10],[.4,8,2.8]);
 b.device({id:'block-service-door',kind:'shutter',label:'SERVICE',position:[-12.12,1.5,-10],size:[.3,3,2.8],target:[-12.12,5,-10],direction:[1,0,0],circuit:{all:['block-service']}});
 b.floor('block-service-vestibule',-16.5,-11.8,-11.4,-8.6);b.box('block-service-roof',[-14.1,11.2,-10],[5.2,.4,3.6]);
 for(const z of [-11.6,-8.4])b.box('block-service-side-'+z,[-14.1,5.5,z],[5.2,11,.4]);
 b.box('block-service-end',[-16.7,5.5,-10],[.4,11,3.6]);b.exitCorridor('service-exit','block-service-vestibule',{minX:-16.48,maxX:-12.6,minZ:-11.38,maxZ:-8.62});
 // Fresh entry booth: aim from its actual front glass, not through an opaque side.
 for(const x of [4,10])b.box('entry-booth-side-'+x,[x,5.5,10],[.4,11,8]);
 b.box('entry-booth-glass',[7,5.5,6],[6,11,.16],'glass');
 b.panel('block-source','block-south',[7,1.75,13.985],[0,0,-1],5,3.5);
 b.panel('block-return','block-west-south',[-11.985,1.75,0],[1,0,0],6,3.5);
 // The cargo blocks an actual lateral ray inside an otherwise dark-walled alcove.
 // No eligible surface lies inside it; access cannot be replaced by a walking rift.
 for(const x of [-4.2,4.2])b.box('block-alcove-side-'+x,[x,5.5,-3],[.4,11,10.4]);
 b.box('block-alcove-north',[0,5.5,-8.2],[8.8,11,.4]);
 b.box('block-alcove-front-west',[-2.8,5.5,2],[2.8,11,.4]);b.box('block-alcove-front-east',[2.8,5.5,2],[2.8,11,.4]);
 b.box('cargo-hatch-header',[0,7,2],[2.8,8,.4]);
 b.device({id:'hatch-control',kind:'switch',label:'OPEN HATCH',position:[5.5,1.25,3.7],size:[.4,.7,.3],controlOffset:[0,0,.2]});
 b.device({id:'cargo-hatch',kind:'shutter',label:'CARGO HATCH',position:[0,1.5,2],size:[2.8,3,.3],target:[0,5,2],direction:[0,0,1],circuit:{all:['hatch-control']}});
 b.cube('block-cube',[0,.55,-.4]);b.button('block-service',[-7,.14,8]);w.pads[0].label='SERVICE';
 b.box('block-emitter-housing',[-3.45,.65,-.4],[.6,1.3,.8]);
 b.box('block-receiver-pillar',[3.5,1.5,-.4],[.6,3,1.4]);b.box('block-receiver-body',[3.45,.65,-.4],[.4,.8,.8]);
 b.floor('block-upper-gallery',4,12,-14,-9,4.2);
 for(const x of [4.4,11.6])b.box('block-gallery-pier-'+x,[x,1.8,-12],[.4,3.6,.8]);
 b.device({id:'block-lift',kind:'lift',automatic:true,cycle:true,label:'POWERED LIFT',position:[8,-.2,-7],size:[4,.4,4],target:[8,4,-7],targetLabel:'GALLERY',period:3.5,dwell:6,circuit:{all:['block-light']},controlOffset:[1.3,.9,1.3],controlFacing:[-1,0,0]});
 b.box('block-north-west',[-2.7,5.5,-14.2],[18.6,11,.4]);b.box('block-north-east',[10.7,5.5,-14.2],[2.6,11,.4]);
 b.box('block-upper-sill',[8,2.1,-14.2],[2.8,4.2,.4]);b.box('block-upper-header',[8,9.1,-14.2],[2.8,3.8,.4]);
 b.device({id:'block-upper-door',kind:'shutter',label:'POWERED EXIT',position:[8,5.7,-14.12],size:[2.8,3,.3],target:[8,9.2,-14.12],direction:[0,0,1],circuit:{all:['block-light']}});
 b.floor('block-upper-vestibule',6.6,9.4,-18.4,-13.8,4.2);b.box('block-upper-roof',[8,11.2,-16.1],[3.6,.4,5]);
 for(const x of [6.4,9.6])b.box('block-upper-side-'+x,[x,7.6,-16.1],[.4,6.8,5]);
 b.box('block-upper-end',[8,7.6,-18.6],[3.6,6.8,.4]);b.exitCorridor('powered-exit','block-upper-vestibule',{minX:6.62,maxX:9.38,minZ:-18.38,maxZ:-14.6});
 w.marks.push(
  {text:'OPEN HATCH',position:[5.5,2.2,3.91],normal:[0,0,1],width:1.6,height:.25},
  {text:'CARGO HATCH',position:[0,3.35,2.26],normal:[0,0,1],width:1.8,height:.25},
  {text:'SERVICE',position:[-11.94,1.3,8],normal:[1,0,0],width:1.5,height:.25},
  {text:'SERVICE',position:[-11.94,3.35,-10],normal:[1,0,0],width:1.5,height:.25},
  {text:'POWERED EXIT',position:[8,7.55,-13.94],normal:[0,0,1],width:1.9,height:.25},
 );
 w.routePoints={spawn:[7,.87,11],'front-view':[7,.865,6.8],'source-portal':[7,1.55,13.985],'return-portal':[-11.985,1.55,0],'hatch-control':[5.5,1.25,3.9],'hatch-probe':[0,.865,3.5],'cube-approach':[0,.865,1.4],'cube-park':[-2.8,.865,5],'service-drop':[-5.2,.865,8],'lift-wait':[8,.865,-3.5],'lift-board':[8,.865,-6.5],'upper-gallery':[8,5.065,-11],'powered-exit':[8,5.065,-17],'service-exit':[-15,.865,-10]};
 w.notes.push('Existing core01/laser-lift/references23 targets were independently displayed/read before the passive batch. This reuses the enclosed opaque hatch, original optics and powered-gallery kit; no new generated family is required. Raster apertures, circular props and rails are rejected as metric/asset evidence.',
  'Metric delta:24x28m continuous floor0 enclosure; actual south entry booth; central8x10 cargo alcove with switch-controlled opaque front hatch; lateral low beam physically blocked by a cube just inside; independent west SERVICE pressure and east4.2m powered gallery. There are no white hosts inside the cargo alcove or above3.5m.',
  'Place the walking pair from front-view[7,6.8], not from the fresh back-booth pose: the farther view strikes the actual opaque booth side. The real return shot through front glass clears the cargo alcove southwest corner. Decorative glazing visibility still needs actual review.',
  'The beam is blocked by cargo; cargo access is blocked by the hatch. Both true relations coexist in the same starting fixture. Actual switch opens access, actual light powers the lift, actual SERVICE pressure opens the lower route. Extra supplies are allowed; no empty-SERVICE, cargo-ID, used-hatch, past-error or grammar flag gates success.',
  'Source/prepared routes only until native execution. Required checks include in-range grab occlusion by the closed leaf, real opening/retrieval/clearance, both delivered outcomes, wrong route correction and an equivalent extra-SERVICE-powered lift. Continuous ground floor permits non-reset lift return.');
 return b.finish();
}

function timerOrTest(){
 const b=new ChamberBuilder(),w=b.world;w.family='split-atrium';w.spawn=[0,.87,11];
 b.floor('process-near-bank',-12,12,2,14);b.floor('inspection-lower-floor',-12,-2,-14,2);
 b.floor('process-far-bank',2,12,-14,-10);b.floor('process-catch',-12,12,-14,14,-4.4);
 b.box('process-roof',[0,11.2,0],[24.8,.4,28.8]);
 for(const x of [-12.2,12.2])b.box('process-side-'+x,[x,3.3,0],[.4,15.4,28.8]);
 b.box('process-south',[0,3.3,14.2],[24.8,15.4,.4]);
 b.box('process-central-pier',[0,3.3,-5.1],[4,15.4,18.6]);
 // Closed fresh booth; linked wall hosts remain before both operational gates.
 for(const x of [-3.2,3.2])b.box('process-booth-side-'+x,[x,5.5,11],[.4,11,6]);
 b.box('process-booth-glass',[0,5.5,8],[6.4,11,.16],'glass');
 b.box('process-waiting-host',[0,1.75,5.5],[3.8,3.5,.3]);
 b.panel('process-source','process-south',[0,1.75,13.985],[0,0,-1],5,3.5);
 b.panel('process-return','process-waiting-host',[0,1.75,5.665],[0,0,1],3.5,3.5);
 b.device({id:'inspection-clock',kind:'timer',automatic:true,label:'INSPECTION TIMER',position:[-7,1.3,8],size:[.8,1.2,.35],pulse:{period:14,onFor:7}});
 b.device({id:'test-release',kind:'switch',label:'TEST',position:[7,1.25,8],size:[.4,.7,.3],controlOffset:[0,0,.2]});
 const front=(id:string,x:number,z:number,left:number,right:number,y:number)=>{
  b.box(id+'-west-jamb',[(left+x-1.6)/2,3.3,z],[x-1.6-left,15.4,.4]);
  b.box(id+'-east-jamb',[(x+1.6+right)/2,3.3,z],[right-x-1.6,15.4,.4]);
  b.box(id+'-header',[x,(11+y+3)/2,z],[3.2,11-y-3,.4]);
 };
 front('inspection-first',-7,4,-12,-2,0);
 b.device({id:'inspection-first-leaf',kind:'shutter',label:'INSPECTION 1',position:[-7,1.5,4.08],size:[3.2,3,.3],target:[-7,5,4.08],direction:[0,0,1],circuit:{all:['inspection-clock']}});
 // Nine broad native-autostep risers lead to a real1.8m waiting/inspection floor.
 for(let i=0;i<9;i++){const top=(i+1)*.2;b.box('inspection-step-'+i,[-7,top/2,1.7-i*.6],[4,top,.6],'floor');}
 b.box('inspection-raised-floor',[-7,.9,-8.7],[10,1.8,10.6],'floor');
 front('inspection-second',-7,-6,-12,-2,1.8);
 b.device({id:'inspection-second-leaf',kind:'shutter',label:'INSPECTION 2',position:[-7,3.3,-5.92],size:[3.2,3,.3],target:[-7,6.8,-5.92],direction:[0,0,1],circuit:{all:['inspection-clock']}});
 // TEST releases the actual latch; current TEST-on also physically interlocks
 // carrier travel. Turning it off matters after release without any usedTEST flag.
 front('cargo-latch',7,4,2,12,0);
 b.device({id:'latched-cargo-hatch',kind:'shutter',label:'LATCHED CARGO',position:[7,1.5,4.08],size:[3.2,3,.3],target:[7,5,4.08],direction:[0,0,1],latch:true,circuit:{all:['test-release']}});
 b.device({id:'latched-freight-platform',kind:'moving-platform',automatic:true,label:'FREIGHT TRANSFER',position:[7,-.2,0],size:[4,.4,4],target:[7,-.2,-8],targetLabel:'FAR',period:5,dwell:6,stops:[{label:'NEAR',position:[7,-.2,0]},{label:'FAR',position:[7,-.2,-8]}],circuit:{all:['latched-cargo-hatch'],not:['test-release']}});
 for(const x of [5.7,8.3])b.box('latched-freight-guide-'+x,[x,-2.1,-4],[.16,.18,12]);
 // North enclosure and two genuinely different-height vestibules.
 front('inspection-north',-7,-14.2,-12,-2,1.8);
 b.box('inspection-north-sill',[-7,-1.3,-14.2],[3.2,6.2,.4]);
 b.floor('inspection-vestibule',-8.6,-5.4,-18.4,-13.8,1.8);
 b.box('inspection-vestibule-roof',[-7,11.2,-16.1],[4,.4,5]);
 for(const x of [-8.8,-5.2])b.box('inspection-vestibule-side-'+x,[x,6.4,-16.1],[.4,9.2,5]);
 b.box('inspection-vestibule-end',[-7,6.4,-18.6],[4,9.2,.4]);
 b.exitCorridor('inspection-exit','inspection-vestibule',{minX:-8.58,maxX:-5.42,minZ:-18.38,maxZ:-14.6});
 front('latched-freight-north',7,-14.2,2,12,0);
 b.box('latched-freight-north-sill',[7,-2.2,-14.2],[3.2,4.4,.4]);
 b.device({id:'latched-freight-exit-leaf',kind:'shutter',label:'FREIGHT EXIT',position:[7,1.5,-14.12],size:[3.2,3,.3],target:[7,5,-14.12],direction:[0,0,1],circuit:{all:['latched-cargo-hatch','at:latched-freight-platform:FAR'],not:['test-release']}});
 b.floor('latched-freight-vestibule',5.4,8.6,-18.4,-13.8);
 b.box('latched-freight-roof',[7,11.2,-16.1],[4,.4,5]);
 for(const x of [5.2,8.8])b.box('latched-freight-side-'+x,[x,5.5,-16.1],[.4,11,5]);
 b.box('latched-freight-end',[7,5.5,-18.6],[4,11,.4]);
 b.exitCorridor('latched-exit','latched-freight-vestibule',{minX:5.42,maxX:8.58,minZ:-18.38,maxZ:-14.6});
 for(let i=0;i<22;i++){const top=-4.2+i*.2;b.box('process-return-step-'+i,[10.5,(top-4.7)/2,-10.9+i*.6],[2.5,top+4.7,.6],'floor');}
 w.marks.push(
  {text:'INSPECTION',position:[-7,3.35,4.26],normal:[0,0,1],width:2,height:.25},
  {text:'TEST',position:[7,2.2,8.21],normal:[0,0,1],width:1,height:.25},
  {text:'LATCHED ROUTE',position:[7,3.35,4.26],normal:[0,0,1],width:2,height:.25},
  {text:'INSPECTION EXIT',position:[-7,5.15,-13.94],normal:[0,0,1],width:2.1,height:.25},
  {text:'FREIGHT EXIT',position:[7,3.35,-13.94],normal:[0,0,1],width:1.8,height:.25},
 );
 w.routePoints={spawn:[0,.87,11],'source-portal':[.55,1.55,13.985],'return-portal':[.55,1.55,5.665],'inspection-wait':[-7,.865,5.5],'inspection-first-inside':[-7,.865,2.8],'inspection-refuge':[-7,2.665,-4.5],'inspection-exit':[-7,2.665,-17],'test-control':[7,1.25,8.2],'test-approach':[7,.865,9.8],'test-detour':[9,.865,9.8],'freight-wait':[7,.865,2.8],'freight-near':[7,.865,0],'freight-far':[7,.865,-8],'far-wait':[7,.865,-11],'latched-exit':[7,.865,-17],'catch-low-end':[10.5,-3.535,-11.8]};
 w.notes.push('Existing references24 timer/manual architecture target independently displayed/read before34, with previously inspected core/optics/reference25 freight kit. No new family/image/model generation. Reject raster timer digits/white far corridors and continuous carrier guide as a bridge; preserve actual compact original props.',
  'Metric delta:24x28m split enclosed workshop, south glazed entry booth, two serial timer leaves on the west route with nine broad .6/.2m steps to a1.8m refuge/exit; an independently latched east hatch admits a4x4 carrier across the12m bank gap. Clock14s/on7s gives a real repeatable window, never a countdown score.',
  'TEST opens only the cargo latch. The carrier and its actual FAR dock exit require that latched open circuit AND TEST currently off. This is a physical maintenance interlock: no usedTest/minimum pulse/release-history evaluator flag. The timed route is independent and remains available under both instructions.',
  'All white hosts remain in the common near foyer, before either gate. The central pier/side boundaries seal branch exchange. Carrier guides top−2.01 and catch−4.4 are not bank-height walkways;22 broad .6/.2m treads return to near. Physical interrupted/wrong/return/catch routes and native door-clearance timing are still pending.',
  'SOURCE ONLY until native contracts run. A timer opening/latched release is not inferred from words. No cargo ID, visited gate, ride count, original source, earlier-error or English quiz state gates either destination.');
 return b.finish();
}

function theSupplyLoop(){
 const b=new ChamberBuilder(),w=b.world;w.family='relay-garden';w.spawn=[-12,.87,7];
 b.floor('loop-ground',-18,18,-10,10);b.box('loop-roof',[0,11.2,0],[36.8,.4,20.8]);
 for(const x of [-18.2,18.2])b.box('loop-side-'+x,[x,5.5,0],[.4,11,20.8]);
 // South SERVICE and north gallery have complete, differently elevated carpentry.
 b.box('loop-south-west',[-12.8,5.5,10.2],[10.4,11,.4]);
 b.box('loop-south-east',[6.8,5.5,10.2],[22.4,11,.4]);
 b.box('loop-service-header',[-6,7,10.2],[3.2,8,.4]);
 b.device({id:'loop-service-door',kind:'shutter',label:'SERVICE',position:[-6,1.5,10.12],size:[3.2,3,.3],target:[-6,5,10.12],direction:[0,0,-1],circuit:{all:['loop-service'],not:['loop-light']}});
 b.floor('loop-service-vestibule',-7.6,-4.4,9.8,14.4);
 b.box('loop-service-roof',[-6,11.2,12.1],[4,.4,5]);
 for(const x of [-7.8,-4.2])b.box('loop-service-side-'+x,[x,5.5,12.1],[.4,11,5]);
 b.box('loop-service-end',[-6,5.5,14.6],[4,11,.4]);
 b.exitCorridor('service-exit','loop-service-vestibule',{minX:-7.58,maxX:-4.42,minZ:10.6,maxZ:14.38});
 b.box('loop-north-west',[-2.8,5.5,-10.2],[30.4,11,.4]);
 b.box('loop-north-east',[16.8,5.5,-10.2],[2.4,11,.4]);
 b.box('loop-upper-sill',[14,2.1,-10.2],[3.2,4.2,.4]);
 b.box('loop-upper-header',[14,9.1,-10.2],[3.2,3.8,.4]);
 b.device({id:'loop-upper-door',kind:'shutter',label:'CONTROL GALLERY',position:[14,5.7,-10.12],size:[3.2,3,.3],target:[14,9.2,-10.12],direction:[0,0,1],circuit:{all:['loop-light','access-pressure']}});
 b.floor('loop-upper-vestibule',12.4,15.6,-14.4,-9.8,4.2);
 b.box('loop-upper-roof',[14,11.2,-12.1],[4,.4,5]);
 for(const x of [12.2,15.8])b.box('loop-upper-side-'+x,[x,7.6,-12.1],[.4,6.8,5]);
 b.box('loop-upper-end',[14,7.6,-14.6],[4,6.8,.4]);
 b.exitCorridor('control-exit','loop-upper-vestibule',{minX:12.42,maxX:15.58,minZ:-14.38,maxZ:-10.6});
 // Both slots are actual .8m square holes at beam height. They pass light, not
 // the upright capsule or1.1m cargo. Glass transmits portal shots, not the beam.
 const slotWall=(prefix:string,x:number,nearCubby:boolean)=>{
  b.box(prefix+'-north',[x,5.5,-7.2],[.16,11,5.6],nearCubby?'glass':'wall');
  b.box(prefix+'-sill',[x,.125,-4],[.16,.25,.8],nearCubby?'glass':'wall');
  b.box(prefix+'-slot-header',[x,6.025,-4],[.16,9.95,.8],nearCubby?'glass':'wall');
  if(nearCubby)b.box(prefix+'-south',[x,5.5,3.2],[.16,11,13.6],'glass');
  else{
   b.box(prefix+'-middle',[x,5.5,-2.6],[.16,11,2]);
   b.box(prefix+'-south',[x,5.5,5.8],[.16,11,8.4],'glass');
   b.box(prefix+'-door-header',[x,7,0],[.35,8,3.2]);
  }
 };
 slotWall('loop-cubby',-15,true);slotWall('loop-access-partition',0,false);
 b.device({id:'loop-access-door',kind:'shutter',label:'ACCESS',position:[-.08,1.5,0],size:[.3,3,3.2],target:[-.08,5,0],direction:[-1,0,0],circuit:{any:['access-pressure','loop-return-control']}});
 // This far-side manual return opens ACCESS only. It is not a supply for the
 // lift or upper leaf, so interrupting pressure never traps a player or wins it.
 b.device({id:'loop-return-control',kind:'switch',label:'ACCESS RETURN',position:[2.5,1.25,-4],size:[.4,.7,.3],controlOffset:[0,0,.2]});
 b.cube('loop-near-cube',[-12,.55,4]);b.cube('loop-block-cube',[-16.3,.55,-4]);
 b.button('access-pressure',[-3,.14,-7]);w.pads.at(-1)!.label='ACCESS';
 b.button('loop-service',[-9,.14,6]);w.pads.at(-1)!.label='SERVICE';
 b.box('loop-emitter-housing',[-17.75,.65,-4],[.6,1.3,.8]);
 b.box('loop-receiver-pillar',[8.45,1.5,-4],[.6,3,1.4]);
 b.box('loop-receiver-body',[8.4,.65,-4],[.4,.8,.8]);
 b.panel('loop-source','loop-south-west',[-12,1.75,9.985],[0,0,-1],5,3.5);
 b.panel('loop-return','loop-side--18.2',[-17.985,1.75,4],[1,0,0],5,3.5);
 b.floor('loop-control-gallery',10,18,-10,-2,4.2);
 for(const x of [10.4,17.6])b.box('loop-gallery-pier-'+x,[x,1.8,-8],[.4,3.6,.8]);
 b.device({id:'loop-lift',kind:'lift',automatic:true,cycle:true,label:'CONTROL GALLERY',position:[14,-.2,0],size:[4,.4,4],target:[14,4,0],targetLabel:'GALLERY',period:3.5,dwell:6,circuit:{all:['loop-light','access-pressure']},controlOffset:[1.3,.9,1.3],controlFacing:[-1,0,0]});
 w.marks.push(
  {text:'ACCESS',position:[-.27,3.35,0],normal:[-1,0,0],width:1.7,height:.25},
  {text:'ACCESS RETURN',position:[2.5,2.2,-3.79],normal:[0,0,1],width:1.9,height:.25},
  {text:'SERVICE',position:[-6,3.35,9.94],normal:[0,0,-1],width:1.5,height:.25},
  {text:'CONTROL GALLERY',position:[14,7.55,-9.94],normal:[0,0,1],width:2.6,height:.25},
 );
 w.routePoints={spawn:[-12,.87,7],'source-portal':[-12,1.55,9.985],'return-portal':[-17.985,1.55,4],'near-cargo-approach':[-12,.865,5.8],'access-drop':[-4.8,.865,-7],'blocked-cargo-approach':[-17.2,.865,-2.2],'return-approach':[-16.8,.865,4],'blocker-parking':[-6.2,.865,4],'access-near':[-1.5,.865,0],'access-far':[2,.865,0],'far-return-control':[2.5,1.25,-3.8],'far-return-approach':[2.5,.865,-2.2],'lift-wait':[14,.865,3.5],'lift-board':[14,.865,.5],gallery:[14,5.065,-5],'control-exit':[14,5.065,-13],'service-drop':[-10.8,.865,6],'service-exit':[-6,.865,13]};
 w.notes.push('Family reuse inspected before authorship: core01 remote glazed cargo, laser-lift and references21/23 actual independent supply/optical obstruction kit. No new target/image/model generation. Reject raster optics, rails as walkways and any generated cargo markings; original rectangular optics/diamond cargo remain authoritative.',
  'Metric delta:36x20m two-room enclosed plant. The west3m glazed cubby holds real beam-blocking cargo; a South-to-West low walking pair retrieves it. A fixed ray passes two real .8x.8 low slots to the far receiver. ACCESS is a separate current cargo-pressure pedestrian leaf; the far4.2m gallery lift and upper leaf require both actual light and pressure. Low white bands exist only west of ACCESS.',
  'A separate south SERVICE vestibule needs actual SERVICE pressure and receiver darkness. The fixed optical arrangement replaces the draft two-turn beam plan: cargo movement, rather than arbitrary alignment chores, supplies light. Both ordinary cubes can physically clear/maintain equivalent current supplies; no cargo identity, remembered portal/test/ride flag or source wording enters wiring.',
  'ACCESS RETURN is a genuine far-side manual escape for the ground loop and opens only ACCESS. It never powers the lift or upper leaf. Continuous ground catches gallery misses. Public aiming/legibility/audio/save and native routes are pending until individually executed; this export is unregistered author source.');
 return b.finish();
}

export const draftPassiveLevels:CoreLevel[]=[{
 number:31,...passiveEnglish[31],architecture:{height:11,halfWidth:12,style:'graphite'},startYaw:.2,expectedExit:'button-exit',blueprint:whichSupply,
 optics:{emitters:[{id:'supply-emitter',position:[9,.9,8],direction:[1,0,0],range:65}],receivers:[{id:'wall-light',position:[0,.9,-7.6],normal:[0,0,1],radius:.34}]},
 wrongExitFeedback:'This gallery is supplied by the light receiver. The instruction asks for the hatch opened by the floor button; maintain pressure and use that storage hatch.',
 contrast:{...passiveEnglish[31].contrast!,expectedExit:'receiver-exit',wrongExitFeedback:'This storage hatch is supplied by floor pressure. The changed instruction asks for receiver light and its gallery route.'},
},{
 number:32,...passiveEnglish[32],architecture:{height:11,halfWidth:12,style:'graphite'},startYaw:.1,recoveryY:-7.5,expectedExit:'freight-exit',blueprint:carriedOrPowered,
 wrongExitFeedback:'This is SERVICE with carrier power removed. The instruction asks for the carried cargo on RELEASE while POWER stays supplied for the freight gallery.',
 contrast:{...passiveEnglish[32].contrast!,expectedExit:'service-exit',wrongExitFeedback:'The freight gallery needs both POWER and RELEASE. The changed instruction removes POWER and reallocates it to the lower SERVICE route.'},
},{
 number:33,...passiveEnglish[33],architecture:{height:11,halfWidth:12,style:'graphite'},startYaw:.1,expectedExit:'powered-exit',blueprint:whatIsBlocked,
 optics:{emitters:[{id:'blocked-emitter',position:[-3,.65,-.4],direction:[1,0,0],range:20}],receivers:[{id:'block-light',position:[3,.65,-.4],normal:[-1,0,0],radius:.32}]},
 wrongExitFeedback:'The cube has reached SERVICE. This instruction asks you to clear the beam and take the receiver-powered lift, which is a different real route.',
 contrast:{...passiveEnglish[33].contrast!,expectedExit:'service-exit',wrongExitFeedback:'This is the receiver-powered gallery. The changed instruction asks for the cube behind the hatch to be delivered to SERVICE.'},
},{
 number:34,...passiveEnglish[34],architecture:{height:11,halfWidth:12,style:'graphite'},recoveryY:-7.5,expectedExit:'inspection-exit',blueprint:timerOrTest,
 wrongExitFeedback:'This is the latched freight route released by TEST. The instruction asks for the timer-opened inspection shutters and their stepped passage.',
 contrast:{...passiveEnglish[34].contrast!,expectedExit:'latched-exit',wrongExitFeedback:'This is the repeating timer passage. The changed instruction asks for the hatch released by TEST and retained by its latch.'},
},{
 number:35,...passiveEnglish[35],architecture:{height:11,halfWidth:18,style:'graphite'},startYaw:.1,expectedExit:'control-exit',blueprint:theSupplyLoop,
 optics:{emitters:[{id:'loop-emitter',position:[-17.3,.65,-4],direction:[1,0,0],range:40}],receivers:[{id:'loop-light',position:[8,.65,-4],normal:[-1,0,0],radius:.32}]},
 wrongExitFeedback:'This is the lower SERVICE route with the receiver dark. The instruction asks for maintained ACCESS pressure and a lit receiver supplying the control gallery.',
 contrast:{...passiveEnglish[35].contrast!,expectedExit:'service-exit',wrongExitFeedback:'This is the supplied upper control gallery. The changed instruction asks for SERVICE pressure while the receiver stays dark.'},
}];
