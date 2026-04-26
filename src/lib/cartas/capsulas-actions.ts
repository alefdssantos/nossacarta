"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  MAX_CAPSULAS_POR_CARTA,
  criarCapsulaInputSchema,
  removerCapsulaInputSchema,
} from "./schema";
import type { CapsulaActionState } from "./types";

async function requireOwnerEterno(cartaId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: carta } = await supabase
    .from("cartas")
    .select("id, slug, plano, status, owner_id")
    .eq("id", cartaId)
    .maybeSingle();

  if (!carta || carta.owner_id !== userData.user.id) {
    return null;
  }
  if (carta.plano !== "eterno") return null;
  return { supabase, user: userData.user, carta };
}

export async function criarCapsulaAction(
  _prev: CapsulaActionState,
  formData: FormData,
): Promise<CapsulaActionState> {
  const parsed = criarCapsulaInputSchema.safeParse({
    cartaId: formData.get("cartaId"),
    unlockEm: formData.get("unlockEm"),
    mensagem: formData.get("mensagem"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      status: "error",
      message: first?.message ?? "Verifique os campos.",
      field: first?.path[0]?.toString(),
    };
  }

  const { cartaId, unlockEm, mensagem } = parsed.data;
  const ctx = await requireOwnerEterno(cartaId);
  if (!ctx) {
    return { status: "error", message: "Cápsulas só estão disponíveis no plano Eterno." };
  }

  const { count } = await ctx.supabase
    .from("capsulas")
    .select("id", { count: "exact", head: true })
    .eq("carta_id", cartaId);

  if ((count ?? 0) >= MAX_CAPSULAS_POR_CARTA) {
    return {
      status: "error",
      message: `Limite de ${MAX_CAPSULAS_POR_CARTA} cápsulas por carta.`,
    };
  }

  const { error } = await ctx.supabase.from("capsulas").insert({
    carta_id: cartaId,
    unlock_em: unlockEm,
    mensagem,
  });

  if (error) {
    console.error("[criarCapsulaAction] fail", error);
    return { status: "error", message: `Não conseguimos salvar (${error.code ?? "?"}).` };
  }

  revalidatePath(`/editar/${cartaId}/capsulas`);
  revalidatePath(`/${ctx.carta.slug}`);
  return { status: "ok" };
}

export async function removerCapsulaAction(formData: FormData): Promise<void> {
  const parsed = removerCapsulaInputSchema.safeParse({
    cartaId: formData.get("cartaId"),
    capsulaId: formData.get("capsulaId"),
  });
  if (!parsed.success) return;

  const { cartaId, capsulaId } = parsed.data;
  const ctx = await requireOwnerEterno(cartaId);
  if (!ctx) return;

  await ctx.supabase.from("capsulas").delete().eq("id", capsulaId).eq("carta_id", cartaId);

  revalidatePath(`/editar/${cartaId}/capsulas`);
  revalidatePath(`/${ctx.carta.slug}`);
}
