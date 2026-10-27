"""Rift Runner original 32-bar score, courtyard bed and tactile science-fiction cues.
No external recordings/samples. Python + numpy + ffmpeg; seeded output.
"""
from pathlib import Path
import numpy as np
import wave, json, subprocess
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'public/audio'; DOC=ROOT/'docs/rift-audio'
OUT.mkdir(parents=True,exist_ok=True);DOC.mkdir(parents=True,exist_ok=True)
SR=32000; BPM=92; BEAT=60/BPM; BAR=BEAT*4; DURATION=32*BAR
rng=np.random.default_rng(271027)
def hz(m):return 440*2**((m-69)/12)
def env(t,d,a=.008,r=.08):return np.minimum(t/a,1)*np.minimum(np.maximum(d-t,0)/r,1)
def smooth(x,k=17):return np.convolve(x,np.ones(k)/k,mode='same')
def noise(d):return rng.normal(0,1,int(d*SR))
def tone(m,d,kind='glass',vel=1):
 t=np.arange(int(d*SR))/SR;f=hz(m)
 if kind=='glass':
  x=(np.sin(2*np.pi*f*t)*np.exp(-t*2.2)+.22*np.sin(2*np.pi*f*2.002*t)*np.exp(-t*6)+.10*np.sin(2*np.pi*f*3.99*t)*np.exp(-t*10))*.74
 elif kind=='pluck':
  x=np.sin(2*np.pi*f*t+.65*np.sin(2*np.pi*f*2*t)*np.exp(-t*10))*np.exp(-t*5)*.75
 elif kind=='pad':
  x=(np.sin(2*np.pi*f*t)+.34*np.sin(2*np.pi*f*1.003*t)+.16*np.sin(2*np.pi*f*2*t))*.46
 elif kind=='bass':
  x=(np.sin(2*np.pi*f*t)*.85+np.sin(2*np.pi*f*2*t)*.15)*np.exp(-t*2.1)
 else:x=np.sin(2*np.pi*f*t)*np.exp(-t*4)
 return x*env(t,d,.25 if kind=='pad' else .004,.5 if kind=='pad' else .09)*vel

def mix(buf,x,at,amp=1,pan=0):
 ids=(np.arange(len(x))+int(at*SR))%len(buf);g=np.array([np.cos((pan+1)*np.pi/4),np.sin((pan+1)*np.pi/4)])*amp
 buf[ids]+=x[:,None]*g

def tick(d=.12):
 t=np.arange(int(d*SR))/SR;n=noise(d);return (n-smooth(n,19))*.12*np.exp(-t*35)*env(t,d,.002,.03)
def kick(d=.2):
 t=np.arange(int(d*SR))/SR;return np.sin(2*np.pi*(44*t+2*np.exp(-t*20)))*.65*np.exp(-t*23)*env(t,d,.004,.03)
N=int(DURATION*SR);score=np.zeros((N,2));link=np.zeros((N,2))
# A-major colour with suspended/add9 shapes; B section changes bass and contour.
A=[([57,64,71,73],33),([54,61,68,69],30),([54,62,66,69],38),([56,64,66,71],40),
   ([57,64,68,71],33),([54,61,64,69],30),([54,62,66,73],38),([56,64,69,71],40)]
B=[([56,61,64,71],37),([54,62,66,73],38),([54,59,62,69],35),([57,64,69,71],40),
   ([56,61,64,68],37),([54,62,66,69],38),([54,59,62,66],35),([56,64,68,71],40)]
# Four-note rising "step through" motif, with an answering downward phrase.
melody=[[(.0,76,.6),(.8,81,.6),(1.8,83,.45),(2.6,85,.9)],
[(.5,88,.7),(1.5,86,.55),(2.5,85,.6),(3.3,83,.5)],
[(.25,81,1),(1.6,78,.65),(2.75,81,.8)],
[(.5,80,.6),(1.5,83,.6),(2.5,76,1.1)],
[(.0,76,.6),(.8,81,.6),(1.8,83,.45),(2.6,88,.9)],
[(.5,85,.7),(1.5,83,.55),(2.5,81,.9)],
[(.25,78,.65),(1.4,81,.6),(2.4,85,.7),(3.3,83,.5)],
[(.25,80,.7),(1.4,76,.7),(2.6,81,1.2)]]
contrast=[[(.2,80,.6),(1.2,83,.6),(2.3,88,1)],[(.5,86,.65),(1.6,85,.65),(2.7,81,.9)],
[(.1,78,.7),(1.3,81,.7),(2.6,83,.7)],[(.5,85,.6),(1.7,83,.6),(2.8,80,.9)],
[(.2,83,.6),(1.2,88,.6),(2.3,92,1)],[(.5,90,.6),(1.5,88,.6),(2.5,85,1.1)],
[(.2,86,.7),(1.4,83,.7),(2.7,81,.8)],[(.25,80,.8),(1.6,83,.6),(2.7,76,.8)]]
for bar in range(32):
 q=bar%8;section=bar//8;notes,bass=(B if section==2 else A)[q];at=bar*BAR
 # Breathing sustained harmony + two small pluck responses, space between phrases.
 for i,m in enumerate(notes):mix(score,tone(m,BAR*1.08,'pad'),at,.023,(-.6 if i%2==0 else .6))
 for beat in [0,2.5]:
  for i,m in enumerate(notes[1:]):mix(score,tone(m+12,1.0,'pluck'),at+(beat+i*.08)*BEAT,.032,-.35)
 for beat,m in [(0,bass),(2,bass+12),(3.4,bass+7)]:mix(score,tone(m,.8,'bass'),at+beat*BEAT,.12,.08)
 phrase=(contrast if section==2 else melody)[q]
 for j,(beat,m,d) in enumerate(phrase):
  if section==1 and q in (2,6) and j==1:m+=2
  if section==3 and q==7 and j==2:m=81
  mix(score,tone(m,d*BEAT+.3,'glass'),at+beat*BEAT,.074,.18+(j%2)*.1)
 # Restrained tactile pulse: sparse kick, shuffled granular ticks and soft handclap body.
 for beat in [0,2]:mix(score,kick(),at+beat*BEAT,.026,0)
 for beat in [.5,1,1.5,2.5,3,3.5]:mix(score,tick(),at+beat*BEAT,.025 if beat%1 else .04,-.6)
 if q in (3,7):
  for k in range(3):mix(score,tick(.15),at+(3.25+k*.20)*BEAT,.025,.5)
 # Emerges when linked portals / active bridge are established: glowing counter-arpeggio.
 arpeggio=[notes[0]+24,notes[2]+12,notes[1]+24,notes[3]+12,notes[2]+12,notes[0]+24]
 for k,m in enumerate(arpeggio):mix(link,tone(m,.5,'pluck'),at+(.35+k*.60)*BEAT,.052,(-.55 if k%2==0 else .55))
 for beat in [.75,1.75,2.75,3.75]:mix(link,tick(.09),at+beat*BEAT,.045,.4)
for delay,gain in [(.093,.14),(.173,.09),(.281,.04)]:score+=np.roll(score,int(delay*SR),axis=0)[:,::-1]*gain
score*=1.32
# 24-second courtyard bed: slow air movement, distant ventilation and small birds.
AN=24*SR;amb=np.zeros((AN,2));t=np.arange(AN)/SR
for ch in range(2):
 wind=smooth(rng.normal(0,1,AN),201)*(.65+.22*np.sin(2*np.pi*t/24+ch))*.043
 vent=(np.sin(2*np.pi*61*t)*.0018+np.sin(2*np.pi*122*t)*.0008)*(1+.15*np.sin(2*np.pi*t/8))
 amb[:,ch]=wind+vent
for at,base,pan in [(2.2,1710,-.75),(2.55,1910,-.72),(8.1,2060,.7),(8.5,1790,.65),(16.2,1840,-.5),(16.5,2240,-.45),(21.0,2020,.6)]:
 d=.26;tt=np.arange(int(d*SR))/SR;chirp=np.sin(2*np.pi*(base*tt+240*tt*tt+30*np.sin(2*np.pi*9*tt)))*np.sin(np.pi*tt/d)**2*.008
 mix(amb,chirp,at,1,pan)

def swell(d,lo,hi,amp=.1,reverse=False):
 t=np.arange(int(d*SR))/SR;f=lo+(hi-lo)*(t/d);phase=2*np.pi*np.cumsum(f)/SR
 n=smooth(noise(d),17);shape=np.sin(np.pi*t/d)**1.7
 if reverse:shape=np.sin(np.pi*t/d)**.7*(t/d)
 return (np.sin(phase)*.32+n*1.2)*shape*amp

def cue(name):
 if name in ('portalA','portalB'):
  d=.75;x=swell(d,340 if name=='portalA' else 470,920 if name=='portalA' else 1260,.11)
  for at,m in [(0,69 if name=='portalA' else 76),(.10,76 if name=='portalA' else 83),(.22,81 if name=='portalA' else 88)]:
   y=tone(m,.5,'glass')*.10;ix=int(at*SR);x[ix:ix+min(len(y),len(x)-ix)]+=y[:min(len(y),len(x)-ix)]
 elif name in ('enter','exit'):
  d=.65;x=swell(d,800 if name=='enter' else 180,150 if name=='enter' else 980,.17,True)
 elif name in ('invalid','error'):
  d=.42;t=np.arange(int(d*SR))/SR;f=150 if name=='invalid' else 190
  x=(np.sin(2*np.pi*f*t)+.2*np.sin(2*np.pi*f*1.07*t))*.06*np.exp(-t*8)*env(t,d,.01,.08)
  x+=smooth(noise(d),31)*.04*np.exp(-t*18)*env(t,d,.003,.03)
 elif name in ('pickup','drop','contact','pad','land'):
  d={'pickup':.32,'drop':.45,'contact':.22,'pad':.5,'land':.3}[name];t=np.arange(int(d*SR))/SR;f={'pickup':260,'drop':76,'contact':135,'pad':92,'land':62}[name]
  amp={'pickup':.07,'drop':.17,'contact':.075,'pad':.13,'land':.10}[name]
  x=(np.sin(2*np.pi*f*t)*np.exp(-t*22)+smooth(noise(d),9)*np.exp(-t*30))*amp
  if name=='pad':x+=np.sin(2*np.pi*340*t)*np.exp(-((t-.16)/.025)**2)*.055
  if name=='pickup':x+=tone(81,d,'glass')*.025
 elif name=='bridge':
  d=1.7;t=np.arange(int(d*SR))/SR;x=swell(d,105,230,.13)+smooth(noise(d),45)*.09*env(t,d,.16,.25)
  x+=np.sin(2*np.pi*98*t)*(.5+.5*np.sin(2*np.pi*13*t))*.025*env(t,d,.12,.25)
  for at,m in [(.1,57),(.3,64),(.5,73)]:
   y=tone(m,1,'glass')*.06;ix=int(at*SR);x[ix:ix+len(y)]+=y
 elif name=='jump':d=.25;x=swell(d,200,460,.09)
 elif name=='respawn':
  d=1.25;x=swell(d,1300,360,.08,True)
  for at,m in [(.35,76),(.55,81),(.75,85)]:
   y=tone(m,.5,'glass')*.07;ix=int(at*SR);x[ix:ix+min(len(y),len(x)-ix)]+=y[:min(len(y),len(x)-ix)]
 elif name=='complete':
  d=2.6;x=np.zeros(int(d*SR))
  for at,m in [(0,69),(.18,73),(.36,76),(.65,81),(1.0,85)]:
   y=tone(m,1.6,'glass')*.10;ix=int(at*SR);x[ix:ix+min(len(y),len(x)-ix)]+=y[:min(len(y),len(x)-ix)]
 else:raise ValueError(name)
 a=int(.003*SR);r=int(.012*SR);x[:a]*=np.linspace(0,1,a);x[-r:]*=np.linspace(1,0,r)
 return np.stack([x,x],axis=1)
amb*=4.0  # Vent/wind remain behind the score; birds are occasional audible courtyard detail.
# Equal endpoint values survive lossless FLAC; no codec-padding seam.
for looping in (score,link,amb):
 k=int(.018*SR);looping[-k:]+=np.linspace(0,1,k)[:,None]*(looping[0]-looping[-1])
metrics={}
def wav(path,x):
 peak=float(np.abs(x).max());rms=float(np.sqrt(np.mean(x*x)))
 with wave.open(str(path),'wb')as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(x,-.98,.98)*32767).astype('<i2').tobytes())
 metrics[path.name]={'seconds':len(x)/SR,'peak':peak,'peak_dbfs':20*np.log10(max(peak,1e-9)),'rms_dbfs':20*np.log10(max(rms,1e-9)),'boundary_delta':float(np.abs(x[0]-x[-1]).max()),'bytes':path.stat().st_size}
def flac(name,x):
 p=DOC/(name+'.wav');wav(p,x);dest=OUT/(name+'.flac')
 subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(p),'-c:a','flac','-compression_level','8',str(dest)],check=True)
 metrics[dest.name]=metrics.pop(p.name);metrics[dest.name]['bytes']=dest.stat().st_size;p.unlink()
flac('rift-courtyard',score);flac('rift-connection',link);flac('rift-air',amb)
cues=['portalA','portalB','invalid','enter','exit','pickup','drop','contact','pad','bridge','jump','land','respawn','complete','error'];sounds={}
for name in cues:sounds[name]=cue(name);wav(OUT/(name+'.wav'),sounds[name])
PN=26*SR;preview=score[:PN]*.72+np.tile(amb,(2,1))[:PN]*.8
# Pair is established at 5 seconds: gently reveal the arpeggio stem.
fade=np.clip((np.arange(PN)/SR-5)/2,0,.8);preview+=link[:PN]*fade[:,None]
for at,name in [(1,'portalA'),(3,'portalB'),(5,'enter'),(6,'exit'),(8,'pickup'),(10,'contact'),(11,'drop'),(12,'pad'),(13,'bridge'),(16,'jump'),(17,'land'),(19,'invalid'),(20,'respawn'),(22,'complete')]:
 x=sounds[name];i=int(at*SR);preview[i:i+min(len(x),PN-i)]+=x[:min(len(x),PN-i)]*.7
preview[:int(.2*SR)]*=np.linspace(0,1,int(.2*SR))[:,None];preview[-SR:]*=np.linspace(1,0,SR)[:,None]
wav(DOC/'rift-mixed-preview.wav',preview)
# Delete only the desk assets replaced by this explicitly authorized soundtrack refresh.
keep={n+'.wav'for n in cues}|{'rift-courtyard.flac','rift-connection.flac','rift-air.flac'}
for p in OUT.iterdir():
 if p.name not in keep and p.is_file():p.unlink()
(DOC/'audio-metrics.json').write_text(json.dumps({'sample_rate':SR,'bpm':BPM,'bars':32,'form':'A A B A-prime','files':metrics},indent=2))
print(json.dumps(metrics,indent=2))
