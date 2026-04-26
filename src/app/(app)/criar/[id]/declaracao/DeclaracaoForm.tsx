"use client";

import { useActionState, useState } from "react";
import { atualizarDeclaracaoTemaAction } from "@/lib/cartas/actions";
import { initialState, type ActionState } from "@/lib/cartas/types";

type Tema = "ruby-couture" | "cocoa-vintage" | "champagne-foil";

const temas: Array<{
  valor: Tema;
  titulo: string;
  legenda: string;
  swatches: [string, string, string];
}> = [
  {
    valor: "ruby-couture",
    titulo: "Ruby Couture",
    legenda: "rubi profundo, papel cru, dourado discreto",
    swatches: ["#B01228", "#FAF1EA", "#C49A55"],
  },
  {
    valor: "cocoa-vintage",
    titulo: "Cocoa Vintage",
    legenda: "marrom envelope, sépia, marfim",
    swatches: ["#2A1518", "#4A2D31", "#E2C28A"],
  },
  {
    valor: "champagne-foil",
    titulo: "Champagne Foil",
    legenda: "champanhe, blush, dourado claro",
    swatches: ["#C49A55", "#F2C7C9", "#FAF1EA"],
  },
];

const MAX = 5000;

type Props = {
  cartaId: string;
  declaracaoInicial: string;
  temaInicial: Tema;
};

export function DeclaracaoForm({ cartaId, declaracaoInicial, temaInicial }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    atualizarDeclaracaoTemaAction,
    initialState,
  );
  const [declaracao, setDeclaracao] = useState(declaracaoInicial);
  const [tema, setTema] = useState<Tema>(temaInicial);
  const restante = MAX - declaracao.length;
  const erroDecl =
    state.status === "error" && state.field === "declaracao" ? state.message : null;
  const erroGeral = state.status === "error" && !state.field ? state.message : null;

  return (
    <form action={action} className="flex flex-col gap-8">
      <input type="hidden" name="cartaId" value={cartaId} />
      <input type="hidden" name="tema" value={tema} />

      <div className="flex flex-col gap-2">
        <label className="flex items-baseline justify-between">
          <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft">
            Sua declaração
          </span>
          <span
            className={`font-sans text-[10px] tracking-[0.18em] ${
              restante < 100 ? "text-ruby-deep" : "text-cocoa/45"
            }`}
          >
            {restante} caracteres restantes
          </span>
        </label>
        <textarea
          name="declaracao"
          value={declaracao}
          onChange={(e) => setDeclaracao(e.target.value.slice(0, MAX))}
          maxLength={MAX}
          rows={12}
          required
          placeholder="Escreva como se estivesse contando uma história. Sobre o primeiro dia, sobre uma viagem, sobre a próxima vida juntos. Não precisa rimar."
          className="rounded-xl border border-cocoa/20 bg-paper px-5 py-4 font-prose text-[16px] leading-relaxed text-cocoa placeholder:text-cocoa/35 focus:border-ruby focus:outline-none focus:ring-1 focus:ring-ruby/40"
        />
        {erroDecl && (
          <p role="alert" className="font-prose text-sm text-ruby-deep">
            {erroDecl}
          </p>
        )}
        <p className="font-prose text-[12px] italic text-mauve">
          Mínimo 20 caracteres. Quebras de linha são preservadas.
        </p>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft">
          Tema visual
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {temas.map((t) => {
            const sel = tema === t.valor;
            return (
              <button
                type="button"
                key={t.valor}
                onClick={() => setTema(t.valor)}
                aria-pressed={sel}
                className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition ${
                  sel
                    ? "border-ruby bg-paper shadow-foil"
                    : "border-cocoa/15 bg-rose-mist/40 hover:border-cocoa/30"
                }`}
              >
                <div className="flex gap-1.5">
                  {t.swatches.map((c) => (
                    <span
                      key={c}
                      className="h-6 w-6 rounded-full border border-cocoa/15"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div>
                  <p className="font-serif text-[16px] italic text-cocoa">{t.titulo}</p>
                  <p className="mt-1 font-prose text-[12px] italic text-mauve">{t.legenda}</p>
                </div>
              </button>
            );
          })}
        </div>
      </fieldset>

      {erroGeral && (
        <p role="alert" className="font-prose text-sm text-ruby-deep">
          {erroGeral}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-center rounded-full bg-ruby px-8 py-3 font-sans text-[11px] uppercase tracking-[0.24em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] transition hover:bg-ruby-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar e continuar →"}
      </button>
    </form>
  );
}
