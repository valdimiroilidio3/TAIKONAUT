import React from "react";
import { AssetStatusPanel } from "@/components/AssetStatusPanel";
import { CommercialAuditPanel } from "@/components/CommercialAuditPanel";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, FileJson, Database, CheckCircle2 } from "lucide-react";
import { db } from "@/db";
import { orders, restockAlerts, communitySubscribers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PRODUCTS, SITE_CONFIG } from "@/lib/catalog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalDrawers } from "@/components/GlobalDrawers";

export const dynamic = "force-dynamic";

const IMAGE_CHECKLIST = [
  {
    slot: "Hero Principal & Campanha (3 slides)",
    path: "public/images/campaigns/arrival/poster-desktop.webp",
    recommendedSize: "2400 × 1500 px (16:10 Landscape)",
    format: "WebP / AVIF (< 280 KB)",
    notes: "Fotos editoriais largas com espaço respirável para headline à esquerda.",
  },
  {
    slot: "Fotos de Produto — Frente, Costas, Detalhe, Modelo (×13 peças)",
    path: "public/images/products/[slug]/front.webp + vistas reais disponíveis",
    recommendedSize: "1200 × 1500 px (4:5 Vertical)",
    format: "WebP / AVIF (< 180 KB)",
    notes: "Mapeadas em src/data/products.json no bloco 'images' (front, back, detail, model).",
  },
  {
    slot: "Lookbook 'Taikonauts in the wild' (8 fotos)",
    path: "public/images/community/fruit-series/ + campaigns/arrival/",
    recommendedSize: "1200 × 1500 px (Vertical) e 1920 × 1200 px (Destaque)",
    format: "WebP (< 200 KB)",
    notes: "Fotos reais nas ruas de Maputo exportadas do @taikonautmaputo.",
  },
  {
    slot: "Secção Sobre a Marca / Criadores",
    path: "public/images/details/map-jackets/day-map-close-up.webp",
    recommendedSize: "1200 × 1500 px (4:5 Vertical)",
    format: "WebP (< 180 KB)",
    notes: "Retrato de Teosson Chau / equipa criativa no estúdio em Maputo.",
  },
  {
    slot: "Open Graph / Partilha WhatsApp & Instagram",
    path: "public/images/campaigns/arrival/poster-desktop.webp",
    recommendedSize: "1200 × 630 px",
    format: "JPG / PNG (< 250 KB)",
    notes: "Miniatura automática ao partilhar links no WhatsApp ou Stories.",
  },
];

export default async function GuiaGestaoPage() {
  let recentOrders: (typeof orders.$inferSelect)[] = [];
  let recentAlerts: (typeof restockAlerts.$inferSelect)[] = [];
  let recentSubs: (typeof communitySubscribers.$inferSelect)[] = [];

  try {
    recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(8);
    recentAlerts = await db
      .select()
      .from(restockAlerts)
      .orderBy(desc(restockAlerts.createdAt))
      .limit(8);
    recentSubs = await db
      .select()
      .from(communitySubscribers)
      .orderBy(desc(communitySubscribers.createdAt))
      .limit(8);
  } catch {
    // Graceful fallback before schema push or in offline preview
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        <div className="space-y-3 border-b-2 border-[var(--tkn-border)] pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono-tech uppercase font-bold hover:text-[#D92525]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar à Loja Taikonaut</span>
          </Link>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl uppercase">
            Painel & Guia de Gestão Taikonaut
          </h1>
          <p className="text-sm sm:text-base text-[var(--tkn-muted)] max-w-3xl">
            Resumo ao vivo de encomendas/reservas do Pop-Up, lista de imagens
            oficiais organizadas e exports em falta do{" "}
            <strong>@taikonautmaputo</strong>, e instruções simples para gerir a
            loja sem programar.
          </p>
        </div>

        <AssetStatusPanel />
        <CommercialAuditPanel />

        {/* 1. Live Database Overview */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#007A4D]" />
            <h2 className="font-display font-extrabold text-2xl uppercase">
              1. Atividade em Tempo Real (PostgreSQL)
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-5 bg-[var(--tkn-surface)] border-2 border-[var(--tkn-border)]">
              <span className="text-xs font-mono-tech uppercase text-[var(--tkn-muted)]">
                Pedidos & Reservas Pop-Up
              </span>
              <div className="font-mono-tech font-extrabold text-3xl mt-1 text-[#D92525]">
                {recentOrders.length}
              </div>
              <p className="text-xs text-[var(--tkn-muted)] mt-1">
                Inclui reservas &quot;Levanta no Spazio (12 Dez)&quot;
              </p>
            </div>

            <div className="p-5 bg-[var(--tkn-surface)] border-2 border-[var(--tkn-border)]">
              <span className="text-xs font-mono-tech uppercase text-[var(--tkn-muted)]">
                Alertas &quot;Avisa-me quando voltar&quot;
              </span>
              <div className="font-mono-tech font-extrabold text-3xl mt-1 text-[#1746D4]">
                {recentAlerts.length}
              </div>
              <p className="text-xs text-[var(--tkn-muted)] mt-1">
                Manga Tee, Tintsiva Tee & Coming back soon
              </p>
            </div>

            <div className="p-5 bg-[var(--tkn-surface)] border-2 border-[var(--tkn-border)]">
              <span className="text-xs font-mono-tech uppercase text-[var(--tkn-muted)]">
                Comunidade VIP (Email + WhatsApp)
              </span>
              <div className="font-mono-tech font-extrabold text-3xl mt-1 text-[#007A4D]">
                {recentSubs.length}
              </div>
              <p className="text-xs text-[var(--tkn-muted)] mt-1">
                Inscritos para acesso antecipado aos drops
              </p>
            </div>
          </div>

          {recentOrders.length > 0 && (
            <div className="bg-[var(--tkn-surface)] border-2 border-[var(--tkn-border)] p-4 overflow-x-auto">
              <h3 className="font-mono-tech font-bold text-xs uppercase mb-3">
                Últimas Encomendas / Reservas Pop-Up Registadas
              </h3>
              <table className="w-full text-left text-xs font-mono-tech">
                <thead>
                  <tr className="border-b border-[var(--tkn-border)]">
                    <th className="py-2">Código</th>
                    <th className="py-2">Cliente</th>
                    <th className="py-2">WhatsApp</th>
                    <th className="py-2">Entrega</th>
                    <th className="py-2">Pagamento</th>
                    <th className="py-2">Total (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--tkn-border-subtle)]">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="py-2 font-bold text-[#D92525]">
                        {ord.orderCode}
                      </td>
                      <td className="py-2">{ord.customerName}</td>
                      <td className="py-2">{ord.customerWhatsapp}</td>
                      <td className="py-2">{ord.deliveryMethod}</td>
                      <td className="py-2 uppercase">{ord.paymentMethod}</td>
                      <td className="py-2 font-bold">€ {ord.totalEur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 2. Deliverable #4: Simple Instructions for Non-Programmers */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-[#D92525]" />
            <h2 className="font-display font-extrabold text-2xl uppercase">
              2. Como Atualizar Produtos, Preços, Stock e o Pop-Up (Sem Programar)
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-[var(--tkn-surface)] border-2 border-[var(--tkn-border)] space-y-3">
              <h3 className="font-display font-bold text-lg uppercase text-[#D92525]">
                A) Editar Produtos, Preços ou Esgotados
              </h3>
              <p className="text-sm text-[var(--tkn-muted)]">
                Abre o ficheiro{" "}
                <code className="px-1.5 py-0.5 bg-[var(--tkn-surface-alt)] font-mono-tech font-bold">
                  src/data/products.json
                </code>
                :
              </p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#007A4D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Mudar Preço:</strong> Altera{" "}
                    <code>&quot;priceEur&quot;: 60.0</code>. O valor em{" "}
                    <strong>MZN</strong> atualiza-se sozinho!
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#007A4D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Marcar como Esgotado (Sold out):</strong> Muda{" "}
                    <code>&quot;soldOut&quot;: true</code> e{" "}
                    <code>&quot;stock&quot;: 0</code>. O site ativa
                    automaticamente a imagem em tom reduzido e o botão{" "}
                    <em>&quot;Avisa-me quando voltar&quot;</em>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#007A4D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Aviso de Stock Baixo:</strong> Qualquer peça
                    disponível com <code>&quot;stock&quot;</code> entre 1 e 5
                    exibe automaticamente a etiqueta vermelha de últimas unidades.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-[var(--tkn-surface)] border-2 border-[var(--tkn-border)] space-y-3">
              <h3 className="font-display font-bold text-lg uppercase text-[#1746D4]">
                B) Editar o Evento Pop-Up, Taxa MZN ou WhatsApp
              </h3>
              <p className="text-sm text-[var(--tkn-muted)]">
                Abre o ficheiro{" "}
                <code className="px-1.5 py-0.5 bg-[var(--tkn-surface-alt)] font-mono-tech font-bold">
                  src/data/event-config.json
                </code>
                :
              </p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#007A4D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Taxa EUR → MZN:</strong> Ajusta{" "}
                    <code>
                      &quot;eurToMznRate&quot;: {SITE_CONFIG.store.eurToMznRate}
                    </code>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#007A4D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Envio Grátis:</strong> Ajusta{" "}
                    <code>
                      &quot;freeShippingThresholdEur&quot;:{" "}
                      {SITE_CONFIG.store.freeShippingThresholdEur}
                    </code>{" "}
                    para mudar a barra de progresso do carrinho.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#007A4D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Pop-Up:</strong> Muda <code>venueName</code>,{" "}
                    <code>address</code>, <code>dateDisplayPt</code> ou{" "}
                    <code>timeRange</code> e os textos do evento. A data do calendário está em api/popup/ics; o ficheiro{" "}
                    <code>.ics</code> atualizam em todo o site.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Deliverable #3: Required Images & Recommended Sizes */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#C86D3B]" />
            <h2 className="font-display font-extrabold text-2xl uppercase">
              3. Lista de Imagens Necessárias & Tamanhos Recomendados
            </h2>
          </div>

          <div className="bg-[var(--tkn-surface)] border-2 border-[var(--tkn-border)] overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-[var(--tkn-border)] bg-[var(--tkn-surface-alt)] font-mono-tech text-xs uppercase">
                  <th className="p-3">Secção / Uso</th>
                  <th className="p-3">Caminho Sugerido</th>
                  <th className="p-3">Dimensões</th>
                  <th className="p-3">Formato / Peso</th>
                  <th className="p-3">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--tkn-border-subtle)]">
                {IMAGE_CHECKLIST.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-bold">{row.slot}</td>
                    <td className="p-3 font-mono-tech text-xs">{row.path}</td>
                    <td className="p-3 font-mono-tech text-xs font-bold text-[#007A4D]">
                      {row.recommendedSize}
                    </td>
                    <td className="p-3 font-mono-tech text-xs">{row.format}</td>
                    <td className="p-3 text-xs text-[var(--tkn-muted)]">
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* All 13 Products Inventory Snapshot */}
          <div className="bg-[var(--tkn-surface)] border-2 border-[var(--tkn-border)] p-4 overflow-x-auto">
            <h3 className="font-mono-tech font-bold text-xs uppercase mb-3">
              Catálogo Atual Configurado ({PRODUCTS.length} Peças em{" "}
              <code>src/data/products.json</code>)
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono-tech">
              {PRODUCTS.map((p) => (
                <div
                  key={p.slug}
                  className="flex items-center justify-between p-2 border border-[var(--tkn-border-subtle)]"
                >
                  <span className="truncate font-bold">{p.name}</span>
                  <span className="shrink-0">
                    € {p.priceEur.toFixed(2)}{" "}
                    {p.soldOut ? (
                      <strong className="text-[#D92525]">[ESGOTADO]</strong>
                    ) : (
                      <span className="text-[#007A4D]">[{p.stock} un]</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <GlobalDrawers />
    </div>
  );
}
