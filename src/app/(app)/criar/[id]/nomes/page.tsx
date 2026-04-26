import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { conteudoCartaV1Schema } from "@/lib/cartas/schema";
import { Stepper } from "@/components/Stepper";
import { PlanoPill } from "@/components/StatusPill";
import { wizardSteps } from "@/app/(app)/criar/page";
import { NomesForm } from "./NomesForm";

export const metadata: Metadata = {
  title: "Quem são vocês — NossaCarta",
};

type Params = Promise<{ id: string }>;

export default async function NomesPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/login?next=/criar/${id}/nomes`);

  const { data: carta, error } = await supabase
    .from("cartas")
    .select("id, slug, plano, status, conteudo, data_inicio_relacionamento, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !carta || carta.owner_id !== userData.user.id) notFound();
  if (carta.status === "publicada") redirect(`/conta`);

  const conteudoParse = conteudoCartaV1Schema.safeParse(carta.conteudo);
  const nomes = conteudoParse.success ? conteudoParse.data.nomes : undefined;
  const slugInicial = carta.slug.startsWith("rascunho-") ? "" : carta.slug;

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-12 md:py-16">
      <Stepper steps={wizardSteps} current={1} />

      <header className="mt-10">
        <div className="flex items-center gap-3">
          <PlanoPill plano={carta.plano} />
          <Link
            href="/criar"
            className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55 underline-offset-4 hover:text-ruby hover:underline"
          >
            ← trocar plano
          </Link>
        </div>
        <p className="mt-5 font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
          Etapa 2
        </p>
        <p className="mt-2 font-script text-5xl text-ruby">Quem são vocês</p>
        <p className="mt-3 font-prose text-[15px] italic leading-relaxed text-cocoa-soft">
          Os nomes vão na capa e no endereço da carta. Você ainda pode editar depois.
        </p>
      </header>

      <section className="mt-10">
        <NomesForm
          cartaId={carta.id}
          pessoa1Inicial={nomes?.pessoa1 ?? ""}
          pessoa2Inicial={nomes?.pessoa2 ?? ""}
          dataInicial={carta.data_inicio_relacionamento ?? ""}
          slugInicial={slugInicial}
        />
      </section>
    </main>
  );
}
