import catalogue from "@/data/products.json";
export type Product={id:string;brand:string;name:string;category:string;gender:string;price:number;imageUrl:string;productUrl:string;colors?:string[];sizes?:string[]};
export const products:Product[]=catalogue;
