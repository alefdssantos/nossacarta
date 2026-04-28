import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlanoPill } from "@/components/StatusPill";
import { PixView } from "./PixView";
import { simularPagamentoAction } from "@/lib/cartas/pagamento-actions";

export const metadata: Metadata = {
  title: "Pagamento — NossaCarta",
};

type Params = Promise<{ id: string }>;

export default async function PagamentoPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/login?next=/criar/${id}/pagamento`);

  const { data: carta } = await supabase
    .from("cartas")
    .select("id, slug, plano, status, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (!carta || carta.owner_id !== userData.user.id) notFound();
  if (carta.status === "publicada") redirect(`/${carta.slug}`);

  const { data: pagamentos } = await supabase
    .from("pagamentos")
    .select("id, status, valor_centavos, criado_em")
    .eq("carta_id", id)
    .order("criado_em", { ascending: false })
    .limit(1);

  const pagamento = pagamentos?.[0];
  if (!pagamento) redirect(`/criar/${id}/publicar`);

  if (pagamento.status === "approved") redirect(`/${carta.slug}`);
  if (pagamento.status === "rejected" || pagamento.status === "cancelled") {
    redirect(`/criar/${id}/publicar?erro=gateway`);
  }

  const valorReais = (pagamento.valor_centavos / 100).toFixed(2).replace(".", ",");

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-12 md:py-16">
      <Link
        href={`/criar/${id}/publicar`}
        className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55 underline-offset-4 hover:text-ruby hover:underline"
      >
        ← voltar
      </Link>

      <header className="mt-8 text-center">
        <div className="flex justify-center">
          <PlanoPill plano={carta.plano} />
        </div>
        <p className="mt-5 font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
          Aguardando confirmação
        </p>
        <p className="mt-2 font-script text-5xl text-ruby">R$ {valorReais}</p>
        <p className="mt-3 font-prose text-[15px] italic leading-relaxed text-cocoa-soft">
          Finalize o pagamento no Mercado Pago. Após confirmado, sua carta é publicada automaticamente.
        </p>
      </header>

      <PixView cartaId={id} />

      <p className="mt-12 text-center font-prose text-[12px] italic text-mauve">
        Após o pagamento, esta página atualiza sozinha. Se demorar, recarregue.
      </p>

      {process.env.NODE_ENV !== "production" && (
        <div className="mt-8 rounded-xl border border-dashed border-cocoa/25 bg-paper/60 px-5 py-4 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft">
            Modo de desenvolvimento
          </p>
          <form action={simularPagamentoAction} className="mt-3">
            <input type="hidden" name="cartaId" value={id} />
            <input type="hidden" name="pagamentoId" value={pagamento.id} />
            <button
              type="submit"
              className="font-sans text-[9px] uppercase tracking-[0.18em] text-cocoa/45 underline-offset-4 hover:text-ruby hover:underline"
            >
              simular pagamento aprovado (dev) →
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
