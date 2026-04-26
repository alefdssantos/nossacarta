type Foto = {
  id: string;
  url: string;
  caption: string | null;
};

type Props = {
  fotos: Foto[];
};

const TEMPLATES: Record<number, Array<{ col: string; aspect: string; offset?: string }>> = {
  1: [{ col: "col-span-12", aspect: "aspect-[4/5]" }],
  2: [
    { col: "col-span-7 col-start-1", aspect: "aspect-[3/4]" },
    { col: "col-span-4 col-start-9", aspect: "aspect-[4/5]", offset: "mt-32" },
  ],
  3: [
    { col: "col-span-8 col-start-1", aspect: "aspect-[4/3]" },
    { col: "col-span-4 col-start-9", aspect: "aspect-square", offset: "mt-48" },
    { col: "col-span-6 col-start-4", aspect: "aspect-[3/4]", offset: "mt-16" },
  ],
};

function gerarTemplate(qtd: number): Array<{ col: string; aspect: string; offset?: string }> {
  if (qtd === 0) return [];
  if (TEMPLATES[qtd]) return TEMPLATES[qtd];
  const partes: Array<{ col: string; aspect: string; offset?: string }> = [];
  let restante = qtd;
  let alterna = 0;
  while (restante > 0) {
    if (restante >= 3) {
      partes.push(...TEMPLATES[3]);
      restante -= 3;
    } else if (restante >= 2) {
      const dois =
        alterna % 2 === 0
          ? TEMPLATES[2]
          : [
              { col: "col-span-4 col-start-1", aspect: "aspect-[4/5]", offset: "mt-32" },
              { col: "col-span-7 col-start-6", aspect: "aspect-[3/4]" },
            ];
      partes.push(...dois);
      restante -= 2;
      alterna++;
    } else {
      partes.push(...TEMPLATES[1]);
      restante -= 1;
    }
  }
  return partes;
}

export function CadernoFotos({ fotos }: Props) {
  if (fotos.length === 0) return null;
  const template = gerarTemplate(fotos.length);

  return (
    <section className="px-6 py-32 md:px-12">
      <div className="mx-auto max-w-[760px]">
        <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-champagne-deep">
          Caderno de fotografias · IV
        </p>
        <p className="mt-3 font-serif italic text-[16px] text-mauve">
          um caderno de retratos guardados
        </p>

        <div className="mt-12 grid grid-cols-12 gap-x-4 gap-y-12 md:gap-y-20">
          {fotos.map((foto, i) => {
            const cfg = template[i] ?? template[i % template.length];
            const numero = String(i + 1).padStart(2, "0");
            return (
              <figure
                key={foto.id}
                className={`relative ${cfg.col} ${cfg.offset ?? ""}`}
              >
                <span className="absolute -top-6 right-0 font-sans text-[9px] uppercase tracking-[0.32em] text-mauve">
                  Nº {numero}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.url}
                  alt={foto.caption ?? ""}
                  className={`w-full ${cfg.aspect} border border-cocoa/8 object-cover`}
                  style={{ filter: "saturate(0.96)" }}
                />
                {foto.caption && (
                  <figcaption className="mt-3 pl-4 font-serif italic text-[14px] text-cocoa-soft">
                    {foto.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
