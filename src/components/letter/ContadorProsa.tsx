"use client";

import { useEffect, useState } from "react";
import { calcularMarcos, formatarBR } from "@/lib/cartas/marcos";
import { porExtenso } from "@/lib/cartas/numero-extenso";
import { Filete } from "./Filete";

type Props = {
  dataInicio: string;
};

// Snapshot determinístico (UTC midnight da dataInicio + 1 dia) usado no SSR e
// no primeiro render cliente — evita hydration mismatch. Após mount, useEffect
// passa pra Date() em tempo real.
function snapshotInicial(dataInicio: string): Date {
  const inicio = new Date(`${dataInicio}T00:00:00-03:00`);
  return new Date(Math.max(inicio.getTime(), Date.UTC(2026, 3, 27)));
}

export function ContadorProsa({ dataInicio }: Props) {
  const [agora, setAgora] = useState<Date>(() => snapshotInicial(dataInicio));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAgora(new Date());
    const id = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const m = calcularMarcos(dataInicio, agora);
  const ext = porExtenso(m.dias);

  return (
    <section className="px-6 py-32 md:px-12">
      <div className="mx-auto max-w-[760px] text-center">
        <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-champagne-deep">
          Contagem · II
        </p>

        <p
          className="mt-10 font-serif italic text-cocoa"
          style={{ fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 1.15, fontWeight: 500 }}
        >
          Hoje faz {ext} dias.
        </p>

        <p
          className="font-script text-ruby"
          style={{
            fontSize: "clamp(96px, 18vw, 184px)",
            lineHeight: 0.85,
            transform: "rotate(-3deg)",
            display: "inline-block",
            marginTop: "12px",
          }}
        >
          {formatarBR(m.dias)}
        </p>

        <p
          className="mt-10 font-sans text-[11px] uppercase tracking-[0.3em] text-mauve"
          suppressHydrationWarning
        >
          {mounted ? (
            <>
              Agora são {String(m.horas).padStart(2, "0")} h{" "}
              {String(m.minutos).padStart(2, "0")} min{" "}
              {String(m.segundos).padStart(2, "0")} seg
            </>
          ) : (
            <>&nbsp;</>
          )}
        </p>

        <div className="mt-14">
          <Filete />
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          <Marco valor={formatarBR(m.luas)} label="Luas cheias" />
          <Marco valor={formatarBR(m.natais)} label="Natais" />
          <Marco valor={formatarBR(m.diasDosNamorados)} label="Dias dos namorados" />
          <Marco valor={formatarBR(m.batidas)} label="Batidas do coração" />
        </ul>

        <p className="mt-12 font-serif italic text-[13px] text-mauve">
          Cálculos aproximados. Cada batida, real.
        </p>
      </div>
    </section>
  );
}

function Marco({ valor, label }: { valor: string; label: string }) {
  return (
    <li className="flex flex-col items-center gap-2 text-center">
      <span className="block h-px w-6 bg-champagne" aria-hidden />
      <span className="font-serif italic text-ruby" style={{ fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 0.85, fontWeight: 500 }}>
        {valor}
      </span>
      <span className="font-sans text-[9px] uppercase tracking-[0.32em] text-cocoa-soft">
        {label}
      </span>
    </li>
  );
}
