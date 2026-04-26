import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { WordReveal } from "@/components/WordReveal";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="relative w-full overflow-x-clip">
      <SiteHeader variant="landing" />
      <Hero />
      <FullChapter id="como-funciona" numeral="I" title="Como funciona">
        <HowItWorks />
      </FullChapter>
      <FullChapter id="eternidades" numeral="II" title="Eternidades">
        <Features />
      </FullChapter>
      <FullChapter id="depoimentos" numeral="III" title="Depoimentos">
        <Testimonials />
      </FullChapter>
      <FullChapter id="tarifa" numeral="IV" title="Tarifa">
        <Pricing />
      </FullChapter>
      <FullChapter id="duvidas" numeral="V" title="Dúvidas">
        <Faq />
      </FullChapter>
      <SiteFooter variant="landing" />
    </div>
  );
}

/* ─────────────────────────────  HERO  ───────────────────────────── */

function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-[1280px] flex-col justify-center px-6 py-6 md:min-h-[calc(100dvh-5rem)] md:px-12 md:py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-8">
        {/* LEFT: Title block */}
        <div className="md:col-span-7 md:pt-2">
          <p
            className="rise-in font-script text-[52px] leading-[0.85] text-ruby md:text-[68px]"
            style={{ animationDelay: "0.18s" }}
          >
            Para você,
          </p>
          <h1
            className="rise-in mt-2 font-serif text-[44px] font-medium italic leading-[0.98] text-cocoa md:mt-3 md:text-[80px] ink-bleed"
            style={{ animationDelay: "0.32s" }}
          >
            a história
            <br />
            <span className="not-italic font-normal">de</span>{" "}
            <span className="italic">nós</span>
            <br />
            <span className="font-serif italic text-ruby-deep">em uma só carta.</span>
          </h1>

          <p
            className="rise-in mt-6 max-w-md font-prose text-[15px] leading-relaxed text-cocoa-soft md:text-base"
            style={{ animationDelay: "0.5s" }}
          >
            Um site escrito a quatro mãos. Contador, fotos, música,
            declaração e cápsulas que se abrem com o tempo. O presente
            que ela vai abrir todo dia, pelo resto da vida.
          </p>

          <div
            className="rise-in mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            style={{ animationDelay: "0.62s" }}
          >
            <a
              href="#tarifa"
              className="group relative inline-flex items-center gap-3 rounded-full bg-ruby px-8 py-4 font-sans text-[12px] uppercase tracking-[0.24em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] transition hover:bg-ruby-deep"
            >
              <span>Criar nossa carta</span>
              <span className="text-[14px] transition group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="/exemplo"
              className="font-prose text-[15px] italic text-cocoa underline decoration-champagne decoration-1 underline-offset-[6px] transition hover:text-ruby hover:decoration-ruby"
            >
              ler um exemplo
            </a>
          </div>

          <div
            className="rise-in mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-[10px] uppercase tracking-[0.32em] text-cocoa-soft/70"
            style={{ animationDelay: "0.78s" }}
          >
            <span>Pronto em 5 minutos</span>
            <span className="text-champagne">✦</span>
            <span>Pagamento único</span>
            <span className="text-champagne">✦</span>
            <span>Pix &amp; cartão</span>
          </div>
        </div>

        {/* RIGHT: Envelope visual */}
        <div className="md:col-span-5">
          <div
            className="rise-in relative mx-auto max-w-[360px]"
            style={{ animationDelay: "0.42s" }}
          >
            <EnvelopeFigure />
            <figcaption className="mt-5 flex items-center justify-center gap-3 font-prose text-[12px] italic text-mauve">
              <span className="h-px w-8 bg-champagne/60" />
              fig. 1 — uma carta selada para você
              <span className="h-px w-8 bg-champagne/60" />
            </figcaption>
          </div>
        </div>
      </div>
    </section>
  );
}

function EnvelopeFigure() {
  return (
    <div className="relative">
      {/* paper card behind */}
      <div className="absolute inset-0 -z-10 translate-x-3 translate-y-4 rotate-[2.5deg] rounded-sm bg-rose-fog/70 shadow-[0_30px_60px_-30px_rgba(74,8,16,0.25)]" />
      <div className="absolute inset-0 -z-20 -translate-x-2 translate-y-7 -rotate-[3deg] rounded-sm bg-rose-powder/60 shadow-[0_30px_60px_-30px_rgba(74,8,16,0.18)]" />

      {/* envelope */}
      <div className="paper relative aspect-[5/7] rounded-sm border border-cocoa/10 shadow-[0_40px_80px_-30px_rgba(74,8,16,0.35),0_8px_20px_-12px_rgba(74,8,16,0.18)]">
        {/* corner ornaments */}
        <Corner className="left-3 top-3" />
        <Corner className="right-3 top-3 rotate-90" />
        <Corner className="left-3 bottom-3 -rotate-90" />
        <Corner className="right-3 bottom-3 rotate-180" />

        {/* address */}
        <div className="absolute left-1/2 top-[26%] w-[70%] -translate-x-1/2 text-center">
          <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-mauve">
            Por mãos do correio
          </p>
          <p className="mt-3 font-script text-3xl text-ruby leading-none">
            à minha
          </p>
          <p className="mt-1 font-serif text-2xl italic text-cocoa">amada</p>
          <div className="mx-auto mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-champagne" />
            <span className="text-champagne text-[10px]">❦</span>
            <span className="h-px w-6 bg-champagne" />
          </div>
          <p className="mt-4 font-prose text-[11px] italic text-mauve">
            12 de junho — 19:30
          </p>
        </div>

        {/* postage stamp */}
        <div className="absolute right-4 top-4 flex h-14 w-12 flex-col items-center justify-center rounded-[2px] border border-dashed border-ruby/40 bg-rose-mist/70 px-1 py-1">
          <span className="font-script text-base text-ruby leading-none">N</span>
          <span className="font-serif text-[8px] italic text-cocoa">eterno</span>
          <span className="mt-0.5 h-px w-4 bg-champagne" />
          <span className="font-sans text-[7px] uppercase tracking-widest text-mauve">
            Brasil
          </span>
        </div>

        {/* wax seal */}
        <WaxSeal />
      </div>

      {/* small caption tab */}
      <div className="absolute -bottom-3 left-6 rotate-[-3deg] bg-paper px-3 py-1 font-sans text-[9px] uppercase tracking-[0.32em] text-cocoa-soft shadow-[0_4px_10px_-6px_rgba(74,8,16,0.4)]">
        N° 001 / nossacarta.love
      </div>
    </div>
  );
}

function Corner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={`absolute h-7 w-7 text-champagne/70 ${className}`}
      aria-hidden
    >
      <path
        d="M2 30 Q 2 2 30 2 M 12 30 Q 12 12 30 12 M 8 8 L 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <circle cx="30" cy="2" r="1" fill="currentColor" />
      <circle cx="2" cy="30" r="1" fill="currentColor" />
    </svg>
  );
}

function WaxSeal() {
  return (
    <div
      className="absolute left-1/2 bottom-[14%] -translate-x-1/2"
      style={{ animation: "seal-pulse 4.5s ease-in-out infinite" }}
    >
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-ruby via-ruby-deep to-ruby-ink shadow-[0_10px_18px_-6px_rgba(74,8,16,0.55),inset_0_1px_2px_rgba(255,200,180,0.4),inset_0_-3px_6px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-1.5 rounded-full border border-rose-mist/30" />
        <div className="text-center">
          <div className="font-script text-3xl text-rose-mist/95 leading-none">
            n
          </div>
          <div className="font-serif text-[8px] italic uppercase tracking-[0.3em] text-rose-mist/80">
            sealed
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────  FULL CHAPTER WRAPPER  ───────────────────────────── */

function FullChapter({
  id,
  numeral,
  title,
  children,
}: {
  id: string;
  numeral: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col md:min-h-[calc(100dvh-5rem)]">
      <ChapterDivider id={id} numeral={numeral} title={title} />
      <div className="flex flex-1 items-center">
        <div className="w-full">{children}</div>
      </div>
    </section>
  );
}

/* ─────────────────────────────  CHAPTER DIVIDER  ───────────────────────────── */

function ChapterDivider({
  numeral,
  title,
  id,
}: {
  numeral: string;
  title: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className="relative mx-auto w-full max-w-[1280px] px-6 py-10 md:px-12 md:py-14"
    >
      <Reveal className="flex items-center gap-6">
        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-champagne-deep">
          Capítulo {numeral}
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-champagne/60 via-champagne/30 to-transparent" />
        <span className="font-script text-2xl text-ruby italic">{title}</span>
        <span className="h-px flex-1 bg-gradient-to-l from-champagne/60 via-champagne/30 to-transparent" />
        <span className="font-serif text-xl italic text-cocoa-soft hidden md:inline">
          ❦
        </span>
      </Reveal>
    </div>
  );
}

/* ─────────────────────────────  HOW IT WORKS  ───────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      n: "I.",
      title: "Conte a história",
      caption: "Data do primeiro olhar, fotos, música, declaração.",
      body:
        "Em cinco minutos você reúne os pequenos pedaços do que vocês construíram. Sem login complicado, sem papelada — só lembrança e palavra.",
    },
    {
      n: "II.",
      title: "Sele a carta",
      caption: "Pagamento único, Pix ou cartão, e ela está pronta.",
      body:
        "A página é selada na hora. Você recebe um link próprio e um QR Code que cabe em um bilhete impresso, num quadrinho, na manhã do dia.",
    },
    {
      n: "III.",
      title: "Entregue o tempo",
      caption: "Cápsulas que abrem em datas futuras. Para sempre.",
      body:
        "A cada aniversário, mensaversário, primeira viagem, um envelope novo se abre dentro do site. O presente nunca acaba — é uma assinatura sem mensalidade.",
    },
  ];

  return (
    <section className="relative mx-auto max-w-[1280px] px-6 pb-10 md:px-12 md:pb-20">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-14">
        {steps.map((s) => (
          <article key={s.n} className="relative">
            <span className="absolute -left-1 -top-3 font-serif text-[80px] italic leading-none text-rose-fog md:text-[110px]">
              {s.n}
            </span>
            <div className="relative pl-2 pt-10 md:pt-14">
              <h3 className="font-serif text-[28px] italic font-medium text-cocoa md:text-[34px]">
                {s.title}
              </h3>
              <p className="mt-2 font-prose text-[14px] italic text-mauve">
                {s.caption}
              </p>
              <p className="mt-5 max-w-[34ch] font-prose text-[15px] leading-relaxed text-cocoa-soft">
                {s.body}
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="h-px w-10 bg-champagne" />
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-champagne-deep">
                  passo {s.n.replace(".", "")}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────  FEATURES  ───────────────────────────── */

function Features() {
  return (
    <section className="relative mx-auto max-w-[1280px] px-6 pb-12 md:px-12 md:pb-20">
      {/* opening editorial */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-14">
        <aside className="md:col-span-3">
          <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
            Notas do editor
          </p>
          <p className="mt-4 font-prose text-[14px] italic leading-relaxed text-mauve">
            Cada elemento da NossaCarta foi pensado como uma página de papelaria
            antiga — feita para durar mais que a moda.
          </p>
        </aside>
        <div className="md:col-span-9">
          <p className="drop-cap font-prose text-[18px] leading-[1.65] text-cocoa">
            Não é um cartão digital. É uma página feita à mão, com tipografia
            de livro antigo, ornamentos dourados e uma carta selada à
            cera. Por dentro, sete pequenos rituais para que ela releia tudo
            como se fosse a primeira vez — e descubra novas surpresas com o
            passar dos meses.
          </p>
        </div>
      </div>

      {/* feature grid */}
      <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-14 md:mt-24 md:grid-cols-12">
        <FeatureItem
          n="01"
          title="Contador eterno"
          line="anos · meses · dias · horas · segundos"
          body="Um relógio íntimo que pulsa em tempo real desde a data que vocês escolherem. Reaberto sempre que ela voltar à página."
          chip="ao vivo"
          spanClass="md:col-span-7"
          accent={<LiveCounter />}
        />
        <FeatureItem
          n="02"
          title="Cápsula do tempo"
          line="mensagens lacradas para datas futuras"
          body="Você escreve hoje. Ela recebe daqui a três meses, no próximo aniversário, no Natal — sempre como surpresa, dentro do mesmo site."
          chip="presente recorrente"
          spanClass="md:col-span-5"
          accent={<TimeCapsuleVisual />}
        />
        <FeatureItem
          n="03"
          title="Ritual do envelope"
          line="abre na data e hora marcadas"
          body="A página vive selada até o instante exato. Um envelope com selo de cera espera, com contagem regressiva. Ao toque, se desfaz."
          chip="exclusivo"
          spanClass="md:col-span-5"
          accent={<RitualVisual />}
        />
        <FeatureItem
          n="04"
          title="Trilha sonora"
          line="busca direta no Spotify"
          body="A música que tocou quando vocês se beijaram pela primeira vez fica embutida, em alta qualidade, com capa do álbum e link."
          chip="Spotify"
          spanClass="md:col-span-7"
          accent={<SpotifyVisual />}
        />
        <FeatureItem
          n="05"
          title="Galeria em alta"
          line="fotos de até 8MB · ordem livre"
          body="Carregue os retratos das viagens, dos cafés, das madrugadas. Ordem manual, legendas em italic, cropping respeitando o original."
          chip="ilimitada · plano Eterno"
          spanClass="md:col-span-6"
          accent={<GalleryVisual />}
        />
        <FeatureItem
          n="06"
          title="QR Code à mão"
          line="para presente físico"
          body="Imprima em um bilhete, cole num quadro, esconda dentro do livro favorito. O QR leva direto à carta, sem instalar nada."
          chip="presente físico"
          spanClass="md:col-span-6"
          accent={<QrVisual />}
        />
      </div>
    </section>
  );
}

function FeatureItem({
  n,
  title,
  line,
  body,
  chip,
  spanClass = "md:col-span-6",
  accent,
}: {
  n: string;
  title: string;
  line: string;
  body: string;
  chip: string;
  spanClass?: string;
  accent: ReactNode;
}) {
  return (
    <article
      className={`group relative ${spanClass} flex flex-col gap-6 border-t border-cocoa/10 pt-8`}
    >
      <div className="flex items-baseline gap-4">
        <span className="font-serif text-3xl italic text-champagne-deep">
          {n}
        </span>
        <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-mauve">
          {chip}
        </span>
      </div>
      <div>
        <h3 className="font-serif text-[32px] italic font-medium leading-tight text-cocoa md:text-[38px]">
          {title}
        </h3>
        <p className="mt-1 font-prose text-[13px] italic text-mauve">{line}</p>
      </div>
      <p className="max-w-[42ch] font-prose text-[15px] leading-relaxed text-cocoa-soft">
        {body}
      </p>
      <div className="mt-2">{accent}</div>
    </article>
  );
}

function LiveCounter() {
  return (
    <div className="paper relative overflow-hidden rounded-sm border border-cocoa/10 px-6 py-7 shadow-[var(--shadow-engrave)]">
      <div className="flex items-center gap-2">
        <span
          className="block h-1.5 w-1.5 rounded-full bg-ruby"
          style={{ animation: "ink-blink 1.6s ease-in-out infinite" }}
        />
        <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-ruby">
          ao vivo
        </span>
      </div>
      <div className="mt-3 flex items-end gap-5 font-serif text-cocoa">
        <Tick big="03" small="anos" />
        <Tick big="07" small="meses" />
        <Tick big="14" small="dias" />
        <Tick big="22" small="horas" />
      </div>
      <p className="mt-4 font-prose text-[13px] italic text-mauve">
        desde 6 de fevereiro de 2023, quando ela disse sim.
      </p>
    </div>
  );
}

function Tick({ big, small }: { big: string; small: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-serif text-[44px] italic font-medium leading-none text-cocoa">
        {big}
      </span>
      <span className="mt-1 font-sans text-[9px] uppercase tracking-[0.3em] text-mauve">
        {small}
      </span>
    </div>
  );
}

function TimeCapsuleVisual() {
  return (
    <div className="paper relative rounded-sm border border-cocoa/10 px-5 py-6">
      <ul className="space-y-3 font-prose text-[14px] text-cocoa-soft">
        {[
          { date: "12 jun · 19:30", text: "abre hoje", state: "ready" },
          { date: "06 set · 00:00", text: "primeiro mensaversário", state: "locked" },
          { date: "06 fev · 00:00", text: "um ano juntos", state: "locked" },
        ].map((c) => (
          <li key={c.date} className="flex items-center gap-3">
            <span
              className={`h-2 w-2 rounded-full ${
                c.state === "ready" ? "bg-ruby" : "bg-champagne/60"
              }`}
            />
            <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-mauve">
              {c.date}
            </span>
            <span className="italic">{c.text}</span>
            <span className="ml-auto font-sans text-[10px] uppercase tracking-[0.24em] text-champagne-deep">
              {c.state === "ready" ? "lacre" : "selado"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RitualVisual() {
  return (
    <div className="paper relative rounded-sm border border-cocoa/10 px-6 py-7 text-center">
      <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-champagne-deep">
        contagem regressiva
      </p>
      <p className="mt-2 font-serif text-[44px] italic font-medium leading-none text-cocoa">
        02d 14h 11m
      </p>
      <p className="mt-3 font-prose text-[13px] italic text-mauve">
        envelope abre dia 12 de junho · 19:30
      </p>
    </div>
  );
}

function SpotifyVisual() {
  return (
    <div className="paper relative flex items-center gap-4 rounded-sm border border-cocoa/10 px-5 py-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-cocoa to-ruby-ink">
        <span className="font-script text-2xl text-rose-mist">♪</span>
      </div>
      <div className="min-w-0">
        <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-mauve">
          nossa música
        </p>
        <p className="mt-1 truncate font-serif text-[18px] italic text-cocoa">
          La Vie en Rose
        </p>
        <p className="font-prose text-[13px] text-cocoa-soft">Édith Piaf</p>
      </div>
      <div className="ml-auto flex h-9 items-end gap-0.5">
        {[12, 22, 16, 28, 18, 24, 14].map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-sm bg-ruby/80"
            style={{
              height: `${h}px`,
              animation: `ink-blink ${1 + i * 0.13}s ease-in-out ${i * 0.05}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function GalleryVisual() {
  return (
    <div className="relative grid grid-cols-3 gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="paper aspect-[3/4] rounded-sm border border-cocoa/10 shadow-[0_18px_24px_-18px_rgba(74,8,16,0.35)]"
          style={{
            transform: `rotate(${(i - 1) * 1.6}deg)`,
            backgroundImage: `radial-gradient(at 30% 30%, rgba(176,18,40,0.10), transparent 60%), radial-gradient(at 70% 70%, rgba(196,154,85,0.18), transparent 55%)`,
          }}
        />
      ))}
    </div>
  );
}

function QrVisual() {
  return (
    <div className="paper relative inline-flex items-center gap-4 rounded-sm border border-cocoa/10 px-5 py-4">
      <svg
        viewBox="0 0 21 21"
        className="h-16 w-16 text-cocoa"
        aria-hidden
        shapeRendering="crispEdges"
      >
        {[
          [0, 0, 7, 7],
          [14, 0, 7, 7],
          [0, 14, 7, 7],
        ].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill="currentColor" />
            <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} fill="var(--color-paper)" />
            <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} fill="currentColor" />
          </g>
        ))}
        {[
          [9, 1], [11, 1], [9, 3], [12, 4], [10, 5], [13, 6],
          [8, 8], [10, 8], [12, 8], [14, 9], [9, 10], [11, 10],
          [13, 10], [15, 11], [16, 12], [17, 13], [9, 14], [11, 15],
          [13, 14], [15, 16], [16, 17], [18, 18],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={1} height={1} fill="currentColor" />
        ))}
      </svg>
      <div>
        <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-mauve">
          escaneie
        </p>
        <p className="mt-1 font-serif text-[18px] italic text-cocoa">nossacarta.love/marina</p>
        <p className="font-prose text-[12px] italic text-cocoa-soft">imprima · cole · esconda</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────  TESTIMONIALS  ───────────────────────────── */

function Testimonials() {
  const reviews = [
    {
      quote:
        "Ela leu em silêncio até o fim, voltou três vezes na primeira frase e disse que era o presente mais bonito que já tinha visto. Eu também acho.",
      who: "Lucas, 27",
      meta: "presenteou Ana — 3 anos juntos",
    },
    {
      quote:
        "A cápsula que abriu no meu aniversário, três meses depois, me fez chorar no meio da reunião de trabalho. Funciona.",
      who: "Marina, 31",
      meta: "presenteada por Pedro — 5 anos juntos",
    },
    {
      quote:
        "Imprimi o QR Code num bilhete, escondi no livro dela. Ela achou no domingo de manhã. Foi a melhor manhã do ano.",
      who: "Rafael, 24",
      meta: "presenteou Júlia — 2 anos juntos",
    },
  ];

  return (
    <section className="relative mx-auto max-w-[1280px] px-6 pb-10 md:px-12 md:pb-20">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        {reviews.map((r, i) => (
          <Reveal
            key={i}
            delay={i * 0.12}
            className={`relative pt-10 ${i === 1 ? "md:translate-y-[28px]" : ""}`}
            as="figure"
          >
            <span className="absolute -left-1 -top-2 font-serif text-[120px] italic leading-none text-ruby/20">
              “
            </span>
            <blockquote className="relative font-serif text-[22px] italic font-medium leading-snug text-cocoa md:text-[26px]">
              {r.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="h-px w-8 bg-champagne" />
              <span className="font-script text-2xl text-ruby">{r.who.split(",")[0]}</span>
              <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-mauve">
                {r.who.split(",")[1]}
              </span>
            </figcaption>
            <p className="mt-1 ml-11 font-prose text-[13px] italic text-mauve">
              {r.meta}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────  PRICING  ───────────────────────────── */

function Pricing() {
  return (
    <section className="relative mx-auto max-w-[1280px] px-6 pb-12 md:px-12 md:pb-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-champagne-deep">
          Tarifa única · sem mensalidade
        </p>
        <h2 className="mt-4 font-serif text-[44px] italic font-medium leading-tight text-cocoa md:text-[60px]">
          <WordReveal
            segments={[
              { text: "Quanto custa", lineBreakAfter: true },
              { text: "fazer ela chorar de emoção?", className: "text-ruby" },
            ]}
            wordDelay={0.09}
          />
        </h2>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {/* Plano Bilhete */}
        <Reveal as="article" delay={0} className="paper group relative flex flex-col gap-6 rounded-sm border border-cocoa/15 px-8 py-10 shadow-[var(--shadow-engrave)]">
          <header>
            <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
              Plano Bilhete
            </p>
            <h3 className="mt-3 font-serif text-[40px] italic font-medium leading-none text-cocoa">
              Sete dias de carta
            </h3>
            <p className="mt-2 font-prose text-[14px] italic text-mauve">
              Para o impulso da véspera.
            </p>
          </header>
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-[12px] text-mauve">R$</span>
            <span className="font-serif text-[64px] italic font-medium leading-none text-cocoa">
              17,90
            </span>
            <span className="font-prose text-[13px] italic text-mauve">à vista</span>
          </div>
          <ul className="space-y-2.5 font-prose text-[14px] text-cocoa-soft">
            <PriceLine>contador, fotos, música, declaração</PriceLine>
            <PriceLine>até 8 fotos no álbum</PriceLine>
            <PriceLine>QR Code para impressão</PriceLine>
            <PriceLine>seis temas tipográficos</PriceLine>
            <PriceLine muted>página expira em 7 dias</PriceLine>
            <PriceLine muted>sem cápsulas do tempo</PriceLine>
          </ul>
          <a
            href="/cadastro"
            className="mt-auto inline-flex items-center justify-center rounded-full border border-cocoa/30 bg-paper px-6 py-3 font-sans text-[11px] uppercase tracking-[0.3em] text-cocoa transition hover:border-ruby/50 hover:text-ruby"
          >
            Começar bilhete
          </a>
        </Reveal>

        {/* Plano Eterno (destaque) */}
        <Reveal as="article" delay={0.14} className="relative flex flex-col gap-6 overflow-hidden rounded-sm border border-champagne-deep/30 bg-paper px-8 pb-10 pt-16 shadow-[0_30px_60px_-30px_rgba(124,14,29,0.35),var(--shadow-foil)]">
          {/* foil top bar with badge */}
          <div className="foil absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-center gap-3 font-sans text-[10px] uppercase tracking-[0.32em] text-cocoa">
            <span className="text-[11px]">✦</span>
            <span>mais escolhido</span>
            <span className="text-[11px]">✦</span>
          </div>

          <header>
            <p className="foil-text font-sans text-[10px] uppercase tracking-[0.32em]">
              Plano Eterno
            </p>
            <h3 className="mt-3 font-serif text-[40px] italic font-medium leading-none text-cocoa">
              Para sempre, em uma só carta
            </h3>
            <p className="mt-2 font-prose text-[14px] italic text-mauve">
              Para os que escolheram a vida inteira.
            </p>
          </header>
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-[12px] text-mauve">R$</span>
            <span className="font-serif text-[64px] italic font-medium leading-none text-ruby">
              29,90
            </span>
            <span className="font-prose text-[13px] italic text-mauve">à vista</span>
          </div>
          <ul className="space-y-2.5 font-prose text-[14px] text-cocoa-soft">
            <PriceLine bold>tudo do plano Bilhete, sem prazo</PriceLine>
            <PriceLine bold>cápsulas do tempo ilimitadas</PriceLine>
            <PriceLine bold>ritual do envelope (abre na data)</PriceLine>
            <PriceLine>fotos ilimitadas, em alta</PriceLine>
            <PriceLine>linha do tempo dos marcos</PriceLine>
            <PriceLine>livro de visitas (família, amigos)</PriceLine>
            <PriceLine>domínio próprio: nossacarta.love/seu-nome</PriceLine>
          </ul>
          <a
            href="/cadastro"
            className="mt-auto inline-flex items-center justify-center gap-3 rounded-full bg-ruby px-7 py-4 font-sans text-[12px] uppercase tracking-[0.28em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.6)] transition hover:bg-ruby-deep"
          >
            <span>Selar para sempre</span>
            <span>→</span>
          </a>
          <p className="text-center font-prose text-[12px] italic text-mauve">
            Pix, ou cartão em até 12x com Mercado Pago
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function PriceLine({
  children,
  muted = false,
  bold = false,
}: {
  children: ReactNode;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <li
      className={`flex items-start gap-3 ${
        muted ? "text-mauve line-through decoration-mauve/40" : ""
      }`}
    >
      <span
        className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 ${
          muted ? "bg-mauve/40" : "bg-ruby"
        } rotate-45`}
      />
      <span className={bold ? "font-medium text-cocoa" : ""}>{children}</span>
    </li>
  );
}

/* ─────────────────────────────  FAQ  ───────────────────────────── */

function Faq() {
  const items = [
    {
      q: "Ela precisa criar conta para abrir?",
      a: "Não. Ela apenas recebe o link (ou escaneia o QR Code) e a página abre no celular ou no navegador, sem cadastro.",
    },
    {
      q: "Posso editar depois que pagar?",
      a: "Sim. No plano Eterno, você pode editar tudo para sempre — adicionar fotos, mudar a música, criar novas cápsulas. No plano Bilhete, edição livre por 72 horas.",
    },
    {
      q: "Como funciona a cápsula do tempo?",
      a: "Você escreve uma mensagem hoje e escolhe a data em que ela aparecerá no site. Pode programar quantas quiser — uma para cada mês, para cada aniversário, para o próximo Natal. A pessoa presenteada vê apenas as cápsulas já abertas.",
    },
    {
      q: "Funciona com qualquer música do Spotify?",
      a: "Sim. Buscamos pelo título e artista direto da biblioteca pública do Spotify. A faixa toca em alta qualidade dentro da página, com capa e link.",
    },
    {
      q: "Ela vê o site antes do dia?",
      a: "Não, se você ativar o Ritual do Envelope. A página fica selada com contagem regressiva até a data e hora marcadas. Ao abrir, o envelope se desfaz na frente dela.",
    },
    {
      q: "Aceita Pix?",
      a: "Sim. Pix instantâneo (com 5% de desconto automático) ou cartão em até 12x sem juros, processado pelo Mercado Pago. O acesso libera em segundos após o pagamento.",
    },
  ];

  return (
    <section className="relative mx-auto max-w-[1280px] px-6 pb-16 md:px-12 md:pb-28">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-14">
        <aside className="md:col-span-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
            Antes de começar
          </p>
          <h2 className="mt-4 font-serif text-[44px] italic font-medium leading-tight text-cocoa md:text-[56px]">
            As pequenas
            <br />
            dúvidas
            <br />
            <span className="text-ruby">de quem ama.</span>
          </h2>
          <p className="mt-6 font-prose text-[15px] italic text-mauve">
            Se a sua não estiver aqui, escreva para olá@nossacarta.love
            — respondemos em até uma hora.
          </p>
        </aside>
        <ul className="md:col-span-8">
          {items.map((item, i) => (
            <li
              key={i}
              className="border-t border-cocoa/15 py-6 first:border-t-0"
            >
              <details className="group">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                  <span className="font-serif text-[22px] italic font-medium leading-snug text-cocoa md:text-[26px]">
                    {item.q}
                  </span>
                  <span className="mt-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cocoa/30 font-serif text-cocoa transition group-open:rotate-45 group-open:border-ruby group-open:text-ruby">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-[58ch] font-prose text-[15px] leading-relaxed text-cocoa-soft">
                  {item.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

