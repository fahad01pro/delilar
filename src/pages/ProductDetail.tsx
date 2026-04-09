import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProductsByCategory } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Star, Minus, Plus, ArrowLeft, Truck, RotateCcw, Shield } from 'lucide-react';
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
        <Link to="/" className="text-accent text-sm font-body mt-4 inline-block">Back to Home</Link>
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
        <span>/</span>
        <Link to={`/${product.category}`} className="hover:text-foreground transition-colors capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Image */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-square bg-secondary" />

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          {product.badge && (
            <span className="text-[10px] font-body tracking-widest uppercase bg-accent text-accent-foreground px-2.5 py-1 mb-3 inline-block">
              {product.badge}
            </span>
          )}
          <h1 className="text-2xl lg:text-3xl font-heading font-semibold mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-border'} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-body">({product.reviews} reviews)</span>
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-heading font-bold">৳{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through font-body">৳{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <p className="text-sm font-body text-muted-foreground leading-relaxed mb-6">{product.description}</p>

          {/* Size */}
          {product.sizes && (
            <div className="mb-6">
              <p className="text-xs font-body tracking-widest uppercase mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] h-10 px-3 border text-sm font-body transition-colors ${
                      selectedSize === size ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-accent'
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
              <p className="text-xs font-body tracking-widest uppercase mb-3">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 h-10 border text-sm font-body transition-colors ${
                      selectedColor === color ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-accent'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-xs font-body tracking-widest uppercase mb-3">Quantity</p>
            <div className="flex items-center border border-border w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors">
                <Minus size={14} />
              </button>
              <span className="w-12 text-center text-sm font-body">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-primary-foreground py-3.5 text-sm font-body tracking-widest uppercase hover:opacity-90 transition-opacity"
            >
              Add to Cart
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-accent text-accent-foreground py-3.5 text-sm font-body tracking-widest uppercase hover:opacity-90 transition-opacity"
            >
              Buy Now
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
                <Icon size={16} /> {text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16 lg:mt-24">
          <h2 className="text-2xl font-heading font-semibold text-center mb-8">You May Also Like</h2>
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
