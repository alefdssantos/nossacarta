-- Hardening pós-advisor + bucket Storage de fotos

-- 1. Fix function_search_path_mutable em tg_set_atualizado_em
create or replace function public.tg_set_atualizado_em()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- 2. Revogar acessos indevidos de anon (advisor pegou perfis e pagamentos)
revoke all on public.perfis from anon;
revoke all on public.pagamentos from anon;

-- 3. Bucket Storage de fotos das cartas
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'carta-fotos',
  'carta-fotos',
  true, -- leitura pública (cartas publicadas mostram fotos sem auth)
  5242880, -- 5 MiB por arquivo
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- 4. Storage policies em storage.objects
-- Convenção de path: <carta_id>/<filename>
-- Acesso só permitido se primeiro segmento for ID de carta que o user é dono.

-- SELECT público (bucket público) — qualquer um lê fotos de cartas publicadas
-- já vem habilitado por bucket public=true. Mas restringimos a cartas ativas:
create policy "carta-fotos: leitura pública só de cartas ativas"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'carta-fotos'
    and exists (
      select 1 from public.cartas c
      where c.id::text = (storage.foldername(name))[1]
        and c.status = 'publicada'
        and (c.expira_em is null or c.expira_em > now())
    )
  );

-- INSERT: dono da carta sobe foto na pasta <carta_id>/...
create policy "carta-fotos: dono insere"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'carta-fotos'
    and exists (
      select 1 from public.cartas c
      where c.id::text = (storage.foldername(name))[1]
        and c.owner_id = (select auth.uid())
    )
  );

-- UPDATE: dono atualiza próprios arquivos
create policy "carta-fotos: dono atualiza"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'carta-fotos'
    and exists (
      select 1 from public.cartas c
      where c.id::text = (storage.foldername(name))[1]
        and c.owner_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'carta-fotos'
    and exists (
      select 1 from public.cartas c
      where c.id::text = (storage.foldername(name))[1]
        and c.owner_id = (select auth.uid())
    )
  );

-- DELETE: dono deleta próprios arquivos
create policy "carta-fotos: dono deleta"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'carta-fotos'
    and exists (
      select 1 from public.cartas c
      where c.id::text = (storage.foldername(name))[1]
        and c.owner_id = (select auth.uid())
    )
  );
