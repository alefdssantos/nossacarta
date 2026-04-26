import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Exemplo — NossaCarta",
  description: "Veja como sua carta vai ficar.",
};

export default function ExemploPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="font-prose text-xs uppercase tracking-[0.22em] text-cocoa/55">Exemplo</p>
      <p className="mt-3 font-script text-5xl text-ruby">Em breve</p>
      <p className="mt-5 font-prose text-base leading-relaxed text-cocoa/75">
        Estamos preparando uma carta de demonstração com o layout completo: capa, contador,
        fotos, música, declaração e cápsulas. Volte logo pra ver.
      </p>
      <div className="mt-10 flex flex-col items-center gap-3">
        <Link
          href="/cadastro"
          className="rounded-full bg-ruby px-7 py-3 font-prose text-xs uppercase tracking-[0.22em] text-rose-mist shadow-foil hover:bg-ruby-deep"
        >
          Criar a minha
        </Link>
        <Link
          href="/"
          className="font-prose text-sm text-cocoa/65 underline-offset-4 hover:text-ruby hover:underline"
        >
          voltar para o início
        </Link>
      </div>
    </main>
  );
}
