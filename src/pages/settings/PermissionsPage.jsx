import { useState, useEffect, useCallback } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { projetoService } from '../../services/projetoService'
import styles from './PermissionsPage.module.css'

/* ── Permission groups — keys match backend PermissoesUsuarioProjeto.nome ── */
const PERMISSION_GROUPS = [
  {
    key: 'content',
    label: 'CONTEÚDO & TAREFAS',
    permissions: [
      { key: 'Criar Tarefas',   label: 'Criar tarefas' },
      { key: 'Editar Tarefas',  label: 'Editar tarefas' },
      { key: 'Excluir Tarefas', label: 'Excluir tarefas' },
      { key: 'Mover Tarefas',   label: 'Mover tarefas' },
    ],
  },
  {
    key: 'structure',
    label: 'ESTRUTURA DO PROJETO',
    permissions: [
      { key: 'Criar Colunas',     label: 'Criar sprints' },
      { key: 'Editar Estrutura',  label: 'Editar estrutura' },
      { key: 'Gerenciar Sprints', label: 'Gerenciar sprints' },
    ],
  },
  {
    key: 'team',
    label: 'GESTÃO DE EQUIPE',
    permissions: [
      { key: 'Adicionar Membros', label: 'Adicionar membros' },
      { key: 'Remover Membros',   label: 'Remover membros' },
    ],
  },
]

const ROLE_META = {
  Gerente:      { color: '#0369a1' },
  Membro:       { color: '#1d4ed8' },
  Visualizador: { color: '#7c3aed' },
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

function setsEqual(a, b) {
  if (a.size !== b.size) return false
  for (const v of a) if (!b.has(v)) return false
  return true
}

const ChevronIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

/* ── Interactive toggle ── */
function Toggle({ checked, onChange, readOnly, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={readOnly ? undefined : onChange}
      disabled={disabled}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''} ${readOnly ? styles.toggleReadOnly : ''}`}
    >
      <span className={styles.toggleThumb} />
    </button>
  )
}

/* ── Member card with lazy permission load ── */
function MemberCard({ membro, projectId, expanded, onToggleExpand, isMe }) {
  const [apiPerms,  setApiPerms]  = useState(null)
  const [editPerms, setEditPerms] = useState(null)
  const [cardStatus, setCardStatus] = useState('idle') // 'idle'|'loading'|'saving'|'resetting'
  const [cardError, setCardError] = useState('')

  const isGerente = membro.cargo === 'Gerente'
  const badgeColor = ROLE_META[membro.cargo]?.color ?? '#475569'

  /* Load actual permissions on first expand (skip for Gerentes — they have all) */
  useEffect(() => {
    if (!expanded || apiPerms !== null || isGerente) return
    setCardStatus('loading')
    setCardError('')
    projetoService.buscarPermissoesMembro(projectId, membro.id)
      .then(data => {
        const set = new Set(Array.isArray(data?.permissoes) ? data.permissoes : [])
        setApiPerms(set)
        setEditPerms(new Set(set))
      })
      .catch(() => setCardError('Erro ao carregar permissões.'))
      .finally(() => setCardStatus('idle'))
  }, [expanded, projectId, membro.id, apiPerms, isGerente])

  function togglePerm(key) {
    setEditPerms(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const isDirty = editPerms && apiPerms && !setsEqual(editPerms, apiPerms)
  const busy    = cardStatus !== 'idle'

  async function handleSave() {
    setCardStatus('saving')
    setCardError('')
    try {
      await projetoService.editarPermissoesMembro(projectId, membro.id, {
        permissoes: Array.from(editPerms),
      })
      setApiPerms(new Set(editPerms))
    } catch {
      setCardError('Erro ao salvar. Tente novamente.')
    } finally {
      setCardStatus('idle')
    }
  }

  function handleDiscard() {
    setEditPerms(new Set(apiPerms))
    setCardError('')
  }

  async function handleReset() {
    setCardStatus('resetting')
    setCardError('')
    try {
      await projetoService.restaurarPermissoesMembro(projectId, membro.id)
      const data = await projetoService.buscarPermissoesMembro(projectId, membro.id)
      const set = new Set(Array.isArray(data?.permissoes) ? data.permissoes : [])
      setApiPerms(set)
      setEditPerms(new Set(set))
    } catch {
      setCardError('Erro ao restaurar. Tente novamente.')
    } finally {
      setCardStatus('idle')
    }
  }

  return (
    <div className={`${styles.card} ${expanded ? styles.cardExpanded : ''}`}>
      <button className={styles.cardHeader} onClick={onToggleExpand} type="button">
        <div className={styles.memberAvatar} style={{ background: avatarColor(membro.nome || membro.email) }}>
          {initials(membro.nome || membro.email)}
        </div>
        <div className={styles.memberInfo}>
          <span className={styles.memberName}>
            {membro.nome}
            {isMe && <span className={styles.youTag}>Você</span>}
          </span>
          <span className={styles.memberEmail}>{membro.email}</span>
        </div>
        <span className={styles.roleBadge} style={{ background: badgeColor }}>
          {membro.cargo ?? 'Membro'}
        </span>
        <span className={styles.cardChevron}><ChevronIcon open={expanded} /></span>
      </button>

      {expanded && (
        <div className={styles.cardBody}>
          {isGerente ? (
            <p className={styles.gerenteNote}>
              Gerentes possuem todas as permissões do projeto por definição.
            </p>
          ) : cardStatus === 'loading' ? (
            <p className={styles.loadingNote}>Carregando permissões...</p>
          ) : (
            <>
              <div className={styles.groupsGrid}>
                {PERMISSION_GROUPS.map(group => (
                  <div key={group.key} className={styles.group}>
                    <p className={styles.groupTitle}>{group.label}</p>
                    <div className={styles.permList}>
                      {group.permissions.map(perm => (
                        <div key={perm.key} className={styles.permRow}>
                          <span className={styles.permLabel}>{perm.label}</span>
                          <Toggle
                            checked={editPerms?.has(perm.key) ?? false}
                            onChange={() => togglePerm(perm.key)}
                            disabled={busy}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {cardError && <p className={styles.cardErrorMsg}>{cardError}</p>}

              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.btnReset}
                  onClick={handleReset}
                  disabled={busy}
                  title="Restaurar permissões padrão do papel"
                >
                  {cardStatus === 'resetting' ? 'Restaurando...' : 'Restaurar padrão'}
                </button>
                <div style={{ flex: 1 }} />
                <button
                  type="button"
                  className={styles.btnDiscard}
                  onClick={handleDiscard}
                  disabled={!isDirty || busy}
                >
                  Descartar
                </button>
                <button
                  type="button"
                  className={styles.btnSave}
                  onClick={handleSave}
                  disabled={!isDirty || busy}
                >
                  {cardStatus === 'saving' ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Page ── */
export default function PermissionsPage() {
  const { projectId } = useParams()
  const { user }      = useAuth()
  const [membros,    setMembros]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [expanded,   setExpanded]   = useState(null)
  const [myIsGerente, setMyIsGerente] = useState(null) // null while loading

  const fetchMembros = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await projetoService.listarMembros(projectId)
      const list = Array.isArray(data) ? data : []
      setMembros(list)
      const me = list.find(m => m.email === user?.email)
      setMyIsGerente(me?.cargo === 'Gerente')
    } catch {
      setError('Erro ao carregar membros.')
      setMyIsGerente(false)
    } finally {
      setLoading(false)
    }
  }, [projectId, user?.email])

  useEffect(() => { fetchMembros() }, [fetchMembros])

  /* Redirect non-gerentes to view-only page */
  if (!loading && myIsGerente === false) {
    return <Navigate to={`/project/${projectId}/permissions/view`} replace />
  }

  function toggle(id) {
    setExpanded(prev => (prev === id ? null : id))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Permissões por Membro</h1>
        <p className={styles.subtitle}>
          Gerencie acessos granulares para cada integrante. Alterações extras sobrepõem o papel padrão.
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
              projectId={projectId}
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
