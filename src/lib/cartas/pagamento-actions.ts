"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { conteudoCartaV1Schema } from "./schema";
import { criarPreferenciaMp, NOMES_PLANOS, PRECOS_CENTAVOS } from "@/lib/mp/client";
import { publicEnv, getServerEnv, getMPEnv } from "@/lib/env";
import { notificarPublicacao } from "@/lib/emails/notificar-publicacao";
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
    const dezMinAtras = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: pagamentosRecentes } = await supabase
      .from("pagamentos")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userData.user.id)
      .eq("status", "pending")
      .gte("criado_em", dezMinAtras);
    if ((pagamentosRecentes ?? 0) >= 5) {
      redirect(`/criar/${cartaId}/publicar?erro=rate_limit`);
    }

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

  getMPEnv(); // valida vars antes de criar registro
  const baseUrl = publicEnv.NEXT_PUBLIC_APP_URL;
  const titulo = NOMES_PLANOS[carta.plano];

  let preferencia;
  try {
    preferencia = await criarPreferenciaMp({
      pagamentoId,
      titulo,
      valorCentavos: valor,
      successUrl: `${baseUrl}/conta?pago=${cartaId}`,
      failureUrl: `${baseUrl}/criar/${cartaId}/publicar?erro=gateway`,
      pendingUrl: `${baseUrl}/criar/${cartaId}/publicar?pix=aguardando`,
      webhookUrl: `${baseUrl}/api/mp/webhook`,
      payerEmail: userData.user.email ?? undefined,
    });
  } catch (err) {
    console.error("[criarPagamentoAction] MP preference fail", err);
    await admin().from("pagamentos").update({ status: "rejected" }).eq("id", pagamentoId);
    redirect(`/criar/${cartaId}/publicar?erro=gateway`);
  }

  await admin()
    .from("pagamentos")
    .update({
      gateway_checkout_id: preferencia.id,
      gateway_meta: { url: preferencia.init_point, preference_id: preferencia.id },
    })
    .eq("id", pagamentoId);

  revalidatePath(`/criar/${cartaId}/publicar`);
  const checkoutUrl =
    process.env.NODE_ENV === "production"
      ? preferencia.init_point
      : preferencia.sandbox_init_point;
  redirect(checkoutUrl);
}

// DEV: cria pagamento aprovado + flipa carta sem chamar Mercado Pago.
export async function bypassPagamentoDevAction(formData: FormData): Promise<void> {
  if (process.env.NODE_ENV === "production") return;
  const cartaId = String(formData.get("cartaId") ?? "");
  if (!cartaId) return;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: carta } = await supabase
    .from("cartas")
    .select("id, slug, plano, status, owner_id")
    .eq("id", cartaId)
    .maybeSingle();
  if (!carta || carta.owner_id !== userData.user.id) redirect("/conta");
  if (carta.status === "publicada") redirect(`/${carta.slug}`);

  const valor = PRECOS_CENTAVOS[carta.plano];
  const agora = new Date();
  const expiraEm =
    carta.plano === "bilhete"
      ? new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const adm = admin();

  // Reaproveita pagamento pendente; senão cria approved direto.
  const { data: pendentes } = await supabase
    .from("pagamentos")
    .select("id")
    .eq("carta_id", cartaId)
    .eq("status", "pending")
    .limit(1);
  const pendenteId = pendentes?.[0]?.id;

  if (pendenteId) {
    await adm
      .from("pagamentos")
      .update({
        status: "approved",
        pago_em: agora.toISOString(),
        payload_webhook: { mock: true, source: "bypassPagamentoDevAction" },
      })
      .eq("id", pendenteId);
  } else {
    await adm.from("pagamentos").insert({
      carta_id: cartaId,
      owner_id: userData.user.id,
      plano: carta.plano,
      metodo: "pix",
      valor_centavos: valor,
      status: "approved",
      pago_em: agora.toISOString(),
      payload_webhook: { mock: true, source: "bypassPagamentoDevAction" },
    });
  }

  await adm
    .from("cartas")
    .update({
      status: "publicada",
      publicada_em: agora.toISOString(),
      expira_em: expiraEm,
    })
    .eq("id", cartaId);

  await notificarPublicacao(adm, cartaId);

  revalidatePath("/conta");
  revalidatePath(`/${carta.slug}`);
  redirect(`/${carta.slug}`);
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
