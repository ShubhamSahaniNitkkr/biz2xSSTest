import { useState } from 'react';
import { authApi, setToken } from '../api/client';

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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="card login-card">
        <h1>Financial Wellness Agent</h1>
        <p>Sign in with a demo employee account.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <select id="email" value={email} onChange={(e) => setEmail(e.target.value)}>
            {DEMO_USERS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  );
}
