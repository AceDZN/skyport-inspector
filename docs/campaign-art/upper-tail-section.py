#41 — owner-labelled return belt, remote pickup bay, reverse portal delivery.
w=W(41,'Her Parcel, Your Route','return-loop',(-3,.86,10))
w.floor('front-return-floor',-7,7,4,12);w.floor('rear-return-floor',-3,3,-5,2);w.floor('outer-pickup-bay',7,13,-9,4)
w.device('return-belt','conveyor',(10,.1,-3),(3.4,.2,12),direction=[0,0,1],speed=1.4)
w.cargo('oren-crate',(9.3,.63,-6),owner='Oren');w.cargo('mina-crate',(10.7,.63,-6),owner='Mina')
w.device('return-lever','switch',(-4,.8,9),(.6,1,.55));w.gate('return-shutter',10,1,0,3.8,6,{'all':['return-lever']})
for x in [7,13]:w.box('belt-side-wall-'+str(x),(x,1.7,-2.5),(.25,3.4,13))
w.pad('front-return',(-3,.14,7));w.pad('rear-return',(0,.14,-2));w.exit('front-return-exit',(-5,.85,11));w.exit('rear-return-exit',(0,.85,-4))
w.panel('front-return-panel',(-6.8,1.7,6),(1,0,0));w.panel('pickup-panel',(12.8,1.7,2.4),(-1,0,0));w.panel('rear-return-panel',(-2.8,1.7,-3),(1,0,0));w.mark('MINA / OREN · RETURN BAY',(10,2.8,-8.5))
w.note('Both owner crates start on the actual moving belt. Main target Mina is the right-hand initial crate and second array entry; contrast changes ownership only. Return shutter is a real belt obstruction controlled from the receiving side.');put(w)

#42 — west inlet conveyor to four-way hub, Ada north/Tariq south lift branches.
w=W(42,'Beside Her Lift','conveyor-bay',(-11,.86,1))
w.floor('west-inlet-depot',-14,-6,-3,3);w.floor('conveyor-safe-hub',-3,3,-3,3)
w.floor('ada-north-base',-4,6,-15,-8);w.floor('tariq-south-base',-4,6,8,15);w.floor('east-maintenance-base',8,13,-3,3)
w.floor_hole('ada-upper-dock',(-4,6,-15,-8),(1.3,4.7,-12.7,-9.3),3.4);w.floor_hole('tariq-upper-dock',(-4,6,8,15),(1.3,4.7,9.3,12.7),3.4)
w.device('inlet-belt','conveyor',(-10,.1,0),(7,.2,2.4),direction=[1,0,0],speed=1.5)
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
w.lift('rack-lift',(-3,3.2,2),[('upper',(-3,3.2,2)),('base',(-3,-.2,2))],size=(8,.4,4),label='REPLAY CARGO RACK')
w.cargo('crate-a',(-4.5,3.83,2),shape='diamond');w.cargo('crate-b',(-1.5,3.83,2),shape='triangle');w.d['history']={'actor':'Rook','carried':'crate-b','beside':'crate-a'}
w.pad('north-dock',(0,.14,-9));w.exit('north-dock-exit',(0,.85,-12))
w.panel('watch-panel',(-7.8,5.1,8),(1,0,0));w.panel('rack-access-panel',(.8,5.1,2),(-1,0,0));w.panel('lower-rack-panel',(-7.8,1.7,2),(1,0,0));w.panel('north-dock-panel',(6.8,1.7,-10),(-1,0,0))
w.mark('ROOK REPLAY · WAIT FOR DROP',(-3,6.1,1.7));w.note('History is fixed: crate-b carried, crate-a stood beside. B starts right of A; actual dropX=+1.1 stays inside rack bounds[-7,1] only if extended landing lip is supplied; rack extends toX1 exactly, so its projection edge is corrected by the receiving shelf below. Guide grounding must use start-floor3.4 (lead engine fix).');
# Receiving lip supports the carried crate after its rightward drop atX1.1.
w.floor('rack-drop-lip',.9,2,-.1,4.1,3.4);put(w)

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
w.cargo('tomorrow-cargo',(-2,.43,9),shape='triangle');w.cargo('today-cargo',(-5,.43,9))
w.lift('freight-lift',(-4,-.2,2),[('base',(-4,-.2,2)),('middle',(-4,3.2,2)),('top',(-4,6.6,2))]);w.lift('service-lift',(6,-.2,2),[('base',(6,-.2,2)),('middle',(6,3.2,2)),('top',(6,6.6,2))])
w.pad('middle-dock',(-5,3.54,-2.5));w.pad('top-dock',(-5,6.94,-4.5));w.exit('middle-dock-exit',(6,4.25,-3.5));w.exit('top-dock-exit',(6,7.65,-5.5));w.mark('TODAY / TOMORROW DOCKS',(-4,2.6,5.5));w.note('West receiving docks and east exits are separated by4.5m central void, wider than ordinary ground-jump reach. No ground-to-upper panel lets cargo bypass vertical lift transport. Both actual lifts and middle/top choices work independent of wording.');put(w)

#46 — actual mutually exclusive main/aux gates and real cargo interval zones.
w=W(46,'Leave One Disconnected','dual-vault',(0,.86,9))
w.floor('beam-control-room',-8,8,0,12);w.floor('main-vault-floor',-8,-1,-11,0);w.floor('aux-vault-floor',1,8,-11,0)
w.floor('beam-screen-plinth',-.6,.6,4.4,5.6,.6);w.cargo('screen',(0,1.16,5),'large','triangle');w.cargo('cargo-1',(3,.43,9))
w.relay('main-emitter',(0,1.2,6),[('main',(-4,2,-.2)),('auxiliary',(4,2,-.2))]);next(d for d in w.d['devices'] if d['id']=='main-emitter')['circuit']={'not':['beam-reset']}
w.device('beam-reset','switch',(-3,.8,9),(.6,1,.55),label='BEAM RESET / DISCONNECT')
w.gate('main-gate',-4,0,0,3,7,{'all':['main'],'not':['auxiliary']});w.gate('auxiliary-gate',4,0,0,3,7,{'all':['auxiliary'],'not':['main']})
w.pad('main-vault',(-4,.14,-6));w.pad('auxiliary-vault',(4,.14,-6));w.exit('main-vault-exit',(-4,.85,-10));w.exit('auxiliary-vault-exit',(4,.85,-10))
w.panel('control-west-panel',(-7.8,1.7,7),(1,0,0));w.panel('control-east-panel',(7.8,1.7,2),(-1,0,0));w.note('cargo-zone:main-gate and cargo-zone:auxiliary-gate are genuine doorway intervals for crate enter/leave temporal evidence. They must be processed as cargo regions by the engine, not replaced with player events. Relay circuit not:beam-reset requires engine to honor relay enable circuits; disabled emitter must power neither receiver.');put(w)

#47 — two distinct operating ferry routes with different receiving depths.
w=W(47,'The Current Manifest','canal',(0,.86,10))
w.floor('shared-source-island',-7,7,4,12);w.floor('garden-dock-floor',-8,-2,-15,-7.5);w.floor('tower-dock-floor',2,8,-17,-9.5)
w.cargo('oren-crate',(-2,.43,9),owner='Oren',shape='triangle');w.cargo('mina-crate',(2,.43,9),owner='Mina')
w.device('garden-ferry','moving-platform',(-5,-.2,4),(3.4,.4,3.4),target=[-5,-.2,-7],period=9,dwell=2.5)
w.device('tower-ferry','moving-platform',(5,-.2,4),(3.4,.4,3.4),target=[5,-.2,-9],period=11,dwell=2.5)
w.pad('garden-dock',(-5,.14,-10));w.pad('tower-dock',(5,.14,-12));w.gate('garden-shutter',-5,-11.8,0,3,6,{'all':['garden-dock']});w.gate('tower-shutter',5,-13.8,0,3,6,{'all':['tower-dock']})
w.exit('garden-dock-exit',(-5,.85,-14));w.exit('tower-dock-exit',(5,.85,-16));w.panel('source-panel',(-6.8,1.7,8),(1,0,0));w.panel('garden-return-panel',(-7.8,1.7,-10),(1,0,0));w.panel('tower-return-panel',(7.8,1.7,-12),(-1,0,0))
w.box('garden-panel-shroud',(-7,1.7,-8.7),(.3,3.4,2));w.box('tower-panel-shroud',(7,1.7,-10.7),(.3,3.4,2));w.mark('GARDEN FERRY',(-5,2.5,4.5));w.mark('TOWER FERRY',(5,2.5,4.5))
w.note('Both ferries are running with2.5s dock dwell; inspection tense does not break/disable tower. Garden/tower pads are different physical docks. Cargo presence opens its real exit shutter. Return panels support empty-trip shortcut after exploring receiving docks.');put(w)

#48 — fixed diamond delivery history, real control cell/beam lift to a conditional junction.
w=W(48,'If the Record Says','bridge-rotunda',(0,.86,12))
w.floor('record-workshop',-8,8,4,14);w.floor('lift-approach',-2,2,2,4)
w.cargo('triangle-crate',(1,.43,9),shape='triangle');w.cargo('diamond-crate',(-3,.43,9));w.floor('cell-screen-plinth',4.4,5.6,8.4,9.6,.6);w.cargo('control-cell',(5,1.03,9),shape='triangle',label='CONTROL CELL')
w.d['history']={'actor':'Rook','carried':'diamond-crate','beside':'triangle-crate'};w.pad('record-plinth',(-5.6,.14,9));w.pad('hub-socket',(4,.14,6))
w.relay('hub-emitter',(5,1.2,10),[('hub-receiver',(5,2.2,3))])
w.lift('hub-lift',(0,-.2,2),[('base',(0,-.2,2)),('upper',(0,3.2,2))],{'all':['hub-socket','hub-receiver']})
w.rotunda_landings((0,3.4,-2),'east-hub-exit','west-hub-exit','north-lookout-exit');
# Remove overlap above lift so riders can actually ascend onto the hub.
w.d['solids']=[s for s in w.d['solids'] if s['id']!='junction-safe-hub'];w.floor_hole('junction-safe-hub',(-3,3,-5,1),(-1.7,1.7,.3,3.7),3.4)
w.junction('junction',(0,3.25,-2));w.panel('record-side-panel',(-7.8,1.7,7),(1,0,0));w.panel('record-return-panel',(7.8,1.7,5),(-1,0,0));w.note('Rook physically delivers diamond to the record plinth before standing beside triangle. Control cell is also the beam screen: moving it to hub socket both clears the real beam and supplies lift permission. Hub-lift raises the rider to the static rotating hub; dynamically translating the entire junction is not claimed by current engine.');put(w)

#49 — two real wells, first wall rift preset; opaque middle ledge exposes stage two only after arrival.
w=W(49,'Two Arcs','launch-spire',(0,.86,15))
w.launch(well=(0,11),panels=(('first-high-panel',0),),floor_id='first-floor-panel',base_bounds=(-2.5,2.5,8,16))
w.d['presetPortal']={'index':1,'surface':'first-high-panel'}
w.floor_hole('middle-ledge',(-3,3,-7,-1),(-1.75,1.75,-5.45,-1.95),3.4)
host=w.floor('second-well-bottom',-1.75,1.75,-5.45,-1.95,.4,.4);w.floor_panel('second-floor-panel',(0,.425,-3.7),host)
# Tall opaque front skirt hides the second floor/wall pair from lower start; first B is factory-set.
w.box('middle-opaque-front',(0,5.8,-.75),(6,12,.35));w.region('region:middle-ledge',(0,4.25,-4),(6,.4,6))
w.relay('middle-emitter',(2.5,4.6,-5.8),[('middle',(2.5,5.2,-6.7)),('side',( -2.5,5.2,-6.7))])
w.device('middle-shutter','shutter',(0,3.42,-3.7),(3.5,.2,3.5),target=[4,3.42,-3.7],circuit={'all':['middle']},label='SECOND WELL COVER')
for side,x in [('west',-10),('east',10)]:
 w.panel(side+'-second-high',(x,9.4,-26),(0,0,1));w.floor(side+'-upper-balcony',x-2.5,x+2.5,-21,-15,6.8);w.pad(side+'-upper',(x,6.94,-18));w.exit(side+'-upper-exit',(x,7.65,-15.8))
w.cargo('spare-cargo',(1.7,.43,14),shape='triangle');w.cargo('large-cargo',(-1.6,.56,14),'large');w.mark('FIRST WALL RIFT PRESET · DROP TO MIDDLE',(0,2.4,13));w.note('Stage1 floorY−3→wall6→middle3.4. Factory preset first B avoids exposing any second pair through a lower viewing loophole. Middle opaque front wall blocks second-pair aiming from start; only middle ledge reveals them. Stage2 floorY.4 (3m belowmiddle)→wall9.4→upper6.8 across5m gap. Large cargo can be carried through both wells. No invisible launchUsed requirement.');put(w)

#50 — five distinct connected zones, ownership-preserving cell lift, beam gallery and launch rotunda.
w=W(50,'The Living Relay','finale',(-11,.86,12))
w.floor('zone1-return-depot',-16,-6,4,15);w.floor('return-throat',-12.5,-7.5,2.5,4.5);w.floor('zone2-garden',-15,-5,-7,3);w.floor('garden-cell-link',-6,-2,-1,3);w.floor('cell-loading-link',-4,0,1,5);w.floor('cell-base-bay',-4,4,-.7,12)
w.floor_hole('zone3-upper-cell-dock',(-4,4,-6,3),(-1.7,1.7,-.7,2.7),2.8);w.floor('zone4-beam-gallery',4,12,-6,3,2.8);w.floor('launch-throat',7.5,12.5,-8,-5,2.8)
w.device('return-lever','switch',(-13,.8,12),(.6,1,.55));w.gate('return-shutter',-10,3.5,0,3.8,5,{'all':['return-lever']})
w.device('loop-belt','conveyor',(-10,.06,8),(2.5,.12,12),direction=[0,0,-1],speed=1.6);w.device('loop-belt-return','conveyor',(-8,.06,1.2),(6,.12,2.5),direction=[1,0,0],speed=1.6)
w.cargo('oren-crate',(-13,.43,10),owner='Oren');w.cargo('relay-cell',(1,.43,9),shape='triangle',label='RELAY CELL');w.cargo('mina-crate',(-8,.43,10),owner='Mina')
w.pad('garden-socket',(-10,.14,-4));w.lift('cell-lift',(0,-.2,1),[('base',(0,-.2,1)),('upper',(0,2.6,1))],{'all':['garden-socket']});w.pad('upper-socket',(1.8,2.94,-4))
w.floor('beam-occluder-plinth',5.6,6.7,-2.55,-1.45,3.2);w.cargo('gallery-screen',(6.15,3.76,-2),'large','triangle')
w.relay('gallery-emitter',(6,4,-1),[('launch-shutter',(10,5,-5)),('garden-receiver',(5,4,-5))]);next(d for d in w.d['devices'] if d['id']=='gallery-emitter')['circuit']={'all':['upper-socket']}
w.gate('launch-access-gate',10,-6.5,2.8,3.8,5,{'all':['launch-shutter']})
w.floor_hole('zone5-launch-start',(5,15,-15,-7),(8.25,11.75,-12.75,-9.25),2.8);host=w.floor('final-well-bottom',8.25,11.75,-12.75,-9.25,-.2,.4);w.floor_panel('final-floor-panel',(10,-.175,-11),host)
w.panel('final-high-panel',(10,8.8,-27),(0,0,1));w.rotunda_landings((10,5.6,-19),'east-finale-exit','west-finale-exit','north-service-exit');w.junction('junction',(10,5.45,-19));w.region('region:final-rotunda',(10,6.45,-19),(6,.4,6))
w.panel('return-origin-panel',(-15.8,1.7,11),(1,0,0));w.panel('garden-return-panel',(-5.2,1.7,-3),(-1,0,0));w.panel('cell-return-panel',(-3.8,1.7,8),(1,0,0));w.panel('beam-service-panel',(11.8,4.5,1),(-1,0,0))
for id,p,size in [('zone:return-belt',(-11,.9,9),(10,1.8,10)),('zone:garden',(-10,.9,-3),(10,1.8,8)),('zone:cell-lift',(0,3.65,0),(8,1.8,6)),('zone:beam-gallery',(8,3.65,-2),(8,1.8,8))]:w.region(id,p,size)
w.mark('1 RETURN / 2 GARDEN',(-10,2.8,5));w.mark('3 CELL LIFT',(0,2.2,5));w.mark('4 BEAM GALLERY',(8,5.2,1));w.mark('5 LAUNCH ROTUNDA',(10,5.5,-7))
w.point('final-well-lip',(10,3.66,-8.95));w.point('final-well-centre',(10,3.66,-11));w.note('Five physically separate zones: return belt0m, garden socket0m, cell dock2.8m, occluded beam gallery2.8m, final launch ring5.6m. Garden/upper pads are far apart; Mina/Oren owner crates share actual options. Cell-lift upper stop guard requires garden socket. Beam relay circuit requires upper socket. Final launch has real3mwell drop (2.8→−.2), highB8.8 and ring5.6 across5m gap. West/east exits on opposite islands both accessible by actual junction.');put(w)
