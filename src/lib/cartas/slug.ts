import { SLUG_REGEX } from "./schema";

const DIACRITICS_RE = /\p{Diacritic}/gu;

export function slugify(input: string, maxLen = 40): string {
  const base = input
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return base.slice(0, maxLen);
}

export function randomSuffix(len = 4): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < len; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

export function sugerirSlug(pessoa1: string, pessoa2: string): string {
  const a = slugify(pessoa1, 16);
  const b = slugify(pessoa2, 16);
  const base = [a, b].filter(Boolean).join("-").slice(0, 32);
  if (!base) return randomSuffix(8);
  return `${base}-${randomSuffix(4)}`.slice(0, 40);
}

export function slugValido(slug: string): boolean {
  return SLUG_REGEX.test(slug);
}
