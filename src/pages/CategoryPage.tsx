import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getProductsByCategory, categories } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'framer-motion';

const priceRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under ৳2,000', min: 0, max: 2000 },
  { label: '৳2,000 - ৳4,000', min: 2000, max: 4000 },
  { label: 'Over ৳4,000', min: 4000, max: Infinity },
];

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [priceFilter, setPriceFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const cat = categories.find((c) => c.slug === category);
  const products = getProductsByCategory(category as any);

  const filtered = useMemo(() => {
    const range = priceRanges[priceFilter];
    return products.filter((p) => p.price >= range.min && p.price < range.max);
  }, [products, priceFilter]);

  if (!cat) return <div className="container mx-auto px-4 py-20 text-center">Category not found</div>;

  return (
    <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-2">Collection</p>
        <h1 className="text-3xl lg:text-4xl font-heading font-semibold">{cat.name}</h1>
        <p className="text-sm text-muted-foreground font-body mt-2">{cat.description}</p>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-sm text-muted-foreground font-body">{filtered.length} products</p>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-body tracking-wider uppercase text-foreground hover:text-accent transition-colors"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      {showFilters && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-8 p-4 bg-secondary overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-body tracking-widest uppercase">Price Range</h3>
            <button onClick={() => setShowFilters(false)}><X size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {priceRanges.map((range, i) => (
              <button
                key={i}
                onClick={() => setPriceFilter(i)}
                className={`px-4 py-2 text-xs font-body tracking-wider border transition-colors ${
                  priceFilter === i ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-accent'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground font-body">No products match the selected filters.</p>
        </div>
      )}
    </main>
  );
};

export default CategoryPage;
