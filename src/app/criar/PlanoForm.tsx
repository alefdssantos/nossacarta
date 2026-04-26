"use client";

import { useActionState, useState } from "react";
import { criarCartaAction } from "@/lib/cartas/actions";
import { initialState, type ActionState } from "@/lib/cartas/types";

type PlanoOpt = {
  valor: "bilhete" | "eterno";
  titulo: string;
  preco: string;
  duracao: string;
  bullets: readonly string[];
  destaque?: boolean;
};

const planos: readonly PlanoOpt[] = [
  {
    valor: "bilhete",
    titulo: "Bilhete",
    preco: "R$ 17,90",
    duracao: "Disponível por 7 dias",
    bullets: ["Foto de capa", "Declaração", "Música", "QR code"],
  },
  {
    valor: "eterno",
    titulo: "Eterno",
    preco: "R$ 29,90",
    duracao: "Vitalício, sem renovação",
    bullets: [
      "Fotos ilimitadas",
      "Cápsulas do tempo",
      "Ritual envelope",
      "Slug próprio",
      "Livro de visitas",
    ],
    destaque: true,
  },
];

export function PlanoForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    criarCartaAction,
    initialState,
  );
  const [escolhido, setEscolhido] = useState<string>("eterno");

  return (
    <form action={action} className="flex flex-col gap-6">
      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="sr-only">Plano</legend>
        {planos.map((p) => {
          const sel = escolhido === p.valor;
          return (
            <label
              key={p.valor}
              className={`relative flex cursor-pointer flex-col gap-3 rounded-2xl border p-6 transition ${
                sel
                  ? "border-ruby bg-paper shadow-foil"
                  : "border-cocoa/15 bg-rose-mist/40 hover:border-cocoa/30"
              }`}
            >
              <input
                type="radio"
                name="plano"
                value={p.valor}
                checked={sel}
                onChange={() => setEscolhido(p.valor)}
                className="sr-only"
              />
              {p.destaque && (
                <span className="absolute -top-3 right-5 rounded-full bg-champagne px-3 py-0.5 font-prose text-[10px] uppercase tracking-[0.18em] text-cocoa">
                  Recomendado
                </span>
              )}
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-2xl text-cocoa">{p.titulo}</span>
                <span className="font-serif text-xl text-ruby">{p.preco}</span>
              </div>
              <p className="font-prose text-xs uppercase tracking-[0.16em] text-cocoa/55">
                {p.duracao}
              </p>
              <ul className="flex flex-col gap-1.5 font-prose text-sm text-cocoa/80">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-ruby">·</span>
                    {b}
                  </li>
                ))}
              </ul>
            </label>
          );
        })}
      </fieldset>

      {state.status === "error" && (
        <p role="alert" className="font-prose text-sm text-ruby-deep">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-center rounded-md bg-ruby px-8 py-3 font-prose text-sm uppercase tracking-[0.18em] text-rose-mist shadow-foil transition hover:bg-ruby-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Criando…" : "Continuar"}
      </button>
    </form>
  );
}
