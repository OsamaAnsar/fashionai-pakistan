import {mkdir,readFile,writeFile} from "fs/promises";
import path from "path";
import {emptyProfile,StyleProfile} from "@/lib/profile-types";
const profilePath=path.join(process.cwd(),"storage","profile.json");
export async function readProfile():Promise<StyleProfile>{try{return {...emptyProfile,...JSON.parse(await readFile(profilePath,"utf8"))}}catch{return emptyProfile}}
export async function writeProfile(profile:StyleProfile){await mkdir(path.dirname(profilePath),{recursive:true});await writeFile(profilePath,JSON.stringify(profile,null,2))}
