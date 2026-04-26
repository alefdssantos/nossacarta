"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  paraNome: string;
  dataInicioRomanos: string;
  cidade?: string;
  iniciaisMonograma: string;
};

export function CapaEnvelope({ paraNome, dataInicioRomanos, cidade, iniciaisMonograma }: Props) {
  const [estado, setEstado] = useState<"fechado" | "abrindo" | "aberto">("fechado");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (estado !== "abrindo") return;
    const t = setTimeout(() => setEstado("aberto"), 1600);
    return () => clearTimeout(t);
  }, [estado]);

  useEffect(() => {
    if (estado !== "aberto") return;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = "";
    });
    return () => cancelAnimationFrame(id);
  }, [estado]);

  if (estado === "aberto") return null;

  return (
    <div
      ref={containerRef}
      data-estado={estado}
      className="fixed inset-0 z-50 flex items-center justify-center bg-rose-mist transition-opacity duration-700"
      style={{
        opacity: estado === "abrindo" ? 0 : 1,
        pointerEvents: estado === "abrindo" ? "none" : "auto",
      }}
      aria-hidden={estado === "abrindo"}
    >
      <div
        className="relative"
        style={{
          width: "min(86vw, 560px)",
          aspectRatio: "3/2",
          transform: "rotate(-2deg)",
          animation: "envelope-float 6s ease-in-out infinite",
        }}
      >
        <EnvelopeSvg paraNome={paraNome} dataInicioRomanos={dataInicioRomanos} cidade={cidade} />
        <SealOverlay
          iniciais={iniciaisMonograma}
          quebrado={estado === "abrindo"}
          onClick={() => setEstado("abrindo")}
        />
      </div>

      <p className="absolute bottom-12 left-1/2 -translate-x-1/2 font-sans text-[9px] uppercase tracking-[0.32em] text-mauve">
        Toque no lacre para abrir
      </p>

      <style jsx>{`
        @keyframes envelope-float {
          0%, 100% { transform: rotate(-2deg) translateY(0); }
          50% { transform: rotate(-2deg) translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

function EnvelopeSvg({
  paraNome,
  dataInicioRomanos,
  cidade,
}: {
  paraNome: string;
  dataInicioRomanos: string;
  cidade?: string;
}) {
  return (
    <svg
      viewBox="0 0 720 480"
      className="absolute inset-0 h-full w-full drop-shadow-[0_30px_60px_-30px_rgba(74,8,16,0.25)]"
      aria-hidden="true"
    >
      <rect x="6" y="6" width="708" height="468" fill="var(--color-paper)" stroke="var(--color-cocoa)" strokeOpacity="0.35" strokeWidth="1.5" />
      <rect x="9" y="9" width="702" height="462" fill="none" stroke="var(--color-cocoa)" strokeOpacity="0.12" strokeWidth="1" />

      <g transform="translate(80, 180)">
        <text fontFamily="var(--font-script)" fontSize="32" fill="var(--color-ruby)">Para</text>
        <text x="0" y="56" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="56" fill="var(--color-cocoa)">
          {paraNome}
        </text>
        <line x1="0" y1="80" x2="280" y2="80" stroke="var(--color-champagne)" strokeWidth="0.8" />
        <text x="0" y="110" fontFamily="var(--font-sans)" fontSize="11" letterSpacing="3.2" fill="var(--color-mauve)">
          ENTREGUE COM AMOR · BRASIL
        </text>
        {cidade && (
          <text x="0" y="138" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="16" fill="var(--color-mauve)">
            {cidade}
          </text>
        )}
      </g>

      <g transform="translate(560, 60)">
        <rect x="0" y="0" width="100" height="120" fill="var(--color-paper)" stroke="var(--color-cocoa)" strokeOpacity="0.4" strokeDasharray="3 2" />
        <g transform="translate(50, 60)">
          <path d="M0,-12 C-4,-18 -16,-18 -16,-8 C-16,2 0,12 0,12 C0,12 16,2 16,-8 C16,-18 4,-18 0,-12 Z"
                fill="var(--color-champagne)" opacity="0.85" />
        </g>
        <circle cx="50" cy="60" r="32" fill="none" stroke="var(--color-ruby)" strokeWidth="0.8" strokeDasharray="2 1.5" transform="rotate(-12 50 60)" />
        <text x="50" y="64" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="8" letterSpacing="1.2" fill="var(--color-ruby)" transform="rotate(-12 50 60)">
          {dataInicioRomanos}
        </text>
      </g>
    </svg>
  );
}

function SealOverlay({
  iniciais,
  quebrado,
  onClick,
}: {
  iniciais: string;
  quebrado: boolean;
  onClick: () => void;
}) {
  const [partes] = iniciais.split("&");
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir a carta"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none"
      style={{
        width: 96,
        height: 96,
        animation: quebrado ? undefined : "seal-breathe 4s ease-in-out infinite",
      }}
    >
      <svg viewBox="0 0 96 96" className="h-full w-full">
        <defs>
          <radialGradient id="seal-gradient" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#C0203B" />
            <stop offset="60%" stopColor="#7C0E1D" />
            <stop offset="100%" stopColor="#4A0810" />
          </radialGradient>
        </defs>
        <g
          style={{
            transition: "transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: quebrado ? "scale(1.06) rotate(8deg)" : "scale(1) rotate(0)",
            transformOrigin: "48px 48px",
          }}
        >
          <g
            style={{
              transition: "transform 600ms ease-out, opacity 600ms ease-out",
              transform: quebrado ? "translate(-12px, 6px) rotate(-8deg)" : "none",
              opacity: quebrado ? 0.7 : 1,
              transformOrigin: "48px 48px",
            }}
          >
            <circle cx="48" cy="48" r="38" fill="url(#seal-gradient)" />
            <ellipse cx="38" cy="36" rx="9" ry="5" fill="#D8526A" opacity="0.28" />
            <circle cx="68" cy="78" r="3" fill="#7C0E1D" />
            <circle cx="76" cy="68" r="2" fill="#7C0E1D" />
          </g>
          <g
            style={{
              transition: "transform 600ms ease-out, opacity 600ms ease-out",
              transform: quebrado ? "translate(14px, -2px) rotate(12deg)" : "none",
              opacity: quebrado ? 0.7 : 1,
              transformOrigin: "48px 48px",
            }}
          >
            <path
              d="M48 10 A 38 38 0 0 1 86 48 L 48 48 Z"
              fill="url(#seal-gradient)"
              opacity={quebrado ? 0.95 : 0}
            />
          </g>
          <text
            x="48"
            y="56"
            textAnchor="middle"
            fontFamily="var(--font-serif)"
            fontStyle="italic"
            fontWeight="600"
            fontSize="26"
            fill="#FBEFE8"
            style={{
              transition: "opacity 400ms",
              opacity: quebrado ? 0 : 0.95,
            }}
          >
            {partes ?? iniciais.charAt(0)}
          </text>
        </g>
      </svg>

      <style jsx>{`
        @keyframes seal-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
      `}</style>
    </button>
  );
}
