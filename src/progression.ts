/** Versioned local progress. Completion comes only from an observed, mission-matched world result. */
export const CAMPAIGN_LENGTH=50;
export const SAVE_KEY='rift-runner-campaign-v2';
export interface Store {getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void}
export interface RunEvidence {goalMatched:boolean;assistance:number;retries:number;seconds:number;portalCrossings:number;mechanisms:string[]}
export interface LevelRecord {completed:boolean;runs:number;completions:number;unaided:boolean;bestRetries:number;last:RunEvidence}
export interface CampaignSave {version:2;highestUnlocked:number;resumeLevel:number;records:Record<number,LevelRecord>;updatedAt:number}
export const freshSave=():CampaignSave=>({version:2,highestUnlocked:1,resumeLevel:1,records:{},updatedAt:Date.now()});
const levelNumber=(n:number)=>Number.isInteger(n)&&n>=1&&n<=CAMPAIGN_LENGTH;
export function parseSave(raw:string|null):CampaignSave {
 if(!raw)return freshSave();try{const v=JSON.parse(raw);if(v.version!==2||!levelNumber(v.highestUnlocked)||!levelNumber(v.resumeLevel)||!v.records||typeof v.records!=='object')return freshSave();const records:Record<number,LevelRecord>={};for(const [key,value]of Object.entries(v.records)){const n=Number(key),r=value as LevelRecord;if(levelNumber(n)&&r&&typeof r.completed==='boolean'&&typeof r.runs==='number'&&r.last&&typeof r.last.goalMatched==='boolean')records[n]=r;}return{version:2,highestUnlocked:v.highestUnlocked,resumeLevel:Math.min(v.resumeLevel,v.highestUnlocked),records,updatedAt:typeof v.updatedAt==='number'?v.updatedAt:Date.now()};}catch{return freshSave();}
}
export class CampaignProgress {
 save:CampaignSave;storage?:Store;warning?:string;
 constructor(storage?:Store){this.storage=storage;try{this.save=parseSave(storage?.getItem(SAVE_KEY)??null);}catch{this.save=freshSave();this.warning='Local storage unavailable; progress lasts for this session.';}}
 get hasProgress(){return Object.keys(this.save.records).length>0||this.save.highestUnlocked>1;}
 get complete(){return this.save.records[CAMPAIGN_LENGTH]?.completed===true;}
 status(level:number):'completed'|'unlocked'|'locked'{if(this.save.records[level]?.completed)return'completed';return level<=this.save.highestUnlocked?'unlocked':'locked';}
 canPlay(level:number){return levelNumber(level)&&this.status(level)!=='locked';}
 private persist(){this.save.updatedAt=Date.now();try{this.storage?.setItem(SAVE_KEY,JSON.stringify(this.save));}catch{this.warning='Storage is full or unavailable; this session still works.';}}
 enter(level:number){if(!this.canPlay(level))return false;if(level>=this.save.resumeLevel)this.save.resumeLevel=level;this.persist();return true;}
 observe(level:number,evidence:RunEvidence){if(!this.canPlay(level))return false;const previous=this.save.records[level];const unaided=evidence.goalMatched&&evidence.assistance===0&&evidence.retries===0;this.save.records[level]={completed:!!previous?.completed||evidence.goalMatched,runs:(previous?.runs??0)+1,completions:(previous?.completions??0)+(evidence.goalMatched?1:0),unaided:!!previous?.unaided||unaided,bestRetries:evidence.goalMatched?Math.min(previous?.completed?previous.bestRetries:Infinity,evidence.retries):(previous?.bestRetries??evidence.retries),last:{...evidence,mechanisms:[...evidence.mechanisms]}};if(evidence.goalMatched){this.save.highestUnlocked=Math.max(this.save.highestUnlocked,Math.min(CAMPAIGN_LENGTH,level+1));this.save.resumeLevel=Math.max(this.save.resumeLevel,Math.min(CAMPAIGN_LENGTH,level+1));}this.persist();return evidence.goalMatched;}
 newGame(confirmed=false){if(this.hasProgress&&!confirmed)return false;try{if(this.hasProgress)this.storage?.setItem(SAVE_KEY+'-backup',JSON.stringify(this.save));}catch{}this.save=freshSave();this.persist();return true;}
 restorePrevious(){try{const raw=this.storage?.getItem(SAVE_KEY+'-backup');if(!raw)return false;const restored=parseSave(raw);if(!Object.keys(restored.records).length&&restored.highestUnlocked===1)return false;this.save=restored;this.persist();return true;}catch{return false;}}
}
