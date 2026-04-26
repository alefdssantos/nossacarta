-- Função SECURITY DEFINER que expõe cápsulas de carta publicada para anon/auth,
-- omitindo o conteúdo da mensagem enquanto a cápsula estiver selada.
-- Substitui a leitura via RLS direto (que exigiria mostrar mensagem ou nada).

create or replace function public.carta_capsulas_publicas(p_carta_id uuid)
returns table (
  id uuid,
  unlock_em timestamptz,
  aberta_em timestamptz,
  mensagem text,
  criada_em timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.unlock_em,
    c.aberta_em,
    case when c.unlock_em <= now() then c.mensagem else null end as mensagem,
    c.criada_em
  from public.capsulas c
  where c.carta_id = p_carta_id
    and public.carta_publica_ativa(p_carta_id)
  order by c.unlock_em asc;
$$;

grant execute on function public.carta_capsulas_publicas(uuid) to anon, authenticated;
