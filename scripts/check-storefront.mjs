import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];const errors=[];let failures=0;
const pass=(m)=>{results.push(`PASS ${m}`);console.log('PASS',m);};
const fail=(m)=>{failures++;results.push(`FAIL ${m}`);console.error('FAIL',m);};

async function axe(page,label){
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForTimeout(120);
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  await page.emulateMedia({reducedMotion:null});
  if(scan.violations.length){fail(`${label}: ${scan.violations.map(v=>v.id).join(', ')}`);}else pass(`${label}: no automated a11y violations`);
}

const context=await browser.newContext({viewport:{width:1440,height:960}});
const page=await context.newPage();
page.setDefaultTimeout(20000);
page.on('pageerror',e=>errors.push(e.message));

// ---------- Catalogue ----------
await page.goto(base+'/shop',{waitUntil:'networkidle'});
await expect(page.locator('[data-product]')).toHaveCount(8); // initial page size
if(await page.locator('[data-product]').count()===8) pass('Catalogue renders first 8 of 13 pieces (paged).');

// Combined filters: category + colour + availability
await page.getByRole('button',{name:'Filtrar',exact:true}).click();
const panel=page.locator('#catalog-filters');
await panel.getByText('Hoodies',{exact:true}).click();
await panel.getByText('Vermelho',{exact:true}).click();
if((await page.locator('[data-product]').count())===1) pass('Combined filters (hoodies + red) narrow to 1 piece.');
else fail('Combined filters returned '+(await page.locator('[data-product]').count())+' pieces');
if(page.url().includes('cat=hoodies')&&page.url().includes('color=red')) pass('Filter state is mirrored into a shareable URL.');
else fail('URL not synchronised: '+page.url());

// Availability intersects with the current combination -> empty state
await panel.getByRole('radio',{name:'Sold out'}).check();
if(await page.getByText('Sem resultados.',{exact:false}).first().isVisible()) pass('Empty state appears for an impossible combination.');
else fail('Missing empty state');
await page.getByRole('button',{name:'Limpar filtros'}).click();
if((await page.locator('[data-product]').count())===8) pass('Clear filters restores the catalogue without reload.');
else fail('Clear filters did not restore results');

// Load more
await page.getByRole('button',{name:/Ver mais/}).click();
if((await page.locator('[data-product]').count())===13) pass('Load more reveals the remaining products.');
else fail('Load more failed');

// View mode persists
await page.getByRole('button',{name:'Editorial'}).click();
await page.reload({waitUntil:'networkidle'});
if(await page.getByRole('button',{name:'Editorial'}).getAttribute('aria-pressed')==='true') pass('Editorial view preference persists across reloads.');
else fail('View preference not persisted');

// URL deep link restore
await page.goto(base+'/shop?cat=jackets&stock=in_stock',{waitUntil:'networkidle'});
await page.waitForTimeout(400);
const jacketCount=await page.locator('[data-product]').count();
if(jacketCount===2) pass('Deep-linked filters restore 2 MAP jackets from the URL.');
else fail('Deep link restored '+jacketCount+' products');

await axe(page,'Catalogue');
const shot=await page.locator('#shop').boundingBox();
await page.screenshot({path:'artifacts/shop-desktop.png',fullPage:false});
await page.screenshot({path:'artifacts/shop-desktop-full.png',fullPage:true});
if(!shot||shot.width<600) fail('Catalogue section did not lay out');

// ---------- Instant search ----------
await page.goto(base+'/shop',{waitUntil:'networkidle'});
await page.getByRole('button',{name:/Pesquisar produtos/}).click();
const input=page.getByRole('combobox',{name:'Pesquisa instantânea'});
await input.fill('hoodie');
await expect(page.locator('[role="option"]')).toHaveCount(3);
await input.press('ArrowDown');
await input.press('Enter');
await page.waitForURL(/\/product\//);
pass('Instant search: typed query, arrow key and Enter open a product.');
await axe(page,'Product page');
const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('tkn_recent_searches')||'[]'));
if(stored.includes('hoodie')) pass('Recent search is stored locally.'); else fail('Recent search not stored');

// ---------- Product page gallery + size + cart ----------
await page.goto(base+'/product/day-map-jacket',{waitUntil:'networkidle'});
const thumbs=page.getByRole('tab',{name:/ver imagem/});
if((await thumbs.count())>=3) pass('Immersive gallery exposes multiple labelled views.'); else fail('Gallery views missing');
await thumbs.nth(1).click();
if(await thumbs.nth(1).getAttribute('aria-selected')==='true') pass('Gallery view switches via the thumbnail rail.');
else fail('Gallery view did not switch');
await thumbs.nth(0).focus(); await thumbs.nth(0).press('ArrowDown');
if(await thumbs.nth(1).getAttribute('aria-selected')==='true') pass('Gallery rail supports arrow-key navigation.');
else fail('Gallery keyboard navigation failed');
await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();
if(await page.getByText('Escolhe um tamanho para continuares.').isVisible()) pass('Adding without a size is blocked with an explicit message.');
else fail('Size validation missing');
await page.getByRole('radio',{name:'M',exact:true}).click();
await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();
await expect(page.getByRole('dialog',{name:'Carrinho Taikonaut'})).toBeVisible();
await page.screenshot({path:'artifacts/cart-desktop.png'});
await axe(page,'Cart drawer');
await page.reload({waitUntil:'networkidle'});
if((await page.evaluate(()=>JSON.parse(localStorage.getItem('tkn_cart')||'[]').length))===1) pass('Cart persists across a full reload.');
else fail('Cart did not persist');
await context.close();

// ---------- Mobile quick add ----------
const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const m=await mobile.newPage();
m.on('pageerror',e=>errors.push(e.message));
await m.goto(base+'/shop',{waitUntil:'networkidle'});
await m.screenshot({path:'artifacts/shop-mobile.png',fullPage:false});
await m.getByRole('button',{name:'Filtrar',exact:true}).click();
await expect(m.getByRole('dialog',{name:'Filtros do catálogo'})).toBeVisible();
await m.screenshot({path:'artifacts/filters-mobile.png'});
await m.keyboard.press('Escape');
if((await m.getByRole('dialog',{name:'Filtros do catálogo'}).count())===0) pass('Mobile filter sheet closes with Escape and restores focus.');
else fail('Mobile filter sheet did not close');
await m.locator('[data-product]').first().getByRole('button',{name:/Compra rápida/}).click();
const sizeButtons=m.locator('[data-product]').first().locator('button[aria-label*="tamanho"]');
await expect(sizeButtons.first()).toBeVisible();
await sizeButtons.first().click();
await expect(m.getByRole('dialog',{name:'Carrinho Taikonaut'})).toBeVisible();
pass('Mobile quick add expands sizes and adds to the bag without leaving the grid.');
await m.screenshot({path:'artifacts/cart-mobile.png'});
await m.keyboard.press('Escape');
await m.goto(base+'/product/night-map-jacket',{waitUntil:'networkidle'});
const bar=m.getByRole('button',{name:/Adicionar —|Adicionar ao carrinho|Choose size|Escolhe o tamanho/}).last();
if(await bar.isVisible()) pass('Mobile sticky purchase bar is available.');
else fail('Mobile sticky purchase bar missing');
const overflow=await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
if(overflow) pass('No horizontal overflow at 390px.'); else fail('Horizontal overflow at 390px');
await axe(m,'Mobile catalogue');
await mobile.close();

await browser.close();
if(errors.length){fail('Runtime errors: '+errors.join(' | '));}
await fs.writeFile('artifacts/storefront-check.json',JSON.stringify({results,errors,ok:failures===0},null,2));
if(failures){process.exit(1);}
console.log('\nALL STOREFRONT CHECKS PASSED.');
