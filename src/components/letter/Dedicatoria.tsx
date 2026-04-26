type Props = {
  texto?: string;
};

export function Dedicatoria({ texto }: Props) {
  if (!texto) return null;
  return (
    <section className="px-6 py-32 md:px-12 md:py-48">
      <p
        className="mx-auto font-serif italic text-cocoa-soft"
        style={{
          fontSize: "clamp(28px, 4.5vw, 44px)",
          lineHeight: 1.35,
          maxWidth: "36ch",
          textAlign: "center",
          textIndent: "-0.4em",
        }}
      >
        <span className="text-champagne" style={{ fontSize: "1.6em", lineHeight: 0 }}>
          &ldquo;
        </span>
        {texto}
        <span className="text-champagne" style={{ fontSize: "1.6em", lineHeight: 0 }}>
          &rdquo;
        </span>
      </p>
    </section>
  );
}
