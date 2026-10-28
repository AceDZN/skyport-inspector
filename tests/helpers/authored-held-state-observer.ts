import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';

/** Isolated integration metrics only; no native setters, physics overrides or route changes. */
import {observeMachineQueryState} from './machine-query-state-observer';
export function observeAuthoredHeldState(w:import('../../src/core/world').CoreWorld,number:number,id:string,contrast:boolean,events:{type?:unknown}[]){
 const out=process.env.RIFT_COMMON_HELD_OUT;if(!out)return;const observer=observeMachineQueryState(w),original=w.dispose.bind(w);
 w.dispose=()=>{let error:unknown;try{assert.equal(observer.counts.violations,0);if(events.some(e=>e.type==='pickup'))assert.ok(observer.counts.held>0,'Actual cargo pickup route must invoke native held queries');}catch(e){error=e;throw e;}finally{mkdirSync(out,{recursive:true});writeFileSync(out+'/'+number+'-'+id+'-'+(contrast?'contrast':'base')+'-'+Date.now()+'.json',JSON.stringify({scope:'Metrics-only wrapper on unchanged authored24/26 input routes. No state setters or physics overrides. All originals called once. These counts distinguish actual invoked held queries from installed hooks.',number,id,contrast,error:error?String(error):null,counts:observer.counts,nativeTypes:observer.nativeTypes,samples:observer.samples,final:observer.final()},null,2)+'\n');original();}};
}
