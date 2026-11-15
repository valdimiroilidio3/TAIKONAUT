import { existsSync } from "node:fs";
import path from "node:path";
import inventory from "@/data/asset-inventory.json";

/** Read-only deployment handover; never invent missing images or film. */
export function AssetStatusPanel(){
  const missing=inventory.missing.filter(asset=>!existsSync(path.join(process.cwd(),"public",asset.path)));
  return <section className="space-y-5 border-y border-[var(--tkn-border-subtle)] py-8" aria-labelledby="assets-heading">
    <div><p className="label text-[var(--tkn-muted)] mb-2">STEP 02 / Direção de assets</p><h2 id="assets-heading" className="display text-4xl">Imagem real. Origem documentada.</h2></div>
    <div className="grid sm:grid-cols-3 gap-5 text-sm">
      <div><p className="display text-4xl">{inventory.images.length}</p><p className="text-[var(--tkn-muted)]">Imagens verificadas, incluindo 3 recortes fotográficos.</p></div>
      <div><p className="display text-4xl">5</p><p className="text-[var(--tkn-muted)]">Capítulos. Scroll natural, movimento reduzido respeitado.</p></div>
      <div><p className="display text-4xl">{missing.filter(x=>x.path.endsWith(".mp4")).length}</p><p className="text-[var(--tkn-muted)]">Exports MP4 em falta. O hero apresenta fotografia real.</p></div>
    </div>
    <p className="text-[13px] text-[var(--tkn-muted)] max-w-4xl">As imagens vieram da loja oficial Taikonaut. Não foram gerados modelos, peças ou planos de vídeo. O Vimeo ligado pela marca não disponibilizou MP4 público (403); a ligação original continua acessível por iniciativa do visitante. Os caminhos ausentes não são carregados no hero.</p>
    <div className="overflow-x-auto"><table className="w-full text-left text-[12px]"><thead><tr className="border-b border-[var(--tkn-border-subtle)]"><th className="py-3 pr-6 font-medium">Ficheiro por fornecer</th><th className="py-3 font-medium">Especificação</th></tr></thead><tbody>{missing.map(m=><tr key={m.path} className="border-b border-[var(--tkn-border-subtle)]"><td className="py-3 pr-6 font-mono text-[11px] break-all">public{m.path}</td><td className="py-3 text-[var(--tkn-muted)]">{m.spec}</td></tr>)}</tbody></table></div>
    <p className="text-[12px]">Guia completo: <code>docs/ASSET_DIRECTION.md</code>. Configuração: <code>src/data/media.json</code>. Auditoria: <code>node scripts/audit-assets.mjs</code>.</p>
  </section>;
}
