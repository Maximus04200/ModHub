import { useEffect, useState, type FormEvent } from 'react';
import { modsApi } from '../api/mods';
import type { ModSummary } from '../api/types';

export function DashboardPage() {
  const [mods, setMods] = useState<ModSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModId, setActiveModId] = useState<string | null>(null);
  const [versionLabel, setVersionLabel] = useState('');
  const [changelog, setChangelog] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  function load(): void {
    modsApi.mine().then(setMods).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleAddVersion(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!activeModId) return;
    await modsApi.addVersion(activeModId, {
      versionLabel,
      changelog,
      fileUrl,
      fileSizeBytes: 0,
    });
    setStatus('Version publiée.');
    setVersionLabel('');
    setChangelog('');
    setFileUrl('');
    setActiveModId(null);
  }

  if (loading) return <p className="page-status">Chargement…</p>;

  return (
    <section>
      <h1>Mes mods</h1>
      {mods.length === 0 && <p className="page-status">Tu n'as encore publié aucun mod.</p>}
      <ul className="dashboard-list">
        {mods.map((mod) => (
          <li key={mod.id}>
            <div>
              <strong>{mod.title}</strong> — <span className={`status status--${mod.status.toLowerCase()}`}>{mod.status}</span>
            </div>
            <button type="button" onClick={() => setActiveModId(mod.id)}>
              Ajouter une version
            </button>
          </li>
        ))}
      </ul>

      {activeModId && (
        <form onSubmit={handleAddVersion} className="auth-form">
          <h2>Nouvelle version</h2>
          <label>
            Numéro de version
            <input value={versionLabel} onChange={(e) => setVersionLabel(e.target.value)} required />
          </label>
          <label>
            Changelog
            <textarea value={changelog} onChange={(e) => setChangelog(e.target.value)} required />
          </label>
          <label>
            URL du fichier
            <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} required />
          </label>
          <button type="submit">Publier la version</button>
        </form>
      )}

      {status && <p className="page-status">{status}</p>}
    </section>
  );
}
