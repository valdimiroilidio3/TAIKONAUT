import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
await fs.mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];
for(const [name,viewport] of [['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  const errors=[];const requests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400 && r.url().startsWith(base))errors.push(`${r.status()} ${r.url()}`);});
  page.on('request',r=>requests.push(r.url()));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(1400);
  await page.screenshot({path:`artifacts/home-${name}.png`});
  const scrollHeight=await page.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<scrollHeight;y+=600){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(160);}
  await page.waitForTimeout(1200);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(300);
  await page.screenshot({path:`artifacts/home-${name}-full.png`,fullPage:true});
  const state=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,chapters:[...document.querySelectorAll('[data-chapter]')].map(el=>el.dataset.chapter),brokenImages:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.currentSrc),fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),heroPoster:document.querySelector('.arrival picture img')?.currentSrc,heroVideoCount:document.querySelectorAll('.arrival video').length}));
  results.push({name,...state,unexpectedVideoRequests:requests.filter(x=>/\.(mp4|webm)(\?|$)/.test(x)),errors});
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results,null,2));
await fs.writeFile('artifacts/visual-check.json',JSON.stringify(results,null,2));
if(results.some(r=>r.errors.length||r.brokenImages.length||r.documentWidth>r.width||r.chapters.length!==5||r.unexpectedVideoRequests.length))process.exit(1);
