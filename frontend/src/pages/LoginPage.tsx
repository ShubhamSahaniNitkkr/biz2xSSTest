import { useState } from 'react';
import { authApi, setToken } from '../api/client';
import Loader from '../components/Loader';
import { IconShield, IconSparkle } from '../components/Icons';

interface Props {
  onLogin: (name: string) => void;
}

const DEMO_USERS = [
  {
    email: 'employee1@company.com',
    password: 'demo123',
    name: 'Shubham Sunny',
    role: 'Employee',
    profile: 'Payroll + pending proof checklist',
  },
  {
    email: 'employee2@company.com',
    password: 'demo456',
    name: 'Demo User Two',
    role: 'Employee',
    profile: 'Payroll + all proofs submitted',
  },
  {
    email: 'admin@company.com',
    password: 'admin123',
    name: 'Platform Admin',
    role: 'Admin',
    profile: 'Admin access (same employee views)',
  },
] as const;

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState<string>(DEMO_USERS[0].email);
  const [password, setPassword] = useState<string>(DEMO_USERS[0].password);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function applyDemoUser(user: (typeof DEMO_USERS)[number]) {
    setEmail(user.email);
    setPassword(user.password);
    setShowDemoModal(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await authApi.login(email, password);
      setToken(result.token);
      onLogin(result.user.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  }

  if (loading) {
    return <Loader fullScreen label="Signing you in securely..." />;
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
      </div>

      <div className="login-container fade-in">
        <div className="login-brand">
          <div className="login-logo">
            <IconSparkle size={28} />
          </div>
          <h1>FinWell</h1>
          <p>Your AI-powered financial wellness companion</p>
        </div>

        <div className="card login-card">
          <h2 style={{ marginBottom: '0.5rem' }}>Welcome back</h2>
          <p className="login-card-subtitle">
            Sign in with your work email to explore the platform.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginBottom: '0.35rem',
                }}
              >
                <label className="form-label" htmlFor="email" style={{ marginBottom: 0 }}>
                  Work email
                </label>
                <span style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    onClick={() => setShowDemoModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      font: 'inherit',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Login with other demo account
                  </button>
                  <span
                    title="Tap the link to view demo emails and passwords"
                    aria-label="Demo account help"
                    style={{ color: 'var(--text-muted)', marginLeft: '0.2rem', cursor: 'default' }}
                  >
                    ?
                  </span>
                </span>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && <div className="alert-error">{error}</div>}

            <button type="submit" className="btn-primary">
              <IconShield size={18} />
              Sign in securely
            </button>
          </form>

          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon">🔒</div>
              Private data
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">🤖</div>
              AI grounded
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">📊</div>
              Tax insights
            </div>
          </div>
        </div>

        <p className="login-demo-hint">
          Demo accounts pre-loaded with payslip &amp; payroll data
        </p>
      </div>

      {showDemoModal && (
        <>
          <style>{`
            @keyframes loginDemoPop {
              from { opacity: 0; transform: translateY(10px) scale(0.97); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .login-demo-modal-overlay {
              animation: fadeIn 0.18s ease;
            }
            .login-demo-modal-content {
              animation: loginDemoPop 0.22s ease;
            }
          `}</style>
          <div
            role="presentation"
            className="login-demo-modal-overlay"
            onClick={() => setShowDemoModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              zIndex: 300,
            }}
          >
            <div
              role="dialog"
              aria-labelledby="demo-modal-title"
              aria-modal="true"
              className="card login-demo-modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '380px',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '1rem 1.1rem',
              }}
            >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <h3 id="demo-modal-title" style={{ margin: 0, fontSize: '1rem' }}>
                Demo accounts
              </h3>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                aria-label="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                ×
              </button>
            </div>
            <p className="login-demo-intro" style={{ marginBottom: '0.65rem', fontSize: '0.8rem' }}>
              Select an account to fill email and password.
            </p>
            <ul className="login-demo-list" style={{ gap: '0.5rem' }}>
              {DEMO_USERS.map((user) => (
                <li key={user.email}>
                  <button
                    type="button"
                    onClick={() => applyDemoUser(user)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      font: 'inherit',
                      color: 'inherit',
                    }}
                  >
                    <div className="login-demo-list-header">
                      <strong style={{ fontSize: '0.88rem' }}>{user.name}</strong>
                      <span className="login-demo-role">{user.role}</span>
                    </div>
                    <div className="login-demo-creds">
                      <span><em>Email</em> {user.email}</span>
                      <span><em>Password</em> {user.password}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
