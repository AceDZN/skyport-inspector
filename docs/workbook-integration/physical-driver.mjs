/** Reusable actual-input route for C1 in a real Workbook iframe. No game-state writes.
 * page is a Playwright Page; frame is the game's Playwright Frame. */
export function createGameDriver(page,frame,{onAction=()=>{}}={}){
    const read=()=>frame.evaluate(()=>JSON.parse(window.render_game_to_text()));
    const assert=(condition,message)=>{if(!condition)throw Error(message);};
    async function key(code,ms=60){
        onAction({key:code,ms});
        const observation=await frame.evaluate(({code,ms})=>new Promise(resolve=>{const activeSecondsAtKeydown=JSON.parse(window.render_game_to_text()).activeSeconds;const target=document.querySelector('#world');const emit=type=>target.dispatchEvent(new KeyboardEvent(type,{code,key:code,bubbles:true,cancelable:true}));emit('keydown');setTimeout(()=>{emit('keyup');resolve({activeSecondsAtKeydown});},ms);}),{code,ms});
        await page.waitForTimeout(20);return observation;
    }
    async function aim(target){
        for(let pass=0;pass<3;pass++){
            const s=await read(),p=s.world.player,pos=p.position,d=target.map((v,i)=>v-[pos[0],pos[1]+.65,pos[2]][i]);
            const yaw=Math.atan2(-d[0],-d[2]),pitch=Math.asin(d[1]/Math.hypot(...d));
            let dy=Math.atan2(Math.sin(yaw-p.yaw),Math.cos(yaw-p.yaw)),dp=pitch-p.pitch;
            const box=await frame.locator('#world').boundingBox();assert(box,'Game canvas is not visible');
            const maxYaw=Math.min(.65,box.width*.4*s.controls.sensitivity),maxPitch=Math.min(.4,box.height*.4*s.controls.sensitivity),x=box.x+box.width/2,y=box.y+box.height/2;
            while(Math.abs(dy)>.002||Math.abs(dp)>.002){
                const a=Math.max(-maxYaw,Math.min(maxYaw,dy)),b=Math.max(-maxPitch,Math.min(maxPitch,dp));if(Math.abs(a/s.controls.sensitivity)+Math.abs(b/s.controls.sensitivity)<1.5)break;
                await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-a/s.controls.sensitivity,y-b/s.controls.sensitivity);await page.mouse.up();dy-=a;dp-=b;
            }
            await page.waitForTimeout(30);
        }
    }
    async function walk(x,z,stop=.25){let old,stuck=0;for(let i=0;i<100;i++){
        const s=await read(),p=s.world.player,pos=p.position,d=Math.hypot(pos[0]-x,pos[2]-z);if(s.mode!=='playing'||d<stop)return;
        stuck=old&&Math.hypot(pos[0]-old[0],pos[2]-old[2])<.02?stuck+1:0;assert(stuck<=10,`Blocked walking to ${x},${z}: ${pos}`);old=pos;
        await aim([x,pos[1]+.65,z]);await key('KeyW',Math.min(450,d/4.8*1000));
    }throw Error('Walk timeout');}
    async function dragMode(){await frame.locator('[data-action=pause]').click();await frame.locator('[data-action=settings]').click();await frame.locator('#drag-look').check();await frame.locator('[data-action=back]').click();await frame.locator('[data-action=resume]').click();}
    async function playC1({capture=async()=>{},poster=async()=>{}}={}){
        const s=await read();assert(s.level===1&&s.mode==='playing'&&s.controls.unlocked,'C1 must be playing with the real drag-look setting enabled');
        await aim([-7.985,1.75,6]);await key('Digit1');await aim([5,4.55,-11.985]);await key('Digit2');
        assert((await read()).world.portals.every(Boolean),'Real aimed portals missing');await capture('03-real-linked-portals-and-projector');
        await walk(-6.8,6);await aim([-8.5,1.55,6]);await key('KeyW',600);await page.waitForTimeout(250);assert((await read()).world.player.crossings===1,'Did not traverse first portal');
        await walk(3,-9.8);await aim([3,3.35,-8]);await key('KeyE');assert((await read()).world.held==='weighted-cube','Real E did not pick up cube');await capture('04-real-projector-and-held-cargo');
        await walk(5,-10);await aim([5,4.35,-12.5]);await key('KeyW',750);await page.waitForTimeout(250);assert((await read()).world.player.crossings===2,'Did not carry cargo through return portal');
        await walk(.2,6);
        await aim([2,1.2,6]);await page.waitForTimeout(250);await key('KeyE');await page.waitForTimeout(1000);assert((await read()).world.pads[0].crate==='weighted-cube','Cube not on physical pad');await capture('05-real-cargo-on-pressure-plate');
        await walk(5,9);await aim([-5,1.7,5.5]);await page.waitForTimeout(200);await poster();
        await walk(-6.6,10.8);await walk(-10.7,11);const end=await read();assert(end.mode==='result'&&end.world.result.goalMatched,'Physical base goal not completed');return end;
    }
    return{read,key,aim,walk,dragMode,playC1};
}
