import { useState, useRef } from 'react';
import { payslipApi } from '../api/client';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { IconUpload, IconFile } from '../components/Icons';

const DISPLAY_FIELDS = [
  { key: 'employeeName', label: 'Employee' },
  { key: 'month', label: 'Month' },
  { key: 'gross', label: 'Gross Salary' },
  { key: 'netPay', label: 'Net Pay' },
  { key: 'hra', label: 'HRA' },
  { key: 'tds', label: 'TDS' },
  { key: 'pf', label: 'PF' },
];

function extractValue(obj: Record<string, unknown>, key: string): string {
  const val = obj[key];
  if (val == null) return '—';
  if (typeof val === 'number') return `₹${val.toLocaleString('en-IN')}`;
  return String(val);
}

export default function UploadPage() {
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    setError('');
    setPreview(null);
    setWarnings([]);
    setFileName(file.name);
    setLoading(true);
    try {
      const result = await payslipApi.upload(file) as { parsed: Record<string, unknown> & { warnings?: string[] } };
      setPreview(result.parsed);
      setWarnings(result.parsed.warnings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Upload Payslip"
        subtitle="Upload your payslip PDF or image — we'll extract salary components using AI-powered OCR."
        badge="Documents"
      />

      <div className="card" style={{ position: 'relative' }}>
        {loading && <Loader overlay label="Processing payslip with AI OCR..." />}

        <div
          className={`upload-zone ${dragOver ? 'dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleUpload}
            disabled={loading}
          />
          <div className="upload-icon">
            <IconUpload size={28} />
          </div>
          <h3>Drop your payslip here</h3>
          <p>or click to browse files from your device</p>
          <div className="upload-formats">
            <span className="format-tag">PDF</span>
            <span className="format-tag">PNG</span>
            <span className="format-tag">JPG</span>
            <span className="format-tag">WEBP</span>
          </div>
        </div>

        {error && <div className="alert-error" style={{ marginTop: '1rem' }}>{error}</div>}

        {warnings.length > 0 && (
          <div className="alert-warning" style={{ marginTop: '1rem' }}>
            <strong>Warnings:</strong>
            {warnings.map((w) => <p key={w} style={{ margin: '0.25rem 0 0' }}>{w}</p>)}
          </div>
        )}

        {preview && !loading && (
          <div className="parsed-preview fade-in">
            <div className="card-header" style={{ marginTop: '1.5rem' }}>
              <h2 className="card-title card-title-icon">
                <IconFile size={18} />
                Parsed Results
              </h2>
              {fileName && <span className="badge">{fileName}</span>}
            </div>

            <div className="alert-success">
              Payslip processed successfully! Key fields extracted below.
            </div>

            <div className="parsed-grid">
              {DISPLAY_FIELDS.map(({ key, label }) => (
                <div key={key} className="parsed-field">
                  <div className="parsed-field-label">{label}</div>
                  <div className="parsed-field-value">{extractValue(preview, key)}</div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-ghost json-toggle"
              onClick={() => setShowRaw((v) => !v)}
            >
              {showRaw ? 'Hide' : 'Show'} raw JSON response
            </button>

            {showRaw && (
              <pre className="json-raw">
                {JSON.stringify(preview, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
