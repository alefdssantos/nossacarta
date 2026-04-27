import "server-only";
import crypto from "node:crypto";
import { getAbacateEnv } from "@/lib/env";

/**
 * AbacatePay envia 2 mecanismos de validação:
 * 1. Query string `?webhookSecret=...` (definido por nós no painel ao criar webhook)
 * 2. Header `X-Webhook-Signature` HMAC-SHA256 base64 contra raw body, usando a
 *    public key da AbacatePay (chave fixa diferente do query secret).
 *
 * Política: query secret é obrigatório (validação primária). HMAC é validado
 * adicionalmente quando ABACATEPAY_PUBLIC_KEY está configurado.
 */

export function validarQuerySecret(querySecret: string | null): boolean {
  if (!querySecret) return false;
  const env = getAbacateEnv();
  const a = Buffer.from(querySecret);
  const b = Buffer.from(env.ABACATEPAY_WEBHOOK_SECRET);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function validarHmacSeConfigurado(rawBody: string, assinatura: string | null): "ok" | "fail" | "skipped" {
  const publicKey = process.env.ABACATEPAY_PUBLIC_KEY;
  if (!publicKey) return "skipped";
  if (!assinatura) return "fail";

  const buf = Buffer.from(rawBody, "utf8");
  const esperada = crypto.createHmac("sha256", publicKey).update(buf).digest("base64");
  const a = Buffer.from(esperada);
  const b = Buffer.from(assinatura);
  if (a.length !== b.length) return "fail";
  return crypto.timingSafeEqual(a, b) ? "ok" : "fail";
}
