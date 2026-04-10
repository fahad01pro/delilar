import { motion } from 'framer-motion';

const About = () => (
  <main>
    <section className="gradient-burgundy py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-60 h-60 rounded-full bg-accent blur-[120px]" />
      </div>
      <div className="container mx-auto px-4 lg:px-8 text-center relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-accent" /> Our Story <span className="w-8 h-px bg-accent" />
          </p>
          <h1 className="text-4xl lg:text-6xl font-heading font-bold text-primary-foreground mb-6">About Delilar</h1>
          <p className="text-primary-foreground/50 font-body text-sm max-w-2xl mx-auto leading-relaxed">
            Redefining Islamic fashion with a blend of tradition, modernity, and uncompromising quality.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-28">
      <div className="max-w-3xl mx-auto space-y-12">
        {[
          { title: 'The Vision', text: 'Delilar was born from a passion to elevate Islamic menswear to the standards of global luxury fashion. We believe that tradition and modernity can coexist beautifully — and that every man deserves clothing that reflects both his values and his style.' },
          { title: 'Craftsmanship', text: 'Every piece in our collection is crafted with meticulous attention to detail. From the selection of premium fabrics to hand-finished embroidery, we ensure that each garment meets the highest standards of quality and comfort.' },
          { title: 'Fragrance Collection', text: 'Our attar collection represents centuries of perfumery tradition. Each fragrance is composed of the finest natural oils, creating scents that are both timeless and contemporary. We source our ingredients from trusted artisans across the Middle East and South Asia.' },
        ].map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8 lg:p-10 shadow-premium hover:shadow-premium-lg transition-all duration-300"
          >
            <h2 className="text-2xl lg:text-3xl font-heading font-bold mb-4">{section.title}</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{section.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  </main>
);

export default About;
