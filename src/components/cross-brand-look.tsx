"use client";
import {FormEvent,useState} from "react";
import {products,Product} from "@/lib/products";

export default function CrossBrandLook(){
 const [prompt,setPrompt]=useState("A smart casual dinner look under 20,000"),[items,setItems]=useState<Product[]>([]),[note,setNote]=useState("Three pieces. Three brands. One complete direction."),[busy,setBusy]=useState(false);
 async function create(event:FormEvent){event.preventDefault();setBusy(true);setNote("Building a coordinated cross-brand look…");try{const response=await fetch("/api/looks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})}),result=await response.json();if(!response.ok)throw new Error(result.error);setItems((result.ids as string[]).map(id=>products.find(product=>product.id===id)).filter((item):item is Product=>Boolean(item)));setNote(result.note)}catch(error){setNote(error instanceof Error?error.message:"Could not build this look.")}finally{setBusy(false)}}
 const total=items.reduce((sum,item)=>sum+item.price,0);
 const tryLook=()=>document.querySelector(".photo-studio")?.scrollIntoView({behavior:"smooth"});
 return <section className="cross-look"><div className="look-copy"><span>CROSS-BRAND LOOK / 04</span><h2>One outfit.<br/><i>No brand boundaries.</i></h2><form onSubmit={create}><input value={prompt} onChange={event=>setPrompt(event.target.value)} maxLength={180} aria-label="Describe your outfit"/><button disabled={busy}>{busy?"Building…":"Build my look"}</button></form><p role="status">{note}</p>{items.length===3&&<div className="look-total"><span>Total look</span><strong>PKR {total.toLocaleString()}</strong><button onClick={tryLook}>TRY THIS LOOK →</button></div>}</div><div className="look-items">{items.length?items.map((item,index)=><a href={item.productUrl} target="_blank" rel="noreferrer" key={item.id}><span>{index===0?"TOP":index===1?"BOTTOM":"LAYER"}</span><img src={item.imageUrl} alt=""/><b>{item.brand}</b><strong>{item.name}</strong></a>):<div className="look-empty"><b>＋</b><span>YOUR LOOK<br/>STARTS HERE</span></div>}</div></section>
}
