import { motion } from 'framer-motion';
import { Sparkles, Heart, Shield, Compass, Gem, HandHeart } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const Ornament = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`}>
    <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent/60" />
    <span className="text-accent text-xs tracking-[0.4em]">✦</span>
    <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent/60" />
  </div>
);

const values = [
  { icon: Sparkles, title: 'Inspired by Sunnah', text: 'Every thread, every scent, every detail flows from the timeless beauty of the Prophetic way ﷺ.' },
  { icon: Gem, title: 'Premium Craft', text: 'Refined fabrics, considered design, and a finish worthy of a lifestyle built on excellence.' },
  { icon: Shield, title: 'Honesty & Trust', text: 'Sunnah-inspired commerce — transparent pricing, ethical sourcing, and integrity in every order.' },
  { icon: Heart, title: 'Modesty & Elegance', text: 'Modern luxury that protects modesty and dignifies the one who wears it.' },
  { icon: HandHeart, title: 'Charity at the Core', text: '28% of every profit flows in the path of Allah, turning purchase into purpose.' },
  { icon: Compass, title: 'Mission & Vision', text: 'To become a global symbol of elegance, faith, and sincerity — a brand with a soul.' },
];

const About = () => (
  <main className="bg-background">
    {/* HERO */}
    <section className="relative overflow-hidden bg-gradient-to-b from-[hsl(var(--burgundy-dark))] via-[hsl(var(--burgundy))] to-[hsl(var(--charcoal))]">
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, hsl(var(--gold)) 0%, transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--gold)) 0%, transparent 45%)',
      }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 0l8 22h22l-18 13 7 22-19-14-19 14 7-22L0 22h22z' fill='%23D4AF37' fill-opacity='0.4'/%3E%3C/svg%3E")`,
      }} />

      <div className="container relative mx-auto px-4 lg:px-8 py-24 lg:py-40 text-center">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <Ornament className="mb-8" />
          <p className="text-[11px] font-body tracking-[0.5em] uppercase text-accent mb-6">Our Story</p>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-heading font-semibold text-primary-foreground leading-[1.05] mb-8">
            The House of <span className="italic text-accent">Delilar</span>
          </h1>
          <p className="text-primary-foreground/70 font-body text-base lg:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            A premium Islamic lifestyle, fashion, and fragrance brand —
            <span className="text-accent italic"> inspired by the Sunnah of Prophet Muhammad ﷺ.</span>
          </p>
          <Ornament />
          <p className="mt-10 text-primary-foreground/50 text-xs tracking-[0.4em] uppercase">Inspired by Sunnah</p>
        </motion.div>
      </div>
    </section>

    {/* BRAND STORY */}
    <section className="container mx-auto px-4 lg:px-8 py-24 lg:py-36">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeUp}
        className="max-w-3xl mx-auto text-center"
      >
        <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Brand Story</p>
        <h2 className="text-4xl lg:text-5xl font-heading font-semibold mb-8 leading-tight">
          More than a label — <br className="hidden sm:block" />
          <span className="italic text-burgundy">a way of living.</span>
        </h2>
        <div className="space-y-6 font-body text-base lg:text-lg text-muted-foreground leading-relaxed">
          <p>
            At Delilar, we believe that <span className="text-foreground">fashion, fragrance, cleanliness, elegance, and modesty</span> are all part of a refined Islamic lifestyle. Inspired by the beauty of Sunnah, we craft premium-quality products that blend modern luxury with timeless Islamic values.
          </p>
          <p>
            Delilar is <span className="text-foreground italic">not only a fragrance brand</span> — it is a complete premium lifestyle and fashion house focused on elegance, comfort, quality, and long-lasting experiences. Every product is designed with attention to detail, sophistication, and excellence — so you can wear both style and meaning.
          </p>
        </div>
      </motion.div>
    </section>

    {/* INSPIRED BY SUNNAH — feature band */}
    <section className="relative overflow-hidden bg-[hsl(var(--cream-dark))] py-24 lg:py-32">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Inspired by Sunnah</p>
            <h2 className="text-4xl lg:text-5xl font-heading font-semibold mb-6 leading-tight">
              The Prophetic way, <br />
              <span className="italic text-burgundy">reimagined for today.</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              Our tagline — <span className="text-foreground italic">"Inspired by Sunnah"</span> — reflects the heart of our vision, values, and identity. The Prophet ﷺ taught us that cleanliness, beautiful scent, dignified dress, and gentle character are all part of faith.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed">
              Delilar exists to make that beauty wearable — to dress the modern Muslim in pieces that feel rooted, refined, and reverent all at once.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-premium-lg"
          >
            <div className="absolute inset-0 gradient-burgundy" />
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M50 5l12 33h35l-28 21 11 34-30-22-30 22 11-34L3 38h35z' fill='%23D4AF37' fill-opacity='0.5'/%3E%3C/svg%3E")`,
            }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
              <Ornament className="mb-6" />
              <p className="font-heading italic text-accent text-2xl lg:text-3xl leading-relaxed mb-4">
                "Indeed, Allah is beautiful and loves beauty."
              </p>
              <p className="text-primary-foreground/60 text-xs tracking-[0.3em] uppercase">— Hadith, Sahih Muslim</p>
              <Ornament className="mt-6" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* VALUES GRID */}
    <section className="container mx-auto px-4 lg:px-8 py-24 lg:py-32">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeUp}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Our Values</p>
        <h2 className="text-4xl lg:text-5xl font-heading font-semibold leading-tight">
          The principles we <span className="italic text-burgundy">live by.</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {values.map(({ icon: Icon, title, text }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="group relative bg-card border border-border/60 rounded-2xl p-8 hover:border-accent/40 hover:shadow-premium-lg transition-all duration-500"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">{title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* CHARITY & SOCIAL IMPACT */}
    <section className="relative overflow-hidden gradient-dark py-24 lg:py-36">
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(var(--gold)) 0%, transparent 60%)',
      }} />
      <div className="container relative mx-auto px-4 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-3xl mx-auto text-center"
        >
          <Ornament className="mb-8" />
          <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Charity & Social Impact</p>
          <h2 className="text-4xl lg:text-6xl font-heading font-semibold text-primary-foreground leading-tight mb-8">
            Every purchase <br />
            <span className="italic text-accent">becomes a prayer.</span>
          </h2>

          <div className="my-12">
            <div className="inline-flex items-baseline gap-3">
              <span className="text-7xl lg:text-9xl font-heading font-bold text-accent leading-none">28<span className="text-5xl lg:text-7xl">%</span></span>
            </div>
            <p className="mt-4 text-primary-foreground/60 text-xs tracking-[0.4em] uppercase">of every profit</p>
          </div>

          <p className="font-body text-primary-foreground/70 text-base lg:text-lg leading-relaxed max-w-2xl mx-auto mb-4">
            28% of Delilar's profit is donated in the path of Allah through
          </p>

          <a
            href="https://muslimbondhu.org"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border border-accent/40 bg-accent/5 backdrop-blur-sm text-accent hover:bg-accent hover:text-charcoal hover:border-accent transition-all duration-500 hover:shadow-[0_0_40px_hsl(var(--gold)/0.4)] hover:-translate-y-0.5"
          >
            <HandHeart className="w-5 h-5" />
            <span className="font-heading text-lg italic">Muslim Bondhu</span>
            <span className="text-xs tracking-[0.3em] uppercase opacity-70 group-hover:opacity-100">Visit →</span>
          </a>

          <p className="mt-8 font-body text-primary-foreground/50 text-sm leading-relaxed max-w-xl mx-auto">
            …supporting humanitarian and charitable activities for those in need. Because business, at its best, should create profit <span className="italic text-accent/80">and</span> impact.
          </p>
          <Ornament className="mt-12" />
        </motion.div>
      </div>
    </section>

    {/* MISSION & VISION */}
    <section className="container mx-auto px-4 lg:px-8 py-24 lg:py-36">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Mission & Vision</p>
          <h2 className="text-4xl lg:text-6xl font-heading font-semibold leading-tight mb-10">
            To build more than a brand —<br />
            <span className="italic text-burgundy">a symbol of sincerity.</span>
          </h2>
          <p className="font-body text-lg lg:text-xl text-muted-foreground leading-relaxed italic">
            "Our mission is to create a symbol of elegance, faith, purpose, and sincerity that inspires people through both lifestyle and values."
          </p>
          <Ornament className="mt-12" />
          <p className="mt-10 font-heading text-3xl lg:text-4xl italic text-burgundy">
            Delilar <span className="text-accent">—</span> Inspired by Sunnah.
          </p>
        </motion.div>
      </div>
    </section>

    {/* CTA */}
    <section className="relative bg-[hsl(var(--cream-dark))] py-20 border-t border-border/60">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <h3 className="font-heading text-2xl lg:text-4xl mb-6">Step into the Delilar lifestyle.</h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/" className="btn-gold px-8 py-3 font-body text-sm tracking-wider uppercase font-medium">
              Explore Collection
            </Link>
            <Link to="/contact" className="btn-primary px-8 py-3 font-body text-sm tracking-wider uppercase font-medium">
              Get in Touch
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  </main>
);

export default About;
