import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Sparkles, Zap, MessageSquare, Clock, 
  ChevronRight, Plus, Image as ImageIcon, 
  Code, FileText, Activity, Shield, Cpu
} from 'lucide-react';
import { chatService } from '../services/api';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';

export default function DashboardPage({ user, onMenuClick }) {
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatService.getHistory()
      .then(r => {
        if (r.data.success) {
          setRecentChats(r.data.chats.slice(0, 4));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'AI Messages', value: '1,284', icon: <MessageSquare size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Active Models', value: '2', icon: <Cpu size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'System Health', value: 'Optimal', icon: <Activity size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Security', value: 'Level 1', icon: <Shield size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const quickActions = [
    { title: 'New Chat', desc: 'Start a fresh conversation', icon: <Plus className="text-white" />, path: '/chat', primary: true },
    { title: 'Imagine', desc: 'Generate AI images from text', icon: <ImageIcon className="text-blue-400" />, path: '/chat' },
    { title: 'Code Assist', desc: 'Debug or write complex code', icon: <Code className="text-purple-400" />, path: '/chat' },
    { title: 'Doc Analysis', desc: 'Upload PDFs for insights', icon: <FileText className="text-emerald-400" />, path: '/chat' },
  ];

  return (
    <div className="min-h-full w-full bg-[#111111] overflow-y-auto custom-scrollbar">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center h-14 px-4 bg-[#111111]/80 backdrop-blur-md border-b border-white/5">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-white/10 rounded-xl text-[#9a9a9a] transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="ml-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#19c37d] flex items-center justify-center text-black font-black text-[10px]">D</div>
          <span className="font-bold text-sm text-white">Dashboard</span>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[2px] text-[#19c37d]">
              Agentic Intelligence
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Welcome, <span className="bg-gradient-to-r from-[#19c37d] to-emerald-300 bg-clip-text text-transparent">{user?.name}</span>
          </h1>
          <p className="text-[#9a9a9a] text-lg max-w-2xl leading-relaxed">
            DarkBot is ready to assist. How can we push the boundaries of productivity today?
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
              <p className="text-xs font-medium text-[#555] uppercase tracking-wider mb-1">{s.label}</p>
              <h3 className="text-xl font-bold text-white tracking-tight">{s.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap size={20} className="text-[#19c37d]" />
              Quick Actions
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((a, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(a.path)}
                  className={`cursor-pointer p-6 rounded-3xl border transition-all relative overflow-hidden group
                    ${a.primary 
                      ? 'bg-gradient-to-br from-[#19c37d] to-emerald-600 border-none shadow-[0_0_30px_rgba(25,195,125,0.2)]' 
                      : 'bg-[#1a1a1a] border-white/5 hover:border-white/20'}`}
                >
                  {a.primary && (
                    <div className="absolute top-0 right-0 p-8 bg-white/10 blur-2xl rounded-full scale-150 rotate-45 group-hover:bg-white/20 transition-all pointer-events-none" />
                  )}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg
                    ${a.primary ? 'bg-white/20 backdrop-blur-md' : 'bg-white/5'}`}>
                    {a.icon}
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${a.primary ? 'text-white' : 'text-white'}`}>{a.title}</h3>
                  <p className={`text-sm ${a.primary ? 'text-emerald-50' : 'text-[#9a9a9a]'}`}>{a.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* AI Model Showcase */}
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 px-6 py-2 bg-purple-500/20 rounded-bl-3xl border-l border-b border-white/10 text-xs font-bold text-purple-200">
                ENABLED MODELS
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-4xl shadow-2xl border border-white/20 group-hover:rotate-12 transition-transform">
                  🤖
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Multi-Modal Intelligence</h3>
                  <p className="text-purple-100/70 text-sm max-w-lg mb-6 leading-relaxed">
                    DarkBot integrates Gemini 1.5 Pro and GPT-4o to provide unrivaled accuracy in coding, 
                    creative writing, and visual understanding.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl border border-white/10">
                      <Sparkles size={14} className="text-blue-400" />
                      <span className="text-xs font-bold text-white/90">Gemini 1.5</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl border border-white/10">
                      <Zap size={14} className="text-green-400" />
                      <span className="text-xs font-bold text-white/90">GPT-4o</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent History Sidebar */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 px-1">
              <Clock size={20} className="text-emerald-400" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
                ))
              ) : recentChats.length > 0 ? (
                recentChats.map((chat) => (
                  <motion.div 
                    key={chat._id}
                    whileHover={{ x: 6 }}
                    onClick={() => navigate(`/chat/${chat._id}`)}
                    className="group cursor-pointer p-4 bg-[#1a1a1a] border border-white/5 hover:border-emerald-500/30 rounded-2xl flex items-center gap-4 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                      <Bot size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate leading-tight mb-1">{chat.title || 'New Session'}</p>
                      <p className="text-[11px] text-[#555] font-medium uppercase tracking-wide">
                        {new Date(chat.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-[#333] group-hover:text-emerald-400 transition-colors" />
                  </motion.div>
                ))
              ) : (
                <div className="p-10 border border-dashed border-white/10 rounded-3xl text-center">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={20} className="text-[#333]" />
                  </div>
                  <p className="text-xs text-[#555] font-medium uppercase tracking-wider">No recent chats</p>
                </div>
              )}
              
              <button 
                onClick={() => navigate('/chat')}
                className="w-full py-4 text-xs font-bold text-[#777] hover:text-white hover:bg-white/5 rounded-2xl border border-dashed border-white/10 transition-all uppercase tracking-[2px]"
              >
                View all conversations
              </button>
            </div>

            {/* System Status */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">System Status</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#555] font-medium">Memory Usage</span>
                  <span className="text-[#aaa] font-mono tracking-tighter">14.2 MB</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#555] font-medium">Uptime</span>
                  <span className="text-[#aaa] font-mono tracking-tighter">99.99%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                  <div className="w-3/4 h-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
