import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Shirt, Crown, Sparkles, Droplets, Star, CircleDot, Briefcase, Wallet } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';

interface MenuCategory {
  label: string;
  href?: string;
  children?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  }[];
}

const menuItems: MenuCategory[] = [
  {
    label: 'Eid Edit',
    href: '/eid',
    children: [
      { label: 'Eid Jubba Sets', href: '/eid', icon: <Crown size={16} /> },
      { label: 'Eid Panjabi', href: '/eid', icon: <Sparkles size={16} /> },
      { label: 'View All Eid', href: '/eid', icon: <Star size={16} /> },
    ],
  },
  {
    label: 'Apparel',
    children: [
      { label: 'Jubba / Thobe', href: '/jubba', icon: <Crown size={16} /> },
      { label: 'Panjabi', href: '/panjabi', icon: <Sparkles size={16} /> },
      { label: 'Polo Shirts', href: '/polo', icon: <Shirt size={16} /> },
      { label: 'T-Shirts', href: '/tshirts', icon: <Shirt size={16} /> },
      { label: 'Shirts', href: '/shirts', icon: <Shirt size={16} /> },
      { label: 'Pants', href: '/pants', icon: <CircleDot size={16} /> },
      { label: 'Hoodies', href: '/hoodies', icon: <Shirt size={16} /> },
    ],
  },
  {
    label: 'Accessories',
    children: [
      { label: 'Caps & Kufi', href: '/caps', icon: <CircleDot size={16} /> },
      { label: 'Keffiyah', href: '/kuffiyah', icon: <CircleDot size={16} /> },
      { label: 'Turban / Pagri', href: '/turban', icon: <Crown size={16} /> },
      { label: 'Bags', href: '/bags', icon: <Briefcase size={16} /> },
      { label: 'Wallets', href: '/wallets', icon: <Wallet size={16} /> },
    ],
  },
  {
    label: 'Fragrance',
    children: [
      { label: 'Perfume', href: '/perfume', icon: <Droplets size={16} /> },
      { label: 'Attar', href: '/attar', icon: <Sparkles size={16} /> },
    ],
  },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const MegaMenu = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: products = [] } = useCatalog();

  const handleEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(label);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const getFeaturedForMenu = (label: string) => {
    if (label === 'Eid Edit') return products.filter((p) => p.category === 'eid').slice(0, 2);
    if (label === 'Apparel')
      return products
        .filter((p) => ['jubba', 'panjabi', 'polo', 'tshirts', 'shirts', 'pants', 'hoodies'].includes(p.category))
        .filter((p) => p.badge === 'Best Seller')
        .slice(0, 2);
    if (label === 'Accessories')
      return products.filter((p) => ['caps', 'bags', 'wallets', 'kuffiyah', 'turban'].includes(p.category)).slice(0, 2);
    if (label === 'Fragrance')
      return products.filter((p) => p.productType === 'perfume').slice(0, 2);
    return [];
  };

  return (
    <div className="hidden lg:flex items-center gap-1">
      {menuItems.map((item) => (
        <div
          key={item.label}
          className="relative"
          onMouseEnter={() => (item.children ? handleEnter(item.label) : undefined)}
          onMouseLeave={handleLeave}
        >
          {item.href && !item.children ? (
            <Link
              to={item.href}
              className="px-4 py-2 text-xs font-body tracking-wider uppercase text-primary-foreground/80 hover:text-accent transition-all duration-300 relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-accent w-0 group-hover:w-3/4 transition-all duration-300" />
            </Link>
          ) : (
            <button
              className={`px-4 py-2 text-xs font-body tracking-wider uppercase transition-all duration-300 flex items-center gap-1 relative group ${
                activeMenu === item.label ? 'text-accent' : 'text-primary-foreground/80 hover:text-accent'
              }`}
            >
              {item.label}
              {item.children && (
                <ChevronDown size={12} className={`transition-transform duration-300 ${activeMenu === item.label ? 'rotate-180' : ''}`} />
              )}
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-accent transition-all duration-300 ${
                activeMenu === item.label ? 'w-3/4' : 'w-0 group-hover:w-3/4'
              }`} />
            </button>
          )}

          <AnimatePresence>
            {item.children && activeMenu === item.label && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 min-w-[520px] rounded-2xl overflow-hidden z-50 border border-accent/20 shadow-[0_24px_60px_-12px_hsl(var(--charcoal)/0.55),0_0_0_1px_hsl(var(--accent)/0.08)] bg-background"
                onMouseEnter={() => handleEnter(item.label)}
                onMouseLeave={handleLeave}
              >
                <div className="p-5 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-3 px-3">
                      {item.label}
                    </p>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        onClick={() => setActiveMenu(null)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200 group/item"
                      >
                        <span className="text-muted-foreground group-hover/item:text-accent transition-colors">
                          {child.icon}
                        </span>
                        <span className="group-hover/item:translate-x-0.5 transition-transform">{child.label}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-2">
                      Featured
                    </p>
                    {getFeaturedForMenu(item.label).map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => setActiveMenu(null)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 transition-all group/prod"
                      >
                        <div
                          className="w-12 h-12 rounded-lg bg-secondary flex-shrink-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${product.image})` }}
                        />
                        <div>
                          <p className="text-xs font-body font-medium text-foreground line-clamp-1 group-hover/prod:text-primary transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs font-body text-accent font-semibold">
                            ৳{product.price.toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 px-5 py-3 border-t border-border/30">
                  <Link
                    to={item.children[0]?.href || '/'}
                    onClick={() => setActiveMenu(null)}
                    className="text-xs font-body tracking-wider uppercase text-primary hover:text-accent transition-colors font-medium"
                  >
                    View All {item.label} →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default MegaMenu;
