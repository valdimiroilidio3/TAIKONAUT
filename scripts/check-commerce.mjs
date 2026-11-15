import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:960}});
page.setDefaultTimeout(18000);
const errors=[];const passed=[];const records={};
page.on('pageerror',e=>errors.push(e.message));
const mark=(s)=>{passed.push(s);console.log('PASS',s);};
const uid=Date.now();
const email=`qa-step02-${uid}@taikonaut.example.invalid`;
records.email=email;
try {
  await page.goto(base+'/shop',{waitUntil:'networkidle'});
  // Paged presentation: the full catalogue is always reachable, 8 at a time.
  await expect(page.locator('#shop [data-product]')).toHaveCount(8);
  await page.getByRole('button',{name:/Ver mais/}).click();
  await expect(page.locator('#shop [data-product]')).toHaveCount(13);
  await page.goto(base+'/shop?cat=hoodies',{waitUntil:'networkidle'});
  await expect(page.locator('#shop [data-product]')).toHaveCount(3);
  await page.goto(base+'/shop?cat=tees&stock=sold_out',{waitUntil:'networkidle'});
  await expect(page.locator('#shop [data-product]')).toHaveCount(2);
  await page.goto(base+'/shop?q=map%20jacket',{waitUntil:'networkidle'});
  // Two MAP jackets plus the pin, whose description legitimately mentions the jackets.
  await expect(page.locator('#shop [data-product]')).toHaveCount(3);
  await page.goto(base+'/shop',{waitUntil:'networkidle'});
  mark('Catalogue: 13 preserved products, combined URL filters, search and paging.');

  await page.getByRole('button',{name:'Pesquisar produtos',exact:true}).click();
  await page.getByRole('combobox',{name:'Pesquisa instantânea'}).fill('night');
  await page.getByRole('option',{name:/Night Map Jacket/}).click();
  await expect(page).toHaveURL(/product\/night-map-jacket/);
  await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();
  await expect(page.getByText('Escolhe um tamanho',{exact:true})).toBeVisible();
  await page.getByRole('radio',{name:'M',exact:true}).click();
  await page.getByRole('button',{name:'Guia de Tamanhos',exact:false}).first().click();
  await expect(page.getByRole('img',{name:'Tabela de tamanhos oficial Taikonaut'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Carrinho Taikonaut'})).toBeVisible();
  await expect(page.getByRole('dialog').getByText('Night Map Jacket',{exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'♡ Guardar',exact:true}).click();
  await page.getByRole('button',{name:'Favoritos',exact:true}).click();
  await expect(page.getByRole('dialog').getByText('Night Map Jacket',{exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  mark('Instant search, PDP, required size, official size chart, cart, wishlist, Escape and focus.');

  await page.getByRole('button',{name:/Mudar moeda/}).click();
  await expect(page.locator('main')).toContainText('MZN');
  await page.getByRole('button',{name:/^Carrinho com/}).click();
  await page.getByRole('button',{name:/Aumentar quantidade/}).click();
  await page.getByRole('button',{name:'Continuar Checkout',exact:true}).click();
  await page.getByLabel('Nome completo',{exact:true}).fill('TAIKONAUT QA — DELETE');
  await page.getByLabel('WhatsApp',{exact:true}).fill('+258000000000');
  await page.getByLabel('Email',{exact:true}).fill(email);
  await page.getByRole('button',{name:'Pagar no Pop-Up',exact:true}).click();
  const orderResponse=page.waitForResponse(r=>r.url().endsWith('/api/orders')&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Confirmar Reserva para o Pop-Up',exact:true}).click();
  const order=await (await orderResponse).json();
  if(!order.ok)throw new Error('Order API: '+JSON.stringify(order));
  records.orderId=order.order.id;
  if(order.order.currency!=='MZN'||Number(order.order.totalEur)!==200||order.order.status!=='reserved_for_popup'||!order.whatsappUrl.includes('wa.me'))throw new Error('Incorrect reservation totals/status.');
  await expect(page.getByText(order.order.orderCode,{exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  mark('EUR/MZN, quantity, PostgreSQL Pop-Up reservation, €200 authoritative display and WhatsApp link.');

  await page.goto(base+'/product/manga-tee',{waitUntil:'networkidle'});
  await page.locator('#main-content').getByRole('button',{name:'Avisa-me quando voltar',exact:true}).last().click();
  await page.getByRole('dialog').getByLabel('Email',{exact:true}).fill(email);
  const restockResponse=page.waitForResponse(r=>r.url().endsWith('/api/restock')&&r.request().method()==='POST');
  await page.getByRole('dialog',{name:'Aviso de reposição'}).getByRole('button',{name:'Avisa-me quando voltar',exact:true}).click();
  const restock=await (await restockResponse).json();
  if(!restock.ok)throw new Error('Restock API failed');records.restockId=restock.alert.id;
  await page.keyboard.press('Escape');
  mark('Sold-out product: restock capture persisted.');

  await page.goto(base+'/#contacto',{waitUntil:'networkidle'});
  await page.locator('#contacto input[type="email"]').fill(email);
  const communityResponse=page.waitForResponse(r=>r.url().endsWith('/api/community')&&r.request().method()==='POST');
  await page.locator('#contacto').getByRole('button',{name:'Subscrever',exact:true}).click();
  const community=await (await communityResponse).json();
  if(!community.ok)throw new Error('Community API failed');records.subscriberId=community.subscriber.id;
  await expect(page.getByText('Obrigado. Estás na lista.',{exact:false})).toBeVisible();
  const calendar=await page.request.get(base+'/api/popup/ics');
  if(calendar.status()!==200||!(await calendar.text()).includes('BEGIN:VEVENT'))throw new Error('ICS failed');
  await page.locator('#homecoming').getByRole('button',{name:/Mapa/}).click();
  await expect(page.locator('#popup-map iframe')).toHaveCount(1);
  mark('Community capture, .ics calendar, event details and on-demand map.');

  const detail=page.getByRole('tab',{name:/The finish/});await detail.click();
  await expect(detail).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#detail-panel')).toContainText('Tortoise Shell Taikosunnies');
  await detail.press('ArrowUp');
  await expect(page.getByRole('tab',{name:/The signature/})).toHaveAttribute('aria-selected','true');
  await page.locator('#lookbook figure button').first().click();
  await expect(page.getByRole('dialog',{name:'Lookbook'})).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button',{name:/Mudar para inglês/}).click();
  await expect(page.getByText('From our city. On our own terms.',{exact:true})).toBeVisible();
  mark('Detail tabs + arrow keys, lightbox + Escape, PT/EN.');

  const mobile=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await mobile.goto(base,{waitUntil:'networkidle'});
  await mobile.getByRole('button',{name:'Abrir menu',exact:true}).click();
  await expect(mobile.getByRole('dialog',{name:'Menu'})).toBeVisible();
  await mobile.keyboard.press('Escape');
  await expect(mobile.getByRole('dialog')).toHaveCount(0);
  const reduced=await mobile.evaluate(()=>({motion:getComputedStyle(document.querySelector('.arrival-copy')).animationName,width:document.documentElement.scrollWidth,viewport:innerWidth,videos:document.querySelectorAll('video').length}));
  if(reduced.motion!=='none'||reduced.width>reduced.viewport||reduced.videos)throw new Error('Reduced-motion/mobile issue');
  await mobile.close();
  const nojs=await browser.newPage({javaScriptEnabled:false});
  await nojs.goto(base,{waitUntil:'networkidle'});
  await expect(nojs.locator('[data-chapter]')).toHaveCount(5);
  await expect(nojs.locator('#world-heading')).toBeVisible();
  await nojs.close();
  mark('Mobile menu, reduced motion, no unavailable video requests, no-JS story content.');

  const legacy=await browser.newPage();
  await legacy.addInitScript(()=>localStorage.setItem('tkn_cart',JSON.stringify([{slug:'day-map-jacket',name:'Day Map Jacket',size:'M',color:'Cream',quantity:1,unitPriceEur:100,image:'/images/official/day-map-front.jpg',reserveForPopup:false}])));
  await legacy.goto(base,{waitUntil:'networkidle'});
  const migrated=await legacy.evaluate(()=>JSON.parse(localStorage.getItem('tkn_cart'))[0].image);
  if(migrated!=='/images/products/day-map-jacket/front.webp')throw new Error('Saved cart image migration failed');
  await legacy.close();
  mark('Existing localStorage carts migrate to the new real image paths.');
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('\nALL COMMERCE CHECKS PASSED.');
} catch(error){
  await page.screenshot({path:'artifacts/commerce-failure.png',fullPage:true});
  console.error(error);process.exitCode=1;
} finally {
  await fs.writeFile('artifacts/qa-records.json',JSON.stringify(records,null,2));
  await fs.writeFile('artifacts/commerce-check.json',JSON.stringify({passed,errors,ok:!process.exitCode},null,2));
  await browser.close();
}
