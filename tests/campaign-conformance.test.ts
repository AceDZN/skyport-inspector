/** Independent PRE-FLIGHT audit. These tests do not play or prove completion of any level. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeBlueprint} from '../src/campaign-blueprint';
import {CampaignWorld,evaluateGoal} from '../src/campaign-world';
import {MachineSystems} from '../src/systems';
import {createHash} from 'node:crypto';
import type {CatalogueRow,CampaignGoal} from '../src/campaign-types';

const catalogue=JSON.parse(fs.readFileSync(new URL('../src/data/campaign.json',import.meta.url),'utf8'));
const raw=JSON.parse(fs.readFileSync(new URL('../src/data/worlds.json',import.meta.url),'utf8'));
const upper=JSON.parse(fs.readFileSync(new URL('../src/data/worlds-upper.json',import.meta.url),'utf8'));
const rows=catalogue.rows as CatalogueRow[];
type Any=Record<string,any>;
interface Issue{level:number;category:string;code:string;message:string}
const fixtures=Array.from(new Map([...upper.worlds,...raw.worlds].map((w:Any)=>[w.number,w])).keys()).map(number=>[...upper.worlds,...raw.worlds].find((w:Any)=>w.number===number)) as Any[];
const allGoals=(row:Any):Any[]=>[row.normalizedGoal,...row.normalizedGoalAlternatives??[],row.semanticDecision.changedWordingCheck.normalizedContrastGoal,...row.semanticDecision.changedWordingCheck.normalizedContrastGoalAlternatives??[]].filter(Boolean);
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
const norm=(p:Any|number[])=>Array.isArray(p)?p:[p.x,p.y,p.z];
const distance=(a:Any|number[],b:Any|number[])=>Math.hypot(...norm(a).map((v:number,i:number)=>v-norm(b)[i]));
const horizDistance=(a:Any|number[],b:Any|number[])=>Math.hypot(norm(a)[0]-norm(b)[0],norm(a)[2]-norm(b)[2]);
const circuitRefs=(c:Any|undefined)=>[...c?.all??[],...c?.any??[],...c?.not??[]];
const references=(x:Any,id:string)=>[...x.devices.flatMap((d:Any)=>circuitRefs(d.circuit)),...x.bridges.flatMap((d:Any)=>circuitRefs(d.circuit))].includes(id);
const format=(issues:Issue[])=>issues.map(i=>`L${i.level} [${i.code}] ${i.message}`).join('\n');

export function auditFixture(row:Any,w:Any):Issue[]{
 const found:Issue[]=[];const add=(category:string,code:string,message:string)=>found.push({level:row.number,category,code,message});
 const cargo=new Map(w.cargo.map((c:Any)=>[c.spec.id,c]));const pads=new Map(w.pads.map((p:Any)=>[p.id,p]));const device=(id:string)=>w.devices.find((d:Any)=>d.id===id);const surfaces=new Map(w.surfaces.map((s:Any)=>[s.id,s]));
 const hasDevice=(id:string)=>device(id)||w.devices.find((d:Any)=>d.kind==='receiver'&&d.id+'-receiver'===id);
 const ids=(xs:Any[],key:string)=>xs.map(x=>x[key]);
 for(const [kind,list] of [['cargo',w.cargo.map((c:Any)=>c.spec)],['pad',w.pads],['device',w.devices],['exit',w.exits],['surface',w.surfaces]] as [string,Any[]][]){const values=ids(list,'id');if(new Set(values).size!==values.length)add('integrity','DUPLICATE_ID',`${kind} IDs are not unique: ${values.filter((x:string,i:number)=>values.indexOf(x)!==i).join(', ')}`);}
 for(const s of w.surfaces)if(!w.solids.some((x:Any)=>x.id===s.solidId))add('references','SURFACE_HOST',`${s.id} refers to absent solid ${s.solidId}`);
 for(const s of w.surfaces){const host=w.solids.find((x:Any)=>x.id===s.solidId);if(!host)continue;const axis=['x','y','z'].sort((a,b)=>Math.abs(s.normal[b])-Math.abs(s.normal[a]))[0],face=host[s.normal[axis]>0?'max':'min'][axis],separation=(s.center[axis]-face)*s.normal[axis];if(separation<-.02||separation>.1)add('geometry','PANEL_NOT_ON_HOST',`${s.id} plane is ${separation.toFixed(3)}m from outward host face`);}
 const flags=new Set([...w.pads.map((x:Any)=>x.id),...w.devices.map((x:Any)=>x.id),...w.devices.flatMap((x:Any)=>(x.receivers??[]).map((q:Any)=>q.id))]);
 for(const d of [...w.devices,...w.bridges])for(const id of circuitRefs(d.circuit))if(!flags.has(id))add('references','CIRCUIT_FLAG',`${d.id} consumes missing flag ${id}`);
 const entityEvent=(key:string)=>{
  const p=key.split(':'),[domain,id,action,object]=p;
  if(domain==='exit'&&!w.exits.some((e:Any)=>e.id===id))add('references','EVENT_EXIT',`Event ${key} names absent exit`);
  if(domain==='region'&&!w.regions.some((r:Any)=>r.id===key))add('references','EVENT_REGION',`Event ${key} names absent region`);
  if(domain==='route'&&!w.regions.some((r:Any)=>r.id===key)&&!w.bridges.some((b:Any)=>b.route===id))add('references','EVENT_ROUTE',`Event ${key} names absent route`);
  if(domain==='portal'){
   const s=p.at(-1)!;if(p.length>2&&!surfaces.has(s))add('references','EVENT_SURFACE',`Event ${key} names absent surface ${s}`);
  }
  if(domain==='pad'){
   if(!pads.has(id))add('references','EVENT_PAD',`Event ${key} names absent pad`);
   if(action!=='empty'&&!cargo.has(action))add('references','EVENT_CARGO',`Event ${key} names absent cargo ${action}`);
  }
  if(domain==='switch'&&!['switch','lift'].includes(device(id)?.kind))add('references','EVENT_SWITCH',`Event ${key} has no switch/lift interaction producer`);
  if(domain==='shutter'&&device(id)?.kind!=='shutter')add('references','EVENT_SHUTTER',`Event ${key} has no real shutter ${id}`);
  if(domain==='lift'){
   const d=device(id);if(action){if(d?.kind!=='lift')add('references','EVENT_LIFT',`Event ${key} has no lift ${id}`);else if(action!=='ascending'&&!(d.stops??[]).some((s:Any)=>s.label===action))add('references','EVENT_LIFT_STOP',`Event ${key} has no ${action} stop`);}
   else if(!w.devices.some((d:Any)=>d.kind==='lift'&&(d.stops??[]).some((s:Any)=>s.label===id)))add('references','EVENT_LIFT_STOP',`Event ${key} has no lift arriving at ${id}`);
  }
  if(domain==='board'||domain==='disembark')if(!['lift','moving-platform'].includes(device(id)?.kind))add('references','EVENT_CARRIER',`Event ${key} has no rideable carrier ${id}`);
  if(domain==='receiver'&&!w.devices.some((d:Any)=>(d.receivers??[]).some((r:Any)=>r.id===id)))add('references','EVENT_RECEIVER',`Event ${key} has no emitter producing ${id}`);
  if(domain==='actor'){
   if(!w.history||w.history.actor!==id)add('references','EVENT_ACTOR',`Event ${key} has no fixed actor replay`);
   const historyObject=p.at(-1)!;if(p.length>=4&&!cargo.has(historyObject))add('references','EVENT_CARGO',`Event ${key} names absent history object ${historyObject}`);
  }
  if(domain==='conveyor'){
   if(id!=='carried'&&device(id)?.kind!=='conveyor')add('references','EVENT_CONVEYOR',`Event ${key} has no conveyor ${id}`);
   const objectId=id==='carried'?action:object;if(objectId&&!cargo.has(objectId))add('references','EVENT_CARGO',`Event ${key} names absent conveyed object ${objectId}`);
  }
  if(domain==='cargo'){
   if(!cargo.has(id))add('references','EVENT_CARGO',`Event ${key} names absent cargo`);
   if(['loaded','unloaded'].includes(action)&&!['lift','conveyor','moving-platform'].includes(device(object)?.kind))add('references','EVENT_CARGO_CARRIER',`Event ${key} has no actual ${object} carrier`);
   if(['cross','enter','leave'].includes(action)&&device(object)?.kind!=='shutter'&&!w.bridges.some((b:Any)=>b.id===object)&&!w.solids.some((b:Any)=>b.kind==='bridge'&&b.id===object))add('references','EVENT_CARGO_GATE',`Event ${key} has no actual gate ${object}`);
   if(action==='received'&&!pads.has(object)&&!hasDevice(object))add('references','EVENT_CARGO_RECEIVER',`Event ${key} has no receiving pad/device ${object}`);
   if(action==='arrived'&&!w.regions.some((r:Any)=>(r.id===`cargo-dock:${object}`||r.id===`cargo-arrival:${object}`))&&!w.devices.some((d:Any)=>(d.stops??[]).some((s:Any)=>s.label+'-dock'===object)))add('references','EVENT_CARGO_DOCK',`Event ${key} has no named cargo dock/stop ${object}`);
  }
 };
 const stateRef=(key:string)=>{
  if(key.startsWith('pad:')){const [,pad,body]=key.split(':');if(!pads.has(pad)||!cargo.has(body))add('references','STATE_PAD',`Temporal state ${key} names absent pad/cargo`);}
  else if(key.startsWith('actor:')){const [,actor,,body]=key.split(':');if(w.history?.actor!==actor||!cargo.has(body))add('references','STATE_HISTORY',`Temporal state ${key} has no matching replay object`);}
  else {const base=key.includes(':at:')?key.split(':at:')[0]:key.replace(/:(moving|rising|unpowered)$/,'');if(!hasDevice(base))add('references','STATE_DEVICE',`Temporal state ${key} has no real device`);}
 };
 const goals=allGoals(row);
 for(const [i,g] of goals.entries()){
  if(!w.exits.some((e:Any)=>e.id===g.exit))add('references','GOAL_EXIT',`Goal${i} refers to absent exit ${g.exit}`);
  for(const c of g.cargo??[]){if(!cargo.has(c.id))add('references','GOAL_CARGO',`Goal${i} refers to absent cargo ${c.id}`);if(!pads.has(c.pad))add('references','GOAL_PAD',`Goal${i} refers to absent pad ${c.pad}`);}
  for(const s of g.devices??[]){const dev=hasDevice(s.id);if(!dev){add('references','GOAL_DEVICE',`Goal${i} refers to absent device/state ${s.id}`);continue;}if(dev.kind==='switch'&&typeof s.state!=='boolean')add('references','DEVICE_TYPE',`${s.id} is a switch and cannot expose string state ${s.state}`);if(dev.kind==='junction'&&!dev.states?.includes(s.state))add('references','JUNCTION_STATE',`${s.id} cannot select ${s.state}; states=${dev.states}`);if(dev.kind==='lift'&&s.state!=='moving'&&!dev.stops?.some((x:Any)=>x.label===s.state))add('references','LIFT_STATE',`${s.id} has no stop ${s.state}`);}
  if(g.relay){const e=device(g.relay.id);if(e?.kind!=='relay')add('references','GOAL_RELAY',`${g.relay.id} is not a real beam relay`);else if(!e.receivers?.some((x:Any)=>x.id===g.relay.receiver))add('references','RELAY_TARGET',`${g.relay.id} cannot target ${g.relay.receiver}`);}
  for(const e of [...g.order??[],...g.forbidden??[]])entityEvent(e);
  for(const h of g.temporal?.history??[]){entityEvent(h.object?h.event+':'+h.object:h.event);if(h.state)stateRef(h.state);}
  if(g.temporal?.during){for(const e of g.temporal.during.events??[])entityEvent(e);stateRef(g.temporal.during.state);}
  for(const t of [g.temporal?.throughout,g.temporal?.until].filter(Boolean)){if(t.interval){entityEvent(t.interval.start);entityEvent(t.interval.end);}else entityEvent(t.event);stateRef(t.state);}
  for(const [j,a] of (g.cargo??[]).entries())for(const b of (g.cargo??[]).slice(j+1)){if(a.id!==b.id&&pads.has(a.pad)&&pads.has(b.pad)&&distance((pads.get(a.pad)as Any).position,(pads.get(b.pad)as Any).position)<.001)add('geometry','COLOCATED_REQUIRED_PADS',`${a.pad}/${b.pad} coincide but require distinct ${a.id}/${b.id}; both sensors select the same first body`);}
 }
 for(const [i,a] of w.exits.entries())for(const b of w.exits.slice(i+1))if(same(a.position,b.position)&&same(a.size,b.size))add('geometry','COLOCATED_EXITS',`${a.id}/${b.id} have identical volumes; first-match exit detection shadows one goal`);
 for(const [i,a] of w.devices.entries())for(const b of w.devices.slice(i+1))if(a.kind==='shutter'&&b.kind==='shutter'&&same(a.position,b.position)&&same(a.size,b.size))add('geometry','COLOCATED_SHUTTERS',`${a.id}/${b.id} occupy the same closed doorway`);
 for(const c of w.cargo){const s=c.spec;if(/diamond/.test(s.id)&&s.shape!=='diamond')add('inventory','SHAPE_MISMATCH',`${s.id} is physically ${s.shape}, contrary to diamond description`);if(/triangle/.test(s.id)&&s.shape!=='triangle')add('inventory','SHAPE_MISMATCH',`${s.id} is physically ${s.shape}, contrary to triangle description`);if(/^(large|larger|wide)-/.test(s.id)&&s.size!=='large')add('inventory','SIZE_MISMATCH',`${s.id} is not physically large`);if(/^(small|smaller)-/.test(s.id)&&s.size!=='small')add('inventory','SIZE_MISMATCH',`${s.id} is not physically small`);if(/[\s/]/.test(s.id))add('inventory','SPURIOUS_CARGO_ID',`Cargo ID ${s.id} looks like prose, not a finite authored object`);}
 for(const [i,a] of w.cargo.entries())for(const b of w.cargo.slice(i+1)){const ah=a.spec.size==='large'?.55:.42,bh=b.spec.size==='large'?.55:.42;if(a.position.every((v:number,k:number)=>Math.abs(v-b.position[k])<ah+bh-.01))add('geometry','OVERLAPPING_CARGO',`${a.spec.id}/${b.spec.id} start with intersecting physical bodies`);}
 const badPads=['one-outer-pad-only','diamond-platform-opens-south-shutter','change-cargo/pad','tomorrow-rear','one-pad-only','inner-pad-bypass'];for(const id of badPads)if(pads.has(id))add('inventory','PROSE_BECAME_PAD',`${id} is an alternative description accidentally materialised as a pad`);
 const minimum=(kind:string,count:number)=>{const n=w.devices.filter((x:Any)=>x.kind===kind).length;if(n<count)add('fidelity','MISSING_SYSTEM',`Plan requires >=${count} ${kind}; fixture has ${n}`);};
 const systemRequirements:Record<number,Record<string,number>>={8:{shutter:1},11:{lift:1},12:{junction:1},13:{shutter:1},14:{lift:1},15:{shutter:2},16:{shutter:1},17:{shutter:2},18:{lift:1,junction:1},19:{lift:1},20:{lift:1},21:{'moving-platform':2},23:{conveyor:2},25:{conveyor:1},26:{conveyor:3},27:{lift:2},28:{conveyor:1,junction:1},29:{lift:1,shutter:1,conveyor:1},31:{relay:1,shutter:2},33:{lift:1,shutter:1,relay:1},35:{},36:{lift:1,shutter:2},37:{lift:2},38:{relay:1,shutter:2},40:{lift:1,relay:1,junction:1},41:{conveyor:3},42:{conveyor:2,junction:1,lift:2},43:{lift:1},44:{shutter:2},46:{shutter:2},47:{'moving-platform':2},48:{lift:1,relay:1},49:{shutter:1},50:{conveyor:3,lift:1,junction:1,relay:1,shutter:2}};
 for(const [kind,n] of Object.entries(systemRequirements[row.number]??{}))minimum(kind,n);
 const needs=(id:string,kind:string)=>{if(device(id)?.kind!==kind)add('fidelity','WRONG_OR_MISSING_ROLE',`${id} must be an actual ${kind}, found ${device(id)?.kind??'absent'}`);};
 if(row.number===8)needs('remote-shutter','shutter');if(row.number===15){needs('first-shutter','shutter');needs('second-shutter','shutter');}
 if([21,47].includes(row.number))needs('tower-ferry','moving-platform');if(row.number===23)needs('east-belt','conveyor');if(row.number===42)needs('conveyor-junction','junction');
 if(row.number===14&&pads.has('higher-dock')&&pads.has('lower-dock')&&(pads.get('higher-dock')as Any).position[1]<=(pads.get('lower-dock')as Any).position[1]+.5)add('geometry','FALSE_COMPARATIVE','higher-dock is not physically higher than lower-dock');
 if(row.number===18&&pads.has('upper-north')&&pads.has('lower-south')&&(pads.get('upper-north')as Any).position[1]<=(pads.get('lower-south')as Any).position[1]+.5)add('geometry','FALSE_LEVELS','upper/lower rings have the same elevation');
 if(row.number===37&&pads.has('lower-outer')&&pads.has('middle-outer')&&(pads.get('lower-outer')as Any).position[1]>=(pads.get('middle-outer')as Any).position[1]-.5)add('geometry','FALSE_LEVELS','lower outer pad is not below middle outer pad');
 if(row.number===50&&pads.has('garden-socket')&&pads.has('upper-socket')&&(pads.get('upper-socket')as Any).position[1]<=(pads.get('garden-socket')as Any).position[1]+2)add('geometry','FINALE_LEVELS','garden and upper cell sockets do not form the promised different floors');
 if([32,39,40,49,50].includes(row.number)){
  const floor=w.surfaces.filter((s:Any)=>s.normal.y>.8),high=w.surfaces.filter((s:Any)=>Math.abs(s.normal.y)<.2&&s.center.y>=3.5);const count=row.number===49?2:1;
  if(floor.length<count||high.length<count)add('fidelity','MISSING_LAUNCH_GEOMETRY',`Plan needs ${count} floor/high-wall stage(s); fixture floor=${floor.length}, high=${high.length}`);
 }
 if(row.number===24&&!w.marks.some((m:Any)=>/BEACON/i.test(m.text))&&!w.solids.some((s:Any)=>/beacon/i.test(s.id))&&!device('beacon'))add('fidelity','INVISIBLE_BEACON','Beacon flash is recorded but fixture has no visible beacon landmark/body');
 if(row.number===2){const mark=w.marks.find((m:Any)=>/WINDOW/i.test(m.text)),target=surfaces.get('window-panel') as Any;if(mark&&target){const a=horizDistance(mark.position,target.center);for(const s of w.surfaces)if(s.id!=='window-panel'&&horizDistance(mark.position,s.center)+.3<a)add('geometry','FALSE_BESIDE',`${s.id} is closer to actual window than window-panel (${a.toFixed(2)}m)`);}}
 if(row.number===22){const rack=w.marks.find((m:Any)=>/RACK/i.test(m.text)),p=pads.get('behind-rack') as Any;if(rack&&p){const normal=rack.normal??[0,0,1],dot=(p.position[0]-rack.position[0])*normal[0]+(p.position[2]-rack.position[2])*normal[2];if(dot>=-.5)add('geometry','FALSE_BEHIND',`behind-rack pad lies ${dot.toFixed(2)}m in front of the rack face`);}}
 const requireCircuit=(consumer:string,mode:'all'|'any',inputs:string[])=>{const d=device(consumer);if(!d||!inputs.every(id=>d.circuit?.[mode]?.includes(id)))add('wiring','FALSE_CAUSAL_RULE',`${consumer} is not driven by ${mode}(${inputs.join(',')}) as stated`);};
 if(row.number===13)requireCircuit('central-shutter','all',['west-outer','east-outer']);
 if(row.number===17){requireCircuit('north-shutter','all',['triangle-platform']);requireCircuit('south-shutter','all',['diamond-platform']);}
 if(row.number===20)requireCircuit('lift','all',['outer']);if(row.number===29)requireCircuit('cargo-gate','all',['gate-socket']);if(row.number===37)requireCircuit('freight-lift','all',['lower-outer','middle-outer']);if(row.number===50)requireCircuit('cell-lift','all',['garden-socket']);
 if([31,33,36,38,44,46,49,50].includes(row.number))for(const relay of w.devices.filter((x:Any)=>x.kind==='relay'))for(const receiver of relay.receivers??[])if(!references(w,receiver.id))add('wiring','INERT_RECEIVER',`${relay.id}→${receiver.id} drives no physical door/bridge/lift circuit`);
 if(row.number===16&&!w.devices.some((x:Any)=>x.kind==='shutter'&&x.circuit?.any?.length>=2)&&!w.bridges.some((x:Any)=>x.circuit?.any?.length>=2))add('wiring','MISSING_OR','No real OR-controlled door/bridge exists');
 return found.filter((x,i,all)=>all.findIndex(y=>same(x,y))===i);
}
export const auditRows=rows.map(row=>({row,world:fixtures.find(w=>w.number===row.number)!}));
export const issues=auditRows.flatMap(({row,world})=>world?auditFixture(row,world):[{level:row.number,category:'integrity',code:'MISSING_FIXTURE',message:'No physical fixture exists'}]);

test('exactly 50 unique canonical levels and physical fixtures',()=>{assert.equal(rows.length,50);assert.equal(fixtures.length,50);assert.deepEqual(rows.map(r=>r.number),Array.from({length:50},(_,i)=>i+1));assert.equal(new Set(fixtures.map(w=>w.number)).size,50);});
for(const {row,world} of auditRows){
 test(`L${row.number}: base/changed wording load exactly the same numbered physical world`,()=>{
  const changed=structuredClone(row) as CatalogueRow;changed.normalizedGoal=(row.semanticDecision.changedWordingCheck.normalizedContrastGoal??row.normalizedGoal) as CampaignGoal;changed.semanticDecision.required=row.semanticDecision.changedWordingCheck.mission;
  assert.deepEqual(makeBlueprint(changed),makeBlueprint(row));
 });
 for(const category of ['integrity','references','inventory','geometry','fidelity','wiring'])test(`L${row.number}: ${category} conforms to the authored catalogue`,()=>{const found=issues.filter(x=>x.level===row.number&&x.category===category);assert.equal(found.length,0,format(found));});
}
for(const [number,carried,beside] of [[22,'crate-a','crate-b'],[24,'crate-a','crate-b'],[43,'crate-b','crate-a']] as const){
 test(`L${number}: fixed replay roles and actual beacon-time history agree with both tasks`,()=>{
  const row=rows.find(r=>r.number===number)!;const w=new CampaignWorld(row);assert.equal(w.blueprint.history?.carried,carried);assert.equal(w.blueprint.history?.beside,beside);const start=w.crates.find(c=>c.id===carried)!.pos.clone();for(let i=0;i<720;i++)w.step(1/120,{forward:0,strafe:0,jump:false});
  assert.ok(w.ledger.some(e=>e.key===`actor:Rook:carried:${carried}`));assert.ok(w.ledger.some(e=>e.key===`actor:Rook:stood-beside:${beside}`));assert.ok(w.crates.find(c=>c.id===carried)!.pos.distanceTo(start)>1);assert.ok(w.guidePosition.distanceTo(w.crates.find(c=>c.id===beside)!.pos)<1.6);
  const flash=w.ledger.find(e=>e.key==='beacon:flash');assert.equal(flash?.states[`actor:Rook:carrying:${carried}`],true);
 });
}
test('L24: every contrast history event is actually emitted by the fixed replay',()=>{const row=rows.find(r=>r.number===24)!;const w=new CampaignWorld(row);for(let i=0;i<720;i++)w.step(1/120,{forward:0,strafe:0,jump:false});for(const h of row.semanticDecision.changedWordingCheck.normalizedContrastGoal?.temporal?.history??[]){const key=h.object?h.event+':'+h.object:h.event;assert.ok(w.ledger.some(e=>e.key===key||e.key.startsWith(key+':')),`Replay never emits ${key}`);}});
test('L31: clean untouched world does not automatically violate either goal prohibition',()=>{const row=rows.find(r=>r.number===31)!;const w=new CampaignWorld(row);w.step(1/120,{forward:0,strafe:0,jump:false});for(const g of allGoals(row))for(const key of g.forbidden??[])assert.ok(!w.ledger.some(e=>e.key===key||e.key.startsWith(key+':')),`Initial machinery automatically emits prohibited ${key}`);});
test('L11: physically boarding the lift emits the catalogue board event (unit setup, not play evidence)',()=>{const row=rows.find(r=>r.number===11)!;const w=new CampaignWorld(row),lift=w.machines.devices.find(d=>d.spec.id==='lift'&&d.spec.kind==='lift')!;w.player.pos.copy(lift.position).add({x:0,y:lift.spec.size[1]/2+w.player.half.y,z:0} as any);w.player.grounded=true;w.step(1/120,{forward:0,strafe:0,jump:false});assert.ok(w.ledger.some(e=>e.key==='board:lift'),'Riding lift does not produce board:lift');});
test('L2: real portal crossing emits the catalogue entry-surface event (unit setup, not play evidence)',()=>{const row=rows.find(r=>r.number===2)!;const w=new CampaignWorld(row),a=w.surfaces.find(s=>s.id==='window-panel')!,b=w.surfaces.find(s=>s.id==='cross-panel')!;assert.ok(w.place(0,a.id,a.center));assert.ok(w.place(1,b.id,b.center));w.player.pos.copy(w.portals[0]!.center).addScaledVector(a.normal,.1);w.player.pos.y=.85;w.player.vel.copy(a.normal).multiplyScalar(-4);w.player.grounded=false;w.step(.08,{forward:0,strafe:0,jump:false});assert.ok(w.player.crossings>0,'No physical crossing occurred in unit setup');const expected=row.normalizedGoal.order?.find(e=>e.startsWith('portal:'))!;assert.ok(w.ledger.some(e=>e.key===expected),`Crossing emits ${w.ledger.map(e=>e.key)} instead of ${expected}`);});
for(const number of [22,23,24,25,30,43,48])test(`L${number}: required observed histories happen without player manufacturing the answer`,()=>{
 const row=rows.find(r=>r.number===number)!,w=new CampaignWorld(row);for(let i=0;i<960;i++)w.step(1/120,{forward:0,strafe:0,jump:false});
 for(const goal of allGoals(row))for(const h of goal.temporal?.history??[]){const key=h.object?h.event+':'+h.object:h.event;assert.ok(w.ledger.some(e=>(e.key===key||e.key.startsWith(key+':'))&&(!h.state||e.states[h.state]===true)),`Fixed world never supplies ${key} ${h.state??''}`);}
});
for(const [number,id] of [[20,'lift'],[37,'freight-lift'],[50,'cell-lift']] as const)test(`L${number}: ${id} cannot rise without its stated power circuit (unit setup, not play evidence)`,()=>{
 const blueprint=makeBlueprint(rows[number-1]),spec=blueprint.devices.find(d=>d.id===id)!;assert.ok(spec?.circuit?.all?.length,`${id} has no power circuit`);const machines=new MachineSystems(blueprint.devices),d=machines.devices.find(d=>d.spec.id===id)!,initial=d.position.clone();machines.interact(id);for(let i=0;i<120;i++)machines.update(1/120,[],{});assert.ok(d.position.distanceTo(initial)<.02,`${id} moves while all required pad/receiver inputs are false`);
});
test('L16: a real central delivery is remembered as the prohibited received event (unit setup, not play evidence)',()=>{
 const w=new CampaignWorld(rows[15]),c=w.crates.find(x=>x.id==='cargo-1')!,pad=w.pads.find(p=>p.id==='central')!;c.pos.copy(pad.pos).add({x:0,y:c.half.y,z:0} as any);c.vel.set(0,0,0);for(let i=0;i<30;i++)w.step(1/120,{forward:0,strafe:0,jump:false});assert.ok(w.ledger.some(e=>e.key==='cargo:cargo-1:received:central'),'Actual central pad activation does not emit the forbidden delivery event');
});
function witness(g:Any){
 const states:Record<string,string|boolean>=Object.fromEntries((g.devices??[]).map((d:Any)=>[d.id,d.state]));if(g.relay)states[g.relay.id]=g.relay.receiver;
 const t=g.temporal??{};for(const x of [t.during,t.throughout,t.until,...t.history??[]])if(x?.state)states[x.state]=true;
 const keys:string[]=[...g.order??[]];const add=(key:string)=>{if(!keys.includes(key))keys.push(key);};
 for(const h of t.history??[])add(h.object?h.event+':'+h.object:h.event);for(const e of t.during?.events??[])add(e);if(t.throughout){add(t.throughout.interval.start);add(t.throughout.interval.end);}if(t.until)add(t.until.event);
 return {exit:g.exit,pads:Object.fromEntries((g.cargo??[]).map((c:Any)=>[c.pad,c.id])),states,events:keys.map((key,i)=>({key,time:i+1,states:{...states}}))};
}
for(const row of rows){
 const base=[row.normalizedGoal,...row.normalizedGoalAlternatives??[]],contrast=[(row.semanticDecision.changedWordingCheck as Any).normalizedContrastGoal,...(row.semanticDecision.changedWordingCheck as Any).normalizedContrastGoalAlternatives??[]];
 test(`L${row.number}: finite synthetic goal witnesses distinguish both English meanings (not play evidence)`,()=>{
  for(const [own,other] of [[base,contrast],[contrast,base]])for(const goal of own){const actual=witness(goal);assert.equal(evaluateGoal(goal,actual).pass,true,'Own fully satisfied goal is rejected');assert.ok(other.every((g:CampaignGoal)=>!evaluateGoal(g,actual).pass),'Old solution is also accepted by the changed meaning');}
 });
 test(`L${row.number}: every requested event is necessary even when final objects and exit match (not play evidence)`,()=>{
  for(const goal of [...base,...contrast])for(const key of goal.order??[]){const actual=witness(goal);actual.events=actual.events.filter(e=>e.key!==key);assert.equal(evaluateGoal(goal,actual).pass,false,`Missing directly requested event ${key} is accepted`);}
 });
}
test('L27: descending movement cannot satisfy RISING in either English meaning',()=>{
 const row=rows[26];for(const goal of [row.normalizedGoal,(row.semanticDecision.changedWordingCheck as Any).normalizedContrastGoal]){const state=goal.temporal!.during!.state;assert.ok(state.endsWith(':rising'),'Canonical wording still accepts generic movement');const actual=witness(goal);for(const e of actual.events){e.states[state]=false;e.states[state.replace(':rising',':moving')]=true;}assert.equal(evaluateGoal(goal,actual).pass,false);}
});
for(const {row,world} of auditRows)for(const spec of world.devices.filter((d:Any)=>d.kind==='shutter'&&d.latch))test(`L${row.number}: authored latched shutter ${spec.id} stays open after power is removed (unit, not play evidence)`,()=>{
 const machine=new MachineSystems([spec]),on=Object.fromEntries([...spec.circuit?.all??[],...spec.circuit?.any??[]].map((id:string)=>[id,true]));for(let i=0;i<120;i++)machine.update(1/120,[],on);assert.ok(machine.devices[0].progress>.85,'Gate did not first open');for(let i=0;i<120;i++)machine.update(1/120,[],{});assert.ok(machine.devices[0].progress>.85,`${spec.id} ignores authored latch:true`);
});
const biasSamples=auditRows.filter(({row,world})=>row.normalizedGoal.cargo?.length===1&&world.cargo.length>=2&&new Set([row.normalizedGoal,...row.normalizedGoalAlternatives??[]].map(g=>g.cargo?.[0]?.id)).size===1);
const answerBias={sampleCount:biasSamples.length,firstInventory:biasSamples.filter(({row,world})=>world.cargo[0].spec.id===row.normalizedGoal.cargo![0].id).length,leftmost:biasSamples.filter(({row,world})=>{const target=world.cargo.find((c:Any)=>c.spec.id===row.normalizedGoal.cargo![0].id)!;return world.cargo.every((c:Any)=>c.position[0]>=target.position[0]-.001);}).length,nearest:biasSamples.filter(({row,world})=>{const target=world.cargo.find((c:Any)=>c.spec.id===row.normalizedGoal.cargo![0].id)!;return world.cargo.every((c:Any)=>distance(c.position,world.spawn)>=distance(target.position,world.spawn)-.001);}).length};
test('cargo answers are not globally encoded by the leftmost physical candidate',()=>{assert.ok(answerBias.leftmost/answerBias.sampleCount<.8,`${answerBias.leftmost}/${answerBias.sampleCount} single-cargo answers are physically leftmost`);});
test('cargo answers are not globally encoded by the nearest physical candidate',()=>{assert.ok(answerBias.nearest/answerBias.sampleCount<.8,`${answerBias.nearest}/${answerBias.sampleCount} single-cargo answers are physically nearest`);});


if(process.env.WRITE_PHYSICAL_AUDIT==='1'){
 const counts=Object.fromEntries(['integrity','references','inventory','geometry','fidelity','wiring'].map(k=>[k,issues.filter(x=>x.category===k).length]));
 const table=rows.map(row=>{const xs=issues.filter(x=>x.level===row.number);return`|${row.number}|${row.name}|${xs.length?xs.map(x=>`**${x.code}**: ${x.message}`).join('<br>'):'No static defect detected; runtime/fidelity play still unverified.'}|`;}).join('\n');
 fs.writeFileSync(new URL('../docs/campaign/PHYSICAL_AUDIT.md',import.meta.url),`# Independent physical fixture pre-flight audit\n\nAll50 exported physical drafts were inspected against base/contrast/alternative goals. This is **not** a campaign playthrough or verified completion claim. Tests intentionally fail on missing fulfilment; fixture files were not edited by this helper.\n\nExport version: base ${raw.version}, upper ${upper.version} (runtime override priority). Base SHA256: ${createHash('sha256').update(JSON.stringify(raw)).digest('hex')}; upper SHA256: ${createHash('sha256').update(JSON.stringify(upper)).digest('hex')}. Static findings: ${issues.length}; levels with findings: ${new Set(issues.map(x=>x.level)).size}. Categories: ${JSON.stringify(counts)}.\n\nRuntime makeBlueprint loads by number and its base/contrast equality is tested independently. That architectural invariant does not establish physical fidelity, reachable goals, functional machines or enjoyment.\n\n|Level|Name|Concrete findings|\n|---|---|---|\n${table}\n\n## Candidate position bias\n\n${JSON.stringify(answerBias)}. Only tasks that actually select one cargo identity are sampled; generic crate tasks accept equivalent alternatives. Leftmost/nearest use actual spawn positions; the catalogue requires alternatives rather than repeated positional answers. Array order is diagnostic only because the game does not expose a cargo list.\n\n## Runtime producer checks\n\nSeparate tests exercise the actual fixed Rook replay for22/24/43; contrast24 event names; clean initial prohibition state31; actual supported lift boarding11; real portal crossing event2; actual central delivery16; all fixed histories22/23/24/25/30/43/48; and disabled lift power20/37/50. These are unit setups and are not counted as public-UI play evidence. Their pass/fail appears in the test output.\n\n## Remaining review\n\nEven a static-clean row still needs collision/geometry/visual inspection and real-input solution through public UI. In particular, verify every promised topology and mechanical dependency, not just entity names; inspect all50 captures and intermediate states. Check lift/conveyor dock arrival, complete cargo loops, portal facing, meaningful beam occlusion, guarded stop access, false-exit recovery, interval/prohibition history, and both meanings of every contrast.\n\nEarlier eight wins belong to the superseded nine-room milestone. Audio helper’s prototype L1 strict-gating/save tests are representative early evidence only. No50-level runtime claim is made.\n`);
}
