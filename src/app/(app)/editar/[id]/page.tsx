import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlanoPill, StatusPill } from "@/components/StatusPill";
import { conteudoCartaV1Schema } from "@/lib/cartas/schema";

export const metadata: Metadata = { title: "Editar carta — NossaCarta" };

type Params = Promise<{ id: string }>;

const dataFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export default async function EditarPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/login?next=/editar/${id}`);

  const { data: carta } = await supabase
    .from("cartas")
    .select(
      "id, slug, plano, status, conteudo, data_inicio_relacionamento, publicada_em, expira_em, owner_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (!carta || carta.owner_id !== userData.user.id) notFound();

  if (carta.status !== "publicada") {
    redirect(`/criar/${id}/nomes`);
  }

  const cParse = conteudoCartaV1Schema.safeParse(carta.conteudo);
  const nomes = cParse.success ? cParse.data.nomes : null;
  const titulo = nomes ? `${nomes.pessoa1} & ${nomes.pessoa2}` : "Carta";

  const { count: capsCount } = await supabase
    .from("capsulas")
    .select("id", { count: "exact", head: true })
    .eq("carta_id", id);

  const expirada = carta.expira_em && new Date(carta.expira_em) < new Date();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 md:py-20">
      <header className="border-b border-cocoa/12 pb-8">
        <Link
          href="/conta"
          className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55 underline-offset-4 hover:text-ruby hover:underline"
        >
          ← minha conta
        </Link>
        <p className="mt-4 font-script text-5xl text-ruby">{titulo}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <PlanoPill plano={carta.plano} />
          <StatusPill status={carta.status} />
          {carta.publicada_em && (
            <span className="font-prose text-[12px] italic text-mauve">
              publicada em {dataFmt.format(new Date(carta.publicada_em))}
            </span>
          )}
          {carta.expira_em && (
            <span className="font-prose text-[12px] italic text-mauve">
              {expirada ? "expirada em" : "expira em"} {dataFmt.format(new Date(carta.expira_em))}
            </span>
          )}
        </div>
      </header>

      <section className="mt-10 rounded-2xl border border-cocoa/12 bg-paper px-6 py-6 shadow-engrave">
        <h2 className="font-serif text-xl italic text-cocoa">Endereço da carta</h2>
        <p className="mt-2 font-prose text-[15px] text-cocoa">nossacarta.love/{carta.slug}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/${carta.slug}`}
            target="_blank"
            rel="noopener"
            className="rounded-full bg-ruby px-5 py-2 font-sans text-[11px] uppercase tracking-[0.22em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] hover:bg-ruby-deep"
          >
            Abrir carta →
          </Link>
        </div>
      </section>

      {carta.plano === "eterno" ? (
        <section className="mt-8 rounded-2xl border border-champagne-deep/30 bg-champagne-soft/20 px-6 py-6 shadow-engrave">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-xl italic text-cocoa">Cápsulas do tempo</h2>
            <Link
              href={`/editar/${id}/capsulas`}
              className="font-sans text-[11px] uppercase tracking-[0.22em] text-ruby underline-offset-4 hover:underline"
            >
              gerenciar →
            </Link>
          </div>
          <p className="mt-2 font-prose text-[14px] italic text-cocoa-soft">
            {capsCount && capsCount > 0
              ? `${capsCount} ${capsCount === 1 ? "cápsula selada" : "cápsulas seladas"} para abrir no tempo certo.`
              : "Nenhuma cápsula ainda. Escreva cartas para abrir em datas futuras."}
          </p>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-cocoa/15 bg-paper px-6 py-6">
          <p className="font-prose text-[14px] italic text-cocoa-soft">
            O plano Bilhete não permite cápsulas do tempo. Volte a publicar como Eterno para
            cartas seladas em datas futuras.
          </p>
        </section>
      )}
    </main>
  );
}
