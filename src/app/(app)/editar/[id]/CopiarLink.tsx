"use client";

import { useState } from "react";

export function CopiarLink({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      onClick={copiar}
      className="inline-flex min-h-11 items-center rounded-full border border-cocoa/25 px-5 font-sans text-[12px] uppercase tracking-[0.16em] text-cocoa transition hover:border-ruby/40 hover:text-ruby"
    >
      {copiado ? "Copiado ✓" : "Copiar link"}
    </button>
  );
}
