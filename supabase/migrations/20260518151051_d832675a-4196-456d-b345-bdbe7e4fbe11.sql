CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    public.has_role(auth.uid(), 'admin') OR (auth.jwt() ->> 'email') = 'delilar.shop@gmail.com',
    false
  )
$$;