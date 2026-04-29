import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

const BUCKET = "carta-fotos";
const DEFAULT_TTL_SECONDS = 60 * 60;

export async function getSignedFotoUrl(
  storagePath: string,
  expiresIn: number = DEFAULT_TTL_SECONDS,
): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function getSignedFotoUrls(
  storagePaths: string[],
  expiresIn: number = DEFAULT_TTL_SECONDS,
): Promise<Map<string, string>> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrls(storagePaths, expiresIn);
  if (error) throw error;
  const map = new Map<string, string>();
  for (const item of data) {
    if (item.signedUrl && item.path) map.set(item.path, item.signedUrl);
  }
  return map;
}
