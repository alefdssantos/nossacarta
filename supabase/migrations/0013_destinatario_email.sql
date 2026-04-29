-- Adiciona email do destinatário para controle de acesso à carta publicada
ALTER TABLE public.cartas ADD COLUMN destinatario_email text;

-- Remove política que permitia qualquer pessoa ler cartas publicadas
DROP POLICY cartas_select_publica ON public.cartas;

-- Destinatário autenticado (email coincide) pode ler carta publicada e ativa
CREATE POLICY "cartas: destinatário lê carta publicada"
  ON public.cartas FOR SELECT
  TO authenticated
  USING (
    status = 'publicada'
    AND (expira_em IS NULL OR expira_em > now())
    AND destinatario_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
