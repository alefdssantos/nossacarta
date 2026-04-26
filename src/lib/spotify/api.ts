import "server-only";
import { getSpotifyEnv } from "@/lib/env";

type Token = { access_token: string; expires_at: number };

let cached: Token | null = null;

async function getToken(): Promise<Token | null> {
  if (cached && cached.expires_at > Date.now() + 60_000) return cached;

  const envParsed = getSpotifyEnv();
  if (!envParsed.success) return null;
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = envParsed.data;

  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[spotify token] fail", res.status, await res.text());
    return null;
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  return cached;
}

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumArt: string | null;
  durationMs: number;
  previewUrl: string | null;
  external: string;
};

export async function searchTracks(query: string, limit = 8): Promise<SpotifyTrack[]> {
  if (!query.trim()) return [];
  const token = await getToken();
  if (!token) return [];

  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.set("q", query.trim());
  url.searchParams.set("type", "track");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("market", "BR");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[spotify search] fail", res.status);
    return [];
  }
  const data = (await res.json()) as {
    tracks?: {
      items?: Array<{
        id: string;
        name: string;
        duration_ms: number;
        preview_url: string | null;
        external_urls: { spotify: string };
        artists: Array<{ name: string }>;
        album: { name: string; images: Array<{ url: string; width: number }> };
      }>;
    };
  };

  return (data.tracks?.items ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    artists: t.artists.map((a) => a.name).join(", "),
    album: t.album.name,
    albumArt:
      t.album.images.find((i) => i.width >= 200 && i.width <= 400)?.url ??
      t.album.images[0]?.url ??
      null,
    durationMs: t.duration_ms,
    previewUrl: t.preview_url,
    external: t.external_urls.spotify,
  }));
}

export async function getTrack(id: string): Promise<SpotifyTrack | null> {
  if (!/^[a-zA-Z0-9]{22}$/.test(id)) return null;
  const token = await getToken();
  if (!token) return null;

  const res = await fetch(`https://api.spotify.com/v1/tracks/${id}?market=BR`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const t = (await res.json()) as {
    id: string;
    name: string;
    duration_ms: number;
    preview_url: string | null;
    external_urls: { spotify: string };
    artists: Array<{ name: string }>;
    album: { name: string; images: Array<{ url: string; width: number }> };
  };

  return {
    id: t.id,
    name: t.name,
    artists: t.artists.map((a) => a.name).join(", "),
    album: t.album.name,
    albumArt:
      t.album.images.find((i) => i.width >= 200 && i.width <= 400)?.url ??
      t.album.images[0]?.url ??
      null,
    durationMs: t.duration_ms,
    previewUrl: t.preview_url,
    external: t.external_urls.spotify,
  };
}
