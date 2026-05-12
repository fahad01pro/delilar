import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Heart, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import MegaMenu from './MegaMenu';

const mobileNavLinks = [
  { label: 'Home', href: '/' },
  { label: 'Eid Collection', href: '/eid' },
  {
    label: 'Mens',
    children: [
      { label: 'T-Shirts', href: '/tshirts' },
      { label: 'Shirts', href: '/shirts' },
      { label: 'Pants', href: '/pants' },
      { label: 'Jubba / Thobe', href: '/jubba' },
      { label: 'Panjabi', href: '/panjabi' },
    ],
  },
  {
    label: 'Accessories',
    children: [
      { label: 'Cap', href: '/accessories?sub=cap' },
      { label: 'Kafiya', href: '/accessories?sub=kafiya' },
      { label: 'Pagri', href: '/accessories?sub=pagri' },
      { label: 'Bags', href: '/accessories?sub=bags' },
      { label: 'Wallets', href: '/accessories?sub=wallets' },
      { label: 'Others', href: '/accessories?sub=others' },
    ],
  },
  { label: 'Perfume / Attar', href: '/attar' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const { totalItems, setIsCartOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
          scrolled
            ? 'bg-[hsl(var(--burgundy-dark)/0.88)] backdrop-blur-2xl backdrop-saturate-150 border-accent/15 shadow-[0_8px_32px_hsl(var(--charcoal)/0.25)]'
            : 'bg-[hsl(var(--burgundy)/0.78)] backdrop-blur-xl backdrop-saturate-150 border-primary-foreground/10 shadow-[0_4px_24px_hsl(var(--charcoal)/0.18)]'
        }`}
        style={{
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        }}
      >
        {/* Top bar */}
        <div className="bg-foreground py-1.5">
          <p className="text-center text-background text-[10px] font-body tracking-[0.25em] uppercase">
            ✦ Free Shipping on Orders Over ৳5,000 ✦ Eid Collection Now Live ✦
          </p>
        </div>

        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-primary-foreground hover:text-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <span className="text-xs font-heading font-bold text-foreground">D</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-heading font-bold tracking-[0.15em] text-primary-foreground">
                DELILAR
              </h1>
            </Link>

            {/* Desktop Mega Menu */}
            <MegaMenu />

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-xl text-primary-foreground/70 hover:text-accent hover:bg-primary-foreground/10 transition-all duration-200"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              <Link to="/wishlist" className="p-2.5 rounded-xl text-primary-foreground/70 hover:text-accent hover:bg-primary-foreground/10 transition-all duration-200 hidden sm:flex">
                <Heart size={18} />
              </Link>
              <Link to="/account" className="p-2.5 rounded-xl text-primary-foreground/70 hover:text-accent hover:bg-primary-foreground/10 transition-all duration-200 hidden sm:flex">
                <User size={18} />
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2.5 rounded-xl text-primary-foreground/70 hover:text-accent hover:bg-primary-foreground/10 transition-all duration-200 relative"
                aria-label="Cart"
              >
                <ShoppingBag size={18} />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-accent text-foreground text-[9px] font-bold flex items-center justify-center min-w-[18px] min-h-[18px]"
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
              className="border-t border-primary-foreground/10 overflow-hidden bg-primary/90 backdrop-blur-xl"
            >
              <div className="container mx-auto px-4 py-3">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/40" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full bg-primary-foreground/10 border border-primary-foreground/15 outline-none pl-11 pr-4 py-3 text-sm font-body rounded-xl placeholder:text-primary-foreground/30 text-primary-foreground focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
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
              className="fixed inset-0 z-[55] bg-foreground/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.35 }}
              className="fixed left-0 top-0 bottom-0 z-[60] w-80 max-w-[85vw] bg-background shadow-premium-lg overflow-y-auto"
            >
              <div className="p-5 bg-primary">
                <div className="flex items-center justify-between">
                  <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-[10px] font-heading font-bold text-foreground">D</span>
                    </div>
                    <span className="text-lg font-heading font-bold tracking-[0.15em] text-primary-foreground">DELILAR</span>
                  </Link>
                  <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <nav className="flex flex-col p-3 gap-0.5">
                {mobileNavLinks.map((link) => (
                  <div key={link.label}>
                    {'href' in link && link.href ? (
                      <Link
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`px-4 py-3 rounded-xl text-sm font-body tracking-wide transition-all flex items-center justify-between ${
                          location.pathname === link.href
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-foreground/80 hover:bg-primary/5'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => setExpandedMobile(expandedMobile === link.label ? null : link.label)}
                          className="w-full px-4 py-3 rounded-xl text-sm font-body tracking-wide text-foreground/80 hover:bg-primary/5 transition-all flex items-center justify-between"
                        >
                          {link.label}
                          <ChevronDown size={14} className={`transition-transform duration-200 ${expandedMobile === link.label ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {expandedMobile === link.label && 'children' in link && link.children && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pb-1 space-y-0.5">
                                {link.children.map((child) => (
                                  <Link
                                    key={child.label}
                                    to={child.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-4 py-2.5 rounded-lg text-xs font-body text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                                  >
                                    {child.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                ))}
              </nav>
              {/* Mobile bottom actions */}
              <div className="p-4 border-t border-border/50 mt-2 space-y-2">
                <Link to="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body text-foreground/80 hover:bg-primary/5 transition-all">
                  <User size={16} /> My Account
                </Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body text-foreground/80 hover:bg-primary/5 transition-all">
                  <Heart size={16} /> Wishlist
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-[82px] lg:h-[92px]" />
    </>
  );
};

export default Navbar;
