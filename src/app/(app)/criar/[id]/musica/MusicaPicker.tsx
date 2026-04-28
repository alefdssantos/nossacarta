"use client";

import { useActionState, useState, useTransition } from "react";
import { buscarTracksAction, salvarSpotifyAction } from "@/lib/cartas/musica-actions";
import { buscarInitial, type BuscarState } from "@/lib/cartas/types";
import type { SpotifyTrack } from "@/lib/spotify/api";

type Props = {
  cartaId: string;
  trackAtual: SpotifyTrack | null;
};

function fmtDuracao(ms: number) {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicaPicker({ cartaId, trackAtual }: Props) {
  const [state, action, pending] = useActionState<BuscarState, FormData>(
    buscarTracksAction,
    buscarInitial,
  );
  const [selecionada, setSelecionada] = useState<SpotifyTrack | null>(trackAtual);
  const [saving, startSave] = useTransition();

  return (
    <div className="flex w-full flex-col gap-6">
      <form action={action} className="flex w-full gap-2">
        <input
          type="text"
          name="q"
          required
          maxLength={100}
          placeholder="Música, artista ou álbum"
          className="min-w-0 flex-1 rounded-md border border-cocoa/20 bg-paper px-4 py-3 font-prose text-cocoa placeholder:text-cocoa/35 focus:border-ruby focus:outline-none focus:ring-1 focus:ring-ruby/40"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full bg-ruby px-5 py-3 font-sans text-[11px] uppercase tracking-[0.22em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] hover:bg-ruby-deep disabled:opacity-60"
        >
          {pending ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {state.status === "error" && (
        <p role="alert" className="font-prose text-sm text-ruby-deep">
          {state.message}
        </p>
      )}

      {selecionada && (
        <div className="overflow-hidden rounded-xl border border-ruby/40 bg-paper shadow-foil">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <span className="font-sans text-[10px] uppercase tracking-[0.22em] text-champagne-deep">
              Selecionada
            </span>
            <button
              type="button"
              onClick={() => setSelecionada(null)}
              className="font-sans text-[10px] uppercase tracking-[0.18em] text-cocoa/60 underline-offset-4 hover:text-ruby hover:underline"
            >
              trocar
            </button>
          </div>
          <iframe
            title={`${selecionada.name} — ${selecionada.artists}`}
            src={`https://open.spotify.com/embed/track/${selecionada.id}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="block w-full border-0"
          />
        </div>
      )}

      {state.status === "ok" && state.results.length === 0 && (
        <p className="font-prose text-sm italic text-cocoa-soft">
          Nada encontrado para &ldquo;{state.query}&rdquo;.
        </p>
      )}

      {state.status === "ok" && state.results.length > 0 && (
        <ul className="flex w-full flex-col gap-1.5 rounded-xl border border-cocoa/15 bg-paper/90 p-1.5">
          {state.results.map((t) => {
            const ativa = selecionada?.id === t.id;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setSelecionada(t)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${
                    ativa
                      ? "bg-ruby/8 ring-1 ring-ruby/30"
                      : "hover:bg-rose-mist/60"
                  }`}
                >
                  {t.albumArt ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.albumArt}
                      alt=""
                      className="h-11 w-11 flex-shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-11 w-11 flex-shrink-0 rounded bg-rose-mist" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`truncate font-prose text-[14px] ${
                        ativa ? "font-semibold text-ruby" : "text-cocoa"
                      }`}
                    >
                      {t.name}
                    </p>
                    <p className="truncate font-prose text-[12px] text-cocoa/55">
                      {t.artists}
                    </p>
                  </div>
                  <span className="font-sans text-[11px] tracking-[0.06em] text-cocoa/45">
                    {fmtDuracao(t.durationMs)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form
        action={(fd) => startSave(() => salvarSpotifyAction(fd))}
        className="flex w-full flex-col items-center gap-3 border-t border-cocoa/10 pt-6"
      >
        <input type="hidden" name="cartaId" value={cartaId} />
        <input type="hidden" name="trackId" value={selecionada?.id ?? ""} />
        <button
          type="submit"
          disabled={saving || pending}
          className="rounded-full bg-ruby px-8 py-3 font-sans text-[11px] uppercase tracking-[0.24em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] hover:bg-ruby-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Salvando…" : selecionada ? "Salvar e continuar →" : "Pular sem música →"}
        </button>
      </form>
    </div>
  );
}
