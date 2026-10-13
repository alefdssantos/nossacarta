import { expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";

mock.module("server-only", () => ({}));

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-test-key-not-real";
process.env.NEXT_PUBLIC_APP_URL = "https://nossacarta.test";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-not-real";

const slug = "ana-e-bia";
const token = "a1b2c3d4e5f64789abcd";

const { GET: getQr } = await import("../app/api/qr/[slug]/route");
const { GET: getCard } = await import("../app/api/qr/[slug]/card/route");
const { POST: postWebhook } = await import("../app/api/mp/webhook/route");
const { prepararEmailPublicacao } = await import("./emails/publicacao");

function semRede() {
  const chamadas: string[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    chamadas.push(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    return original(input, init);
  };
  return {
    chamadas,
    restaurar() {
      globalThis.fetch = original;
    },
  };
}

test("qr anonimo nao devolve token nem cache public", async () => {
  const rede = semRede();
  try {
    const req = new NextRequest(`https://nossacarta.test/api/qr/${slug}`);
    const params = Promise.resolve({ slug });
    for (const handler of [getQr, getCard]) {
      const res = await handler(req, { params });
      expect(res.status).toBe(404);
      expect(res.headers.get("cache-control") ?? "").not.toMatch(/public/i);
      expect(await res.text()).not.toContain(token);
    }
    expect(rede.chamadas).toEqual([]);
  } finally {
    rede.restaurar();
  }
});

test("email de publicacao leva slug e token no link", async () => {
  const pronto = await prepararEmailPublicacao({
    destinatarioEmail: "ana@example.com",
    pessoa1: "Ana",
    pessoa2: "Bia",
    slug,
    plano: "eterno",
    acessoToken: token,
  });
  expect(pronto.url).toBe(`https://nossacarta.test/${slug}?t=${token}`);
  expect(pronto.html).toContain(pronto.url);
  expect(pronto.html).not.toContain(`/api/qr/${slug}`);
});

test("webhook sem assinatura em producao responde 401", async () => {
  const anterior = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  const rede = semRede();
  try {
    const req = new NextRequest("https://nossacarta.test/api/mp/webhook", {
      method: "POST",
      body: JSON.stringify({ type: "payment", data: { id: "999" } }),
      headers: { "content-type": "application/json" },
    });
    const res = await postWebhook(req);
    expect(res.status).toBe(401);
    expect(rede.chamadas).toEqual([]);
  } finally {
    process.env.NODE_ENV = anterior;
    rede.restaurar();
  }
});

test("migration 0017 remove as cinco policies e trava preco", () => {
  const sql = readFileSync(new URL("../../supabase/migrations/0017_fecha_acesso_publico.sql", import.meta.url), "utf8");
  for (const nome of [
    "cartas: público lê publicadas e ativas",
    "media: público lê em carta pública",
    "marcos_select_publica",
    "capsulas: público lê desbloqueadas em carta pública",
    "carta-fotos: leitura pública só de cartas ativas",
    "media_select_publica",
    "capsulas_select_publica",
    "carta_fotos_select_publica",
  ]) {
    expect(sql).toContain(nome);
  }
  expect(sql).toContain("revoke all on function public.carta_publica_ativa(uuid) from anon");
  expect(sql).toContain("revoke all on function public.carta_capsulas_publicas(uuid) from anon");
  expect(sql).toContain("publicacao direta bloqueada");
  expect(sql).toContain("pagamentos.valor_centavos = 1790");
  expect(sql).toContain("pagamentos.valor_centavos = 2990");
  expect(sql).toContain("pagamentos.status = 'pending'");
});
