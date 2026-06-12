import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, PenLine, Shirt } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFabrics, useSaveFabric, useDeleteFabric, type FabricRow, normalizeName } from '@/hooks/useTaxonomy';

export const FabricsPanel = () => {
  const { data: fabrics = [] } = useFabrics();
  const saveFabric = useSaveFabric();
  const deleteFabric = useDeleteFabric();
  const [draft, setDraft] = useState<Partial<FabricRow> | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return fabrics;
    return fabrics.filter((f) => [f.label, f.name].some((v) => String(v).toLowerCase().includes(q)));
  }, [fabrics, search]);

  const submit = async () => {
    if (!draft?.label?.trim()) return toast.error('Label required');
    try {
      await saveFabric.mutateAsync({ ...draft, label: draft.label.trim() } as any);
      toast.success('Fabric saved');
      setDraft(null);
    } catch (e: any) {
      toast.error(e?.message ?? 'Save failed');
    }
  };

  const remove = async (f: FabricRow) => {
    if (!confirm(`Delete fabric "${f.label}"?`)) return;
    try {
      await deleteFabric.mutateAsync(f.id);
      toast.success('Fabric deleted');
    } catch (e: any) {
      toast.error(e?.message ?? 'Delete failed');
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl flex items-center gap-2"><Shirt size={18} /> Fabrics Library</h2>
          <p className="text-sm text-muted-foreground font-body">
            Reusable fabric library used in product details and storefront filters. Add any fabric typed in a product automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search fabrics" className="pl-9 w-64" />
          </div>
          <Button onClick={() => setDraft({ label: '' })} className="gap-2"><Plus size={15} /> New Fabric</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40">
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-body">
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3 hidden sm:table-cell">Slug</th>
              <th className="px-4 py-3 hidden md:table-cell">Description</th>
              <th className="px-4 py-3 text-right">Usage</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted-foreground font-body py-10">No fabrics yet.</td></tr>
            )}
            {filtered.map((f) => (
              <tr key={f.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 text-foreground text-xs font-body px-2.5 py-1 border border-accent/30">
                    {f.label}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground font-body text-xs">{f.name}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground font-body text-xs truncate max-w-xs">{f.description || '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums">{f.usage_count}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setDraft(f)}><PenLine size={13} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(f)} className="text-destructive hover:bg-destructive/10"><Trash2 size={13} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-heading">{draft?.id ? 'Edit Fabric' : 'New Fabric'}</DialogTitle></DialogHeader>
          {draft && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Label *</Label>
                <Input value={draft.label ?? ''} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Premium Cotton" />
                {draft.label && <p className="text-[11px] text-muted-foreground font-body">Slug: <code>{normalizeName(draft.label)}</code></p>}
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea rows={2} value={draft.description ?? ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Optional" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
                <Button onClick={submit} disabled={saveFabric.isPending}>{saveFabric.isPending ? 'Saving…' : 'Save Fabric'}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default FabricsPanel;
