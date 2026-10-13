-- Adiciona email do destinatário para controle de acesso à carta publicada
ALTER TABLE public.cartas ADD COLUMN destinatario_email text;

-- O nome real em 0001 e "cartas: publico le publicadas e ativas".
-- cartas_select_publica nunca foi criada; sem IF EXISTS o migrate inteiro aborta.
DROP POLICY IF EXISTS cartas_select_publica ON public.cartas;

-- Destinatário autenticado (email coincide) pode ler carta publicada e ativa
CREATE POLICY "cartas: destinatário lê carta publicada"
  ON public.cartas FOR SELECT
  TO authenticated
  USING (
    status = 'publicada'
    AND (expira_em IS NULL OR expira_em > now())
    AND destinatario_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
