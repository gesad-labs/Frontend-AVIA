import { NavLink, useParams } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { usePermission } from '../../hooks/usePermission';
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
const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

export default function Sidebar() {
  const { projectId } = useParams();
  const { projects, activeProject } = useProject();
  const { can } = usePermission();

  const project = activeProject
    || projects.find(p => String(p.id) === String(projectId))
    || { id: projectId, name: 'APS', subtitle: 'ANÁLISE E PROJETO D...', color: '#0891b2' };

  const id = project.id || projectId;

  // Admin/Gerente → config page; Membro/Convidado → read-only view
  const permissionsPath = can('change_member_role')
    ? `/project/${id}/permissions`
    : `/project/${id}/permissions/view`;

  const NAV = [
    { to: `/project/${id}/board`,   label: 'Quadro',     Icon: IconBoard },
    { to: `/project/${id}/backlog`, label: 'Backlog',    Icon: IconBacklog },
    { to: `/project/${id}/members`, label: 'Membros',    Icon: IconMembers },
    { to: permissionsPath,          label: 'Permissões', Icon: IconPermissions },
  ];

  return (
    <aside className={styles.sidebar}>
      {/* Project header */}
      <div className={styles.projectHeader}>
        <div className={styles.projectBadge} style={{ background: project.color || '#0891b2' }}>
          {(project.name || 'P').slice(0, 3).toUpperCase()}
        </div>
        <div className={styles.projectInfo}>
          <span className={styles.projectName}>{project.name || 'Projeto'}</span>
          <span className={styles.projectSub}>{project.subtitle || project.name}</span>
        </div>
        <span className={styles.chevron}><IconChevron /></span>
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
