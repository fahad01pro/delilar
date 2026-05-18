import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { isAdminUser, ADMIN_EMAIL } from '@/lib/admin';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, EyeOff, Star, Package, ShoppingCart, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const { user, loading, openAuthModal } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);

  const isAdmin = isAdminUser(user);

  const load = async () => {
    setBusy(true);
    const [p, o, b] = await Promise.all([
      supabase.from('products').select('*').order('sort_order', { ascending: true }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('hero_banners').select('*').order('sort_order', { ascending: true }),
    ]);
    setProducts(p.data ?? []);
    setOrders(o.data ?? []);
    setBanners(b.data ?? []);
    setBusy(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-5 p-8 rounded-2xl border border-border bg-card">
          <ShieldCheck className="mx-auto text-accent" size={36} />
          <h1 className="font-heading text-2xl">Admin Access</h1>
          <p className="text-sm text-muted-foreground font-body">
            Sign in with the admin account <span className="text-foreground font-medium">{ADMIN_EMAIL}</span> to continue.
          </p>
          <Button onClick={() => openAuthModal('Admin login required')} className="w-full">
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-3 p-8 rounded-2xl border border-destructive/30 bg-card">
          <h1 className="font-heading text-2xl">Access denied</h1>
          <p className="text-sm text-muted-foreground font-body">
            This account is not authorized for the admin panel.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  const toggleProduct = async (id: string, field: 'is_visible' | 'is_featured' | 'is_new' | 'is_trending' | 'is_sale', value: boolean) => {
    const { error } = await supabase.from('products').update({ [field]: !value }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Updated');
    load();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status: status as any }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Order updated');
    load();
  };

  const toggleBanner = async (id: string, enabled: boolean) => {
    const { error } = await supabase.from('hero_banners').update({ enabled: !enabled }).eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-accent font-body mb-2">Delilar</p>
            <h1 className="font-heading text-3xl md:text-4xl">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">Signed in as {user.email}</p>
          </div>
          <Button variant="outline" onClick={load} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" size={14} /> : 'Refresh'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Package} label="Products" value={products.length} />
          <StatCard icon={ShoppingCart} label="Orders" value={orders.length} />
          <StatCard icon={ImageIcon} label="Hero Banners" value={banners.length} />
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-right p-3">Price</th>
                    <th className="text-right p-3">Stock</th>
                    <th className="text-center p-3">Visible</th>
                    <th className="text-center p-3">Featured</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-border hover:bg-secondary/40">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-muted-foreground">{p.category}</td>
                      <td className="p-3 text-right">৳{Number(p.price).toLocaleString()}</td>
                      <td className="p-3 text-right">{p.stock}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => toggleProduct(p.id, 'is_visible', p.is_visible)} className="inline-flex">
                          {p.is_visible ? <Eye size={16} className="text-accent" /> : <EyeOff size={16} className="text-muted-foreground" />}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => toggleProduct(p.id, 'is_featured', p.is_featured)}>
                          <Star size={16} className={p.is_featured ? 'fill-accent text-accent' : 'text-muted-foreground'} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left p-3">Order ID</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-right p-3">Total</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No orders yet</td></tr>
                  )}
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-border hover:bg-secondary/40">
                      <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                      <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-right">৳{Number(o.total).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                          className="bg-background border border-border rounded px-2 py-1 text-xs"
                        >
                          <option value="warehouse">Warehouse</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="banners" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((b) => (
                <div key={b.id} className="rounded-xl border border-border overflow-hidden bg-card">
                  <img src={b.image_url} alt={b.title} className="w-full h-40 object-cover" />
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-heading">{b.title}</p>
                      <p className="text-xs text-muted-foreground">{b.subtitle}</p>
                    </div>
                    <Badge variant={b.enabled ? 'default' : 'secondary'}>
                      <button onClick={() => toggleBanner(b.id, b.enabled)}>
                        {b.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-body">{label}</p>
      <p className="text-3xl font-heading mt-1">{value}</p>
    </div>
    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
      <Icon className="text-accent" size={20} />
    </div>
  </div>
);

export default Admin;
