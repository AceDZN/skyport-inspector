/** Real Chamber2 native fall/landing/vestibule history; unit portal placement is not browser proof. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {Vector3} from 'three';
import {CoreWorld,initializePhysics} from '../src/core/world';
before(async()=>{await initializePhysics();});
const idle={forward:0,strafe:0,jump:false};
test('ordinary Chamber2 fling→gallery→upper vestibule walk needs no jump or pin recovery',()=>{
 const w=new CoreWorld(2);try{
  assert.ok(w.place(0,'drop-floor',new Vector3(0,-2.975,6)));
  assert.ok(w.place(1,'high-wall',new Vector3(0,6,-11.985)));
  for(let i=0;i<24;i++)w.step(1/120,idle);
  for(let i=0;i<600&&w.player.crossings===0;i++)w.step(1/120,{...idle,forward:1});
  assert.equal(w.player.crossings,1,'Normal forward fall must genuinely cross the floor portal');
  let landed=false;
  for(let i=0;i<240;i++){
   w.step(1/120,{...idle,forward:1});
   if(w.player.grounded&&w.player.pos.y>4&&w.player.pos.z>-7.5&&w.player.pos.z<-.5){landed=true;break;}
  }
  assert.ok(landed,'Scenario must genuinely land on the real receiving gallery');
  function walk(x:number,z:number){
   for(let i=0;i<720;i++){
    if(w.campaignResult)return true;
    const dx=x-w.player.pos.x,dz=z-w.player.pos.z;
    if(Math.hypot(dx,dz)<.18){for(let j=0;j<12;j++)w.step(1/120,idle);return true;}
    w.yaw=Math.atan2(-dx,-dz);w.pitch=0;w.step(1/120,{...idle,forward:1});
   }
   return false;
  }
  assert.ok(walk(5,-5.5),`Pinned while turning across gallery: ${w.player.pos.toArray()}`);
  assert.ok(walk(5,-9.4),`Pinned at open upper vestibule/separate floor seam: ${w.player.pos.toArray()}`);
  assert.equal(w.campaignResult?.goalMatched,true);assert.equal(w.campaignResult?.exit,'upper-exit');
  assert.ok(w.player.grounded);assert.equal(w.player.crossings,1);
  assert.equal(w.events.some(e=>e.type==='jump'),false,'A jump must not conceal a floor/door contact pin');
 }finally{w.dispose();}
});
