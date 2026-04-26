import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlanoPill, StatusPill } from "@/components/StatusPill";
import { conteudoCartaV1Schema } from "@/lib/cartas/schema";

export const metadata: Metadata = {
  title: "Sua conta — NossaCarta",
};

const dataFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export default async function ContaPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=/conta");

  const { data: cartas } = await supabase
    .from("cartas")
    .select("id, slug, plano, status, criada_em, atualizada_em, expira_em, conteudo")
    .order("atualizada_em", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 md:py-20">
      <header className="border-b border-cocoa/12 pb-8">
        <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
          Sua conta
        </p>
        <p className="mt-2 font-script text-5xl text-ruby">Bem-vindo</p>
        <p className="mt-2 font-prose text-[14px] italic text-mauve">{data.user.email}</p>
      </header>

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-2xl italic text-cocoa">Suas cartas</h2>
          <Link
            href="/criar"
            className="rounded-full bg-ruby px-5 py-2 font-sans text-[11px] uppercase tracking-[0.22em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] transition hover:bg-ruby-deep"
          >
            + Nova carta
          </Link>
        </div>

        {!cartas || cartas.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-cocoa/25 bg-paper/60 px-6 py-14 text-center">
            <p className="font-script text-3xl text-ruby">Sua primeira carta</p>
            <p className="mt-3 font-prose text-[14px] italic text-cocoa-soft">
              Você ainda não escreveu nenhuma. Comece quando quiser.
            </p>
            <Link
              href="/criar"
              className="mt-6 inline-flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.22em] text-ruby underline-offset-4 hover:underline"
            >
              Começar agora <span aria-hidden>→</span>
            </Link>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {cartas.map((c) => {
              const conteudoParse = conteudoCartaV1Schema.safeParse(c.conteudo);
              const nomes = conteudoParse.success ? conteudoParse.data.nomes : undefined;
              const titulo = nomes ? `${nomes.pessoa1} & ${nomes.pessoa2}` : "Carta sem nomes";
              const isRascunho = c.status === "rascunho";
              const href = isRascunho ? `/criar/${c.id}/nomes` : `/editar/${c.id}`;

              return (
                <li key={c.id}>
                  <Link
                    href={href}
                    className="group flex h-full flex-col justify-between gap-5 rounded-2xl border border-cocoa/12 bg-paper/85 p-5 shadow-engrave transition hover:border-ruby/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <PlanoPill plano={c.plano} />
                        <StatusPill status={c.status} />
                      </div>
                      <p className="mt-4 font-serif text-[22px] italic text-cocoa">{titulo}</p>
                      <p className="mt-1 font-prose text-[12px] italic text-mauve">
                        nossacarta.love/{c.slug.startsWith("rascunho-") ? "—" : c.slug}
                      </p>
                    </div>
                    <div className="flex items-center justify-between font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55">
                      <span>Atualizada {dataFmt.format(new Date(c.atualizada_em))}</span>
                      <span className="text-ruby transition group-hover:translate-x-0.5">
                        {isRascunho ? "continuar →" : "abrir →"}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
