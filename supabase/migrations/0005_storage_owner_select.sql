-- Bug: bucket carta-fotos é privado e a policy "carta_fotos_select_publica"
-- só permite SELECT (e signed URL) quando carta está publicada e ativa.
-- Dono precisa visualizar fotos enquanto edita rascunho.
-- Adiciona policy SELECT pra dono ler próprias fotos em qualquer status.

create policy "carta_fotos_select_dono"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'carta-fotos'
    and exists (
      select 1 from public.cartas c
      where c.id::text = (storage.foldername(name))[1]
        and c.owner_id = (select auth.uid())
    )
  );
