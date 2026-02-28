import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Paperclip, Loader2, Bot, Sparkles,
  X, ChevronDown, Zap, FileText, Image as ImgIcon,
  Copy, Check, Menu,
} from 'lucide-react';
import { chatService } from '../services/api';

/* ── Suggestion cards ───────────────────────── */
const SUGGESTIONS = [
  { emoji: '✍️', title: 'Help me write',    body: 'a professional email to my team about a deadline' },
  { emoji: '🧠', title: 'Explain a concept', body: 'quantum computing in simple, easy terms' },
  { emoji: '💡', title: 'Brainstorm ideas',  body: 'for a startup in the AI space' },
  { emoji: '🐛', title: 'Debug my code',     body: 'paste code below and describe the error' },
];

/* ── AI providers ───────────────────────────── */
const PROVIDERS = [
  { id: 'gemini', label: 'Gemini 1.5 Flash', icon: <Sparkles size={14} className="text-blue-400" /> },
  { id: 'openai', label: 'GPT-4o',           icon: <Zap      size={14} className="text-green-400" /> },
];

/* ── Copy button ────────────────────────────── */
function CopyBtn({ text, small = false }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={doCopy}
      className={`flex items-center gap-1 rounded-lg text-[#9a9a9a] hover:text-white transition-all
        ${small ? 'p-1.5 hover:bg-white/5' : 'px-2.5 py-1.5 text-xs hover:bg-white/5'}`}>
      {copied ? <Check size={small ? 13 : 13} /> : <Copy size={small ? 13 : 13} />}
      {!small && <span>{copied ? 'Copied' : 'Copy'}</span>}
    </button>
  );
}

/* ── ReactMarkdown component overrides ──────── */
function MdComponents() {
  return {
    p:    ({ children }) => <p className="mb-3 last:mb-0 leading-[1.72]">{children}</p>,
    h1:   ({ children }) => <h1 className="text-xl font-bold mt-6 mb-3 text-white">{children}</h1>,
    h2:   ({ children }) => <h2 className="text-lg font-semibold mt-5 mb-2 text-white">{children}</h2>,
    h3:   ({ children }) => <h3 className="text-base font-semibold mt-4 mb-1.5 text-white">{children}</h3>,
    ul:   ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 pl-1">{children}</ul>,
    ol:   ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 pl-1">{children}</ol>,
    li:   ({ children }) => <li className="leading-relaxed">{children}</li>,
    hr:   ()             => <hr className="my-4 border-white/10" />,
    blockquote: ({ children }) => (
      <blockquote className="border-l-3 border-white/20 pl-4 my-3 text-[#9a9a9a] italic">{children}</blockquote>
    ),
    a:   ({ href, children }) => (
      <a href={href} target="_blank" rel="noreferrer" className="text-[#19c37d] underline hover:opacity-80">{children}</a>
    ),
    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
    table: ({ children }) => (
      <div className="overflow-x-auto my-4 rounded-xl border border-white/10">
        <table className="text-sm border-collapse w-full">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border-b border-white/10 bg-white/5 px-4 py-2.5 text-left font-semibold text-white">{children}</th>,
    td: ({ children }) => <td className="border-b border-white/[0.06] px-4 py-2.5">{children}</td>,
    code: ({ inline, className, children }) => {
      const code = String(children).replace(/\n$/, '');
      const lang = (className || '').replace('language-', '') || 'code';
      if (inline) return (
        <code className="bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-[0.83em] text-[#e2e8f0]">{code}</code>
      );
      return (
        <div className="relative my-4 group rounded-xl overflow-hidden border border-white/10 shadow-lg">
          <div className="flex items-center justify-between bg-[#1a1a1a] px-4 py-2.5 border-b border-white/10">
            <span className="text-xs text-[#9a9a9a] font-mono font-medium">{lang}</span>
            <CopyBtn text={code} small />
          </div>
          <pre className="bg-[#0d0d0d] overflow-x-auto px-5 py-4 m-0">
            <code className="font-mono text-[0.84em] text-[#e2e8f0] whitespace-pre">{code}</code>
          </pre>
        </div>
      );
    },
  };
}

/* ══════════════════════════════════════════════
   MAIN ChatPage
══════════════════════════════════════════════ */
export default function ChatPage({ user, onMenuClick }) {
  const { chatId } = useParams();   // ← matches App.jsx :chatId
  const navigate   = useNavigate();

  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [files,     setFiles]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(false);
  const [provider,  setProvider]  = useState(user?.preferences?.aiProvider || 'gemini');
  const [ddOpen,    setDdOpen]    = useState(false);

  const endRef  = useRef(null);
  const fileRef = useRef(null);
  const textRef = useRef(null);

  /* scroll to bottom */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* auto-resize textarea */
  useEffect(() => {
    if (!textRef.current) return;
    textRef.current.style.height = 'auto';
    textRef.current.style.height = Math.min(textRef.current.scrollHeight, 220) + 'px';
  }, [input]);

  /* load chat on route change */
  useEffect(() => {
    if (chatId) loadChat();
    else { setMessages([]); }
  }, [chatId]);

  async function loadChat() {
    setFetching(true);
    try {
      const r = await chatService.getChat(chatId);
      if (r.data.success) {
        setMessages(r.data.chat.messages || []);
        setProvider(r.data.chat.aiProvider || 'gemini');
      }
    } catch { navigate('/'); }
    finally { setFetching(false); }
  }

  async function send(text) {
    const msg = (text !== undefined ? text : input).trim();
    if ((!msg && files.length === 0) || loading) return;

    // Optimistic UI
    setMessages(p => [...p, { role: 'user', content: msg, timestamp: new Date().toISOString() }]);
    setInput('');
    setFiles([]);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('message',    msg);
      fd.append('aiProvider', provider);
      if (chatId) fd.append('chatId', chatId);
      files.forEach(f => fd.append('files', f));

      const r = await chatService.sendMessage(fd);
      if (r.data.success) {
        setMessages(p => [...p, {
          role: 'assistant',
          content: r.data.response,
          timestamp: new Date().toISOString(),
        }]);
        if (!chatId) navigate(`/chat/${r.data.chatId}`, { replace: true });
      }
    } catch (err) {
      setMessages(p => [...p, {
        role: 'assistant',
        content: `**Error:** ${err.response?.data?.message || 'Something went wrong. Please try again.'}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally { setLoading(false); }
  }

  const onKey  = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const canSend = (input.trim() || files.length > 0) && !loading;
  const isEmpty = messages.length === 0 && !fetching;
  const current = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  return (
    <div className="flex flex-col h-full bg-[#212121]" onClick={() => setDdOpen(false)}>

      {/* ── Header ─────────────────────────────── */}
      <header className="flex items-center h-14 px-4 flex-shrink-0 border-b border-white/[0.06]">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 mr-2 hover:bg-white/10 rounded-xl text-[#9a9a9a] hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Provider dropdown — centered */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setDdOpen(o => !o); }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-white/10
                         text-[#ececec] text-sm font-medium transition-colors"
            >
              {current.icon}
              <span className="hidden sm:inline">{current.label}</span>
              <span className="sm:hidden">
                {provider === 'gemini' ? 'Gemini' : 'GPT-4o'}
              </span>
              <ChevronDown size={13} className={`text-[#9a9a9a] transition-transform ${ddOpen ? 'rotate-180' : ''}`} />
            </button>

            {ddOpen && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#2f2f2f] border border-white/10
                              rounded-2xl shadow-2xl overflow-hidden min-w-[220px] z-50">
                {PROVIDERS.map(p => (
                  <button key={p.id}
                    onClick={e => { e.stopPropagation(); setProvider(p.id); setDdOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-white/5
                      ${provider === p.id ? 'text-white font-medium' : 'text-[#c5c5c5]'}`}>
                    {p.icon}
                    <div className="flex flex-col items-start">
                      <span>{p.label}</span>
                      <span className="text-[11px] text-[#555]">
                        {p.id === 'gemini' ? 'Google · Fast & free' : 'OpenAI · Requires API key'}
                      </span>
                    </div>
                    {provider === p.id && <Check size={14} className="ml-auto text-[#19c37d]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right spacer (balance menu button) */}
        <div className="w-10 lg:hidden" />
      </header>

      {/* ── Messages ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {fetching && (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="text-[#9a9a9a] animate-spin" />
          </div>
        )}

        {/* Empty / welcome state */}
        {!fetching && isEmpty && (
          <div className="flex flex-col items-center justify-center min-h-full gap-8 px-4 py-12 pb-24">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#19c37d] flex items-center justify-center
                              text-black font-black text-3xl mx-auto mb-4 shadow-xl shadow-[#19c37d]/20">
                D
              </div>
              <h2 className="text-2xl sm:text-[28px] font-semibold text-white leading-tight">
                What can I help with?
              </h2>
              <p className="mt-2 text-sm text-[#9a9a9a]">
                Ask anything — code, writing, analysis, or general questions.
              </p>
            </div>

            {/* Suggestion cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[580px]">
              {SUGGESTIONS.map((s, i) => (
                <button key={i}
                  onClick={() => send(`${s.title} — ${s.body}`)}
                  className="flex flex-col items-start gap-1.5 p-4 bg-[#2f2f2f] hover:bg-[#353535]
                             border border-white/[0.08] hover:border-white/[0.15] rounded-2xl
                             text-left transition-all cursor-pointer"
                >
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-sm font-semibold text-white">{s.title}</span>
                  <span className="text-xs text-[#9a9a9a] line-clamp-2">{s.body}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages list */}
        {!fetching && messages.length > 0 && (
          <div className="w-full max-w-[820px] mx-auto px-4 sm:px-6 py-6 space-y-1">
            {messages.map((m, i) => (
              <MsgRow key={i} msg={m} provider={provider} />
            ))}
            {loading && <TypingDots provider={provider} />}
            <div ref={endRef} className="h-2" />
          </div>
        )}

        {loading && messages.length === 0 && (
          <div className="w-full max-w-[820px] mx-auto px-4 sm:px-6 py-6">
            <TypingDots provider={provider} />
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* ── Input ──────────────────────────────── */}
      <div className="flex-shrink-0 px-4 sm:px-6 pb-5 pt-3">
        <div className="w-full max-w-[820px] mx-auto">

          {/* File chips */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {files.map((f, i) => (
                <div key={i}
                  className="flex items-center gap-2 bg-[#2f2f2f] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white">
                  {f.type.startsWith('image/') ? <ImgIcon size={13} className="text-blue-400" /> : <FileText size={13} className="text-[#9a9a9a]" />}
                  <span className="max-w-[120px] truncate">{f.name}</span>
                  <button onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))}
                    className="text-[#9a9a9a] hover:text-red-400 transition-colors ml-0.5">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input box */}
          <div className="flex items-end gap-2.5 bg-[#2f2f2f] border border-white/10
                          rounded-2xl px-3 py-2.5 focus-within:border-white/25 transition-colors
                          shadow-xl shadow-black/20">

            {/* Attach */}
            <button onClick={() => fileRef.current?.click()} type="button"
              title="Attach file"
              className="mb-1 p-1.5 rounded-xl text-[#9a9a9a] hover:text-white hover:bg-white/5 transition-all flex-shrink-0">
              <Paperclip size={20} />
            </button>
            <input type="file" ref={fileRef}
              onChange={e => setFiles(p => [...p, ...Array.from(e.target.files)].slice(0, 5))}
              multiple className="hidden" />

            {/* Textarea */}
            <textarea
              ref={textRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Message DarkBot…"
              rows={1}
              className="flex-1 bg-transparent text-[#ececec] placeholder-[#555] resize-none
                         focus:outline-none text-[15px] leading-[1.55] max-h-[220px] py-1.5"
            />

            {/* Send */}
            <button onClick={() => send()} disabled={!canSend} type="button"
              className={`mb-1 p-2.5 rounded-xl flex-shrink-0 transition-all
                ${canSend
                  ? 'bg-white text-black hover:bg-[#e5e5e5] shadow-sm'
                  : 'bg-[#3a3a3a] text-[#666] cursor-not-allowed'}`}>
              {loading
                ? <Loader2 size={17} className="animate-spin" />
                : <Send    size={17} />}
            </button>
          </div>

          <p className="text-center text-xs text-[#555] mt-2.5 px-4">
            DarkBot can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Message Row ────────────────────────────── */
function MsgRow({ msg, provider }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`group flex gap-3 sm:gap-5 py-5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-up`}>

      {/* AI avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 bg-white flex items-center justify-center shadow mt-0.5">
          {provider === 'openai'
            ? <Bot      size={17} className="text-black" />
            : <Sparkles size={15} className="text-black" />}
        </div>
      )}

      {/* Content */}
      <div className={`min-w-0 ${isUser ? 'max-w-[75%] sm:max-w-[70%]' : 'flex-1 max-w-[100%] sm:max-w-[88%]'}`}>
        {isUser ? (
          <div className="bg-[#2f2f2f] text-white rounded-3xl rounded-br-lg px-5 py-3 text-[15px] leading-[1.65] break-words">
            {msg.content}
          </div>
        ) : (
          <div>
            <div className="text-[15px] text-[#e8e8e8] markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MdComponents()}>
                {msg.content}
              </ReactMarkdown>
            </div>
            {/* Action row */}
            <div className="mt-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyBtn text={msg.content} />
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 bg-[#19c37d] flex items-center justify-center
                        text-black font-bold text-sm shadow self-end flex-shrink-0">
          {/* first letter */}
          {String.fromCharCode(65 + Math.floor(Math.random() * 0))}U
        </div>
      )}
    </div>
  );
}

/* ── Typing dots ────────────────────────────── */
function TypingDots({ provider }) {
  return (
    <div className="flex gap-3 sm:gap-5 py-5 animate-fade-up">
      <div className="w-8 h-8 rounded-full flex-shrink-0 bg-white flex items-center justify-center shadow mt-0.5">
        {provider === 'openai'
          ? <Bot      size={17} className="text-black" />
          : <Sparkles size={15} className="text-black" />}
      </div>
      <div className="flex items-center gap-1.5 mt-3">
        {[0, 1, 2].map(i => (
          <span key={i}
            className="w-2 h-2 bg-[#9a9a9a] rounded-full inline-block"
            style={{ animation: `blink 1.2s ${i * 0.2}s ease-in-out infinite` }} />
        ))}
      </div>
    </div>
  );
}
