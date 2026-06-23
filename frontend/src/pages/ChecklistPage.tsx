import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checklistApi } from '../api/client';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';

interface Item {
  id: string;
  title: string;
  description: string;
  status: string;
}

const STATUS_ORDER: Record<string, number> = {
  overdue: 0,
  required: 1,
  pending: 2,
  submitted: 3,
  done: 4,
  complete: 5,
};

export default function ChecklistPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checklistApi.get()
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99),
        );
        setItems(sorted);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const done = items.filter((i) => ['submitted', 'done', 'complete'].includes(i.status)).length;
  const pending = items.filter((i) => ['required', 'overdue', 'pending'].includes(i.status)).length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader label="Loading your checklist..." />
      </div>
    );
  }

  if (error) return <div className="alert-error">{error}</div>;

  return (
    <div className="fade-in">
      <PageHeader
        title="Document Checklist"
        subtitle="Track your investment proof submissions for tax declaration season."
        badge="Compliance"
      />

      <div className="stat-grid">
        <div className="stat-card stat-card-indigo">
          <p className="stat-label">Total Items</p>
          <p className="stat-value">{items.length}</p>
        </div>
        <div className="stat-card stat-card-emerald">
          <p className="stat-label">Completed</p>
          <p className="stat-value">{done}</p>
        </div>
        <div className="stat-card stat-card-amber">
          <p className="stat-label">Pending</p>
          <p className="stat-value">{pending}</p>
        </div>
        <div className="stat-card stat-card-violet">
          <p className="stat-label">Progress</p>
          <p className="stat-value">{pct}%</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Submission Progress</h2>
          <span className="badge">{done}/{items.length} done</span>
        </div>

        <div className="checklist-progress-bar">
          <div className="checklist-progress-fill" style={{ width: `${pct}%` }} />
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No checklist items found.</p>
          </div>
        ) : (
          items.map((item) => {
            const isDone = ['submitted', 'done', 'complete'].includes(item.status);
            const isOverdue = item.status === 'overdue';
            return (
              <div
                key={item.id}
                className={`checklist-item ${isDone ? 'done' : ''} ${isOverdue ? 'overdue' : ''}`}
              >
                <div className="checklist-check">
                  {isDone && '✓'}
                  {isOverdue && '!'}
                </div>
                <div className="checklist-content">
                  <div className="checklist-title-row">
                    <span className="checklist-title">{item.title}</span>
                    <span className={`badge ${item.status}`}>{item.status}</span>
                  </div>
                  <p className="checklist-desc">{item.description}</p>
                </div>
              </div>
            );
          })
        )}

        {pending > 0 && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/upload" className="btn-primary">
              Upload documents →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
