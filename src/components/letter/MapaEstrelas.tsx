import { constelacoes, fundo, rotacaoAnualRad } from "@/lib/cartas/star-data";
import { dataEmRomanos } from "@/lib/cartas/algarismos-romanos";
import { Filete } from "./Filete";

type Props = {
  dataInicio: string;
  cidade?: string;
};

const VIEW = 600;
const RAIO_INTERNO = 270;
const RAIO_EXTERNO = 290;

function rotacionar(x: number, y: number, rad: number): [number, number] {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [x * c - y * s, x * s + y * c];
}

function magToRaio(mag: number): number {
  // Estrelas mais brilhantes (mag baixo) → maior. Range editorial 1-5px.
  if (mag <= 0) return 4.2;
  if (mag <= 1) return 3.4;
  if (mag <= 2) return 2.6;
  if (mag <= 3) return 2.0;
  if (mag <= 4) return 1.4;
  return 1.0;
}

export function MapaEstrelas({ dataInicio, cidade }: Props) {
  const rad = rotacaoAnualRad(dataInicio);
  const cx = VIEW / 2;
  const cy = VIEW / 2;
  const dataRomanos = dataEmRomanos(dataInicio);

  const projetar = (x: number, y: number) => {
    const [rx, ry] = rotacionar(x, y, rad);
    return [cx + rx * RAIO_INTERNO, cy + ry * RAIO_INTERNO] as const;
  };

  return (
    <section className="px-6 py-32 md:px-12">
      <div className="mx-auto max-w-[760px]">
        <p className="text-center font-sans text-[9px] uppercase tracking-[0.4em] text-champagne-deep">
          Mapa do céu · I bis
        </p>
        <p className="mt-3 text-center font-serif italic text-[18px] text-cocoa-soft">
          o céu sobre nós, na noite em que começou
        </p>

        <div className="relative mx-auto mt-12 aspect-square w-full max-w-[520px]">
          <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className="h-full w-full"
            role="img"
            aria-label={`Mapa estelar — ${dataRomanos}`}
          >
            <defs>
              <radialGradient id="sky-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--color-paper)" stopOpacity="1" />
                <stop offset="80%" stopColor="var(--color-rose-mist)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--color-rose-mist)" stopOpacity="0.6" />
              </radialGradient>
              <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.6" />
              </filter>
            </defs>

            {/* Fundo do disco */}
            <circle cx={cx} cy={cy} r={RAIO_INTERNO} fill="url(#sky-grad)" />

            {/* Aro decorativo duplo */}
            <circle cx={cx} cy={cy} r={RAIO_EXTERNO} fill="none" stroke="var(--color-cocoa)" strokeOpacity="0.18" strokeWidth="0.8" />
            <circle cx={cx} cy={cy} r={RAIO_INTERNO} fill="none" stroke="var(--color-cocoa)" strokeOpacity="0.32" strokeWidth="0.6" />
            <circle cx={cx} cy={cy} r={RAIO_INTERNO - 4} fill="none" stroke="var(--color-cocoa)" strokeOpacity="0.08" strokeWidth="0.4" strokeDasharray="2 6" />

            {/* Pontos cardinais */}
            <g fontFamily="var(--font-sans)" fontSize="9" letterSpacing="2.4" fill="var(--color-cocoa-soft)">
              <text x={cx} y={cy - RAIO_INTERNO - 8} textAnchor="middle">N</text>
              <text x={cx + RAIO_INTERNO + 14} y={cy + 4} textAnchor="middle">L</text>
              <text x={cx} y={cy + RAIO_INTERNO + 18} textAnchor="middle">S</text>
              <text x={cx - RAIO_INTERNO - 14} y={cy + 4} textAnchor="middle">O</text>
            </g>

            {/* Estrelas de fundo */}
            <g fill="var(--color-cocoa)" opacity="0.5">
              {fundo.map((e, i) => {
                const [px, py] = projetar(e.x, e.y);
                return <circle key={`f-${i}`} cx={px} cy={py} r={magToRaio(e.mag)} filter="url(#star-glow)" />;
              })}
            </g>

            {/* Constelações: linhas finas champanhe + estrelas destacadas */}
            {constelacoes.map((c, ci) => (
              <g key={c.nome}>
                {/* Linhas */}
                {c.linhas.map(([a, b], li) => {
                  const ea = c.estrelas[a];
                  const eb = c.estrelas[b];
                  const [ax, ay] = projetar(ea.x, ea.y);
                  const [bx, by] = projetar(eb.x, eb.y);
                  return (
                    <line
                      key={`${ci}-${li}`}
                      x1={ax}
                      y1={ay}
                      x2={bx}
                      y2={by}
                      stroke="var(--color-champagne-deep)"
                      strokeOpacity="0.55"
                      strokeWidth="0.7"
                    />
                  );
                })}
                {/* Estrelas */}
                {c.estrelas.map((e, ei) => {
                  const [px, py] = projetar(e.x, e.y);
                  const r = magToRaio(e.mag);
                  return (
                    <g key={`s-${ci}-${ei}`}>
                      <circle cx={px} cy={py} r={r * 1.6} fill="var(--color-champagne)" opacity="0.25" />
                      <circle cx={px} cy={py} r={r} fill="var(--color-cocoa)" />
                    </g>
                  );
                })}
                {/* Nome da constelação ao lado da primeira estrela */}
                {(() => {
                  const e0 = c.estrelas[0];
                  const [px, py] = projetar(e0.x, e0.y);
                  return (
                    <text
                      x={px + 12}
                      y={py - 8}
                      fontFamily="var(--font-serif)"
                      fontStyle="italic"
                      fontSize="9"
                      fill="var(--color-mauve)"
                      opacity="0.7"
                    >
                      {c.nome}
                    </text>
                  );
                })()}
              </g>
            ))}

            {/* Nome de estrelas notáveis */}
            <g fontFamily="var(--font-serif)" fontStyle="italic" fontSize="8" fill="var(--color-cocoa-soft)" opacity="0.7">
              {constelacoes.flatMap((c) =>
                c.estrelas
                  .filter((e) => e.nome)
                  .map((e, i) => {
                    const [px, py] = projetar(e.x, e.y);
                    return (
                      <text key={`n-${c.nome}-${i}`} x={px + 6} y={py + 3}>
                        {e.nome}
                      </text>
                    );
                  }),
              )}
            </g>
          </svg>
        </div>

        <div className="mt-10 text-center">
          <p className="font-serif text-[16px] italic text-cocoa">
            {dataRomanos}
          </p>
          {cidade && (
            <p className="mt-1 font-sans text-[9px] uppercase tracking-[0.32em] text-mauve">
              {cidade}
            </p>
          )}
          <p className="mt-3 font-prose text-[12px] italic text-mauve">
            o céu como o víamos · &nbsp;Cruzeiro do Sul ao centro
          </p>
        </div>

        <div className="mt-12">
          <Filete />
        </div>
      </div>
    </section>
  );
}
