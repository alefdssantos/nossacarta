// Configura SMTP custom (Resend) + subject + template magic link via Management API.
// Lê PAT, RESEND_API_KEY, RESEND_FROM de .env.local. Nunca imprime segredos.
// Uso: bun run scripts/setup-smtp.mjs

import { readFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_REF = "idhkqvovyjsksubktjqe";
const ENV_PATH = join(process.cwd(), ".env.local");

function parseEnv(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const env = parseEnv(readFileSync(ENV_PATH, "utf8"));
const PAT = env.SUPABASE_ACCESS_TOKEN;
const RESEND_KEY = env.RESEND_API_KEY;
const SENDER = env.RESEND_FROM ?? "onboarding@resend.dev";

if (!PAT || !RESEND_KEY) {
  console.error("Faltam SUPABASE_ACCESS_TOKEN ou RESEND_API_KEY no .env.local");
  process.exit(1);
}

const magicLinkHtml = `<!DOCTYPE html>
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
                <span style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#8C6A30;">— um pequeno selo independente —</span>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0;">
                <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-style:italic;line-height:1.4;color:#2A1518;">Olá,</p>
                <p style="margin:14px 0 0 0;font-family:Georgia,serif;font-size:16px;line-height:1.65;color:#4A2D31;">
                  Recebemos um pedido pra entrar na sua conta. Use o link abaixo nos próximos 60 minutos:
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 0 8px 0;">
                <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#B01228;color:#FBEFE8;text-decoration:none;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;padding:14px 28px;border-radius:999px;">
                  Abrir minha carta &rarr;
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 0 8px 0;">
                <p style="margin:0;font-family:Georgia,serif;font-size:13px;font-style:italic;color:#8B6A6F;">Se o botão não funcionar, copie e cole esta URL no navegador:</p>
                <p style="margin:10px 0 0 0;font-family:'Courier New',monospace;font-size:12px;color:#7C0E1D;word-break:break-all;">{{ .ConfirmationURL }}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 0 0 0;border-top:1px solid rgba(42,21,24,0.08);">
                <p style="margin:0;font-family:Georgia,serif;font-size:13px;font-style:italic;color:#8B6A6F;line-height:1.55;">
                  Se você não solicitou este e-mail, pode ignorar — ninguém entrou na sua conta.
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

const body = {
  external_email_enabled: true,
  smtp_admin_email: SENDER,
  smtp_host: "smtp.resend.com",
  smtp_port: "587",
  smtp_user: "resend",
  smtp_pass: RESEND_KEY,
  smtp_sender_name: "NossaCarta",
  smtp_max_frequency: 60,
  mailer_subjects_magic_link: "Seu link pra entrar na NossaCarta",
  mailer_templates_magic_link_content: magicLinkHtml,
};

const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;
const res = await fetch(url, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${PAT}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log(`HTTP ${res.status}`);
if (!res.ok) {
  console.error(text);
  process.exit(1);
}

// Esconde SMTP pass do output
let safe = text;
try {
  const json = JSON.parse(text);
  if (json.smtp_pass) json.smtp_pass = "***redacted***";
  safe = JSON.stringify(json, null, 2);
} catch {}
console.log(safe);
