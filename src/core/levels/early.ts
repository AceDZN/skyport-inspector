/** Explicit enclosed chamber fixtures. Language selects a route; it never generates geometry. */
import type {CoreLevel} from '../level';
import {ChamberBuilder} from '../level-kit';
import {earlyEnglish} from './early-english';

function observationBays(){
 const b=new ChamberBuilder(),w=b.world;
 w.family='threshold';w.spawn=[-6,.87,0];
 b.floor('observation-floor',-8,8,-14,14);
 b.box('west-wall',[-8.2,3.5,0],[.4,7,28]);
 b.box('east-wall',[8.2,3.5,0],[.4,7,28]);
 b.box('observation-ceiling',[0,7.2,0],[16.8,.4,28.8]);
 // Parallel bays are sealed by one longitudinal glass plane, not an end-on cube alcove.
 b.box('observation-window',[0,3.5,0],[.16,7,28],'glass');
 for(const [name,z,normal] of [['north',-14.2,1],['south',14.2,-1]] as const){
  b.box(name+'-west-jamb',[-6.7,3.5,z],[2.6,7,.4]);
  b.box(name+'-east-wall',[2.7,3.5,z],[10.6,7,.4]);
  b.box(name+'-door-header',[-4,5,z],[2.8,4,.4]);
  const doorZ=z+normal*.08;
  b.device({id:name+'-door',kind:'shutter',label:name.toUpperCase(),position:[-4,1.5,doorZ],size:[2.8,3,.3],target:[-4,5,doorZ],direction:[0,0,normal],circuit:{all:[name==='north'?'behind-button':'front-button']}});
  const endZ=name==='north'?-18.2:18.2,midZ=(z+endZ)/2;
  b.floor(name+'-vestibule-floor',-5.4,-2.6,Math.min(z+normal*.4,endZ),Math.max(z+normal*.4,endZ));
  b.box(name+'-vestibule-ceiling',[-4,7.2,midZ],[3.6,.4,4.4]);
  for(const x of [-5.6,-2.4])b.box(name+'-vestibule-side-'+x,[x,3.5,midZ],[.4,7,4.4]);
  b.box(name+'-vestibule-end',[-4,3.5,endZ],[3.6,7,.4]);
  b.exit(name+'-exit',[-4,.86,name==='north'?-16.6:16.6],[1.8,1.8,1.6]);
  w.marks.push({text:name.toUpperCase(),position:[-4,3.35,z+normal*.24],normal:[0,0,normal],width:1.3,height:.24});
 }
 // White is a truthful, full eligible wall bay. End walls/vestibules remain graphite.
 b.panel('west-ceramic','west-wall',[-7.985,3.5,0],[1,0,0],28,7);
 b.panel('east-ceramic','east-wall',[7.985,3.5,0],[-1,0,0],28,7);
 // A physical graphite entry inlay is explicitly ineligible; signs never cover an eligible white plane.
 b.box('entry-service-inlay',[-7.85,1.25,0],[.42,2.5,1.4]);
 for(const side of [-1,1])for(let z=-12;z<=12;z+=4)b.box('structural-rib-'+side+'-'+z,[side*7.88,3.5,z],[.22,7,.18]);
 b.button('front-button',[-3,.14,0]);b.button('behind-button',[3,.14,0]);
 b.cube('cube',[-5,.55,3]);
 w.marks.push({text:'ENTRY',position:[-7.61,1.1,0],normal:[1,0,0],width:.8,height:.22});
 w.routePoints={entry:[-6,.87,0],'source-portal':[-7.96,1.55,6],'remote-portal':[7.96,1.55,6],'front-button':[-3,.14,0],'behind-button':[3,.14,0],'north-door':[-4,.87,-13],'south-door':[-4,.87,13]};
 w.notes.push('Fixed west entrance faces east: west button is in front of glass; east button is behind it. Both doors and vestibules remain real under either instruction.','Buttons are five metres from the nearest eligible wall, so player pressure cannot be maintained while using a wall portal. No cargo identity or action-order completion flag.','Aim through clear glass at the remote east ceramic wall; carry the cube through the west/east portal pair, leave it on the selected button, return and take the visibly named door.');
 return b.finish();
}

const english3=earlyEnglish[3];
export const earlyLevels:CoreLevel[]=[{
 number:3,...english3,architecture:{height:7,halfWidth:8,style:'ceramic'},startYaw:-Math.PI/2,expectedExit:'north-exit',
 wrongExitFeedback:'This is the south door. Return to the window and put the cube on the button behind it to open the north door.',
 blueprint:observationBays,
 contrast:{...english3.contrast!,expectedExit:'south-exit',wrongExitFeedback:'This is the north door. Return to the window and put the cube on the button in front of it to open the south door.'},
}];

function maintenanceL(){
 const b=new ChamberBuilder(),w=b.world;w.family='l-gallery';w.spawn=[-5,.87,7];
 b.floor('maintenance-main-floor',-8,0,-12,12);b.floor('east-branch-floor',0,8,-2,6);
 b.box('maintenance-west-wall',[-8.2,3.5,0],[.4,7,24]);
 b.box('remote-north-wall',[-4,3.5,-12.2],[8.8,7,.4]);
 b.box('source-south-wall',[-4,3.5,12.2],[8.8,7,.4]);
 b.box('remote-east-wall',[.2,3.5,-7],[.4,7,10]);
 b.box('source-east-return',[.2,3.5,9],[.4,7,6]);
 b.box('branch-north-wall',[4,3.5,-2.2],[8,7,.4]);
 b.box('branch-south-wall',[4,3.5,6.2],[8,7,.4]);
 b.box('maintenance-main-ceiling',[-4,7.2,0],[8.8,.4,24.8]);
 b.box('branch-ceiling',[4,7.2,2],[8.8,.4,8.8]);
 // The closed opaque access partition blocks the actual remote-wall sight line.
 b.box('access-west-jamb',[-6.8,3.5,-2],[2.4,7,.4]);
 b.box('access-east-jamb',[-1.2,3.5,-2],[2.4,7,.4]);
 b.box('access-header',[-4,5,-2],[3.2,4,.4]);
 b.device({id:'access-door',kind:'shutter',label:'ACCESS',position:[-4,1.5,-2],size:[3.2,3,.3],target:[-4,5,-2],direction:[0,0,1],circuit:{all:['maintenance-button']}});
 // The final branch and recess are deliberately dark, with no portal-capable bypass behind this door.
 b.box('exit-north-jamb',[8.2,3.5,-.75],[.4,7,2.5]);
 b.box('exit-south-jamb',[8.2,3.5,4.75],[.4,7,2.5]);
 b.box('exit-header',[8.2,5,2],[.4,4,3]);
 b.device({id:'exit-door',kind:'shutter',label:'EXIT',position:[8.12,1.5,2],size:[.3,3,3],target:[8.12,5,2],direction:[-1,0,0],circuit:{all:['maintenance-button']}});
 b.floor('exit-vestibule-floor',7.8,12, .5,3.5);
 b.box('exit-vestibule-ceiling',[10,7.2,2],[4.8,.4,3.8]);
 b.box('exit-vestibule-end',[12.2,3.5,2],[.4,7,3.8]);
 for(const z of [.3,3.7])b.box('exit-vestibule-side-'+z,[10,3.5,z],[4.8,7,.4]);
 b.exit('exit',[10.7,.86,2],[1.8,1.8,1.8]);
 b.panel('source-west','maintenance-west-wall',[-7.985,3.5,0],[1,0,0],24,7);
 b.panel('remote-north','remote-north-wall',[-4,3.5,-11.985],[0,0,1],8,7);
 b.panel('source-south','source-south-wall',[-4,3.5,11.985],[0,0,-1],8,7);
 for(let z=-12;z<=12;z+=4)b.box('structural-rib--1-'+z,[-7.88,3.5,z],[.22,7,.18]);
 for(const z of [0,4])b.box('structural-rib-1-'+z,[7.88,3.5,z],[.22,7,.18]);
 b.button('maintenance-button',[-4,.14,2]);b.cube('cube',[-4,.55,-8]);
 w.marks.push({text:'ACCESS',position:[-4,3.35,-1.75],normal:[0,0,1],width:1,height:.22},{text:'EXIT',position:[7.94,3.35,2],normal:[-1,0,0],width:.8,height:.22});
 w.routePoints={button:[-4,.14,2],'source-portal':[-7.96,1.55,6],'remote-portal':[-4,1.55,-11.96],cube:[-4,.55,-8],exit:[10.7,.86,2]};
 w.notes.push('Stand on the button to raise opaque access-door. Aim a remote-north portal through its real aperture; a source-west portal at z6 remains available after stepping off.','Both shutters use the same real pressure flag. Retrieve the cube through the pair after the access shutter closes, return it to maintenance-button, then traverse the dark east exit branch.','Button-to-access gap and button-to-exit route prevent a player-pressure sprint. No timer latch, pickup-history gate or cargo-specific completion flag.');
 return b.finish();
}

function splitHeightAnd(){
 const b=new ChamberBuilder(),w=b.world;w.family='split-atrium';w.spawn=[0,.87,11];
 b.floor('split-main-floor',-9,9,-12,14);
 b.box('split-ceiling',[0,10.2,1],[18.8,.4,26.8]);
 b.box('split-west-wall',[-9.2,5,1],[.4,10,26]);
 b.box('source-south-wall',[0,5,14.2],[18.8,10,.4]);
 b.box('low-north-wall',[-5,5,-12.2],[8,10,.4]);
 b.box('central-north-wall',[0,5,-12.2],[2,10,.4]);
 b.box('high-north-wall',[5,5,-12.2],[8,10,.4]);
 // Low western glass cell is sealed at both ends; the opaque spine prevents walking around it.
 b.box('low-cell-glass',[-5,5,0],[8,10,.16],'glass');
 b.box('low-cell-spine',[-1,5,-6],[.25,10,12]);
 // Distinct high retrieval route: an actual 3.4m gallery, not another same-height glass bay.
 b.box('upper-gallery',[5,1.7,-6.5],[8,3.4,11],'floor');
 b.box('east-north-jamb',[9.2,5,-10.75],[.4,10,2.5]);
 b.box('east-south-wall',[9.2,5,3.75],[.4,10,20.5]);
 b.box('east-door-sill',[9.2,1.7,-8],[.4,3.4,3]);
 b.box('east-door-header',[9.2,8.2,-8],[.4,3.6,3]);
 b.device({id:'exit-door',kind:'shutter',label:'EXIT',position:[9.12,4.9,-8],size:[.3,3,3],target:[9.12,8.4,-8],direction:[-1,0,0],circuit:{all:['lower-button','upper-button']}});
 b.floor('exit-vestibule-floor',8.8,13,-9.5,-6.5,3.4);
 b.box('exit-vestibule-ceiling',[11,10.2,-8],[4.8,.4,3.8]);
 b.box('exit-vestibule-end',[13.2,6.7,-8],[.4,6.6,3.8]);
 for(const z of [-9.7,-6.3])b.box('exit-vestibule-side-'+z,[11,6.7,z],[4.8,6.6,.4]);
 b.exit('exit',[11.7,4.26,-8],[1.8,1.8,1.8]);
 b.panel('source-south','source-south-wall',[0,5,13.985],[0,0,-1],18,10);
 b.panel('low-north','low-north-wall',[-5,5,-11.985],[0,0,1],8,10);
 b.panel('high-north','high-north-wall',[5,6.7,-11.985],[0,0,1],8,6.6);
 for(const side of [-1,1])for(let z=-12;z<=12;z+=4){if(side===1&&z===-8)continue;b.box('structural-rib-'+side+'-'+z,[side*8.88,5,z],[.22,10,.18]);}
 b.cube('cube-a',[-5,.55,-8]);b.cube('cube-b',[6,3.95,-8]);
 b.button('lower-button',[-4,.14,6]);b.button('upper-button',[4,3.54,-4]);
 w.marks.push({text:'EXIT',position:[8.935,6.75,-8],normal:[-1,0,0],width:.8,height:.22});
 w.routePoints={'source-portal':[4,1.55,13.96],'low-portal':[-5,1.55,-11.96],'high-aim-position':[4,.87,13.35],'high-portal':[5,4.95,-11.96],'lower-button':[-4,.14,6],'upper-button':[4,3.54,-4],exit:[11.7,4.26,-8]};
 w.notes.push('Two identical original diamond cubes and two real pressure inputs. Either assignment satisfies the exit AND; no identity or order flag.','Retrieve the western low cube through the glass by a south-to-low-north pair. Aim the high-north portal from the rear of the source room (z13.35) so the ray clears the gallery front at z-1; y4.95 is floor-aligned on the 3.4m gallery for full capsule support.','One viable plan: leave low cube on lower-button; change remote portal to high-north; retrieve high cube onto upper-button; walk to the east dark exit. The upper button is over six metres from its door, so player-only pressure cannot race that door.');
 return b.finish();
}

/** Registered by the lead for normal-route review; export name retained for independent fixture probes.
 * Unit/native checks alone are not public-input completion evidence. */
export const draftEarlyLevels:CoreLevel[]=[
 {number:4,...earlyEnglish[4],architecture:{height:7,halfWidth:8,style:'ceramic'},expectedExit:'exit',blueprint:maintenanceL},
 {number:5,...earlyEnglish[5],architecture:{height:10,halfWidth:9,style:'ceramic'},expectedExit:'exit',blueprint:splitHeightAnd},
];
