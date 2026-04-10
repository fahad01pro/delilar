import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const CartPage = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} className="text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground font-body text-sm mb-8">Explore our collections and add something you love.</p>
          <Link to="/" className="btn-primary px-8 py-4 text-sm font-body tracking-widest uppercase inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <h1 className="text-3xl font-heading font-bold mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.product.id}
              layout
              className="flex gap-4 p-4 glass rounded-2xl shadow-premium"
            >
              <div className="w-24 h-24 bg-secondary rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="text-sm font-body font-medium">{item.product.name}</h3>
                  <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg hover:bg-secondary">
                    <X size={16} />
                  </button>
                </div>
                {item.size && <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>}
                {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center rounded-xl border border-border overflow-hidden">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-body">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="font-heading font-bold text-primary">৳{(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="glass rounded-2xl p-6 lg:p-8 h-fit lg:sticky lg:top-32 shadow-premium-lg">
          <h2 className="text-lg font-heading font-bold mb-6">Order Summary</h2>
          <div className="space-y-3 text-sm font-body">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{totalPrice.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-accent font-medium">{totalPrice >= 5000 ? 'Free' : '৳120'}</span></div>
            <div className="border-t border-border pt-4 flex justify-between font-semibold text-base">
              <span>Total</span>
              <span className="font-heading text-xl font-bold text-primary">৳{(totalPrice + (totalPrice >= 5000 ? 0 : 120)).toLocaleString()}</span>
            </div>
          </div>
          {totalPrice < 5000 && (
            <div className="mt-4 p-3 rounded-xl bg-accent/10 flex items-center gap-2 text-xs font-body text-accent">
              <Truck size={14} /> Add ৳{(5000 - totalPrice).toLocaleString()} more for free shipping
            </div>
          )}
          <button className="w-full btn-primary py-4 text-sm font-body tracking-widest uppercase mt-6 font-semibold">
            Proceed to Checkout
          </button>
          <button className="w-full btn-gold py-4 text-sm font-body tracking-widest uppercase mt-3 font-semibold">
            Cash on Delivery
          </button>
          <Link to="/" className="block text-center text-xs text-muted-foreground font-body mt-4 hover:text-foreground transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
