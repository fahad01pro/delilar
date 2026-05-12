import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useAuth } from '@/context/AuthContext';

const FloatingInput = ({
  id, type = 'text', value, onChange, label, icon: Icon, autoComplete,
}: any) => (
  <div className="relative">
    <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder=" "
      autoComplete={autoComplete}
      className="peer w-full bg-background/60 border border-border/60 rounded-xl pl-11 pr-4 pt-5 pb-2 text-sm font-body text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
    />
    <label
      htmlFor={id}
      className="absolute left-11 top-1.5 text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:tracking-normal peer-focus:top-1.5 peer-focus:-translate-y-0 peer-focus:text-[10px] peer-focus:tracking-[0.2em] peer-focus:text-accent"
    >
      {label}
    </label>
  </div>
);

const AuthModal = () => {
  const { authModalOpen, closeAuthModal, authPrompt } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success('Welcome to Delilar', { description: 'Check your email to confirm your account.' });
        closeAuthModal();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back');
        closeAuthModal();
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error('Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={(o) => !o && closeAuthModal()}>
      <DialogContent className="max-w-md p-0 border-accent/20 bg-background overflow-hidden rounded-2xl">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none" />
          <div className="relative p-8">
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-4 shadow-[0_0_30px_hsl(var(--accent)/0.3)]">
                <Sparkles className="text-accent" size={22} />
              </div>
              <p className="text-[10px] font-body tracking-[0.3em] uppercase text-accent mb-2">Delilar</p>
              <h2 className="text-2xl font-heading font-semibold text-foreground">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              {authPrompt ? (
                <p className="text-xs font-body text-muted-foreground mt-2">{authPrompt}</p>
              ) : (
                <p className="text-xs font-body text-muted-foreground mt-2">
                  {mode === 'login' ? 'Sign in to continue your journey' : 'Join the Delilar experience'}
                </p>
              )}
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border/60 bg-background hover:bg-secondary hover:border-accent/40 transition-all text-sm font-body font-medium text-foreground disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground">Or</span>
              <div className="flex-1 h-px bg-border/60" />
            </div>

            <form onSubmit={handleEmail} className="space-y-3">
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <FloatingInput
                      id="name"
                      label="Full Name"
                      icon={UserIcon}
                      value={name}
                      onChange={(e: any) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <FloatingInput
                id="email"
                type="email"
                label="Email Address"
                icon={Mail}
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <FloatingInput
                id="password"
                type="password"
                label="Password"
                icon={Lock}
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-xs tracking-[0.25em] uppercase font-body font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-xs font-body text-muted-foreground mt-5">
              {mode === 'login' ? "New to Delilar?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-accent font-medium hover:underline"
              >
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
