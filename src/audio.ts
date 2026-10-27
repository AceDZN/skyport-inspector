/// <reference types="vite/client" />
/** Original locally rendered chamber-jazz score and tactile foley. See AUDIO.md. */
type Bus = 'master' | 'music' | 'sfx' | 'voice';
type Settings = Record<Bus, number>;
const defaults: Settings = { master: 0.8, music: 0.7, sfx: 0.74, voice: 0.8 };
const cueFiles = ['bell','paper-pickup','paper-slide','page-turn','evidence-pencil','ink-pad','board-stamp','hold-stamp','gate-opening','recall','shift-end','mistake','question'];
const aliases: Record<string,string> = {next:'bell',pickup:'paper-pickup',slide:'paper-slide',page:'page-turn',inspect:'page-turn',evidence:'evidence-pencil',ink:'ink-pad',board:'board-stamp',hold:'hold-stamp',gate:'gate-opening',correction:'recall',success:'gate-opening',end:'shift-end',ask:'question',stamp:'board-stamp'};
const storageKey = 'skyport-audio-v1';
export class SkyportAudio {
 private ctx?: AudioContext;
 private buses?: Record<Bus, GainNode>;
 private energyGain?: GainNode;
 private duckGain?: GainNode;
 private limiter?: DynamicsCompressorNode;
 private buffers = new Map<string,AudioBuffer>();
 private loops: AudioBufferSourceNode[] = [];
 private shots = new Set<AudioBufferSourceNode>();
 private values: Settings = {...defaults};
 private loading?: Promise<void>;
 private paused = false;
 private high = false;
 private ducked = false;
 private pauseTimer?: number;
 private cueCount = 0;
 private startedAt = 0;
 private failures: string[] = [];
 private voiceSource?: AudioBufferSourceNode;
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
   this.buses.music.connect(this.duckGain); this.duckGain.connect(this.buses.master);
   this.buses.sfx.connect(this.buses.master); this.buses.voice.connect(this.buses.master);
   this.buses.master.connect(this.limiter); this.limiter.connect(c.destination);
   for (const k of Object.keys(defaults) as Bus[]) this.buses[k].gain.value=this.values[k];
   this.energyGain.gain.value=this.high?.85:0; this.energyGain.connect(this.buses.music);
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
  const files: [string,string][] = [['music','skyport-chamber.flac'],['energy','shift-energy.flac'],['ambience','terminal-ambience.flac'],...cueFiles.map(n=>[n,n+'.wav'] as [string,string])];
  await Promise.all(files.map(async ([name,file])=>{
   try {
    const response=await fetch(new URL(import.meta.env.BASE_URL+'audio/'+file,document.baseURI).href);
    if (!response.ok) throw new Error(String(response.status));
    this.buffers.set(name,await this.ctx!.decodeAudioData(await response.arrayBuffer()));
   } catch(e) {this.failures.push(`${file}: ${String(e)}`);}
  }));
 }
 private launchLoops() {
  const c=this.ctx!; this.startedAt=c.currentTime+.04;
  for (const name of ['music','energy','ambience']) {
   const b=this.buffers.get(name); if(!b) continue;
   const source=c.createBufferSource(); source.buffer=b; source.loop=true;
   const g=c.createGain(); g.gain.value=name==='ambience'?.56:1;
   source.connect(g); g.connect(name==='energy'?this.energyGain!:this.buses!.music);
   source.start(this.startedAt); this.loops.push(source);
  }
 }
 cue(name: string): void {
  if (!this.ctx || this.ctx.state!=='running' || this.paused) return;
  name=aliases[name]||name; const b=this.buffers.get(name); if(!b) return;
  // Cap one-shots and vary paper/impact playback subtly to avoid machine-gun repetition.
  if(this.shots.size>=8) {const oldest=this.shots.values().next().value as AudioBufferSourceNode|undefined; try{oldest?.stop();}catch{} if(oldest)this.shots.delete(oldest);}
  const s=this.ctx.createBufferSource(); s.buffer=b;
  this.cueCount++; if(!['shift-end','recall','question'].includes(name)) s.playbackRate.value=.97+(this.cueCount%5)*.015;
  const g=this.ctx.createGain(); g.gain.value=.88;
  s.connect(g); g.connect(this.buses!.sfx); this.shots.add(s);
  s.onended=()=>{this.shots.delete(s); s.disconnect(); g.disconnect();}; s.start();
 }
 setPaused(paused: boolean): void {
  this.paused=paused; if(!this.ctx || !this.buses)return;
  window.clearTimeout(this.pauseTimer);
  if(paused) {
   this.ramp(this.buses.master.gain,0,.09);
   this.pauseTimer=window.setTimeout(()=>{if(this.paused)void this.ctx?.suspend();},130);
  } else {
   void this.ctx.resume(); this.ramp(this.buses.master.gain,this.values.master,.12);
  }
 }
 setEnergy(high: boolean): void {this.high=high; if(this.energyGain)this.ramp(this.energyGain.gain,high?.85:0,.8);}
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
 state() {return {context:this.ctx?.state||'not-started',paused:this.paused,loopCount:this.loops.length,activeSfx:this.shots.size,cuesPlayed:this.cueCount,energy:this.high,ducked:this.ducked,gains:this.settings(),loadedBuffers:this.buffers.size,loadErrors:[...this.failures],timeline:this.ctx?Math.max(0,this.ctx.currentTime-this.startedAt):0};}
}
