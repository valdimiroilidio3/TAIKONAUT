export default function ShopLoading() {
  return (
    <main id="main-content" className="page-shell py-20" aria-busy="true">
      <p className="cine-eyebrow text-[var(--tkn-muted)]">TAIKONAUT® / THE COLLECTION</p>
      <h1 className="display chapter-title chapter-title--tight mt-8">The<br />collection.</h1>
      <div className="cine-rule mt-12" />
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="cine-skeleton cine-skeleton-block aspect-[4/5] w-full" style={{ animationDelay: `${i * 90}ms` }} />
            <div className="mt-3 h-3 w-3/5 bg-[var(--tkn-surface-alt)]" />
          </div>
        ))}
      </div>
      <span className="sr-only" role="status">A carregar o catálogo / Loading the catalogue</span>
    </main>
  );
}
