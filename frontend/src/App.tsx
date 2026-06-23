import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { getToken, clearToken } from './api/client';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PayrollPage from './pages/PayrollPage';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';
import TaxPage from './pages/TaxPage';
import ChecklistPage from './pages/ChecklistPage';
import StickyChatbot from './components/StickyChatbot';
import {
  IconDashboard,
  IconPayroll,
  IconUpload,
  IconChat,
  IconTax,
  IconChecklist,
  IconLogout,
  IconMenu,
  IconSparkle,
  IconChevronLeft,
  IconChevronRight,
} from './components/Icons';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/payroll', label: 'Payroll', icon: IconPayroll },
  { to: '/upload', label: 'Upload', icon: IconUpload },
  { to: '/chat', label: 'AI Chat', icon: IconChat },
  { to: '/tax', label: 'Tax Simulator', icon: IconTax },
  { to: '/checklist', label: 'Checklist', icon: IconChecklist },
];

const SIDEBAR_COLLAPSED_KEY = 'finwell-sidebar-collapsed';

function readSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

function AppLayout({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    } catch {
      /* ignore storage errors */
    }
  }, [sidebarCollapsed]);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function toggleSidebarCollapsed() {
    setSidebarCollapsed((prev) => !prev);
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <IconSparkle size={18} />
          </div>
          <div className="sidebar-brand-text">
            <h2>FinWell</h2>
            <span>Financial Wellness</span>
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={toggleSidebarCollapsed}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={18} />
              <span className="nav-link-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <p className="user-name">{userName}</p>
              <p className="user-role">Employee</p>
            </div>
          </div>
          <button type="button" className="btn-logout" onClick={onLogout} title="Sign out">
            <IconLogout size={16} />
            <span className="btn-logout-text">Sign out</span>
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="mobile-header">
          <button
            type="button"
            className="btn-icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu size={20} />
          </button>
          <div className="mobile-brand">
            <div className="sidebar-logo mobile-brand-logo">
              <IconSparkle size={14} />
            </div>
            FinWell
          </div>
          <button type="button" className="btn-icon" onClick={onLogout} aria-label="Sign out">
            <IconLogout size={18} />
          </button>
        </header>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/tax" element={<TaxPage />} />
            <Route path="/checklist" element={<ChecklistPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <StickyChatbot />
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
