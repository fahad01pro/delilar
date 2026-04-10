import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProductsByCategory } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Star, Minus, Plus, Truck, RotateCcw, Shield, Heart, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || '');
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-body text-muted-foreground">Product not found</p>
        <Link to="/" className="text-primary text-sm font-body mt-4 inline-block hover:text-accent transition-colors">Back to Home</Link>
      </div>
    );
  }

  const related = getProductsByCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize || undefined, selectedColor || undefined);
  };

  return (
    <main className="container mx-auto px-4 lg:px-8 py-6 lg:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-body text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span className="text-accent">/</span>
        <Link to={`/${product.category}`} className="hover:text-foreground transition-colors capitalize">{product.category}</Link>
        <span className="text-accent">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-square bg-secondary rounded-2xl overflow-hidden shadow-premium-lg relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-secondary" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-foreground/5 cursor-zoom-in" />
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          {product.badge && (
            <span className="text-[10px] font-body tracking-widest uppercase bg-primary text-primary-foreground px-3 py-1.5 mb-4 inline-block rounded-lg">
              {product.badge}
            </span>
          )}
          <h1 className="text-2xl lg:text-4xl font-heading font-bold mb-3">{product.name}</h1>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-border'} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-body">({product.reviews} reviews)</span>
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-heading font-bold text-primary">৳{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through font-body">৳{product.originalPrice.toLocaleString()}</span>
            )}
            {product.originalPrice && (
              <span className="text-xs font-body bg-destructive/10 text-destructive px-2.5 py-1 rounded-lg font-semibold">
                Save ৳{(product.originalPrice - product.price).toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-sm font-body text-muted-foreground leading-relaxed mb-8">{product.description}</p>

          {/* Size */}
          {product.sizes && (
            <div className="mb-6">
              <p className="text-xs font-body tracking-widest uppercase mb-3 font-medium">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-11 px-4 rounded-xl text-sm font-body transition-all duration-300 ${
                      selectedSize === size
                        ? 'bg-primary text-primary-foreground shadow-premium'
                        : 'border border-border hover:border-accent hover:bg-secondary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {product.colors && (
            <div className="mb-6">
              <p className="text-xs font-body tracking-widest uppercase mb-3 font-medium">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-5 h-11 rounded-xl text-sm font-body transition-all duration-300 ${
                      selectedColor === color
                        ? 'bg-primary text-primary-foreground shadow-premium'
                        : 'border border-border hover:border-accent hover:bg-secondary'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <p className="text-xs font-body tracking-widest uppercase mb-3 font-medium">Quantity</p>
            <div className="flex items-center rounded-xl border border-border w-fit overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors">
                <Minus size={16} />
              </button>
              <span className="w-14 text-center text-sm font-body font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 btn-primary py-4 text-sm font-body tracking-widest uppercase font-semibold"
            >
              Add to Cart
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 btn-gold py-4 text-sm font-body tracking-widest uppercase font-semibold"
            >
              Buy Now
            </button>
          </div>
          <div className="flex gap-2 mb-8">
            <button className="flex items-center gap-2 px-4 py-2.5 text-xs font-body text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-secondary transition-all">
              <Heart size={14} /> Wishlist
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 text-xs font-body text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-secondary transition-all">
              <Share2 size={14} /> Share
            </button>
          </div>

          {/* Trust */}
          <div className="space-y-3 border-t border-border pt-6">
            {[
              { icon: Truck, text: 'Free shipping on orders over ৳5,000' },
              { icon: RotateCcw, text: '7-day easy return policy' },
              { icon: Shield, text: '100% authentic products guaranteed' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon size={14} className="text-accent" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16 lg:mt-28">
          <h2 className="text-2xl lg:text-3xl font-heading font-bold text-center mb-10">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetail;
