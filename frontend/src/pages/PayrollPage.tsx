import { useEffect, useState } from 'react';
import { payrollApi } from '../api/client';

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
  const [error, setError] = useState('');

  useEffect(() => {
    payrollApi.months()
      .then((data) => {
        const m = data as Month[];
        setMonths(m);
        if (m.length >= 2) {
          setFrom(m[m.length - 2].month);
          setTo(m[m.length - 1].month);
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  async function handleCompare() {
    try {
      const result = await payrollApi.compare(from, to);
      setCompare(result.changes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Compare failed');
    }
  }

  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h1>Payroll</h1>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Gross</th>
              <th>HRA</th>
              <th>TDS</th>
              <th>Net Pay</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month}>
                <td>{m.month}</td>
                <td>₹{(m.earnings.gross ?? 0).toLocaleString('en-IN')}</td>
                <td>₹{(m.earnings.hra ?? 0).toLocaleString('en-IN')}</td>
                <td>₹{(m.deductions.tds ?? 0).toLocaleString('en-IN')}</td>
                <td>₹{m.netPay.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {months.length >= 2 && (
        <div className="card">
          <h2>Compare months</h2>
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {months.map((m) => <option key={m.month} value={m.month}>{m.month}</option>)}
          </select>
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {months.map((m) => <option key={m.month} value={m.month}>{m.month}</option>)}
          </select>
          <button type="button" onClick={handleCompare}>Compare</button>
          {compare.length > 0 && (
            <ul>
              {compare.map((c) => (
                <li key={c.field}>
                  {c.field}: ₹{c.from.toLocaleString('en-IN')} → ₹{c.to.toLocaleString('en-IN')}
                  ({c.delta >= 0 ? '+' : ''}{c.delta.toLocaleString('en-IN')})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
