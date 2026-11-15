"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { TaikonautLogo } from "./BrandMotifs";
import { useStore } from "@/context/StoreContext";

export function Navbar({ cinematic = false }: { cinematic?: boolean }) {
  const { language, setLanguage, currency, setCurrency, cartCount, wishlist, setIsCartOpen, setIsWishlistOpen, setIsSearchOpen, themeMode, toggleThemeMode } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const t = (pt: string,en: string) => language === "pt" ? pt : en;
  const links = [
    { href:"/#collection", label:"Shop" },
    { href:"/#world", label:"The world" },
    { href:"/#our-world", label:"Our world" },
    { href:"/#homecoming", label:"The Homecoming" },
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
      if (e.key === "Tab") {
        const nodes = Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? []).filter(el => el.getClientRects().length);
        const first=nodes[0],last=nodes[nodes.length-1];
        if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus();}
        if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus();}
      }
    };
    document.addEventListener("keydown",onKey);
    return () => { document.body.style.overflow=overflow; document.removeEventListener("keydown",onKey); previous?.focus(); };
  },[menuOpen]);

  const openUtility = (open: (b:boolean)=>void) => { setMenuOpen(false); open(true); };
  return (
    <>
      <header className={`sticky top-0 z-40 border-b ${cinematic ? "bg-[#151513] text-[#f2f0e8] border-[#373730]" : "bg-[var(--tkn-bg)] text-[var(--tkn-fg)] border-[var(--tkn-border-subtle)]"}`}>
        <div className="page-shell flex h-[76px] lg:h-[84px] items-center justify-between gap-5">
          <Link href="/" aria-label="Taikonaut — início" className="relative flex shrink-0 items-start gap-1">
            <TaikonautLogo tone={cinematic ? "white" : "adaptive"} className="w-[112px] sm:w-[128px] h-auto" />
            <span className="text-[10px] -mt-1" aria-hidden="true">®</span>
          </Link>
          <nav className="hidden lg:block" aria-label={t("Navegação principal","Main navigation")}>
            <ul className="flex items-center gap-8 xl:gap-10">
              {links.map(l=><li key={l.href}><Link href={l.href} className="label !text-[10px] hover:opacity-60 transition-opacity">{l.label}</Link></li>)}
            </ul>
          </nav>
          <div className="flex items-center gap-4 sm:gap-5">
            <button className="label hidden xl:block" onClick={()=>setLanguage(language==="pt"?"en":"pt")} aria-label={`${language.toUpperCase()} — ${t("Mudar para inglês","Switch to Portuguese")}`}>{language.toUpperCase()}</button>
            <button className="label hidden xl:block" onClick={()=>setCurrency(currency==="EUR"?"MZN":"EUR")} aria-label={`${currency} — ${t("Mudar moeda","Switch currency")}`}>{currency}</button>
            <button className="hidden sm:flex items-center justify-center w-8 h-10 hover:opacity-60" aria-label={t("Pesquisar produtos","Search products")} onClick={()=>setIsSearchOpen(true)}><Search size={17} strokeWidth={1.4}/></button>
            <button className="hidden md:flex relative items-center justify-center w-8 h-10 hover:opacity-60" aria-label={t("Favoritos","Wishlist")} onClick={()=>setIsWishlistOpen(true)}><Heart size={17} strokeWidth={1.4}/>{wishlist.length>0 && <span className="absolute -right-1 top-0 text-[10px]">{wishlist.length}</span>}</button>
            <button className="flex items-center gap-2 h-10" onClick={()=>setIsCartOpen(true)} aria-label={t(`Carrinho com ${cartCount} artigos`,`Cart with ${cartCount} items`)}><ShoppingBag size={17} strokeWidth={1.4}/><span className="mono !text-[11px]">({cartCount})</span></button>
            <button className="xl:hidden flex items-center justify-center w-8 h-10" onClick={()=>setMenuOpen(true)} aria-label={t("Abrir menu","Open menu")} aria-expanded={menuOpen}><Menu size={20} strokeWidth={1.4}/></button>
          </div>
        </div>
      </header>
      {menuOpen && <div ref={panel} role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 bg-[#151513] text-[#f2f0e8] overflow-y-auto flex flex-col">
        <div className="page-shell flex h-[76px] shrink-0 items-center justify-between border-b border-white/20">
          <TaikonautLogo tone="white" className="w-28 h-auto"/>
          <button onClick={()=>setMenuOpen(false)} className="flex items-center gap-3 label">{t("Fechar","Close")} <X size={20}/></button>
        </div>
        <nav className="page-shell flex-1 py-12" aria-label={t("Menu de capítulos","Chapter menu")}>
          <ul className="space-y-5">
            {[{href:"/#arrival",label:"The arrival"},{href:"/#world",label:"The world"},{href:"/#collection",label:"The collection"},{href:"/#details",label:"The details"},{href:"/#our-world",label:"Our world"}].map((l,i)=><li key={l.href} className="flex items-baseline gap-5"><span className="mono text-[#aaa99f]">0{i+1}</span><Link className="display text-[42px] sm:text-[56px]" href={l.href} onClick={()=>setMenuOpen(false)}>{l.label}</Link></li>)}
          </ul>
          <div className="flex gap-8 mt-12 label">
            <button className="link-u" onClick={()=>openUtility(setIsSearchOpen)}>{t("Pesquisa","Search")}</button>
            <button className="link-u" onClick={()=>openUtility(setIsWishlistOpen)}>{t("Favoritos","Saved")} ({wishlist.length})</button>
          </div>
        </nav>
        <div className="page-shell flex flex-wrap gap-8 py-6 border-t border-white/20 label">
          <button onClick={()=>setLanguage(language==="pt"?"en":"pt")}>{language==="pt"?"PT / EN":"EN / PT"}</button>
          <button onClick={()=>setCurrency(currency==="EUR"?"MZN":"EUR")}>{currency==="EUR"?"EUR → MZN":"MZN → EUR"}</button>
          <button onClick={toggleThemeMode}>{themeMode==="day"?"Night mode":"Day mode"}</button>
        </div>
      </div>}
    </>
  );
}
