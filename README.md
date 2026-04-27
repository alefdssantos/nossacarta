# NossaCarta

Site personalizado de carta de amor — contador, fotos, musica Spotify, declaracao, capsulas do tempo, ritual envelope e QR code. Lançamento: Dia dos Namorados 2026.

## Setup local

```bash
bun install
cp .env.example .env.local   # preencher credenciais
bun dev
```

Abrir http://localhost:3000

## Variaveis de ambiente

Ver `.env.example`. Grupos:

- **Supabase** — URL, anon key, service role key
- **AbacatePay** — API key, webhook secret, public key, product IDs
- **Spotify** — client ID + secret (Client Credentials)
- **Resend** — API key + from address
- **Vercel** — CRON_SECRET
- **Meta Ads** — NEXT_PUBLIC_META_PIXEL_ID (opcional)

## Arquitetura

```
src/
  app/
    (app)/          # rotas protegidas (auth via proxy.ts)
    [slug]/         # carta publica + /historia wrapped story
    api/            # webhook AbacatePay, cron, QR
  lib/
    auth/           # magic link Supabase
    cartas/         # CRUD + schema + pagamento
    emails/         # Resend templates
    supabase/       # clientes SSR/browser + middleware
    spotify/        # Web API Client Credentials
    abacate/        # checkout + webhook HMAC
  components/
    letter/         # renderizacao editorial da carta
```

## Fluxo critico

Criar carta (wizard 6 etapas) -> pagar PIX (AbacatePay) -> webhook -> publicar -> email com link + QR

## Deploy

Vercel. `vercel.json` configura:
- Cron `/api/cron/expirar-bilhete` a cada hora (expira plano Bilhete apos 7 dias)
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
