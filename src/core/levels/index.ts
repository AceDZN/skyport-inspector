import {chamberBlueprint,chamberTitles,chamberMissions,chamberHebrew} from '../chambers';
import type {CoreLevel} from '../level';
import {earlyLevels,draftEarlyLevels} from './early';
import {draftPermissionLevels} from './permissions';
import {draftOpticalLevels} from './optics';
import {draftSequenceLevels} from './sequences';
import {draftComparisonLevels} from './comparisons';
import {draftReferenceLevels} from './references';
import {draftEventLevels} from './events';
import {draftPassiveLevels} from './passive';
/** Explicit authored fixtures only. Normal-play evidence is tracked separately from registration. */
export const coreLevels:CoreLevel[]=[...[1,2].map(number=>({number,name:chamberTitles[number-1],mission:chamberMissions[number-1],he:chamberHebrew[number-1],chapter:'Foundations',architecture:{height:number===1?7:11,halfWidth:number===1?8:9,style:number===1?'ceramic' as const:'graphite' as const},blueprint:()=>chamberBlueprint(number as 1|2),sources:[]})),...earlyLevels,...draftEarlyLevels,...draftPermissionLevels,...draftOpticalLevels,...draftSequenceLevels,...draftComparisonLevels,...draftReferenceLevels,...draftEventLevels,...draftPassiveLevels];
export function getCoreLevel(number:number){const level=coreLevels.find(l=>l.number===number);if(!level)throw Error('Chamber '+number+' is not authored and registered');return level;}
