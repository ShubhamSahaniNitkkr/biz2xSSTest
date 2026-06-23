import { useEffect, useState } from 'react';
import { payrollApi } from '../api/client';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { IconTrendUp, IconTrendDown } from '../components/Icons';

interface Month {
  month: string;
  netPay: number;
  earnings: { gross: number | null; hra: number | null };
  deductions: { tds: number | null; pf: number | null; total: number | null };
}

export default function PayrollPage() {
  const [months, setMonths] = useState<Month[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [compare, setCompare] = useState<{ field: string; from: number; to: number; delta: number }[]>([]);
  const [comparing, setComparing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    payrollApi.months()
      .then((data) => {
        const m = data as Month[];
        setMonths(m);
        if (m.length >= 2) {
          setFrom(m[m.length - 2].month);
          setTo(m[m.length - 1].month);
        } else if (m.length === 1) {
          setFrom(m[0].month);
          setTo(m[0].month);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCompare() {
    if (!from || !to || from === to) return;
    setComparing(true);
    setError('');
    try {
      const result = await payrollApi.compare(from, to);
      setCompare(result.changes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Compare failed');
    } finally {
      setComparing(false);
    }
  }

  const latestMonth = months[months.length - 1];
  const totalGross = months.reduce((s, m) => s + (m.earnings.gross ?? 0), 0);
  const totalNet = months.reduce((s, m) => s + m.netPay, 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader label="Loading payroll data..." />
      </div>
    );
  }

  if (error && months.length === 0) return <div className="alert-error">{error}</div>;

  return (
    <div className="fade-in">
      <PageHeader
        title="Payroll"
        subtitle="Monthly salary breakdown with earnings, deductions, and month-over-month comparison."
        badge="Salary"
      />

      <div className="stat-grid">
        <div className="stat-card stat-card-indigo">
          <p className="stat-label">Total Months</p>
          <p className="stat-value">{months.length}</p>
        </div>
        <div className="stat-card stat-card-emerald">
          <p className="stat-label">Total Gross</p>
          <p className="stat-value">₹{totalGross.toLocaleString('en-IN')}</p>
        </div>
        <div className="stat-card stat-card-violet">
          <p className="stat-label">Total Net</p>
          <p className="stat-value">₹{totalNet.toLocaleString('en-IN')}</p>
        </div>
        {latestMonth && (
          <div className="stat-card stat-card-amber">
            <p className="stat-label">Latest Net ({latestMonth.month})</p>
            <p className="stat-value">₹{latestMonth.netPay.toLocaleString('en-IN')}</p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Monthly Breakdown</h2>
          <span className="badge">{months.length} records</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Gross</th>
                <th>HRA</th>
                <th>TDS</th>
                <th>PF</th>
                <th>Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m, idx) => (
                <tr key={m.month} className={idx === months.length - 1 ? 'month-highlight' : ''}>
                  <td>
                    <strong>{m.month}</strong>
                    {idx === months.length - 1 && (
                      <span className="badge" style={{ marginLeft: '0.5rem' }}>Latest</span>
                    )}
                  </td>
                  <td className="td-mono">₹{(m.earnings.gross ?? 0).toLocaleString('en-IN')}</td>
                  <td className="td-mono">₹{(m.earnings.hra ?? 0).toLocaleString('en-IN')}</td>
                  <td className="td-mono">₹{(m.deductions.tds ?? 0).toLocaleString('en-IN')}</td>
                  <td className="td-mono">₹{(m.deductions.pf ?? 0).toLocaleString('en-IN')}</td>
                  <td className="td-mono" style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    ₹{m.netPay.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {months.length >= 2 && (
        <div className="card compare-panel">
          <div className="card-header">
            <h2 className="card-title">Month Comparison</h2>
            <span className="badge">Delta analysis</span>
          </div>

          <div className="compare-selects">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From month</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)}>
                {months.map((m) => <option key={m.month} value={m.month}>{m.month}</option>)}
              </select>
            </div>
            <span className="compare-vs">vs</span>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To month</label>
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                {months.map((m) => <option key={m.month} value={m.month}>{m.month}</option>)}
              </select>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={handleCompare}
            disabled={comparing || from === to}
            style={{ alignSelf: 'flex-start' }}
          >
            {comparing ? 'Comparing...' : 'Compare months'}
          </button>

          {error && months.length > 0 && <div className="alert-error">{error}</div>}

          {comparing && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
              <Loader size="sm" label="Calculating differences..." />
            </div>
          )}

          {compare.length > 0 && !comparing && (
            <div className="compare-results fade-in">
              {compare.map((c) => (
                <div key={c.field} className="compare-item">
                  <span className="compare-field">{c.field.replace(/_/g, ' ')}</span>
                  <div className="compare-values">
                    <span>₹{c.from.toLocaleString('en-IN')}</span>
                    <span className="compare-arrow">→</span>
                    <span>₹{c.to.toLocaleString('en-IN')}</span>
                    <span className={`compare-delta ${c.delta >= 0 ? 'positive' : 'negative'}`}>
                      {c.delta >= 0 ? <IconTrendUp size={12} /> : <IconTrendDown size={12} />}
                      {' '}{c.delta >= 0 ? '+' : ''}₹{c.delta.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
