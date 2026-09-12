import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout(): void {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        ModHub
      </Link>
      <nav className="navbar__links">
        <Link to="/">Catalogue</Link>
        {user && <Link to="/mods/new">Publier un mod</Link>}
        {user && <Link to="/dashboard">Mes mods</Link>}
        {user?.role === 'ADMIN' && <Link to="/admin">Modération</Link>}
      </nav>
      <div className="navbar__auth">
        {user ? (
          <>
            <span className="navbar__user">{user.displayName}</span>
            <button type="button" onClick={handleLogout}>
              Se déconnecter
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register" className="navbar__cta">
              Créer un compte
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
