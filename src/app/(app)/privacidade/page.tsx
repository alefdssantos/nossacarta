import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — NossaCarta",
  description: "Como tratamos seus dados pessoais conforme a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <header className="border-b border-cocoa/12 pb-6">
        <p className="font-prose text-xs uppercase tracking-[0.22em] text-cocoa/55">Documento legal</p>
        <h1 className="mt-2 font-serif text-4xl text-cocoa">Política de Privacidade</h1>
        <p className="mt-2 font-prose text-sm text-cocoa/55">Última atualização: 26 de abril de 2026</p>
      </header>

      <div className="mt-10 flex flex-col gap-6 font-prose text-[15px] leading-relaxed text-cocoa/85">
        <p>
          Esta política descreve como a <strong>NossaCarta</strong> trata dados pessoais,
          de acordo com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
        </p>

        <h2 className="font-serif text-2xl text-cocoa">1. Dados coletados</h2>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>E-mail (autenticação e contato).</li>
          <li>Nome (opcional).</li>
          <li>Conteúdo da carta: nomes, datas, declaração, fotos, faixa Spotify.</li>
          <li>Dados de pagamento processados pelo Mercado Pago — não armazenamos cartão.</li>
        </ul>

        <h2 className="font-serif text-2xl text-cocoa">2. Finalidade</h2>
        <p>
          Operar o serviço (autenticação, hospedagem, entrega de e-mail), processar
          pagamentos e enviar comunicações transacionais.
        </p>

        <h2 className="font-serif text-2xl text-cocoa">3. Compartilhamento</h2>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Supabase (banco de dados e autenticação).</li>
          <li>Mercado Pago (processamento de pagamento).</li>
          <li>Resend (envio de e-mails transacionais).</li>
          <li>Vercel (hospedagem).</li>
        </ul>
        <p>Nenhum dado é vendido a terceiros.</p>

        <h2 className="font-serif text-2xl text-cocoa">4. Cookies</h2>
        <p>
          Usamos cookies essenciais para autenticação (sessão Supabase). Não usamos
          cookies de marketing ou rastreamento de terceiros.
        </p>

        <h2 className="font-serif text-2xl text-cocoa">5. Seus direitos (LGPD)</h2>
        <p>
          Você pode solicitar acesso, correção, exclusão ou portabilidade dos seus dados
          enviando e-mail para{" "}
          <a className="text-ruby underline-offset-4 hover:underline" href="mailto:ola@nossacarta.love">
            ola@nossacarta.love
          </a>.
        </p>

        <h2 className="font-serif text-2xl text-cocoa">6. Retenção</h2>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Plano Bilhete: dados removidos 30 dias após expiração da carta.</li>
          <li>Plano Eterno: mantidos enquanto a conta estiver ativa.</li>
          <li>Dados de pagamento: 5 anos (obrigação fiscal).</li>
        </ul>

        <h2 className="font-serif text-2xl text-cocoa">7. Segurança</h2>
        <p>
          Conexões TLS, banco com Row Level Security, fotos privadas servidas via URLs
          assinadas, senhas autenticadas via magic link (sem armazenamento de senha).
        </p>

        <h2 className="font-serif text-2xl text-cocoa">8. Encarregado de Dados (DPO)</h2>
        <p>
          Contato:{" "}
          <a className="text-ruby underline-offset-4 hover:underline" href="mailto:ola@nossacarta.love">
            ola@nossacarta.love
          </a>
        </p>
      </div>
    </main>
  );
}
