"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="conteudo" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-6 py-24 text-center">
      <p className="font-sans text-[12px] uppercase tracking-[0.28em] text-champagne-deep">Erro</p>
      <h1 className="mt-4 font-script text-6xl text-ruby">Algo saiu do lugar</h1>
      <p className="mt-4 max-w-[36ch] font-prose text-[16px] italic leading-relaxed text-cocoa-soft">
        A página não carregou. Tente de novo. Se continuar, escreva para ola@nossacarta.love.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-ruby px-7 font-sans text-[12px] uppercase tracking-[0.2em] text-rose-mist"
      >
        Tentar de novo
      </button>
    </main>
  );
}
