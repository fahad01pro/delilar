CREATE TABLE public.outlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text,
  phone text,
  whatsapp text,
  hours text,
  email text,
  map_embed_url text,
  map_link text,
  image_url text,
  enabled boolean NOT NULL DEFAULT true,
  is_primary boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Outlets are public" ON public.outlets FOR SELECT USING (enabled = true OR is_admin());
CREATE POLICY "Admins insert outlets" ON public.outlets FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins update outlets" ON public.outlets FOR UPDATE USING (is_admin());
CREATE POLICY "Admins delete outlets" ON public.outlets FOR DELETE USING (is_admin());

CREATE TRIGGER outlets_set_updated_at BEFORE UPDATE ON public.outlets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.outlets (name, address, city, phone, whatsapp, hours, map_embed_url, map_link, enabled, is_primary, sort_order)
VALUES (
  'Delilar Flagship Outlet',
  'Sylhet-3100, Bangladesh',
  'Sylhet',
  '+880 1533-413290',
  '8801533413290',
  'Saturday – Thursday · 10:00 AM – 9:00 PM (Closed Friday)',
  'https://www.google.com/maps?q=Sylhet+3100+Bangladesh&output=embed',
  'https://www.google.com/maps?q=Sylhet+3100+Bangladesh',
  true,
  true,
  0
);