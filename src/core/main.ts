import './style.css';
import { CoreWorld, initializePhysics } from './world';
import { ChamberScene, type ChamberSceneWorld } from '../chamber-scene';
import { RiftAudio } from '../audio';
import { CampaignProgress, CAMPAIGN_LENGTH, type Store } from '../progression';
import { coreLevels, getCoreLevel } from './levels';
import { FixedStepClock } from './fixed-step';
import {englishSupport,firstRoomHint} from './learning';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = '<canvas id="world" tabindex="0" aria-label="Rift Runner test chamber"></canvas><div id="hud"></div><div id="crosshair"><i></i><b></b></div><div id="hint"></div><div id="toast" role="status"></div><div id="overlay"></div>';
const canvas = document.querySelector<HTMLCanvasElement>('#world')!;
const hud = document.querySelector<HTMLDivElement>('#hud')!;
const overlay = document.querySelector<HTMLDivElement>('#overlay')!;
const hint = document.querySelector<HTMLDivElement>('#hint')!;
const toastEl = document.querySelector<HTMLDivElement>('#toast')!;
let observedEnglish:HTMLElement|null=null;
const audio = new RiftAudio();
const SAVE_KEY = 'rift-runner-rapier-campaign-v1';
let storage: Store | undefined;
try { storage = localStorage; } catch { /* Session progress still works. */ }
const progress = new CampaignProgress(storage, SAVE_KEY);
try {
    if (progress.canImportCoreCompletions) progress.importCoreCompletions(JSON.parse(storage?.getItem('rift-core-v1') ?? 'null')?.completed);
} catch { progress.warning ??= 'Legacy progress could not be read; saved data was not changed.'; }
let world: CoreWorld, scene: ChamberScene;
let number = 1, mode = 'loading', last = performance.now(), started = false, sceneDirty = true;
let dragLook = false, sensitivity = .0022, toastTimer = 0, assistance = 0, alternate = false;
let settingsBack = 'menu', previewTicket = 0;
let initializing=false,frameStarted=false,initializationError:string|undefined;
let physicsReady:ReturnType<typeof initializePhysics>|undefined;
const keys = new Set<string>();
const physicsClock = new FixedStepClock();
let drag: { x: number; y: number } | undefined;
let moved = false;
try { dragLook = storage?.getItem('rift-core-drag') === 'true'; } catch { }
const esc = (value: string) => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const available = (n: number) => coreLevels.some(level => level.number === n);
const continueLevel = () => coreLevels.filter(level => progress.canPlay(level.number) && level.number <= progress.save.resumeLevel).at(-1)?.number ?? 1;
const completed = () => coreLevels.filter(level => progress.status(level.number) === 'completed').map(level => level.number);
function dismissMessage() { clearTimeout(toastTimer); toastEl.classList.remove('visible'); toastEl.textContent = ''; }
function message(s: string) { toastEl.textContent = s; toastEl.classList.add('visible'); clearTimeout(toastTimer); toastTimer = window.setTimeout(dismissMessage, 4000); }
function release() { previewTicket++; keys.clear(); physicsClock.reset(); drag = undefined; audio.setAirSpeed(0); if (document.pointerLockElement) document.exitPointerLock(); }
async function lock() {
    if (dragLook) return;
    try { await canvas.requestPointerLock(); }
    catch { dragLook = true; try { storage?.setItem('rift-core-drag', 'true'); } catch { } message('אפשר להביט בגרירת העכבר.'); }
}
function event(type: string, data: Record<string, unknown> = {}) {
    if (!started) return;
    if (type !== 'complete') audio.cue(type === 'blocked' || type === 'wrong-exit' ? 'invalid' : type);
    if (type === 'blocked') message('הצד השני חסום. פנו מקום או מקמו מחדש את השער.');
    if (type === 'invalid' || type === 'wrong-exit') message(String(data.reason ?? 'Aim at a white surface.'));
    if (type === 'portalA' || type === 'portalB') audio.setConnection(world.portals.every(Boolean));
    if (type === 'respawn') message('בחזרה לנקודת ההתחלה. השערים נשמרו.');
    if (type === 'complete' && world.campaignResult?.goalMatched) {
        const accepted = progress.observe(number, {goalMatched:true, assistance, retries:world.respawns, seconds:world.time, portalCrossings:world.player.crossings, mechanisms:world.campaignResult.mechanisms,variant:alternate?'contrast':'base'});
        if (!accepted) { home(); message(progress.warning ?? 'This result belongs to an older campaign. Start the room again.'); return; }
        mode = 'result'; release(); audio.pauseWithCompletion(); render();
    }
}
function load(n: number, contrast = false) {
    progress.refresh();
    if (!available(n) || !progress.canPlay(n) || (contrast && progress.status(n) !== 'completed')) return;
    if (!progress.enter(n)) { if (progress.warning) message(progress.warning); return; }
    dismissMessage(); release(); started = false;
    world?.dispose(); number = n; alternate = contrast; assistance = 0;
    world = new CoreWorld(n, event, undefined, contrast);
    if (scene) scene.setWorld(world as unknown as ChamberSceneWorld);
    else scene = new ChamberScene(canvas, world as unknown as ChamberSceneWorld);
    scene.reducedMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
    mode = 'playing'; started = true;
    audio.setConnection(false);
    void audio.start().then(() => { audio.setPaused(mode !== 'playing'); audio.setChapter(Math.min(3, Math.ceil(n / 17)) as 1|2|3); });
    render(); canvas.focus(); void lock();
    if (progress.warning) message(progress.warning);
}
function render() {
    sceneDirty = true;
    if (mode !== 'playing') dismissMessage();
    hud.innerHTML = mode === 'playing' ? `<div class="mission"><small>CHAMBER ${String(number).padStart(2,'0')}</small><p lang="en">${esc(world.level.mission)}</p>${world.journal?.config.milestones?.length?'<p id="observed-english" class="observed-english" lang="en"></p>':''}</div><nav>${world.journal?'<button data-action="journal" aria-label="Machine journal · N">LOG</button>':''}<button data-action="help" aria-label="Hint and English help · M" title="Hint + English · M">? M</button><button data-action="pause" aria-label="Pause">Ⅱ</button></nav>` : '';
    observedEnglish=document.getElementById('observed-english');
    document.body.classList.toggle('playing', mode === 'playing');
    overlay.innerHTML = '';
    if (mode === 'playing') return;
    let body = '';
    if(mode==='loading')body='<span class="kicker">RIFT RUNNER</span><h2>פותחים את המשחק…</h2><p class="subtitle" role="status">עוד רגע מתחילים.</p>';
    if(mode==='load-error')body='<h2>לא הצלחנו לפתוח את המשחק.</h2><p class="subtitle">נסו שוב בעוד רגע.</p><button class="primary" data-action="retry-load">ניסיון נוסף</button>';
    if (mode === 'loading') body = '<h1>RIFT RUNNER</h1><p>טוענים את החדר…</p>';
    if (mode === 'menu') body = `<span class="kicker">RIFT RUNNER</span><h1>קופצים בין שערים</h1><p class="subtitle">קוראים באנגלית. פותחים דרך.</p>${progress.hasProgress ? '<button class="primary" id="continue-btn" data-action="continue">ממשיכים · '+String(continueLevel()).padStart(2,'0')+'</button>' : '<button class="primary" id="start-btn" data-action="start">נכנסים לחדר</button>'}<button data-action="levels">החדרים</button><button data-action="new-game">משחק חדש</button><button data-action="settings">מבט וצליל</button><p class="controls">WASD · תנועה &nbsp; עכבר · מבט<br>לחיצה שמאלית / ימנית · שערים<br>E · הרמה ושימוש &nbsp; Space · קפיצה &nbsp; Esc · הפסקה</p>`;
    if (mode === 'levels') body = `<h2>החדרים</h2><p class="subtitle">${completed().length} הושלמו</p><div class="level-list">${coreLevels.map(level => { const status = progress.status(level.number); return `<div class="level-row"><button data-action="level" data-level="${level.number}" ${status === 'locked' ? 'disabled' : ''}><span>${String(level.number).padStart(2,'0')} · ${esc(level.name)}</span><small>${status === 'completed' ? '✓' : status === 'locked' ? 'נעול' : 'פתוח'}</small></button>${status === 'completed' && level.contrast ? `<button class="contrast" data-action="contrast" data-level="${level.number}">הוראה אחרת</button>` : ''}</div>`; }).join('')}</div><button class="primary" data-action="home">מסך פתיחה</button>`;
    if (mode === 'pause') body = '<h2>הפסקה</h2><button class="primary" data-action="resume">ממשיכים</button><button data-action="retry">חזרה להתחלה · R</button><button data-action="restart">אתחול החדר</button><button data-action="settings">מבט וצליל</button><button data-action="home">מסך פתיחה</button>';
    const support=world?englishSupport({...world.level,mission:world.level.mission+' '+(world.journal?.snapshot().reports.map(r=>r.text).join(' ')??'')}):undefined;
    const words=support?`<div class="word-help" lang="en">${support.words.map(([word,meaning])=>`<span><b>${esc(word)}</b><small lang="he">${esc(meaning)}</small></span>`).join('')}</div>`:'';
    const cubeHint=number===1&&world?firstRoomHint(world):undefined;
    if (mode === 'help') body = `<small>CHAMBER ${number}</small><h2 dir="ltr">${esc(world.level.name)}</h2><button class="primary" data-action="resume">בחזרה לחדר · Esc</button><p dir="ltr" lang="en">${esc(world.level.mission)}</p><p>${esc(world.level.he)}</p><h3 dir="ltr" lang="en">${esc(support!.focus)}</h3>${words}<p class="learning-note">${esc(support!.explanation)}</p>${cubeHint?`<details class="cube-help"><summary>עזרה בהגעה לקובייה · Cube hint</summary><h3 dir="ltr">${esc(cubeHint.title)}</h3><p dir="ltr" lang="en">${esc(cubeHint.text)}</p><p>${esc(cubeHint.he)}</p><p class="controls">לחיצה שמאלית / ימנית · שני שערים מקושרים<br>E · הרמה או הנחה מקרוב</p></details>`:""}<p class="controls">משטחים לבנים מקבלים שערים. משטחים כהים נשארים מוצקים.<br>העולם נעצר בזמן הקריאה.</p>`;
    if (mode === 'journal' && world.journal) {
        const log=world.journal.snapshot();
        body=`<div class="machine-journal" dir="ltr" lang="en"><h2>Machine journal</h2><p class="subtitle">The world is paused while you read.</p><h3>NOW</h3><dl>${log.now.map(r=>`<div><dt>${esc(r.label)}</dt><dd>${esc(r.state)}</dd></div>`).join('')}</dl><h3>OBSERVED THIS ATTEMPT</h3>${log.rows.length?`<ol>${log.rows.map(r=>`<li>${esc(r.text)}</li>`).join('')}</ol>`:'<p>No events observed in this attempt.</p>'}${log.truncated?'<p class="journal-note">Earlier rows are unavailable. NOW shows the current state.</p>':''}${log.reports.length?`<h3>OBSERVED REPORTS · THIS ATTEMPT</h3><ul>${log.reports.map(r=>`<li>${esc(r.text)}${r.pastText?`<br>${esc(r.pastText)}`:""}</li>`).join('')}</ul>`:""}${log.tests.map(t=>`<h3>${esc(t.label)} · ${esc(t.status)}</h3><ul>${t.observations.map(o=>`<li>${esc(o.label)} — opened fully: ${esc(o.opened)}; remained closed: ${esc(o.remainedClosed)}</li>`).join('')}</ul>`).join('')}<button class="primary" data-action="resume">Return to chamber</button></div>`;
    }
    if (mode === 'settings') body = `<h2>מבט וצליל</h2><label><input id="drag-look" type="checkbox" ${dragLook ? 'checked' : ''}> מבט בגרירה ללא נעילה</label><label>עוצמת קול<input id="volume" type="range" min="0" max="1" step=".01" value="${audio.settings().master}"></label><button data-action="sound">בדיקת צליל</button><button class="primary" data-action="back">חזרה</button>`;
    if (mode === 'new-game') body = `<h2>מתחילים מחדש?</h2><p>ההתקדמות הנוכחית תישמר כגיבוי שאפשר לשחזר.</p><button class="primary" data-action="confirm-new">משחק חדש · חדר 01</button><button data-action="restore">שחזור המשחק הקודם</button><button data-action="home">חזרה</button>`;
    if (mode === 'result') { const next = available(number + 1); body = `<small>CHAMBER ${number} COMPLETE</small><h2>${number === CAMPAIGN_LENGTH ? 'מצאתם את הדרך.' : 'הדרך פתוחה.'}</h2><p class="english-used" dir="ltr" lang="en">English you used · ${esc(support!.focus)}</p>${words}<button class="primary" data-action="${next ? (number === 1 ? 'second' : 'next') : 'home'}">${next ? 'לחדר הבא' : 'מסך פתיחה'}</button><button data-action="restart">לשחק שוב</button><button data-action="levels">החדרים</button>`; }
    overlay.innerHTML = `<section class="screen ${mode === 'menu' ? 'title-screen' : ''} ${mode === 'levels' ? 'level-screen' : ''}" dir="rtl"><div class="screen-inner">${body}</div></section>`;
}
function pause(next = 'pause') { if (next === 'help') assistance++; mode = next; release(); audio.setPaused(true); render(); }
function resume() { mode = started ? 'playing' : 'menu'; audio.setPaused(mode !== 'playing'); render(); canvas.focus(); if (mode === 'playing') void lock(); }
function home() { release(); started = false; mode = 'menu'; audio.setPaused(true); render(); }
app.addEventListener('click', e => {
    const button = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
    const action = button?.dataset.action;
    if (!action) return;
    if(action==='retry-load')void initializeGame();
    if (action === 'start') load(1);
    if (action === 'continue') load(continueLevel());
    if (action === 'second' || action === 'next') load(number + 1);
    if (action === 'level' || action === 'contrast') load(Number(button?.dataset.level), action === 'contrast');
    if (action === 'resume') resume();
    if (action === 'pause') pause();
    if (action === 'help') pause('help');
    if (action === 'journal' && world.journal) pause('journal');
    if (action === 'settings') { settingsBack = started ? 'pause' : mode; pause('settings'); }
    if (action === 'back') { previewTicket++; mode = settingsBack; audio.setPaused(mode !== 'playing'); render(); }
    if (action === 'retry') { resume(); dismissMessage(); world.respawn(); }
    if (action === 'restart') load(number, alternate);
    if (action === 'home') home();
    if (action === 'levels') pause('levels');
    if (action === 'new-game') pause('new-game');
    if (action === 'confirm-new') { if (progress.newGame(true)) load(1); else if (progress.warning) message(progress.warning); }
    if (action === 'restore') { if (progress.restorePrevious()) home(); else message(progress.warning ?? 'אין משחק קודם לשחזור.'); }
    if (action === 'sound') {
        const ticket=++previewTicket;
        void audio.start().then(() => {
            if(ticket!==previewTicket||mode!=='settings'){audio.setPaused(mode!=='playing');return;}
            audio.cue('portalA');
            window.setTimeout(()=>{if(ticket===previewTicket&&mode==='settings')audio.setPaused(true);},1000);
        });
    }
});
app.addEventListener('change', e => { const t = e.target as HTMLInputElement; if (t.id === 'drag-look') { dragLook = t.checked; try { storage?.setItem('rift-core-drag', String(dragLook)); } catch { } } });
app.addEventListener('input', e => { const t = e.target as HTMLInputElement; if (t.id === 'volume') audio.setGain('master', Number(t.value)); });
function fire(index: number) {
    if (mode !== 'playing') return;
    scene.fire(index); const hit = scene.aim();
    if (hit?.surface) { if (world.place(index, hit.surface, hit.point)) dismissMessage(); }
    else { audio.cue('invalid'); message('כוונו לחלק פנוי בקיר או ברצפה לבנים. אי אפשר ליצור שער על קובייה.'); }
}
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('pointerdown', e => {
    if (mode !== 'playing') return;
    canvas.focus();
    if (document.pointerLockElement) fire(e.button === 2 ? 1 : 0);
    else if (dragLook) { moved = false; drag = {x:e.clientX,y:e.clientY}; canvas.setPointerCapture(e.pointerId); }
    else void lock();
});
canvas.addEventListener('pointermove', e => {
    if (mode !== 'playing') return;
    let dx = 0, dy = 0;
    if (document.pointerLockElement) { dx = e.movementX; dy = e.movementY; }
    else if (drag) { dx = e.clientX - drag.x; dy = e.clientY - drag.y; drag = {x:e.clientX,y:e.clientY}; if (Math.abs(dx) + Math.abs(dy) > .1) moved = true; }
    world.yaw -= dx * sensitivity; world.pitch = Math.max(-1.48, Math.min(1.48, world.pitch - dy * sensitivity));
});
canvas.addEventListener('pointerup', e => { if (drag && !moved) fire(e.button === 2 ? 1 : 0); drag = undefined; moved = false; });
canvas.addEventListener('pointercancel', () => { drag = undefined; moved = false; });
window.addEventListener('keydown', e => {
    if (e.code === 'Escape') {
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
        if (mode === 'playing') pause(); else if (['pause','help','journal'].includes(mode)) resume();
        return;
    }
    if (mode !== 'playing' || (e.target as HTMLElement).matches('input,button')) return;
    keys.add(e.code); if (e.code === 'Space') e.preventDefault(); if (e.repeat) return;
    if (e.code === 'KeyE' && !world.interact()) world.grabDrop();
    if (e.code === 'KeyR') { dismissMessage(); world.respawn(); }
    if (e.code === 'KeyM') pause('help');
    if (e.code === 'KeyN' && world.journal) pause('journal');
    if (e.code === 'Digit1') fire(0);
    if (e.code === 'Digit2') fire(1);
    if (e.code === 'KeyF') void (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {});
});
window.addEventListener('keyup', e => keys.delete(e.code));
window.addEventListener('blur', () => { if (mode === 'playing') pause(); });
window.addEventListener('resize', () => { sceneDirty = true; });
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'playing') pause(); });
document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement && mode === 'playing' && !dragLook) pause(); });
window.addEventListener('storage', e => {
    if(e.key!==SAVE_KEY&&e.key!==SAVE_KEY+'-journal')return;
    const generation=progress.diagnostics().generation;
    progress.refresh();
    if(mode==='playing'&&progress.diagnostics().generation!==generation){home();message('המשחק השתנה בחלון אחר. אפשר להמשיך מהשמירה הנוכחית.');}
    else if(!['loading','playing'].includes(mode))render();
});
function step(ms: number) {
    if (mode !== 'playing') return;
    physicsClock.add(ms);
    while (mode === 'playing') {
        const dt = physicsClock.take();
        if (dt === undefined) break;
        world.yaw += ((keys.has('KeyJ') ? 1 : 0) - (keys.has('KeyL') ? 1 : 0)) * dt * 1.5;
        world.pitch = Math.max(-1.48,Math.min(1.48,world.pitch + ((keys.has('KeyI') ? 1 : 0) - (keys.has('KeyK') ? 1 : 0)) * dt * 1.2));
        world.step(dt, {forward:Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown')),strafe:Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')),jump:keys.has('Space')});
    }
    audio.setAirSpeed(world.player.grounded ? 0 : world.player.vel.length());
    if(observedEnglish&&world.journal){const text=world.journal.snapshot().reports.slice(0,2).map(r=>r.text).join(' ');if(observedEnglish.textContent!==text)observedEnglish.textContent=text;}
}
function frame(now: number) {
    const dt = Math.min(40,now-last); last = now; step(dt);
    if (scene && (mode === 'playing' || sceneDirty)) { scene.update(mode === 'playing' ? dt/1000 : 0); sceneDirty = false; if (mode === 'playing') { const hit = scene.aim(); document.querySelector('#crosshair')!.classList.toggle('valid', !!hit?.surface); hint.textContent = world.heldId ? 'E · Drop' : world.interactionHint() || (hit?.surface ? 'LMB / RMB · Place portal' : ''); } }
    requestAnimationFrame(frame);
}
function transportReadings(){return world?world.machines.devices.filter(d=>['lift','moving-platform'].includes(d.spec.kind)).map(d=>{const body=world.doors.get(d.spec.id)!.rigid,p=body.translation(),v=body.linvel(),stopped=Math.hypot(v.x,v.y,v.z)<=1e-5;const stops=d.spec.stops??[{label:'BASE',position:d.spec.position},...(d.spec.target?[{label:d.spec.targetLabel??'UPPER',position:d.spec.target}]:[])];const at=stopped?stops.find(stop=>Math.hypot(p.x-stop.position[0],p.y-stop.position[1],p.z-stop.position[2])<.015)?.label??null:null;return{id:d.spec.id,position:[p.x,p.y,p.z],velocity:[v.x,v.y,v.z],stopped,at};}):[];}
Object.assign(window, {
    render_game_to_text: () => JSON.stringify({title:'Rift Runner',version:'rapier-authored-campaign',mode,level:number,alternate,world:world?.snapshot(),progress:{...progress.save,completed:completed(),resume:continueLevel(),registered:coreLevels.length},saveDiagnostics:{...progress.diagnostics(),origin:location.origin},pointerLocked:!!document.pointerLockElement,controls:{unlocked:dragLook,sensitivity},audio:audio.state(),assets:scene?.assetDiagnostics?.()??null,heroAssets:ChamberScene.heroAssetStatus(),heroInstances:scene?.heroAssetDiagnostics?.()??null,initializationError,portalRendering:scene?.renderDiagnostics?.()??null,transportMotion:transportReadings()}),
    advanceTime:(ms:number) => { step(ms); scene?.update(0); }
});
render();
async function initializeGame(){
    if(initializing)return;
    initializing=true;initializationError=undefined;mode='loading';render();
    let pendingWorld:CoreWorld|undefined;
    try{
        physicsReady??=initializePhysics().catch(error=>{physicsReady=undefined;throw error;});
        await Promise.all([physicsReady,ChamberScene.preloadHeroAssets()]);
        pendingWorld=new CoreWorld(1,event);
        const readyScene=new ChamberScene(canvas,pendingWorld as unknown as ChamberSceneWorld);
        world=pendingWorld;scene=readyScene;
        mode='menu';render();if(progress.warning)message(progress.warning);
        if(!frameStarted){frameStarted=true;last=performance.now();requestAnimationFrame(frame);}
    }catch(error){
        pendingWorld?.dispose();
        initializationError=String(error);mode='load-error';render();console.error(error);
    }finally{initializing=false;}
}
void initializeGame();
