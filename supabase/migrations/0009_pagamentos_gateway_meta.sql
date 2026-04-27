-- Coluna pra metadados do gateway (Pix QR brCode + base64) que precisamos exibir
-- na página de pagamento sem nova chamada à API.

alter table public.pagamentos add column gateway_meta jsonb;
