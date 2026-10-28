/**
 * SOURCE-ONLY alternative approach until a separate native grant.
 * This does not repair/relabel the original coplanar conveyor-entry pin.
 * No body, velocity, geometry, support tolerance, history or goal writes.
 */
import test,{before}from'node:test';
import assert from'node:assert/strict';
import{initializePhysics}from'../src/core/world';
import{V}from'../src/physics';
import{ConditionalRoute,conditionalRoute}from'./helpers/conditional-route';
const enabled=process.env.RIFT_C45_THROAT_FOLLOWUP==='1';
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

/** Repeated ordinary Space presses only when visibly grounded, with releases.
 * No velocity/position assignment compensates for the known flat belt pin. */
function ordinaryJumpWalk(r:ConditionalRoute,x:number,z:number,seconds:number,done:()=>boolean,label:string){
 r.look(V(x,r.w.eye().y,z));let lastJump=-100,prior=false;
 r.inputs.push({action:'bounded-ordinary-W-and-Space',target:[x,z],seconds,label,scope:'Press Space only after real native grounded contact; release between presses.'});
 for(let i=0;i<Math.ceil(seconds*120);i++){
  if(done())return;
  const jump:boolean=r.w.player.grounded&&!prior&&i-lastJump>=12;if(jump)lastJump=i;
  r.step({forward:1,strafe:0,jump});prior=jump;
  if(i%12===0)r.note(label+'-frame-'+i);
 }
 assert.ok(done(),label+' did not reach the physical precondition; '+r.detail());
}

function archive(r:ConditionalRoute){
 optical(r);const lift=r.device('final-archive-lift');
 assert.equal(r.pad('final-store').crateId,'final-cube');r.walk(4.5,8);r.walk(-2,6);r.walk(-6.2,6);
 r.until(()=>lift.moving,28,'Actual combined supplies never move lift');r.until(()=>!lift.moving&&Math.abs(lift.position.y+.2)<.02,28,'Actual BASE never returns');
 r.walk(-9,6);r.until(()=>r.w.player.grounded&&r.w.player.pos.y>5.01,18,'Actual lift never carries the capsule');
 r.until(()=>r.device('final-archive-dock').progress>.99,2,'Actual archive dock leaf never clears');r.walk(-12.5,6);r.walk(-17,6);r.finish('archive-exit');
}

test('native C45 bounded ordinary jump approach proves actual low roof contact then escapes and completes',{skip:!enabled},()=>conditionalRoute(45,false,'throat-ordinary-jump-followup',r=>{
 supply(r);r.walk(3.8,11);
 const roof=r.w.solids.find(s=>s.id==='final-cargo-throat-roof');assert.ok(roof);
 ordinaryJumpWalk(r,-6,11,6,()=>r.contacts().some(c=>c.id===roof.id),'actual-throat-approach');
 assert.ok(r.w.player.pos.x> -4&&r.w.player.pos.x< -3,'The body must reach the actual throat, not remain at the earlier belt pin');
 assert.ok(r.contacts().some(c=>c.id===roof.id),'The actual roof, rather than another floor/rail, must block the body');
 assert.ok(r.w.player.pos.x>=roof.max.x+r.w.player.half.x-.08,'The upright body penetrates the real low roof');
 for(let i=0;i<30;i++){r.step({forward:1,strafe:0,jump:false});assert.ok(r.w.player.pos.x>=roof.max.x+r.w.player.half.x-.08,'Sustained W passes a body through the low cargo throat');assert.equal(r.pad('final-store').crateId,'final-cube');}
 r.note('real-roof-contact-excludes-upright-body-cargo-pressure-persists');
 ordinaryJumpWalk(r,6,11,8,()=>r.w.player.pos.x>=3.7,'ordinary-escape-from-belt-throat');r.tick(1);
 assert.ok(r.w.player.grounded&&r.w.player.pos.x>3.3,'Body must escape to actual clear floor without reset');
 assert.equal(r.w.respawns,0);assert.equal(r.pad('final-store').crateId,'final-cube');archive(r);
}));
