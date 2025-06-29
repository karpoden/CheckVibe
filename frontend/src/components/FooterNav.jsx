import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, User } from 'lucide-react';

export default function FooterNav() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `footer-link${pathname === path ? ' active' : ''}`;

  return (
    <nav className="footer-nav">
      <Link to="/" className={linkClass('/')}>
        <Home /> Home
      </Link>
      <Link to="/add" className={linkClass('/add')}>
        <Plus /> Add
      </Link>
      <Link to="/profile" className={linkClass('/profile')}>
        <User /> Profile
      </Link>
    </nav>
  );
}