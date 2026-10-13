-- Fecha leitura anonima de carta publicada e trava publicacao direta.
-- 0013 tentou DROP POLICY cartas_select_publica, nome que nunca existiu.
-- A policy real e "cartas: publico le publicadas e ativas".

drop policy if exists "cartas: público lê publicadas e ativas" on public.cartas;
drop policy if exists cartas_select_publica on public.cartas;
drop policy if exists "media: público lê em carta pública" on public.media;
drop policy if exists media_select_publica on public.media;
drop policy if exists "marcos_select_publica" on public.marcos;
drop policy if exists marcos_select_publica on public.marcos;
drop policy if exists "capsulas: público lê desbloqueadas em carta pública" on public.capsulas;
drop policy if exists capsulas_select_publica on public.capsulas;
drop policy if exists "carta-fotos: leitura pública só de cartas ativas" on storage.objects;
drop policy if exists carta_fotos_select_publica on storage.objects;

alter table storage.objects enable row level security;

-- Destinatario logado continua lendo. Anon nao entra na policy.
drop policy if exists "cartas: destinatário lê carta publicada" on public.cartas;
create policy "cartas: destinatário lê carta publicada"
  on public.cartas for select
  to authenticated
  using (
    status = 'publicada'
    and (expira_em is null or expira_em > now())
    and destinatario_email = auth.email()
  );

-- So o service role (pagina, webhook) executa. Anon e authenticated nao.
revoke all on function public.carta_capsulas_publicas(uuid) from public;
revoke all on function public.carta_capsulas_publicas(uuid) from anon;
revoke all on function public.carta_capsulas_publicas(uuid) from authenticated;
grant execute on function public.carta_capsulas_publicas(uuid) to service_role;

-- So diz se a carta esta publicada. Nao precisa ficar na API anonima.
revoke all on function public.carta_publica_ativa(uuid) from public;
revoke all on function public.carta_publica_ativa(uuid) from anon;
revoke all on function public.carta_publica_ativa(uuid) from authenticated;
grant execute on function public.carta_publica_ativa(uuid) to service_role;

-- Dono edita conteudo e pode ir a aguardando_pagamento.
-- Nao altera plano, prazo, token, dono, nem publica.
revoke update on table public.cartas from authenticated;
grant update (
  slug,
  conteudo,
  data_inicio_relacionamento,
  destinatario_email,
  spotify_track_id,
  status
) on table public.cartas to authenticated;

create or replace function public.tg_cartas_bloqueia_publicacao_direta()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  -- Webhook, cron e bypass dev usam service_role. Postgres roda migrations.
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;

  if new.status is distinct from old.status and new.status = 'publicada' then
    raise exception 'publicacao direta bloqueada' using errcode = '42501';
  end if;

  if new.plano is distinct from old.plano
     or new.expira_em is distinct from old.expira_em
     or new.publicada_em is distinct from old.publicada_em
     or new.acesso_token is distinct from old.acesso_token
     or new.owner_id is distinct from old.owner_id then
    raise exception 'coluna protegida' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists cartas_bloqueia_publicacao_direta on public.cartas;
create trigger cartas_bloqueia_publicacao_direta
  before update on public.cartas
  for each row execute function public.tg_cartas_bloqueia_publicacao_direta();

-- Preco tem que bater com o plano da carta. Igual a PRECOS_CENTAVOS em src/lib/mp/client.ts.
drop policy if exists "pagamentos_insert_dono" on public.pagamentos;
create policy "pagamentos_insert_dono"
  on public.pagamentos for insert
  to authenticated
  with check (
    pagamentos.owner_id = (select auth.uid())
    and pagamentos.status = 'pending'
    and exists (
      select 1 from public.cartas c
      where c.id = pagamentos.carta_id
        and c.owner_id = (select auth.uid())
        and (
          (c.plano = 'bilhete' and pagamentos.plano = 'bilhete' and pagamentos.valor_centavos = 1790)
          or (c.plano = 'eterno' and pagamentos.plano = 'eterno' and pagamentos.valor_centavos = 2990)
        )
    )
  );
