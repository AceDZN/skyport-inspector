/** Actual C45 stationary-conveyor frame regression. Opt-in until the separately granted run.
 * Authored spawn, real cargo delivery/pressure, W-only belt entry and escape.
 * No actor/velocity/history/goal assignments and no clearance relaxation.
 */
import test,{before}from'node:test';
import assert from'node:assert/strict';
import{initializePhysics}from'../src/core/world';
import{V}from'../src/physics';
import RAPIER from'@dimforge/rapier3d-compat';
import{ConditionalRoute,conditionalRoute}from'./helpers/conditional-route';
const enabled=process.env.RIFT_C45_FLAT_ENTRY==='1';
before(async()=>{if(enabled)await initializePhysics();});
function optical(r:ConditionalRoute){
 assert.equal(r.w.heldId,undefined,'All pair reconfiguration remains unheld');r.walk(3,3);
 r.shot(0,'final-source',V(13.985,1.55,14.55));r.shot(1,'final-optical-return',V(-.45,1.55,3.985));r.tick(1);
 assert.equal(r.w.machines.flags['final-gallery-light'],true);assert.ok(r.device('final-cargo-sight').progress>.99);
}
function supply(r:ConditionalRoute){
 optical(r);r.walk(5.55,3);r.shot(1,'final-cargo-return',V(5.55,1.55,-17.985));r.tick(.2);
 assert.equal(r.w.machines.flags['final-gallery-light'],false);assert.ok(r.device('final-cargo-sight').progress>.99);
 r.walk(12.7,14.55);r.enter(0);r.walk(5,-17.2);r.pickup('final-cube');r.walk(5.55,-16.7);r.enter(1);
 assert.ok(r.cube('final-cube').crossings>0);r.walk(3.8,11);r.look(V(2,1.06,11));r.tick(.35);r.e();
 r.until(()=>r.pad('final-store').crateId==='final-cube',40,'Actual cargo did not pass the throat and reach STORE');
 for(let i=0;i<240;i++){r.step();assert.equal(r.pad('final-store').crateId,'final-cube','Actual STORE pressure must persist for all240 frames');}
 r.note('real-delivered-cargo-before-separate-body-approach');
}

function archive(r:ConditionalRoute){
 optical(r);const lift=r.device('final-archive-lift');
 assert.equal(r.pad('final-store').crateId,'final-cube');r.walk(4.5,8);r.walk(-2,6);r.walk(-6.2,6);
 r.until(()=>lift.moving,28,'Actual combined supplies never move lift');r.until(()=>!lift.moving&&Math.abs(lift.position.y+.2)<.02,28,'Actual BASE never returns');
 r.walk(-9,6);r.until(()=>r.w.player.grounded&&r.w.player.pos.y>5.01,18,'Actual lift never carries the capsule');
 r.until(()=>r.device('final-archive-dock').progress>.99,2,'Actual archive dock leaf never clears');r.walk(-12.5,6);r.walk(-17,6);r.finish('archive-exit');
}


/** Read-only observation around the actual runtime query, held query and step.
 * Wrappers delegate unchanged arguments and never change a native body. */
function observeBeltState(r:ConditionalRoute){
 const w=r.w,body=w.doors.get('final-store-belt')!.rigid;
 const counts={queries:0,fixedDuringQuery:0,physics:0,held:0};
 const state=()=>({type:body.bodyType(),pose:{...body.translation()},next:{...body.nextTranslation()},linear:{...body.linvel()},angular:{...body.angvel()}});
 const internal=w as unknown as{computeCharacterMovement(requested:ReturnType<typeof V>,platformCollider?:number):void};
 const compute=internal.computeCharacterMovement.bind(w);
 internal.computeCharacterMovement=(requested,platformCollider)=>{const before=state(),delta=requested.toArray();try{return compute(requested,platformCollider);}finally{assert.deepEqual(state(),before,'Stationary frame query changed native type/pose/target/velocity');assert.deepEqual(requested.toArray(),delta);counts.queries++;}};
 const native=w.controller.computeColliderMovement.bind(w.controller);
 w.controller.computeColliderMovement=(...args)=>{if(body.bodyType()===RAPIER.RigidBodyType.Fixed)counts.fixedDuringQuery++;return native(...args);};
 const physics=w.physics.step.bind(w.physics);
 w.physics.step=(...args)=>{assert.equal(body.bodyType(),RAPIER.RigidBodyType.KinematicPositionBased,'Query-only Fixed escaped into integration');counts.physics++;return physics(...args);};
 const held=w.holdController.computeColliderMovement.bind(w.holdController);
 w.holdController.computeColliderMovement=(...args)=>{assert.equal(body.bodyType(),RAPIER.RigidBodyType.KinematicPositionBased,'Query-only Fixed escaped into held cargo collision');counts.held++;return held(...args);};
 return counts;
}

test('native C45 stationary belt frame permits flat W approach to actual roof and flat escape',{skip:!enabled},()=>conditionalRoute(45,false,'flat-entry-stationary-frame-roof-and-escape',r=>{
 const observed=observeBeltState(r),belt=r.device('final-store-belt');
 assert.ok(Math.abs(belt.position.y+belt.spec.size[1]/2)<1e-6,'The exact original conveyor/floor geometry must be retained');
 assert.ok(Math.abs(r.pad('final-store').pos.y)<1e-6,'The actual STORE cell must remain flush to the physical belt');
 supply(r);r.walk(3.8,11);r.look(V(-6,r.w.eye().y,11));
 const roof=r.w.solids.find(s=>s.id==='final-cargo-throat-roof');assert.ok(roof);
 let entered=false,reached=false;
 for(let i=0;i<480;i++){
  r.step({forward:1,strafe:0,jump:false});
  if(r.w.player.pos.x<2.5&&r.w.player.pos.x> -3.2){entered=true;assert.ok(Math.abs(r.w.player.pos.y-.865)<.08,'Flat entry must stand on the actual unchanged belt top');}
  if(i%24===0)r.note('flat-W-roof-approach-'+i);
  if(r.contacts().some(c=>c.id===roof.id)){reached=true;break;}
 }
 assert.ok(entered,'The body must actually pass the original east belt-entry pin');
 assert.ok(reached,'Actual low roof contact must be reached with W and zero Space');
 assert.ok(r.w.player.pos.x> -4&&r.w.player.pos.x< -3,'The actual roof must be the blocker');
 for(let i=0;i<120;i++){r.step({forward:1,strafe:0,jump:false});assert.ok(r.w.player.pos.x>=roof.max.x+r.w.player.half.x-.08);assert.equal(r.pad('final-store').crateId,'final-cube');}
 r.note('flat-belt-walk-reaches-solid-roof-with-current-STORE');
 r.walk(3.8,11);r.tick(.5);
 assert.ok(r.w.player.grounded&&Math.abs(r.w.player.pos.y-.865)<.06,'Ordinary W escape must return to the near floor');
 assert.equal(r.events.some(e=>e.type==='jump'),false,'No Space workaround counts as flat entry');
 assert.equal(r.w.respawns,0);archive(r);assert.equal(r.events.some(e=>e.type==='jump'),false);
 assert.ok(observed.queries>100&&observed.fixedDuringQuery>100&&observed.physics>100&&observed.held>0);r.inputs.push({action:'read-only-native-frame-observations',...observed});
}));
