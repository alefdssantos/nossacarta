import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlanoForm } from "./PlanoForm";

export const metadata: Metadata = {
  title: "Criar carta — NossaCarta",
};

export default async function CriarPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=/criar");

  const { data: rascunhos } = await supabase
    .from("cartas")
    .select("id, plano, atualizada_em")
    .eq("status", "rascunho")
    .order("atualizada_em", { ascending: false })
    .limit(1);
  const rascunho = rascunhos?.[0];

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <header className="text-center">
        <p className="font-script text-5xl text-ruby">Sua carta começa aqui</p>
        <p className="mt-3 font-prose text-base text-cocoa/75">
          Antes de tudo, escolha o plano. Você pode trocar enquanto não publicar.
        </p>
      </header>

      {rascunho && (
        <div className="mt-10 rounded-xl border border-cocoa/15 bg-paper px-6 py-5 shadow-engrave">
          <p className="font-prose text-sm text-cocoa/75">
            Você tem um rascunho em andamento. Quer continuar?
          </p>
          <a
            href={`/criar/${rascunho.id}/nomes`}
            className="mt-3 inline-flex items-center font-prose text-sm font-medium text-ruby underline-offset-4 hover:underline"
          >
            Continuar rascunho ({rascunho.plano})
          </a>
        </div>
      )}

      <section className="mt-12">
        <PlanoForm />
      </section>
    </main>
  );
}
