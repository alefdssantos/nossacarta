import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader variant="internal" />
      <main id="conteudo" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-6 py-24 text-center">
        <p className="font-sans text-[12px] uppercase tracking-[0.28em] text-champagne-deep">404</p>
        <h1 className="mt-4 font-script text-6xl text-ruby">Página não encontrada</h1>
        <p className="mt-4 max-w-[36ch] font-prose text-[16px] italic leading-relaxed text-cocoa-soft">
          Esse endereço não existe, ou a carta já não está no ar.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-ruby px-7 font-sans text-[12px] uppercase tracking-[0.2em] text-rose-mist"
        >
          Voltar ao início
        </Link>
      </main>
      <SiteFooter variant="internal" />
    </>
  );
}
