import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Criar carta — NossaCarta",
};

export default async function CriarPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=/criar");

  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="font-script text-5xl text-ruby">Sua carta começa aqui</p>
      <p className="mt-4 font-prose text-base text-cocoa/75">
        Olá, {data.user.email}. Você está autenticado.
      </p>
      <p className="mt-10 font-prose text-sm text-cocoa/65">
        O editor multi-etapa (nomes, data, fotos, música, declaração, tema) chega no próximo passo.
        Por enquanto, volte pra sua conta.
      </p>
      <Link
        href="/conta"
        className="mt-8 inline-flex items-center rounded-md bg-ruby px-6 py-3 font-prose text-sm uppercase tracking-[0.18em] text-rose-mist shadow-foil hover:bg-ruby-deep"
      >
        Ir pra minha conta
      </Link>
    </main>
  );
}
