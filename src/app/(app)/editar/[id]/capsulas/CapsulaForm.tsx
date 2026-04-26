"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { criarCapsulaAction } from "@/lib/cartas/capsulas-actions";
import { capsulaInitialState, type CapsulaActionState } from "@/lib/cartas/types";

const MAX = 2000;

function isoLocalParaIsoOffset(local: string): string {
  if (!local) return "";
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function minDateTimeLocal(): string {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CapsulaForm({ cartaId }: { cartaId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<CapsulaActionState, FormData>(
    criarCapsulaAction,
    capsulaInitialState,
  );
  const [unlockLocal, setUnlockLocal] = useState("");
  const [mensagem, setMensagem] = useState("");
  const restante = MAX - mensagem.length;

  useEffect(() => {
    if (state.status === "ok") {
      formRef.current?.reset();
      setMensagem("");
      setUnlockLocal("");
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={(fd) => {
        const iso = isoLocalParaIsoOffset(unlockLocal);
        if (iso) fd.set("unlockEm", iso);
        return action(fd);
      }}
      className="flex flex-col gap-5 rounded-2xl border border-cocoa/12 bg-paper px-6 py-6 shadow-engrave"
    >
      <input type="hidden" name="cartaId" value={cartaId} />

      <label className="flex flex-col gap-1.5">
        <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft">
          Data e hora de abertura
        </span>
        <input
          type="datetime-local"
          required
          min={minDateTimeLocal()}
          value={unlockLocal}
          onChange={(e) => setUnlockLocal(e.target.value)}
          className="rounded-md border border-cocoa/20 bg-paper px-4 py-3 font-prose text-cocoa focus:border-ruby focus:outline-none focus:ring-1 focus:ring-ruby/40"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-baseline justify-between font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft">
          Mensagem selada
          <span className={`tracking-[0.16em] ${restante < 100 ? "text-ruby-deep" : "text-cocoa/45"}`}>
            {restante} restantes
          </span>
        </span>
        <textarea
          name="mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value.slice(0, MAX))}
          required
          rows={6}
          maxLength={MAX}
          placeholder="Escreva como uma carta para o futuro. Será lida apenas na data escolhida."
          className="rounded-md border border-cocoa/20 bg-paper px-4 py-3 font-prose text-cocoa placeholder:text-cocoa/35 focus:border-ruby focus:outline-none focus:ring-1 focus:ring-ruby/40"
        />
      </label>

      {state.status === "error" && (
        <p role="alert" className="font-prose text-sm text-ruby-deep">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-center rounded-full bg-ruby px-7 py-3 font-sans text-[11px] uppercase tracking-[0.24em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] hover:bg-ruby-deep disabled:opacity-60"
      >
        {pending ? "Selando…" : "Selar cápsula"}
      </button>
    </form>
  );
}
