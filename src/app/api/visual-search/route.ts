import {NextResponse} from "next/server";
import {products} from "@/lib/products";

export const runtime="nodejs";
export async function POST(request:Request){
 const incoming=await request.formData(),query=incoming.get("query");
 if(!(query instanceof File))return NextResponse.json({error:"Choose a clothing image."},{status:400});
 if(!["image/jpeg","image/png","image/webp"].includes(query.type)||query.size>8*1024*1024)return NextResponse.json({error:"Use a JPG, PNG or WebP under 8 MB."},{status:400});
 const body=new FormData();body.append("query",query);body.append("catalogue",JSON.stringify(products.map(({id,imageUrl})=>({id,imageUrl}))));body.append("top_k","6");
 try{const response=await fetch(`${process.env.AI_SERVICE_URL||"http://127.0.0.1:8001"}/visual-search`,{method:"POST",body,cache:"no-store"});const result=await response.json();return NextResponse.json(response.ok?result:{error:result.detail||"Visual search failed."},{status:response.status});}
 catch{return NextResponse.json({error:"Start the local AI service to use visual search."},{status:503})}
}
