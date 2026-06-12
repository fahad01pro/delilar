import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, PenLine, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTags, useSaveTag, useDeleteTag, type TagRow, normalizeName } from '@/hooks/useTaxonomy';

export const TagsPanel = () => {
  const { data: tags = [] } = useTags();
  const saveTag = useSaveTag();
  const deleteTag = useDeleteTag();
  const [draft, setDraft] = useState<Partial<TagRow> | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return tags;
    return tags.filter((t) => [t.label, t.name].some((v) => String(v).toLowerCase().includes(q)));
  }, [tags, search]);

  const submit = async () => {
    if (!draft?.label?.trim()) return toast.error('Label required');
    try {
      await saveTag.mutateAsync({ ...draft, label: draft.label.trim() } as any);
      toast.success('Tag saved');
      setDraft(null);
    } catch (e: any) {
      toast.error(e?.message ?? 'Save failed');
    }
  };

  const remove = async (t: TagRow) => {
    if (!confirm(`Delete tag "${t.label}"?`)) return;
    try {
      await deleteTag.mutateAsync(t.id);
      toast.success('Tag deleted');
    } catch (e: any) {
      toast.error(e?.message ?? 'Delete failed');
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl flex items-center gap-2"><Tag size={18} /> Tags Library</h2>
          <p className="text-sm text-muted-foreground font-body">
            Reusable marketing tags used across products and campaigns. Type a new tag in a product to add it automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tags" className="pl-9 w-64" />
          </div>
          <Button onClick={() => setDraft({ label: '' })} className="gap-2"><Plus size={15} /> New Tag</Button>
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
              <tr><td colSpan={5} className="text-center text-muted-foreground font-body py-10">No tags yet.</td></tr>
            )}
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs font-body px-2.5 py-1 border border-primary/20">
                    {t.label}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground font-body text-xs">{t.name}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground font-body text-xs truncate max-w-xs">{t.description || '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums">{t.usage_count}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setDraft(t)}><PenLine size={13} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(t)} className="text-destructive hover:bg-destructive/10"><Trash2 size={13} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-heading">{draft?.id ? 'Edit Tag' : 'New Tag'}</DialogTitle></DialogHeader>
          {draft && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Label *</Label>
                <Input value={draft.label ?? ''} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Winter" />
                {draft.label && <p className="text-[11px] text-muted-foreground font-body">Slug: <code>{normalizeName(draft.label)}</code></p>}
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea rows={2} value={draft.description ?? ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Optional" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
                <Button onClick={submit} disabled={saveTag.isPending}>{saveTag.isPending ? 'Saving…' : 'Save Tag'}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TagsPanel;
