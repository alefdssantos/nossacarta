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
    <main className="flex min-h-screen items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="font-script text-5xl text-ruby">Entrar</p>
          <p className="mt-3 font-prose text-sm leading-relaxed text-cocoa/75">
            Coloque seu e-mail. Mandamos um link pra você acessar a sua carta.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-cocoa/12 bg-rose-mist/60 p-7 shadow-engrave backdrop-blur">
          {params.error && errorMessages[params.error] && (
            <p role="alert" className="mb-5 rounded-md border border-ruby/30 bg-ruby/5 px-4 py-3 font-prose text-sm text-ruby-deep">
              {errorMessages[params.error]}
            </p>
          )}
          <MagicLinkForm next={params.next} cta="Receber link de acesso" />
        </div>

        <p className="mt-8 text-center font-prose text-sm text-cocoa/70">
          Primeira vez aqui?{" "}
          <Link href="/cadastro" className="font-medium text-ruby underline-offset-4 hover:underline">
            criar minha carta
          </Link>
        </p>
      </div>
    </main>
  );
}
