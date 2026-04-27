"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { conteudoCartaV1Schema } from "./schema";
import { criarCheckoutAbacate, simularPixAbacate, NOMES_PLANOS, PRECOS_CENTAVOS } from "@/lib/abacate/client";
import { publicEnv, getServerEnv, getAbacateEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

function admin() {
  const env = getServerEnv();
  return createSupabaseAdmin<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
}

export async function criarPagamentoAction(formData: FormData): Promise<void> {
  const cartaId = String(formData.get("cartaId") ?? "");
  if (!cartaId) redirect("/conta");

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: carta } = await supabase
    .from("cartas")
    .select("id, slug, plano, status, conteudo, data_inicio_relacionamento, owner_id")
    .eq("id", cartaId)
    .maybeSingle();
  if (!carta || carta.owner_id !== userData.user.id) redirect("/conta");

  if (carta.status === "publicada") redirect(`/${carta.slug}`);
  if (carta.slug.startsWith("rascunho-")) redirect(`/criar/${cartaId}/nomes`);
  if (!carta.data_inicio_relacionamento) redirect(`/criar/${cartaId}/nomes`);

  const cParse = conteudoCartaV1Schema.safeParse(carta.conteudo);
  if (!cParse.success || !cParse.data.nomes || !cParse.data.declaracao) {
    redirect(`/criar/${cartaId}/declaracao`);
  }

  const valor = PRECOS_CENTAVOS[carta.plano];

  // Reaproveita pagamento pendente existente (idempotência).
  const { data: pendente } = await supabase
    .from("pagamentos")
    .select("id, gateway_payment_id, status")
    .eq("carta_id", cartaId)
    .eq("status", "pending")
    .order("criado_em", { ascending: false })
    .limit(1);

  let pagamentoId = pendente?.[0]?.id ?? null;
  if (!pagamentoId) {
    const { data: novo, error: insertErr } = await supabase
      .from("pagamentos")
      .insert({
        carta_id: cartaId,
        owner_id: userData.user.id,
        plano: carta.plano,
        metodo: "pix",
        valor_centavos: valor,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertErr || !novo) {
      console.error("[criarPagamentoAction] insert pagamento", insertErr);
      redirect(`/criar/${cartaId}/publicar?erro=db`);
    }
    pagamentoId = novo.id;
  }

  await supabase
    .from("cartas")
    .update({ status: "aguardando_pagamento" })
    .eq("id", cartaId);

  // Checkout Abacate: cliente preenche CPF/celular no fluxo deles, cartão 12x + Pix.
  const abacateEnv = getAbacateEnv();
  const productId =
    carta.plano === "bilhete"
      ? abacateEnv.ABACATEPAY_PRODUCT_BILHETE
      : abacateEnv.ABACATEPAY_PRODUCT_ETERNO;
  const baseUrl = publicEnv.NEXT_PUBLIC_APP_URL;

  let checkout;
  try {
    checkout = await criarCheckoutAbacate({
      productId,
      externalId: pagamentoId,
      returnUrl: `${baseUrl}/criar/${cartaId}/publicar`,
      completionUrl: `${baseUrl}/conta?pago=${cartaId}`,
      customerEmail: userData.user.email ?? undefined,
      metadata: {
        cartaId,
        pagamentoId,
        plano: carta.plano,
      },
    });
  } catch (err) {
    console.error("[criarPagamentoAction] abacate checkout fail", err);
    await admin().from("pagamentos").update({ status: "rejected" }).eq("id", pagamentoId);
    redirect(`/criar/${cartaId}/publicar?erro=gateway`);
  }

  await admin()
    .from("pagamentos")
    .update({
      gateway_checkout_id: checkout.id,
      gateway_meta: { url: checkout.url },
    })
    .eq("id", pagamentoId);

  revalidatePath(`/criar/${cartaId}/publicar`);
  redirect(checkout.url);
}

// Apenas em dev: marca pagamento como aprovado direto, simulando chegada de webhook.
// Bypass o gateway externo pra debug local. Em prod, jamais executa.
export async function simularPagamentoAction(formData: FormData): Promise<void> {
  if (process.env.NODE_ENV === "production") return;
  const cartaId = String(formData.get("cartaId") ?? "");
  const pagamentoId = String(formData.get("pagamentoId") ?? "");
  if (!cartaId || !pagamentoId) return;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data: pagamento } = await supabase
    .from("pagamentos")
    .select("id, carta_id, plano, owner_id, status")
    .eq("id", pagamentoId)
    .maybeSingle();

  if (!pagamento || pagamento.owner_id !== userData.user.id) return;
  if (pagamento.status === "approved") return;

  // Tentativa real via API (pode falhar se SDK incompatível) — mantém pra ver logs
  try {
    const { data: pagamentoFull } = await supabase
      .from("pagamentos")
      .select("gateway_payment_id")
      .eq("id", pagamentoId)
      .maybeSingle();
    if (pagamentoFull?.gateway_payment_id) {
      await simularPixAbacate(pagamentoFull.gateway_payment_id);
    }
  } catch (err) {
    console.warn("[simularPagamentoAction] API simulate fail (ok em dev)", String(err).slice(0, 120));
  }

  // Aplica status localmente (mock do webhook aprovado).
  const agora = new Date();
  const expiraEm =
    pagamento.plano === "bilhete"
      ? new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null;

  await admin()
    .from("pagamentos")
    .update({
      status: "approved",
      pago_em: agora.toISOString(),
      payload_webhook: { mock: true, source: "simularPagamentoAction" },
    })
    .eq("id", pagamento.id);

  await admin()
    .from("cartas")
    .update({
      status: "publicada",
      publicada_em: agora.toISOString(),
      expira_em: expiraEm,
    })
    .eq("id", pagamento.carta_id);

  revalidatePath(`/criar/${cartaId}/pagamento`);
}
