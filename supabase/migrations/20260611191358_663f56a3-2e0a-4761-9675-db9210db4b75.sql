CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  eyebrow text,
  headline text,
  subheading text,
  cta_label text,
  cta_href text,
  banner_url text,
  mobile_banner_url text,
  mode text NOT NULL DEFAULT 'manual',
  product_ids uuid[] NOT NULL DEFAULT '{}',
  auto_categories text[] NOT NULL DEFAULT '{}',
  auto_tags text[] NOT NULL DEFAULT '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  enabled boolean NOT NULL DEFAULT true,
  show_in_menu boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaigns are publicly readable"
  ON public.campaigns FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert campaigns"
  ON public.campaigns FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update campaigns"
  ON public.campaigns FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete campaigns"
  ON public.campaigns FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE TRIGGER campaigns_set_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX campaigns_enabled_sort_idx ON public.campaigns (enabled, sort_order);
CREATE INDEX campaigns_dates_idx ON public.campaigns (starts_at, ends_at);