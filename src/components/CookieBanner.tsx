"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "nc_consent";

type Consent = "accepted" | "essential" | null;

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY) as Consent;
      setConsent(salvo);
    } catch {
      setConsent(null);
    }
    setMontado(true);
  }, []);

  function decidir(escolha: Exclude<Consent, null>) {
    try {
      localStorage.setItem(STORAGE_KEY, escolha);
    } catch {
      // Ignora se localStorage indisponível.
    }
    setConsent(escolha);
  }

  if (!montado || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Preferências de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:left-auto sm:right-4 sm:max-w-md"
    >
      <div className="rounded-2xl border border-cocoa/15 bg-paper p-5 shadow-foil backdrop-blur">
        <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
          Cookies
        </p>
        <p className="mt-2 font-prose text-[14px] leading-relaxed text-cocoa">
          Usamos cookies essenciais para autenticação. Cookies de medição de uso
          ajudam a melhorar a experiência — só ativamos com sua permissão.
        </p>
        <p className="mt-2 font-prose text-[12px] italic text-mauve">
          <Link href="/privacidade" className="text-ruby underline-offset-4 hover:underline">
            Saiba mais
          </Link>{" "}
          · LGPD
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => decidir("essential")}
            className="rounded-full border border-cocoa/25 bg-paper px-4 py-2 font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa hover:border-ruby/40 hover:text-ruby"
          >
            Apenas essenciais
          </button>
          <button
            type="button"
            onClick={() => decidir("accepted")}
            className="rounded-full bg-ruby px-5 py-2 font-sans text-[10px] uppercase tracking-[0.22em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] hover:bg-ruby-deep"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook utilitário pra componentes verificarem consent e renderizar analytics
 * só quando autorizado.
 */
export function useConsent(): Consent {
  const [consent, setConsent] = useState<Consent>(null);
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY) as Consent;
      setConsent(salvo);
    } catch {
      setConsent(null);
    }
    function listener(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setConsent((e.newValue as Consent) ?? null);
    }
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);
  return consent;
}
