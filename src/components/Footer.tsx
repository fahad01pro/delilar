import { Mail, Phone, MapPin, Instagram, Facebook, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const socials = [
    { Icon: Facebook, href: 'https://facebook.com/delilar.shop', label: 'Facebook' },
    { Icon: Instagram, href: 'https://instagram.com/delilar.shop', label: 'Instagram' },
  ];

  const shopLinks = [
    { label: 'Jubba / Thobe', to: '/shop?category=jubba' },
    { label: 'Panjabi', to: '/shop?category=panjabi' },
    { label: 'T-Shirts', to: '/shop?category=t-shirts' },
    { label: 'Polo Shirts', to: '/shop?category=polo' },
    { label: 'Pants', to: '/shop?category=pants' },
    { label: 'Bags', to: '/shop?category=bags' },
    { label: 'Attar & Perfume', to: '/shop?category=attar' },
  ];

  const policyLinks = [
    { label: 'Shipping Policy', to: '/shipping-policy' },
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Payment Policy', to: '/payment-policy' },
    { label: 'Gift / Reward Policy', to: '/reward-policy' },
    { label: 'Exchange & Returns', to: '/returns' },
    { label: 'About Delilar', to: '/about' },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <span className="text-sm font-heading font-bold text-foreground">D</span>
              </div>
              <h3 className="text-2xl font-heading font-bold tracking-[0.2em]">DELILAR</h3>
            </div>
            <p className="text-primary-foreground/60 font-body text-sm leading-relaxed mb-6">
              Premium Islamic fashion & lifestyle brand. Jubba, Panjabi, T-Shirts, Polo Shirts, Pants, Bags, Attars and more — crafted for the modern Muslim man.
            </p>
            <div className="flex gap-3">
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
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-6">Shop</h4>
            <ul className="space-y-3">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm font-body text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-6">Policies</h4>
            <ul className="space-y-3">
              {policyLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm font-body text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-6">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:delilar.shop@gmail.com" className="flex items-center gap-3 text-sm font-body text-primary-foreground/70 hover:text-accent transition-colors">
                  <span className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                    <Mail size={14} className="text-accent" />
                  </span>
                  delilar.shop@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+8801533413290" className="flex items-center gap-3 text-sm font-body text-primary-foreground/70 hover:text-accent transition-colors">
                  <span className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                    <Phone size={14} className="text-accent" />
                  </span>
                  +880 1533-413290
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm font-body text-primary-foreground/70">
                <span className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <MapPin size={14} className="text-accent" />
                </span>
                Dhaka, Bangladesh
              </li>
              <li>
                <a
                  href="https://wa.me/8801533413290"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-body tracking-[0.25em] uppercase text-accent hover:underline"
                >
                  Chat on WhatsApp <ArrowRight size={14} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/10 mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40 font-body">
            © 2026 Delilar. All rights reserved. Crafted with elegance.
            <span className="mx-2">·</span>
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
          <div className="flex gap-6 text-xs font-body text-primary-foreground/40">
            <Link to="/privacy-policy" className="hover:text-accent transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-accent transition-colors">Terms</Link>
            <Link to="/shipping-policy" className="hover:text-accent transition-colors">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
