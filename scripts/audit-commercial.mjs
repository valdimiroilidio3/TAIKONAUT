import fs from 'node:fs/promises';

const fail=[];
const warn=[];
const products=JSON.parse(await fs.readFile('src/data/products.json','utf8'));
const baseline=JSON.parse(await fs.readFile('docs/catalog-baseline.json','utf8'));
const config=JSON.parse(await fs.readFile('src/data/event-config.json','utf8'));
const audit=JSON.parse(await fs.readFile('src/data/commercial-audit.json','utf8'));
const keys=({id,slug,name,priceEur,stock,soldOut,sizes})=>({id,slug,name,priceEur,stock,soldOut,sizes});

if(JSON.stringify(products.map(keys))!==JSON.stringify(baseline))fail.push('Unauthorized change to names, prices, stock, sold-out flags or sizes.');
if(audit.items.length<8)fail.push('Commercial audit checklist has fewer than 8 documented items.');
if(audit.status!=='unverified')warn.push('Audit no longer marked unverified. Only change this after written confirmation.');

const slugs=new Set();
for(const p of products){
  if(slugs.has(p.slug))fail.push(`Duplicate slug: ${p.slug}`); slugs.add(p.slug);
  if(!(p.priceEur>0))fail.push(`${p.slug}: price must be > 0`);
  if(!Array.isArray(p.sizes)||!p.sizes.length)fail.push(`${p.slug}: no sizes`);
  if(p.soldOut&&p.stock!==0)fail.push(`${p.slug}: soldOut with non-zero stock`);
  if(!p.soldOut&&p.stock<=0)fail.push(`${p.slug}: available with no stock`);
  if(p.imageMissing&&p.images.front.src)fail.push(`${p.slug}: flagged missing but has a path`);
  if(!p.images.front.src&&!p.imageMissing)fail.push(`${p.slug}: missing photo not declared`);
}
const stdSizes=new Set(['XS','S','M','L','XL','2XL']);
const incomplete=products.filter(p=>p.sizes.length>1&&!p.sizes.includes('XS')&&!p.sizes.includes('2XL'));
if(incomplete.length)warn.push(`${incomplete.length} products offer only S–XL although the official shop lists XS/2XL. Flagged for confirmation, not changed.`);

const rate=config.store.eurToMznRate;
if(!(rate>40&&rate<140))fail.push(`Suspicious EUR→MZN rate: ${rate}`);
const event=new Date(`${new Date().getFullYear()}-12-12T12:00:00+02:00`);
if(Number.isNaN(event.getTime()))fail.push('Event date cannot be parsed.');

console.log(`Products audited: ${products.length}. Commercial data identical to baseline: ${JSON.stringify(products.map(keys))===JSON.stringify(baseline)}.`);
console.log(`Documented open items: ${audit.items.length} (${audit.items.filter(i=>i.risk==='alta').length} high risk). No factual claims auto-corrected.`);
for(const w of warn)console.log('WARN ',w);
if(fail.length){console.error(fail.map(f=>'FAIL '+f).join('\n'));process.exit(1);}
console.log('PASS: structural commercial checks; confirmation with the brand still required.');
