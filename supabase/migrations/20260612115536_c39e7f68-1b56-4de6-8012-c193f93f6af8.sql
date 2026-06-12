-- ─── TAGS ─────────────────────────────────────────────────────
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  usage_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are publicly readable" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update tags" ON public.tags FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete tags" ON public.tags FOR DELETE TO authenticated USING (public.is_admin());

CREATE TRIGGER tags_set_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX tags_name_idx ON public.tags (name);

-- ─── FABRICS ──────────────────────────────────────────────────
CREATE TABLE public.fabrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  usage_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.fabrics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fabrics TO authenticated;
GRANT ALL ON public.fabrics TO service_role;

ALTER TABLE public.fabrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fabrics are publicly readable" ON public.fabrics FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert fabrics" ON public.fabrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update fabrics" ON public.fabrics FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete fabrics" ON public.fabrics FOR DELETE TO authenticated USING (public.is_admin());

CREATE TRIGGER fabrics_set_updated_at BEFORE UPDATE ON public.fabrics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX fabrics_name_idx ON public.fabrics (name);

-- ─── SEED DEFAULTS ────────────────────────────────────────────
INSERT INTO public.tags (name, label) VALUES
  ('winter', 'Winter'), ('summer', 'Summer'), ('eid', 'Eid'),
  ('ramadan', 'Ramadan'), ('sale', 'Sale'), ('new-arrival', 'New Arrival'),
  ('premium', 'Premium'), ('gift', 'Gift'), ('exclusive', 'Exclusive'),
  ('limited', 'Limited'), ('jubba', 'Jubba'), ('attar', 'Attar'),
  ('perfume', 'Perfume')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.fabrics (name, label) VALUES
  ('cotton', 'Cotton'), ('premium cotton', 'Premium Cotton'),
  ('linen', 'Linen'), ('terry cotton', 'Terry Cotton'),
  ('poly cotton', 'Poly Cotton'), ('denim', 'Denim'),
  ('gabardine', 'Gabardine'), ('viscose', 'Viscose'),
  ('rayon', 'Rayon'), ('silk', 'Silk'), ('lawn', 'Lawn'),
  ('oxford cotton', 'Oxford Cotton'), ('microfiber', 'Microfiber'),
  ('polyester', 'Polyester'), ('fleece', 'Fleece'), ('wool', 'Wool')
ON CONFLICT (name) DO NOTHING;