import { Filete } from "./Filete";
import { formatarDataLongoBR } from "@/lib/cartas/datas";

type Marco = {
  id: string;
  data: string;
  titulo: string;
  descricao: string | null;
  fotoUrl: string | null;
};

type Props = {
  marcos: Marco[];
};

export function MarcosTimeline({ marcos }: Props) {
  if (marcos.length === 0) return null;
  const ordenados = [...marcos].sort((a, b) => a.data.localeCompare(b.data));

  return (
    <section className="px-6 py-20 md:px-12 md:py-32">
      <div className="mx-auto max-w-[680px]">
        <p className="text-center font-sans text-[9px] uppercase tracking-[0.4em] text-champagne-deep">
          Linha do tempo · IV bis
        </p>
        <p className="mt-3 text-center font-serif italic text-[18px] text-cocoa-soft">
          os dias que já foram nossos
        </p>

        {/* Mobile: stack vertical com linha à esquerda */}
        <ol className="mt-12 flex flex-col gap-10 md:hidden">
          {ordenados.map((m) => (
            <li key={m.id} className="relative pl-7 pb-2">
              <span
                aria-hidden
                className="absolute left-2 top-2 h-3 w-3 -translate-x-1/2 rounded-full border border-champagne-deep bg-paper"
              />
              <span
                aria-hidden
                className="absolute left-2 top-5 bottom-0 w-px -translate-x-1/2 bg-champagne/60"
              />
              <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-mauve">
                {formatarDataLongoBR(m.data)}
              </p>
              <p className="mt-1.5 font-serif italic text-[22px] leading-tight text-cocoa">
                {m.titulo}
              </p>
              {m.descricao && (
                <p className="mt-2 font-prose text-[15px] leading-relaxed text-cocoa-soft">
                  {m.descricao}
                </p>
              )}
              {m.fotoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.fotoUrl}
                  alt={m.titulo}
                  className="mt-3 max-h-72 w-full rounded-sm border border-cocoa/10 object-cover"
                  style={{ filter: "saturate(0.96)" }}
                />
              )}
            </li>
          ))}
        </ol>

        {/* Desktop: alternado esquerda/direita com linha central */}
        <div className="relative mt-16 hidden md:block">
          <span
            aria-hidden
            className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-champagne/60"
          />

          <ol className="flex flex-col gap-16">
            {ordenados.map((m, i) => {
              const direita = i % 2 === 0;
              const conteudoTitulo = (
                <div className={direita ? "pl-8" : "pr-8 text-right"}>
                  <p className="font-serif italic text-[24px] leading-tight text-cocoa">
                    {m.titulo}
                  </p>
                  {m.descricao && (
                    <p className="mt-2 font-prose text-[15px] leading-relaxed text-cocoa-soft">
                      {m.descricao}
                    </p>
                  )}
                  {m.fotoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.fotoUrl}
                      alt={m.titulo}
                      className="mt-3 max-h-72 w-full rounded-sm border border-cocoa/10 object-cover"
                      style={{ filter: "saturate(0.96)" }}
                    />
                  )}
                </div>
              );
              const conteudoData = (
                <div className={direita ? "pr-8 text-right" : "pl-8"}>
                  <p className="font-serif italic text-[14px] text-mauve">
                    {formatarDataLongoBR(m.data)}
                  </p>
                </div>
              );
              return (
                <li key={m.id} className="relative grid grid-cols-12 items-start">
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-2 z-10 h-3 w-3 -translate-x-1/2 rounded-full border border-champagne-deep bg-paper"
                  />
                  {direita ? (
                    <>
                      <div className="col-span-5 col-start-1">{conteudoData}</div>
                      <div className="col-span-6 col-start-7">{conteudoTitulo}</div>
                    </>
                  ) : (
                    <>
                      <div className="col-span-6 col-start-1">{conteudoTitulo}</div>
                      <div className="col-span-5 col-start-8">{conteudoData}</div>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-16">
          <Filete />
        </div>
      </div>
    </section>
  );
}
