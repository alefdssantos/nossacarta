import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MagicLinkForm } from "./MagicLinkForm";

export const metadata: Metadata = {
  title: "Entrar — NossaCarta",
  description: "Acesse sua carta no NossaCarta com um link enviado pro seu e-mail.",
};

type SearchParams = Promise<{ next?: string; error?: string }>;

const errorMessages: Record<string, string> = {
  missing_code: "Link inválido. Peça um novo abaixo.",
  invalid_code: "Esse link já foi usado ou expirou. Peça um novo abaixo.",
};

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const params = await searchParams;

  if (data.user) {
    redirect(params.next && params.next.startsWith("/") ? params.next : "/conta");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16 md:py-24">
      <header className="text-center">
        <p className="font-script text-5xl text-ruby">Entrar</p>
        <p className="mt-3 font-prose text-[15px] italic leading-relaxed text-cocoa-soft">
          Coloque seu e-mail. Mandamos um link pra você acessar sua carta.
        </p>
      </header>

      <section className="mt-10 rounded-2xl border border-cocoa/12 bg-paper/85 p-7 shadow-engrave backdrop-blur">
        {params.error && errorMessages[params.error] && (
          <p
            role="alert"
            className="mb-5 rounded-md border border-ruby/30 bg-ruby/5 px-4 py-3 font-prose text-sm text-ruby-deep"
          >
            {errorMessages[params.error]}
          </p>
        )}
        <MagicLinkForm next={params.next} cta="Receber link de acesso" />
      </section>

      <p className="mt-8 text-center font-prose text-sm italic text-mauve">
        Primeira vez aqui?{" "}
        <Link
          href="/cadastro"
          className="font-medium not-italic text-ruby underline-offset-4 hover:underline"
        >
          criar minha carta
        </Link>
      </p>
    </main>
  );
}
