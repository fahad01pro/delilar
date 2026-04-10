import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

const Contact = () => (
  <main className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
      <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-3 flex items-center justify-center gap-3">
        <span className="w-6 h-px bg-accent" /> Get in Touch <span className="w-6 h-px bg-accent" />
      </p>
      <h1 className="text-3xl lg:text-5xl font-heading font-bold">Contact Us</h1>
    </motion.div>

    <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <div className="glass rounded-2xl p-6 lg:p-8 shadow-premium">
          <form className="space-y-5">
            <div>
              <label className="text-xs font-body tracking-widest uppercase block mb-2 font-medium">Name</label>
              <input
                type="text"
                className="w-full border border-border bg-background/50 px-4 py-3.5 text-sm font-body outline-none rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs font-body tracking-widest uppercase block mb-2 font-medium">Email</label>
              <input
                type="email"
                className="w-full border border-border bg-background/50 px-4 py-3.5 text-sm font-body outline-none rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-xs font-body tracking-widest uppercase block mb-2 font-medium">Message</label>
              <textarea
                rows={5}
                className="w-full border border-border bg-background/50 px-4 py-3.5 text-sm font-body outline-none rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button className="w-full btn-primary py-4 text-sm font-body tracking-widest uppercase font-semibold">
              Send Message
            </button>
          </form>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
        {[
          { icon: Mail, title: 'Email', detail: 'support@delilar.com' },
          { icon: Phone, title: 'Phone', detail: '+880 1234-567890' },
          { icon: MapPin, title: 'Location', detail: 'Dhaka, Bangladesh' },
        ].map(({ icon: Icon, title, detail }) => (
          <div key={title} className="glass rounded-2xl p-5 flex items-start gap-4 shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-body font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground font-body">{detail}</p>
            </div>
          </div>
        ))}
        <a
          href="https://wa.me/8801234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 rounded-2xl bg-green-600/90 text-white hover:bg-green-600 transition-all duration-300 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle size={18} />
          </div>
          <div>
            <h3 className="text-sm font-body font-medium">WhatsApp</h3>
            <p className="text-xs font-body opacity-80">Chat with us directly</p>
          </div>
        </a>
      </motion.div>
    </div>
  </main>
);

export default Contact;
