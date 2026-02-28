import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Zap, Shield, Code, ImageIcon, MessageSquare, ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#111111] text-white selection:bg-[#19c37d]/30 selection:text-white overflow-hidden font-sans">
      
      {/* Dynamic Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#19c37d] flex items-center justify-center text-black font-black text-xl shadow-lg shadow-[#19c37d]/20 transition-transform hover:scale-105">
            D
          </div>
          <span className="font-bold text-xl tracking-tight">DarkBot</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#aaa]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#models" className="hover:text-white transition-colors">AI Models</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-white hover:text-[#19c37d] transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link to="/signup" className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-[#e5e5e5] transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
        >
          <Sparkles size={14} className="text-[#19c37d]" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">Now with Gemini 1.5 Pro</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1]"
        >
          Intelligence in its <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
            Darkest Form
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-[#9a9a9a] max-w-2xl mb-12 leading-relaxed"
        >
          Harness the raw power of world-class AI models wrapped in a stunning, distraction-free premium interface. Built for thinkers, creators, and innovators.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link to="/signup" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#19c37d] to-emerald-600 text-black font-bold text-lg flex items-center justify-center gap-2 hover:shadow-[0_0_40px_rgba(25,195,125,0.4)] transition-all active:scale-95 group">
            Begin Your Journey
            <Zap size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all active:scale-95 text-center">
            Sign In
          </Link>
        </motion.div>

      </main>

      {/* Bento Grid Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Designed for Power Users</h2>
          <p className="text-[#9a9a9a]">Everything you need to 10x your productivity, seamlessly integrated.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          
          {/* Feature 1: Multi-Model */}
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-[#1a1a1a] border border-white/5 p-8 group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-purple-500/20 transition-colors" />
            <Bot size={32} className="text-purple-400 mb-6" />
            <h3 className="text-2xl font-bold mb-3">Model Agnostic Intelligence</h3>
            <p className="text-[#9a9a9a] max-w-md">Switch seamlessly between Google Gemini 1.5 and OpenAI GPT-4o depending on your task's complexity, speed requirements, and context length needs.</p>
            
            <div className="absolute bottom-8 right-8 flex gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 backdrop-blur flex items-center justify-center border border-white/10 shadow-xl border-t-white/20">
                <Sparkles size={20} className="text-blue-400" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 backdrop-blur flex items-center justify-center border border-white/10 shadow-xl border-t-white/20 -translate-y-4">
                <Zap size={20} className="text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Feature 2: Privacy */}
          <div className="relative overflow-hidden rounded-3xl bg-[#1a1a1a] border border-white/5 p-8 group hover:border-white/10 transition-colors">
            <Shield size={32} className="text-amber-400 mb-6" />
            <h3 className="text-2xl font-bold mb-3">Military Grade Privacy</h3>
            <p className="text-[#9a9a9a]">Your data is encrypted end-to-end. We don't train models on your personal conversations or proprietary code.</p>
          </div>

          {/* Feature 3: Code Assist */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-white/5 p-8 group hover:border-white/10 transition-colors">
            <Code size={32} className="text-blue-400 mb-6" />
            <h3 className="text-2xl font-bold mb-3">Dev-First Experience</h3>
            <p className="text-[#9a9a9a]">Native markdown support, syntax highlighting for 100+ languages, and one-click copy functionality.</p>
          </div>

          {/* Feature 4: Context Memory */}
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-[#19c37d]/5 border border-[#19c37d]/10 p-8 group hover:border-[#19c37d]/20 transition-colors">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
            <MessageSquare size={32} className="text-[#19c37d] mb-6 relative z-10" />
            <h3 className="text-2xl font-bold mb-3 text-white relative z-10">Infinite Context Windows</h3>
            <p className="text-[#9a9a9a] max-w-md relative z-10">Upload entire codebases, massive PDFs, or write a whole book. With Gemini's 2-million token window, DarkBot remembers every detail.</p>
            
            <Link to="/signup" className="mt-8 inline-flex items-center gap-2 text-[#19c37d] font-bold hover:text-emerald-400 transition-colors relative z-10">
              Try it now <ChevronRight size={16} />
            </Link>
          </div>

        </div>
      </section>

      {/* Light Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#19c37d] flex items-center justify-center text-black font-black text-[10px]">D</div>
            <span className="font-bold text-sm">DarkBot © 2026</span>
          </div>
          <p className="text-xs text-[#555]">Designed and built for peak performance.</p>
        </div>
      </footer>

    </div>
  );
}
