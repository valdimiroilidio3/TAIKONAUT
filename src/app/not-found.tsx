import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description: "A página pedida não existe na loja Taikonaut.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main id="main-content" className="page-shell flex min-h-[70svh] flex-col justify-center py-24">
      <p className="cine-eyebrow text-[var(--tkn-muted)]">TAIKONAUT® / 404</p>
      <h1 className="display chapter-title chapter-title--tight mt-8">
        Off the<br />map.
      </h1>
      <p className="mt-8 max-w-[44ch] text-[14px] leading-relaxed text-[var(--tkn-muted)]">
        Esta peça ou página não existe. O catálogo continua disponível.
        <span className="block">This piece or page does not exist. The catalogue is still available.</span>
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/shop" className="cine-btn cine-btn--solid">
          Ver a coleção / The collection <span aria-hidden="true">↗</span>
        </Link>
        <Link href="/" className="cine-btn">
          Voltar ao início / Back to start <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </main>
  );
}
