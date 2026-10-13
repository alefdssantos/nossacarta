type Status = "rascunho" | "aguardando_pagamento" | "publicada" | "expirada";

const config: Record<Status, { label: string; cls: string }> = {
  rascunho: {
    label: "rascunho",
    cls: "border-cocoa/25 bg-paper text-cocoa-soft",
  },
  aguardando_pagamento: {
    label: "aguardando pagamento",
    cls: "border-champagne-deep/40 bg-champagne-soft/40 text-champagne-deep",
  },
  publicada: {
    label: "publicada",
    cls: "border-ruby/40 bg-ruby/10 text-ruby-deep",
  },
  expirada: {
    label: "expirada",
    cls: "border-mauve/40 bg-mauve/10 text-mauve",
  },
};

export function StatusPill({ status }: { status: Status }) {
  const c = config[status] ?? config.rascunho;
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-full border px-2.5 font-sans text-[12px] uppercase tracking-[0.16em] ${c.cls}`}
    >
      {c.label}
    </span>
  );
}

export function PlanoPill({ plano }: { plano: "bilhete" | "eterno" }) {
  const cls =
    plano === "eterno"
      ? "border-champagne/60 bg-paper text-champagne-deep"
      : "border-cocoa/25 bg-paper text-cocoa-soft";
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-full border px-2.5 font-serif text-[12px] italic ${cls}`}
    >
      {plano}
    </span>
  );
}
