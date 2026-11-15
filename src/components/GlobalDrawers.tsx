"use client";

import React, { useState, useMemo, useEffect, useRef, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AssetImage as Image } from "./AssetImage";
import { useDialogAccessibility } from "@/lib/use-dialog";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
  MapPin,
  Search,
  Bell,
  Ruler,
  Truck,
  Heart,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import {
  PRODUCTS,
  SITE_CONFIG,
  SIZE_CHART_IMAGES,
  CATEGORY_LABELS,
  EMPTY_FILTERS,
  filterProducts,
  getStockState,
  stockLabel,
  formatPrice,
  type ProductCategory,
} from "@/lib/catalog";

export function GlobalDrawers() {
  const {
    language,
    currency,
    eurToMznRate,
    cart,
    subtotalEur,
    freeShippingThresholdEur,
    freeShippingProgress,
    amountRemainingForFreeShippingEur,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    addToCart,
    wishlist,
    toggleWishlist,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isSearchOpen,
    setIsSearchOpen,
    restockModalProduct,
    setRestockModalProduct,
    sizeGuideCategory,
    setSizeGuideCategory,
    policyModal,
    setPolicyModal,
    price,
    trackEvent,
  } = useStore();

  useDialogAccessibility(Boolean(isCartOpen || isWishlistOpen || isSearchOpen || restockModalProduct || sizeGuideCategory || policyModal), () => {
    setIsCartOpen(false); setIsWishlistOpen(false); setIsSearchOpen(false);
    setRestockModalProduct(null); setSizeGuideCategory(null); setPolicyModal(null);
  });

  // Checkout state inside Cart Drawer
  const [checkoutStep, setCheckoutStep] = useState<
    "bag" | "checkout" | "success"
  >("bag");
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<
    "popup_pickup" | "maputo_express" | "international"
  >("popup_pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "mpesa" | "emola" | "cash_popup" | "bank_transfer" | "card"
  >("mpesa");
  const [notes, setNotes] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderCode: string;
    whatsappUrl: string;
    totalEur: string;
    deliveryMethod: string;
    paymentMethod: string;
  } | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<"all" | ProductCategory>("all");
  const [searchActive, setSearchActive] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInput = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // Restock modal state
  const [restockEmail, setRestockEmail] = useState("");
  const [restockWhatsapp, setRestockWhatsapp] = useState("");
  const [restockSize, setRestockSize] = useState("M");
  const [restockStatus, setRestockStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [restockMsg, setRestockMsg] = useState("");

  useEffect(() => {
    const initialSize = restockModalProduct?.sizes.includes("M") ? "M" : restockModalProduct?.sizes[0] || "M";
    startTransition(() => { setRestockStatus("idle"); setRestockMsg(""); setRestockSize(initialSize); });
  }, [restockModalProduct]);

  const shippingEur = useMemo(() => {
    if (deliveryMethod === "popup_pickup") return 0;
    if (subtotalEur >= freeShippingThresholdEur) return 0;
    if (deliveryMethod === "maputo_express")
      return SITE_CONFIG.store.maputoShippingEur;
    return SITE_CONFIG.store.internationalShippingEur;
  }, [deliveryMethod, subtotalEur, freeShippingThresholdEur]);

  const finalTotalEur = subtotalEur + shippingEur;

  const filteredProducts = useMemo(() => {
    const matched = filterProducts(PRODUCTS, { ...EMPTY_FILTERS, query: searchQuery });
    return searchCategory === "all"
      ? matched
      : matched.filter((p) => p.category === searchCategory);
  }, [searchQuery, searchCategory]);

  const hasSearchTerm = searchQuery.trim().length > 0;

  // Recent searches are a local convenience only, never sent anywhere.
  useEffect(() => {
    if (!isSearchOpen) return;
    let stored: unknown = [];
    try { stored = JSON.parse(window.localStorage.getItem("tkn_recent_searches") || "[]"); } catch {}
    const recent = Array.isArray(stored) ? stored.filter((v): v is string => typeof v === "string").slice(0, 4) : [];
    startTransition(() => { setRecentSearches(recent); setSearchActive(0); });
  }, [isSearchOpen]);

  const commitSearch = (term: string) => {
    const next = [term.trim(), ...recentSearches.filter((v) => v.toLowerCase() !== term.trim().toLowerCase())]
      .filter(Boolean)
      .slice(0, 4);
    setRecentSearches(next);
    try { window.localStorage.setItem("tkn_recent_searches", JSON.stringify(next)); } catch {}
  };

  const openProduct = (slug: string) => {
    if (searchQuery.trim()) commitSearch(searchQuery);
    setIsSearchOpen(false);
    router.push(`/product/${slug}`);
  };

  const wishlistedProducts = useMemo(
    () => PRODUCTS.filter((p) => wishlist.includes(p.slug)),
    [wishlist]
  );

  async function handleOrderSubmit(openWhatsappAfter: boolean) {
    setOrderError("");
    if (!customerName.trim() || !customerWhatsapp.trim()) {
      setOrderError(
        language === "pt"
          ? "Indica o teu nome e número de WhatsApp (+258...)."
          : "Please enter your name and WhatsApp number."
      );
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerWhatsapp,
          deliveryMethod,
          deliveryAddress,
          paymentMethod,
          currency,
          notes,
          items: cart.map((item) => ({
            slug: item.slug,
            name: item.name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unitPriceEur: item.unitPriceEur,
            reserveForPopup: deliveryMethod === "popup_pickup",
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setOrderError(data.error || "Erro ao submeter pedido.");
        setSubmittingOrder(false);
        return;
      }

      trackEvent("Purchase", {
        transaction_id: data.order.orderCode,
        value: Number(data.order.totalEur),
        currency: "EUR",
      });

      setConfirmedOrder({
        orderCode: data.order.orderCode,
        whatsappUrl: data.whatsappUrl,
        totalEur: data.order.totalEur,
        deliveryMethod,
        paymentMethod,
      });
      clearCart();
      setCheckoutStep("success");

      if (openWhatsappAfter && data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setOrderError(
        language === "pt"
          ? "Falha de ligação. Podes também concluir diretamente por WhatsApp."
          : "Connection error. Please try again."
      );
    } finally {
      setSubmittingOrder(false);
    }
  }

  async function handleRestockSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restockModalProduct) return;
    setRestockStatus("loading");
    setRestockMsg("");

    try {
      const res = await fetch("/api/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: restockModalProduct.slug,
          productName: restockModalProduct.name,
          preferredSize: restockSize,
          email: restockEmail,
          whatsapp: restockWhatsapp,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setRestockStatus("error");
        setRestockMsg(data.error || "Erro.");
        return;
      }
      trackEvent("Lead", {
        content_name: `Restock: ${restockModalProduct.name}`,
      });
      setRestockStatus("done");
      setRestockEmail("");
      setRestockWhatsapp("");
    } catch {
      setRestockStatus("error");
      setRestockMsg("Erro de rede.");
    }
  }

  return (
    <>
      {/* =========================================================
          1. SLIDE-OVER CART & CHECKOUT DRAWER
      ========================================================= */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-[60] flex justify-end bg-black/45 backdrop-blur-[2px] animate-[tkn-fade_0.5s_var(--ease-editorial)_both]"
          role="dialog"
          aria-modal="true"
          aria-label={language === "pt" ? "Carrinho Taikonaut" : "Taikonaut cart"}
        >
          <div className="relative flex h-full w-full max-w-md flex-col animate-[tkn-drawer_0.8s_var(--ease-editorial)_both] bg-[var(--tkn-surface)] text-[var(--tkn-fg)] border-l-2 border-[var(--tkn-border-subtle)]">
            {/* Drawer header — editorial, with explicit progress */}
            <div className="border-b border-[var(--tkn-border)] px-5 pb-3 pt-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mono !text-[9px] text-[var(--tkn-muted)]">
                    TAIKONAUT® / {language === "pt" ? "COMPRA" : "PURCHASE"}
                  </p>
                  <h2 className="display text-[36px] leading-[0.95]">
                    {checkoutStep === "bag" && (language === "pt" ? "Saco." : "Bag.")}
                    {checkoutStep === "checkout" && (language === "pt" ? "Checkout." : "Checkout.")}
                    {checkoutStep === "success" && (language === "pt" ? "Feito." : "Done.")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    if (checkoutStep === "success") setCheckoutStep("bag");
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--tkn-border)] transition-colors hover:bg-[var(--tkn-fg)] hover:text-[var(--tkn-bg)]"
                  aria-label={language === "pt" ? "Fechar carrinho" : "Close cart"}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="mt-4 flex items-center gap-4 mono !text-[9px]">
                {[
                  { id: "bag", pt: "Saco", en: "Bag" },
                  { id: "checkout", pt: "Dados", en: "Details" },
                  { id: "success", pt: "Confirmar", en: "Confirm" },
                ].map((step, i) => {
                  const order = ["bag", "checkout", "success"];
                  const current = order.indexOf(checkoutStep);
                  const done = i < current;
                  const active = i === current;
                  return (
                    <li key={step.id} className={`flex items-center gap-1.5 ${active ? "text-[var(--tkn-fg)]" : done ? "text-[var(--tkn-muted)]" : "text-[var(--tkn-faint)]"}`}>
                      <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 ${active ? "bg-[#8c2f22]" : done ? "bg-[var(--tkn-fg)]" : "bg-[var(--tkn-border-subtle)]"}`} />
                      <span>{`0${i + 1} ${language === "pt" ? step.pt : step.en}`}</span>
                      {i < 2 && <span aria-hidden="true" className="ml-2 opacity-30">/</span>}
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Free Shipping Progress Bar */}
            {checkoutStep !== "success" && (
              <div className="px-5 py-3 bg-[var(--tkn-surface-alt)] border-b border-[var(--tkn-border-subtle)]">
                <div className="flex items-center justify-between text-xs font-mono-tech mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Truck className="w-3.5 h-3.5 text-[var(--tkn-muted)]" />
                    {amountRemainingForFreeShippingEur === 0
                      ? language === "pt"
                        ? "Envio Grátis Desbloqueado! "
                        : "Free Shipping Unlocked! "
                      : language === "pt"
                      ? `Faltam ${price(
                          amountRemainingForFreeShippingEur
                        )} para Envio Grátis`
                      : `Add ${price(
                          amountRemainingForFreeShippingEur
                        )} for Free Shipping`}
                  </span>
                  <span className="font-medium">{freeShippingProgress}%</span>
                </div>
                <div className="h-px w-full bg-[var(--tkn-border-subtle)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--tkn-fg)] transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[var(--tkn-muted)]">
                  {language === "pt"
                    ? "Levantamento no Homecoming Pop-Up (12 Dez · Spazio) é sempre GRÁTIS."
                    : "Pickup at Homecoming Pop-Up (Dec 12 · Spazio) is always FREE."}
                </p>
              </div>
            )}

            {/* Step 1: bag */}
            {checkoutStep === "bag" && (
              <>
                <div className="flex-1 overflow-y-auto px-5">
                  {cart.length === 0 ? (
                    <div className="space-y-4 py-16 text-center">
                      <p className="display text-[40px] leading-none">
                        {language === "pt" ? "Vazio." : "Empty."}
                      </p>
                      <p className="mx-auto max-w-[30ch] text-[13px] text-[var(--tkn-muted)]">
                        {language === "pt"
                          ? "Explora os Day & Night Map Jackets, os Signature Hoodies ou reserva peças para o Pop-Up de 12 de Dezembro."
                          : "Explore the Day & Night Map Jackets, Signature Hoodies, or reserve pieces for the December 12 Pop-Up."}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsCartOpen(false)}
                        className="inline-flex items-center gap-2 bg-[var(--tkn-fg)] px-5 py-3 text-[var(--tkn-bg)] label"
                      >
                        {language === "pt" ? "Ver a coleção" : "Shop the collection"}
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <ul className="divide-y divide-[var(--tkn-border-subtle)]">
                      {cart.map((item) => (
                        <li key={`${item.slug}-${item.size}`} className="flex gap-4 py-4">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={() => setIsCartOpen(false)}
                            className="relative block h-[120px] w-24 shrink-0 overflow-hidden bg-[var(--tkn-surface-alt)]"
                          >
                            <Image width={160} height={200} sizes="96px" src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  href={`/product/${item.slug}`}
                                  onClick={() => setIsCartOpen(false)}
                                  className="product-name truncate hover:opacity-60"
                                >
                                  {item.name}
                                </Link>
                                <span className="product-price shrink-0">
                                  {price(item.unitPriceEur * item.quantity)}
                                </span>
                              </div>
                              <p className="mt-1 product-meta">
                                {language === "pt" ? "Tam." : "Size"} {item.size}
                                {item.quantity > 1 ? ` · ×${item.quantity}` : ""}
                              </p>
                              {item.reserveForPopup && (
                                <p className="mt-1.5 inline-block border border-[var(--tkn-border)] px-1.5 py-0.5 mono !text-[8px]">
                                  {language === "pt" ? "Levantar no Pop-Up · 12 Dez" : "Pop-Up pickup · Dec 12"}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="inline-flex items-center border border-[var(--tkn-border-subtle)]">
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.slug, item.size, -1)}
                                  className="flex h-8 w-8 items-center justify-center hover:bg-[var(--tkn-surface-alt)]"
                                  aria-label={language === "pt" ? `Diminuir quantidade de ${item.name}` : `Decrease ${item.name} quantity`}
                                >
                                  <Minus className="w-3 h-3" aria-hidden="true" />
                                </button>
                                <span className="w-7 text-center mono !text-[10px]" aria-live="polite">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.slug, item.size, 1)}
                                  className="flex h-8 w-8 items-center justify-center hover:bg-[var(--tkn-surface-alt)]"
                                  aria-label={language === "pt" ? `Aumentar quantidade de ${item.name}` : `Increase ${item.name} quantity`}
                                >
                                  <Plus className="w-3 h-3" aria-hidden="true" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.slug, item.size)}
                                className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-[var(--tkn-muted)] underline underline-offset-2 hover:text-[var(--tkn-fg)]"
                                aria-label={language === "pt" ? `Remover ${item.name} do carrinho` : `Remove ${item.name} from cart`}
                              >
                                <Trash2 className="w-3 h-3" aria-hidden="true" />
                                {language === "pt" ? "Remover" : "Remove"}
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="space-y-4 border-t border-[var(--tkn-border)] bg-[var(--tkn-surface)] px-5 pb-5 pt-4">
                    <div className="flex items-end justify-between gap-4">
                      <span className="label text-[var(--tkn-muted)]">{language === "pt" ? "Subtotal" : "Subtotal"}</span>
                      <div className="text-right">
                        <div className="display text-[30px] leading-none">{price(subtotalEur)}</div>
                        <div className="mono !text-[9px] text-[var(--tkn-muted)]">
                          {currency === "EUR"
                            ? `≈ ${formatPrice(subtotalEur, "MZN", eurToMznRate)}`
                            : `≈ ${formatPrice(subtotalEur, "EUR", eurToMznRate)}`}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-[var(--tkn-muted)]">
                      {language === "pt"
                        ? "Envio e impostos calculados no passo seguinte. Levantamento no Pop-Up é gratuito."
                        : "Shipping and taxes calculated at the next step. Pop-Up pickup is free."}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryMethod("popup_pickup");
                        setCheckoutStep("checkout");
                        trackEvent("InitiateCheckout", { value: subtotalEur });
                      }}
                      className="flex w-full items-center justify-between gap-3 bg-[var(--tkn-fg)] px-4 py-4 text-[var(--tkn-bg)] label hover:opacity-80 transition-opacity"
                    >
                      <span>{language === "pt" ? "Continuar" : "Continue"}</span>
                      <span className="flex items-center gap-2">
                        {language === "pt" ? "Checkout" : "Checkout"}
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="w-full text-center label underline underline-offset-4 text-[var(--tkn-muted)] hover:text-[var(--tkn-fg)]"
                    >
                      {language === "pt" ? "Continuar a comprar" : "Continue shopping"}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Step 2: Simple Local-Friendly Checkout */}
            {checkoutStep === "checkout" && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <button
                  type="button"
                  onClick={() => setCheckoutStep("bag")}
                  className="text-xs font-mono-tech underline hover:opacity-60"
                >
                  ← {language === "pt" ? "Voltar ao carrinho" : "Back to bag"}
                </button>

                {/* Delivery / Pop-Up Pickup Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono-tech font-medium uppercase">
                    1. {language === "pt" ? "Modo de Entrega" : "Delivery Mode"}
                  </label>

                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("popup_pickup")}
                      className={`p-3 text-left border transition-colors ${
                        deliveryMethod === "popup_pickup"
                          ? "border-[var(--tkn-fg)]"
                          : "border-[var(--tkn-border-subtle)]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium text-xs uppercase">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#b42318]" />
                          {language === "pt"
                            ? "Reserva e levanta no Pop-Up (12 Dez)"
                            : "Reserve & Pick Up at Pop-Up (Dec 12)"}
                        </span>
                        <span className="text-[var(--tkn-muted)] font-mono-tech">
                          GRÁTIS
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--tkn-muted)] mt-1">
                        Restaurante Spazio · Av. Paulo Samuel Kankhomba 578 ·
                        12:00–19:00
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("maputo_express")}
                      className={`p-3 text-left border transition-colors ${
                        deliveryMethod === "maputo_express"
                          ? "border-[var(--tkn-fg)]"
                          : "border-[var(--tkn-border-subtle)]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium text-xs uppercase">
                        <span>
                          {language === "pt"
                            ? "Entrega Expressa Maputo & Matola"
                            : "Maputo & Matola Express"}
                        </span>
                        <span className="font-mono-tech">
                          {subtotalEur >= freeShippingThresholdEur
                            ? "GRÁTIS"
                            : price(SITE_CONFIG.store.maputoShippingEur)}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("international")}
                      className={`p-3 text-left border transition-colors ${
                        deliveryMethod === "international"
                          ? "border-[var(--tkn-fg)]"
                          : "border-[var(--tkn-border-subtle)]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium text-xs uppercase">
                        <span>
                          {language === "pt"
                            ? "Províncias MZ / Internacional (DHL)"
                            : "Provinces / International Shipping"}
                        </span>
                        <span className="font-mono-tech">
                          {subtotalEur >= freeShippingThresholdEur
                            ? "GRÁTIS"
                            : price(SITE_CONFIG.store.internationalShippingEur)}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono-tech font-medium uppercase">
                    2. {language === "pt" ? "Os Teus Dados" : "Your Details"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      language === "pt" ? "Nome completo *" : "Full name *"
                    }
                    aria-label={language === "pt" ? "Nome completo" : "Full name"}
                    autoComplete="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[var(--tkn-border-subtle)] bg-[var(--tkn-bg)]"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp (+258 84 / 87 ...) *"
                    aria-label="WhatsApp" autoComplete="tel"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[var(--tkn-border-subtle)] bg-[var(--tkn-bg)]"
                  />
                  <input
                    type="email"
                    placeholder="Email (opcional p/ recibo)"
                    aria-label="Email" autoComplete="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[var(--tkn-border-subtle)] bg-[var(--tkn-bg)]"
                  />
                  {deliveryMethod !== "popup_pickup" && (
                    <input
                      type="text"
                      placeholder={
                        language === "pt"
                          ? "Bairro, Avenida, Nº porta, Cidade *"
                          : "Street address, Neighborhood, City *"
                      }
                      aria-label={language === "pt" ? "Morada" : "Address"}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-[var(--tkn-border-subtle)] bg-[var(--tkn-bg)]"
                    />
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono-tech font-medium uppercase">
                    3.{" "}
                    {language === "pt"
                      ? "Método de Pagamento"
                      : "Payment Method"}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
                    {[
                      { id: "mpesa", label: "M-Pesa" },
                      { id: "emola", label: "e-Mola" },
                      {
                        id: "cash_popup",
                        label:
                          language === "pt"
                            ? "Pagar no Pop-Up"
                            : "Pay at Pop-Up",
                      },
                      { id: "bank_transfer", label: "Transf. BIM" },
                      { id: "card", label: "Cartão / PayPal" },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() =>
                          setPaymentMethod(
                            pm.id as
                              | "mpesa"
                              | "emola"
                              | "cash_popup"
                              | "bank_transfer"
                              | "card"
                          )
                        }
                        className={`py-2 px-2.5 border font-medium uppercase ${
                          paymentMethod === pm.id
                            ? "border-[var(--tkn-fg)] bg-[var(--tkn-fg)] text-[var(--tkn-bg)]"
                            : "border-[var(--tkn-border-subtle)]"
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  placeholder={
                    language === "pt"
                      ? "Nota opcional (ex: hora prevista no Spazio)"
                      : "Optional note"
                  }
                  aria-label={language === "pt" ? "Notas do pedido" : "Order notes"}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--tkn-border-subtle)] bg-[var(--tkn-bg)]"
                />

                {/* Summary Box */}
                <div className="p-3 bg-[var(--tkn-surface-alt)] border border-[var(--tkn-border-subtle)] text-xs font-mono-tech space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{price(subtotalEur)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "pt" ? "Envio" : "Shipping"}</span>
                    <span>
                      {shippingEur === 0 ? "GRÁTIS" : price(shippingEur)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-[var(--tkn-border-subtle)] text-sm font-medium">
                    <span>TOTAL</span>
                    <span>
                      {formatPrice(finalTotalEur, "EUR", eurToMznRate)} ·{" "}
                      {formatPrice(finalTotalEur, "MZN", eurToMznRate)}
                    </span>
                  </div>
                </div>

                {orderError && (
                  <p className="text-xs text-[#b42318] font-medium">
                    {orderError}
                  </p>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    disabled={submittingOrder}
                    onClick={() => handleOrderSubmit(false)}
                    className="w-full py-3.5 px-4 bg-[var(--tkn-fg)] text-[var(--tkn-bg)] hover:opacity-80 font-mono-tech font-medium text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {submittingOrder
                      ? "A registar..."
                      : deliveryMethod === "popup_pickup"
                      ? language === "pt"
                        ? "Confirmar Reserva para o Pop-Up"
                        : "Confirm Pop-Up Reservation"
                      : language === "pt"
                      ? "Confirmar Pedido Online"
                      : "Confirm Order"}
                  </button>

                  <button
                    type="button"
                    disabled={submittingOrder}
                    onClick={() => handleOrderSubmit(true)}
                    className="w-full py-3 px-4 bg-[var(--tkn-fg)] text-[var(--tkn-bg)] hover:opacity-90 font-mono-tech font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      {language === "pt"
                        ? "Concluir por WhatsApp (Pré-preenchido)"
                        : "Order via WhatsApp (Pre-filled)"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation Screen */}
            {checkoutStep === "success" && confirmedOrder && (
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--tkn-fg)] text-[var(--tkn-bg)] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-mono-tech uppercase text-[var(--tkn-muted)] font-medium">
                    {language === "pt"
                      ? "Registo Oficial Guardado"
                      : "Official Order Logged"}
                  </span>
                  <h3 className="text-[17px] tracking-[-0.02em] mt-1">
                    {confirmedOrder.orderCode}
                  </h3>
                </div>

                <div className="p-4 text-left border border-[var(--tkn-border-subtle)] bg-[var(--tkn-bg)] text-xs space-y-2 font-mono-tech">
                  {confirmedOrder.deliveryMethod === "popup_pickup" && (
                    <p className="text-[#b42318] font-medium">
                      LEVANTAMENTO NO POP-UP: Sábado, 12 Dez (12:00–19:00) ·
                      Restaurante Spazio, Av. Paulo Samuel Kankhomba 578.
                    </p>
                  )}
                  {confirmedOrder.paymentMethod === "mpesa" && (
                    <p>
                      <strong>M-Pesa:</strong>{" "}
                      {SITE_CONFIG.store.mpesaNumber}
                    </p>
                  )}
                  {confirmedOrder.paymentMethod === "emola" && (
                    <p>
                      <strong>e-Mola:</strong>{" "}
                      {SITE_CONFIG.store.emolaNumber}
                    </p>
                  )}
                  {confirmedOrder.paymentMethod === "bank_transfer" && (
                    <p>
                      <strong>IBAN BIM:</strong> {SITE_CONFIG.store.bankIban}
                    </p>
                  )}
                  <p>
                    <strong>Total:</strong>{" "}
                    {formatPrice(
                      Number(confirmedOrder.totalEur),
                      "EUR",
                      eurToMznRate
                    )}{" "}
                    (
                    {formatPrice(
                      Number(confirmedOrder.totalEur),
                      "MZN",
                      eurToMznRate
                    )}
                    )
                  </p>
                </div>

                <a
                  href={confirmedOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-[var(--tkn-fg)] text-[var(--tkn-bg)] font-mono-tech font-medium text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {language === "pt"
                      ? "Enviar Comprovativo / Abrir no WhatsApp"
                      : "Send Confirmation on WhatsApp"}
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          2. WISHLIST DRAWER
      ========================================================= */}
      {isWishlistOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-[tkn-fade_0.5s_var(--ease-editorial)_both]"
          role="dialog"
          aria-modal="true"
          aria-label="Lista de desejos"
        >
          <div className="relative flex h-full w-full max-w-md flex-col animate-[tkn-drawer_0.8s_var(--ease-editorial)_both] bg-[var(--tkn-surface)] text-[var(--tkn-fg)] border-l-2 border-[var(--tkn-border-subtle)]">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[var(--tkn-border-subtle)]">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#b42318] " />
                <h2 className="text-[17px] tracking-[-0.02em]">
                  {language === "pt" ? "Lista de Desejos" : "Saved Wishlist"} (
                  {wishlistedProducts.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsWishlistOpen(false)}
                className="w-9 h-9 flex items-center justify-center border border-[var(--tkn-border-subtle)]"
                aria-label="Fechar favoritos"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {wishlistedProducts.length === 0 ? (
                <p className="py-12 text-center text-sm text-[var(--tkn-muted)]">
                  {language === "pt"
                    ? "Ainda não guardaste nenhuma peça favorita."
                    : "No saved pieces yet."}
                </p>
              ) : (
                wishlistedProducts.map((p) => (
                  <div
                    key={p.slug}
                    className="flex items-center gap-3 p-3 border border-[var(--tkn-border-subtle)] bg-[var(--tkn-bg)]"
                  >
                    <Image width={160} height={200} sizes="80px"
                      src={p.images.front.src}
                      alt={p.name}
                      className={`w-16 h-20 object-cover border border-[var(--tkn-border-subtle)] ${
                        p.soldOut ? "grayscale opacity-70" : ""
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${p.slug}`}
                        onClick={() => setIsWishlistOpen(false)}
                        className="text-[13px] hover:underline block truncate"
                      >
                        {p.name}
                      </Link>
                      <span className="font-mono-tech text-xs font-medium block mt-0.5">
                        {price(p.priceEur)}
                      </span>
                      <div className="mt-2 flex items-center gap-2">
                        {p.soldOut ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsWishlistOpen(false);
                              setRestockModalProduct(p);
                            }}
                            className="px-2.5 py-1 text-[11px] font-mono-tech font-medium border border-[var(--tkn-border-subtle)]"
                          >
                            {language === "pt" ? "Avisa-me" : "Notify me"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsWishlistOpen(false);
                              addToCart(p, p.sizes[0], 1, false);
                            }}
                            className="px-2.5 py-1 text-[11px] font-mono-tech font-medium bg-[var(--tkn-fg)] text-[var(--tkn-bg)]"
                          >
                            {language === "pt" ? "+ Carrinho" : "+ Bag"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(p.slug)}
                          className="text-xs text-[var(--tkn-muted)] underline"
                        >
                          {language === "pt" ? "Remover" : "Remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          3. INSTANT SEARCH MODAL
      ========================================================= */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 p-0 pt-0 sm:p-4 sm:pt-20 animate-[tkn-fade_0.4s_var(--ease-editorial)_both]"
          role="dialog"
          aria-modal="true"
          aria-label={language === "pt" ? "Pesquisa instantânea" : "Instant search"}
        >
          <div className="flex max-h-[100svh] w-full max-w-3xl flex-col border-0 border-[var(--tkn-border)] bg-[var(--tkn-surface)] sm:max-h-[80vh] sm:border">
            <div className="flex items-center gap-3 border-b border-[var(--tkn-border)] px-4 py-3.5">
              <Search className="h-4 w-4 text-[var(--tkn-muted)]" aria-hidden="true" />
              <input
                ref={searchInput}
                type="search"
                autoFocus
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-autocomplete="list"
                aria-activedescendant={filteredProducts[searchActive] ? `search-option-${filteredProducts[searchActive].slug}` : undefined}
                aria-label={language === "pt" ? "Pesquisa instantânea" : "Instant search"}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchActive(0); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setSearchActive((i) => Math.min(filteredProducts.length - 1, i + 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setSearchActive((i) => Math.max(0, i - 1)); }
                  if (e.key === "Enter" && filteredProducts[searchActive]) { e.preventDefault(); openProduct(filteredProducts[searchActive].slug); }
                }}
                placeholder={language === "pt" ? "Procura uma peça, uma cor, um tamanho…" : "Search a piece, a colour, a size…"}
                className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[var(--tkn-muted)]"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="border border-[var(--tkn-border-subtle)] px-2 py-1 mono !text-[9px] hover:border-[var(--tkn-fg)]"
              >
                ESC
              </button>
            </div>

            <div className="no-scrollbar flex items-center gap-4 overflow-x-auto border-b border-[var(--tkn-border-subtle)] px-4 py-2.5">
              {(["all", "jackets", "hoodies", "tees", "taikosunnies", "accessories"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setSearchCategory(cat); setSearchActive(0); }}
                  aria-pressed={searchCategory === cat}
                  className={`whitespace-nowrap label transition-opacity ${searchCategory === cat ? "underline underline-offset-4" : "text-[var(--tkn-muted)] hover:text-[var(--tkn-fg)]"}`}
                >
                  {cat === "all" ? (language === "pt" ? "Tudo" : "All") : cat === "jackets" ? "Map Jackets" : CATEGORY_LABELS[cat][language]}
                </button>
              ))}
            </div>

            {!hasSearchTerm && recentSearches.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--tkn-border-subtle)] px-4 py-3">
                <span className="mono !text-[9px] text-[var(--tkn-muted)]">{language === "pt" ? "Recentes" : "Recent"}</span>
                {recentSearches.map((term) => (
                  <button key={term} type="button" onClick={() => setSearchQuery(term)} className="label hover:opacity-60">
                    {term}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setRecentSearches([]); try { window.localStorage.removeItem("tkn_recent_searches"); } catch {} }}
                  className="mono !text-[9px] underline underline-offset-2 text-[var(--tkn-muted)]"
                >
                  {language === "pt" ? "limpar" : "clear"}
                </button>
              </div>
            )}

            <div id="search-results" role="listbox" aria-label={language === "pt" ? "Resultados" : "Results"} className="flex-1 overflow-y-auto px-2 py-2">
              {filteredProducts.length === 0 ? (
                <div className="px-3 py-10 text-center">
                  <p className="display text-[32px] leading-none">{language === "pt" ? "Sem resultados." : "No results."}</p>
                  <p className="mx-auto mt-3 max-w-[34ch] text-[12px] text-[var(--tkn-muted)]">
                    {language === "pt" ? "Tenta outra palavra ou explora uma categoria." : "Try another word or browse a category."}
                  </p>
                </div>
              ) : (
                filteredProducts.map((p, i) => {
                  const state = getStockState(p);
                  return (
                    <div
                      key={p.slug}
                      id={`search-option-${p.slug}`}
                      role="option"
                      aria-selected={i === searchActive}
                      onMouseEnter={() => setSearchActive(i)}
                      className={`flex cursor-pointer items-center gap-4 px-3 py-2.5 transition-colors ${i === searchActive ? "bg-[var(--tkn-surface-alt)]" : ""}`}
                      onClick={() => openProduct(p.slug)}
                    >
                      <Image width={160} height={200} sizes="64px" src={p.images.front.src} alt="" className={`h-16 w-14 shrink-0 object-cover ${state === "out" ? "opacity-55" : ""}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="product-name truncate">{p.name}</span>
                          {state !== "in" && (
                            <span className="shrink-0 border border-[var(--tkn-border-subtle)] px-1 py-0.5 mono !text-[8px]">
                              {state === "out" ? "Sold out" : stockLabel(state, p.stock, language)}
                            </span>
                          )}
                        </div>
                        <p className="mono !text-[9px] text-[var(--tkn-muted)]">
                          {CATEGORY_LABELS[p.category][language]} · {p.sizes.join(" ")}
                        </p>
                      </div>
                      <span className="product-price shrink-0">{price(p.priceEur)}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden="true" />
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[var(--tkn-border-subtle)] px-4 py-2.5">
              <span className="mono !text-[9px] text-[var(--tkn-muted)]">
                ↑↓ {language === "pt" ? "navegar" : "navigate"} · ↵ {language === "pt" ? "abrir" : "open"}
              </span>
              <Link
                href="/shop"
                onClick={() => setIsSearchOpen(false)}
                className="label underline underline-offset-4 hover:opacity-60"
              >
                {language === "pt" ? "Ver catálogo completo" : "See full catalogue"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          4. SOLD-OUT RESTOCK ALERT MODAL ("AVISA-ME QUANDO VOLTAR")
      ========================================================= */}
      {restockModalProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Aviso de reposição"
        >
          <div className="w-full max-w-md bg-[var(--tkn-surface)] border border-[var(--tkn-border-subtle)] p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono-tech font-medium uppercase text-[#b42318]">
                  <Bell className="w-3.5 h-3.5" />
                  {language === "pt"
                    ? "Aviso de reposição"
                    : "Restock notification"}
                </span>
                <h3 className="text-[17px] tracking-[-0.02em] mt-1">
                  {restockModalProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRestockModalProduct(null);
                  setRestockStatus("idle");
                }}
                className="w-8 h-8 flex items-center justify-center border border-[var(--tkn-border-subtle)]"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {restockStatus === "done" ? (
              <div className="py-6 text-center space-y-3">
                <Sparkles className="w-8 h-8 mx-auto text-[var(--tkn-muted)]" />
                <p className="text-[13px]">
                  {language === "pt"
                    ? "Pedido de aviso guardado. "
                    : "Restock request saved. "}
                </p>
                <p className="text-xs text-[var(--tkn-muted)]">
                  {language === "pt"
                    ? "O teu contacto foi registado para esta peça."
                    : "Your contact has been registered for this piece."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleRestockSubmit} className="space-y-3">
                <p className="text-xs text-[var(--tkn-muted)]">
                  {language === "pt"
                    ? "Esta peça está esgotada. Deixa o teu contacto para receberes um aviso de reposição."
                    : "This piece is sold out. Leave your contact for a restock notification."}
                </p>

                {restockModalProduct.sizes.length > 1 && (
                  <div>
                    <label className="block text-[11px] font-mono-tech uppercase font-medium mb-1">
                      {language === "pt"
                        ? "Tamanho desejado"
                        : "Preferred size"}
                    </label>
                    <div className="flex gap-2">
                      {restockModalProduct.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setRestockSize(sz)}
                          className={`px-3 py-1.5 text-xs font-mono-tech font-medium border ${
                            restockSize === sz
                              ? "bg-[var(--tkn-fg)] text-[var(--tkn-bg)] border-[var(--tkn-fg)]"
                              : "border-[var(--tkn-border-subtle)]"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  type="tel"
                  placeholder="WhatsApp (+258 84 ...)"
                  aria-label="WhatsApp" value={restockWhatsapp}
                  onChange={(e) => setRestockWhatsapp(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[var(--tkn-border-subtle)] bg-[var(--tkn-bg)]"
                />
                <input
                  type="email"
                  placeholder="Email (ex: nome@dominio.com)"
                  aria-label="Email" value={restockEmail}
                  onChange={(e) => setRestockEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[var(--tkn-border-subtle)] bg-[var(--tkn-bg)]"
                />

                {restockStatus === "error" && (
                  <p className="text-xs text-[#b42318] font-medium">
                    {restockMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={restockStatus === "loading"}
                  className="w-full py-3 bg-[var(--tkn-fg)] text-[var(--tkn-bg)] hover:opacity-80 text-xs font-mono-tech font-medium uppercase tracking-wider transition-colors"
                >
                  {restockStatus === "loading"
                    ? "A guardar..."
                    : language === "pt"
                    ? "Avisa-me quando voltar"
                    : "Notify me on restock"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          5. SIZE GUIDE MODAL ("GUIA DE TAMANHOS")
      ========================================================= */}
      {sizeGuideCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-[tkn-fade_0.5s_var(--ease-editorial)_both]"
          role="dialog"
          aria-modal="true"
          aria-label={language === "pt" ? "Guia de tamanhos" : "Size guide"}
          onClick={() => setSizeGuideCategory(null)}
        >
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[var(--tkn-bg)] p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="label">{language === "pt" ? "Guia de tamanhos" : "Size guide"}</h3>
              <button type="button" onClick={() => setSizeGuideCategory(null)} className="label hover:opacity-60">
                {language === "pt" ? "Fechar" : "Close"}
              </button>
            </div>
            <div className="flex gap-5 mb-4">
              {(["tees", "hoodies", "jackets"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSizeGuideCategory(cat)}
                  className={`label ${sizeGuideCategory === cat ? "underline underline-offset-4" : "text-[var(--tkn-faint)] hover:text-[var(--tkn-fg)]"}`}
                >
                  {cat === "tees" ? "Tees" : cat === "hoodies" ? "Hoodies" : "Jackets"}
                </button>
              ))}
            </div>
            <div className="relative aspect-[4/5] w-full bg-[var(--tkn-surface-alt)]">
              <Image
                src={SIZE_CHART_IMAGES[sizeGuideCategory]}
                alt={language === "pt" ? "Tabela de tamanhos oficial Taikonaut" : "Official Taikonaut size chart"}
                fill
                sizes="(min-width: 640px) 576px, 100vw"
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-[12px] text-[var(--tkn-muted)]">
              {language === "pt"
                ? "Corte oversized. Escolhe o teu tamanho habitual para o caimento original."
                : "Oversized fit. Take your usual size for the intended fit."}
            </p>
          </div>
        </div>
      )}

      {/* =========================================================
          6. FOOTER POLICY MODALS (SHIPPING / RETURNS / PRIVACY)
      ========================================================= */}
      {policyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={language === "pt" ? "Políticas da loja" : "Store policies"}
        >
          <div className="w-full max-w-lg bg-[var(--tkn-surface)] border border-[var(--tkn-border-subtle)] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--tkn-border-subtle)] pb-3">
              <h3 className="text-[17px] tracking-[-0.02em]">
                {policyModal === "shipping" &&
                  (language === "pt"
                    ? "Envios & Levantamento Pop-Up"
                    : "Shipping & Pop-Up Pickup")}
                {policyModal === "returns" &&
                  (language === "pt"
                    ? "Trocas & Devoluções"
                    : "Exchanges & Returns")}
                {policyModal === "privacy" &&
                  (language === "pt"
                    ? "Política de Privacidade"
                    : "Privacy Policy")}
              </h3>
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                className="w-8 h-8 flex items-center justify-center border border-[var(--tkn-border-subtle)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm text-[var(--tkn-muted)] space-y-2.5 leading-relaxed">
              {policyModal === "shipping" && (
                <>
                  <p>
                    <strong>Levantamento no Homecoming Pop-Up (Grátis):</strong>{" "}
                    Reserva online e levanta no sábado, 12 de Dezembro
                    (12:00–19:00) no Restaurante Spazio, Maputo.
                  </p>
                  <p>
                    <strong>Maputo & Matola:</strong> Entrega por estafeta em
                    24h–48h úteis (€ 5,00 ou grátis acima de € 90,00).
                  </p>
                  <p>
                    <strong>Resto de Moçambique & Internacional:</strong> Envio
                    registado via DHL Express com código de rastreio (3–7 dias
                    úteis).
                  </p>
                </>
              )}
              {policyModal === "returns" && (
                <>
                  <p>
                    Aceitamos trocas de tamanho até 14 dias após a receção, desde
                    que a peça não tenha sido usada nem lavada e mantenha todas
                    as etiquetas Taikonaut originais.
                  </p>
                  <p>
                    Em Maputo, podes também efetuar trocas presenciais mediante
                    marcação por WhatsApp ou diretamente nos eventos Pop-Up.
                  </p>
                </>
              )}
              {policyModal === "privacy" && (
                <>
                  <p>
                    Os teus contactos de Email e WhatsApp são usados
                    exclusivamente pela Taikonaut Maputo para processar
                    encomendas, reservas do Pop-Up e avisos prioritários de
                    drops que subscreveste. Nunca partilhamos os teus dados com
                    terceiros.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
