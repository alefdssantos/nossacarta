import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MAX_MARCOS_POR_CARTA } from "@/lib/cartas/schema";
import { removerMarcoAction } from "@/lib/cartas/marcos-actions";
import { formatarDataLongoBR } from "@/lib/cartas/datas";
import { MarcoForm } from "./MarcoForm";

export const metadata: Metadata = { title: "Linha do tempo — NossaCarta" };

type Params = Promise<{ id: string }>;

export default async function MarcosPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/login?next=/editar/${id}/marcos`);

  const { data: carta } = await supabase
    .from("cartas")
    .select("id, slug, plano, status, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (!carta || carta.owner_id !== userData.user.id) notFound();
  if (carta.plano !== "eterno") redirect(`/editar/${id}`);

  const { data: marcos } = await supabase
    .from("marcos")
    .select("id, data, titulo, descricao, foto_path")
    .eq("carta_id", id)
    .order("data", { ascending: true });

  const lista = marcos ?? [];
  const cheio = lista.length >= MAX_MARCOS_POR_CARTA;

  const { getSignedFotoUrls } = await import("@/lib/supabase/storage");
  const paths = lista.map((m) => m.foto_path).filter((p): p is string => Boolean(p));
  const signed = paths.length ? await getSignedFotoUrls(paths, 60 * 60) : new Map<string, string>();

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
          Linha do tempo
        </p>
        <p className="mt-2 font-script text-5xl text-ruby">Os marcos de vocês</p>
        <p className="mt-3 font-prose text-[15px] italic leading-relaxed text-cocoa-soft">
          Datas que importam — primeiro encontro, primeira viagem, casamento, mudanças. Aparecem
          em ordem cronológica na carta.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-serif text-xl italic text-cocoa">
          {lista.length} de {MAX_MARCOS_POR_CARTA}
        </h2>

        {lista.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-cocoa/25 bg-paper/60 px-6 py-10 text-center font-prose text-[14px] italic text-cocoa-soft">
            Nenhum marco ainda. Adicione o primeiro abaixo.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {lista.map((m) => (
              <li key={m.id} className="rounded-xl border border-cocoa/12 bg-paper px-5 py-4 shadow-engrave">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-1 min-w-0 gap-3">
                    {m.foto_path && signed.get(m.foto_path) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={signed.get(m.foto_path)!}
                        alt=""
                        className="h-16 w-16 flex-shrink-0 rounded border border-cocoa/15 object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-mauve">
                        {formatarDataLongoBR(m.data)}
                      </p>
                      <p className="mt-1 font-serif italic text-[18px] text-cocoa">{m.titulo}</p>
                      {m.descricao && (
                        <p className="mt-1 font-prose text-[13px] text-cocoa-soft">{m.descricao}</p>
                      )}
                    </div>
                  </div>
                  <form action={removerMarcoAction}>
                    <input type="hidden" name="cartaId" value={id} />
                    <input type="hidden" name="marcoId" value={m.id} />
                    <button
                      type="submit"
                      aria-label="remover"
                      className="rounded-full border border-cocoa/15 bg-paper px-3 py-1 font-sans text-[11px] text-ruby-deep hover:bg-ruby hover:text-rose-mist"
                    >
                      ×
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {cheio ? (
        <p className="mt-8 rounded-xl border border-champagne-deep/40 bg-champagne-soft/30 px-5 py-4 font-prose text-sm italic text-cocoa-soft">
          Limite de {MAX_MARCOS_POR_CARTA} marcos atingido.
        </p>
      ) : (
        <section className="mt-10">
          <h2 className="font-serif text-xl italic text-cocoa">Adicionar marco</h2>
          <div className="mt-4">
            <MarcoForm cartaId={id} />
          </div>
        </section>
      )}
    </main>
  );
}
