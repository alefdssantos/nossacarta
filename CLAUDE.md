@AGENTS.md

# NossaCarta

SaaS sazonal de cartas de amor. Deadline: 12-jun-2026 (Dia dos Namorados BR).

## Stack

- Next.js 16 App Router + React 19 + Tailwind v4 + Turbopack
- Supabase (Postgres + Auth magic link + Storage privado)
- AbacatePay (PIX one-time, webhook HMAC-SHA256)
- Spotify Web API (Client Credentials, embed oficial)
- Resend (email transacional)
- Vercel (deploy + cron hourly)

## Planos

| Plano | Preco | Duracao | Diferencial |
|-------|-------|---------|-------------|
| Bilhete | R$17,90 | 7 dias | Base completa |
| Eterno | R$29,90 | Vitalicio | + capsulas, edicao continua, star map |

## Rotas

```
(app)/          <- protegido por proxy.ts
  cadastro/     <- auth-only (redireciona se logado)
  login/        <- auth-only
  conta/        <- dashboard do usuario
  criar/[id]/   <- wizard 6 etapas (A-F)
  editar/[id]/  <- pos-publicacao (Eterno)

[slug]/         <- carta publica editorial
[slug]/historia/<- wrapped story 9:16

api/abacate/webhook/ <- recebe eventos AbacatePay
api/cron/expirar-bilhete/ <- Vercel Cron, hourly
api/qr/[slug]/  <- gera QR code SVG inline
```

## Fluxo de pagamento

criarPagamentoAction -> AbacatePay checkout -> redirect -> webhook POST -> validarQuerySecret + validarHmacSeConfigurado -> atualiza pagamentos.status='approved' + cartas.status='publicada' -> notificarPublicacao (Resend)

## Convencoes

- Todo texto de UI em pt-BR
- Server actions em src/lib/*/actions.ts, nunca em src/app/
- Env vars validadas via src/lib/env.ts -- nao usar process.env direto
- Supabase SSR: createClient() de @/lib/supabase/server em server components/actions
- RLS ativa em todas as tabelas -- admin ops usam SUPABASE_SERVICE_ROLE_KEY
- Antes de features sensiveis (auth, pagamento, webhook): rodar /security-review

## Comandos

```bash
bun dev          # dev com Turbopack
bun run build    # build prod (verifica tipos + lint)
bun run lint
```
