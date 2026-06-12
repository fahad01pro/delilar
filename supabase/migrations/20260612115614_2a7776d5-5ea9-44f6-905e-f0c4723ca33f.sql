DROP POLICY IF EXISTS "Authenticated can insert tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated can insert fabrics" ON public.fabrics;

CREATE POLICY "Admins can insert tags" ON public.tags
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Admins can insert fabrics" ON public.fabrics
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());