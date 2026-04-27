import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Stepper } from "@/components/Stepper";
import { PlanoPill } from "@/components/StatusPill";
import { wizardSteps } from "@/app/(app)/criar/page";
import { getTrack } from "@/lib/spotify/api";
import { getSpotifyEnv } from "@/lib/env";
import { MusicaPicker } from "./MusicaPicker";

export const metadata: Metadata = {
  title: "Música — NossaCarta",
};

type Params = Promise<{ id: string }>;

export default async function MusicaPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/login?next=/criar/${id}/musica`);

  const { data: carta, error } = await supabase
    .from("cartas")
    .select("id, plano, status, spotify_track_id, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !carta || carta.owner_id !== userData.user.id) notFound();
  if (carta.status === "publicada" && carta.plano !== "eterno") redirect(`/conta`);

  const spotifyConfigurado = getSpotifyEnv().success;
  const atual = carta.spotify_track_id && spotifyConfigurado
    ? await getTrack(carta.spotify_track_id)
    : null;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 md:py-16">
      <Stepper steps={wizardSteps} current={4} />

      <header className="mt-10">
        <div className="flex items-center gap-3">
          <PlanoPill plano={carta.plano} />
          <Link
            href={`/criar/${carta.id}/fotos`}
            className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55 underline-offset-4 hover:text-ruby hover:underline"
          >
            ← voltar
          </Link>
        </div>
        <p className="mt-5 font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
          Etapa 5
        </p>
        <p className="mt-2 font-script text-5xl text-ruby">A música de vocês</p>
        <p className="mt-3 font-prose text-[15px] italic leading-relaxed text-cocoa-soft">
          Procure a faixa que conta a história. Toca como capa sonora da carta.
        </p>
      </header>

      {!spotifyConfigurado ? (
        <section className="mt-10 rounded-xl border border-champagne-deep/40 bg-champagne-soft/30 px-5 py-6 text-center">
          <p className="font-prose text-sm italic text-cocoa-soft">
            Spotify ainda não configurado. Você pode pular essa etapa por agora.
          </p>
          <Link
            href={`/conta`}
            className="mt-4 inline-flex rounded-full bg-ruby px-7 py-3 font-sans text-[11px] uppercase tracking-[0.24em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] hover:bg-ruby-deep"
          >
            Pular →
          </Link>
        </section>
      ) : (
        <section className="mt-10">
          <MusicaPicker
            cartaId={carta.id}
            trackAtual={atual}
          />
        </section>
      )}
    </main>
  );
}
