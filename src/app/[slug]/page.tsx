import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { conteudoCartaV1Schema } from "@/lib/cartas/schema";
import { dataEmRomanos } from "@/lib/cartas/algarismos-romanos";
import { getSignedFotoUrls } from "@/lib/supabase/storage";
import { getTrack } from "@/lib/spotify/api";
import { publicEnv } from "@/lib/env";

import { CapaEnvelope } from "@/components/letter/CapaEnvelope";
import { Frontispicio } from "@/components/letter/Frontispicio";
import { Dedicatoria } from "@/components/letter/Dedicatoria";
import { ContadorProsa } from "@/components/letter/ContadorProsa";
import { Carta } from "@/components/letter/Carta";
import { CadernoFotos } from "@/components/letter/CadernoFotos";
import { TrilhaSonora } from "@/components/letter/TrilhaSonora";
import { CapsulasSeladas } from "@/components/letter/CapsulasSeladas";
import { MapaEstrelas } from "@/components/letter/MapaEstrelas";
import { MarcosTimeline } from "@/components/letter/MarcosTimeline";
import { Colofao } from "@/components/letter/Colofao";
import type { CapsulaPublica } from "@/lib/cartas/types";

type Params = Promise<{ slug: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: c } = await supabase.from("cartas").select("conteudo").eq("slug", slug).maybeSingle();
  const parsed = c?.conteudo ? conteudoCartaV1Schema.safeParse(c.conteudo) : null;
  const nomes = parsed?.success ? parsed.data.nomes : null;
  const titulo = nomes ? `${nomes.pessoa1} & ${nomes.pessoa2}` : "NossaCarta";
  return {
    title: `${titulo} — NossaCarta`,
    description: "Uma carta eterna, em uma só página.",
    robots: { index: false, follow: false },
  };
}

export default async function CartaPublicaPage({ params }: { params: Params }) {
  const { slug } = await params;
  // Identidade vem de headers setados pelo middleware (confiável em Next.js 16)
  const h = await headers();
  const userId = h.get("x-user-id");
  const userEmail = h.get("x-user-email");

  const admin = createAdminClient();
  const { data: carta } = await admin
    .from("cartas")
    .select(
      "id, slug, plano, status, expira_em, publicada_em, conteudo, data_inicio_relacionamento, spotify_track_id, owner_id, destinatario_email",
    )
    .eq("slug", slug)
    .eq("status", "publicada")
    .maybeSingle();

  if (!carta) notFound();

  const podeAcessar =
    userId && (carta.owner_id === userId || carta.destinatario_email === userEmail);
  if (!podeAcessar) notFound();

  const supabase = await createClient();

  const conteudoParse = conteudoCartaV1Schema.safeParse(carta.conteudo);
  const conteudo = conteudoParse.success ? conteudoParse.data : null;
  const nomes = conteudo?.nomes;
  const declaracao = conteudo?.declaracao;
  const dataInicio = carta.data_inicio_relacionamento;

  if (!nomes || !dataInicio || !declaracao) notFound();

  const { data: medias } = await supabase
    .from("media")
    .select("id, storage_path, ordem, caption")
    .eq("carta_id", carta.id)
    .order("ordem", { ascending: true });

  const lista = medias ?? [];
  const paths = lista.map((m) => m.storage_path);
  const signed = paths.length ? await getSignedFotoUrls(paths, 60 * 60 * 4) : new Map<string, string>();
  const fotos = lista
    .map((m) => ({ id: m.id, url: signed.get(m.storage_path) ?? "", caption: m.caption }))
    .filter((f) => f.url);

  let capsulas: CapsulaPublica[] = [];
  let marcos: Array<{
    id: string;
    data: string;
    titulo: string;
    descricao: string | null;
    fotoUrl: string | null;
  }> = [];
  if (carta.plano === "eterno") {
    const { data: marcosData } = await supabase
      .from("marcos")
      .select("id, data, titulo, descricao, foto_path")
      .eq("carta_id", carta.id)
      .order("data", { ascending: true });
    const lista = marcosData ?? [];
    const fotoPaths = lista.map((m) => m.foto_path).filter((p): p is string => Boolean(p));
    const signedMarcos = fotoPaths.length
      ? await getSignedFotoUrls(fotoPaths, 60 * 60 * 4)
      : new Map<string, string>();
    marcos = lista.map((m) => ({
      id: m.id,
      data: m.data,
      titulo: m.titulo,
      descricao: m.descricao,
      fotoUrl: m.foto_path ? signedMarcos.get(m.foto_path) ?? null : null,
    }));
  }
  if (carta.plano === "eterno") {
    const { data } = await supabase.rpc("carta_capsulas_publicas", { p_carta_id: carta.id });
    capsulas = (data ?? []).map((c) => ({
      id: c.id,
      unlock_em: c.unlock_em,
      aberta_em: (c as { aberta_em?: string | null }).aberta_em ?? null,
      mensagem: c.mensagem ?? null,
      criada_em: c.criada_em,
    }));
  }

  const track = carta.spotify_track_id ? await getTrack(carta.spotify_track_id) : null;
  const dataRomanos = dataEmRomanos(dataInicio);
  const inicial1 = nomes.pessoa1.charAt(0).toLocaleUpperCase("pt-BR");
  const inicial2 = nomes.pessoa2.charAt(0).toLocaleUpperCase("pt-BR");
  const iniciais = `${inicial1}&${inicial2}`;
  const primeiroNomePessoa1 = nomes.pessoa1.split(/\s+/)[0] ?? nomes.pessoa1;
  const tema = conteudo?.tema ?? "ruby-couture";

  return (
    <main className="bg-rose-mist text-cocoa" data-tema={tema}>
      <CapaEnvelope
        paraNome={nomes.pessoa2}
        dataInicioRomanos={dataRomanos}
        iniciaisMonograma={iniciais}
      />

      <div id="frontispicio" />
      <Frontispicio pessoa1={nomes.pessoa1} pessoa2={nomes.pessoa2} dataRomanos={dataRomanos} />

      <Dedicatoria />

      {carta.plano === "eterno" && <MapaEstrelas dataInicio={dataInicio} />}

      <ContadorProsa dataInicio={dataInicio} />

      <Carta texto={declaracao} signature={primeiroNomePessoa1} />

      <CadernoFotos fotos={fotos} />

      {carta.plano === "eterno" && marcos.length > 0 && <MarcosTimeline marcos={marcos} />}

      {track && (
        <TrilhaSonora trackId={track.id} trackName={track.name} artistas={track.artists} />
      )}

      <CapsulasSeladas capsulas={capsulas} />

      <Colofao
        pessoa2={nomes.pessoa2}
        slug={slug}
        appUrl={publicEnv.NEXT_PUBLIC_APP_URL}
        publicadaEm={carta.publicada_em ?? new Date().toISOString()}
      />
    </main>
  );
}
