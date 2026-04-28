import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_DB_URL: z.string().url(),
  CRON_SECRET: z.string().min(16).or(z.literal("")).optional(),
});

const mpSchema = z.object({
  MP_ACCESS_TOKEN: z.string().min(20),
  MP_WEBHOOK_SECRET: z.string().min(8).optional(),
});

const spotifySchema = z.object({
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().min(1).optional(),
});

const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
});

export const publicEnv = clientEnv;

export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() called on the client");
  }
  return serverSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
    CRON_SECRET: process.env.CRON_SECRET,
  });
}

export function getMPEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getMPEnv() called on the client");
  }
  return mpSchema.parse({
    MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN,
    MP_WEBHOOK_SECRET: process.env.MP_WEBHOOK_SECRET,
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
