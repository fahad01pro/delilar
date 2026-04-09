import { motion } from 'framer-motion';

const About = () => (
  <main>
    <section className="gradient-dark py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-body tracking-[0.3em] uppercase text-gold mb-3">Our Story</p>
          <h1 className="text-4xl lg:text-5xl font-heading font-semibold text-primary-foreground mb-6">About Delilar</h1>
          <p className="text-primary-foreground/60 font-body text-sm max-w-2xl mx-auto leading-relaxed">
            Redefining Islamic fashion with a blend of tradition, modernity, and uncompromising quality.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-heading font-semibold mb-4">The Vision</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Delilar was born from a passion to elevate Islamic menswear to the standards of global luxury fashion. We believe that tradition and modernity can coexist beautifully — and that every man deserves clothing that reflects both his values and his style.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-heading font-semibold mb-4">Craftsmanship</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Every piece in our collection is crafted with meticulous attention to detail. From the selection of premium fabrics to hand-finished embroidery, we ensure that each garment meets the highest standards of quality and comfort.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-heading font-semibold mb-4">Fragrance Collection</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Our attar collection represents centuries of perfumery tradition. Each fragrance is composed of the finest natural oils, creating scents that are both timeless and contemporary. We source our ingredients from trusted artisans across the Middle East and South Asia.
          </p>
        </motion.div>
      </div>
    </section>
  </main>
);

export default About;
