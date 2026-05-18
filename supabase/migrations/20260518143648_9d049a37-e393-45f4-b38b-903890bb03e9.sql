DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.has_role(auth.uid(), 'admin') OR (auth.jwt() ->> 'email') = 'admin@delilar.com',
    false
  )
$$;

DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can remove roles" ON public.user_roles;
CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "Admins can assign roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can remove roles" ON public.user_roles
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view customer profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update customer profiles" ON public.profiles;
CREATE POLICY "Admins can view customer profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update customer profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.product_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  parent_id text REFERENCES public.product_categories(id) ON DELETE SET NULL,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Product categories are public" ON public.product_categories;
DROP POLICY IF EXISTS "Admins insert product categories" ON public.product_categories;
DROP POLICY IF EXISTS "Admins update product categories" ON public.product_categories;
DROP POLICY IF EXISTS "Admins delete product categories" ON public.product_categories;
CREATE POLICY "Product categories are public" ON public.product_categories
  FOR SELECT USING (enabled = true OR public.is_admin());
CREATE POLICY "Admins insert product categories" ON public.product_categories
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update product categories" ON public.product_categories
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete product categories" ON public.product_categories
  FOR DELETE USING (public.is_admin());

DROP TRIGGER IF EXISTS product_categories_set_updated_at ON public.product_categories;
CREATE TRIGGER product_categories_set_updated_at
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'section',
  title text NOT NULL,
  subtitle text,
  body text,
  image_url text,
  cta_label text,
  cta_href text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enabled content is public" ON public.site_content;
DROP POLICY IF EXISTS "Admins insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins update site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins delete site content" ON public.site_content;
CREATE POLICY "Enabled content is public" ON public.site_content
  FOR SELECT USING (enabled = true OR public.is_admin());
CREATE POLICY "Admins insert site content" ON public.site_content
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update site content" ON public.site_content
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete site content" ON public.site_content
  FOR DELETE USING (public.is_admin());

DROP TRIGGER IF EXISTS site_content_set_updated_at ON public.site_content;
CREATE TRIGGER site_content_set_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS courier text,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz;

DO $$
BEGIN
  ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'refunded';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO public.product_categories (id, name, description, sort_order, enabled) VALUES
  ('jubba', 'Jubba', 'Premium thobes and jubbas for modest Islamic menswear.', 10, true),
  ('panjabi', 'Panjabi', 'Elegant Panjabi designs for Eid, weddings, and refined daily wear.', 20, true),
  ('tshirts', 'T-Shirts', 'Premium modest streetwear and essential tees.', 30, true),
  ('polo', 'Polo Shirts', 'Clean polo shirts with refined everyday styling.', 40, true),
  ('shirts', 'Shirts', 'Tailored shirts for modern Islamic fashion.', 50, true),
  ('pants', 'Pants', 'Premium trousers and modest bottoms.', 60, true),
  ('perfume', 'Perfumes', 'Luxury fragrances for the Delilar lifestyle.', 70, true),
  ('attar', 'Attars', 'Concentrated attars and oil-based scents.', 80, true),
  ('bags', 'Bags', 'Lifestyle bags and premium carry essentials.', 90, true),
  ('accessories', 'Accessories', 'Caps, wallets, kufiya, pagri, and lifestyle accessories.', 100, true),
  ('eid', 'Eid Collection', 'Festive premium edits for Eid and special occasions.', 110, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  enabled = EXCLUDED.enabled;

INSERT INTO public.site_content (content_key, type, title, subtitle, body, sort_order, enabled) VALUES
  ('about-page', 'page', 'Premium Islamic Fashion & Lifestyle Brand', 'Delilar brings modest fashion, fragrance, and lifestyle essentials into one refined luxury experience.', 'Edit this content from the admin dashboard to keep the About page aligned with new collections and brand milestones.', 10, true),
  ('contact-info', 'settings', 'Contact Information', 'Customer care, showroom details, and brand contact channels.', 'Phone: +880 1XXXXXXXXX\nEmail: support@delilar.com\nLocation: Dhaka, Bangladesh', 20, true),
  ('footer-brand', 'footer', 'Delilar', 'Premium Islamic Fashion & Lifestyle', 'Jubba, Panjabi, T-Shirts, Polo Shirts, Pants, Perfumes, Attars, Bags, Accessories, and Islamic lifestyle products.', 30, true),
  ('shipping-policy', 'policy', 'Shipping Policy', 'Delivery across Bangladesh.', 'Free shipping over ৳5,000. Update delivery timelines, courier details, and shipping rules here.', 40, true),
  ('return-policy', 'policy', 'Return & Exchange Policy', 'Premium support for customer confidence.', 'Add return windows, eligibility, exchange conditions, and refund rules here.', 50, true),
  ('privacy-policy', 'policy', 'Privacy Policy', 'Customer data and account protection.', 'Add your privacy policy, data handling rules, and customer rights here.', 60, true)
ON CONFLICT (content_key) DO NOTHING;