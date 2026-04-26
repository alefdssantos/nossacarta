export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string; field?: string }
  | { status: "ok"; cartaId: string };

export const initialState: ActionState = { status: "idle" };

export type MediaActionState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string };

export const initialMediaState: MediaActionState = { status: "idle" };

import type { SpotifyTrack } from "@/lib/spotify/api";

export type BuscarState =
  | { status: "idle" }
  | { status: "ok"; results: SpotifyTrack[]; query: string }
  | { status: "error"; message: string };

export const buscarInitial: BuscarState = { status: "idle" };

export type CapsulaActionState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string; field?: string };

export const capsulaInitialState: CapsulaActionState = { status: "idle" };

export type CapsulaPublica = {
  id: string;
  unlock_em: string;
  aberta_em: string | null;
  mensagem: string | null;
  criada_em: string;
};
