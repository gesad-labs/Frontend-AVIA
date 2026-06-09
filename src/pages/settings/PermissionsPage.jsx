import { useState } from 'react'
import styles from './PermissionsPage.module.css'

/* ── Mock Data ── */
const PERMISSION_GROUPS = [
  {
    key: 'content',
    label: 'CONTEÚDO & TAREFAS',
    permissions: [
      { key: 'criar_tarefas',  label: 'Criar tarefas' },
      { key: 'editar_tarefas', label: 'Editar tarefas' },
      { key: 'excluir_tarefas', label: 'Excluir tarefas' },
      { key: 'mover_tarefas',  label: 'Mover tarefas' },
    ],
  },
  {
    key: 'structure',
    label: 'ESTRUTURA DO PROJETO',
    permissions: [
      { key: 'criar_colunas',    label: 'Criar colunas' },
      { key: 'editar_estrutura', label: 'Editar estrutura' },
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

const INITIAL_MEMBERS = [
  {
    id: 1,
    name: 'Ricardo Santos',
    email: 'ricardo.santos@avia.com',
    role: 'GERENTE',
    permissions: {
      criar_tarefas: true,
      editar_tarefas: true,
      excluir_tarefas: true,
      mover_tarefas: true,
      criar_colunas: true,
      editar_estrutura: true,
      gerenciar_sprints: true,
      adicionar_membros: false,
      remover_membros: false,
      alterar_permissoes: false,
    },
  },
  {
    id: 2,
    name: 'Beatriz Lima',
    email: 'beatriz.lima@avia.com',
    role: 'MEMBRO',
    permissions: {
      criar_tarefas: true,
      editar_tarefas: true,
      excluir_tarefas: false,
      mover_tarefas: true,
      criar_colunas: false,
      editar_estrutura: false,
      gerenciar_sprints: false,
      adicionar_membros: false,
      remover_membros: false,
      alterar_permissoes: false,
    },
  },
  {
    id: 3,
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@avia.com',
    role: 'CONVIDADO',
    permissions: {
      criar_tarefas: false,
      editar_tarefas: false,
      excluir_tarefas: false,
      mover_tarefas: false,
      criar_colunas: false,
      editar_estrutura: false,
      gerenciar_sprints: false,
      adicionar_membros: false,
      remover_membros: false,
      alterar_permissoes: false,
    },
  },
]

const ROLE_META = {
  ADMINISTRADOR: { label: 'Administrador', color: '#02214E' },
  GERENTE:       { label: 'Gerente',       color: '#0369a1' },
  MEMBRO:        { label: 'Membro',        color: '#475569' },
  CONVIDADO:     { label: 'Convidado',     color: '#9ca3af' },
}

function initials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const ChevronIcon = ({ open }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

/* ── Toggle Switch ── */
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span className={styles.toggleThumb} />
    </button>
  )
}

/* ── Member Card ── */
function MemberCard({ member, expanded, onToggleExpand }) {
  const [draft, setDraft] = useState({ ...member.permissions })
  const [saved, setSaved] = useState({ ...member.permissions })
  const [dirty, setDirty] = useState(false)

  function handlePerm(key, val) {
    const next = { ...draft, [key]: val }
    setDraft(next)
    setDirty(true)
  }

  function handleSave() {
    setSaved({ ...draft })
    setDirty(false)
  }

  function handleDiscard() {
    setDraft({ ...saved })
    setDirty(false)
  }

  const meta = ROLE_META[member.role] || ROLE_META.CONVIDADO

  return (
    <div className={`${styles.card} ${expanded ? styles.cardExpanded : ''}`}>
      {/* Card header row */}
      <button className={styles.cardHeader} onClick={onToggleExpand} type="button">
        <div className={styles.memberAvatar}>{initials(member.name)}</div>
        <div className={styles.memberInfo}>
          <span className={styles.memberName}>{member.name}</span>
          <span className={styles.memberEmail}>{member.email}</span>
        </div>
        <span
          className={styles.roleBadge}
          style={{ background: meta.color }}
        >
          {meta.label}
        </span>
        <span className={styles.cardChevron}>
          <ChevronIcon open={expanded} />
        </span>
      </button>

      {/* Expanded permissions body */}
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
                      <Toggle
                        checked={draft[perm.key]}
                        onChange={val => handlePerm(perm.key, val)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.cardActions}>
            <button
              className={styles.btnDiscard}
              onClick={handleDiscard}
              disabled={!dirty}
              type="button"
            >
              Descartar
            </button>
            <button
              className={styles.btnSave}
              onClick={handleSave}
              disabled={!dirty}
              type="button"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Page ── */
export default function PermissionsPage() {
  const [expanded, setExpanded] = useState(1) // first card open by default

  function toggle(id) {
    setExpanded(prev => (prev === id ? null : id))
  }

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Permissões por Membro</h1>
          <p className={styles.subtitle}>
            Configure individualmente as permissões de cada membro do projeto.
          </p>
        </div>
      </div>

      {/* Member cards */}
      <div className={styles.list}>
        {INITIAL_MEMBERS.map(member => (
          <MemberCard
            key={member.id}
            member={member}
            expanded={expanded === member.id}
            onToggleExpand={() => toggle(member.id)}
          />
        ))}
      </div>
    </div>
  )
}
