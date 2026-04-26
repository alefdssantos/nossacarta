-- NossaCarta — schema inicial
-- Convenções:
-- * RLS habilitada em TODAS as tabelas; nada acessível por anon/authenticated sem policy explícita
-- * Service role bypassa RLS automaticamente (usado em webhooks MP, jobs)
-- * Timestamps em UTC (timestamptz)
-- * IDs uuid via gen_random_uuid()

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- =========================================================================
-- ENUMS
-- =========================================================================

create type plano_carta as enum ('bilhete', 'eterno');
create type status_carta as enum ('rascunho', 'aguardando_pagamento', 'publicada', 'expirada');
create type status_pagamento as enum ('pending', 'approved', 'rejected', 'refunded', 'cancelled');
create type metodo_pagamento as enum ('pix', 'credit_card');

-- =========================================================================
-- TABELAS
-- =========================================================================

-- Perfis (1:1 com auth.users)
create table public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email citext not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Cartas
create table public.cartas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug citext not null unique,
  plano plano_carta not null,
  status status_carta not null default 'rascunho',
  conteudo jsonb not null default '{}'::jsonb,
  spotify_track_id text,
  data_inicio_relacionamento date,
  publicada_em timestamptz,
  expira_em timestamptz, -- bilhete: publicada_em + 7d; eterno: NULL
  criada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now(),
  constraint slug_format check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$'),
  constraint expira_em_consistente check (
    (plano = 'eterno' and expira_em is null) or
    (plano = 'bilhete' and (status <> 'publicada' or expira_em is not null))
  )
);

create index cartas_owner_idx on public.cartas(owner_id);
create index cartas_status_expira_idx on public.cartas(status, expira_em);

-- Cápsulas do tempo (apenas plano eterno)
create table public.capsulas (
  id uuid primary key default gen_random_uuid(),
  carta_id uuid not null references public.cartas(id) on delete cascade,
  unlock_em timestamptz not null,
  mensagem text not null,
  aberta_em timestamptz,
  criada_em timestamptz not null default now(),
  constraint mensagem_nao_vazia check (length(trim(mensagem)) > 0)
);

create index capsulas_carta_idx on public.capsulas(carta_id);
create index capsulas_unlock_idx on public.capsulas(unlock_em);

-- Pagamentos (Mercado Pago)
create table public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  carta_id uuid not null references public.cartas(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete restrict,
  mp_payment_id text unique, -- pode ser null antes de criação no MP
  mp_preference_id text,
  metodo metodo_pagamento not null,
  plano plano_carta not null,
  valor_centavos integer not null check (valor_centavos > 0),
  status status_pagamento not null default 'pending',
  pago_em timestamptz,
  payload_webhook jsonb, -- ÚLTIMO payload bruto recebido (para auditoria)
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index pagamentos_carta_idx on public.pagamentos(carta_id);
create index pagamentos_owner_idx on public.pagamentos(owner_id);
create index pagamentos_status_idx on public.pagamentos(status);

-- Mídia (fotos)
create table public.media (
  id uuid primary key default gen_random_uuid(),
  carta_id uuid not null references public.cartas(id) on delete cascade,
  storage_path text not null unique, -- caminho dentro do bucket carta-fotos
  ordem integer not null default 0,
  caption text,
  largura integer,
  altura integer,
  bytes integer,
  criada_em timestamptz not null default now()
);

create index media_carta_ordem_idx on public.media(carta_id, ordem);

-- Slugs reservados (bloquear roteamento conflitante)
create table public.slugs_reservados (
  slug citext primary key,
  motivo text not null
);

insert into public.slugs_reservados (slug, motivo) values
  ('admin', 'rota interna'),
  ('api', 'rota interna'),
  ('app', 'rota interna'),
  ('conta', 'rota interna'),
  ('login', 'rota interna'),
  ('logout', 'rota interna'),
  ('cadastro', 'rota interna'),
  ('criar', 'rota interna'),
  ('editar', 'rota interna'),
  ('dashboard', 'rota interna'),
  ('pagamento', 'rota interna'),
  ('checkout', 'rota interna'),
  ('webhook', 'rota interna'),
  ('webhooks', 'rota interna'),
  ('termos', 'rota interna'),
  ('privacidade', 'rota interna'),
  ('sobre', 'rota interna'),
  ('contato', 'rota interna'),
  ('faq', 'rota interna'),
  ('blog', 'reservado'),
  ('docs', 'reservado'),
  ('support', 'reservado'),
  ('suporte', 'reservado'),
  ('nossacarta', 'marca'),
  ('root', 'reservado'),
  ('static', 'reservado'),
  ('assets', 'reservado'),
  ('public', 'reservado'),
  ('_next', 'next.js'),
  ('favicon', 'reservado'),
  ('robots', 'reservado'),
  ('sitemap', 'reservado');

-- =========================================================================
-- TRIGGERS — atualizado_em / criar perfil ao registrar
-- =========================================================================

create or replace function public.tg_set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger perfis_set_atualizado_em
  before update on public.perfis
  for each row execute function public.tg_set_atualizado_em();

create trigger cartas_set_atualizada_em
  before update on public.cartas
  for each row execute function public.tg_set_atualizado_em();

create trigger pagamentos_set_atualizado_em
  before update on public.pagamentos
  for each row execute function public.tg_set_atualizado_em();

-- Bloquear slug igual a slug reservado
create or replace function public.tg_validar_slug_carta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.slugs_reservados where slug = new.slug) then
    raise exception 'slug % é reservado', new.slug using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger cartas_validar_slug
  before insert or update of slug on public.cartas
  for each row execute function public.tg_validar_slug_carta();

-- Criar perfil automaticamente quando user criado em auth.users
create or replace function public.tg_handle_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, email, nome)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_novo_usuario();

-- =========================================================================
-- HELPER: carta pública e ativa?
-- =========================================================================

create or replace function public.carta_publica_ativa(p_carta_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cartas c
    where c.id = p_carta_id
      and c.status = 'publicada'
      and (c.expira_em is null or c.expira_em > now())
  );
$$;

-- =========================================================================
-- RLS — habilitar e restringir
-- =========================================================================

alter table public.perfis enable row level security;
alter table public.cartas enable row level security;
alter table public.capsulas enable row level security;
alter table public.pagamentos enable row level security;
alter table public.media enable row level security;
alter table public.slugs_reservados enable row level security;

-- ---- perfis ----
create policy "perfis: dono lê próprio perfil"
  on public.perfis for select
  to authenticated
  using (id = (select auth.uid()));

create policy "perfis: dono atualiza próprio perfil"
  on public.perfis for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- INSERT bloqueado por policy (somente trigger via security definer cria perfil)
-- DELETE bloqueado por policy (cascade de auth.users cuida)

-- ---- cartas ----
create policy "cartas: dono lê próprias"
  on public.cartas for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "cartas: público lê publicadas e ativas"
  on public.cartas for select
  to anon, authenticated
  using (status = 'publicada' and (expira_em is null or expira_em > now()));

create policy "cartas: dono insere"
  on public.cartas for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and status in ('rascunho', 'aguardando_pagamento')
  );

create policy "cartas: dono atualiza próprias"
  on public.cartas for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "cartas: dono deleta rascunho"
  on public.cartas for delete
  to authenticated
  using (owner_id = (select auth.uid()) and status = 'rascunho');

-- ---- capsulas ----
create policy "capsulas: dono lê próprias"
  on public.capsulas for select
  to authenticated
  using (
    exists (
      select 1 from public.cartas c
      where c.id = capsulas.carta_id and c.owner_id = (select auth.uid())
    )
  );

create policy "capsulas: público lê desbloqueadas em carta pública"
  on public.capsulas for select
  to anon, authenticated
  using (
    unlock_em <= now() and public.carta_publica_ativa(carta_id)
  );

create policy "capsulas: dono insere em carta eterna própria"
  on public.capsulas for insert
  to authenticated
  with check (
    exists (
      select 1 from public.cartas c
      where c.id = capsulas.carta_id
        and c.owner_id = (select auth.uid())
        and c.plano = 'eterno'
    )
  );

create policy "capsulas: dono atualiza próprias"
  on public.capsulas for update
  to authenticated
  using (
    exists (
      select 1 from public.cartas c
      where c.id = capsulas.carta_id and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.cartas c
      where c.id = capsulas.carta_id and c.owner_id = (select auth.uid())
    )
  );

create policy "capsulas: dono deleta próprias"
  on public.capsulas for delete
  to authenticated
  using (
    exists (
      select 1 from public.cartas c
      where c.id = capsulas.carta_id and c.owner_id = (select auth.uid())
    )
  );

-- ---- pagamentos ----
-- INSERT/UPDATE somente via service_role (webhook MP). Nenhuma policy para anon/authenticated.
create policy "pagamentos: dono lê próprios"
  on public.pagamentos for select
  to authenticated
  using (owner_id = (select auth.uid()));

-- ---- media ----
create policy "media: dono lê própria"
  on public.media for select
  to authenticated
  using (
    exists (
      select 1 from public.cartas c
      where c.id = media.carta_id and c.owner_id = (select auth.uid())
    )
  );

create policy "media: público lê em carta pública"
  on public.media for select
  to anon, authenticated
  using (public.carta_publica_ativa(carta_id));

create policy "media: dono insere em carta própria"
  on public.media for insert
  to authenticated
  with check (
    exists (
      select 1 from public.cartas c
      where c.id = media.carta_id and c.owner_id = (select auth.uid())
    )
  );

create policy "media: dono atualiza própria"
  on public.media for update
  to authenticated
  using (
    exists (
      select 1 from public.cartas c
      where c.id = media.carta_id and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.cartas c
      where c.id = media.carta_id and c.owner_id = (select auth.uid())
    )
  );

create policy "media: dono deleta própria"
  on public.media for delete
  to authenticated
  using (
    exists (
      select 1 from public.cartas c
      where c.id = media.carta_id and c.owner_id = (select auth.uid())
    )
  );

-- ---- slugs_reservados ----
create policy "slugs_reservados: leitura pública"
  on public.slugs_reservados for select
  to anon, authenticated
  using (true);
-- INSERT/UPDATE/DELETE: somente service_role

-- =========================================================================
-- GRANTS — anon/authenticated só usam via RLS; revoke direto desnecessário em supabase
-- =========================================================================

-- Em Supabase, as roles anon e authenticated já têm GRANTs padrão; RLS restringe linhas.
-- Garantir que tabelas novas estão acessíveis pelas roles (necessário p/ policies funcionarem).
grant select, insert, update, delete on public.perfis to authenticated;
grant select on public.perfis to anon;

grant select, insert, update, delete on public.cartas to authenticated;
grant select on public.cartas to anon;

grant select, insert, update, delete on public.capsulas to authenticated;
grant select on public.capsulas to anon;

grant select on public.pagamentos to authenticated;
-- pagamentos: anon não tem grant nenhum

grant select, insert, update, delete on public.media to authenticated;
grant select on public.media to anon;

grant select on public.slugs_reservados to anon, authenticated;

-- service_role já tem bypass RLS.
