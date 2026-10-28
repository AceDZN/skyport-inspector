/** Original situated conditionals. No mission parser supplies physical state. */
import type{EarlyEnglishEntry}from'./early-english';
const source='https://english.workbook.co.il/grade-9/chapter-11/conditionals-reference';
export const conditionalEnglish:Record<number,EarlyEnglishEntry>={
 41:{
  name:'Together',chapter:'Conditions and Consequences',
  mission:'If POWER and AUX are both pressed, the freight gate opens. Keep both pressed and use that gate.',
  he:'אם POWER ו־AUX לחוצים יחד, שער המטען נפתח. השאירו את שניהם לחוצים והשתמשו בשער הזה.',
  sources:[{url:source,practice:'Read a repeatable zero-conditional law with a genuine current conjunction. Two separately maintained pressure inputs power the freight carrier and gate; a single input cannot replace both. The same fixed hardware also implements SERVICE with POWER absent. Recognition is situated reading and physical planning, not conditional sentence production or whole-unit mastery.'}],
  contrast:{
   mission:'If SERVICE is pressed and POWER is not pressed, the inspection gate opens. Keep that arrangement and use inspection.',
   he:'אם SERVICE לחוץ ו־POWER אינו לחוץ, שער הבדיקה נפתח. שמרו על הסידור הזה והשתמשו במעבר הבדיקה.',
   physicalChange:'Maintain actual SERVICE pressure while actual POWER pressure is absent, opening the separate ground inspection vestibule in the remote bay. The POWER+AUX freight circuit is unchanged and naturally stops without POWER. Either ordinary cargo can supply a physically equivalent arrangement; no cargo identity, earlier press, travelled route or conditional-answer flag is consulted.',
  },
 },
 42:{
  name:'An Arrival to Wait For',chapter:'Conditions and Consequences',
  mission:'If you keep the gallery receiver lit, the lift will reach its upper dock. Wait for it, then use the gallery.',
  he:'אם תשאירו את מקלט הגלריה מואר, המעלית תגיע לתחנה העליונה. חכו לה, ואז השתמשו בגלריה.',
  sources:[{url:source,practice:'Read a first-conditional prediction under maintained current light. Choosing the optical path starts real travel; a selected destination is not an actual arrival. The if-clause uses present simple and the result uses will. Actual stopped support and clearance, rather than a willReach or remembered-arrival flag, permit the named physical route.'}],
  contrast:{mission:'If you keep the service receiver lit, the carrier will reach the service dock. Wait for it, then use service.',he:'אם תשאירו את מקלט השירות מואר, משטח ההעברה יגיע לתחנת השירות. חכו לו, ואז השתמשו במעבר השירות.',physicalChange:'Connect the independent service receiver instead of the gallery receiver. It powers a horizontal carrier and its true service dock, while the gallery lift loses power and pauses at its actual pose. One real emitter and the same two portals, both receivers, both transports, all recovery paths and both destinations remain unchanged. Optical portal colour order is not a goal condition.'},
 },
 43:{
  name:'If the Beam Is Blocked',chapter:'Conditions and Consequences',
  mission:'If the beam is blocked, the archive lift does not move. Clear it and use the lift.',
  he:'אם הקרן חסומה, מעלית הארכיון אינה נעה. פנו את נתיב הקרן והשתמשו במעלית.',
  sources:[{url:source,practice:'Read a repeatable negative result and a separate conjunction: obstruction stops actual light-powered transport, whereas obstruction plus SERVICE pressure enables a different route. Darkness alone never substitutes for the additional current pressure condition. Cargo can be cleared by an equivalent real off-ray or lower-floor placement without any exact-object or move-history gate.'}],
  contrast:{mission:'If the beam is blocked and SERVICE is pressed, the service gate opens. Keep that condition and use service.',he:'אם הקרן חסומה וגם SERVICE לחוץ, שער השירות נפתח. שמרו על התנאי הזה והשתמשו במעבר השירות.',physicalChange:'Put actual cargo on the raised SERVICE plate that crosses the real beam, maintaining both pressure and darkness for the lower route. Clearing it instead powers the archive. Both physical destinations, raised cargo access, safe floor, pressure, beam and lift remain identical. Temporary errors can be corrected; no prohibition-history or conditional-answer flag is checked.'},
 },
 44:{
  name:'If Not Docked, Wait',chapter:'Conditions and Consequences',
  mission:'If both transfer decks are at their departure docks, the freight gate opens. Wait for that opening and cross the freight route. Start the second deck from either bank.',
  he:'אם שני משטחי ההעברה נמצאים בתחנות היציאה שלהם, שער המטען נפתח. חכו לפתיחתו וחצו את מסלול המטען. הפעילו את המשטח השני מאחת הגדות.',
  sources:[{url:source,practice:'Read a current conjunction about two actual stopped dock contacts, rather than two selected targets or earlier arrivals. Independent physical start controls make each missing contact reachable; either bank can start the second deck without a remembered-control condition. The alternate sentence identifies a different current lower-dock boarding operation.'}],
  contrast:{mission:'If the inspection lift is at its lower dock, the boarding door opens. Board it there and use inspection.',he:'אם מעלית הבדיקה נמצאת בתחנה התחתונה, דלת העלייה נפתחת. עלו שם והשתמשו במעבר הבדיקה.',physicalChange:'Use the independent inspection lower-dock boarding door and actual vertical lift/upper vestibule instead of the two-deck freight route. Both transport systems, stopped-contact doors, OR start controls, safe refuge/catch and all geometry remain fixed. No selected-stop, two-arrival count or used-platform flag substitutes for the physical route.'},
 },
 45:{
  name:'Predict, Configure, Transfer',chapter:'Conditions and Consequences',
  mission:'If cargo reaches STORE and the gallery receiver stays lit, the lift will carry you to the archive. Arrange both supplies, then board.',
  he:'אם המטען יגיע אל STORE ומקלט הגלריה יישאר מואר, המעלית תיקח אתכם לארכיון. סדרו את שני מקורות ההפעלה ואז עלו.',
  sources:[{url:source,practice:'Combine a present-form condition and maintained light with an actual later transport prediction. STORE pressure alone and light alone each fail to drive the archive lift. Independent physical ordering and equivalent cargo delivery are valid; no chosen destination, delivery count, used-belt or exact parking identity substitutes for current supplies.'}],
  contrast:{mission:'Retrieve the cargo first. If SERVICE is pressed and the gallery receiver is dark, the inspection hatch opens. Arrange those conditions and use inspection.',he:'הוציאו קודם את המטען. אם SERVICE לחוץ ומקלט הגלריה חשוך, פתח הבדיקה נפתח. סדרו את התנאים האלה והשתמשו במעבר הבדיקה.',physicalChange:'After genuine retrieval, maintain SERVICE pressure and current gallery darkness for a separate ground return, instead of STORE plus light for the archive. The necessary initial light release is permitted; darkness is not an impossible throughout-retrieval prohibition. All cargo, slots, latches, conveyor, portals, recovery and both destinations remain fixed.'},
 },
};
