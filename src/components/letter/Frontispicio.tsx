import { Filete } from "./Filete";

type Props = {
  pessoa1: string;
  pessoa2: string;
  dataRomanos: string;
  cidade?: string;
};

export function Frontispicio({ pessoa1, pessoa2, dataRomanos, cidade }: Props) {
  return (
    <section className="relative flex min-h-[88dvh] flex-col items-center justify-center px-6 py-16 md:px-12 md:py-24">
      <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-champagne-deep">
        Volume único · I
      </p>

      <div className="mt-16 w-full max-w-[760px] md:mt-24">
        <p
          className="font-script leading-[0.85] text-ruby"
          style={{ fontSize: "clamp(60px, 14vw, 168px)", paddingLeft: "6%" }}
        >
          {pessoa1}
        </p>

        <div className="my-1 flex items-center justify-center gap-3 md:my-2 md:gap-6">
          <span className="h-px w-12 bg-champagne md:w-24" />
          <span
            className="font-script italic text-champagne"
            style={{ fontSize: "clamp(48px, 10vw, 120px)", lineHeight: 1 }}
          >
            &amp;
          </span>
          <span className="h-px w-12 bg-champagne md:w-24" />
        </div>

        <p
          className="font-script leading-[0.85] text-cocoa text-right"
          style={{ fontSize: "clamp(60px, 14vw, 168px)", paddingRight: "6%" }}
        >
          {pessoa2}
        </p>
      </div>

      <div className="mt-12 text-center md:mt-16">
        <p
          className="font-serif text-cocoa-soft"
          style={{ fontSize: "clamp(18px, 2.4vw, 22px)", letterSpacing: "0.18em" }}
        >
          {dataRomanos}
        </p>
        {cidade && (
          <p className="mt-3 font-serif italic text-[14px] text-mauve">{cidade}</p>
        )}
      </div>

      <div className="mt-16 md:mt-24">
        <Filete />
      </div>
    </section>
  );
}
