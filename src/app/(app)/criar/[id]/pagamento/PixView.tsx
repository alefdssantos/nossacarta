"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  cartaId: string;
};

export function PixView({ cartaId: _ }: Props) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <section className="mt-10 flex flex-col items-center gap-6 rounded-2xl border border-cocoa/12 bg-paper px-6 py-10 shadow-engrave">
      <div className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ruby/60 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-ruby" />
        </span>
        Aguardando confirmação do pagamento
      </div>
      <p className="font-prose text-[13px] italic text-mauve text-center">
        Se ainda não pagou, volte para a etapa anterior e clique em "Pagar e publicar".
      </p>
    </section>
  );
}
