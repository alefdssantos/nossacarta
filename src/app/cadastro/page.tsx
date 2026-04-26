import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MagicLinkForm } from "@/app/login/MagicLinkForm";

export const metadata: Metadata = {
  title: "Criar carta — NossaCarta",
  description: "Comece sua carta eterna. Sem senha, só seu e-mail.",
};

export default async function CadastroPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) redirect("/conta");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="font-script text-5xl text-ruby">Sua carta começa aqui</p>
          <p className="mt-3 font-prose text-sm leading-relaxed text-cocoa/75">
            Cadastro sem senha. Mandamos um link no e-mail e você já entra criando.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-cocoa/12 bg-rose-mist/60 p-7 shadow-engrave backdrop-blur">
          <MagicLinkForm showNomeField next="/criar" cta="Começar minha carta" />
        </div>

        <p className="mt-8 text-center font-prose text-sm text-cocoa/70">
          Já tem uma carta?{" "}
          <Link href="/login" className="font-medium text-ruby underline-offset-4 hover:underline">
            entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
