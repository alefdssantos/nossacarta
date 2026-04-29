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
      className="rounded-full border border-cocoa/25 px-5 py-2 font-sans text-[11px] uppercase tracking-[0.22em] text-cocoa transition hover:border-ruby/40 hover:text-ruby"
    >
      {copiado ? "Copiado ✓" : "Copiar link"}
    </button>
  );
}
