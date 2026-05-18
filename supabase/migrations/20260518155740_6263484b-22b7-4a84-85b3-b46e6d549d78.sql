-- Newsletter subscribers table for email collection (signup form + newsletter widget)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'footer',
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) may subscribe
CREATE POLICY "Anyone can subscribe"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- Only admins can view, update, or delete
CREATE POLICY "Admins view subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins delete subscribers"
ON public.newsletter_subscribers
FOR DELETE
USING (public.is_admin());

-- Add sold_count to products for inventory tracking (admin only display on storefront)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sold_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 3;