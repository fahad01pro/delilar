import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[70]"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-[80] flex flex-col shadow-premium-lg"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="text-lg font-heading font-bold tracking-wider">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <ShoppingBag size={28} strokeWidth={1.5} />
                </div>
                <p className="font-body text-sm">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 pb-4 border-b border-border/50">
                      <div className="w-20 h-20 bg-secondary rounded-xl flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-sm font-body font-medium">{item.product.name}</h3>
                        {item.size && <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size}</p>}
                        <p className="text-sm font-body font-bold text-primary mt-1">৳{item.product.price.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center rounded-lg border border-border overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-body w-7 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors font-body"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-border/50 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-heading text-xl font-bold text-primary">৳{totalPrice.toLocaleString()}</span>
                  </div>
                  <Link
                    to="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full btn-primary text-center py-4 text-sm font-body tracking-widest uppercase font-semibold"
                  >
                    View Cart & Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
