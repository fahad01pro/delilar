import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, FileText, CreditCard, Gift, RefreshCw, ArrowLeft } from 'lucide-react';

type PolicySection = { heading: string; body: string[] };
type Policy = {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  icon: any;
  sections: PolicySection[];
};

const policies: Record<string, Policy> = {
  shipping: {
    slug: 'shipping',
    title: 'Shipping Policy',
    eyebrow: 'Delivery & Logistics',
    icon: Truck,
    intro:
      'We deliver Delilar premium fashion and lifestyle products across all 64 districts of Bangladesh with care, speed, and elegance.',
    sections: [
      {
        heading: 'Delivery Timeline',
        body: [
          'Estimated delivery time across all Bangladesh: 3–5 business days.',
          'Orders are processed within 24 hours of confirmation (excluding Fridays).',
        ],
      },
      {
        heading: 'Shipping Charges',
        body: [
          'Flat Delivery Charge: ৳150 across Bangladesh.',
          'FREE shipping on every order above ৳5,000.',
        ],
      },
      {
        heading: 'Order Cancellation After Dispatch',
        body: [
          'If an order is cancelled by the customer AFTER the parcel reaches the delivery location/home due to personal reasons, the customer must pay the delivery charge.',
          'This policy protects our delivery partners and helps us maintain Delilar’s premium service standard.',
        ],
      },
    ],
  },
  exchange: {
    slug: 'exchange',
    title: 'Exchange & Return Policy',
    eyebrow: 'Customer Protection',
    icon: RefreshCw,
    intro:
      'Delilar does not operate a 7-day exchange policy. Please review the rules below carefully — they protect both you and the brand and reflect international luxury fashion standards.',
    sections: [
      {
        heading: 'Check In Front of the Delivery Rider',
        body: [
          'If there is any size issue, damage, or product problem, the customer must check the product in front of the delivery person and return it immediately at that moment.',
          'After verification by Delilar, the product may be replaced or re-sent if approved.',
        ],
      },
      {
        heading: 'No Returns After Delivery is Accepted',
        body: [
          'After receiving the parcel, exchange or return requests based on customer preference may not be accepted.',
          'Returns will NOT be processed once the rider has left the delivery location.',
        ],
      },
      {
        heading: 'Inspection & Replacement',
        body: [
          'Returned products go through a fabric, stitching, fitting, and authenticity inspection before any replacement is issued.',
          'Replacements depend on live stock availability of the same colour, size, and variant.',
        ],
      },
      {
        heading: 'Non-Returnable Items',
        body: [
          'Attar, perfumes, and personal care products are non-returnable for hygiene reasons unless the seal is unbroken.',
          'Items damaged due to customer mishandling, washing without care guidance, or alterations are not eligible.',
        ],
      },
      {
        heading: 'Colour & Photography Disclaimer',
        body: [
          'Slight colour variation between the photograph and the actual product is normal due to screen calibration and studio lighting.',
          'Such minor colour variation is not considered a defect and is not eligible for exchange.',
        ],
      },
    ],
  },
  terms: {
    slug: 'terms',
    title: 'Terms & Conditions',
    eyebrow: 'Legal',
    icon: FileText,
    intro: 'By using delilar.shop you agree to the following terms designed to keep your shopping experience secure and transparent.',
    sections: [
      {
        heading: 'Use of the Website',
        body: [
          'All content, images, brand assets, and product descriptions are property of Delilar and cannot be reproduced without written permission.',
          'You agree to provide accurate information when placing orders or creating an account.',
        ],
      },
      {
        heading: 'Pricing & Availability',
        body: [
          'All prices are listed in Bangladeshi Taka (৳) and inclusive of VAT where applicable.',
          'Delilar reserves the right to modify pricing, product availability, and promotions without prior notice.',
        ],
      },
      {
        heading: 'Limitation of Liability',
        body: [
          'Delilar is not liable for indirect losses or damages arising from product use beyond the price paid for that product.',
        ],
      },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    eyebrow: 'Your Data, Protected',
    icon: ShieldCheck,
    intro:
      'Delilar respects your privacy. We collect only the information necessary to provide a premium shopping experience.',
    sections: [
      {
        heading: 'Information We Collect',
        body: [
          'Name, email, phone number, and delivery address provided during registration or checkout.',
          'Order history and saved wishlist items to personalise your experience.',
          'Anonymous browsing data to improve website performance.',
        ],
      },
      {
        heading: 'How We Use Your Information',
        body: [
          'To process orders and deliver products safely.',
          'To send order updates, exclusive offers, and reward notifications (only if you subscribe).',
          'To improve our website, customer service, and inventory planning.',
        ],
      },
      {
        heading: 'Data Security',
        body: [
          'Your data is stored on secure encrypted servers.',
          'We never sell or share your personal information with third parties for marketing.',
        ],
      },
    ],
  },
  payment: {
    slug: 'payment',
    title: 'Payment Policy',
    eyebrow: 'Secure Transactions',
    icon: CreditCard,
    intro:
      'Delilar offers flexible, secure payment options for a premium checkout experience.',
    sections: [
      {
        heading: 'Accepted Payment Methods',
        body: [
          'Cash on Delivery (COD) across all of Bangladesh.',
          'bKash, Nagad, Rocket — mobile financial services.',
          'Visa, Mastercard, AMEX via secure payment gateway.',
        ],
      },
      {
        heading: 'Advance Payment',
        body: [
          'Orders above ৳15,000 or shipped outside Dhaka may require a small advance to confirm.',
          'Pre-orders and made-to-order pieces require full advance payment.',
        ],
      },
      {
        heading: 'Refunds',
        body: [
          'Approved refunds are processed within 5–7 business days to the original payment method.',
        ],
      },
    ],
  },
  rewards: {
    slug: 'rewards',
    title: 'Gift & Reward Policy',
    eyebrow: 'Delilar Loyalty',
    icon: Gift,
    intro:
      'Every Delilar purchase brings you closer to bigger rewards. Our loyalty program is designed to celebrate returning customers with elegance.',
    sections: [
      {
        heading: 'Delilar Reward Card',
        body: [
          'Tier 1 — 1st Purchase: 5% OFF reward unlocked.',
          'Tier 2 — 2nd Purchase: 10% OFF.',
          'Tier 3 — 3rd Purchase: 20% OFF.',
          'Tier 4 — 4th Purchase: 30% OFF.',
          'Tier 5 — 5th Purchase: 40% OFF.',
          'Tier 6 — 6th Purchase: 50% OFF (Delilar Royalty status).',
        ],
      },
      {
        heading: 'How It Works',
        body: [
          'Complete your reward journey within 30 days of your first order to keep your tier active.',
          'Each purchase upgrades your reward level automatically — don’t lose your progress.',
          'Reward codes will be shared with each delivery and through your registered email.',
        ],
      },
      {
        heading: 'Member Benefits',
        body: [
          'Exclusive discounts on the entire Delilar collection.',
          'Early access to new arrivals and limited collections.',
          'Special member-only offers during Eid and seasonal campaigns.',
          'Rewards that grow with you, the longer you stay with Delilar.',
        ],
      },
      {
        heading: 'Terms',
        body: [
          'Reward tiers and percentages may vary based on campaigns and customer activity.',
          'Rewards cannot be exchanged for cash and are non-transferable.',
          'Delilar reserves the right to modify or end reward campaigns at any time.',
        ],
      },
    ],
  },
};

const PolicyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const policy = slug ? policies[slug] : undefined;
  if (!policy) return <Navigate to="/policies/shipping" replace />;

  const Icon = policy.icon;
  const allPolicies = Object.values(policies);

  return (
    <main className="bg-[hsl(var(--cream))] min-h-screen scroll-smooth">
      <section className="bg-primary text-primary-foreground py-14 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-body tracking-[0.25em] uppercase text-accent mb-6 hover:underline">
            <ArrowLeft size={14} /> Back to Store
          </Link>
          <p className="text-xs font-body tracking-[0.35em] uppercase text-accent mb-3">{policy.eyebrow}</p>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
              <Icon size={26} />
            </div>
            <div>
              <h1 className="font-heading text-4xl lg:text-5xl font-bold leading-tight mb-3">{policy.title}</h1>
              <p className="text-primary-foreground/70 font-body text-base max-w-2xl leading-relaxed">{policy.intro}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-10 lg:py-16 max-w-7xl">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
          {/* Sticky left nav */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[10px] font-body tracking-[0.3em] uppercase text-accent mb-4">All Policies</p>
            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible -mx-1 px-1 pb-2 lg:pb-0">
              {allPolicies.map((p) => {
                const PIcon = p.icon;
                const active = p.slug === policy.slug;
                return (
                  <Link
                    key={p.slug}
                    to={`/policies/${p.slug}`}
                    className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-body whitespace-nowrap lg:whitespace-normal transition-all flex-shrink-0 lg:flex-shrink ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-premium'
                        : 'bg-background border border-[hsl(var(--burgundy)/0.1)] text-foreground/80 hover:border-accent hover:text-[hsl(var(--burgundy))]'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-accent/20 text-accent' : 'bg-[hsl(var(--cream))] text-[hsl(var(--burgundy))]'}`}>
                      <PIcon size={15} />
                    </span>
                    <span className="font-medium">{p.title}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="space-y-6 lg:space-y-8 min-w-0">
            {policy.sections.map((sec, i) => (
              <motion.article
                key={sec.heading}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-background border border-[hsl(var(--burgundy)/0.12)] p-6 lg:p-8 shadow-premium"
              >
                <h2 className="font-heading text-2xl text-[hsl(var(--burgundy))] mb-4">{sec.heading}</h2>
                <ul className="space-y-3 text-sm lg:text-base font-body text-foreground/80 leading-relaxed">
                  {sec.body.map((line, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default PolicyPage;
