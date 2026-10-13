import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";

export const CACHE_QR = "private, no-store";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/;

export function respostaQr(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: { "Cache-Control": CACHE_QR },
  });
}

function podeVer(user: User, ownerId: string, destinatario: string | null): boolean {
  if (user.id === ownerId) return true;
  const email = user.email?.trim().toLowerCase();
  const dest = destinatario?.trim().toLowerCase();
  return Boolean(email && dest && email === dest);
}

export type CartaQr = {
  acessoToken: string;
  conteudo: unknown;
};

// Sem sessao valida, nao consulta acesso_token.
export async function cartaParaQr(
  request: NextRequest,
  slug: string,
): Promise<{ ok: false; response: Response } | { ok: true; carta: CartaQr }> {
  if (!SLUG_RE.test(slug)) {
    return { ok: false, response: respostaQr(400, "invalid slug") };
  }

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    },
  );
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false, response: respostaQr(404, "not found") };

  const admin = createAdminClient();
  const { data } = await admin
    .from("cartas")
    .select("acesso_token, conteudo, owner_id, destinatario_email")
    .eq("slug", slug)
    .eq("status", "publicada")
    .maybeSingle();

  if (!data || !podeVer(user, data.owner_id, data.destinatario_email)) {
    return { ok: false, response: respostaQr(404, "not found") };
  }

  return {
    ok: true,
    carta: { acessoToken: data.acesso_token, conteudo: data.conteudo },
  };
}
