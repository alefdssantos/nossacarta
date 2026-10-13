\set ON_ERROR_STOP on

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'owner@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'dest@example.com');

insert into public.cartas (
  id, owner_id, slug, plano, status, conteudo, acesso_token, destinatario_email
) values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'carta-pub',
  'eterno',
  'publicada',
  '{"versao":1,"nomes":{"pessoa1":"Ana","pessoa2":"Bia"},"declaracao":"segredo da carta"}',
  'tokensecreto123',
  'dest@example.com'
);

insert into public.cartas (
  id, owner_id, slug, plano, status, conteudo
) values (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'carta-ras',
  'eterno',
  'rascunho',
  '{"versao":1}'
);

insert into public.cartas (
  id, owner_id, slug, plano, status, conteudo
) values (
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  'carta-bil',
  'bilhete',
  'rascunho',
  '{"versao":1}'
);

insert into public.media (carta_id, storage_path, ordem)
values ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333/foto.jpg', 0);

insert into public.marcos (carta_id, data, titulo, descricao)
values ('33333333-3333-3333-3333-333333333333', '2020-01-01', 'encontro', 'segredo do marco');

insert into public.capsulas (carta_id, unlock_em, mensagem)
values (
  '33333333-3333-3333-3333-333333333333',
  now() - interval '1 day',
  'segredo da capsula'
);

insert into storage.objects (bucket_id, name)
values ('carta-fotos', '33333333-3333-3333-3333-333333333333/foto.jpg');

-- policies publicas sumiram
do $$
declare
  n int;
begin
  select count(*) into n from pg_policies
  where policyname in (
    'cartas: público lê publicadas e ativas',
    'media: público lê em carta pública',
    'marcos_select_publica',
    'capsulas: público lê desbloqueadas em carta pública',
    'carta-fotos: leitura pública só de cartas ativas'
  );
  if n <> 0 then
    raise exception 'policies publicas ainda existem: %', n;
  end if;
  if has_function_privilege('anon', 'public.carta_capsulas_publicas(uuid)', 'execute') then
    raise exception 'anon ainda executa carta_capsulas_publicas';
  end if;
end $$;

-- anon nao le carta, media, marco, capsula nem arquivo
do $$
declare
  n int;
begin
  execute 'set local role anon';
  select count(*) into n from public.cartas;
  if n <> 0 then raise exception 'anon leu cartas: %', n; end if;
  select count(*) into n from public.media;
  if n <> 0 then raise exception 'anon leu media: %', n; end if;
  select count(*) into n from public.marcos;
  if n <> 0 then raise exception 'anon leu marcos: %', n; end if;
  select count(*) into n from public.capsulas;
  if n <> 0 then raise exception 'anon leu capsulas: %', n; end if;
  select count(*) into n from storage.objects;
  if n <> 0 then raise exception 'anon leu storage: %', n; end if;
end $$;

do $$
begin
  execute 'set local role anon';
  perform * from public.carta_capsulas_publicas('33333333-3333-3333-3333-333333333333');
  raise exception 'anon executou carta_capsulas_publicas';
exception
  when insufficient_privilege then
    null;
end $$;

-- dono ainda le a propria carta
do $$
declare
  n int;
begin
  update auth.session_sim
    set uid = '11111111-1111-1111-1111-111111111111', email = 'owner@example.com'
    where id = 1;
  execute 'set local role authenticated';
  select count(*) into n from public.cartas where slug = 'carta-pub';
  if n <> 1 then raise exception 'dono nao leu a carta: %', n; end if;
end $$;

-- destinatario ainda le
do $$
declare
  n int;
begin
  update auth.session_sim
    set uid = '22222222-2222-2222-2222-222222222222', email = 'dest@example.com'
    where id = 1;
  execute 'set local role authenticated';
  select count(*) into n from public.cartas where slug = 'carta-pub';
  if n <> 1 then raise exception 'destinatario nao leu a carta: %', n; end if;
end $$;

-- dono nao publica nem mexe em coluna protegida
do $$
begin
  update auth.session_sim
    set uid = '11111111-1111-1111-1111-111111111111', email = 'owner@example.com'
    where id = 1;
  execute 'set local role authenticated';
  update public.cartas set status = 'publicada' where id = '44444444-4444-4444-4444-444444444444';
  raise exception 'dono publicou direto';
exception
  when insufficient_privilege then
    null;
end $$;

do $$
begin
  update auth.session_sim
    set uid = '11111111-1111-1111-1111-111111111111', email = 'owner@example.com'
    where id = 1;
  execute 'set local role authenticated';
  update public.cartas set plano = 'bilhete' where id = '44444444-4444-4444-4444-444444444444';
  raise exception 'dono mudou plano';
exception
  when insufficient_privilege then
    null;
end $$;

do $$
begin
  execute 'set local role authenticated';
  update public.cartas set expira_em = now() where id = '55555555-5555-5555-5555-555555555555';
  raise exception 'dono mudou expira_em';
exception
  when insufficient_privilege then
    null;
end $$;

do $$
begin
  execute 'set local role authenticated';
  update public.cartas set publicada_em = now() where id = '44444444-4444-4444-4444-444444444444';
  raise exception 'dono mudou publicada_em';
exception
  when insufficient_privilege then
    null;
end $$;

do $$
begin
  execute 'set local role authenticated';
  update public.cartas set acesso_token = 'outro' where id = '44444444-4444-4444-4444-444444444444';
  raise exception 'dono mudou acesso_token';
exception
  when insufficient_privilege then
    null;
end $$;

do $$
begin
  execute 'set local role authenticated';
  update public.cartas set owner_id = '22222222-2222-2222-2222-222222222222' where id = '44444444-4444-4444-4444-444444444444';
  raise exception 'dono mudou owner_id';
exception
  when insufficient_privilege then
    null;
end $$;

-- dono ainda salva conteudo e marca aguardando pagamento
update auth.session_sim
  set uid = '11111111-1111-1111-1111-111111111111', email = 'owner@example.com'
  where id = 1;
set role authenticated;
update public.cartas set conteudo = '{"versao":1,"ok":true}'::jsonb where id = '44444444-4444-4444-4444-444444444444';
update public.cartas set status = 'aguardando_pagamento' where id = '55555555-5555-5555-5555-555555555555';
reset role;

-- pagamento: preco certo entra, preco errado ou status errado nao
set role authenticated;
insert into public.pagamentos (carta_id, owner_id, metodo, plano, valor_centavos, status)
values ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'pix', 'eterno', 2990, 'pending');
insert into public.pagamentos (carta_id, owner_id, metodo, plano, valor_centavos, status)
values ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'pix', 'bilhete', 1790, 'pending');
reset role;

do $$
begin
  execute 'set local role authenticated';
  insert into public.pagamentos (carta_id, owner_id, metodo, plano, valor_centavos, status)
  values ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'pix', 'eterno', 100, 'pending');
  raise exception 'preco errado entrou';
exception
  when insufficient_privilege then
    null;
end $$;

do $$
begin
  execute 'set local role authenticated';
  insert into public.pagamentos (carta_id, owner_id, metodo, plano, valor_centavos, status)
  values ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'pix', 'bilhete', 1790, 'approved');
  raise exception 'status approved entrou';
exception
  when insufficient_privilege then
    null;
end $$;

-- service role publica, que e o que o webhook faz
set role service_role;
update public.cartas
  set status = 'publicada', publicada_em = now()
  where id = '44444444-4444-4444-4444-444444444444';
reset role;

do $$
declare
  st text;
begin
  select status into st from public.cartas where id = '44444444-4444-4444-4444-444444444444';
  if st <> 'publicada' then
    raise exception 'service role nao publicou, status=%', st;
  end if;
end $$;
