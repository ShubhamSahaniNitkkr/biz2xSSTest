import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { payrollApi, checklistApi } from '../api/client';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import {
  IconPayroll,
  IconChecklist,
  IconUpload,
  IconChat,
  IconTax,
  IconTrendUp,
} from '../components/Icons';

interface Month {
  month: string;
  netPay: number;
  earnings: { gross: number | null };
}

export default function DashboardPage() {
  const [ytd, setYtd] = useState<{ gross: number; netPay: number; months: number } | null>(null);
  const [pending, setPending] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [recentMonths, setRecentMonths] = useState<Month[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([payrollApi.ytd(), checklistApi.get(), payrollApi.months()])
      .then(([ytdData, checklist, months]) => {
        setYtd(ytdData);
        setPending(checklist.filter((i) => i.status === 'required' || i.status === 'overdue').length);
        setTotalItems(checklist.length);
        const m = months as Month[];
        setRecentMonths(m.slice(-6));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const maxNet = Math.max(...recentMonths.map((m) => m.netPay), 1);
  const completedItems = totalItems - pending;
  const completionPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 100;
  const avgMonthlyNet = ytd && ytd.months > 0 ? Math.round(ytd.netPay / ytd.months) : 0;

  if (error) return <div className="alert-error">{error}</div>;

  return (
    <div className="fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Your financial wellness overview at a glance — salary, proofs, and quick actions."
        badge="Overview"
      />

      {loading ? (
        <div className="stat-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-stat" />
          ))}
        </div>
      ) : (
        <div className="stat-grid">
          <StatCard
            label="YTD Gross Salary"
            value={`₹${(ytd?.gross ?? 0).toLocaleString('en-IN')}`}
            hint={`Across ${ytd?.months ?? 0} months`}
            icon={<IconPayroll size={20} />}
            accent="indigo"
          />
          <StatCard
            label="YTD Net Pay"
            value={`₹${(ytd?.netPay ?? 0).toLocaleString('en-IN')}`}
            hint={`~₹${avgMonthlyNet.toLocaleString('en-IN')}/month avg`}
            icon={<IconTrendUp size={20} />}
            accent="emerald"
            trend="up"
          />
          <StatCard
            label="Pending Proofs"
            value={String(pending)}
            hint={pending === 0 ? 'All documents submitted' : 'Items need attention'}
            icon={<IconChecklist size={20} />}
            accent={pending > 0 ? 'amber' : 'emerald'}
          />
          <StatCard
            label="Proof Completion"
            value={`${completionPct}%`}
            hint={`${completedItems} of ${totalItems} done`}
            icon={<IconChecklist size={20} />}
            accent="violet"
          />
        </div>
      )}

      <div className="dashboard-hero">
        <div className="hero-chart card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h2 className="card-title">Net Pay Trend</h2>
            <span className="badge">{recentMonths.length} months</span>
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: 120 }} />
          ) : recentMonths.length > 0 ? (
            <div className="chart-bars">
              {recentMonths.map((m) => (
                <div key={m.month} className="chart-bar-wrap">
                  <div
                    className="chart-bar"
                    style={{ height: `${(m.netPay / maxNet) * 100}%` }}
                    title={`₹${m.netPay.toLocaleString('en-IN')}`}
                  />
                  <span className="chart-bar-label">{m.month.split('-')[1] ?? m.month.slice(-2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No payroll data yet. Upload a payslip to get started.</p>
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: 0, minWidth: 200 }}>
          <h2 className="card-title">Document Progress</h2>
          <div className="progress-ring-wrap">
            <div className="progress-ring">
              <svg viewBox="0 0 100 100" width="100" height="100">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <circle className="progress-ring-bg" cx="50" cy="50" r="42" />
                <circle
                  className="progress-ring-fill"
                  cx="50"
                  cy="50"
                  r="42"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - completionPct / 100)}`}
                />
              </svg>
              <div className="progress-ring-text">
                <span className="progress-ring-value">{completionPct}%</span>
                <span className="progress-ring-label">Complete</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {pending === 0
                  ? 'Great job! All investment proofs are submitted.'
                  : `${pending} document${pending > 1 ? 's' : ''} still pending submission.`}
              </p>
              {pending > 0 && (
                <Link to="/checklist" className="btn-secondary" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>
                  View checklist →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Quick Actions</h2>
        <br/>
        <div className="quick-actions">
          <Link to="/chat" className="quick-action">
            <div className="quick-action-icon"><IconChat size={18} /></div>
            Ask AI Assistant
          </Link>
          <Link to="/upload" className="quick-action">
            <div className="quick-action-icon"><IconUpload size={18} /></div>
            Upload Payslip
          </Link>
          <Link to="/tax" className="quick-action">
            <div className="quick-action-icon"><IconTax size={18} /></div>
            Tax Simulator
          </Link>
          <Link to="/payroll" className="quick-action">
            <div className="quick-action-icon"><IconPayroll size={18} /></div>
            View Payroll
          </Link>
        </div>
      </div>
    </div>
  );
}
