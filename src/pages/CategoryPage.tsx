import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { categories, type Product } from '@/data/products';
import { useProductsByCategory, useCategoryBanner } from '@/hooks/useCatalog';
import { resolveImage } from '@/lib/imageAssets';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const priceRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under ৳2,000', min: 0, max: 2000 },
  { label: '৳2,000 - ৳4,000', min: 2000, max: 4000 },
  { label: 'Over ৳4,000', min: 4000, max: Infinity },
];

const CategoryBanner = ({ products, categoryName, bannerImage }: { products: Product[]; categoryName: string; bannerImage?: string }) => {
  const [current, setCurrent] = useState(0);
  const bannerProducts = products.slice(0, 4);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % bannerProducts.length);
  }, [bannerProducts.length]);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  if (bannerProducts.length === 0) return null;
  const active = bannerProducts[current] ?? bannerProducts[0];

  return (
    <div className="relative h-[260px] lg:h-[340px] rounded-2xl overflow-hidden mb-10 shadow-premium-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {bannerImage ? (
            <>
              <img src={bannerImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-primary/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-primary" />
          )}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 lg:px-10 flex items-center justify-between">
              <div className="max-w-md">
                <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-2">{categoryName}</p>
                <h2 className="text-2xl lg:text-4xl font-heading font-bold text-primary-foreground mb-2">
                  {bannerProducts[current].name}
                </h2>
                <p className="text-primary-foreground/60 text-sm font-body line-clamp-2 mb-4">
                  {bannerProducts[current].description}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-heading font-bold text-accent">
                    ৳{bannerProducts[current].price.toLocaleString()}
                  </span>
                  <Link
                    to={`/product/${bannerProducts[current].id}`}
                    className="bg-accent text-foreground px-6 py-2.5 text-xs font-body tracking-widest uppercase font-semibold rounded-xl hover:shadow-[0_0_20px_hsl(43_72%_52%/0.4)] transition-all duration-300"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block w-48 h-48 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setCurrent((p) => (p - 1 + bannerProducts.length) % bannerProducts.length)}
          className="w-9 h-9 rounded-full bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/15 flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-foreground transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex gap-1.5">
          {bannerProducts.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-accent' : 'w-3 bg-primary-foreground/30'}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="w-9 h-9 rounded-full bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/15 flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-foreground transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const [priceFilter, setPriceFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const subFilter = searchParams.get('sub');
  const cat = categories.find((c) => c.slug === category);
  const { data: allProducts = [] } = useProductsByCategory(category);
  const { data: banner } = useCategoryBanner(category);
  const filtered = useMemo(() => {
    const range = priceRanges[priceFilter];
    let result = allProducts.filter((p) => p.price >= range.min && p.price < range.max);
    if (subFilter) {
      result = result.filter((p) => p.subcategory === subFilter);
    }
    return result;
  }, [allProducts, priceFilter, subFilter]);

  if (!cat) return <div className="container mx-auto px-4 py-20 text-center font-body">Category not found</div>;

  return (
    <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      {/* Dynamic Banner */}
      <CategoryBanner products={allProducts} categoryName={cat.name} bannerImage={banner ? resolveImage(banner.image_url) : undefined} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-2 flex items-center justify-center gap-3">
          <span className="w-6 h-px bg-accent" /> Collection <span className="w-6 h-px bg-accent" />
        </p>
        <h1 className="text-3xl lg:text-4xl font-heading font-bold">{cat.name}</h1>
        <p className="text-sm text-muted-foreground font-body mt-2">{cat.description}</p>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-sm text-muted-foreground font-body">{filtered.length} products</p>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-body tracking-wider uppercase text-foreground hover:text-primary transition-colors px-4 py-2 rounded-xl hover:bg-primary/5"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-8 p-5 glass rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-body tracking-widest uppercase font-medium">Price Range</h3>
              <button onClick={() => setShowFilters(false)} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range, i) => (
                <button
                  key={i}
                  onClick={() => setPriceFilter(i)}
                  className={`px-5 py-2.5 text-xs font-body tracking-wider rounded-xl border transition-all duration-300 ${
                    priceFilter === i
                      ? 'bg-primary text-primary-foreground border-primary shadow-premium'
                      : 'border-border hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
