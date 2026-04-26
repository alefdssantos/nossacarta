"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { publicEnv, getServerEnv } from "@/lib/env";
import {
  MAX_FOTOS_BILHETE,
  MAX_FOTO_BYTES,
  MIME_FOTO_PERMITIDOS,
  reordenarMediaInputSchema,
} from "./schema";
import type { MediaActionState } from "./types";
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

async function requireOwner(cartaId: string) {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");
  const { data: carta } = await supabase
    .from("cartas")
    .select("id, owner_id, plano, status")
    .eq("id", cartaId)
    .maybeSingle();
  if (!carta || carta.owner_id !== userData.user.id) {
    throw new Error("Carta não encontrada.");
  }
  return { user: userData.user, carta, supabase };
}

function extDeMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

export async function uploadMediaAction(
  _prev: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const cartaId = formData.get("cartaId");
  const file = formData.get("foto");

  if (typeof cartaId !== "string" || !cartaId) {
    return { status: "error", message: "Carta inválida." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Selecione uma foto." };
  }
  if (file.size > MAX_FOTO_BYTES) {
    return { status: "error", message: "Foto maior que 5 MB." };
  }
  if (!MIME_FOTO_PERMITIDOS.includes(file.type as (typeof MIME_FOTO_PERMITIDOS)[number])) {
    return { status: "error", message: "Use JPG, PNG ou WebP." };
  }

  let owner;
  try {
    owner = await requireOwner(cartaId);
  } catch {
    return { status: "error", message: "Carta não encontrada." };
  }

  if (owner.carta.status === "publicada") {
    return { status: "error", message: "Carta já publicada." };
  }

  const { count } = await owner.supabase
    .from("media")
    .select("id", { count: "exact", head: true })
    .eq("carta_id", cartaId);

  if (owner.carta.plano === "bilhete" && (count ?? 0) >= MAX_FOTOS_BILHETE) {
    return { status: "error", message: `Plano Bilhete: máximo ${MAX_FOTOS_BILHETE} fotos.` };
  }

  const ext = extDeMime(file.type);
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${cartaId}/${filename}`;

  const admin = adminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadErr) {
    console.error("[uploadMediaAction] storage upload fail", uploadErr);
    return { status: "error", message: "Não conseguimos subir a foto. Tente novamente." };
  }

  const { error: insertErr } = await owner.supabase.from("media").insert({
    carta_id: cartaId,
    storage_path: path,
    ordem: count ?? 0,
    bytes: file.size,
  });

  if (insertErr) {
    console.error("[uploadMediaAction] insert media fail", insertErr);
    await admin.storage.from(BUCKET).remove([path]);
    return { status: "error", message: "Erro ao registrar a foto." };
  }

  revalidatePath(`/criar/${cartaId}/fotos`);
  return { status: "ok" };
}

export async function removerMediaAction(formData: FormData): Promise<void> {
  const cartaId = String(formData.get("cartaId") ?? "");
  const mediaId = String(formData.get("mediaId") ?? "");
  if (!cartaId || !mediaId) return;

  let owner;
  try {
    owner = await requireOwner(cartaId);
  } catch {
    return;
  }
  if (owner.carta.status === "publicada") return;

  const { data: media } = await owner.supabase
    .from("media")
    .select("id, storage_path, carta_id")
    .eq("id", mediaId)
    .maybeSingle();

  if (!media || media.carta_id !== cartaId) return;

  const admin = adminClient();
  await admin.storage.from(BUCKET).remove([media.storage_path]);
  await owner.supabase.from("media").delete().eq("id", mediaId);

  revalidatePath(`/criar/${cartaId}/fotos`);
}

export async function reordenarMediaAction(formData: FormData): Promise<void> {
  const raw = {
    cartaId: formData.get("cartaId"),
    mediaIds: formData.getAll("mediaIds"),
  };
  const parsed = reordenarMediaInputSchema.safeParse(raw);
  if (!parsed.success) return;

  const { cartaId, mediaIds } = parsed.data;
  let owner;
  try {
    owner = await requireOwner(cartaId);
  } catch {
    return;
  }
  if (owner.carta.status === "publicada") return;

  await Promise.all(
    mediaIds.map((id, idx) =>
      owner.supabase.from("media").update({ ordem: idx }).eq("id", id).eq("carta_id", cartaId),
    ),
  );

  revalidatePath(`/criar/${cartaId}/fotos`);
}
