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
 cratePortalTraversals:number; launchUsed?:boolean;
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
/** One complete room is integrated and physically verified before this pack is expanded. */
export const rooms:Room[]=[firstRoom];
export const pairedRooms:Room[]=[];
export const allRooms:Room[]=[...rooms,...pairedRooms];
export function evaluateRoom(room:Room,actual:PhysicalOutcome,assistance:Assistance={hints:0,translations:0,retries:0}):RoomEvaluation{
 const physicalComplete=actual.crateOnPad&&actual.playerCrossed&&actual.atExit;
 const targetMatched=actual.crateId===room.target.crateId&&actual.pad===room.target.pad&&actual.bridge===room.target.bridge;
 const momentumSatisfied=!room.momentum||actual.launchUsed===true;
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
