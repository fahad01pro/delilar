import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubmitting(true);
    const { error } = await (supabase as any)
      .from('newsletter_subscribers')
      .insert({ email: value, source: 'footer' });
    setSubmitting(false);
    if (error && !String(error.message).toLowerCase().includes('duplicate')) {
      toast.error(error.message);
      return;
    }
    toast.success('Welcome to the Delilar family ✨');
    setEmail('');
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 lg:px-8 py-14 text-center">
          <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-3">Stay Updated</p>
          <h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3">Join the Delilar Family</h3>
          <p className="text-primary-foreground/50 font-body text-sm mb-6 max-w-md mx-auto">Get exclusive offers, new arrivals, and style tips delivered to your inbox.</p>
          <form onSubmit={subscribe} className="flex max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 bg-primary-foreground/10 text-primary-foreground text-sm px-5 py-3.5 outline-none border border-primary-foreground/15 rounded-l-xl placeholder:text-primary-foreground/30 font-body focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-accent text-foreground px-8 py-3.5 text-sm font-body tracking-wider uppercase rounded-l-none rounded-r-xl font-semibold hover:shadow-[0_0_20px_hsl(43_72%_52%/0.4)] transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Join'}
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <span className="text-xs font-heading font-bold text-foreground">D</span>
              </div>
              <h3 className="text-2xl font-heading font-bold tracking-[0.15em]">DELILAR</h3>
            </div>
            <p className="text-primary-foreground/50 text-sm leading-relaxed font-body">
              Premium Islamic fashion & lifestyle brand. Jubba, Panjabi, T-Shirts, Polo Shirts, Pants, Bags, Attars and more — crafted for the modern Muslim man.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { Icon: Facebook, href: 'https://facebook.com/delilar.shop', label: 'Facebook' },
                { Icon: Instagram, href: 'https://instagram.com/delilar.shop', label: 'Instagram' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-foreground transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-body tracking-widest uppercase mb-5 text-accent font-medium">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: 'Jubba / Thobe', href: '/jubba' },
                { label: 'Panjabi', href: '/panjabi' },
                { label: 'T-Shirts', href: '/tshirts' },
                { label: 'Polo Shirts', href: '/polo' },
                { label: 'Pants', href: '/pants' },
                { label: 'Bags', href: '/bags' },
                { label: 'Attar & Perfume', href: '/attar' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-primary-foreground/50 hover:text-accent transition-colors font-body">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-sm font-body tracking-widest uppercase mb-5 text-accent font-medium">Policies</h4>
            <ul className="space-y-3">
              {[
                { label: 'Shipping Policy', href: '/policies/shipping' },
                { label: 'Terms & Conditions', href: '/policies/terms' },
                { label: 'Privacy Policy', href: '/policies/privacy' },
                { label: 'Payment Policy', href: '/policies/payment' },
                { label: 'Gift / Reward Policy', href: '/policies/rewards' },
                { label: 'Exchange & Returns', href: '/policies/exchange' },
                { label: 'About Delilar', href: '/about' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-primary-foreground/50 hover:text-accent transition-colors font-body">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-body tracking-widest uppercase mb-5 text-accent font-medium">Contact</h4>
            <div className="space-y-3 text-sm text-primary-foreground/50 font-body">
              {[
                { icon: Mail, text: 'delilar.shop@gmail.com', href: 'mailto:delilar.shop@gmail.com' },
                { icon: Phone, text: '+880 1533-413290', href: 'tel:+8801533413290' },
                { icon: MapPin, text: 'Dhaka, Bangladesh' },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-accent" />
                  </div>
                  {href ? (
                    <a href={href} className="hover:text-accent transition-colors">{text}</a>
                  ) : (
                    <span>{text}</span>
                  )}
                </div>
              ))}
              <a
                href="https://wa.me/8801533413290"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 text-xs font-body tracking-wider uppercase text-accent hover:underline"
              >
                Chat on WhatsApp →
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/30 font-body">
            © 2026 Delilar. All rights reserved. Crafted with elegance.{' '}
            <span className="mx-1">·</span>
            Website developed by{' '}
            <a
              href="https://www.mufasys.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline font-medium"
            >
              MufaSys
            </a>
          </p>
          <div className="flex gap-4 text-xs text-primary-foreground/30 font-body">
            <Link to="/policies/privacy" className="hover:text-accent transition-colors">Privacy</Link>
            <Link to="/policies/terms" className="hover:text-accent transition-colors">Terms</Link>
            <Link to="/policies/shipping" className="hover:text-accent transition-colors">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
