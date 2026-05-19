-- Payment verification fields
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS txn_id text,
  ADD COLUMN IF NOT EXISTS payer_number text,
  ADD COLUMN IF NOT EXISTS screenshot_url text,
  ADD COLUMN IF NOT EXISTS payment_account text;

-- Storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for payment-proofs bucket
DROP POLICY IF EXISTS "Users upload own payment proof" ON storage.objects;
CREATE POLICY "Users upload own payment proof"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users view own payment proof" ON storage.objects;
CREATE POLICY "Users view own payment proof"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin()));

DROP POLICY IF EXISTS "Admins manage payment proofs" ON storage.objects;
CREATE POLICY "Admins manage payment proofs"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'payment-proofs' AND public.is_admin())
WITH CHECK (bucket_id = 'payment-proofs' AND public.is_admin());