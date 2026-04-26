"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  atualizarDeclaracaoTemaInputSchema,
  atualizarNomesInputSchema,
  conteudoCartaV1Schema,
  conteudoVazioV1,
  criarCartaInputSchema,
} from "./schema";
import { slugValido } from "./slug";
import type { ActionState } from "./types";

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login?next=/criar");
  }
  return { supabase, user: data.user };
}

export async function criarCartaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = criarCartaInputSchema.safeParse({ plano: formData.get("plano") });
  if (!parsed.success) {
    return { status: "error", message: "Plano inválido.", field: "plano" };
  }

  const { supabase, user } = await requireUser();
  const slug = `rascunho-${crypto.randomUUID().slice(0, 8)}`;
  const { data, error } = await supabase
    .from("cartas")
    .insert({
      owner_id: user.id,
      plano: parsed.data.plano,
      slug,
      status: "rascunho",
      conteudo: conteudoVazioV1,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Não conseguimos criar sua carta. Tente de novo." };
  }

  redirect(`/criar/${data.id}/nomes`);
}

async function slugDisponivel(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  excluirCartaId: string,
): Promise<boolean> {
  const [{ data: reservada }, { data: existente }] = await Promise.all([
    supabase.from("slugs_reservados").select("slug").eq("slug", slug).maybeSingle(),
    supabase.from("cartas").select("id").eq("slug", slug).neq("id", excluirCartaId).maybeSingle(),
  ]);
  return !reservada && !existente;
}

export async function atualizarNomesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = atualizarNomesInputSchema.safeParse({
    cartaId: formData.get("cartaId"),
    pessoa1: formData.get("pessoa1"),
    pessoa2: formData.get("pessoa2"),
    dataInicio: formData.get("dataInicio"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      status: "error",
      message: first?.message ?? "Verifique os campos.",
      field: first?.path[0]?.toString(),
    };
  }

  const { cartaId, pessoa1, pessoa2, dataInicio, slug } = parsed.data;
  const { supabase, user } = await requireUser();

  if (!slugValido(slug)) {
    return { status: "error", message: "Endereço inválido.", field: "slug" };
  }

  const livre = await slugDisponivel(supabase, slug, cartaId);
  if (!livre) {
    return { status: "error", message: "Esse endereço já está em uso.", field: "slug" };
  }

  const { data: cartaAtual, error: errFetch } = await supabase
    .from("cartas")
    .select("conteudo, owner_id")
    .eq("id", cartaId)
    .maybeSingle();

  if (errFetch || !cartaAtual || cartaAtual.owner_id !== user.id) {
    return { status: "error", message: "Carta não encontrada." };
  }

  const conteudoAtual = conteudoCartaV1Schema.safeParse(cartaAtual.conteudo);
  const conteudo = {
    ...(conteudoAtual.success ? conteudoAtual.data : conteudoVazioV1),
    nomes: { pessoa1, pessoa2 },
  };

  const { error: errUpdate } = await supabase
    .from("cartas")
    .update({
      slug,
      data_inicio_relacionamento: dataInicio,
      conteudo,
    })
    .eq("id", cartaId);

  if (errUpdate) {
    console.error("[atualizarNomesAction] update fail", {
      code: errUpdate.code,
      message: errUpdate.message,
      details: errUpdate.details,
      hint: errUpdate.hint,
    });
    if (errUpdate.code === "23505") {
      return { status: "error", message: "Esse endereço já está em uso.", field: "slug" };
    }
    if (errUpdate.code === "23514") {
      return { status: "error", message: "Endereço reservado, escolha outro.", field: "slug" };
    }
    return { status: "error", message: `Não conseguimos salvar (${errUpdate.code ?? "?"}).` };
  }

  revalidatePath(`/criar/${cartaId}`, "layout");
  redirect(`/criar/${cartaId}/declaracao`);
}

export async function atualizarDeclaracaoTemaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = atualizarDeclaracaoTemaInputSchema.safeParse({
    cartaId: formData.get("cartaId"),
    declaracao: formData.get("declaracao"),
    tema: formData.get("tema"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      status: "error",
      message: first?.message ?? "Verifique os campos.",
      field: first?.path[0]?.toString(),
    };
  }

  const { cartaId, declaracao, tema } = parsed.data;
  const { supabase, user } = await requireUser();

  const { data: cartaAtual, error: errFetch } = await supabase
    .from("cartas")
    .select("conteudo, owner_id")
    .eq("id", cartaId)
    .maybeSingle();

  if (errFetch || !cartaAtual || cartaAtual.owner_id !== user.id) {
    return { status: "error", message: "Carta não encontrada." };
  }

  const conteudoAtual = conteudoCartaV1Schema.safeParse(cartaAtual.conteudo);
  const conteudo = {
    ...(conteudoAtual.success ? conteudoAtual.data : conteudoVazioV1),
    declaracao,
    tema,
  };

  const { error: errUpdate } = await supabase
    .from("cartas")
    .update({ conteudo })
    .eq("id", cartaId);

  if (errUpdate) {
    console.error("[atualizarDeclaracaoTemaAction] update fail", {
      code: errUpdate.code,
      message: errUpdate.message,
    });
    return { status: "error", message: `Não conseguimos salvar (${errUpdate.code ?? "?"}).` };
  }

  revalidatePath(`/criar/${cartaId}`, "layout");
  redirect(`/conta`);
}
