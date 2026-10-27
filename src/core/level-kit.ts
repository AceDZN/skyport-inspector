/** Authoring helpers only: every physical coordinate/circuit is explicit, independent of mission text. */
import { V, makeSolid, type Solid } from '../physics';
import type { WorldBlueprint } from '../campaign-blueprint';
import type { DeviceSpec, XYZ, Circuit } from '../systems';
/** Goal volume follows real vestibule carpentry, including both usable jambs. */
export interface CorridorBounds {minX:number;maxX:number;minZ:number;maxZ:number}
export function addCorridorExit(world:WorldBlueprint,id:string,floorId:string,bounds?:CorridorBounds){
    const floor=world.solids.find(s=>s.id===floorId&&s.kind==='floor');
    if(!floor)throw Error('Missing physical exit floor '+floorId);
    const minX=bounds?.minX??floor.min.x+.02,maxX=bounds?.maxX??floor.max.x-.02,minZ=bounds?.minZ??floor.min.z+.02,maxZ=bounds?.maxZ??floor.max.z-.02;
    if(minX<floor.min.x||maxX>floor.max.x||minZ<floor.min.z||maxZ>floor.max.z||maxX<=minX||maxZ<=minZ)throw Error('Exit corridor must fit its actual floor '+floorId);
    world.exits.push({id,label:'EXIT',position:[(minX+maxX)/2,floor.max.y+1.5,(minZ+maxZ)/2],size:[maxX-minX,3,maxZ-minZ]});
}
export class ChamberBuilder {
    readonly world: WorldBlueprint = { family: 'threshold', spawn: [0, .87, 10], solids: [], surfaces: [], cargo: [], pads: [], bridges: [], devices: [], exits: [], regions: [], marks: [], routePoints: {}, notes: [] };
    box(id: string, center: XYZ, size: XYZ, kind: Solid['kind'] = 'wall') { this.world.solids.push(makeSolid(id, ...center, ...size, kind)); return id; }
    floor(id: string, x1: number, x2: number, z1: number, z2: number, y = 0) { return this.box(id, [(x1 + x2) / 2, y - .3, (z1 + z2) / 2], [x2 - x1, .6, z2 - z1], 'floor'); }
    panel(id: string, host: string, center: XYZ, normal: XYZ, width: number, height: number, floor = false) { this.world.surfaces.push({ id, solidId: host, center: V(...center), normal: V(...normal), up: floor ? V(0, 0, -1) : V(0, 1, 0), width, height, floor }); }
    cube(id: string, position: XYZ, size: 'small' | 'large' = 'large', label = 'CUBE') { this.world.cargo.push({ spec: { id, label, shape: 'diamond', size, start: 'front' }, position }); }
    button(id: string, position: XYZ) { this.world.pads.push({ id, label: '', position }); }
    door(id: string, position: XYZ, size: XYZ, circuit: Circuit) { this.device({ id, kind: 'shutter', label: 'EXIT', position, size, target: [position[0], position[1] + size[1] + .5, position[2]], circuit }); }
    device(spec: DeviceSpec) { this.world.devices.push(spec); }
    exit(id: string, position: XYZ, size: XYZ = [2.8, 3, 2.8]) { this.world.exits.push({ id, label: 'EXIT', position, size }); }
    exitCorridor(id:string,floorId:string,bounds?:CorridorBounds){addCorridorExit(this.world,id,floorId,bounds);}
    finish() { return this.world; }
}
