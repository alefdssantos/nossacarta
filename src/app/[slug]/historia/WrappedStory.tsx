"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Heart, Mail, Moon, Pause, Play, Share2, Star, Volume2, VolumeX } from "lucide-react";

type Track = { id: string; name: string; artistas: string; albumArt: string | null; previewUrl: string | null };

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
  fotoUrls: string[];
  track: Track | null;
  capsulaUnlock: string | null;
  appUrl: string;
};

const SLIDE_MS = 5500;

const dataLongoFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

type Slide = {
  id: string;
  render: (extras: SlideExtras) => React.ReactNode;
  bg?: string;
  pausaAuto?: boolean;
  justify?: "center" | "start";
};

type SlideExtras = {
  fotoIndex: number;
  setFotoIndex: (n: number) => void;
  fotoTotal: number;
  musicaPausada: boolean;
  toggleMusica: () => void;
};

export function WrappedStory(p: Props) {
  const slides = useMemo<Slide[]>(() => buildSlides(p), [p]);
  const [i, setI] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [fotoIndex, setFotoIndex] = useState(0);
  const [musicaPausada, setMusicaPausada] = useState(false);
  const [imagemSalvar, setImagemSalvar] = useState<string | null>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const inicioRef = useRef<number>(performance.now());
  const acumuladoRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const slidePausaAuto = slides[i]?.pausaAuto ?? false;

  // Preload all images on mount
  useEffect(() => {
    const urls = [
      ...p.fotoUrls,
      p.track?.albumArt ?? null,
    ].filter((u): u is string => !!u);
    urls.forEach((url) => { const img = new Image(); img.src = url; });
  }, []);

  // Audio preview
  useEffect(() => {
    if (!p.track?.previewUrl) return;
    const audio = new Audio(p.track.previewUrl);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    audio.play().catch(() => {});
    return () => { audio.pause(); audio.src = ""; audioRef.current = null; };
  }, []);

  // Sincroniza pausa da história com o áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (pausado || musicaPausada) audio.pause();
    else audio.play().catch(() => {});
  }, [pausado, musicaPausada]);

  useEffect(() => {
    inicioRef.current = performance.now();
    acumuladoRef.current = 0;
    setProgresso(0);
  }, [i]);

  // Reset foto index when changing slides
  useEffect(() => { setFotoIndex(0); }, [i]);

  useEffect(() => {
    if (pausado || slidePausaAuto) return;
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
  }, [pausado, slidePausaAuto, i, slides.length]);

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
      // Mostra overlay com a imagem — iOS: segurar → Salvar Foto; desktop: botão download
      setImagemSalvar(dataUrl);
    } catch (err) {
      console.error("[wrapped salvar]", err);
    } finally {
      setSalvando(false);
    }
  }

  const slide = slides[i];

  return (
    <div
      className="relative mx-auto flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-cocoa text-rose-mist [&_*]:focus-visible:outline-none"
      onMouseDown={pause}
      onMouseUp={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      {/* Overlay salvar imagem */}
      {imagemSalvar && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagemSalvar} alt="slide" className="max-h-[75dvh] w-auto rounded-sm" />
          <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.28em] text-white/60">
            Segure a imagem para salvar na galeria
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={imagemSalvar}
              download={`nossacarta-${p.slug}.png`}
              className="rounded-full bg-white/15 px-5 py-2.5 font-sans text-[10px] uppercase tracking-[0.24em] text-white"
            >
              Baixar
            </a>
            <button
              type="button"
              onClick={() => { setImagemSalvar(null); resume(); }}
              className="rounded-full border border-white/20 px-5 py-2.5 font-sans text-[10px] uppercase tracking-[0.24em] text-white/70"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

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
      <header className="absolute left-0 right-0 top-6 z-20 flex items-center justify-between px-5">
        <div className="pointer-events-none flex items-baseline gap-1.5">
          <span className="font-script text-[20px] leading-none text-rose-mist">Nossa</span>
          <span className="font-serif text-[14px] italic leading-none text-rose-mist/85">Carta</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="pointer-events-none font-sans text-[9px] uppercase tracking-[0.32em] text-rose-mist/60">
            {p.dataRomanos}
          </span>
          <button
            type="button"
            aria-label={pausado ? "continuar" : "pausar"}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => (pausado ? resume() : pause())}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-mist/30 bg-cocoa/40 backdrop-blur focus:outline-none"
          >
            {pausado
              ? <Play size={12} strokeWidth={1.8} className="text-rose-mist/80 translate-x-px" />
              : <Pause size={12} strokeWidth={1.8} className="text-rose-mist/80" />}
          </button>
        </div>
      </header>

      {/* Tap zones with visible arrows */}
      <button
        type="button"
        aria-label="anterior"
        onClick={voltar}
        className="pointer-events-auto absolute inset-y-0 left-0 z-10 flex w-1/3 items-center justify-start pl-2 focus:outline-none"
      >
        {i > 0 && <ChevronLeft size={22} strokeWidth={1.4} className="text-rose-mist/40" />}
      </button>
      <button
        type="button"
        aria-label="próximo"
        onClick={avancar}
        className="pointer-events-auto absolute inset-y-0 right-0 z-10 flex w-1/3 items-center justify-end pr-2 focus:outline-none"
      >
        {i < slides.length - 1 && <ChevronRight size={22} strokeWidth={1.4} className="text-rose-mist/40" />}
      </button>

      {/* Slide content */}
      <div
        ref={slideRef}
        className={`relative z-0 flex h-full w-full flex-col items-center overflow-hidden px-7 pb-16 pt-20 text-rose-mist ${slide.justify === "start" ? "justify-start" : "justify-center"}`}
        style={{ background: slide.bg ?? "#4A2D31" }}
      >
        {slide.render({ fotoIndex, setFotoIndex, fotoTotal: p.fotoUrls.length, musicaPausada, toggleMusica: () => setMusicaPausada((v) => !v) })}
      </div>

      {/* Footer share */}
      <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-20 flex flex-col items-center gap-2">
        {i === slides.length - 1 && (
          <a
            href={`${p.appUrl}/${p.slug}`}
            className="pointer-events-auto rounded-full bg-rose-mist px-6 py-2.5 font-sans text-[10px] uppercase tracking-[0.28em] text-cocoa shadow-foil"
          >
            Abrir a carta →
          </a>
        )}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={salvarSlideAtual}
            disabled={salvando}
            aria-label="salvar imagem"
            className="flex items-center gap-1.5 rounded-full border border-rose-mist/30 bg-cocoa/40 px-3.5 py-1.5 font-sans text-[9px] uppercase tracking-[0.24em] text-rose-mist/85 backdrop-blur focus:outline-none disabled:opacity-50"
          >
            <Download size={11} strokeWidth={1.6} />
            {salvando ? "salvando" : "salvar"}
          </button>
          <button
            type="button"
            onClick={compartilhar}
            aria-label="compartilhar"
            className="flex items-center gap-1.5 rounded-full border border-rose-mist/30 bg-cocoa/40 px-3.5 py-1.5 font-sans text-[9px] uppercase tracking-[0.24em] text-rose-mist/85 backdrop-blur focus:outline-none"
          >
            <Share2 size={11} strokeWidth={1.6} />
            compartilhar
          </button>
        </div>
      </div>
    </div>
  );
}

function buildSlides(p: Props): Slide[] {
  const slides: Slide[] = [];

  // 1. Capa
  slides.push({
    id: "capa",
    bg: "linear-gradient(160deg, #2A1518 0%, #4A2D31 100%)",
    render: (_) => (
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
    bg: "linear-gradient(180deg, #4A2D31 0%, #5C3840 100%)",
    render: (_) => (
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
    bg: "linear-gradient(200deg, #1A0D10 0%, #3A1A1E 100%)",
    render: (_) => (
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
    bg: "linear-gradient(170deg, #5C2030 0%, #3A1A1E 100%)",
    render: (_) => (
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

  // 5. Trecho — texto completo, usa tela inteira
  slides.push({
    id: "trecho",
    bg: "linear-gradient(160deg, #3D2428 0%, #4A2D31 60%, #3A1A1E 100%)",
    render: (_) => (
      <>
        <p className="font-sans text-[9px] uppercase tracking-[0.42em] text-champagne">V</p>
        <div className="mt-4 w-full">
          <p className="font-serif text-[40px] leading-none text-champagne/50">&ldquo;</p>
          <div
            className="font-serif italic leading-[1.6] text-rose-mist"
            style={{ fontSize: "clamp(12px, 3.2vw, 16px)" }}
          >
            {p.trecho.split("\n").map((linha, idx) =>
              linha.trim() === "" ? (
                <br key={idx} />
              ) : (
                <p key={idx} className="mb-1.5 last:mb-0">
                  {linha}
                </p>
              )
            )}
          </div>
          <p className="mt-1 text-right font-serif text-[40px] leading-none text-champagne/50">&rdquo;</p>
        </div>
      </>
    ),
  });

  // 6. Fotos — carrossel, auto-advance pausado
  if (p.fotoUrls.length > 0) {
    slides.push({
      id: "foto",
      bg: "#0F0709",
      pausaAuto: true,
      render: ({ fotoIndex, setFotoIndex, fotoTotal }) => (
        <>
          {/* Foto centralizada */}
          <div className="flex flex-col items-center">
            <p className="font-sans text-[9px] uppercase tracking-[0.42em] text-champagne">VI</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={fotoIndex}
              src={p.fotoUrls[fotoIndex]}
              alt={`foto ${fotoIndex + 1}`}
              className="mt-4 max-h-[56dvh] w-auto rounded-sm border border-rose-mist/15 object-cover"
              style={{ filter: "saturate(0.95) sepia(0.05)" }}
            />
            <p className="mt-3 font-serif italic text-[14px] text-rose-mist/70">
              {p.nomes.pessoa1} &amp; {p.nomes.pessoa2}
            </p>
          </div>

          {/* Navegação fixada no fundo do slide, acima dos botões do footer */}
          {fotoTotal > 1 && (
            <div className="absolute bottom-20 left-0 right-0 z-20 flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label="foto anterior"
                onClick={(e) => { e.stopPropagation(); setFotoIndex(Math.max(0, fotoIndex - 1)); }}
                disabled={fotoIndex === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-mist/30 bg-rose-mist/10 disabled:opacity-25"
              >
                <ChevronLeft size={16} strokeWidth={1.5} className="text-rose-mist" />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: fotoTotal }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`ir para foto ${idx + 1}`}
                    onClick={(e) => { e.stopPropagation(); setFotoIndex(idx); }}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: idx === fotoIndex ? 20 : 6,
                      background: idx === fotoIndex ? "var(--color-champagne)" : "rgba(251,239,232,0.3)",
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="próxima foto"
                onClick={(e) => { e.stopPropagation(); setFotoIndex(Math.min(fotoTotal - 1, fotoIndex + 1)); }}
                disabled={fotoIndex === fotoTotal - 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-mist/30 bg-rose-mist/10 disabled:opacity-25"
              >
                <ChevronRight size={16} strokeWidth={1.5} className="text-rose-mist" />
              </button>
            </div>
          )}
        </>
      ),
    });
  }

  // 7. Música
  if (p.track) {
    slides.push({
      id: "musica",
      bg: "linear-gradient(180deg, #1A0D10 0%, #3A1A1E 100%)",
      render: ({ musicaPausada, toggleMusica }) => (
        <div className="flex w-full flex-col items-center gap-4">
          <p className="font-sans text-[9px] uppercase tracking-[0.42em] text-champagne">VII</p>
          <p className="font-serif italic text-[13px] text-rose-mist/55">a trilha desta história</p>
          {/* Embed Spotify — quadrado centralizado, play no centro */}
          <iframe
            src={`https://open.spotify.com/embed/track/${p.track!.id}?utm_source=generator&theme=0`}
            width="232"
            height="232"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl border-0"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          />
          {/* Botão pausar preview se disponível */}
          {p.track!.previewUrl && (
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); toggleMusica(); }}
              className="flex items-center gap-2 rounded-full border border-rose-mist/30 bg-rose-mist/10 px-5 py-2 font-sans text-[10px] uppercase tracking-[0.24em] text-rose-mist/80"
            >
              {musicaPausada
                ? <><Volume2 size={12} strokeWidth={1.6} /> tocar preview</>
                : <><VolumeX size={12} strokeWidth={1.6} /> pausar preview</>}
            </button>
          )}
        </div>
      ),
    });
  }

  // 8. Cápsula (Eterno)
  if (p.capsulaUnlock) {
    slides.push({
      id: "capsula",
      bg: "linear-gradient(200deg, #2A1518 0%, #1A0D10 100%)",
      render: (_) => (
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

  // 9. CTA final — resumo estilo Wrapped, instagramável
  slides.push({
    id: "cta",
    bg: "linear-gradient(175deg, #0F0709 0%, #2A1518 40%, #7C0E1D 100%)",
    render: (_) => (
      <div className="flex w-full flex-col items-center text-center">
        {/* Brand */}
        <p className="font-script text-[18px] leading-none text-champagne/70">NossaCarta</p>

        {/* Nomes */}
        <p
          className="mt-4 font-script leading-[0.88] text-rose-mist"
          style={{ fontSize: "clamp(38px, 9vw, 56px)" }}
        >
          {p.nomes.pessoa1}
        </p>
        <p className="font-script italic text-champagne/60" style={{ fontSize: 28 }}>&amp;</p>
        <p
          className="font-script leading-[0.88] text-rose-mist"
          style={{ fontSize: "clamp(38px, 9vw, 56px)" }}
        >
          {p.nomes.pessoa2}
        </p>

        {/* Dias — destaque */}
        <p
          className="mt-5 font-script text-ruby"
          style={{ fontSize: "clamp(80px, 20vw, 120px)", lineHeight: 0.82 }}
        >
          {p.diasFmt}
        </p>
        <p className="mt-1 font-sans text-[9px] uppercase tracking-[0.38em] text-rose-mist/55">
          dias juntos
        </p>

        {/* Grid stats */}
        <div className="mt-5 grid w-full grid-cols-2 gap-2">
          {[
            { n: p.luas, icon: <Moon size={14} strokeWidth={1.4} />, label: "luas cheias" },
            { n: p.natais, icon: <Star size={14} strokeWidth={1.4} />, label: "natais" },
            { n: p.batidas, icon: <Heart size={14} strokeWidth={1.4} />, label: "batidas" },
            { n: p.diasDosNamorados, icon: <Mail size={14} strokeWidth={1.4} />, label: "dia dos namorados" },
          ].map(({ n, icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-md py-3"
              style={{ background: "rgba(251,239,232,0.06)", border: "1px solid rgba(251,239,232,0.08)" }}
            >
              <span className="text-rose-mist/50 leading-none">{icon}</span>
              <span
                className="mt-1 font-script text-champagne"
                style={{ fontSize: "clamp(22px, 5.5vw, 32px)", lineHeight: 0.9 }}
              >
                {n}
              </span>
              <span className="mt-1 font-sans text-[7px] uppercase tracking-[0.2em] text-rose-mist/50">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* URL */}
        <p className="mt-5 font-sans text-[9px] uppercase tracking-[0.3em] text-rose-mist/40">
          nossacarta.love/{p.slug}
        </p>
      </div>
    ),
  });

  return slides;
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
