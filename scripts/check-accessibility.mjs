import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const base=process.env.PREVIEW_URL||'http://127.0.0.1:3000';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce'});
const page=await context.newPage();
const results=[];
async function analyse(name){
  await page.evaluate(()=>document.fonts.ready);
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  results.push({name,violations:scan.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
}
await page.goto(base,{waitUntil:'networkidle'});
await analyse('Homepage');
await page.goto(base+'/product/day-map-jacket',{waitUntil:'networkidle'});
await analyse('Product');
await page.getByRole('radio',{name:'M',exact:true}).click();
await page.getByRole('button',{name:'Adicionar ao carrinho',exact:true}).click();
await analyse('Cart drawer');
await page.keyboard.press('Escape');
await page.getByRole('button',{name:'Pesquisar produtos',exact:true}).click();
await analyse('Instant search');
await page.keyboard.press('Escape');
await page.setViewportSize({width:390,height:844});
await page.goto(base,{waitUntil:'networkidle'});
await analyse('Mobile homepage');
await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
await analyse('Mobile menu');
await browser.close();
console.log(JSON.stringify(results,null,2));
await fs.writeFile('artifacts/accessibility-check.json',JSON.stringify(results,null,2));
if(results.some(r=>r.violations.length))process.exit(1);
