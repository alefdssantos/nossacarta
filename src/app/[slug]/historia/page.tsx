import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { conteudoCartaV1Schema } from "@/lib/cartas/schema";
import { dataEmRomanos } from "@/lib/cartas/algarismos-romanos";
import { getSignedFotoUrls } from "@/lib/supabase/storage";
import { getTrack } from "@/lib/spotify/api";
import { calcularMarcos, formatarBR } from "@/lib/cartas/marcos";
import { porExtenso } from "@/lib/cartas/numero-extenso";
import { publicEnv } from "@/lib/env";
import { WrappedStory } from "./WrappedStory";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `História de ${slug} — NossaCarta`,
    description: "Uma carta eterna em capítulos.",
    robots: { index: false, follow: false },
  };
}

export default async function WrappedPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const token = typeof sp.t === "string" ? sp.t : undefined;

  const supabase = await createClient();

  const h = await headers();
  const userId = h.get("x-user-id");
  const userEmail = h.get("x-user-email");

  const admin = createAdminClient();
  const { data: carta } = await admin
    .from("cartas")
    .select(
      "id, slug, plano, status, expira_em, publicada_em, conteudo, data_inicio_relacionamento, spotify_track_id, owner_id, destinatario_email, acesso_token",
    )
    .eq("slug", slug)
    .eq("status", "publicada")
    .maybeSingle();
  if (!carta) notFound();

  const podeAcessar =
    (userId && (carta.owner_id === userId || carta.destinatario_email === userEmail)) ||
    (token && carta.acesso_token === token);
  if (!podeAcessar) notFound();

  const cParse = conteudoCartaV1Schema.safeParse(carta.conteudo);
  const conteudo = cParse.success ? cParse.data : null;
  const nomes = conteudo?.nomes;
  const declaracao = conteudo?.declaracao;
  const dataInicio = carta.data_inicio_relacionamento;
  if (!nomes || !dataInicio || !declaracao) notFound();

  const dataRomanos = dataEmRomanos(dataInicio);
  const marcos = calcularMarcos(dataInicio);

  // Fotos
  const { data: medias } = await supabase
    .from("media")
    .select("id, storage_path, ordem")
    .eq("carta_id", carta.id)
    .order("ordem", { ascending: true });
  const paths = (medias ?? []).map((m) => m.storage_path);
  const signed = paths.length ? await getSignedFotoUrls(paths, 60 * 60 * 4) : new Map<string, string>();
  const fotoUrls = paths.map((p) => signed.get(p)).filter((u): u is string => !!u);

  // Música
  const track = carta.spotify_track_id ? await getTrack(carta.spotify_track_id) : null;

  // Trecho declaração: primeira frase ou primeiros 140 chars
  const trecho = declaracao;

  // Cápsula teaser (Eterno): primeira cápsula futura
  let capsulaTeaser: { unlock_em: string } | null = null;
  if (carta.plano === "eterno") {
    const { data: caps } = await supabase
      .from("capsulas")
      .select("unlock_em")
      .eq("carta_id", carta.id)
      .gt("unlock_em", new Date().toISOString())
      .order("unlock_em", { ascending: true })
      .limit(1);
    if (caps?.[0]) capsulaTeaser = caps[0];
  }

  return (
    <main className="min-h-[100dvh] w-full bg-cocoa text-rose-mist">
      <WrappedStory
        slug={carta.slug}
        plano={carta.plano}
        nomes={nomes}
        dataInicio={dataInicio}
        dataRomanos={dataRomanos}
        diasJuntos={marcos.dias}
        diasExtenso={porExtenso(marcos.dias)}
        diasFmt={formatarBR(marcos.dias)}
        luas={formatarBR(marcos.luas)}
        batidas={formatarBR(marcos.batidas)}
        natais={formatarBR(marcos.natais)}
        diasDosNamorados={formatarBR(marcos.diasDosNamorados)}
        trecho={trecho}
        fotoUrls={fotoUrls}
        track={track ? { id: track.id, name: track.name, artistas: track.artists, albumArt: track.albumArt ?? null, previewUrl: track.previewUrl ?? null } : null}
        capsulaUnlock={capsulaTeaser?.unlock_em ?? null}
        appUrl={publicEnv.NEXT_PUBLIC_APP_URL}
      />
    </main>
  );
}
