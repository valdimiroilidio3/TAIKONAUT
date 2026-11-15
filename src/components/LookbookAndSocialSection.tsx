"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { LOOKBOOK_SHOTS, SITE_CONFIG } from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";
import { useDialogAccessibility } from "@/lib/use-dialog";
import { PopupSection } from "./PopupSection";

export function LookbookAndSocialSection(){
  const {language,trackEvent,setPolicyModal}=useStore();
  const t=(pt:string,en:string)=>language==="pt"?pt:en;
  const [index,setIndex]=useState<number|null>(null);
  const [fullArchive,setFullArchive]=useState(false);
  const [email,setEmail]=useState("");const [whatsapp,setWhatsapp]=useState("");
  const [status,setStatus]=useState<"idle"|"loading"|"done"|"error">("idle");const [error,setError]=useState("");
  const images=fullArchive?LOOKBOOK_SHOTS:[LOOKBOOK_SHOTS[2],LOOKBOOK_SHOTS[4],LOOKBOOK_SHOTS[1]];
  const shot=index!==null?LOOKBOOK_SHOTS[index]:null;
  useDialogAccessibility(index!==null,()=>setIndex(null));
  useEffect(()=>{
    if(index===null)return;
    const handler=(e:KeyboardEvent)=>{if(e.key==="ArrowRight")setIndex((index+1)%LOOKBOOK_SHOTS.length);if(e.key==="ArrowLeft")setIndex((index-1+LOOKBOOK_SHOTS.length)%LOOKBOOK_SHOTS.length);};
    document.addEventListener("keydown",handler);return()=>document.removeEventListener("keydown",handler);
  },[index]);
  async function subscribe(e:React.FormEvent){
    e.preventDefault();if(!email.trim()&&!whatsapp.trim()){setError(t("Indica um email ou WhatsApp.","Enter an email or WhatsApp number."));setStatus("error");return;}
    setStatus("loading");setError("");
    try{
      const res=await fetch("/api/community",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,whatsapp,language})});const result=await res.json();
      if(!res.ok||!result.ok)throw new Error(result.error||t("Não foi possível subscrever.","Could not subscribe."));
      trackEvent("Lead",{content_name:"Newsletter"});setStatus("done");
    }catch(e){setStatus("error");setError(e instanceof Error?e.message:t("Tenta novamente.","Please try again."));}
  }
  return <section id="our-world" data-chapter="our-world" aria-labelledby="our-world-heading">
    <div id="lookbook" className="page-shell section-space !pb-12 sm:!pb-16">
      <div className="kicker-row justify-between gap-6 mono mb-12" data-story-reveal><p className="chapter-label"><span>05 /</span>Our world</p><span className="hidden sm:block text-[var(--tkn-muted)]">{t("Pessoas. Não personagens.","People. Not characters.")}</span></div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14" data-story-reveal>
        <h2 id="our-world-heading" className="display chapter-title chapter-title--tight">For the<br/><span className="text-[var(--tkn-muted)]">culture.</span></h2>
        <div className="max-w-[33ch] lg:pb-2"><p className="text-[14px] leading-[1.8] text-[var(--tkn-muted)]">{t("As peças ganham vida fora do estúdio. Um arquivo de pessoas que fazem parte da nossa história.","The pieces come alive outside the studio. An archive of people who are part of our story.")}</p><a className="arrow-link label mt-6" href={SITE_CONFIG.store.instagramUrl} target="_blank" rel="noopener noreferrer">@taikonautmaputo <ArrowUpRight size={16}/></a></div>
      </div>
      <div className={`grid grid-cols-2 lg:grid-cols-12 gap-x-3 sm:gap-x-6 gap-y-12 ${fullArchive?"":"items-start"}`}>
        {images.map((s,i)=><figure key={s.id} className={fullArchive?"lg:col-span-4":i===0?"col-span-2 lg:col-span-5":i===1?"lg:col-span-3 lg:mt-28":"lg:col-span-4 lg:mt-12"}>
          <button type="button" className="relative block aspect-[4/5] w-full overflow-hidden bg-[var(--tkn-surface-alt)] group cursor-zoom-in" aria-label={`${t("Abrir fotografia","Open photograph")}: ${t(s.captionPt,s.captionEn)}`} onClick={()=>setIndex(LOOKBOOK_SHOTS.findIndex(x=>x.id===s.id))}>
            <Image src={s.src} alt={t(s.captionPt,s.captionEn)} fill sizes="(min-width:1024px) 40vw,70vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.02]"/>
          </button>
          <figcaption className="flex items-baseline justify-between gap-3 mt-3 product-meta"><span>{s.productName}</span><span className="mono !text-[9px]">{String(i+1).padStart(2,"0")}</span></figcaption>
        </figure>)}
      </div>
      <div className="mt-10 flex justify-between items-center gap-4 text-[11px]"><span className="text-[var(--tkn-muted)]">{t("Fotografias do arquivo oficial Taikonaut.","Photography from the official Taikonaut archive.")}</span><button type="button" className="label link-u shrink-0" onClick={()=>setFullArchive(!fullArchive)} aria-expanded={fullArchive}>{fullArchive?t("Ver seleção","View selection"):t("O arquivo completo","The full archive")} {fullArchive?"−":"+"}</button></div>
    </div>
    <PopupSection/>
    <div id="sobre" className="page-shell py-12 sm:py-20">
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-[12%] border-t border-[var(--tkn-border-subtle)] pt-9">
        <div data-story-reveal><p className="label text-[var(--tkn-muted)] mb-5">{t("A nossa história","Our story")}</p><p className="text-[14px] leading-[1.9] max-w-[45ch]">{t("Criada por Teosson Chau, nascido e criado em Maputo, a Taikonaut explora a cultura pop moçambicana através da roupa. O nome vem do fascínio por astronautas e pela cultura de rua asiática. A identidade vem de casa.","Founded by Teosson Chau, born and raised in Maputo, Taikonaut explores Mozambican pop culture through clothing. The name comes from a fascination with astronauts and Asian street culture. The identity comes from home.")}</p></div>
        <div data-story-reveal><p className="heading-tension">{t("De Maputo.","From Maputo.")}<br/><span className="text-[var(--tkn-muted)]">{t("Para onde fores.","Wherever you go.")}</span></p><p className="mono text-[var(--tkn-muted)] mt-5">TAIKONAUT® / MOZAMBIQUE</p></div>
      </div>
    </div>
    <div id="contacto" className="page-shell pt-8 pb-20 sm:pb-28">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-[12%] border-t border-[var(--tkn-border-subtle)] pt-9">
        <div><p className="label text-[var(--tkn-muted)] mb-3">Stay in the loop</p><h3 className="display text-[40px] sm:text-[48px]">{t("Antes de toda a gente.","Before everyone else.")}</h3><p className="text-[13px] text-[var(--tkn-muted)] mt-4">{t("Novas peças, restocks e encontros. Diretamente para ti.","New pieces, restocks and gatherings. Straight to you.")}</p></div>
        <div className="self-end">
          {status==="done"?<p role="status" className="text-[17px] border-b border-[var(--tkn-fg)] pb-5">{t("Obrigado. Estás na lista.","Thank you. You’re on the list.")} ↗</p>:<form onSubmit={subscribe} className="grid grid-cols-2 gap-x-5 gap-y-4">
            <label className="block text-[11px]"><span>Email</span><input autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nome@email.com" className="w-full bg-transparent border-b border-[var(--tkn-border-subtle)] focus:border-[var(--tkn-fg)] outline-none py-3 text-[13px] placeholder:text-[var(--tkn-muted)]"/></label>
            <label className="block text-[11px]"><span>WhatsApp</span><input autoComplete="tel" type="tel" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="+258" className="w-full bg-transparent border-b border-[var(--tkn-border-subtle)] focus:border-[var(--tkn-fg)] outline-none py-3 text-[13px] placeholder:text-[var(--tkn-muted)]"/></label>
            <div className="col-span-2 flex items-center justify-between gap-5"><p className="text-[10px] max-w-[31ch] text-[var(--tkn-muted)]">{t("Ao subscrever, aceitas a nossa ","By subscribing, you accept our ")}<button type="button" className="underline" onClick={()=>setPolicyModal("privacy")}>{t("política de privacidade.","privacy policy.")}</button></p><button disabled={status==="loading"} className="arrow-link label !py-2 disabled:opacity-50" type="submit">{status==="loading"?"…":t("Subscrever","Subscribe")}<ArrowUpRight size={16}/></button></div>
          </form>}
          {status==="error"&&<p role="alert" className="text-[12px] mt-3 text-[#b42318]">{error}</p>}
        </div>
      </div>
    </div>
    {shot&&index!==null&&<div role="dialog" aria-modal="true" aria-label="Lookbook" className="fixed inset-0 z-50 bg-[#141412] text-[#f2f0e8] flex flex-col">
      <div className="flex justify-between items-center gap-8 px-5 sm:px-10 py-5 label"><span className="mono">{String(index+1).padStart(2,"0")} / {String(LOOKBOOK_SHOTS.length).padStart(2,"0")}</span><button type="button" onClick={()=>setIndex(null)}>{t("Fechar","Close")} ×</button></div>
      <div className="relative flex-1 min-h-0"><Image src={shot.src} alt={t(shot.captionPt,shot.captionEn)} fill sizes="100vw" className="object-contain"/>
        <button className="absolute left-4 top-1/2 w-10 h-12 bg-black/50 grid place-items-center" type="button" aria-label={t("Fotografia anterior","Previous photograph")} onClick={()=>setIndex((index-1+LOOKBOOK_SHOTS.length)%LOOKBOOK_SHOTS.length)}><ArrowLeft size={20}/></button>
        <button className="absolute right-4 top-1/2 w-10 h-12 bg-black/50 grid place-items-center" type="button" aria-label={t("Fotografia seguinte","Next photograph")} onClick={()=>setIndex((index+1)%LOOKBOOK_SHOTS.length)}><ArrowRight size={20}/></button>
      </div>
      <div className="px-5 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-4 text-[12px]"><p className="text-[#b5b3a8]">{t(shot.captionPt,shot.captionEn)}</p>{shot.productSlug?<Link href={`/product/${shot.productSlug}`} onClick={()=>setIndex(null)} className="label link-u">{shot.productName} ↗</Link>:<span className="label">{shot.productName}</span>}</div>
    </div>}
  </section>;
}
