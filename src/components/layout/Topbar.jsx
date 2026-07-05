import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Topbar.module.css';

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
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
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isOverviewActive = location.pathname === '/projects' || location.pathname.startsWith('/project/');

  useEffect(() => {
    if (!dropdownOpen) return;
    function close(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [dropdownOpen]);

  return (
    <header className={styles.topbar}>
      {/* Left: brand + nav tabs */}
      <div className={styles.left}>
        <span className={styles.logo}>AVIA</span>
        <nav className={styles.tabs}>
          <NavLink
            to="/projects"
            className={`${styles.tab} ${isOverviewActive ? styles.tabActive : ''}`}
          >
            Visão Geral
          </NavLink>
        </nav>
      </div>

      {/* Right: bell + avatar */}
      <div className={styles.right}>
        <button className={styles.iconBtn} aria-label="Notificações">
          <BellIcon />
        </button>
        <div className={styles.avatarWrap} ref={dropdownRef}>
          <button
            className={styles.avatarBtn}
            onClick={() => setDropdownOpen(v => !v)}
            aria-label="Menu do perfil"
            aria-expanded={dropdownOpen}
          >
            <UserAvatar user={user} />
          </button>
          {dropdownOpen && (
            <div className={styles.avatarDropdown}>
              <div className={styles.avatarDropdownHeader}>
                <p className={styles.avatarDropdownName}>{user?.name || user?.email}</p>
                <p className={styles.avatarDropdownEmail}>{user?.email}</p>
              </div>
              <hr className={styles.avatarDropdownDivider} />
              <button
                className={styles.avatarDropdownItem}
                onClick={() => { setDropdownOpen(false); handleLogout(); }}
              >
                <LogoutIcon />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
