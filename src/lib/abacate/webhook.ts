import "server-only";
import crypto from "node:crypto";
import { getAbacateEnv } from "@/lib/env";

export function verificarAssinaturaAbacate(rawBody: string, assinaturaHeader: string | null): boolean {
  if (!assinaturaHeader) return false;
  const env = getAbacateEnv();
  const buf = Buffer.from(rawBody, "utf8");
  const esperada = crypto
    .createHmac("sha256", env.ABACATEPAY_WEBHOOK_SECRET)
    .update(buf)
    .digest("base64");

  const a = Buffer.from(esperada);
  const b = Buffer.from(assinaturaHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
