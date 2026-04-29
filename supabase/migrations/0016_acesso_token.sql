ALTER TABLE cartas
  ADD COLUMN IF NOT EXISTS acesso_token text UNIQUE
    DEFAULT lower(replace(gen_random_uuid()::text, '-', ''));

UPDATE cartas
  SET acesso_token = lower(replace(gen_random_uuid()::text, '-', ''))
  WHERE acesso_token IS NULL;

ALTER TABLE cartas ALTER COLUMN acesso_token SET NOT NULL;
