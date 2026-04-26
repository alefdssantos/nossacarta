import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sua conta — NossaCarta",
};

export default async function ContaPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const { data: cartas } = await supabase
    .from("cartas")
    .select("id, slug, plano, status, criada_em, atualizada_em, expira_em")
    .order("atualizada_em", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <header className="flex flex-col gap-2 border-b border-cocoa/12 pb-8">
        <p className="font-script text-4xl text-ruby">Sua conta</p>
        <p className="font-prose text-sm text-cocoa/70">{data.user.email}</p>
      </header>

      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-cocoa">Suas cartas</h2>
          <Link
            href="/criar"
            className="rounded-md bg-ruby px-4 py-2 font-prose text-xs uppercase tracking-[0.18em] text-rose-mist shadow-foil hover:bg-ruby-deep"
          >
            Nova carta
          </Link>
        </div>

        {!cartas || cartas.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-cocoa/20 px-6 py-10 text-center font-prose text-sm text-cocoa/65">
            Você ainda não criou nenhuma carta. Comece agora.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-cocoa/10">
            {cartas.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-serif text-lg text-cocoa">{c.slug}</p>
                  <p className="font-prose text-xs uppercase tracking-[0.16em] text-cocoa/55">
                    {c.plano} · {c.status}
                  </p>
                </div>
                <Link
                  href={`/editar/${c.id}`}
                  className="font-prose text-sm text-ruby underline-offset-4 hover:underline"
                >
                  abrir
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action="/auth/signout" method="post" className="mt-16 border-t border-cocoa/12 pt-8">
        <button
          type="submit"
          className="font-prose text-xs uppercase tracking-[0.18em] text-cocoa/60 hover:text-ruby"
        >
          Sair
        </button>
      </form>
    </main>
  );
}
