"use client";

import React, {
  startTransition,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  SITE_CONFIG,
  getProductBySlug,
  formatPrice,
  type Currency,
  type Language,
  type Product,
  type ThemeMode,
} from "@/lib/catalog";

export interface CartItem {
  slug: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPriceEur: number;
  image: string;
  reserveForPopup: boolean;
}

export type PolicyModalType = "shipping" | "returns" | "privacy" | null;
export type SizeGuideType = "tees" | "hoodies" | "jackets" | null;

interface StoreContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  eurToMznRate: number;
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  cart: CartItem[];
  cartCount: number;
  subtotalEur: number;
  freeShippingThresholdEur: number;
  freeShippingProgress: number;
  amountRemainingForFreeShippingEur: number;
  addToCart: (
    product: Product,
    size: string,
    quantity?: number,
    reserveForPopup?: boolean
  ) => void;
  updateCartQuantity: (slug: string, size: string, delta: number) => void;
  removeFromCart: (slug: string, size: string) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  restockModalProduct: Product | null;
  setRestockModalProduct: (product: Product | null) => void;
  sizeGuideCategory: SizeGuideType;
  setSizeGuideCategory: (cat: SizeGuideType) => void;
  policyModal: PolicyModalType;
  setPolicyModal: (policy: PolicyModalType) => void;
  price: (eur: number) => string;
  trackEvent: (name: string, params?: Record<string, unknown>) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt");
  const [currency, setCurrencyState] = useState<Currency>("EUR");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("day");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [restockModalProduct, setRestockModalProduct] = useState<Product | null>(
    null
  );
  const [sizeGuideCategory, setSizeGuideCategory] = useState<SizeGuideType>(null);
  const [policyModal, setPolicyModal] = useState<PolicyModalType>(null);

  const eurToMznRate = SITE_CONFIG.store.eurToMznRate;
  const freeShippingThresholdEur = SITE_CONFIG.store.freeShippingThresholdEur;

  useEffect(() => {
    try {
      startTransition(() => hydrateFromStorage());
    } catch {
      // Ignore storage errors in restricted environments
    }
    function hydrateFromStorage() {
      const savedLang = localStorage.getItem("tkn_lang") as Language | null;
      if (savedLang === "pt" || savedLang === "en") setLanguageState(savedLang);

      const savedCurr = localStorage.getItem("tkn_curr") as Currency | null;
      if (savedCurr === "EUR" || savedCurr === "MZN") setCurrencyState(savedCurr);

      const savedTheme = localStorage.getItem("tkn_theme") as ThemeMode | null;
      if (savedTheme === "day" || savedTheme === "night") {
        setThemeModeState(savedTheme);
      }

      const savedCart = localStorage.getItem("tkn_cart");
      if (savedCart) {
        const stored = JSON.parse(savedCart);
        if (Array.isArray(stored)) {
          const migrated = stored.filter((item: CartItem) => getProductBySlug(item.slug) && Number.isInteger(item.quantity) && item.quantity > 0).map((item: CartItem) => ({ ...item, image: getProductBySlug(item.slug)!.images.front.src }));
          setCart(migrated);
          localStorage.setItem("tkn_cart", JSON.stringify(migrated));
        }
      }

      const savedWish = localStorage.getItem("tkn_wishlist");
      if (savedWish) setWishlist(JSON.parse(savedWish));
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = themeMode;
      document.documentElement.lang = language === "pt" ? "pt-MZ" : "en";
    }
  }, [themeMode, language]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setRestockModalProduct(null);
        setSizeGuideCategory(null);
        setPolicyModal(null);
        setIsCartOpen(false);
        setIsWishlistOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const trackEvent = useCallback(
    (name: string, params?: Record<string, unknown>) => {
      if (typeof window === "undefined") return;
      if (typeof window.gtag === "function") {
        window.gtag("event", name, params || {});
      }
      if (typeof window.fbq === "function") {
        window.fbq("trackCustom", name, params || {});
      }
      if (typeof window.plausible === "function") {
        window.plausible(name, { props: params });
      }
    },
    []
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("tkn_lang", lang);
    } catch {}
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem("tkn_curr", curr);
    } catch {}
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem("tkn_theme", mode);
    } catch {}
  };

  const toggleThemeMode = () => {
    setThemeMode(themeMode === "day" ? "night" : "day");
  };

  const persistCart = (next: CartItem[]) => {
    setCart(next);
    try {
      localStorage.setItem("tkn_cart", JSON.stringify(next));
    } catch {}
  };

  const addToCart = (
    product: Product,
    size: string,
    quantity = 1,
    reserveForPopup = false
  ) => {
    if (product.soldOut) {
      setRestockModalProduct(product);
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.slug === product.slug && item.size === size
      );
      let next: CartItem[];
      if (idx >= 0) {
        next = prev.map((item, i) =>
          i === idx
            ? {
                ...item,
                quantity: Math.min(product.stock, item.quantity + quantity),
                reserveForPopup: reserveForPopup || item.reserveForPopup,
              }
            : item
        );
      } else {
        next = [
          ...prev,
          {
            slug: product.slug,
            name: product.name,
            size,
            color:
              language === "pt" ? product.colorLabelPt : product.colorLabelEn,
            quantity: Math.min(product.stock, quantity),
            unitPriceEur: product.priceEur,
            image: product.images.front.src,
            reserveForPopup,
          },
        ];
      }
      try {
        localStorage.setItem("tkn_cart", JSON.stringify(next));
      } catch {}
      return next;
    });

    trackEvent("AddToCart", {
      content_name: product.name,
      content_ids: [product.id],
      value: product.priceEur * quantity,
      currency: "EUR",
      reserveForPopup,
    });

    setIsCartOpen(true);
  };

  const updateCartQuantity = (slug: string, size: string, delta: number) => {
    const next = cart
      .map((item) =>
        item.slug === slug && item.size === size
          ? { ...item, quantity: Math.min(getProductBySlug(item.slug)?.stock ?? 99, Math.max(0, item.quantity + delta)) }
          : item
      )
      .filter((item) => item.quantity > 0);
    persistCart(next);
  };

  const removeFromCart = (slug: string, size: string) => {
    const next = cart.filter(
      (item) => !(item.slug === slug && item.size === size)
    );
    persistCart(next);
  };

  const clearCart = () => {
    persistCart([]);
  };

  const toggleWishlist = (slug: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(slug);
      const next = exists ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem("tkn_wishlist", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isWishlisted = (slug: string) => wishlist.includes(slug);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalEur = cart.reduce(
    (acc, item) => acc + item.unitPriceEur * item.quantity,
    0
  );

  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotalEur / freeShippingThresholdEur) * 100)
  );
  const amountRemainingForFreeShippingEur = Math.max(
    0,
    freeShippingThresholdEur - subtotalEur
  );

  const price = useCallback(
    (eur: number) => formatPrice(eur, currency, eurToMznRate),
    [currency, eurToMznRate]
  );

  return (
    <StoreContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        eurToMznRate,
        themeMode,
        toggleThemeMode,
        setThemeMode,
        cart,
        cartCount,
        subtotalEur,
        freeShippingThresholdEur,
        freeShippingProgress,
        amountRemainingForFreeShippingEur,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        wishlist,
        toggleWishlist,
        isWishlisted,
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
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return ctx;
}
