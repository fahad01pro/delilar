import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { resolveImage } from '@/lib/imageAssets';
import type { Product } from '@/data/products';

// ───────────────────────────────────────────────
// Mapping helpers
// ───────────────────────────────────────────────
function rowToProduct(row: any): Product {
  const data = (row.data ?? {}) as any;
  const colorVariants = (data.colorVariants ?? []).map((cv: any) => ({
    name: cv.name,
    hex: cv.hex,
    images: (cv.images ?? []).map(resolveImage),
  }));
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    category: row.category,
    productType: row.product_type,
    subcategory: data.subcategory,
    image: resolveImage(data.image),
    images: data.images?.map(resolveImage),
    description: row.description ?? '',
    sizes: data.sizes,
    colors: data.colors,
    colorVariants: colorVariants.length ? colorVariants : undefined,
    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews ?? 0),
    badge: row.badge ?? undefined,
    inStock: row.in_stock,
    tags: row.tags ?? undefined,
    createdAt: row.created_at,
    isNew: !!row.is_new,
    isFeatured: !!row.is_featured,
    isTrending: !!row.is_trending,
    soldCount: Number(row.sold_count ?? 0),
    newUntil: data.newUntil,
    fabric: data.fabric,
    careInstructions: data.careInstructions,
    fitType: data.fitType,
    material: data.material,
    fragranceNotes: data.fragranceNotes,
    longevity: data.longevity,
    projection: data.projection,
    volumeOptions: data.volumeOptions,
    usageGuide: data.usageGuide,
    // Admin-editable info sections (fabric, care, shipping, returns, faqs)
    infoSections: data.infoSections,
  } as Product;
}

// Raw row type (for admin views)
export interface ProductRow {
  id: string;
  name: string;
  subtitle?: string | null;
  category: string;
  product_type: string;
  brand?: string | null;
  sku?: string | null;
  price: number;
  original_price?: number | null;
  stock: number;
  description?: string | null;
  badge?: string | null;
  in_stock: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_trending: boolean;
  is_sale: boolean;
  is_visible: boolean;
  rating: number;
  reviews: number;
  tags?: string[] | null;
  data: any;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

// ───────────────────────────────────────────────
// Storefront hooks
// ───────────────────────────────────────────────
export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(rowToProduct);
    },
    staleTime: 60_000,
  });
}

// New Arrivals: created within last 120 days, OR manually flagged is_new,
// OR data.newUntil is in the future. Featured pinned to top.
const NEW_ARRIVAL_WINDOW_MS = 120 * 24 * 60 * 60 * 1000;
export function isNewArrival(p: Product): boolean {
  if (p.isNew) return true;
  if (p.newUntil) {
    const until = new Date(p.newUntil).getTime();
    if (!Number.isNaN(until) && until > Date.now()) return true;
  }
  if (p.createdAt) {
    const created = new Date(p.createdAt).getTime();
    if (!Number.isNaN(created) && Date.now() - created < NEW_ARRIVAL_WINDOW_MS) return true;
  }
  return false;
}

export function selectNewArrivals(catalog: Product[], limit = 8): Product[] {
  return catalog
    .filter(isNewArrival)
    .sort((a, b) => {
      // Featured pinned first
      if (!!b.isFeatured !== !!a.isFeatured) return Number(!!b.isFeatured) - Number(!!a.isFeatured);
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    })
    .slice(0, limit);
}

export function selectBestSellers(catalog: Product[], limit = 8): Product[] {
  return [...catalog]
    .sort((a, b) => {
      // Manually featured pinned first
      if (!!b.isFeatured !== !!a.isFeatured) return Number(!!b.isFeatured) - Number(!!a.isFeatured);
      const bs = b.soldCount ?? 0;
      const as = a.soldCount ?? 0;
      if (bs !== as) return bs - as;
      // Tie-break by rating × reviews
      return (b.rating * b.reviews) - (a.rating * a.reviews);
    })
    .slice(0, limit);
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    enabled: !!id,
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return data ? rowToProduct(data) : null;
    },
  });
}

export function useProductsByCategory(category: string | undefined) {
  return useQuery({
    queryKey: ['products', 'category', category],
    enabled: !!category,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category!)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(rowToProduct);
    },
  });
}

// ───────────────────────────────────────────────
// Banner hooks
// ───────────────────────────────────────────────
export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  eyebrow?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
  image_url: string;
  mobile_image_url?: string | null;
  enabled: boolean;
  sort_order: number;
}

export function useHeroBanners() {
  return useQuery({
    queryKey: ['hero_banners'],
    queryFn: async (): Promise<HeroBanner[]> => {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .eq('enabled', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export interface CategoryBanner {
  id: string;
  category: string;
  title?: string | null;
  subtitle?: string | null;
  image_url: string;
  enabled: boolean;
}

export function useCategoryBanner(category: string | undefined) {
  return useQuery({
    queryKey: ['category_banner', category],
    enabled: !!category,
    queryFn: async (): Promise<CategoryBanner | null> => {
      const { data, error } = await supabase
        .from('category_banners')
        .select('*')
        .eq('category', category!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// ───────────────────────────────────────────────
// Outlets
// ───────────────────────────────────────────────
export interface Outlet {
  id: string;
  name: string;
  address: string;
  city?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  hours?: string | null;
  email?: string | null;
  map_embed_url?: string | null;
  map_link?: string | null;
  image_url?: string | null;
  enabled: boolean;
  is_primary: boolean;
  sort_order: number;
}

export function useOutlets() {
  return useQuery({
    queryKey: ['outlets'],
    queryFn: async (): Promise<Outlet[]> => {
      const { data, error } = await (supabase as any)
        .from('outlets')
        .select('*')
        .eq('enabled', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ───────────────────────────────────────────────
// Admin mutations
// ───────────────────────────────────────────────
export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async (): Promise<ProductRow[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ProductRow[];
    },
  });
}

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<ProductRow> & { id: string }) => {
      const { error } = await supabase.from('products').upsert(row as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['catalog'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['catalog'] });
    },
  });
}

export function useAdminHeroBanners() {
  return useQuery({
    queryKey: ['admin', 'hero_banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminCategoryBanners() {
  return useQuery({
    queryKey: ['admin', 'category_banners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('category_banners').select('*').order('category');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
