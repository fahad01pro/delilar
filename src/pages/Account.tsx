import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Heart, ShoppingBag, Lock, LogOut, MapPin, Phone, Mail, Loader2, CheckCircle2, Truck, Box, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';

type Tab = 'profile' | 'orders' | 'wishlist' | 'cart' | 'security';

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
}

interface Order {
  id: string;
  total: number;
  status: 'warehouse' | 'packaging' | 'transit' | 'delivered' | 'cancelled';
  items: any[];
  created_at: string;
}

const STATUS_STEPS: { key: Order['status']; label: string; icon: any }[] = [
  { key: 'warehouse', label: 'In Warehouse', icon: Warehouse },
  { key: 'packaging', label: 'Packaging', icon: Box },
  { key: 'transit', label: 'In Transit', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const OrderTracker = ({ status }: { status: Order['status'] }) => {
  const activeIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center justify-between gap-2 mt-4">
      {STATUS_STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i <= activeIdx;
        const current = i === activeIdx;
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {i < STATUS_STEPS.length - 1 && (
              <div className="absolute top-5 left-1/2 w-full h-0.5 bg-border z-0">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: i < activeIdx ? '100%' : '0%' }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="h-full bg-accent"
                />
              </div>
            )}
            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                done
                  ? 'bg-accent text-foreground shadow-[0_0_20px_hsl(var(--accent)/0.5)]'
                  : 'bg-muted text-muted-foreground'
              } ${current ? 'ring-4 ring-accent/20' : ''}`}
            >
              <Icon size={16} />
            </div>
            <p className={`text-[10px] font-body tracking-wider uppercase mt-2 text-center ${done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

const Account = () => {
  const { user, loading: authLoading, signOut, openAuthModal } = useAuth();
  const { items: wishItems } = useWishlist();
  const { items: cartItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<Profile>({ full_name: '', email: '', phone: '', address: '', city: '' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    if (!authLoading && !user) openAuthModal('Sign in to access your dashboard.');
  }, [authLoading, user, openAuthModal]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) setProfile({
        full_name: data.full_name ?? '',
        email: data.email ?? user.email ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
      });
      const { data: o } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (o) setOrders(o as any);
    })();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update(profile).eq('id', user.id);
    setSaving(false);
    if (error) toast.error('Failed to save'); else toast.success('Profile updated');
  };

  const changePassword = async () => {
    if (pwd.next.length < 6) return toast.error('Password must be 6+ characters');
    if (pwd.next !== pwd.confirm) return toast.error('Passwords do not match');
    const { error } = await supabase.auth.updateUser({ password: pwd.next });
    if (error) toast.error(error.message);
    else { toast.success('Password updated'); setPwd({ current: '', next: '', confirm: '' }); }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <Lock size={40} className="text-primary/40 mb-4" />
        <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">Members Only</h2>
        <p className="text-sm font-body text-muted-foreground mb-6">Sign in to access your personal dashboard.</p>
        <button onClick={() => openAuthModal()} className="btn-primary px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-body">
          Sign In
        </button>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any; badge?: number }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'orders', label: 'Orders', icon: Package, badge: orders.length },
    { key: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishItems.length },
    { key: 'cart', label: 'Cart', icon: ShoppingBag, badge: cartItems.length },
    { key: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="border-b border-border/50 pb-6 mb-8">
          <p className="text-xs font-body tracking-[0.25em] uppercase text-accent mb-2">My Account</p>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="text-3xl lg:text-5xl font-heading font-bold text-foreground">
              Hello, <span className="text-primary">{(profile.full_name || user.email?.split('@')[0] || 'there').split(' ')[0]}</span>
            </h1>
            <button onClick={async () => { await signOut(); navigate('/'); toast.success('Signed out'); }} className="text-xs font-body tracking-wider uppercase text-muted-foreground hover:text-destructive flex items-center gap-2">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-body whitespace-nowrap transition-all ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--burgundy)/0.5)]'
                        : 'text-foreground/70 hover:bg-primary/5'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={16} /> {t.label}
                    </span>
                    {t.badge ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-accent text-foreground' : 'bg-primary/10 text-primary'}`}>{t.badge}</span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border border-border/50 rounded-2xl p-6 lg:p-8 shadow-premium">
            {tab === 'profile' && (
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground mb-1">Profile Information</h2>
                <p className="text-xs font-body text-muted-foreground mb-6">Manage your personal details and shipping address.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field icon={User} label="Full Name" value={profile.full_name || ''} onChange={(v) => setProfile({ ...profile, full_name: v })} />
                  <Field icon={Mail} label="Email" value={profile.email || ''} onChange={(v) => setProfile({ ...profile, email: v })} type="email" />
                  <Field icon={Phone} label="Phone" value={profile.phone || ''} onChange={(v) => setProfile({ ...profile, phone: v })} />
                  <Field icon={MapPin} label="City" value={profile.city || ''} onChange={(v) => setProfile({ ...profile, city: v })} />
                  <div className="sm:col-span-2">
                    <Field icon={MapPin} label="Address" value={profile.address || ''} onChange={(v) => setProfile({ ...profile, address: v })} />
                  </div>
                </div>
                <button onClick={saveProfile} disabled={saving} className="mt-6 btn-primary px-7 py-3 text-xs tracking-[0.25em] uppercase font-body flex items-center gap-2">
                  {saving && <Loader2 size={14} className="animate-spin" />} Save Changes
                </button>
              </div>
            )}

            {tab === 'orders' && (
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground mb-1">Order History</h2>
                <p className="text-xs font-body text-muted-foreground mb-6">Track every order from warehouse to your door.</p>
                {orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package size={36} className="mx-auto text-primary/30 mb-3" />
                    <p className="text-sm font-body text-muted-foreground">You haven't placed any orders yet.</p>
                    <Link to="/" className="mt-4 inline-block text-xs font-body tracking-wider uppercase text-accent hover:underline">Start Shopping →</Link>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {orders.map((o) => (
                      <div key={o.id} className="border border-border/50 rounded-xl p-5 bg-background">
                        <div className="flex items-start justify-between flex-wrap gap-3">
                          <div>
                            <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground">Order</p>
                            <p className="text-sm font-body font-mono text-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs font-body text-muted-foreground mt-1">{new Date(o.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground">Total</p>
                            <p className="text-lg font-heading font-semibold text-primary">৳{Number(o.total).toLocaleString()}</p>
                          </div>
                        </div>
                        {o.status !== 'cancelled' && <OrderTracker status={o.status} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'wishlist' && (
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground mb-1">My Wishlist</h2>
                <p className="text-xs font-body text-muted-foreground mb-6">Pieces you've saved for later.</p>
                {wishItems.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart size={36} className="mx-auto text-primary/30 mb-3" />
                    <p className="text-sm font-body text-muted-foreground">Your wishlist is empty.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {wishItems.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                  </div>
                )}
              </div>
            )}

            {tab === 'cart' && (
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground mb-1">Cart Items</h2>
                <p className="text-xs font-body text-muted-foreground mb-6">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} ready to check out.</p>
                {cartItems.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag size={36} className="mx-auto text-primary/30 mb-3" />
                    <p className="text-sm font-body text-muted-foreground">Your cart is empty.</p>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-3">
                      {cartItems.map((it) => (
                        <div key={it.product.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
                          <div>
                            <p className="text-sm font-body font-medium text-foreground">{it.product.name}</p>
                            <p className="text-xs font-body text-muted-foreground">Qty {it.quantity}</p>
                          </div>
                          <p className="text-sm font-body text-primary font-semibold">৳{(it.product.price * it.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-5 pt-5 border-t border-border/50">
                      <p className="text-sm font-body text-muted-foreground">Subtotal</p>
                      <p className="text-xl font-heading font-bold text-primary">৳{totalPrice.toLocaleString()}</p>
                    </div>
                    <Link to="/cart" className="mt-5 block text-center btn-primary py-3 text-xs tracking-[0.25em] uppercase font-body">Go to Checkout</Link>
                  </div>
                )}
              </div>
            )}

            {tab === 'security' && (
              <div className="max-w-md">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-1">Change Password</h2>
                <p className="text-xs font-body text-muted-foreground mb-6">Use a strong password you don't reuse elsewhere.</p>
                <div className="space-y-3">
                  <Field icon={Lock} label="New Password" type="password" value={pwd.next} onChange={(v) => setPwd({ ...pwd, next: v })} />
                  <Field icon={Lock} label="Confirm Password" type="password" value={pwd.confirm} onChange={(v) => setPwd({ ...pwd, confirm: v })} />
                </div>
                <button onClick={changePassword} className="mt-6 btn-primary px-7 py-3 text-xs tracking-[0.25em] uppercase font-body">Update Password</button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, label, value, onChange, type = 'text' }: any) => (
  <div className="relative">
    <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={label}
      className="w-full bg-background border border-border/60 rounded-xl pl-11 pr-4 py-3 text-sm font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
    />
  </div>
);

export default Account;
