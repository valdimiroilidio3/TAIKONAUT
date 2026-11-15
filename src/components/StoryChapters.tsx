"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { getProductBySlug } from "@/lib/catalog";

export function WorldChapter(){
  const {language}=useStore();
  const t=(pt:string,en:string)=>language==="pt"?pt:en;
  return <section id="world" data-chapter="world" className="page-shell section-space !pt-16 sm:!pt-24" aria-labelledby="world-heading">
    <div className="kicker-row mono mb-10 sm:mb-14" data-story-reveal>
      <span>02 /</span><span>The world</span><span className="ml-auto text-[var(--tkn-muted)]">Maputo · Mozambique</span>
    </div>
    <div className="grid lg:grid-cols-12 gap-x-6 gap-y-12">
      <div className="lg:col-span-5 flex flex-col">
        <h2 id="world-heading" className="world-heading" data-scroll-heading><span>{t("Uma","One")}</span><span>{t("cidade.","city.")}</span><span className="quiet">{t("A nossa voz.","Our voice.")}</span></h2>
        <p className="mt-10 text-[15px] leading-[1.85] max-w-[36ch]" data-story-reveal>{t("A Taikonaut nasce do que nos rodeia. Das ruas de Maputo, das memórias de infância, da vontade de fazer à nossa maneira. Não seguimos um mapa. Vestimos o nosso.","Taikonaut comes from what surrounds us. Maputo’s streets, childhood memories, the urge to do things our way. We don’t follow a map. We wear our own.")}</p>
        <dl className="mt-10 max-w-[420px] text-[12px]">
          <div className="spec-row"><dt>{t("Origem","Origin")}</dt><dd>Maputo, Moçambique</dd></div>
          <div className="spec-row"><dt>{t("Fundador","Founder")}</dt><dd>Teosson Chau</dd></div>
          <div className="spec-row"><dt>{t("Nome","Name")}</dt><dd>{t("A palavra chinesa para astronauta","The Chinese word for astronaut")}</dd></div>
          <div className="spec-row"><dt>{t("Método","Method")}</dt><dd>{t("Cultura pop moçambicana, feita roupa.","Mozambican pop culture, made into clothing.")}</dd></div>
        </dl>
      </div>
      <figure className="lg:col-span-7 lg:pl-6">
        <div className="relative crop-tall overflow-hidden bg-[var(--tkn-surface-alt)] bleed-right" data-parallax-frame>
          <div data-parallax-image><Image src="/images/campaigns/signature/white-tee-editorial.webp" alt={t("T-shirt Taikonaut branca vestida, com o logótipo desenhado à mão no peito","White Taikonaut tee worn with the hand-drawn logo across the chest")} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover object-[52%_38%]"/></div>
        </div>
        <figcaption className="flex items-center justify-between gap-4 mt-3 mono !text-[9px] text-[var(--tkn-muted)]"><span>Signature / White Basic Tee</span><Link href="/product/white-basic-tee" className="link-u">€ 20,00 ↗</Link></figcaption>
      </figure>
    </div>
    {/* asymmetrical pair: small detail pushed against the left edge */}
    <div className="grid lg:grid-cols-12 gap-6 mt-16 sm:mt-24 items-end">
      <figure className="lg:col-span-4 bleed-left">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--tkn-surface-alt)]"><Image src="/images/details/mozdrian/colour-block-knit.webp" alt={t("Detalhe da malha Mozdrian em verde, amarelo, vermelho e preto","Mozdrian knit detail in green, yellow, red and black")} fill sizes="(min-width:1024px) 30vw, 100vw" className="object-cover"/></div>
        <figcaption className="mono !text-[9px] text-[var(--tkn-muted)] mt-2">Mozdrian / {t("arquivo","archive")}</figcaption>
      </figure>
      <div className="lg:col-span-6 lg:col-start-7">
        <p className="heading-tension" data-story-reveal>{t("Não fazemos roupa para caber num mapa. Fazemos roupa para te dizer de onde somos.","We don’t make clothes to fit a map. We make clothes that tell you where we’re from.")}</p>
        <Link href="#sobre" className="arrow-link label mt-8" data-story-reveal>{t("A nossa história","Our story")}<ArrowUpRight size={16}/></Link>
      </div>
    </div>
  </section>;
}

/** Full-bleed typographic band between chapters. Uses an unused real back view. */
export function MadeInMaputoBand(){
  const {language}=useStore();
  const t=(pt:string,en:string)=>language==="pt"?pt:en;
  return <section aria-label={t("Feito em Maputo","Made in Maputo")} className="band cine-band">
    <div className="band-strip cine-band-strip">
      <span className="cine-band-ghost" aria-hidden="true">MAPUTO</span>
      <Image src="/images/products/day-map-jacket/back.webp" alt={t("Costas do Day Map Jacket com o mapa de Moçambique","Back of the Day Map Jacket showing the map of Mozambique")} fill sizes="100vw" className="object-cover !object-[50%_42%]"/>
      <p className="band-word cine-band-word">{t("Feito em Maputo.","Made in Maputo.")}</p>
    </div>
    <div className="cine-transition-rule" data-cine-transition aria-hidden="true" />
    <div className="page-shell flex flex-wrap items-center justify-between gap-4 py-5 mono !text-[9px] text-[#b9b7ac]"><span>TAIKONAUT® / MAP COLLECTION</span><span>{t("Uma ideia simples: reconhecer Moçambique ao primeiro olhar.","One simple idea: recognise Mozambique at first glance.")}</span></div>
  </section>;
}

const DETAILS=[
  {key:"map",title:"The map",image:"/images/details/map-jackets/day-map-close-up.webp",position:"50% 50%",slug:"day-map-jacket",note:{pt:"Nylon técnico, forro acolchoado, botões de pressão gravados. O país inteiro impresso do colarinho à bainha.",en:"Technical nylon, quilted lining, engraved snap buttons. The whole country printed from collar to hem."}},
  {key:"signature",title:"The signature",image:"/images/products/red-signature-hoodie/back.webp",position:"50% 35%",slug:"red-signature-hoodie",note:{pt:"O logótipo desenhado à mão, reproduzido em grande escala. Felpa pesada de corte amplo.",en:"The hand-drawn logo, reproduced at full scale. Heavyweight fleece, oversized cut."}},
  {key:"finish",title:"The finish",image:"/images/details/taikosunnies/tortoise-temple.webp",position:"50% 50%",slug:"tortoise-shell-taikosunnies",note:{pt:"Acetato polido, lentes escuras, o nome da marca a dourado na haste. Feito para durar.",en:"Polished acetate, dark lenses, the brand name in gold on the temple. Built to last."}},
];

export function DetailsChapter(){
  const {language,price}=useStore();const t=(pt:string,en:string)=>language==="pt"?pt:en;
  const [index,setIndex]=useState(0);const tabs=useRef<(HTMLButtonElement|null)[]>([]);
  const detail=DETAILS[index];const product=getProductBySlug(detail.slug)!;
  function change(next:number){setIndex((next+DETAILS.length)%DETAILS.length);}
  return <section id="details" data-chapter="details" className="ink-section section-space" aria-labelledby="details-heading">
    <div className="page-shell">
      <div className="kicker-row mono mb-12 sm:mb-16" data-story-reveal><span>04 /</span><span>The details</span><span className="ml-auto text-[#9c9c90]">{String(index+1).padStart(2,"0")} / 0{DETAILS.length}</span></div>
      <div className="details-grid">
        <div>
          <h2 id="details-heading" className="display chapter-title chapter-title--tight" data-scroll-heading>Look<br/><span className="text-[#8a897f]">closer.</span></h2>
          <p className="mt-8 mb-10 text-[14px] text-[#b5b3a8] max-w-[32ch] leading-relaxed" data-story-reveal>{t("O que faz uma peça ser nossa está nos detalhes.","What makes a piece ours is in the details.")}</p>
          <div role="tablist" aria-label={t("Detalhes das peças","Garment details")} aria-orientation="vertical">
            {DETAILS.map((d,i)=><button
              key={d.key} ref={el=>{tabs.current[i]=el;}} role="tab" type="button" id={`detail-tab-${d.key}`} aria-selected={index===i} aria-controls="detail-panel" tabIndex={index===i?0:-1}
              className="detail-tab"
              onClick={()=>change(i)}
              onKeyDown={e=>{let next:number|undefined;if(e.key==="ArrowDown"||e.key==="ArrowRight")next=(i+1)%DETAILS.length;if(e.key==="ArrowUp"||e.key==="ArrowLeft")next=(i-1+DETAILS.length)%DETAILS.length;if(e.key==="Home")next=0;if(e.key==="End")next=DETAILS.length-1;if(next!==undefined){e.preventDefault();change(next);tabs.current[next]?.focus();}}}
            ><span className="flex items-center gap-5"><span className="mono text-[#9c9c90]">0{i+1}</span><span className="label !text-[13px]">{d.title}</span></span><ArrowRight size={18} strokeWidth={1.2} className="indicator"/></button>)}
          </div>
        </div>
        <div id="detail-panel" role="tabpanel" aria-labelledby={`detail-tab-${detail.key}`} tabIndex={0} className="lg:-mr-[var(--page-gutter)]">
          <div className="detail-frame"><Image key={detail.image} src={detail.image} alt={t(`${product.name} — detalhe`, `${product.name} — detail`)} fill sizes="(min-width:1024px) 52vw,100vw" style={{objectPosition:detail.position}} className="animate-[tkn-fade_.65s_var(--ease-editorial)_both]"/></div>
          <div className="detail-caption"><Link href={`/product/${product.slug}`} className="label link-u">{product.name} ↗</Link><span className="mono">{price(product.priceEur)}</span></div>
          <p className="text-[13px] mt-4 text-[#b5b3a8] leading-relaxed max-w-[54ch]">{t(detail.note.pt,detail.note.en)}</p>
        </div>
      </div>
    </div>
  </section>;
}
