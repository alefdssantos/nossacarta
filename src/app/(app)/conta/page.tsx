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
    .eq("owner_id", data.user.id)
    .order("atualizada_em", { ascending: false });

  const { data: pagamentos } = await supabase
    .from("pagamentos")
    .select("id, plano, valor_centavos, status, metodo, criado_em, pago_em, carta_id")
    .eq("owner_id", data.user.id)
    .order("criado_em", { ascending: false })
    .limit(10);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 md:py-20">
      <header className="border-b border-cocoa/12 pb-8">
        <p className="font-script text-5xl text-ruby">Bem-vindo</p>
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

      {pagamentos && pagamentos.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl italic text-cocoa">Pagamentos</h2>
          <ul className="mt-4 divide-y divide-cocoa/10 rounded-2xl border border-cocoa/12 bg-paper/85 shadow-engrave">
            {pagamentos.map((p) => {
              const data = p.pago_em ?? p.criado_em;
              const valor = (p.valor_centavos / 100).toFixed(2).replace(".", ",");
              const statusLabel: Record<string, string> = {
                approved: "aprovado",
                pending: "pendente",
                rejected: "rejeitado",
                refunded: "estornado",
                cancelled: "cancelado",
              };
              const statusClass: Record<string, string> = {
                approved: "border-ruby/40 bg-ruby/10 text-ruby-deep",
                pending: "border-champagne-deep/40 bg-champagne-soft/40 text-champagne-deep",
                rejected: "border-mauve/40 bg-mauve/10 text-mauve",
                refunded: "border-mauve/40 bg-mauve/10 text-mauve",
                cancelled: "border-mauve/40 bg-mauve/10 text-mauve",
              };
              return (
                <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-serif text-[16px] italic text-cocoa">
                      Plano {p.plano === "bilhete" ? "Bilhete" : "Eterno"}
                      <span className="ml-2 font-prose text-[13px] not-italic text-mauve">
                        R$ {valor}
                      </span>
                    </p>
                    <p className="mt-0.5 font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55">
                      {p.metodo === "pix" ? "Pix" : "Cartão"} ·{" "}
                      {dataFmt.format(new Date(data))}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.18em] ${
                      statusClass[p.status] ?? "border-cocoa/25 bg-paper text-cocoa/65"
                    }`}
                  >
                    {statusLabel[p.status] ?? p.status}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
