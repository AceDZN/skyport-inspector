/** Original situated language, not whole-chapter coverage. Drafts remain unregistered. */
import type {EarlyEnglishEntry} from './early-english';
const comparison='https://english.workbook.co.il/grade-8/chapter-11/adjectives-and-comparison';
const relative='https://english.workbook.co.il/grade-8/chapter-11/relative-clauses-reference';
const passive='https://english.workbook.co.il/grade-9/chapter-10/present-simple-passive-reference';
export const comparisonsEnglish:Record<16|17|18|19|20,EarlyEnglishEntry>={
 16:{name:'Two Depths',chapter:'Physical Comparisons',
  mission:'Use the deeper shaft to reach the higher gallery.',
  he:'השתמשו בפיר העמוק יותר כדי להגיע לגלריה הגבוהה יותר.',
  sources:[{url:comparison,practice:'Read deeper and higher as comparisons within the two visible shafts and galleries. Actual fall energy and landing geometry must establish both relations; no remembered shaft-use flag.'}],
  contrast:{mission:'Use the shallower shaft to reach the lower gallery.',he:'השתמשו בפיר הרדוד יותר כדי להגיע לגלריה הנמוכה יותר.',physicalChange:'The shallow floor portal provides a lower-energy route to the real lower landing. Both shafts, both exits and all collision geometry remain fixed; a physically valid equivalent route is not rejected by a shaft-history flag.'}},
 17:{name:'Beyond the Near Landing',chapter:'Physical Comparisons',
  mission:'Reach the farther gallery. It is wider than the nearer one.',
  he:'הגיעו לגלריה הרחוקה יותר. היא רחבה יותר מהגלריה הקרובה.',
  sources:[{url:comparison,practice:'Combine distance and width comparisons: farther identifies the requested landing, wider confirms its actual width, and one refers to the other gallery. Equal floor height does not make the destinations identical.'}],
  contrast:{mission:'Reach the nearer gallery. It is narrower than the farther one.',he:'הגיעו לגלריה הקרובה יותר. היא צרה יותר מהגלריה הרחוקה.',physicalChange:'Aim the launch into the nearer, narrower receiving lane and use the shallow fall. The deeper fall normally reaches the farther, wider lane. Physical braking or another equivalent safe route remains permitted; destination identity comes from real separate vestibules.'}},
 18:{name:'Two Travel Speeds',chapter:'Physical Comparisons',
  mission:'Use the faster of the two carriers. The lanes are the same length.',
  he:'השתמשו במשטח המהיר מבין השניים. המסלולים שווים באורכם.',
  sources:[{url:comparison,practice:'Compare actual carrier speeds over equal measured travel distances. Equality is limited to lane length; the carriers still serve separate docks.'}],
  contrast:{mission:'Use the slower of the two carriers. The lanes are the same length.',he:'השתמשו במשטח האיטי מבין השניים. המסלולים שווים באורכם.',physicalChange:'Board the other actual lane, whose motor takes longer to cover the same twelve metres and docks at the separate service bay. No travel-time score or usedCarrier flag substitutes for crossing its physical route.'}},
 19:{name:'The Smaller Module',chapter:'Physical Comparisons',
  mission:'Send the smaller cube through the narrow slot. Leave the larger cube at the wide receiver.',
  he:'העבירו את הקובייה הקטנה יותר דרך הפתח הצר. השאירו את הקובייה הגדולה יותר במשטח הקליטה הרחב.',
  sources:[{url:comparison,practice:'Keep smaller/larger attached to cube and narrow/wide attached to the actual delivery route. Native oriented cargo fit, rather than a cube-id checker, determines the usable slot.'}],
  contrast:{mission:'Leave the smaller cube at the wide receiver. Take the larger cube by the open route.',he:'השאירו את הקובייה הקטנה יותר במשטח הקליטה הרחב. קחו את הקובייה הגדולה יותר במסלול הפתוח.',physicalChange:'The same two cargo bodies exchange receiving assignments. The small body can use either delivery route; the large body has a genuine full-size alternative around the cargo-only slot. Both physical pressure combinations have real circuits and recoverable deliveries; no secret identity goal.'}},
 20:{name:'Which Receiver Powers It?',chapter:'Physical Comparisons',
  mission:'Open the door that is powered by the higher receiver.',
  he:'פתחו את הדלת שמקבלת חשמל מהמקלט הגבוה יותר.',
  sources:[{url:comparison,practice:'Higher modifies receiver among two actual optical fixtures at different heights.'},{url:relative,practice:'The adjacent defining clause identifies the door through its real circuit, rather than merely repeating a direction.'},{url:passive,practice:'Read door as the affected subject and receiver as the explicit source in is powered by. This is a limited passive reading bridge, not passive production or complete chapter coverage.'}],
  contrast:{mission:'Open the door that is powered by the lower receiver.',he:'פתחו את הדלת שמקבלת חשמל מהמקלט הנמוך יותר.',physicalChange:'Move the actual return aperture from the upper optical band to the lower band. The same source ray reaches the other receiver, closing one physical shutter and opening the other. Source, both receivers, both branches and all geometry remain fixed.'}},
};
