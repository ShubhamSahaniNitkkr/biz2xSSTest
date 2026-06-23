import { useState } from 'react';
import { chatApi } from '../api/client';

export default function ChatPage() {
  const [question, setQuestion] = useState('How much HRA did I receive?');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<{ field: string; value: unknown }[]>([]);
  const [refused, setRefused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = [
    'How much HRA did I receive?',
    'Why is my net salary lower this month?',
    'What deductions were applied?',
  ];

  async function handleAsk(q?: string) {
    const text = q ?? question;
    setError('');
    setLoading(true);
    try {
      const result = await chatApi.ask(text);
      setAnswer(result.answer);
      setSources(result.sources);
      setRefused(result.refused);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chat failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Ask about your payslip</h1>
      <div className="card">
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your salary..."
        />
        <button type="button" onClick={() => handleAsk()} disabled={loading}>
          {loading ? 'Thinking...' : 'Ask'}
        </button>
        <div style={{ marginTop: '0.75rem' }}>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem', background: '#64748b' }}
              onClick={() => { setQuestion(s); handleAsk(s); }}
            >
              {s}
            </button>
          ))}
        </div>
        {error && <div className="error">{error}</div>}
        {answer && (
          <div className={refused ? 'error' : 'success'} style={{ marginTop: '1rem' }}>
            <p>{answer}</p>
            {sources.length > 0 && (
              <div className="sources">
                <strong>Sources:</strong>
                {sources.map((s) => (
                  <span key={s.field} className="badge" style={{ marginLeft: '0.5rem' }}>
                    {s.field}: {String(s.value)}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
