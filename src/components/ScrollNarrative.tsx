"use client";

import { useEffect } from "react";

/** Native document scrolling. No scroll hijacking, forced snapping or pinning. */
export function ScrollNarrative(){
  useEffect(()=>{
    let disposed=false;
    let cleanup:(()=>void)|undefined;
    void Promise.all([import("gsap"),import("gsap/ScrollTrigger")]).then(([{gsap},{ScrollTrigger}])=>{
      if(disposed)return;
      gsap.registerPlugin(ScrollTrigger);
      const mm=gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)",()=>{
        gsap.utils.toArray<HTMLElement>("[data-story-reveal]").forEach(el=>{
          // Above-the-fold content remains visible. The page also works without JS.
          if(el.getBoundingClientRect().top<window.innerHeight*.85)return;
          gsap.fromTo(el,{opacity:0,y:28},{opacity:1,y:0,duration:.95,ease:"power2.out",scrollTrigger:{trigger:el,start:"top 90%",once:true}});
        });
        gsap.utils.toArray<HTMLElement>("[data-scroll-heading]").forEach(el=>{
          gsap.fromTo(el,{y:16},{y:-8,ease:"none",scrollTrigger:{trigger:el,start:"top bottom",end:"bottom top",scrub:1}});
        });
      });
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)",()=>{
        gsap.utils.toArray<HTMLElement>("[data-parallax-frame]").forEach(frame=>{
          const image=frame.querySelector("[data-parallax-image]");
          if(image)gsap.fromTo(image,{yPercent:-3},{yPercent:3,ease:"none",scrollTrigger:{trigger:frame,start:"top bottom",end:"bottom top",scrub:1}});
        });
      });
      // Refresh after fonts settle; no listener leaks on route changes.
      void document.fonts.ready.then(()=>{if(!disposed)ScrollTrigger.refresh();});
      let refreshFrame=0;
      const resize=new ResizeObserver(()=>{
        cancelAnimationFrame(refreshFrame);
        refreshFrame=requestAnimationFrame(()=>{if(!disposed)ScrollTrigger.refresh();});
      });
      const main=document.getElementById("main-content");
      if(main)resize.observe(main);
      cleanup=()=>{resize.disconnect();cancelAnimationFrame(refreshFrame);mm.revert();};
    });
    return()=>{disposed=true;cleanup?.();};
  },[]);
  return null;
}
