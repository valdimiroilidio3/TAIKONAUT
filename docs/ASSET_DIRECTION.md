# TAIKONAUT® — STEP 02 / Asset direction

## Direção

Fotografia real, cruzável com o arquivo da marca. Preto carvão, papel cru, linhas de 1px. Anton para títulos condensados e oversized; Inter para informação e compra. Ambas alojadas localmente. As únicas cores fortes vêm das peças fotografadas. Sem texturas sintéticas, modelos gerados, mapas decorativos ou objetos flutuantes.

### Cinco capítulos

1. **THE ARRIVAL** — origem Maputo. Hero de imagem/vídeo, palavra curta e acesso à coleção.
2. **THE WORLD** — contexto da marca, fotografia da Basic Tee, malha Mozdrian de arquivo. Não atribuir às fotografias uma localização que não esteja confirmada.
3. **THE COLLECTION** — seleção inicial de quatro peças; catálogo completo, filtros, tamanhos, preços EUR/MZN e disponibilidade existentes. `/shop` apresenta todos os produtos.
4. **THE DETAILS** — mapa, assinatura e acabamento. As três vistas são interativas, suportam teclado e levam à peça correspondente.
5. **OUR WORLD** — pessoas do arquivo, lightbox, ligação ao Instagram, Homecoming, história e comunidade.

O GSAP ScrollTrigger atua apenas em deslocamentos curtos/revelações e parallax discreto em desktop. Não há scroll hijacking, pinning, snapping forçado ou carregamento bloqueante. `prefers-reduced-motion` desativa animação e autoplay. Todos os textos existem no HTML sem JavaScript.

## Proveniência e estado atual

- 35 imagens reais previamente publicadas na loja oficial `https://www.taikonautmaputo.com/`, reorganizadas e convertidas para WebP (logo original em PNG transparente).
- Três derivados fotográficos: posters desktop/mobile e imagem social, recortados da fotografia real da camisola Mozdrian. Não são frames de um vídeo nem fotografias novas.
- Não foram importadas imagens do Instagram sem acesso/export autorizado. A ligação para o perfil permanece.
- O arquivo Mozdrian é identificado como arquivo; não foi criado um produto novo para o vender.
- **Nenhum vídeo foi fornecido no projeto.** O site da marca liga para “The Homecoming Pop-Up” no Vimeo; a página de revisão é pública, mas o endpoint do MP4 devolveu 403. Não se contornou a restrição nem se copiou um URL privado/expirável.
- **Coming back soon não tem fotografia oficial.** O SVG genérico foi eliminado; é apresentado um estado textual “Fotografia por disponibilizar”. Preço, nome e stock do catálogo permanecem inalterados.

O inventário com URL de origem, dimensões, tamanho e classificação está em `src/data/asset-inventory.json`. Os aliases antigos estão em `src/data/asset-aliases.json`. Carrinhos guardados são migrados para os novos caminhos por slug.

## Estrutura

- `public/images/campaigns/arrival/` — editorial Mozdrian, posters e social.
- `public/images/campaigns/signature/` — White Basic Tee editorial.
- `public/images/products/<slug>/` — packshots reais, frente/costas/perfil.
- `public/images/details/` — map-jackets, mozdrian, taikosunnies e fruit-series.
- `public/images/community/fruit-series/` — Manga e Tintsiva vestidas.
- `public/images/brand/` — logótipo original e guias oficiais de tamanhos.
- `public/videos/campaigns/arrival/` — reservado para o filme do hero.
- `public/videos/campaigns/homecoming/` — reservado para o export autorizado do evento.
- `public/videos/details/`, `public/videos/community/` — reservados, sem ficheiros fictícios.

## Ficheiros em falta (NÃO carregados pelo browser)

| Ficheiro esperado | Estado / requisitos |
| --- | --- |
| `public/videos/campaigns/arrival/desktop.mp4` | Em falta. Master autorizado, H.264, 1920×1080, 24/25fps, 12–20s, loop sem títulos incrustados, sem áudio, ideal <5MB. |
| `public/videos/campaigns/arrival/mobile.mp4` | Em falta. Montagem vertical própria (720×1080 ou 720×1280), rosto e peça preservados, ideal <2MB. Não recortar o desktop às cegas. |
| `public/videos/campaigns/arrival/desktop.webm` | Opcional, VP9, mesmo corte. |
| `public/videos/campaigns/arrival/mobile.webm` | Opcional, VP9, versão vertical. |
| `public/videos/campaigns/homecoming/film.mp4` | Em falta/opcional. Pedir export autorizado do filme existente no Vimeo. |
| `public/images/products/coming-back-soon/front.webp` | Em falta. Só adicionar a fotografia da peça real. |

### Montagem sugerida para o filme

12–18 segundos: 0–4s tecido/mão; 4–9s modelo a ajustar a peça em luz natural; 9–14s deslocação simples; 14–18s detalhe que permita a junção do loop. Cor original das peças, contraste fotográfico, sem grão digital adicionado e sem imagem sintética. Não se produziu este filme: é a especificação para os masters autorizados.

## Publicar um vídeo fornecido

1. Rever os direitos/autorizações e a montagem final com a marca.
2. Com `ffmpeg` instalado, executar `bash scripts/prepare-video.sh /master-desktop.mov /master-mobile.mov`. A ferramenta elimina áudio, comprime H.264, aplica faststart, mantém enquadramento e extrai posters reais. `WEBM=1` produz também VP9.
3. Rever o loop e o recorte em telemóvel. O script não inventa planos nem anima fotografias.
4. O servidor verifica a existência dos ficheiros em `src/lib/media.ts`. Em `src/data/media.json`, `enableVideo` já está preparado; o browser só recebe as fontes presentes. A versão mobile não descarrega o vídeo desktop.
5. Para ficheiros inexistentes, erro de rede, bloqueio de autoplay, poupança de dados ou movimento reduzido, a fotografia continua visível. O vídeo pausa fora do viewport e ao ocultar o separador. Há botão de pausa; som só é exposto se `hasAudio` for autorizado/ativado.
6. Executar a auditoria e a validação completa, depois voltar a publicar (as fontes são verificadas no build).

## Atualizar fotografia

Trocar as fotografias mantendo os caminhos ou atualizar os campos `images` em `src/data/products.json`. Dimensões recomendadas: packshot 1400×1750, detalhe 1400×1750, comunidade 1400×1750; fotografia de campanha original de pelo menos 2400px antes de recortar. Não duplicar uma imagem sob o nome de uma vista inexistente. O segundo ângulo só aparece quando existe.

## Verificações

`node scripts/audit-assets.mjs` verifica todos os caminhos ativos, os aliases, as dimensões e a igualdade de nomes, tamanhos, preço e stock com `docs/catalog-baseline.json`.

Validação final: `npx next typegen`, `npm exec tsc -- --noEmit --pretty false`, `npm run build`, seguido do arranque/healthcheck da plataforma.

Os sistemas de encomenda, reserva, restock, newsletter e analytics já existentes foram preservados. Registar um pedido não significa que um pagamento tenha sido processado; M-Pesa/e-Mola/cartão continuam a depender da operação/configuração comercial existente.
