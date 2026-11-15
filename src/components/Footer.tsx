"use client";

import React from "react";
import Link from "next/link";
import { TaikonautLogo } from "./BrandMotifs";
import { SITE_CONFIG } from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";

export function Footer() {
  const { language, setPolicyModal, setSizeGuideCategory, themeMode, toggleThemeMode } = useStore();
  const t = (pt: string, en: string) => (language === "pt" ? pt : en);
  const popup = SITE_CONFIG.popupEvent;

  const col = "space-y-2 text-[13px]";
  const head = "label text-[var(--tkn-faint)] mb-4";
  const item = "hover:opacity-55 transition-opacity text-left";

  return (
    <footer className="ink-section text-[#f2f1ee]">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-10 pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          <div>
            <p className={head}>Shop</p>
            <ul className={col}>
              <li><Link href="/#shop" className={item}>{t("Tudo", "All")}</Link></li>
              <li><Link href="/product/day-map-jacket" className={item}>MAP Jackets</Link></li>
              <li><Link href="/product/red-signature-hoodie" className={item}>Signature Hoodies</Link></li>
              <li><Link href="/product/black-taikosunnies" className={item}>Taikosunnies</Link></li>
              <li><Link href="/product/black-basic-tee" className={item}>Tees</Link></li>
            </ul>
          </div>
          <div>
            <p className={head}>{t("Ajuda", "Help")}</p>
            <ul className={col}>
              <li><button type="button" onClick={() => setPolicyModal("shipping")} className={item}>{t("Envios", "Shipping")}</button></li>
              <li><button type="button" onClick={() => setPolicyModal("returns")} className={item}>{t("Trocas e devoluções", "Exchanges & returns")}</button></li>
              <li><button type="button" onClick={() => setSizeGuideCategory("hoodies")} className={item}>{t("Guia de tamanhos", "Size guide")}</button></li>
              <li><button type="button" onClick={() => setPolicyModal("privacy")} className={item}>{t("Privacidade", "Privacy")}</button></li>
            </ul>
          </div>
          <div>
            <p className={head}>{t("Contacto", "Contact")}</p>
            <ul className={col}>
              <li>
                <a href={`https://wa.me/${SITE_CONFIG.store.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className={item}>
                  WhatsApp {SITE_CONFIG.store.whatsappDisplay}
                </a>
              </li>
              <li><a href={`mailto:${SITE_CONFIG.store.email}`} className={item}>{SITE_CONFIG.store.email}</a></li>
              <li>
                <a href={SITE_CONFIG.store.instagramUrl} target="_blank" rel="noopener noreferrer" className={item}>
                  Instagram {SITE_CONFIG.store.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className={head}>The Homecoming</p>
            <p className="text-[13px] leading-relaxed text-[#bdbbb6]">
              {t(popup.dateDisplayPt, popup.dateDisplayEn)}, {popup.timeRange}
              <br />
              {popup.venueName}
              <br />
              {popup.address}
            </p>
          </div>
        </div>

        <div className="mt-24 sm:mt-32">
          <TaikonautLogo tone="white" className="w-full max-w-[1100px] h-auto opacity-95" />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-[11px] text-[#8d8b87] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Taikonaut — {t("Feito em Maputo, Moçambique", "Made in Maputo, Mozambique")}</p>
          <p className="tracking-[0.06em]">M-Pesa · e-Mola · {t("Transferência", "Bank transfer")} · Visa / Mastercard · PayPal · {t("Dinheiro no Pop-Up", "Cash at the Pop-Up")}</p>
          <div className="flex items-center gap-5">
            <button type="button" onClick={toggleThemeMode} className="hover:text-white transition-colors">
              {themeMode === "day" ? "Night mode" : "Day mode"}
            </button>
            <Link href="/guia-gestao" className="hover:text-white transition-colors">
              {t("Gestão", "Admin")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
