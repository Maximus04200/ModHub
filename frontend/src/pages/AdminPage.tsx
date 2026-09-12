import { useEffect, useState } from 'react';
import { modsApi } from '../api/mods';
import type { ModSummary } from '../api/types';

export function AdminPage() {
  const [mods, setMods] = useState<ModSummary[]>([]);
  const [loading, setLoading] = useState(true);

  function load(): void {
    modsApi.pending().then(setMods).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleModerate(id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
    await modsApi.moderate(id, status);
    load();
  }

  if (loading) return <p className="page-status">Chargement…</p>;

  return (
    <section>
      <h1>Modération — mods en attente</h1>
      {mods.length === 0 && <p className="page-status">Aucun mod en attente.</p>}
      <ul className="dashboard-list">
        {mods.map((mod) => (
          <li key={mod.id}>
            <div>
              <strong>{mod.title}</strong> par {mod.author.displayName} ({mod.gameKey})
              <p>{mod.summary}</p>
            </div>
            <div className="moderation-actions">
              <button type="button" onClick={() => handleModerate(mod.id, 'APPROVED')}>
                Approuver
              </button>
              <button type="button" onClick={() => handleModerate(mod.id, 'REJECTED')}>
                Rejeter
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
