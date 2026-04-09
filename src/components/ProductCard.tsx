import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] bg-secondary overflow-hidden mb-3">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/5" />
          {product.badge && (
            <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-body tracking-wider uppercase px-2.5 py-1">
              {product.badge}
            </span>
          )}
          {product.originalPrice && (
            <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-[10px] font-body px-2 py-1">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem(product);
              }}
              className="bg-background text-foreground px-6 py-2.5 text-xs font-body tracking-wider uppercase flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ShoppingBag size={14} />
              Add to Cart
            </button>
          </div>
          {/* Wishlist */}
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
            style={product.originalPrice ? { top: '2.5rem' } : undefined}
          >
            <Heart size={16} />
          </button>
        </div>
      </Link>
      <div>
        <div className="flex items-center gap-1 mb-1">
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
          <h3 className="text-sm font-body font-medium text-foreground hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-heading font-semibold">৳{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">৳{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
