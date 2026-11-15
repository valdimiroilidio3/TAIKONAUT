"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { ArrivalMedia } from "@/lib/media-types";
import { useStore } from "@/context/StoreContext";
import { CinematicVideo } from "./CinematicVideo";

export function HeroSection({ media }: { media: ArrivalMedia }) {
  const {language}=useStore();
  const [isFilm,setIsFilm]=useState(false);
  const t=(pt:string,en:string)=>language==="pt"?pt:en;
  return (
    <section id="arrival" data-chapter="arrival" className="arrival" aria-labelledby="arrival-heading">
      <CinematicVideo media={media} onVideoChange={setIsFilm}/>
      <div className="arrival-shade"/>
      <div className="arrival-content page-shell">
        <div className="flex items-center justify-between gap-5 mono">
          <span className="chapter-label"><span className="!text-[#eeeade]">01 /</span> The arrival</span>
          <span className="hidden md:block text-[#d6d4c9]">Independent. Mozambican. Taikonaut.</span>
        </div>
        <div className="arrival-copy">
          <h1 id="arrival-heading" className="arrival-heading display"><span>Born in</span><span>Maputo.</span></h1>
          <p className="mt-6 text-[12px] sm:text-[14px] text-[#dfddd3] max-w-[30ch] leading-relaxed">{t("Da nossa cidade. À nossa maneira.","From our city. On our own terms.")}</p>
          <Link href="#collection" className="arrival-cta label !text-[10px]">Shop now <ArrowUpRight size={16} strokeWidth={1.5}/></Link>
        </div>
        <div className="arrival-footer">
          <a href="#world" className="mono flex items-center gap-6 !text-[9px] hover:opacity-70">{t("Uma história em cinco capítulos","A story in five chapters")} <ArrowDown size={15}/></a>
          <span className="credit mono !text-[9px]">{isFilm ? t(media.videoCaptionPt,media.videoCaptionEn) : t(media.posterCaptionPt,media.posterCaptionEn)}<br/><span className="text-[#d0cec3]">TAIKONAUT® / {isFilm ? t("Filme da marca","Brand film") : t("Arquivo de imagem","Image archive")}</span></span>
        </div>
      </div>
    </section>
  );
}
