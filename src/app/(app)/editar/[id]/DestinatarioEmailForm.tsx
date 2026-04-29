"use client";

import { useActionState } from "react";
import { atualizarDestinatarioEmailAction } from "@/lib/cartas/actions";
import type { MediaActionState } from "@/lib/cartas/types";

const initial: MediaActionState = { status: "idle" };

export function DestinatarioEmailForm({
  cartaId,
  emailAtual,
}: {
  cartaId: string;
  emailAtual: string | null;
}) {
  const [state, action, pending] = useActionState(atualizarDestinatarioEmailAction, initial);

  return (
    <form action={action} className="mt-4 flex flex-col gap-2">
      <input type="hidden" name="cartaId" value={cartaId} />
      <label className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55">
        E-mail de quem vai receber
      </label>
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          defaultValue={emailAtual ?? ""}
          placeholder="email@exemplo.com"
          className="flex-1 rounded-xl border border-cocoa/20 bg-paper px-4 py-2 font-prose text-[14px] text-cocoa placeholder:text-cocoa/35 focus:border-ruby/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ruby px-5 py-2 font-sans text-[11px] uppercase tracking-[0.22em] text-rose-mist hover:bg-ruby-deep disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
      {state.status === "error" && (
        <p className="font-prose text-[12px] italic text-ruby">{state.message}</p>
      )}
      {state.status === "ok" && (
        <p className="font-prose text-[12px] italic text-cocoa/60">E-mail salvo.</p>
      )}
    </form>
  );
}
