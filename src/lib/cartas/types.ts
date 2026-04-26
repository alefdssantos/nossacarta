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
