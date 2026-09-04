import {randomUUID} from "crypto";
import {mkdir,unlink,writeFile} from "fs/promises";
import path from "path";
import {NextResponse} from "next/server";
import {readWardrobe,wardrobeDir,writeWardrobe} from "@/lib/wardrobe";
const extensions:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
const itemPath=(name:string)=>path.join(process.cwd(),"storage","wardrobe",name);
export async function GET(){return NextResponse.json({items:await readWardrobe()})}
export async function POST(request:Request){
 const data=await request.formData(),photo=data.get("photo"),category=String(data.get("category")||""),color=String(data.get("color")||"").trim(),description=String(data.get("description")||"").trim();
 if(!(photo instanceof File)||!extensions[photo.type]||photo.size>8*1024*1024)return NextResponse.json({error:"Use a JPG, PNG or WebP under 8 MB."},{status:400});
 if(!category||!color)return NextResponse.json({error:"Category and colour are required."},{status:400});
 const id=randomUUID(),name=`${id}.${extensions[photo.type]}`;await mkdir(wardrobeDir,{recursive:true});await writeFile(itemPath(name),Buffer.from(await photo.arrayBuffer()),{flag:"wx"});
 const items=await readWardrobe(),item={id,imageUrl:`/api/wardrobe/file/${name}`,category,color,description:description.slice(0,120),createdAt:new Date().toISOString()};await writeWardrobe([item,...items]);return NextResponse.json({item},{status:201});
}
export async function DELETE(request:Request){const id=new URL(request.url).searchParams.get("id"),items=await readWardrobe(),item=items.find(entry=>entry.id===id);if(!item)return NextResponse.json({error:"Wardrobe item not found."},{status:404});const name=item.imageUrl.split("/").pop()!;await unlink(itemPath(name)).catch(()=>undefined);await writeWardrobe(items.filter(entry=>entry.id!==id));return NextResponse.json({ok:true})}
