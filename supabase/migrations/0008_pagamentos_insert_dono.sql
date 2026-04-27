-- Permitir owner criar registro inicial em pagamentos (status='pending').
-- UPDATE/DELETE continuam exclusivos do service_role (webhook).

grant insert on public.pagamentos to authenticated;

create policy "pagamentos_insert_dono"
  on public.pagamentos for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.cartas c
      where c.id = pagamentos.carta_id
        and c.owner_id = (select auth.uid())
    )
  );
