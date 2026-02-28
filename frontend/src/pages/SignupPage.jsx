import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../services/api';

const OAUTH_BASE = 'http://localhost:3000/auth';

const OAUTH_PROVIDERS = [
  {
    id: 'google',
    label: 'Sign up with Google',
    href: `${OAUTH_BASE}/google`,
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'Sign up with GitHub',
    href: `${OAUTH_BASE}/github`,
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 fill-current">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
  },
];

export default function SignupPage({ setUser }) {
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirmPassword:'' });
  const [show, setShow]       = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 6)              return setError('6+ character password required.');
    setLoading(true);
    try {
      const r = await authService.signup({
        name:            form.name,
        email:           form.email,
        password:        form.password,
        confirmPassword: form.confirmPassword,
      });
      if (r.data.success) { setUser(r.data.user); navigate('/'); }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed.');
    } finally { setLoading(false); }
  };

  const inp = "w-full bg-[#212121] border border-white/10 text-white placeholder-[#555] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#19c37d]/60 focus:ring-2 focus:ring-[#19c37d]/10 transition";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#212121] p-4 sm:p-6 select-none animate-fade-in">
      
      {/* Container - Fixed width on Desktop, width-full on Mobile */}
      <div className="w-full max-w-[400px]">

        {/* Logo/Header */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-[#19c37d] flex items-center justify-center text-black font-black text-2xl shadow-xl shadow-[#19c37d]/20">
            D
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Create account</h1>
            <p className="mt-1 text-sm text-[#9a9a9a]">Start using DarkBot for free</p>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
          {OAUTH_PROVIDERS.map(p => (
            <a key={p.id} href={p.href}
              className="flex items-center justify-center gap-2.5 w-full bg-[#2f2f2f] hover:bg-[#353535]
                         border border-white/10 hover:border-white/20 rounded-xl py-3 px-4
                         text-sm text-white font-medium transition-all">
              {p.icon}
              {p.id.charAt(0).toUpperCase() + p.id.slice(1).replace('-',' ')}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] text-[#555] uppercase tracking-widest font-bold">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Form Card */}
        <div className="bg-[#2f2f2f] rounded-2xl border border-white/10 p-5 sm:p-7 shadow-2xl">
          {error && (
            <div className="mb-4 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wider ml-1">Full name</label>
              <input type="text" required placeholder="John Doe" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} className={inp} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wider ml-1">Email address</label>
              <input type="email" required placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} className={inp} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} required placeholder="Min. 6 chars"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className={inp + " pr-12"} />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition p-2">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wider ml-1">Confirm password</label>
              <input type="password" required placeholder="••••••••" value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })} className={inp} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-[#19c37d] hover:bg-[#1aab6d]
                         disabled:opacity-50 text-black font-bold rounded-xl py-3 text-sm transition-all
                         shadow-lg shadow-[#19c37d]/30 active:scale-[0.98]">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-sm text-[#9a9a9a]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#19c37d] hover:text-[#20dd8d] underline underline-offset-4 decoration-2 decoration-[#19c37d]/30 font-semibold transition-colors">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}
