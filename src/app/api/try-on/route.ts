import {NextResponse} from "next/server";
import {products} from "@/lib/products";
import {Client,handle_file} from "@gradio/client";

export const runtime="nodejs";
export const maxDuration=60;
const imageTypes=["image/jpeg","image/png","image/webp"];
const wait=(milliseconds:number)=>new Promise(resolve=>setTimeout(resolve,milliseconds));

function errorMessage(value:unknown,fallback:string){
 if(typeof value==="string")return value;
 if(value&&typeof value==="object"&&"message" in value&&typeof value.message==="string")return value.message;
 return fallback;
}

async function hostedTryOn(person:File,garmentUrl:string){
 const token=process.env.FASHN_API_KEY!;
 const modelImage=`data:${person.type};base64,${Buffer.from(await person.arrayBuffer()).toString("base64")}`;
 const started=await fetch("https://api.fashn.ai/v1/run",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({model_name:"tryon-v1.6",inputs:{model_image:modelImage,garment_image:garmentUrl,category:"auto",mode:"balanced",moderation_level:"conservative",num_samples:1,output_format:"png"}}),cache:"no-store"});
 const startData=await started.json().catch(()=>({}));
 if(!started.ok||!startData.id)throw new Error(errorMessage(startData.message||startData.error,"Hosted AI rejected the request."));
 for(let attempt=0;attempt<24;attempt++){
  await wait(750);
  const statusResponse=await fetch(`https://api.fashn.ai/v1/status/${encodeURIComponent(startData.id)}`,{headers:{Authorization:`Bearer ${token}`},cache:"no-store"});
  const status=await statusResponse.json().catch(()=>({}));
  if(status.status==="failed")throw new Error(errorMessage(status.error,"AI generation failed."));
  if(status.status==="completed"&&status.output?.[0]){
   const output=await fetch(status.output[0],{cache:"no-store"});
   if(!output.ok)throw new Error("AI output could not be downloaded.");
   return new NextResponse(await output.arrayBuffer(),{headers:{"Content-Type":output.headers.get("content-type")||"image/png","Cache-Control":"private, no-store"}});
  }
 }
 throw new Error("AI generation took too long. Please try again.");
}

async function freeTryOn(person:File,product:(typeof products)[number]){
 const token=process.env.HF_TOKEN;
 const app=await Client.connect("yisol/IDM-VTON",token?.startsWith("hf_")?{token:token as `hf_${string}`}:{ });
 try{
  const result=await app.predict("/tryon",[{background:handle_file(person),layers:[],composite:null},handle_file(product.imageUrl),product.name,true,false,20,42]);
  const output=(result.data as Array<{url?:string;path?:string}>)[0],outputUrl=output?.url||(output?.path?.startsWith("http")?output.path:"");
  if(!outputUrl)throw new Error("Free AI returned no image.");
  const image=await fetch(outputUrl,{cache:"no-store"});
  if(!image.ok)throw new Error("Free AI output could not be downloaded.");
  return new NextResponse(await image.arrayBuffer(),{headers:{"Content-Type":image.headers.get("content-type")||"image/png","Cache-Control":"private, no-store","X-AI-Provider":"Hugging Face ZeroGPU"}});
 }finally{app.close();}
}

async function localTryOn(person:File,product:(typeof products)[number],serviceUrl:string){
 const garmentResponse=await fetch(product.imageUrl);
 if(!garmentResponse.ok)throw new Error("Garment image unavailable.");
 const form=new FormData();form.append("person",person,person.name);form.append("garment",new Blob([await garmentResponse.arrayBuffer()],{type:garmentResponse.headers.get("content-type")||"image/jpeg"}),`${product.id}.jpg`);form.append("category",["Jackets","Shirts","T-Shirts"].includes(product.category)?"upper":"lower");
 const response=await fetch(`${serviceUrl}/try-on`,{method:"POST",body:form,cache:"no-store"});
 if(!response.ok){const failure=await response.json().catch(()=>({}));throw new Error(errorMessage(failure.detail,"Try-on generation failed."));}
 return new NextResponse(await response.arrayBuffer(),{headers:{"Content-Type":"image/png","Cache-Control":"private, no-store"}});
}

export async function POST(request:Request){
 try{
  const data=await request.formData(),person=data.get("photo"),product=products.find(item=>item.id===data.get("productId"));
  if(!(person instanceof File)||!product)return NextResponse.json({error:"Choose a valid photo and garment."},{status:400});
  if(!imageTypes.includes(person.type)||person.size>8*1024*1024)return NextResponse.json({error:"Use a JPG, PNG or WebP under 8 MB."},{status:400});
  const localUrl=process.env.AI_SERVICE_URL||(!process.env.NETLIFY?"http://127.0.0.1:8001":"");
  if(localUrl)return await localTryOn(person,product,localUrl);
  try{return await freeTryOn(person,product);}catch(freeError){
   if(process.env.FASHN_API_KEY)return await hostedTryOn(person,product.imageUrl);
   throw new Error(`${errorMessage(freeError,"Free AI is busy.")} Free ZeroGPU capacity is limited; try again shortly.`);
  }
 }catch(error){return NextResponse.json({error:errorMessage(error,"The AI try-on service is temporarily unavailable.")},{status:503});}
}
