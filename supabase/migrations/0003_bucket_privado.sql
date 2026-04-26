-- Bucket carta-fotos: privado. Acesso só via signed URL gerada pelo app.
-- Motivo: bucket público bypassa RLS de SELECT em download direto. Bilhete (7d)
-- expirava mas fotos continuavam baixáveis pela URL pública. Fix: privar bucket
-- e gerar signed URL com TTL curto a cada render.

update storage.buckets
set public = false
where id = 'carta-fotos';
