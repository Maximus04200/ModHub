import { useEffect, useState } from 'react';
import { modsApi } from '../api/mods';
import type { ModSummary } from '../api/types';
import { ModCard } from '../components/ModCard';

export function CatalogPage() {
  const [items, setItems] = useState<ModSummary[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      modsApi
        .search({ q: query || undefined })
        .then((res) => setItems(res.items))
        .catch(() => setError('Impossible de charger le catalogue.'))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  return (
    <section>
      <div className="page-header">
        <h1>Catalogue de mods</h1>
        <input
          type="search"
          placeholder="Rechercher un mod…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <p className="page-status">Chargement…</p>}
      {error && <p className="page-status page-status--error">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="page-status">Aucun mod trouvé.</p>
      )}

      <div className="mod-grid">
        {items.map((mod) => (
          <ModCard key={mod.id} mod={mod} />
        ))}
      </div>
    </section>
  );
}
