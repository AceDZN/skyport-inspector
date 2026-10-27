import {Vector3}from'three';
import{makeSolid,V,type Solid,type Surface}from'./physics';
import type{CatalogueRow,CampaignGoal,Family}from'./campaign-types';
import type{CrateSpec}from'./content';
import type{DeviceSpec,XYZ,Circuit}from'./systems';
export interface CargoStart {spec:CrateSpec;position:XYZ}
export interface CampaignPad {id:string;label:string;position:XYZ}
export interface CampaignBridge {id:string;center:XYZ;size:XYZ;circuit:Circuit;route:string}
export interface CampaignExit {id:string;label:string;position:XYZ;size:XYZ}
export interface Region {id:string;position:XYZ;size:XYZ}
export interface Mark {text:string;position:XYZ;normal?:XYZ;width?:number;height?:number}
export interface WorldBlueprint {family:Family;spawn:XYZ;solids:Solid[];surfaces:Surface[];cargo:CargoStart[];pads:CampaignPad[];bridges:CampaignBridge[];devices:DeviceSpec[];exits:CampaignExit[];regions:Region[];marks:Mark[];presetPortal?:{index:number;surface:string};history?:{actor:string;carried:string;beside:string};routePoints:Record<string,XYZ>;notes:string[]}
const unique=<T>(xs:T[])=>[...new Set(xs)];
export const allGoals=(row:CatalogueRow)=>[row.normalizedGoal,...row.normalizedGoalAlternatives??[],...(row.semanticDecision.changedWordingCheck.normalizedContrastGoal?[row.semanticDecision.changedWordingCheck.normalizedContrastGoal]:[])];
const words=(id:string)=>id.replace(/-/g,' ').toUpperCase();
import fixtures from './data/worlds.json';
import upperFixtures from './data/worlds-upper.json';
/** Runtime physics comes only from the numbered physical fixture. Missions/goals never create or move objects. */
export function makeBlueprint(row:CatalogueRow):WorldBlueprint{
 const raw=[...upperFixtures.worlds,...fixtures.worlds].find(w=>w.number===row.number);if(!raw)throw new Error('Missing authored physical fixture '+row.number);
 const b=structuredClone(raw) as unknown as WorldBlueprint;
 const vector=(p:unknown)=>{const v=p as {x:number;y:number;z:number};return V(v.x,v.y,v.z);};
 b.solids=b.solids.map(s=>({...s,min:vector(s.min),max:vector(s.max)}));b.surfaces=b.surfaces.map(s=>({...s,center:vector(s.center),normal:vector(s.normal),up:vector(s.up)}));return b;
}
