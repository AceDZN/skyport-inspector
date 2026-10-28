/** Pure simulation-clock/machine contracts. No browser or native-body completion proof. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdirSync,writeFileSync} from 'node:fs';
import {FixedStepClock} from '../src/core/fixed-step';
import {MachineSystems as RuntimeSystems} from '../src/systems';
const selected=process.env.RIFT_MOTION_SYSTEMS_SOURCE?await import(pathToFileURL(process.env.RIFT_MOTION_SYSTEMS_SOURCE).href):{MachineSystems:RuntimeSystems};
const MachineSystems=selected.MachineSystems as typeof RuntimeSystems;
const dt=1/120;
for(const frames of [[...Array(600)].map(()=>16.666666667),[...Array(1440)].map(()=>1000/144),[...Array(600)].map((_,i)=>[7.1,16.666666667,33.333333333,4.3][i%4])])test('render fractions produce only fixed physical ticks and retain elapsed time',()=>{
 const clock=new FixedStepClock();let simulated=0;
 for(const ms of frames){clock.add(ms);for(let slice;(slice=clock.take())!==undefined;){assert.equal(slice,dt);simulated+=slice;}}
 const supplied=frames.reduce((a,b)=>a+b,0)/1000;assert.ok(supplied-simulated>=-1e-9&&supplied-simulated<dt+1e-9,JSON.stringify({supplied,simulated}));
});
test('pause/reset cannot carry old input time into a new room',()=>{const c=new FixedStepClock();c.add(7);assert.equal(c.take(),undefined);c.reset();c.add(2);assert.equal(c.take(),undefined);c.add(7);assert.equal(c.take(),dt);assert.equal(c.take(),undefined);});
function machine(){return new MachineSystems([{id:'lift',kind:'lift',automatic:true,cycle:true,label:'LAB',position:[0,-.2,0],target:[0,3.2,0],size:[4,.4,4],period:3,dwell:.5,circuit:{all:['power']}}]);}
function report(name:string,data:unknown){const dir=process.env.RIFT_MOTION_RUN?new URL('../docs/chamber-qa/motion-events/'+process.env.RIFT_MOTION_RUN+'/',import.meta.url):new URL('../work/chamber-qa/motion-events/unit-'+Date.now()+'/',import.meta.url);mkdirSync(dir,{recursive:true});writeFileSync(new URL(name+'.json',dir),JSON.stringify({source:process.env.RIFT_MOTION_SYSTEMS_SOURCE??'current runtime systems',scope:'Pure actual MachineSystems motion/event contract; no body setup or earned gameplay.',data},null,2)+'\n');}
test('genuine continuous cycle does not report brakes at mixed tiny positive steps',()=>{
 const m=machine();for(let i=0;i<330;i++){m.update(dt,[],{power:true});m.update(1e-6,[],{power:true});}
 const events=m.events.filter(e=>e.type.startsWith('lift-'));report('continuous-mixed', {events,position:m.devices[0].position.toArray(),moving:m.devices[0].moving});
 assert.equal(m.devices[0].moving,true);assert.equal(events.filter(e=>e.type==='lift-brake').length,0);assert.equal(events.filter(e=>e.type==='lift-motor').length,1);
});
test('zero elapsed machine updates cannot invent a stop or advance time',()=>{
 const m=machine();for(let i=0;i<120;i++)m.update(dt,[],{power:true});assert.equal(m.devices[0].moving,true);
 const state={position:m.devices[0].position.clone(),clock:m.clock,events:m.events.length};
 m.update(0,[],{power:true});assert.equal(m.devices[0].moving,true);assert.equal(m.clock,state.clock);assert.equal(m.events.length,state.events);assert.ok(m.devices[0].position.equals(state.position));
});
test('fixed render cadence retains real power brake resume and physical arrival events',()=>{
 const m=machine(),clock=new FixedStepClock();
 function frames(n:number,power:boolean){for(let i=0;i<n;i++){clock.add(16.666666667);for(let t;(t=clock.take())!==undefined;)m.update(t,[],{power});}}
 frames(90,true);const stopped=m.devices[0].position.clone();assert.equal(m.devices[0].moving,true);frames(30,false);assert.ok(m.devices[0].position.distanceTo(stopped)<1e-12);assert.equal(m.devices[0].moving,false);frames(130,true);
 const events=m.events.filter(e=>e.type.startsWith('lift-'));report('real-brake-resume-arrival',{events,position:m.devices[0].position.toArray(),phase:m.devices[0].cycleTime});
 assert.equal(events.filter(e=>e.type==='lift-motor').length,2);assert.equal(events.filter(e=>e.type==='lift-brake').length,1);assert.equal(events.filter(e=>e.type==='lift-arrival').length,1);assert.ok(Math.abs(m.devices[0].position.y-3.2)<1e-8);
});
