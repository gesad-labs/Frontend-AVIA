import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotificacoesCtx } from '../../contexts/NotificacoesContext';
import styles from './Topbar.module.css';

/* ── Icons ── */
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

const IconMention = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
  </svg>
)

const IconUserPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
)

const IconTask = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <polyline points="9 11 12 14 22 4"/>
  </svg>
)

function NotifIcon({ tipo }) {
  if (tipo === 'MENCIONADO_COMENTARIO') return <span className={`${styles.notifIcon} ${styles.notifIconMention}`}><IconMention /></span>
  if (tipo === 'ADICIONADO_PROJETO')    return <span className={`${styles.notifIcon} ${styles.notifIconProject}`}><IconUserPlus /></span>
  return <span className={`${styles.notifIcon} ${styles.notifIconTask}`}><IconTask /></span>
}

function fmtRelative(iso) {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1)  return 'agora mesmo'
  if (diffMin < 60) return `${diffMin}m atrás`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)  return `${diffH}h atrás`
  const diffD = Math.floor(diffH / 24)
  return diffD === 1 ? 'ontem' : `${diffD} dias atrás`
}

function UserAvatar({ user }) {
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase()
  return <div className={styles.avatar}>{initials}</div>
}

export default function Topbar() {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const location            = useLocation();
  const { projectId }       = useParams();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const dropdownRef = useRef(null);
  const notifRef    = useRef(null);

  const isInsideProject = location.pathname.startsWith('/project/');
  const isOverviewActive = location.pathname === '/projects' || isInsideProject;

  const { notificacoes, unreadCount, marcarLida } = useNotificacoesCtx();

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    if (!dropdownOpen) return;
    const close = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!notifOpen) return;
    const close = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [notifOpen]);

  return (
    <header className={styles.topbar}>
      {/* Left */}
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

      {/* Right */}
      <div className={styles.right}>

        {/* Bell */}
        {isInsideProject && (
          <div className={styles.notifWrap} ref={notifRef}>
            <button
              className={styles.iconBtn}
              aria-label="Notificações"
              onClick={() => setNotifOpen(o => !o)}
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className={styles.notifBadge}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className={styles.notifDropdown}>
                <div className={styles.notifHeader}>
                  <span className={styles.notifTitle}>Notificações</span>
                  {unreadCount > 0 && (
                    <span className={styles.notifCount}>
                      {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className={styles.notifList}>
                  {notificacoes.length === 0 ? (
                    <p className={styles.notifEmpty}>Nenhuma notificação.</p>
                  ) : (
                    notificacoes.map(n => (
                      <button
                        key={n.id}
                        className={`${styles.notifItem} ${!n.lida ? styles.notifItemUnread : ''}`}
                        onClick={() => {
                          if (!n.lida) marcarLida(n.id)
                          if (n.tarefaId) navigate(`/project/${projectId}/task/${n.tarefaId}`)
                          setNotifOpen(false)
                        }}
                      >
                        <NotifIcon tipo={n.tipo} />
                        <div className={styles.notifBody}>
                          <p className={styles.notifMsg}>{n.mensagem}</p>
                          <span className={styles.notifTime}>{fmtRelative(n.criadoEm)}</span>
                        </div>
                        {!n.lida && <span className={styles.notifDot} />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Avatar */}
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
