import { PRODUCTS } from "@/lib/catalog";
import audit from "@/data/commercial-audit.json";

const RISK_TONE: Record<string, string> = { alta: "border-[#8c2f22] text-[#8c2f22]", média: "border-[var(--tkn-border)]" };

/** Internal release checklist. Nothing is auto-corrected: these facts need the brand. */
export function CommercialAuditPanel(){
  const highRisk = audit.items.filter(i => i.risk === "alta").length;
  const productFlags = PRODUCTS.filter(p => p.imageMissing || p.soldOut !== (p.stock === 0)).length;
  return <section className="space-y-5 py-8 border-t border-[var(--tkn-border-subtle)]" aria-labelledby="commercial-heading">
    <div>
      <p className="label text-[var(--tkn-muted)] mb-2">STEP 02 / Auditoria comercial</p>
      <h2 id="commercial-heading" className="display text-4xl">Dados por confirmar.</h2>
      <p className="mt-3 max-w-3xl text-[13px] text-[var(--tkn-muted)]">{audit.principle} Nenhum preço, stock ou tamanho foi alterado nesta fase.</p>
    </div>
    <dl className="grid sm:grid-cols-3 gap-5 text-sm">
      <div><dt className="text-[var(--tkn-muted)]">Pontos por confirmar</dt><dd className="display text-4xl">{audit.items.length}</dd></div>
      <div><dt className="text-[var(--tkn-muted)]">Risco alto</dt><dd className="display text-4xl">{highRisk}</dd></div>
      <div><dt className="text-[var(--tkn-muted)]">Produtos com dados estruturais atípicos</dt><dd className="display text-4xl">{productFlags}</dd></div>
    </dl>
    <ul className="divide-y divide-[var(--tkn-border-subtle)] border-y border-[var(--tkn-border-subtle)]">
      {audit.items.map(item => <li key={item.id} className="py-4 grid sm:grid-cols-[1fr_2fr] gap-2 sm:gap-6">
        <div><span className={`label border px-2 py-0.5 ${RISK_TONE[item.risk] ?? ""}`}>{item.risk}</span><p className="mt-2 font-medium">{item.label}</p><p className="mono !text-[9px] text-[var(--tkn-muted)] mt-1">{item.area}</p></div>
        <p className="text-[13px] text-[var(--tkn-muted)]">{item.detail}</p>
      </li>)}
    </ul>
    <p className="text-[12px] text-[var(--tkn-muted)]">Checklist completa e como confirmar: <code>docs/COMMERCIAL_AUDIT.md</code>.</p>
  </section>;
}
