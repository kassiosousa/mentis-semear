import { useState, type FormEvent } from 'react';
import { useSeeds } from './hooks/useSeeds';
import './App.css';

export default function App() {
  const { seeds, loading, error, plant } = useSeeds();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await plant({ title, content });
      setTitle('');
      setContent('');
    } catch (err) {
      // Errors surface via the hook's state in a fuller app; keep it simple here.
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="app">
      <header>
        <h1>🌱 Mentis Semear</h1>
        <p>Plante uma ideia na mente.</p>
      </header>

      <form onSubmit={onSubmit} className="seed-form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da semente"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Conteúdo..."
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Plantando…' : 'Plantar'}
        </button>
      </form>

      {loading && <p>Carregando…</p>}
      {error && <p className="error">{error}</p>}

      <ul className="seed-list">
        {seeds.map((seed) => (
          <li key={seed.id}>
            <strong>{seed.title}</strong>
            <p>{seed.content}</p>
            <small>{new Date(seed.plantedAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </main>
  );
}
