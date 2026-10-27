/** Native read-only cue queries. Explicit isolated arrangements are not campaign wins. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {Vector3,Quaternion} from 'three';
import {queryHeldFootprint} from '../src/core/held-footprint';
import {poseMatrix,type Portal} from '../src/physics';
before(async()=>{await RAPIER.init();});
const v=(x=0,y=0,z=0)=>new Vector3(x,y,z);
function fixture(position=v(0,1.2,0),rotation=new Quaternion()){
 const physics=new RAPIER.World({x:0,y:-16,z:0}),names=new Map<number,string>();
 const box=(id:string,centre:Vector3,half:Vector3)=>{const c=physics.createCollider(RAPIER.ColliderDesc.cuboid(half.x,half.y,half.z).setTranslation(centre.x,centre.y,centre.z));names.set(c.handle,id);return c;};
 const body=physics.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(position.x,position.y,position.z).setRotation(rotation));
 const collider=physics.createCollider(RAPIER.ColliderDesc.cuboid(.55,.55,.55),body),cube={id:'cargo',pos:position,half:v(.55,.55,.55),rotation,collider};
 const ready=()=>physics.step();
 const query=(portals:readonly(Portal|undefined)[]=[])=>queryHeldFootprint(physics,cube,portals,c=>names.get(c.handle)??'other-body');
 return{physics,names,box,body,cube,ready,query};
}
function portal(index:number,centre:Vector3,normal:Vector3,up:Vector3):Portal{return{index,surfaceId:'test-host-'+index,center:centre,normal,up,matrix:poseMatrix(centre,normal,up)};}
test('rotated cargo cue follows actual native support and changes no body pose or velocity',()=>{
 const f=fixture(v(1,1.5,2),new Quaternion().setFromAxisAngle(v(0,1,0),Math.PI/4));try{
 f.box('floor',v(0,-.2,0),v(5,.2,5));f.ready();const before={p:f.body.translation(),q:f.body.rotation(),v:f.body.linvel()},cue=f.query();
 assert.ok(cue);assert.equal(cue.supportId,'floor');assert.ok(Math.abs(cue.height-.95)<.0001);assert.equal(cue.polygon.length,4);assert.ok(cue.polygon.every(p=>Math.abs(p.y)<.0001));assert.deepEqual({p:f.body.translation(),q:f.body.rotation(),v:f.body.linvel()},before);
 }finally{f.physics.free();}
});
test('button footprint clips to the real native cylinder instead of drawing a pad-sized target',()=>{
 const f=fixture(v(.6,1.2,0));try{
 f.box('floor',v(0,-.2,0),v(5,.2,5));const pad=f.physics.createCollider(RAPIER.ColliderDesc.cylinder(.07,.96).setTranslation(0,.07,0));f.names.set(pad.handle,'button');f.ready();const cue=f.query();
 assert.ok(cue);assert.equal(cue.supportId,'button');assert.ok(Math.abs(cue.point.y-.14)<.0001);assert.ok(cue.polygon.every(p=>Math.hypot(p.x,p.z)<=.949));assert.ok(Math.max(...cue.polygon.map(p=>p.x))<1.0);
 }finally{f.physics.free();}
});
test('a higher opaque or glass support wins the first native ray over the floor below',()=>{
 const f=fixture(v(0,2.4,0));try{f.box('floor',v(0,-.2,0),v(5,.2,5));f.box('glass-shelf',v(0,1.1,0),v(2,.1,2));f.ready();const cue=f.query();assert.ok(cue);assert.equal(cue.supportId,'glass-shelf');assert.ok(cue.polygon.every(p=>Math.abs(p.y-1.2)<.0001));}finally{f.physics.free();}
});
test('a partial pit edge clips the actual cargo projection to supported floor',()=>{
 const f=fixture(v(-.2,1.2,0));try{f.box('ledge',v(-1,-.2,0),v(1,.2,3));f.ready();const cue=f.query();assert.ok(cue);assert.ok(cue.polygon.every(p=>p.x<=-.0119));assert.ok(cue.polygon.some(p=>p.x<-.7));}finally{f.physics.free();}
});
test('mixed first obstructions suppress a footprint that would paint through a second body',()=>{
 const f=fixture();try{f.box('floor',v(0,-.2,0),v(5,.2,5));f.box('obstruction',v(.5,.2,.5),v(.13,.2,.13));f.ready();assert.equal(f.query(),null);}finally{f.physics.free();}
});
test('unsupported or distant cargo has no local floor cue',()=>{
 const f=fixture(v(0,5,0));try{f.box('floor',v(0,-.2,0),v(5,.2,5));f.ready();assert.equal(f.query(),null);}finally{f.physics.free();}
 const empty=fixture();try{empty.ready();assert.equal(empty.query(),null);}finally{empty.physics.free();}
});
test('linked floor opening suppresses a false landing while an unlinked host stays physical',()=>{
 const f=fixture();try{f.box('floor',v(0,-.2,0),v(5,.2,5));f.ready();const a=portal(0,v(0,.025,0),v(0,1,0),v(0,0,-1)),b=portal(1,v(4,1.55,0),v(-1,0,0),v(0,1,0));assert.ok(f.query([a,undefined]));assert.equal(f.query([a,b]),null);}finally{f.physics.free();}
});
test('a portal-straddling held body has no duplicated support cue',()=>{
 const f=fixture(v(0,1.2,.1));try{f.box('floor',v(0,-.2,0),v(5,.2,5));f.ready();const a=portal(0,v(0,1.55,0),v(0,0,1),v(0,1,0)),b=portal(1,v(4,1.55,0),v(-1,0,0),v(0,1,0));assert.equal(f.query([a,b]),null);}finally{f.physics.free();}
});
