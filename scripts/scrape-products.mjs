import {mkdir,writeFile} from "node:fs/promises";

const stores=[
 ["Outfitters","https://outfitters.com.pk"],
 ["Breakout","https://www.breakout.com.pk"],
 ["Engine","https://engine.com.pk"],
 ["Cougar","https://www.cougar.com.pk"],
 ["Charcoal","https://charcoal.com.pk"],
];
const classify=title=>{if(/\b(sweatshirt|sweater|hoodie|kurta|pajama|sports bra|tank top|wrap top)\b/i.test(title))return null;if(/\b(jacket|coat|bomber|shacket)\b/i.test(title))return"Jackets";if(/\b(t[ -]?shirt|tee|polo)\b/i.test(title))return"T-Shirts";if(/\bshirt\b/i.test(title))return"Shirts";if(/\b(jean|denim)\b/i.test(title))return"Jeans";if(/\b(trouser|chino|pants?)\b/i.test(title))return"Trousers";return null};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const clean=value=>String(value||"").replace(/\s+/g," ").trim();

async function fetchStore(brand,base){const all=[];for(let page=1;page<=4;page++){const response=await fetch(`${base}/products.json?limit=250&page=${page}`,{headers:{"User-Agent":"DrapePK portfolio catalogue bot/1.0"}});if(!response.ok)throw new Error(`${brand}: HTTP ${response.status}`);const batch=(await response.json()).products||[];all.push(...batch);if(batch.length<250)break;await pause(350)}const seen=new Set(),normalized=[];for(const item of all){if(seen.has(item.handle)||!item.images?.[0]?.src)continue;seen.add(item.handle);const text=clean(`${item.title} ${item.product_type} ${(item.tags||[]).join(" ")}`),lower=text.toLowerCase();if(/\b(boys?|girls?|kids?|baby|toddler|junior)\b/.test(lower))continue;const category=classify(clean(item.title));if(!category)continue;const gender=/\bwom(en|an)|ladies|female\b/.test(lower)?"Women":/\bmen|male\b/.test(lower)||brand==="Charcoal"?"Men":"Unisex",variants=(item.variants||[]).filter(variant=>Number(variant.price)>0),variant=variants.find(entry=>entry.available)||variants[0];if(!variant)continue;const optionValues=pattern=>(item.options||[]).find(option=>pattern.test(option.name))?.values?.map(clean).filter(Boolean).slice(0,8)||[],sizes=optionValues(/size/i),colors=optionValues(/colou?r/i);normalized.push({id:`${brand.toLowerCase()}-${item.id}`,brand,name:clean(item.title),category,gender,price:Math.round(Number(variant.price)),imageUrl:item.images[0].src.startsWith("//")?`https:${item.images[0].src}`:item.images[0].src,productUrl:`${base}/products/${item.handle}`,colors,sizes})}const selected=[],limits=new Map();for(const product of normalized){const count=limits.get(product.category)||0;if(count<3&&selected.length<15){selected.push(product);limits.set(product.category,count+1)}}for(const product of normalized){if(selected.length>=15)break;if(!selected.some(item=>item.id===product.id))selected.push(product)}console.log(`${brand}: ${selected.length} from ${normalized.length} matching products`);return selected}

const products=[];for(const [brand,base] of stores){try{products.push(...await fetchStore(brand,base))}catch(error){console.warn(error.message)}await pause(500)}
if(products.length<40)throw new Error(`Only ${products.length} products found; keeping the previous cache is safer.`);
await mkdir("src/data",{recursive:true});await writeFile("src/data/products.json",JSON.stringify(products,null,2)+"\n");
console.log(`Saved ${products.length} unique official listings.`);
