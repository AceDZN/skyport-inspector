/** Bounded read-only history. No circuit, goal or machine consumes these records. */
export type JournalKind='shutter'|'dock'|'light'|'pressure';
export interface JournalWatch {id:string;label:string;kind:JournalKind}
export interface JournalTest {control:string;label:string;watch:string[]}
export interface JournalMilestone {id:string;watch:string;state:string;initialStates:string[];completedText:string;pendingText:string;unknownText:string;past?:{control:string;text:string}}
export interface JournalConfig {watch:JournalWatch[];tests?:JournalTest[];/** Optional English reports of actual observations, never objectives. */milestones?:JournalMilestone[]}
export interface JournalReading extends JournalWatch {state:string;cargo?:boolean}
interface Row {sequence:number;time:number;text:string}
interface TestObservation {id:string;label:string;opened:boolean;allClosed:boolean}
interface Interval {control:string;label:string;active:boolean;complete:boolean;covered:boolean;startSequence:number;observations:TestObservation[]}
export class MachineJournal {
 readonly capacity=8;
 private rows:Row[]=[];
 private previous=new Map<string,JournalReading>();
 private controls:Record<string,boolean>={};
 private intervals=new Map<string,Interval>();
 private lostPower=new Set<string>();
 private now:JournalReading[]=[];
 private sequence=0;
 private dropped=0;
 private lastTime?:number;
 private attempt=1;
 private milestoneFacts=new Map<string,{observed:boolean;covered:boolean;observedAt?:number;pastControl?:string}>();
 constructor(readonly config:JournalConfig){}
 reset(){this.rows=[];this.previous.clear();this.controls={};this.intervals.clear();this.lostPower.clear();this.now=[];this.sequence=0;this.dropped=0;this.lastTime=undefined;this.milestoneFacts.clear();this.attempt++;}
 private record(time:number,text:string){this.rows.push({sequence:++this.sequence,time,text});if(this.rows.length>this.capacity)this.dropped=this.rows.shift()!.sequence;}
 observe(time:number,readings:JournalReading[],controls:Record<string,boolean>={}){
  const first=this.lastTime===undefined,continuous=!first&&time>this.lastTime!&&time-this.lastTime!<=1/30;
  const current=new Map(readings.map(r=>[r.id,{...r}]));
  if(!first&&!continuous)for(const interval of this.intervals.values())if(interval.active)interval.covered=false;
  for(const test of this.config.tests??[]){
   const on=controls[test.control]===true,was=this.controls[test.control]===true;
   if(on&&(first||!was)){
    // Starting observation while TEST is already ON does not invent its start.
    const covered=!first&&continuous;
    if(!first)this.record(time,`${test.label} began.`);
    this.intervals.set(test.control,{control:test.control,label:test.label,active:true,complete:false,covered,startSequence:this.sequence+(first?1:0),observations:test.watch.map(id=>({id,label:current.get(id)?.label??'Unobserved shutter',opened:false,allClosed:covered&&this.previous.get(id)?.state==='CLOSED'&&current.get(id)?.state==='CLOSED'}))});
   }
   const interval=this.intervals.get(test.control);
   if(interval?.active){
    if(on)for(const entry of interval.observations){const reading=current.get(entry.id),previous=this.previous.get(entry.id);if(!reading||reading.kind!=='shutter')interval.covered=false;entry.opened||=continuous&&!!previous&&previous.state!=='OPEN'&&reading?.state==='OPEN';entry.allClosed&&=reading?.state==='CLOSED';}
    if(!on&&was){if(interval.observations.some(entry=>!current.has(entry.id)))interval.covered=false;interval.active=false;interval.complete=true;this.record(time,`${test.label} ended.`);}
   }
  }
  for(const reading of readings){
   const previous=this.previous.get(reading.id);
   if(!previous||previous.state===reading.state)continue;
   if(reading.kind==='shutter'&&(reading.state==='OPEN'||reading.state==='CLOSED'))this.record(time,`${reading.label} ${reading.state==='OPEN'?'opened fully':'closed fully'}.`);
   if(reading.kind==='dock'&&reading.state.startsWith('AT '))this.record(time,`${reading.label} arrived at ${reading.state.slice(3)}.`);
   if(reading.kind==='light'){
    if(reading.state==='DARK'){this.lostPower.add(reading.id);this.record(time,`${reading.label} lost light.`);}
    else if(reading.state==='LIT')this.record(time,this.lostPower.has(reading.id)?`${reading.label} received light again.`:`${reading.label} received light.`);
   }
   if(reading.kind==='pressure')this.record(time,reading.state==='PRESSED'?(reading.cargo?`Cargo reached ${reading.label}.`:`${reading.label} was pressed.`):`${reading.label} became empty.`);
  }
  for(const milestone of (this.config.milestones??[]).slice(0,4)){
   const reading=current.get(milestone.watch),previous=this.previous.get(milestone.watch);
   let fact=this.milestoneFacts.get(milestone.id);
   if(!fact){fact={observed:false,covered:first&&!!reading&&reading.state!==milestone.state&&milestone.initialStates.includes(reading.state)};this.milestoneFacts.set(milestone.id,fact);}
   if(!first&&(!continuous||!reading))fact.covered=false;
   if(previous&&reading?.state===milestone.state&&previous.state!==milestone.state){
    fact.observed=true;fact.observedAt=time;
    const context=milestone.past?.control;
    if(context&&controls[context]===true&&this.config.tests?.some(test=>test.control===context&&test.watch.includes(milestone.watch)))fact.pastControl=context;
   }
  }
  this.now=readings.map(r=>({...r}));this.previous=current;this.controls={...controls};this.lastTime=time;
 }
 private reports(){return (this.config.milestones??[]).slice(0,4).map(milestone=>{
  const fact=this.milestoneFacts.get(milestone.id),knownPending=!!fact?.covered&&this.dropped===0;
  const status=fact?.observed?'OBSERVED':knownPending?'NOT YET OBSERVED':'UNKNOWN';
  const interval=fact?.pastControl?this.intervals.get(fact.pastControl):undefined;
  return {id:milestone.id,status,text:fact?.observed?milestone.completedText:knownPending?milestone.pendingText:milestone.unknownText,observedAt:fact?.observedAt??null,pastText:fact?.observed&&interval?.complete&&interval.observations.find(entry=>entry.id===milestone.watch)?.opened?milestone.past?.text??null:null};
 });}
 snapshot(){return {reports:this.reports(),attempt:this.attempt,rows:this.rows.map(r=>({...r})),truncated:this.dropped>0,now:this.now.map(r=>({...r})),tests:[...this.intervals.values()].map(interval=>({label:interval.label,status:interval.active?'RUNNING':interval.complete?'ENDED':'UNKNOWN',observations:interval.observations.map(entry=>({label:entry.label,opened:entry.opened?'YES':interval.complete&&interval.covered&&this.dropped<interval.startSequence?'NO':'UNKNOWN',remainedClosed:interval.complete&&interval.covered&&this.dropped<interval.startSequence?(entry.allClosed?'YES':'NO'):'UNKNOWN'}))}))};}
}
