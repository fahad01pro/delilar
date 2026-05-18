// Central image asset registry — used to resolve image keys stored in the DB
// back into bundled image URLs. Admin-uploaded images are stored as full URLs
// (https://… or Supabase storage public URLs) and pass through unchanged.

import heroImg from '@/assets/hero-main.jpg';
import tshirtImg from '@/assets/category-tshirts.jpg';
import jubbaImg from '@/assets/category-jubba.jpg';
import panjabiImg from '@/assets/category-panjabi.jpg';
import attarImg from '@/assets/category-attar.jpg';
import poloImg from '@/assets/category-polo.jpg';
import bagsImg from '@/assets/category-bags.jpg';
import capsImg from '@/assets/category-caps.jpg';
import perfumeImg from '@/assets/category-perfume.jpg';
import streetwearImg from '@/assets/category-streetwear.jpg';

import { supabase } from '@/integrations/supabase/client';

export const ASSET_MAP: Record<string, string> = {
  heroImg,
  tshirtImg,
  jubbaImg,
  panjabiImg,
  attarImg,
  poloImg,
  bagsImg,
  capsImg,
  perfumeImg,
  streetwearImg,
};

export const ASSET_KEYS = Object.keys(ASSET_MAP);

/**
 * Resolve an image identifier (asset key, storage path, or full URL) into a
 * usable src URL.
 */
export function resolveImage(value?: string | null): string {
  if (!value) return '/placeholder.svg';
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:') ||
    value.startsWith('/')
  ) {
    return value;
  }
  if (ASSET_MAP[value]) return ASSET_MAP[value];
  // Treat as a path inside the product-images storage bucket
  const { data } = supabase.storage.from('product-images').getPublicUrl(value);
  return data.publicUrl || '/placeholder.svg';
}
