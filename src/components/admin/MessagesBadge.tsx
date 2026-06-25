import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const MessagesBadge = ({ className = '' }: { className?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { count } = await supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'unread');
      if (active) setCount(count ?? 0);
    };
    load();
    const t = setInterval(load, 30000);
    const ch = supabase
      .channel('contact_messages_badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, load)
      .subscribe();
    return () => {
      active = false;
      clearInterval(t);
      supabase.removeChannel(ch);
    };
  }, []);

  if (!count) return null;
  return (
    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
};
