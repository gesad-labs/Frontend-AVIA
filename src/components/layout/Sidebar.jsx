import { useState, useEffect, useRef } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { projetoService } from '../../services/projetoService';
import styles from './Sidebar.module.css';

const IconBoard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/>
  </svg>
)
const IconBacklog = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/>
  </svg>
)
const IconMembers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconPermissions = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconChevron = ({ open }) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const IconProjects = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const PROJECT_COLORS = ['#0891b2', '#6366f1', '#f97316', '#15803d', '#be123c', '#7c3aed', '#02214E']
function projectColor(id) {
  return PROJECT_COLORS[Number(id) % PROJECT_COLORS.length]
}

export default function Sidebar() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  useProject(); // keep context available to other consumers

  const [dropdownOpen,    setDropdownOpen]    = useState(false);
  const [allProjects,     setAllProjects]      = useState([]);
  const [loadingProjs,    setLoadingProjs]     = useState(false);
  const [currentProject,  setCurrentProject]   = useState(null);
  const dropdownRef = useRef(null);

  const id = projectId;

  useEffect(() => {
    if (!projectId) return;
    setCurrentProject(null);
    projetoService.buscar(projectId)
      .then(data => setCurrentProject(data))
      .catch(() => {});
  }, [projectId]);

  const NAV = [
    { to: `/project/${id}/board`,        label: 'Quadro',     Icon: IconBoard },
    { to: `/project/${id}/backlog`,      label: 'Backlog',    Icon: IconBacklog },
    { to: `/project/${id}/members`,      label: 'Membros',    Icon: IconMembers },
    { to: `/project/${id}/permissions`,  label: 'Permissões', Icon: IconPermissions },
  ];

  /* Close on outside click */
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  async function handleToggleDropdown() {
    if (dropdownOpen) { setDropdownOpen(false); return; }
    setDropdownOpen(true);
    if (allProjects.length === 0) {
      setLoadingProjs(true);
      try {
        const data = await projetoService.listar();
        setAllProjects(Array.isArray(data) ? data : []);
      } catch {
        setAllProjects([]);
      } finally {
        setLoadingProjs(false);
      }
    }
  }

  function handleSelectProject(p) {
    setDropdownOpen(false);
    navigate(`/project/${p.id}/board`);
  }

  return (
    <aside className={styles.sidebar}>
      {/* Project header — dropdown trigger */}
      <div className={styles.projectHeaderWrap} ref={dropdownRef}>
        <button
          className={`${styles.projectHeader} ${dropdownOpen ? styles.projectHeaderOpen : ''}`}
          onClick={handleToggleDropdown}
          type="button"
        >
          <div className={styles.projectBadge} style={{ background: projectColor(id) }}>
            {(currentProject?.nome || 'P').slice(0, 3).toUpperCase()}
          </div>
          <div className={styles.projectInfo}>
            <span className={styles.projectName}>{currentProject?.nome || 'Carregando...'}</span>
            <span className={styles.projectSub}>Trocar projeto</span>
          </div>
          <span className={styles.chevron}><IconChevron open={dropdownOpen} /></span>
        </button>

        {dropdownOpen && (
          <div className={styles.projectDropdown}>
            <div className={styles.dropdownHeader}>SEUS PROJETOS</div>
            {loadingProjs ? (
              <div className={styles.dropdownLoading}>Carregando...</div>
            ) : allProjects.length === 0 ? (
              <div className={styles.dropdownLoading}>Nenhum projeto.</div>
            ) : (
              allProjects.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.dropdownItem} ${String(p.id) === String(projectId) ? styles.dropdownItemActive : ''}`}
                  onClick={() => handleSelectProject(p)}
                >
                  <div className={styles.dropdownBadge} style={{ background: projectColor(p.id) }}>
                    {(p.nome || 'P').slice(0, 3).toUpperCase()}
                  </div>
                  <span className={styles.dropdownName}>{p.nome}</span>
                  {String(p.id) === String(projectId) && (
                    <span className={styles.dropdownCheck}>✓</span>
                  )}
                </button>
              ))
            )}
            <div className={styles.dropdownDivider} />
            <button
              type="button"
              className={styles.dropdownAllProjects}
              onClick={() => { setDropdownOpen(false); navigate('/projects'); }}
            >
              <IconProjects />
              Ver todos os projetos
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.navIcon}><Icon /></span>
            <span className={styles.navLabel}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
