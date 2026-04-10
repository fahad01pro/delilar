import { useState, useEffect } from 'react';
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
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-xl shadow-premium border-b border-border/30'
            : 'bg-transparent'
        }`}
      >
        {/* Top bar */}
        <div className="gradient-burgundy py-2">
          <p className="text-center text-primary-foreground text-xs font-body tracking-[0.2em] uppercase">
            ✦ Free Shipping on Orders Over ৳5,000 ✦
          </p>
        </div>

        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-foreground hover:text-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
                <span className="text-xs font-heading font-bold text-foreground">D</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-heading font-bold tracking-wider text-foreground">
                DELILAR
              </h1>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-body tracking-wide uppercase transition-all duration-300 relative group ${
                    location.pathname === link.href
                      ? 'text-accent font-medium'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${
                    location.pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-xl text-foreground/70 hover:text-foreground hover:bg-secondary transition-all duration-200"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <Link to="/wishlist" className="p-2.5 rounded-xl text-foreground/70 hover:text-foreground hover:bg-secondary transition-all duration-200 hidden sm:flex">
                <Heart size={20} />
              </Link>
              <Link to="/account" className="p-2.5 rounded-xl text-foreground/70 hover:text-foreground hover:bg-secondary transition-all duration-200 hidden sm:flex">
                <User size={20} />
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2.5 rounded-xl text-foreground/70 hover:text-foreground hover:bg-secondary transition-all duration-200 relative"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
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
              className="border-t border-border/30 overflow-hidden glass"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full bg-secondary/80 border border-border/50 outline-none pl-12 pr-4 py-3.5 text-sm font-body rounded-xl placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-foreground/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.35 }}
              className="fixed left-0 top-0 bottom-0 z-[60] w-80 max-w-[85vw] bg-background shadow-premium-lg"
            >
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
                      <span className="text-xs font-heading font-bold text-foreground">D</span>
                    </div>
                    <span className="text-xl font-heading font-bold tracking-wider">DELILAR</span>
                  </Link>
                  <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <nav className="flex flex-col p-4 gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base font-body tracking-wide transition-all ${
                      location.pathname === link.href
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-foreground/80 hover:bg-secondary'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-[88px] lg:h-[108px]" />
    </>
  );
};

export default Navbar;
