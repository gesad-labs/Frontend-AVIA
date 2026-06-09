import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Topbar.module.css';

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

function UserAvatar({ user }) {
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase()
  return <div className={styles.avatar}>{initials}</div>
}

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className={styles.topbar}>
      {/* Left: brand + nav tabs */}
      <div className={styles.left}>
        <span className={styles.logo}>AVIA</span>
        <nav className={styles.tabs}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
          >
            Visão Geral
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
          >
            Projetos
          </NavLink>
        </nav>
      </div>

      {/* Right: bell + avatar */}
      <div className={styles.right}>
        <button className={styles.iconBtn} aria-label="Notificações">
          <BellIcon />
        </button>
        <button className={styles.avatarBtn} onClick={handleLogout} title="Sair">
          <UserAvatar user={user} />
        </button>
      </div>
    </header>
  );
}
