import QRCode from "qrcode";
import { Filete, FleuronTriplo } from "./Filete";

type Props = {
  pessoa2: string;
  slug: string;
  appUrl: string;
  publicadaEm: string;
};

const formatadorMes = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

export async function Colofao({ pessoa2, slug, appUrl, publicadaEm }: Props) {
  const url = `${appUrl}/${slug}`;
  const qrSvg = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    color: { dark: "#2A1518", light: "#0000" },
    errorCorrectionLevel: "M",
    width: 96,
  });

  const mesAno = formatadorMes.format(new Date(publicadaEm));

  return (
    <section className="px-6 py-40 md:px-12">
      <div className="mx-auto max-w-[34ch] text-center">
        <Filete width={96} />
        <div className="mt-16">
          <p className="font-serif italic text-[14px] text-mauve" style={{ lineHeight: 1.7 }}>
            Esta carta foi composta em Cormorant Garamond, com Allura para os manuscritos, Lora
            para a prosa e Inter para as letras de máquina. Editada à mão e impressa digitalmente
            no Brasil, em {mesAno}. Tiragem: um exemplar único, dedicado a{" "}
            <span className="not-italic">{pessoa2}</span>.
          </p>
        </div>

        <div className="mt-8">
          <FleuronTriplo />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div
            className="text-cocoa"
            style={{ width: 96, height: 96 }}
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="font-sans text-[9px] uppercase tracking-[0.32em] text-mauve">
            nossacarta.love/{slug}
          </p>
        </div>

        <a
          href={`/${slug}/historia`}
          className="mt-12 inline-flex items-center gap-3 rounded-full bg-ruby px-8 py-4 font-sans text-[12px] uppercase tracking-[0.28em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] transition hover:bg-ruby-deep"
        >
          ver história em capítulos →
        </a>

        <p className="mt-12 font-sans text-[9px] uppercase tracking-[0.32em] text-mauve" style={{ opacity: 0.65 }}>
          © NossaCarta · MMXXVI · uma edição única
        </p>
      </div>
    </section>
  );
}
