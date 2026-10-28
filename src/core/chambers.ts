import { makeSolid, V, type Surface } from '../physics';
import type { WorldBlueprint } from '../campaign-blueprint';
import type { CatalogueRow } from '../campaign-types';
import {addCorridorExit} from './level-kit';
export const chamberTitles = ['The Other Side', 'A Longer Fall'];
export const chamberMissions = [
    'Bring the cube back. Put it on the button.',
    'Fall through the floor rift. Use your momentum to reach the upper exit.'
];
export const chamberHebrew = [
    'קחו את הקובייה דרך השער. הניחו אותה על הלחצן כדי לפתוח את היציאה.',
    'נפלו דרך השער שברצפה. התנע יוציא אתכם מהשער הגבוה אל המרפסת.'
];
/** Two deliberately authored chambers. No catalogue-derived geometry or invisible action chores. */
export function chamberBlueprint(number: 1 | 2): WorldBlueprint {
    const b: WorldBlueprint = { family: number === 1 ? 'threshold' : 'launch-spire', spawn: [0, .86, number === 1 ? 10 : 12], solids: [], surfaces: [], cargo: [], pads: [], bridges: [], devices: [], exits: [], regions: [], marks: [], routePoints: {}, notes: [] };
    const box = (id: string, c: [
        number,
        number,
        number
    ], s: [
        number,
        number,
        number
    ], kind: 'floor' | 'wall' | 'glass' = 'wall') => b.solids.push(makeSolid(id, ...c, ...s, kind));
    const panel = (id: string, center: [
        number,
        number,
        number
    ], normal: [
        number,
        number,
        number
    ], solidId: string, floor = false) => { const s: Surface = { id, center: V(...center), normal: V(...normal), up: floor ? V(0, 0, -1) : V(0, 1, 0), width: 3.5, height: floor ? 3.5 : 3.6, solidId, floor }; b.surfaces.push(s); };
    if (number === 1) {
        box('chamber-floor', [0, -.3, 1], [16, .6, 26], 'floor');
        box('west-wall', [-8.2, 3.5, -1.15], [.4, 7, 21.7]);
        box('west-rear-jamb', [-8.2, 3.5, 13.15], [.4, 7, 1.7]);
        box('west-door-header', [-8.2, 5, 11], [.4, 4, 2.6]);
        box('east-wall', [8.2, 3.5, 1], [.4, 7, 26]);
        box('south-wall', [0, 3.5, 14.2], [16.8, 7, .4]);
        box('north-wall', [0, 3.5, -12.2], [16.8, 7, .4]);
        box('ceiling', [0, 7.2, 1], [16.8, .4, 26.8]);
        box('divider-window', [0, 3.5, 0], [16, 7, .16], 'glass');
        box('raised-cube-alcove', [3.5, 1.4, -9], [6, 2.8, 6], 'floor');
        box('vestibule-floor', [-10, -.3, 11], [4, .6, 3], 'floor');
        box('vestibule-ceiling', [-10, 7.2, 11], [4, .4, 3]);
        box('vestibule-west', [-12.2, 3.5, 11], [.4, 7, 3.8]);
        box('vestibule-north', [-10, 3.5, 9.3], [4, 7, .4]);
        box('vestibule-south', [-10, 3.5, 12.7], [4, 7, .4]);
        panel('near-wall', [-7.985, 3.5, -1.15], [1, 0, 0], 'west-wall');
        Object.assign(b.surfaces.at(-1)!, { width: 21.7, height: 7 });
        panel('far-wall', [0, 3.5, -11.985], [0, 0, 1], 'north-wall');
        Object.assign(b.surfaces.at(-1)!, { width: 16, height: 7 });
        panel('east-wall', [7.985, 3.5, 1], [-1, 0, 0], 'east-wall');
        Object.assign(b.surfaces.at(-1)!, { width: 26, height: 7 });
        panel('south-wall', [0, 3.5, 13.985], [0, 0, -1], 'south-wall');
        Object.assign(b.surfaces.at(-1)!, { width: 16, height: 7 });
        b.cargo = [{ spec: { id: 'weighted-cube', label: 'CUBE', shape: 'diamond', size: 'large', start: 'behind' }, position: [3, 3.35, -8] }];
        b.pads = [{ id: 'exit-button', label: '', position: [2, .14, 6] }];
        b.devices = [{ id: 'exit-door', kind: 'shutter', label: 'EXIT', position: [-8.12, 1.5, 11], size: [.3, 3, 2.6], target: [-8.12, 5, 11], circuit: { any: ['exit-button', 'door-safety'] } }];
        addCorridorExit(b,'next-chamber','vestibule-floor');
    }
    else {
        // Safe approach surrounds a 3.5×6.5m well. There is no walkable bridge to the high gallery.
        box('approach-west', [-5.375, -.3, 8], [7.25, .6, 12], 'floor');
        box('approach-east', [5.375, -.3, 8], [7.25, .6, 12], 'floor');
        box('approach-south', [0, -.3, 11.625], [3.5, .6, 4.75], 'floor');
        box('approach-north', [0, -.3, 2.375], [3.5, .6, .75], 'floor');
        box('well-bottom', [0, -3.2, 6], [3.5, .4, 6.5], 'floor');
        box('receiving-gallery', [0, 3.1, -3], [14, .6, 8], 'floor');
        box('catch-floor', [0, -6.8, -1], [18, .6, 30], 'floor');
        box('west-wall', [-9.2, 2, -1], [.4, 18, 30]);
        box('east-wall', [9.2, 2, -1], [.4, 18, 30]);
        box('south-wall', [0, 2, 14.2], [18.8, 18, .4]);
        box('high-wall', [0, 2, -12.2], [18.8, 18, .4]);
        box('ceiling', [0, 11.2, -1], [18.8, .4, 30.8]);
        // Exit recess sits on the gallery; access is geometric, without a launch-used flag.
        box('gallery-back-left', [3.35, 5.1, -6.9], [.3, 3.4, .3]);
        box('gallery-back-right', [6.65, 5.1, -6.9], [.3, 3.4, .3]);
        box('gallery-door-header', [5, 7, -6.9], [3, .6, .3]);
        box('upper-vestibule-floor', [5, 3.1, -8.8], [3, .6, 3.6], 'floor');
        box('upper-vestibule-west', [3.3, 5.1, -8.8], [.3, 3.4, 3.6]);
        box('upper-vestibule-east', [6.7, 5.1, -8.8], [.3, 3.4, 3.6]);
        box('upper-vestibule-end', [5, 5.1, -10.7], [3.7, 3.4, .3]);
        panel('drop-floor', [0, -2.975, 6], [0, 1, 0], 'well-bottom', true);
        Object.assign(b.surfaces.at(-1)!, { height: 6.5 });
        panel('high-wall', [0, 7.15, -11.985], [0, 0, 1], 'high-wall');
        Object.assign(b.surfaces.at(-1)!, { width: 14, height: 7.1 });
        b.devices = [{ id: 'upper-door', kind: 'shutter', label: 'EXIT', position: [5, 4.9, -6.9], size: [3, 3, .3], target: [5, 8.4, -6.9], initial: true }];
        addCorridorExit(b,'upper-exit','upper-vestibule-floor');
        b.routePoints = { 'well-lip': [0, .85, 9.55], 'well-centre': [0, -2.975, 6], 'landing': [0, 4.25, -4] };
    }
    // Structural ribs are both rendered and collidable; a portal must fit between them.
    const half = number === 1 ? 8 : 9, height = number === 1 ? 7 : 11;
    for (const side of [-1, 1])
        for (let z = -12; z <= 12; z += 4) {
            if (number === 1 && side === -1 && z === 12)
                continue;
            box('structural-rib-' + side + '-' + z, [side * (half - .12), height / 2, z], [.22, height, .18]);
        }
    return b;
}
export function chamberRow(number: 1 | 2) {
    const row: CatalogueRow = { number, name: chamberTitles[number - 1], chapter: 'TEST CHAMBERS', family: number === 1 ? 'threshold' : 'launch-spire', status: 'core chamber under playtest', geometryRoute: '', newDemand: '', interactionChain: [], englishFocus: 'physical imperatives', sourceMetadata: { grades: [7, 8, 9], chapters: [] }, exactSourceURLs: [], semanticDecision: { required: chamberMissions[number - 1], plausibleAlternatives: [], changedWordingCheck: { mission: '' } }, normalizedGoal: number === 1 ? { exit: 'next-chamber', cargo: [{ id: 'weighted-cube', pad: 'exit-button' }] } : { exit: 'upper-exit' }, successConditions: [], plannedRealInputSolution: [], he: chamberHebrew[number - 1] };
    return row;
}
