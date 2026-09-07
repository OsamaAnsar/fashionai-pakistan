"use client";
import {useEffect,useRef,useState} from "react";
import {products} from "@/lib/products";
type Upload={file:File;url:string};
const zeroGpu="https://yisol-idm-vton.hf.space";

async function preparePortrait(file:File){
 const bitmap=await createImageBitmap(file),canvas=document.createElement("canvas");
 canvas.width=768;canvas.height=1024;
 const context=canvas.getContext("2d");
 if(!context){bitmap.close();throw new Error("This browser could not prepare the photo.")}
 context.fillStyle="#eee9df";context.fillRect(0,0,canvas.width,canvas.height);
 const scale=Math.min(canvas.width/bitmap.width,canvas.height/bitmap.height),width=bitmap.width*scale,height=bitmap.height*scale;
 context.drawImage(bitmap,(canvas.width-width)/2,(canvas.height-height)/2,width,height);bitmap.close();
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("This photo could not be prepared.")),"image/jpeg",.94));
 return new File([blob],`${file.name.replace(/\.[^.]+$/,"")||"person"}-portrait.jpg`,{type:"image/jpeg"});
}

async function freeTryOn(photo:File,productId:string){
 const product=products.find(item=>item.id===productId);if(!product)throw new Error("Choose a garment first.");
 const files=new FormData();files.append("files",photo,photo.name||"person.jpg");
 const upload=await fetch(`${zeroGpu}/upload`,{method:"POST",body:files}),paths=await upload.json().catch(()=>[]);
 if(!upload.ok||!paths[0])throw new Error("The free AI could not receive your photo.");
 const session=Math.random().toString(36).slice(2),file=(path:string,url?:string)=>({path,url,orig_name:photo.name,meta:{_type:"gradio.FileData"}});
 const data=[{background:file(paths[0]),layers:[],composite:null},file(product.imageUrl,product.imageUrl),product.name,true,false,20,42];
 const joined=await fetch(`${zeroGpu}/queue/join`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data,fn_index:2,trigger_id:25,session_hash:session})});
 if(!joined.ok)throw new Error(joined.status===503?"The free AI queue is full. Try again shortly.":"The free AI could not start.");
 const stream=await fetch(`${zeroGpu}/queue/data?session_hash=${session}`);if(!stream.ok)throw new Error("The free AI queue disconnected.");
 const messages=(await stream.text()).split("\n").filter(line=>line.startsWith("data: ")).map(line=>{try{return JSON.parse(line.slice(6))}catch{return null}}).filter(Boolean),completed=messages.find(message=>message.msg==="process_completed");
 if(!completed?.success)throw new Error(completed?.output?.error||"Free AI generation failed.");
 const output=completed.output?.data?.[0]?.url;if(!output)throw new Error("The free AI returned no image.");
 const image=await fetch(output);if(!image.ok)throw new Error("The generated image expired. Try again.");return image.blob();
}

export default function PhotoStudio(){
 const input=useRef<HTMLInputElement>(null),[photo,setPhoto]=useState<Upload|null>(null),[productId,setProductId]=useState(products[0].id),[hoveredId,setHoveredId]=useState(products[0].id),[result,setResult]=useState(""),[status,setStatus]=useState(""),[busy,setBusy]=useState(false);
 const selectedProduct=products.find(product=>product.id===productId)??products[0],previewProduct=products.find(product=>product.id===hoveredId)??selectedProduct;
 useEffect(()=>()=>{if(result)URL.revokeObjectURL(result)},[result]);
 useEffect(()=>()=>{if(photo)URL.revokeObjectURL(photo.url)},[photo]);
 function clearResult(){if(result)URL.revokeObjectURL(result);setResult("")}
 function upload(file?:File){if(!file)return;if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setStatus("Please use JPG, PNG or WebP.");return}if(file.size>8*1024*1024){setStatus("Keep the photo under 8 MB.");return}clearResult();setPhoto({file,url:URL.createObjectURL(file)});setStatus("Photo ready on this device. Choose a garment and generate your preview.");if(input.current)input.current.value=""}
 async function loadDemo(){setBusy(true);setStatus("Preparing the demo model…");try{const response=await fetch("/demo-model.png"),blob=await response.blob();upload(new File([blob],"drapepk-demo-model.png",{type:"image/png"}))}catch{setStatus("The demo model could not be loaded.")}finally{setBusy(false)}}
 function remove(){clearResult();setPhoto(null);setStatus("Photo removed from this device.")}
 async function generate(){if(!photo)return;setBusy(true);clearResult();setStatus("Preparing your photo without changing its proportions…");try{const preparedPhoto=await preparePortrait(photo.file);setStatus("AI is creating your private preview. Free requests may wait briefly in a queue…");let image:Blob;if(location.hostname!=="localhost"&&location.hostname!=="127.0.0.1")image=await freeTryOn(preparedPhoto,productId);else{const body=new FormData();body.append("photo",preparedPhoto);body.append("productId",productId);const response=await fetch("/api/try-on",{method:"POST",body});if(!response.ok){const text=await response.text();let message=`Try-on unavailable (${response.status}).`;try{message=JSON.parse(text).error||message}catch{}throw new Error(message)}image=await response.blob()}setResult(URL.createObjectURL(image));setStatus("AI preview generated with the original body proportions preserved. Visual appearance only—not a sizing guarantee.")}catch(error){setStatus(error instanceof Error?error.message:"Generation failed.")}finally{setBusy(false)}}
 return <section className="photo-studio"><div><span>PRIVATE FITTING PROFILE / 01</span><h2>Your photo,<br/><i>under your control.</i></h2><p>Choose one clear, full-body photo. It stays in your browser until you request a preview, then is processed once by the configured AI provider and is not retained by this site.</p><ul><li>Stand straight, facing the camera</li><li>Use bright, even lighting</li><li>JPG, PNG or WebP · maximum 8 MB</li></ul><a className="demo-download" href="/demo-model.png" download>Download demo person image ↓</a></div><div className={`dropzone ${photo?"has-photo":""}`}>{photo?<><img src={photo.url} alt="Your uploaded full-body preview"/><div className="try-controls"><details className="garment-picker" onToggle={event=>{if(event.currentTarget.open)setHoveredId(productId)}}><summary><span>{selectedProduct.brand}</span>{selectedProduct.name}<b>⌄</b></summary><div className="garment-menu"><div className="garment-preview"><img src={previewProduct.imageUrl} alt={previewProduct.name}/><span>{previewProduct.brand} · {previewProduct.category}</span><strong>{previewProduct.name}</strong></div><div className="garment-options">{products.map(product=><button type="button" key={product.id} className={product.id===productId?"selected":""} onMouseEnter={()=>setHoveredId(product.id)} onFocus={()=>setHoveredId(product.id)} onClick={event=>{setProductId(product.id);setHoveredId(product.id);event.currentTarget.closest("details")?.removeAttribute("open")}}><img src={product.imageUrl} alt=""/><span>{product.brand}<b>{product.name}</b></span></button>)}</div></div></details><button onClick={()=>void generate()} disabled={busy}>{busy?"Generating…":"Try it on"}</button></div><div className="photo-actions"><button onClick={()=>input.current?.click()} disabled={busy}>Replace photo</button><button onClick={remove} disabled={busy}>Delete</button></div>{result&&<div className="try-result"><figure><img src={photo.url} alt="Before try-on"/><figcaption>BEFORE</figcaption></figure><figure><img src={result} alt="AI-generated virtual try-on"/><figcaption>AI PREVIEW</figcaption></figure><button onClick={clearResult}>Close</button></div>}</>:<div className="drop-actions"><button onClick={()=>input.current?.click()} disabled={busy}><b>＋</b><strong>Add a full-body photo</strong><small>Choose from this device</small></button><span>or</span><button className="demo-button" onClick={()=>void loadDemo()} disabled={busy}>Use demo person</button></div>}<input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>upload(event.target.files?.[0])}/>{status&&<p className="try-note" role="status">{status}</p>}</div></section>
}
