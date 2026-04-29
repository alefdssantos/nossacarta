-- Garante que nem o role dono da tabela (postgres) bypassa RLS acidentalmente
ALTER TABLE public.cartas      FORCE ROW LEVEL SECURITY;
ALTER TABLE public.capsulas    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.media       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.marcos      FORCE ROW LEVEL SECURITY;
ALTER TABLE public.perfis      FORCE ROW LEVEL SECURITY;
