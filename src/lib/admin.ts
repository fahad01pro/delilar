import type { User } from '@supabase/supabase-js';

// Permanent admin email. Mirror this value in the DB `is_admin()` function.
export const ADMIN_EMAIL = 'delilar.shop@gmail.com';

export const isAdminUser = (user: User | null | undefined) =>
  !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
