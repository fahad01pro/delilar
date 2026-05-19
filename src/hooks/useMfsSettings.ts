import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type MfsKey = 'bkash' | 'nagad' | 'rocket';

export interface MfsAccount {
  enabled: boolean;
  number: string;
  type?: string; // Personal / Merchant
  reference?: string;
}

export type MfsSettings = Record<MfsKey, MfsAccount>;

const DEFAULT: MfsSettings = {
  bkash: { enabled: true, number: '01XXXXXXXXX', type: 'Personal' },
  nagad: { enabled: true, number: '01XXXXXXXXX', type: 'Personal' },
  rocket: { enabled: true, number: '01XXXXXXXXX-X', type: 'Personal' },
};

export const useMfsSettings = () =>
  useQuery({
    queryKey: ['mfs_settings'],
    queryFn: async (): Promise<MfsSettings> => {
      const { data } = await supabase
        .from('site_content')
        .select('data')
        .eq('content_key', 'mfs_settings')
        .maybeSingle();
      const merged = { ...DEFAULT, ...((data?.data as Partial<MfsSettings>) ?? {}) };
      return merged as MfsSettings;
    },
    staleTime: 1000 * 60 * 5,
  });

export const MFS_META: Record<MfsKey, { label: string; tagline: string; tint: string; ring: string }> = {
  bkash: {
    label: 'bKash',
    tagline: 'Send Money via bKash personal/merchant',
    tint: 'bg-[#E2136E]',
    ring: 'ring-[#E2136E]',
  },
  nagad: {
    label: 'Nagad',
    tagline: 'Send Money via Nagad mobile wallet',
    tint: 'bg-[#EC1C24]',
    ring: 'ring-[#EC1C24]',
  },
  rocket: {
    label: 'Rocket',
    tagline: 'Send Money via Rocket DBBL wallet',
    tint: 'bg-[#8C3D8B]',
    ring: 'ring-[#8C3D8B]',
  },
};
