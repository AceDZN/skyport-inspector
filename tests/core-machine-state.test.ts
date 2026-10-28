import test from 'node:test';import assert from 'node:assert/strict';
import {observeLeaf,observeDock}from'../src/core/machine-state';import type{DeviceSpec}from'../src/systems';
const leaf:DeviceSpec={id:'leaf',kind:'shutter',label:'INPUT',position:[0,1.5,0],size:[.3,3,2.8],target:[0,5,0]},zero={x:0,y:0,z:0};
test('native leaf readings require real seated or fully-open stopped poses',()=>{
 assert.equal(observeLeaf(leaf,{x:0,y:1.5,z:0},zero).closed,true);
 assert.equal(observeLeaf(leaf,{x:0,y:3,z:0},zero).closed,false);assert.equal(observeLeaf(leaf,{x:0,y:3,z:0},zero).open,false);
 assert.equal(observeLeaf(leaf,{x:0,y:5,z:0},{x:0,y:4,z:0}).open,false);
 assert.equal(observeLeaf(leaf,{x:0,y:5,z:0},zero).open,true);
 const short={...leaf,target:[0,3,0] as [number,number,number]};assert.equal(observeLeaf(short,{x:0,y:3,z:0},zero).open,false);
});
test('native dock reading rejects selected but unarrived, passing and off-dock poses',()=>{
 const deck:DeviceSpec={id:'deck',kind:'lift',label:'RETURN',position:[0,-.2,0],size:[4,.4,4],stops:[{label:'BASIN',position:[0,-.2,0]},{label:'APPROACH',position:[0,21.8,0]}]};
 assert.equal(observeDock(deck,{x:0,y:21.8,z:0},{x:0,y:4,z:0}),undefined);assert.equal(observeDock(deck,{x:0,y:10,z:0},zero),undefined);assert.equal(observeDock(deck,{x:0,y:21.8,z:0},zero),'APPROACH');
});
