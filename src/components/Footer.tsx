import { useState } from 'react';
import { Mail, Phone, Instagram, Facebook, Loader2 } from 'lucide-react';
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

  const socials = [
    { Icon: Facebook, href: 'https://facebook.com/delilar.shop', label: 'Facebook' },
    { Icon: Instagram, href: 'https://instagram.com/delilar.shop', label: 'Instagram' },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 lg:px-8 py-14 text-center">
          <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-3">Stay Updated</p>
          <h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3">Join the Delilar Family</h3>
          <p className="text-primary-foreground/50 font-body text-sm mb-6 max-w-md mx-auto">
            Get exclusive offers, new arrivals, and style notes delivered to your inbox.
          </p>
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

      {/* Brand identity */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <span className="text-sm font-heading font-bold text-foreground">D</span>
            </div>
            <h3 className="text-3xl font-heading font-bold tracking-[0.2em]">DELILAR</h3>
          </div>

          <p className="text-primary-foreground/60 font-body text-sm md:text-base leading-relaxed mb-3">
            Premium Islamic fashion & lifestyle — crafted for the modern Muslim, inspired by the Sunnah.
          </p>
          <p className="text-xs font-body tracking-[0.35em] uppercase text-accent mb-8">Inspired by Sunnah</p>

          {/* Socials */}
          <div className="flex gap-3 mb-8">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-11 h-11 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-foreground transition-all duration-300"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

          {/* Contact (email + WhatsApp only) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm font-body text-primary-foreground/60">
            <a href="mailto:delilar.shop@gmail.com" className="inline-flex items-center gap-2 hover:text-accent transition-colors">
              <Mail size={14} className="text-accent" />
              delilar.shop@gmail.com
            </a>
            <a
              href="https://wa.me/8801533413290"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-accent transition-colors"
            >
              <Phone size={14} className="text-accent" />
              +880 1533-413290
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/10 mt-14 pt-8 text-center">
          <p className="text-xs text-primary-foreground/40 font-body">
            © 2026 Delilar. All rights reserved.{' '}
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
        </div>
      </div>
    </footer>
  );
};

export default Footer;
