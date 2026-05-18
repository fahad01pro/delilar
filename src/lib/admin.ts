import type { User } from '@supabase/supabase-js';

// Hardcoded admin email. Change here and in the DB `is_admin()` function to update.
export const ADMIN_EMAIL = 'admin@delilar.com';

export const isAdminUser = (user: User | null | undefined) =>
  !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
