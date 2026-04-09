import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

const Contact = () => (
  <main className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
      <p className="text-xs font-body tracking-[0.3em] uppercase text-accent mb-2">Get in Touch</p>
      <h1 className="text-3xl lg:text-4xl font-heading font-semibold">Contact Us</h1>
    </motion.div>

    <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <form className="space-y-5">
          <div>
            <label className="text-xs font-body tracking-widest uppercase block mb-2">Name</label>
            <input type="text" className="w-full border border-border bg-background px-4 py-3 text-sm font-body outline-none focus:border-accent transition-colors" placeholder="Your name" />
          </div>
          <div>
            <label className="text-xs font-body tracking-widest uppercase block mb-2">Email</label>
            <input type="email" className="w-full border border-border bg-background px-4 py-3 text-sm font-body outline-none focus:border-accent transition-colors" placeholder="your@email.com" />
          </div>
          <div>
            <label className="text-xs font-body tracking-widest uppercase block mb-2">Message</label>
            <textarea rows={5} className="w-full border border-border bg-background px-4 py-3 text-sm font-body outline-none focus:border-accent transition-colors resize-none" placeholder="How can we help?" />
          </div>
          <button className="w-full bg-primary text-primary-foreground py-3.5 text-sm font-body tracking-widest uppercase hover:opacity-90 transition-opacity">
            Send Message
          </button>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
        {[
          { icon: Mail, title: 'Email', detail: 'support@delilar.com' },
          { icon: Phone, title: 'Phone', detail: '+880 1234-567890' },
          { icon: MapPin, title: 'Location', detail: 'Dhaka, Bangladesh' },
        ].map(({ icon: Icon, title, detail }) => (
          <div key={title} className="flex items-start gap-4 p-4 bg-secondary">
            <Icon size={20} className="text-accent mt-0.5" />
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
          className="flex items-center gap-3 p-4 bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
        >
          <MessageCircle size={20} />
          <div>
            <h3 className="text-sm font-body font-medium">WhatsApp</h3>
            <p className="text-xs font-body">Chat with us directly</p>
          </div>
        </a>
      </motion.div>
    </div>
  </main>
);

export default Contact;
