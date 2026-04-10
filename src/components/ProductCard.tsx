import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] bg-secondary overflow-hidden rounded-2xl shadow-premium group-hover:shadow-premium-lg transition-all duration-500">
          {/* Placeholder gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-secondary" />

          {product.badge && (
            <span className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-[10px] font-body tracking-wider uppercase px-3 py-1.5 rounded-lg">
              {product.badge}
            </span>
          )}
          {product.originalPrice && (
            <span className="absolute top-3 right-3 z-10 bg-destructive text-destructive-foreground text-[10px] font-body px-2.5 py-1.5 rounded-lg font-semibold">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-all duration-500 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem(product);
              }}
              className="bg-background/95 backdrop-blur-sm text-foreground p-3 rounded-xl hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-premium"
              title="Add to Cart"
            >
              <ShoppingBag size={18} />
            </button>
            <span className="bg-background/95 backdrop-blur-sm text-foreground p-3 rounded-xl shadow-premium">
              <Eye size={18} />
            </span>
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-3 right-3 z-10 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 backdrop-blur-sm hover:bg-background hover:text-destructive shadow-sm"
            style={product.originalPrice ? { top: '3rem' } : undefined}
          >
            <Heart size={16} />
          </button>

          {/* Gold border glow on hover */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-accent/30 transition-all duration-500 pointer-events-none" />
        </div>
      </Link>
      <div className="mt-4 px-1">
        <div className="flex items-center gap-1 mb-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-border'}
            />
          ))}
          <span className="text-[10px] text-muted-foreground font-body ml-1">({product.reviews})</span>
        </div>
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
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
