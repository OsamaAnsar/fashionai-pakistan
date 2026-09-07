"use client";
import {useMemo,useState} from "react";
import {products,type Product} from "@/lib/products";

const money=(value:number)=>new Intl.NumberFormat("en-PK",{style:"currency",currency:"PKR",maximumFractionDigits:0}).format(value);
const priceCeiling=Math.ceil(Math.max(...products.map(product=>product.price))/1000)*1000;
const initialCount=12,loadCount=12;

export default function Catalogue(){
 const [query,setQuery]=useState(""),[brand,setBrand]=useState("All brands"),[category,setCategory]=useState("All pieces"),[maxPrice,setMaxPrice]=useState(priceCeiling),[selected,setSelected]=useState<Product|null>(null),[visible,setVisible]=useState(initialCount);
 const filtered=useMemo(()=>products.filter(product=>(brand==="All brands"||product.brand===brand)&&(category==="All pieces"||product.category===category)&&product.price<=maxPrice&&`${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query.toLowerCase())),[query,brand,category,maxPrice]);
 const displayed=filtered.slice(0,visible),resetList=()=>setVisible(initialCount);
 const clear=()=>{setQuery("");setBrand("All brands");setCategory("All pieces");setMaxPrice(priceCeiling);resetList()};
 return <>
  <header><a className="logo" href="#">Drape<span>PK</span></a><nav><a href="#shop">Discover</a><a href="#about">Our idea</a><button>Saved <b>0</b></button></nav></header>
  <main>
   <section className="hero"><div className="hero-copy"><div className="eyebrow">Pakistan’s multi-brand AI fitting room</div><h1>Find your next look,<br/><i>across every label.</i></h1><p>Explore real pieces from five Pakistani fashion brands, find visual matches and preview garments with AI.</p><a href="#shop">Explore the latest edit <span>↘</span></a></div><div className="hero-visual"><img src={products[0].imageUrl} alt={`${products[0].name} by ${products[0].brand}`}/><div className="hero-stamp">AI<br/>TRY-ON<br/>READY</div><div className="hero-note">75 official listings.<br/>Five labels, one wardrobe.</div></div></section>
   <section id="about" className="manifesto"><span>THE IDEA</span><p>One fitting room. Every brand.</p><small>Discover · Match · Style · Try on · Visit the brand</small></section>
   <section id="shop" className="shop">
    <div className="shop-head"><div><span>OFFICIAL BRAND EDIT / 001</span><h2>Pieces worth trying</h2></div><p>Real product names, images and prices cached from official brand catalogues. Confirm current stock and pricing on the linked product page.</p></div>
    <div className="filters">
     <label>Search<input value={query} onChange={event=>{setQuery(event.target.value);resetList()}} placeholder="Shirt, denim, brand…"/></label>
     <label>Brand<select value={brand} onChange={event=>{setBrand(event.target.value);resetList()}}>{["All brands",...new Set(products.map(product=>product.brand))].map(value=><option key={value}>{value}</option>)}</select></label>
     <label>Category<select value={category} onChange={event=>{setCategory(event.target.value);resetList()}}>{["All pieces",...new Set(products.map(product=>product.category))].map(value=><option key={value}>{value}</option>)}</select></label>
     <label>Up to <b>{money(maxPrice)}</b><input type="range" min="2000" max={priceCeiling} step="500" value={maxPrice} onChange={event=>{setMaxPrice(Number(event.target.value));resetList()}}/></label>
    </div>
    <div className="result-line"><span>Showing {displayed.length} of {filtered.length} matching pieces</span><button onClick={clear}>Clear filters</button></div>
    <div className="grid">{displayed.map((product,index)=><article key={product.id} onClick={()=>setSelected(product)}><div className="image"><img src={product.imageUrl} alt={product.name}/><span>{String(index+1).padStart(2,"0")}</span><button>View piece</button></div><div className="meta"><div><small>{product.brand} · {product.category}</small><h3>{product.name}</h3></div><strong>{money(product.price)}</strong></div></article>)}</div>
    {!filtered.length&&<div className="empty">No pieces match this edit. Try a wider price or clear the filters.</div>}
    {displayed.length<filtered.length&&<div className="load-more"><button onClick={()=>setVisible(count=>Math.min(count+loadCount,filtered.length))}>Load more pieces <span>＋{Math.min(loadCount,filtered.length-displayed.length)}</span></button><small>{filtered.length-displayed.length} still to explore</small></div>}
   </section>
  </main>
  <footer><div className="logo">Drape<span>PK</span></div><p>Fashion discovery, designed in Pakistan.<br/>Product data belongs to its source brand.</p><a href="#">Back to top ↑</a></footer>
  {selected&&<div className="modal" role="dialog" aria-modal="true" onClick={()=>setSelected(null)}><article onClick={event=>event.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>Close ×</button><img src={selected.imageUrl} alt={selected.name}/><div className="details"><small>{selected.brand} / {selected.category}</small><h2>{selected.name}</h2><strong>{money(selected.price)}</strong><p>A real {selected.category.toLowerCase()} listing from {selected.brand}, ready for visual discovery and AI try-on.</p><dl><div><dt>Colours</dt><dd>{selected.colors?.join(" · ")||"See product page"}</dd></div><div><dt>Sizes</dt><dd>{selected.sizes?.join(" · ")||"See product page"}</dd></div><div><dt>For</dt><dd>{selected.gender}</dd></div></dl><a href={selected.productUrl} target="_blank" rel="noreferrer">Visit product at {selected.brand} ↗</a><em>Price and stock are a cached snapshot. Confirm both on the official brand page.</em></div></article></div>}
 </>;
}
