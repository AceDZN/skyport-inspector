/** Focused live-signal/physical-shutter contracts, not campaign play evidence. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {MachineSystems} from '../src/systems';
import {ChamberBuilder} from '../src/core/level-kit';
import {CoreWorld,initializePhysics} from '../src/core/world';
import type {CoreLevel} from '../src/core/level';
before(initializePhysics);
test('timers with opposite phases drive their actual shutter circuits in the same update',()=>{
 const m=new MachineSystems([{id:'gate-a',kind:'shutter',label:'A',position:[0,1.5,0],size:[3,3,.3],circuit:{all:['clock-a']}},{id:'gate-b',kind:'shutter',label:'B',position:[5,1.5,0],size:[3,3,.3],circuit:{all:['clock-b']}},{id:'clock-a',kind:'timer',automatic:true,label:'CLOCK A',position:[0,1,1],size:[.5,.6,.2],pulse:{period:4,onFor:2}},{id:'clock-b',kind:'timer',automatic:true,label:'CLOCK B',position:[5,1,1],size:[.5,.6,.2],pulse:{period:4,onFor:2,offset:2}}]);
 m.update(.5,[],{});assert.equal(m.flag('clock-a'),true);assert.equal(m.flag('clock-b'),false);assert.equal(m.devices[0].on,true);assert.equal(m.devices[1].on,false);m.update(2,[],{});assert.equal(m.flag('clock-a'),false);assert.equal(m.flag('clock-b'),true);assert.equal(m.devices[0].on,false);assert.equal(m.devices[1].on,true);assert.equal(m.interact('clock-a'),false);
});
test('an unpowered timer holds its own phase, then resumes without borrowing the global clock',()=>{
 const m=new MachineSystems([{id:'power',kind:'switch',label:'POWER',position:[0,0,0],size:[.3,.5,.2]},{id:'clock',kind:'timer',automatic:true,label:'WINDOW',position:[1,1,0],size:[.5,.6,.2],pulse:{period:4,onFor:1.5},circuit:{all:['power']}}]);
 m.update(5,[],{});assert.equal(m.devices[1].cycleTime,0);assert.equal(m.flag('clock'),false);m.interact('power');m.update(.4,[],{});assert.equal(m.flag('clock'),true);assert.ok(Math.abs(m.devices[1].progress-.1)<1e-8);m.interact('power');m.update(3,[],{});assert.ok(Math.abs(m.devices[1].progress-.1)<1e-8);assert.equal(m.flag('clock'),false);m.interact('power');m.update(.1,[],{});assert.ok(Math.abs(m.devices[1].cycleTime-.5)<1e-8);assert.equal(m.flag('clock'),true);
});
test('timer windows move a real Rapier leaf and shut it again when the window ends',()=>{
 const b=new ChamberBuilder();b.world.spawn=[-3,.87,3];b.floor('floor',-5,5,-5,5);b.door('gate',[0,1.5,0],[3,3,.3],{all:['clock']});b.device({id:'clock',kind:'timer',automatic:true,label:'WINDOW',position:[-4,1.1,0],size:[.5,.6,.2],pulse:{period:4,onFor:2}});const level:CoreLevel={number:90,name:'Timer fixture',mission:'Test',he:'',chapter:'Test',architecture:{height:8,halfWidth:5,style:'graphite'},sources:[],blueprint:()=>b.finish()};
 const w=new CoreWorld(90,undefined,level);try{const idle={forward:0,strafe:0,jump:false};for(let i=0;i<120;i++)w.step(1/120,idle);assert.equal(w.machines.devices[0].progress,1);assert.ok(w.doors.get('gate')!.rigid.translation().y>4.9);for(let i=0;i<250;i++)w.step(1/120,idle);assert.equal(w.machines.devices[0].progress,0);assert.ok(Math.abs(w.doors.get('gate')!.rigid.translation().y-1.5)<.001);}finally{w.dispose();}
});
