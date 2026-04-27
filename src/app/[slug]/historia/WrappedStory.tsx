"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Share2 } from "lucide-react";

type Track = { id: string; name: string; artistas: string; albumArt: string | null };

type Props = {
  slug: string;
  plano: "bilhete" | "eterno";
  nomes: { pessoa1: string; pessoa2: string };
  dataInicio: string;
  dataRomanos: string;
  diasJuntos: number;
  diasExtenso: string;
  diasFmt: string;
  luas: string;
  batidas: string;
  natais: string;
  diasDosNamorados: string;
  trecho: string;
  fotoUrl: string | null;
  track: Track | null;
  capsulaUnlock: string | null;
  appUrl: string;
};

const SLIDE_MS = 5500;

const dataLongoFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

type Slide = {
  id: string;
  render: () => React.ReactNode;
  bg?: string;
};

export function WrappedStory(p: Props) {
  const slides = useMemo<Slide[]>(() => buildSlides(p), [p]);
  const [i, setI] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);
  const inicioRef = useRef<number>(performance.now());
  const acumuladoRef = useRef<number>(0);

  useEffect(() => {
    inicioRef.current = performance.now();
    acumuladoRef.current = 0;
    setProgresso(0);
  }, [i]);

  useEffect(() => {
    if (pausado) return;
    const id = setInterval(() => {
      const agora = performance.now();
      const decorrido = acumuladoRef.current + (agora - inicioRef.current);
      const pct = Math.min(1, decorrido / SLIDE_MS);
      setProgresso(pct);
      if (pct >= 1) {
        if (i < slides.length - 1) setI(i + 1);
        else setPausado(true);
      }
    }, 60);
    return () => clearInterval(id);
  }, [pausado, i, slides.length]);

  function pause() {
    if (pausado) return;
    acumuladoRef.current += performance.now() - inicioRef.current;
    setPausado(true);
  }
  function resume() {
    if (!pausado) return;
    inicioRef.current = performance.now();
    setPausado(false);
  }
  function avancar() {
    if (i < slides.length - 1) setI(i + 1);
  }
  function voltar() {
    if (i > 0) setI(i - 1);
  }

  function compartilhar() {
    if (typeof navigator === "undefined" || !navigator.share) return;
    navigator
      .share({
        title: `História de ${p.nomes.pessoa1} & ${p.nomes.pessoa2}`,
        text: `${p.nomes.pessoa1} & ${p.nomes.pessoa2}, em ${p.diasFmt} dias.`,
        url: `${p.appUrl}/${p.slug}`,
      })
      .catch(() => {});
  }

  async function salvarSlideAtual() {
    if (!slideRef.current || salvando) return;
    setSalvando(true);
    pause();
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(slideRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#2A1518",
      });
      const link = document.createElement("a");
      link.download = `nossacarta-${p.slug}-${slides[i].id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("[wrapped salvar]", err);
    } finally {
      setSalvando(false);
    }
  }

  const slide = slides[i];

  return (
    <div
      className="relative mx-auto flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-cocoa text-rose-mist"
      onMouseDown={pause}
      onMouseUp={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      {/* Progress bars */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex gap-1 px-3 pt-3">
        {slides.map((s, idx) => (
          <div key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-rose-mist/25">
            <div
              className="h-full bg-rose-mist transition-[width]"
              style={{
                width: idx < i ? "100%" : idx === i ? `${progresso * 100}%` : "0%",
                transitionDuration: idx === i ? "60ms" : "0ms",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header brand */}
      <header className="pointer-events-none absolute left-0 right-0 top-6 z-20 flex items-center justify-between px-5">
        <div className="flex items-baseline gap-1.5">
          <span className="font-script text-[20px] leading-none text-rose-mist">Nossa</span>
          <span className="font-serif text-[14px] italic leading-none text-rose-mist/85">Carta</span>
        </div>
        <span className="font-sans text-[9px] uppercase tracking-[0.32em] text-rose-mist/60">
          {p.dataRomanos}
        </span>
      </header>

      {/* Tap zones */}
      <button
        type="button"
        aria-label="anterior"
        onClick={voltar}
        className="pointer-events-auto absolute inset-y-0 left-0 z-10 w-1/3"
      />
      <button
        type="button"
        aria-label="próximo"
        onClick={avancar}
        className="pointer-events-auto absolute inset-y-0 right-0 z-10 w-1/3"
      />

      {/* Slide content */}
      <div
        ref={slideRef}
        className="relative z-0 flex h-full w-full flex-col items-center justify-center bg-cocoa px-7 text-rose-mist"
        style={slide.bg ? { background: slide.bg } : undefined}
      >
        {slide.render()}
      </div>

      {/* Footer share */}
      <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-20 flex flex-col items-center gap-2">
        {i === slides.length - 1 ? (
          <a
            href={`${p.appUrl}/${p.slug}`}
            className="pointer-events-auto rounded-full bg-rose-mist px-6 py-2.5 font-sans text-[10px] uppercase tracking-[0.28em] text-cocoa shadow-foil"
          >
            Abrir a carta →
          </a>
        ) : (
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={salvarSlideAtual}
              disabled={salvando}
              aria-label="salvar imagem"
              className="flex items-center gap-1.5 rounded-full border border-rose-mist/30 bg-cocoa/40 px-3.5 py-1.5 font-sans text-[9px] uppercase tracking-[0.24em] text-rose-mist/85 backdrop-blur disabled:opacity-50"
            >
              <Download size={11} strokeWidth={1.6} />
              {salvando ? "salvando" : "salvar"}
            </button>
            <button
              type="button"
              onClick={compartilhar}
              aria-label="compartilhar"
              className="flex items-center gap-1.5 rounded-full border border-rose-mist/30 bg-cocoa/40 px-3.5 py-1.5 font-sans text-[9px] uppercase tracking-[0.24em] text-rose-mist/85 backdrop-blur"
            >
              <Share2 size={11} strokeWidth={1.6} />
              compartilhar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function buildSlides(p: Props): Slide[] {
  const slides: Slide[] = [];

  // 1. Capa
  slides.push({
    id: "capa",
    render: () => (
      <>
        <p className="font-sans text-[9px] uppercase tracking-[0.42em] text-champagne">
          Volume único · I
        </p>
        <p
          className="mt-10 font-script leading-[0.85] text-rose-mist"
          style={{ fontSize: "clamp(64px, 16vw, 88px)" }}
        >
          {p.nomes.pessoa1}
        </p>
        <p className="my-4 font-script italic text-champagne" style={{ fontSize: "44px" }}>&amp;</p>
        <p
          className="font-script leading-[0.85] text-rose-mist"
          style={{ fontSize: "clamp(64px, 16vw, 88px)" }}
        >
          {p.nomes.pessoa2}
        </p>
        <p className="mt-12 font-serif italic text-[16px] text-rose-mist/70">{p.dataRomanos}</p>
      </>
    ),
  });

  // 2. Dias juntos prosa
  slides.push({
    id: "dias",
    render: () => (
      <>
        <p className="font-sans text-[9px] uppercase tracking-[0.42em] text-champagne">II</p>
        <p
          className="mt-10 font-serif italic leading-[1.1] text-rose-mist"
          style={{ fontSize: "clamp(28px, 7vw, 38px)" }}
        >
          Hoje faz
        </p>
        <p
          className="mt-2 font-serif italic leading-[1.1] text-rose-mist"
          style={{ fontSize: "clamp(22px, 5.5vw, 30px)" }}
        >
          {capitalizar(p.diasExtenso)} dias.
        </p>
        <p
          className="mt-6 font-script text-ruby"
          style={{ fontSize: "clamp(120px, 28vw, 200px)", lineHeight: 0.8, transform: "rotate(-3deg)" }}
        >
          {p.diasFmt}
        </p>
      </>
    ),
  });

  // 3. Luas
  slides.push({
    id: "luas",
    render: () => (
      <>
        <p className="font-sans text-[9px] uppercase tracking-[0.42em] text-champagne">III</p>
        <p
          className="mt-10 font-script text-ruby"
          style={{ fontSize: "clamp(140px, 32vw, 220px)", lineHeight: 0.85 }}
        >
          {p.luas}
        </p>
        <p
          className="mt-6 font-serif italic text-rose-mist"
          style={{ fontSize: "clamp(28px, 6vw, 38px)" }}
        >
          luas cheias
        </p>
        <p
          className="mt-2 font-serif italic text-rose-mist/70"
          style={{ fontSize: "clamp(16px, 4vw, 22px)" }}
        >
          entre nós
        </p>
      </>
    ),
  });

  // 4. Batidas
  slides.push({
    id: "batidas",
    render: () => (
      <>
        <p className="font-sans text-[9px] uppercase tracking-[0.42em] text-champagne">IV</p>
        <p
          className="mt-10 font-serif italic text-rose-mist"
          style={{ fontSize: "clamp(22px, 5.5vw, 28px)" }}
        >
          E o coração bateu
        </p>
        <p
          className="mt-4 font-script text-ruby"
          style={{ fontSize: "clamp(64px, 14vw, 96px)", lineHeight: 0.9, transform: "rotate(-2deg)" }}
        >
          {p.batidas}
        </p>
        <p
          className="mt-3 font-serif italic text-rose-mist"
          style={{ fontSize: "clamp(22px, 5.5vw, 28px)" }}
        >
          vezes.
        </p>
        <p className="mt-6 font-prose text-[12px] italic text-rose-mist/55">
          (cálculo aproximado, cada batida real)
        </p>
      </>
    ),
  });

  // 5. Trecho
  slides.push({
    id: "trecho",
    render: () => (
      <>
        <p className="font-sans text-[9px] uppercase tracking-[0.42em] text-champagne">V</p>
        <p
          className="mt-10 font-serif italic leading-[1.45] text-rose-mist"
          style={{ fontSize: "clamp(24px, 5vw, 32px)" }}
        >
          <span className="text-champagne text-4xl leading-none">“</span>
          {p.trecho}
          <span className="text-champagne text-4xl leading-none">”</span>
        </p>
      </>
    ),
  });

  // 6. Foto
  if (p.fotoUrl) {
    slides.push({
      id: "foto",
      render: () => (
        <div className="flex flex-col items-center gap-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.42em] text-champagne">VI</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.fotoUrl ?? ""}
            alt="foto destaque"
            className="max-h-[58dvh] w-auto rounded-sm border border-rose-mist/15 object-cover"
            style={{ filter: "saturate(0.95) sepia(0.05)" }}
          />
          <p className="font-serif italic text-[15px] text-rose-mist/75">
            {p.nomes.pessoa1} &amp; {p.nomes.pessoa2}
          </p>
        </div>
      ),
    });
  }

  // 7. Música
  if (p.track) {
    slides.push({
      id: "musica",
      render: () => (
        <div className="flex flex-col items-center gap-6">
          <p className="font-sans text-[9px] uppercase tracking-[0.42em] text-champagne">VII</p>
          {p.track!.albumArt && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.track!.albumArt} alt={p.track!.name} className="h-44 w-44 rounded-sm border border-rose-mist/10 object-cover" />
          )}
          <div className="text-center">
            <p className="font-serif italic text-[22px] text-rose-mist" style={{ lineHeight: 1.2 }}>
              {p.track!.name}
            </p>
            <p className="mt-1 font-serif text-[14px] text-rose-mist/65">{p.track!.artistas}</p>
          </div>
          <p className="font-prose text-[12px] italic text-rose-mist/55">
            a trilha desta história
          </p>
        </div>
      ),
    });
  }

  // 8. Cápsula (Eterno)
  if (p.capsulaUnlock) {
    slides.push({
      id: "capsula",
      render: () => (
        <>
          <p className="font-sans text-[9px] uppercase tracking-[0.42em] text-champagne">VIII</p>
          <svg width="80" height="56" viewBox="0 0 80 56" className="mt-10" aria-hidden>
            <rect x="2" y="2" width="76" height="52" fill="none" stroke="rgba(251,239,232,0.7)" strokeWidth="1" />
            <path d="M2 2 L40 30 L78 2" fill="none" stroke="rgba(251,239,232,0.7)" strokeWidth="1" />
            <circle cx="40" cy="30" r="7" fill="#7C0E1D" />
          </svg>
          <p
            className="mt-8 font-serif italic text-rose-mist"
            style={{ fontSize: "clamp(22px, 5.5vw, 30px)" }}
          >
            Uma cápsula selada
          </p>
          <p
            className="mt-4 font-script text-champagne"
            style={{ fontSize: "clamp(40px, 9vw, 60px)" }}
          >
            {dataLongoFmt.format(new Date(p.capsulaUnlock!))}
          </p>
          <p className="mt-3 font-serif italic text-[14px] text-rose-mist/70">
            uma carta para quem virmos a ser
          </p>
        </>
      ),
    });
  }

  // 9. CTA final
  slides.push({
    id: "cta",
    render: () => (
      <>
        <p className="font-sans text-[9px] uppercase tracking-[0.42em] text-champagne">colofão</p>
        <p
          className="mt-10 font-serif italic leading-[1.2] text-rose-mist"
          style={{ fontSize: "clamp(22px, 5.5vw, 30px)" }}
        >
          A história inteira está em
        </p>
        <p
          className="mt-6 font-script text-ruby"
          style={{ fontSize: "clamp(36px, 9vw, 56px)", lineHeight: 1, transform: "rotate(-2deg)" }}
        >
          nossacarta.love
        </p>
        <p className="mt-2 font-mono text-[14px] text-rose-mist/85">
          /{p.slug}
        </p>
        <p className="mt-10 font-prose text-[12px] italic text-rose-mist/60">
          uma edição única, dedicada a {p.nomes.pessoa2}
        </p>
      </>
    ),
  });

  return slides;
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
