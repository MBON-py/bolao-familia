import { NavLink } from 'react-router-dom';
import { useUser } from '../App';

export default function Navbar() {
  const { user, logout } = useUser();

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">⚽ Bolao da Familia</NavLink>
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>Inicio</NavLink>
        <NavLink to="/palpites" className={({ isActive }) => isActive ? 'active' : ''}>Palpites</NavLink>
        <NavLink to="/ranking" className={({ isActive }) => isActive ? 'active' : ''}>Ranking</NavLink>
        <NavLink to="/jogos" className={({ isActive }) => isActive ? 'active' : ''}>Jogos</NavLink>
        <NavLink to="/classificacao" className={({ isActive }) => isActive ? 'active' : ''}>Grupos</NavLink>
        {user.is_admin === 1 && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>Admin</NavLink>
        )}
      </div>
      <div className="navbar-user">
        <span>{user.short_name || user.name}</span>
        <button className="btn btn-outline btn-sm" onClick={logout}
          style={{ borderColor: 'rgba(255,255,255,.5)', color: 'white' }}>
          Sair
        </button>
      </div>
    </nav>
  );
}
