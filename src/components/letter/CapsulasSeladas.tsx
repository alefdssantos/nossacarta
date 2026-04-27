"use client";

import { useState } from "react";
import type { CapsulaPublica } from "@/lib/cartas/types";

type Props = {
  capsulas: CapsulaPublica[];
};

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});
const formatadorRelativo = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

function tempoAteAbrir(unlockEm: string, agora = new Date()): string {
  const alvo = new Date(unlockEm).getTime();
  const diffMs = alvo - agora.getTime();
  if (diffMs <= 0) return "já pode ser aberta";

  const dias = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (dias < 30) return formatadorRelativo.format(dias, "day");
  const meses = Math.round(dias / 30);
  if (meses < 12) return formatadorRelativo.format(meses, "month");
  const anos = Math.round(dias / 365);
  return formatadorRelativo.format(anos, "year");
}

export function CapsulasSeladas({ capsulas }: Props) {
  if (capsulas.length === 0) return null;

  return (
    <section className="px-6 py-20 md:px-12 md:py-32">
      <div className="mx-auto max-w-[760px]">
        <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-champagne-deep">
          Cápsulas · VI
        </p>
        <p className="mt-3 font-serif italic text-[18px] text-cocoa-soft">
          cartas a serem abertas no tempo certo
        </p>

        <ul className="mt-12 flex flex-col">
          {capsulas.map((c) => (
            <CapsulaItem key={c.id} capsula={c} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function CapsulaItem({ capsula }: { capsula: CapsulaPublica }) {
  const [aberta, setAberta] = useState(false);
  const desbloqueada = capsula.mensagem !== null && capsula.mensagem !== undefined;
  const data = new Date(capsula.unlock_em);

  return (
    <li className="border-b border-cocoa/8 py-5 md:py-6">
      <div className="flex items-center gap-3 md:gap-5">
        <MiniEnvelope desbloqueada={desbloqueada} aberta={aberta} />

        <div className="flex-1 min-w-0">
          <p className="font-serif italic text-[18px] text-cocoa md:text-[22px]">
            {desbloqueada ? "Carta aberta" : "Cápsula selada"}
          </p>
          <p className="mt-1 font-sans text-[9px] uppercase tracking-[0.18em] text-mauve md:text-[10px] md:tracking-[0.22em]">
            {desbloqueada ? "aberta em" : "abre em"} {formatadorData.format(data)}
          </p>
          {!desbloqueada && (
            <p className="mt-0.5 font-prose text-[12px] italic text-cocoa-soft">
              {tempoAteAbrir(capsula.unlock_em)}
            </p>
          )}
        </div>

        <div className="flex-shrink-0">
          {desbloqueada ? (
            <button
              type="button"
              onClick={() => setAberta((s) => !s)}
              className="font-serif italic text-[14px] text-ruby underline-offset-4 hover:underline"
            >
              {aberta ? "fechar" : "ler"}
            </button>
          ) : (
            <KeyIcon />
          )}
        </div>
      </div>

      <div
        className="overflow-hidden transition-[max-height,opacity] duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
        style={{
          maxHeight: aberta && desbloqueada ? "1200px" : "0px",
          opacity: aberta && desbloqueada ? 1 : 0,
        }}
        aria-hidden={!aberta || !desbloqueada}
      >
        <article className="mt-6 rounded-md bg-paper px-6 py-6 shadow-engrave">
          <p
            className="whitespace-pre-wrap font-prose text-cocoa"
            style={{ fontSize: 17, lineHeight: 1.7 }}
          >
            {capsula.mensagem}
          </p>
        </article>
      </div>
    </li>
  );
}

function MiniEnvelope({ desbloqueada, aberta }: { desbloqueada: boolean; aberta: boolean }) {
  return (
    <svg
      width="64"
      height="40"
      viewBox="0 0 64 40"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <rect
        x="1"
        y="1"
        width="62"
        height="38"
        fill="var(--color-paper)"
        stroke="var(--color-cocoa)"
        strokeOpacity="0.35"
        strokeWidth="0.8"
      />
      <path
        d={aberta ? "M2 2 L 32 14 L 62 2" : "M2 2 L 32 22 L 62 2"}
        fill="none"
        stroke="var(--color-cocoa)"
        strokeOpacity="0.35"
        strokeWidth="0.8"
        style={{ transition: "all 600ms cubic-bezier(0.22,0.61,0.36,1)" }}
      />
      {!desbloqueada && (
        <circle cx="32" cy="22" r="6" fill="var(--color-ruby-deep)" />
      )}
      {!desbloqueada && (
        <text
          x="32"
          y="25"
          textAnchor="middle"
          fontFamily="var(--font-serif)"
          fontStyle="italic"
          fontSize="7"
          fill="var(--color-rose-mist)"
        >
          ✦
        </text>
      )}
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="8"
        cy="12"
        r="4"
        fill="none"
        stroke="var(--color-cocoa-soft)"
        strokeWidth="1.4"
      />
      <path
        d="M12 12 L 22 12 M 18 12 L 18 16 M 22 12 L 22 16"
        stroke="var(--color-cocoa-soft)"
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  );
}
