"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import {
  getProductBySlug,
  getStockState,
  stockLabel,
  type Product,
} from "@/lib/catalog";

/**
 * Editorial spotlight for one real, already-published piece.
 * Every commercial value (name, price, stock, sizes, copy, photographs) is read
 * from src/data/products.json. Nothing is invented here.
 */
export function FeaturedPiece() {
  const { language, price } = useStore();
  const product = getProductBySlug("day-map-jacket");
  if (!product) return null;

  const t = (pt: string, en: string) => (language === "pt" ? pt : en);
  const state = getStockState(product);
  const detail: Product["images"]["detail"] = product.images.detail;
  const inset = detail ?? product.images.back ?? product.images.front;

  return (
    <section className="cine-feature" aria-labelledby="feature-heading">
      <div className="page-shell cine-feature-grid">
        <div className="cine-feature-media" data-cine-reveal>
          <div className="cine-feature-main">
            <Image
              src={product.images.front.src}
              alt={t(product.images.front.altPt, product.images.front.altEn)}
              fill
              sizes="(min-width: 1024px) 42vw, 92vw"
              className="object-cover object-[50%_42%]"
              quality={75}
              loading="lazy"
            />
            <div className="cine-frame" aria-hidden="true" />
          </div>
          {inset.src !== product.images.front.src && (
            <div className="cine-feature-inset" aria-hidden="true">
              <Image
                src={inset.src}
                alt=""
                fill
                sizes="220px"
                quality={75}
                loading="lazy"
                className="object-cover"
              />
            </div>
          )}
          <span className="absolute left-3 top-3 z-10 bg-[#0e0e0c]/75 px-2 py-1 mono !text-[9px] text-[#f4f2e9]">
            {String(product.id).replace(/\D/g, "").padStart(2, "0")} / {t("Arquivo", "Archive")}
          </span>
        </div>

        <div className="cine-feature-copy">
          <p className="cine-eyebrow text-[#d8d5c8]" data-cine-reveal>
            {t("A peça em destaque", "The featured piece")}
          </p>
          <h2 id="feature-heading" className="cine-feature-title" data-cine-reveal>
            {t("Veste o", "Wear the")}
            <br />
            <em>{t("mapa.", "map.")}</em>
          </h2>
          <div className="cine-transition-rule" data-cine-transition aria-hidden="true" />
          <p className="cine-feature-note mt-7" data-cine-reveal>
            {t(product.taglinePt, product.taglineEn)}
          </p>

          <div className="cine-feature-price mt-8" data-cine-reveal>
            <span className="cine-kicker">{product.name}</span>
            <strong>{price(product.priceEur)}</strong>
          </div>

          <div className="cine-feature-specs mono !text-[9px] text-[#c9c7bc]" data-cine-reveal>
            <span>{stockLabel(state, product.stock, language)}</span>
            <span aria-hidden="true">/</span>
            <span>
              {t("Tamanhos", "Sizes")} {product.sizes.join(" · ")}
            </span>
            <span aria-hidden="true">/</span>
            <span>{t(product.colorLabelPt, product.colorLabelEn)}</span>
          </div>

          <div className="cine-feature-actions" data-cine-reveal>
            <Link
              href={`/product/${product.slug}`}
              className="cine-btn cine-btn--light"
              data-cine-magnetic
              data-cine-pulse
            >
              {t("Descobrir a peça", "Discover the piece")}
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </Link>
            <Link href="/shop" className="cine-btn cine-btn--light" data-cine-pulse>
              {t("Ver a coleção", "View the collection")}
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </Link>
          </div>

          <p className="mono !text-[9px] mt-10 text-[#8f8e84]" data-cine-reveal>
            TAIKONAUT® / MAP COLLECTION — {t("Fotografia do arquivo da marca", "Brand archive photography")}
          </p>
        </div>
      </div>
    </section>
  );
}
