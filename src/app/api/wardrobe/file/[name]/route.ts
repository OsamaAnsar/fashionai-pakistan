import {readFile} from "fs/promises";
import path from "path";
import {NextResponse} from "next/server";
import {wardrobeDir} from "@/lib/wardrobe";
const types:Record<string,string>={jpg:"image/jpeg",png:"image/png",webp:"image/webp"};
export async function GET(_:Request,{params}:RouteContext<"/api/wardrobe/file/[name]">){const {name}=await params;if(!/^[0-9a-f-]+\.(jpg|png|webp)$/.test(name))return new NextResponse(null,{status:404});try{return new NextResponse(await readFile(path.join(wardrobeDir,name)),{headers:{"Content-Type":types[name.split(".").pop()!],"Cache-Control":"private, no-store"}})}catch{return new NextResponse(null,{status:404})}}
