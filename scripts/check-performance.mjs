import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();
const failures=[];
const bytes={total:0,image:0,script:0,font:0,css:0,video:0};
page.on('response',async r=>{
  try{
    const type=r.request().resourceType();
    const len=Number(r.headers()['content-length']||0);
    if(!Number.isFinite(len))return;
    bytes.total+=len;
    if(type==='image'||/\/_next\/image/.test(r.url()))bytes.image+=len;
    else if(type==='script')bytes.script+=len;
    else if(type==='font')bytes.font+=len;
    else if(type==='stylesheet')bytes.css+=len;
    else if(type==='media')bytes.video+=len;
  }catch{}
});
const nav=await page.goto(base,{waitUntil:'networkidle'});
await page.evaluate(()=>document.fonts.ready);
const perf=await page.evaluate(()=>(new Promise(resolve=>{
  let lcp=0,cls=0;
  new PerformanceObserver(list=>{for(const e of list.getEntries())lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)cls+=e.value;}).observe({type:'layout-shift',buffered:true});
  setTimeout(()=>{
    const navEntry=performance.getEntriesByType('navigation')[0];
    const fcp=performance.getEntriesByName('first-contentful-paint')[0]?.startTime??null;
    resolve({lcp,cls,fcp,ttfb:navEntry?.responseStart??null,domInteractive:navEntry?.domInteractive??null,transferSize:navEntry?.transferSize??null,viewport:innerWidth,docWidth:document.documentElement.scrollWidth});
  },3500);
})));
// Cart persistence across a full reload, using the real UI path.
await page.goto(base+'/product/black-basic-tee',{waitUntil:'networkidle'});
await page.getByRole('radio',{name:'M',exact:true}).click();
const t0=Date.now();
await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();
const addMs=Date.now()-t0;
await page.getByRole('dialog',{name:'Carrinho Taikonaut'}).getByRole('button',{name:/Fechar/}).click().catch(async()=>{await page.keyboard.press('Escape');});
await page.reload({waitUntil:'networkidle'});
const persisted=await page.evaluate(()=>JSON.parse(localStorage.getItem('tkn_cart')||'[]'));
await page.getByRole('button',{name:/Carrinho com 1/}).click();
const cartShows=await page.getByRole('dialog').getByText('Black Basic Tee',{exact:true}).isVisible();
const points=(perf.lcp<=2500?1:0)+(perf.cls<=0.1?1:0)+(perf.ttfb<=800?1:0);
const result={lab:'LAB, not field data',route:'/',...perf,status:nav?.status(),addToCartMs:addMs,persistedItems:persisted.length,persistedImage:persisted[0]?.image,cartReopened:cartShows,transferBytes:bytes,lighthouseScoreClaim:null,coreWebVitalsAssessment:points===3?'good-in-lab':points>=2?'needs-improvement':'poor-in-lab'};
if(nav?.status()!==200)failures.push('Homepage did not return 200.');
if(persisted.length!==1||!cartShows)failures.push('Cart did not persist across reload.');
if(bytes.video!==0)failures.push('A video byte count was recorded although no authorised film exists.');
if(perf.docWidth>perf.viewport)failures.push('Horizontal overflow on 390px.');
console.log(JSON.stringify(result,null,2));
await fs.writeFile('artifacts/performance-check.json',JSON.stringify({...result,failures},null,2));
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('PASS: cart persistence and lab Core Web Vitals captured. Field CWV and real payment validation still require production traffic.');
