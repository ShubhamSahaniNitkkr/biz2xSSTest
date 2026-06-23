import { useState } from 'react';
import { authApi, setToken } from '../api/client';
import Loader from '../components/Loader';
import { IconShield, IconSparkle } from '../components/Icons';

interface Props {
  onLogin: (name: string) => void;
}

const DEMO_USERS = [
  'employee1@company.com',
  'employee2@company.com',
  'admin@company.com',
];

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState(DEMO_USERS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await authApi.login(email);
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Sign in with a demo employee account to explore the platform.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Work email</label>
              <select id="email" value={email} onChange={(e) => setEmail(e.target.value)}>
                {DEMO_USERS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
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
          Demo accounts pre-loaded with payslip & payroll data
        </p>
      </div>
    </div>
  );
}
