import { Filete } from "./Filete";

type Marco = {
  id: string;
  data: string;
  titulo: string;
  descricao: string | null;
};

type Props = {
  marcos: Marco[];
};

const dataFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export function MarcosTimeline({ marcos }: Props) {
  if (marcos.length === 0) return null;
  const ordenados = [...marcos].sort((a, b) => a.data.localeCompare(b.data));

  return (
    <section className="px-6 py-32 md:px-12">
      <div className="mx-auto max-w-[680px]">
        <p className="text-center font-sans text-[9px] uppercase tracking-[0.4em] text-champagne-deep">
          Linha do tempo · IV bis
        </p>
        <p className="mt-3 text-center font-serif italic text-[18px] text-cocoa-soft">
          os dias que já foram nossos
        </p>

        <div className="relative mt-16">
          {/* Linha vertical */}
          <span
            aria-hidden
            className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-champagne/60"
          />

          <ol className="flex flex-col gap-16">
            {ordenados.map((m, i) => {
              const direita = i % 2 === 0;
              return (
                <li
                  key={m.id}
                  className={`relative grid grid-cols-12 items-start ${
                    direita ? "" : ""
                  }`}
                >
                  {/* Marca central */}
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-2 z-10 h-3 w-3 -translate-x-1/2 rounded-full border border-champagne-deep bg-paper"
                  />

                  {direita ? (
                    <>
                      <div className="col-span-5 col-start-1 pr-8 text-right">
                        <p className="font-serif italic text-[14px] text-mauve">
                          {dataFmt.format(new Date(m.data))}
                        </p>
                      </div>
                      <div className="col-span-6 col-start-7 pl-8">
                        <p className="font-serif italic text-[24px] leading-tight text-cocoa">
                          {m.titulo}
                        </p>
                        {m.descricao && (
                          <p className="mt-2 font-prose text-[15px] leading-relaxed text-cocoa-soft">
                            {m.descricao}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-span-6 col-start-1 pr-8 text-right">
                        <p className="font-serif italic text-[24px] leading-tight text-cocoa">
                          {m.titulo}
                        </p>
                        {m.descricao && (
                          <p className="mt-2 font-prose text-[15px] leading-relaxed text-cocoa-soft">
                            {m.descricao}
                          </p>
                        )}
                      </div>
                      <div className="col-span-5 col-start-8 pl-8">
                        <p className="font-serif italic text-[14px] text-mauve">
                          {dataFmt.format(new Date(m.data))}
                        </p>
                      </div>
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
