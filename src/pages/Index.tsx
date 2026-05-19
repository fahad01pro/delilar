import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Droplets,
  MapPin,
  Phone,
} from 'lucide-react';
import heroImage from '@/assets/hero-main.jpg';
import catTshirts from '@/assets/category-tshirts.jpg';
import catJubba from '@/assets/category-jubba.jpg';
import catPanjabi from '@/assets/category-panjabi.jpg';
import catAttar from '@/assets/category-attar.jpg';
import catPerfume from '@/assets/category-perfume.jpg';
import ProductCard from '@/components/ProductCard';
import {
  useCatalog,
  useHeroBanners,
  useOutlets,
  selectNewArrivals,
  selectBestSellers,
} from '@/hooks/useCatalog';
import { resolveImage } from '@/lib/imageAssets';

const homeCategories = [
  { name: 'Jubba / Thobe', slug: '/jubba', image: catJubba, desc: 'Elegant traditional garments' },
  { name: 'Panjabi', slug: '/panjabi', image: catPanjabi, desc: 'Refined ethnic fashion' },
  { name: 'T-Shirts', slug: '/tshirts', image: catTshirts, desc: 'Premium casual essentials' },
  { name: 'Attar & Perfume', slug: '/attar', image: catAttar, desc: 'Luxury natural fragrances' },
];

const fallbackHero = {
  image: heroImage,
  subtitle: 'Premium Islamic Fashion & Lifestyle',
  title: 'Elegance Meets Tradition',
  highlight: '',
  desc: 'Discover our curated collection of premium menswear and luxury fragrances, crafted for the modern man.',
  cta: { label: 'Shop Now', href: '/jubba' },
};

/* ─────────────────────────────────────────────
   Reusable section header
   ───────────────────────────────────────────── */
const SectionHeader = ({
  eyebrow,
  title,
  desc,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  align?: 'center' | 'left';
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`mb-10 lg:mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}
  >
    <p
      className={`text-[10px] lg:text-xs font-body tracking-[0.35em] uppercase text-accent mb-3 flex items-center gap-3 ${
        align === 'center' ? 'justify-center' : ''
      }`}
    >
      <span className="w-8 h-px bg-accent" /> {eyebrow} <span className="w-8 h-px bg-accent" />
    </p>
    <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold tracking-tight">{title}</h2>
    {desc && (
      <p className={`text-sm text-muted-foreground font-body mt-3 max-w-xl ${align === 'center' ? 'mx-auto' : ''}`}>
        {desc}
      </p>
    )}
  </motion.div>
);

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */
const Index = () => {
  const { data: catalog = [] } = useCatalog();
  const { data: heroBanners = [] } = useHeroBanners();
  const { data: outlets = [] } = useOutlets();

  const newArrivals = useMemo(() => selectNewArrivals(catalog, 8), [catalog]);
  const bestSellers = useMemo(() => selectBestSellers(catalog, 8), [catalog]);
  const fragrance = useMemo(
    () =>
      catalog
        .filter(
          (p) => p.productType === 'perfume' || p.category === 'attar' || p.category === 'perfume',
        )
        .slice(0, 8),
    [catalog],
  );
  const otherFashion = useMemo(
    () =>
      catalog
        .filter(
          (p) =>
            p.productType !== 'perfume' &&
            !['attar', 'perfume'].includes(p.category) &&
            !newArrivals.includes(p) &&
            !bestSellers.includes(p),
        )
        .slice(0, 8),
    [catalog, newArrivals, bestSellers],
  );

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
  const nextSlide = useCallback(
    () => setCurrentSlide((p) => (p + 1) % heroSlides.length),
    [heroSlides.length],
  );
  const prevSlide = () =>
    setCurrentSlide((p) => (p - 1 + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    const t = setInterval(nextSlide, 5000);
    return () => clearInterval(t);
  }, [nextSlide]);

  const primaryOutlets = outlets.slice(0, 3);

  return (
    <main>
      {/* ─── Hero Slider ─── */}
      <section className="relative h-[78vh] lg:h-[88vh] overflow-hidden">
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
              transition={{ duration: 0.6, delay: 0.15 }}
              className="max-w-xl"
            >
              <p className="text-accent text-[11px] font-body tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-accent" />
                {heroSlides[currentSlide].subtitle}
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-[1.05] mb-6">
                {heroSlides[currentSlide].title}
                {heroSlides[currentSlide].highlight && (
                  <>
                    <br />
                    <span className="text-accent italic">{heroSlides[currentSlide].highlight}</span>
                  </>
                )}
              </h2>
              <p className="text-primary-foreground/70 font-body text-sm md:text-base leading-relaxed mb-8 max-w-md">
                {heroSlides[currentSlide].desc}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to={heroSlides[currentSlide].cta.href}
                  className="bg-accent text-foreground px-8 py-3.5 text-xs font-body tracking-[0.25em] uppercase inline-flex items-center gap-2 font-semibold rounded-xl hover:shadow-[0_0_30px_hsl(43_72%_52%/0.5)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  {heroSlides[currentSlide].cta.label} <ArrowRight size={14} />
                </Link>
                <Link
                  to="/about"
                  className="border border-primary-foreground/30 text-primary-foreground px-8 py-3.5 text-xs font-body tracking-[0.25em] uppercase hover:bg-primary-foreground/10 transition-all duration-300 rounded-xl"
                >
                  Our Story
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-8 right-4 lg:right-8 flex items-center gap-3">
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="w-11 h-11 rounded-full bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/15 flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-foreground hover:border-accent transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-8 bg-accent' : 'w-4 bg-primary-foreground/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="w-11 h-11 rounded-full bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/15 flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-foreground hover:border-accent transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="bg-primary py-4">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-14">
          {[
            { icon: Truck, label: 'Free Shipping ৳5,000+' },
            { icon: Shield, label: '100% Authentic' },
            { icon: RotateCcw, label: 'Easy Returns' },
            { icon: Sparkles, label: 'Premium Crafted' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-primary-foreground/80">
              <Icon size={14} className="text-accent" />
              <span className="text-[10px] font-body tracking-[0.2em] uppercase">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Featured Categories ─── */}
      <section className="container mx-auto px-4 lg:px-8 py-14 lg:py-20">
        <SectionHeader eyebrow="Collections" title="Shop by Category" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {homeCategories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link
                to={cat.slug}
                className="group block relative aspect-[3/4] overflow-hidden rounded-2xl shadow-premium transition-all duration-500 hover:shadow-premium-lg"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  width={800}
                  height={1024}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent/40 rounded-2xl transition-all duration-500 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-lg lg:text-xl font-heading font-bold text-primary-foreground">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-primary-foreground/70 font-body mt-1 hidden lg:block">
                    {cat.desc}
                  </p>
                  <span className="text-[10px] font-body text-accent tracking-[0.25em] uppercase flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">
                    Explore <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── New Arrivals (auto, 120-day window) ─── */}
      {newArrivals.length > 0 && (
        <section className="bg-secondary/40 py-14 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-end justify-between mb-10 lg:mb-12 gap-4 flex-wrap">
              <div>
                <p className="text-[10px] lg:text-xs font-body tracking-[0.35em] uppercase text-accent mb-3 flex items-center gap-2">
                  <Sparkles size={12} /> Just In
                </p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold">
                  New Arrivals
                </h2>
                <p className="text-sm text-muted-foreground font-body mt-2 max-w-md">
                  Fresh releases from the latest Delilar drops — added in the last 120 days.
                </p>
              </div>
              <Link
                to="/jubba"
                className="hidden md:inline-flex items-center gap-2 text-xs font-body tracking-[0.25em] uppercase text-foreground hover:text-accent transition-colors"
              >
                Shop All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {newArrivals.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Best Sellers (auto by sold_count, pinned via is_featured) ─── */}
      {bestSellers.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-end justify-between mb-10 lg:mb-12 gap-4 flex-wrap">
              <div>
                <p className="text-[10px] lg:text-xs font-body tracking-[0.35em] uppercase text-accent mb-3 flex items-center gap-2">
                  <Flame size={12} /> Most Loved
                </p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold">
                  Best Selling Products
                </h2>
                <p className="text-sm text-muted-foreground font-body mt-2 max-w-md">
                  The pieces our customers reach for again and again.
                </p>
              </div>
              <Link
                to="/tshirts"
                className="hidden md:inline-flex items-center gap-2 text-xs font-body tracking-[0.25em] uppercase text-foreground hover:text-accent transition-colors"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {bestSellers.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Perfume & Attar Featured ─── */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-primary">
        <div
          className="absolute inset-0 opacity-25"
          style={{ backgroundImage: `url(${catPerfume})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/80 to-primary" />
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-accent/30 blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-accent/20 blur-[140px]" />

        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="text-center mb-12 lg:mb-14">
            <p className="text-[10px] lg:text-xs font-body tracking-[0.35em] uppercase text-accent mb-3 flex items-center justify-center gap-3">
              <Droplets size={12} /> Fragrance Boutique <Droplets size={12} />
            </p>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-primary-foreground">
              Attar & Perfume <span className="italic text-accent">Collection</span>
            </h2>
            <p className="text-sm text-primary-foreground/70 font-body mt-3 max-w-xl mx-auto">
              Hand-blended oils, oud-rich attars, and signature perfumes — crafted for those who appreciate
              the art of scent.
            </p>
          </div>

          {fragrance.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {fragrance.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center text-primary-foreground/60 text-sm font-body py-10">
              Our fragrance collection arrives soon. Stay tuned.
            </div>
          )}

          <div className="text-center mt-10 lg:mt-12 flex flex-wrap justify-center gap-3">
            <Link
              to="/attar"
              className="bg-accent text-foreground px-8 py-3.5 text-xs font-body tracking-[0.25em] uppercase inline-flex items-center gap-2 font-semibold rounded-xl hover:shadow-[0_0_30px_hsl(43_72%_52%/0.5)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Explore Attar <ArrowRight size={14} />
            </Link>
            <Link
              to="/perfume"
              className="border border-primary-foreground/30 text-primary-foreground px-8 py-3.5 text-xs font-body tracking-[0.25em] uppercase inline-flex items-center gap-2 font-semibold rounded-xl hover:bg-primary-foreground/10 transition-all"
            >
              Shop Perfumes <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Other Fashion Collections ─── */}
      {otherFashion.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="More to Discover"
              title="Fashion Collections"
              desc="Explore curated styles across our complete menswear range."
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {otherFashion.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Brand Story / Lifestyle ─── */}
      <section className="bg-secondary/40 py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-premium-lg"
          >
            <img
              src={catJubba}
              alt="Delilar craftsmanship"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] lg:text-xs font-body tracking-[0.35em] uppercase text-accent mb-3">
              Our Story
            </p>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-5 leading-tight">
              Crafted with <span className="italic text-primary">intention</span>, worn with{' '}
              <span className="italic text-primary">honour</span>.
            </h2>
            <p className="text-sm lg:text-base text-muted-foreground font-body leading-relaxed mb-6">
              Delilar is a premium Islamic fashion and lifestyle brand built on the values of modesty,
              quality, and timeless elegance. Every piece — from our hand-stitched jubbas to our oud-rich
              attars — is curated for the man who walks with grace.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-xs font-body tracking-[0.25em] uppercase text-primary border-b border-primary pb-1 hover:gap-3 transition-all"
            >
              Read Our Journey <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Contact & Outlets ─── */}
      {primaryOutlets.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <SectionHeader
              eyebrow="Visit Us"
              title="Our Outlets"
              desc="Experience Delilar in person at our flagship stores across Bangladesh."
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {primaryOutlets.map((o, i) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-2xl p-5 lg:p-6 shadow-premium hover:shadow-premium-lg transition-all"
                >
                  <h3 className="font-heading text-lg font-bold mb-2">{o.name}</h3>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground font-body mb-2">
                    <MapPin size={14} className="text-accent mt-0.5 shrink-0" />
                    <span>
                      {o.address}
                      {o.city ? `, ${o.city}` : ''}
                    </span>
                  </div>
                  {o.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                      <Phone size={14} className="text-accent" />
                      <a href={`tel:${o.phone}`} className="hover:text-primary transition-colors">
                        {o.phone}
                      </a>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/contact"
                className="bg-primary text-primary-foreground px-10 py-3.5 text-xs font-body tracking-[0.25em] uppercase inline-flex items-center gap-2 rounded-xl font-semibold hover:shadow-[0_0_30px_hsl(345_65%_18%/0.4)] hover:-translate-y-0.5 transition-all"
              >
                Get in Touch <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default Index;
