type Props = {
  texto: string;
  signature: string;
  cidadeData?: string;
};

const REGEX_PARA_DESTACAR = /(amor|paixão|coração)/gi;

function destacarPalavras(texto: string): React.ReactNode[] {
  const partes = texto.split(REGEX_PARA_DESTACAR);
  return partes.map((parte, i) => {
    if (REGEX_PARA_DESTACAR.test(parte)) {
      return (
        <span key={i} className="font-serif italic text-ruby">
          {parte}
        </span>
      );
    }
    return <span key={i}>{parte}</span>;
  });
}

export function Carta({ texto, signature, cidadeData }: Props) {
  const paragrafos = texto.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  if (paragrafos.length === 0) return null;

  const primeiro = paragrafos[0];
  const primeiraLetra = primeiro.charAt(0).toLocaleUpperCase("pt-BR");
  const restoPrimeiro = primeiro.slice(1);

  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <div className="relative mx-auto max-w-[58ch] bg-paper px-6 py-16 shadow-[inset_0_0_60px_rgba(74,8,16,0.04)] sm:px-10 sm:py-20 md:px-16 md:py-24">
        <PageCornerTopLeft />
        <PageCornerTopRight />

        <p className="mb-8 font-sans text-[9px] uppercase tracking-[0.4em] text-champagne-deep">
          Carta · III
        </p>

        <article
          className="font-prose text-cocoa"
          style={{
            fontSize: "clamp(17px, 2.4vw, 20px)",
            lineHeight: 1.85,
            textAlign: "justify",
            hyphens: "auto",
          }}
        >
          <div className="relative float-left mr-3 mt-0" aria-hidden="true">
            <DropCapFrame />
          </div>
          <span
            className="float-left font-serif italic text-ruby"
            style={{
              fontSize: "clamp(108px, 13vw, 168px)",
              lineHeight: 0.82,
              fontWeight: 600,
              padding: "0 10px",
              marginRight: 10,
              marginTop: 0,
            }}
          >
            {primeiraLetra}
          </span>
          <p style={{ textIndent: 0 }}>
            {destacarPalavras(restoPrimeiro)}
          </p>
          {paragrafos.slice(1).map((p, i) => (
            <p key={i} style={{ textIndent: "1.5em", marginTop: "1em" }}>
              {destacarPalavras(p)}
            </p>
          ))}
        </article>

        <div className="mt-16 text-right" style={{ paddingRight: "6%" }}>
          <p
            className="font-script text-ruby"
            style={{
              fontSize: "clamp(48px, 7vw, 88px)",
              transform: "rotate(-4deg)",
              display: "inline-block",
              lineHeight: 0.85,
            }}
          >
            {signature}
          </p>
          {cidadeData && (
            <p className="mt-4 font-serif italic text-[13px] text-cocoa-soft">{cidadeData}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function PageCornerTopLeft() {
  return (
    <span
      aria-hidden
      className="absolute left-0 top-0"
      style={{
        width: 0,
        height: 0,
        borderTop: "10px solid var(--color-rose-mist)",
        borderRight: "10px solid transparent",
      }}
    />
  );
}
function PageCornerTopRight() {
  return (
    <span
      aria-hidden
      className="absolute right-0 top-0"
      style={{
        width: 0,
        height: 0,
        borderTop: "10px solid var(--color-rose-mist)",
        borderLeft: "10px solid transparent",
      }}
    />
  );
}

function DropCapFrame() {
  return (
    <svg
      width="132"
      height="132"
      viewBox="0 0 132 132"
      style={{ position: "absolute", inset: -8, opacity: 0.85, zIndex: -1 }}
      aria-hidden="true"
    >
      <path d="M4 24 L4 4 L24 4" fill="none" stroke="var(--color-champagne-deep)" strokeWidth="0.8" />
      <path d="M108 4 L128 4 L128 24" fill="none" stroke="var(--color-champagne-deep)" strokeWidth="0.8" />
      <path d="M128 108 L128 128 L108 128" fill="none" stroke="var(--color-champagne-deep)" strokeWidth="0.8" />
      <path d="M24 128 L4 128 L4 108" fill="none" stroke="var(--color-champagne-deep)" strokeWidth="0.8" />
      <path d="M14 14 q3 -4 6 -2 q-3 4 -6 2" fill="var(--color-champagne)" opacity="0.6" />
      <path d="M118 118 q-3 -4 -6 -2 q3 4 6 2" fill="var(--color-champagne)" opacity="0.6" />
      <path d="M66 6 l-3 5 l3 -1 l3 1 z" fill="var(--color-ruby)" opacity="0.7" />
      <path d="M66 126 l-3 -5 l3 1 l3 -1 z" fill="var(--color-ruby)" opacity="0.7" />
    </svg>
  );
}
