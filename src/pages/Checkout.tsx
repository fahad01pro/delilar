import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ChevronLeft, ChevronRight, Copy, ShieldCheck, MessageCircle,
  Loader2, Upload, Sparkles, Phone, Truck, Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMfsSettings, MFS_META, type MfsKey } from '@/hooks/useMfsSettings';

const SHIPPING_FEE = 150;
const FREE_SHIPPING_THRESHOLD = 5000;
const WHATSAPP = '8801XXXXXXXXX';

const customerSchema = z.object({
  fullName: z.string().trim().min(2, 'Name required').max(80),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, 'Valid BD phone required'),
  email: z.string().trim().email().max(120).optional().or(z.literal('')),
  address: z.string().trim().min(8, 'Full address required').max(400),
  city: z.string().trim().min(2, 'District/City required').max(60),
});

type CustomerInfo = z.infer<typeof customerSchema>;

const steps = ['Customer', 'Summary', 'Payment', 'Done'] as const;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const { data: mfs } = useMfsSettings();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '', phone: '', email: '', address: '', city: '',
  });

  const [method, setMethod] = useState<MfsKey | null>(null);
  const [txnId, setTxnId] = useState('');
  const [payerNumber, setPayerNumber] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const shipping = useMemo(() => (totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE), [totalPrice]);
  const grandTotal = totalPrice + shipping;

  // Prefill from profile
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setCustomer((c) => ({
        fullName: c.fullName || data.full_name || '',
        phone: c.phone || data.phone || '',
        email: c.email || data.email || user.email || '',
        address: c.address || [data.house_number, data.village, data.upazila].filter(Boolean).join(', ') || data.address || '',
        city: c.city || data.district || data.city || '',
      }));
    });
  }, [user]);

  useEffect(() => {
    if (items.length === 0 && !orderId) navigate('/cart');
  }, [items.length, orderId, navigate]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const validateCustomer = () => {
    const result = customerSchema.safeParse(customer);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 0 && !validateCustomer()) return;
    setStep((s) => Math.min(s + 1, 3));
  };

  const submitOrder = async () => {
    if (!user) return openAuthModal('Please sign in to place your order.');
    if (!method) return toast.error('Choose a payment method');
    if (!txnId.trim() || txnId.trim().length < 6)
      return toast.error('Enter a valid Transaction ID');
    if (!payerNumber.trim()) return toast.error('Enter the number you paid from');

    setSubmitting(true);
    try {
      let screenshotUrl: string | null = null;
      if (proofFile) {
        setUploading(true);
        const ext = proofFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('payment-proofs')
          .upload(path, proofFile, { cacheControl: '3600', upsert: false });
        if (upErr) throw upErr;
        screenshotUrl = path;
        setUploading(false);
      }

      const account = mfs?.[method];
      const payload = {
        user_id: user.id,
        items: items.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          size: i.size ?? null,
          color: i.color ?? null,
          image: i.product.image,
        })),
        subtotal: totalPrice,
        shipping,
        total: grandTotal,
        payment_method: method,
        payment_status: 'pending',
        txn_id: txnId.trim(),
        payer_number: payerNumber.trim(),
        screenshot_url: screenshotUrl,
        payment_account: account?.number ?? null,
        shipping_address: customer,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(payload)
        .select('id')
        .single();
      if (error) throw error;

      setOrderId(data.id);
      clearCart();
      setStep(3);
    } catch (e: any) {
      toast.error(e.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-14 max-w-5xl">
        {/* Stepper */}
        <Stepper current={step} />

        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepShell key="0" title="Customer details" subtitle="Where should we deliver your order?">
              <CustomerForm value={customer} onChange={setCustomer} />
              <Actions onNext={goNext} />
            </StepShell>
          )}

          {step === 1 && (
            <StepShell key="1" title="Order summary" subtitle="Review your items before paying.">
              <SummaryCards items={items} subtotal={totalPrice} shipping={shipping} total={grandTotal} />
              <Actions onBack={() => setStep(0)} onNext={goNext} nextLabel="Continue to payment" />
            </StepShell>
          )}

          {step === 2 && (
            <StepShell key="2" title="Choose payment method" subtitle="Secure mobile banking — fully verified by our team.">
              <PaymentPicker
                method={method}
                onPick={setMethod}
                mfs={mfs}
                amount={grandTotal}
                txnId={txnId}
                setTxnId={setTxnId}
                payerNumber={payerNumber}
                setPayerNumber={setPayerNumber}
                proofFile={proofFile}
                setProofFile={setProofFile}
                onCopy={copy}
              />
              <TrustRow />
              <Actions
                onBack={() => setStep(1)}
                onNext={submitOrder}
                nextLabel={submitting ? (uploading ? 'Uploading…' : 'Submitting…') : 'I Have Paid — Submit Order'}
                nextDisabled={submitting || !method}
                nextLoading={submitting}
              />
            </StepShell>
          )}

          {step === 3 && orderId && (
            <SuccessView orderId={orderId} total={grandTotal} method={method} />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

/* ---------- subcomponents ---------- */

const Stepper = ({ current }: { current: number }) => (
  <div className="mb-10">
    <div className="flex items-center justify-between max-w-2xl mx-auto">
      {steps.map((label, idx) => {
        const active = idx <= current;
        return (
          <div key={label} className="flex-1 flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ scale: idx === current ? 1.1 : 1 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary))]'
                    : 'bg-secondary text-muted-foreground border border-border'
                }`}
              >
                {idx < current ? <Check size={14} /> : idx + 1}
              </motion.div>
              <p className={`mt-2 text-[10px] uppercase tracking-[0.18em] font-body ${
                active ? 'text-foreground' : 'text-muted-foreground'
              }`}>{label}</p>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 transition-colors ${idx < current ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const StepShell = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    <header className="text-center">
      <h1 className="font-heading text-3xl lg:text-4xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground font-body mt-2">{subtitle}</p>
    </header>
    {children}
  </motion.section>
);

const Field = ({ label, value, onChange, type = 'text', placeholder, optional, textarea }: any) => (
  <label className="block">
    <span className="block text-[11px] uppercase tracking-[0.18em] font-body text-muted-foreground mb-1.5">
      {label} {optional && <em className="not-italic text-muted-foreground/60">(optional)</em>}
    </span>
    {textarea ? (
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition resize-none"
      />
    ) : (
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'on'}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-body focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
      />
    )}
  </label>
);

const CustomerForm = ({ value, onChange }: { value: CustomerInfo; onChange: (v: CustomerInfo) => void }) => {
  const upd = (k: keyof CustomerInfo) => (v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="glass rounded-2xl p-6 lg:p-8 shadow-premium space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" value={value.fullName} onChange={upd('fullName')} placeholder="Md. Abdullah Rahman" />
        <Field label="Phone" type="tel" value={value.phone} onChange={upd('phone')} placeholder="01XXXXXXXXX" />
      </div>
      <Field label="Email" type="email" optional value={value.email} onChange={upd('email')} placeholder="you@example.com" />
      <Field label="Full delivery address" textarea value={value.address} onChange={upd('address')} placeholder="House, road, area, landmark" />
      <Field label="District / City" value={value.city} onChange={upd('city')} placeholder="Dhaka" />
    </div>
  );
};

const SummaryCards = ({ items, subtotal, shipping, total }: any) => (
  <div className="grid lg:grid-cols-[1fr_360px] gap-6">
    <div className="space-y-3">
      {items.map((item: any) => (
        <div key={item.product.id + (item.size || '') + (item.color || '')} className="glass rounded-2xl p-4 flex gap-4 shadow-premium">
          <div
            className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0"
            style={{ backgroundImage: `url(${item.product.image})` }}
          />
          <div className="flex-1 min-w-0">
            <p className="font-body font-medium text-sm truncate">{item.product.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ') || 'One size'}
            </p>
            <div className="flex justify-between items-end mt-2">
              <span className="text-xs text-muted-foreground">Qty {item.quantity}</span>
              <span className="font-heading font-bold text-primary">৳{(item.product.price * item.quantity).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
      <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-body tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors px-2">
        <ChevronLeft size={14} /> Edit cart
      </Link>
    </div>
    <aside className="glass rounded-2xl p-6 h-fit shadow-premium-lg space-y-3 lg:sticky lg:top-32">
      <h3 className="font-heading text-lg">Total breakdown</h3>
      <Row label="Subtotal" value={`৳${subtotal.toLocaleString()}`} />
      <Row label="Shipping" value={shipping === 0 ? 'Free' : `৳${shipping}`} />
      <div className="border-t border-border pt-3 flex justify-between items-baseline">
        <span className="font-body text-sm">Total</span>
        <span className="font-heading text-2xl font-bold text-primary">৳{total.toLocaleString()}</span>
      </div>
    </aside>
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm font-body">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const PaymentPicker = ({
  method, onPick, mfs, amount, txnId, setTxnId, payerNumber, setPayerNumber, proofFile, setProofFile, onCopy,
}: any) => {
  const methods: MfsKey[] = ['bkash', 'nagad', 'rocket'];
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        {methods.map((key) => {
          const m = MFS_META[key];
          const acc = mfs?.[key];
          if (acc && acc.enabled === false) return null;
          const selected = method === key;
          return (
            <motion.button
              key={key} type="button" onClick={() => onPick(key)} whileTap={{ scale: 0.98 }}
              className={`relative text-left rounded-2xl p-5 border-2 transition-all overflow-hidden ${
                selected
                  ? 'border-primary bg-primary/[0.03] shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.4)]'
                  : 'border-border bg-background hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${m.tint} flex items-center justify-center text-white font-heading font-bold text-sm shadow-md`}>
                  {m.label[0]}
                </div>
                <div className="flex-1">
                  <p className="font-heading text-base">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mobile Wallet</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selected ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {selected && <Check size={12} className="text-primary-foreground" />}
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-3">{m.tagline}</p>
              <p className="text-[10px] text-muted-foreground/80 mt-1">Verified manually · Instant order placement</p>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {method && (
          <motion.div
            key={method}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-6 shadow-premium-lg space-y-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-body">Step 1 — Send Money</p>
                <h3 className="font-heading text-xl mt-1">Send <span className="text-primary">৳{amount.toLocaleString()}</span> to</h3>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase text-white ${MFS_META[method as MfsKey].tint}`}>
                {MFS_META[method as MfsKey].label}
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.04] p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-body">{mfs?.[method as MfsKey]?.type || 'Personal'} number</p>
              <div className="flex items-center justify-between gap-3 mt-2">
                <p className="font-heading text-2xl lg:text-3xl font-bold tracking-wide select-all">
                  {mfs?.[method as MfsKey]?.number || '—'}
                </p>
                <button
                  type="button"
                  onClick={() => onCopy(mfs?.[method as MfsKey]?.number || '')}
                  className="btn-gold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 text-xs font-body uppercase tracking-wider"
                >
                  <Copy size={14} /> Copy
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-body">
                Open your {MFS_META[method as MfsKey].label} app → Send Money → paste this number → send ৳{amount.toLocaleString()}.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Transaction ID (TXN ID)" value={txnId} onChange={setTxnId}
                placeholder="e.g. 9A8B7C6D5E"
              />
              <Field
                label="Your phone number (paid from)" type="tel" value={payerNumber} onChange={setPayerNumber}
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <p className="block text-[11px] uppercase tracking-[0.18em] font-body text-muted-foreground mb-2">
                Payment screenshot <em className="not-italic text-muted-foreground/60">(recommended)</em>
              </p>
              <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-background px-4 py-4 cursor-pointer transition-colors">
                <Upload size={18} className="text-muted-foreground" />
                <span className="text-sm font-body text-muted-foreground flex-1 truncate">
                  {proofFile ? proofFile.name : 'Upload screenshot of your payment'}
                </span>
                <input
                  type="file" accept="image/*" className="hidden"
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TrustRow = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
    {[
      { icon: ShieldCheck, label: 'Secure mobile banking' },
      { icon: Check, label: '100% manual verification' },
      { icon: MessageCircle, label: 'WhatsApp support 24/7' },
      { icon: Sparkles, label: 'No hidden charges' },
    ].map(({ icon: Icon, label }) => (
      <div key={label} className="rounded-xl border border-border bg-background/60 px-4 py-3 flex items-center gap-2.5">
        <Icon size={16} className="text-accent" />
        <span className="text-xs font-body text-foreground/80">{label}</span>
      </div>
    ))}
  </div>
);

const Actions = ({ onBack, onNext, nextLabel = 'Continue', nextDisabled, nextLoading }: any) => (
  <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between pt-2">
    {onBack ? (
      <button onClick={onBack} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-background hover:bg-secondary transition text-sm font-body tracking-wider uppercase">
        <ChevronLeft size={16} /> Back
      </button>
    ) : <span />}
    <button
      onClick={onNext} disabled={nextDisabled}
      className="btn-primary px-8 py-3.5 rounded-xl inline-flex items-center justify-center gap-2 text-sm font-body tracking-wider uppercase disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {nextLoading && <Loader2 size={14} className="animate-spin" />}
      {nextLabel} {!nextLoading && <ChevronRight size={16} />}
    </button>
  </div>
);

const SuccessView = ({ orderId, total, method }: { orderId: string; total: number; method: MfsKey | null }) => (
  <motion.section
    key="done"
    initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
    className="text-center py-10"
  >
    <motion.div
      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
      className="w-20 h-20 rounded-full bg-accent/20 ring-8 ring-accent/10 flex items-center justify-center mx-auto mb-6"
    >
      <Check size={36} className="text-accent" strokeWidth={3} />
    </motion.div>
    <h1 className="font-heading text-3xl lg:text-4xl font-bold mb-2">Order placed successfully</h1>
    <p className="text-muted-foreground font-body text-sm mb-8 max-w-md mx-auto">
      Thank you for shopping with Delilar. Our team will verify your {method ? MFS_META[method].label : 'payment'} within a few hours.
    </p>
    <div className="glass rounded-2xl p-6 max-w-md mx-auto shadow-premium-lg space-y-4">
      <Row label="Order ID" value={`#${orderId.slice(0, 8).toUpperCase()}`} />
      <Row label="Amount" value={`৳${total.toLocaleString()}`} />
      <Row label="Payment status" value="⏳ Pending verification" />
      <Row label="Expected confirmation" value="Within 2–6 hours" />
      <div className="border-t border-border pt-4 flex flex-col sm:flex-row gap-2">
        <a
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hello Delilar, my order ID is #${orderId.slice(0, 8).toUpperCase()}.`)}`}
          target="_blank" rel="noopener noreferrer"
          className="btn-gold px-4 py-3 rounded-xl inline-flex items-center justify-center gap-2 text-xs font-body tracking-wider uppercase flex-1"
        >
          <MessageCircle size={14} /> WhatsApp Support
        </a>
        <Link to="/account" className="btn-primary px-4 py-3 rounded-xl text-xs font-body tracking-wider uppercase flex-1 inline-flex items-center justify-center gap-2">
          <Truck size={14} /> Track Order
        </Link>
      </div>
    </div>
    <Link to="/" className="inline-block mt-8 text-xs font-body tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">
      Continue shopping →
    </Link>
  </motion.section>
);

export default Checkout;
