import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Stepper } from "@/components/Stepper";
import { PlanoForm } from "./PlanoForm";

export const metadata: Metadata = {
  title: "Criar carta — NossaCarta",
};

export const wizardSteps = [
  { label: "Plano" },
  { label: "Nomes" },
  { label: "Declaração" },
  { label: "Fotos" },
  { label: "Música & tema" },
  { label: "Publicar" },
];

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
    <main className="mx-auto w-full max-w-2xl px-6 py-12 md:py-16">
      <Stepper steps={wizardSteps} current={0} />

      <header className="mt-10 text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
          Etapa 1
        </p>
        <p className="mt-3 font-script text-5xl text-ruby">Sua carta começa aqui</p>
        <p className="mt-3 font-prose text-[15px] italic leading-relaxed text-cocoa-soft">
          Antes de tudo, escolha o plano. Você pode trocar enquanto não publicar.
        </p>
      </header>

      {rascunho && (
        <div className="mt-10 rounded-xl border border-champagne-deep/30 bg-champagne-soft/30 px-6 py-5 shadow-engrave">
          <p className="font-prose text-sm italic text-cocoa-soft">
            Você tem um rascunho em andamento.
          </p>
          <Link
            href={`/criar/${rascunho.id}/nomes`}
            className="mt-3 inline-flex items-center font-sans text-[11px] uppercase tracking-[0.22em] text-ruby underline-offset-4 hover:underline"
          >
            Continuar rascunho ({rascunho.plano}) <span className="ml-2">→</span>
          </Link>
        </div>
      )}

      <section className="mt-12">
        <PlanoForm />
      </section>

      <p className="mt-10 text-center font-prose text-[12px] italic text-mauve">
        Pix com 5% de desconto · cartão em até 12x via Mercado Pago
      </p>
    </main>
  );
}
