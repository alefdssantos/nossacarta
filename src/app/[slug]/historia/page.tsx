import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { conteudoCartaV1Schema } from "@/lib/cartas/schema";
import { dataEmRomanos } from "@/lib/cartas/algarismos-romanos";
import { getSignedFotoUrls } from "@/lib/supabase/storage";
import { getTrack } from "@/lib/spotify/api";
import { calcularMarcos, formatarBR } from "@/lib/cartas/marcos";
import { porExtenso } from "@/lib/cartas/numero-extenso";
import { publicEnv } from "@/lib/env";
import { WrappedStory } from "./WrappedStory";

type Params = Promise<{ slug: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `História de ${slug} — NossaCarta`,
    description: "Uma carta eterna em capítulos.",
    robots: { index: false, follow: false },
  };
}

export default async function WrappedPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: carta } = await supabase
    .from("cartas")
    .select(
      "id, slug, plano, status, expira_em, publicada_em, conteudo, data_inicio_relacionamento, spotify_track_id",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (!carta) notFound();

  const cParse = conteudoCartaV1Schema.safeParse(carta.conteudo);
  const conteudo = cParse.success ? cParse.data : null;
  const nomes = conteudo?.nomes;
  const declaracao = conteudo?.declaracao;
  const dataInicio = carta.data_inicio_relacionamento;
  if (!nomes || !dataInicio || !declaracao) notFound();

  const dataRomanos = dataEmRomanos(dataInicio);
  const marcos = calcularMarcos(dataInicio);

  // Foto destaque (primeira)
  const { data: medias } = await supabase
    .from("media")
    .select("id, storage_path, ordem")
    .eq("carta_id", carta.id)
    .order("ordem", { ascending: true })
    .limit(1);
  const foto = medias?.[0];
  const signed = foto ? await getSignedFotoUrls([foto.storage_path], 60 * 60 * 4) : new Map<string, string>();
  const fotoUrl = foto ? signed.get(foto.storage_path) : null;

  // Música
  const track = carta.spotify_track_id ? await getTrack(carta.spotify_track_id) : null;

  // Trecho declaração: primeira frase ou primeiros 140 chars
  const trecho = (() => {
    const frases = declaracao.split(/[.!?]\s+/).filter((s) => s.trim().length > 10);
    const primeira = frases[0]?.trim();
    if (primeira && primeira.length <= 180) return primeira;
    return declaracao.slice(0, 140).trim() + "…";
  })();

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
        fotoUrl={fotoUrl ?? null}
        track={track ? { id: track.id, name: track.name, artistas: track.artists, albumArt: track.albumArt ?? null } : null}
        capsulaUnlock={capsulaTeaser?.unlock_em ?? null}
        appUrl={publicEnv.NEXT_PUBLIC_APP_URL}
      />
    </main>
  );
}
