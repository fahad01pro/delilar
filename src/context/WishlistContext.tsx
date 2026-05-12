import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Product } from '@/data/products';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface WishlistContextType {
  items: Product[];
  toggle: (product: Product) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, openAuthModal } = useAuth();
  const [items, setItems] = useState<Product[]>([]);

  const loadFromDb = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('wishlist')
      .select('product_data')
      .eq('user_id', uid);
    if (!error && data) {
      setItems(data.map((r: any) => r.product_data).filter(Boolean));
    }
  }, []);

  useEffect(() => {
    if (user) loadFromDb(user.id);
    else setItems([]);
  }, [user, loadFromDb]);

  const has = (id: string) => items.some((p) => p.id === id);

  const toggle = async (product: Product) => {
    if (!user) {
      openAuthModal('Please sign in to save items to your wishlist.');
      return;
    }
    if (has(product.id)) {
      setItems((prev) => prev.filter((p) => p.id !== product.id));
      await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', product.id);
      toast.success('Removed from wishlist');
    } else {
      setItems((prev) => [...prev, product]);
      const { error } = await supabase.from('wishlist').insert({
        user_id: user.id,
        product_id: product.id,
        product_data: product as any,
      });
      if (error) {
        setItems((prev) => prev.filter((p) => p.id !== product.id));
        toast.error('Could not save');
        return;
      }
      toast.success('Added to wishlist', { description: product.name });
    }
  };

  const remove = async (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    if (user) await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', id);
  };

  const clear = async () => {
    setItems([]);
    if (user) await supabase.from('wishlist').delete().eq('user_id', user.id);
  };

  return (
    <WishlistContext.Provider value={{ items, toggle, remove, has, clear, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
