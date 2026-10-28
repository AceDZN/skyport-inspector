/** Optional reading support. Nothing here is read by physics, goals or saved frontier. */
import type{CoreLevel}from'./level';
const vocabulary:[string,string][]=[
 ['told','אמרו ל־ / הורו ל־'],['asked','ביקשו מ־'],['their','שלהם / שלהן'],['its','שלו / שלה — של החפץ'],['there','שם'],['here','כאן'],
 ['is opened by','נפתח/ת על ידי'],['are opened by','נפתחים על ידי'],['is carried by','מוסע/ת על ידי'],['is blocked by','נחסם/ת על ידי'],['is released by','משוחרר/ת על ידי'],['is stopped by','נעצר/ת עקב'],['has not opened','עדיין לא נפתח'],['has opened','כבר נפתח'],['has not reached','עדיין לא הגיע'],['has reached','כבר הגיע'],
 ["don't have to",'לא חייבים'],["mustn't",'אסור'],['do not','אל ת־'],['bring back','להחזיר'],['in front of','לפני / בחזית'],['behind','מאחורי'],['through','דרך'],['on','על'],['button','לחצן'],['upper','עליון'],['lower','תחתון'],['each','כל אחד'],['both','שניהם'],['either','אחד מהשניים'],['must','חייבים'],['can','אפשר / מותר'],['before','לפני'],['after','אחרי'],['when','כאשר'],['while','בזמן ש־'],['deeper','עמוק יותר'],['higher','גבוה יותר'],['shallower','רדוד יותר'],['farther','רחוק יותר'],['nearer','קרוב יותר'],['wider','רחב יותר'],['narrower','צר יותר'],['faster','מהיר יותר'],['slower','איטי יותר'],['smaller','קטן יותר'],['larger','גדול יותר'],['is powered by','מקבל כוח מ־'],['that','ש־'],['remained closed','נשאר סגור'],['opened','נפתח'],['still','עדיין'],['already','כבר'],['yet','עדיין / טרם'],['if','אם'],['until','עד ש־'],['keep','השאירו / שמרו'],['leave','השאירו'],['beam','קרן'],['receiver','מקלט'],['cube','קובייה']
];
const focuses=[
 ['Action, object, place','קראו את הפעולה, החפץ והמקום. בדקו במשחק מה המשפט מבקש לשנות.'],
 ['Required, allowed, forbidden','שימו לב להבדל בין חובה, אפשרות ואיסור. המילים משנות את הפעולה או את היעד.'],
 ['Order and timing','מילות הזמן קובעות את הסדר או מה צריך להמשיך לפעול בזמן התנועה.'],
 ['Compare what you see','השוו בין הגבהים, המרחקים, הגדלים או המהירויות. מילת ההשוואה מזהה את המסלול המבוקש.'],
 ['Which object does the sentence identify?','בדקו איזה חפץ מתואר, ומי מפעיל או משפיע על מה. התיאור מתייחס לקשר אמיתי במכונה.'],
 ['Earlier events and NOW','הפרידו בין מה שקרה קודם לבין מה שפועל עכשיו. יומן המכונות מציג תצפיות ומצב נוכחי בנפרד.'],
 ['Who acts, and what is affected?','במשפט סביל החפץ שמושפע מופיע כנושא. חפשו מה מפעיל אותו בפועל.'],
 ['Finished, or still needed?','בדקו מה כבר הושלם ואיזו פעולה עדיין נחוצה. אירוע קודם אינו אספקת חשמל נוכחית.'],
 ['Predict the condition','קראו את התנאי וצפו מה ישתנה במכונה כשיתקיים. בדקו את התחזית במצב האמיתי.'],
 ['Carry the meaning of an instruction','עקבו אחר ההוראה המדווחת: למי היא מתייחסת, מה צריך לעשות ובאיזה מקום.']
]as const;
export function englishSupport(level:Pick<CoreLevel,'number'|'mission'>){
 const mission=level.mission.toLowerCase().replaceAll('’',"'"),focus=focuses[Math.min(9,Math.max(0,Math.floor((level.number-1)/5)))];
 const words=vocabulary.filter(([word])=>new RegExp('(?:^|[^a-z])'+word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:$|[^a-z])').test(mission)).slice(0,4);
 return {focus:focus[0],explanation:focus[1],words:level.number===1?[["bring back",'להחזיר'],['on','על'],['button','לחצן']]as [string,string][]:words};
}
interface FirstRoomState{heldId?:string;player:{pos:{y:number;z:number}};portals:unknown[];pads:{id:string;crateId?:string}[]}
export function firstRoomHint(world:FirstRoomState){
 if(world.heldId)return {title:'Carry it back',text:world.player.pos.z<0?'Carry the cube through the portal you came from.':'Face the floor button. Aim a little down, then press E to leave the cube on it.',he:world.player.pos.z<0?'חזרו עם הקובייה דרך השער שממנו הגעתם.':'הביטו בלחצן שברצפה, כוונו מעט מטה ולחצו E כדי להניח עליו את הקובייה.'};
 if(world.pads.find(p=>p.id==='exit-button')?.crateId)return {title:'The cube holds the door open',text:'Leave the cube on the button. Walk through the open exit.',he:'השאירו את הקובייה על הלחצן ועברו דרך היציאה הפתוחה.'};
 if(world.player.pos.z<0)return {title:'Reach the raised platform',text:world.player.pos.y<3?'The cube is above you. Aim at the empty white wall ABOVE the cube, high enough for the whole portal to fit above its platform.':'Walk close to the cube, look at it and press E.',he:world.player.pos.y<3?'הקובייה נמצאת מעליכם. כוונו לקיר הלבן הריק מעל הקובייה, מספיק גבוה כדי שכל פתח השער יהיה מעל המרפסת.':'התקרבו לקובייה, הביטו בה ולחצו E.'};
 return {title:world.portals.every(Boolean)?'Walk through your nearby portal':'Link the two sides',text:'Left-click a white wall beside you at walking height. Right-click the empty white back wall ABOVE the cube. Keep the portal’s bottom edge level with the platform, then walk into your nearby portal.',he:'לחצו שמאל על קיר לבן לידכם בגובה הליכה. לחצו ימין על הקיר הלבן הריק מעל הקובייה. מקמו אותו כך שתחתית השער תהיה בגובה רצפת המרפסת, ואז היכנסו לשער הקרוב.'};
}
