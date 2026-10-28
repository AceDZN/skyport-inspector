import {observeLeaf,observeDock} from './machine-state';
import {MachineJournal,type JournalReading} from './machine-journal';
import RAPIER from '@dimforge/rapier3d-compat';
import { Vector3, Quaternion, Matrix4, Box3, Ray } from 'three';
import { V, poseMatrix, portalMatrix, type Body, type Input, type Portal, type Solid } from '../physics';
import type { Room } from '../content';
import { MachineSystems } from '../systems';
import {getCoreLevel} from './levels';
import type {CoreLevel} from './level';
import type { WorldBlueprint } from '../campaign-blueprint';
import {tracePortalBeam,type BeamResult,type BeamPortal} from './portal-beam';
import {queryHeldFootprint} from './held-footprint';
import {alignWallPortalToFloor} from './portal-placement';
export const initializePhysics = () => RAPIER.init();
interface RigidCube extends Body {
    rigid: RAPIER.RigidBody;
    collider: RAPIER.Collider;
    rotation: Quaternion;
    angularVelocity: Vector3;
}
const Q = { x: 0, y: 0, z: 0, w: 1 };
/** Fresh Rapier dynamics world. The old scene's read interface is preserved, not its controller. */
export class CoreWorld {
    readonly physics = new RAPIER.World({ x: 0, y: -16, z: 0 });
    readonly controller = this.physics.createCharacterController(.015);
    readonly holdController = this.physics.createCharacterController(.012);
    readonly eventQueue = new RAPIER.EventQueue(true);
    readonly character: RAPIER.RigidBody;
    readonly characterCollider: RAPIER.Collider;
    readonly fixed = new Map<number, Solid>();
    readonly doors = new Map<string, {
        rigid: RAPIER.RigidBody;
        collider: RAPIER.Collider;
    }>();
    readonly blueprint: WorldBlueprint;
    readonly machines: MachineSystems;
    readonly room: Room;
    readonly number: number;
    readonly level:CoreLevel;
    readonly journal?:MachineJournal;
    readonly row: {
        number: number;
    };
    readonly player: Body = { id: 'player', pos: V(), vel: V(), half: V(.28, .85, .28), grounded: false, cooldown: 0, crossings: 0 };
    crates: RigidCube[] = [];
    solids: Solid[];
    surfaces: WorldBlueprint['surfaces'];
    pads: {
        id: string;
        pos: Vector3;
        crateId?: string;
        pressed: boolean;
    }[] = [];
    bridges: never[] = [];
    bridgeProgress = new Map<string, number>();
    portals: [
        Portal | undefined,
        Portal | undefined
    ] = [undefined, undefined];
    yaw = 0;
    pitch = 0;
    heldId?: string;
    time = 0;
    historyTime = 0;
    respawns = 0;
    launchUsed = false;
    jumpLatch = false;
    spawn: Vector3;
    guidePosition = V();
    guidePhase = 'idle';
    guideCarrying?: string;
    campaignResult?: {
        goalMatched: boolean;
        physicalComplete: boolean;
        exit: string;
        reason: string;
        events: unknown[];
        mechanisms: string[];
    };
    events: {
        type: string;
        time: number;
        [key: string]: unknown;
    }[] = [];
    ledger: {
        key: string;
        time: number;
    }[] = [];
    onEvent: (type: string, data?: Record<string, unknown>) => void;
    private holdMap = new Matrix4();
    private exitPortal = new Map<string, number>();
    private blockedEntry = new Map<string, number>();
    private groundedLast = false;
    private lastStep = 0;
    private contactCooldown = new Map<string, number>();
    private lastWrongExit?:string;
    private mechanisms=new Set<string>();
    private doorOccupants=new Map<string,Set<string>>();
    readonly beams=new Map<string,BeamResult>();
    constructor(number: number, onEvent: (type: string, data?: Record<string, unknown>) => void = () => { }, definition?:CoreLevel, alternate=false) {
        this.number = number;
        this.row = { number };
        this.onEvent = onEvent;
        const base=definition??getCoreLevel(number);
        this.level=alternate&&base.contrast?{...base,mission:base.contrast.mission,he:base.contrast.he,expectedExit:base.contrast.expectedExit??base.expectedExit,wrongExitFeedback:base.contrast.wrongExitFeedback??base.wrongExitFeedback}:base;
        this.journal=this.level.journal?new MachineJournal(this.level.journal):undefined;
        this.blueprint = this.level.blueprint();
        this.yaw=this.level.startYaw??0;
        this.spawn = V(...this.blueprint.spawn);
        this.solids = this.blueprint.solids;
        this.surfaces = this.blueprint.surfaces;
        this.machines = new MachineSystems(this.blueprint.devices);
        this.room = { id: 'chamber-' + number, grade: 7, stage: 'guided', skin: 'enclosed', title: this.level.name, mission: this.level.mission, he: this.level.he, teaching: '', layout: 'glass', crates: this.blueprint.cargo.map(c => c.spec), target: { crateId: 'weighted-cube', pad: 'behind', bridge: 'east' }, sources: this.level.sources.map(s=>s.url), rule: '' };
        this.player.pos.copy(this.spawn);
        this.character = this.physics.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(...this.blueprint.spawn));
        this.characterCollider = this.physics.createCollider(RAPIER.ColliderDesc.capsule(.57, .28).setFriction(.5).setActiveHooks(RAPIER.ActiveHooks.FILTER_CONTACT_PAIRS), this.character);
        this.controller.enableAutostep(.23, .25, false);
        this.controller.enableSnapToGround(.08);
        this.controller.setApplyImpulsesToDynamicBodies(true);
        this.controller.setCharacterMass(70);
        this.holdController.setApplyImpulsesToDynamicBodies(true);
        this.holdController.setCharacterMass(12);
        for (const s of this.solids) {
            const size = s.max.clone().sub(s.min), p = s.min.clone().add(s.max).multiplyScalar(.5);
            const c = this.physics.createCollider(RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2).setTranslation(p.x, p.y, p.z).setFriction(.8).setActiveHooks(RAPIER.ActiveHooks.FILTER_CONTACT_PAIRS));
            this.fixed.set(c.handle, s);
        }
        for (const p of this.blueprint.pads) {
            this.pads.push({ id: p.id, pos: V(...p.position), pressed: false });
            this.physics.createCollider(RAPIER.ColliderDesc.cylinder(.07, .96).setTranslation(p.position[0], p.position[1] - .07, p.position[2]).setFriction(.9));
        }
        for (const spec of this.blueprint.devices) {
            const rb = this.physics.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(...spec.position));
            const c = this.physics.createCollider(RAPIER.ColliderDesc.cuboid(spec.size[0] / 2, spec.size[1] / 2, spec.size[2] / 2).setFriction(.5), rb);
            this.doors.set(spec.id, { rigid: rb, collider: c });
        }
        for (const c of this.blueprint.cargo) {
            const h = c.spec.size === 'large' ? .55 : .42;
            const rigid = this.physics.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(...c.position).setCcdEnabled(true).setLinearDamping(.12).setAngularDamping(.8).setAdditionalSolverIterations(6));
            const collider = this.physics.createCollider(RAPIER.ColliderDesc.cuboid(h, h, h).setMass(12).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS).setFriction(.85).setRestitution(.04).setActiveHooks(RAPIER.ActiveHooks.FILTER_CONTACT_PAIRS), rigid);
            this.crates.push({ id: c.spec.id, pos: V(...c.position), vel: V(), half: V(h, h, h), grounded: false, cooldown: 0, crossings: 0, rigid, collider, rotation: new Quaternion(), angularVelocity: V() });
        }
        this.physics.timestep = 1 / 120;
        this.physics.step(this.eventQueue, this.hooks);
        this.observeJournal();
    }
    private hooks: RAPIER.PhysicsHooks = { filterContactPair: (a, b) => { const ca = this.physics.getCollider(a), cb = this.physics.getCollider(b); if (!ca || !cb)
            return RAPIER.SolverFlags.COMPUTE_IMPULSE; const sa = this.fixed.get(a), sb = this.fixed.get(b), bodyA = this.bodyForCollider(a), bodyB = this.bodyForCollider(b); if ((sa && bodyB && this.apertureIgnores(bodyB, sa)) || (sb && bodyA && this.apertureIgnores(bodyA, sb)))
            return null; return RAPIER.SolverFlags.COMPUTE_IMPULSE; }, filterIntersectionPair: () => true };
    private bodyForCollider(handle: number): Body | undefined { return handle === this.characterCollider.handle ? this.player : this.crates.find(c => c.collider.handle === handle); }
    event(type: string, data: Record<string, unknown> = {}) { const family=({enter:'portals',pickup:'cargo',pad:'buttons','shutter-open':'shutters',launch:'momentum','lift-motor':'lifts','conveyor-clutch':'conveyors','receiver-power':'beams','switch-toggle':'switches','junction-rotate':'junctions'} as Record<string,string>)[type];if(family)this.mechanisms.add(family);this.events.push({ type, time: Math.round(this.time * 1000), ...data }); if (this.events.length > 120)
        this.events.shift(); this.ledger.push({ key: type, time: this.time }); this.onEvent(type, data); }
    forward() { return V(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch)); }
    eye() { return this.player.pos.clone().add(V(0, .65, 0)); }
    aperture(body: Body, p: Portal, position=body.pos, rotation?:Quaternion) { const local = position.clone().applyMatrix4(p.matrix.clone().invert()), floor = Math.abs(p.normal.y) > .8, right = V().setFromMatrixColumn(p.matrix, 0), up = V().setFromMatrixColumn(p.matrix, 1), halfX = this.normalSupport(body, right, rotation), halfY = this.normalSupport(body, up, rotation); return Math.abs(local.x) < (floor ? 1.15 : .9) - halfX + .015 && Math.abs(local.y) < (floor ? 1.15 : 1.55) - halfY + .015; }
    private exitApertureFits(body:Body,entry:Portal,position=body.pos,previousRotation?:Quaternion){
        const exit=this.portals[1-entry.index];if(!exit)return false;
        const matrix=portalMatrix(entry,exit),target=position.clone().applyMatrix4(matrix);
        // The character remains upright after crossing. Cubes retain their real
        // transformed orientation, so each destination needs its actual support.
        const rotation=body===this.player?undefined:(previousRotation??(body as RigidCube).rotation).clone().premultiply(new Quaternion().setFromRotationMatrix(matrix));
        return this.aperture(body,exit,target,rotation);
    }
    private overlapsPortalHost(body:Body,entry:Portal){
        const host=this.surfaces.find(s=>s.id===entry.surfaceId)?.solidId;
        const cube=body===this.player?undefined:body as RigidCube;
        const shape=cube?new RAPIER.Cuboid(body.half.x,body.half.y,body.half.z):new RAPIER.Capsule(.57,.28);
        let overlap=false;
        this.physics.intersectionsWithShape(body.pos,cube?.rotation??Q,shape,c=>{
            if(this.fixed.get(c.handle)?.id!==host)return true;
            overlap=true;return false;
        });
        return overlap;
    }
    apertureIgnores(body: Body, s: Solid) { return this.portals.every(Boolean) && this.portals.some(p => p && this.blockedEntry.get(body.id) !== p.index && (body.cooldown <= 0 || this.exitPortal.get(body.id) === p.index) && this.surfaces.find(s => s.id === p.surfaceId)?.solidId === s.id && body.pos.clone().sub(p.center).dot(p.normal) > -.7 && this.aperture(body, p) && this.exitApertureFits(body,p)); }
    activeSolids() { return [...this.solids, ...this.machines.devices.map(d => ({ id: d.spec.id, min: d.position.clone().sub(V(...d.spec.size).multiplyScalar(.5)), max: d.position.clone().add(V(...d.spec.size).multiplyScalar(.5)), kind: 'wall' as const }))]; }
    place(index: number, id: string, point: Vector3) {
        const s = this.surfaces.find(s => s.id === id);
        if (!s) {
            this.event('invalid', { reason: 'Aim at a white surface.' });
            return false;
        }
        const basis = poseMatrix(s.center, s.normal, s.up), p = point.clone().applyMatrix4(basis.clone().invert()), rx = s.floor ? 1.15 : .9, ry = s.floor ? 1.15 : 1.55, mx = s.width / 2 - rx, my = s.height / 2 - ry;
        if (Math.abs(p.x) > mx + .06 || Math.abs(p.y) > my + .06) {
            this.event('invalid', { reason: 'The whole portal needs room. Aim farther from the edge.' });
            return false;
        }
        p.x = Math.max(-mx, Math.min(mx, p.x));
        p.y = Math.max(-my, Math.min(my, p.y));
        p.z = .025;
        const center = alignWallPortalToFloor(s,p.applyMatrix4(basis),this.solids);
        if (!s.floor) {
            for (const floor of this.solids.filter(f => f.kind === 'floor')) {
                const alongX = Math.abs(s.normal.x) > .8, within = alongX ? center.z + .9 > floor.min.z && center.z - .9 < floor.max.z && center.x >= floor.min.x - .06 && center.x <= floor.max.x + .06 : center.x + .9 > floor.min.x && center.x - .9 < floor.max.x && center.z >= floor.min.z - .06 && center.z <= floor.max.z + .06;
                if (within && center.y - 1.55 < floor.max.y - .01 && center.y + 1.55 > floor.min.y) {
                    const lift = floor.max.y + 1.55 - center.y;
                    if (lift < .12)
                        center.y += lift;
                    else {
                        this.event('invalid', { reason: 'The whole portal must clear the floor or ledge.' });
                        return false;
                    }
                }
            }
        }
        // Floor corrections must still fit the authored white region. Neither
        // alignment nor a small upward correction enlarges the eligible wall.
        const finalLocal=center.clone().applyMatrix4(basis.clone().invert());
        if(Math.abs(finalLocal.x)>mx+.000001||Math.abs(finalLocal.y)>my+.000001){
            this.event('invalid',{reason:'The whole portal must fit inside the white surface above its floor.'});
            return false;
        }
        const apertureBox = new Box3(center.clone().sub(V(Math.abs(s.normal.x) > .8 ? .07 : (s.floor ? 1.15 : .9), s.floor ? .07 : 1.55, Math.abs(s.normal.z) > .8 ? .07 : (s.floor ? 1.15 : .9))), center.clone().add(V(Math.abs(s.normal.x) > .8 ? .07 : (s.floor ? 1.15 : .9), s.floor ? .07 : 1.55, Math.abs(s.normal.z) > .8 ? .07 : (s.floor ? 1.15 : .9))));
        if (this.solids.some(w => w.id !== s.solidId && w.kind === 'wall' && apertureBox.intersectsBox(new Box3(w.min, w.max)))) {
            this.event('invalid', { reason: 'The whole portal must fit between the structural ribs.' });
            return false;
        }
        if (this.portals[1 - index]?.center.distanceTo(center)! < 2.2) {
            this.event('invalid', { reason: 'Place the second portal on a different surface.' });
            return false;
        }
        this.blockedEntry.clear();
        if (this.heldId && this.holdMap.elements.some((v, i) => Math.abs(v - ([0, 5, 10, 15].includes(i) ? 1 : 0)) > .0001))
            this.grabDrop();
        this.portals[index] = { index, surfaceId: id, center, normal: s.normal.clone(), up: s.up.clone(), matrix: poseMatrix(center, s.normal, s.up) };
        this.event(index ? 'portalB' : 'portalA', { surface: id, point: center.toArray() });
        return true;
    }
    private queryAllows(body: Body, collider: RAPIER.Collider) { if (collider.handle === this.characterCollider.handle && body !== this.player)
        return false; const held = this.crates.find(c => c.id === this.heldId); if (body === this.player && collider.handle === held?.collider.handle)
        return false; const s = this.fixed.get(collider.handle); return !s || !this.apertureIgnores(body, s); }
    private exitClear(body: Body, pos: Vector3, rotation: Quaternion, exit: Portal) { if(!this.aperture(body,exit,pos,rotation))return false;let blocked = false; const host = this.surfaces.find(s => s.id === exit.surfaceId)?.solidId, shape = body === this.player ? new RAPIER.Capsule(.57, .28) : new RAPIER.Cuboid(body.half.x * .98, body.half.y * .98, body.half.z * .98); this.physics.intersectionsWithShape(pos, body === this.player ? Q : rotation, shape, c => { const s = this.fixed.get(c.handle); if (s?.id === host)
        return true; if (s && s.kind === 'floor' && pos.y - this.normalSupport(body, V(0, 1, 0), rotation) >= s.max.y - .015)
        return true; if (c.handle === this.characterCollider.handle && (body === this.player || (body as RigidCube).held))
        return true; if (this.crates.some(b => b.id === body.id && b.collider.handle === c.handle))
        return true; if (body === this.player && this.crates.some(b => b.id === this.heldId && b.collider.handle === c.handle))
        return true; blocked = true; return false; }); return !blocked; }
    private normalSupport(body: Body, normal: Vector3, rotation?: Quaternion) { if (body === this.player)
        return Math.abs(normal.y) > .8 ? .85 : .28; const c = body as RigidCube, axes = [V(1, 0, 0), V(0, 1, 0), V(0, 0, 1)].map(v => v.applyQuaternion(rotation ?? c.rotation)); return Math.abs(normal.dot(axes[0])) * c.half.x + Math.abs(normal.dot(axes[1])) * c.half.y + Math.abs(normal.dot(axes[2])) * c.half.z; }
    private refreshBlockedEntries() { for (const [id, index] of this.blockedEntry) {
        const body = id === 'player' ? this.player : this.crates.find(c => c.id === id), entry = this.portals[index], exit = this.portals[1 - index];
        if (!body || !entry || !exit || body.pos.distanceTo(entry.center) > 3 || !this.aperture(body, entry)) {
            this.blockedEntry.delete(id);
            continue;
        }
        const atPlane = body.pos.clone().addScaledVector(entry.normal, -body.pos.clone().sub(entry.center).dot(entry.normal)), matrix = portalMatrix(entry, exit), target = atPlane.applyMatrix4(matrix).addScaledVector(exit.normal, .015), rotation = body === this.player ? new Quaternion() : (body as RigidCube).rotation.clone().premultiply(new Quaternion().setFromRotationMatrix(matrix));
        if (this.exitClear(body, target, rotation, exit))
            this.blockedEntry.delete(id);
    } }
    private rollbackCrossing(body:Body,before:Vector3,entry:Portal,previousRotation?:Quaternion){
        const cube=body===this.player?undefined:body as RigidCube;
        if(cube&&previousRotation)cube.rotation.copy(previousRotation);
        body.pos.copy(before);
        const clearance=this.normalSupport(body,entry.normal)+.025,side=body.pos.clone().sub(entry.center).dot(entry.normal);
        body.pos.addScaledVector(entry.normal,Math.max(0,clearance-side));
        body.vel.addScaledVector(entry.normal,Math.max(0,-body.vel.dot(entry.normal)));
        if(body===this.player){this.character.setTranslation(body.pos,true);this.character.setNextKinematicTranslation(body.pos);}
        else{cube!.rigid.setTranslation(body.pos,true);cube!.rigid.setLinvel(body.vel,true);if(previousRotation)cube!.rigid.setRotation(previousRotation,true);if(cube!.held){cube!.rigid.setNextKinematicTranslation(body.pos);cube!.rigid.setNextKinematicRotation(cube!.rotation);}}
        this.physics.propagateModifiedBodyPositionsToColliders();
    }
    private cross(body: Body, before: Vector3, previousRotation?:Quaternion) {
        if (!this.portals.every(Boolean))
            return false;
        for (let i = 0; i < 2; i++) {
            const entry = this.portals[i]!, exit = this.portals[1 - i]!, from = before.clone().sub(entry.center).dot(entry.normal), to = body.pos.clone().sub(entry.center).dot(entry.normal);
            // Fit can be lost while only the leading part of a body is through.
            // Restore that body's previous fitted side before the solid host
            // reappears around it; a centre-plane crossing is not required.
            if(from>0&&to>0&&(!this.aperture(body,entry)||!this.exitApertureFits(body,entry))&&this.aperture(body,entry,before,previousRotation)&&this.exitApertureFits(body,entry,before,previousRotation)&&this.overlapsPortalHost(body,entry)){
                this.rollbackCrossing(body,before,entry,previousRotation);
                if(this.time-(this.contactCooldown.get('fit:'+body.id)??-1)>.15){this.contactCooldown.set('fit:'+body.id,this.time);this.event('invalid',{body:body.id,reason:body===this.player?'Move toward the centre of the portal.':'Keep the whole cube inside the portal opening.'});}
                return false;
            }
            if (from <= 0 || to > 0) continue;
            if(!this.aperture(body,entry)){
                // Only this aperture was open at the previous physical pose. A
                // diagonal/rotating body that loses fit cannot be left in its host.
                if(this.aperture(body,entry,before,previousRotation)){
                    this.rollbackCrossing(body,before,entry,previousRotation);
                    if(this.time-(this.contactCooldown.get('fit:'+body.id)??-1)>.15){this.contactCooldown.set('fit:'+body.id,this.time);this.event('invalid',{body:body.id,reason:body===this.player?'Move toward the centre of the portal.':'Keep the whole cube inside the portal opening.'});}
                    return false;
                }
                continue;
            }
            const matrix = portalMatrix(entry, exit), newPos = body.pos.clone().applyMatrix4(matrix), q = new Quaternion().setFromRotationMatrix(matrix), cube = body === this.player ? undefined : body as RigidCube;
            const rotation = cube ? cube.rotation.clone().premultiply(q) : new Quaternion();
            newPos.addScaledVector(exit.normal, Math.max(0, .015 - newPos.clone().sub(exit.center).dot(exit.normal)));
            if (!this.exitClear(body, newPos, rotation, exit)) {
                this.rollbackCrossing(body,before,entry);
                this.blockedEntry.set(body.id, i);
                if (this.time - (this.contactCooldown.get('blocked:' + body.id) ?? -1) > .15) {
                    this.contactCooldown.set('blocked:' + body.id, this.time);
                    this.event('blocked', { body: body.id });
                }
                return false;
            }
            this.blockedEntry.delete(body.id);
            const speed = body.vel.length();
            body.pos.copy(newPos);
            body.vel.applyQuaternion(q);
            body.cooldown = .22;
            this.exitPortal.set(body.id, 1 - i);
            body.crossings++;
            body.grounded = false;
            if (body === this.player) {
                this.character.setTranslation(newPos, true);
                this.character.setNextKinematicTranslation(newPos);
                const dir = this.forward().applyQuaternion(q);
                this.yaw = Math.hypot(dir.x, dir.z) < .1 ? Math.atan2(-exit.normal.x, -exit.normal.z) : Math.atan2(-dir.x, -dir.z);
                this.pitch = Math.asin(Math.max(-.99, Math.min(.99, dir.y)));
                if (this.heldId)
                    this.holdMap.multiply(matrix.clone().invert());
                if (Math.abs(entry.normal.y) > .8 && speed > 6) {
                    this.launchUsed = true;
                    this.event('launch', { speed });
                }
            }
            else {
                if (cube!.held)
                    this.holdMap.premultiply(matrix);
                cube!.rotation.copy(rotation);
                cube!.angularVelocity.applyQuaternion(q);
                cube!.rigid.setTranslation(newPos, true);
                cube!.rigid.setRotation(rotation, true);
                if (cube!.held) {
                    cube!.rigid.setNextKinematicTranslation(newPos);
                    cube!.rigid.setNextKinematicRotation(rotation);
                }
                cube!.rigid.setLinvel(body.vel, true);
                cube!.rigid.setAngvel(cube!.angularVelocity, true);
            }
            this.physics.propagateModifiedBodyPositionsToColliders();
            this.event('enter', { body: body.id, from: i, to: 1 - i, fromSurface: entry.surfaceId, toSurface: exit.surfaceId, speed, exitSpeed: body.vel.length(), held: this.heldId ?? null });
            return true;
        }
        return false;
    }
    carryTarget(origin=this.player.pos) { return origin.clone().add(V(0, .65, 0)).addScaledVector(this.forward(), 1.8).add(V(0, -.5, 0)); }
    updateHeld(dt:number, nextPlayerPosition=this.player.pos) {
        const c = this.crates.find(c => c.id === this.heldId);
        if (!c)
            return;
        const target = this.carryTarget(nextPlayerPosition).applyMatrix4(this.holdMap);
        // The target follows this step's capsule pose. Bounded motion also prevents an
        // abrupt grab/look change from imparting an unbounded kinematic impulse.
        const movement=target.sub(c.pos).clampLength(0,18*dt);
        this.holdController.computeColliderMovement(c.collider, movement, undefined, undefined, col => this.queryAllows(c, col));
        const corrected = this.holdController.computedMovement();
        c.rigid.setNextKinematicTranslation(c.pos.clone().add(corrected));
    }
    private grabbableCube() {
        const eye=this.eye(),dir=this.forward();
        const candidates=this.crates.filter(c=>c.pos.distanceTo(eye)<3.1&&c.pos.clone().sub(eye).normalize().dot(dir)>.65).sort((a,b)=>a.pos.distanceTo(eye)-b.pos.distanceTo(eye));
        return candidates.find(c=>{const delta=c.pos.clone().sub(eye),distance=delta.length(),ray=new Ray(eye,delta.normalize());return !this.activeSolids().some(s=>{const p=ray.intersectBox(new Box3(s.min,s.max),V());return p&&p.distanceTo(eye)<distance-c.half.x*.8;});});
    }
    private nearbyControl(){
        const eye=this.eye(),forward=this.forward();
        return this.machines.devices.filter(d=>!d.spec.automatic&&['switch','relay','junction','lift'].includes(d.spec.kind)).map(d=>({device:d,point:(d.spec.kind==='lift'?d.position.clone():V(...d.spec.position)).add(V(...(d.spec.controlOffset??[0,0,0])))})).filter(({point})=>{const delta=point.clone().sub(eye);return delta.length()<2.8&&delta.normalize().dot(forward)>.6;}).sort((a,b)=>a.point.distanceTo(eye)-b.point.distanceTo(eye)).find(({device,point})=>{const delta=point.clone().sub(eye),distance=delta.length(),ray=new Ray(eye,delta.normalize());return !this.activeSolids().some(s=>{if(s.id===device.spec.id)return false;const hit=ray.intersectBox(new Box3(s.min,s.max),V());return hit&&hit.distanceTo(eye)<distance-.1;});})?.device;
    }
    private coveredControlHint(){
        const eye=this.eye(),forward=this.forward();
        for(const d of this.machines.devices){
            const relation=d.spec.controlCover;if(!relation||d.spec.automatic)continue;
            const point=(d.spec.kind==='lift'?d.position.clone():V(...d.spec.position)).add(V(...(d.spec.controlOffset??[0,0,0]))),delta=point.clone().sub(eye),distance=delta.length();
            if(distance>=2.8||delta.normalize().dot(forward)<=.6)continue;
            const ray=new Ray(eye,delta),hits=this.activeSolids().filter(s=>s.id!==d.spec.id).map(s=>({id:s.id,point:ray.intersectBox(new Box3(s.min,s.max),V())})).filter(h=>h.point&&h.point.distanceTo(eye)<distance-.1).sort((a,b)=>a.point!.distanceToSquared(eye)-b.point!.distanceToSquared(eye));
            const cover=this.machines.devices.find(c=>c.spec.id===relation.id&&c.spec.kind==='shutter');
            if(cover&&hits[0]?.id===cover.spec.id)return cover.on?(relation.openingHint??'Wait for the cover to open.'):relation.blockedHint;
        }
        return undefined;
    }
    interactionHint(){return this.heldId?'E · Drop':this.nearbyControl()?'E · Use '+this.nearbyControl()!.spec.label:this.grabbableCube()?'E · Pick up':this.coveredControlHint()??'';}
    heldFootprint(){const cube=this.crates.find(c=>c.id===this.heldId);return cube?queryHeldFootprint(this.physics,cube,this.portals,c=>this.fixed.get(c.handle)?.id??this.bodyForCollider(c.handle)?.id??[...this.doors].find(([,body])=>body.collider.handle===c.handle)?.[0]??'support:'+c.handle):null;}
    grabDrop() {
        if(this.heldId){const c=this.crates.find(c=>c.id===this.heldId)!;this.heldId=undefined;this.holdMap.identity();c.held=false;c.rigid.setBodyType(RAPIER.RigidBodyType.Dynamic,true);c.rigid.setLinvel(this.player.vel.clone().addScaledVector(this.forward(),.5),true);this.event('drop',{body:c.id});return;}
        const c=this.grabbableCube();if(!c){this.event('invalid',{reason:this.coveredControlHint()??'Move closer and look at the cube.'});return;}
        this.heldId=c.id;this.holdMap.identity();c.held=true;c.rigid.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased,true);c.rigid.setLinvel(V(),true);c.rigid.setAngvel(V(),true);this.event('pickup',{body:c.id});
    }
    interact() { if(this.heldId)return false;const d=this.nearbyControl();return d?this.machines.interact(d.spec.id):false; }
    respawn() { this.respawns++; this.campaignResult = undefined; this.player.pos.copy(this.spawn); this.player.vel.set(0, 0, 0); this.blockedEntry.clear(); this.character.setTranslation(this.spawn, true); this.character.setNextKinematicTranslation(this.spawn); if (this.heldId) {
        const c = this.crates.find(c => c.id === this.heldId)!;
        this.resetCube(c);
    } this.heldId = undefined; this.holdMap.identity(); this.yaw = this.level.startYaw??0; this.pitch = 0; this.physics.propagateModifiedBodyPositionsToColliders(); this.event('respawn', { count: this.respawns }); this.journal?.reset();this.observeJournal(); }
    private resetCube(c: RigidCube) { c.held = false; c.pos.copy(V(...this.blueprint.cargo.find(x => x.spec.id === c.id)!.position)); c.vel.set(0, 0, 0); c.rigid.setBodyType(RAPIER.RigidBodyType.Dynamic, true); c.rigid.setTranslation(c.pos, true); c.rigid.setRotation(Q, true); c.rigid.setLinvel(V(), true); c.rigid.setAngvel(V(), true); this.physics.propagateModifiedBodyPositionsToColliders(); }
    private updateOptics(flags:Record<string,boolean>,observationOnly=false){
        const optical=this.level.optics;if(!optical)return;
        for(const receiver of optical.receivers)flags[receiver.id]=false;
        const portals:BeamPortal[]=this.portals.filter((p):p is Portal=>!!p).map(p=>({id:String(p.index),linkedTo:this.portals[1-p.index]?String(1-p.index):undefined,center:p.center.toArray() as [number,number,number],normal:p.normal.toArray() as [number,number,number],up:p.up.toArray() as [number,number,number],radii:Math.abs(p.normal.y)>.8?[1.144,1.102]:[.88,1.53]}));
        const flag=(id:string)=>flags[id]??this.machines.devices.find(d=>d.spec.id===id)?.on??false;
        for(const emitter of optical.emitters){
            const c=emitter.circuit,enabled=(!c?.all||c.all.every(flag))&&(!c?.any||c.any.some(flag))&&(!c?.not||c.not.every(id=>!flag(id)));
            if(!enabled){if(!observationOnly)this.beams.delete(emitter.id);continue;}
            const result=tracePortalBeam({origin:emitter.position,direction:emitter.direction,maxDistance:emitter.range??80,portals,receivers:optical.receivers.map(r=>({id:r.id,center:r.position,radius:r.radius})),castObstacle:(origin,direction,range)=>{
                const hit=this.physics.castRay(new RAPIER.Ray(V(...origin),V(...direction)),range,true,undefined,undefined,this.doors.get(emitter.id)?.collider);
                if(!hit)return undefined;
                return{id:this.fixed.get(hit.collider.handle)?.id??this.bodyForCollider(hit.collider.handle)?.id??'machine',distance:hit.timeOfImpact};
            }});
            if(!observationOnly)this.beams.set(emitter.id,result);if(result.receiver)flags[result.receiver]=true;
        }
        if(!observationOnly)for(const receiver of optical.receivers){const previous=this.machines.flags[receiver.id]??false;if(flags[receiver.id]!==previous)this.event(flags[receiver.id]?'receiver-power':'beam-blocked',{id:receiver.id});}
    }
    private observeJournal(){
        if(!this.journal)return;
        const flags:Record<string,boolean>={},pressure=new Map<string,{pressed:boolean;cargo:boolean}>();
        // Fresh native overlap observations; this read never writes pad/circuit state.
        for(const pad of this.pads){let pressed=false,cargo=false;this.physics.intersectionsWithShape(pad.pos.clone().add(V(0,.02,0)),Q,new RAPIER.Cuboid(.85,.03,.85),collider=>{const body=this.bodyForCollider(collider.handle);if(body){pressed=true;cargo||=body!==this.player;}return true;});pressure.set(pad.id,{pressed,cargo});flags[pad.id]=pressed;}
        // Fresh ray transport, with no beam-map writes or audiovisual events.
        this.updateOptics(flags,true);
        const readings:JournalReading[]=this.journal.config.watch.map(watch=>{
            let state='UNKNOWN',cargo: boolean|undefined;
            const device=this.machines.devices.find(d=>d.spec.id===watch.id),body=this.doors.get(watch.id)?.rigid;
            if(watch.kind==='shutter'&&device?.spec.kind==='shutter'&&body){const pose=observeLeaf(device.spec,body.translation(),body.linvel());state=pose.closed?'CLOSED':pose.open?'OPEN':pose.stopped?'PARTLY OPEN':'MOVING';}
            if(watch.kind==='dock'&&device&&body){const spec=device.spec.stops?device.spec:{...device.spec,stops:[{label:'BASE',position:device.spec.position},{label:device.spec.targetLabel??'UPPER',position:device.spec.target??device.spec.position}]};const stop=observeDock(spec,body.translation(),body.linvel());state=stop?'AT '+stop:Math.hypot(body.linvel().x,body.linvel().y,body.linvel().z)>1e-5?'MOVING':'BETWEEN STOPS';}
            if(watch.kind==='light'&&this.level.optics?.receivers.some(r=>r.id===watch.id))state=flags[watch.id]?'LIT':'DARK';
            if(watch.kind==='pressure'&&pressure.has(watch.id)){const reading=pressure.get(watch.id)!;state=reading.pressed?'PRESSED':'EMPTY';cargo=reading.cargo;}
            return {...watch,state,cargo};
        });
        const controls=Object.fromEntries((this.journal.config.tests??[]).map(test=>[test.control,this.machines.devices.find(d=>d.spec.id===test.control)?.on===true]));
        this.journal.observe(this.time,readings,controls);
    }
    private updateMachinery(dt:number){
        const flags: Record<string, boolean> = {};
        for (const pad of this.pads) {
            pad.pressed = false;
            pad.crateId = undefined;
            this.physics.intersectionsWithShape(pad.pos.clone().add(V(0, .02, 0)), Q, new RAPIER.Cuboid(.85, .03, .85), collider => { const body = this.bodyForCollider(collider.handle); if (body) {
                pad.pressed = true;
                if (body !== this.player)
                    pad.crateId = body.id;
            } return true; });
            flags[pad.id] = pad.pressed;
        }
        for (const d of this.machines.devices) {
            const size = V(...d.spec.size), p = V(...d.spec.position);
            if(d.spec.kind==='shutter'){
                const native=this.doors.get(d.spec.id)!.rigid;
                const observed=observeLeaf(d.spec,native.translation(),native.linvel());
                flags['closed:'+d.spec.id]=observed.closed;
                flags['clear:'+d.spec.id]=observed.clear;
                const occupants=this.doorOccupants.get(d.spec.id)??new Set<string>();
                for(const body of [this.player,...this.crates]){
                    const halfX=this.normalSupport(body,V(1,0,0)),halfY=this.normalSupport(body,V(0,1,0)),halfZ=this.normalSupport(body,V(0,0,1));
                    const inside=Math.abs(body.pos.x-p.x)<size.x/2+halfX+.015&&Math.abs(body.pos.z-p.z)<size.z/2+halfZ+.015&&body.pos.y-halfY<p.y+size.y/2&&body.pos.y+halfY>p.y-size.y/2;
                    // Acquire safety only through a genuinely clear opening. Once
                    // inside, retain it until the body leaves the actual doorway.
                    // Touching a partly closed leaf from outside cannot open it.
                    if(!inside)occupants.delete(body.id);
                    else if(d.position.y-size.y/2>=body.pos.y+halfY-.02)occupants.add(body.id);
                }
                this.doorOccupants.set(d.spec.id,occupants);
                flags['safety:'+d.spec.id]=occupants.size>0;
                flags['door-safety']=(flags['door-safety']??false)||occupants.size>0;
            }
            flags['moving:'+d.spec.id]=d.moving;
            for(const stop of d.spec.stops??[])flags['at:'+d.spec.id+':'+stop.label]=!d.moving&&d.position.distanceTo(V(...stop.position))<.03;
        }
        this.updateOptics(flags);
        this.machines.update(dt, [], flags);
        for (const e of this.machines.events.splice(0))
            this.event(e.type, { id: e.id,value:e.value });
        for (const d of this.machines.devices)
            this.doors.get(d.spec.id)?.rigid.setNextKinematicTranslation(d.position);
    }
    private ridingPlatform(){return this.machines.devices.find(d=>['lift','moving-platform'].includes(d.spec.kind)&&this.player.grounded&&Math.abs(this.player.pos.y-.85-(d.previous.y+d.spec.size[1]/2))<.08&&Math.abs(this.player.pos.x-d.previous.x)<d.spec.size[0]/2-.01&&Math.abs(this.player.pos.z-d.previous.z)<d.spec.size[2]/2-.01);}
    private computeCharacterMovement(requested:Vector3,platformCollider?:number){
        // A genuinely stationary kinematic body's predictive friction can cancel
        // separation at a floor seam. Query its unchanged geometry as Fixed only
        // when no proxy or native queued/current translation or rotation can move.
        // Exact native zero also leaves residual/signed-zero velocity untouched.
        const stationary=this.machines.devices.filter(d=>d.delta.lengthSq()===0).map(d=>this.doors.get(d.spec.id)!.rigid).filter(body=>{
            if(body.bodyType()!==RAPIER.RigidBodyType.KinematicPositionBased)return false;
            const p=body.translation(),n=body.nextTranslation(),q=body.rotation(),u=body.nextRotation(),v=body.linvel(),a=body.angvel();
            return p.x===n.x&&p.y===n.y&&p.z===n.z&&q.x===u.x&&q.y===u.y&&q.z===u.z&&q.w===u.w&&[v.x,v.y,v.z,a.x,a.y,a.z].every(value=>Object.is(value,0));
        }).map(body=>({body,type:body.bodyType()}));
        try{
            for(const {body} of stationary)body.setBodyType(RAPIER.RigidBodyType.Fixed,true);
            this.controller.computeColliderMovement(this.characterCollider,requested,undefined,undefined,c=>c.handle!==platformCollider&&this.queryAllows(this.player,c));
        }finally{
            for(const {body,type} of stationary)body.setBodyType(type,true);
        }
    }
    step(dt: number, input: Input) {
        if (this.campaignResult)
            return;
        this.time += dt;
        this.physics.timestep = dt;
        this.refreshBlockedEntries();
        this.updateMachinery(dt);
        const platform=this.ridingPlatform();
        const previous = this.player.pos.clone(), cratePrevious = new Map(this.crates.map(c => [c.id, {position:c.pos.clone(),rotation:c.rotation.clone()}]));
        this.player.cooldown = Math.max(0, this.player.cooldown - dt);
        for (const c of this.crates)
            c.cooldown = Math.max(0, c.cooldown - dt);
        const forward = V(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)), right = V(Math.cos(this.yaw), 0, -Math.sin(this.yaw)), desired = forward.multiplyScalar(input.forward).addScaledVector(right, input.strafe);
        if (desired.length() > 1)
            desired.normalize();
        desired.multiplyScalar(4.8);
        if (this.player.grounded) {
            this.player.vel.x += (desired.x - this.player.vel.x) * Math.min(1, dt * 18);
            this.player.vel.z += (desired.z - this.player.vel.z) * Math.min(1, dt * 18);
        }
        else if (desired.lengthSq()) {
            const direction = desired.clone().normalize(), projection = this.player.vel.dot(direction), add = Math.min(8 * dt, Math.max(0, 4.8 - projection));
            this.player.vel.addScaledVector(direction, add);
        }
        if (input.jump && !this.jumpLatch && this.player.grounded) {
            this.player.vel.y = 6;
            this.event('jump');
        }
        this.jumpLatch = input.jump;
        this.player.vel.y = Math.max(-32, this.player.vel.y - 16 * dt);
        const carry=platform?.delta??V(),platformCollider=platform?this.doors.get(platform.spec.id)?.collider.handle:undefined;
        const conveyor=this.machines.conveyorVelocity(this.player);
        const requested=this.player.vel.clone().add(conveyor).multiplyScalar(dt).add(carry);
        // A supported capsule moves with its deck; gravity must not accumulate a
        // tiny penetration while that same deck is excluded from the sweep.
        if(platform&&this.player.vel.y<=0)requested.y=platform.position.y+platform.spec.size[1]/2+this.player.half.y+this.controller.offset()+this.controller.normalNudgeFactor()-this.player.pos.y;
        this.computeCharacterMovement(requested,platformCollider);
        const movement = this.controller.computedMovement();
        if(this.player.vel.y>0&&requested.y>0&&movement.y<requested.y-1e-6){
            for(let i=0;i<this.controller.numComputedCollisions();i++){
                if(this.controller.computedCollision(i)!.normal1.y<-.5){this.player.vel.y=0;break;}
            }
        }
        const next = this.player.pos.clone().add(movement);
        this.character.setNextKinematicTranslation(next);
        this.player.grounded = this.controller.computedGrounded()||!!(platform&&this.player.vel.y<=0&&Math.abs(next.y-.85-(platform.position.y+platform.spec.size[1]/2))<.08&&Math.abs(next.x-platform.position.x)<platform.spec.size[0]/2-.01&&Math.abs(next.z-platform.position.z)<platform.spec.size[2]/2-.01);
        if (this.player.grounded && this.player.vel.y < 0)
            this.player.vel.y = 0;
        this.updateHeld(dt,next);
        for(const cube of this.crates){if(cube.held)continue;const belt=this.machines.conveyorVelocity(cube);if(belt.lengthSq()){const velocity=V().copy(cube.rigid.linvel());velocity.x+=(belt.x-velocity.x)*Math.min(1,dt*12);velocity.z+=(belt.z-velocity.z)*Math.min(1,dt*12);cube.rigid.setLinvel(velocity,true);}}
        this.physics.step(this.eventQueue, this.hooks);
        this.eventQueue.drainCollisionEvents((a, b, started) => { if (!started)
            return; const cube = this.crates.find(c => c.collider.handle === a || c.collider.handle === b); if (!cube || cube.vel.length() < .7 || this.time - (this.contactCooldown.get(cube.id) ?? -1) < .12)
            return; this.contactCooldown.set(cube.id, this.time); this.event('contact', { body: cube.id, speed: cube.vel.length() }); });
        this.player.pos.copy(this.character.translation());
        this.cross(this.player, previous);
        for (const c of this.crates) {
            c.pos.copy(c.rigid.translation());
            c.vel.copy(c.rigid.linvel());
            const q = c.rigid.rotation();
            c.rotation.set(q.x, q.y, q.z, q.w);
            c.angularVelocity.copy(c.rigid.angvel());
            this.cross(c, cratePrevious.get(c.id)!.position,cratePrevious.get(c.id)!.rotation);
            c.grounded = Math.abs(c.vel.y) < .12;
            if (c.pos.y < -7.6)
                this.resetCube(c);
        }
        if (this.player.grounded && !this.groundedLast) {
            this.event('land');
        }
        this.groundedLast = this.player.grounded;
        if (this.player.grounded && (input.forward || input.strafe) && this.time - this.lastStep > .42) {
            this.lastStep = this.time;
            this.event('footstep');
        }
        for (const pad of this.pads) {
            const old = (pad as any).wasPressed ?? false;
            if (pad.pressed !== old) {
                this.event(pad.pressed ? 'pad' : 'button-release', { pad: pad.id, crate: pad.crateId ?? 'player' });
                (pad as any).wasPressed = pad.pressed;
            }
        }
        if (this.player.pos.y < (this.level.recoveryY??-5.4)) {
            this.respawn();
            return;
        }
        this.observeJournal();
        const exit = this.blueprint.exits.find(e => Math.abs(this.player.pos.x - e.position[0]) < e.size[0] / 2 && Math.abs(this.player.pos.y - e.position[1]) < e.size[1] / 2 && Math.abs(this.player.pos.z - e.position[2]) < e.size[2] / 2);
        if(!exit)this.lastWrongExit=undefined;
        if(exit&&this.level.expectedExit&&exit.id!==this.level.expectedExit){if(this.lastWrongExit!==exit.id){this.lastWrongExit=exit.id;this.event('wrong-exit',{exit:exit.id,expected:this.level.expectedExit,reason:this.level.wrongExitFeedback??'This is a different destination. Check the requested door.'});}return;}
        if (exit) {
            this.campaignResult = { goalMatched: true, physicalComplete: true, exit: exit.id, reason: '', events: [...this.events], mechanisms: [...this.mechanisms] };
            this.event('complete', { chamber: this.number });
        }
    }
    snapshot() { return { room: this.room.id, number: this.number, mission: this.room.mission, physics: 'Rapier3D 0.21 · capsule KCC + dynamic rigid cubes', player: { position: this.player.pos.toArray(), velocity: this.player.vel.toArray(), yaw: this.yaw, pitch: this.pitch, grounded: this.player.grounded, crossings: this.player.crossings }, portals: this.portals.map(p => p ? { surface: p.surfaceId, position: p.center.toArray(), normal: p.normal.toArray() } : null), crates: this.crates.map(c => ({ id: c.id, position: c.pos.toArray(), velocity: c.vel.toArray(), rotation: c.rotation.toArray(), angularVelocity: c.angularVelocity.toArray(), held: !!c.held, crossings: c.crossings })), pads: this.pads.map(p => ({ id: p.id, position: p.pos.toArray(), pressed: p.pressed, crate: p.crateId ?? null })), devices: this.machines.snapshot(), panels: this.surfaces.map(s => ({ id: s.id, position: s.center.toArray(), normal: s.normal.toArray(), width: s.width, height: s.height })), exits: this.blueprint.exits, result: this.campaignResult ?? null, held: this.heldId ?? null, holdSpaceTransform: this.holdMap.toArray(), launchUsed: this.launchUsed, respawns: this.respawns, beams:Object.fromEntries(this.beams),signals:{...this.machines.flags},journal:this.journal?.snapshot()??null,events: this.events.slice(-16) }; }
    dispose() { this.eventQueue.free(); this.physics.free(); }
}
