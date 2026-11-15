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
 * Real Taikonaut photography: official shop product images, sold-out archive
 * product pages and public posts from the brand's own Instagram. No generated
 * imagery. Sources and rights notes live in src/data/asset-inventory.json.
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
  {
    id: "lb-8",
    src: "/images/archive/mozdrian-sweater/front.webp",
    captionPt: "Mozdrian Sweater — frente, arquivo oficial",
    captionEn: "Mozdrian Sweater — front, official archive",
    productName: "Mozdrian Sweater — Arquivo",
  },
  {
    id: "lb-9",
    src: "/images/archive/mozdrian-sweater/back.webp",
    captionPt: "Mozdrian Sweater — costas, arquivo oficial",
    captionEn: "Mozdrian Sweater — back, official archive",
    productName: "Mozdrian Sweater — Arquivo",
  },
  {
    id: "lb-10",
    src: "/images/archive/macanica-tee/front.webp",
    captionPt: "Maçanica Tee — arquivo oficial",
    captionEn: "Maçanica Tee — official archive",
    productName: "Maçanica Tee — Arquivo",
  },
  {
    id: "lb-11",
    src: "/images/archive/macanica-tee/on-model.webp",
    captionPt: "Maçanica Tee, no cais",
    captionEn: "Maçanica Tee, on the jetty",
    productName: "Maçanica Tee — Arquivo",
  },
  {
    id: "lb-12",
    src: "/images/archive/macanica-tee/detail.webp",
    captionPt: "Maçanica Tee — detalhe da estampa",
    captionEn: "Maçanica Tee — print detail",
    productName: "Maçanica Tee — Arquivo",
  },
  {
    id: "lb-13",
    src: "/images/archive/mafura-tee/front.webp",
    captionPt: "Mafura Tee — arquivo oficial",
    captionEn: "Mafura Tee — official archive",
    productName: "Mafura Tee — Arquivo",
  },
  {
    id: "lb-14",
    src: "/images/archive/mafura-tee/on-model.webp",
    captionPt: "Mafura Tee, no cais",
    captionEn: "Mafura Tee, on the jetty",
    productName: "Mafura Tee — Arquivo",
  },
  {
    id: "lb-15",
    src: "/images/archive/mafura-tee/detail.webp",
    captionPt: "Mafura Tee — detalhe da estampa",
    captionEn: "Mafura Tee — print detail",
    productName: "Mafura Tee — Arquivo",
  },
  {
    id: "lb-16",
    src: "/images/instagram/Dc5mEMvDmy--1.webp",
    captionPt: "Signature Hoodies, azul amarelo e vermelho",
    captionEn: "Signature Hoodies, blue yellow and red",
    productName: "Signature Hoodies — Instagram",
  },
  {
    id: "lb-17",
    src: "/images/instagram/DaNgABejNlr-2.webp",
    captionPt: "Night Map Jacket, depois do sol",
    captionEn: "Night Map Jacket, after dark",
    productSlug: "night-map-jacket",
    productName: "Night Map Jacket",
  },
  {
    id: "lb-18",
    src: "/images/instagram/De6rs0JjqEN-1.webp",
    captionPt: "Black Basic Tee, à mesa de xadrez",
    captionEn: "Black Basic Tee, at the chess table",
    productSlug: "black-basic-tee",
    productName: "Black Basic Tee",
  },
  {
    id: "lb-19",
    src: "/images/instagram/De6rs0JjqEN-2.webp",
    captionPt: "Basic Tees, preto e branco",
    captionEn: "Basic Tees, black and white",
    productSlug: "white-basic-tee",
    productName: "White Basic Tee",
  },
  {
    id: "lb-20",
    src: "/images/instagram/DaqWuQfugPv-1.webp",
    captionPt: "Day Map Jacket, na estufa",
    captionEn: "Day Map Jacket, at the greenhouse",
    productSlug: "day-map-jacket",
    productName: "Day Map Jacket",
  },
  {
    id: "lb-21",
    src: "/images/instagram/DfMsq45DpuN-2.webp",
    captionPt: "Taikonaut, nas escadas",
    captionEn: "Taikonaut, on the steps",
    productName: "Taikonaut — Instagram",
  },
  {
    id: "lb-22",
    src: "/images/instagram/DZhudt8DJTp-1.webp",
    captionPt: "Tintsiva Tee, na cidade",
    captionEn: "Tintsiva Tee, in the city",
    productSlug: "tintsiva-tee",
    productName: "Tintsiva Tee",
  },
  {
    id: "lb-23",
    src: "/images/instagram/DYziel8DvjP-1.webp",
    captionPt: "Fruit Tees, dois modelos",
    captionEn: "Fruit Tees, two models",
    productName: "Fruit Tees — Arquivo",
  },
  {
    id: "lb-24",
    src: "/images/instagram/Dfj5rVXuQlx-1.webp",
    captionPt: "Maputo — The Homecoming",
    captionEn: "Maputo — The Homecoming",
    productName: "The Homecoming Pop-Up",
  },
];

export interface InstagramPost {
  id: string;
  image: string;
  postUrl: string;
  altPt: string;
  altEn: string;
}

/** Public posts from the brand's own @taikonautmaputo Instagram. */
export const INSTAGRAM_FEED: InstagramPost[] = [
  { id: "ig-1", image: "/images/instagram/Dfj5rVXuQlx-1.webp", postUrl: "https://www.instagram.com/p/Dfj5rVXuQlx/", altPt: "Barco na baía de Maputo, anúncio do Homecoming", altEn: "Boat in Maputo bay, Homecoming announcement" },
  { id: "ig-2", image: "/images/instagram/DfMsq45DpuN-1.webp", postUrl: "https://www.instagram.com/p/DfMsq45DpuN/", altPt: "Logótipo Taikonaut numa t-shirt branca", altEn: "Taikonaut logo on a white tee" },
  { id: "ig-3", image: "/images/instagram/DfMsq45DpuN-2.webp", postUrl: "https://www.instagram.com/p/DfMsq45DpuN/", altPt: "Modelo com t-shirt branca nas escadas", altEn: "Model in a white tee on the steps" },
  { id: "ig-4", image: "/images/instagram/De6rs0JjqEN-1.webp", postUrl: "https://www.instagram.com/p/De6rs0JjqEN/", altPt: "Black Basic Tee numa partida de xadrez", altEn: "Black Basic Tee at a chess game" },
  { id: "ig-5", image: "/images/instagram/De6rs0JjqEN-2.webp", postUrl: "https://www.instagram.com/p/De6rs0JjqEN/", altPt: "Basic Tees preta e branca na floresta", altEn: "Black and white Basic Tees in the woods" },
  { id: "ig-6", image: "/images/instagram/DezSkY7uHGP-1.webp", postUrl: "https://www.instagram.com/p/DezSkY7uHGP/", altPt: "Dois modelos com Basic Tees num banco", altEn: "Two models in Basic Tees on a bench" },
  { id: "ig-7", image: "/images/instagram/DdLuHO1uNKj-1.webp", postUrl: "https://www.instagram.com/p/DdLuHO1uNKj/", altPt: "Signature Hoodies junto à ponte", altEn: "Signature Hoodies by the bridge" },
  { id: "ig-8", image: "/images/instagram/Dc5mEMvDmy--1.webp", postUrl: "https://www.instagram.com/p/Dc5mEMvDmy-/", altPt: "Signature Hoodies azul, amarelo e vermelho", altEn: "Signature Hoodies in blue, yellow and red" },
  { id: "ig-9", image: "/images/instagram/Dc5mEMvDmy--2.webp", postUrl: "https://www.instagram.com/p/Dc5mEMvDmy-/", altPt: "Blue Signature Hoodie em detalhe", altEn: "Blue Signature Hoodie close-up" },
  { id: "ig-10", image: "/images/instagram/DctaaR2tpez-1.webp", postUrl: "https://www.instagram.com/p/DctaaR2tpez/", altPt: "Red Signature Hoodie em detalhe", altEn: "Red Signature Hoodie close-up" },
  { id: "ig-11", image: "/images/instagram/DaqWuQfugPv-1.webp", postUrl: "https://www.instagram.com/p/DaqWuQfugPv/", altPt: "Day Map Jacket na estufa", altEn: "Day Map Jacket at the greenhouse" },
  { id: "ig-12", image: "/images/instagram/DaNgABejNlr-1.webp", postUrl: "https://www.instagram.com/p/DaNgABejNlr/", altPt: "Modelo com casaco cartográfico à noite", altEn: "Model in a cartographic jacket at night" },
  { id: "ig-13", image: "/images/instagram/DaNgABejNlr-2.webp", postUrl: "https://www.instagram.com/p/DaNgABejNlr/", altPt: "Night Map Jacket com o mapa de Moçambique", altEn: "Night Map Jacket with the Mozambique map" },
  { id: "ig-14", image: "/images/instagram/DZhudt8DJTp-1.webp", postUrl: "https://www.instagram.com/p/DZhudt8DJTp/", altPt: "Tintsiva Tee na cidade", altEn: "Tintsiva Tee in the city" },
  { id: "ig-15", image: "/images/instagram/DYziel8DvjP-1.webp", postUrl: "https://www.instagram.com/p/DYziel8DvjP/", altPt: "Fruit Tees, dois modelos", altEn: "Fruit Tees, two models" },
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
