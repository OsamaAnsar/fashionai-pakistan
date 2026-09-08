import {mkdir,readFile,writeFile} from "node:fs/promises";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const products=JSON.parse(await readFile(resolve(root,"src/data/products.json"),"utf8"));
const columns=["id","brand","name","category","gender","price_pkr","colors","sizes","image_url","product_url"];
const quote=value=>`"${String(value??"").replaceAll('"','""')}"`;
const rows=products.map(product=>[
 product.id,product.brand,product.name,product.category,product.gender,product.price,
 (product.colors??[]).join(" | "),(product.sizes??[]).join(" | "),product.imageUrl,product.productUrl,
].map(quote).join(","));
const output=resolve(root,"huggingface/pakistani-fashion-catalogue/train.csv");
await mkdir(dirname(output),{recursive:true});
await writeFile(output,[columns.join(","),...rows].join("\n")+"\n");
console.log(`Exported ${products.length} products to ${output}`);
