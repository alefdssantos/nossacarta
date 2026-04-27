-- Linha do tempo de marcos (Eterno only).
-- Eventos especiais: primeiro encontro, viagem, casamento, mudança, etc.

create table public.marcos (
  id uuid primary key default gen_random_uuid(),
  carta_id uuid not null references public.cartas(id) on delete cascade,
  data date not null,
  titulo text not null,
  descricao text,
  ordem integer not null default 0,
  criado_em timestamptz not null default now(),
  constraint titulo_nao_vazio check (length(trim(titulo)) > 0),
  constraint titulo_max check (length(titulo) <= 80),
  constraint descricao_max check (descricao is null or length(descricao) <= 500)
);

create index marcos_carta_idx on public.marcos(carta_id);
create index marcos_carta_data_idx on public.marcos(carta_id, data);

alter table public.marcos enable row level security;

create policy "marcos_select_dono"
  on public.marcos for select
  to authenticated
  using (
    exists (
      select 1 from public.cartas c
      where c.id = marcos.carta_id and c.owner_id = (select auth.uid())
    )
  );

create policy "marcos_select_publica"
  on public.marcos for select
  to anon, authenticated
  using (public.carta_publica_ativa(carta_id));

create policy "marcos_insert_dono"
  on public.marcos for insert
  to authenticated
  with check (
    exists (
      select 1 from public.cartas c
      where c.id = marcos.carta_id
        and c.owner_id = (select auth.uid())
        and c.plano = 'eterno'
    )
  );

create policy "marcos_update_dono"
  on public.marcos for update
  to authenticated
  using (
    exists (
      select 1 from public.cartas c
      where c.id = marcos.carta_id and c.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.cartas c
      where c.id = marcos.carta_id and c.owner_id = (select auth.uid())
    )
  );

create policy "marcos_delete_dono"
  on public.marcos for delete
  to authenticated
  using (
    exists (
      select 1 from public.cartas c
      where c.id = marcos.carta_id and c.owner_id = (select auth.uid())
    )
  );

grant select, insert, update, delete on public.marcos to authenticated;
grant select on public.marcos to anon;
