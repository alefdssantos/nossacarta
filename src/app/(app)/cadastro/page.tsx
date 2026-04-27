import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MagicLinkForm } from "@/app/(app)/login/MagicLinkForm";

export const metadata: Metadata = {
  title: "Criar carta — NossaCarta",
  description: "Comece sua carta eterna. Sem senha, só seu e-mail.",
};

export default async function CadastroPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/conta");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16 md:py-24">
      <header className="text-center">
        <p className="font-script text-5xl leading-tight text-ruby">
          Sua carta começa aqui
        </p>
        <p className="mt-3 font-prose text-[15px] italic leading-relaxed text-cocoa-soft">
          Sem senha. Mandamos um link no e-mail e você entra com um clique.
        </p>
      </header>

      <section className="mt-10 rounded-2xl border border-cocoa/12 bg-paper/85 p-7 shadow-engrave backdrop-blur">
        <MagicLinkForm showNomeField next="/criar" cta="Começar minha carta" />
      </section>

      <p className="mt-8 text-center font-prose text-sm italic text-mauve">
        Já tem uma carta?{" "}
        <Link
          href="/login"
          className="font-medium not-italic text-ruby underline-offset-4 hover:underline"
        >
          entrar
        </Link>
      </p>
    </main>
  );
}
