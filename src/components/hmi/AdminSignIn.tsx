import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface Props {
  onSignedIn?: () => void;
  onShowSignUp?: () => void;
}

export default function AdminSignIn({ onSignedIn, onShowSignUp }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // toggle visibility for the password input controlled by the eye icon
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message || 'Sign in failed');
        return;
      }

      // success
      onSignedIn?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-lg bg-gradient-to-tr from-slate-900/70 to-slate-900/40 p-8 rounded-3xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-cyan-600/10 rounded-lg border border-cyan-700">
            <ShieldCheck className="text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">Admin Sign In</div>
            <div className="text-sm text-slate-400">Sign in with your email and password</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              type="email"
              className="w-full mt-2 bg-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">Password</label>
            <div className="relative mt-2">
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full bg-slate-800 rounded-lg px-4 py-3 text-white pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && <div className="text-rose-400 text-sm">{error}</div>}

          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="px-6 py-3 bg-cyan-600 rounded-lg text-white font-semibold shadow">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <button type="button" onClick={() => { setEmail(''); setPassword(''); setError(null); }} className="px-4 py-2 bg-slate-800 rounded-lg">Clear</button>
          </div>

          <div className="text-xs text-slate-500">No account? <button type="button" onClick={onShowSignUp} className="text-cyan-400 underline">Create one</button></div>
        </form>
      </div>
    </div>
  );
}
