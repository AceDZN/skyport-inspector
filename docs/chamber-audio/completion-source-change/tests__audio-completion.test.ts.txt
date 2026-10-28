/** Mixer lifecycle unit contracts only: no device, decoding, browser or listening proof.
 * Source preparation is separate from the exclusive compile/test execution grant.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {SkyportAudio} from '../src/audio';

class Param {
 value=1;
 cancelScheduledValues(_time:number){}
 setTargetAtTime(value:number,_time:number,_constant:number){this.value=value;}
}
class Node {
 disconnected=false;
 connect(_node:unknown){}
 disconnect(){this.disconnected=true;}
}
class Gain extends Node {gain=new Param();}
class Source extends Node {
 buffer?:{duration:number};playbackRate=new Param();onended:((event:Event)=>void)|null=null;
 started=0;stopped=0;
 start(){this.started++;}
 stop(){this.stopped++;}
 end(){this.onended?.({type:'ended'} as Event);}
}
class Context {
 currentTime=10;state='running';suspendCalls=0;resumeCalls=0;sources:Source[]=[];
 createBufferSource(){const source=new Source();this.sources.push(source);return source;}
 createGain(){return new Gain();}
 createStereoPanner(){return Object.assign(new Node(),{pan:new Param()});}
 async suspend(){this.suspendCalls++;this.state='suspended';}
 async resume(){this.resumeCalls++;this.state='running';}
}
function harness(){
 const savedWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
 const savedStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 const timers=new Map<number,()=>void>(),storage=new Map<string,string>();let serial=0;
 Object.defineProperty(globalThis,'window',{configurable:true,value:{setTimeout(callback:()=>void){timers.set(++serial,callback);return serial;},clearTimeout(id:number){timers.delete(id);}}});
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem(key:string){return storage.get(key)??null;},setItem(key:string,value:string){storage.set(key,value);}}});
 const audio=new SkyportAudio(),ctx=new Context();
 const buses={master:new Gain(),music:new Gain(),sfx:new Gain(),voice:new Gain()};
 const buffers=new Map<string,unknown>([['complete',{duration:2.6}],['contact',{duration:.22}],['portalA',{duration:.7}]]);
 // Isolate scheduling and graph ownership from browser fetch/decode. These are
 // fake WebAudio internals, never game bodies/history or earned progression.
 const loops=[new Source(),new Source(),new Source()];
 Object.assign(audio,{ctx,buses,buffers,loops});
 return {audio,ctx,buses,buffers,loops,storage,
  timers(){for(const [id,callback]of [...timers]){timers.delete(id);callback();}},
  dispose(){for(const [key,descriptor]of [['window',savedWindow],['localStorage',savedStorage]]as const){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}},
 };
}

test('audio completion waits for actual source end while room cues stay paused',()=>{
 const h=harness();try{
  h.audio.cue('contact');const contact=h.ctx.sources.at(-1)!;
  h.audio.pauseWithCompletion();const completion=h.ctx.sources.at(-1)!;
  assert.equal(contact.stopped,1);assert.equal(completion.buffer?.duration,2.6);
  assert.equal(h.audio.state().paused,true);assert.equal(h.audio.state().completionActive,true);
  assert.equal(h.audio.state().activeSfx,1);assert.equal(h.buses.music.gain.value,0);
  assert.equal(h.buses.master.gain.value,.8);assert.equal(h.ctx.suspendCalls,0);
  h.audio.cue('portalA');assert.equal(h.ctx.sources.length,2,'Paused room event leaked into result');
  completion.end();assert.equal(h.ctx.suspendCalls,1);assert.equal(h.audio.state().completionActive,false);
  assert.equal(h.audio.state().activeSfx,0);assert.equal(h.audio.state().loopCount,3);
 }finally{h.dispose();}
});

test('audio early Next or Restart cancels completion before idempotent start',async()=>{
 const h=harness();try{
  h.audio.pauseWithCompletion();const completion=h.ctx.sources.at(-1)!,stale=completion.onended!;
  await h.audio.start();
  assert.equal(completion.stopped,1);assert.equal(completion.disconnected,true);
  assert.equal(h.audio.state().paused,false);assert.equal(h.audio.state().completionActive,false);
  assert.equal(h.buses.music.gain.value,.7);assert.equal(h.buses.master.gain.value,.8);
  assert.equal(h.audio.state().loopCount,3);assert.equal(h.ctx.sources.length,1,'Start duplicated score loops');
  stale({type:'ended'} as Event);assert.equal(h.ctx.suspendCalls,0,'Old completion suspended the next room');
 }finally{h.dispose();}
});

test('audio ordinary pause or Home immediately cancels a completion source',()=>{
 const h=harness();try{
  h.audio.pauseWithCompletion();const completion=h.ctx.sources.at(-1)!,stale=completion.onended!;
  h.audio.setPaused(true);assert.equal(completion.stopped,1);assert.equal(h.audio.state().completionActive,false);
  assert.equal(h.buses.master.gain.value,0);h.timers();assert.equal(h.ctx.suspendCalls,1);
  h.audio.setPaused(false);stale({type:'ended'} as Event);
  assert.equal(h.ctx.suspendCalls,1);assert.equal(h.audio.state().paused,false);
  assert.equal(h.buses.music.gain.value,.7);
 }finally{h.dispose();}
});

test('audio completion obeys persisted master and SFX gains without unmuting room music',()=>{
 const h=harness();try{
  h.audio.pauseWithCompletion();h.audio.setGain('master',0);h.audio.setGain('sfx',.31);h.audio.setGain('music',.2);
  assert.equal(h.buses.master.gain.value,0);assert.equal(h.buses.sfx.gain.value,.31);
  assert.equal(h.buses.music.gain.value,0,'Result music was unmuted by its saved gain');
  assert.deepEqual(JSON.parse(h.storage.get('rift-audio-v1')!),{master:0,music:.2,sfx:.31,voice:.8});
  h.audio.setGain('master',.8);assert.equal(h.buses.master.gain.value,.8);
  h.audio.setPaused(false);assert.equal(h.buses.music.gain.value,.2);assert.equal(h.buses.sfx.gain.value,.31);
 }finally{h.dispose();}
});

test('audio missing completion buffer falls back to a normal silent pause',()=>{
 const h=harness();try{
  h.buffers.delete('complete');h.audio.pauseWithCompletion();
  assert.equal(h.ctx.sources.length,0);assert.equal(h.audio.state().completionActive,false);
  assert.equal(h.audio.state().paused,true);assert.equal(h.buses.master.gain.value,0);
  h.timers();assert.equal(h.ctx.suspendCalls,1);
  const notStarted=new SkyportAudio();notStarted.pauseWithCompletion();assert.equal(notStarted.state().context,'not-started');
 }finally{h.dispose();}
});

test('audio stale completion callback cannot suspend or clear a newer completion',()=>{
 const h=harness();try{
  h.audio.pauseWithCompletion();const first=h.ctx.sources.at(-1)!,stale=first.onended!;
  h.audio.pauseWithCompletion();const current=h.ctx.sources.at(-1)!;
  assert.notEqual(first,current);assert.equal(first.stopped,1);assert.equal(h.audio.state().activeSfx,1);
  stale({type:'ended'} as Event);assert.equal(h.ctx.suspendCalls,0);
  assert.equal(h.audio.state().completionActive,true);assert.equal(h.audio.state().activeSfx,1);
  current.end();assert.equal(h.ctx.suspendCalls,1);assert.equal(h.audio.state().completionActive,false);
 }finally{h.dispose();}
});
