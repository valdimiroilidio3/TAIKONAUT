export default function ProductLoading() {
  return (
    <main id="main-content" className="mx-auto max-w-[1600px] px-5 pb-28 sm:px-8 lg:px-10" aria-busy="true">
      <div className="cine-rule mt-6" />
      <p className="mono !text-[9px] mt-5 text-[var(--tkn-muted)]">TAIKONAUT® / PEÇA</p>
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12" aria-hidden="true">
        <div className="lg:col-span-7">
          <div className="cine-skeleton cine-skeleton-block aspect-[4/5] w-full" />
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <div className="h-14 w-4/5 bg-[var(--tkn-surface-alt)]" />
          <div className="mt-6 h-4 w-24 bg-[var(--tkn-surface-alt)]" />
          <div className="mt-10 h-11 w-full bg-[var(--tkn-surface-alt)]" />
          <div className="mt-3 h-11 w-full bg-[var(--tkn-surface-alt)]" />
          <div className="cine-rule mt-12" />
        </div>
      </div>
      <span className="sr-only" role="status">A carregar a peça / Loading the piece</span>
    </main>
  );
}
