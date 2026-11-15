"use client";

import { useEffect,useState } from "react";
import { useStore } from "@/context/StoreContext";

export const CHAPTERS = [
  {id:"arrival",title:"The arrival"},
  {id:"world",title:"The world"},
  {id:"collection",title:"The collection"},
  {id:"details",title:"The details"},
  {id:"our-world",title:"Our world"},
];

export function ChapterNav(){
  const [active,setActive]=useState("arrival");
  const {language}=useStore();
  useEffect(()=>{
    let raf=0;
    const update=()=>{
      raf=0; let current="arrival";
      for(const c of CHAPTERS){const el=document.getElementById(c.id);if(el && el.getBoundingClientRect().top<=window.innerHeight*.45) current=c.id;}
      setActive(current);
    };
    const schedule=()=>{if(!raf)raf=requestAnimationFrame(update);};
    update();window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);};
  },[]);
  return <nav className="chapter-nav" aria-label={language==="pt"?"Os cinco capítulos":"The five chapters"}>
    <div className="page-shell flex gap-10 md:justify-between overflow-x-auto no-scrollbar">
      {CHAPTERS.map((c,i)=><a key={c.id} href={`#${c.id}`} className="mono !text-[9px] md:!text-[10px]" aria-current={active===c.id?"location":undefined}><span>0{i+1}</span><span>{c.title}</span></a>)}
    </div>
  </nav>;
}
