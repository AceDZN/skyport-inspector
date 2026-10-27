import type {WorldBlueprint} from '../campaign-blueprint';
import type {Circuit,XYZ} from '../systems';
export interface OpticalFixture {
 emitters:{id:string;position:XYZ;direction:XYZ;range?:number;circuit?:Circuit}[];
 receivers:{id:string;position:XYZ;radius:number;normal?:XYZ}[];
}
export interface CoreLevel {
 number:number;name:string;mission:string;he:string;chapter:string;
 architecture:{height:number;halfWidth:number;style:'ceramic'|'graphite'};
 startYaw?:number;
 recoveryY?:number;
 wrongExitFeedback?:string;
 /** Requested, visibly named destination; other open routes remain recoverable. */
 expectedExit?:string;
 blueprint:()=>WorldBlueprint;
 optics?:OpticalFixture;
 sources:{url:string;practice:string}[];
 /** A documented language change with a different physically meaningful route/action. */
 contrast?:{mission:string;he:string;physicalChange:string;expectedExit?:string;wrongExitFeedback?:string};
}
