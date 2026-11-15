"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The message stays in the browser console only; no invented error reporting service.
    console.error("Taikonaut storefront error:", error);
  }, [error]);

  return (
    <main id="main-content" className="page-shell flex min-h-[70svh] flex-col justify-center py-24">
      <p className="cine-eyebrow text-[var(--tkn-muted)]">TAIKONAUT® / ESTADO</p>
      <h1 className="display chapter-title chapter-title--tight mt-8">
        Something<br />went wrong.
      </h1>
      <p className="mt-8 max-w-[44ch] text-[14px] leading-relaxed text-[var(--tkn-muted)]">
        Não foi possível apresentar esta página. Podes tentar novamente ou voltar à loja.
        <span className="block">This page could not be displayed. Try again or return to the shop.</span>
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="cine-btn cine-btn--solid">
          Tentar novamente / Try again <span aria-hidden="true">↗</span>
        </button>
        <Link href="/shop" className="cine-btn">
          Ver a coleção / The collection <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </main>
  );
}
