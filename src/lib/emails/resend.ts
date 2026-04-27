import "server-only";
import { z } from "zod";

const envSchema = z.object({
  RESEND_API_KEY: z.string().startsWith("re_"),
  RESEND_FROM: z.string().min(3),
});

function getEnv() {
  return envSchema.parse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM ?? "onboarding@resend.dev",
  });
}

export type EnviarEmailInput = {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: string; contentType?: string }>;
};

export async function enviarEmail(input: EnviarEmailInput): Promise<{ id: string } | null> {
  const env = getEnv();
  const from = input.from ?? `NossaCarta <${env.RESEND_FROM}>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      reply_to: input.replyTo,
      attachments: input.attachments,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[resend] envio falhou", res.status, text);
    return null;
  }
  return (await res.json()) as { id: string };
}
