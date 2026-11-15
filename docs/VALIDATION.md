# STEP 02 — verificação da implementação

## Assets

- `node scripts/audit-assets.mjs`: passou.
- 35 imagens reais da loja Taikonaut + 3 derivados fotográficos (posters/social).
- Imagens reorganizadas: 11,16 MB → 6,33 MB; com posters/social: 6,73 MB.
- Fontes Inter variável e Anton alojadas localmente; licenças em `public/fonts/`.
- Nenhum caminho ativo de imagem, fonte ou vídeo inexistente.
- Nenhum pedido MP4/WebM feito pelo browser: os vídeos autorizados ainda não foram fornecidos.
- Um produto sem fotografia oficial, `Coming back soon`, apresenta um estado textual explícito.
- Nomes, preços, stock, disponibilidade e tamanhos dos 13 produtos iguais ao baseline anterior ao redesign.

## Browser real (Chromium headless)

Testado em 1440×960 e 390×844:
- Cinco capítulos presentes e navegáveis.
- Sem imagens quebradas, erros JavaScript ou overflow horizontal.
- Poster desktop e poster mobile corretos, servidos pelo otimizador Next.js.
- Sem pedidos aos antigos caminhos de imagens nos carrinhos migrados.
- Conteúdo dos capítulos visível sem JavaScript.
- `prefers-reduced-motion` desativa movimento e autoplay.

Relatórios: `artifacts/visual-check.json`, capturas `artifacts/home-*.png`.

## Acessibilidade

`node scripts/check-accessibility.mjs`: **zero violações automáticas** com regras WCAG 2 A/AA e WCAG 2.1 A/AA nos seis cenários:
1. Homepage desktop.
2. Página de produto.
3. Carrinho aberto.
4. Pesquisa instantânea.
5. Homepage mobile.
6. Menu mobile.

Também foram testados Tab/foco, Escape, setas nos detalhes e lightbox. O resultado do Axe não é uma certificação universal de acessibilidade; outras situações e tecnologias de apoio continuam a merecer revisão manual.

## Compra e base de dados

`node scripts/check-commerce.mjs`: passou.
- Catálogo de 13 peças, categorias, tamanhos, disponibilidade e ordenação.
- Pesquisa instantânea → produto.
- Tamanho obrigatório, tabela oficial, carrinho, quantidade e wishlist.
- Alternância EUR/MZN.
- Reserva de Pop-Up guardada por Drizzle/PostgreSQL com total esperado e link WhatsApp.
- Aviso de restock de produto esgotado guardado.
- Subscrição de comunidade guardada.
- Calendário `.ics`, mapa sob pedido e detalhes do evento.
- Detalhes selecionáveis por teclado, lightbox e PT/EN.
- Migração de um carrinho legado para os novos caminhos.

Os registos sintéticos foram eliminados com `scripts/cleanup-qa.ts`, que só elimina IDs/emails marcados como QA. Nenhuma encomenda real ou stock foi alterado. Não foi efetuado pagamento real nem enviada mensagem WhatsApp.

## Build e arranque

Passaram a geração de tipos Next.js, TypeScript sem emissão e a compilação de produção. O runtime gerido da plataforma arrancou e respondeu ao healthcheck `/api/health` com a base de dados ligada.

## Conteúdo ainda em falta

Ver `docs/ASSET_DIRECTION.md`, `src/data/asset-inventory.json` e `/guia-gestao`:
- Master autorizado do filme de chegada para desktop e versão vertical para mobile.
- Versões WebM opcionais.
- Export autorizado do filme Homecoming (opcional; o Vimeo público devolveu 403 para acesso ao MP4).
- Fotografia real de `Coming back soon`.

O sistema não apresenta filmes fictícios nem substitui peças por stock photography. Não foi atribuído qualquer score Lighthouse sem medição.

---

## STEP 02B — atualização após as seis melhorias

### 01. Filme real
Continua **bloqueado por falta dos masters autorizados**. Não foi gerado nem usado footage genérico. O hero permanece fotográfico e a estrutura aceita MP4/WebM desktop e mobile. `scripts/check-video.mjs` valida tamanho, duração, dimensões e orientação logo que existam ficheiros; `scripts/prepare-video.sh` recusa masters fora do contrato. Não foi feito pedido de vídeo pelo browser.

### 02. Direção de arte
Escala de títulos aumentada, corte bleeding às margens, faixa tipográfica full-bleed entre capítulos, pares assimétricos e novas especificações em tabela. Corrigidos dois defeitos encontrados nas capturas: sobreposição de linhas em “One city. Our voice.” e corte da faixa “Made in Maputo”.

### 03. Storytelling
Sete imagens distintas no arquivo de “Our world”, incluindo a vista traseira real do Map Jacket. “The details” passou a usar três fotografias diferentes e legítimas (mapa, assinatura, acabamento). As transições continuam progressivas, sem pinning.

### 04. Produto
Vistas identificadas (Frente/Costas/Detalhe/Modelo), disponibilidade explícita junto ao preço, feedback após escolher tamanho, especificações em tabela e barra de compra fixa apenas a ≤1023px, com seletor de tamanho obrigatório. Carrinho e checkout existentes mantidos.

### 05. Auditoria comercial
`src/data/commercial-audit.json` e `docs/COMMERCIAL_AUDIT.md` listam 10 pontos para confirmação escrita, incluindo grelha de tamanhos incompleta e stock não modelado por variante. `node scripts/audit-commercial.mjs` passa sem alterar qualquer dado. Nada foi inventado ou “corrigido”.

### 06. Performance e conversão
Medição de laboratório em 390px, Chromium headless: LCP 0,864 s · CLS 0 · FCP 0,204 s · TTFB ~35 ms; transferência observada ~351 KB (imagens 284 KB, fontes 67 KB, vídeo 0). Carrinho persistiu após recarregar a página. Estes números **não** são dados de campo nem um score Lighthouse.

Repetidos no build final: acessibilidade Axe sem violações em 6 cenários; percursos de compra, reserva PostgreSQL, restock, newsletter, calendário e migração de carrinho aprovados; desktop 1440 e mobile 390 sem overflow, imagens quebradas ou erros. Registos sintéticos removidos.

**Continua por validar:** vídeo autorizado, dados comerciais com a marca, pagamentos reais, CWV de campo e conversão com tráfego real.

---

## STEP 03 — loja editorial brutalista

Reescrita profunda dos componentes comerciais sobre a arquitetura existente. Nenhum produto, preço, stock, tamanho, fotografia ou característica foi inventado; `scripts/audit-commercial.mjs` confirma igualdade com o baseline.

### Catálogo
- Grelha paginada (8 + carregar mais) e segundo modo "Editorial" com peças em destaque.
- Filtros combinados de categoria, disponibilidade, cor e tamanho, com contagens por opção e opções a zero desativadas.
- Chips de filtros ativos, limpeza total, ordenação (destaque, recente, preço) e contagem anunciada com `aria-live`.
- Estado partilhável no URL (`?cat=&color=&size=&stock=&q=&sort=`), restaurado em deep links sem navegação.
- Pesquisa por texto dentro do catálogo e folha de filtros em mobile, com Escape e reposição de foco.

### Cartões de produto
Estado de stock explícito (Em stock / Últimas N / Sold out), índice editorial, favoritos, troca de imagem no hover e compra rápida que expande tamanhos também em ecrã tátil.

### Pesquisa instantânea
Combobox com filtro por categoria, resultados pesquisáveis por nome/cor/tamanho/descrição, navegação por setas com `aria-activedescendant`, Enter para abrir, histórico local de pesquisas e estado vazio.

### Página de produto
Galeria imersiva: rail de miniaturas com `role="tab"` e navegação por setas/Home/End, palco com contador e navegação, swipe sincronizado em mobile com barra de progresso. Seleção de tamanho obrigatória com mensagem explícita (`aria-describedby`), disponibilidade junto ao preço, especificações e barra de compra fixa em mobile.

### Carrinho
Cabeçalho editorial com indicador de passos, lista com imagem, tamanho, quantidade e remoção por artigo (nomes acessíveis com o produto), subtotal em EUR e MZN, progresso de envio grátis e checkout preservado sem alterações de lógica.

### Verificação
- `npm run lint` sem erros nem avisos.
- `npm exec tsc -- --noEmit` sem erros.
- `next typegen` e `npm run build` passam; `build_and_start` saudável.
- `scripts/check-storefront.mjs`: filtros combinados, URL, estado vazio, carregar mais, preferência de vista, deep link, pesquisa por teclado, galeria, validação de tamanho, persistência do carrinho, quick add mobile e sem overflow 390 px — todos passam.
- `scripts/check-commerce.mjs` (suite anterior): compras, reserva em PostgreSQL, restock, newsletter, calendário, PT/EN e migração de carrinho — passam.
- `scripts/check-accessibility.mjs`: seis cenários sem violações automáticas (com movimento reduzido para medir o estado final, não a animação).
- `scripts/check-performance.mjs`: laboratório em 390 px com LCP ~0,14 s, CLS 0 e carrinho persistente. Não é dado de campo.

### Correções encontradas nos testes
Navegação por setas do rail a partir do índice errado, nome acessível das miniaturas, conteúdo visível fora do nome acessível no botão de idioma/moeda, imagem em falta sem `alt` significativa e nomes de produto a quebrar em mobile.

### Continua pendente
Filme autorizado (desktop e vertical), confirmação comercial com a marca (tamanhos XS/2XL, stock por variante, fichas técnicas, pagamentos e portes) e validação real de pagamentos e Core Web Vitals de campo.
