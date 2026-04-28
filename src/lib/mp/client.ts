import "server-only";
import { getMPEnv } from "@/lib/env";

const MP_API = "https://api.mercadopago.com";

export const PRECOS_CENTAVOS: Record<"bilhete" | "eterno", number> = {
  bilhete: 1790,
  eterno: 2990,
};

export const NOMES_PLANOS: Record<"bilhete" | "eterno", string> = {
  bilhete: "Bilhete (NossaCarta)",
  eterno: "Eterno (NossaCarta)",
};

async function mpPost<T>(path: string, body: object, idempotencyKey?: string): Promise<T> {
  const env = getMPEnv();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
  if (idempotencyKey) headers["X-Idempotency-Key"] = idempotencyKey;

  const res = await fetch(`${MP_API}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json()) as T;
  if (!res.ok) {
    const msg = (json as { message?: string })?.message ?? JSON.stringify(json);
    throw new Error(`MercadoPago ${res.status}: ${msg}`);
  }
  return json;
}

export type MPPreferenceCriada = {
  id: string;
  init_point: string;
  sandbox_init_point: string;
};

export async function criarPreferenciaMp(input: {
  pagamentoId: string;
  titulo: string;
  valorCentavos: number;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
  webhookUrl: string;
  payerEmail?: string;
}): Promise<MPPreferenceCriada> {
  return mpPost<MPPreferenceCriada>(
    "/checkout/preferences",
    {
      external_reference: input.pagamentoId,
      items: [
        {
          id: input.pagamentoId,
          title: input.titulo,
          quantity: 1,
          unit_price: input.valorCentavos / 100,
          currency_id: "BRL",
        },
      ],
      back_urls: {
        success: input.successUrl,
        failure: input.failureUrl,
        pending: input.pendingUrl,
      },
      ...(input.successUrl.startsWith("https://") ? { auto_return: "approved" } : {}),
      ...(input.webhookUrl.startsWith("https://") ? { notification_url: input.webhookUrl } : {}),
      payer: input.payerEmail ? { email: input.payerEmail } : undefined,
    },
    input.pagamentoId,
  );
}
