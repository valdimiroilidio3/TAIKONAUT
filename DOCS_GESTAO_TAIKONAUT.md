# TAIKONAUT® — Gestão da loja

A direção visual e o inventário da fase STEP 02 estão documentados em **docs/ASSET_DIRECTION.md**. A página **/guia-gestao** mostra o estado dos assets e os ficheiros ainda em falta.

## Produtos, preços, tamanhos e stock

Editar `src/data/products.json`:
- `name`, `slug`: nome e URL da peça (não alterar um slug publicado sem criar redirect).
- `priceEur`: preço base em EUR; MZN é calculado pela taxa configurada.
- `soldOut`, `stock`: disponibilidade. Os esgotados mantêm a captura de restock por email/WhatsApp.
- `sizes`: tamanhos; as tabelas de medidas oficiais estão em `public/images/brand/size-guides/`.
- `images.front`, `images.back`, `images.detail`, `images.model`: usar apenas as vistas reais disponíveis. Não duplicar fotografias para fingir outro ângulo.

Durante STEP 02, nomes, preços, tamanhos e stock foram preservados. `docs/catalog-baseline.json` regista esse estado para auditoria. Depois de uma alteração comercial autorizada, atualizar conscientemente o baseline.

A peça **Coming back soon** não tem fotografia oficial. `imageMissing: true` e `images.front.src: ""` apresentam um aviso textual sem imagem fictícia. Ao receber a fotografia real, guardar em `public/images/products/coming-back-soon/front.webp`, atualizar o campo e remover `imageMissing`.

## Evento, moeda e contacto

Editar `src/data/event-config.json` para nome/localização do Pop-Up, taxa `eurToMznRate`, limite `freeShippingThresholdEur`, portes e contactos comerciais. Confirmar sempre os contactos/pagamentos antes de publicar. A data e os horários do evento continuam os existentes: 12 de dezembro, 12:00–19:00, Restaurante Spazio.

A lógica do calendário e da contagem continua em `src/app/api/popup/ics/route.ts` e `src/components/PopupSection.tsx`. Ao mudar a data do evento, atualizar também essas regras e o JSON-LD em `src/app/layout.tsx`; os textos de apresentação por si só não alteram datas de calendário.

## Fotografia e vídeo

- Imagens organizadas em `public/images/{campaigns,products,details,community,brand}/`.
- Vídeos preparados em `public/videos/{campaigns,details,community}/`; **não existe ainda vídeo local autorizado**.
- Lista de todos os assets, fontes e dimensões: `src/data/asset-inventory.json`.
- Preparação do hero: `src/data/media.json` e `src/lib/media.ts`. Fontes inexistentes nunca são enviadas ao browser.
- Receber e confirmar dois masters autorizados, desktop e mobile. Usar `bash scripts/prepare-video.sh desktop.mov mobile.mov` com ffmpeg instalado; rever o loop, dimensões e compressão antes do deploy.
- Não transformar imagens estáticas em “filmagem oficial”, nem contornar acessos restritos do Vimeo/Instagram.

## Interações e base de dados

Carrinho local, wishlist, PT/EN, EUR/MZN, páginas de produto, pesquisas, filtros e checkout existentes foram mantidos. Encomendas/reservas, restocks e comunidade são gravados em PostgreSQL via Drizzle. O checkout gera a mensagem de WhatsApp; pagamentos externos só se concluem através das integrações/configurações comerciais existentes, não pela mera gravação de um pedido.

## Analytics

`NEXT_PUBLIC_GA4_ID` e `NEXT_PUBLIC_META_PIXEL_ID` continuam opcionais. Nenhuma chave foi embutida no código.

## Validar e publicar

1. `node scripts/audit-assets.mjs`
2. `npx next typegen`
3. `npm exec tsc -- --noEmit --pretty false`
4. `npm run build`
5. Arranque/healthcheck da plataforma.

Verificar a loja a 390px e em desktop: hero, cinco capítulos, catálogo, produto, tamanho, carrinho, reserva, checkout, restock, newsletter e modo de movimento reduzido. Não há score Lighthouse garantido sem uma medição no ambiente final.
