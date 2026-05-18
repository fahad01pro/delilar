import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts recovery tokens in the hash; the SDK auto-exchanges them.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated', { description: 'You can now sign in with your new password.' });
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Could not update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-lg">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-4">
            <Sparkles className="text-accent" size={22} />
          </div>
          <p className="text-[10px] font-body tracking-[0.3em] uppercase text-accent mb-2">Delilar</p>
          <h1 className="text-2xl font-heading font-semibold">Set a new password</h1>
          <p className="text-xs font-body text-muted-foreground mt-2">
            {ready ? 'Choose a strong password for your account.' : 'Verifying your reset link…'}
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-accent" />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-accent" />
          </div>
          <button type="submit" disabled={loading || !ready} className="w-full btn-primary py-3.5 text-xs tracking-[0.25em] uppercase font-body font-medium flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </main>
  );
};

export default ResetPassword;
