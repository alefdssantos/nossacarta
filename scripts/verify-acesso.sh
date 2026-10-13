#!/bin/bash
# Aplica todas as migrations e prova o gate de anon, dono e service_role.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
pgbin=""
for candidate in \
  /opt/homebrew/opt/postgresql@16/bin \
  /usr/local/opt/postgresql@16/bin \
  /opt/homebrew/opt/postgresql@17/bin
do
  if [ -x "$candidate/initdb" ]; then
    pgbin="$candidate"
    break
  fi
done
if [ -z "$pgbin" ]; then
  echo "postgres nao encontrado" >&2
  exit 1
fi

if [ -z "${PGDATA:-}" ]; then
  echo "defina PGDATA" >&2
  exit 1
fi
mkdir -p "$PGDATA"
port="${PGPORT:-55432}"
host="${PGHOST:-127.0.0.1}"

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  "$pgbin/initdb" -D "$PGDATA" -U postgres --auth-local=trust --auth-host=trust >/dev/null
fi

if ! "$pgbin/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1; then
  # Socket unix estoura o limite de 103 bytes em paths longos. So TCP local.
  "$pgbin/pg_ctl" -D "$PGDATA" -l "$PGDATA/server.log" -o "-p $port -c listen_addresses=$host -c unix_socket_directories=" start
fi

psql() {
  "$pgbin/psql" -h "$host" -p "$port" -U postgres -d postgres -v ON_ERROR_STOP=1 "$@"
}

psql -q <<'SQL'
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb
);
create table if not exists auth.session_sim (
  id int primary key,
  uid uuid,
  email text
);
insert into auth.session_sim (id) values (1) on conflict (id) do nothing;
create or replace function auth.uid() returns uuid
language sql stable security definer set search_path = auth
as $$ select uid from auth.session_sim where id = 1 $$;
create or replace function auth.email() returns text
language sql stable security definer set search_path = auth
as $$ select email from auth.session_sim where id = 1 $$;
create or replace function auth.role() returns text
language sql stable as $$ select current_user $$;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end $$;
grant anon, authenticated, service_role to postgres;

create schema if not exists storage;
create table if not exists storage.buckets (
  id text primary key,
  name text,
  public boolean,
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text,
  name text
);
create or replace function storage.foldername(name text) returns text[]
language sql immutable as $$ select string_to_array(name, '/') $$;
grant usage on schema storage to anon, authenticated, service_role;
grant select on storage.objects to anon, authenticated;
SQL

for f in "$root"/supabase/migrations/*.sql; do
  echo "apply $(basename "$f")"
  psql -q -f "$f"
done

psql -q <<'SQL'
grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
SQL

psql -q -f "$root/scripts/verify-acesso.sql"
echo "verify-acesso ok"
