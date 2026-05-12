import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

const Wishlist = () => {
  const { items, clear, count } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between mb-10 border-b border-border/50 pb-6">
          <div>
            <p className="text-xs font-body tracking-[0.25em] uppercase text-accent mb-2">Saved for later</p>
            <h1 className="text-3xl lg:text-5xl font-heading font-bold text-foreground flex items-center gap-3">
              <Heart className="text-primary fill-primary" size={32} />
              My Wishlist
              <span className="text-base font-body text-muted-foreground font-normal">({count})</span>
            </h1>
          </div>
          {count > 0 && (
            <button
              onClick={clear}
              className="text-xs font-body tracking-wider uppercase text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2"
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>

        {count === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-6">
              <Heart size={40} className="text-primary/40" />
            </div>
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-sm font-body text-muted-foreground mb-8 max-w-md">
              Save your favourite pieces here and revisit them anytime.
            </p>
            <Link to="/" className="btn-primary px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-body">
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            <AnimatePresence>
              {items.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={p} index={i} />
                  {p.inStock && (
                    <button
                      onClick={() => addItem(p)}
                      className="mt-3 w-full btn-primary py-2.5 text-[11px] tracking-[0.2em] uppercase font-body flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
