import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-heading font-semibold tracking-wider mb-4">DELILAR</h3>
            <p className="text-primary-foreground/60 text-sm leading-relaxed font-body">
              Premium Islamic fashion & luxury attar. Crafted for the modern man who values tradition and style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-body tracking-widest uppercase mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2">
              {['T-Shirts', 'Jubba / Thobe', 'Panjabi', 'Attar', 'About Us'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-')}`}
                    className="text-sm text-primary-foreground/60 hover:text-gold transition-colors font-body"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-sm font-body tracking-widest uppercase mb-4 text-gold">Policies</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Return Policy', 'Terms & Conditions', 'Shipping Info'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-primary-foreground/60 hover:text-gold transition-colors cursor-pointer font-body">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-sm font-body tracking-widest uppercase mb-4 text-gold">Contact</h4>
            <div className="space-y-3 text-sm text-primary-foreground/60 font-body">
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <span>support@delilar.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} />
                <span>+880 1234-567890</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-xs tracking-wider uppercase mb-2 text-gold font-body">Newsletter</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-primary-foreground/10 text-primary-foreground text-sm px-3 py-2 flex-1 outline-none border border-primary-foreground/20 placeholder:text-primary-foreground/40 font-body"
                />
                <button className="bg-gold text-accent-foreground px-4 py-2 text-sm font-body tracking-wider uppercase hover:opacity-90 transition-opacity">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
          <p className="text-xs text-primary-foreground/40 font-body">
            © 2026 Delilar. All rights reserved. Crafted with elegance.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
