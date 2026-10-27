/** Isolated native physics fixtures; these are not normal-input chamber completions. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {CoreWorld,initializePhysics} from '../src/core/world';
import {ChamberBuilder} from '../src/core/level-kit';
import type {CoreLevel} from '../src/core/level';
import {V} from '../src/physics';
const idle={forward:0,strafe:0,jump:false};
before(initializePhysics);
function definition(blueprint:CoreLevel['blueprint'],extra:Partial<CoreLevel>={}):CoreLevel{return{number:90,name:'Isolated machinery fixture',mission:'Test fixture',he:'',chapter:'Test',architecture:{height:8,halfWidth:8,style:'graphite'},sources:[],blueprint,...extra};}
function tick(w:CoreWorld,seconds:number){for(let i=0;i<seconds*120;i++)w.step(1/120,idle);}
function liftWorld(kind:'lift'|'moving-platform'){
 const b=new ChamberBuilder();b.world.spawn=[0,.87,0];b.floor('catch-floor',-10,10,-8,8,-3);
 b.device({id:'power',kind:'switch',label:'POWER',position:[-4,.7,0],size:[.2,.3,.2],initial:true});
 b.device({id:'carrier',kind, label:'LIFT',position:[0,-.2,0],size:[4,.4,4],target:kind==='lift'?[0,2.8,0]:[6,-.2,0],period:2,dwell:.5,circuit:{all:['power']}});
 return new CoreWorld(90,()=>{},definition(()=>b.finish()));
}
test('native lift carries a grounded capsule up and back down without teleporting or clipping its deck',()=>{
 const w=liftWorld('lift');try{tick(w,3);assert.ok(w.player.pos.y>3.7&&w.player.pos.y<3.95,w.player.pos.toArray().join(','));assert.ok(w.player.grounded);assert.ok(Math.abs(w.player.pos.y-.85-(w.machines.devices[1].position.y+.2))<.06,JSON.stringify({player:w.player.pos.toArray(),deck:w.machines.devices[1].position.toArray(),flags:w.machines.flags}));w.machines.interact('power');tick(w,3);assert.ok(w.player.pos.y>.84&&w.player.pos.y<.95,w.player.pos.toArray().join(','));assert.ok(w.player.grounded);}finally{w.dispose();}
});
test('a horizontal moving platform carries an idle capsule through a real cycle',()=>{
 const w=liftWorld('moving-platform');try{tick(w,3);assert.ok(w.player.pos.x>5.8,w.player.pos.toArray().join(','));assert.ok(w.player.grounded);tick(w,2.5);assert.ok(Math.abs(w.player.pos.x)<.2,w.player.pos.toArray().join(','));assert.ok(w.player.grounded);}finally{w.dispose();}
});
test('a deck-mounted lift control stays reachable at both physical stops',()=>{
 const b=new ChamberBuilder();b.world.spawn=[0,.87,0];b.floor('catch',-5,5,-5,5,-3);b.device({id:'lift',kind:'lift',label:'FREIGHT',position:[0,-.2,0],size:[4,.4,4],controlOffset:[0,1.4,-1.3],stops:[{label:'LOWER',position:[0,-.2,0]},{label:'UPPER',position:[0,2.8,0]}]});
 const w=new CoreWorld(90,()=>{},definition(()=>b.finish()));try{tick(w,.2);assert.equal(w.interact(),true);tick(w,3);assert.ok(w.player.pos.y>3.8);assert.equal(w.interact(),true,'The control was left behind at the old lift pose');tick(w,3);assert.ok(w.player.pos.y>.85&&w.player.pos.y<.95);}finally{w.dispose();}
});
test('conveyor transports a resting dynamic cube and a physical wall still stops it',()=>{
 const b=new ChamberBuilder();b.world.spawn=[-3,.87,3];b.floor('floor',-5,5,-5,5);b.device({id:'belt',kind:'conveyor',label:'BELT',position:[0,-.15,0],size:[8,.3,4],direction:[1,0,0],speed:1.7});b.cube('cargo',[0,.55,0]);b.box('stop',[2,1,0],[.3,2,4]);
 const w=new CoreWorld(90,()=>{},definition(()=>b.finish()));try{tick(w,.8);assert.ok(w.crates[0].pos.x>.3,w.crates[0].pos.toArray().join(','));tick(w,2);assert.ok(w.crates[0].pos.x<1.35,w.crates[0].pos.toArray().join(','));assert.ok(w.crates[0].pos.y>.5);}finally{w.dispose();}
});
test('E control requires a nearby visible physical control and toggles a real shutter circuit',()=>{
 const b=new ChamberBuilder();b.world.spawn=[0,.87,3];b.floor('floor',-5,5,-5,5);b.device({id:'control',kind:'switch',label:'ACCESS',position:[0,1.3,1.5],size:[.3,.5,.25]});b.door('gate',[3,1.5,0],[2,3,.3],{all:['control']});
 const w=new CoreWorld(90,()=>{},definition(()=>b.finish()));try{tick(w,.2);assert.equal(w.interact(),true);tick(w,1);assert.equal(w.machines.devices[0].on,true);assert.equal(w.machines.devices[1].progress,1);assert.ok(w.doors.get('gate')!.rigid.translation().y>4.9);}finally{w.dispose();}
 const blocked=new ChamberBuilder();blocked.world.spawn=[0,.87,3];blocked.floor('floor',-5,5,-5,5);blocked.box('opaque',[0,1.4,2],[2,2.8,.2]);blocked.device({id:'control',kind:'switch',label:'ACCESS',position:[0,1.3,1.5],size:[.3,.5,.25]});const hidden=new CoreWorld(90,()=>{},definition(()=>blocked.finish()));try{assert.equal(hidden.interact(),false);}finally{hidden.dispose();}
});
test('a portal-routed beam powers a physical shutter; a dynamic blocker removes power promptly',()=>{
 const b=new ChamberBuilder();b.world.spawn=[-3,.87,3];b.floor('floor',-4,4,-6,6);b.box('east',[4.2,3,0],[.4,6,12]);b.box('north',[0,3,-6.2],[8.8,6,.4]);b.panel('entry','east',[3.985,3,0],[-1,0,0],12,6);b.panel('exit','north',[0,3,-5.985],[0,0,1],8,6);b.cube('blocker',[-2,.55,3]);b.door('gate',[-2,1.5,-4],[2,3,.3],{all:['receiver']});
 const w=new CoreWorld(90,()=>{},definition(()=>b.finish(),{optics:{emitters:[{id:'emitter',position:[-3,.65,-2],direction:[1,0,0]}],receivers:[{id:'receiver',position:[0,.65,2],radius:.2}]}}));try{
  tick(w,.1);assert.equal(w.machines.devices[0].on,false);assert.equal(w.place(0,'entry',V(3.985,1.55,-2)),true);assert.equal(w.place(1,'exit',V(0,1.55,-5.985)),true);tick(w,1);assert.equal(w.beams.get('emitter')?.receiver,'receiver');assert.equal(w.beams.get('emitter')?.hops,1);assert.equal(w.machines.devices[0].progress,1);
  const cube=w.crates[0];cube.rigid.setTranslation(V(0,.55,0),true);cube.rigid.setLinvel(V(),true);w.physics.propagateModifiedBodyPositionsToColliders();w.step(1/120,idle);w.step(1/120,idle);assert.equal(w.beams.get('emitter')?.stop,'obstacle');assert.equal(w.machines.devices[0].on,false);tick(w,1);assert.equal(w.machines.devices[0].progress,0);
 }finally{w.dispose();}
});
test('a powered cyclic carrier starts, brakes, and resumes continuously with its own phase',()=>{
 const b=new ChamberBuilder();b.world.spawn=[-2,1.27,-.6];b.floor('catch',-8,8,-5,5,-3);b.device({id:'power',kind:'switch',label:'POWER',position:[-6,.7,0],size:[.2,.3,.2]});b.device({id:'carrier',kind:'moving-platform',automatic:true,label:'TRANSFER',position:[-2,.2,0],size:[4,.4,3],target:[2,.2,0],period:3.5,dwell:.2,circuit:{all:['power']}});b.cube('cargo',[-2,.95,.5]);
 const w=new CoreWorld(90,()=>{},definition(()=>b.finish()));try{
  tick(w,.6);const carrier=w.machines.devices[1],initial=carrier.position.clone();w.machines.interact('power');w.step(1/120,idle);assert.ok(carrier.position.distanceTo(initial)<.02,'Enabling at a later global time jumps the deck');tick(w,.8);const stopped=carrier.position.clone();w.machines.interact('power');w.step(1/120,idle);assert.ok(carrier.position.distanceTo(stopped)<.00001,'Power loss teleports instead of braking');tick(w,2);assert.ok(carrier.position.distanceTo(stopped)<.00001);assert.equal(w.events.filter(e=>e.type==='lift-arrival').length,0,'A mid-rail brake is not an arrival');assert.equal(w.events.filter(e=>e.type==='lift-brake').length,1);w.machines.interact('power');let previous=carrier.position.clone();for(let i=0;i<180;i++){w.step(1/120,idle);assert.ok(carrier.position.distanceTo(previous)<.02,'Resume advances to the global timer phase');previous.copy(carrier.position);}assert.ok(w.player.grounded);assert.ok(Math.abs(w.crates[0].pos.y-.95)<.07,'Loose cargo fell through its actual carrier');
 }finally{w.dispose();}
});
test('a physical dock contact cannot be triggered by selecting a lift stop before arrival',()=>{
 const b=new ChamberBuilder();b.world.spawn=[0,.87,0];b.floor('catch',-5,5,-5,5,-3);b.device({id:'lift',kind:'lift',label:'FREIGHT',position:[0,-.2,0],size:[4,.4,4],controlOffset:[0,1.4,-1.3],stops:[{label:'LOWER',position:[0,-.2,0]},{label:'UPPER',position:[0,2.8,0]}]});b.door('dock-gate',[4,4.5,0],[.3,3,2],{all:['at:lift:UPPER']});
 const w=new CoreWorld(90,()=>{},definition(()=>b.finish()));try{tick(w,.2);assert.equal(w.interact(),true);tick(w,.3);assert.equal(w.machines.flags['at:lift:UPPER'],false);assert.equal(w.machines.devices[1].progress,0);tick(w,3);assert.equal(w.machines.flags['at:lift:UPPER'],true);assert.ok(w.machines.devices[1].progress>.9);assert.equal(w.interact(),true);tick(w,.2);assert.equal(w.machines.flags['at:lift:UPPER'],false);}finally{w.dispose();}
});
