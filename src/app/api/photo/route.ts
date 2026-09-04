import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const folder = path.join(process.cwd(), "storage", "uploads");
const types:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
export async function POST(request:Request){
 const data=await request.formData(),file=data.get("photo");
 if(!(file instanceof File))return NextResponse.json({error:"Choose a photo first."},{status:400});
 if(!types[file.type])return NextResponse.json({error:"Use a JPG, PNG or WebP image."},{status:415});
 if(file.size>8*1024*1024)return NextResponse.json({error:"Photo must be smaller than 8 MB."},{status:413});
 const name=`${randomUUID()}.${types[file.type]}`;await mkdir(folder,{recursive:true});await writeFile(path.join(folder,name),Buffer.from(await file.arrayBuffer()));
 return NextResponse.json({name,url:`/api/photo/${name}`});
}
export async function DELETE(request:Request){
 const name=new URL(request.url).searchParams.get("name");if(!name||path.basename(name)!==name)return NextResponse.json({error:"Invalid photo."},{status:400});
 try{await unlink(path.join(folder,name));}catch{return NextResponse.json({error:"Photo was already removed."},{status:404});}
 return NextResponse.json({ok:true});
}
