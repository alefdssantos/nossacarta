import { Filete } from "./Filete";

type Props = {
  pessoa1: string;
  pessoa2: string;
  dataRomanos: string;
  cidade?: string;
};

export function Frontispicio({ pessoa1, pessoa2, dataRomanos, cidade }: Props) {
  return (
    <section className="relative flex min-h-[88dvh] flex-col items-center justify-center px-6 py-24 md:px-12">
      <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-champagne-deep">
        Volume único · I
      </p>

      <div className="mt-24 w-full max-w-[760px]">
        <p
          className="font-script leading-[0.85] text-ruby"
          style={{ fontSize: "clamp(72px, 14vw, 168px)", paddingLeft: "8%" }}
        >
          {pessoa1}
        </p>

        <div className="my-2 flex items-center justify-center gap-6">
          <span className="h-px w-24 bg-champagne" />
          <span
            className="font-script italic text-champagne"
            style={{ fontSize: "clamp(56px, 10vw, 120px)", lineHeight: 1 }}
          >
            &amp;
          </span>
          <span className="h-px w-24 bg-champagne" />
        </div>

        <p
          className="font-script leading-[0.85] text-cocoa text-right"
          style={{ fontSize: "clamp(72px, 14vw, 168px)", paddingRight: "8%" }}
        >
          {pessoa2}
        </p>
      </div>

      <div className="mt-16 text-center">
        <p className="font-serif text-[22px] text-cocoa-soft" style={{ letterSpacing: "0.18em" }}>
          {dataRomanos}
        </p>
        {cidade && (
          <p className="mt-3 font-serif italic text-[14px] text-mauve">{cidade}</p>
        )}
      </div>

      <div className="mt-24">
        <Filete />
      </div>
    </section>
  );
}
