import { useState } from 'react';
import { taxApi } from '../api/client';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { IconTax, IconSparkle } from '../components/Icons';

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

  const sliderPct = (extra80C / 150000) * 100;

  return (
    <div className="fade-in">
      <PageHeader
        title="Tax Saving Simulator"
        subtitle="Estimate the impact of additional Section 80C investments on your annual tax and monthly TDS."
        badge="Tax Planning"
      />

      <div className="card" style={{ position: 'relative' }}>
        {loading && <Loader overlay label="Running tax simulation..." />}

        <div className="card-header">
          <h2 className="card-title card-title-icon">
            <IconTax size={18} />
            Section 80C Investment
          </h2>
          <span className="badge">Simplified model</span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Drag the slider to see how additional 80C investments (PPF, ELSS, LIC, etc.) could reduce your tax liability.
        </p>

        <div className="tax-slider-wrap">
          <div className="tax-slider-header">
            <label className="form-label" style={{ margin: 0 }}>Additional 80C investment</label>
            <span className="tax-slider-value">₹{extra80C.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min={0}
            max={150000}
            step={5000}
            value={extra80C}
            onChange={(e) => setExtra80C(Number(e.target.value))}
            style={{
              background: `linear-gradient(90deg, var(--accent) ${sliderPct}%, var(--bg-elevated) ${sliderPct}%)`,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            <span>₹0</span>
            <span>₹1,50,000 (max)</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleSimulate}
          disabled={loading}
        >
          <IconSparkle size={18} />
          {loading ? 'Calculating...' : 'Run simulation'}
        </button>

        {error && <div className="alert-error" style={{ marginTop: '1rem' }}>{error}</div>}

        {result && !loading && (
          <div className="fade-in">
            <div className="tax-results">
              <div className="tax-result-card annual">
                <div className="tax-result-label">Annual Tax Saving</div>
                <div className="tax-result-value" style={{ color: 'var(--accent-emerald)' }}>
                  ₹{result.annualTaxSaving.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="tax-result-card monthly">
                <div className="tax-result-label">Monthly TDS Saving</div>
                <div className="tax-result-value" style={{ color: 'var(--accent-light)' }}>
                  ₹{result.monthlyTdsSaving.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {result.note && (
              <div className="alert-warning">{result.note}</div>
            )}

            <h3 style={{ marginTop: '1.5rem' }}>Step-by-step breakdown</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Value</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {result.steps.map((s) => (
                    <tr key={s.label}>
                      <td>{s.label}</td>
                      <td className="td-mono">₹{s.value.toLocaleString('en-IN')}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ marginTop: '1.5rem' }}>Assumptions</h3>
            <ul className="assumptions-list">
              {result.assumptions.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
