"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/** Progressive enhancement: content is visible without JavaScript. */
export function Reveal({children,className="",delay=0,as:Tag="div"}:{children:ReactNode;className?:string;delay?:number;as?:"div"|"section"|"article"|"li"|"figure"}){
  const nodeRef=useRef<HTMLElement|null>(null);
  const setNode=useCallback((node: HTMLElement|null)=>{nodeRef.current=node;},[]);
  const [ready,setReady]=useState(false);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const node=nodeRef.current;
    if(!node||!window.IntersectionObserver||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    if(node.getBoundingClientRect().top<window.innerHeight){setVisible(true);return;}
    setReady(true);
    const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);io.disconnect();}},{rootMargin:"0px 0px -4% 0px",threshold:.05});
    io.observe(node);return()=>io.disconnect();
  },[]);
  const className_=`reveal ${ready?"is-ready":""} ${visible?"is-visible":""} ${className}`;
  const style_={transitionDelay:`${delay}ms`} as React.CSSProperties;
  if(Tag==="figure")return <figure ref={setNode} className={className_} style={style_}>{children}</figure>;
  if(Tag==="li")return <li ref={setNode} className={className_} style={style_}>{children}</li>;
  if(Tag==="section")return <section ref={setNode} className={className_} style={style_}>{children}</section>;
  if(Tag==="article")return <article ref={setNode} className={className_} style={style_}>{children}</article>;
  return <div ref={setNode} className={className_} style={style_}>{children}</div>;
}
