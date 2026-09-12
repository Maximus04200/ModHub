import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { modsApi } from '../api/mods';
import type { Category } from '../api/types';
import { isApiError } from '../api/errors';

export function CreateModPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [gameKey, setGameKey] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [workshopId, setWorkshopId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    modsApi.categories().then((cats) => {
      setCategories(cats);
      if (cats[0]) setCategoryId(cats[0].id);
    });
  }, []);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const mod = await modsApi.create({
        title,
        summary,
        description,
        gameKey,
        categoryId,
        gameMetadata: workshopId ? { workshopId } : undefined,
      });
      navigate(`/mods/${mod.slug}`);
    } catch (err) {
      setError(isApiError(err) ? err.response?.data?.error ?? 'Erreur lors de la création' : 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-form">
      <h1>Publier un mod</h1>
      <p className="page-status">
        Ton mod sera visible publiquement après validation par un modérateur.
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          Titre
          <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} />
        </label>
        <label>
          Résumé (une phrase)
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            minLength={10}
          />
        </label>
        <label>
          Description complète
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={20}
            rows={5}
          />
        </label>
        <label>
          Jeu concerné
          <input
            value={gameKey}
            onChange={(e) => setGameKey(e.target.value)}
            placeholder="ex. arma-reforger"
            required
          />
        </label>
        <label>
          Catégorie
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          ID Workshop (optionnel, métadonnée spécifique au jeu)
          <input value={workshopId} onChange={(e) => setWorkshopId(e.target.value)} />
        </label>
        {error && <p className="page-status page-status--error">{error}</p>}
        <button type="submit" disabled={submitting || !categoryId}>
          {submitting ? 'Publication…' : 'Publier'}
        </button>
      </form>
    </section>
  );
}
