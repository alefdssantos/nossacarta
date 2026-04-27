"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { criarMarcoAction } from "@/lib/cartas/marcos-actions";
import { marcoInitialState, type MarcoActionState } from "@/lib/cartas/types";

const MAX_TITULO = 80;
const MAX_DESCRICAO = 500;

export function MarcoForm({ cartaId }: { cartaId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<MarcoActionState, FormData>(
    criarMarcoAction,
    marcoInitialState,
  );
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    if (state.status === "ok") {
      formRef.current?.reset();
      setTitulo("");
      setDescricao("");
    }
  }, [state]);

  const erroData = state.status === "error" && state.field === "data" ? state.message : null;
  const erroTitulo = state.status === "error" && state.field === "titulo" ? state.message : null;
  const erroGeral = state.status === "error" && !state.field ? state.message : null;

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-5 rounded-2xl border border-cocoa/12 bg-paper px-6 py-6 shadow-engrave"
    >
      <input type="hidden" name="cartaId" value={cartaId} />

      <label className="flex flex-col gap-1.5">
        <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft">
          Quando aconteceu
        </span>
        <input
          type="date"
          name="data"
          required
          className="rounded-md border border-cocoa/20 bg-paper px-4 py-3 font-prose text-cocoa focus:border-ruby focus:outline-none focus:ring-1 focus:ring-ruby/40"
        />
        {erroData && (
          <p role="alert" className="font-prose text-sm text-ruby-deep">
            {erroData}
          </p>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-baseline justify-between font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft">
          Título
          <span className="tracking-[0.16em] text-cocoa/45">{MAX_TITULO - titulo.length}</span>
        </span>
        <input
          type="text"
          name="titulo"
          required
          maxLength={MAX_TITULO}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value.slice(0, MAX_TITULO))}
          placeholder="Primeiro encontro · Pedido em Paris · Mudança pra Lisboa"
          className="rounded-md border border-cocoa/20 bg-paper px-4 py-3 font-prose text-cocoa placeholder:text-cocoa/35 focus:border-ruby focus:outline-none focus:ring-1 focus:ring-ruby/40"
        />
        {erroTitulo && (
          <p role="alert" className="font-prose text-sm text-ruby-deep">
            {erroTitulo}
          </p>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-baseline justify-between font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft">
          Descrição (opcional)
          <span className="tracking-[0.16em] text-cocoa/45">
            {MAX_DESCRICAO - descricao.length}
          </span>
        </span>
        <textarea
          name="descricao"
          rows={3}
          maxLength={MAX_DESCRICAO}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value.slice(0, MAX_DESCRICAO))}
          placeholder="Uma frase curta sobre esse momento."
          className="rounded-md border border-cocoa/20 bg-paper px-4 py-3 font-prose text-cocoa placeholder:text-cocoa/35 focus:border-ruby focus:outline-none focus:ring-1 focus:ring-ruby/40"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft">
          Foto (opcional)
        </span>
        <input
          type="file"
          name="foto"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full font-prose text-sm text-cocoa file:mr-4 file:rounded-full file:border file:border-cocoa/20 file:bg-paper file:px-4 file:py-2 file:font-sans file:text-[10px] file:uppercase file:tracking-[0.18em] file:text-cocoa hover:file:border-ruby/40 hover:file:text-ruby"
        />
        <span className="font-prose text-[12px] italic text-mauve">
          JPG, PNG ou WebP. Máximo 5 MB.
        </span>
      </label>

      {erroGeral && (
        <p role="alert" className="font-prose text-sm text-ruby-deep">
          {erroGeral}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-center rounded-full bg-ruby px-7 py-3 font-sans text-[11px] uppercase tracking-[0.24em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] hover:bg-ruby-deep disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar marco"}
      </button>
    </form>
  );
}
