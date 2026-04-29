import "server-only";
import crypto from "node:crypto";

/**
 * Mercado Pago envia header x-signature: "ts=<timestamp>,v1=<hmac_hex>"
 * Manifest: "id:<dataId>;request-id:<xRequestId>;ts:<ts>;"
 * HMAC-SHA256 do manifest usando MP_WEBHOOK_SECRET (configurado no painel MP → Notificações).
 */
export function validarAssinaturaMp(
  dataId: string | null,
  xSignature: string | null,
  xRequestId: string | null,
): "ok" | "fail" | "skipped" {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return "skipped";
  if (!xSignature || !dataId) return "fail";

  const parts: Record<string, string> = {};
  for (const part of xSignature.split(",")) {
    const idx = part.indexOf("=");
    if (idx > 0) parts[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return "fail";

  const manifest = `id:${dataId};request-id:${xRequestId ?? ""};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  if (a.length !== b.length) return "fail";
  if (!crypto.timingSafeEqual(a, b)) return "fail";

  // Rejeita webhooks com timestamp > 5 min (replay protection)
  const tsNum = parseInt(ts, 10);
  if (isNaN(tsNum) || Date.now() - tsNum * 1000 > 5 * 60 * 1000) return "fail";

  return "ok";
}
