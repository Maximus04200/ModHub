import { Link } from 'react-router-dom';
import type { ModSummary } from '../api/types';

export function ModCard({ mod }: { mod: ModSummary }) {
  return (
    <Link to={`/mods/${mod.slug}`} className="mod-card">
      <div className="mod-card__header">
        <h3>{mod.title}</h3>
        <span className="badge">{mod.gameKey}</span>
      </div>
      <p className="mod-card__summary">{mod.summary}</p>
      <div className="mod-card__footer">
        <span>{mod.category.name}</span>
        <span>par {mod.author.displayName}</span>
      </div>
    </Link>
  );
}
