import { useState } from 'react';
import { taxApi } from '../api/client';

export default function TaxPage() {
  const [extra80C, setExtra80C] = useState(50000);
  const [result, setResult] = useState<{
    annualTaxSaving: number;
    monthlyTdsSaving: number;
    steps: { label: string; value: number; note: string }[];
    assumptions: string[];
    note?: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSimulate() {
    setError('');
    setLoading(true);
    try {
      const data = await taxApi.simulate(extra80C);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Tax saving simulator</h1>
      <div className="card">
        <p>Estimate impact of additional Section 80C investment (simplified assumptions).</p>
        <label htmlFor="extra80c">Additional 80C (₹)</label>
        <input
          id="extra80c"
          type="number"
          min={0}
          max={150000}
          value={extra80C}
          onChange={(e) => setExtra80C(Number(e.target.value))}
        />
        <button type="button" onClick={handleSimulate} disabled={loading}>
          {loading ? 'Calculating...' : 'Simulate'}
        </button>
        {error && <div className="error">{error}</div>}
        {result && (
          <>
            <div className="success" style={{ marginTop: '1rem' }}>
              Annual tax saving: ₹{result.annualTaxSaving.toLocaleString('en-IN')} —
              Monthly TDS saving: ₹{result.monthlyTdsSaving.toLocaleString('en-IN')}
              {result.note && <p>{result.note}</p>}
            </div>
            <h3>Step-by-step</h3>
            <table>
              <thead>
                <tr><th>Step</th><th>Value</th><th>Note</th></tr>
              </thead>
              <tbody>
                {result.steps.map((s) => (
                  <tr key={s.label}>
                    <td>{s.label}</td>
                    <td>₹{s.value.toLocaleString('en-IN')}</td>
                    <td>{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3>Assumptions</h3>
            <ul>
              {result.assumptions.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
