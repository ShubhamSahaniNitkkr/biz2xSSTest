import { useEffect, useState } from 'react';
import { checklistApi } from '../api/client';

interface Item {
  id: string;
  title: string;
  description: string;
  status: string;
}

export default function ChecklistPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    checklistApi.get()
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h1>Document checklist</h1>
      <div className="card">
        {items.map((item) => (
          <div key={item.id} style={{ marginBottom: '1rem' }}>
            <strong>{item.title}</strong>
            <span className={`badge ${item.status}`} style={{ marginLeft: '0.5rem' }}>{item.status}</span>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
