import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { conteudoCartaV1Schema } from "@/lib/cartas/schema";
import { Stepper } from "@/components/Stepper";
import { PlanoPill } from "@/components/StatusPill";
import { wizardSteps } from "@/app/(app)/criar/page";
import { DeclaracaoForm } from "./DeclaracaoForm";

export const metadata: Metadata = {
  title: "Sua declaração — NossaCarta",
};

type Params = Promise<{ id: string }>;

export default async function DeclaracaoPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/login?next=/criar/${id}/declaracao`);

  const { data: carta, error } = await supabase
    .from("cartas")
    .select("id, plano, status, conteudo, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !carta || carta.owner_id !== userData.user.id) notFound();
  if (carta.status === "publicada" && carta.plano !== "eterno") redirect(`/conta`);

  const conteudoParse = conteudoCartaV1Schema.safeParse(carta.conteudo);
  const declaracaoInicial = conteudoParse.success ? conteudoParse.data.declaracao ?? "" : "";
  const temaInicial = conteudoParse.success ? conteudoParse.data.tema : "ruby-couture";

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 md:py-16">
      <Stepper steps={wizardSteps} current={2} />

      <header className="mt-10">
        <div className="flex items-center gap-3">
          <PlanoPill plano={carta.plano} />
          <Link
            href={`/criar/${carta.id}/nomes`}
            className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55 underline-offset-4 hover:text-ruby hover:underline"
          >
            ← voltar
          </Link>
        </div>
        <p className="mt-5 font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
          Etapa 3
        </p>
        <p className="mt-2 font-script text-5xl text-ruby">A sua declaração</p>
        <p className="mt-3 font-prose text-[15px] italic leading-relaxed text-cocoa-soft">
          O coração da carta. Escreva sem pressa — só você sabe o que quer dizer.
        </p>
      </header>

      <section className="mt-10">
        <DeclaracaoForm
          cartaId={carta.id}
          declaracaoInicial={declaracaoInicial}
          temaInicial={temaInicial}
        />
      </section>
    </main>
  );
}
