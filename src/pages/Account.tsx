import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Heart, ShoppingBag, Lock, LogOut, MapPin, Phone, Mail, Loader2, CheckCircle2, Truck, Home, Hash, Building2, PhoneCall, Info, ClipboardCheck, XCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { BD_DISTRICTS, BD_LOCATIONS } from '@/data/bangladeshLocations';

type Tab = 'profile' | 'orders' | 'wishlist' | 'cart' | 'security';

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  secondary_phone: string | null;
  district: string | null;
  upazila: string | null;
  village: string | null;
  house_number: string | null;
  detailed_address: string | null;
  // legacy
  address: string | null;
  city: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Bangladesh mobile: optional +880 or 0, then 1[3-9] + 8 digits
const BD_PHONE_RE = /^(?:\+?880|0)?1[3-9]\d{8}$/;
const sanitizePhone = (v: string) => v.replace(/[^\d+]/g, '').slice(0, 15);

type OrderStatus = 'warehouse' | 'packaging' | 'transit' | 'delivered' | 'cancelled' | 'refunded';

interface Order {
  id: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  status: OrderStatus;
  items: any[];
  created_at: string;
  updated_at?: string;
  cancelled_at?: string | null;
  payment_method?: string;
  payment_status?: string;
  txn_id?: string | null;
  payer_number?: string | null;
  shipping_address?: any;
  admin_notes?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  courier?: string | null;
}

const TRACK_STEPS: { key: 'received' | 'transit' | 'delivered'; label: string; sub: string; icon: any }[] = [
  { key: 'received', label: 'Order Received', sub: 'We have your order', icon: ClipboardCheck },
  { key: 'transit', label: 'In Transit', sub: 'On the way to you', icon: Truck },
  { key: 'delivered', label: 'Delivered', sub: 'Enjoy your Delilar order', icon: CheckCircle2 },
];

const statusToStep = (s: OrderStatus): number => {
  if (s === 'delivered') return 2;
  if (s === 'transit') return 1;
  return 0; // warehouse, packaging → received
};

const OrderTracker = ({ status }: { status: OrderStatus }) => {
  const activeIdx = statusToStep(status);
  return (
    <div className="flex items-start justify-between gap-2 mt-5">
      {TRACK_STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i <= activeIdx;
        const current = i === activeIdx;
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {i < TRACK_STEPS.length - 1 && (
              <div className="absolute top-6 left-1/2 w-full h-0.5 bg-border z-0">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: i < activeIdx ? '100%' : '0%' }}
                  transition={{ duration: 0.7, delay: i * 0.15, ease: 'easeOut' }}
                  className="h-full bg-accent"
                />
              </div>
            )}
            <motion.div
              initial={false}
              animate={current ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 1.6, repeat: current ? Infinity : 0, ease: 'easeInOut' }}
              className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                done
                  ? 'bg-accent text-foreground shadow-[0_0_24px_hsl(var(--accent)/0.55)]'
                  : 'bg-muted text-muted-foreground'
              } ${current ? 'ring-4 ring-accent/25' : ''}`}
            >
              <Icon size={18} />
            </motion.div>
            <p className={`text-[10px] font-body tracking-[0.18em] uppercase mt-2.5 text-center ${done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {step.label}
            </p>
            <p className="text-[10px] font-body text-muted-foreground/80 mt-0.5 text-center hidden sm:block">{step.sub}</p>
          </div>
        );
      })}
    </div>
  );
};

const paymentBadge = (ps?: string) => {
  const map: Record<string, string> = {
    paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    cod_pending: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    failed: 'bg-red-500/10 text-red-600 border-red-500/30',
  };
  return map[ps || 'pending'] || map.pending;
};


const Account = () => {
  const { user, loading: authLoading, signOut, openAuthModal } = useAuth();
  const { items: wishItems } = useWishlist();
  const { items: cartItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<Profile>({
    full_name: '', email: '', phone: '', secondary_phone: '',
    district: '', upazila: '', village: '', house_number: '', detailed_address: '',
    address: '', city: '',
  });
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
        secondary_phone: (data as any).secondary_phone ?? '',
        district: (data as any).district ?? '',
        upazila: (data as any).upazila ?? '',
        village: (data as any).village ?? '',
        house_number: (data as any).house_number ?? '',
        detailed_address: (data as any).detailed_address ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
      });
      const { data: o } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (o) setOrders(o as any);
    })();
  }, [user]);

  const requiredOk = () =>
    !!profile.full_name?.trim() &&
    EMAIL_RE.test((profile.email || '').trim()) &&
    BD_PHONE_RE.test((profile.phone || '').trim()) &&
    (!profile.secondary_phone?.trim() || BD_PHONE_RE.test(profile.secondary_phone.trim())) &&
    !!profile.district &&
    !!profile.upazila &&
    !!profile.village?.trim() &&
    !!profile.house_number?.trim() &&
    !!profile.detailed_address?.trim();

  const saveProfile = async () => {
    if (!user) return;
    if (!profile.full_name?.trim()) return toast.error('Full name is required');
    if (!EMAIL_RE.test((profile.email || '').trim())) return toast.error('Enter a valid email');
    if (!BD_PHONE_RE.test((profile.phone || '').trim())) return toast.error('Enter a valid Bangladeshi mobile number');
    if (profile.secondary_phone?.trim() && !BD_PHONE_RE.test(profile.secondary_phone.trim())) return toast.error('Secondary number is invalid');
    if (!profile.district) return toast.error('Select your district');
    if (!profile.upazila) return toast.error('Select your upazila');
    if (!profile.village?.trim()) return toast.error('Village / Area is required');
    if (!profile.house_number?.trim()) return toast.error('House number is required (write "No" if none)');
    if (!profile.detailed_address?.trim()) return toast.error('Detailed address is required');

    setSaving(true);
    // Mirror to legacy city/address columns for older consumers.
    const payload = {
      ...profile,
      city: profile.district,
      address: [profile.house_number, profile.village, profile.upazila, profile.district].filter(Boolean).join(', '),
    };
    const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
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
                <h2 className="text-xl font-heading font-semibold text-foreground mb-1">Profile & Shipping Information</h2>
                <p className="text-xs font-body text-muted-foreground mb-8">Complete your details so we can deliver your order anywhere in Bangladesh.</p>

                {/* Personal */}
                <div className="mb-8">
                  <p className="text-[10px] font-body tracking-[0.3em] uppercase text-accent mb-3">Personal Details</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field icon={User} label="Full Name" required value={profile.full_name || ''} onChange={(v) => setProfile({ ...profile, full_name: v })} />
                    <Field icon={Mail} label="Email Address" required type="email" value={profile.email || ''} onChange={(v) => setProfile({ ...profile, email: v })} />
                    <Field icon={Phone} label="Primary Mobile Number" required placeholder="01XXXXXXXXX" value={profile.phone || ''} onChange={(v) => setProfile({ ...profile, phone: sanitizePhone(v) })} />
                    <div>
                      <Field icon={PhoneCall} label="Secondary Mobile Number (optional)" placeholder="01XXXXXXXXX" value={profile.secondary_phone || ''} onChange={(v) => setProfile({ ...profile, secondary_phone: sanitizePhone(v) })} />
                      <p className="mt-1.5 text-[11px] font-body text-muted-foreground flex items-start gap-1.5">
                        <Info size={11} className="mt-0.5 shrink-0 text-accent" />
                        Used if we cannot reach you on the primary number during delivery.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping */}
                <div>
                  <p className="text-[10px] font-body tracking-[0.3em] uppercase text-accent mb-3">Shipping Address</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <SelectField
                      icon={Building2}
                      label="District"
                      required
                      value={profile.district || ''}
                      onChange={(v) => setProfile({ ...profile, district: v, upazila: '' })}
                      options={BD_DISTRICTS}
                      placeholder="Select your district"
                    />
                    <SelectField
                      icon={MapPin}
                      label="Upazila / Sub-district"
                      required
                      disabled={!profile.district}
                      value={profile.upazila || ''}
                      onChange={(v) => setProfile({ ...profile, upazila: v })}
                      options={profile.district ? BD_LOCATIONS[profile.district] || [] : []}
                      placeholder={profile.district ? 'Select your upazila' : 'Select a district first'}
                    />
                    <Field icon={Home} label="Village / Area" required value={profile.village || ''} onChange={(v) => setProfile({ ...profile, village: v })} />
                    <div>
                      <Field icon={Hash} label="House Number" required value={profile.house_number || ''} onChange={(v) => setProfile({ ...profile, house_number: v })} />
                      <p className="mt-1.5 text-[11px] font-body text-muted-foreground flex items-start gap-1.5">
                        <Info size={11} className="mt-0.5 shrink-0 text-accent" />
                        If you don't have a house number, write "No".
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <TextareaField
                        icon={MapPin}
                        label="Full Detailed Address"
                        required
                        rows={3}
                        placeholder="Road, landmark, nearest mosque/market, postal code…"
                        value={profile.detailed_address || ''}
                        onChange={(v) => setProfile({ ...profile, detailed_address: v })}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveProfile}
                  disabled={saving || !requiredOk()}
                  className="mt-8 btn-primary px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-body flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
                    {orders.map((o) => <OrderCard key={o.id} order={o} />)}
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

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-[11px] font-body tracking-[0.18em] uppercase text-foreground/70 mb-1.5">
    {children}{required && <span className="text-primary ml-1">*</span>}
  </label>
);

const Field = ({ icon: Icon, label, value, onChange, type = 'text', placeholder, required }: any) => (
  <div>
    <FieldLabel required={required}>{label}</FieldLabel>
    <div className="relative group">
      <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        className="w-full bg-background border border-border/60 rounded-xl pl-11 pr-4 py-3 text-sm font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 hover:border-accent/40 transition-all"
      />
    </div>
  </div>
);

const SelectField = ({ icon: Icon, label, value, onChange, options, placeholder, required, disabled }: any) => (
  <div>
    <FieldLabel required={required}>{label}</FieldLabel>
    <div className="relative group">
      <Icon size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${disabled ? 'text-muted-foreground/40' : 'text-muted-foreground group-focus-within:text-accent'}`} />
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-background border border-border/60 rounded-xl pl-11 pr-10 py-3 text-sm font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 hover:border-accent/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((o: string) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <svg className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${disabled ? 'text-muted-foreground/40' : 'text-muted-foreground'}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </div>
);

const TextareaField = ({ icon: Icon, label, value, onChange, placeholder, required, rows = 3 }: any) => (
  <div>
    <FieldLabel required={required}>{label}</FieldLabel>
    <div className="relative group">
      <Icon size={14} className="absolute left-4 top-3.5 text-muted-foreground group-focus-within:text-accent transition-colors" />
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        className="w-full bg-background border border-border/60 rounded-xl pl-11 pr-4 py-3 text-sm font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 hover:border-accent/40 transition-all resize-none"
      />
    </div>
  </div>
);

export default Account;
