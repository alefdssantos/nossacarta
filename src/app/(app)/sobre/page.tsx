import type { Metadata } from "next";
import Link from "next/link";
import { Filete, FleuronTriplo } from "@/components/letter/Filete";

export const metadata: Metadata = {
  title: "Sobre a NossaCarta",
  description:
    "Uma editora pequena de cartas digitais, nascida da convicção de que ainda vale a pena escrever à mão.",
};

export default function SobrePage() {
  return (
    <main className="mx-auto w-full max-w-[680px] px-6 py-16 md:py-24">
      <header className="text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-champagne-deep">
          Sobre nós
        </p>
        <p className="mt-4 font-script text-6xl leading-none text-ruby">
          NossaCarta
        </p>
        <p className="mt-3 font-serif italic text-[18px] text-cocoa-soft">
          uma editora digital de cartas eternas
        </p>
        <div className="mt-10">
          <Filete />
        </div>
      </header>

      <article
        className="mt-16 font-prose text-cocoa"
        style={{ fontSize: "clamp(16px, 2.2vw, 18px)", lineHeight: 1.85 }}
      >
        <h2 className="font-serif text-3xl italic text-cocoa">Como começou</h2>
        <p className="mt-4">
          A NossaCarta nasceu de uma frustração simples: presentes digitais para
          casais haviam virado commodity. Carrosséis automáticos, contadores de
          neon, fontes Pacifico, corações vermelhos pulsando em CSS — tudo igual,
          tudo barulhento, nenhum capaz de fazer alguém parar e ler.
        </p>
        <p className="mt-4">
          Queríamos o oposto: uma página que se comportasse como uma peça
          impressa. Que tivesse capa, frontispício, drop cap, colofão. Que
          honrasse a tradição de quando uma carta era mesmo objeto — selada,
          guardada, relida.
        </p>

        <h2 className="mt-16 font-serif text-3xl italic text-cocoa">Como construímos</h2>
        <p className="mt-4">
          Toda carta da NossaCarta é composta com tipografia honesta. Cormorant
          Garamond para os títulos, Allura para os manuscritos, Lora para a
          prosa, Inter para as letras de máquina. Nenhuma decoração desnecessária.
          Nenhum gradiente neon. Os números de marco — luas cheias, batidas do
          coração, dias dos namorados — são calculados, não inventados.
        </p>
        <p className="mt-4">
          O ritual de abrir a carta começa em um envelope com lacre de cera que
          se quebra ao toque. As cápsulas do tempo são cartas de verdade, seladas
          até a data que vocês escolherem. O mapa estelar é o céu real do
          hemisfério sul, com Cruzeiro do Sul ao centro.
        </p>

        <h2 className="mt-16 font-serif text-3xl italic text-cocoa">No que acreditamos</h2>
        <ul className="mt-4 ml-5 list-disc space-y-2">
          <li>
            <strong>Carta é objeto.</strong> Mesmo digital, ela tem capa, peso,
            página, dedicatória.
          </li>
          <li>
            <strong>Tipografia é amor.</strong> Os caracteres certos sustentam o
            sentimento.
          </li>
          <li>
            <strong>Ritual antes de revelação.</strong> Abrir uma carta é parte
            de recebê-la.
          </li>
          <li>
            <strong>Cada carta é única.</strong> Tiragem de um exemplar, dedicado
            a uma única pessoa.
          </li>
        </ul>

        <h2 className="mt-16 font-serif text-3xl italic text-cocoa">Onde nos achar</h2>
        <p className="mt-4">
          Somos um selo independente brasileiro. Para feedback, dúvidas ou
          colaborações, escreva para{" "}
          <a
            href="mailto:ola@nossacarta.love"
            className="text-ruby underline-offset-4 hover:underline"
          >
            ola@nossacarta.love
          </a>
          . Resposta humana em até 48 horas, garantido pela mesma equipe que
          escreve a carta.
        </p>
      </article>

      <div className="mt-20 flex flex-col items-center gap-6">
        <FleuronTriplo />
        <Link
          href="/cadastro"
          className="rounded-full bg-ruby px-7 py-3 font-sans text-[11px] uppercase tracking-[0.24em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] transition hover:bg-ruby-deep"
        >
          Começar uma carta →
        </Link>
      </div>
    </main>
  );
}
