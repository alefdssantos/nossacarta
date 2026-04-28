import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { validarAssinaturaMp } from "@/lib/mp/webhook";
import { publicEnv, getServerEnv, getMPEnv } from "@/lib/env";
import { notificarPublicacao } from "@/lib/emails/notificar-publicacao";
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

type MPWebhookPayload = {
  action?: string;
  type?: string;
  data?: { id?: string | number };
};

type MPPayment = {
  id?: number;
  status?: string;
  external_reference?: string;
  payment_type_id?: string;
};

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  const dataId = request.nextUrl.searchParams.get("data.id");

  const sigResult = validarAssinaturaMp(dataId, xSignature, xRequestId);

  if ((sigResult === "fail" || sigResult === "skipped") && process.env.NODE_ENV === "production") {
    console.warn("[mp webhook] assinatura inválida ou secret não configurado", { sigResult });
    return new NextResponse("invalid signature", { status: 401 });
  }

  let payload: MPWebhookPayload;
  try {
    payload = JSON.parse(raw) as MPWebhookPayload;
  } catch {
    return new NextResponse("invalid json", { status: 400 });
  }

  const isPaymentEvent = payload.type === "payment" || payload.action?.startsWith("payment.");
  if (!isPaymentEvent) return new NextResponse("ok", { status: 200 });

  const mpPaymentId = String(payload.data?.id ?? dataId ?? "");
  if (!mpPaymentId || mpPaymentId === "undefined") return new NextResponse("ok", { status: 200 });

  const mpEnv = getMPEnv();
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
    headers: { Authorization: `Bearer ${mpEnv.MP_ACCESS_TOKEN}` },
    cache: "no-store",
  });

  if (!mpRes.ok) {
    console.warn("[mp webhook] falha ao buscar pagamento MP", mpPaymentId, mpRes.status);
    return new NextResponse("ok", { status: 200 });
  }

  const mpPagamento = (await mpRes.json()) as MPPayment;
  const externalRef = mpPagamento.external_reference;
  const status = String(mpPagamento.status ?? "").toLowerCase();
  const metodo: "pix" | "credit_card" =
    mpPagamento.payment_type_id === "credit_card" ? "credit_card" : "pix";

  console.log("[mp webhook]", { mpPaymentId, externalRef, status, metodo, sigResult });

  if (!externalRef) {
    console.warn("[mp webhook] sem external_reference");
    return new NextResponse("ok", { status: 200 });
  }

  const supa = admin();

  const { data: pagamentos } = await supa
    .from("pagamentos")
    .select("id, carta_id, status, plano, owner_id")
    .eq("id", externalRef)
    .limit(1);

  const pagamento = pagamentos?.[0];
  if (!pagamento) {
    console.warn("[mp webhook] pagamento não encontrado", externalRef);
    return new NextResponse("ok", { status: 200 });
  }

  const isApproved = status === "approved";
  const isRefunded = status === "refunded" || status === "charged_back";
  const isRejected = status === "rejected" || status === "cancelled";

  if (isApproved && pagamento.status === "pending") {
    const agora = new Date();
    const expiraEm =
      pagamento.plano === "bilhete"
        ? new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const { data: updated } = await supa
      .from("pagamentos")
      .update({
        status: "approved",
        pago_em: agora.toISOString(),
        metodo,
        gateway_payment_id: String(mpPagamento.id ?? ""),
        payload_webhook: mpPagamento as unknown as Database["public"]["Tables"]["pagamentos"]["Row"]["payload_webhook"],
      })
      .eq("id", pagamento.id)
      .eq("status", "pending")
      .select("id");

    if (!updated?.length) return new NextResponse("ok", { status: 200 });

    await supa
      .from("cartas")
      .update({
        status: "publicada",
        publicada_em: agora.toISOString(),
        expira_em: expiraEm,
      })
      .eq("id", pagamento.carta_id);

    await notificarPublicacao(supa, pagamento.carta_id);
  } else if (isRefunded) {
    await supa.from("pagamentos").update({ status: "refunded" }).eq("id", pagamento.id);
    await supa.from("cartas").update({ status: "rascunho" }).eq("id", pagamento.carta_id);
  } else if (isRejected) {
    await supa.from("pagamentos").update({ status: "rejected" }).eq("id", pagamento.id);
  }

  return new NextResponse("ok", { status: 200 });
}
