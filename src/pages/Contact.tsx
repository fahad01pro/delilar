import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle, Clock, Sparkles, Store } from 'lucide-react';
import { useOutlets, type Outlet } from '@/hooks/useCatalog';

const ContactForm = () => (
  <div className="glass rounded-2xl p-6 lg:p-8 shadow-premium">
    <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-2">Send a Message</p>
    <h2 className="font-heading text-2xl mb-5 text-[hsl(var(--charcoal))]">We typically reply within 24 hours</h2>
    <form className="space-y-4">
      <input type="text" placeholder="Your name" className="w-full border border-border bg-background/50 px-4 py-3.5 text-sm font-body outline-none rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/20" />
      <input type="email" placeholder="Email address" className="w-full border border-border bg-background/50 px-4 py-3.5 text-sm font-body outline-none rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/20" />
      <input type="tel" placeholder="Phone (optional)" className="w-full border border-border bg-background/50 px-4 py-3.5 text-sm font-body outline-none rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/20" />
      <textarea rows={5} placeholder="How can Delilar serve you?" className="w-full border border-border bg-background/50 px-4 py-3.5 text-sm font-body outline-none rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none" />
      <button type="button" className="w-full btn-primary py-4 text-sm font-body tracking-widest uppercase font-semibold">
        Send Message
      </button>
    </form>
  </div>
);

const OutletCard = ({ outlet }: { outlet: Outlet }) => {
  const waNumber = (outlet.whatsapp || outlet.phone || '').replace(/[^\d]/g, '');
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl overflow-hidden border border-[hsl(var(--burgundy)/0.15)] bg-background shadow-premium hover:shadow-premium-lg transition-all"
    >
      {outlet.map_embed_url && (
        <div className="relative w-full aspect-[16/9] bg-secondary">
          <iframe
            src={outlet.map_embed_url}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            title={`${outlet.name} location`}
          />
        </div>
      )}
      <div className="p-6 lg:p-7">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-[10px] font-body tracking-[0.35em] uppercase text-accent mb-2 flex items-center gap-2">
              <Store size={12} /> {outlet.is_primary ? 'Flagship Outlet' : 'Delilar Outlet'}
            </p>
            <h3 className="font-heading text-2xl text-[hsl(var(--charcoal))]">{outlet.name}</h3>
          </div>
        </div>
        <ul className="mt-4 space-y-3 text-sm font-body text-foreground/80">
          <li className="flex gap-3"><MapPin size={16} className="text-accent shrink-0 mt-0.5" /><span>{outlet.address}{outlet.city ? `, ${outlet.city}` : ''}</span></li>
          {outlet.phone && <li className="flex gap-3"><Phone size={16} className="text-accent shrink-0 mt-0.5" /><a href={`tel:${outlet.phone.replace(/\s/g, '')}`} className="hover:text-[hsl(var(--burgundy))]">{outlet.phone}</a></li>}
          {outlet.hours && <li className="flex gap-3"><Clock size={16} className="text-accent shrink-0 mt-0.5" /><span>{outlet.hours}</span></li>}
          {outlet.email && <li className="flex gap-3"><Mail size={16} className="text-accent shrink-0 mt-0.5" /><a href={`mailto:${outlet.email}`} className="hover:text-[hsl(var(--burgundy))]">{outlet.email}</a></li>}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-green-600 text-white px-4 py-2 text-xs font-body tracking-wider uppercase hover:bg-green-700 transition-all">
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
          {outlet.map_link && (
            <a href={outlet.map_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))] px-4 py-2 text-xs font-body tracking-wider uppercase hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--charcoal))] transition-all">
              <MapPin size={14} /> Get Directions
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
};

const Contact = () => {
  const { data: outlets = [], isLoading } = useOutlets();

  return (
    <main className="bg-[hsl(var(--cream))]">
      <section className="bg-primary text-primary-foreground py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
          <p className="text-xs font-body tracking-[0.35em] uppercase text-accent mb-4 flex items-center justify-center gap-3">
            <span className="w-6 h-px bg-accent" /> Get in Touch <span className="w-6 h-px bg-accent" />
          </p>
          <h1 className="font-heading text-4xl lg:text-6xl font-bold mb-4 leading-tight">Visit a Delilar Outlet</h1>
          <p className="text-primary-foreground/75 font-body text-base lg:text-lg leading-relaxed">
            Experience our premium Islamic fashion & lifestyle pieces in person — feel the fabric, see the craftsmanship, and meet the team behind Delilar.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-14 lg:py-20">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles size={18} className="text-accent" />
          <p className="text-xs font-body tracking-[0.3em] uppercase text-[hsl(var(--burgundy))]">Our Outlets</p>
          <span className="h-px flex-1 bg-[hsl(var(--burgundy)/0.15)]" />
        </div>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-16">Loading outlets…</p>
        ) : outlets.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Outlets coming soon.</p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {outlets.map((o) => <OutletCard key={o.id} outlet={o} />)}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-8 lg:gap-12 items-start">
          <ContactForm />
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6 shadow-premium">
              <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-2">Customer Care</p>
              <h3 className="font-heading text-xl mb-4 text-[hsl(var(--charcoal))]">Reach Delilar Directly</h3>
              <div className="space-y-3">
                <a href="mailto:delilar.shop@gmail.com" className="flex items-start gap-3 group">
                  <span className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0"><Mail size={16} /></span>
                  <div>
                    <p className="text-xs font-body uppercase tracking-wider text-muted-foreground">Email</p>
                    <p className="text-sm font-body group-hover:text-accent transition-colors">delilar.shop@gmail.com</p>
                  </div>
                </a>
                <a href="tel:+8801533413290" className="flex items-start gap-3 group">
                  <span className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0"><Phone size={16} /></span>
                  <div>
                    <p className="text-xs font-body uppercase tracking-wider text-muted-foreground">Phone</p>
                    <p className="text-sm font-body group-hover:text-accent transition-colors">+880 1533-413290</p>
                  </div>
                </a>
              </div>
            </div>
            <a
              href="https://wa.me/8801533413290"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-green-600 text-white hover:bg-green-700 transition-all shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0"><MessageCircle size={18} /></div>
              <div>
                <h3 className="text-sm font-heading font-medium">Chat on WhatsApp</h3>
                <p className="text-xs font-body opacity-85">Fastest response · order assistance</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
