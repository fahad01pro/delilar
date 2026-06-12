import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Search, Upload, Calendar, Tag, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  type Campaign,
  useAdminCampaigns,
  useSaveCampaign,
  useDeleteCampaign,
  isCampaignLive,
} from '@/hooks/useCampaigns';
import { useAdminProducts } from '@/hooks/useCatalog';
import { useTags, useFabrics, ensureTagsExist } from '@/hooks/useTaxonomy';
import { ChipInput } from '@/components/admin/ChipInput';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

type Draft = Partial<Campaign> & { title: string; slug: string };

const emptyDraft = (): Draft => ({
  title: '',
  slug: '',
  description: '',
  eyebrow: '',
  headline: '',
  subheading: '',
  cta_label: 'Shop Collection',
  cta_href: '',
  banner_url: '',
  mobile_banner_url: '',
  mode: 'manual',
  product_ids: [],
  auto_categories: [],
  auto_tags: [],
  enabled: true,
  show_in_menu: true,
  sort_order: 0,
});

const toDateInput = (iso?: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');

export const CampaignsPanel = ({ uploadFn }: { uploadFn: (file: File) => Promise<string | null> }) => {
  const { data: campaigns = [], refetch } = useAdminCampaigns();
  const { data: products = [] } = useAdminProducts();
  const { data: tagLibrary = [] } = useTags();
  const saveCampaign = useSaveCampaign();
  const deleteCampaign = useDeleteCampaign();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [search, setSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [uploading, setUploading] = useState<'desktop' | 'mobile' | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return campaigns;
    return campaigns.filter((c) => [c.title, c.slug, c.headline].some((v) => String(v ?? '').toLowerCase().includes(q)));
  }, [campaigns, search]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) => [p.name, p.id, p.category, p.sku].some((v) => String(v ?? '').toLowerCase().includes(q)));
  }, [products, productSearch]);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return [...set].sort();
  }, [products]);

  const allTagOptions = useMemo(() => {
    const map = new Map<string, { name: string; label: string; usage_count?: number }>();
    tagLibrary.forEach((t) => map.set(t.name, { name: t.name, label: t.label, usage_count: t.usage_count }));
    products.forEach((p) =>
      (p.tags ?? []).forEach((t: string) => {
        const key = t.trim().toLowerCase();
        if (!key || map.has(key)) return;
        map.set(key, { name: key, label: t });
      }),
    );
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [products, tagLibrary]);

  const openNew = () => setDraft(emptyDraft());
  const openEdit = (c: Campaign) => setDraft({ ...c });
  const close = () => setDraft(null);

  const onUpload = async (file: File, kind: 'desktop' | 'mobile') => {
    setUploading(kind);
    try {
      const url = await uploadFn(file);
      if (url) {
        setDraft((d) => (d ? { ...d, [kind === 'desktop' ? 'banner_url' : 'mobile_banner_url']: url } : d));
        toast.success('Image uploaded');
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.title.trim()) return toast.error('Title is required');
    const slug = slugify(draft.slug || draft.title);
    if (!slug) return toast.error('Slug is required');
    try {
      await saveCampaign.mutateAsync({
        ...draft,
        slug,
        title: draft.title.trim(),
        // CTA is optional — coerce empty strings to null
        cta_label: draft.cta_label?.trim() || null,
        cta_href: draft.cta_href?.trim() || null,
        starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : null,
        ends_at: draft.ends_at ? new Date(draft.ends_at).toISOString() : null,
        product_ids: draft.product_ids ?? [],
        auto_categories: draft.auto_categories ?? [],
        auto_tags: draft.auto_tags ?? [],
      } as any);
      // Sync newly typed tags into the library so they become reusable
      try { await ensureTagsExist(draft.auto_tags ?? []); } catch {}
      toast.success('Campaign saved');
      close();
      refetch();
    } catch (e: any) {
      toast.error(e?.message ?? 'Save failed');
    }
  };

  const remove = async (c: Campaign) => {
    if (!confirm(`Delete campaign "${c.title}"?`)) return;
    try {
      await deleteCampaign.mutateAsync(c.id);
      toast.success('Campaign deleted');
      refetch();
    } catch (e: any) {
      toast.error(e?.message ?? 'Delete failed');
    }
  };

  const toggleProduct = (id: string) => {
    setDraft((d) => {
      if (!d) return d;
      const cur = d.product_ids ?? [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      return { ...d, product_ids: next };
    });
  };

  const toggleCategory = (cat: string) => {
    setDraft((d) => {
      if (!d) return d;
      const cur = d.auto_categories ?? [];
      return { ...d, auto_categories: cur.includes(cat) ? cur.filter((x) => x !== cat) : [...cur, cat] };
    });
  };

  const toggleTag = (tag: string) => {
    setDraft((d) => {
      if (!d) return d;
      const cur = d.auto_tags ?? [];
      return { ...d, auto_tags: cur.includes(tag) ? cur.filter((x) => x !== tag) : [...cur, tag] };
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl">Featured Campaign Collections</h2>
          <p className="text-sm text-muted-foreground font-body">
            Replace the navigation collection menu item with any seasonal campaign — Eid, Winter, Sale, and more.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns" className="pl-9 w-64" />
          </div>
          <Button onClick={openNew} className="gap-2"><Plus size={15} /> New Campaign</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 && (
          <div className="col-span-full p-10 text-center border border-dashed border-border rounded-2xl text-muted-foreground font-body">
            No campaigns yet. Create one to power the dynamic navigation menu item.
          </div>
        )}
        {filtered.map((c) => {
          const live = isCampaignLive(c);
          return (
            <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden hover:border-accent/60 transition-all">
              <div className="aspect-[16/9] bg-secondary relative">
                {c.banner_url ? (
                  <img src={c.banner_url} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs font-body">No banner</div>
                )}
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-body ${live ? 'bg-emerald-500/90 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {live ? 'Live' : 'Inactive'}
                  </span>
                  {c.show_in_menu && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent text-foreground font-body">In Menu</span>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div>
                  <h3 className="font-heading text-lg">{c.title}</h3>
                  <p className="text-xs text-muted-foreground font-body">/collection/{c.slug}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                  <span className="capitalize">{c.mode} mode</span>
                  <span>•</span>
                  <span>
                    {c.mode === 'manual'
                      ? `${c.product_ids.length} products`
                      : `${c.auto_categories.length} cats · ${c.auto_tags.length} tags`}
                  </span>
                </div>
                {(c.starts_at || c.ends_at) && (
                  <p className="text-[11px] text-muted-foreground font-body flex items-center gap-1">
                    <Calendar size={11} />
                    {c.starts_at ? new Date(c.starts_at).toLocaleDateString() : '—'} →{' '}
                    {c.ends_at ? new Date(c.ends_at).toLocaleDateString() : '—'}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(c)} className="flex-1">Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => remove(c)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{draft?.id ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-6">
              {/* Basic */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Menu Title *</Label>
                  <Input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: draft.slug || slugify(e.target.value) })}
                    placeholder="Eid Collection / Winter Edit / Black Friday"
                  />
                </div>
                <div className="space-y-1">
                  <Label>URL Slug *</Label>
                  <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} placeholder="winter-collection" />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Eyebrow</Label>
                  <Input value={draft.eyebrow ?? ''} onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })} placeholder="Limited Edition" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Hero Headline</Label>
                  <Input value={draft.headline ?? ''} onChange={(e) => setDraft({ ...draft, headline: e.target.value })} placeholder="Winter Collection 2026" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Subheading</Label>
                <Input value={draft.subheading ?? ''} onChange={(e) => setDraft({ ...draft, subheading: e.target.value })} placeholder="Premium pieces curated for the season" />
              </div>

              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea rows={3} value={draft.description ?? ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              </div>

              {/* CTA */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>CTA Button Label</Label>
                  <Input value={draft.cta_label ?? ''} onChange={(e) => setDraft({ ...draft, cta_label: e.target.value })} placeholder="Shop Collection" />
                </div>
                <div className="space-y-1">
                  <Label>CTA Link</Label>
                  <Input value={draft.cta_href ?? ''} onChange={(e) => setDraft({ ...draft, cta_href: e.target.value })} placeholder="/jubba" />
                </div>
              </div>

              {/* Banners */}
              <div className="grid sm:grid-cols-2 gap-4">
                {(['desktop', 'mobile'] as const).map((kind) => {
                  const url = kind === 'desktop' ? draft.banner_url : draft.mobile_banner_url;
                  return (
                    <div key={kind} className="space-y-2">
                      <Label className="capitalize">{kind} Banner</Label>
                      <div className="aspect-[16/9] rounded-xl border border-dashed border-border bg-secondary relative overflow-hidden">
                        {url ? (
                          <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground font-body">No image</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], kind)}
                          />
                          <span className="flex items-center justify-center gap-2 px-3 py-2 text-xs border border-border rounded-lg hover:bg-secondary font-body">
                            <Upload size={13} /> {uploading === kind ? 'Uploading…' : 'Upload'}
                          </span>
                        </label>
                        {url && (
                          <Button size="sm" variant="outline" onClick={() => setDraft({ ...draft, [kind === 'desktop' ? 'banner_url' : 'mobile_banner_url']: '' })}>
                            <Trash2 size={13} />
                          </Button>
                        )}
                      </div>
                      <Input
                        value={url ?? ''}
                        onChange={(e) => setDraft({ ...draft, [kind === 'desktop' ? 'banner_url' : 'mobile_banner_url']: e.target.value })}
                        placeholder="Or paste image URL"
                        className="text-xs"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Mode */}
              <div className="space-y-2">
                <Label>Product Assignment Mode</Label>
                <div className="flex gap-2">
                  {(['manual', 'auto'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDraft({ ...draft, mode: m })}
                      className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-body border transition-all ${
                        draft.mode === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                      }`}
                    >
                      {m === 'manual' ? 'Manual Selection' : 'Auto by Category / Tag'}
                    </button>
                  ))}
                </div>
              </div>

              {draft.mode === 'manual' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Select Products ({draft.product_ids?.length ?? 0})</Label>
                    <Input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products"
                      className="w-56 text-xs"
                    />
                  </div>
                  <div className="max-h-72 overflow-y-auto border border-border rounded-xl divide-y divide-border">
                    {filteredProducts.map((p) => {
                      const selected = (draft.product_ids ?? []).includes(p.id);
                      return (
                        <label key={p.id} className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-secondary/50 ${selected ? 'bg-accent/10' : ''}`}>
                          <input type="checkbox" checked={selected} onChange={() => toggleProduct(p.id)} className="w-4 h-4" />
                          <div className="w-10 h-10 rounded bg-secondary bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${p.data?.image ?? ''})` }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-body truncate">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground font-body">{p.category} · ৳{Number(p.price).toLocaleString()}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Categories</Label>
                    <div className="flex flex-wrap gap-2">
                      {allCategories.map((cat) => {
                        const sel = (draft.auto_categories ?? []).includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={`px-3 py-1.5 text-xs rounded-full border font-body capitalize ${sel ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Tag size={13} /> Tags (auto-include products carrying any of these tags)</Label>
                    <ChipInput
                      values={draft.auto_tags ?? []}
                      onChange={(next) => setDraft({ ...draft, auto_tags: next })}
                      options={allTagOptions}
                      placeholder="Type a tag and press Enter (e.g. winter, eid, sale)"
                      emptyHint="No tags yet — start typing to create one."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Product Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {(['clothing', 'accessories', 'perfume'] as const).map((pt) => {
                        const cur = draft.auto_categories ?? [];
                        const key = `type:${pt}`;
                        const sel = cur.includes(key);
                        return (
                          <button
                            key={pt}
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                auto_categories: sel ? cur.filter((x) => x !== key) : [...cur, key],
                              })
                            }
                            className={`px-3 py-1.5 text-xs rounded-full border font-body capitalize ${sel ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}
                          >
                            {pt}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-body">Stored alongside category filters with a <code>type:</code> prefix.</p>
                  </div>
                </div>
              )}

              {/* Scheduling */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={toDateInput(draft.starts_at as any)}
                    onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    value={toDateInput(draft.ends_at as any)}
                    onChange={(e) => setDraft({ ...draft, ends_at: e.target.value })}
                  />
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm font-body">
                  <input type="checkbox" checked={!!draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} className="w-4 h-4" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm font-body">
                  <input type="checkbox" checked={!!draft.show_in_menu} onChange={(e) => setDraft({ ...draft, show_in_menu: e.target.checked })} className="w-4 h-4" />
                  Show in navigation menu
                </label>
                <div className="flex items-center gap-2 text-sm font-body">
                  <Label className="m-0">Order</Label>
                  <Input
                    type="number"
                    value={draft.sort_order ?? 0}
                    onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" onClick={close}>Cancel</Button>
                <Button onClick={save} disabled={saveCampaign.isPending}>
                  {saveCampaign.isPending ? 'Saving…' : 'Save Campaign'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CampaignsPanel;
