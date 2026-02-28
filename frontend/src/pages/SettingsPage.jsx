import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Sparkles, Shield, Trash2,
  Check, AlertCircle, Loader2, Zap, ChevronRight, Menu
} from 'lucide-react';
import { userService, chatService } from '../services/api';

const TABS = [
  { id:'profile',  label:'Profile',    icon: User },
  { id:'model',    label:'AI Model',   icon: Sparkles },
  { id:'security', label:'Security',   icon: Shield },
  { id:'data',     label:'Data',       icon: Trash2 },
];

export default function SettingsPage({ user, setUser }) {
  const navigate  = useNavigate();
  const [tab, setTab]     = useState('profile');
  const [toast, setToast] = useState(null);
  const [busy, setBusy]   = useState(false);

  // profile state
  const [name,  setName]  = useState(user?.name  || '');
  const [email, setEmail] = useState(user?.email || '');

  // password state
  const [pwd, setPwd] = useState({ current:'', next:'', confirm:'' });

  // ai model
  const [aiProvider, setAiProvider] = useState(user?.preferences?.aiProvider || 'gemini');

  /* ─ helpers ─ */
  const toast$ = (text, ok=true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const saveProfile = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const r = await userService.updateProfile({ name, email });
      if (r.data.success) { setUser(r.data.user); toast$('Profile updated!'); }
    } catch (err) { toast$(err.response?.data?.message || 'Update failed.', false); }
    finally { setBusy(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) return toast$("Passwords don't match.", false);
    if (pwd.next.length < 6)      return toast$("Min 6 characters.", false);
    setBusy(true);
    try {
      await userService.changePassword({ currentPassword: pwd.current, newPassword: pwd.next });
      setPwd({ current:'', next:'', confirm:'' });
      toast$('Password changed!');
    } catch (err) { toast$(err.response?.data?.message || 'Failed.', false); }
    finally { setBusy(false); }
  };

  const saveModel = async (p) => {
    setAiProvider(p);
    try {
      const r = await userService.updatePrefs({ aiProvider: p });
      if (r.data.success) { setUser(r.data.user); toast$('Preference saved!'); }
    } catch { toast$('Failed to save.', false); }
  };

  const clearHistory = async () => {
    if (!window.confirm('Delete ALL chat history? This cannot be undone.')) return;
    setBusy(true);
    try { await chatService.clearAll(); toast$('All chats deleted.'); }
    catch { toast$('Failed to clear.', false); }
    finally { setBusy(false); }
  };

  /* ─ shared input style ─ */
  const inp = "w-full bg-[#212121] border border-white/10 text-white placeholder-[#555] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#19c37d]/60 focus:ring-2 focus:ring-[#19c37d]/10 transition";

  return (
    <div className="h-full overflow-y-auto bg-[#212121] py-6 sm:py-10 px-4">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border shadow-2xl transition-all
          ${toast.ok ? 'bg-[#1c2d22] border-[#19c37d]/30 text-[#19c37d]' : 'bg-[#2d1c1c] border-red-500/30 text-red-400'}`}>
          {toast.ok ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.text}
        </div>
      )}

      <div className="max-w-[860px] mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <button onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-[#2f2f2f] text-[#9a9a9a] hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold text-white">Settings</h1>
        </div>

        {/* Layout: Responsive (Col on Mobile, Row on Desktop) */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar nav (Horizontal Scroll on Mobile) */}
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 md:w-48 flex-shrink-0 scrollbar-hide">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-colors whitespace-nowrap
                  ${tab === t.id ? 'bg-[#2f2f2f] text-white' : 'text-[#9a9a9a] hover:bg-[#1e1e1e] hover:text-white'}`}>
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </nav>

          {/* Panel */}
          <div className="flex-1 bg-[#2f2f2f] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">

            {/* ── Profile ── */}
            {tab === 'profile' && (
              <form onSubmit={saveProfile} className="p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-4 pb-5 border-b border-white/10">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#19c37d] flex items-center justify-center text-black font-bold text-xl sm:text-2xl flex-shrink-0 shadow-lg shadow-[#19c37d]/20">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-base truncate">{user?.name}</p>
                    <p className="text-sm text-[#9a9a9a] truncate">{user?.email}</p>
                    <p className="text-xs text-[#555] mt-1">Free plan</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#9a9a9a] uppercase tracking-wide">Display name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className={inp} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#9a9a9a] uppercase tracking-wide">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inp} />
                </div>

                <button type="submit" disabled={busy}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#19c37d] hover:bg-[#1aab6d] disabled:opacity-50
                             text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition">
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  Save changes
                </button>
              </form>
            )}

            {/* ── AI Model ── */}
            {tab === 'model' && (
              <div className="p-5 sm:p-6 space-y-5">
                <div className="pb-4 border-b border-white/10">
                  <h2 className="text-base font-semibold text-white">Default AI Model</h2>
                  <p className="text-sm text-[#9a9a9a] mt-1">Select which model powers your conversations by default.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { id:'gemini', name:'Gemini 1.5 Flash', by:'Google DeepMind', desc:'Fast, multimodal. Great for everyday tasks.', icon:<Sparkles size={20} className="text-blue-400" /> },
                    { id:'openai', name:'GPT-4o',           by:'OpenAI',          desc:'Powerful, versatile. OpenAI flagship.',       icon:<Zap       size={20} className="text-green-400" /> },
                  ].map(p => (
                    <button key={p.id} onClick={() => saveModel(p.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all
                        ${aiProvider === p.id
                            ? 'border-[#19c37d]/40 bg-[#19c37d]/10'
                            : 'border-white/10 bg-[#212121] hover:border-white/20'}`}>
                      <div className="p-2 bg-white/5 rounded-xl flex-shrink-0">{p.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{p.name}</p>
                        <p className="text-xs text-[#9a9a9a] mt-0.5 line-clamp-1">{p.by} · {p.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${aiProvider === p.id ? 'border-[#19c37d] bg-[#19c37d]' : 'border-[#555]'}`}>
                        {aiProvider === p.id && <Check size={10} className="text-black" strokeWidth={3} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Security ── */}
            {tab === 'security' && (
              <form onSubmit={savePassword} className="p-5 sm:p-6 space-y-5">
                <div className="pb-4 border-b border-white/10">
                  <h2 className="text-base font-semibold text-white">Change Password</h2>
                  <p className="text-sm text-[#9a9a9a] mt-1">Use a strong password you don't use anywhere else.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#9a9a9a] uppercase tracking-wide">Current password</label>
                  <input type="password" value={pwd.current} onChange={e => setPwd({...pwd, current:e.target.value})} className={inp} placeholder="••••••••" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#9a9a9a] uppercase tracking-wide">New password</label>
                  <input type="password" value={pwd.next}    onChange={e => setPwd({...pwd, next:e.target.value})}    className={inp} placeholder="Min. 6 characters" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#9a9a9a] uppercase tracking-wide">Confirm new password</label>
                  <input type="password" value={pwd.confirm} onChange={e => setPwd({...pwd, confirm:e.target.value})} className={inp} placeholder="••••••••" required />
                </div>

                <button type="submit" disabled={busy}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-[#e5e5e5] disabled:opacity-50
                             text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition">
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
                  Update password
                </button>
              </form>
            )}

            {/* ── Data ── */}
            {tab === 'data' && (
              <div className="p-5 sm:p-6 space-y-5">
                <div className="pb-4 border-b border-white/10">
                  <h2 className="text-base font-semibold text-white">Data & Privacy</h2>
                  <p className="text-sm text-[#9a9a9a] mt-1">Manage your data and privacy settings.</p>
                </div>

                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">Delete all conversations</p>
                    <p className="text-xs text-[#9a9a9a] mt-1">Permanently remove all your chat history. This cannot be undone.</p>
                  </div>
                  <button onClick={clearHistory} disabled={busy}
                    className="w-full sm:w-auto flex-shrink-0 px-4 py-2 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500
                               text-red-400 hover:text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50">
                    {busy ? <Loader2 size={16} className="animate-spin" /> : 'Delete all'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
