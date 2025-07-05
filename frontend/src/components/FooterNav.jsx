import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, User } from 'lucide-react';

export default function FooterNav() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `footer-link${pathname === path ? ' active' : ''}`;

  const navBtnStyle = (active) => ({
    background: active
      ? "linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)"
      : "#232526",
    color: "#fff",
    boxShadow: active
      ? "0 0 12px #6a82fb88"
      : "0 0 8px #fc5c7d44",
    border: active
      ? "none"
      : "1.5px solid #fc5c7d88",
    padding: "10px 10px 10px 10px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "1.25em",
    cursor: "pointer",
    transition: "box-shadow 0.2s, background 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // flexDirection: "column", // Чтобы иконка и текст шли друг под другом, убери если нужно в линию
    // width: "75px", // Фиксированная ширина
    // height: "40px", // Фиксированная высота
    textDecoration: "none",
    textAlign: "center",
  });

  return (
    <nav className="footer-nav" style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "20px",
      padding: "5px 10px 10px 10px",
      position: "fixed", // Фиксированное позиционирование
      bottom: "10",       // Прижимаем к низу
      left: "0",         // На всю ширину
      right: "0",
      width: "100%",
      zIndex: "1000",    // Высокий z-index для приоритета
      boxShadow: "0 0px 10px rgba(0,0,0,0.3)"
      // backgroundColor: "#1a1a1a",
    }}>
      <Link to="/" style={navBtnStyle(pathname === "/")} className={linkClass('/')}>
        <Home size={24} />
        <span>Home</span>
      </Link>
      <Link to="/add" style={navBtnStyle(pathname === "/add")} className={linkClass('/add')}>
        <Plus size={24} />
        <span>Add</span>
      </Link>
      <Link to="/profile" style={navBtnStyle(pathname === "/profile")} className={linkClass('/profile')}>
        <User size={24} />
        <span>Profile</span>
      </Link>
    </nav>
  );
}
