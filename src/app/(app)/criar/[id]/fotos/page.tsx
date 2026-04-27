import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedFotoUrls } from "@/lib/supabase/storage";
import { Stepper } from "@/components/Stepper";
import { PlanoPill } from "@/components/StatusPill";
import { wizardSteps } from "@/app/(app)/criar/page";
import { MAX_FOTOS_BILHETE } from "@/lib/cartas/schema";
import { reordenarMediaAction, removerMediaAction } from "@/lib/cartas/media-actions";
import { FotoUploader } from "./FotoUploader";

export const metadata: Metadata = {
  title: "Fotos — NossaCarta",
};

type Params = Promise<{ id: string }>;

export default async function FotosPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/login?next=/criar/${id}/fotos`);

  const { data: carta, error } = await supabase
    .from("cartas")
    .select("id, plano, status, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !carta || carta.owner_id !== userData.user.id) notFound();
  if (carta.status === "publicada" && carta.plano !== "eterno") redirect(`/conta`);

  const { data: medias } = await supabase
    .from("media")
    .select("id, storage_path, ordem, caption")
    .eq("carta_id", id)
    .order("ordem", { ascending: true });

  const lista = medias ?? [];
  const paths = lista.map((m) => m.storage_path);
  const signed = paths.length ? await getSignedFotoUrls(paths, 60 * 60) : new Map<string, string>();

  const limite = carta.plano === "bilhete" ? MAX_FOTOS_BILHETE : Infinity;
  const cheio = lista.length >= limite;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 md:py-16">
      <Stepper steps={wizardSteps} current={3} />

      <header className="mt-10">
        <div className="flex items-center gap-3">
          <PlanoPill plano={carta.plano} />
          <Link
            href={`/criar/${carta.id}/declaracao`}
            className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55 underline-offset-4 hover:text-ruby hover:underline"
          >
            ← voltar
          </Link>
        </div>
        <p className="mt-5 font-sans text-[10px] uppercase tracking-[0.32em] text-champagne-deep">
          Etapa 4
        </p>
        <p className="mt-2 font-script text-5xl text-ruby">As fotos de vocês</p>
        <p className="mt-3 font-prose text-[15px] italic leading-relaxed text-cocoa-soft">
          {carta.plano === "bilhete"
            ? `Até ${MAX_FOTOS_BILHETE} fotos. JPG, PNG ou WebP. Máximo 5 MB cada.`
            : "Quantas você quiser. JPG, PNG ou WebP. Máximo 5 MB cada."}
        </p>
      </header>

      <section className="mt-10">
        {cheio ? (
          <p className="rounded-xl border border-champagne-deep/40 bg-champagne-soft/30 px-5 py-4 font-prose text-sm italic text-cocoa-soft">
            Limite de {MAX_FOTOS_BILHETE} fotos atingido. Remova alguma para subir outra ou troque pro plano Eterno.
          </p>
        ) : (
          <FotoUploader cartaId={carta.id} count={lista.length} />
        )}
      </section>

      {lista.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-xl italic text-cocoa">
            {lista.length} {lista.length === 1 ? "foto" : "fotos"}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {lista.map((m, i) => {
              const url = signed.get(m.storage_path);
              const podeSubir = i > 0;
              const podeDescer = i < lista.length - 1;

              const reorderUp = async () => {
                "use server";
                if (!podeSubir) return;
                const novaOrdem = [...lista];
                [novaOrdem[i - 1], novaOrdem[i]] = [novaOrdem[i], novaOrdem[i - 1]];
                const fd = new FormData();
                fd.set("cartaId", carta.id);
                for (const x of novaOrdem) fd.append("mediaIds", x.id);
                await reordenarMediaAction(fd);
              };
              const reorderDown = async () => {
                "use server";
                if (!podeDescer) return;
                const novaOrdem = [...lista];
                [novaOrdem[i + 1], novaOrdem[i]] = [novaOrdem[i], novaOrdem[i + 1]];
                const fd = new FormData();
                fd.set("cartaId", carta.id);
                for (const x of novaOrdem) fd.append("mediaIds", x.id);
                await reordenarMediaAction(fd);
              };

              return (
                <li
                  key={m.id}
                  className="group relative overflow-hidden rounded-xl border border-cocoa/15 bg-paper shadow-engrave"
                >
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={m.caption ?? `foto ${i + 1}`}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-rose-mist text-cocoa/40">
                      foto indisponível
                    </div>
                  )}

                  <div className="absolute left-2 top-2 rounded-full bg-paper/90 px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.18em] text-cocoa-soft">
                    {i + 1}
                  </div>

                  <div className="absolute right-2 top-2 flex gap-1">
                    <form action={reorderUp}>
                      <button
                        type="submit"
                        disabled={!podeSubir}
                        aria-label="subir"
                        className="rounded-full bg-paper/90 px-2 py-1 font-sans text-xs text-cocoa shadow-engrave hover:text-ruby disabled:opacity-30"
                      >
                        ↑
                      </button>
                    </form>
                    <form action={reorderDown}>
                      <button
                        type="submit"
                        disabled={!podeDescer}
                        aria-label="descer"
                        className="rounded-full bg-paper/90 px-2 py-1 font-sans text-xs text-cocoa shadow-engrave hover:text-ruby disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </form>
                    <form action={removerMediaAction}>
                      <input type="hidden" name="cartaId" value={carta.id} />
                      <input type="hidden" name="mediaId" value={m.id} />
                      <button
                        type="submit"
                        aria-label="remover"
                        className="rounded-full bg-paper/90 px-2 py-1 font-sans text-xs text-ruby-deep shadow-engrave hover:bg-ruby hover:text-rose-mist"
                      >
                        ×
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="mt-12 flex justify-center">
        <Link
          href={`/criar/${carta.id}/musica`}
          className="rounded-full bg-ruby px-8 py-3 font-sans text-[11px] uppercase tracking-[0.24em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] transition hover:bg-ruby-deep"
        >
          Continuar →
        </Link>
      </div>
    </main>
  );
}
