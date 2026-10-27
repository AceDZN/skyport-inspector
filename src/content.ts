/** Original finite fixtures. Text and expected actions share this authoritative journey model. */
export type Grade = 7 | 8 | 9;
export type Decision = 'board' | 'hold';
export type Gate = '2' | '3' | '4';
export interface Line { id: string; text: string; he?: string }
export interface TravelDocument { id: string; title: string; lines: Line[] }
export interface Journey {
  id: string; date: string; destination: string; time: string; gate: Gate;
  holder: string; status: 'confirmed' | 'cancelled'; checkedIn?: boolean;
}
export interface ScopedUpdate {
  journeyId: string; date: string; destination: string;
  changes: Partial<Pick<Journey, 'time' | 'gate' | 'status' | 'checkedIn'>>;
}
export interface World {
  date: string; passenger: string; journey: Journey; updates: ScopedUpdate[];
  requiresCheckIn?: boolean; unresolved?: 'time' | 'holder' | 'current-status';
}
export interface Case {
  id: string; grade: Grade; stage: 'guided' | 'independent' | 'transfer';
  skin: string; title: string; passenger: string; intro: string; rule: string;
  teaching: string; documents: TravelDocument[];
  question?: { prompt: string; reply: string; lines: Line[];
    choices: { id: string; text: string }[]; correctChoice: string };
  world: World;
  expected: { decision: Decision; gate: Gate; time: string };
  timeOptions: string[]; evidencePairs: string[][]; explanation: string;
  missing?: boolean; sources: string[];
}
export interface Attempt {
  decision: Decision; gate: string; time: string; evidence: string[];
  clarified: boolean;
}
export interface Evaluation {
  correct: boolean; comprehension: boolean; reason: string; needsClarification: boolean;
}
export const grades: Grade[] = [7, 8, 9];
const root = 'https://english.workbook.co.il';
export const sources = {
  g7tense: `${root}/grade-7/chapter-10/mixed-tenses-guide`,
  g7text: `${root}/grade-7/chapter-12/reading-functional-texts`,
  g7support: `${root}/grade-7/chapter-9/tickets-and-character-choices`,
  g8tense: `${root}/grade-8/chapter-10/mixed-tenses-reference`,
  g8reference: `${root}/grade-8/chapter-9/tracking-reference-and-connections`,
  g8text: `${root}/grade-8/chapter-12/reading-practical-texts-and-sources`,
  g9tense: `${root}/grade-9/chapter-10/present-perfect-vs-past-simple-reference`,
  g9report: `${root}/grade-9/chapter-11/reported-speech-reference`,
  g9text: `${root}/grade-9/chapter-12/reading-practical-texts-and-sources-reference`,
};
const line = (id: string, text: string, he: string): Line => ({ id, text, he });
const doc = (id: string, title: string, lines: Line[]): TravelDocument => ({ id, title, lines });
const journey = (id: string, holder: string, destination: string, time: string, gate: Gate, date = '27 October'): Journey =>
  ({ id, holder, destination, time, gate, date, status: 'confirmed' });

/** Apply only updates addressing this same journey, date AND destination. */
export function resolveJourney(world: World): Journey {
  return world.updates.reduce((current, update) =>
    update.journeyId === world.journey.id && update.date === world.journey.date && update.destination === world.journey.destination
      ? { ...current, ...update.changes } : current, { ...world.journey });
}
export function expectedAction(world: World): Case['expected'] {
  const current = resolveJourney(world);
  const eligible = current.date === world.date && current.holder === world.passenger && current.status === 'confirmed'
    && (!world.requiresCheckIn || current.checkedIn === true);
  return { decision: eligible ? 'board' : 'hold', gate: current.gate, time: current.time };
}
function makeCase(input: Omit<Case, 'expected'>): Case { return { ...input, expected: expectedAction(input.world) }; }

export const cases: Case[] = [
  makeCase({
    id: 'g7-1', grade: 7, stage: 'guided', skin: 'ivory-blue', title: 'הנסיעה של היום', passenger: 'Nora Reed',
    intro: 'Nora is taking festival lanterns to Cloud Garden. Inspect her journey for 27 October.',
    rule: 'Board a confirmed ticket only for today, its named holder and the matching journey. Read the date, destination, time and gate together.',
    teaching: 'קראו את שורת הכרטיס ואת השורה המתאימה בלוח. כרטיס לאתמול או למחר אינו כרטיס להיום.',
    documents: [
      doc('ticket', 'BOARDING TICKET', [
        line('g7-1-ticket', 'Nora Reed · Cloud Garden · 27 October · 18:00 · Gate 2', 'נורה ריד · גן העננים · 27 באוקטובר · 18:00 · שער 2'),
        line('g7-1-print', 'One passenger. Keep this ticket until arrival.', 'נוסעת אחת. שמרו את הכרטיס עד ההגעה.'),
      ]),
      doc('list', 'TODAY’S BOARDING LIST', [
        line('g7-1-list', '27 October: Nora Reed is confirmed for Cloud Garden at 18:00, Gate 2.', '27 באוקטובר: ההזמנה של נורה ריד מאושרת לגן העננים ב־18:00, שער 2.'),
        line('g7-1-other', 'Cloud Garden morning service: 09:00, Gate 3.', 'השירות של הבוקר לגן העננים: 09:00, שער 3.'),
      ]),
    ],
    world: { date: '27 October', passenger: 'Nora Reed', journey: journey('CG-18', 'Nora Reed', 'Cloud Garden', '18:00', '2'), updates: [] },
    timeOptions: ['09:00', '18:00', '16:30'], evidencePairs: [['g7-1-ticket', 'g7-1-list']],
    explanation: 'השורות “27 October · 18:00 · Gate 2” ו־“is confirmed” מתייחסות לאותה נסיעה ולאותה נוסעת. שלחו את נורה לשער 2 ב־18:00.',
    sources: [sources.g7text, sources.g7support],
  }),
  makeCase({
    id: 'g7-2', grade: 7, stage: 'independent', skin: 'ivory-blue', title: 'הרגל אינו פרט חסר', passenger: 'Ivo Lane',
    intro: 'Ivo needs the correct queue for today. His ticket has a smudged departure time.',
    rule: 'A usual trip or yesterday’s trip does not settle today’s missing departure. Ask for the missing detail before stamping.',
    teaching: 'usually מתאר הרגל; travelled yesterday מתאר נסיעה שהסתיימה. אם השעה להיום חסרה, שאלו עליה.',
    documents: [
      doc('ticket', 'BOARDING TICKET', [
        line('g7-2-ticket', 'Ivo Lane · Cloud Garden · 27 October · departure time unreadable.', 'איבו ליין · גן העננים · 27 באוקטובר · שעת היציאה אינה קריאה.'),
        line('g7-2-confirmed', 'Booking confirmed. Use the gate assigned to your departure.', 'ההזמנה מאושרת. השתמשו בשער המתאים לשעת היציאה.'),
      ]),
      doc('account', 'TRAVELER’S NOTE', [
        line('g7-2-habit', 'I usually take the 09:00 airship. I travelled at 16:30 yesterday.', 'אני בדרך כלל נוסע בספינת האוויר של 09:00. אתמול נסעתי ב־16:30.'),
        line('g7-2-current', 'Today I am travelling to Cloud Garden. Tomorrow I am going to visit Harbor Lights.', 'היום אני נוסע לגן העננים. מחר אני מתכנן לבקר באורות הנמל.'),
        line('g7-2-schedule', 'Today’s departures: 09:00 — Gate 2; 18:00 — Gate 3.', 'היציאות להיום: 09:00 — שער 2; 18:00 — שער 3.'),
      ]),
    ],
    question: { prompt: 'What time are you travelling to Cloud Garden today?',
      reply: 'I am travelling at 18:00 today. My booking is for the evening departure.',
      lines: [line('g7-2-answer', 'I am travelling at 18:00 today. My booking is for the evening departure.', 'אני נוסע היום ב־18:00. ההזמנה שלי היא ליציאה של הערב.')],
      choices: [{ id: 'yesterday', text: 'Where did you go yesterday?' }, { id: 'today', text: 'What time are you travelling today?' }, { id: 'habit', text: 'Do you usually travel in the morning?' }], correctChoice: 'today' },
    world: { date: '27 October', passenger: 'Ivo Lane', journey: journey('CG-18', 'Ivo Lane', 'Cloud Garden', '18:00', '3'), updates: [], unresolved: 'time' },
    missing: true, timeOptions: ['09:00', '16:30', '18:00'], evidencePairs: [['g7-2-answer', 'g7-2-schedule']],
    explanation: '“I am travelling at 18:00 today” נותן את הפרט החסר. בלוח 18:00 שייך לשער 3. ההרגל בבוקר והנסיעה אתמול אינם קובעים את הנסיעה להיום.',
    sources: [sources.g7tense, sources.g7text],
  }),
  makeCase({
    id: 'g7-3', grade: 7, stage: 'transfer', skin: 'return-ivory', title: 'נסיעה חזרה מהאי', passenger: 'Mina Vale',
    intro: 'You are now at Lantern Island’s return booth. Inspect the return journey to Skyport for today, 27 October.',
    rule: 'Return tickets must match today’s date and the direction shown in the return timetable. A plan for tomorrow is not today’s booking.',
    teaching: 'בדקו מחדש את כיוון הנסיעה ואת התאריך. כאן יוצאים מהאי וחוזרים לנמל השמיים.',
    documents: [
      doc('ticket', 'RETURN TICKET', [
        line('g7-3-ticket', 'Mina Vale · Lantern Island → Skyport · 28 October · 16:30 · Gate 4.', 'מינה וייל · מאי הפנסים לנמל השמיים · 28 באוקטובר · 16:30 · שער 4.'),
        line('g7-3-plan', 'I arrived on the island yesterday. Tomorrow I am going to return to Skyport.', 'הגעתי לאי אתמול. מחר אני מתכננת לחזור לנמל השמיים.'),
      ]),
      doc('timetable', 'RETURN TIMETABLE', [
        line('g7-3-today', 'Today is 27 October. Lantern Island → Skyport: 16:30, Gate 4.', 'היום 27 באוקטובר. מאי הפנסים לנמל השמיים: 16:30, שער 4.'),
        line('g7-3-rule', 'A ticket is valid only on its printed date. Mina’s 28 October booking is confirmed.', 'הכרטיס תקף רק בתאריך המודפס. ההזמנה של מינה ל־28 באוקטובר מאושרת.'),
      ]),
    ],
    world: { date: '27 October', passenger: 'Mina Vale', journey: journey('RETURN-16', 'Mina Vale', 'Skyport', '16:30', '4', '28 October'), updates: [] },
    timeOptions: ['18:00', '16:30', '09:00'], evidencePairs: [['g7-3-ticket', 'g7-3-today']],
    explanation: '“28 October” ו־“Tomorrow” מתייחסים למחר. היום הוא 27 באוקטובר. השעה והשער מתאימים למסלול, אבל התאריך אינו מתאים: יש לעכב ולשלוח לדלפק שינוי הכרטיס.',
    sources: [sources.g7tense, sources.g7text],
  }),
  makeCase({
    id: 'g8-1', grade: 8, stage: 'guided', skin: 'ivory-blue', title: 'מי נוסעת היום?', passenger: 'Lena Frost',
    intro: 'Lena (she/her) is at the desk. Arun (he/him) left a case with her yesterday. Inspect Lena’s current journey.',
    rule: 'Identify the current traveler and booking holder. Carrying another person’s luggage does not transfer their booking.',
    teaching: 'קראו את מסגרת הזמן של כל פעולה. she חוזר ללנה; he חוזר לארון. מזוודה אינה כרטיס.',
    documents: [
      doc('ticket', 'BOARDING TICKET', [
        line('g8-1-ticket', 'Lena Frost · Cloud Garden · 27 October · 18:00 · Gate 2 · CONFIRMED.', 'לנה פרוסט · גן העננים · 27 באוקטובר · 18:00 · שער 2 · מאושר.'),
        line('g8-1-luggage', 'Luggage label: Arun Moss. This label does not identify the ticket holder.', 'תווית מזוודה: ארון מוס. התווית אינה מזהה את בעל הכרטיס.'),
      ]),
      doc('account', 'DESK ACCOUNT', [
        line('g8-1-past', 'Yesterday, Lena was carrying Arun’s case while he left the hall.', 'אתמול לנה נשאה את המזוודה של ארון בזמן שהוא יצא מהאולם.'),
        line('g8-1-current', 'Today she is travelling to Cloud Garden at 18:00. Arun is going to travel tomorrow.', 'היום היא נוסעת לגן העננים ב־18:00. ארון מתכנן לנסוע מחר.'),
        line('g8-1-list', 'Current boarding list: Lena Frost, 27 October, confirmed. Her gate is 2.', 'רשימת העלייה הנוכחית: לנה פרוסט, 27 באוקטובר, מאושר. השער שלה הוא 2.'),
      ]),
    ],
    world: { date: '27 October', passenger: 'Lena Frost', journey: journey('CG-18', 'Lena Frost', 'Cloud Garden', '18:00', '2'), updates: [] },
    timeOptions: ['09:00', '18:00', '19:00'], evidencePairs: [['g8-1-ticket', 'g8-1-current'], ['g8-1-current', 'g8-1-list']],
    explanation: '“Today she is travelling” מתייחס ללנה, בניגוד לתיאור המזוודה אתמול ולתוכנית של ארון למחר. הכרטיס והרשימה מאשרים את הנסיעה שלה היום ב־18:00, שער 2.',
    sources: [sources.g8tense, sources.g8reference, sources.g8text],
  }),
  makeCase({
    id: 'g8-2', grade: 8, stage: 'independent', skin: 'ivory-blue', title: 'עדכון מוגבל', passenger: 'Nora Reed',
    intro: 'Nora’s original ticket is correct except for any change made by the operations notice. Route this exact journey.',
    rule: 'An update changes only its named journey/date and fields. Preserve every unchanged detail. “It” refers to the named trip.',
    teaching: 'בדקו לאיזו נסיעה it מתייחס. עדכון שער אינו משנה אוטומטית את השעה.',
    documents: [
      doc('ticket', 'ORIGINAL TICKET', [
        line('g8-2-ticket', 'Nora Reed · Cloud Garden · 27 October · 18:00 · Gate 2 · CONFIRMED.', 'נורה ריד · גן העננים · 27 באוקטובר · 18:00 · שער 2 · מאושר.'),
        line('g8-2-other', 'Harbor Lights departs at 19:00 from Gate 4.', 'אורות הנמל יוצא ב־19:00 משער 4.'),
      ]),
      doc('notice', 'OPERATIONS UPDATE · 27 OCT', [
        line('g8-2-update', 'For the 18:00 Cloud Garden trip today, use Gate 3. Its departure time is unchanged.', 'לנסיעת 18:00 לגן העננים היום, השתמשו בשער 3. שעת היציאה שלה אינה משתנה.'),
        line('g8-2-reference', 'Nora is booked on that trip. She should use its updated gate.', 'נורה מוזמנת לנסיעה הזאת. עליה להשתמש בשער המעודכן שלה.'),
      ]),
    ],
    world: { date: '27 October', passenger: 'Nora Reed', journey: journey('CG-18', 'Nora Reed', 'Cloud Garden', '18:00', '2'), updates: [{ journeyId: 'CG-18', date: '27 October', destination: 'Cloud Garden', changes: { gate: '3' } }] },
    timeOptions: ['19:00', '18:00', '09:00'], evidencePairs: [['g8-2-ticket', 'g8-2-update']],
    explanation: '“today” מחיל את העדכון על 27 באוקטובר; “Gate 3” משנה את השער. “departure time is unchanged” שומר על 18:00 מהכרטיס. הזמן של Harbor Lights אינו שייך לנסיעה הזאת.',
    sources: [sources.g8reference, sources.g8text],
  }),
  makeCase({
    id: 'g8-3', grade: 8, stage: 'transfer', skin: 'return-ivory', title: 'אותו שער, שעה חדשה', passenger: 'Oren Pike',
    intro: 'At the festival’s temporary booth, Oren needs the Harbor Lights departure. Apply the message to the correct row.',
    rule: 'Combine the original timetable with the scoped update. Changed time does not change gate or destination.',
    teaching: 'זהו מסלול חדש. קראו את הפרטים שנשארו בתוקף בנוסף לפרט שהשתנה.',
    documents: [
      doc('ticket', 'FESTIVAL TICKET', [
        line('g8-3-ticket', 'Oren Pike · Harbor Lights · 27 October · 17:00 · Gate 4 · CONFIRMED.', 'אורן פייק · אורות הנמל · 27 באוקטובר · 17:00 · שער 4 · מאושר.'),
        line('g8-3-other', 'Cloud Garden · 27 October · 18:00 · Gate 3.', 'גן העננים · 27 באוקטובר · 18:00 · שער 3.'),
      ]),
      doc('notice', 'MESSAGE FROM OPERATIONS', [
        line('g8-3-update', 'Today’s Harbor Lights trip now leaves at 19:00. Its gate and destination stay the same.', 'הנסיעה של היום לאורות הנמל יוצאת עכשיו ב־19:00. השער והיעד שלה נשארים כפי שהיו.'),
        line('g8-3-tomorrow', 'Tomorrow’s Cloud Garden trip will leave at 17:00 from Gate 2.', 'הנסיעה של מחר לגן העננים תצא ב־17:00 משער 2.'),
      ]),
    ],
    world: { date: '27 October', passenger: 'Oren Pike', journey: journey('HL-17', 'Oren Pike', 'Harbor Lights', '17:00', '4'), updates: [{ journeyId: 'HL-17', date: '27 October', destination: 'Harbor Lights', changes: { time: '19:00' } }, { journeyId: 'CG-18', date: '28 October', destination: 'Cloud Garden', changes: { time: '17:00', gate: '2' } }] },
    timeOptions: ['17:00', '18:00', '19:00'], evidencePairs: [['g8-3-ticket', 'g8-3-update']],
    explanation: '“now leaves at 19:00” משנה רק את שעת Harbor Lights להיום. “gate and destination stay the same” משאיר את שער 4 ואת היעד מהכרטיס. ההודעה על מחר שייכת לנסיעה אחרת.',
    sources: [sources.g8tense, sources.g8reference, sources.g8text],
  }),
  makeCase({
    id: 'g9-1', grade: 9, stage: 'guided', skin: 'ivory-blue', title: 'אירוע עבר ומצב נוכחי', passenger: 'Tomas Wren',
    intro: 'This booth requires a current READY record for the exact journey. Tomas brings a past visit record and a current check-in note.',
    rule: 'Board only a confirmed ticket with current status READY for this date and journey. A tense form alone never proves ticket validity.',
    teaching: 'עבר פשוט ממקם אירוע שהסתיים; הווה מושלם יכול לקשר לעכשיו. ההחלטה כאן נשענת על רשומת READY המפורשת של הנסיעה הנכונה.',
    documents: [
      doc('ticket', 'BOARDING TICKET', [
        line('g9-1-ticket', 'Tomas Wren · Cloud Garden · 27 October · 18:00 · Gate 2 · CONFIRMED.', 'תומס רן · גן העננים · 27 באוקטובר · 18:00 · שער 2 · מאושר.'),
        line('g9-1-past', 'Tomas checked in for the island tour on 26 October. That trip ended yesterday.', 'תומס ביצע צ׳ק־אין לסיור באי ב־26 באוקטובר. הנסיעה הזאת הסתיימה אתמול.'),
      ]),
      doc('record', 'CURRENT CHECK-IN RECORD', [
        line('g9-1-current', 'Tomas has checked in for the 27 October, 18:00 Cloud Garden trip. CURRENT STATUS: READY.', 'תומס ביצע צ׳ק־אין לנסיעת גן העננים של 27 באוקטובר ב־18:00. המצב הנוכחי: מוכן.'),
        line('g9-1-scope', 'This record applies only to the named journey. Past visits do not replace a current record.', 'הרשומה חלה רק על הנסיעה המצוינת. ביקורי עבר אינם מחליפים רשומה נוכחית.'),
      ]),
    ],
    world: { date: '27 October', passenger: 'Tomas Wren', journey: { ...journey('CG-18', 'Tomas Wren', 'Cloud Garden', '18:00', '2'), checkedIn: true }, updates: [], requiresCheckIn: true },
    timeOptions: ['18:00', '09:00', '19:00'], evidencePairs: [['g9-1-ticket', 'g9-1-current']],
    explanation: '“checked in ... 26 October” הוא אירוע של הנסיעה הקודמת. הרשומה “has checked in ... 27 October” יחד עם “CURRENT STATUS: READY” מוכיחה את המצב הדרוש עכשיו. אין החלטה אוטומטית רק בגלל have/has.',
    sources: [sources.g9tense, sources.g9text],
  }),
  makeCase({
    id: 'g9-2', grade: 9, stage: 'independent', skin: 'ivory-blue', title: 'של מי הביטול?', passenger: 'Mina Vale',
    intro: 'Mina is at the desk. Clerk Eren recorded a message today, 27 October, at 15:00. The report concerns a specific holder and date.',
    rule: 'Operations accepts signed cancellation reports. A report changes only the named holder’s booking on its stated date. Keep speaker and addressee distinct.',
    teaching: 'בדיבור עקיף she ו־her מתאימים לדוברת המקורית. told Eren מציין את מקבל ההודעה, לא את בעלת הכרטיס.',
    documents: [
      doc('ticket', 'ORIGINAL BOOKING', [
        line('g9-2-ticket', 'Mina Vale · Cloud Garden · 27 October · 18:00 · Gate 2. Originally confirmed at 09:00.', 'מינה וייל · גן העננים · 27 באוקטובר · 18:00 · שער 2. אושר במקור בשעה 09:00.'),
        line('g9-2-other', 'Eren Hale also has a separate Cloud Garden booking for 28 October.', 'לארן הייל יש הזמנה נפרדת לגן העננים ל־28 באוקטובר.'),
      ]),
      doc('report', 'SIGNED REPORT · EREN · 27 OCT', [
        line('g9-2-report', 'Mina told Eren that she cancelled her Cloud Garden booking for 27 October. Reported today at 15:00.', 'מינה אמרה לארן שהיא ביטלה את ההזמנה שלה לגן העננים ל־27 באוקטובר. דווח היום ב־15:00.'),
        line('g9-2-request', 'The supervisor told the inspector to apply this cancellation only to Mina’s 27 October booking.', 'הממונה הורה לבודק להחיל את הביטול רק על ההזמנה של מינה ל־27 באוקטובר.'),
      ]),
    ],
    world: { date: '27 October', passenger: 'Mina Vale', journey: journey('CG-18-MINA', 'Mina Vale', 'Cloud Garden', '18:00', '2'), updates: [{ journeyId: 'CG-18-MINA', date: '27 October', destination: 'Cloud Garden', changes: { status: 'cancelled' } }] },
    timeOptions: ['18:00', '09:00', '19:00'], evidencePairs: [['g9-2-ticket', 'g9-2-report'], ['g9-2-ticket', 'g9-2-request']],
    explanation: 'ב־“Mina told Eren that she cancelled her ... 27 October” הדוברת ובעלת ההזמנה היא מינה; ארן הוא מקבל ההודעה. הביטול של היום חל על הכרטיס הזה, ולכן יש לעכב ולתקן בדלפק ההזמנות.',
    sources: [sources.g9report, sources.g9text],
  }),
  makeCase({
    id: 'g9-3', grade: 9, stage: 'transfer', skin: 'return-ivory', title: 'שני מקורות והגבול שלהם', passenger: 'Sora Reed',
    intro: 'A festival flyer and an operations notice disagree. Route Sora’s exact journey, then support the decision with two source phrases.',
    rule: 'Use the current operations notice for its stated journey. Preserve unchanged ticket fields. A previous season’s general flyer cannot settle today’s gate.',
    teaching: 'בחרו שתי ראיות שמרכיבות נימוק מוגבל למקורות. זאת הרכבת נימוק, לא כתיבה חופשית.',
    documents: [
      doc('ticket', 'CURRENT BOOKING · 27 OCT', [
        line('g9-3-ticket', 'Sora Reed · Harbor Lights · 27 October · 17:00 · Gate 4 · CONFIRMED.', 'סורה ריד · אורות הנמל · 27 באוקטובר · 17:00 · שער 4 · מאושר.'),
        line('g9-3-status', 'Sora has checked in for this journey. CURRENT STATUS: READY.', 'סורה ביצעה צ׳ק־אין לנסיעה הזאת. המצב הנוכחי: מוכן.'),
      ]),
      doc('notice', 'OPERATIONS · 27 OCTOBER', [
        line('g9-3-update', 'For today’s Harbor Lights journey, departure is now 19:00. The destination and Gate 4 are unchanged.', 'לנסיעת אורות הנמל של היום, היציאה כעת ב־19:00. היעד ושער 4 אינם משתנים.'),
        line('g9-3-authority', 'Operations notice for 27 October. All other current booking conditions remain in force.', 'הודעת תפעול ל־27 באוקטובר. שאר תנאי ההזמנה הנוכחיים נשארים בתוקף.'),
      ]),
      doc('flyer', 'FESTIVAL FLYER · LAST SEASON', [
        line('g9-3-old', 'October 2025 festival: evening airships use Gate 2. Times may change each season.', 'פסטיבל אוקטובר 2025: ספינות הערב משתמשות בשער 2. הזמנים עשויים להשתנות מעונה לעונה.'),
        line('g9-3-not-a-record', 'Visitor information only. This flyer is not a current boarding record.', 'מידע למבקרים בלבד. העלון אינו רשומת עלייה נוכחית.'),
      ]),
    ],
    world: { date: '27 October', passenger: 'Sora Reed', journey: { ...journey('HL-17', 'Sora Reed', 'Harbor Lights', '17:00', '4'), checkedIn: true }, updates: [{ journeyId: 'HL-17', date: '27 October', destination: 'Harbor Lights', changes: { time: '19:00' } }], requiresCheckIn: true },
    timeOptions: ['17:00', '19:00', '18:00'], evidencePairs: [['g9-3-ticket', 'g9-3-update']],
    explanation: 'הכרטיס הנוכחי מזהה את סורה, היעד והשער. “departure is now 19:00” משנה את השעה, ו־“Gate 4 ... unchanged” משאיר את השער. העלון מ־2025 אינו הוכחה לשער בעונה הנוכחית. הנימוק מורכב מציטוטי הכרטיס והעדכון.',
    sources: [sources.g9tense, sources.g9text],
  }),
];

/** Paired replay fixtures retain visual skins and document positions, while the words change the valid action. */
function paired(baseId: string, id: string, patch: Partial<Case>, replace: Record<string, Line>): Case {
  const base = cases.find(item => item.id === baseId)!;
  const next = { ...base, ...patch, id, documents: base.documents.map(document => ({ ...document, lines: document.lines.map(item => replace[item.id] || item) })) };
  return { ...next, expected: expectedAction(next.world) };
}
export const pairedCases: Case[] = [
  paired('g7-3', 'g7-3-pair', {
    world: { date: '27 October', passenger: 'Mina Vale', journey: journey('RETURN-16', 'Mina Vale', 'Skyport', '16:30', '4'), updates: [] },
    explanation: 'כאן הכרטיס אומר “27 October” והנוסעת אומרת “Today”. בניגוד לגרסה המקבילה, התאריך מתאים להיום. אפשר לעלות בשער 4 ב־16:30.',
  }, {
    'g7-3-ticket': line('g7-3-ticket', 'Mina Vale · Lantern Island → Skyport · 27 October · 16:30 · Gate 4.', 'מינה וייל · מאי הפנסים לנמל השמיים · 27 באוקטובר · 16:30 · שער 4.'),
    'g7-3-plan': line('g7-3-plan', 'I arrived on the island yesterday. Today I am returning to Skyport.', 'הגעתי לאי אתמול. היום אני חוזרת לנמל השמיים.'),
    'g7-3-rule': line('g7-3-rule', 'A ticket is valid only on its printed date. Mina’s 27 October booking is confirmed.', 'הכרטיס תקף רק בתאריך המודפס. ההזמנה של מינה ל־27 באוקטובר מאושרת.'),
  }),
  paired('g8-2', 'g8-2-pair', {
    world: { date: '27 October', passenger: 'Nora Reed', journey: journey('CG-18', 'Nora Reed', 'Cloud Garden', '18:00', '2'), updates: [{ journeyId: 'CG-18', date: '28 October', destination: 'Cloud Garden', changes: { gate: '3' } }] },
    explanation: 'כאן “tomorrow” מגביל את העדכון ל־28 באוקטובר. הכרטיס של נורה הוא להיום, 27 באוקטובר, ולכן שער 2 ושעת 18:00 נשארים בתוקף.',
  }, {
    'g8-2-update': line('g8-2-update', 'For the 18:00 Cloud Garden trip tomorrow, use Gate 3. Its departure time is unchanged.', 'לנסיעת 18:00 לגן העננים מחר, השתמשו בשער 3. שעת היציאה שלה אינה משתנה.'),
    'g8-2-reference': line('g8-2-reference', 'Nora is booked for today, not that trip. She should use today’s original gate.', 'נורה מוזמנת להיום, לא לנסיעה הזאת. עליה להשתמש בשער המקורי של היום.'),
  }),
  paired('g9-1', 'g9-1-pair', {
    world: { date: '27 October', passenger: 'Tomas Wren', journey: { ...journey('CG-18', 'Tomas Wren', 'Cloud Garden', '18:00', '2'), checkedIn: false }, updates: [], requiresCheckIn: true },
    explanation: 'כאן הרשומה הנוכחית אומרת “has not checked in” ו־“NOT READY”. הצ׳ק־אין של אתמול אינו חל על נסיעת היום. יש לעכב לצורך צ׳ק־אין, גם אם הכרטיס מאושר.',
  }, {
    'g9-1-current': line('g9-1-current', 'Tomas has not checked in for the 27 October, 18:00 Cloud Garden trip. CURRENT STATUS: NOT READY.', 'תומס לא ביצע צ׳ק־אין לנסיעת גן העננים של 27 באוקטובר ב־18:00. המצב הנוכחי: לא מוכן.'),
  }),
];
export const allCases = [...cases, ...pairedCases];

/** Decision can succeed without comprehension credit; unknown facts can never be guessed into a valid decision. */
export function evaluate(item: Case, attempt: Attempt): Evaluation {
  if ((item.missing || item.world.unresolved) && !attempt.clarified) return {
    correct: false, comprehension: false, needsClarification: true,
    reason: 'חסר פרט להחלטה. שאלו את השאלה שמתייחסת לנסיעה הנבדקת לפני החותמת. הרגל או אירוע עבר אינם ממלאים את החסר.',
  };
  const expected = expectedAction(item.world);
  const correct = attempt.decision === expected.decision && (attempt.decision === 'hold'
    || (attempt.gate === expected.gate && attempt.time === expected.time));
  const available = new Set(item.documents.flatMap(document => document.lines.map(phrase => phrase.id)));
  if (attempt.clarified) item.question?.lines.forEach(phrase => available.add(phrase.id));
  const selected = [...new Set(attempt.evidence)];
  const supported = selected.length === 2 && selected.every(id => available.has(id))
    && item.evidencePairs.some(pair => pair.length === 2 && pair.every(id => selected.includes(id)));
  return { correct, comprehension: correct && supported, needsClarification: false,
    reason: correct ? supported ? item.explanation : 'הפעולה מתאימה, אך שתי הראיות שנבחרו אינן מנמקות אותה. אפשר להמשיך; הבנת הכלל עדיין לא הודגמה.' : item.explanation };
}
