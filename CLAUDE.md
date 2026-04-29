@AGENTS.md

# NossaCarta

SaaS sazonal de cartas de amor. Deadline: 12-jun-2026 (Dia dos Namorados BR).

## Stack

- Next.js 16 App Router + React 19 + Tailwind v4 + Turbopack
- Supabase (Postgres + Auth magic link + Storage privado)
- Mercado Pago (PIX + cartão, webhook HMAC-SHA256)
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

api/mp/webhook/     <- recebe eventos Mercado Pago
api/cron/expirar-bilhete/ <- Vercel Cron, hourly
api/qr/[slug]/  <- gera QR code SVG inline
```

## Fluxo de pagamento

criarPagamentoAction -> Mercado Pago checkout -> redirect -> webhook POST /api/mp/webhook -> validarAssinaturaMp -> atualiza pagamentos.status='approved' + cartas.status='publicada' -> notificarPublicacao (Resend)

## Convencoes

- Todo texto de UI em pt-BR
- Server actions em src/lib/*/actions.ts, nunca em src/app/
- Env vars validadas via src/lib/env.ts -- nao usar process.env direto
- Supabase SSR: createClient() de @/lib/supabase/server em server components/actions
- RLS ativa em todas as tabelas -- admin ops usam SUPABASE_SERVICE_ROLE_KEY
- Antes de features sensiveis (auth, pagamento, webhook): rodar /security-review

## Fluxo de branches (OBRIGATORIO)

- Todo desenvolvimento vai para `dev`, NUNCA direto para `main`
- `dev` → Vercel cria preview automatico (testa antes de subir)
- Merge `dev` → `main` somente quando aprovado → vai para producao
- Commits e pushes sempre em `dev`: `git push origin dev`
- Para subir para prod: `git checkout main && git merge dev && git push origin main && git checkout dev`

## Comandos

```bash
bun dev          # dev com Turbopack
bun run build    # build prod (verifica tipos + lint)
bun run lint
```
