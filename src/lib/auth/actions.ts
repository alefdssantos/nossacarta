"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.email().max(254).trim().toLowerCase();
const nomeSchema = z.string().min(2).max(80).trim().optional();

export type AuthFormState =
  | { status: "idle" }
  | { status: "ok"; email: string }
  | { status: "error"; message: string };

async function getCallbackUrl(next?: string) {
  const h = await headers();
  const origin = h.get("origin") ?? h.get("x-forwarded-host") ?? "";
  const base = origin.startsWith("http") ? origin : `https://${origin}`;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/conta";
  return `${base}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

export async function signInWithMagicLink(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  if (!parsedEmail.success) {
    return { status: "error", message: "E-mail inválido" };
  }
  const parsedNome = nomeSchema.safeParse(formData.get("nome") ?? undefined);
  if (!parsedNome.success) {
    return { status: "error", message: "Nome inválido (2 a 80 caracteres)" };
  }
  const next = formData.get("next");
  const emailRedirectTo = await getCallbackUrl(typeof next === "string" ? next : undefined);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsedEmail.data,
    options: {
      emailRedirectTo,
      shouldCreateUser: true,
      data: parsedNome.data ? { nome: parsedNome.data } : undefined,
    },
  });

  if (error) {
    return { status: "error", message: "Não conseguimos enviar o link. Tente de novo em instantes." };
  }
  return { status: "ok", email: parsedEmail.data };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
