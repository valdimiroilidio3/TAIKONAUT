import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

// One-time, idempotent migration. No commercial product fields are modified.
const mapping = {
  'archive-mozdrian-1.jpg': 'campaigns/arrival/mozdrian-editorial.webp',
  'archive-mozdrian-2.jpg': 'details/mozdrian/colour-block-knit.webp',
  'campaign-dsc07420.jpg': 'campaigns/signature/white-tee-editorial.webp',
  'logo-official.png': 'brand/taikonaut-wordmark.png',
  'black-tee-1.jpg': 'products/black-basic-tee/front.webp',
  'white-tee-1.jpg': 'products/white-basic-tee/front.webp',
  'red-hoodie-front.jpg': 'products/red-signature-hoodie/front.webp',
  'red-hoodie-back.jpg': 'products/red-signature-hoodie/back.webp',
  'blue-hoodie-front.jpg': 'products/blue-signature-hoodie/front.webp',
  'blue-hoodie-back.jpg': 'products/blue-signature-hoodie/back.webp',
  'yellow-hoodie-front.jpg': 'products/yellow-signature-hoodie/front.webp',
  'yellow-hoodie-back.jpg': 'products/yellow-signature-hoodie/back.webp',
  'day-map-front.jpg': 'products/day-map-jacket/front.webp',
  'day-map-back.jpg': 'products/day-map-jacket/back.webp',
  'day-map-other.jpg': 'details/map-jackets/day-map-close-up.webp',
  'night-map-front.jpg': 'products/night-map-jacket/front.webp',
  'night-map-back.jpg': 'products/night-map-jacket/back.webp',
  'night-map-other.jpg': 'details/map-jackets/night-map-close-up.webp',
  'black-sunnies-profile.jpg': 'products/black-taikosunnies/profile.webp',
  'black-sunnies-layed.jpg': 'products/black-taikosunnies/front.webp',
  'black-sunnies-side.jpg': 'details/taikosunnies/black-temple.webp',
  'tortoise-sunnies-profile.jpg': 'products/tortoise-shell-taikosunnies/profile.webp',
  'tortoise-sunnies-layed.jpg': 'products/tortoise-shell-taikosunnies/front.webp',
  'tortoise-sunnies-side.jpg': 'details/taikosunnies/tortoise-temple.webp',
  'pin-1.jpg': 'products/taikonaut-pin/front.webp',
  'pin-2.jpg': 'products/taikonaut-pin/back.webp',
  'manga-1.jpg': 'products/manga-tee/front.webp',
  'manga-2.jpg': 'community/fruit-series/manga-on-model.webp',
  'manga-3.jpg': 'details/fruit-series/manga-print.webp',
  'tintsiva-1.jpg': 'products/tintsiva-tee/front.webp',
  'tintsiva-2.jpg': 'community/fruit-series/tintsiva-on-model.webp',
  'tintsiva-3.jpg': 'details/fruit-series/tintsiva-print.webp',
  'tee-size-chart.jpg': 'brand/size-guides/tees.webp',
  'hoodie-size-chart.jpg': 'brand/size-guides/hoodies.webp',
  'map-size-chart.jpg': 'brand/size-guides/jackets.webp',
};
const exists = async (p) => !!(await fs.stat(p).catch(() => null));
const aliases = {};
const inventory = [];
let sourceProducts = [];
try { sourceProducts = JSON.parse(await fs.readFile('/tmp/taikonaut-products-source.json', 'utf8')); } catch {}
const ids = {
  'archive-mozdrian-1.jpg': '406024074', 'archive-mozdrian-2.jpg': '406024080',
  'black-tee-1.jpg': '432468099', 'white-tee-1.jpg': '432463071',
  'red-hoodie-front.jpg': '430358565', 'red-hoodie-back.jpg': '430358568',
  'blue-hoodie-front.jpg': '430358664', 'blue-hoodie-back.jpg': '430358667',
  'yellow-hoodie-front.jpg': '430358748', 'yellow-hoodie-back.jpg': '430358754',
  'day-map-front.jpg': '407776554', 'day-map-back.jpg': '407776557', 'day-map-other.jpg': '407776560',
  'night-map-front.jpg': '407776626', 'night-map-back.jpg': '407776623', 'night-map-other.jpg': '407776629',
  'black-sunnies-profile.jpg': '421630395', 'black-sunnies-layed.jpg': '421630398', 'black-sunnies-side.jpg': '421630401',
  'tortoise-sunnies-profile.jpg': '421640292', 'tortoise-sunnies-layed.jpg': '421640295', 'tortoise-sunnies-side.jpg': '421640298',
  'pin-1.jpg': '3a4bb2f5', 'pin-2.jpg': '412450350', 'manga-1.jpg': '407969397',
  'manga-2.jpg': '407970084', 'manga-3.jpg': '407970081', 'tintsiva-1.jpg': '404953929',
  'tintsiva-2.jpg': '405962784', 'tintsiva-3.jpg': '405962781',
  'tee-size-chart.jpg': '432468102', 'hoodie-size-chart.jpg': '430549362', 'map-size-chart.jpg': '426801177',
};
let oldBytes = 0;
let newBytes = 0;
for (const [old, dest] of Object.entries(mapping)) {
  const src = `public/images/official/${old}`;
  const target = `public/images/${dest}`;
  aliases[`/images/official/${old}`] = `/images/${dest}`;
  await fs.mkdir(path.dirname(target), { recursive: true });
  if (await exists(src)) {
    oldBytes += (await fs.stat(src)).size;
    if (dest.endsWith('.png')) await fs.copyFile(src, target);
    else await sharp(src).rotate().webp({ quality: 82, effort: 5 }).toFile(target);
  } else if (!(await exists(target))) throw new Error(`Source missing: ${src}`);
  const data = await fs.readFile(target);
  const meta = await sharp(data).metadata();
  newBytes += data.length;
  let source = sourceProducts.flatMap(p => p.images).find(i => ids[old] && i.url.includes(ids[old]))?.url;
  if (old === 'campaign-dsc07420.jpg') source = 'https://assets.bigcartel.com/theme_images/170288817/DSC07420.jpg';
  if (old === 'logo-official.png') source = 'https://assets.bigcartel.com/theme_images/142540656/OFFICIAL+LOGO+1W.png';
  inventory.push({ path: `/images/${dest}`, category: dest.split('/')[0], source: source?.split('?')[0] ?? 'https://www.taikonautmaputo.com/', width: meta.width, height: meta.height, bytes: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex'), status: 'available', provenance: 'Published on the official Taikonaut store; no generated imagery.' });
}

// Derivatives are crops of actual photography, NOT generated frames or video.
const model = 'public/images/campaigns/arrival/mozdrian-editorial.webp';
for (const [name, w, h] of [['poster-desktop', 1600, 1000], ['poster-mobile', 720, 1080], ['social', 1200, 630]]) {
  const target = `public/images/campaigns/arrival/${name}.webp`;
  await sharp(model).resize(w, h, { fit: 'cover', position: 'centre' }).webp({ quality: 83, effort: 6 }).toFile(target);
  const data = await fs.readFile(target);
  inventory.push({ path: target.replace('public', ''), category: 'campaigns', source: '/images/campaigns/arrival/mozdrian-editorial.webp', width: w, height: h, bytes: data.length, status: 'available', provenance: 'Photographic crop of the official archive image. Not a video frame.' });
}

const productsFile = 'src/data/products.json';
const products = JSON.parse(await fs.readFile(productsFile, 'utf8'));
for (const p of products) {
  for (const img of Object.values(p.images)) if (aliases[img.src]) img.src = aliases[img.src];
  if (p.slug === 'coming-back-soon') {
    p.images = { front: { src: '', altPt: 'Fotografia oficial ainda não disponibilizada', altEn: 'Official photograph not yet supplied' } };
    p.imageMissing = true;
  }
}
await fs.writeFile(productsFile, JSON.stringify(products, null, 2) + '\n');

async function replaceReferences(dir) {
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, ent.name);
    if (ent.isDirectory()) await replaceReferences(file);
    else if (/\.(tsx?|css|json)$/.test(file) && !file.endsWith('asset-aliases.json')) {
      let text = await fs.readFile(file, 'utf8');
      for (const [from, to] of Object.entries(aliases)) text = text.replaceAll(from, to);
      await fs.writeFile(file, text);
    }
  }
}
await replaceReferences('src');
await fs.writeFile('src/data/asset-aliases.json', JSON.stringify(aliases, null, 2) + '\n');
await fs.mkdir('public/videos/campaigns/arrival', { recursive: true });
await fs.mkdir('public/videos/campaigns/homecoming', { recursive: true });
await fs.mkdir('public/videos/details', { recursive: true });
await fs.mkdir('public/videos/community', { recursive: true });
const missing = [
  { path: '/videos/campaigns/arrival/desktop.mp4', status: 'missing', required: true, spec: 'H.264, 1920×1080, 24/25fps, 12–20s, silent, faststart, <5MB' },
  { path: '/videos/campaigns/arrival/mobile.mp4', status: 'missing', required: true, spec: 'H.264, 720×1080 or 720×1280, manually reframed, silent, <2MB' },
  { path: '/videos/campaigns/arrival/desktop.webm', status: 'missing', required: false, spec: 'Optional VP9 alternate, same edit and framing as desktop.mp4' },
  { path: '/videos/campaigns/arrival/mobile.webm', status: 'missing', required: false, spec: 'Optional VP9 alternate, same edit and framing as mobile.mp4' },
  { path: '/videos/campaigns/homecoming/film.mp4', status: 'missing', required: false, spec: 'Authorised export of The Homecoming Pop-Up film linked on the official store. Public MP4 access returned 403.' },
  { product: 'coming-back-soon', path: '/images/products/coming-back-soon/front.webp', status: 'missing', required: false, spec: 'Supply the genuine product image. The interface currently displays an explicit text-only unavailable state.' },
];
await fs.writeFile('src/data/asset-inventory.json', JSON.stringify({ sourceStore: 'https://www.taikonautmaputo.com/', reviewLink: 'https://vimeo.com/reviews/d89b7069-5905-42a7-947f-bfd9920a35ad/videos/1246028289', rightsNote: 'Sourced from the brand’s own public shop for this requested redesign. No Instagram files or private Vimeo files have been downloaded. Confirm publication rights for any future supplied media.', images: inventory, missing }, null, 2) + '\n');
await fs.rm('public/images/official', { recursive: true, force: true });
console.log(`Organized ${Object.keys(mapping).length} assets + 3 photographic derivatives. ${(oldBytes/1024/1024).toFixed(2)} MB → ${(newBytes/1024/1024).toFixed(2)} MB.`);
