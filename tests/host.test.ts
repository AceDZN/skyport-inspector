import test from 'node:test';
import assert from 'node:assert/strict';
import {allowedParentOrigin,parseLevelParam,isMuteMessage,connectHost,WorkbookSession,type HostMessage} from '../src/host';
import {RiftAudio} from '../src/audio';

test('all 50 canonical deep links select their exact authored index',()=>{
    for(let n=1;n<=50;n++)assert.equal(parseLevelParam(`?grade=7&level=${n}`,50),n-1);
    for(const query of ['', '?level=', '?level=0', '?level=51', '?level=-1', '?level=+1', '?level=01', '?level=1.0', '?level=1e1', '?level=%201', '?level=1%20', '?level=1&level=2', '?level=Infinity', '?level=9007199254740993'])assert.equal(parseLevelParam(query),null,query);
    for(const n of [0,-1,1.5,NaN,Infinity])assert.equal(parseLevelParam('?level=1',n),null);
    assert.equal(parseLevelParam('?level=51',100),null);
});
test('only exact canonical Workbook/loopback or same-origin Vercel parents are trusted',()=>{
    for(const origin of ['https://workbook.co.il','https://english-games.workbook.co.il','https://preview.english.workbook.co.il','http://localhost:4261','http://127.0.0.1:3000'])assert.equal(allowedParentOrigin(origin,''),origin);
    const preview='https://games-preview-abc.vercel.app';assert.equal(allowedParentOrigin(preview,preview),preview);
    for(const origin of ['https://workbook.co.il.evil.test','https://evilworkbook.co.il','https://workbook.co.il@evil.test','http://workbook.co.il','https://workbook.co.il:444','https://workbook.co.il/','https://workbook.co.il?q=x','https://localhost','null','*','','https://another.vercel.app'])assert.equal(allowedParentOrigin(origin,preview),null,origin);
});
function browserFixture(origin='http://localhost:3000',standalone=false,referrer=''){
    const messages:{message:unknown;target:string}[]=[];
    const listeners=new Map<string,Set<(event:any)=>void>>();
    const parent={postMessage:(message:unknown,target:string)=>messages.push({message,target})};
    const browser:any={parent,location:{origin:'http://localhost:4262',ancestorOrigins:origin?[origin]:[]},
        addEventListener:(type:string,fn:(e:any)=>void)=>{if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type)!.add(fn);},
        removeEventListener:(type:string,fn:(e:any)=>void)=>listeners.get(type)?.delete(fn)};
    if(standalone)browser.parent=browser;
    const emit=(type:string,event:any)=>{for(const fn of listeners.get(type)??[])fn(event);};
    return{browser,parent,messages,listeners,emit,doc:{referrer}};
}
test('standalone and denied foreign parents receive no events or listeners',()=>{
    for(const f of [browserFixture('https://workbook.co.il',true),browserFixture('https://workbook.co.il.evil.test'),browserFixture('null')]){
        const bridge=connectHost(()=>assert.fail(),f.browser,f.doc);bridge.send({type:'ready'});
        assert.equal(bridge.connected,false);assert.equal(f.messages.length,0);assert.equal(f.listeners.size,0);
    }
});
test('bridge envelopes target the exact immediate parent and listener disposal is complete',()=>{
    const f=browserFixture('',false,'https://english-games.workbook.co.il/rift-runner');
    const bridge=connectHost(()=>{},f.browser,f.doc);bridge.send({type:'ready'});
    assert.deepEqual(f.messages,[{message:{type:'ready',source:'workbook-game',version:1,slug:'rift-runner'},target:'https://english-games.workbook.co.il'}]);
    f.emit('error',{message:'private sensitive stack'});f.emit('unhandledrejection',{reason:'private sensitive reason'});
    assert.equal(f.messages.length,3);assert.equal(JSON.stringify(f.messages).includes('private sensitive'),false);
    bridge.dispose();for(const values of f.listeners.values())assert.equal(values.size,0);
});
test('mute requires parent source, exact allowed origin and the complete typed envelope',()=>{
    const f=browserFixture(),received:boolean[]=[];
    connectHost(value=>received.push(value),f.browser,f.doc);
    const data={source:'workbook-host',version:1,slug:'rift-runner',type:'set-muted',muted:true};
    const event={source:f.parent,origin:'http://localhost:3000',data};
    f.emit('message',{...event,source:{}});f.emit('message',{...event,origin:'http://localhost:3001'});
    for(const invalid of [null,{},'mute',{...data,source:'workbook-game'},{...data,version:2},{...data,slug:'other'},{...data,type:'mute'},{...data,muted:'true'}]){
        assert.equal(isMuteMessage(invalid),false);f.emit('message',{...event,data:invalid});
    }
    assert.deepEqual(received,[]);f.emit('message',event);f.emit('message',{...event,data:{...data,muted:false}});assert.deepEqual(received,[true,false]);
});
test('ready follows rendering once and precedes queued actual attempt events',()=>{
    const messages:HostMessage[]=[],session=new WorkbookSession(m=>messages.push(m));
    session.startAttempt(50,0);assert.deepEqual(messages,[]);session.markReady();session.markReady();
    assert.deepEqual(messages,[{type:'ready'},{type:'level-start',level:50}]);
});
test('completion is tied to an active base attempt and cannot repeat after success or home',()=>{
    const messages:HostMessage[]=[],session=new WorkbookSession(m=>messages.push(m));session.markReady();
    session.completeLevel(1,1);session.startAttempt(1,10);session.completeLevel(2,12);session.completeLevel(1,12.3456);session.completeLevel(1,13);session.leave();session.completeLevel(1,14);
    assert.deepEqual(messages,[{type:'ready'},{type:'level-start',level:1},{type:'level-complete',level:1,durationMs:2346}]);
});
test('retry is a fresh same-room attempt and duration excludes earlier attempts and paused world time',()=>{
    const messages:HostMessage[]=[],session=new WorkbookSession(m=>messages.push(m));session.startAttempt(1,0);session.startAttempt(1,5);session.markReady();
    // A long wall-clock pause leaves the supplied active world time at 7.5s.
    session.completeLevel(1,7.5);session.startAttempt(2,0);session.completeLevel(2,3);
    assert.deepEqual(messages,[{type:'ready'},{type:'level-start',level:1},{type:'level-start',level:1},{type:'level-complete',level:1,durationMs:2500},{type:'level-start',level:2},{type:'level-complete',level:2,durationMs:3000}]);
});
test('invalid attempt levels and durations never consume a valid completion',()=>{
    const messages:HostMessage[]=[],session=new WorkbookSession(m=>messages.push(m));session.markReady();session.startAttempt(1,2);
    for(const n of [0,51,1.5,NaN,Infinity])session.startAttempt(n,0);
    for(const t of [-1,NaN,Infinity]){session.startAttempt(2,t);session.completeLevel(1,t);}
    session.completeLevel(1,1);session.completeLevel(1,2);
    assert.deepEqual(messages,[{type:'ready'},{type:'level-start',level:1},{type:'level-complete',level:1,durationMs:0}]);
});
test('host mute never changes saved master preference and every resume/completion keeps its effective gain silent',()=>{
    const audio=new RiftAudio(),ramps:number[]=[],saved:number[]=[];
    const gain={cancelScheduledValues(){},setTargetAtTime(value:number){ramps.push(value);}};
    Object.assign(audio,{ctx:{currentTime:0,resume:async()=>{},suspend:async()=>{}},buses:{master:{gain},music:{gain}},playCue:()=>undefined});
    const originalWindow=globalThis.window,originalStorage=globalThis.localStorage;
    Object.assign(globalThis,{window:{clearTimeout(){},setTimeout:()=>0},localStorage:{setItem(_key:string,value:string){saved.push(JSON.parse(value).master);}}});
    try{
        audio.setHostMuted(true);audio.setGain('master',.35);audio.setPaused(false);audio.pauseWithCompletion();
        assert.equal(audio.settings().master,.35);assert.equal(audio.state().hostMuted,true);assert.deepEqual(saved,[.35]);
        // Only the master path is silent; music's own saved bus gain can still be restored.
        assert.equal(ramps[0],0);assert.equal(ramps[1],0);assert.equal(ramps[2],0);
        audio.setPaused(false);audio.setHostMuted(false);assert.equal(ramps.at(-1),.35);assert.equal(audio.settings().master,.35);
    }finally{Object.assign(globalThis,{window:originalWindow,localStorage:originalStorage});}
});
