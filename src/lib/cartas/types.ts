export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string; field?: string }
  | { status: "ok"; cartaId: string };

export const initialState: ActionState = { status: "idle" };
