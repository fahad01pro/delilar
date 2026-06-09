
-- 1. Expand is_admin() to include super_admin and manager
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'manager'),
    false
  )
$$;

-- 2. Newsletter subscribers: admin UPDATE policy
DROP POLICY IF EXISTS "Admins can update newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can update newsletter subscribers"
ON public.newsletter_subscribers
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. Orders: admin DELETE policy
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 4. Lock down SECURITY DEFINER functions from anon execution
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- email_for_username must remain callable pre-login (anon) so users can log in by username.
-- It only returns the email matching an active profile; no other data exposed.
REVOKE EXECUTE ON FUNCTION public.email_for_username(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_for_username(text) TO anon, authenticated;
