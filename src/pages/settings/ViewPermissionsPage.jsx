import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useProject } from '../../context/ProjectContext'
import { useParams, Navigate } from 'react-router-dom'
import { projetoService } from '../../services/projetoService'
import styles from './ViewPermissionsPage.module.css'

/* ─────────────────────────────────────────
   Permission map — mirrors usePermission.js, keyed by papel from backend
───────────────────────────────────────── */
const PERMISSIONS = {
  GERENTE: new Set([
    'view', 'comment',
    'create_card', 'edit_card', 'delete_card',
    'assign_card', 'add_collaborator',
    'add_member', 'remove_member', 'change_member_role',
    'create_sprint', 'start_sprint', 'end_sprint',
    'start_poker', 'resolve_impediment',
  ]),
  MEMBRO: new Set([
    'view', 'comment',
    'create_card', 'edit_card', 'add_collaborator',
  ]),
  VISUALIZADOR: new Set(['view']),
}

const PERMISSION_GROUPS = [
  {
    key: 'content',
    label: 'Conteúdo & Tarefas',
    Icon: IconContentTasks,
    permissions: [
      { key: 'create_card',  label: 'Criar e Editar Tarefas',        desc: 'Permite adicionar novas tarefas e modificar campos existentes.' },
      { key: 'edit_card',    label: 'Mover Items no Quadro',          desc: 'Alterar o status de tarefas entre as colunas do quadro.' },
      { key: 'delete_card',  label: 'Deletar Tarefas de Terceiros',   desc: 'Apenas o criador ou administradores podem remover tarefas.' },
    ],
  },
  {
    key: 'structure',
    label: 'Estrutura do Projeto',
    Icon: IconStructure,
    permissions: [
      { key: 'create_sprint', label: 'Criar Novas Sprints',                    desc: 'Modificar o fluxo de trabalho global do projeto.' },
      { key: 'start_poker',   label: 'Permissões de Estimativa Colaborativa',  desc: 'Ter permissões para conduzir a estimativa colaborativa.' },
      { key: 'edit_project',  label: 'Excluir Projeto',                         desc: 'Consegue excluir ou arquivar o projeto por inteiro.' },
    ],
  },
  {
    key: 'team',
    label: 'Gestão de Equipe',
    Icon: IconTeam,
    permissions: [
      { key: 'add_member',          label: 'Convidar Novos Membros',   desc: 'Adicionar novos membros ao time de desenvolvimento.' },
      { key: 'assign_card',         label: 'Atribuir Tarefas a Colegas', desc: 'Designar quem é responsável por cada demanda.' },
      { key: 'change_member_role',  label: 'Alterar Níveis de Acesso',  desc: 'Modificar permissões de outros membros do projeto.' },
    ],
  },
]

const ROLE_LABEL = {
  GERENTE:      'Gerente',
  MEMBRO:       'Membro',
  VISUALIZADOR: 'Visualizador',
}

const ROLE_COLOR = {
  GERENTE:      '#0369a1',
  MEMBRO:       '#475569',
  VISUALIZADOR: '#7c3aed',
}

const ROLE_NOTE = {
  GERENTE:
    'Como Gerente, você gerencia sprints, equipe e estrutura do projeto. Algumas ações estruturais de nível administrativo requerem permissão adicional.',
  MEMBRO:
    'Como Membro, seu foco está na execução e colaboração. Você tem controle total sobre suas tarefas, mas acesso restrito às configurações globais do projeto para garantir a integridade da estrutura.',
  VISUALIZADOR:
    'Como Visualizador, você pode visualizar o projeto e seu conteúdo. Para contribuir, solicite uma mudança de papel ao Gerente.',
}

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function initials(name = '') {
  return name.trim().split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

function getAccessBadge(allowed, total) {
  if (allowed === total) return { label: 'ACESSO TOTAL',       mod: styles.badgeTotal }
  if (allowed === 2)     return { label: 'ACESSO PARCIAL',     mod: styles.badgeAlmost }
  if (allowed === 1)     return { label: 'LIMITADO',           mod: styles.badgeLimited }
  return                        { label: 'SEM ACESSO',         mod: styles.badgeNone }
}

/* ─────────────────────────────────────────
   Icons
───────────────────────────────────────── */
function IconContentTasks() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function IconStructure() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

function IconTeam() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="8" strokeWidth="3" strokeLinecap="round" />
      <line x1="12" y1="12" x2="12" y2="16" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#dcfce7" />
      <circle cx="12" cy="12" r="8" fill="#22c55e" />
      <path d="M8.5 12l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconXMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#fee2e2" />
      <circle cx="12" cy="12" r="8" fill="#ef4444" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */
function PermissionSection({ group, can }) {
  const { Icon } = group
  const allowed = group.permissions.filter((p) => can(p.key)).length
  const badge = getAccessBadge(allowed, group.permissions.length)

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}><Icon /></span>
          <span>{group.label}</span>
        </div>
        <span className={`${styles.badge} ${badge.mod}`}>{badge.label}</span>
      </div>
      <div className={styles.sectionCard}>
        {group.permissions.map((perm) => (
          <div key={perm.key} className={styles.permRow}>
            <div className={styles.permInfo}>
              <span className={styles.permLabel}>{perm.label}</span>
              <span className={styles.permDesc}>{perm.desc}</span>
            </div>
            <span className={styles.permStatus} aria-label={can(perm.key) ? 'Permitido' : 'Não permitido'}>
              {can(perm.key) ? <IconCheck /> : <IconXMark />}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function ViewPermissionsPage() {
  const { user } = useAuth()
  useProject()
  const { projectId } = useParams()
  const [membro,      setMembro]      = useState(null)
  const [projectName, setProjectName] = useState('este projeto')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId || !user?.email) { setLoading(false); return }
    Promise.all([
      projetoService.listarMembros(projectId),
      projetoService.buscar(projectId).catch(() => null),
    ]).then(([membrosData, proj]) => {
      const list = Array.isArray(membrosData) ? membrosData : []
      setMembro(list.find((m) => m.email === user.email) ?? null)
      if (proj?.nome) setProjectName(proj.nome)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [projectId, user?.email])

  const role        = membro?.cargo === 'Gerente'
    ? 'GERENTE'
    : membro?.cargo === 'Visualizador'
      ? 'VISUALIZADOR'
      : 'MEMBRO'
  const perms       = PERMISSIONS[role] || PERMISSIONS.MEMBRO
  const can         = (p) => perms.has(p)
  const displayRole = ROLE_LABEL[role] ?? role
  const roleColor   = ROLE_COLOR[role] ?? '#475569'
  const noteText    = ROLE_NOTE[role] ?? ROLE_NOTE.MEMBRO
  const userId      = membro ? String(membro.id).padStart(4, '0') : '—'

  /* Gerentes acessam a tela de edição */
  if (!loading && membro?.cargo === 'Gerente') {
    return <Navigate to={`/project/${projectId}/permissions`} replace />
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p style={{ color: '#637083', padding: 32 }}>Carregando permissões...</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <h1 className={styles.title}>Minhas Permissões</h1>
        <p className={styles.subtitle}>
          Esta é uma visualização detalhada do seu nível de acesso no{' '}
          <strong>Projeto {projectName}</strong>. Para solicitar alterações, entre
          em contato com o <strong>Gerente do Projeto</strong>.
        </p>
      </header>

      {/* ── Two-column content ── */}
      <div className={styles.content}>
        {/* Left: profile column */}
        <aside className={styles.profileColumn}>
          <div className={styles.profileCard}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatar} style={{ background: roleColor }} aria-label={`Avatar de ${user?.name}`}>
                {initials(user?.name)}
              </div>
            </div>

            <p className={styles.profileName}>{user?.name ?? '—'}</p>

            <span className={styles.roleBadge}>{displayRole.toUpperCase()}</span>

            <dl className={styles.metaList}>
              <div className={styles.metaRow}>
                <dt className={styles.metaLabel}>ID do Usuário</dt>
                <dd className={styles.metaValue}>{userId}</dd>
              </div>
              <div className={styles.metaRow}>
                <dt className={styles.metaLabel}>Status Global</dt>
                <dd className={styles.metaValue}>
                  <span className={styles.statusDot} aria-hidden="true" />
                  Verificado
                </dd>
              </div>
            </dl>
          </div>

          <div className={styles.noteBox}>
            <div className={styles.noteHeader}>
              <span className={styles.noteIcon}><IconInfo /></span>
              <span className={styles.noteTitle}>Nota de Acesso</span>
            </div>
            <p className={styles.noteText}>{noteText}</p>
          </div>
        </aside>

        {/* Right: bento grid */}
        <div className={styles.bentoGrid}>
          {PERMISSION_GROUPS.map((group) => (
            <PermissionSection key={group.key} group={group} can={can} />
          ))}
        </div>
      </div>
    </div>
  )
}
