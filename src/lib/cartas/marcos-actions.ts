"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  MAX_MARCOS_POR_CARTA,
  criarMarcoInputSchema,
  removerMarcoInputSchema,
} from "./schema";
import type { MarcoActionState } from "./types";

async function requireOwnerEterno(cartaId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: carta } = await supabase
    .from("cartas")
    .select("id, slug, plano, owner_id")
    .eq("id", cartaId)
    .maybeSingle();
  if (!carta || carta.owner_id !== userData.user.id) return null;
  if (carta.plano !== "eterno") return null;
  return { supabase, user: userData.user, carta };
}

export async function criarMarcoAction(
  _prev: MarcoActionState,
  formData: FormData,
): Promise<MarcoActionState> {
  const parsed = criarMarcoInputSchema.safeParse({
    cartaId: formData.get("cartaId"),
    data: formData.get("data"),
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao") || undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      status: "error",
      message: first?.message ?? "Verifique os campos.",
      field: first?.path[0]?.toString(),
    };
  }

  const { cartaId, data, titulo, descricao } = parsed.data;
  const ctx = await requireOwnerEterno(cartaId);
  if (!ctx) {
    return { status: "error", message: "Marcos só estão disponíveis no plano Eterno." };
  }

  const { count } = await ctx.supabase
    .from("marcos")
    .select("id", { count: "exact", head: true })
    .eq("carta_id", cartaId);
  if ((count ?? 0) >= MAX_MARCOS_POR_CARTA) {
    return { status: "error", message: `Limite de ${MAX_MARCOS_POR_CARTA} marcos por carta.` };
  }

  const { error } = await ctx.supabase.from("marcos").insert({
    carta_id: cartaId,
    data,
    titulo,
    descricao: descricao || null,
  });
  if (error) {
    console.error("[criarMarcoAction]", error);
    return { status: "error", message: `Não conseguimos salvar (${error.code ?? "?"}).` };
  }

  revalidatePath(`/editar/${cartaId}/marcos`);
  revalidatePath(`/${ctx.carta.slug}`);
  return { status: "ok" };
}

export async function removerMarcoAction(formData: FormData): Promise<void> {
  const parsed = removerMarcoInputSchema.safeParse({
    cartaId: formData.get("cartaId"),
    marcoId: formData.get("marcoId"),
  });
  if (!parsed.success) return;

  const { cartaId, marcoId } = parsed.data;
  const ctx = await requireOwnerEterno(cartaId);
  if (!ctx) return;

  await ctx.supabase.from("marcos").delete().eq("id", marcoId).eq("carta_id", cartaId);
  revalidatePath(`/editar/${cartaId}/marcos`);
  revalidatePath(`/${ctx.carta.slug}`);
}
