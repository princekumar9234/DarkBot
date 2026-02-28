import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  PenSquare, Trash2, LogOut, Settings, MoreHorizontal,
  Search, X, Bot, MessageSquare, Clock, ChevronRight
} from 'lucide-react';
import { chatService, authService } from '../services/api';

/* ── group chats by relative date ─────────────── */
function groupChats(chats) {
  const now  = new Date();
  const tod  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yest = new Date(tod); yest.setDate(yest.getDate() - 1);
  const week = new Date(tod); week.setDate(week.getDate() - 7);
  const mon  = new Date(tod); mon.setDate(mon.getDate() - 30);

  const groups = {
    'Today': [],
    'Yesterday': [],
    'Previous 7 days': [],
    'Previous 30 days': [],
    'Older': [],
  };

  chats.forEach(c => {
    const d = new Date(c.updatedAt || c.createdAt);
    if (d >= tod)  groups['Today'].push(c);
    else if (d >= yest) groups['Yesterday'].push(c);
    else if (d >= week) groups['Previous 7 days'].push(c);
    else if (d >= mon)  groups['Previous 30 days'].push(c);
    else groups['Older'].push(c);
  });

  return groups;
}

export default function Sidebar({ user, setUser, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch]   = useState('');
  const navigate  = useNavigate();
  const location  = useLocation();

  // Reload history when route changes (new chat created)
  useEffect(() => { fetchHistory(); }, [location.pathname]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const r = await chatService.getHistory();
      if (r.data.success) setHistory(r.data.chats);
    } catch {}
    finally { setLoading(false); }
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    setUser(null); navigate('/login');
  };

  const del = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this chat?')) return;
    try {
      setHistory(h => h.filter(c => c._id !== id)); // Optimistic UI
      await chatService.deleteChat(id);
      if (location.pathname.includes(id)) navigate('/');
    } catch (err) {
      alert('Failed to delete chat. Please try again.');
      fetchHistory(); // Revert on failure
    }
  };

  const goNew = () => {
    navigate('/');
    onClose?.();
  };

  const filtered = history.filter(c =>
    !search || (c.title || '').toLowerCase().includes(search.toLowerCase())
  );
  const grouped = groupChats(filtered);

  return (
    <aside className="w-[260px] h-full flex flex-col bg-[#171717] border-r border-white/[0.06] select-none">
      <div className="flex items-center gap-1 px-2 pt-3 pb-2">
        <div className="flex items-center gap-2.5 flex-1 px-2 py-1.5">
          <div className="w-8 h-8 rounded-xl bg-[#19c37d] flex items-center justify-center text-black font-black text-lg flex-shrink-0 shadow shadow-[#19c37d]/30">D</div>
          <span className="font-semibold text-sm text-white">DarkBot</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/10 rounded-xl text-[#9a9a9a] hover:text-white transition-colors">
          <X size={18} />
        </button>
        <button onClick={goNew} title="New chat" className="p-2 hover:bg-white/10 rounded-xl text-[#9a9a9a] hover:text-white transition-colors">
          <PenSquare size={17} />
        </button>
      </div>

      {/* ── Search ───────────────────────────────── */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 bg-white/5 border border-white/[0.07] rounded-xl px-3 py-2 focus-within:border-white/20 transition-colors">
          <Search size={14} className="text-[#555] flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chats…"
            className="flex-1 bg-transparent text-sm text-white placeholder-[#555] focus:outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#555] hover:text-white transition-colors">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── New Chat CTA ─────────────────────────── */}
      <div className="px-3 pb-3">
        <button onClick={goNew}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-white/5 hover:bg-white/10
                     border border-dashed border-white/10 hover:border-white/20
                     rounded-xl text-sm text-[#9a9a9a] hover:text-white transition-all">
          <PenSquare size={15} />
          New conversation
        </button>
      </div>

      {/* ── History list ─────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">

        {loading && (
          <div className="px-3 mt-2 space-y-2">
            {[100, 75, 85, 60, 90].map((w, i) => (
              <div key={i}
                className="h-7 rounded-xl bg-white/5 animate-pulse"
                style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {!loading && history.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 mt-10 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <MessageSquare size={22} className="text-[#555]" />
            </div>
            <p className="text-sm text-[#555]">No conversations yet</p>
            <button onClick={goNew}
              className="text-sm text-[#19c37d] hover:underline font-medium">
              Start your first chat →
            </button>
          </div>
        )}

        {!loading && Object.entries(grouped).map(([label, items]) =>
          items.length === 0 ? null : (
            <div key={label} className="mt-3 first:mt-0">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <Clock size={11} className="text-[#444]" />
                <p className="text-[11px] font-semibold text-[#444] uppercase tracking-wider">{label}</p>
              </div>
              {items.map(chat => (
                <NavLink
                  key={chat._id}
                  to={`/chat/${chat._id}`}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `group relative flex items-center px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors
                     ${isActive
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-[#b0b0b0] hover:bg-white/5 hover:text-white'}`
                  }
                >
                  <span className="flex-1 truncate leading-snug pr-2">
                    {chat.title || 'Untitled chat'}
                  </span>
                  <button
                    onClick={e => del(e, chat._id)}
                    className="md:opacity-0 md:group-hover:opacity-100 flex-shrink-0 p-1.5 rounded-lg
                               text-[#9a9a9a] hover:text-red-400 hover:bg-red-400/10 transition-all ml-auto"
                  >
                    <Trash2 size={13} />
                  </button>
                </NavLink>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── User section ─────────────────────────── */}
      <div className="border-t border-white/[0.06] px-3 py-3 relative">
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
        >
          {/* Avatar */}
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center
                            text-black font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}

          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-white truncate leading-tight">{user?.name}</p>
            <p className="text-xs text-[#9a9a9a] truncate leading-tight">{user?.email}</p>
          </div>
          <MoreHorizontal size={16} className="text-[#555] group-hover:text-[#9a9a9a] transition flex-shrink-0" />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute bottom-[72px] left-3 right-3 bg-[#2a2a2a] border border-white/10
                            rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5">
              {/* User info at top */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 mb-1">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#19c37d] flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-[#9a9a9a] truncate">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={() => { navigate('/settings'); setMenuOpen(false); onClose?.(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#ececec] hover:bg-white/5 transition-colors"
              >
                <Settings size={15} className="text-[#9a9a9a]" />
                Settings
                <ChevronRight size={13} className="ml-auto text-[#555]" />
              </button>

              <div className="mx-4 my-1 border-t border-white/10" />

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#ececec] hover:bg-white/5 transition-colors"
              >
                <LogOut size={15} className="text-[#9a9a9a]" />
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
