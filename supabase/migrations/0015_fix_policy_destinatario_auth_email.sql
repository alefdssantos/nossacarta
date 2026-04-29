-- Substitui subquery em auth.users (sem permissão para authenticated)
-- por auth.email() — função nativa Supabase que lê do JWT sem acesso à tabela.
DROP POLICY IF EXISTS "cartas: destinatário lê carta publicada" ON cartas;

CREATE POLICY "cartas: destinatário lê carta publicada"
  ON cartas FOR SELECT
  USING (
    status = 'publicada'
    AND (expira_em IS NULL OR expira_em > now())
    AND destinatario_email = auth.email()
  );
