import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso — NossaCarta",
  description: "Termos de Uso da plataforma NossaCarta.",
};

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <header className="border-b border-cocoa/12 pb-6">
        <p className="font-prose text-xs uppercase tracking-[0.22em] text-cocoa/55">Documento legal</p>
        <h1 className="mt-2 font-serif text-4xl text-cocoa">Termos de Uso</h1>
        <p className="mt-2 font-prose text-sm text-cocoa/55">Última atualização: 26 de abril de 2026</p>
      </header>

      <div className="prose-card mt-10 flex flex-col gap-6 font-prose text-[15px] leading-relaxed text-cocoa/85">
        <p>
          Bem-vindo(a) à <strong>NossaCarta</strong> (&ldquo;NossaCarta&rdquo;, &ldquo;nós&rdquo;).
          Ao usar nossos serviços você concorda com estes termos.
        </p>

        <h2 className="font-serif text-2xl text-cocoa">1. O serviço</h2>
        <p>
          A NossaCarta permite criar sites personalizados com a história de duas pessoas
          (carta digital), incluindo fotos, declarações, música e cápsulas do tempo.
        </p>

        <h2 className="font-serif text-2xl text-cocoa">2. Planos e pagamento</h2>
        <p>
          Plano Bilhete (R$ 17,90) expira em 7 dias após publicação. Plano Eterno
          (R$ 29,90) é vitalício. Pagamento via Mercado Pago (Pix ou cartão).
        </p>

        <h2 className="font-serif text-2xl text-cocoa">3. Conteúdo do usuário</h2>
        <p>
          Você é responsável pelo conteúdo que publica. Não permitimos conteúdo ilegal,
          discurso de ódio, conteúdo sexual explícito, violação de direitos autorais ou
          que exponha terceiros sem consentimento. Reservamo-nos o direito de remover
          conteúdo que viole estes termos.
        </p>

        <h2 className="font-serif text-2xl text-cocoa">4. Direitos sobre o conteúdo</h2>
        <p>
          Você mantém os direitos sobre fotos e textos que publicar. Concede à NossaCarta
          licença limitada para hospedar e exibir o conteúdo conforme o serviço.
        </p>

        <h2 className="font-serif text-2xl text-cocoa">5. Cancelamento e reembolso</h2>
        <p>
          O Código de Defesa do Consumidor garante 7 dias para arrependimento em compras
          online. Solicite reembolso por <a className="text-ruby underline-offset-4 hover:underline" href="mailto:ola@nossacarta.love">ola@nossacarta.love</a>.
        </p>

        <h2 className="font-serif text-2xl text-cocoa">6. Limitação de responsabilidade</h2>
        <p>
          Fornecemos o serviço &ldquo;como está&rdquo;. Não garantimos disponibilidade
          ininterrupta. Não somos responsáveis por danos indiretos.
        </p>

        <h2 className="font-serif text-2xl text-cocoa">7. Mudanças nos termos</h2>
        <p>
          Podemos atualizar estes termos. Mudanças relevantes serão comunicadas por
          e-mail aos usuários cadastrados.
        </p>

        <h2 className="font-serif text-2xl text-cocoa">8. Contato</h2>
        <p>
          Dúvidas:{" "}
          <a className="text-ruby underline-offset-4 hover:underline" href="mailto:ola@nossacarta.love">
            ola@nossacarta.love
          </a>
        </p>
      </div>
    </main>
  );
}
