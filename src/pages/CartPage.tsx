import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const CartPage = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-heading font-semibold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground font-body text-sm mb-8">Explore our collections and add something you love.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-sm font-body tracking-widest uppercase">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <h1 className="text-3xl font-heading font-semibold mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div key={item.product.id} layout className="flex gap-4 p-4 bg-secondary">
              <div className="w-24 h-24 bg-muted flex-shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="text-sm font-body font-medium">{item.product.name}</h3>
                  <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors"><X size={16} /></button>
                </div>
                {item.size && <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>}
                {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted"><Minus size={12} /></button>
                    <span className="w-8 text-center text-sm font-body">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted"><Plus size={12} /></button>
                  </div>
                  <span className="font-heading font-semibold">৳{(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-secondary p-6 lg:p-8 h-fit lg:sticky lg:top-32">
          <h2 className="text-lg font-heading font-semibold mb-6">Order Summary</h2>
          <div className="space-y-3 text-sm font-body">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{totalPrice.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{totalPrice >= 5000 ? 'Free' : '৳120'}</span></div>
            <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
              <span>Total</span>
              <span className="font-heading text-xl">৳{(totalPrice + (totalPrice >= 5000 ? 0 : 120)).toLocaleString()}</span>
            </div>
          </div>
          <button className="w-full bg-primary text-primary-foreground py-3.5 text-sm font-body tracking-widest uppercase mt-6 hover:opacity-90 transition-opacity">
            Proceed to Checkout
          </button>
          <button className="w-full bg-accent text-accent-foreground py-3.5 text-sm font-body tracking-widest uppercase mt-3 hover:opacity-90 transition-opacity">
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
