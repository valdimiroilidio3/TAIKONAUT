"use client";

import React, { startTransition, useEffect, useRef, useState } from "react";
import { AssetImage as Image } from "./AssetImage";
import Link from "next/link";
import {
  PRODUCTS,
  type Product,
  CATEGORY_LABELS,
  SITE_CONFIG,
  getGallery,
} from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Motion";

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-t border-[var(--tkn-border-subtle)]">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 label">
        <span>{title}</span>
        <span className="transition-transform duration-500 group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="pb-5 text-[13px] leading-relaxed text-[var(--tkn-muted)]">{children}</div>
    </details>
  );
}

export function ProductDetailClient({ product }: { product: Product }) {
  const {
    language,
    price,
    addToCart,
    toggleWishlist,
    isWishlisted,
    setRestockModalProduct,
    setSizeGuideCategory,
  } = useStore();
  const t = (pt: string, en: string) => (language === "pt" ? pt : en);

  const gallery = getGallery(product);
  const [size, setSize] = useState<string>(product.sizes.length === 1 ? product.sizes[0] : "");
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState<"" | "cart" | "popup">("");
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [slide, setSlide] = useState(0);
  const [activeImg, setActiveImg] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const href = window.location.href;
    startTransition(() => setShareUrl(href));
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobile(mq.matches);
    sync(); mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (zoomIndex === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoomIndex(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [zoomIndex]);

  const saved = isWishlisted(product.slug);
  const lowStock = !product.soldOut && product.stock > 0 && product.stock <= 5;
  const singleSize = product.sizes.length === 1;
  const hasSizeChart =
    product.category === "tees" || product.category === "hoodies" || product.category === "jackets";

  const siblings = product.colorSiblings
    .map((s) => PRODUCTS.find((p) => p.slug === s))
    .filter((p): p is Product => Boolean(p));
  const pairs = product.pairsWith
    .map((s) => PRODUCTS.find((p) => p.slug === s))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);
  const related = PRODUCTS.filter(
    (p) => p.slug !== product.slug && p.category === product.category && !product.pairsWith.includes(p.slug)
  ).slice(0, 4);

  const add = (reserve: boolean) => {
    if (!size) {
      setSizeError(true);
      return;
    }
    addToCart(product, size, qty, reserve);
    setAdded(reserve ? "popup" : "cart");
    setTimeout(() => setAdded(""), 2400);
  };

  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setSlide(next);
    setActiveImg(next);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const imgClass = `object-cover ${product.soldOut ? "opacity-60" : ""}`;
  const viewLabels = [t("Frente","Front"), t("Costas","Back"), t("Detalhe","Detail"), t("Modelo","On model")];
  const stockLabel = product.soldOut
    ? t("Esgotado","Sold out")
    : lowStock ? t(`Últimas ${product.stock} un.`,"Last units") : t("Em stock","In stock");

  return (
    <div className="mx-auto max-w-[1600px] px-0 sm:px-8 lg:px-10 pb-28">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="px-5 sm:px-0 py-5 text-[12px] text-[var(--tkn-faint)]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/#shop" className="hover:text-[var(--tkn-fg)] transition-colors">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{t(CATEGORY_LABELS[product.category].pt, CATEGORY_LABELS[product.category].en)}</li>
          <li aria-hidden="true">/</li>
          <li className="text-[var(--tkn-fg)]" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8">
        {/* Gallery — immersive viewer */}
        <div className="lg:col-span-7">
          {gallery.length === 0 && (
            <div className="relative aspect-[4/5] w-full">
              <Image src="" alt={t("Fotografia oficial ainda não disponibilizada", "Official photograph not yet supplied")} fill />
            </div>
          )}

          {/* Mobile: swipe carousel with explicit position */}
          <div className="relative lg:hidden">
            <div
              ref={trackRef}
              onScroll={onTrackScroll}
              className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
              aria-label={t("Galeria de imagens", "Image gallery")}
            >
              {gallery.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setZoomIndex(i)}
                  className="relative aspect-[4/5] w-full shrink-0 snap-center bg-[var(--tkn-surface-alt)]"
                  aria-label={`${viewLabels[i] ?? t("Vista", "View")} / ${String(i + 1).padStart(2, "0")} — ${t("ampliar", "enlarge")}`}
                >
                  <Image src={img.src} alt={t(img.altPt, img.altEn)} fill priority={i === 0} sizes="100vw" unoptimized={img.src.endsWith(".svg")} className={imgClass} />
                </button>
              ))}
            </div>
            {gallery.length > 1 && (
              <>
                <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-3">
                  <span aria-hidden="true" className="bg-[var(--tkn-bg)]/90 px-2 py-1 mono !text-[9px]">
                    {viewLabels[slide] ?? t("Vista", "View")}
                  </span>
                  <span className="bg-[var(--tkn-bg)]/90 px-2 py-1 mono !text-[9px] tabular-nums">
                    {String(slide + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
                  </span>
                </div>
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex gap-px">
                  {gallery.map((img, i) => (
                    <span key={img.src} className={`h-0.5 flex-1 ${i === slide ? "bg-[var(--tkn-fg)]" : "bg-[var(--tkn-border-subtle)]"}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop: thumbnail rail + stage */}
          <div className="hidden gap-3 lg:flex">
            {gallery.length > 1 && (
              <div className="flex w-[74px] shrink-0 flex-col gap-1.5" role="tablist" aria-label={t("Vistas do produto", "Product views")} aria-orientation="vertical">
                {gallery.map((img, i) => (
                  <button
                    key={img.src}
                    type="button"
                    role="tab"
                    aria-selected={activeImg === i}
                    aria-controls="product-stage"
                    onClick={() => setActiveImg(i)}
                    id={`view-tab-${i}`}
                    tabIndex={activeImg === i ? 0 : -1}
                    onKeyDown={(e) => {
                      let next: number | null = null;
                      if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % gallery.length;
                      if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + gallery.length) % gallery.length;
                      if (e.key === "Home") next = 0;
                      if (e.key === "End") next = gallery.length - 1;
                      if (next === null) return;
                      e.preventDefault();
                      setActiveImg(next);
                      document.getElementById(`view-tab-${next}`)?.focus();
                    }}
                    className={`relative aspect-[4/5] overflow-hidden border transition-opacity ${activeImg === i ? "border-[var(--tkn-fg)]" : "border-transparent opacity-55 hover:opacity-100"}`}
                    aria-label={`${String(i + 1).padStart(2, "0")} ${viewLabels[i] ?? t("Vista", "View")} — ${t("ver imagem", "view image")}`}
                  >
                    <Image src={img.src} alt="" fill sizes="74px" unoptimized={img.src.endsWith(".svg")} className={imgClass} />
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 bg-[var(--tkn-bg)]/85 py-0.5 text-center mono !text-[8px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div id="product-stage" className="relative min-w-0 flex-1" role="tabpanel" aria-label={`${viewLabels[activeImg] ?? t("Vista", "View")} — ${product.name}`}>
              <button
                type="button"
                onClick={() => setZoomIndex(activeImg)}
                className="relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-[var(--tkn-surface-alt)]"
                aria-label={`${viewLabels[activeImg] ?? t("Vista", "View")} / ${String(activeImg + 1).padStart(2, "0")} — ${t("ampliar", "enlarge")}`}
              >
                {gallery[activeImg] && (
                  <Image
                    key={gallery[activeImg].src}
                    src={gallery[activeImg].src}
                    alt={t(gallery[activeImg].altPt, gallery[activeImg].altEn)}
                    fill
                    priority
                    sizes="58vw"
                    unoptimized={gallery[activeImg].src.endsWith(".svg")}
                    className={`${imgClass} animate-[tkn-fade_.5s_var(--ease-editorial)_both]`}
                  />
                )}
                {product.soldOut && (
                  <span className="absolute left-3 top-3 bg-[var(--tkn-fg)] px-2 py-1 text-[var(--tkn-bg)] label">Sold out</span>
                )}
              </button>
              <div className="flex items-center justify-between gap-4 pt-3">
                <span className="mono !text-[9px] text-[var(--tkn-muted)]">
                  {viewLabels[activeImg] ?? t("Vista", "View")} · {t("clica para ampliar", "click to enlarge")}
                </span>
                <div className="flex items-center gap-3">
                  <span className="mono !text-[9px] tabular-nums">{String(activeImg + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</span>
                  {gallery.length > 1 && (
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setActiveImg((activeImg - 1 + gallery.length) % gallery.length)} className="flex h-8 w-8 items-center justify-center border border-[var(--tkn-border-subtle)] hover:bg-[var(--tkn-fg)] hover:text-[var(--tkn-bg)] transition-colors" aria-label={t("Vista anterior", "Previous view")}>←</button>
                      <button type="button" onClick={() => setActiveImg((activeImg + 1) % gallery.length)} className="flex h-8 w-8 items-center justify-center border border-[var(--tkn-border-subtle)] hover:bg-[var(--tkn-fg)] hover:text-[var(--tkn-bg)] transition-colors" aria-label={t("Vista seguinte", "Next view")}>→</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info — sticky */}
        <div className="lg:col-span-4 lg:col-start-9 px-5 sm:px-0">
          <div className="lg:sticky lg:top-24 space-y-7">
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-[24px] sm:text-[28px] leading-[1.1] tracking-[-0.03em]">{product.name}</h1>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.slug)}
                  aria-pressed={saved}
                  className="label pt-2 hover:opacity-60 shrink-0"
                >
                  {saved ? t("♥ Guardado", "♥ Saved") : t("♡ Guardar", "♡ Save")}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="text-[18px] tabular-nums">{price(product.priceEur)}</p>
                <p className={`product-meta ${product.soldOut ? "" : "!text-[var(--tkn-fg)]"}`}><span aria-hidden="true" className={`inline-block h-1.5 w-1.5 mr-2 align-middle rounded-full ${product.soldOut ? "bg-[var(--tkn-muted)]" : "bg-[#2f6b45]"}`}/>{stockLabel}</p>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-[var(--tkn-muted)]">
                {t(product.taglinePt, product.taglineEn)}
              </p>
            </div>

            {/* Colour / edition */}
            <div>
              <p className="label text-[var(--tkn-faint)] mb-3">
                {t("Cor", "Colour")} — <span className="text-[var(--tkn-fg)] normal-case tracking-normal">{t(product.colorLabelPt, product.colorLabelEn)}</span>
              </p>
              {siblings.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {siblings.map((s) => {
                    const current = s.slug === product.slug;
                    return (
                      <Link
                        key={s.slug}
                        href={`/product/${s.slug}`}
                        aria-current={current ? "page" : undefined}
                        aria-label={s.name}
                        title={s.name}
                        className={`relative block h-[68px] w-[54px] overflow-hidden bg-[var(--tkn-surface-alt)] transition-opacity ${
                          current ? "outline outline-1 outline-offset-2 outline-[var(--tkn-fg)]" : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Image src={s.images.front.src} alt="" fill sizes="54px" className="object-cover" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Size */}
            {!product.soldOut && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className={`label ${sizeError ? "text-[#b42318]" : "text-[var(--tkn-faint)]"}`}>
                    {sizeError ? t("Escolhe um tamanho", "Select a size") : size ? `${t("Tamanho","Size")} — ${size}` : t("Tamanho", "Size")}
                  </p>
                  {hasSizeChart && (
                    <button
                      type="button"
                      onClick={() => setSizeGuideCategory(product.category as "tees" | "hoodies" | "jackets")}
                      className="label link-u"
                    >
                      {t("Guia de tamanhos", "Size guide")}
                    </button>
                  )}
                </div>
                <div role="radiogroup" aria-label={t("Tamanho", "Size")} aria-describedby="size-help" className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const active = size === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                          setSize(s);
                          setSizeError(false);
                        }}
                        className={`h-10 min-w-[52px] px-3 text-[13px] border transition-colors duration-300 ${
                          active
                            ? "border-[var(--tkn-fg)] bg-[var(--tkn-fg)] text-[var(--tkn-bg)]"
                            : "border-[var(--tkn-border-subtle)] hover:border-[var(--tkn-fg)]"
                        }`}
                      >
                        {s === "Único" ? t("Único", "One size") : s}
                      </button>
                    );
                  })}
                </div>
                <p id="size-help" className={`mt-3 text-[12px] ${sizeError ? "text-[#8c2f22]" : "text-[var(--tkn-muted)]"}`} role={sizeError ? "alert" : undefined}>
                  {sizeError
                    ? t("Escolhe um tamanho para continuares.", "Choose a size to continue.")
                    : size
                      ? t(`${stockLabel} · pronto a enviar ou levantar no Pop-Up.`, `${stockLabel} · ready to ship or collect at the Pop-Up.`)
                      : t(`Tamanhos disponíveis: ${product.sizes.join(", ")}.`, `Available sizes: ${product.sizes.join(", ")}.`)}
                </p>
              </div>
            )}

            {/* Actions */}
            {product.soldOut ? (
              <div className="space-y-3">
                <p className="text-[13px] text-[var(--tkn-muted)]">
                  {t("Esgotado. Deixa o teu contacto e avisamos-te quando voltar.", "Sold out. Leave your contact and we’ll let you know when it’s back.")}
                </p>
                <button
                  type="button"
                  onClick={() => setRestockModalProduct(product)}
                  className="h-12 w-full bg-[var(--tkn-fg)] text-[var(--tkn-bg)] label hover:opacity-80 transition-opacity"
                >
                  {t("Avisa-me quando voltar", "Notify me when back")}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex h-12 items-center border border-[var(--tkn-border-subtle)]">
                    <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-full w-10 hover:opacity-60" aria-label={t("Diminuir", "Decrease")}>
                      −
                    </button>
                    <span className="w-6 text-center text-[13px] tabular-nums" aria-live="polite">
                      {qty}
                    </span>
                    <button type="button" onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="h-full w-10 hover:opacity-60" aria-label={t("Aumentar", "Increase")}>
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => add(false)}
                    className="h-12 flex-1 bg-[var(--tkn-fg)] text-[var(--tkn-bg)] label hover:opacity-80 transition-opacity"
                  >
                    {added === "cart" ? t("Adicionado ✓", "Added ✓") : t("Adicionar ao carrinho", "Add to cart")}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => add(true)}
                  className="h-12 w-full border border-[var(--tkn-fg)] label hover:bg-[var(--tkn-fg)] hover:text-[var(--tkn-bg)] transition-colors duration-500"
                >
                  {added === "popup"
                    ? t("Reservado para o Pop-Up ✓", "Reserved for the Pop-Up ✓")
                    : t("Reserva e levanta no Pop-Up — 12 Dez", "Reserve & collect at the Pop-Up — Dec 12")}
                </button>
                <p className="pt-1 text-[11px] text-[var(--tkn-faint)]">
                  M-Pesa · e-Mola · {t("Transferência", "Bank transfer")} · {t("Cartão", "Card")} · {t("Dinheiro no Pop-Up", "Cash at the Pop-Up")}
                </p>
              </div>
            )}

            {/* Details */}
            <div>
              <dl className="mb-2">
                <div className="spec-row"><dt>{t("Categoria","Category")}</dt><dd>{t(CATEGORY_LABELS[product.category].pt,CATEGORY_LABELS[product.category].en)}</dd></div>
                <div className="spec-row"><dt>{t("Cor","Colour")}</dt><dd>{t(product.colorLabelPt,product.colorLabelEn)}</dd></div>
                <div className="spec-row"><dt>{t("Disponibilidade","Availability")}</dt><dd>{stockLabel}</dd></div>
              </dl>
              <Accordion title={t("Descrição", "Description")} defaultOpen>
                {t(product.descriptionPt, product.descriptionEn)}
              </Accordion>
              <Accordion title={t("Material", "Material")}>{t(product.materialPt, product.materialEn)}</Accordion>
              <Accordion title={t("Cuidados", "Care")}>{t(product.carePt, product.careEn)}</Accordion>
              <Accordion title={t("Envios e trocas", "Shipping & returns")}>
                {t(
                  `Levantamento grátis no Pop-Up (${SITE_CONFIG.popupEvent.venueName}). Entrega em Maputo e Matola em 24–48h. Envio grátis acima de € ${SITE_CONFIG.store.freeShippingThresholdEur}. Trocas de tamanho até 14 dias.`,
                  `Free collection at the Pop-Up (${SITE_CONFIG.popupEvent.venueName}). Maputo & Matola delivery in 24–48h. Free shipping over € ${SITE_CONFIG.store.freeShippingThresholdEur}. Size exchanges within 14 days.`
                )}
              </Accordion>
              <div className="border-t border-[var(--tkn-border-subtle)] pt-4 flex items-center gap-6">
                <span className="label text-[var(--tkn-faint)]">{t("Partilhar", "Share")}</span>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${product.name} — Taikonaut\n${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label link-u"
                >
                  WhatsApp
                </a>
                <button type="button" onClick={copyLink} className="label link-u">
                  {copied ? t("Copiado", "Copied") : t("Copiar link", "Copy link")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky purchase bar */}
      {isMobile && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--tkn-border)] bg-[var(--tkn-bg)]/95 backdrop-blur-md px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="product-name truncate">{product.name}</span>
            <span className="product-price shrink-0">{price(product.priceEur)}</span>
          </div>
          {product.soldOut ? (
            <button type="button" onClick={() => setRestockModalProduct(product)} className="h-12 w-full bg-[var(--tkn-fg)] text-[var(--tkn-bg)] label">
              {t("Avisa-me quando voltar","Notify me when back")}
            </button>
          ) : size ? (
            <button type="button" onClick={() => add(false)} className="h-12 w-full bg-[var(--tkn-fg)] text-[var(--tkn-bg)] label">
              {added === "cart" ? t("Adicionado ✓","Added ✓") : `${t("Adicionar","Add")} — ${size} · ${price(product.priceEur)}`}
            </button>
          ) : (
            <label className="flex items-center gap-3">
              <span className="sr-only">{t("Escolhe um tamanho","Choose a size")}</span>
              <select aria-label={t("Escolhe um tamanho","Choose a size")} value={size} onChange={e => { setSize(e.target.value); setSizeError(false); }} className="h-12 flex-1 border border-[var(--tkn-border)] bg-transparent px-3 text-[13px]">
                <option value="">{t("Escolhe o tamanho","Choose size")}</option>
                {product.sizes.map(s => <option key={s} value={s}>{s === "Único" ? t("Único","One size") : s}</option>)}
              </select>
              <button type="button" onClick={() => add(false)} className="h-12 px-5 bg-[var(--tkn-fg)] text-[var(--tkn-bg)] label">{t("Adicionar","Add")}</button>
            </label>
          )}
        </div>
      )}

      {/* Pairs with */}
      {pairs.length > 0 && (
        <section className="mt-28 px-5 sm:px-0" aria-labelledby="pairs-heading">
          <Reveal className="mb-8 border-t border-[var(--tkn-border-subtle)] pt-8">
            <h2 id="pairs-heading" className="text-[22px] tracking-[-0.03em]">
              {t("Combina com", "Pairs with")}
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-10 sm:gap-x-4">
            {pairs.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} sizes="(min-width: 1024px) 25vw, 50vw" />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-24 px-5 sm:px-0" aria-labelledby="related-heading">
          <Reveal className="mb-8 border-t border-[var(--tkn-border-subtle)] pt-8">
            <h2 id="related-heading" className="text-[22px] tracking-[-0.03em]">
              {t("Também na coleção", "Also in the collection")}
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-10 sm:gap-x-4">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} sizes="(min-width: 1024px) 25vw, 50vw" />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Zoom viewer */}
      {zoomIndex !== null && gallery[zoomIndex] && (
        <div className="fixed inset-0 z-50 bg-[var(--tkn-surface-alt)] flex flex-col" role="dialog" aria-modal="true" aria-label={t("Imagem ampliada", "Zoomed image")}>
          <div className="flex h-14 items-center justify-between px-5 sm:px-8 label">
            <span className="tabular-nums">
              {zoomIndex + 1} / {gallery.length}
            </span>
            <button type="button" onClick={() => setZoomIndex(null)} autoFocus className="hover:opacity-60">
              {t("Fechar", "Close")}
            </button>
          </div>
          <div
            className="relative flex-1 overflow-hidden cursor-zoom-out"
            onClick={() => setZoomIndex(null)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoomOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
            }}
          >
            <Image
              src={gallery[zoomIndex].src}
              alt={t(gallery[zoomIndex].altPt, gallery[zoomIndex].altEn)}
              fill
              sizes="100vw"
              quality={90}
              unoptimized={gallery[zoomIndex].src.endsWith(".svg")}
              style={{ transformOrigin: zoomOrigin }}
              className="object-contain lg:scale-[1.6] transition-transform duration-300 ease-out"
            />
          </div>
          {gallery.length > 1 && (
            <div className="flex justify-center gap-4 py-4">
              {gallery.map((g, i) => (
                <button
                  key={g.src}
                  type="button"
                  onClick={() => setZoomIndex(i)}
                  className={`label tabular-nums ${i === zoomIndex ? "underline underline-offset-4" : "text-[var(--tkn-faint)]"}`}
                  aria-label={`${t("Imagem", "Image")} ${i + 1}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
