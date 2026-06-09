import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <NavLink to="/" className="navbar-brand">
          Freelance<span>Tracker</span>
        </NavLink>
        <ul className="nav-links">
          <li>
            <NavLink to="/" end>
              My Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects">My Projects</NavLink>
          </li>
          <li className="nav-user">
            <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
            <span className="user-name">{user?.name}</span>
          </li>
          <li>
            <button className="btn btn-secondary btn-sm" onClick={logout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
