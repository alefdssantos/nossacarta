-- Renomeia colunas pra serem agnósticas ao gateway (decidimos AbacatePay; futuro pode mudar).
-- mp_* eram da fase de planejamento Mercado Pago.

alter table public.pagamentos rename column mp_payment_id to gateway_payment_id;
alter table public.pagamentos rename column mp_preference_id to gateway_checkout_id;

-- Índice sobre gateway_payment_id já existia como UNIQUE; renomeia constraint pra coerência (opcional, não bloqueante).
alter index if exists pagamentos_mp_payment_id_key rename to pagamentos_gateway_payment_id_key;
