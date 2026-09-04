export type StyleProfile={gender:string;height:number|null;chest:number|null;waist:number|null;inseam:number|null;preferredFit:string;styles:string[];colors:string[];brandSizes:Record<string,string>};
export const emptyProfile:StyleProfile={gender:"",height:null,chest:null,waist:null,inseam:null,preferredFit:"Regular",styles:[],colors:[],brandSizes:{}};
