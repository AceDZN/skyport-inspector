/** Versioned local progress. Only observed mission-matched results create completions. */
export const CAMPAIGN_LENGTH=50;
export const SAVE_KEY='rift-runner-campaign-v2';
export interface Store {getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void}
export interface RunEvidence {goalMatched:boolean;assistance:number;retries:number;seconds:number;portalCrossings:number;mechanisms:string[];variant?:'base'|'contrast';recordedAt?:number}
export interface ImportedCoreEvidence {goalMatched:true;provenance:'legacy-core-completion';variant:'base';assistance:null;retries:null;seconds:null;portalCrossings:null;mechanisms:[];recordedAt?:number}
type Evidence=RunEvidence|ImportedCoreEvidence;
export interface LevelRecord {completed:boolean;runs:number;completions:number;unaided:boolean;bestRetries:number|null;last:Evidence;variants?:Partial<Record<'base'|'contrast',Evidence>>;unattributed?:RunEvidence[];updatedAt?:number}
/** Missing generation is the compatible CJ/Bh generation. Reset and restore create new ones. */
export interface CampaignSave {version:2;highestUnlocked:number;resumeLevel:number;records:Record<number,LevelRecord>;updatedAt:number;generation?:string}
const LEGACY_GENERATION='legacy';
export const freshSave=():CampaignSave=>({version:2,highestUnlocked:1,resumeLevel:1,records:{},updatedAt:Date.now(),generation:LEGACY_GENERATION});
const levelNumber=(n:number)=>Number.isInteger(n)&&n>=1&&n<=CAMPAIGN_LENGTH;
const clone=<T>(value:T):T=>JSON.parse(JSON.stringify(value));
const generation=(save:CampaignSave)=>save.generation??LEGACY_GENERATION;
const hasProgress=(save:CampaignSave)=>Object.keys(save.records).length>0||save.highestUnlocked>1;
const count=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&n>=0?n:0;
const validEvidence=(v:unknown):v is Evidence=>!!v&&typeof v==='object'&&typeof (v as Evidence).goalMatched==='boolean';
const variant=(e:Evidence)=>e.variant==='base'||e.variant==='contrast'?e.variant:undefined;
function decodeSave(raw:string|null):{save?:CampaignSave;issue?:string}{
 if(raw===null||raw==='')return{};
 try{
  const v=JSON.parse(raw);
  if(!v||v.version!==2||!levelNumber(v.highestUnlocked)||!levelNumber(v.resumeLevel)||!v.records||typeof v.records!=='object'||Array.isArray(v.records))return{issue:'Unsupported or invalid progress schema.'};
  if(v.generation!==undefined&&(typeof v.generation!=='string'||!v.generation))return{issue:'Invalid campaign generation.'};
  const records:Record<number,LevelRecord>={};let partial=false;
  for(const [key,value]of Object.entries(v.records)){
   const n=Number(key),r=value as LevelRecord;
   if(!levelNumber(n)||!r||typeof r.completed!=='boolean'||!Number.isFinite(r.runs)||r.runs<0||!validEvidence(r.last)){partial=true;continue;}
   if(r.variants&&(typeof r.variants!=='object'||Object.values(r.variants).some(e=>!validEvidence(e))))partial=true;
   if(r.unattributed&&(!Array.isArray(r.unattributed)||r.unattributed.some(e=>!validEvidence(e))))partial=true;
   records[n]=r;
  }
  return{save:{version:2,highestUnlocked:v.highestUnlocked,resumeLevel:Math.min(v.resumeLevel,v.highestUnlocked),records,updatedAt:Number.isFinite(v.updatedAt)?v.updatedAt:Date.now(),generation:v.generation??LEGACY_GENERATION},issue:partial?'Some progress records are unreadable.':undefined};
 }catch{return{issue:'Progress is not readable JSON.'};}
}
/** Pure compatibility parser. Storage replacement policy lives in CampaignProgress. */
export function parseSave(raw:string|null):CampaignSave{return decodeSave(raw).save??freshSave();}
function canonical(value:unknown):string{
 if(Array.isArray(value))return'['+value.map(canonical).join(',')+']';
 if(value&&typeof value==='object')return'{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',')+'}';
 return JSON.stringify(value)??'undefined';
}
function mergeRecord(a:LevelRecord,b:LevelRecord,preferB:boolean):LevelRecord{
 const newer=(x:Evidence|undefined,y:Evidence|undefined):Evidence|undefined=>{
  if(!validEvidence(x))return validEvidence(y)?y:undefined;if(!validEvidence(y))return x;
  const tx=count(x.recordedAt),ty=count(y.recordedAt);return ty>tx||(ty===tx&&preferB)?y:x;
 };
 const variants:LevelRecord['variants']={};
 for(const key of ['base','contrast'] as const){
  const x=newer(a.variants?.[key],variant(a.last)===key?a.last:undefined),y=newer(b.variants?.[key],variant(b.last)===key?b.last:undefined);
  const chosen=newer(x,y);if(chosen)variants[key]=chosen;
 }
 const untagged=[...(Array.isArray(a.unattributed)?a.unattributed:[]),...(Array.isArray(b.unattributed)?b.unattributed:[]),...(!variant(a.last)?[a.last]:[]),...(!variant(b.last)?[b.last]:[])].filter(validEvidence);
 const unique=[...new Map(untagged.map(e=>[canonical(e),e])).values()] as RunEvidence[];
 const retries=[a.bestRetries,b.bestRetries].filter((n):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0);
 return{completed:a.completed||b.completed,runs:Math.max(count(a.runs),count(b.runs)),completions:Math.max(count(a.completions),count(b.completions)),unaided:!!a.unaided||!!b.unaided,bestRetries:retries.length?Math.min(...retries):null,last:newer(a.last,b.last)!,variants,...(unique.length?{unattributed:unique}:{}),updatedAt:Math.max(count(a.updatedAt),count(b.updatedAt))};
}
function mergeSave(a:CampaignSave,b:CampaignSave):CampaignSave{
 const records:Record<number,LevelRecord>={},preferB=b.updatedAt>=a.updatedAt;
 for(const key of new Set([...Object.keys(a.records),...Object.keys(b.records)])){
  const n=Number(key),x=a.records[n],y=b.records[n];records[n]=x&&y?mergeRecord(x,y,preferB):clone(x??y);
 }
 return{version:2,highestUnlocked:Math.max(a.highestUnlocked,b.highestUnlocked),resumeLevel:Math.max(a.resumeLevel,b.resumeLevel),records,updatedAt:Math.max(a.updatedAt,b.updatedAt),generation:generation(a)};
}
let sequence=0;
const newGeneration=(kind:string)=>kind+':'+Date.now().toString(36)+':'+(++sequence).toString(36)+':'+Math.random().toString(36).slice(2);
type Stored={kind:'missing'|'valid'|'partial'|'invalid'|'unavailable'|'session';raw?:string;save?:CampaignSave;issue?:string};
type WriteResult='written'|'session'|'blocked'|'generation-changed';
export class CampaignProgress {
 save:CampaignSave;storage?:Store;warning?:string;
 private stored:Stored={kind:'missing'};
 private journal:Stored={kind:'missing'};
 private legacyEligible=false;
 private runGeneration=LEGACY_GENERATION;
 private preserved:string[]=[];
 private recovery:'main'|'journal'|'backup'|'fresh'='fresh';
 private memoryBackup?:CampaignSave;
 private lastWrite:WriteResult|undefined;
 constructor(storage?:Store,readonly key=SAVE_KEY){
  this.storage=storage;this.stored=this.read(key);this.journal=this.read(key+'-journal');
  const current=this.currentSave();
  if(current){
   this.save=current;this.recovery=this.journal.save&&!this.journal.issue?'journal':'main';
   if(this.stored.kind==='partial'&&(!this.journal.save||this.journal.issue)){
    const backup=this.read(key+'-backup');if(backup.save&&!backup.issue&&generation(backup.save)===generation(current)){this.save=mergeSave(current,backup.save);this.recovery='backup';}
   }
   if(this.stored.issue||this.journal.issue)this.warning='Unreadable progress data will be preserved before saving.';else if(this.needsMainRepair())this.warning='Progress recovered from the protected save journal.';
  }
  else{
   const backup=this.stored.kind==='unavailable'||this.stored.kind==='session'?undefined:this.read(key+'-backup');
   if(backup?.save&&!backup.issue){this.save={...clone(backup.save),generation:newGeneration('recovery')};this.recovery='backup';this.warning='Progress recovered from the previous backup. The original will be preserved before saving.';}
   else{this.save=freshSave();this.legacyEligible=this.stored.kind!=='unavailable';if(this.stored.kind==='invalid'){this.save.generation=newGeneration('recovery');this.warning='Progress is unreadable. The original must be preserved before a replacement can be saved.';}}
  }
  if(this.stored.kind==='unavailable'||this.stored.kind==='session')this.warning='Local storage unavailable; progress lasts for this session.';
  this.runGeneration=generation(this.save);
 }
 private read(key:string):Stored{
  if(!this.storage)return{kind:'session'};
  try{const raw=this.storage.getItem(key);if(raw===null)return{kind:'missing'};const decoded=decodeSave(raw);return{kind:decoded.save?(decoded.issue?'partial':'valid'):'invalid',raw,...decoded};}
  catch{return{kind:'unavailable',issue:'Local storage could not be read.'};}
 }
 /** The protected journal owns reset generations; legacy clients can only overwrite main. */
 private currentSave():CampaignSave|undefined{
  const main=this.stored.save,journal=this.journal.issue?undefined:this.journal.save;
  if(journal){if(main&&generation(main)===generation(journal))return mergeSave(main,journal);return clone(journal);}
  return main?clone(main):undefined;
 }
 private needsMainRepair(){return!!this.journal.save&&!this.journal.issue&&(!this.stored.save||canonical(this.currentSave())!==canonical(this.stored.save));}
 /** Read the current key before an action; a different generation is authoritative. */
 refresh():void{
  this.stored=this.read(this.key);this.journal=this.read(this.key+'-journal');const current=this.currentSave();
  if(current){
   this.legacyEligible=false;
   if(generation(current)!==generation(this.save))this.save=clone(current);
   else this.save=mergeSave(this.save,current);
   if(this.stored.issue||this.journal.issue)this.warning='Unreadable progress data will be preserved before saving.';
  }else if(this.stored.kind==='invalid'||this.journal.kind==='invalid')this.warning='Progress is unreadable. Saving requires a preserved copy of the original.';
  else if(this.stored.kind==='unavailable'||this.stored.kind==='session')this.warning='Local storage unavailable; progress lasts for this session.';
 }
 get canImportCoreCompletions(){return this.legacyEligible&&!this.hasProgress;}
 get hasProgress(){return hasProgress(this.save);}
 get complete(){return this.save.records[CAMPAIGN_LENGTH]?.completed===true;}
 status(level:number):'completed'|'unlocked'|'locked'{if(this.save.records[level]?.completed)return'completed';return level<=this.save.highestUnlocked?'unlocked':'locked';}
 canPlay(level:number){return levelNumber(level)&&this.status(level)!=='locked';}
 /** Pure diagnostics: does not perform a read or expose the raw stored payload. */
 diagnostics(){return{key:this.key,journalKey:this.key+'-journal',generation:generation(this.save),storage:this.stored.kind,journal:this.journal.kind,recovery:this.recovery,primaryNeedsRepair:this.needsMainRepair(),legacyImportEligible:this.canImportCoreCompletions,preservedUnreadableKeys:[...this.preserved],lastWrite:this.lastWrite??null,warning:this.warning??null};}
 private preserveRaw(key:string,raw:string):boolean{
  if(!this.storage)return false;
  let hash=2166136261;for(let i=0;i<raw.length;i++){hash^=raw.charCodeAt(i);hash=Math.imul(hash,16777619);}
  const base=key+'-unreadable-'+(hash>>>0).toString(16);
  try{
   for(let i=0;i<100;i++){
    const target=base+(i?'-'+i:''),existing=this.storage.getItem(target);
    if(existing!==null&&existing!==raw)continue;
    if(existing===null)this.storage.setItem(target,raw);
    if(this.storage.getItem(target)!==raw)throw Error('Preservation was not retained');
    if(!this.preserved.includes(target))this.preserved.push(target);return true;
   }
  }catch{}
  this.warning='The unreadable original could not be backed up; its stored value has not been replaced.';return false;
 }
 private canReplace():boolean{
  if(this.stored.kind==='unavailable'){this.warning='Storage could not be read; this session will not replace unknown saved data.';return false;}
  if((this.stored.kind==='invalid'||this.stored.kind==='partial')&&this.stored.raw!==undefined)return this.preserveRaw(this.key,this.stored.raw);
  return true;
 }
 private write(save:CampaignSave):boolean{
  if(!this.storage)return true;
  const journalKey=this.key+'-journal';
  if(this.journal.kind==='unavailable'){this.warning='The protected save journal could not be read; its value has not been replaced.';return false;}
  if((this.journal.kind==='invalid'||this.journal.kind==='partial')&&this.journal.raw!==undefined&&!this.preserveRaw(journalKey,this.journal.raw))return false;
  const raw=JSON.stringify(save);
  // Journal first: it remains authoritative even if an already-loaded old client later
  // blindly replaces main, or the second write fails during a reset transaction.
  try{this.storage.setItem(journalKey,raw);if(this.storage.getItem(journalKey)!==raw)throw Error('Journal was not retained');this.journal={kind:'valid',save:clone(save)};}
  catch{this.warning='The protected save could not be written; stored progress has not been replaced.';return false;}
  try{this.storage.setItem(this.key,raw);this.stored={kind:'valid',save:clone(save)};this.warning=this.preserved.length?'Saved progress is protected; unreadable originals are preserved separately.':undefined;}
  catch{this.warning='Progress is protected in the save journal; the primary copy could not be updated.';}
  return true;
 }
 private persist(expected=generation(this.save)):WriteResult{
  this.refresh();
  if(generation(this.save)!==expected){this.warning='The campaign changed in another tab. Start the current room again before recording a result.';return this.lastWrite='generation-changed';}
  if(!this.canReplace())return this.lastWrite='blocked';
  this.save.updatedAt=Math.max(Date.now(),this.save.updatedAt+1);
  if(!this.write(this.save))return this.lastWrite='blocked';
  this.legacyEligible=false;
  return this.lastWrite=this.storage?'written':'session';
 }
 /** Import only when no valid current/reset save or recovered backup has authority. */
 importCoreCompletions(completed:unknown){
  this.refresh();if(!this.canImportCoreCompletions||!Array.isArray(completed))return false;
  let last=0;for(const n of [1,2]){if(!completed.includes(n))break;this.save.records[n]={completed:true,runs:0,completions:0,unaided:false,bestRetries:null,last:{goalMatched:true,provenance:'legacy-core-completion',variant:'base',assistance:null,retries:null,seconds:null,portalCrossings:null,mechanisms:[]}};last=n;}
  if(!last)return false;this.save.highestUnlocked=last+1;this.save.resumeLevel=last+1;return this.persist()!=='generation-changed';
 }
 enter(level:number){
  this.refresh();if(!this.canPlay(level))return false;
  this.runGeneration=generation(this.save);if(level>=this.save.resumeLevel)this.save.resumeLevel=level;
  return this.persist()!=='generation-changed';
 }
 observe(level:number,evidence:RunEvidence){
  this.refresh();
  if(this.runGeneration!==generation(this.save)){this.warning='The campaign changed in another tab. Start the current room again before recording a result.';return false;}
  if(!this.canPlay(level))return false;
  const previous=this.save.records[level],unaided=evidence.goalMatched&&evidence.assistance===0&&evidence.retries===0;
  const stamp=Math.max(Date.now(),this.save.updatedAt+1,count(previous?.updatedAt)+1),last={...evidence,variant:evidence.variant??'base',mechanisms:[...evidence.mechanisms],recordedAt:stamp};
  const variants={...previous?.variants,[last.variant]:last};
  if(previous&&variant(previous.last)&&!variants[variant(previous.last)!])variants[variant(previous.last)!]=previous.last;
  const unattributed=previous&&!variant(previous.last)?[...previous.unattributed??[],previous.last as RunEvidence]:previous?.unattributed;
  this.save.records[level]={completed:!!previous?.completed||evidence.goalMatched,runs:count(previous?.runs)+1,completions:count(previous?.completions)+(evidence.goalMatched?1:0),unaided:!!previous?.unaided||unaided,bestRetries:evidence.goalMatched?Math.min(previous?.completed?(previous.bestRetries??Infinity):Infinity,evidence.retries):(previous?.bestRetries??evidence.retries),last,variants,unattributed,updatedAt:stamp};
  this.save.updatedAt=stamp;
  if(evidence.goalMatched){this.save.highestUnlocked=Math.max(this.save.highestUnlocked,Math.min(CAMPAIGN_LENGTH,level+1));this.save.resumeLevel=Math.max(this.save.resumeLevel,Math.min(CAMPAIGN_LENGTH,level+1));}
  return this.persist()!=='generation-changed'&&evidence.goalMatched;
 }
 private backupCurrent():boolean{
  if(!this.hasProgress)return true;
  if(!this.storage){this.memoryBackup=clone(this.save);return true;}
  const key=this.key+'-backup',old=this.read(key);
  if(old.kind==='unavailable'){this.warning='The previous backup cannot be read; reset has not replaced progress.';return false;}
  if((old.kind==='invalid'||old.kind==='partial')&&old.raw!==undefined&&!this.preserveRaw(key,old.raw))return false;
  try{const raw=JSON.stringify(this.save);this.storage.setItem(key,raw);if(this.storage.getItem(key)!==raw)throw Error('Backup was not retained');this.memoryBackup=clone(this.save);return true;}
  catch{this.warning='The current run could not be backed up; reset has not replaced progress.';return false;}
 }
 newGame(confirmed=false){
  this.refresh();if(this.hasProgress&&!confirmed)return false;
  if(!this.canReplace()||!this.backupCurrent())return false;
  const next={...freshSave(),generation:newGeneration('reset')};
  if(!this.write(next))return false;
  this.save=next;this.runGeneration=generation(next);this.legacyEligible=false;this.recovery='fresh';this.lastWrite=this.storage?'written':'session';
  return true;
 }
 restorePrevious(){
  this.refresh();const stored=this.read(this.key+'-backup'),backup=stored.kind==='session'?this.memoryBackup:stored.save;
  if(stored.issue){this.warning='The previous backup could not be read; saved progress has not been replaced.';return false;}
  if(!backup||!hasProgress(backup)||!this.canReplace())return false;
  const next={...clone(backup),generation:newGeneration('restore'),updatedAt:Math.max(Date.now(),this.save.updatedAt+1)};
  if(!this.write(next))return false;
  this.save=next;this.runGeneration=generation(next);this.legacyEligible=false;this.recovery='backup';this.lastWrite=this.storage?'written':'session';
  return true;
 }
}
