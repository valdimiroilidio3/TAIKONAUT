"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { SITE_CONFIG, PRODUCTS } from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";
import media from "@/data/media.json";

export function PopupSection(){
  const {language,addToCart,price}=useStore();const t=(pt:string,en:string)=>language==="pt"?pt:en;
  const event=SITE_CONFIG.popupEvent;
  const [countdown,setCountdown]=useState("—");
  const [mapOpen,setMapOpen]=useState(false);
  const available=PRODUCTS.filter(p=>!p.soldOut);
  const [slug,setSlug]=useState(available[0].slug);
  const selected=available.find(p=>p.slug===slug)!;
  const [size,setSize]=useState(selected.sizes[0]);
  useEffect(()=>{
    const update=()=>{
      const now=new Date();let year=now.getFullYear();
      if(new Date(`${year}-12-12T19:00:00+02:00`).getTime()<now.getTime())year++;
      const ms=Math.max(0,new Date(`${year}-12-12T12:00:00+02:00`).getTime()-now.getTime());
      setCountdown(`${Math.floor(ms/86400000)}d ${String(Math.floor(ms/3600000)%24).padStart(2,"0")}h ${String(Math.floor(ms/60000)%60).padStart(2,"0")}m`);
    };
    update();const timer=setInterval(update,30000);return()=>clearInterval(timer);
  },[]);
  const share=`TAIKONAUT — The Homecoming Pop-Up\n${t(event.dateDisplayPt,event.dateDisplayEn)} · ${event.timeRange}\n${event.venueName}, ${event.address}\n${event.googleMapsUrl}`;
  return <section id="homecoming" className="page-shell py-16 sm:py-24" aria-labelledby="popup-heading">
    <div className="border-t border-[var(--tkn-border-subtle)] pt-8 grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-[12%]">
      <div data-story-reveal>
        <p className="mono text-[var(--tkn-muted)] mb-5">{t("O próximo encontro","The next gathering")} / Maputo</p>
        <h3 id="popup-heading" className="display text-[clamp(56px,6.6vw,105px)]">The<br/>Homecoming.</h3>
        <p className="mt-6 max-w-[42ch] text-[14px] leading-relaxed text-[var(--tkn-muted)]">{t("Voltamos a casa. Um dia para estar junto, experimentar as peças e levantar o que reservaste online.","We’re coming home. A day to get together, try the pieces and collect what you reserved online.")}</p>
        <a href={media.homecoming.externalFilm} target="_blank" rel="noopener noreferrer" className="arrow-link label mt-6">{t("O filme no Vimeo","The film on Vimeo")}<ArrowUpRight size={16}/></a>
      </div>
      <div data-story-reveal>
        <div className="flex justify-between items-baseline gap-8 mb-6"><p className="display text-[50px]">12 {t("DEZ","DEC")}</p><span className="mono text-[var(--tkn-muted)]">{t("Faltam","In")} {countdown}</span></div>
        <dl className="text-[13px] grid grid-cols-2 border-y border-[var(--tkn-border-subtle)]">
          <div className="py-4 pr-5"><dt className="label text-[var(--tkn-muted)] mb-2">{t("Onde","Where")}</dt><dd>{event.venueName}<br/><span className="text-[var(--tkn-muted)]">{event.address}</span></dd></div>
          <div className="py-4 pl-5 border-l border-[var(--tkn-border-subtle)]"><dt className="label text-[var(--tkn-muted)] mb-2">{t("Quando","When")}</dt><dd>{t(event.dateDisplayPt,event.dateDisplayEn)}<br/>{event.timeRange}</dd></div>
        </dl>
        <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5 text-[11px]">
          <a href={event.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="link-u">{t("Como chegar","Directions")} ↗</a>
          <a href="/api/popup/ics" download className="link-u">{t("Adicionar ao calendário","Add to calendar")}</a>
          <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" className="link-u">WhatsApp ↗</a>
          <button type="button" className="link-u" onClick={()=>setMapOpen(!mapOpen)} aria-expanded={mapOpen} aria-controls="popup-map">{t("Mapa","Map")} {mapOpen?"−":"+"}</button>
        </div>
        {mapOpen&&<div id="popup-map" className="mt-6"><iframe className="w-full aspect-[4/3] border-0 grayscale" title={t("Mapa do Restaurante Spazio","Map of Restaurante Spazio")} src={event.openstreetmapEmbedUrl} loading="lazy"/><p className="mono !text-[9px] mt-2 text-[var(--tkn-muted)]">{event.coordinates}</p></div>}
        <div className="mt-8 pt-6 border-t border-[var(--tkn-border-subtle)]">
          <p className="label mb-2">{t("Reserva e levanta no evento","Reserve & collect at the event")}</p>
          <p className="text-[12px] text-[var(--tkn-muted)] mb-4">{t("Levantamento gratuito. A tua peça fica reservada.","Free collection. Your piece is set aside.")}</p>
          <div className="flex flex-wrap gap-2">
            <label className="sr-only" htmlFor="popup-piece">{t("Peça para reservar","Piece to reserve")}</label>
            <select id="popup-piece" className="h-11 min-w-0 flex-1 px-3 border border-[var(--tkn-border-subtle)] bg-transparent text-[12px]" value={slug} onChange={e=>{setSlug(e.target.value);setSize(available.find(p=>p.slug===e.target.value)!.sizes[0]);}}>{available.map(p=><option key={p.slug} value={p.slug}>{p.name} — {price(p.priceEur)}</option>)}</select>
            <label className="sr-only" htmlFor="popup-size">{t("Tamanho","Size")}</label>
            <select id="popup-size" className="h-11 border border-[var(--tkn-border-subtle)] bg-transparent px-3 text-[12px]" value={size} onChange={e=>setSize(e.target.value)}>{selected.sizes.map(s=><option key={s}>{s}</option>)}</select>
            <button type="button" className="h-11 w-full sm:w-auto px-5 bg-[var(--tkn-fg)] text-[var(--tkn-bg)] label hover:opacity-80" onClick={()=>addToCart(selected,size,1,true)}>{t("Reservar","Reserve")}</button>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
