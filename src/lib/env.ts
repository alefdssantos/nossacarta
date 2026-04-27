import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_DB_URL: z.string().url(),
});

const abacateSchema = z.object({
  ABACATEPAY_API_KEY: z.string().startsWith("abc_"),
  ABACATEPAY_WEBHOOK_SECRET: z.string().min(8),
  ABACATEPAY_PRODUCT_BILHETE: z.string().min(4),
  ABACATEPAY_PRODUCT_ETERNO: z.string().min(4),
});

const spotifySchema = z.object({
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

export const publicEnv = clientEnv;

export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() called on the client");
  }
  return serverSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
  });
}

export function getAbacateEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getAbacateEnv() called on the client");
  }
  return abacateSchema.parse({
    ABACATEPAY_API_KEY: process.env.ABACATEPAY_API_KEY,
    ABACATEPAY_WEBHOOK_SECRET: process.env.ABACATEPAY_WEBHOOK_SECRET,
    ABACATEPAY_PRODUCT_BILHETE: process.env.ABACATEPAY_PRODUCT_BILHETE,
    ABACATEPAY_PRODUCT_ETERNO: process.env.ABACATEPAY_PRODUCT_ETERNO,
  });
}

export function getSpotifyEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getSpotifyEnv() called on the client");
  }
  return spotifySchema.safeParse({
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  });
}
