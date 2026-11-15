"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, SlidersHorizontal, X } from "lucide-react";
import {
  PRODUCTS,
  CATEGORY_LABELS,
  filterProducts,
  activeFilterCount,
  optionCounts,
  filtersToQuery,
  filtersFromQuery,
  EMPTY_FILTERS,
  type CatalogFilters,
  type ProductCategory,
} from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "./ProductCard";
import { useDialogAccessibility } from "@/lib/use-dialog";

const CATEGORIES: ProductCategory[] = ["tees","hoodies","jackets","taikosunnies","accessories"];
const COLORS: Record<string,[string,string]> = {black:["Preto","Black"],white:["Branco","White"],cream:["Creme","Cream"],red:["Vermelho","Red"],blue:["Azul","Blue"],yellow:["Amarelo","Yellow"],tortoise:["Tartaruga","Tortoise"],ochre:["Outro","Other"]};
const SORTS: {value: CatalogFilters["sort"]; pt: string; en: string}[] = [
  {value:"featured",pt:"Em destaque",en:"Featured"},
  {value:"newest",pt:"Mais recente",en:"Newest"},
  {value:"price_asc",pt:"Preço ↑",en:"Price ↑"},
  {value:"price_desc",pt:"Preço ↓",en:"Price ↓"},
];
const PAGE = 8;

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Option({
  checked, onChange, label, count,
}: { checked: boolean; onChange: () => void; label: string; count: number }) {
  return (
    <label className={`flex cursor-pointer items-center justify-between gap-3 py-1.5 text-[12px] transition-opacity ${count ? "" : "opacity-40"}`}>
      <span className="flex items-center gap-2.5">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} disabled={count === 0} />
        <span aria-hidden="true" className={`flex h-3.5 w-3.5 items-center justify-center border transition-colors ${checked ? "border-[var(--tkn-fg)] bg-[var(--tkn-fg)]" : "border-[var(--tkn-muted)] peer-hover:border-[var(--tkn-fg)]"}`}>
          {checked && <span className="h-1.5 w-1.5 bg-[var(--tkn-bg)]" />}
        </span>
        <span>{label}</span>
      </span>
      <span className="mono !text-[9px] text-[var(--tkn-muted)]">{count}</span>
    </label>
  );
}

export function ShopAll({ compact = false, embedded = false }: { compact?: boolean; embedded?: boolean }) {
  const { language, setIsSearchOpen } = useStore();
  const t = (pt: string, en: string) => (language === "pt" ? pt : en);

  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [limit, setLimit] = useState(compact ? 4 : PAGE);
  const [view, setView] = useState<"grid" | "editorial">("grid");
  const resultsRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);

  const setFilter = useCallback(<K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setLimit(compact ? 4 : PAGE);
  }, [compact]);

  // Shareable catalogue state: read once, then mirror changes without navigation.
  useEffect(() => {
    if (embedded || hydrated.current) return;
    hydrated.current = true;
    const fromUrl = filtersFromQuery(window.location.search);
    const stored = window.localStorage.getItem("tkn_catalog_view");
    startTransition(() => {
      setFilters(fromUrl);
      if (stored === "editorial" || stored === "grid") setView(stored);
    });
  }, [embedded]);

  useEffect(() => {
    if (embedded || !hydrated.current) return;
    window.history.replaceState(null, "", `${window.location.pathname}${filtersToQuery(filters)}${window.location.hash}`);
  }, [filters, embedded]);

  const chooseView = (next: "grid" | "editorial") => {
    setView(next);
    try { window.localStorage.setItem("tkn_catalog_view", next); } catch {}
  };

  const results = useMemo(() => filterProducts(PRODUCTS, filters), [filters]);
  const counts = useMemo(() => optionCounts(PRODUCTS, filters), [filters]);
  const activeCount = activeFilterCount(filters);
  const visible = results.slice(0, limit);
  const colorKeys = useMemo(() => Array.from(new Set(PRODUCTS.map((p) => p.colorKey))), []);
  const sizeKeys = useMemo(() => Array.from(new Set(PRODUCTS.flatMap((p) => p.sizes))), []);

  const reset = () => setFilters((prev) => ({ ...EMPTY_FILTERS, sort: prev.sort }));
  const isSheet = panelOpen;

  useDialogAccessibility(isSheet && typeof window !== "undefined" && window.innerWidth < 1024, () => setPanelOpen(false));
  useEffect(() => {
    if (!isSheet) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPanelOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSheet]);

  const chips: { key: string; label: string; clear: () => void }[] = [
    ...filters.categories.map((c) => ({ key: `c-${c}`, label: t(CATEGORY_LABELS[c].pt, CATEGORY_LABELS[c].en), clear: () => setFilter("categories", filters.categories.filter((x) => x !== c)) })),
    ...filters.colors.map((c) => ({ key: `k-${c}`, label: t(...(COLORS[c] ?? [c, c]) as [string, string]), clear: () => setFilter("colors", filters.colors.filter((x) => x !== c)) })),
    ...filters.sizes.map((s) => ({ key: `s-${s}`, label: s === "Único" ? t("Único", "One size") : s, clear: () => setFilter("sizes", filters.sizes.filter((x) => x !== s)) })),
    ...(filters.availability !== "all" ? [{ key: "a", label: filters.availability === "in_stock" ? t("Em stock", "In stock") : "Sold out", clear: () => setFilter("availability", "all") }] : []),
    ...(filters.query.trim() ? [{ key: "q", label: `“${filters.query.trim()}”`, clear: () => setFilter("query", "") }] : []),
  ];

  return (
    <section id="shop" className="page-shell pb-24 sm:pb-32" aria-label={t("Catálogo de produtos", "Product catalogue")}>
      {!embedded && (
        <div className="cine-collection-intro py-14 sm:py-20" data-cine-reveal>
          <p className="kicker-row mono mb-8 justify-between"><span>TAIKONAUT® /</span><span className="text-[var(--tkn-muted)]">{PRODUCTS.length} {t("peças", "pieces")} · {CATEGORIES.length} {t("categorias", "categories")}</span></p>
          <h1 className="display chapter-title chapter-title--tight">The<br/>collection.</h1>
          <p className="cine-eyebrow mt-8 text-[var(--tkn-muted)]">
            {t("Peças reais. Stock real. Maputo, Moçambique.", "Real pieces. Real stock. Maputo, Mozambique.")}
          </p>
          <div className="cine-transition-rule mt-10" data-cine-transition aria-hidden="true" />
        </div>
      )}

      {/* Toolbar */}
      <div className="border-y border-[var(--tkn-border)] cine-toolbar">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            aria-expanded={panelOpen}
            aria-controls="catalog-filters"
            className="label flex items-center gap-2 hover:opacity-60 transition-opacity"
          >
            <SlidersHorizontal size={13} strokeWidth={1.5} />
            {t("Filtrar", "Filter")}
            <span aria-hidden="true">({activeCount})</span>
          </button>
          <span className="hidden h-3 w-px bg-[var(--tkn-border-subtle)] sm:block" />
          {/* Instant text filter inside the catalogue */}
          <label className="flex min-w-[150px] flex-1 items-center gap-2">
            <Search size={13} strokeWidth={1.5} className="text-[var(--tkn-muted)]" />
            <span className="sr-only">{t("Pesquisar no catálogo", "Search the catalogue")}</span>
            <input
              type="search"
              value={filters.query}
              onChange={(e) => setFilter("query", e.target.value)}
              placeholder={t("Pesquisar peças", "Search pieces")}
              className="w-full bg-transparent py-1 text-[12px] outline-none placeholder:text-[var(--tkn-muted)]"
            />
            {filters.query && (
              <button type="button" onClick={() => setFilter("query", "")} aria-label={t("Limpar pesquisa", "Clear search")} className="text-[var(--tkn-muted)] hover:text-[var(--tkn-fg)]">
                <X size={13} />
              </button>
            )}
          </label>
          <label className="flex items-center gap-2 label text-[var(--tkn-muted)]">
            <span className="hidden sm:inline">{t("Ordenar", "Sort")}</span>
            <select value={filters.sort} onChange={(e) => setFilter("sort", e.target.value as CatalogFilters["sort"])} className="cursor-pointer bg-transparent uppercase outline-none" aria-label={t("Ordenar produtos", "Sort products")}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{t(s.pt, s.en)}</option>)}
            </select>
          </label>
          <div className="flex items-center gap-1" role="group" aria-label={t("Modo de visualização", "View mode")}>
            {(["grid", "editorial"] as const).map((mode) => (
              <button key={mode} type="button" onClick={() => chooseView(mode)} aria-pressed={view === mode} className={`px-2 py-1 mono !text-[9px] border transition-colors ${view === mode ? "border-[var(--tkn-fg)] bg-[var(--tkn-fg)] text-[var(--tkn-bg)]" : "border-transparent text-[var(--tkn-muted)] hover:border-[var(--tkn-border-subtle)]"}`}>
                {mode === "grid" ? t("Grelha", "Grid") : t("Editorial", "Editorial")}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setIsSearchOpen(true)} className="label hidden underline underline-offset-4 hover:opacity-60 xl:block">
            {t("Pesquisa global", "Global search")} ⌘K
          </button>
        </div>
      </div>

      {/* Active filters */}
      <div className="flex min-h-[44px] flex-wrap items-center gap-x-5 gap-y-2 border-b border-[var(--tkn-border-subtle)] py-3">
        {chips.length === 0 ? (
          <span className="mono !text-[9px] text-[var(--tkn-muted)]">{t("Sem filtros ativos", "No active filters")}</span>
        ) : (
          <>
            {chips.map((chip) => (
              <button key={chip.key} type="button" onClick={chip.clear} className="cine-chip label group flex items-center gap-1.5">
                {chip.label}
                <X size={11} aria-hidden="true" />
                <span className="sr-only">{t("Remover filtro", "Remove filter")}</span>
              </button>
            ))}
            <button type="button" onClick={reset} className="label underline underline-offset-4 text-[var(--tkn-muted)] hover:text-[var(--tkn-fg)]">
              {t("Limpar tudo", "Clear all")}
            </button>
          </>
        )}
        <span className="ml-auto mono !text-[9px]" aria-live="polite">
          {results.length} {t("resultados", "results")}
        </span>
      </div>

      <div className="grid gap-x-8 gap-y-10 pt-8 lg:grid-cols-[220px_1fr]">
        {/* Filter panel: inline on desktop, sheet on mobile */}
        {panelOpen && (
          <button type="button" aria-label={t("Fechar filtros", "Close filters")} onClick={() => setPanelOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" tabIndex={-1} />
        )}
        <aside
          id="catalog-filters"
          role={panelOpen ? "dialog" : undefined}
          aria-modal={panelOpen ? true : undefined}
          aria-label={t("Filtros do catálogo", "Catalogue filters")}
          className={`${panelOpen ? "fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-y-auto rounded-none bg-[var(--tkn-bg)] p-5 pb-8 animate-[tkn-sheet_.45s_var(--ease-editorial)_both]" : "hidden"} lg:sticky lg:top-[100px] lg:block lg:max-h-[calc(100svh-130px)] lg:self-start lg:overflow-y-auto lg:bg-transparent lg:p-0`}
        >
          <div className="mb-4 flex items-center justify-between lg:mb-6">
            <p className="label">{t("Filtros", "Filters")} {activeCount ? `(${activeCount})` : ""}</p>
            <div className="flex items-center gap-4">
              {activeCount > 0 && <button type="button" onClick={reset} className="label underline underline-offset-4">{t("Limpar", "Clear")}</button>}
              <button type="button" onClick={() => setPanelOpen(false)} className="label lg:hidden">{t("Fechar", "Close")} ✕</button>
            </div>
          </div>

          <fieldset className="border-t border-[var(--tkn-border-subtle)] py-4">
            <legend className="label text-[var(--tkn-muted)]">{t("Categoria", "Category")}</legend>
            <div className="mt-2">
              {CATEGORIES.map((category) => (
                <Option key={category} checked={filters.categories.includes(category)} onChange={() => setFilter("categories", toggle(filters.categories, category))} label={category === "jackets" ? "Map Jackets" : t(CATEGORY_LABELS[category].pt, CATEGORY_LABELS[category].en)} count={counts.byCategory.get(category) ?? 0} />
              ))}
            </div>
          </fieldset>

          <fieldset className="border-t border-[var(--tkn-border-subtle)] py-4">
            <legend className="label text-[var(--tkn-muted)]">{t("Disponibilidade", "Availability")}</legend>
            <div className="mt-2">
              {([["all", t("Tudo", "All")], ["in_stock", t("Em stock", "In stock")], ["sold_out", "Sold out"]] as const).map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[12px]">
                  <input type="radio" name="catalog-availability" value={value} checked={filters.availability === value} onChange={() => setFilter("availability", value)} className="h-3.5 w-3.5 accent-[var(--tkn-fg)]" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="border-t border-[var(--tkn-border-subtle)] py-4">
            <legend className="label text-[var(--tkn-muted)]">{t("Cor", "Colour")}</legend>
            <div className="mt-2">
              {colorKeys.map((color) => (
                <Option key={color} checked={filters.colors.includes(color)} onChange={() => setFilter("colors", toggle(filters.colors, color))} label={t(...(COLORS[color] ?? [color, color]) as [string, string])} count={counts.byColor.get(color) ?? 0} />
              ))}
            </div>
          </fieldset>

          <fieldset className="border-t border-[var(--tkn-border-subtle)] py-4">
            <legend className="label text-[var(--tkn-muted)]">{t("Tamanho", "Size")}</legend>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {sizeKeys.map((size) => {
                const active = filters.sizes.includes(size);
                const count = counts.bySize.get(size) ?? 0;
                return (
                  <button key={size} type="button" onClick={() => setFilter("sizes", toggle(filters.sizes, size))} aria-pressed={active} disabled={count === 0} className={`min-w-[42px] border px-2.5 py-1.5 text-[11px] uppercase transition-colors disabled:opacity-30 ${active ? "border-[var(--tkn-fg)] bg-[var(--tkn-fg)] text-[var(--tkn-bg)]" : "border-[var(--tkn-border-subtle)] hover:border-[var(--tkn-fg)]"}`}>
                    {size === "Único" ? t("Único", "One") : size}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button type="button" onClick={() => setPanelOpen(false)} className="mt-4 w-full bg-[var(--tkn-fg)] py-3 text-[var(--tkn-bg)] label lg:hidden">
            {t(`Ver ${results.length} peças`, `View ${results.length} pieces`)}
          </button>
        </aside>

        {/* Results */}
        <div ref={resultsRef}>
          {results.length === 0 ? (
            <div className="cine-empty px-6">
              <p className="display text-[38px] leading-none">{t("Sem resultados.", "No results.")}</p>
              <p className="mx-auto mt-4 max-w-[36ch] text-[13px] text-[var(--tkn-muted)]">
                {t("Nenhuma peça corresponde a esta combinação de filtros. Podes limpar os filtros ou ver o catálogo completo.", "No piece matches this combination. Clear the filters or view the full catalogue.")}
              </p>
              <button type="button" onClick={reset} className="mt-6 inline-flex items-center gap-2 bg-[var(--tkn-fg)] px-5 py-3 text-[var(--tkn-bg)] label">
                {t("Limpar filtros", "Clear filters")} <X size={12} />
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
              {visible.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} sizes="(min-width:1280px) 23vw, (min-width:768px) 30vw, 50vw" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-14 sm:gap-x-6 xl:grid-cols-3">
              {visible.map((product, i) => (
                <div key={product.id} className={i % 4 === 0 ? "col-span-2 xl:col-span-1" : ""}>
                  <ProductCard product={product} index={i} variant={i % 4 === 0 ? "featured" : "default"} sizes={i % 4 === 0 ? "(min-width:1280px) 42vw, 100vw" : "(min-width:1280px) 24vw, 50vw"} />
                </div>
              ))}
            </div>
          )}

          {results.length > visible.length && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <button type="button" onClick={() => setLimit((prev) => prev + PAGE)} className="arrow-link label">
                {t(`Ver mais ${Math.min(PAGE, results.length - visible.length)}`, `Load ${Math.min(PAGE, results.length - visible.length)} more`)}
                <ArrowUpRight size={15} aria-hidden="true" />
              </button>
              <span className="mono !text-[9px] text-[var(--tkn-muted)]">{visible.length} / {results.length}</span>
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--tkn-border-subtle)] pt-5">
            {compact ? (
              <Link href="/shop" className="arrow-link label">
                {t("Ver toda a coleção", "View the full collection")} <ArrowUpRight size={15} />
              </Link>
            ) : (
              <Link href="/#arrival" className="label link-u">{t("Voltar à história", "Back to the story")}</Link>
            )}
            <Link href="/#homecoming" className="mono !text-[9px] text-[var(--tkn-muted)] hover:text-[var(--tkn-fg)]">
              {t("Levantamento no Pop-Up · 12 Dez", "Pop-Up collection · Dec 12")} ↗
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CollectionChapter() {
  const { language } = useStore();
  return (
    <section id="collection" data-chapter="collection" className="border-t border-[var(--tkn-border-subtle)]">
      <div className="cine-transition-rule" data-cine-transition aria-hidden="true" />
      <div className="page-shell pt-16 sm:pt-24 cine-collection-intro">
        <div className="kicker-row justify-between gap-6 mono mb-10" data-story-reveal>
          <p className="chapter-label"><span>03 /</span>The collection</p>
          <span className="text-[var(--tkn-muted)]">{PRODUCTS.length} {language === "pt" ? "peças. Uma identidade." : "pieces. One identity."}</span>
        </div>
        <div className="mb-12 flex items-end justify-between gap-8" data-story-reveal>
          <h2 id="collection-heading" className="display chapter-title chapter-title--tight">Wear your<br/>story.</h2>
          <Link href="/shop" className="arrow-link label mb-2 hidden shrink-0 md:inline-flex">
            {language === "pt" ? "Entrar na loja" : "Enter the shop"} <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <ShopAll compact embedded />
    </section>
  );
}

export function ShopCatalogSection() {
  return <CollectionChapter />;
}
