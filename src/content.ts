/** Rift Runner: original spatial missions. Replaces the historical desk evaluator. */
export type Grade = 7 | 8 | 9;
export type PadSide = 'front' | 'behind';
export type Bridge = 'east' | 'west';
export interface CrateSpec {
 id:string; label:string; shape:'diamond'|'triangle'; size:'small'|'large';
 owner?:string; start:PadSide; history?:'carried'|'beside';
}
export interface Room {
 id:string; grade:Grade; stage:'guided'|'independent'|'transfer'; title:string;
 mission:string; he:string; teaching:string; layout:'glass'|'history'|'launch';
 crates:CrateSpec[]; target:{crateId:string;pad:PadSide;bridge:Bridge};
 rule?:string; history?:{actor:string;carriedCrateId:string;background:string};
 sources:string[]; momentum?:boolean; blockedBridge?:Bridge;
 /** A replay variant retains these physical descriptions while changing the mission. */
 skin:string;
}
export interface PhysicalOutcome {
 crateId:string; pad:PadSide; bridge:Bridge; crateOnPad:boolean;
 playerCrossed:boolean; atExit:boolean; portalTraversals:number;
 cratePortalTraversals:number; launchUsed?:boolean; launchBeforePad?:boolean;
}
export interface Assistance { hints:number; translations:number; retries:number }
export interface RoomEvaluation {
 physicalComplete:boolean; languageGoal:boolean; unaided:boolean;
 portalMechanics:boolean; reason:string;
}
export const grades:Grade[]=[7,8,9];
const base='https://english.workbook.co.il';
export const sources={
 g7space:`${base}/grade-7/chapter-11/prepositions-time-place`,
 g7instructions:`${base}/grade-7/chapter-11/modals-and-imperatives`,
 g7time:`${base}/grade-7/chapter-10/mixed-tenses-guide`,
 g7practical:`${base}/grade-7/chapter-12/reading-functional-texts`,
 g8time:`${base}/grade-8/chapter-10/mixed-tenses-reference`,
 g8relative:`${base}/grade-8/chapter-11/relative-clauses-reference`,
 g8reference:`${base}/grade-8/chapter-11/pronouns-and-reference`,
 g8practical:`${base}/grade-8/chapter-12/reading-practical-texts-and-sources`,
 g9time:`${base}/grade-9/chapter-10/present-perfect-vs-past-simple-reference`,
 g9report:`${base}/grade-9/chapter-11/reported-speech-reference`,
 g9practical:`${base}/grade-9/chapter-12/reading-practical-texts-and-sources-reference`,
};
export const firstRoom:Room={
 id:'g7-1',grade:7,stage:'guided',title:'מעבר לזכוכית',layout:'glass',skin:'courtyard-a',
 mission:'Put the small crate on the platform behind the glass. Then cross the east bridge.',
 he:'הניחו את הארגז הקטן על המשטח שמאחורי הזכוכית. לאחר מכן חצו את הגשר המזרחי.',
 teaching:'Put היא הוראה. behind מציין את הצד שמאחורי הזכוכית, ולא את הצד שמלפניה. Then מסדר את הפעולות: ארגז על משטח, ואז חציית הגשר.',
 crates:[{id:'c1',label:'DIAMOND',shape:'diamond',size:'small',start:'front'},{id:'c2',label:'TRIANGLE',shape:'triangle',size:'large',start:'front'}],
 target:{crateId:'c1',pad:'behind',bridge:'east'},
 rule:'Both platforms can unfold a bridge. The mission identifies the crate, platform and route required for this task.',
 sources:[sources.g7space,sources.g7instructions,sources.g7practical],
};
/** The complete finite pack was authored after g7-1's real portal/carry/bridge/win/fall proof. */
const crates=(start:PadSide='front',owners?:[string,string]):CrateSpec[]=>[
 {id:'c1',label:'DIAMOND',shape:'diamond',size:'small',start,...(owners?{owner:owners[0]}:{})},
 {id:'c2',label:'TRIANGLE',shape:'triangle',size:'large',start,...(owners?{owner:owners[1]}:{})},
];
const history=(carriedCrateId:string,background:string)=>({actor:'Rook',carriedCrateId,background});
export const rooms:Room[]=[firstRoom,
 {
  id:'g7-2',grade:7,stage:'independent',title:'המשימה של היום',layout:'glass',skin:'courtyard-a',
  mission:'We usually keep the small crate behind the glass. Yesterday it stayed there. Today put it on the platform in front of the glass. Then cross the west bridge.',
  he:'בדרך כלל שומרים את הארגז הקטן מאחורי הזכוכית. אתמול הוא נשאר שם. היום הניחו אותו על המשטח שלפני הזכוכית, ואז חצו את הגשר המערבי.',
  teaching:'usually מתאר הרגל ו־Yesterday אירוע שהסתיים. Today מציין את המשימה הנוכחית: in front of the glass, לפני הזכוכית.',
  crates:crates('behind'),target:{crateId:'c1',pad:'front',bridge:'west'},
  rule:'The current task is for today. A usual location or yesterday’s location does not replace today’s instruction.',
  sources:[sources.g7time,sources.g7space,sources.g7instructions,sources.g7practical],
 },
 {
  id:'g7-3',grade:7,stage:'transfer',title:'מסלול חזרה',layout:'glass',skin:'courtyard-return',
  mission:'On this return run, put the small triangle crate on the platform in front of the glass. Then cross the west bridge.',
  he:'במסלול החזרה הזה הניחו את הארגז הקטן עם סימן המשולש על המשטח שלפני הזכוכית. לאחר מכן חצו את הגשר המערבי.',
  teaching:'במסלול החדש סימן המשולש נמצא על הארגז הקטן. קראו את התיאור ואת המיקום מחדש; אל תחזרו אוטומטית על החדר הראשון.',
  crates:[{id:'c1',label:'DIAMOND',shape:'diamond',size:'large',start:'behind'},{id:'c2',label:'TRIANGLE',shape:'triangle',size:'small',start:'behind'}],
  target:{crateId:'c2',pad:'front',bridge:'west'},
  rule:'Both shapes are cargo labels, not correctness hints. This is a new return task.',
  sources:[sources.g7space,sources.g7instructions,sources.g7practical],
 },
 {
  id:'g8-1',grade:8,stage:'guided',title:'הארגז שרוק נשא',layout:'history',skin:'history-court',
  mission:'Move the crate that Rook carried to the platform behind the glass. Then cross the east bridge.',
  he:'העבירו את הארגז שרוק נשא אל המשטח שמאחורי הזכוכית. לאחר מכן חצו את הגשר המזרחי.',
  teaching:'that Rook carried מזהה ארגז לפי פעולה אמיתית שהרובוט ביצע. ארגז שהרובוט רק עמד לידו אינו בהכרח הארגז שנשא.',
  crates:crates().map(c=>({...c,history:c.id==='c1'?'carried':'beside'})),
  history:history('c1','Rook carried the diamond crate while the triangle crate was resting on the floor. Afterwards Rook stood beside the triangle crate.'),
  target:{crateId:'c1',pad:'behind',bridge:'east'},
  rule:'Watch the action replay at the start. Both crates exist. The robot’s carried crate and the crate it stood beside are different objects.',
  sources:[sources.g8time,sources.g8relative,sources.g8reference,sources.g8practical],
 },
 {
  id:'g8-2',grade:8,stage:'independent',title:'מה העדכון משנה?',layout:'history',skin:'history-court',
  mission:'Move the crate that Rook carried to the platform behind the glass. The current update changes only the bridge: use west, not east.',
  he:'העבירו את הארגז שרוק נשא למשטח שמאחורי הזכוכית. העדכון הנוכחי משנה רק את הגשר: השתמשו במערבי, ולא במזרחי.',
  teaching:'העדכון משנה bridge בלבד. אותו ארגז ואותו משטח נשארים בתוקף; it מתייחס לארגז שנקבע בהוראה המקורית.',
  crates:crates().map(c=>({...c,history:c.id==='c1'?'carried':'beside'})),
  history:history('c1','Rook carried the diamond crate while the triangle crate was resting. Rook then stood beside the triangle crate.'),
  target:{crateId:'c1',pad:'behind',bridge:'west'},
  rule:'Original instruction: use Rook’s carried crate behind the glass, then the east bridge. Current notice for this room: change the bridge to west. Keep the crate and platform unchanged; put it there first.',
  sources:[sources.g8time,sources.g8relative,sources.g8reference,sources.g8practical],
 },
 {
  id:'g8-3',grade:8,stage:'transfer',title:'ריצה חדשה, דיווח אחר',layout:'history',skin:'history-return',
  mission:'After this reset, take the crate that Rook carried to the platform in front of the glass. Use the east bridge. Tomorrow’s west-bridge notice does not apply today.',
  he:'לאחר האתחול הזה קחו את הארגז שרוק נשא למשטח שלפני הזכוכית. השתמשו בגשר המזרחי. הודעת הגשר המערבי של מחר אינה חלה היום.',
  teaching:'בדקו את הפעולה החדשה ולא את זיכרון החדר הקודם. that Rook carried מזהה את הארגז בריצה הזאת. ההודעה על מחר אינה משנה את מסלול היום.',
  crates:crates('behind').map(c=>({...c,history:c.id==='c2'?'carried':'beside'})),
  history:history('c2','In this reset Rook carried the triangle crate while the diamond crate was resting. Rook then stood beside the diamond crate.'),
  target:{crateId:'c2',pad:'front',bridge:'east'},
  rule:'Today’s original task uses the front platform and east bridge. The notice “use west” is for tomorrow’s reset only. It does not update this run.',
  sources:[sources.g8time,sources.g8relative,sources.g8reference,sources.g8practical],
 },
 {
  id:'g9-1',grade:9,stage:'guided',title:'מה בטוח עכשיו?',layout:'glass',skin:'maintenance-court',
  mission:'The engineer has repaired the east bridge. It is safe now. She repaired the west bridge last week, but it is broken again. Put the small crate on the platform behind the glass, then use the safe bridge.',
  he:'המהנדסת תיקנה את הגשר המזרחי והוא בטוח עכשיו. היא תיקנה את המערבי בשבוע שעבר, אבל הוא שבור שוב. הניחו את הארגז הקטן על המשטח שמאחורי הזכוכית והשתמשו בגשר הבטוח.',
  teaching:'has repaired קושר את התיקון למצב הנוכחי, אבל ההחלטה נשענת גם על “safe now”. המערבי שבור מפני שהטקסט אומר “broken again”, לא רק מפני שהפועל בעבר פשוט.',
  crates:crates(),target:{crateId:'c1',pad:'behind',bridge:'east'},blockedBridge:'west',
  rule:'CURRENT STATUS: EAST SAFE; WEST BROKEN. The broken route remains folded. Past repair alone never proves whether a bridge is safe now.',
  sources:[sources.g9time,sources.g9practical],
 },
 {
  id:'g9-2',grade:9,stage:'independent',title:'של מי הארגז בדיווח?',layout:'glass',skin:'owner-court',
  mission:'Mina told Oren to put her crate on the platform in front of the glass. Then he should cross the west bridge.',
  he:'מינה אמרה לאורן להניח את הארגז שלה על המשטח שלפני הזכוכית. לאחר מכן עליו לחצות את הגשר המערבי.',
  teaching:'Mina היא הדוברת ומי שאליה her מתייחס; Oren הוא מקבל ההוראה וה־he. שמרו על בעלות הארגז כשמעבירים את ההוראה.',
  crates:crates('behind',['Mina','Oren']),target:{crateId:'c1',pad:'front',bridge:'west'},
  rule:'You are Oren (he/him), the runner. Mina (she/her) is the engineer. Each crate displays its owner. Mina’s original request to Oren in this room was “Put my crate on the front platform.” The report is current and concerns this run.',
  sources:[sources.g9report,sources.g9practical],
 },
 {
  id:'g9-3',grade:9,stage:'transfer',title:'עדכון בחצר השיגור',layout:'launch',skin:'launch-court',momentum:true,
  mission:'Use the floor-to-wall rift for a momentum launch. Then put the large crate on the platform behind the glass and cross the west bridge. The update changes only the crate.',
  he:'השתמשו בשער מהרצפה לקיר לשיגור בעזרת תנופה. לאחר מכן הניחו את הארגז הגדול על המשטח שמאחורי הזכוכית וחצו את הגשר המערבי. העדכון משנה רק את הארגז.',
  teaching:'המקור קובע משטח מאחורי הזכוכית וגשר מערבי. העדכון משנה small ל־large בלבד. רצף המשימה מבקש שיגור לפני הפעלת המשטח והחצייה.',
  crates:crates(),target:{crateId:'c2',pad:'behind',bridge:'west'},
  rule:'Original launch-room plan: use the small crate on the platform behind the glass and the west bridge. Current update for this room: replace only the crate with the large one. The engineer has checked the launch route; it is safe now. The platform and bridge stay unchanged.',
  sources:[sources.g9time,sources.g9practical],
 },
];
export const pairedRooms:Room[]=[
 {...firstRoom,id:'g7-1-pair',mission:'Put the small crate on the platform in front of the glass. Then cross the east bridge.',he:'הניחו את הארגז הקטן על המשטח שלפני הזכוכית. לאחר מכן חצו את הגשר המזרחי.',teaching:'in front of מציין את הצד שלפני הזכוכית. אותו ארגז ואותו גשר נשארים; מקום המשטח השתנה.',target:{...firstRoom.target,pad:'front'}},
 {...rooms[3],id:'g8-1-pair',mission:'Move the crate that Rook stood beside to the platform behind the glass. Then cross the east bridge.',he:'העבירו את הארגז שרוק עמד לידו אל המשטח שמאחורי הזכוכית. לאחר מכן חצו את הגשר המזרחי.',teaching:'stood beside מתאר עמידה ליד הארגז, ולא נשיאה שלו. אותה היסטוריה מצולמת מובילה כאן לבחירת הארגז האחר.',target:{...rooms[3].target,crateId:'c2'}},
 {...rooms[6],id:'g9-1-pair',mission:'The engineer has repaired the west bridge. It is safe now. She repaired the east bridge last week, but it is broken again. Put the small crate on the platform behind the glass, then use the safe bridge.',he:'המהנדסת תיקנה את הגשר המערבי והוא בטוח עכשיו. היא תיקנה את המזרחי בשבוע שעבר, אבל הוא שבור שוב. הניחו את הארגז הקטן על המשטח שמאחורי הזכוכית והשתמשו בגשר הבטוח.',teaching:'כאן המערבי בטוח עכשיו והמזרחי שבור שוב. שימו לב למצב המפורש בכל גרסה, לא לזמן הפועל בלבד.',target:{...rooms[6].target,bridge:'west'},blockedBridge:'east',rule:'CURRENT STATUS: WEST SAFE; EAST BROKEN. The broken route remains folded. Past repair alone never proves current safety.'},
];
export const allRooms:Room[]=[...rooms,...pairedRooms];
export function evaluateRoom(room:Room,actual:PhysicalOutcome,assistance:Assistance={hints:0,translations:0,retries:0}):RoomEvaluation{
 const physicalComplete=actual.crateOnPad&&actual.playerCrossed&&actual.atExit;
 const targetMatched=actual.crateId===room.target.crateId&&actual.pad===room.target.pad&&actual.bridge===room.target.bridge;
 const momentumSatisfied=!room.momentum||(actual.launchUsed===true&&actual.launchBeforePad===true);
 const languageGoal=physicalComplete&&targetMatched&&momentumSatisfied;
 const portalMechanics=actual.portalTraversals>0&&actual.cratePortalTraversals>0;
 let reason='הניחו ארגז על משטח, חצו גשר והגיעו ליציאה כדי להשלים מסלול פיזי.';
 if(physicalComplete&&!targetMatched){
  if(actual.crateId!==room.target.crateId)reason=`המסלול הפיזי הושלם. הארגז שבחרתם אינו הארגז שהמשימה מזהה. ${room.he}`;
  else if(actual.pad!==room.target.pad)reason=`המסלול הפיזי הושלם. המשטח אינו בצד שנדרש במשפט. ${room.he}`;
  else reason=`המסלול הפיזי הושלם. הגשר שחציתם שונה מן המסלול שנדרש במשימה. ${room.he}`;
 }else if(physicalComplete&&!momentumSatisfied)reason='הגעתם ליציאה, אך משימת ההעברה דורשת שימוש בשיגור. אפשר לנסות שוב מן המחסום הבטוח.';
 else if(languageGoal)reason='הארגז, המיקום והמסלול תואמים למשפט באנגלית. הפעולה בעולם היא הראיה להבנת ההוראה.';
 return {physicalComplete,languageGoal,unaided:languageGoal&&assistance.hints===0&&assistance.translations===0&&assistance.retries===0,portalMechanics,reason};
}
