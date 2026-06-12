import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCatalog } from '@/hooks/useCatalog';
import type { Product } from '@/data/products';

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  eyebrow?: string | null;
  headline?: string | null;
  subheading?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
  banner_url?: string | null;
  mobile_banner_url?: string | null;
  mode: 'manual' | 'auto';
  product_ids: string[];
  auto_categories: string[];
  auto_tags: string[];
  starts_at?: string | null;
  ends_at?: string | null;
  enabled: boolean;
  show_in_menu: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export function isCampaignLive(c: Campaign, now: Date = new Date()): boolean {
  if (!c.enabled) return false;
  const t = now.getTime();
  if (c.starts_at && new Date(c.starts_at).getTime() > t) return false;
  if (c.ends_at && new Date(c.ends_at).getTime() < t) return false;
  return true;
}

export function useActiveCampaigns() {
  return useQuery({
    queryKey: ['campaigns', 'active'],
    queryFn: async (): Promise<Campaign[]> => {
      const { data, error } = await (supabase as any)
        .from('campaigns')
        .select('*')
        .eq('enabled', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return ((data ?? []) as Campaign[]).filter((c) => isCampaignLive(c));
    },
    staleTime: 60_000,
  });
}

export function useFeaturedCampaign() {
  const { data = [] } = useActiveCampaigns();
  return data.find((c) => c.show_in_menu) ?? null;
}

export function useCampaignBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['campaigns', 'slug', slug],
    enabled: !!slug,
    queryFn: async (): Promise<Campaign | null> => {
      const { data, error } = await (supabase as any)
        .from('campaigns')
        .select('*')
        .eq('slug', slug!)
        .maybeSingle();
      if (error) throw error;
      return data as Campaign | null;
    },
  });
}

export function resolveCampaignProducts(campaign: Campaign, catalog: Product[]): Product[] {
  if (campaign.mode === 'manual') {
    return campaign.product_ids
      .map((id) => catalog.find((p) => p.id === id))
      .filter((p): p is Product => !!p && (p as any).inStock !== false);
  }
  // Auto mode: match by category, product type (`type:` prefix), or tag
  const cats = new Set<string>();
  const types = new Set<string>();
  campaign.auto_categories.forEach((raw) => {
    const v = String(raw).toLowerCase();
    if (v.startsWith('type:')) types.add(v.slice(5));
    else cats.add(v);
  });
  const tags = new Set(campaign.auto_tags.map((s) => s.toLowerCase()));
  return catalog.filter((p) => {
    if (cats.size && cats.has(String(p.category ?? '').toLowerCase())) return true;
    if (types.size && types.has(String((p as any).productType ?? '').toLowerCase())) return true;
    if (tags.size && (p.tags ?? []).some((t) => tags.has(String(t).toLowerCase()))) return true;
    return false;
  });
}

// ─── Admin ──────────────────────────────────────────────
export function useAdminCampaigns() {
  return useQuery({
    queryKey: ['admin', 'campaigns'],
    queryFn: async (): Promise<Campaign[]> => {
      const { data, error } = await (supabase as any)
        .from('campaigns')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Campaign[];
    },
  });
}

export function useSaveCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<Campaign> & { title: string; slug: string }) => {
      const { error } = await (supabase as any).from('campaigns').upsert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
  });
}
