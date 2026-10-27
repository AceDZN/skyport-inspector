/// <reference types="vite/client" />
/** Original Rift Runner score, tactile device foley and velocity-driven chamber air. See AUDIO.md. */
type Bus = 'master' | 'music' | 'sfx' | 'voice';
type Settings = Record<Bus, number>;
const defaults: Settings = { master: 0.8, music: 0.7, sfx: 0.74, voice: 0.8 };
const cueFiles = ['portalA','portalB','invalid','enter','exit','pickup','drop','contact','pad','bridge','jump','land','respawn','complete','error','switch-toggle','shutter-open','shutter-close','lift-motor','lift-arrival','conveyor-clutch','platform-move','junction-rotate','relay-align','beam-blocked','receiver-power'];
const aliases: Record<string,string> = {portal_a:'portalA',portal_b:'portalB','portal-a':'portalA','portal-b':'portalB',portal:'portalA','portal-fire-a':'portalA','portal-fire-b':'portalB','portal-charge':'relay-align','portal-pass':'enter',teleport:'enter',grab:'pickup',release:'drop',impact:'contact','cube-contact':'contact','cube-pickup':'pickup','cube-drop':'drop','button-press':'pad',pressure:'pad',unfold:'bridge',fall:'respawn',restart:'respawn',success:'complete',end:'complete',mistake:'error',denied:'invalid',switch:'switch-toggle',switchToggle:'switch-toggle','door-open':'shutter-open','door-close':'shutter-close',shutterOpen:'shutter-open',shutterClose:'shutter-close',lift:'lift-motor','lift-start':'lift-motor','lift-arrive':'lift-arrival','lift-stop':'lift-arrival',conveyor:'conveyor-clutch',platform:'platform-move','moving-platform':'platform-move',junction:'junction-rotate',relay:'relay-align','relay-aligned':'relay-align',receiver:'receiver-power',power:'receiver-power'};
const storageKey = 'rift-audio-v1';
export class SkyportAudio {
 private ctx?: AudioContext;
 private buses?: Record<Bus, GainNode>;
 private energyGain?: GainNode;
 private duckGain?: GainNode;
 private musicColour?: BiquadFilterNode;
 private chapter=1;
 private intensity=0;
 private recentCues:string[]=[];
 private limiter?: DynamicsCompressorNode;
 private buffers = new Map<string,AudioBuffer>();
 private loops: AudioBufferSourceNode[] = [];
 private shots = new Set<AudioBufferSourceNode>();
 private values: Settings = {...defaults};
 private loading?: Promise<void>;
 private paused = false;
 private high = false;
 private paired = false;
 private bridgeActive = false;
 private lastCue = new Map<string,number>();
 private ducked = false;
 private pauseTimer?: number;
 private cueCount = 0;
 private startedAt = 0;
 private failures: string[] = [];
 private voiceSource?: AudioBufferSourceNode;
 private environment:'chamber'|'courtyard'='chamber';
 private ambienceFilters:BiquadFilterNode[]=[];
 private airSpeed=0;
 private airBuffer?:AudioBuffer;
 private air?:{source:AudioBufferSourceNode;gain:GainNode;filter:BiquadFilterNode;highpass:BiquadFilterNode};
 private airStopTimer?:number;
 constructor() {
  try { const saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); for (const k of Object.keys(defaults) as Bus[]) if (typeof saved[k] === 'number') this.values[k] = Math.min(1,Math.max(0,saved[k])); } catch { /* Storage may be disabled; defaults still work. */ }
 }
 settings(): Settings { return {...this.values}; }
 private ramp(param: AudioParam,value: number,seconds=.08) { const t=this.ctx!.currentTime; param.cancelScheduledValues(t); param.setTargetAtTime(value,t,seconds/3); }
 async start(): Promise<void> {
  if (!this.ctx) {
   this.ctx = new AudioContext({latencyHint:'interactive'});
   const c=this.ctx;
   this.buses = {master:c.createGain(),music:c.createGain(),sfx:c.createGain(),voice:c.createGain()};
   this.duckGain=c.createGain(); this.duckGain.gain.value=this.ducked?.24:1; this.energyGain=c.createGain(); this.limiter=c.createDynamicsCompressor();
   this.limiter.threshold.value=-8; this.limiter.knee.value=12; this.limiter.ratio.value=5; this.limiter.attack.value=.005; this.limiter.release.value=.18;
   this.musicColour=c.createBiquadFilter();this.musicColour.type='highshelf';this.musicColour.frequency.value=2400;this.musicColour.gain.value=0;
   this.buses.music.connect(this.musicColour);this.musicColour.connect(this.duckGain); this.duckGain.connect(this.buses.master);
   this.buses.sfx.connect(this.buses.master); this.buses.voice.connect(this.buses.master);
   this.buses.master.connect(this.limiter); this.limiter.connect(c.destination);
   for (const k of Object.keys(defaults) as Bus[]) this.buses[k].gain.value=this.values[k];
   this.energyGain.gain.value=this.energyLevel(); this.energyGain.connect(this.buses.music);this.applyMusicVariation();
   this.loading=this.load();
  }
  window.clearTimeout(this.pauseTimer); this.paused=false;
  this.ramp(this.buses!.master.gain,this.values.master,.12);
  // Resume is invoked synchronously in the user gesture, before awaiting fetch/decode.
  await this.ctx.resume();
  await this.loading;
  if (!this.loops.length) this.launchLoops();
 }
 private async load() {
  const files: [string,string][] = [['music','rift-courtyard.flac'],['energy','rift-connection.flac'],['ambience','rift-air.flac'],...cueFiles.map(n=>[n,n+'.wav'] as [string,string])];
  await Promise.all(files.map(async ([name,file])=>{
   try {
    const response=await fetch(new URL(import.meta.env.BASE_URL+'audio/'+file,document.baseURI).href);
    if (!response.ok) throw new Error(String(response.status));
    const decoded=await this.ctx!.decodeAudioData(await response.arrayBuffer());
    if(['music','energy','ambience'].includes(name)){
     // Browser sample-rate conversion can reintroduce a tiny endpoint step even in FLAC.
     // Correct only the last 12ms in the decoded buffer, preserving tails and exact length.
     const frames=Math.min(decoded.length,Math.ceil(decoded.sampleRate*.012));
     for(let ch=0;ch<decoded.numberOfChannels;ch++){const data=decoded.getChannelData(ch),delta=data[0]-data[data.length-1];for(let i=0;i<frames;i++)data[data.length-frames+i]+=delta*i/(frames-1);}
    }
    this.buffers.set(name,decoded);
   } catch(e) {this.failures.push(`${file}: ${String(e)}`);}
  }));
 }
 private launchLoops() {
  const c=this.ctx!; this.startedAt=c.currentTime+.04;
  for (const name of ['music','energy','ambience']) {
   const b=this.buffers.get(name); if(!b) continue;
   const source=c.createBufferSource(); source.buffer=b; source.loop=true;
   const g=c.createGain(); g.gain.value=name==='ambience'?.56:1;
   source.connect(g);
   if(name==='ambience'){
    // Keep the existing ventilation/wind; suppress courtyard bird harmonics indoors.
    const filters=[c.createBiquadFilter(),c.createBiquadFilter()];
    for(const filter of filters){filter.type='lowpass';filter.Q.value=.5;filter.frequency.value=this.environment==='chamber'?260:16000;}
    g.connect(filters[0]);filters[0].connect(filters[1]);filters[1].connect(this.buses!.music);this.ambienceFilters=filters;
   }else g.connect(name==='energy'?this.energyGain!:this.buses!.music);
   source.start(this.startedAt); this.loops.push(source);
  }
 }
 cue(name: string,pan=0): void {
  if (!this.ctx || this.ctx.state==='closed' || this.paused) return;
  // resume() is asynchronous: queued one-shots begin when the context resumes.
  // The paused flag still rejects every cue during an intentional pause.
  const profile=name==='footstep'?{event:name,buffer:'contact',gain:.15,pitch:.64,gap:.26}:name==='button-release'?{event:name,buffer:'pad',gain:.24,pitch:.72,gap:.20}:name==='lift-brake'?{event:name,buffer:'switch-toggle',gain:.16,pitch:.60,gap:.35}:undefined;
  name=profile?.buffer||aliases[name]||name; const b=this.buffers.get(name); if(!b) return;
  const event=profile?.event||name;
  const gap=profile?.gap??(({contact:.10,land:.10,invalid:.14,error:.20,'switch-toggle':.12,'shutter-open':.70,'shutter-close':.70,'lift-motor':2.0,'lift-arrival':.40,'conveyor-clutch':.30,'platform-move':1.2,'junction-rotate':.60,'relay-align':.30,'beam-blocked':.25,'receiver-power':.70} as Record<string,number>)[name]||0);
  if(this.ctx.currentTime-(this.lastCue.get(event)??-100)<gap)return;
  this.lastCue.set(event,this.ctx.currentTime);
  // Cap one-shots and vary mechanical/impact playback subtly to prevent machine-gun chatter.
  if(this.shots.size>=8) {const oldest=this.shots.values().next().value as AudioBufferSourceNode|undefined; try{oldest?.stop();}catch{} if(oldest)this.shots.delete(oldest);}
  const s=this.ctx.createBufferSource(); s.buffer=b;
  this.cueCount++;this.recentCues.push(event);if(this.recentCues.length>12)this.recentCues.shift(); if(profile)s.playbackRate.value=profile.pitch+(this.cueCount%3)*.012;else if(!['portalA','portalB','respawn','complete'].includes(name)) s.playbackRate.value=.97+(this.cueCount%5)*.015;
  const g=this.ctx.createGain(); g.gain.value=profile?.gain??.88;
  const spatial=this.ctx.createStereoPanner();spatial.pan.value=Number.isFinite(pan)?Math.min(1,Math.max(-1,pan)):0;
  s.connect(g); g.connect(spatial);spatial.connect(this.buses!.sfx); this.shots.add(s);
  s.onended=()=>{this.shots.delete(s); s.disconnect(); g.disconnect();spatial.disconnect();}; s.start();
 }
 setPaused(paused: boolean): void {
  this.paused=paused; if(!this.ctx || !this.buses)return;
  if(paused)this.setAirSpeed(0);
  window.clearTimeout(this.pauseTimer);
  if(paused) {
   this.ramp(this.buses.master.gain,0,.09);
   this.pauseTimer=window.setTimeout(()=>{if(this.paused)void this.ctx?.suspend();},130);
  } else {
   void this.ctx.resume(); this.ramp(this.buses.master.gain,this.values.master,.12);
  }
 }
 setEnergy(high: boolean): void {this.high=high;this.paired=false;this.bridgeActive=false;this.applyMusicVariation();}
 /** Reveal a quiet counter-arpeggio with a linked pair, and a fuller layer with a bridge. */
 setConnection(paired:boolean,bridge=false):void {this.paired=paired;this.bridgeActive=bridge;this.high=paired||bridge;this.applyMusicVariation();}
 private energyLevel():number{return Math.min(.92,(this.bridgeActive?.85:this.paired?.42:this.high?.85:0)+(this.chapter-1)*.035+this.intensity*.18);}
 private applyMusicVariation():void {if(this.energyGain)this.ramp(this.energyGain.gain,this.energyLevel(),.8);if(this.musicColour)this.ramp(this.musicColour.gain,([0,-1,.5,-.5,1][this.chapter-1]??0)+this.intensity*.8,1.4);}
 /** One coherent score across the campaign; subtle stem/colour variation, no loop restart. */
 setChapter(chapter:number,intensity=0):void {if(Number.isFinite(chapter))this.chapter=Math.min(5,Math.max(1,Math.round(chapter)));this.setIntensity(intensity);}
 setIntensity(value:number):void {if(!Number.isFinite(value))return;this.intensity=Math.min(1,Math.max(0,value));this.applyMusicVariation();}
 /** Indoors, retain low ventilation while removing the distant courtyard birds. */
 setEnvironment(environment:'chamber'|'courtyard'):void {this.environment=environment;for(const f of this.ambienceFilters)this.ramp(f.frequency,environment==='chamber'?260:16000,.6);}
 /** Actual world speed drives a continuous air texture; ordinary walking stays silent. */
 setAirSpeed(speed:number):void {
  if(!Number.isFinite(speed))return;this.airSpeed=Math.max(0,Math.min(80,speed));
  if(!this.ctx||!this.buses)return;
  const amount=this.paused?0:Math.min(1,Math.max(0,(this.airSpeed-6)/20));
  if(!amount){
   if(this.air){this.ramp(this.air.gain.gain,0,.12);if(this.airStopTimer===undefined){const air=this.air;this.airStopTimer=window.setTimeout(()=>{air.source.stop();air.source.disconnect();air.gain.disconnect();air.filter.disconnect();air.highpass.disconnect();if(this.air===air)this.air=undefined;this.airStopTimer=undefined;},240);}}
   return;
  }
  window.clearTimeout(this.airStopTimer);this.airStopTimer=undefined;
  if(!this.air){
   const c=this.ctx;
   if(!this.airBuffer){
    // Seeded, unpitched original air. Circular endpoints avoid a periodic tick.
    const b=c.createBuffer(2,c.sampleRate*2,c.sampleRate);let seed=0x27a1f1;
    for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<d.length;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;d[i]=((seed>>>0)/4294967296-.5)*.7;}const n=Math.ceil(c.sampleRate*.012),delta=d[0]-d[d.length-1];for(let i=0;i<n;i++)d[d.length-n+i]+=delta*i/(n-1);}
    this.airBuffer=b;
   }
   const source=c.createBufferSource(),gain=c.createGain(),filter=c.createBiquadFilter(),highpass=c.createBiquadFilter();source.buffer=this.airBuffer;source.loop=true;gain.gain.value=0;highpass.type='highpass';highpass.frequency.value=170;filter.type='lowpass';filter.frequency.value=1100;filter.Q.value=.5;source.connect(highpass);highpass.connect(filter);filter.connect(gain);gain.connect(this.buses.sfx);source.start();this.air={source,gain,filter,highpass};
  }
  this.ramp(this.air.gain.gain,.13*amount**1.35,.14);this.ramp(this.air.filter.frequency,1100+amount*2100,.2);
 }
 setGain(bus: string,value: number): void {
  if(!(bus in defaults) || !Number.isFinite(value))return; const key=bus as Bus;
  this.values[key]=Math.min(1,Math.max(0,value));
  try {localStorage.setItem(storageKey,JSON.stringify(this.values));}catch{}
  if(this.buses && !(key==='master'&&this.paused))this.ramp(this.buses[key].gain,this.values[key]);
 }
 /** Reserved for optional subtitled voice playback; ambience/music reduce under speech. */
 setDucking(ducked: boolean): void {this.ducked=ducked;if(this.duckGain)this.ramp(this.duckGain.gain,ducked?.24:1,ducked?.12:.5);}
 async playVoice(url: string): Promise<void> {
  await this.start(); this.voiceSource?.stop();
  const r=await fetch(url); const b=await this.ctx!.decodeAudioData(await r.arrayBuffer());
  const s=this.ctx!.createBufferSource();s.buffer=b;s.connect(this.buses!.voice);this.voiceSource=s;this.setDucking(true);
  s.onended=()=>{if(this.voiceSource===s){this.voiceSource=undefined;this.setDucking(false);}s.disconnect();};s.start();
 }
 state() {return {context:this.ctx?.state||'not-started',paused:this.paused,loopCount:this.loops.length,activeSfx:this.shots.size,cuesPlayed:this.cueCount,energy:this.high,chapter:this.chapter,intensity:this.intensity,environment:this.environment,airSpeed:this.airSpeed,airActive:!!this.air,recentCues:[...this.recentCues],paired:this.paired,bridge:this.bridgeActive,ducked:this.ducked,gains:this.settings(),loadedBuffers:this.buffers.size,loadErrors:[...this.failures],timeline:this.ctx?Math.max(0,this.ctx.currentTime-this.startedAt):0};}
}

/** New product name; the old export remains source-compatible for integration. */
export { SkyportAudio as RiftAudio };
