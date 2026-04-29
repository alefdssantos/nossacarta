import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { conteudoCartaV1Schema } from "@/lib/cartas/schema";
import { enviarEmailPublicacao, enviarEmailParaDestinatario } from "./publicacao";

export async function notificarPublicacao(
  supa: SupabaseClient<Database>,
  cartaId: string,
): Promise<void> {
  const { data: carta } = await supa
    .from("cartas")
    .select("id, slug, plano, owner_id, conteudo, expira_em, destinatario_email, acesso_token")
    .eq("id", cartaId)
    .maybeSingle();

  if (!carta) return;

  const { data: perfil } = await supa
    .from("perfis")
    .select("email, nome")
    .eq("id", carta.owner_id)
    .maybeSingle();

  const email = perfil?.email;
  if (!email) {
    console.warn("[notificarPublicacao] sem email pra owner", { cartaId });
    return;
  }

  const cParse = conteudoCartaV1Schema.safeParse(carta.conteudo);
  const nomes = cParse.success ? cParse.data.nomes : null;
  if (!nomes) {
    console.warn("[notificarPublicacao] sem nomes na carta", { cartaId });
    return;
  }

  const emailDestinatario = carta.destinatario_email;

  try {
    const [resOwner, resDest] = await Promise.all([
      enviarEmailPublicacao({
        destinatarioEmail: email,
        pessoa1: nomes.pessoa1,
        pessoa2: nomes.pessoa2,
        slug: carta.slug,
        plano: carta.plano,
        expiraEm: carta.expira_em,
      }),
      emailDestinatario && emailDestinatario !== email
        ? enviarEmailParaDestinatario({
            destinatarioEmail: emailDestinatario,
            pessoa1: nomes.pessoa1,
            pessoa2: nomes.pessoa2,
            slug: carta.slug,
            acessoToken: carta.acesso_token,
          })
        : Promise.resolve(null),
    ]);
    console.log("[notificarPublicacao] emails enviados", {
      cartaId,
      owner: resOwner?.id,
      destinatario: resDest?.id ?? "mesmo ou ausente",
    });
  } catch (err) {
    console.error("[notificarPublicacao] fail", err);
  }
}
