import { useState } from 'react';
import { payslipApi } from '../api/client';

export default function UploadPage() {
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
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

  return (
    <div>
      <h1>Upload Payslip</h1>
      <div className="card">
        <p>Upload a PDF or image payslip. OCR uses the LLM wrapper (mock mode if enabled).</p>
        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleUpload} disabled={loading} />
        {loading && <p>Processing...</p>}
        {error && <div className="error">{error}</div>}
        {warnings.length > 0 && (
          <div className="error">
            {warnings.map((w) => <p key={w}>{w}</p>)}
          </div>
        )}
        {preview && (
          <pre style={{ overflow: 'auto', fontSize: '0.85rem' }}>
            {JSON.stringify(preview, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
