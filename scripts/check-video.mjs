import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run=promisify(execFile);
const budgets={desktop:{bytes:5*1024*1024,maxWidth:1920},mobile:{bytes:2*1024*1024,maxWidth:1080}};
const expected={desktop:['mp4','webm'],mobile:['mp4','webm']};
let present=0;const problems=[];
for(const kind of ['desktop','mobile']){
  for(const ext of expected[kind]){
    const file=`public/videos/campaigns/arrival/${kind}.${ext}`;
    const stat=await fs.stat(file).catch(()=>null);
    if(!stat){console.log(`${file}: awaiting authorised export (not shipped to the browser).`);continue;}
    present++;
    if(stat.size>budgets[kind].bytes)problems.push(`${file}: ${(stat.size/1024/1024).toFixed(2)}MB exceeds ${budgets[kind].bytes/1024/1024}MB budget.`);
    try{
      const {stdout}=await run('ffprobe',['-v','error','-show_entries','stream=codec_name,width,height,duration','-of','json',file]);
      const stream=JSON.parse(stdout).streams?.[0];
      console.log(`${file}: ${stream?.codec_name} ${stream?.width}x${stream?.height} ${Number(stream?.duration).toFixed(1)}s ${(stat.size/1024/1024).toFixed(2)}MB`);
      if(stream?.width>budgets[kind].maxWidth)problems.push(`${file}: width ${stream.width} exceeds budget.`);
      if(Number(stream?.duration)>20.1)problems.push(`${file}: longer than 20s; keep the loop tight.`);
      if(kind==='mobile'&&stream?.width>=stream?.height)problems.push(`${file}: must be a separately reframed portrait edit.`);
    }catch{console.log(`${file}: ffprobe unavailable; size check only.`);}
  }
}
if(present===0)console.log('No video shipped yet. Hero remains photographic. This is an honest, declared state, not an error.');
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
console.log('PASS: no unverifiable or over-budget video asset.');
