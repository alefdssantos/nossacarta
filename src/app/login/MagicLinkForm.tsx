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
      <div className="rounded-xl border border-cocoa/15 bg-paper px-6 py-8 text-center shadow-engrave">
        <p className="font-serif text-2xl text-cocoa">Conferimos seu e-mail.</p>
        <p className="mt-3 font-prose text-sm leading-relaxed text-cocoa/80">
          Mandamos um link mágico pra <strong className="font-semibold">{state.email}</strong>.
          Abra na mesma aba pra continuar.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {showNomeField && (
        <label className="flex flex-col gap-1.5">
          <span className="font-prose text-xs uppercase tracking-[0.18em] text-cocoa/70">Como te chamar</span>
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
        <span className="font-prose text-xs uppercase tracking-[0.18em] text-cocoa/70">E-mail</span>
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
        className="mt-1 inline-flex items-center justify-center rounded-md bg-ruby px-6 py-3 font-prose text-sm uppercase tracking-[0.18em] text-rose-mist shadow-foil transition hover:bg-ruby-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Enviando…" : cta}
      </button>

      <p className="font-prose text-xs leading-relaxed text-cocoa/60">
        Sem senha. Sem cadastro chato. A gente te manda um link no e-mail e você só clica.
      </p>
    </form>
  );
}
