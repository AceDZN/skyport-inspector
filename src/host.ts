/** Workbook v1 bridge. Standalone and foreign parents receive no messages. */
export const GAME_SLUG = 'rift-runner';
export const HOST_LEVEL_COUNT = 50;
export type HostMessage =
    | {type:'ready'}
    | {type:'level-start';level:number}
    | {type:'level-complete';level:number;durationMs:number}
    | {type:'error';message:string};

export function allowedParentOrigin(origin:string, ownOrigin:string):string|null {
    let url:URL;
    try { url=new URL(origin); } catch { return null; }
    if(url.origin!==origin||url.username||url.password)return null;
    const workbook=url.protocol==='https:'&&url.port===''&&/^(?:[a-z0-9-]+\.)*workbook\.co\.il$/.test(url.hostname);
    const local=url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname);
    const preview=origin===ownOrigin&&url.protocol==='https:'&&url.port===''&&/^[a-z0-9-]+\.vercel\.app$/.test(url.hostname);
    return workbook||local||preview?origin:null;
}

/** Canonical, unambiguous 1-based entry only; invalid links keep normal saved play. */
export function parseLevelParam(search:string, levelCount=HOST_LEVEL_COUNT):number|null {
    if(!Number.isSafeInteger(levelCount)||levelCount<1)return null;
    const values=new URLSearchParams(search).getAll('level');
    if(values.length!==1||!/^[1-9]\d*$/.test(values[0]))return null;
    const n=Number(values[0]);
    return Number.isSafeInteger(n)&&n<=Math.min(levelCount,HOST_LEVEL_COUNT)?n-1:null;
}

export function isMuteMessage(data:unknown):data is {source:'workbook-host';version:1;slug:typeof GAME_SLUG;type:'set-muted';muted:boolean} {
    if(!data||typeof data!=='object')return false;
    const d=data as Record<string,unknown>;
    return d.source==='workbook-host'&&d.version===1&&d.slug===GAME_SLUG&&d.type==='set-muted'&&typeof d.muted==='boolean';
}

/** An instance owns its listeners, so reinitialization never duplicates reports. */
export function connectHost(onMute:(muted:boolean)=>void, browser:Window=window, doc:Pick<Document,'referrer'>=document) {
    let origin='';
    if(browser.parent!==browser){
        try { origin=browser.location.ancestorOrigins?.[0]??''; } catch { /* referrer fallback */ }
        if(!origin&&doc.referrer){try { origin=new URL(doc.referrer).origin; } catch { /* untrusted */ }}
    }
    const target=allowedParentOrigin(origin,browser.location.origin);
    const send=(message:HostMessage)=>{
        if(target&&browser.parent!==browser)browser.parent.postMessage({...message,source:'workbook-game',version:1,slug:GAME_SLUG},target);
    };
    const mute=(event:MessageEvent)=>{
        if(event.source===browser.parent&&event.origin===target&&isMuteMessage(event.data))onMute(event.data.muted);
    };
    const error=()=>send({type:'error',message:'Rift Runner could not continue. Reload the game to try again.'});
    if(target){browser.addEventListener('message',mute);browser.addEventListener('error',error);browser.addEventListener('unhandledrejection',error);}
    return {send,connected:!!target,dispose(){if(target){browser.removeEventListener('message',mute);browser.removeEventListener('error',error);browser.removeEventListener('unhandledrejection',error);}}};
}

/** Attempts use the game's active simulation time, which already stops for pause/help. */
export class WorkbookSession {
    private ready=false;
    private active:number|null=null;
    private completed=false;
    private startedAt=0;
    private pending:HostMessage[]=[];
    constructor(private send:(message:HostMessage)=>void){}
    private emit(message:HostMessage){if(this.ready)this.send(message);else this.pending.push(message);}
    markReady(){if(this.ready)return;this.ready=true;this.send({type:'ready'});for(const message of this.pending)this.send(message);this.pending=[];}
    startAttempt(level:number, activeSeconds:number){
        if(!Number.isInteger(level)||level<1||level>HOST_LEVEL_COUNT||!Number.isFinite(activeSeconds)||activeSeconds<0)return;
        this.active=level;this.completed=false;this.startedAt=activeSeconds;this.emit({type:'level-start',level});
    }
    completeLevel(level:number, activeSeconds:number){
        if(this.active!==level||this.completed||!Number.isFinite(activeSeconds)||activeSeconds<this.startedAt)return;
        this.completed=true;this.emit({type:'level-complete',level,durationMs:Math.round((activeSeconds-this.startedAt)*1000)});
    }
    leave(){this.active=null;this.completed=false;}
}
