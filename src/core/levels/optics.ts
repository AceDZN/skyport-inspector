/** Unregistered optical-room draft. Physical fixtures never depend on mission wording. */
import type {CoreLevel} from '../level';
import {ChamberBuilder} from '../level-kit';

function receiverGallery(){
 const b=new ChamberBuilder(),w=b.world;w.family='relay-garden';w.spawn=[0,.87,11];
 b.floor('relay-floor',-9,9,-12,14);
 b.box('relay-ceiling',[0,10.2,1],[18.8,.4,26.8]);
 b.box('east-wall',[9.2,5,1],[.4,10,26.8]);
 b.box('south-wall',[0,5,14.2],[18.8,10,.4]);
 // The lower service route and upper gallery are two real, independently wired destinations.
 b.box('west-rear-wall',[-9.2,5,-10.25],[.4,10,3.5]);
 b.box('west-source-wall',[-9.2,5,4.25],[.4,10,19.5]);
 b.box('lower-door-header',[-9.2,6.5,-7],[.4,7,3]);
 b.device({id:'lower-door',kind:'shutter',label:'LOWER SERVICE',position:[-9.12,1.5,-7],size:[.3,3,3],target:[-9.12,5,-7],direction:[1,0,0],circuit:{not:['gallery-receiver']}});
 b.floor('lower-vestibule-floor',-13,-8.8,-8.5,-5.5);
 b.box('lower-vestibule-ceiling',[-11,10.2,-7],[4.8,.4,3.8]);
 for(const z of [-8.7,-5.3])b.box('lower-vestibule-side-'+z,[-11,5,z],[4.8,10,.4]);
 b.box('lower-vestibule-end',[-13.2,5,-7],[.4,10,3.8]);
 b.exit('lower-exit',[-11.7,.86,-7]);
 b.box('north-receiver-wall',[-2.45,5,-12.2],[13.1,10,.4]);
 b.box('north-east-jamb',[7.95,5,-12.2],[2.1,10,.4]);
 b.box('upper-door-sill',[5.5,1.7,-12.2],[2.8,3.4,.4]);
 b.box('upper-door-header',[5.5,8.2,-12.2],[2.8,3.6,.4]);
 b.device({id:'upper-door',kind:'shutter',label:'UPPER EXIT',position:[5.5,4.9,-12.12],size:[2.8,3,.3],target:[5.5,8.4,-12.12],direction:[0,0,1],circuit:{all:['gallery-receiver']}});
 b.floor('upper-vestibule-floor',4.1,6.9,-16,-11.8,3.4);
 b.box('upper-vestibule-ceiling',[5.5,10.2,-14.1],[3.6,.4,4.6]);
 for(const x of [3.9,7.1])b.box('upper-vestibule-side-'+x,[x,6.7,-14.1],[.4,6.6,4.6]);
 b.box('upper-vestibule-end',[5.5,6.7,-16.2],[3.6,6.6,.4]);
 b.exit('upper-exit',[5.5,4.26,-14.7]);
 // A full-height observation partition, with a genuine powered pedestrian doorway.
 b.box('observation-west',[-3.05,5,0],[11.9,10,.16],'glass');
 b.box('observation-east',[7.55,5,0],[2.9,10,.16],'glass');
 b.box('access-header',[4.5,6.5,0],[3.2,7,.3]);
 b.device({id:'access-door',kind:'shutter',label:'ACCESS',position:[4.5,1.5,0],size:[3.2,3,.3],target:[4.5,5,0],direction:[0,0,1],circuit:{all:['gallery-receiver']}});
 b.box('upper-gallery',[5.5,1.7,-10],[7,3.4,4],'floor');
 // Optical power brakes this automatic shuttle in place. It resumes its own phase;
 // it never jumps to a global clock position and never requires a hidden used-lift flag.
 b.device({id:'gallery-lift',kind:'lift',automatic:true,cycle:true,label:'GALLERY LIFT',position:[4.5,-.2,-6],size:[4,.4,4],target:[4.5,3.2,-6],targetLabel:'GALLERY',period:3,dwell:5,controlOffset:[-1.4,1.4,1.4],circuit:{all:['gallery-receiver']}});
 // White bands end at3.1m: neither portal can bypass the3.4m gallery by walking or jumping.
 b.panel('source-band','west-source-wall',[-8.985,1.55,7],[1,0,0],6,3.1);
 b.panel('receiver-band','north-receiver-wall',[-4,1.55,-11.985],[0,0,1],6,3.1);
 // Rigid housings are authored alongside the optical lens poses in the level metadata.
 b.box('emitter-housing',[-5.12,.8,7],[.65,1.6,.8]);
 b.box('receiver-pillar',[-4,1.5,-4.72],[1.4,3,.4]);
 b.cube('beam-blocker',[-3,.55,6]);
 w.marks.push({text:'UPPER EXIT',position:[5.5,6.75,-11.94],normal:[0,0,1],width:1.5,height:.25},{text:'LOWER SERVICE',position:[-8.94,3.35,-7],normal:[1,0,0],width:1.8,height:.25});
 w.routePoints={aim:[0,.87,11],'source-portal':[-8.985,1.55,7],'receiver-portal':[-4,1.55,-11.985],'access-approach':[4.5,.87,2],'lift-base':[4.5,.87,-5.5],'gallery':[5.5,4.26,-9.4],'upper-exit':[5.5,4.26,-14.7],'lower-exit':[-11.7,.86,-7]};
 w.notes.push('DRAFT: target laser-lift-target.png was generated and inspected before authoring. Its image number06 is illustrative; this explicit fixture is planned11. Existing original diamond cargo and split-coil projector remain authoritative.','The emitter shoots west from(-5.5,1,7). The source portal turns its ray through the north-wall portal, whose +Z ray reaches the real receiver sphere before its solid pillar. Actual Rapier obstacles can block every segment.','Base: connect the beam, walk through powered ACCESS, board automatic lift, wait for its real ascent, then cross the docked gallery to UPPER EXIT. Lower service physically closes while powered. No launch/lift-use counter gates completion.','Contrast: leave the receiver unpowered and use an offset linked pair to enter the far room. LOWER SERVICE stays physically open; UPPER EXIT and ACCESS stay closed, lift stays braked. The same two routes and circuits remain present.','Blocking the beam brakes the shuttle at its current height; restoring it resumes smooth travel. An idle missed boarding can wait for the return cycle. Native routes, power interruptions, visual optics and normal-input proof remain required.');
 return b.finish();
}
const temporal='https://english.workbook.co.il/grade-8/chapter-11/connectors-and-time-clauses';
const functional='https://english.workbook.co.il/grade-8/chapter-12/reading-practical-texts-and-sources';
export const draftOpticalLevels:CoreLevel[]=[{
 number:11,name:'A Continuous Connection',chapter:'Timing and Sequence',mission:'Keep the beam on the receiver while the lift moves to the gallery. Use the upper exit.',he:'השאירו את הקרן על המקלט בזמן שהמעלית נעה אל הגלריה. צאו דרך היציאה העליונה.',architecture:{height:10,halfWidth:9,style:'graphite'},expectedExit:'upper-exit',blueprint:receiverGallery,
 wrongExitFeedback:'This is the lower service route. Connect the beam to power the lift and the upper exit.',
 optics:{emitters:[{id:'emitter',position:[-5.5,1,7],direction:[-1,0,0],range:80}],receivers:[{id:'gallery-receiver',position:[-4,1,-4.98],normal:[0,0,-1],radius:.34}]},
 sources:[{url:temporal,practice:'Read while as overlapping conditions: optical power must remain present during real lift motion. A power interruption physically brakes the lift; no past-action counter substitutes for it.'},{url:functional,practice:'Keep a practical instruction’s action, machine and named destination together. This is an original situated example, not a quoted exercise.'}],
 contrast:{mission:'Leave the receiver unpowered. Use the lower service door.',he:'השאירו את המקלט ללא מתח. צאו דרך דלת השירות התחתונה.',physicalChange:'An offset linked pair still lets the player traverse, but the receiver remains unpowered. The lower physical shutter is open instead of the powered access/upper route; all geometry, hardware and inventory are unchanged.',expectedExit:'lower-exit',wrongExitFeedback:'This is the upper route. Leave the receiver unpowered to open lower service.'},
}];
