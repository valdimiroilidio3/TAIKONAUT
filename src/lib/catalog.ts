import productsData from "@/data/products.json";
import eventConfigData from "@/data/event-config.json";

export type Language = "pt" | "en";
export type Currency = "EUR" | "MZN";
export type ThemeMode = "day" | "night";

export type ProductCategory =
  | "tees"
  | "hoodies"
  | "jackets"
  | "taikosunnies"
  | "accessories";

export interface ProductImageEntry {
  src: string;
  altPt: string;
  altEn: string;
}

export interface ProductTheme {
  name: string;
  primary: string;
  secondary: string;
  surfaceLight: string;
  surfaceDark: string;
  badgeBg: string;
  badgeText: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  priceEur: number;
  soldOut: boolean;
  imageMissing?: boolean;
  stock: number;
  featured: boolean;
  bestseller: boolean;
  badgePt: string;
  badgeEn: string;
  colorKey: string;
  colorLabelPt: string;
  colorLabelEn: string;
  colorHex: string;
  theme: ProductTheme;
  sizes: string[];
  colorSiblings: string[];
  pairsWith: string[];
  taglinePt: string;
  taglineEn: string;
  descriptionPt: string;
  descriptionEn: string;
  materialPt: string;
  materialEn: string;
  carePt: string;
  careEn: string;
  images: {
    front: ProductImageEntry;
    back?: ProductImageEntry;
    detail?: ProductImageEntry;
    model?: ProductImageEntry;
  };
}

export const PRODUCTS: Product[] = productsData as Product[];
export const SITE_CONFIG = eventConfigData;

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatPrice(
  priceEur: number,
  currency: Currency,
  rateMzn: number = SITE_CONFIG.store.eurToMznRate
): string {
  if (currency === "EUR") {
    return `€ ${priceEur.toFixed(2).replace(".", ",")}`;
  }
  const mzn = Math.round(priceEur * rateMzn);
  return `${mzn.toLocaleString("pt-MZ")} MZN`;
}

export const CATEGORY_LABELS: Record<
  "all" | ProductCategory,
  { pt: string; en: string }
> = {
  all: { pt: "Tudo", en: "All" },
  tees: { pt: "Tees", en: "Tees" },
  hoodies: { pt: "Hoodies", en: "Hoodies" },
  jackets: { pt: "Jackets", en: "Jackets" },
  taikosunnies: { pt: "Taikosunnies", en: "Taikosunnies" },
  accessories: { pt: "Acessórios", en: "Accessories" },
};

/** All available images for a product, in display order, de-duplicated. */
export function getGallery(product: Product): ProductImageEntry[] {
  const { front, back, detail, model } = product.images;
  const list = [front, back, detail, model].filter(
    (img): img is ProductImageEntry => Boolean(img && img.src)
  );
  return list.filter((img, i) => list.findIndex((x) => x.src === img.src) === i);
}

/** Second image for subtle hover swap (undefined when the product has only one photo). */
export function getHoverImage(product: Product): ProductImageEntry | undefined {
  const g = getGallery(product);
  return g.length > 1 ? g[1] : undefined;
}

export interface LookbookShot {
  id: string;
  src: string;
  captionPt: string;
  captionEn: string;
  productSlug?: string;
  productName: string;
}

/**
 * Official Taikonaut photography (from taikonautmaputo.com).
 * To add Instagram exports: drop files in public/images/official/ and add entries here.
 */
export const LOOKBOOK_SHOTS: LookbookShot[] = [
  {
    id: "lb-1",
    src: "/images/campaigns/arrival/mozdrian-editorial.webp",
    captionPt: "Mozdrian Sweater, à porta da garagem",
    captionEn: "Mozdrian Sweater, at the garage door",
    productName: "Mozdrian Sweater — Arquivo",
  },
  {
    id: "lb-2",
    src: "/images/campaigns/signature/white-tee-editorial.webp",
    captionPt: "O logótipo desenhado à mão",
    captionEn: "The hand-drawn logo",
    productSlug: "white-basic-tee",
    productName: "White Basic Tee",
  },
  {
    id: "lb-3",
    src: "/images/community/fruit-series/manga-on-model.webp",
    captionPt: "Manga Tee e boné verde",
    captionEn: "Manga Tee and green cap",
    productSlug: "manga-tee",
    productName: "Manga Tee",
  },
  {
    id: "lb-4",
    src: "/images/details/map-jackets/day-map-close-up.webp",
    captionPt: "MAP — edição diurna",
    captionEn: "MAP — day edition",
    productSlug: "day-map-jacket",
    productName: "Day Map Jacket",
  },
  {
    id: "lb-5",
    src: "/images/community/fruit-series/tintsiva-on-model.webp",
    captionPt: "Tintsiva Tee, junto ao rio",
    captionEn: "Tintsiva Tee, by the river",
    productSlug: "tintsiva-tee",
    productName: "Tintsiva Tee",
  },
  {
    id: "lb-6",
    src: "/images/details/mozdrian/colour-block-knit.webp",
    captionPt: "Mozdrian Sweater — malha em blocos de cor",
    captionEn: "Mozdrian Sweater — colour-block knit",
    productName: "Mozdrian Sweater — Arquivo",
  },
  {
    id: "lb-7",
    src: "/images/details/map-jackets/night-map-close-up.webp",
    captionPt: "MAP — edição noturna",
    captionEn: "MAP — night edition",
    productSlug: "night-map-jacket",
    productName: "Night Map Jacket",
  },
];

export interface InstagramPost {
  id: string;
  image: string;
  altPt: string;
  altEn: string;
}

/** Replace with authorised exports from @taikonautmaputo (same 4:5 crop recommended). */
export const INSTAGRAM_FEED: InstagramPost[] = [
  { id: "ig-1", image: "/images/campaigns/arrival/mozdrian-editorial.webp", altPt: "Mozdrian Sweater à porta da garagem", altEn: "Mozdrian Sweater at the garage door" },
  { id: "ig-2", image: "/images/community/fruit-series/tintsiva-on-model.webp", altPt: "Tintsiva Tee junto ao rio", altEn: "Tintsiva Tee by the river" },
  { id: "ig-3", image: "/images/products/red-signature-hoodie/front.webp", altPt: "Red Signature Hoodie", altEn: "Red Signature Hoodie" },
  { id: "ig-4", image: "/images/campaigns/signature/white-tee-editorial.webp", altPt: "Logótipo Taikonaut numa t-shirt branca", altEn: "Taikonaut logo on a white tee" },
  { id: "ig-5", image: "/images/products/black-taikosunnies/profile.webp", altPt: "Black Taikosunnies", altEn: "Black Taikosunnies" },
  { id: "ig-6", image: "/images/community/fruit-series/manga-on-model.webp", altPt: "Manga Tee num cais", altEn: "Manga Tee on a jetty" },
];

/** Official size charts published by Taikonaut. */
export const SIZE_CHART_IMAGES: Record<"tees" | "hoodies" | "jackets", string> = {
  tees: "/images/brand/size-guides/tees.webp",
  hoodies: "/images/brand/size-guides/hoodies.webp",
  jackets: "/images/brand/size-guides/jackets.webp",
};

/* ------------------------------------------------------------------
   Commerce state helpers — one source of truth for stock, filters,
   sorting and URL state. Used by cards, /shop, search and the PDP.
------------------------------------------------------------------ */

export type StockState = "out" | "low" | "in";

export function getStockState(product: Product): StockState {
  if (product.soldOut || product.stock <= 0) return "out";
  if (product.stock <= 5) return "low";
  return "in";
}

export function stockLabel(state: StockState, stock: number, lang: Language): string {
  if (state === "out") return lang === "pt" ? "Esgotado" : "Sold out";
  if (state === "low")
    return lang === "pt" ? `Últimas ${stock} un.` : `Last ${stock}`;
  return lang === "pt" ? "Em stock" : "In stock";
}

export type CatalogSort = "featured" | "price_asc" | "price_desc" | "newest";
export type AvailabilityFilter = "all" | "in_stock" | "sold_out";

export interface CatalogFilters {
  categories: ProductCategory[];
  colors: string[];
  sizes: string[];
  availability: AvailabilityFilter;
  query: string;
  sort: CatalogSort;
}

export const EMPTY_FILTERS: CatalogFilters = {
  categories: [],
  colors: [],
  sizes: [],
  availability: "all",
  query: "",
  sort: "featured",
};

/** Editorial running order; anything else keeps catalogue order. */
export const EDITORIAL_ORDER = [
  "day-map-jacket",
  "night-map-jacket",
  "red-signature-hoodie",
  "blue-signature-hoodie",
  "yellow-signature-hoodie",
  "black-taikosunnies",
  "tortoise-shell-taikosunnies",
  "black-basic-tee",
  "white-basic-tee",
  "manga-tee",
  "tintsiva-tee",
  "taikonaut-pin",
  "coming-back-soon",
];

function matchesQuery(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const terms = q.split(/\s+/).filter(Boolean);
  const haystack = [
    product.name,
    product.category,
    product.colorLabelPt,
    product.colorLabelEn,
    product.taglinePt,
    product.taglineEn,
    ...product.sizes,
  ]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export function filterProducts(
  products: Product[],
  filters: CatalogFilters
): Product[] {
  const filtered = products.filter((product) => {
    if (filters.categories.length && !filters.categories.includes(product.category)) return false;
    if (filters.colors.length && !filters.colors.includes(product.colorKey)) return false;
    if (filters.sizes.length && !product.sizes.some((s) => filters.sizes.includes(s))) return false;
    const state = getStockState(product);
    if (filters.availability === "in_stock" && state === "out") return false;
    if (filters.availability === "sold_out" && state !== "out") return false;
    return matchesQuery(product, filters.query);
  });

  const order = (product: Product) => {
    const i = EDITORIAL_ORDER.indexOf(product.slug);
    return i === -1 ? EDITORIAL_ORDER.length : i;
  };

  switch (filters.sort) {
    case "price_asc":
      return [...filtered].sort((a, b) => a.priceEur - b.priceEur || order(a) - order(b));
    case "price_desc":
      return [...filtered].sort((a, b) => b.priceEur - a.priceEur || order(a) - order(b));
    case "newest":
      return [...filtered].sort((a, b) => order(b) - order(a));
    default:
      return [...filtered].sort((a, b) => order(a) - order(b));
  }
}

export function activeFilterCount(filters: CatalogFilters): number {
  return (
    filters.categories.length +
    filters.colors.length +
    filters.sizes.length +
    (filters.availability !== "all" ? 1 : 0) +
    (filters.query.trim() ? 1 : 0)
  );
}

export function optionCounts(products: Product[], filters: CatalogFilters) {
  const byCategory = new Map<string, number>();
  const byColor = new Map<string, number>();
  const bySize = new Map<string, number>();
  for (const product of products) {
    if (!matchesQuery(product, filters.query)) continue;
    byCategory.set(product.category, (byCategory.get(product.category) ?? 0) + 1);
    byColor.set(product.colorKey, (byColor.get(product.colorKey) ?? 0) + 1);
    for (const size of product.sizes)
      bySize.set(size, (bySize.get(size) ?? 0) + 1);
  }
  return { byCategory, byColor, bySize };
}

/** Compact, shareable URL state for /shop (read without blocking the page). */
export function filtersToQuery(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.categories.length) params.set("cat", filters.categories.join(","));
  if (filters.colors.length) params.set("color", filters.colors.join(","));
  if (filters.sizes.length) params.set("size", filters.sizes.join(","));
  if (filters.availability !== "all") params.set("stock", filters.availability);
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function filtersFromQuery(search: string): CatalogFilters {
  const params = new URLSearchParams(search);
  const list = (key: string) =>
    (params.get(key) ?? "").split(",").map((v) => v.trim()).filter(Boolean);
  const validCategories = Object.keys(CATEGORY_LABELS).filter((c) => c !== "all");
  const availability = params.get("stock");
  const sort = params.get("sort");
  return {
    categories: list("cat").filter((c): c is ProductCategory =>
      validCategories.includes(c)
    ),
    colors: list("color"),
    sizes: list("size"),
    availability:
      availability === "in_stock" || availability === "sold_out"
        ? availability
        : "all",
    query: params.get("q") ?? "",
    sort:
      sort === "price_asc" || sort === "price_desc" || sort === "newest"
        ? sort
        : "featured",
  };
}
