"use client";

import { useActionState } from "react";
import { signInWithMagicLink, type AuthFormState } from "@/lib/auth/actions";

const initial: AuthFormState = { status: "idle" };

type Props = {
  showNomeField?: boolean;
  next?: string;
  cta?: string;
};

export function MagicLinkForm({ showNomeField = false, next, cta = "Receber link" }: Props) {
  const [state, action, pending] = useActionState(signInWithMagicLink, initial);

  if (state.status === "ok") {
    return (
      <div className="text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
          Conferimos seu e-mail
        </p>
        <p className="mt-3 font-serif text-2xl italic text-cocoa">Está a caminho.</p>
        <p className="mt-4 font-prose text-[14px] leading-relaxed text-cocoa-soft">
          Mandamos um link mágico para
          <br />
          <strong className="font-semibold text-cocoa">{state.email}</strong>.
        </p>
        <p className="mt-4 font-prose text-[12px] italic text-mauve">
          Abra o e-mail nesta mesma aba pra continuar. Não esqueça da caixa de spam.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {showNomeField && (
        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft">
            Como te chamar
          </span>
          <input
            type="text"
            name="nome"
            autoComplete="name"
            maxLength={80}
            placeholder="Seu primeiro nome"
            className="rounded-md border border-cocoa/20 bg-paper px-4 py-3 font-prose text-cocoa placeholder:text-cocoa/35 focus:border-ruby focus:outline-none focus:ring-1 focus:ring-ruby/40"
          />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft">E-mail</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="voce@email.com"
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
        className="mt-1 inline-flex items-center justify-center rounded-full bg-ruby px-7 py-3 font-sans text-[11px] uppercase tracking-[0.24em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] transition hover:bg-ruby-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Enviando…" : cta}
      </button>

      <p className="font-prose text-[12px] italic leading-relaxed text-mauve">
        Sem senha. Sem cadastro chato. A gente manda um link no seu e-mail e você só clica.
      </p>
    </form>
  );
}
