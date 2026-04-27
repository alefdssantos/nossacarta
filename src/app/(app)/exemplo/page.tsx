import type { Metadata } from "next";
import Link from "next/link";
import { dataEmRomanos } from "@/lib/cartas/algarismos-romanos";
import { Frontispicio } from "@/components/letter/Frontispicio";
import { Dedicatoria } from "@/components/letter/Dedicatoria";
import { ContadorProsa } from "@/components/letter/ContadorProsa";
import { Carta } from "@/components/letter/Carta";
import { CadernoFotos } from "@/components/letter/CadernoFotos";
import { TrilhaSonora } from "@/components/letter/TrilhaSonora";
import { MapaEstrelas } from "@/components/letter/MapaEstrelas";
import { CapsulasSeladas } from "@/components/letter/CapsulasSeladas";

export const metadata: Metadata = {
  title: "Exemplo — NossaCarta",
  description: "Veja como sua carta vai ficar.",
};

const dataInicio = "2022-09-14";
const dataRomanos = dataEmRomanos(dataInicio);

const declaracao = `Helena, escrever pra você é um modo de te encontrar de novo, sempre que abro a página em branco e a sua presença chega antes das palavras. A primeira vez foi numa livraria de bairro, num fim de tarde de setembro: você procurava um livro que eu já tinha lido, eu fingi que ainda procurava o meu pra ter desculpa de continuar perto. O atendente sabia. O atendente sempre sabe.

Há tantas coisas pequenas que aprendi com você. Que o café passa melhor quando o filtro é molhado antes. Que existe uma maneira de dobrar uma camisa em três dobras precisas, e essa maneira é minha desde que vi as suas mãos uma vez. Que prosa boa é prosa que respira. Que amor não é um substantivo, é um verbo conjugado todos os dias.

Eu te peço pra continuar comigo nesse exercício de conjugação. Que a gente saiba envelhecer com a mesma curiosidade com que se procura um livro novo numa estante velha. Que a gente continue não tendo pressa. E quando, daqui a muitos anos, alguém perguntar como é a nossa história, eu queria poder responder simplesmente: a Helena chegou primeiro, e desde então a vida ficou em ordem.`;

const fotosStock = [
  {
    id: "demo-1",
    url: "https://picsum.photos/seed/nc-helena-1/1600/1200",
    caption: "São Paulo, primavera, primeira viagem.",
  },
  {
    id: "demo-2",
    url: "https://picsum.photos/seed/nc-helena-2/1200/1600",
    caption: "A janela do quarto na rua que não existe mais.",
  },
  {
    id: "demo-3",
    url: "https://picsum.photos/seed/nc-helena-3/1600/1200",
    caption: null,
  },
];

const capsulasDemo = [
  {
    id: "demo-cap-1",
    unlock_em: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 3).toISOString(),
    aberta_em: null,
    mensagem: null,
    criada_em: new Date().toISOString(),
  },
];

export default function ExemploPage() {
  return (
    <>
      <div className="sticky top-0 z-30 w-full border-b border-cocoa/12 bg-paper/90 px-6 py-2.5 backdrop-blur md:py-3">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa-soft">
            Demonstração · não é uma carta real
          </p>
          <Link
            href="/cadastro"
            className="rounded-full bg-ruby px-4 py-1.5 font-sans text-[10px] uppercase tracking-[0.22em] text-rose-mist shadow-foil transition hover:bg-ruby-deep"
          >
            criar a minha →
          </Link>
        </div>
      </div>

      <main className="bg-rose-mist text-cocoa">
        <Frontispicio pessoa1="Tomás" pessoa2="Helena" dataRomanos={dataRomanos} />
        <Dedicatoria texto="que a gente envelheça do mesmo jeito que aprende: devagar, e com curiosidade." />
        <MapaEstrelas dataInicio={dataInicio} />
        <ContadorProsa dataInicio={dataInicio} />
        <Carta texto={declaracao} signature="Tomás" cidadeData="São Paulo, abril de 2026" />
        <CadernoFotos fotos={fotosStock} />
        <TrilhaSonora
          trackId="05QeyKGAn4TZrv41tMiD1A"
          trackName="Trem-Bala"
          artistas="Ana Vilela"
        />
        <CapsulasSeladas capsulas={capsulasDemo} />

        <section className="px-6 py-32 md:px-12">
          <div className="mx-auto max-w-[680px] rounded-2xl border border-cocoa/12 bg-paper px-8 py-12 text-center shadow-engrave">
            <p className="font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
              fim da demonstração
            </p>
            <p className="mt-4 font-script text-5xl text-ruby">A próxima é a sua.</p>
            <p className="mt-4 font-prose text-[15px] italic text-cocoa-soft">
              Em 5 minutos vocês têm uma carta como esta — com seus nomes, suas fotos, sua música e sua declaração.
            </p>
            <Link
              href="/cadastro"
              className="mt-8 inline-flex rounded-full bg-ruby px-7 py-3 font-sans text-[11px] uppercase tracking-[0.24em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] transition hover:bg-ruby-deep"
            >
              Começar minha carta →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
