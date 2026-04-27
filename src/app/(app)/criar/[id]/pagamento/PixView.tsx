"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  cartaId: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string | null;
};

const formatadorHora = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function PixView({ brCode, brCodeBase64, expiresAt }: Props) {
  const router = useRouter();
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(id);
  }, [router]);

  function copiar() {
    navigator.clipboard.writeText(brCode).then(
      () => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2200);
      },
      () => setCopiado(false),
    );
  }

  const src = brCodeBase64.startsWith("data:") ? brCodeBase64 : `data:image/png;base64,${brCodeBase64}`;

  return (
    <section className="mt-10 flex flex-col items-center gap-6 rounded-2xl border border-cocoa/12 bg-paper px-6 py-8 shadow-engrave">
      <div className="rounded-md border border-cocoa/15 bg-rose-mist/30 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Pix QR Code"
          width={240}
          height={240}
          className="h-60 w-60 object-contain"
        />
      </div>

      <div className="w-full">
        <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft">
          Código copia e cola
        </p>
        <div className="mt-2 flex gap-2">
          <code className="flex-1 truncate rounded-md border border-cocoa/15 bg-rose-mist/40 px-3 py-2 font-mono text-[12px] text-cocoa">
            {brCode}
          </code>
          <button
            type="button"
            onClick={copiar}
            className="rounded-full border border-ruby/40 bg-rose-mist/50 px-4 py-2 font-sans text-[10px] uppercase tracking-[0.22em] text-ruby hover:bg-ruby hover:text-rose-mist"
          >
            {copiado ? "copiado ✓" : "copiar"}
          </button>
        </div>
      </div>

      {expiresAt && (
        <p className="font-prose text-[12px] italic text-mauve">
          Este código expira às {formatadorHora.format(new Date(expiresAt))}.
        </p>
      )}

      <div className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ruby/60 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-ruby" />
        </span>
        Aguardando confirmação
      </div>
    </section>
  );
}
