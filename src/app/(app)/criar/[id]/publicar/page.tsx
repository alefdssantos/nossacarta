import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { conteudoCartaV1Schema } from "@/lib/cartas/schema";
import { Stepper } from "@/components/Stepper";
import { PlanoPill } from "@/components/StatusPill";
import { wizardSteps } from "@/app/(app)/criar/page";
import { publicarCartaAction } from "@/lib/cartas/actions";

export const metadata: Metadata = {
  title: "Publicar carta — NossaCarta",
};

type Params = Promise<{ id: string }>;

export default async function PublicarPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/login?next=/criar/${id}/publicar`);

  const { data: carta } = await supabase
    .from("cartas")
    .select(
      "id, slug, plano, status, conteudo, data_inicio_relacionamento, spotify_track_id, owner_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (!carta || carta.owner_id !== userData.user.id) notFound();
  if (carta.status === "publicada") redirect(`/${carta.slug}`);

  const { count: fotosCount } = await supabase
    .from("media")
    .select("id", { count: "exact", head: true })
    .eq("carta_id", id);

  const cParse = conteudoCartaV1Schema.safeParse(carta.conteudo);
  const conteudo = cParse.success ? cParse.data : null;

  const checks: Array<{ ok: boolean; label: string; href?: string }> = [
    {
      ok: !carta.slug.startsWith("rascunho-") && Boolean(conteudo?.nomes) && Boolean(carta.data_inicio_relacionamento),
      label: "Nomes, data e endereço",
      href: `/criar/${id}/nomes`,
    },
    {
      ok: Boolean(conteudo?.declaracao && conteudo.declaracao.length >= 20),
      label: "Declaração (mín. 20 caracteres)",
      href: `/criar/${id}/declaracao`,
    },
    {
      ok: (fotosCount ?? 0) >= 1,
      label: "Pelo menos 1 foto",
      href: `/criar/${id}/fotos`,
    },
  ];
  const tudoOk = checks.every((c) => c.ok);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 md:py-16">
      <Stepper steps={wizardSteps} current={5} />

      <header className="mt-10">
        <div className="flex items-center gap-3">
          <PlanoPill plano={carta.plano} />
          <Link
            href={`/criar/${id}/musica`}
            className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55 underline-offset-4 hover:text-ruby hover:underline"
          >
            ← voltar
          </Link>
        </div>
        <p className="mt-5 font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
          Etapa 6 — última
        </p>
        <p className="mt-2 font-script text-5xl text-ruby">Selar a carta</p>
        <p className="mt-3 font-prose text-[15px] italic leading-relaxed text-cocoa-soft">
          {carta.plano === "bilhete"
            ? "O Bilhete fica disponível por 7 dias após a publicação."
            : "O plano Eterno é vitalício — não expira."}
        </p>
      </header>

      <section className="mt-10 rounded-2xl border border-cocoa/12 bg-paper px-6 py-6 shadow-engrave">
        <h2 className="font-serif text-xl italic text-cocoa">Antes de publicar</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                  c.ok
                    ? "border-ruby bg-ruby text-rose-mist"
                    : "border-cocoa/30 bg-paper text-cocoa/40"
                }`}
                aria-hidden
              >
                {c.ok ? "✓" : "·"}
              </span>
              <span className="flex-1 font-prose text-[14px] text-cocoa">{c.label}</span>
              {!c.ok && c.href && (
                <Link
                  href={c.href}
                  className="font-sans text-[10px] uppercase tracking-[0.22em] text-ruby underline-offset-4 hover:underline"
                >
                  resolver →
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-cocoa/10 pt-5 font-prose text-[13px] text-cocoa-soft">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-mauve">Endereço</p>
            <p className="mt-1 font-serif italic text-cocoa">
              nossacarta.love/{carta.slug.startsWith("rascunho-") ? "—" : carta.slug}
            </p>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-mauve">Plano</p>
            <p className="mt-1 font-serif italic text-cocoa capitalize">{carta.plano}</p>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-mauve">Fotos</p>
            <p className="mt-1 font-serif italic text-cocoa">{fotosCount ?? 0}</p>
          </div>
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-mauve">Música</p>
            <p className="mt-1 font-serif italic text-cocoa">
              {carta.spotify_track_id ? "selecionada" : "sem música"}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        {tudoOk ? (
          <form action={publicarCartaAction} className="flex flex-col items-center gap-3">
            <input type="hidden" name="cartaId" value={id} />
            <button
              type="submit"
              className="rounded-full bg-ruby px-9 py-3.5 font-sans text-[12px] uppercase tracking-[0.28em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] hover:bg-ruby-deep"
            >
              Publicar carta →
            </button>
            <p className="font-prose text-[12px] italic text-mauve">
              Em breve: pagamento via Mercado Pago. Por agora, publicação é direta para teste.
            </p>
          </form>
        ) : (
          <p className="rounded-xl border border-champagne-deep/40 bg-champagne-soft/30 px-5 py-4 text-center font-prose text-sm italic text-cocoa-soft">
            Complete os itens acima antes de publicar.
          </p>
        )}
      </section>
    </main>
  );
}
