from pathlib import Path
import subprocess,json,statistics,hashlib
root=Path('/Users/acedzn/dev/AceDZN-exp/skyport-inspector');video=root/'docs/chamber-qa/core-gameplay.mp4';out=root/'docs/chamber-art/video-review'
def gray(path):return subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-vf','scale=160:100,format=gray','-f','rawvideo','-pix_fmt','gray','pipe:1'])
raw=gray(video);size=16000;frames=[raw[i:i+size] for i in range(0,len(raw),size) if len(raw[i:i+size])==size]
metrics=[{'frame':i,'seconds':round(i/25,3),'mean':sum(f)/size,'nearWhiteFraction':sum(x>245 for x in f)/size} for i,f in enumerate(frames)]
keys=['003-live-destination-at-aperture','005-partial-held-cube-at-rift','006-carried-cube-through-live-portal','007-weighted-button-and-open-door','013-momentum-gallery-landing']
matches=[]
for name in keys:
 target=gray(root/'docs/chamber-qa/final-run'/f'{name}.png')[:size][::10]
 errors=[sum(abs(a-b) for a,b in zip(f[::10],target))/len(target) for f in frames]
 at=min(range(len(errors)),key=errors.__getitem__);matches.append({'capture':name,'videoFrame':at,'videoSeconds':at/25,'meanAbsoluteGrayDifference':errors[at]})
report={'source':str(video.relative_to(root)),'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'method':'Every video frame decoded at160x100 for a near-white transient scan; nearest checkpoint matches and selected surrounding frames reviewed visually. This is not a claim of viewing every frame at full resolution.','fps':25,'frames':len(frames),'duration':len(frames)/25,'maximumNearWhiteFraction':max(metrics,key=lambda m:m['nearWhiteFraction']),'framesOver90PercentNearWhite':[m for m in metrics if m['nearWhiteFraction']>.9],'checkpointMatches':matches}
(out/'scan.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
for time in sorted(set([max(0,m['videoSeconds']+d) for m in matches for d in [-.24,0,.24]])):
 subprocess.run(['ffmpeg','-v','error','-ss',f'{time:.3f}','-i',str(video),'-frames:v','1','-y',str(out/f'frame-{time:06.2f}.png')],check=True)
