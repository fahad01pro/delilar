import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TagRow {
  id: string;
  name: string;
  label: string;
  description?: string | null;
  usage_count: number;
}

export interface FabricRow {
  id: string;
  name: string;
  label: string;
  description?: string | null;
  usage_count: number;
}

export const normalizeName = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

// ─── Tags ─────────────────────────────────────────────
export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async (): Promise<TagRow[]> => {
      const { data, error } = await (supabase as any).from('tags').select('*').order('label');
      if (error) throw error;
      return (data ?? []) as TagRow[];
    },
    staleTime: 30_000,
  });
}

export function useSaveTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<TagRow> & { label: string }) => {
      const name = normalizeName(row.name ?? row.label);
      const { error } = await (supabase as any).from('tags').upsert({
        ...row,
        name,
        label: row.label.trim(),
      }, { onConflict: 'name' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('tags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

/** Insert any new tags that don't yet exist. Safe to call after product save. */
export async function ensureTagsExist(labels: string[]) {
  const unique = Array.from(new Set(labels.map((l) => l.trim()).filter(Boolean)));
  if (!unique.length) return;
  const rows = unique.map((label) => ({ name: normalizeName(label), label }));
  await (supabase as any).from('tags').upsert(rows, { onConflict: 'name', ignoreDuplicates: true });
}

// ─── Fabrics ──────────────────────────────────────────
export function useFabrics() {
  return useQuery({
    queryKey: ['fabrics'],
    queryFn: async (): Promise<FabricRow[]> => {
      const { data, error } = await (supabase as any).from('fabrics').select('*').order('label');
      if (error) throw error;
      return (data ?? []) as FabricRow[];
    },
    staleTime: 30_000,
  });
}

export function useSaveFabric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Partial<FabricRow> & { label: string }) => {
      const name = normalizeName(row.name ?? row.label);
      const { error } = await (supabase as any).from('fabrics').upsert({
        ...row,
        name,
        label: row.label.trim(),
      }, { onConflict: 'name' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fabrics'] }),
  });
}

export function useDeleteFabric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('fabrics').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fabrics'] }),
  });
}

export async function ensureFabricsExist(labels: string[]) {
  const unique = Array.from(new Set(labels.map((l) => l.trim()).filter(Boolean)));
  if (!unique.length) return;
  const rows = unique.map((label) => ({ name: normalizeName(label), label }));
  await (supabase as any).from('fabrics').upsert(rows, { onConflict: 'name', ignoreDuplicates: true });
}
