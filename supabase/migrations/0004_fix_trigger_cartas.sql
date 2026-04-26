-- Bug 42703: trigger tg_set_atualizado_em tentava setar new.atualizado_em
-- mas cartas tem coluna atualizada_em (feminino). Cria função separada
-- pra cartas e troca o trigger.

create or replace function public.tg_set_atualizada_em()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.atualizada_em = now();
  return new;
end;
$$;

drop trigger if exists cartas_set_atualizada_em on public.cartas;

create trigger cartas_set_atualizada_em
  before update on public.cartas
  for each row execute function public.tg_set_atualizada_em();
