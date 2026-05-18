import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';

// Minimal TikTok glyph (lucide doesn't ship one)
const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.5 7.4a6.6 6.6 0 0 1-3.9-1.3v8.4a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.8a2.8 2.8 0 1 0 2 2.7V2h2.7a3.9 3.9 0 0 0 3.9 3.9v1.5z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 lg:px-8 py-14 text-center">
          <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-3">Stay Updated</p>
          <h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3">Join the Delilar Family</h3>
          <p className="text-primary-foreground/50 font-body text-sm mb-6 max-w-md mx-auto">Get exclusive offers, new arrivals, and style tips delivered to your inbox.</p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-primary-foreground/10 text-primary-foreground text-sm px-5 py-3.5 outline-none border border-primary-foreground/15 rounded-l-xl placeholder:text-primary-foreground/30 font-body focus:border-accent transition-colors"
            />
            <button className="bg-accent text-foreground px-8 py-3.5 text-sm font-body tracking-wider uppercase rounded-l-none rounded-r-xl font-semibold hover:shadow-[0_0_20px_hsl(43_72%_52%/0.4)] transition-all duration-300">
              Join
            </button>
          </div>
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
              Premium Islamic fashion & luxury attar. Crafted for the modern man who values tradition and style.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { Icon: Facebook, href: 'https://facebook.com/delilar', label: 'Facebook' },
                { Icon: Instagram, href: 'https://instagram.com/delilar', label: 'Instagram' },
                { Icon: TikTokIcon, href: 'https://tiktok.com/@delilar', label: 'TikTok' },
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

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-body tracking-widest uppercase mb-5 text-accent font-medium">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Eid Collection', href: '/eid' },
                { label: 'T-Shirts', href: '/tshirts' },
                { label: 'Jubba / Thobe', href: '/jubba' },
                { label: 'Panjabi', href: '/panjabi' },
                { label: 'Attar', href: '/attar' },
                { label: 'Accessories', href: '/accessories' },
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
              {['Privacy Policy', 'Return Policy', 'Terms & Conditions', 'Shipping Info', 'About Us'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-primary-foreground/50 hover:text-accent transition-colors cursor-pointer font-body">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-body tracking-widest uppercase mb-5 text-accent font-medium">Contact</h4>
            <div className="space-y-3 text-sm text-primary-foreground/50 font-body">
              {[
                { icon: Mail, text: 'support@delilar.com' },
                { icon: Phone, text: '+880 1234-567890' },
                { icon: MapPin, text: 'Dhaka, Bangladesh' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-accent" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
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
            <span className="hover:text-accent cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-accent cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-accent cursor-pointer transition-colors">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
