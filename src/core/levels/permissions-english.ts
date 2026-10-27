/** Proposed language only. Register no room until its actual fixture and recovery pass play review. */
import type {EarlyEnglishEntry} from './early-english';
export type PermissionLevelNumber = 6 | 7 | 8 | 9 | 10;
const basic = 'https://english.workbook.co.il/grade-7/chapter-11/modals-and-imperatives';
const instruction = 'https://english.workbook.co.il/grade-7/chapter-12/reading-functional-texts';
const permission = 'https://english.workbook.co.il/grade-8/chapter-11/modals-and-meaning';
const obligation = 'https://english.workbook.co.il/grade-8/chapter-11/obligation-advice-and-imperatives';
const optional = 'https://english.workbook.co.il/grade-9/chapter-11/modals-obligation-advice-reference';

export const permissionsEnglish: Record<PermissionLevelNumber, EarlyEnglishEntry> = {
    6: {
        name: 'Keep the Circuit', chapter: 'Operational Choices',
        mission: 'Do not take the cube off the button. Use the north door.',
        he: 'אל תורידו את הקובייה מהלחצן. צאו דרך הדלת הצפונית.',
        sources: [
            {url: basic, practice: 'Read do not as a negative instruction, tied to the real pressure state that keeps the requested door open.'},
            {url: instruction, practice: 'Keep the action, object and named destination together; feedback points to the actual changed door.'},
        ],
        contrast: {
            mission: 'Move the cube to the south button. Use the south door.',
            he: 'העבירו את הקובייה ללחצן הדרומי. צאו דרך הדלת הדרומית.',
            physicalChange: 'Move the same cube from north-button to south-button. The north shutter closes and the south shutter opens, selecting a different real maintenance corridor. Geometry, inventory and both circuits stay fixed.',
        },
    },
    7: {
        name: 'A Bridge at Rest', chapter: 'Operational Choices',
        mission: "You mustn't send the platform east. Cross to the north dock.",
        he: 'אסור לשלוח את המשטח מזרחה. עברו לרציף הצפוני.',
        sources: [
            {url: obligation, practice: "Read mustn't as prohibition, not lack of obligation. The platform's north alignment is a real walkable connection."},
            {url: permission, practice: 'In the changed instruction can grants a control choice; the east destination supplies the reason to move the platform.'},
        ],
        contrast: {
            mission: 'You can send the platform east. Cross to the east dock.',
            he: 'מותר לשלוח את המשטח מזרחה. עברו לרציף המזרחי.',
            physicalChange: 'Select the east stop of the same physical transfer platform instead of retaining its north stop. Its solid deck connects the hub to a different real dock; no usedPlatform flag is a completion requirement.',
        },
    },
    8: {
        name: 'Upper Freight', chapter: 'Operational Choices',
        mission: 'You must take the cube to the upper dock. Leave it on the button.',
        he: 'חייבים להעביר את הקובייה לרציף העליון. השאירו אותה על הלחצן.',
        sources: [
            {url: obligation, practice: 'Read must as a required delivery, with the upper location selecting the physical pressure circuit.'},
            {url: instruction, practice: 'Bring the named object to the stated destination; it in the second instruction refers to that cube.'},
        ],
        contrast: {
            mission: 'You must leave the cube at the lower dock. Put it on the button.',
            he: 'חייבים להשאיר את הקובייה ברציף התחתון. הניחו אותה על הלחצן.',
            physicalChange: 'Use lower-button and the lower freight exit instead of upper-button and the upper exit. The same lift, cube and two independently wired doors remain available. Carrying versus independent portal delivery is not graded.',
        },
    },
    9: {
        name: 'A Choice of Cargo', chapter: 'Operational Choices',
        mission: 'You can use either cube. Open the east exit.',
        he: 'מותר להשתמש בקובייה שתבחרו. פתחו את היציאה המזרחית.',
        sources: [
            {url: permission, practice: 'Read can as permission on an operator notice. Either equivalent cube is allowed, rather than one unstated target identity.'},
            {url: obligation, practice: 'The changed instruction requires both cubes, rather than permission to choose one. Their real button pressures open a different door.'},
        ],
        contrast: {
            mission: 'You must use both cubes. Open the west exit.',
            he: 'חייבים להשתמש בשתי הקוביות. פתחו את היציאה המערבית.',
            physicalChange: 'The east door uses a single real pressure input; either identical cube can hold it. The west door needs two distinct simultaneous button inputs, so retrieve both cubes and use one on each. Either cube assignment is valid; no identity or earlier-touch counter is added.',
        },
    },
    10: {
        name: 'The Optional Ride', chapter: 'Operational Choices',
        mission: "You don't have to ride the lift. Put the cube on the upper button.",
        he: 'לא חייבים לעלות במעלית. הניחו את הקובייה על הלחצן העליון.',
        sources: [
            {url: optional, practice: "Read don't have to as optional, not forbidden: a genuine ramp route and a genuine lift ride must both remain valid."},
            {url: obligation, practice: 'The changed instruction requires parking a real lift deck at a stated dock to connect the side route; this is an observable control state, not a ride-history flag.'},
        ],
        contrast: {
            mission: 'You must park the lift at the upper dock. Use the side exit.',
            he: 'חייבים לעצור את המעלית ברציף העליון. צאו דרך היציאה הצדדית.',
            physicalChange: 'Call the same lift to its upper stop so its deck physically bridges the side gap and enables the dock-alignment door. The upper-button route still exists. Riding is optional even in this contrast; only the actual parked connection and named side destination are required.',
        },
    },
};
