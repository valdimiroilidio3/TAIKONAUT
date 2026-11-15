"use client";

import { useEffect, useRef } from "react";

let locks=0;
let previousOverflow="";

/** Keyboard trap, Escape, outside-click dismissal, scroll lock and focus restoration. */
export function useDialogAccessibility(active: boolean, close: ()=>void){
  const closeRef=useRef(close);
  useEffect(()=>{closeRef.current=close;});
  useEffect(()=>{
    if(!active)return;
    const previous=document.activeElement as HTMLElement|null;
    if(locks++===0){previousOverflow=document.body.style.overflow;document.body.style.overflow="hidden";}
    const top=()=>{const dialogs=document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]');return dialogs[dialogs.length-1];};
    const focusable=()=>Array.from(top()?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')??[]).filter(el=>el.getClientRects().length);
    const raf=requestAnimationFrame(()=>{const el=top();if(!el)return;el.tabIndex=-1;const preferred=el.querySelector<HTMLElement>('[autofocus],input[type="search"]');(preferred??focusable()[0]??el).focus();});
    const key=(e:KeyboardEvent)=>{
      if(e.key==="Escape"){e.preventDefault();closeRef.current();}
      if(e.key!=="Tab")return;
      const nodes=focusable(),first=nodes[0],last=nodes[nodes.length-1];
      if(!first){e.preventDefault();top()?.focus();return;}
      if(e.shiftKey&&(document.activeElement===first||document.activeElement===top())){e.preventDefault();last.focus();}
      if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    };
    const outside=(e:PointerEvent)=>{if(e.target===top())closeRef.current();};
    document.addEventListener("keydown",key);document.addEventListener("pointerdown",outside);
    return()=>{cancelAnimationFrame(raf);document.removeEventListener("keydown",key);document.removeEventListener("pointerdown",outside);if(--locks===0)document.body.style.overflow=previousOverflow;if(previous?.isConnected)previous.focus();};
  },[active]);
}
