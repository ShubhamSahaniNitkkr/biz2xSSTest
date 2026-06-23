import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { getToken, clearToken } from './api/client';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PayrollPage from './pages/PayrollPage';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';
import TaxPage from './pages/TaxPage';
import ChecklistPage from './pages/ChecklistPage';

function AppLayout({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  return (
    <div className="layout">
      <nav>
        <span>Hi, {userName}</span>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/payroll">Payroll</NavLink>
        <NavLink to="/upload">Upload</NavLink>
        <NavLink to="/chat">Chat</NavLink>
        <NavLink to="/tax">Tax Simulator</NavLink>
        <NavLink to="/checklist">Checklist</NavLink>
        <button type="button" onClick={onLogout} style={{ marginLeft: 'auto', background: '#64748b' }}>
          Logout
        </button>
      </nav>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/tax" element={<TaxPage />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [userName, setUserName] = useState('Employee');

  function handleLogin(name: string) {
    setUserName(name);
    setLoggedIn(true);
  }

  function handleLogout() {
    clearToken();
    setLoggedIn(false);
  }

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <AppLayout userName={userName} onLogout={handleLogout} />
    </BrowserRouter>
  );
}
