"use client";

import { useState } from "react";
import Link from "next/link";
import { AssetImage as Image } from "./AssetImage";
import {
  type Product,
  getHoverImage,
  getStockState,
  stockLabel,
} from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";

/**
 * Editorial product card.
 * - stock state is explicit (in stock / last units / sold out)
 * - quick add expands to sizes on touch as well as on hover
 * - no invented data: price, sizes and availability come from products.json
 */
export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw",
  index,
  variant = "default",
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
  index?: number;
  variant?: "default" | "featured";
}) {
  const {
    language,
    price,
    addToCart,
    toggleWishlist,
    isWishlisted,
    setRestockModalProduct,
  } = useStore();
  const t = (pt: string, en: string) => (language === "pt" ? pt : en);

  const [quickOpen, setQuickOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const hover = getHoverImage(product);
  const front = product.images.front;
  const saved = isWishlisted(product.slug);
  const state = getStockState(product);
  const singleSize = product.sizes.length === 1;
  const isFeatured = variant === "featured";

  const add = (size: string) => {
    addToCart(product, size, 1, false);
    setJustAdded(size);
    setQuickOpen(false);
    window.setTimeout(() => setJustAdded(null), 2200);
  };

  return (
    <article
      className="group relative flex flex-col"
      data-product={product.slug}
      data-stock={state}
    >
      <div
        className={`relative w-full overflow-hidden bg-[var(--tkn-surface-alt)] ${
          isFeatured ? "aspect-[4/5] sm:aspect-[3/4]" : "aspect-[4/5]"
        }`}
      >
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 block"
          aria-label={`${product.name} — ${price(product.priceEur)} — ${stockLabel(state, product.stock, language)}`}
        >
          <Image
            src={front.src}
            alt={t(front.altPt, front.altEn)}
            fill
            sizes={sizes}
            priority={priority}
            className={`object-cover img-swap ${
              state === "out" ? "opacity-55" : ""
            } ${hover ? "group-hover:opacity-0" : "group-hover:scale-[1.03]"}`}
          />
          {hover && (
            <Image
              src={hover.src}
              alt=""
              aria-hidden="true"
              fill
              sizes={sizes}
              className={`object-cover img-swap opacity-0 group-hover:opacity-100 ${
                state === "out" ? "group-hover:opacity-60" : ""
              }`}
            />
          )}
        </Link>

        {/* Index + state marker */}
        <div className="pointer-events-none absolute left-3 top-2.5 flex items-center gap-2.5 mono !text-[9px]">
          {typeof index === "number" && (
            <span className="text-[var(--tkn-muted)]">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          {state !== "in" && (
            <span
              className={`px-1.5 py-0.5 ${
                state === "out"
                  ? "bg-[var(--tkn-fg)] text-[var(--tkn-bg)]"
                  : "border border-current text-[var(--tkn-fg)]"
              }`}
            >
              {state === "out" ? "Sold out" : stockLabel(state, product.stock, language)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-pressed={saved}
          aria-label={
            saved
              ? t("Remover dos favoritos", "Remove from saved")
              : t("Guardar nos favoritos", "Save to wishlist")
          }
          className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center border border-[var(--tkn-border)] transition-colors duration-300 ${
            saved
              ? "bg-[var(--tkn-fg)] text-[var(--tkn-bg)]"
              : "bg-[var(--tkn-bg)]/85 text-[var(--tkn-fg)] hover:bg-[var(--tkn-fg)] hover:text-[var(--tkn-bg)]"
          }`}
        >
          <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
        </button>

        {/* Quick add: hover on desktop, explicit control on touch */}
        {state === "out" ? (
          <button
            type="button"
            onClick={() => setRestockModalProduct(product)}
            className="absolute inset-x-0 bottom-0 hidden w-full bg-[var(--tkn-fg)]/92 py-3 text-[var(--tkn-bg)] label backdrop-blur-sm lg:block lg:translate-y-full lg:transition-transform lg:duration-500 lg:[transition-timing-function:var(--ease-editorial)] lg:group-hover:translate-y-0"
          >
            {t("Avisa-me quando voltar", "Notify me when back")}
          </button>
        ) : (
          <div className="absolute inset-x-0 bottom-0 bg-[var(--tkn-bg)]/94 backdrop-blur-sm lg:translate-y-full lg:transition-transform lg:duration-500 lg:[transition-timing-function:var(--ease-editorial)] lg:group-hover:translate-y-0">
            {singleSize ? (
              <button
                type="button"
                onClick={() => add(product.sizes[0])}
                className="w-full py-3 label hover:bg-[var(--tkn-fg)] hover:text-[var(--tkn-bg)] transition-colors"
              >
                {justAdded
                  ? t("Adicionado ✓", "Added ✓")
                  : `${t("Adicionar", "Add")} — ${price(product.priceEur)}`}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setQuickOpen((v) => !v)}
                  aria-expanded={quickOpen}
                  aria-controls={`quick-${product.slug}`}
                  className="flex w-full items-center justify-between gap-3 px-3 py-3 label"
                >
                  <span>
                    {justAdded
                      ? `${t("Adicionado", "Added")} — ${justAdded} ✓`
                      : t("Compra rápida", "Quick add")}
                  </span>
                  <span aria-hidden="true" className="mono">
                    {quickOpen ? "−" : "+"}
                  </span>
                </button>
                <div
                  id={`quick-${product.slug}`}
                  className={`grid grid-cols-4 gap-px border-t border-[var(--tkn-border-subtle)] ${quickOpen ? "grid" : "hidden"}`}
                >
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => add(size)}
                      aria-label={`${t("Adicionar", "Add")} ${product.name}, ${t("tamanho", "size")} ${size}`}
                      className="bg-[var(--tkn-bg)] py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] hover:bg-[var(--tkn-fg)] hover:text-[var(--tkn-bg)] transition-colors"
                    >
                      {size === "Único" ? t("Único", "One") : size}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between pt-3">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <h3 className="product-name min-w-0 sm:truncate">
            <Link
              href={`/product/${product.slug}`}
              className="hover:opacity-55 transition-opacity"
            >
              {product.name}
            </Link>
          </h3>
          <span className="product-price shrink-0">{price(product.priceEur)}</span>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-3 product-meta">
          <span className="min-w-0 truncate">
            {state === "out" ? (
              <button
                type="button"
                onClick={() => setRestockModalProduct(product)}
                className="underline underline-offset-2 hover:opacity-60"
              >
                {t("Avisa-me quando voltar", "Notify me")}
              </button>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      state === "low" ? "bg-[#8c2f22]" : "bg-[#2f6b45]"
                    }`}
                  />
                  {stockLabel(state, product.stock, language)}
                </span>
                <span aria-hidden="true" className="mx-1.5 opacity-40">
                  /
                </span>
                {singleSize
                  ? t("Tamanho único", "One size")
                  : product.sizes.join(" ")}
              </>
            )}
          </span>
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 border border-black/20"
            style={{ backgroundColor: product.colorHex }}
            title={t(product.colorLabelPt, product.colorLabelEn)}
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
}
