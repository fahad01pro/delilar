import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Archive, Download, Eye, Mail, MailOpen, Phone, Search, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

export type ContactMessage = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
  updated_at: string;
};

type Filter = 'all' | 'unread' | 'read' | 'archived';

export const MessagesPanel = () => {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [active, setActive] = useState<ContactMessage | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Could not load messages');
    } else {
      setItems((data ?? []) as ContactMessage[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((m) => {
      if (filter !== 'all' && m.status !== filter) return false;
      if (!term) return true;
      return [m.name, m.phone, m.email ?? '', m.subject, m.message]
        .join(' ').toLowerCase().includes(term);
    });
  }, [items, q, filter]);

  const counts = useMemo(() => ({
    all: items.length,
    unread: items.filter((m) => m.status === 'unread').length,
    read: items.filter((m) => m.status === 'read').length,
    archived: items.filter((m) => m.status === 'archived').length,
  }), [items]);

  const updateStatus = async (id: string, status: ContactMessage['status']) => {
    const prev = items;
    setItems((x) => x.map((m) => (m.id === id ? { ...m, status } : m)));
    const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
    if (error) { setItems(prev); toast.error('Update failed'); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this message permanently?')) return;
    const prev = items;
    setItems((x) => x.filter((m) => m.id !== id));
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) { setItems(prev); toast.error('Delete failed'); }
    else { setActive(null); toast.success('Message deleted'); }
  };

  const openMessage = (m: ContactMessage) => {
    setActive(m);
    if (m.status === 'unread') updateStatus(m.id, 'read');
  };

  const exportCsv = () => {
    const rows = [
      ['Name', 'Phone', 'Email', 'Subject', 'Message', 'Status', 'Date'],
      ...filtered.map((m) => [
        m.name, m.phone, m.email ?? '', m.subject, m.message, m.status,
        new Date(m.created_at).toISOString(),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delilar-messages-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'read', label: 'Read' },
    { key: 'archived', label: 'Archived' },
  ];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">Contact Messages</h2>
          <p className="text-sm text-muted-foreground">Inquiries submitted from the contact page.</p>
        </div>
        <Button onClick={exportCsv} disabled={!filtered.length} className="gap-2">
          <Download size={15} /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === t.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-accent'
            }`}
          >
            {t.label} <span className="ml-1 opacity-70">({counts[t.key]})</span>
          </button>
        ))}
        <div className="relative ml-auto flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages" className="pl-9 h-9" />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-16">Loading messages…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Mail className="mx-auto mb-3 text-muted-foreground" size={28} />
          <p className="text-sm text-muted-foreground">No messages found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <article
              key={m.id}
              className={`group relative rounded-2xl border bg-card p-5 transition-all hover:shadow-premium hover:-translate-y-0.5 ${
                m.status === 'unread' ? 'border-accent/60 shadow-[0_0_0_1px_hsl(var(--accent)/0.15)]' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                      <Phone size={10} /> {m.phone}
                    </p>
                  </div>
                </div>
                {m.status === 'unread' && <Badge className="bg-accent text-accent-foreground border-0 text-[10px]">NEW</Badge>}
                {m.status === 'archived' && <Badge variant="secondary" className="text-[10px]">Archived</Badge>}
              </div>
              <h3 className="font-heading text-base mb-1 truncate">{m.subject}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{m.message}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
                {new Date(m.created_at).toLocaleString()}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => openMessage(m)}>
                  <Eye size={12} /> View
                </Button>
                {m.status !== 'unread' ? (
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => updateStatus(m.id, 'unread')}>
                    <Mail size={12} /> Unread
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => updateStatus(m.id, 'read')}>
                    <MailOpen size={12} /> Read
                  </Button>
                )}
                {m.status !== 'archived' && (
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => updateStatus(m.id, 'archived')}>
                    <Archive size={12} /> Archive
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => remove(m.id)}>
                  <Trash2 size={12} />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">{active.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Name</p>
                    <p className="font-medium">{active.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Phone</p>
                    <a href={`tel:${active.phone}`} className="font-medium hover:text-accent">{active.phone}</a>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</p>
                    {active.email ? (
                      <a href={`mailto:${active.email}`} className="font-medium hover:text-accent">{active.email}</a>
                    ) : <p className="text-muted-foreground">—</p>}
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Submitted</p>
                    <p className="font-medium">{new Date(active.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-secondary/40 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Message</p>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{active.message}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://wa.me/${active.phone.replace(/[^\d]/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-green-600 text-white px-4 py-2 text-xs font-medium hover:bg-green-700"
                  >
                    WhatsApp Reply
                  </a>
                  {active.status !== 'archived' && (
                    <Button variant="outline" size="sm" onClick={() => { updateStatus(active.id, 'archived'); setActive(null); }} className="gap-1">
                      <Archive size={13} /> Archive
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => remove(active.id)} className="gap-1 text-destructive hover:text-destructive ml-auto">
                    <Trash2 size={13} /> Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
