import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { verificarAssinaturaAbacate } from "@/lib/abacate/webhook";
import { publicEnv, getServerEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function admin() {
  const env = getServerEnv();
  return createSupabaseAdmin<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
}

type WebhookEnvelope = {
  id?: string;
  event?: string;
  apiVersion?: number;
  devMode?: boolean;
  data?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const sig = request.headers.get("x-webhook-signature") ?? request.headers.get("X-Webhook-Signature");

  if (!verificarAssinaturaAbacate(raw, sig)) {
    console.warn("[abacate webhook] assinatura inválida");
    return new NextResponse("invalid signature", { status: 401 });
  }

  let envelope: WebhookEnvelope;
  try {
    envelope = JSON.parse(raw) as WebhookEnvelope;
  } catch {
    return new NextResponse("invalid json", { status: 400 });
  }

  const evento = envelope.event ?? "";
  const data = envelope.data ?? {};
  const externalId = (data as { externalId?: string }).externalId;
  const checkoutId = (data as { id?: string; checkoutId?: string }).id ?? (data as { checkoutId?: string }).checkoutId;
  const status = String((data as { status?: string }).status ?? "").toLowerCase();

  console.log("[abacate webhook]", { evento, externalId, checkoutId, status });

  if (!externalId && !checkoutId) {
    return new NextResponse("missing identifier", { status: 200 });
  }

  const supa = admin();

  let queryBuilder = supa
    .from("pagamentos")
    .select("id, carta_id, status, plano, owner_id")
    .limit(1);

  if (externalId) {
    queryBuilder = queryBuilder.eq("id", externalId);
  } else if (checkoutId) {
    queryBuilder = queryBuilder.eq("gateway_checkout_id", checkoutId);
  }

  const { data: pagamentos } = await queryBuilder;
  const pagamento = pagamentos?.[0];

  if (!pagamento) {
    console.warn("[abacate webhook] pagamento não encontrado", { externalId, checkoutId });
    return new NextResponse("ok", { status: 200 });
  }

  const isApproved =
    evento.endsWith(".completed") &&
    (status === "paid" || status === "completed" || status === "approved" || status === "");
  const isRefunded = evento.endsWith(".refunded");
  const isDisputed = evento.endsWith(".disputed");

  if (isApproved && pagamento.status !== "approved") {
    const agora = new Date();
    const expiraEm =
      pagamento.plano === "bilhete"
        ? new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null;

    await supa
      .from("pagamentos")
      .update({
        status: "approved",
        pago_em: agora.toISOString(),
        gateway_payment_id: checkoutId ?? null,
        payload_webhook: envelope as unknown as Database["public"]["Tables"]["pagamentos"]["Row"]["payload_webhook"],
      })
      .eq("id", pagamento.id);

    await supa
      .from("cartas")
      .update({
        status: "publicada",
        publicada_em: agora.toISOString(),
        expira_em: expiraEm,
      })
      .eq("id", pagamento.carta_id);
  } else if (isRefunded) {
    await supa.from("pagamentos").update({ status: "refunded" }).eq("id", pagamento.id);
    await supa.from("cartas").update({ status: "rascunho" }).eq("id", pagamento.carta_id);
  } else if (isDisputed) {
    await supa.from("pagamentos").update({ status: "rejected" }).eq("id", pagamento.id);
  }

  return new NextResponse("ok", { status: 200 });
}
