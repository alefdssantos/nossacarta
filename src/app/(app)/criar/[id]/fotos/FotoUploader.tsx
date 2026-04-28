"use client";

import { useRef, useState, useTransition } from "react";
import { uploadMediaAction } from "@/lib/cartas/media-actions";
import { initialMediaState } from "@/lib/cartas/types";

const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS_OK = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  cartaId: string;
  count: number;
};

export function FotoUploader({ cartaId, count }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState<{ atual: number; total: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // Validação client-side antes de qualquer upload
    const invalidas = files.filter((f) => f.size > MAX_BYTES || !TIPOS_OK.includes(f.type));
    if (invalidas.length) {
      setErro(
        invalidas.map((f) =>
          f.size > MAX_BYTES
            ? `"${f.name}" é maior que 5 MB — reduza o tamanho antes de subir.`
            : `"${f.name}" não é JPG, PNG ou WebP.`
        ).join(" | ")
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setErro(null);
    setProgress({ atual: 0, total: files.length });

    startTransition(async () => {
      for (let i = 0; i < files.length; i++) {
        setProgress({ atual: i + 1, total: files.length });
        const fd = new FormData();
        fd.set("cartaId", cartaId);
        fd.set("foto", files[i]);
        const result = await uploadMediaAction(initialMediaState, fd);
        if (result.status === "error") {
          setErro(`Foto ${i + 1}: ${result.message}`);
          break;
        }
      }
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-cocoa/25 bg-rose-mist/40 p-6">
      <label className="flex cursor-pointer flex-col items-center gap-2 text-center">
        <span className="font-script text-3xl text-ruby">+ adicionar fotos</span>
        <span className="font-prose text-[13px] italic text-cocoa-soft">
          {count === 0 ? "Comece pela foto de capa." : `Próxima será a #${count + 1}.`}
          {" "}Selecione várias de uma vez.
        </span>
        <input
          ref={inputRef}
          type="file"
          name="foto"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleChange}
          disabled={isPending}
          className="sr-only"
        />
        <span className="mt-2 rounded-full border border-cocoa/25 bg-paper px-5 py-2 font-sans text-[11px] uppercase tracking-[0.22em] text-cocoa hover:border-ruby/40 hover:text-ruby">
          {isPending && progress
            ? `Subindo ${progress.atual} de ${progress.total}…`
            : "Selecionar fotos"}
        </span>
      </label>

      {erro && (
        <p role="alert" className="text-center font-prose text-sm text-ruby-deep">
          {erro}
        </p>
      )}
    </div>
  );
}
