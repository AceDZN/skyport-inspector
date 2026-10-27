"""Concrete tail-campaign world fixtures. Geometry is authored here, never inferred from missions.
Outputs ONLY src/data/worlds-upper.json. Audit catalogues separately; these are not playtest wins.
"""
from pathlib import Path
import json, math
ROOT=Path('/Users/acedzn/dev/AceDZN-exp/skyport-inspector')
PI=math.pi

def xyz(p):return dict(zip(('x','y','z'),p))
class W:
 def __init__(self,n,name,family,spawn=(0,.86,10)):
  self.d=dict(number=n,name=name,status='authored physical fixture — unverified by normal input',family=family,spawn=list(spawn),solids=[],surfaces=[],cargo=[],pads=[],bridges=[],devices=[],exits=[],regions=[],marks=[],routePoints={},notes=[])
 def box(self,id,c,size,kind='wall'):
  self.d['solids'].append(dict(id=id,min=xyz([c[i]-size[i]/2 for i in range(3)]),max=xyz([c[i]+size[i]/2 for i in range(3)]),kind=kind));return id
 def floor(self,id,x1,x2,z1,z2,y=0,th=.6):return self.box(id,((x1+x2)/2,y-th/2,(z1+z2)/2),(x2-x1,th,z2-z1),'floor')
 def floor_hole(self,id,bounds,hole,y=0):
  x1,x2,z1,z2=bounds;a,b,c,d=hole
  a,b,c,d=max(x1,a),min(x2,b),max(z1,c),min(z2,d)
  if b<=a or d<=c:self.floor(id,x1,x2,z1,z2,y);return
  for suffix,rect in [('west',(x1,a,z1,z2)),('east',(b,x2,z1,z2)),('south',(a,b,d,z2)),('north',(a,b,z1,c))]:
   if rect[1]>rect[0] and rect[3]>rect[2]:self.floor(id+'-'+suffix,*rect,y)
 def panel(self,id,p,n=(0,0,1),width=3.5,height=3.6):
  host='host-'+id;depth=.36;size=(depth,height,width+.2) if n[0] else (width+.2,height,depth)
  self.box(host,[p[i]-n[i]*.2 for i in range(3)],size)
  self.d['surfaces'].append(dict(id=id,center=xyz(p),normal=xyz(n),up=xyz((0,1,0)),width=width,height=height,solidId=host,floor=False));self.point(id,p)
 def floor_panel(self,id,c,host,width=3.2):
  self.d['surfaces'].append(dict(id=id,center=xyz(c),normal=xyz((0,1,0)),up=xyz((0,0,-1)),width=width,height=width,solidId=host,floor=True));self.point(id,c)
 def cargo(self,id,p,size='small',shape='diamond',owner=None,label=None):
  spec=dict(id=id,label=label or id.replace('-',' ').upper(),shape=shape,size=size,start='front')
  if owner:spec['owner']=owner
  self.d['cargo'].append(dict(spec=spec,position=list(p)));self.point('cargo:'+id,p)
 def pad(self,id,p,label=None):self.d['pads'].append(dict(id=id,label=label or id.replace('-',' ').upper(),position=list(p)));self.point(id,p)
 def device(self,id,kind,p,size,label=None,**kw):
  d=dict(id=id,kind=kind,label=label or id.replace('-',' ').upper(),position=list(p),size=list(size),**kw);self.d['devices'].append(d);self.point(id,p);return d
 def gate(self,id,x,z,base=0,width=3,hall=7,circuit=None,label=None,**kw):
  # Full-width partition: only the real moving aperture is passable.
  for side,xx in [('west',x-(hall+width)/4),('east',x+(hall+width)/4)]:self.box(id+'-'+side,(xx,base+2,z),((hall-width)/2,4,.38))
  self.box(id+'-transom',(x,base+3.6,z),(width,.8,.38))
  self.device(id,'shutter',(x,base+1.5,z),(width,3,.35),label=label,circuit=circuit or {},target=[x,base+5,z],**kw)
  self.region('route:'+id,(x,base+.9,z),(width,1.8,.8));self.region('cargo-zone:'+id,(x,base+1.3,z),(width,2.6,1.6));self.point(id+':before',(x,base+.86,z+1.8));self.point(id+':after',(x,base+.86,z-1.8))
 def region(self,id,p,size):self.d['regions'].append(dict(id=id,position=list(p),size=list(size)))
 def exit(self,id,p,label=None):
  self.d['exits'].append(dict(id=id,label=label or id.replace('-',' ').upper(),position=list(p),size=[1.8,1.8,1.8]));self.point(id,p)
 def bridge(self,id,c,size,circuit,route):self.d['bridges'].append(dict(id=id,center=list(c),size=list(size),circuit=circuit,route=route))
 def point(self,id,p):self.d['routePoints'][id]=list(p)
 def mark(self,text,p,n=(0,0,1),width=3,height=.5):self.d['marks'].append(dict(text=text,position=list(p),normal=list(n),width=width,height=height))
 def note(self,*xs):self.d['notes'].extend(xs)
 def relay(self,id,p,receivers,states=None,label=None):
  self.device(id,'relay',p,(.65,1,.65),label=label,states=states or [r[0] for r in receivers],receivers=[dict(id=i,position=list(pos)) for i,pos in receivers])
  existing={d['id'] for d in self.d['devices']}
  for rid,rp in receivers:
   if rid not in existing:self.device(rid,'receiver',rp,(.7,.7,.25));existing.add(rid)
 def lift(self,id,p,stops,guard=None,size=(3.4,.4,3.4),label=None):
  rows=[dict(label=name,position=list(pos),**({'guard':guard} if guard and name==stops[-1][0] else {})) for name,pos in stops]
  return self.device(id,'lift',p,size,label=label,stops=rows,**({'circuit':guard} if guard else {}))
 def launch(self,well=(0,6),startY=0,highY=6,landingY=3.4,panels=(('high-rift',0),),floor_id='floor-rift',base_bounds=(-8,8,2,12)):
  x,z=well;self.floor_hole('launch-start',base_bounds,(x-1.75,x+1.75,z-3.25,z+3.25),startY)
  bottom=startY-3;host=self.floor('launch-well-bottom',x-1.75,x+1.75,z-3.25,z+3.25,bottom,.4);self.floor_panel(floor_id,(x,bottom+.025,z),host)
  for id,px in panels:self.panel(id,(px,highY,-12),(0,0,1),3.5,3.6)
  self.mark('DROP WELL — FLOOR RIFT',(x,startY+.03,z+4.1),(0,1,0),3,.45)
  self.point('well-lip',(x,startY+.86,z+3.55));self.point('well-centre',(x,startY+.86,z));self.note(f'Real 3.5×6.5m start-floor hole alongZ; bottom host atY{bottom}; high wall planeY{highY}; landingY{landingY}. Wall-only low-speed entry must miss the five-metre air gap; no launchUsed win flag.')
 def junction(self,id,p,length=9,four=False,initial='east'):
  states=['east','north','west']+(['south'] if four else []);angles=[0,PI/2,PI]+([3*PI/2] if four else [])
  self.device(id,'junction',p,(length,.3,2.6),states=states,angles=angles,controlOffset=[-1,.9,2])
  self.point(id+':control',(p[0]-1,p[1]+.9,p[2]+2))
 def rotunda_landings(self,p=(0,0,0),east='east-exit',west='west-exit',north=None,south=None):
  x,y,z=p;self.floor('junction-safe-hub',x-3,x+3,z-3,z+3,y)
  for direction,id in [('east',east),('west',west),('north',north),('south',south)]:
   if not id:continue
   dx,dz={'east':(10,0),'west':(-10,0),'north':(0,-10),'south':(0,10)}[direction]
   self.floor(direction+'-landing',x+dx-2.5,x+dx+2.5,z+dz-2.5,z+dz+2.5,y);self.exit(id,(x+dx,y+.85,z+dz))
worlds=[]
def put(w):worlds.append(w.d)

#31 — two-level garden receivers; both rays start physically blocked.
w=W(31,'A Line of Light','relay-garden')
w.floor('entry-garden',-8,8,3,12);w.floor('lower-channel-path',-8,-2,-12,3);w.floor_hole('upper-garden-terrace',(2,8,-12,2),(3.3,6.7,-.7,2.7),3.4)
w.floor('blocker-plinth',-.65,.65,2.6,3.8,.6);w.cargo('beam-blocker',(0,1.16,3.15),'large','triangle',label='MOVABLE BEAM SCREEN')
w.relay('garden-emitter',(0,1.2,4.2),[('upper',(4,5.8,-4.2)),('lower',(-4,1.9,-4.2))])
w.gate('upper-gate',5,-6,3.4,3,6,{'all':['upper']});w.gate('lower-gate',-5,-6,0,3,6,{'all':['lower']})
w.lift('garden-lift',(5,-.2,1),[('base',(5,-.2,1)),('upper',(5,3.2,1))],{'all':['upper']})
w.panel('garden-panel',(-6,1.7,4.2));w.panel('island-panel',(7.8,5.1,-9),(-1,0,0))
w.exit('upper-garden-exit',(5,4.25,-10));w.exit('lower-garden-exit',(-5,.85,-10))
w.box('opaque-planter-west',(-1.7,.6,-.2),(1.1,1.2,3));w.box('opaque-planter-east',(1.7,.6,-.2),(1.1,1.2,3))
w.mark('SELECT RECEIVER BEFORE CLEARING SCREEN',(0,2.5,3.9));w.note('Both receiver choices are real and both initial rays intersect the same movable screen. No upper/lower power event should precede choosing/clearing the blocker; contrast can aim lower before clearing. No receiver is auto-revealed as the answer.');put(w)

#32 — first genuine momentum well, wide shared balcony, two distinct doors.
w=W(32,'First Launch','launch-spire',(0,.86,11))
w.launch(well=(3,6));w.floor('upper-balcony',-6,6,-7,-1,3.4);w.region('region:upper-balcony',(0,4.25,-4),(12,.4,6))
w.exit('east-balcony-door',(4.7,4.25,-2.2));w.exit('west-balcony-door',(-4.7,4.25,-2.2));w.cargo('scale-module',(-4,.43,9),shape='triangle');w.point('aim-high-from-start',(0,1.5,11));put(w)

#33 — one shared-height control, real cargo lift, two gate levels.
w=W(33,'Lift, Then Gate','relay-garden',(0,.86,10))
w.floor('lower-workshop',-8,8,-12,12);w.floor_hole('upper-cargo-dock',(0,8,-12,8),(1.3,4.7,2.3,5.7),3.4)
w.floor('relay-screen-plinth',-1.3,.1,1.3,2.5,2);w.cargo('beam-screen',(-.6,2.56,1.9),'large','triangle');w.cargo('cargo-1',(5.5,.43,10))
w.relay('main-emitter',(-.6,2.7,3),[('lift-receiver',(-.6,2.7,-3)),('gate-receiver',(-.6,4.8,-7))])
w.lift('cargo-lift',(3,-.2,4),[('base',(3,-.2,4)),('upper',(3,3.2,4))],{'all':['lift-receiver']})
w.gate('upper-gate',4,-6,3.4,3,8,{'all':['gate-receiver']},latch=True);w.gate('lower-gate',-4,-6,0,3,8,{'any':['gate-receiver','lift-receiver']},latch=True)
w.pad('upper-receiver',(4,3.54,-8.8));w.exit('upper-gate-exit',(4,4.25,-11));w.exit('lower-gate-exit',(-4,.85,-11))
w.panel('lower-return-panel',(-7.7,1.7,7),(1,0,0));w.panel('upper-return-panel',(7.7,5.1,7),(-1,0,0));w.mark('ONE EMITTER · LIFT / GATE',(-.6,3.5,3.2))
w.note('Shared emitter is reachable from lower floor and upper dock edge; initial screen blocks both choices, preserving both power orders. Shutters request latch:true: lead systems must implement latching for this authored field, or report the unsupported behavior rather than claiming it.');put(w)

#34 — two equally working bridge branches, current clearance is semantic only.
w=W(34,'Safe Now','history-depot',(0,.86,10))
w.floor('inspection-depot',-7,7,2,12);w.floor('loading-island',-4,4,-6,0)
w.floor('east-cargo-dock',9,14,-6,0);w.floor('west-cargo-dock',-14,-9,-6,0)
w.cargo('spare-cargo',(3,.43,8),shape='triangle');w.cargo('control-cargo',(-2,.43,8));w.cargo('reserve-cargo',(0,.43,8),shape='triangle');w.pad('loading',(0,.14,-3))
w.bridge('east-loading-bridge',(6.5,-.15,-3),(5,.3,2.8),{'all':['loading']},'east');w.bridge('west-loading-bridge',(-6.5,-.15,-3),(5,.3,2.8),{'all':['loading']},'west')
w.panel('depot-panel',(-5.5,1.7,2.2));w.panel('loading-panel',(-3.8,1.7,-4),(1,0,0));w.exit('east-exit',(12,.85,-3));w.exit('west-exit',(-12,.85,-3))
w.mark('BOTH BRIDGES OPERATIONAL',(0,2.6,-5.6));w.note('Neither route is physically broken, disabled or recoloured under contrast. Current notice/dated card selects cargo assignment only; loading pad unfolds both actual bridges.');put(w)

#35 — real width contrast across two offset canal reaches.
w=W(35,'Today’s Capacity','canal',(0,.86,10))
w.floor('south-shore',-8,8,0,12);w.floor('east-approach',3.2,6.8,-3,0);w.floor('west-approach',-6.8,-3.2,-5,0)
w.floor('east-dock',3,8,-14,-9);w.floor('west-dock',-8,-3,-14,-9)
w.box('east-wide-bridge',(5,-.15,-6),(2.6,.3,6),'bridge');w.box('west-footbridge',(-5,-.15,-7),(1.4,.3,4),'bridge')
# Fixed aperture walls, not an arbitrary size check.
for x,width,z in [(5,2.4,-1.5),(-5,1.0,-3.5)]:
 for side in [-1,1]:w.box(('east' if x>0 else 'west')+f'-opening-{side}',(x+side*(1.8+width/2)/2,1.7,z),((3.6-width)/2,3.4,.4))
 w.box(('east' if x>0 else 'west')+'-lintel',(x,3.05,z),(width,.7,.4))
w.cargo('small-cargo',(3,.43,8),'small','triangle');w.cargo('reserve-module',(-3,.43,8),shape='triangle');w.cargo('wide-cargo',(0,.56,8),'large');w.pad('east-receiver',(5,.14,-10.5));w.pad('west-receiver',(-5,.14,-10.5));w.exit('east-cargo-exit',(6.5,.85,-13));w.exit('west-cargo-exit',(-6.5,.85,-13))
w.panel('shore-panel',(-7.7,1.7,7),(1,0,0));w.panel('inlet-panel',(7.7,1.7,3),(-1,0,0));w.mark('WIDE CARGO / PEDESTRIAN OPENINGS',(0,2.7,1));w.note('Narrow aperture is1.0m: player and.84m small module fit;1.1m large module cannot physically clear it. Both bridges/exit docks remain intact under wording contrast.');put(w)

#36 — upper/lower emitters and genuinely separate north/south vaults.
w=W(36,'Which Receiver Is Powered?','dual-vault',(0,.86,1))
w.floor('control-hall',-8,8,-3,3);w.floor('north-vault-floor',-8,8,-12,-3);w.floor('south-vault-floor',-8,8,3,12)
w.floor_hole('upper-mirror-dock',(-3,3,-2.5,2.5),(-3,-.2,-1.7,1.7),3.2)
w.lift('mirror-lift',(-1.6,-.2,0),[('base',(-1.6,-.2,0)),('upper',(-1.6,3.0,0))],size=(2.8,.4,3.4))
w.relay('upper-emitter',(0,4.2,0),[('north-receiver',(4,2.5,-2.7)),('south-receiver',(4,2.5,2.7))])
w.relay('lower-emitter',(-6,1.2,0),[('north-receiver',(4,2.5,-2.7)),('south-receiver',(4,2.5,2.7))])
w.cargo('upper-screen',(.75,3.76,0),'large','triangle');w.cargo('lower-screen',(-5.25,.96,0),'large','triangle');w.floor('lower-screen-plinth',-5.8,-4.7,-.6,.6,.4)
w.cargo('cargo-1',(2,.43,0));w.gate('north-vault-gate',0,-3.1,0,3,16,{'all':['north-receiver']});w.gate('south-vault-gate',0,3.1,0,3,16,{'all':['south-receiver']})
w.pad('north-vault',(0,.14,-8));w.pad('south-vault',(0,.14,8));w.exit('north-vault-exit',(0,.85,-11));w.exit('south-vault-exit',(0,.85,11))
w.panel('control-panel',(-7.7,1.7,0),(1,0,0));w.panel('upper-control-panel',(2.8,4.9,0),(-1,0,0));w.note('Both emitters are physical controls, both shared receiver choices operate real opposite gates. Both rays initially blocked independently. Upper screen rests on3.2m dock; lower screen on.4m plinth.');put(w)

#37 — two separated control floors and independent AND/service lift circuits.
w=W(37,'Both Means Both','lift-shaft',(0,.86,10))
w.floor('base-hall',-8,8,0,12);w.floor_hole('middle-control-floor',(-8,0,-5,5),(-5.7,-2.3,1.3,4.7),3.4)
w.floor_hole('freight-top-dock',(0,8,-7,3),(1.3,4.7,-.7,2.7),6.8);w.floor_hole('service-top-dock',(-8,-1,-7,5),(-5.7,-2.3,1.3,4.7),6.8)
w.pad('lower-outer',(-5,.14,8));w.pad('middle-outer',(-5,3.54,-2));w.pad('inner',(-1,.14,8));w.cargo('cargo-a',(-2,.43,10));w.cargo('cargo-b',(2,.43,10),shape='triangle')
w.lift('freight-lift',(3,-.2,1),[('base',(3,-.2,1)),('middle',(3,3.2,1)),('top',(3,6.6,1))],{'all':['lower-outer','middle-outer']})
w.lift('service-lift',(-4,-.2,3),[('base',(-4,-.2,3)),('middle',(-4,3.2,3)),('top',(-4,6.6,3))],{'all':['inner']})
w.panel('base-panel',(-6,1.7,2.2));w.panel('middle-panel',(-7.8,5.1,-2),(1,0,0));w.exit('top-freight-exit',(5,7.65,-5.5));w.exit('service-exit',(-5.5,7.65,-5.5))
w.mark('OUTER 1 AND OUTER 2 → FREIGHT',(-4,2.6,7));w.mark('INNER → SERVICE',(-1,2.4,6.7));w.note('Lower-outer and middle-outer are genuinely different floors/positions; cargo stays on both while rider takes freight. Freight/service top stops have actual guard circuits. Removing required pad power during travel must be honored by authoritative lift guard semantics.');put(w)

#38 — staggered L gallery with two receiver-driven real gate routes.
w=W(38,'The Next Result','l-gallery',(0,.86,10))
w.floor('south-gallery',-7,7,4,12);w.floor('west-gallery',-7,-1,-10,4);w.floor('north-gallery',-7,9,-11,-4);w.floor('main-pocket',1,7,-2,4)
w.relay('beam-emitter',(-4,1.2,7),[('north',(-4,2,-3.4)),('south',(4,1.8,4.6))]);w.cargo('cargo-1',(0,.43,9));w.cargo('reserve-module',(4,.43,9),shape='triangle');w.cargo('beam-screen',(-4,1.16,6),'large','triangle');w.floor('screen-plinth',-4.6,-3.4,5.4,6.6,.6)
w.gate('side-gate',-4,-4,0,3,6,{'all':['north']});w.gate('main-gate',4,4,0,3,6,{'all':['south']});w.pad('side-receiver',(3,.14,-8));w.pad('main-receiver',(4,.14,1));w.exit('side-gate-exit',(7,.85,-9));w.exit('main-gate-exit',(6,.85,-1))
w.panel('south-panel',(-6.8,1.7,9),(1,0,0));w.panel('north-panel',(8.8,1.7,-8),(-1,0,0));w.point('L-turn',(-4,.86,-7));w.note('Beam directly follows the open straight gallery sightline; player/cargo portals solve the L transit. Ray transport through portals is not represented by static fixtures and must not be claimed without engine support.');put(w)

#39 — same actual origin, two separated landing balconies/output panels.
w=W(39,'Same Floor, New Landing','launch-spire',(0,.86,11))
w.launch(well=(0,6),panels=(('west-high-panel',-5),('east-high-panel',5)),floor_id='floor-panel')
for side,x in [('west',-5),('east',5)]:
 w.floor(side+'-balcony',x-2.4,x+2.4,-7,-1,3.4);w.pad(side+'-balcony',(x,3.54,-4));w.exit(side+'-balcony-exit',(x,4.25,-1.8))
w.cargo('spare-cargo',(3,.43,10),shape='triangle');w.cargo('cargo-1',(-3,.43,10));w.note('Both high output panels face+Z across5m gap; origin floor-panel and cargo identity stay fixed across contrast. Catalogue portal event spelling must match actual portal:player:floor-panel ledger key.');put(w)

#40 — side cargo lift/socket, gated launch well, airborne upper ring and junction.
w=W(40,'Forge Transfer','bridge-rotunda',(0,.86,11))
w.launch(well=(0,5));w.floor_hole('receiver-mezzanine',(-8,-2,0,9),(-6.7,-3.3,2.3,5.7),2.8);w.cargo('spare-cargo',(5,.43,10),shape='triangle');w.cargo('power-cell',(-5,.43,10));w.cargo('reserve-module',(0,.43,10),shape='triangle')
w.lift('receiver-lift',(-5,-.2,4),[('base',(-5,-.2,4)),('upper',(-5,2.6,4))]);w.pad('upper-socket',(-6,2.94,1))
w.relay('launch-emitter',(-6,4,3),[('launch-receiver',(-3.2,4.2,7))]);next(d for d in w.d['devices'] if d['id']=='launch-emitter')['circuit']={'all':['upper-socket']}
w.gate('launch-shutter',0,8.3,0,3.8,4.8,{'all':['upper-socket','launch-receiver']});w.box('well-west-wall',(-2.35,1.8,5),( .3,3.6,6.6));w.box('well-east-wall',(2.35,1.8,5),(.3,3.6,6.6));w.box('well-north-wall',(0,1.8,1.9),(4.8,3.6,.3))
w.rotunda_landings((0,3.4,-4),'east-upper-exit','west-upper-exit','north-upper-exit');w.region('region:upper-ring',(0,4.25,-4),(6,.4,6));w.junction('junction',(0,3.25,-4));w.panel('mezzanine-view',(-7.8,4.5,7),(1,0,0))
w.note('Socket enables a real spatial beam relay; its launch receiver opens launch-shutter guarding the only well entrance. Upper ring is separated by real flight gap; east/west/north junction arms have landing floors. Catalogue40 order shutter:launch:open is an alias mismatch: authored actual gate ID is launch-shutter, so normalize the semantic event instead of adding a fake duplicate gate.');put(w)

#41 — owner-labelled return belt, remote pickup bay, reverse portal delivery.
w=W(41,'Her Parcel, Your Route','return-loop',(-3,.86,10))
w.floor('front-return-floor',-7,7,4,12);w.floor('rear-return-floor',-3,3,-5,2);w.floor('outer-pickup-bay',7,13,-9,4);w.floor('return-elbow-floor',4,13,2.1,5)
w.device('return-belt','conveyor',(10,.1,-3),(3.4,.2,12),direction=[0,0,1],speed=1.4);w.device('return-elbow-belt','conveyor',(8,.1,3.3),(7,.2,2.4),direction=[-1,0,0],speed=1.3);w.device('front-receiving-belt','conveyor',(5,.1,7),(2.4,.2,7),direction=[0,0,1],speed=1.3)
w.cargo('oren-crate',(9.3,.63,-6),owner='Oren');w.cargo('mina-crate',(10.7,.63,-6),owner='Mina')
w.device('return-lever','switch',(-4,.8,9),(.6,1,.55));w.gate('return-shutter',10,1,0,3.8,6,{'all':['return-lever']})
for x in [7,13]:w.box('belt-side-wall-'+str(x),(x,1.7,-2.5),(.25,3.4,13))
w.pad('front-return',(-3,.14,7));w.pad('rear-return',(0,.14,-2));w.exit('front-return-exit',(-5,.85,11));w.exit('rear-return-exit',(0,.85,-4))
w.panel('front-return-panel',(-6.8,1.7,6),(1,0,0));w.panel('pickup-panel',(12.8,1.7,2.4),(-1,0,0));w.panel('rear-return-panel',(-2.8,1.7,-3),(1,0,0));w.mark('MINA / OREN · RETURN BAY',(10,2.8,-8.5))
w.note('Both owner crates start on the actual moving belt. Three supported conveyor segments form a real return path through the shutter, around the elbow, and into the front receiving floor. Main target Mina is the right-hand initial crate and second array entry; contrast changes ownership only. Return shutter is a real belt obstruction controlled from the receiving side.');put(w)

#42 — west inlet conveyor to four-way hub, Ada north/Tariq south lift branches.
w=W(42,'Beside Her Lift','conveyor-bay',(-11,.86,1))
w.floor('west-inlet-depot',-14,-6,-3,3);w.floor('conveyor-safe-hub',-3,3,-3,3)
w.floor('ada-north-base',-4,6,-15,-8);w.floor('tariq-south-base',-4,6,8,15);w.floor('east-maintenance-base',8,13,-3,3)
w.floor_hole('ada-upper-dock',(-4,6,-15,-8),(1.3,4.7,-12.7,-9.3),3.4);w.floor_hole('tariq-upper-dock',(-4,6,8,15),(1.3,4.7,9.3,12.7),3.4)
w.device('inlet-belt','conveyor',(-10,.1,0),(8,.2,2.4),direction=[1,0,0],speed=1.5);w.floor('inlet-feeder-floor',-6,-3,-1.3,1.3);w.device('inlet-feeder-belt','conveyor',(-4.5,.1,0),(3,.2,2.4),direction=[1,0,0],speed=1.4)
w.junction('conveyor-junction',(0,-.15,0),9,True)
w.cargo('ada-crate',(-12,.63,.5),owner='Ada',shape='triangle');w.cargo('tariq-crate',(-9,.63,.5),owner='Tariq')
w.pad('ada-lift-receiver',(0,.14,-11));w.pad('tariq-lift-receiver',(0,.14,11))
w.lift('ada-lift',(3,-.2,-11),[('base',(3,-.2,-11)),('middle',(3,1.5,-11)),('upper',(3,3.2,-11))],label='ADA · NORTH LIFT')
w.lift('tariq-lift',(3,-.2,11),[('base',(3,-.2,11)),('middle',(3,1.5,11)),('upper',(3,3.2,11))],label='TARIQ · SOUTH LIFT')
w.exit('ada-upper-exit',(-2,4.25,-13));w.exit('tariq-upper-exit',(-2,4.25,13));w.panel('inlet-panel',(-13.8,1.7,-1),(1,0,0));w.panel('hub-inlet-panel',(-2.8,1.7,-1),(1,0,0))
w.mark('ADA · NORTH',(0,2.7,-14.5));w.mark('TARIQ · SOUTH',(0,2.7,14.5),(0,0,-1));w.note('Real inlet belt feeds the rotating transfer deck/hub. Junction has east/north/west/south physical alignments; north/south routes connect different owner-labelled lifts and cargo receivers. Carrying across selected deck is a valid alternative to pushing; junction itself is not falsely claimed as an automatic conveyor-force system.');put(w)

#43 — fixed observed history on an actually lowering cargo rack, ground receiving dock.
w=W(43,'The Report Matches','history-depot',(-5,4.26,9))
w.floor('watch-balcony',-8,2,6,12,3.4);w.floor('lower-rack-floor',-8,3,-1,5);w.floor('north-delivery-dock',-7,7,-13,-6)
w.lift('rack-lift',(-3,3.2,2),[('upper',(-3,3.2,2)),('base',(-3,-.2,2))],size=(10,.4,4),label='REPLAY CARGO RACK')
w.cargo('crate-a',(-4.5,3.83,2),shape='diamond');w.cargo('crate-b',(-1.5,3.83,2),shape='triangle');w.d['history']={'actor':'Rook','carried':'crate-b','beside':'crate-a'}
w.pad('north-dock',(0,.14,-9));w.exit('north-dock-exit',(0,.85,-12))
w.panel('watch-panel',(-7.8,5.1,8),(1,0,0));w.panel('rack-access-panel',(1.8,5.1,2),(-1,0,0));w.panel('lower-rack-panel',(-7.8,1.7,2),(1,0,0));w.panel('north-dock-panel',(6.8,1.7,-10),(-1,0,0))
w.mark('ROOK REPLAY · WAIT FOR DROP',(-3,6.1,1.7));w.note('History is fixed: crate-b carried, crate-a stood beside. B starts right of A; actual dropX=+1.1 remains entirely inside the moving rack bounds[-8,2], so both cargoes descend with the real rack. Guide grounding must use start-floor3.4 (lead engine fix).');
put(w)

#44 — different beam branches, shared upper destination and retained north exit.
w=W(44,'One New Receiver','relay-garden',(0,.86,10))
w.floor('garden-entry',-8,8,4,12);w.floor('west-branch-base',-7,-1,-7,4);w.floor('east-branch-base',1,7,-7,4)
w.floor_hole('shared-upper-ring',(-7,7,-13,-1),(-5.7,-2.3,-5.7,-2.3),3.4)
# Cut second actual lift shaft out of the existing upper-ring rectangles.
for s in list(w.d['solids']):
 if s['id'].startswith('shared-upper-ring'):
  w.d['solids'].remove(s);a,b=s['min'],s['max'];w.floor_hole(s['id'],(a['x'],b['x'],a['z'],b['z']),(2.3,5.7,-5.7,-2.3),3.4)
w.cargo('oren-crate',(3,.43,9),owner='Oren',shape='triangle');w.cargo('mina-crate',(-3,.43,9),owner='Mina');w.floor('shared-beam-screen-plinth',-.6,.6,4.4,5.6,.6);w.cargo('beam-screen',(0,1.16,5),'large','triangle')
w.relay('garden-emitter',(0,1.2,6),[('upper',(-4,3.2,2.7)),('lower',(4,1.5,2.7))])
w.gate('upper-branch-gate',-4,2,0,3,6,{'all':['upper']});w.gate('lower-branch-gate',4,2,0,3,6,{'all':['lower']})
w.lift('west-branch-lift',(-4,-.2,-4),[('base',(-4,-.2,-4)),('upper',(-4,3.2,-4))],{'all':['upper']});w.lift('east-branch-lift',(4,-.2,-4),[('base',(4,-.2,-4)),('upper',(4,3.2,-4))],{'all':['lower']})
w.pad('shared-upper',(0,3.54,-9));w.exit('north-exit',(0,4.25,-12));w.panel('garden-entry-panel',(-7.8,1.7,8),(1,0,0));w.panel('east-base-panel',(6.8,1.7,-5),(-1,0,0));w.note('Different receivers drive different actual gate/lift branches to the same upper pad. Neither branch changes cargo owner or final exit under contrast. No high destination portal bypasses both lifts.');put(w)

#45 — two operating three-stop lifts with cross-void portal docks.
w=W(45,'Today, Not Tomorrow','lift-shaft',(-4,.86,10))
w.floor('west-base',-9,-1,4,12);w.floor('east-service-base',3.5,9,4,12)
for name,y,zmin in [('middle',3.4,-5),('top',6.8,-7)]:
 w.floor_hole(name+'-freight-dock',(-8,-1,zmin,4),(-5.7,-2.3,.3,3.7),y);w.floor_hole(name+'-service-dock',(3.5,9,zmin,4),(4.3,7.7,.3,3.7),y)
 w.panel(name+'-west-panel',(-7.8,y+1.7,zmin+1),(1,0,0));w.panel(name+'-east-panel',(8.8,y+1.7,zmin+1),(-1,0,0))
w.cargo('today-cargo',(-5,.43,9));w.cargo('reserve-cargo',(-7.5,.43,9),shape='triangle');w.cargo('tomorrow-cargo',(-2,.43,9),shape='triangle')
w.lift('freight-lift',(-4,-.2,2),[('base',(-4,-.2,2)),('middle',(-4,3.2,2)),('top',(-4,6.6,2))]);w.lift('service-lift',(6,-.2,2),[('base',(6,-.2,2)),('middle',(6,3.2,2)),('top',(6,6.6,2))])
w.pad('middle-dock',(-5,3.54,-2.5));w.pad('top-dock',(-5,6.94,-4.5));w.exit('middle-dock-exit',(6,4.25,-3.5));w.exit('top-dock-exit',(6,7.65,-5.5));w.mark('TODAY / TOMORROW DOCKS',(-4,2.6,5.5));w.note('West receiving docks and east exits are separated by4.5m central void, wider than ordinary ground-jump reach. No ground-to-upper panel lets cargo bypass vertical lift transport. Both actual lifts and middle/top choices work independent of wording.');put(w)

#46 — actual mutually exclusive main/aux gates and real cargo interval zones.
w=W(46,'Leave One Disconnected','dual-vault',(0,.86,9))
w.floor('beam-control-room',-8,8,0,12);w.floor('main-vault-floor',-8,-1,-11,0);w.floor('aux-vault-floor',1,8,-11,0)
w.floor('beam-screen-plinth',-.6,.6,4.4,5.6,.6);w.cargo('screen',(0,1.16,5),'large','triangle');w.cargo('cargo-1',(5.5,.43,10))
w.relay('main-emitter',(0,1.2,6),[('main',(-4,2,.8)),('auxiliary',(4,2,.8))]);next(d for d in w.d['devices'] if d['id']=='main-emitter')['circuit']={'not':['beam-reset']}
w.device('beam-reset','switch',(-3,.8,9),(.6,1,.55),label='BEAM RESET / DISCONNECT')
w.gate('main-gate',-4,0,0,3,7,{'all':['main'],'not':['auxiliary']});w.gate('auxiliary-gate',4,0,0,3,7,{'all':['auxiliary'],'not':['main']})
w.pad('main-vault',(-4,.14,-6));w.pad('auxiliary-vault',(4,.14,-6));w.exit('main-vault-exit',(-4,.85,-10));w.exit('auxiliary-vault-exit',(4,.85,-10))
w.panel('control-west-panel',(-7.8,1.7,7),(1,0,0));w.panel('control-east-panel',(7.8,1.7,2),(-1,0,0));w.note('cargo-zone:main-gate and cargo-zone:auxiliary-gate are genuine doorway intervals for crate enter/leave temporal evidence. They must be processed as cargo regions by the engine, not replaced with player events. Relay circuit not:beam-reset requires engine to honor relay enable circuits; disabled emitter must power neither receiver.');put(w)

#47 — two distinct operating ferry routes with different receiving depths.
w=W(47,'The Current Manifest','canal',(0,.86,10))
w.floor('shared-source-island',-7,7,4,12);w.floor('garden-dock-floor',-8,-2,-15,-7.5);w.floor('tower-dock-floor',2,8,-17,-9.5)
w.cargo('oren-crate',(2,.43,10),owner='Oren',shape='triangle');w.cargo('mina-crate',(-3.5,.43,8),owner='Mina')
w.device('garden-ferry','moving-platform',(-5,-.2,4),(3.4,.4,3.4),target=[-5,-.2,-7],period=9,dwell=2.5)
w.device('tower-ferry','moving-platform',(5,-.2,4),(3.4,.4,3.4),target=[5,-.2,-9],period=11,dwell=2.5)
w.pad('garden-dock',(-5,.14,-10));w.pad('tower-dock',(5,.14,-12));w.gate('garden-shutter',-5,-11.8,0,3,6,{'all':['garden-dock']});w.gate('tower-shutter',5,-13.8,0,3,6,{'all':['tower-dock']})
w.exit('garden-dock-exit',(-5,.85,-14));w.exit('tower-dock-exit',(5,.85,-16));w.panel('source-panel',(-6.8,1.7,8),(1,0,0));w.panel('garden-return-panel',(-7.8,1.7,-10),(1,0,0));w.panel('tower-return-panel',(7.8,1.7,-12),(-1,0,0))
w.box('garden-panel-shroud',(-7,1.7,-8.7),(.3,3.4,2));w.box('tower-panel-shroud',(7,1.7,-10.7),(.3,3.4,2));w.mark('GARDEN FERRY',(-5,2.5,4.5));w.mark('TOWER FERRY',(5,2.5,4.5))
w.note('Both ferries are running with2.5s dock dwell; inspection tense does not break/disable tower. Garden/tower pads are different physical docks. Cargo presence opens its real exit shutter. Return panels support empty-trip shortcut after exploring receiving docks.');put(w)

#48 — fixed diamond delivery history, real control cell/beam lift to a conditional junction.
w=W(48,'If the Record Says','bridge-rotunda',(0,.86,12))
w.floor('record-workshop',-8,8,4,14);w.floor('lift-approach',-2,2,2,4)
w.cargo('triangle-crate',(7,.43,9),shape='triangle');w.cargo('diamond-crate',(-3,.43,9));w.floor('cell-screen-plinth',4.4,5.6,8.4,9.6,.6);w.cargo('control-cell',(5,1.03,9),shape='triangle',label='CONTROL CELL')
w.d['history']={'actor':'Rook','carried':'diamond-crate','beside':'triangle-crate'};w.pad('record-plinth',(-5.6,.14,9));w.pad('hub-socket',(4,.14,6))
w.relay('hub-emitter',(5,1.2,10),[('hub-receiver',(5,2.2,3))])
w.lift('hub-lift',(0,-.2,2),[('base',(0,-.2,2)),('upper',(0,3.2,2))],{'all':['hub-socket','hub-receiver']})
w.rotunda_landings((0,3.4,-2),'east-hub-exit','west-hub-exit','north-lookout-exit');
# Remove overlap above lift so riders can actually ascend onto the hub.
w.d['solids']=[s for s in w.d['solids'] if s['id']!='junction-safe-hub'];w.floor_hole('junction-safe-hub',(-3,3,-5,1),(-1.7,1.7,.3,3.7),3.4)
w.junction('junction',(0,3.25,-2));w.panel('record-side-panel',(-7.8,1.7,7),(1,0,0));w.panel('record-return-panel',(7.8,1.7,5),(-1,0,0));w.note('Rook physically delivers diamond to the record plinth before standing beside triangle. Control cell is also the beam screen: moving it to hub socket both clears the real beam and supplies lift permission. Hub-lift raises the rider to the static rotating hub; dynamically translating the entire junction is not claimed by current engine.');put(w)

#49 — two real wells, first wall rift preset; opaque middle ledge exposes stage two only after arrival.
w=W(49,'Two Arcs','launch-spire',(0,.86,19))
w.launch(well=(0,11),panels=(('first-high-panel',0),),floor_id='first-floor-panel',base_bounds=(-2.5,2.5,6,20))
w.d['presetPortal']={'index':1,'surface':'first-high-panel'}
w.floor_hole('middle-ledge',(-3,3,-7,3),(-1.75,1.75,-5.25,1.25),3.4)
host=w.floor('second-well-bottom',-1.75,1.75,-5.25,1.25,.4,.4);w.floor_panel('second-floor-panel',(0,.425,-2),host);w.point('second-well-lip',(0,4.26,1.55));w.point('second-well-centre',(0,4.26,-2))
# Tall opaque front skirt hides the second floor/wall pair from lower start; first B is factory-set.
w.box('middle-opaque-front',(0,5.8,3.25),(14,12,.35));w.region('region:middle-ledge',(0,4.25,-2),(6,.4,10))
w.relay('middle-emitter',(2.5,4.6,-5.8),[('middle',(2.5,5.2,-6.7))]);w.floor('middle-screen-plinth',2,3,-6.85,-5.95,4);w.cargo('middle-screen',(2.5,4.43,-6.4),shape='triangle',label='MIDDLE BEAM SCREEN')
w.device('middle-shutter','shutter',(0,3.42,-2),(3.5,.2,6.5),target=[4,3.42,-2],circuit={'all':['middle']},label='SECOND WELL COVER')
for side,x in [('west',-10),('east',10)]:
 w.panel(side+'-second-high',(x,9.4,-26),(0,0,1));w.floor(side+'-upper-balcony',x-2.5,x+2.5,-21,-15,6.8);w.pad(side+'-upper',(x,6.94,-18));w.exit(side+'-upper-exit',(x,7.65,-15.8))
w.cargo('spare-cargo',(-1.6,.43,16.5),shape='triangle');w.cargo('large-cargo',(0,.56,16.5),'large');w.cargo('reserve-cargo',(1.6,.43,16.5),shape='triangle');w.mark('FIRST WALL RIFT PRESET · DROP TO MIDDLE',(0,2.4,13));w.note('Stage1 floorY−3→wall6→middle3.4. Factory preset first B avoids exposing any second pair through a lower viewing loophole. Middle opaque front wall blocks second-pair aiming from start; only middle ledge reveals them. Stage2 floorY.4 (3m belowmiddle)→wall9.4→upper6.8 across5m gap. Large cargo can be carried through both wells. No invisible launchUsed requirement.');put(w)

#50 — five distinct connected zones, ownership-preserving cell lift, beam gallery and launch rotunda.
w=W(50,'The Living Relay','finale',(-11,.86,12))
w.floor('zone1-return-depot',-16,-6,4,15);w.floor('return-throat',-12.5,-7.5,2.5,4.5);w.floor('zone2-garden',-15,-5,-7,3);w.floor('garden-cell-link',-6,-2,-1,3);w.floor('cell-loading-link',-4,0,1,5);w.floor('cell-base-bay',-4,4,-.7,12)
w.floor_hole('zone3-upper-cell-dock',(-4,4,-6,3),(-1.7,1.7,-.7,2.7),2.8);w.floor('zone4-beam-gallery',4,12,-6,3,2.8);w.floor('launch-throat',7.5,12.5,-7.75,-5,2.8)
w.device('return-lever','switch',(-13,.8,12),(.6,1,.55));w.gate('return-shutter',-10,3.5,0,3.8,5,{'all':['return-lever']})
w.device('loop-belt','conveyor',(-10,.06,8),(2.5,.12,12),direction=[0,0,-1],speed=1.6);w.device('loop-belt-return','conveyor',(-8,.06,1.2),(6,.12,2.5),direction=[1,0,0],speed=1.6);w.device('cell-feeder-belt','conveyor',(-1.2,.06,1.2),(6,.12,2.5),direction=[1,0,0],speed=1.5)
w.cargo('oren-crate',(-13,.43,10),owner='Oren');w.cargo('relay-cell',(1,.43,9),shape='triangle',label='RELAY CELL');w.cargo('mina-crate',(-8,.43,10),owner='Mina')
w.pad('garden-socket',(-10,.14,-4));w.lift('cell-lift',(0,-.2,1),[('base',(0,-.2,1)),('upper',(0,2.6,1))],{'all':['garden-socket']});w.pad('upper-socket',(1.8,2.94,-4))
w.floor('beam-occluder-plinth',5.6,6.7,-2.55,-1.45,3.2);w.cargo('gallery-screen',(6.15,3.76,-2),'large','triangle')
w.relay('gallery-emitter',(6,4,-1),[('launch-shutter',(10,5,-5)),('garden-receiver',(5,4,-5))]);next(d for d in w.d['devices'] if d['id']=='gallery-emitter')['circuit']={'all':['upper-socket']}
w.gate('launch-access-gate',10,-6.5,2.8,3.8,5,{'all':['launch-shutter']});w.floor('garden-service-alcove',-13,-7,-11,-7);w.gate('garden-service-shutter',-10,-7,0,3,6,{'all':['garden-receiver']});w.panel('garden-service-return',(-12.8,1.7,-9),(1,0,0))
w.floor_hole('zone5-launch-start',(5,15,-15,-7),(8.25,11.75,-14.25,-7.75),2.8);host=w.floor('final-well-bottom',8.25,11.75,-14.25,-7.75,-.2,.4);w.floor_panel('final-floor-panel',(10,-.175,-11),host)
w.panel('final-high-panel',(10,8.8,-27),(0,0,1));w.rotunda_landings((10,5.6,-19),'east-finale-exit','west-finale-exit','north-service-exit');w.junction('junction',(10,5.45,-19));w.region('region:final-rotunda',(10,6.45,-19),(6,.4,6))
w.panel('return-origin-panel',(-15.8,1.7,11),(1,0,0));w.panel('garden-return-panel',(-5.2,1.7,-3),(-1,0,0));w.panel('cell-return-panel',(-3.8,1.7,8),(1,0,0));w.panel('beam-service-panel',(11.8,4.5,1),(-1,0,0))
for id,p,size in [('zone:return-belt',(-11,.9,9),(10,1.8,10)),('zone:garden',(-10,.9,-3),(10,1.8,8)),('zone:cell-lift',(0,3.65,0),(8,1.8,6)),('zone:beam-gallery',(8,3.65,-2),(8,1.8,8))]:w.region(id,p,size)
w.mark('1 RETURN / 2 GARDEN',(-10,2.8,5));w.mark('3 CELL LIFT',(0,2.2,5));w.mark('4 BEAM GALLERY',(8,5.2,1));w.mark('5 LAUNCH ROTUNDA',(10,5.5,-7))
w.point('final-well-lip',(10,3.66,-7.45));w.point('final-well-centre',(10,3.66,-11));w.note('Five physically separate zones: return belt0m, garden socket0m, cell dock2.8m, occluded beam gallery2.8m, final launch ring5.6m. Garden/upper pads are far apart; Mina/Oren owner crates share actual options. Cell-lift upper stop guard requires garden socket. Beam relay circuit requires upper socket. Final launch has real3mwell drop (2.8→−.2), highB8.8 and ring5.6 across5m gap. West/east exits on opposite islands both accessible by actual junction.');put(w)


# Explicit fixed inventory orders, unrelated to the selected mission. Physical positions are
# authored above. Across the 15 single-identity tail tasks there are five left, five middle,
# five right source positions and five targets at each of inventory positions1/2/3.
inventory_order={33:['cargo-1','beam-screen'],34:['spare-cargo','reserve-cargo','control-cargo'],41:['mina-crate','oren-crate'],42:['tariq-crate','ada-crate'],45:['tomorrow-cargo','reserve-cargo','today-cargo'],46:['cargo-1','screen']}
for fixture in worlds:
 for device in fixture['devices']:
  p=device['position'];size=device['size'];kind=device['kind']
  if kind=='lift':
   for stop in device.get('stops',[]):
    q=stop['position'];fixture['routePoints']['control:'+device['id']+':'+stop['label']]=[q[0]-size[0]/2+.3,q[1]+.9,q[2]+size[2]/2-.2]
   fixture['routePoints']['control:'+device['id']]=[p[0]-size[0]/2+.3,p[1]+.9,p[2]+size[2]/2-.2]
  elif kind in ['switch','relay','junction']:
   offset=device.get('controlOffset',[0,0,0]);fixture['routePoints']['control:'+device['id']]=[p[i]+offset[i] for i in range(3)]
 if fixture['number'] in inventory_order:
  by_id={c['spec']['id']:c for c in fixture['cargo']}
  fixture['cargo']=[by_id[id] for id in inventory_order[fixture['number']]]

def write():
 out={'version':2,'status':'Concrete tail override; authored, not normal-input verified','scope':'World geometry independent of mission/contrast; numbers31–50','worlds':sorted(worlds,key=lambda w:w['number'])}
 (ROOT/'src/data/worlds-upper.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':write();print('Authored world numbers:',[w['number'] for w in worlds])
