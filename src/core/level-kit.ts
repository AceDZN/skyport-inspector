/** Authoring helpers only: every physical coordinate/circuit is explicit, independent of mission text. */
import { V, makeSolid, type Solid } from '../physics';
import type { WorldBlueprint } from '../campaign-blueprint';
import type { DeviceSpec, XYZ, Circuit } from '../systems';
export class ChamberBuilder {
    readonly world: WorldBlueprint = { family: 'threshold', spawn: [0, .87, 10], solids: [], surfaces: [], cargo: [], pads: [], bridges: [], devices: [], exits: [], regions: [], marks: [], routePoints: {}, notes: [] };
    box(id: string, center: XYZ, size: XYZ, kind: Solid['kind'] = 'wall') { this.world.solids.push(makeSolid(id, ...center, ...size, kind)); return id; }
    floor(id: string, x1: number, x2: number, z1: number, z2: number, y = 0) { return this.box(id, [(x1 + x2) / 2, y - .3, (z1 + z2) / 2], [x2 - x1, .6, z2 - z1], 'floor'); }
    panel(id: string, host: string, center: XYZ, normal: XYZ, width: number, height: number, floor = false) { this.world.surfaces.push({ id, solidId: host, center: V(...center), normal: V(...normal), up: floor ? V(0, 0, -1) : V(0, 1, 0), width, height, floor }); }
    cube(id: string, position: XYZ, size: 'small' | 'large' = 'large', label = 'CUBE') { this.world.cargo.push({ spec: { id, label, shape: 'diamond', size, start: 'front' }, position }); }
    button(id: string, position: XYZ) { this.world.pads.push({ id, label: '', position }); }
    door(id: string, position: XYZ, size: XYZ, circuit: Circuit) { this.device({ id, kind: 'shutter', label: 'EXIT', position, size, target: [position[0], position[1] + size[1] + .5, position[2]], circuit }); }
    device(spec: DeviceSpec) { this.world.devices.push(spec); }
    exit(id: string, position: XYZ, size: XYZ = [1.8, 1.8, 1.8]) { this.world.exits.push({ id, label: '', position, size }); }
    finish() { return this.world; }
}
