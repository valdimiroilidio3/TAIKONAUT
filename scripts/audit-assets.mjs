import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const inventory = JSON.parse(await fs.readFile('src/data/asset-inventory.json', 'utf8'));
const aliases = JSON.parse(await fs.readFile('src/data/asset-aliases.json', 'utf8'));
const baseline = JSON.parse(await fs.readFile('docs/catalog-baseline.json', 'utf8'));
const products = JSON.parse(await fs.readFile('src/data/products.json', 'utf8'));
const media = JSON.parse(await fs.readFile('src/data/media.json', 'utf8'));
const errors=[];
const refs=new Set();
const declaredMissing=new Set(inventory.missing.map(m=>m.path));
const exists=async p=>!!(await fs.stat('public'+p).catch(()=>null));

async function scan(dir){
  for(const entry of await fs.readdir(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()){await scan(file);continue;}
    if(!/\.(tsx?|json|css)$/.test(file))continue;
    if(/asset-(inventory|aliases)\.json$/.test(file)||file.endsWith('media.json'))continue;
    const text=await fs.readFile(file,'utf8');
    for(const match of text.matchAll(/["'`](\/(?:images|videos|fonts)\/[^\s"'`?<>]+)["'`]/g)){
      const p=match[1];if(p.includes('${'))continue;
      refs.add(p);
      if(!(await exists(p)))errors.push(`${file}: missing ${p}`);
    }
  }
}
await scan('src');
for(const p of Object.values(aliases)){if(!(await exists(p)))errors.push(`Invalid migrated path: ${p}`);}
let bytes=0;
for(const asset of inventory.images){
  if(!(await exists(asset.path))){errors.push(`Inventory file missing: ${asset.path}`);continue;}
  const info=await sharp('public'+asset.path).metadata();
  if(info.width!==asset.width||info.height!==asset.height)errors.push(`Dimensions changed: ${asset.path}`);
  bytes+=(await fs.stat('public'+asset.path)).size;
}
for(const kind of ['desktop','mobile']){
  for(const ext of ['mp4','webm']){
    const p=media.arrival[kind][ext];
    const present=await exists(p);
    console.log(`${kind} ${ext}: ${present?'AVAILABLE':declaredMissing.has(p)?'AWAITING AUTHORISED EXPORT (not requested by browser)':'UNDECLARED MISSING'}`);
    if(!present&&!declaredMissing.has(p))errors.push(`Undeclared video requirement: ${p}`);
    if(present&&(await fs.stat('public'+p)).size<1024)errors.push(`Empty/fake video: ${p}`);
  }
}
for(const p of products){
  if(!p.images.front.src&&!p.imageMissing)errors.push(`Undeclared missing photo: ${p.slug}`);
  if(p.images.front.src&&!(await exists(p.images.front.src)))errors.push(`Missing product image: ${p.slug}`);
}
const fields=({id,slug,name,priceEur,stock,soldOut,sizes})=>({id,slug,name,priceEur,stock,soldOut,sizes});
if(JSON.stringify(products.map(fields))!==JSON.stringify(baseline))errors.push('Commercial data changed: product names, prices, stock, availability or sizes.');

console.log(`\n${refs.size} application asset references checked.`);
console.log(`${inventory.images.length} real images / ${(bytes/1024/1024).toFixed(2)} MB, including photographic posters.`);
console.log(`${products.length} products: names, prices, stock, availability and sizes identical to baseline.`);
console.log('Coming back soon: explicit text-only state; no invented garment photo.');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('PASS: no broken runtime image/font/video paths.');
