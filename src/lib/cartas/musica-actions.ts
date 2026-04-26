"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { searchTracks } from "@/lib/spotify/api";
import type { BuscarState } from "./types";

const buscarSchema = z.object({
  q: z.string().min(1).max(100).trim(),
});

const salvarSchema = z.object({
  cartaId: z.uuid(),
  trackId: z
    .string()
    .regex(/^[a-zA-Z0-9]{22}$/, "ID inválido.")
    .or(z.literal("")),
});

export async function buscarTracksAction(
  _prev: BuscarState,
  formData: FormData,
): Promise<BuscarState> {
  const parsed = buscarSchema.safeParse({ q: formData.get("q") });
  if (!parsed.success) {
    return { status: "error", message: "Digite o nome da música." };
  }
  const results = await searchTracks(parsed.data.q, 8);
  return { status: "ok", results, query: parsed.data.q };
}

export async function salvarSpotifyAction(formData: FormData): Promise<void> {
  const parsed = salvarSchema.safeParse({
    cartaId: formData.get("cartaId"),
    trackId: formData.get("trackId") ?? "",
  });
  if (!parsed.success) {
    redirect("/conta");
  }
  const { cartaId, trackId } = parsed.data;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: carta } = await supabase
    .from("cartas")
    .select("id, owner_id, status")
    .eq("id", cartaId)
    .maybeSingle();
  if (!carta || carta.owner_id !== userData.user.id) redirect("/conta");
  if (carta.status === "publicada") redirect("/conta");

  await supabase
    .from("cartas")
    .update({ spotify_track_id: trackId === "" ? null : trackId })
    .eq("id", cartaId);

  revalidatePath(`/criar/${cartaId}`, "layout");
  redirect(`/criar/${cartaId}/publicar`);
}
