import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import heroImage from '@/assets/hero-main.jpg';
import catTshirts from '@/assets/category-tshirts.jpg';
import catJubba from '@/assets/category-jubba.jpg';
import catPanjabi from '@/assets/category-panjabi.jpg';
import catAttar from '@/assets/category-attar.jpg';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProducts } from '@/data/products';

const categories = [
  { name: 'T-Shirts', slug: '/tshirts', image: catTshirts },
  { name: 'Jubba / Thobe', slug: '/jubba', image: catJubba },
  { name: 'Panjabi', slug: '/panjabi', image: catPanjabi },
  { name: 'Attar', slug: '/attar', image: catAttar },
];

const testimonials = [
  { name: 'Ahmed R.', text: 'The quality of the Jubba is exceptional. Truly premium fabric and beautiful craftsmanship.', rating: 5 },
  { name: 'Farhan K.', text: 'Delilar attar collection is unmatched. The Oud Al Majestic is now my signature scent.', rating: 5 },
  { name: 'Ibrahim S.', text: 'Fast delivery and the Panjabi fit perfectly. Will definitely order again!', rating: 4 },
];

const Index = () => {
  const featured = getFeaturedProducts();

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[85vh] lg:h-[90vh] overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Delilar luxury Islamic fashion" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <p className="text-gold text-xs font-body tracking-[0.3em] uppercase mb-4">Premium Islamic Fashion & Attar</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold text-primary-foreground leading-tight mb-6">
              Elegance Meets <br />
              <span className="text-gold">Tradition</span>
            </h1>
            <p className="text-primary-foreground/70 font-body text-sm md:text-base leading-relaxed mb-8 max-w-md">
              Discover our curated collection of premium menswear and luxury fragrances, crafted for the modern man.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/tshirts"
                className="bg-gold text-accent-foreground px-8 py-3.5 text-sm font-body tracking-widest uppercase hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                to="/about"
                className="border border-primary-foreground/30 text-primary-foreground px-8 py-3.5 text-sm font-body tracking-widest uppercase hover:bg-primary-foreground/10 transition-colors"
              >
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-secondary py-6 border-b border-border">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { icon: Truck, label: 'Free Shipping 5,000+' },
            { icon: Shield, label: '100% Authentic' },
            { icon: RotateCcw, label: 'Easy Returns' },
            { icon: Star, label: 'Top Rated' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-muted-foreground">
              <Icon size={18} />
              <span className="text-xs font-body tracking-wider uppercase">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-2">Collections</p>
          <h2 className="text-3xl lg:text-4xl font-heading font-semibold">Shop by Category</h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={cat.slug} className="group block relative aspect-[3/4] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width={800}
                  height={1024}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                  <h3 className="text-lg lg:text-xl font-heading font-semibold text-primary-foreground">{cat.name}</h3>
                  <span className="text-xs font-body text-primary-foreground/70 tracking-wider uppercase flex items-center gap-1 mt-1 group-hover:text-gold transition-colors">
                    Explore <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-2">Curated</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-semibold">Best Sellers</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/tshirts"
              className="inline-flex items-center gap-2 text-sm font-body tracking-widest uppercase text-foreground hover:text-accent transition-colors border-b border-foreground hover:border-accent pb-1"
            >
              View All Products <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-2">Testimonials</p>
          <h2 className="text-3xl lg:text-4xl font-heading font-semibold">What Our Customers Say</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-secondary p-6 lg:p-8"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className={j < t.rating ? 'fill-accent text-accent' : 'text-border'} />
                ))}
              </div>
              <p className="text-sm font-body text-foreground/80 leading-relaxed mb-4">"{t.text}"</p>
              <p className="text-xs font-body tracking-wider uppercase text-muted-foreground">— {t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="gradient-dark py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-body tracking-[0.3em] uppercase text-gold mb-3">Limited Collection</p>
            <h2 className="text-3xl lg:text-5xl font-heading font-semibold text-primary-foreground mb-4">
              Discover the Art of Fragrance
            </h2>
            <p className="text-primary-foreground/60 font-body text-sm max-w-lg mx-auto mb-8">
              Our exclusive attar collection is crafted from the finest natural ingredients, offering scents that last all day.
            </p>
            <Link
              to="/attar"
              className="inline-flex items-center gap-2 bg-gold text-accent-foreground px-10 py-4 text-sm font-body tracking-widest uppercase hover:opacity-90 transition-opacity"
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
