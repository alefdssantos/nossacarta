import "server-only";
import { enviarEmail } from "./resend";
import { publicEnv } from "@/lib/env";

type Plano = "bilhete" | "eterno";

type Input = {
  destinatarioEmail: string;
  pessoa1: string;
  pessoa2: string;
  slug: string;
  plano: Plano;
  expiraEm?: string | null;
};

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function montarHtml({ pessoa1, pessoa2, slug, plano, expiraEm, qrUrl, url }: {
  pessoa1: string;
  pessoa2: string;
  slug: string;
  plano: Plano;
  expiraEm?: string | null;
  qrUrl: string;
  url: string;
}): string {
  const tituloPlano = plano === "bilhete" ? "Bilhete" : "Eterno";
  const expiraLinha =
    plano === "bilhete" && expiraEm
      ? `<p style="margin:10px 0 0 0;font-family:Georgia,serif;font-size:13px;font-style:italic;color:#8B6A6F;">Disponível até ${formatadorData.format(new Date(expiraEm))}.</p>`
      : plano === "eterno"
        ? `<p style="margin:10px 0 0 0;font-family:Georgia,serif;font-size:13px;font-style:italic;color:#8B6A6F;">Vitalícia, sem prazo de expiração.</p>`
        : "";

  const dicaCapsulas =
    plano === "eterno"
      ? `<tr><td style="padding:8px 0 0 0;"><p style="margin:0;font-family:Georgia,serif;font-size:14px;line-height:1.65;color:#4A2D31;">Você pode adicionar <strong>cápsulas do tempo</strong> agora — cartas seladas que se abrem em datas futuras. Acesse sua conta para criá-las.</p></td></tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#FBEFE8;font-family:Georgia,serif;color:#2A1518;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FBEFE8;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="background:#FAF1EA;border:1px solid rgba(42,21,24,0.12);border-radius:8px;padding:48px 40px;">
            <tr>
              <td align="center" style="padding-bottom:8px;">
                <span style="font-family:'Brush Script MT',cursive;font-size:36px;color:#B01228;line-height:1;">Nossa</span>
                <span style="font-family:Georgia,serif;font-style:italic;font-size:28px;color:#2A1518;line-height:1;margin-left:6px;">Carta</span>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:8px 0 24px 0;">
                <span style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#8C6A30;">— pagamento confirmado · plano ${tituloPlano} —</span>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0;">
                <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-style:italic;line-height:1.4;color:#2A1518;">Sua carta está no ar.</p>
                <p style="margin:14px 0 0 0;font-family:Georgia,serif;font-size:16px;line-height:1.65;color:#4A2D31;">
                  A história de <strong>${pessoa1}</strong> e <strong>${pessoa2}</strong> agora está selada e pronta para ser entregue.
                </p>
                ${expiraLinha}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 0 8px 0;">
                <a href="${url}" style="display:inline-block;background:#B01228;color:#FBEFE8;text-decoration:none;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;padding:14px 28px;border-radius:999px;">
                  Abrir minha carta &rarr;
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 0 0 0;">
                <p style="margin:0 0 12px 0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#8C6A30;">QR para imprimir</p>
                <img src="${qrUrl}" alt="QR para nossacarta.love/${slug}" width="160" height="160" style="display:block;border:1px solid rgba(42,21,24,0.12);padding:12px;background:#FAF1EA;" />
                <p style="margin:14px 0 0 0;font-family:'Courier New',monospace;font-size:11px;color:#7C0E1D;">nossacarta.love/${slug}</p>
              </td>
            </tr>
            ${dicaCapsulas}
            <tr>
              <td style="padding:32px 0 0 0;border-top:1px solid rgba(42,21,24,0.08);">
                <p style="margin:0;font-family:Georgia,serif;font-size:13px;font-style:italic;color:#8B6A6F;line-height:1.55;">
                  Imprima o QR como bilhete físico, ou compartilhe o link direto. A carta está no ar exatamente como vocês escreveram.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:24px;">
                <span style="font-family:'Brush Script MT',cursive;font-size:20px;color:#B01228;">com amor,</span>
                <span style="font-family:Georgia,serif;font-style:italic;font-size:13px;color:#4A2D31;margin-left:6px;">da redação</span>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0 0;font-family:Georgia,serif;font-size:11px;font-style:italic;color:#8B6A6F;">© NossaCarta · nossacarta.love</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function enviarEmailPublicacao(input: Input): Promise<{ id: string } | null> {
  const url = `${publicEnv.NEXT_PUBLIC_APP_URL}/${input.slug}`;
  const qrUrl = `${publicEnv.NEXT_PUBLIC_APP_URL}/api/qr/${input.slug}`;

  const html = montarHtml({ ...input, url, qrUrl });
  const subject = `Sua carta está no ar — ${input.pessoa1} & ${input.pessoa2}`;

  return enviarEmail({
    to: input.destinatarioEmail,
    subject,
    html,
  });
}
