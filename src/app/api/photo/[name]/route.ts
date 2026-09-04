import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
const content:Record<string,string>={jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp"};
export async function GET(_:Request,{params}:{params:Promise<{name:string}>}){const{name}=await params;if(path.basename(name)!==name)return new NextResponse("Invalid",{status:400});try{const file=await readFile(path.join(process.cwd(),"storage","uploads",name));return new NextResponse(file,{headers:{"Content-Type":content[name.split(".").pop()?.toLowerCase()??""]??"application/octet-stream","Cache-Control":"no-store"}});}catch{return new NextResponse("Not found",{status:404});}}
