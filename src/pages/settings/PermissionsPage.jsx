import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { projetoService } from '../../services/projetoService'
import styles from './PermissionsPage.module.css'

/* ── Permission groups (display only) ── */
const PERMISSION_GROUPS = [
  {
    key: 'content',
    label: 'CONTEÚDO & TAREFAS',
    permissions: [
      { key: 'criar_tarefas',   label: 'Criar tarefas' },
      { key: 'editar_tarefas',  label: 'Editar tarefas' },
      { key: 'excluir_tarefas', label: 'Excluir tarefas' },
      { key: 'mover_tarefas',   label: 'Mover tarefas' },
    ],
  },
  {
    key: 'structure',
    label: 'ESTRUTURA DO PROJETO',
    permissions: [
      { key: 'criar_colunas',     label: 'Criar sprints' },
      { key: 'editar_estrutura',  label: 'Editar estrutura' },
      { key: 'gerenciar_sprints', label: 'Gerenciar sprints' },
    ],
  },
  {
    key: 'team',
    label: 'GESTÃO DE EQUIPE',
    permissions: [
      { key: 'adicionar_membros',  label: 'Adicionar membros' },
      { key: 'remover_membros',    label: 'Remover membros' },
      { key: 'alterar_permissoes', label: 'Alterar permissões' },
    ],
  },
]

/* Permissions derived from role — matches usePermission.js logic */
const ROLE_PERMISSIONS = {
  GERENTE: new Set([
    'criar_tarefas', 'editar_tarefas', 'excluir_tarefas', 'mover_tarefas',
    'criar_colunas', 'editar_estrutura', 'gerenciar_sprints',
    'adicionar_membros', 'remover_membros', 'alterar_permissoes',
  ]),
  MEMBRO: new Set([
    'criar_tarefas', 'editar_tarefas', 'mover_tarefas',
  ]),
  VISUALIZADOR: new Set([]),
}

const ROLE_META = {
  GERENTE:      { label: 'Gerente',      color: '#0369a1', bg: '#dbeafe' },
  MEMBRO:       { label: 'Membro',       color: '#1d4ed8', bg: '#dbeafe' },
  VISUALIZADOR: { label: 'Visualizador', color: '#7c3aed', bg: '#ede9fe' },
}

const AVATAR_COLORS = ['#f97316', '#0891b2', '#7c3aed', '#0369a1', '#15803d', '#be123c']
function avatarColor(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || '?'
}

const ChevronIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

/* ── Read-only toggle ── */
function Toggle({ checked }) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''} ${styles.toggleReadOnly}`}
    >
      <span className={styles.toggleThumb} />
    </div>
  )
}

/* ── Role selector buttons ── */
function RoleSelector({ value, onChange, disabled }) {
  const roles = ['MEMBRO', 'VISUALIZADOR']
  return (
    <div className={styles.roleSelector}>
      {roles.map(r => {
        const meta = ROLE_META[r]
        return (
          <button
            key={r}
            type="button"
            disabled={disabled}
            onClick={() => onChange(r)}
            className={`${styles.roleBtn} ${value === r ? styles.roleBtnActive : ''}`}
            style={value === r ? { borderColor: meta.color, color: meta.color } : {}}
          >
            {meta.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Member Card ── */
function MemberCard({ membro, expanded, onToggleExpand, isMe }) {
  const isGerente = membro.cargo === 'Gerente'
  const roleKey   = isGerente ? 'GERENTE' : 'MEMBRO'
  const perms     = ROLE_PERMISSIONS[roleKey]

  const badgeStyle = isGerente
    ? { background: ROLE_META.GERENTE.color }
    : { background: ROLE_META.MEMBRO.color }

  return (
    <div className={`${styles.card} ${expanded ? styles.cardExpanded : ''}`}>
      <button className={styles.cardHeader} onClick={onToggleExpand} type="button">
        <div
          className={styles.memberAvatar}
          style={{ background: avatarColor(membro.nome || membro.email) }}
        >
          {initials(membro.nome || membro.email)}
        </div>
        <div className={styles.memberInfo}>
          <span className={styles.memberName}>
            {membro.nome}{isMe && <span className={styles.youTag}>Você</span>}
          </span>
          <span className={styles.memberEmail}>{membro.email}</span>
        </div>
        <span className={styles.roleBadge} style={badgeStyle}>
          {membro.cargo ?? 'Membro'}
        </span>
        <span className={styles.cardChevron}><ChevronIcon open={expanded} /></span>
      </button>

      {expanded && (
        <div className={styles.cardBody}>
          <div className={styles.groupsGrid}>
            {PERMISSION_GROUPS.map(group => (
              <div key={group.key} className={styles.group}>
                <p className={styles.groupTitle}>{group.label}</p>
                <div className={styles.permList}>
                  {group.permissions.map(perm => (
                    <div key={perm.key} className={styles.permRow}>
                      <span className={styles.permLabel}>{perm.label}</span>
                      <Toggle checked={perms.has(perm.key)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Page ── */
export default function PermissionsPage() {
  const { projectId }  = useParams()
  const { user }       = useAuth()
  const [membros, setMembros]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [expanded, setExpanded] = useState(null)

  const fetchMembros = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await projetoService.listarMembros(projectId)
      setMembros(Array.isArray(data) ? data : [])
    } catch {
      setError('Erro ao carregar membros.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetchMembros() }, [fetchMembros])

  function toggle(id) {
    setExpanded(prev => (prev === id ? null : id))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Permissões por Membro</h1>
        <p className={styles.subtitle}>
          Configure o papel de cada membro do projeto. Os toggles refletem as permissões associadas ao papel selecionado.
        </p>
      </div>

      {loading ? (
        <p className={styles.subtitle}>Carregando membros...</p>
      ) : error ? (
        <p style={{ color: '#ef4444' }}>{error}</p>
      ) : (
        <div className={styles.list}>
          {membros.map(m => (
            <MemberCard
              key={m.id}
              membro={m}
              expanded={expanded === m.id}
              onToggleExpand={() => toggle(m.id)}
              isMe={m.email === user?.email}
            />
          ))}
        </div>
      )}
    </div>
  )
}
