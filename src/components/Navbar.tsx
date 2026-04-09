import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'T-Shirts', href: '/tshirts' },
  { label: 'Jubba', href: '/jubba' },
  { label: 'Panjabi', href: '/panjabi' },
  { label: 'Attar', href: '/attar' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const location = useLocation();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        {/* Top bar */}
        <div className="bg-primary py-1.5">
          <p className="text-center text-primary-foreground text-xs font-body tracking-widest uppercase">
            Free Shipping on Orders Over ৳5,000
          </p>
        </div>

        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl lg:text-3xl font-heading font-semibold tracking-wider text-foreground">
                DELILAR
              </h1>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-body tracking-wide uppercase transition-colors duration-200 hover:text-accent ${
                    location.pathname === link.href ? 'text-accent' : 'text-foreground/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <Link to="/wishlist" className="p-2 text-foreground/70 hover:text-foreground transition-colors hidden sm:block">
                <Heart size={20} />
              </Link>
              <Link to="/account" className="p-2 text-foreground/70 hover:text-foreground transition-colors hidden sm:block">
                <User size={20} />
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-foreground/70 hover:text-foreground transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full bg-secondary border-none outline-none px-4 py-3 text-sm font-body rounded-sm placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-background pt-28"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-20 right-4 p-2"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
            <nav className="flex flex-col items-center gap-6 pt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-heading tracking-wider uppercase text-foreground hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-[88px] lg:h-[108px]" />
    </>
  );
};

export default Navbar;
