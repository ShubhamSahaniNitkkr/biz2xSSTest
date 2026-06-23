import { useEffect, useState } from 'react';
import { payrollApi, checklistApi } from '../api/client';

export default function DashboardPage() {
  const [ytd, setYtd] = useState<{ gross: number; netPay: number; months: number } | null>(null);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([payrollApi.ytd(), checklistApi.get()])
      .then(([ytdData, checklist]) => {
        setYtd(ytdData);
        setPending(checklist.filter((i) => i.status === 'required' || i.status === 'overdue').length);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="card">
        <h2>Year to date</h2>
        {ytd ? (
          <p>
            Based on <strong>{ytd.months}</strong> months — Gross: ₹{ytd.gross.toLocaleString('en-IN')},
            Net: ₹{ytd.netPay.toLocaleString('en-IN')}
          </p>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="card">
        <h2>Pending proofs</h2>
        <p>{pending === 0 ? 'All proofs submitted.' : `${pending} item(s) need your attention.`}</p>
      </div>
    </div>
  );
}
