import "server-only";
import { getAbacateEnv } from "@/lib/env";

const API_BASE = "https://api.abacatepay.com/v2";

export const PRECOS_CENTAVOS: Record<"bilhete" | "eterno", number> = {
  bilhete: 1790,
  eterno: 2990,
};

export const NOMES_PLANOS: Record<"bilhete" | "eterno", string> = {
  bilhete: "Bilhete (NossaCarta)",
  eterno: "Eterno (NossaCarta)",
};

type AbacateCustomer = {
  name: string;
  email: string;
  cellphone?: string;
  taxId?: string;
};

export type AbacatePixCriado = {
  id: string;
  amount: number;
  status: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt?: string;
};

async function abacateFetch<T>(path: string, body: object): Promise<T> {
  const env = getAbacateEnv();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.ABACATEPAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = (json as { message?: string; error?: string })?.message ?? (json as { error?: string })?.error ?? text;
    throw new Error(`AbacatePay ${res.status}: ${msg}`);
  }
  // Resposta padrão: { error: null, data: {...} } ou { data: {...} }
  const data = (json as { data?: T })?.data ?? (json as T);
  return data;
}

export type AbacateCheckoutCriado = {
  id: string;
  url: string;
  amount: number;
  paidAmount: number | null;
  externalId: string | null;
};

export async function criarCheckoutAbacate(input: {
  productId: string;
  externalId: string;
  returnUrl: string;
  completionUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}): Promise<AbacateCheckoutCriado> {
  const body: Record<string, unknown> = {
    items: [{ id: input.productId, quantity: 1 }],
    externalId: input.externalId,
    returnUrl: input.returnUrl,
    completionUrl: input.completionUrl,
  };
  if (input.metadata) body.metadata = input.metadata;
  if (input.customerEmail) {
    // Customer parcial: só email pra pré-preencher; cliente completa o resto.
    body.customer = { email: input.customerEmail };
  }
  return abacateFetch<AbacateCheckoutCriado>("/checkouts/create", body);
}

export async function criarPixAbacate(input: {
  amount: number;
  description?: string;
  expiresIn?: number;
  customer?: AbacateCustomer;
  metadata?: Record<string, string>;
  externalId?: string;
}): Promise<AbacatePixCriado> {
  const data: Record<string, unknown> = { amount: input.amount };
  if (input.description) data.description = input.description;
  if (input.expiresIn) data.expiresIn = input.expiresIn;
  if (input.customer) data.customer = input.customer;
  if (input.metadata) data.metadata = input.metadata;
  if (input.externalId) data.externalId = input.externalId;

  // v2: discriminator method + data envelope
  return abacateFetch<AbacatePixCriado>("/transparents/create", { method: "PIX", data });
}

export async function simularPixAbacate(id: string): Promise<unknown> {
  const env = getAbacateEnv();
  // Tenta v1 (Pix QR Code legacy) primeiro, depois v2 (transparent).
  const candidatos = [
    `https://api.abacatepay.com/v1/pixQrCode/simulate-payment?id=${encodeURIComponent(id)}`,
    `${API_BASE}/transparents/simulate-payment?id=${encodeURIComponent(id)}`,
  ];
  let ultimoErro = "";
  for (const url of candidatos) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.ABACATEPAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ metadata: { simuladoPor: "nossacarta-dev" } }),
      cache: "no-store",
    });
    if (res.ok) return res.json();
    const text = await res.text();
    ultimoErro = `${res.status} (${url}): ${text}`;
    if (res.status !== 400 && res.status !== 404) break;
  }
  throw new Error(`AbacatePay simulate ${ultimoErro}`);
}

export async function statusPixAbacate(id: string): Promise<{ status: string; expiresAt?: string }> {
  const env = getAbacateEnv();
  const res = await fetch(`${API_BASE}/transparents/check?id=${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${env.ABACATEPAY_API_KEY}` },
    cache: "no-store",
  });
  const json = (await res.json()) as { data?: { status: string; expiresAt?: string } };
  if (!res.ok) throw new Error(`AbacatePay status ${res.status}`);
  return json.data ?? { status: "unknown" };
}
