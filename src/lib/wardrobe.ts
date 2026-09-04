import {mkdir,readFile,writeFile} from "fs/promises";
import path from "path";
export type WardrobeItem={id:string;imageUrl:string;category:string;color:string;description:string;createdAt:string};
export const wardrobeDir=path.join(process.cwd(),"storage","wardrobe");
const indexPath=path.join(wardrobeDir,"index.json");
export async function readWardrobe():Promise<WardrobeItem[]>{try{return JSON.parse(await readFile(indexPath,"utf8"))}catch{return []}}
export async function writeWardrobe(items:WardrobeItem[]){await mkdir(wardrobeDir,{recursive:true});await writeFile(indexPath,JSON.stringify(items,null,2))}
