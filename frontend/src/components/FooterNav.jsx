import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, User } from 'lucide-react';

export default function FooterNav() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `flex flex-col items-center text-sm ${pathname === path ? 'text-blue-600' : 'text-gray-400'}`;

  return (
    <nav className="flex justify-around w-full py-2 border-t bg-white shadow-md">
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
