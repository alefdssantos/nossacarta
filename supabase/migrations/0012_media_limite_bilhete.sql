-- Enforce MAX_FOTOS_BILHETE (8) no banco, bloqueando INSERT direto via Supabase client.
-- Plano eterno: sem limite.

create or replace function public.tg_limitar_fotos_bilhete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plano text;
  v_count integer;
begin
  select plano into v_plano from public.cartas where id = new.carta_id;

  if v_plano = 'bilhete' then
    select count(*) into v_count from public.media where carta_id = new.carta_id;
    if v_count >= 8 then
      raise exception 'Plano Bilhete: máximo 8 fotos.' using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create trigger media_limitar_fotos_bilhete
  before insert on public.media
  for each row execute function public.tg_limitar_fotos_bilhete();
