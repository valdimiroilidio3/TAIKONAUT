# Auditoria comercial — confirmação com a marca

Regra desta fase: **não inventar dados nem “corrigir” preços, stock, tamanhos ou condições sem confirmação escrita.** A existência de um valor no código não prova atualidade comercial.

Estado resumido em `/guia-gestao` (painel “Dados por confirmar”). Dados legíveis por máquina em `src/data/commercial-audit.json`. Verificação estrutural: `node scripts/audit-commercial.mjs`.

## 1. Correspondência com a loja oficial

Comparação feita com o catálogo público da loja Taikonaut durante este trabalho:

| Tema | Loja oficial | Este projeto | Ação necessária |
| --- | --- | --- | --- |
| Tamanhos | XS, S, M, L, XL, 2XL em várias peças | S–XL | Confirmar grelha real e atualizar `sizes` |
| Stock | Tamanhos esgotados individualmente | Um número por produto | Confirmar e, idealmente, modelar variantes |
| Moeda | EUR | EUR, com MZN a 69,5 | Confirmar taxa e data |
| Produtos | Inclui Maçanica, Mafura e Mozdrian | Não incluídos (catálogo pedido) | Decidir se entram |
| Peça sem nome | — | “Coming back soon”, € 45,00 | Confirmar existência, nome e preço |

## 2. Conteúdo e materiais

Gramagens (240/460 gsm), “3M Scotchlite”, nylon repelente à água, UV400, forros e instruções de lavagem foram redigidos no redesign a partir de descrições genéricas. **Confirmar cada ficha técnica ou substituir pelo texto oficial.** Ficheiro: `src/data/products.json` (`description*`, `material*`, `care*`).

## 3. Pagamentos, portes e CRM

- O checkout grava o pedido/reserva e gera uma mensagem WhatsApp pré-preenchida. **Não cobra.** Confirmar M-Pesa, e-Mola, BIM, POS, cartão/PayPal, titularidade das contas e conciliação.
- Portes: € 5 Maputo/Matola, € 18 internacional, grátis acima de € 90; prazos 24–48h e 3–7 dias. Confirmar.
- Restock/newsletter guardam email e/ou WhatsApp. Confirmar texto de consentimento, base legal e retenção antes de campanhas.

## 4. Evento

Textos: 12 de dezembro, 12:00–19:00, Restaurante Spazio, Av. Paulo Samuel Kankhomba 578. O JSON-LD usa 2026 e o calendário `.ics`/contagem avança para o ano seguinte depois das 19:00. Confirmar o ano e a morada exata; atualizar `src/data/event-config.json`, `src/app/api/popup/ics/route.ts`, `src/components/PopupSection.tsx` e `src/app/layout.tsx` em conjunto.

## 5. Direitos de imagem e vídeo

Fotografia proveniente da loja oficial, para este redesign. Não foram usadas exportações privadas do Instagram nem ficheiros privados do Vimeo. Confirmar autorização de publicação com os autores/modelos. Ver `docs/ASSET_DIRECTION.md`.

## Assinatura da revisão

Só depois de preencher isto é que os dados devem ser considerados validados:

- [ ] Catálogo, tamanhos e stock conferidos por peça
- [ ] Fichas técnicas e descrições aprovadas
- [ ] Portes, moeda e pagamentos confirmados
- [ ] Data/horário/morada do Pop-Up confirmados
- [ ] Direitos de fotografia e vídeo confirmados

Nome: ____________________  Data: ____________  Assinatura: ____________________
