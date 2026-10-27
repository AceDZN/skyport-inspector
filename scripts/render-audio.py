"""Original Skyport Inspector score and tactile foley. No third-party samples.
Run with Python + numpy, and ffmpeg available on PATH. Seeded reproduction.
"""
from pathlib import Path
import numpy as np
import wave, json, subprocess, hashlib
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'public/audio'; DOC = ROOT/'docs/audio'
SR=32000; BPM=82; BEAT=60/BPM; BAR=4*BEAT; DURATION=32*BAR
rng=np.random.default_rng(271026)

def hz(m): return 440*2**((m-69)/12)
def env(t,d,a=.008,r=.12): return np.minimum(t/a,1)*np.minimum(np.maximum(d-t,0)/r,1)
def tone(m,d,kind,vel=1):
 t=np.arange(int(d*SR))/SR; f=hz(m)
 if kind=='piano':
  x=(np.sin(2*np.pi*f*t+1.4*np.sin(2*np.pi*f*t)*np.exp(-t*9))*.6+np.sin(2*np.pi*f*2*t)*.16*np.exp(-t*5)+np.sin(2*np.pi*f*3.001*t)*.07*np.exp(-t*9))*np.exp(-t*2.4)
 elif kind=='bass':
  x=(np.sin(2*np.pi*f*t)*.78+np.sin(2*np.pi*f*2*t)*.18+np.sin(2*np.pi*f*3*t)*.04)*np.exp(-t*3.1)
 elif kind=='reed':
  vib=.0022*np.sin(2*np.pi*5*t); ph=2*np.pi*f*t+vib*f
  x=(np.sin(ph)*.70+np.sin(3*ph)*.15+np.sin(5*ph)*.04)*(.8+.2*np.exp(-t*4))
 else: x=np.sin(2*np.pi*f*t)*np.exp(-t*4)
 return x*env(t,d,.025 if kind=='reed' else .006,.15)*vel

def mix(buf,x,at,amp=1,pan=0):
 start=int(at*SR); l=len(x); gains=np.array([np.cos((pan+1)*np.pi/4),np.sin((pan+1)*np.pi/4)])*amp
 # Circular tail preserves a seamless score loop; no chopped last-bar reverb.
 ids=(np.arange(l)+start)%len(buf); buf[ids]+=x[:,None]*gains

def noise(d): return rng.normal(0,1,int(d*SR))
def smooth(x,k=21): return np.convolve(x,np.ones(k)/k,mode='same')
def brush(d=.18,amp=1):
 t=np.arange(int(d*SR))/SR; n=noise(d); return (n-smooth(n,15))*np.exp(-t*22)*amp*.25

def kick(d=.18):
 t=np.arange(int(d*SR))/SR; return np.sin(2*np.pi*(47*t+2*np.exp(-t*25)))*np.exp(-t*25)*env(t,d,.003,.02)

N=int(DURATION*SR); score=np.zeros((N,2)); energy=np.zeros((N,2))
# D major with a B minor bridge: two A phrases, contrasting B, resolved A'.
# Voicings deliberately omit dense low chords, leaving room for the documents.
chords=[([54,61,64,69],38),([55,62,66,71],43),([52,59,62,66],40),([57,61,64,67],45),
        ([54,61,64,69],38),([55,62,66,71],43),([52,59,62,66],40),([57,61,64,67],45)]
bridge=[([54,59,62,66],47),([55,59,62,66],43),([52,59,62,67],40),([57,61,64,67],45),
        ([54,59,62,66],47),([55,62,66,69],43),([52,59,62,66],40),([57,61,64,67],45)]
# Motif: held F#, ascending A–B, return A–F#–E, answered by D.
phrases=[[(.5,78,.7),(1.5,81,.45),(2.25,83,.45),(3,81,.65)],
[(.5,78,.55),(1.3,76,.5),(2.4,74,1.1)],
[(.5,76,.5),(1.4,78,.5),(2.25,81,.5),(3.25,78,.45)],
[(.4,76,1),(2,73,.55),(3,76,.65)],
[(.5,78,.7),(1.6,81,.45),(2.3,83,.5),(3.2,86,.55)],
[(.5,83,.65),(1.5,81,.6),(2.5,78,1)],
[(.5,76,.6),(1.5,78,.6),(2.5,76,.5),(3.25,73,.45)],
[(.4,74,2.4)]]
bridgephrases=[[(.5,83,1),(2,81,.7),(3,78,.6)],[(.5,79,.5),(1.5,78,.5),(2.5,76,1)],[(.5,79,.7),(1.7,83,.6),(2.7,86,.8)],[(.5,85,1),(2.5,81,1)],[(.5,83,.6),(1.5,86,.6),(2.5,90,.8)],[(.5,86,.7),(1.7,83,.6),(2.7,81,.8)],[(.5,79,.7),(1.7,78,.6),(2.7,76,.8)],[(.5,73,1),(2,76,1.4)]]
for b in range(32):
 section=b//8; q=b%8; cs,root=(bridge if section==2 else chords)[q]; t0=b*BAR
 # Soft syncopated Rhodes-like comping, with a sparse sustained response.
 for beat,d,v in [(0,1.4,.055),(1.65,.75,.044),(3.05,.72,.047)]:
  for i,m in enumerate(cs): mix(score,tone(m,d,'piano'),t0+(beat+i*.018)*BEAT,v,-.28)
 for beat,m in [(0,root),(1.7,root+7),(2.8,root+12),(3.5,root+7)]:
  mix(score,tone(m,.56,'bass'),t0+beat*BEAT,.14,.08)
 notes=(bridgephrases if section==2 else phrases)[q]
 for j,(beat,m,d) in enumerate(notes):
  if section==1 and q in (1,5) and j==0: m+=2
  if section==3 and q==7: m=74
  mix(score,tone(m,d*BEAT,'reed',.92 if section==1 else 1),t0+beat*BEAT,.065,.24)
 # A quiet brush sweep with shuffle; very light rim-like tick on 2 and 4.
 for beat in [0,.67,1,1.67,2,2.67,3,3.67]: mix(score,brush(.14),t0+beat*BEAT,.035 if beat%1==0 else .022,-.5)
 for beat in [1,3]: mix(score,brush(.08),t0+beat*BEAT,.07,.5)
 for beat in [0,2]: mix(score,kick(),t0+beat*BEAT,.034,0)
 # Optional end-of-shift layer: shuffled shaker, octave bass response, gentle fills.
 for beat in [.33,1,1.33,2.33,3,3.33]: mix(energy,brush(.1),t0+beat*BEAT,.045,.65)
 if q in (3,7):
  for k in range(4): mix(energy,brush(.12),t0+(3+k*.22)*BEAT,.045+k*.006,(-1)**k*.45)
 mix(energy,tone(root+12,.38,'bass'),t0+3.33*BEAT,.034,-.15)
# Very quiet short stereo room reflections, circular convolution.
for delay,g in [(.067,.12),(.113,.08),(.173,.045)]:
 score+=np.roll(score,int(delay*SR),axis=0)[:,::-1]*g
score*=1.35

# 24s seamless ambience, all synthetic: slow wind, quiet distant formants and propeller.
AN=SR*24; tt=np.arange(AN)/SR; amb=np.zeros((AN,2))
for ch in range(2):
 n=rng.normal(0,1,AN); wind=smooth(n,401)*(.5+.25*np.sin(2*np.pi*tt/24+ch))
 prop=(np.sin(2*np.pi*56*tt)*.007+np.sin(2*np.pi*84*tt)*.003)*(1+.3*np.sin(2*np.pi*14*tt))
 murmur=np.zeros(AN)
 for freq in [148,217,319,463]: murmur+=np.sin(2*np.pi*freq*tt+ch*.4)*.0015*(.6+.4*np.sin(2*np.pi*(3+freq%3)*tt/24))
 amb[:,ch]=wind*.045+prop+murmur
# Crossfade first/last .5 sec using periodic blend; loop endpoints measured below.
k=int(.5*SR); blend=np.linspace(0,1,k)[:,None]; tail=amb[-k:].copy(); head=amb[:k].copy(); amb[:k]=tail*(1-blend)+head*blend; amb[-k:]=amb[:k]

def foley(name):
 if name=='bell':
  d=1.6; t=np.arange(int(d*SR))/SR; x=sum(np.sin(2*np.pi*f*t)*a*np.exp(-t*r) for f,a,r in [(1047,.22,3),(2517,.12,5),(3938,.06,7)])*env(t,d,.002,.05)
 elif name in ('paper-pickup','paper-slide','page-turn'):
  d={'paper-pickup':.25,'paper-slide':.45,'page-turn':.6}[name]; t=np.arange(int(d*SR))/SR
  x=(noise(d)-smooth(noise(d),31))*.10*np.sin(np.pi*t/d)**2*(.4+.6*np.sin(2*np.pi*(14 if name=='page-turn' else 9)*t)**2)
  x+=smooth(noise(d),9)*.035*np.exp(-((t-d*.2)/.025)**2)
 elif name=='evidence-pencil':
  d=.4; t=np.arange(int(d*SR))/SR; x=(noise(d)-smooth(noise(d),9))*.065*(np.exp(-((t-.07)/.03)**2)+np.exp(-((t-.20)/.06)**2))
 elif name in ('ink-pad','board-stamp','hold-stamp'):
  d=.4; t=np.arange(int(d*SR))/SR
  f={'ink-pad':150,'board-stamp':85,'hold-stamp':68}[name]; a=.14 if name=='ink-pad' else .25
  x=np.sin(2*np.pi*f*t)*np.exp(-t*35)*a+smooth(noise(d),5)*np.exp(-t*50)*a
  if name!='ink-pad': x+=np.sin(2*np.pi*(f*2.6)*t)*np.exp(-t*65)*.05
 elif name=='gate-opening':
  d=1.2; t=np.arange(int(d*SR))/SR; x=smooth(noise(d),45)*.09*env(t,d,.2,.3)+np.sin(2*np.pi*(170*t+22*t*t))*.028*env(t,d,.2,.3)
 elif name=='recall':
  d=.9; x=np.zeros(int(d*SR))
  for at,m in [(0,76),(.18,73),(.4,74)]:
   y=tone(m,.4,'piano')*.12; ix=int(at*SR); x[ix:ix+min(len(y),len(x)-ix)]+=y[:min(len(y),len(x)-ix)]
 elif name=='shift-end':
  d=2.8; x=np.zeros(int(d*SR))
  for at,m in [(0,74),(.24,78),(.48,81),(.85,86)]:
   y=tone(m,1.8,'piano')*.13; ix=int(at*SR); x[ix:ix+min(len(y),len(x)-ix)]+=y[:min(len(y),len(x)-ix)]
 elif name=='mistake':
  d=.9; t=np.arange(int(d*SR))/SR; x=(np.sin(2*np.pi*hz(57)*t)+.55*np.sin(2*np.pi*hz(61)*t))*.055*np.exp(-t*5)*env(t,d,.01,.1)
 elif name=='question':
  d=.8; x=np.zeros(int(d*SR))
  for at,m in [(0,74),(.2,78)]:
   y=tone(m,.5,'piano')*.10; ix=int(at*SR); x[ix:ix+min(len(y),len(x)-ix)]+=y[:min(len(y),len(x)-ix)]
 return np.stack([x,x],axis=1)

# Remove a sub-millisecond discontinuity at each loop join without fading the whole loop.
for looping in (score,energy,amb):
 seam=int(.016*SR); looping[-seam:] += np.linspace(0,1,seam)[:,None]*(looping[0]-looping[-1])
stats={}
def wav(path,x):
 peak=float(np.max(np.abs(x))); rms=float(np.sqrt(np.mean(x*x)))
 with wave.open(str(path),'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x,-.98,.98)*32767).astype('<i2').tobytes())
 stats[path.name]={'duration':len(x)/SR,'peak':peak,'peak_dbfs':20*np.log10(max(peak,1e-9)),'rms_dbfs':20*np.log10(max(rms,1e-9)),'boundary_delta':float(np.max(np.abs(x[0]-x[-1])))}

def flac(name,x):
 temp=DOC/(name+'.wav'); wav(temp,x); dest=OUT/(name+'.flac')
 subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(temp),'-c:a','flac','-compression_level','8',str(dest)],check=True); temp.unlink()
 stats[name+'.flac']=stats.pop(name+'.wav'); stats[name+'.flac']['bytes']=dest.stat().st_size
flac('skyport-chamber',score); flac('shift-energy',energy); flac('terminal-ambience',amb)
cues=['bell','paper-pickup','paper-slide','page-turn','evidence-pencil','ink-pad','board-stamp','hold-stamp','gate-opening','recall','shift-end','mistake','question']
foleys={}
for name in cues:
 x=foley(name); a=int(.002*SR); r=int(.012*SR); x[:a]*=np.linspace(0,1,a)[:,None]; x[-r:]*=np.linspace(1,0,r)[:,None]; foleys[name]=x; wav(OUT/(name+'.wav'),x)
# Representative 26s mix: 8-bar motif + paper handling + two stamps + correction + transition.
PN=SR*26; preview=score[:PN]*.72+np.tile(amb,(2,1))[:PN]*.65+energy[:PN]*.18
for at,name in [(1,'bell'),(3,'paper-pickup'),(4.2,'paper-slide'),(6.3,'page-turn'),(9,'evidence-pencil'),(11,'ink-pad'),(11.3,'board-stamp'),(12,'gate-opening'),(15.5,'hold-stamp'),(16,'mistake'),(18,'recall'),(21,'question'),(23,'shift-end')]:
 x=foleys[name]; i=int(at*SR); preview[i:i+min(len(x),PN-i)]+=x[:min(len(x),PN-i)]*.75
preview[:int(.2*SR)]*=np.linspace(0,1,int(.2*SR))[:,None]; preview[-SR:]*=np.linspace(1,0,SR)[:,None]
wav(DOC/'skyport-mixed-preview.wav',preview)
(DOC/'audio-metrics.json').write_text(json.dumps({'sample_rate':SR,'bpm':BPM,'bars':32,'arrangement':'A A B A-prime','files':stats},indent=2))
print(json.dumps(stats,indent=2))
