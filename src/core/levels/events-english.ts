/** Original event/current-state reading. Runtime reports require real observed transitions. */
import type {EarlyEnglishEntry} from './early-english';
const presentPast='https://english.workbook.co.il/grade-7/chapter-10/present-simple-vs-past-simple';
const mixed='https://english.workbook.co.il/grade-8/chapter-10/mixed-tenses-reference';
const perfectPast='https://english.workbook.co.il/grade-9/chapter-10/present-perfect-vs-past-simple-reference';
export const eventsEnglish:Record<26|27|28|29|30,EarlyEnglishEntry>={
 26:{name:'After the Test',chapter:'Events and Current State',
  mission:'Run the test and retrieve the cube. Switch the test off, then use the gate that opened during the test.',
  he:'הפעילו את הבדיקה והוציאו את הקובייה. כבו את הבדיקה, ואז צאו דרך השער שנפתח בזמן הבדיקה.',
  sources:[{url:presentPast,practice:'Identify an actual gate-opening event in the finished TEST interval while both gates are now closed. Past opened does not itself imply later closure; switching TEST off and real circuits cause it.'},{url:mixed,practice:'Keep finished test events separate from current gate/control states. An incomplete observation must not fabricate that another gate remained closed.'}],
  contrast:{mission:'Run the test and retrieve the cube. Switch the test off, then use the gate that remained closed during the test.',he:'הפעילו את הבדיקה והוציאו את הקובייה. כבו את הבדיקה, ואז צאו דרך השער שנשאר סגור בזמן הבדיקה.',physicalChange:'The same test actually opens gate-a while gate-b stays closed. After TEST off, both close; persistent real MANUAL POWER enables independent controls. Select manual-b instead of manual-a and traverse its different actual exit. No usedTest or event-count goal gate.'}},
 27:{name:'Release and Reuse',chapter:'Events and Current State',
  mission:'Release the cargo latch. Move the power cube to LIFT and reach the balcony through the open hatch.',
  he:'שחררו את בריח המטען. העבירו את קוביית החשמל אל LIFT והגיעו למרפסת דרך הפתח הפתוח.',
  sources:[{url:perfectPast,practice:'After a genuine full opening, relate an observed completed event to the independently visible hold-open catch. Perfect tense does not create a mechanical latch; current inspection power is a separate condition.'},{url:mixed,practice:'An earlier inspection opening and a current closed leaf can both be true. Read the maintained condition and current pressure allocation.'}],
  contrast:{mission:'Keep the inspection receiver powered. Leave the cube on POWER and use the inspection passage.',he:'השאירו את מקלט הבדיקה מחובר לחשמל. השאירו את הקובייה על POWER וצאו במעבר הבדיקה.',physicalChange:'Retain actual POWER pressure and optical supply for the continuously powered inspection leaf instead of transferring cargo to LIFT for the balcony. The released hatch has a real latch; no perfect-tense or openedOnce goal variable substitutes for it.'}},
 28:{name:'Freight Returned',chapter:'Events and Current State',
  mission:'Make a delivery, then reverse the belt. Return the cube to the receiver it left on that trip. Keep that receiver pressed and use its transport.',
  he:'השלימו משלוח ואז הפכו את כיוון המסוע. החזירו את הקובייה למשטח הקליטה שממנו יצאה באותו מסע. השאירו אותו לחוץ והשתמשו במנגנון התנועה שלו.',
  sources:[{url:perfectPast,practice:'Distinguish the real receiver departed on the observed reversal from the receiver just reached. A past arrival remains true after departure; current pressed state independently powers transport.'},{url:presentPast,practice:'Return requests a new physical allocation; past tense alone does not imply a reversal or a present empty receiver.'}],
  contrast:{mission:'Make a delivery, then reverse the belt. Leave the cube at the receiver it has just reached. Keep that receiver pressed and use its transport.',he:'השלימו משלוח ואז הפכו את כיוון המסוע. השאירו את הקובייה במשטח הקליטה שאליו הגיעה עכשיו. השאירו אותו לחוץ והשתמשו במנגנון התנועה שלו.',physicalChange:'After the same actual STORE-to-SERVICE trip, retain SERVICE pressure for the vertical inspection lift rather than returning cargo to STORE for the horizontal carrier. Both physical machines/routes and real cover latch remain fixed; no reversedOnce or delivery-count goal.'}},
 29:{name:'The Parked Link',chapter:'Events and Current State',
  mission:'Park the lift at TRANSFER. Cross its deck to the archive.',
  he:'החנו את המעלית בתחנת TRANSFER. חצו על המשטח שלה אל הארכיון.',
  sources:[{url:perfectPast,practice:'A genuinely stopped arrival can have a useful current result. A later departure does not erase the earlier arrival; NOW must show moving/current pose independently.'},{url:mixed,practice:'An old arrival report is not current physical support. Interpret the explicit park/ride destination and actual dock contact.'}],
  contrast:{mission:'Bring the lift to LOADING. Ride it to the inspection balcony.',he:'הביאו את המעלית לתחנת LOADING. עלו עליה אל מרפסת הבדיקה.',physicalChange:'Use the same three-stop deck at INSPECTION rather than the TRANSFER bridge. Stopped pose opens each actual dock leaf; selecting or passing a height cannot do so. A physically equivalent park-without-ride route remains accepted.'}},
 30:{name:'Reconnect the Supply',chapter:'Events and Current State',
  mission:'Connect the gallery receiver. Put the cargo on the gallery button and leave the receiver lit.',
  he:'חברו את מקלט הגלריה. הניחו את המטען על לחצן הגלריה והשאירו את המקלט מואר.',
  sources:[{url:perfectPast,practice:'A truthful power-return report requires an actual observed loss then a current lit transition; otherwise report only current light. Perfect is not an unbroken-history or three-toggle win condition.'},{url:mixed,practice:'Separate a latched access result from the current beam AND cargo pressure needed by gallery transport. Temporary interruption and later restoration remain recoverable.'}],
  contrast:{mission:'Retrieve the cargo, then leave the gallery receiver dark. Put the cargo on SERVICE and use the inspection return.',he:'הוציאו את המטען ואז השאירו את מקלט הגלריה כבוי. הניחו את המטען על SERVICE וצאו בדרך החזרה של הבדיקה.',physicalChange:'After real retrieval, keep the optical route disconnected and cargo on SERVICE for the lower return instead of gallery pressure plus current light for upper transport. The access latch persists physically; equivalent routes without interruption are not rejected.'}},
};
