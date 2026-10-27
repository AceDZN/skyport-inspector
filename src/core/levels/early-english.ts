/** Original situated instructions, grounded in selected Workbook material.
 * Source grades/chapters are internal provenance, never a player-facing grade gate.
 * This file describes language only; physical fixtures and circuits remain independent.
 */
export interface EarlyEnglishSource {
    url: string;
    practice: string;
}
export interface EarlyEnglishEntry {
    name: string;
    mission: string;
    he: string;
    chapter: string;
    sources: EarlyEnglishSource[];
    contrast?: {
        mission: string;
        he: string;
        /** Observable change of action/destination, not permission to change the fixture. */
        physicalChange: string;
    };
}
const imperatives = 'https://english.workbook.co.il/grade-7/chapter-11/modals-and-imperatives';
const spatial = 'https://english.workbook.co.il/grade-7/chapter-11/prepositions-time-place';
const instructions = 'https://english.workbook.co.il/grade-7/chapter-12/reading-functional-texts';
const quantities = 'https://english.workbook.co.il/grade-7/chapter-11/countable-uncountable-quantifiers';

export const earlyEnglish: Record<3 | 4 | 5, EarlyEnglishEntry> = {
    3: {
        name: 'Behind the Window',
        mission: 'Put the cube on the button behind the window. Use the north door.',
        he: 'הניחו את הקובייה על הלחצן שמאחורי החלון. צאו דרך הדלת הצפונית.',
        chapter: 'Foundations',
        sources: [
            { url: spatial, practice: 'Read a spatial relationship and a destination from the fixed entrance viewpoint: behind the window, then the north door.' },
            { url: imperatives, practice: 'Apply short base-verb instructions to an object and a place: put the cube; use the door.' },
        ],
        contrast: {
            mission: 'Put the cube on the button in front of the window. Use the south door.',
            he: 'הניחו את הקובייה על הלחצן שלפני החלון. צאו דרך הדלת הדרומית.',
            physicalChange: 'The cube rests on front-button in the west bay instead of behind-button in the east bay. This physically opens south-door for south-exit instead of north-door for north-exit. Keep the same geometry, cube, circuits and available routes.',
        },
    },
    4: {
        name: 'Trade Places',
        mission: 'Stand on the button to open the first door. Bring the cube back. Leave it on the button before you exit.',
        he: 'עמדו על הלחצן כדי לפתוח את הדלת הראשונה. החזירו את הקובייה. השאירו אותה על הלחצן לפני שתצאו.',
        chapter: 'Foundations',
        sources: [
            { url: imperatives, practice: 'Follow a short sequence of concrete instructions: stand, bring, leave. It refers to the cube just named.' },
            { url: instructions, practice: 'Read before as the order needed by the physical process: leave the cube pressing the button before crossing the exit door.' },
        ],
    },
    5: {
        name: 'Two Together',
        mission: 'Put one cube on each button. Leave both cubes there to keep the exit open.',
        he: 'הניחו קובייה אחת על כל לחצן. השאירו את שתי הקוביות שם כדי שהיציאה תישאר פתוחה.',
        chapter: 'Foundations',
        sources: [
            { url: quantities, practice: 'Read one cube and two cubes as countable items; keep the quantity attached to what is being counted.' },
            { url: instructions, practice: 'Apply action, quantity and destination together. One on each and both are original game wording for the two visible buttons and cubes, whose simultaneous pressure keeps the exit open.' },
        ],
    },
};
