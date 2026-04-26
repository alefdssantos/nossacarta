import { z } from "zod";

export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/;
export const TEMAS = ["ruby-couture", "cocoa-vintage", "champagne-foil"] as const;
export const PLANOS = ["bilhete", "eterno"] as const;

export const slugSchema = z
  .string()
  .min(2)
  .max(40)
  .regex(SLUG_REGEX, "Use apenas letras minúsculas, números e hífen (2 a 40 caracteres).");

export const planoSchema = z.enum(PLANOS);

export const conteudoCartaV1Schema = z.object({
  versao: z.literal(1),
  nomes: z
    .object({
      pessoa1: z.string().min(1).max(50).trim(),
      pessoa2: z.string().min(1).max(50).trim(),
    })
    .optional(),
  declaracao: z.string().max(5000).trim().optional(),
  tema: z.enum(TEMAS).default("ruby-couture"),
});

export type ConteudoCartaV1 = z.infer<typeof conteudoCartaV1Schema>;

export const conteudoVazioV1: ConteudoCartaV1 = {
  versao: 1,
  tema: "ruby-couture",
};

export const criarCartaInputSchema = z.object({
  plano: planoSchema,
});

export const atualizarNomesInputSchema = z.object({
  cartaId: z.uuid(),
  pessoa1: z.string().min(1).max(50).trim(),
  pessoa2: z.string().min(1).max(50).trim(),
  dataInicio: z.iso.date(),
  slug: slugSchema,
});
