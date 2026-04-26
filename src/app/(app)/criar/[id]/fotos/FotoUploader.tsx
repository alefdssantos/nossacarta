"use client";

import { useActionState, useRef } from "react";
import { uploadMediaAction } from "@/lib/cartas/media-actions";
import { initialMediaState, type MediaActionState } from "@/lib/cartas/types";

type Props = {
  cartaId: string;
  count: number;
};

export function FotoUploader({ cartaId, count }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<MediaActionState, FormData>(
    uploadMediaAction,
    initialMediaState,
  );

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-cocoa/25 bg-rose-mist/40 p-6"
    >
      <input type="hidden" name="cartaId" value={cartaId} />

      <label className="flex cursor-pointer flex-col items-center gap-2 text-center">
        <span className="font-script text-3xl text-ruby">+ adicionar foto</span>
        <span className="font-prose text-[13px] italic text-cocoa-soft">
          {count === 0 ? "Comece pela foto de capa." : `Próxima foto será a #${count + 1}.`}
        </span>
        <input
          type="file"
          name="foto"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={() => formRef.current?.requestSubmit()}
          className="sr-only"
        />
        <span className="mt-2 rounded-full border border-cocoa/25 bg-paper px-5 py-2 font-sans text-[11px] uppercase tracking-[0.22em] text-cocoa hover:border-ruby/40 hover:text-ruby">
          {pending ? "Subindo…" : "Selecionar arquivo"}
        </span>
      </label>

      {state.status === "error" && (
        <p role="alert" className="text-center font-prose text-sm text-ruby-deep">
          {state.message}
        </p>
      )}
    </form>
  );
}
