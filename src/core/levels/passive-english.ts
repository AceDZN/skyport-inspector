/** Original passive-role reading. Physical fixtures never depend on wording. */
import type {EarlyEnglishEntry} from './early-english';
const passive='https://english.workbook.co.il/grade-9/chapter-10/present-simple-passive-reference';
const relative='https://english.workbook.co.il/grade-8/chapter-11/relative-clauses-reference';
export const passiveEnglish:Record<number,EarlyEnglishEntry>={
 31:{
  name:'Which Supply?',chapter:'Causes and Affected Objects',
  mission:'Use the hatch that is opened by the floor button. Keep the button pressed.',
  he:'השתמשו בפתח שנפתח על ידי הלחצן ברצפה. השאירו את הלחצן לחוץ.',
  sources:[
   {url:passive,practice:'Identify the affected hatch and its actual pressure source after by. The other hatch is independently opened by receiver light. Active/passive equivalents preserve the relationship; changing the named source changes the physical route.'},
   {url:relative,practice:'Read the entire identifying clause next to hatch, selecting between two real independently supplied openings. This is finite situated reading, not clause production or whole-unit mastery.'},
  ],
  contrast:{
   mission:'Use the hatch that is opened by the light receiver. Keep the receiver lit.',
   he:'השתמשו בפתח שנפתח על ידי מקלט האור. השאירו את המקלט מואר.',
   physicalChange:'Configure the real beam to the light receiver, opening its pedestrian hatch and powering the gallery lift/upper door. The pressure-controlled storage hatch remains a separate genuine route. Both circuits, the ordinary cargo and all geometry remain unchanged; no identity or history condition gates either outcome.',
  },
 },
 32:{
  name:'Carried or Powered?',chapter:'Causes and Affected Objects',
  mission:'One cube is carried by the platform. Put that cube on RELEASE and keep POWER pressed.',
  he:'קובייה אחת נישאת על ידי המשטח. הניחו אותה על RELEASE והשאירו את POWER לחוץ.',
  sources:[{url:passive,practice:'Distinguish cargo affected by carriage from the source supplying the carrier. Actual loose cargo travels on the powered deck; maintained POWER plus RELEASE enables the upper freight route. Cargo IDs and original provenance are not win conditions.'}],
  contrast:{mission:'The platform is powered by the cube on POWER. Move that cube to SERVICE and use the lower door.',he:'המשטח מופעל על ידי הקובייה שעל POWER. העבירו אותה אל SERVICE והשתמשו בדלת התחתונה.',physicalChange:'Remove actual POWER pressure, braking the real freight carrier, and maintain SERVICE pressure to open the lower route. All cargo, geometry and circuits stay fixed. Either physically equivalent allocation is accepted without exact-cargo or untouched-history checks.'},
 },
 33:{
  name:'What Is Blocked?',chapter:'Causes and Affected Objects',
  mission:'The beam is blocked by the cube. Clear the beam and use the powered lift.',
  he:'הקרן נחסמת על ידי הקובייה. פנו את נתיב הקרן והשתמשו במעלית שמקבלת מתח.',
  sources:[{url:passive,practice:'Read two simultaneous true causal relations: the beam is blocked by cargo, while cargo access is blocked by an opaque hatch. Distinguish the affected subject from the actual obstacle after by. Real access, light and pressure determine the route; no blocked-state label or identity checker substitutes for them.'}],
  contrast:{mission:'The cube is blocked by the hatch. Open the hatch and take the cube to SERVICE.',he:'הקובייה חסומה על ידי הפתח הסגור. פתחו את הפתח והעבירו את הקובייה אל SERVICE.',physicalChange:'Open actual opaque access and deliver ordinary cargo to the live SERVICE plate, opening the lower passage. Clearing the same cube also lights the independent lift receiver, so extra light is allowed; the requested delivered route is genuinely different. Geometry, cargo, switch, optics and both outcomes remain fixed.'},
 },
 34:{
  name:'Timer or Test?',chapter:'Causes and Affected Objects',
  mission:'The inspection shutters are opened by the timer. Wait for a clear passage and cross.',
  he:'תריסי הבדיקה נפתחים על ידי הטיימר. חכו למעבר פנוי וחצו.',
  sources:[{url:passive,practice:'Read plural affected shutters and their actual repeatable timer source. Contrast that maintained process with a singular hatch released by TEST and physically held open by a latch. Persistence comes from the catch, not passive wording or a remembered action count.'}],
  contrast:{mission:'The cargo hatch is released by TEST. Release it, switch TEST off and use its latched route.',he:'פתח המטען משוחרר על ידי TEST. שחררו אותו, כבו את TEST והשתמשו במעבר שנשאר פתוח באמצעות הנעילה.',physicalChange:'Cause actual hatch release, then remove current TEST power so the real freight carrier interlock permits travel. The hatch stays open through its mechanical latch. Use the different freight dock route instead of the two timed inspection leaves; all hardware and circuits are identical.'},
 },
 35:{
  name:'The Supply Loop',chapter:'Causes and Affected Objects',
  mission:'The lift is powered by the receiver, and ACCESS is opened by cargo pressure. Keep both supplies active and reach the control gallery.',
  he:'המעלית מופעלת על ידי המקלט, ו־ACCESS נפתח על ידי לחץ של מטען. השאירו את שני מקורות ההפעלה פעילים והגיעו לגלריית הבקרה.',
  sources:[{url:passive,practice:'Combine two actual affected-object/source relationships across separate rooms: receiver light and cargo pressure. Removing a real beam obstruction lights the receiver; maintained ACCESS pressure admits the player and permits upper transport. A current physical conjunction, rather than cube identity or a remembered action, sustains the route.'}],
  contrast:{mission:'SERVICE is opened by the floor button, and the lift is stopped by loss of light. Keep the receiver dark and use SERVICE.',he:'SERVICE נפתח על ידי הלחצן ברצפה, והמעלית נעצרת עקב אובדן האור. השאירו את המקלט חשוך והשתמשו ב־SERVICE.',physicalChange:'Maintain the lower SERVICE pressure plate while actual receiver light is absent, opening a different ground passage. The initial cargo really interrupts the beam, and either ordinary cube may supply an equivalent current pressure configuration. Both bodies, optical slots, walking portals, lift, returns and circuits remain identical; no earlier darkness or use count is checked.'},
 },
};
