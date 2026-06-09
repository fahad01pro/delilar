import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const wished = has(product.id);
  const oos = product.inStock === false;
  const [tapped, setTapped] = useState(false);

  // Resolve primary + secondary image (prefer first color variant, fall back to product.images)
  const variantImages = product.colorVariants?.[0]?.images ?? [];
  const allImages = variantImages.length > 0 ? variantImages : (product.images ?? []);
  const primaryImage = (allImages[0] && allImages[0] !== '/placeholder.svg') ? allImages[0] : product.image;
  const secondaryImage = allImages[1] && allImages[1] !== '/placeholder.svg' && allImages[1] !== primaryImage ? allImages[1] : undefined;
  const hasHoverImage = !!secondaryImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block" onTouchStart={() => hasHoverImage && setTapped((t) => !t)}>
        <div className="relative aspect-[3/4] bg-secondary overflow-hidden rounded-2xl shadow-premium group-hover:shadow-premium-lg transition-all duration-500">
          {/* Primary image with zoom */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-secondary bg-cover bg-center transition-all duration-[700ms] ease-out group-hover:scale-110"
            style={primaryImage && primaryImage !== '/placeholder.svg' ? { backgroundImage: `url(${primaryImage})` } : undefined}
          />

          {/* Secondary hover image (fades in on hover / tap) */}
          {hasHoverImage && (
            <div
              className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out ${
                tapped ? 'opacity-100 scale-105' : 'opacity-0 group-hover:opacity-100 group-hover:scale-105'
              }`}
              style={{ backgroundImage: `url(${secondaryImage})` }}
            />
          )}

          {/* Badges */}
          {product.badge && !oos && (
            <span className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-[10px] font-body tracking-wider uppercase px-3 py-1.5 rounded-lg shadow-premium">
              {product.badge}
            </span>
          )}
          {product.originalPrice && !oos && (
            <span className="absolute top-3 right-3 z-10 bg-destructive text-destructive-foreground text-[10px] font-body px-2.5 py-1.5 rounded-lg font-semibold">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}

          {/* Wishlist heart */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.preventDefault();
              toggle(product);
            }}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute z-20 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 shadow-sm ${
              wished
                ? 'bg-primary text-primary-foreground opacity-100'
                : 'bg-background/85 text-foreground opacity-0 group-hover:opacity-100 hover:text-primary'
            }`}
            style={{ top: product.originalPrice && !oos ? '3.25rem' : '0.75rem', right: '0.75rem' }}
          >
            <motion.span
              key={String(wished)}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className="block"
            >
              <Heart size={16} className={wished ? 'fill-current' : ''} />
            </motion.span>
          </motion.button>

          {/* Out of Stock overlay */}
          {oos && (
            <>
              <div className="absolute inset-0 bg-foreground/45 z-10" />
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex justify-center">
                <span className="bg-background/95 backdrop-blur-md text-foreground text-[11px] font-body tracking-[0.3em] uppercase px-6 py-2.5 rounded-lg border border-accent/40 shadow-premium-lg">
                  Out of Stock
                </span>
              </div>
            </>
          )}

          {/* Hover quick actions (only if in stock) */}
          {!oos && (
            <div className="absolute inset-x-0 bottom-0 z-10 p-3 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addItem(product);
                }}
                className="flex-1 bg-background/95 backdrop-blur-md text-foreground py-2.5 rounded-xl text-[10px] font-body tracking-[0.2em] uppercase font-medium hover:bg-primary hover:text-primary-foreground transition-all shadow-premium flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} /> Quick Add
              </button>
              <span className="bg-background/95 backdrop-blur-md text-foreground p-2.5 rounded-xl shadow-premium">
                <Eye size={14} />
              </span>
            </div>
          )}

          {/* Gold border glow on hover */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-accent/60 group-hover:shadow-[0_0_30px_hsl(var(--gold)/0.35),0_0_60px_hsl(var(--gold)/0.15)] transition-all duration-500 pointer-events-none" />
        </div>
      </Link>
      <div className="mt-4 px-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-body font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-base font-heading font-bold text-primary">৳{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">৳{product.originalPrice.toLocaleString()}</span>
          )}
          {oos && (
            <span className="ml-auto text-[10px] font-body tracking-wider uppercase text-destructive">Sold out</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
