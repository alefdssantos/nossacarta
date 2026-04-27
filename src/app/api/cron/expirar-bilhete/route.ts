import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { publicEnv, getServerEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel Cron — roda de hora em hora.
 * Marca cartas Bilhete com expira_em < now() como status='expirada'.
 *
 * Auth: header `Authorization: Bearer <CRON_SECRET>` enviado automaticamente pela Vercel
 * quando configurada via vercel.json + env CRON_SECRET. Em dev, qualquer chamada
 * passa (sem CRON_SECRET configurado).
 */
export async function GET(request: NextRequest) {
  const env = getServerEnv();
  const auth = request.headers.get("authorization") ?? "";

  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const supa = createSupabaseAdmin<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const agoraIso = new Date().toISOString();

  const { data: expiradas, error } = await supa
    .from("cartas")
    .update({ status: "expirada" })
    .eq("plano", "bilhete")
    .eq("status", "publicada")
    .lt("expira_em", agoraIso)
    .select("id, slug");

  if (error) {
    console.error("[cron expirar-bilhete] update fail", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const count = expiradas?.length ?? 0;
  if (count > 0) {
    console.log("[cron expirar-bilhete]", { count, slugs: expiradas?.map((c) => c.slug) });
  }

  return NextResponse.json({ ok: true, expiradas: count });
}
