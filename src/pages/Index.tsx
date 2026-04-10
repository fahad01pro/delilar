import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import heroImage from '@/assets/hero-main.jpg';
import catTshirts from '@/assets/category-tshirts.jpg';
import catJubba from '@/assets/category-jubba.jpg';
import catPanjabi from '@/assets/category-panjabi.jpg';
import catAttar from '@/assets/category-attar.jpg';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProducts, products } from '@/data/products';

const categories = [
  { name: 'T-Shirts', slug: '/tshirts', image: catTshirts, desc: 'Premium casual wear for the modern man' },
  { name: 'Jubba / Thobe', slug: '/jubba', image: catJubba, desc: 'Elegant traditional garments' },
  { name: 'Panjabi', slug: '/panjabi', image: catPanjabi, desc: 'Refined ethnic fashion' },
  { name: 'Attar', slug: '/attar', image: catAttar, desc: 'Luxury natural fragrances' },
];

const heroSlides = [
  {
    image: heroImage,
    subtitle: 'Premium Islamic Fashion & Attar',
    title: 'Elegance Meets',
    highlight: 'Tradition',
    desc: 'Discover our curated collection of premium menswear and luxury fragrances, crafted for the modern man.',
    cta: { label: 'Shop Now', href: '/tshirts' },
  },
  {
    image: catJubba,
    subtitle: 'New Arrivals',
    title: 'The Royal',
    highlight: 'Collection',
    desc: 'Exquisitely crafted Jubba & Thobe for every occasion. Premium fabrics, timeless design.',
    cta: { label: 'Explore Jubba', href: '/jubba' },
  },
  {
    image: catAttar,
    subtitle: 'Signature Scents',
    title: 'Art of',
    highlight: 'Fragrance',
    desc: 'Our exclusive attar collection is crafted from the finest natural ingredients.',
    cta: { label: 'Discover Attar', href: '/attar' },
  },
];

const testimonials = [
  { name: 'Ahmed R.', text: 'The quality of the Jubba is exceptional. Truly premium fabric and beautiful craftsmanship.', rating: 5 },
  { name: 'Farhan K.', text: 'Delilar attar collection is unmatched. The Oud Al Majestic is now my signature scent.', rating: 5 },
  { name: 'Ibrahim S.', text: 'Fast delivery and the Panjabi fit perfectly. Will definitely order again!', rating: 4 },
];

const Index = () => {
  const featured = getFeaturedProducts();
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
      <section className="relative h-[85vh] lg:h-[92vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
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
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-foreground/20" />
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
              <p className="text-gold text-xs font-body tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-accent" />
                {heroSlides[currentSlide].subtitle}
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-primary-foreground leading-tight mb-6">
                {heroSlides[currentSlide].title} <br />
                <span className="text-gold italic">{heroSlides[currentSlide].highlight}</span>
              </h2>
              <p className="text-primary-foreground/60 font-body text-sm md:text-base leading-relaxed mb-8 max-w-md">
                {heroSlides[currentSlide].desc}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to={heroSlides[currentSlide].cta.href}
                  className="btn-gold px-8 py-4 text-sm font-body tracking-widest uppercase inline-flex items-center gap-2 font-semibold"
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
              className="w-12 h-12 rounded-full glass-dark flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              <ChevronLeft size={20} />
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
              className="w-12 h-12 rounded-full glass-dark flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-primary py-5">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { icon: Truck, label: 'Free Shipping 5,000+' },
            { icon: Shield, label: '100% Authentic' },
            { icon: RotateCcw, label: 'Easy Returns' },
            { icon: Star, label: 'Top Rated' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-primary-foreground/80">
              <Icon size={18} className="text-accent" />
              <span className="text-xs font-body tracking-wider uppercase">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-accent" /> Collections <span className="w-8 h-px bg-accent" />
          </p>
          <h2 className="text-3xl lg:text-5xl font-heading font-bold">Shop by Category</h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <Link to={cat.slug} className="group block relative aspect-[3/4] overflow-hidden rounded-2xl shadow-premium glow-gold-hover transition-all duration-500">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  width={800}
                  height={1024}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
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
      <section className="bg-secondary/50 py-16 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
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
          <div className="text-center mt-12">
            <Link
              to="/tshirts"
              className="btn-primary px-10 py-4 text-sm font-body tracking-widest uppercase inline-flex items-center gap-2"
            >
              View All Products <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-accent" /> Testimonials <span className="w-8 h-px bg-accent" />
          </p>
          <h2 className="text-3xl lg:text-5xl font-heading font-bold">What Our Customers Say</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass p-6 lg:p-8 rounded-2xl shadow-premium hover:shadow-premium-lg transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className={j < t.rating ? 'fill-accent text-accent' : 'text-border'} />
                ))}
              </div>
              <p className="text-sm font-body text-foreground/80 leading-relaxed mb-4 italic">"{t.text}"</p>
              <p className="text-xs font-body tracking-wider uppercase text-muted-foreground font-medium">— {t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="gradient-dark py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-accent blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-accent blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-body tracking-[0.3em] uppercase text-gold mb-3 flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-accent" /> Limited Collection <span className="w-8 h-px bg-accent" />
            </p>
            <h2 className="text-3xl lg:text-6xl font-heading font-bold text-primary-foreground mb-4">
              Discover the Art of <span className="italic text-gold">Fragrance</span>
            </h2>
            <p className="text-primary-foreground/50 font-body text-sm max-w-lg mx-auto mb-10">
              Our exclusive attar collection is crafted from the finest natural ingredients, offering scents that last all day.
            </p>
            <Link
              to="/attar"
              className="btn-gold px-12 py-4 text-sm font-body tracking-widest uppercase inline-flex items-center gap-2 font-semibold"
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
