"""Rift Runner campaign machinery: original textured synthesis, no third-party samples.
Preserves the existing score and historical portal preview. Python/numpy + FFmpeg.
"""
from pathlib import Path
import numpy as np, wave, json, subprocess, hashlib
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/audio';DOC=ROOT/'docs/rift-audio'
SR=32000;rng=np.random.default_rng(275050)
def noise(d):return rng.normal(0,1,int(d*SR))
def smooth(x,k=17):return np.convolve(x,np.ones(k)/k,mode='same')
def shape(t,d,a=.006,r=.08):return np.minimum(t/a,1)*np.minimum(np.maximum(d-t,0)/r,1)
def sine(f,t):return np.sin(2*np.pi*f*t)
def impact(d,f=120,amp=.12,decay=30):
 t=np.arange(int(d*SR))/SR
 return (sine(f,t)*.8+smooth(noise(d),7)*.7)*np.exp(-t*decay)*amp

def add(x,y,at,amp=1):
 i=int(at*SR);length=min(len(y),len(x)-i)
 if length>0:x[i:i+length]+=y[:length]*amp

def glass(d,m,amp=.08):
 t=np.arange(int(d*SR))/SR;f=440*2**((m-69)/12)
 return (sine(f,t)+.18*sine(f*2.003,t)*np.exp(-t*5))*np.exp(-t*3)*shape(t,d,.004,.10)*amp

def cue(name):
 if name=='switch-toggle':
  d=.26;x=impact(d,420,.13,55);add(x,impact(.16,180,.105,40),.075)
 elif name in ('shutter-open','shutter-close'):
  closing=name=='shutter-close';d=1.05 if closing else 1.2;t=np.arange(int(d*SR))/SR
  friction=smooth(noise(d),31)*.11;teeth=sine(88,t)*(.45+.55*sine(18,t)**2)*.025
  motor=sine(116 if closing else 142,t)*.018
  x=(friction+teeth+motor)*shape(t,d,.12,.18)
  add(x,impact(.2,65 if closing else 180,.17 if closing else .09,35),d-.22)
 elif name=='lift-motor':
  d=2.4;t=np.arange(int(d*SR))/SR;speed=np.minimum(t/.35,1)*np.minimum((d-t)/.45,1)
  phase=2*np.pi*np.cumsum(86+42*speed)/SR
  x=(np.sin(phase)*.023+np.sin(phase*2.01)*.010+smooth(noise(d),51)*.055)*shape(t,d,.22,.30)
  x*=.75+.25*sine(6,t)**2;add(x,impact(.18,95,.08),.05)
 elif name=='lift-arrival':
  d=.8;x=impact(d,66,.13,22);add(x,impact(.15,240,.075,40),.12);add(x,glass(.5,81,.075),.23)
 elif name=='conveyor-clutch':
  d=.7;t=np.arange(int(d*SR))/SR;x=smooth(noise(d),11)*.035*shape(t,d,.08,.16)
  for k in range(5):add(x,impact(.12,180+k*11,.08-k*.009,45),.05+k*.095)
  x+=sine(74,t)*.02*shape(t,d,.08,.16)
 elif name=='platform-move':
  d=1.85;t=np.arange(int(d*SR))/SR
  x=(smooth(noise(d),37)*.065+sine(96,t)*.019+sine(193,t)*.007)*shape(t,d,.16,.25)
  for k in range(5):add(x,impact(.16,110+k%2*25,.055,35),.20+k*.29)
 elif name=='junction-rotate':
  d=1.1;t=np.arange(int(d*SR))/SR;x=(smooth(noise(d),23)*.05+sine(164,t)*.018)*shape(t,d,.10,.16)
  for at,f in [(.12,270),(.39,220),(.68,170)]:add(x,impact(.16,f,.095,38),at)
  add(x,impact(.22,78,.12,25),.86)
 elif name=='relay-align':
  d=.85;t=np.arange(int(d*SR))/SR;phase=2*np.pi*np.cumsum(350+130*np.sin(np.pi*t/d))/SR
  x=(np.sin(phase)*.022+smooth(noise(d),9)*.035)*np.sin(np.pi*t/d)**1.5
  add(x,glass(.65,76,.06),.12);add(x,glass(.5,81,.055),.30)
 elif name=='beam-blocked':
  d=.48;t=np.arange(int(d*SR))/SR;grain=(noise(d)-smooth(noise(d),13))*.027
  x=(grain+sine(144,t)*.028)*np.exp(-t*6)*shape(t,d,.014,.10)
  x*=.4+.6*sine(23,t)**2
 elif name=='receiver-power':
  d=1.6;t=np.arange(int(d*SR))/SR;charge=sine(54,t)*.025+sine(108,t)*.012
  x=(charge+smooth(noise(d),43)*.025)*shape(t,d,.28,.32)
  for at,m in [(.18,57),(.34,64),(.52,73),(.72,76)]:add(x,glass(.8,m,.065),at)
 else:raise ValueError(name)
 a=int(.003*SR);r=int(.012*SR);x[:a]*=np.linspace(0,1,a);x[-r:]*=np.linspace(1,0,r)
 return np.stack([x,x],axis=1)

def wav(path,x):
 with wave.open(str(path),'wb')as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(x,-.98,.98)*32767).astype('<i2').tobytes())
 peak=float(np.abs(x).max());rms=float(np.sqrt(np.mean(x*x)))
 return{'seconds':len(x)/SR,'peak':peak,'peak_dbfs':20*np.log10(max(peak,1e-9)),'rms_dbfs':20*np.log10(max(rms,1e-9)),'bytes':path.stat().st_size}
def decode(path):
 r=subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','f32le','-ac','2','-ar',str(SR),'pipe:1'],capture_output=True,check=True)
 return np.frombuffer(r.stdout,dtype='<f4').reshape(-1,2)
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
historical=DOC/'rift-mixed-preview.wav';before=sha(historical)
names=['switch-toggle','shutter-open','shutter-close','lift-motor','lift-arrival','conveyor-clutch','platform-move','junction-rotate','relay-align','beam-blocked','receiver-power']
sounds={};metrics={}
for name in names:sounds[name]=cue(name);metrics[name+'.wav']=wav(OUT/(name+'.wav'),sounds[name])
# One cohesive score continues: demonstrate an intermediate chapter's slightly fuller connection blend.
PN=26*SR;music=decode(OUT/'rift-courtyard.flac');link=decode(OUT/'rift-connection.flac');amb=decode(OUT/'rift-air.flac');preview=music[:PN]*.72+np.tile(amb,(2,1))[:PN]*.65
stem=.10+np.clip((np.arange(PN)/SR-13)/7,0,.55);preview+=link[:PN]*stem[:,None]
for at,name in [(1,'switch-toggle'),(2.6,'shutter-open'),(4.4,'lift-motor'),(7,'lift-arrival'),(8.5,'conveyor-clutch'),(10,'platform-move'),(12.2,'junction-rotate'),(14,'relay-align'),(16,'beam-blocked'),(17.5,'receiver-power'),(20,'shutter-close')]:
 x=sounds[name];i=int(at*SR);preview[i:i+len(x)]+=x*.78
complete=decode(OUT/'complete.wav');i=22*SR;preview[i:i+len(complete)]+=complete*.7
preview[:int(.2*SR)]*=np.linspace(0,1,int(.2*SR))[:,None];preview[-SR:]*=np.linspace(1,0,SR)[:,None]
metrics['rift-machinery-preview.wav']=wav(DOC/'rift-machinery-preview.wav',preview)
assert sha(historical)==before,'Historical preview changed'
(DOC/'machinery-metrics.json').write_text(json.dumps({'source':'Original synthesis in scripts/render-rift-machinery.py','historical_preview_sha256':before,'historical_preview_preserved':True,'files':metrics,'runtime_audio_bytes':sum(p.stat().st_size for p in OUT.iterdir() if p.is_file())},indent=2));print(json.dumps(metrics,indent=2))
