import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import heroImage from '@/assets/hero-main.jpg';
import catTshirts from '@/assets/category-tshirts.jpg';
import catJubba from '@/assets/category-jubba.jpg';
import catPanjabi from '@/assets/category-panjabi.jpg';
import catAttar from '@/assets/category-attar.jpg';
import ProductCard from '@/components/ProductCard';
import { useCatalog, useHeroBanners } from '@/hooks/useCatalog';
import { resolveImage } from '@/lib/imageAssets';

const homeCategories = [
  { name: 'T-Shirts', slug: '/tshirts', image: catTshirts, desc: 'Premium casual wear for the modern man' },
  { name: 'Jubba / Thobe', slug: '/jubba', image: catJubba, desc: 'Elegant traditional garments' },
  { name: 'Panjabi', slug: '/panjabi', image: catPanjabi, desc: 'Refined ethnic fashion' },
  { name: 'Attar', slug: '/attar', image: catAttar, desc: 'Luxury natural fragrances' },
];

const fallbackHero = {
  image: heroImage,
  subtitle: 'Premium Islamic Fashion & Attar',
  title: 'Elegance Meets Tradition',
  highlight: '',
  desc: 'Discover our curated collection of premium menswear and luxury fragrances, crafted for the modern man.',
  cta: { label: 'Shop Now', href: '/jubba' },
};


const Index = () => {
  const { data: catalog = [] } = useCatalog();
  const { data: heroBanners = [] } = useHeroBanners();
  const featured = catalog.filter((p) => p.badge === 'Best Seller').slice(0, 8);
  const eidProducts = catalog.filter((p) => p.category === 'eid');

  const heroSlides = heroBanners.length
    ? heroBanners.map((b) => ({
        image: resolveImage(b.image_url),
        subtitle: b.eyebrow || '',
        title: b.title,
        highlight: '',
        desc: b.subtitle || '',
        cta: { label: b.cta_label || 'Shop Now', href: b.cta_href || '/' },
      }))
    : [fallbackHero];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <main>
      {/* Hero Slider */}
      <section className="relative h-[80vh] lg:h-[90vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={heroSlides[currentSlide].image}
              alt="Delilar luxury Islamic fashion"
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-primary/30" />
          </motion.div>
        </AnimatePresence>

        <div className="relative container mx-auto px-4 lg:px-8 h-full flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-xl"
            >
              <p className="text-accent text-xs font-body tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-accent" />
                {heroSlides[currentSlide].subtitle}
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-primary-foreground leading-tight mb-6">
                {heroSlides[currentSlide].title} <br />
                <span className="text-accent italic">{heroSlides[currentSlide].highlight}</span>
              </h2>
              <p className="text-primary-foreground/60 font-body text-sm md:text-base leading-relaxed mb-8 max-w-md">
                {heroSlides[currentSlide].desc}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to={heroSlides[currentSlide].cta.href}
                  className="bg-accent text-foreground px-8 py-4 text-sm font-body tracking-widest uppercase inline-flex items-center gap-2 font-semibold rounded-xl hover:shadow-[0_0_30px_hsl(43_72%_52%/0.5)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  {heroSlides[currentSlide].cta.label} <ArrowRight size={16} />
                </Link>
                <Link
                  to="/about"
                  className="border border-primary-foreground/30 text-primary-foreground px-8 py-4 text-sm font-body tracking-widest uppercase hover:bg-primary-foreground/10 transition-all duration-300 rounded-xl"
                >
                  Our Story
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Controls */}
          <div className="absolute bottom-8 right-4 lg:right-8 flex items-center gap-3">
            <button
              onClick={prevSlide}
              className="w-11 h-11 rounded-full bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/15 flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-foreground hover:border-accent transition-all duration-300"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-8 bg-accent' : 'w-4 bg-primary-foreground/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="w-11 h-11 rounded-full bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/15 flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-foreground hover:border-accent transition-all duration-300"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-primary py-4">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { icon: Truck, label: 'Free Shipping 5,000+' },
            { icon: Shield, label: '100% Authentic' },
            { icon: RotateCcw, label: 'Easy Returns' },
            { icon: Star, label: 'Top Rated' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-primary-foreground/80">
              <Icon size={16} className="text-accent" />
              <span className="text-[10px] font-body tracking-wider uppercase">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Eid Collection */}
      {eidProducts.length > 0 && (
        <section className="bg-primary/5 py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-3 flex items-center justify-center gap-3">
                <Sparkles size={14} className="text-accent" /> Eid Collection 2026 <Sparkles size={14} className="text-accent" />
              </p>
              <h2 className="text-3xl lg:text-5xl font-heading font-bold">Celebrate in Style</h2>
              <p className="text-sm text-muted-foreground font-body mt-3 max-w-lg mx-auto">
                Exclusive Eid outfits and gift sets designed for the festive season.
              </p>
            </motion.div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {eidProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/eid"
                className="bg-primary text-primary-foreground px-10 py-4 text-sm font-body tracking-widest uppercase inline-flex items-center gap-2 rounded-xl font-semibold hover:shadow-[0_0_30px_hsl(345_65%_18%/0.4)] hover:-translate-y-0.5 transition-all duration-300"
              >
                View Eid Collection <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-accent" /> Collections <span className="w-8 h-px bg-accent" />
          </p>
          <h2 className="text-3xl lg:text-5xl font-heading font-bold">Shop by Category</h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {homeCategories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <Link to={cat.slug} className="group block relative aspect-[3/4] overflow-hidden rounded-2xl shadow-premium transition-all duration-500 hover:shadow-premium-lg">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  width={800}
                  height={1024}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent/40 rounded-2xl transition-all duration-500 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                  <h3 className="text-lg lg:text-xl font-heading font-bold text-primary-foreground">{cat.name}</h3>
                  <p className="text-xs text-primary-foreground/60 font-body mt-1 hidden lg:block">{cat.desc}</p>
                  <span className="text-xs font-body text-accent tracking-wider uppercase flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">
                    Explore <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary/50 py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-3 flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-accent" /> Curated <span className="w-8 h-px bg-accent" />
            </p>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold">Best Sellers</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/tshirts"
              className="bg-primary text-primary-foreground px-10 py-4 text-sm font-body tracking-widest uppercase inline-flex items-center gap-2 rounded-xl font-semibold hover:shadow-[0_0_30px_hsl(345_65%_18%/0.4)] hover:-translate-y-0.5 transition-all duration-300"
            >
              View All Products <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-accent blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-accent blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-3 flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-accent" /> Limited Collection <span className="w-8 h-px bg-accent" />
            </p>
            <h2 className="text-3xl lg:text-6xl font-heading font-bold text-primary-foreground mb-4">
              Discover the Art of <span className="italic text-accent">Fragrance</span>
            </h2>
            <p className="text-primary-foreground/50 font-body text-sm max-w-lg mx-auto mb-10">
              Our exclusive attar collection is crafted from the finest natural ingredients, offering scents that last all day.
            </p>
            <Link
              to="/attar"
              className="bg-accent text-foreground px-12 py-4 text-sm font-body tracking-widest uppercase inline-flex items-center gap-2 font-semibold rounded-xl hover:shadow-[0_0_30px_hsl(43_72%_52%/0.5)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Explore Attar <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Index;
