"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { atualizarNomesAction } from "@/lib/cartas/actions";
import { initialState, type ActionState } from "@/lib/cartas/types";
import { sugerirSlug, slugify, slugValido } from "@/lib/cartas/slug";

type Props = {
  cartaId: string;
  pessoa1Inicial: string;
  pessoa2Inicial: string;
  dataInicial: string;
  slugInicial: string;
};

export function NomesForm({
  cartaId,
  pessoa1Inicial,
  pessoa2Inicial,
  dataInicial,
  slugInicial,
}: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionState, FormData>(
    atualizarNomesAction,
    initialState,
  );

  const [pessoa1, setPessoa1] = useState(pessoa1Inicial);
  const [pessoa2, setPessoa2] = useState(pessoa2Inicial);
  const [slug, setSlug] = useState(slugInicial);
  const [slugManual, setSlugManual] = useState(Boolean(slugInicial));

  useEffect(() => {
    if (slugManual) return;
    if (!pessoa1 && !pessoa2) {
      setSlug("");
      return;
    }
    setSlug(sugerirSlug(pessoa1 || "voce", pessoa2 || "amor"));
  }, [pessoa1, pessoa2, slugManual]);

  useEffect(() => {
    if (state.status === "ok") {
      router.push(`/conta`);
    }
  }, [state, router]);

  const slugErroLocal = slug && !slugValido(slug) ? "Endereço fora do formato permitido." : null;
  const erroSlug =
    slugErroLocal ?? (state.status === "error" && state.field === "slug" ? state.message : null);
  const erroGeral =
    state.status === "error" && !state.field ? state.message : null;

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="cartaId" value={cartaId} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Você"
          name="pessoa1"
          value={pessoa1}
          onChange={setPessoa1}
          required
          error={state.status === "error" && state.field === "pessoa1" ? state.message : null}
        />
        <Field
          label="Pessoa amada"
          name="pessoa2"
          value={pessoa2}
          onChange={setPessoa2}
          required
          error={state.status === "error" && state.field === "pessoa2" ? state.message : null}
        />
      </div>

      <Field
        label="Quando começou"
        name="dataInicio"
        type="date"
        defaultValue={dataInicial}
        required
        error={state.status === "error" && state.field === "dataInicio" ? state.message : null}
      />

      <div className="flex flex-col gap-1.5">
        <label className="flex items-baseline justify-between">
          <span className="font-prose text-xs uppercase tracking-[0.18em] text-cocoa/70">
            Endereço da carta
          </span>
          {!slugManual && (
            <button
              type="button"
              onClick={() => setSlugManual(true)}
              className="font-prose text-[11px] uppercase tracking-[0.16em] text-ruby underline-offset-4 hover:underline"
            >
              Editar
            </button>
          )}
        </label>
        <div className="flex items-center rounded-md border border-cocoa/20 bg-paper px-4 py-3 font-prose text-cocoa">
          <span className="text-cocoa/55">nossacarta.love/</span>
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugManual(true);
            }}
            readOnly={!slugManual}
            maxLength={40}
            className="flex-1 bg-transparent pl-1 outline-none placeholder:text-cocoa/35"
            placeholder="seu-endereço"
            required
          />
        </div>
        {erroSlug && (
          <p role="alert" className="font-prose text-sm text-ruby-deep">
            {erroSlug}
          </p>
        )}
        <p className="font-prose text-xs text-cocoa/55">
          Letras minúsculas, números e hífen. 2 a 40 caracteres.
        </p>
      </div>

      {erroGeral && (
        <p role="alert" className="font-prose text-sm text-ruby-deep">
          {erroGeral}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-center rounded-md bg-ruby px-8 py-3 font-prose text-sm uppercase tracking-[0.18em] text-rose-mist shadow-foil transition hover:bg-ruby-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar e continuar"}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  required?: boolean;
  error: string | null;
};

function Field({ label, name, type = "text", value, defaultValue, onChange, required, error }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-prose text-xs uppercase tracking-[0.18em] text-cocoa/70">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        required={required}
        maxLength={50}
        className="rounded-md border border-cocoa/20 bg-paper px-4 py-3 font-prose text-cocoa placeholder:text-cocoa/35 focus:border-ruby focus:outline-none focus:ring-1 focus:ring-ruby/40"
      />
      {error && (
        <p role="alert" className="font-prose text-sm text-ruby-deep">
          {error}
        </p>
      )}
    </label>
  );
}
