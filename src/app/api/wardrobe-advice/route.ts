import {NextResponse} from "next/server";
import {products} from "@/lib/products";
import {readWardrobe} from "@/lib/wardrobe";
import {readProfile} from "@/lib/profile";
export async function POST(request:Request){const body=await request.json();if(typeof body.prompt!=="string"||!body.prompt.trim())return NextResponse.json({error:"Ask a wardrobe question."},{status:400});try{const response=await fetch(`${process.env.AI_SERVICE_URL||"http://127.0.0.1:8001"}/wardrobe-advice`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:body.prompt,catalogue:products,wardrobe:await readWardrobe(),profile:await readProfile()}),cache:"no-store"});const result=await response.json();return NextResponse.json(response.ok?result:{error:result.detail||"Advice failed."},{status:response.status})}catch{return NextResponse.json({error:"Start the local AI service for wardrobe advice."},{status:503})}}
