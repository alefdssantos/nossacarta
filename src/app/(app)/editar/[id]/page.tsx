import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlanoPill, StatusPill } from "@/components/StatusPill";
import { conteudoCartaV1Schema } from "@/lib/cartas/schema";
import { CopiarLink } from "./CopiarLink";
import { DestinatarioEmailForm } from "./DestinatarioEmailForm";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = { title: "Editar carta — NossaCarta" };

type Params = Promise<{ id: string }>;

const dataFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export default async function EditarPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/login?next=/editar/${id}`);

  const { data: carta } = await supabase
    .from("cartas")
    .select(
      "id, slug, plano, status, conteudo, data_inicio_relacionamento, publicada_em, expira_em, owner_id, acesso_token, destinatario_email",
    )
    .eq("id", id)
    .maybeSingle();

  if (!carta || carta.owner_id !== userData.user.id) notFound();

  if (carta.status !== "publicada") {
    redirect(`/criar/${id}/nomes`);
  }

  const cParse = conteudoCartaV1Schema.safeParse(carta.conteudo);
  const nomes = cParse.success ? cParse.data.nomes : null;
  const titulo = nomes ? `${nomes.pessoa1} & ${nomes.pessoa2}` : "Carta";

  const { count: capsCount } = await supabase
    .from("capsulas")
    .select("id", { count: "exact", head: true })
    .eq("carta_id", id);

  const expirada = carta.expira_em && new Date(carta.expira_em) < new Date();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 md:py-20">
      <header className="border-b border-cocoa/12 pb-8">
        <Link
          href="/conta"
          className="font-sans text-[10px] uppercase tracking-[0.22em] text-cocoa/55 underline-offset-4 hover:text-ruby hover:underline"
        >
          ← minha conta
        </Link>
        <p className="mt-4 font-script text-5xl text-ruby">{titulo}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <PlanoPill plano={carta.plano} />
          <StatusPill status={carta.status} />
          {carta.publicada_em && (
            <span className="font-prose text-[12px] italic text-mauve">
              publicada em {dataFmt.format(new Date(carta.publicada_em))}
            </span>
          )}
          {carta.expira_em && (
            <span className="font-prose text-[12px] italic text-mauve">
              {expirada ? "expirada em" : "expira em"} {dataFmt.format(new Date(carta.expira_em))}
            </span>
          )}
        </div>
      </header>

      <section className="mt-10 rounded-2xl border border-cocoa/12 bg-paper px-6 py-6 shadow-engrave">
        <h2 className="font-serif text-xl italic text-cocoa">Compartilhar carta</h2>
        <p className="mt-1 font-prose text-[12px] italic text-mauve">
          {carta.destinatario_email
            ? `Destinatária: ${carta.destinatario_email}`
            : "Nenhum e-mail de destinatária cadastrado"}
        </p>
        <p className="mt-3 break-all font-mono text-[11px] text-cocoa/70">
          nossacarta.love/{carta.slug}?t={carta.acesso_token}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/${carta.slug}?t=${carta.acesso_token}`}
            target="_blank"
            rel="noopener"
            className="rounded-full bg-ruby px-5 py-2 font-sans text-[11px] uppercase tracking-[0.22em] text-rose-mist shadow-[0_18px_30px_-18px_rgba(124,14,29,0.55)] hover:bg-ruby-deep"
          >
            Abrir carta →
          </Link>
          <CopiarLink url={`${publicEnv.NEXT_PUBLIC_APP_URL}/${carta.slug}?t=${carta.acesso_token}`} />
          <Link
            href={`/api/qr/${carta.slug}/card`}
            target="_blank"
            rel="noopener"
            className="rounded-full border border-cocoa/25 px-5 py-2 font-sans text-[11px] uppercase tracking-[0.22em] text-cocoa transition hover:border-ruby/40 hover:text-ruby"
            download={`nossacarta-${carta.slug}.png`}
          >
            Baixar QR ↓
          </Link>
        </div>
        <DestinatarioEmailForm cartaId={carta.id} emailAtual={carta.destinatario_email} />
      </section>

      {carta.plano === "eterno" ? (
        <>
          <section className="mt-8">
            <h2 className="font-serif text-xl italic text-cocoa">Conteúdo</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              <ContentCard
                href={`/criar/${id}/nomes`}
                titulo="Nomes & data"
                descricao="endereço da carta"
              />
              <ContentCard
                href={`/criar/${id}/declaracao`}
                titulo="Declaração & tema"
                descricao="texto principal"
              />
              <ContentCard
                href={`/criar/${id}/fotos`}
                titulo="Fotos"
                descricao="caderno de retratos"
              />
              <ContentCard
                href={`/criar/${id}/musica`}
                titulo="Música"
                descricao="trilha do Spotify"
              />
              <CardLink
                href={`/editar/${id}/capsulas`}
                titulo="Cápsulas do tempo"
                descricao={
                  capsCount && capsCount > 0
                    ? `${capsCount} ${capsCount === 1 ? "selada" : "seladas"}`
                    : "abrir em datas futuras"
                }
                destaque
              />
              <CardLink
                href={`/editar/${id}/marcos`}
                titulo="Linha do tempo"
                descricao="datas e marcos da história"
                destaque
              />
            </ul>
          </section>
        </>
      ) : (
        <section className="mt-8 rounded-2xl border border-cocoa/15 bg-paper px-6 py-6">
          <p className="font-prose text-[14px] italic text-cocoa-soft">
            O plano Bilhete não permite edição contínua. Após a publicação, a carta fica
            disponível por 7 dias e depois é arquivada.
          </p>
        </section>
      )}
    </main>
  );
}

function ContentCard({
  href,
  titulo,
  descricao,
}: {
  href: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex h-full flex-col rounded-xl border border-cocoa/12 bg-paper px-4 py-3 shadow-engrave transition hover:border-ruby/40"
      >
        <p className="font-serif italic text-[16px] text-cocoa">{titulo}</p>
        <p className="mt-0.5 font-prose text-[12px] italic text-mauve">{descricao}</p>
        <span className="mt-2 font-sans text-[10px] uppercase tracking-[0.18em] text-ruby transition group-hover:translate-x-0.5">
          editar →
        </span>
      </Link>
    </li>
  );
}

function CardLink({
  href,
  titulo,
  descricao,
  destaque = false,
}: {
  href: string;
  titulo: string;
  descricao: string;
  destaque?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`group flex h-full flex-col rounded-xl px-4 py-3 shadow-engrave transition ${
          destaque
            ? "border border-champagne-deep/40 bg-champagne-soft/30 hover:border-ruby/40"
            : "border border-cocoa/12 bg-paper hover:border-ruby/40"
        }`}
      >
        <p className="font-serif italic text-[16px] text-cocoa">{titulo}</p>
        <p className="mt-0.5 font-prose text-[12px] italic text-mauve">{descricao}</p>
        <span className="mt-2 font-sans text-[10px] uppercase tracking-[0.18em] text-ruby transition group-hover:translate-x-0.5">
          gerenciar →
        </span>
      </Link>
    </li>
  );
}
