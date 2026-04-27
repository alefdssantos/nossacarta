import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MAX_CAPSULAS_POR_CARTA } from "@/lib/cartas/schema";
import { X } from "lucide-react";
import { removerCapsulaAction } from "@/lib/cartas/capsulas-actions";
import { CapsulaForm } from "./CapsulaForm";

export const metadata: Metadata = { title: "Cápsulas — NossaCarta" };

type Params = Promise<{ id: string }>;

const dataHoraFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function CapsulasPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/login?next=/editar/${id}/capsulas`);

  const { data: carta } = await supabase
    .from("cartas")
    .select("id, slug, plano, status, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (!carta || carta.owner_id !== userData.user.id) notFound();
  if (carta.plano !== "eterno") {
    redirect(`/editar/${id}`);
  }

  const { data: capsulas } = await supabase
    .from("capsulas")
    .select("id, unlock_em, mensagem, aberta_em")
    .eq("carta_id", id)
    .order("unlock_em", { ascending: true });

  const lista = capsulas ?? [];
  const cheio = lista.length >= MAX_CAPSULAS_POR_CARTA;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 md:py-20">
      <header className="border-b border-cocoa/12 pb-8">
        <Link
          href={`/editar/${id}`}
          className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55 underline-offset-4 hover:text-ruby hover:underline"
        >
          ← carta
        </Link>
        <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
          Cápsulas do tempo
        </p>
        <p className="mt-2 font-script text-5xl text-ruby">Cartas seladas</p>
        <p className="mt-3 font-prose text-[15px] italic leading-relaxed text-cocoa-soft">
          Escreva mensagens que só serão lidas em datas que você escolher. Use para
          aniversários, marcos do casamento, ou cartas para o futuro.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-serif text-xl italic text-cocoa">
          {lista.length} de {MAX_CAPSULAS_POR_CARTA}
        </h2>

        {lista.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-cocoa/25 bg-paper/60 px-6 py-10 text-center font-prose text-[14px] italic text-cocoa-soft">
            Nenhuma cápsula criada. Comece pela primeira abaixo.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {lista.map((c) => {
              const aberta = new Date(c.unlock_em) <= new Date();
              const preview = c.mensagem.length > 100 ? c.mensagem.slice(0, 100) + "…" : c.mensagem;
              return (
                <li
                  key={c.id}
                  className="rounded-xl border border-cocoa/12 bg-paper px-5 py-4 shadow-engrave"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-mauve">
                        {aberta ? "abre desde" : "abre em"} {dataHoraFmt.format(new Date(c.unlock_em))}
                      </p>
                      <p className="mt-2 font-prose text-[14px] text-cocoa">{preview}</p>
                    </div>
                    <form action={removerCapsulaAction}>
                      <input type="hidden" name="cartaId" value={id} />
                      <input type="hidden" name="capsulaId" value={c.id} />
                      <button
                        type="submit"
                        aria-label="remover"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-cocoa/15 bg-paper text-ruby-deep transition hover:bg-ruby hover:text-rose-mist"
                      >
                        <X size={14} strokeWidth={1.8} />
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {cheio ? (
        <p className="mt-8 rounded-xl border border-champagne-deep/40 bg-champagne-soft/30 px-5 py-4 font-prose text-sm italic text-cocoa-soft">
          Limite de {MAX_CAPSULAS_POR_CARTA} cápsulas atingido.
        </p>
      ) : (
        <section className="mt-10">
          <h2 className="font-serif text-xl italic text-cocoa">Selar nova cápsula</h2>
          <div className="mt-4">
            <CapsulaForm cartaId={id} />
          </div>
        </section>
      )}
    </main>
  );
}
