"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import {
  MAX_FOTO_BYTES,
  MAX_MARCOS_POR_CARTA,
  MIME_FOTO_PERMITIDOS,
  criarMarcoInputSchema,
  removerMarcoInputSchema,
} from "./schema";
import type { MarcoActionState } from "./types";
import { publicEnv, getServerEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

const BUCKET = "carta-fotos";

function adminClient() {
  const env = getServerEnv();
  return createSupabaseAdmin<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
}

function extDeMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

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

  // Upload de foto opcional pro bucket carta-fotos.
  let fotoPath: string | null = null;
  const arquivo = formData.get("foto");
  if (arquivo instanceof File && arquivo.size > 0) {
    if (arquivo.size > MAX_FOTO_BYTES) {
      return { status: "error", message: "Foto maior que 5 MB.", field: "foto" };
    }
    if (!MIME_FOTO_PERMITIDOS.includes(arquivo.type as (typeof MIME_FOTO_PERMITIDOS)[number])) {
      return { status: "error", message: "Use JPG, PNG ou WebP.", field: "foto" };
    }
    const filename = `marco-${crypto.randomUUID()}.${extDeMime(arquivo.type)}`;
    const path = `${cartaId}/${filename}`;
    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const { error: uploadErr } = await adminClient()
      .storage.from(BUCKET)
      .upload(path, buffer, {
        contentType: arquivo.type,
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadErr) {
      console.error("[criarMarcoAction] upload fail", uploadErr);
      return { status: "error", message: "Não conseguimos subir a foto.", field: "foto" };
    }
    fotoPath = path;
  }

  const { error } = await ctx.supabase.from("marcos").insert({
    carta_id: cartaId,
    data,
    titulo,
    descricao: descricao || null,
    foto_path: fotoPath,
  });
  if (error) {
    if (fotoPath) await adminClient().storage.from(BUCKET).remove([fotoPath]);
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

  // Pega foto_path antes de deletar pra remover do storage.
  const { data: marco } = await ctx.supabase
    .from("marcos")
    .select("foto_path")
    .eq("id", marcoId)
    .eq("carta_id", cartaId)
    .maybeSingle();

  await ctx.supabase.from("marcos").delete().eq("id", marcoId).eq("carta_id", cartaId);

  if (marco?.foto_path) {
    await adminClient().storage.from(BUCKET).remove([marco.foto_path]);
  }

  revalidatePath(`/editar/${cartaId}/marcos`);
  revalidatePath(`/${ctx.carta.slug}`);
}
