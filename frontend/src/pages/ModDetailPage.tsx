import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { modsApi } from '../api/mods';
import type { ModDetail } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { isApiError } from '../api/errors';

export function ModDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [mod, setMod] = useState<ModDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  function load(): void {
    if (!slug) return;
    modsApi
      .getBySlug(slug)
      .then(setMod)
      .catch(() => setStatus('Mod introuvable.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [slug]);

  async function handleRate(value: number): Promise<void> {
    if (!mod) return;
    try {
      await modsApi.rate(mod.id, value);
      setStatus('Merci pour ta note !');
      load();
    } catch (err) {
      setStatus(isApiError(err) ? err.response?.data?.error ?? 'Erreur' : 'Erreur');
    }
  }

  async function handleComment(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!mod || !comment.trim()) return;
    await modsApi.comment(mod.id, comment.trim());
    setComment('');
    load();
  }

  async function handleFollow(): Promise<void> {
    if (!mod) return;
    await modsApi.follow(mod.id);
    setStatus('Tu suis maintenant ce mod.');
  }

  if (loading) return <p className="page-status">Chargement…</p>;
  if (!mod) return <p className="page-status page-status--error">{status}</p>;

  const isAuthor = user?.id === mod.author.id;

  return (
    <article className="mod-detail">
      <header>
        <h1>{mod.title}</h1>
        <span className="badge">{mod.gameKey}</span>
      </header>
      <p className="mod-detail__summary">{mod.summary}</p>
      <p>{mod.description}</p>

      {Object.keys(mod.metadata).length > 0 && (
        <section>
          <h2>Métadonnées</h2>
          <ul>
            {Object.entries(mod.metadata).map(([key, value]) => (
              <li key={key}>
                <strong>{key}</strong> : {String(value)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>Versions</h2>
        {mod.versions.length === 0 && <p className="page-status">Aucune version publiée.</p>}
        <ul>
          {mod.versions.map((v) => (
            <li key={v.id}>
              <strong>{v.versionLabel}</strong> — {v.changelog}
            </li>
          ))}
        </ul>
      </section>

      {user && (
        <section>
          <h2>Ta note</h2>
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => handleRate(n)}>
                {n}★
              </button>
            ))}
          </div>
          <button type="button" onClick={handleFollow}>
            Suivre ce mod
          </button>
        </section>
      )}

      {status && <p className="page-status">{status}</p>}

      <section>
        <h2>Commentaires ({mod._count.comments})</h2>
        {user && (
          <form onSubmit={handleComment} className="comment-form">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ton commentaire…"
              rows={3}
            />
            <button type="submit">Envoyer</button>
          </form>
        )}
        <ul className="comment-list">
          {mod.comments.map((c) => (
            <li key={c.id}>
              <strong>{c.user.displayName}</strong> : {c.body}
            </li>
          ))}
        </ul>
      </section>

      {isAuthor && (
        <p className="page-status">
          Tu es l'auteur de ce mod — gère tes versions depuis ton tableau de bord.
        </p>
      )}
    </article>
  );
}
