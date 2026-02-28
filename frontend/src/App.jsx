import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar   from './components/Sidebar';
import ChatPage  from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Settings  from './pages/SettingsPage';
import HomePage  from './pages/HomePage';
import { userService } from './services/api';

export default function App() {
  const [user, setUser]       = useState(null);
  const [booting, setBooting] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);  // mobile toggle

  useEffect(() => {
    userService.getProfile()
      .then(r => r.data.success && setUser(r.data.user))
      .catch(() => {})
      .finally(() => setBooting(false));
  }, []);

  if (booting) return (
    <div className="h-full w-full flex items-center justify-center bg-[#212121]">
      <div className="w-8 h-8 rounded-full border-2 border-[#19c37d]/25 border-t-[#19c37d] animate-spin" />
    </div>
  );

  return (
    <Router>
      <div className={`flex h-full w-full bg-[#212121] text-[#ececec] ${user ? 'overflow-hidden' : ''}`}>
        {/* Mobile overlay */}
        {user && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        {user && (
          <div className={`
            fixed lg:relative inset-y-0 left-0 z-40
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <Sidebar user={user} setUser={setUser} onClose={() => setSidebarOpen(false)} />
          </div>
        )}

        <main className={`flex-1 min-w-0 bg-[#212121] overflow-y-auto custom-scrollbar`}>
          <Routes>
            <Route path="/"          element={user ? <DashboardPage user={user} onMenuClick={() => setSidebarOpen(true)} /> : <HomePage />} />
            <Route path="/chat"      element={user ? <ChatPage user={user} onMenuClick={() => setSidebarOpen(true)} /> : <Navigate to="/login" />} />
            <Route path="/chat/:chatId" element={user ? <ChatPage user={user} onMenuClick={() => setSidebarOpen(true)} /> : <Navigate to="/login" />} />
            <Route path="/settings"  element={user ? <Settings user={user} setUser={setUser} /> : <Navigate to="/login" />} />
            <Route path="/login"     element={!user ? <LoginPage  setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/signup"    element={!user ? <SignupPage setUser={setUser} /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
