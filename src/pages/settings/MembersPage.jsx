import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { projetoService } from '../../services/projetoService'
import { useAuth } from '../../hooks/useAuth'
import styles from './MembersPage.module.css'

/* ── Icons ── */
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const XSmIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

/* ── Constants ── */
const PAPEL_OPTIONS = [
  { label: 'Membro',       displayLabel: 'MEMBRO',       value: 'membro' },
  { label: 'Visualizador', displayLabel: 'VISUALIZADOR', value: 'visualizador' },
]

const CARGO_OPTIONS = [
  { label: 'Scrum Master',           value: 'Scrum Master' },
  { label: 'Desenvolvedor',          value: 'Desenvolvedor' },
  { label: 'QA',                     value: 'QA' },
  { label: 'Analista de Requisitos', value: 'Analista de Requisistos' },
  { label: 'Designer de UI/UX',      value: 'Designer de UI/UX' },
  { label: 'Arquiteto de Software',  value: 'Arquiteto de Software' },
  { label: 'DevOps',                 value: 'DevOps' },
]

// papel vem como uppercase do backend: "GERENTE", "MEMBRO", "VISUALIZADOR"
const PAPEL_BADGE = {
  GERENTE:      { bg: '#dcfce7', color: '#15803d', label: 'Gerente' },
  MEMBRO:       { bg: '#dbeafe', color: '#1d4ed8', label: 'Membro' },
  VISUALIZADOR: { bg: '#ede9fe', color: '#7c3aed', label: 'Visualizador' },
}

const AVATAR_COLORS = ['#f97316', '#0891b2', '#7c3aed', '#0369a1', '#15803d', '#be123c']
function avatarColor(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function initials(name = '') {
  const parts = name.trim().split(/\s+/)
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || '?'
}
function relTime(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 2)  return 'Enviado agora'
  if (mins < 60) return `Enviado há ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Enviado há ${hours}h`
  return `Enviado há ${Math.floor(hours / 24)} dia(s)`
}

/* ── Dropdown genérico ── */
function Dropdown({ options, value, onChange, placeholder = 'Selecionar...' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find(o => o.value === value)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={styles.dropdownWrap} ref={ref}>
      <button type="button" className={styles.dropdownTrigger} onClick={() => setOpen(o => !o)}>
        <span>{current?.label ?? placeholder}</span>
        <ChevronDownIcon />
      </button>
      {open && (
        <div className={styles.dropdownMenu}>
          {options.map(opt => (
            <button key={opt.value} type="button"
              className={`${styles.dropdownItem} ${value === opt.value ? styles.dropdownItemActive : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}>
              <span className={styles.dropdownItemLabel}>{opt.displayLabel ?? opt.label}</span>
              {value === opt.value && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── ChipInput ── */
function ChipInput({ chips, onAdd, onRemove }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  function commitCurrent() {
    const val = input.trim().replace(/,$/, '')
    if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      onAdd(val)
      setInput('')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault(); commitCurrent()
    } else if (e.key === 'Backspace' && !input && chips.length) {
      onRemove(chips[chips.length - 1])
    }
  }

  return (
    <div className={styles.chipInput} onClick={() => inputRef.current?.focus()}>
      {chips.map(email => (
        <span key={email} className={styles.chip}>
          {email}
          <button type="button" className={styles.chipRemove} onClick={() => onRemove(email)}>
            <XSmIcon />
          </button>
        </span>
      ))}
      <input ref={inputRef} type="text" value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown} onBlur={commitCurrent}
        placeholder={chips.length ? 'Adicionar mais...' : 'ex.: joao@empresa.com, maria@empresa.com'}
        className={styles.chipInputField} />
    </div>
  )
}

/* ── Toast ── */
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={styles.toast}>
      <span className={styles.toastIcon}><CheckCircleIcon /></span>
      <span className={styles.toastMsg}>{message}</span>
      <button type="button" className={styles.toastClose} onClick={onClose}><XSmIcon /></button>
    </div>
  )
}

/* ── Modal de convite ── */
function InviteModal({ projectId, onClose, onSuccess }) {
  const [emails, setEmails]   = useState([])
  const [papel, setPapel]     = useState('membro')
  const [cargo, setCargo]     = useState('Desenvolvedor')
  const [sending, setSending] = useState(false)
  const [pending, setPending] = useState([])

  function addEmail(e)    { if (!emails.includes(e)) setEmails(prev => [...prev, e]) }
  function removeEmail(e) { setEmails(prev => prev.filter(x => x !== e)) }

  async function handleSend() {
    if (!emails.length) return
    setSending(true)
    try {
      await Promise.allSettled(
        emails.map(email => projetoService.adicionarMembro(projectId, { emailUsuario: email, cargo, papel }))
      )
      const now = Date.now()
      setPending(prev => [
        ...emails.map(email => ({ id: `${email}-${now}`, email, papel, cargo, sentAt: now })),
        ...prev,
      ])
      setEmails([])
      setPapel('membro')
      setCargo('Desenvolvedor')
      onSuccess()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.inviteModal} onClick={e => e.stopPropagation()}>
        <div className={styles.inviteModalHeader}>
          <h2 className={styles.inviteModalTitle}>Convidar por E-mail</h2>
          <button className={styles.modalCloseBtn} onClick={onClose}><XIcon /></button>
        </div>
        <p className={styles.inviteModalSubtitle}>
          Adicione endereços separados por vírgula para convidar vários membros ao mesmo tempo.
        </p>

        <div className={styles.inviteBody}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>E-MAILS DOS CONVIDADOS</label>
            <ChipInput chips={emails} onAdd={addEmail} onRemove={removeEmail} />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>PAPEL INICIAL</label>
              <Dropdown options={PAPEL_OPTIONS} value={papel} onChange={setPapel} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>CARGO</label>
              <Dropdown options={CARGO_OPTIONS} value={cargo} onChange={setCargo} />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="button" className={styles.btnSend} onClick={handleSend}
              disabled={sending || !emails.length}>
              {sending ? 'Enviando...' : 'Enviar Convites'}
            </button>
          </div>

          {pending.length > 0 && (
            <div className={styles.invitePendingSection}>
              <p className={styles.invitePendingTitle}>Convites enviados ({pending.length})</p>
              <div className={styles.pendingList}>
                {pending.map(p => {
                  const bs = PAPEL_BADGE[p.papel?.toUpperCase()] || PAPEL_BADGE.MEMBRO
                  return (
                    <div key={p.id} className={styles.pendingRow}>
                      <span className={styles.pendingMailIcon}><MailIcon /></span>
                      <div className={styles.pendingInfo}>
                        <span className={styles.pendingEmail}>{p.email}</span>
                        <div className={styles.pendingMeta}>
                          <span className={styles.pendingRoleBadge}
                            style={{ background: bs.bg, color: bs.color }}>{bs.label}</span>
                          <span className={styles.pendingTime}>{relTime(p.sentAt)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className={styles.infoBox}>
                <span className={styles.infoIcon}><InfoIcon /></span>
                <p className={styles.infoText}>
                  Os convidados receberão acesso ao projeto com as permissões definidas.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Modal de edição de membro ── */
function EditMemberModal({ membro, onClose, onSave }) {
  const [papel, setPapel] = useState(membro.papel?.toLowerCase() || 'membro')
  const [cargo, setCargo] = useState(membro.cargo || 'Desenvolvedor')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(membro.id, { cargo, papel })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.editModal} onClick={e => e.stopPropagation()}>
        <div className={styles.inviteModalHeader}>
          <h2 className={styles.inviteModalTitle}>Editar Membro</h2>
          <button className={styles.modalCloseBtn} onClick={onClose}><XIcon /></button>
        </div>
        <div className={styles.editMemberInfo}>
          <span className={styles.editAvatar}
            style={{ background: avatarColor(membro.nome || membro.email) }}>
            {initials(membro.nome || membro.email)}
          </span>
          <div>
            <p className={styles.editName}>{membro.nome}</p>
            <p className={styles.editEmail}>{membro.email}</p>
          </div>
        </div>
        <div className={styles.inviteBody}>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>PAPEL</label>
              <Dropdown options={PAPEL_OPTIONS} value={papel} onChange={setPapel} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>CARGO</label>
              <Dropdown options={CARGO_OPTIONS} value={cargo} onChange={setCargo} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="button" className={styles.btnSend} onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Confirm remove ── */
function ConfirmRemoveModal({ membro, onClose, onConfirm }) {
  const [removing, setRemoving] = useState(false)

  async function handleConfirm() {
    setRemoving(true)
    try {
      await onConfirm(membro.email)
      onClose()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.confirmTitle}>Remover Membro</h2>
        <p className={styles.confirmText}>
          Tem certeza que deseja remover <strong>{membro.nome || membro.email}</strong> do projeto?
          Esta ação não pode ser desfeita.
        </p>
        <div className={styles.formActions}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="button" className={styles.btnDanger} onClick={handleConfirm} disabled={removing}>
            {removing ? 'Removendo...' : 'Remover Membro'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function MembersPage() {
  const { projectId }  = useParams()
  const { user }       = useAuth()
  const [membros, setMembros]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [removingMembro, setRemovingMembro] = useState(null)
  const [editingMembro, setEditingMembro]   = useState(null)
  const [toast, setToast]           = useState(null)
  const hideToast = useCallback(() => setToast(null), [])

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

  async function handleRemove(email) {
    await projetoService.removerMembro(projectId, email)
    setToast('Membro removido do projeto.')
    fetchMembros()
  }

  async function handleEditSave(membroId, data) {
    await projetoService.atualizarMembro(projectId, membroId, data)
    setToast('Membro atualizado com sucesso.')
    fetchMembros()
  }

  function handleInviteSuccess() {
    setToast('Convite enviado com sucesso.')
    fetchMembros()
  }

  const myMembro = membros.find(m => m.email === user?.email)
  const isGerente = myMembro?.cargo === 'Gerente'

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Membros do Projeto</h1>
          <p className={styles.pageSubtitle}>
            {membros.length} membro{membros.length !== 1 ? 's' : ''} neste projeto
          </p>
        </div>
        {isGerente && (
          <button className={styles.inviteBtn} onClick={() => setShowInvite(true)}>
            <PlusIcon /> Convidar Membros
          </button>
        )}
      </div>

      {/* ── Members card ── */}
      <div className={styles.membersCard}>
        {loading ? (
          <p className={styles.stateText}>Carregando membros...</p>
        ) : error ? (
          <p className={styles.stateError}>{error}</p>
        ) : membros.length === 0 ? (
          <p className={styles.stateText}>Nenhum membro encontrado.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHead}>
                <th className={styles.thMember}>Membro</th>
                <th className={styles.thCargo}>Cargo</th>
                <th className={styles.thPapel}>Papel</th>
                {isGerente && <th className={styles.thActions} />}
              </tr>
            </thead>
            <tbody>
              {membros.map(m => {
                const isGer  = m.cargo === 'Gerente'
                const isMe   = m.email === user?.email
                const badge  = PAPEL_BADGE[m.papel?.toUpperCase()] ?? PAPEL_BADGE.MEMBRO
                return (
                  <tr key={m.id} className={styles.tableRow}>
                    <td className={styles.tdMember}>
                      <span className={styles.avatar}
                        style={{ background: avatarColor(m.nome || m.email) }}>
                        {initials(m.nome || m.email)}
                      </span>
                      <div className={styles.memberInfo}>
                        <span className={styles.memberName}>
                          {m.nome}{isMe && <span className={styles.youBadge}>Você</span>}
                        </span>
                        <span className={styles.memberEmail}>{m.email}</span>
                      </div>
                    </td>
                    <td className={styles.tdCargo}>
                      <span className={styles.cargoBadge}>{m.cargo}</span>
                    </td>
                    <td className={styles.tdPapel}>
                      <span className={styles.papelBadge}
                        style={{ background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                    {isGerente && (
                      <td className={styles.tdActions}>
                        {!isGer && !isMe && (
                          <>
                            <button className={styles.actionBtn}
                              title="Editar papel/cargo"
                              onClick={() => setEditingMembro(m)}>
                              <EditIcon />
                            </button>
                            <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                              title="Remover"
                              onClick={() => setRemovingMembro(m)}>
                              <TrashIcon />
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modals ── */}
      {showInvite && (
        <InviteModal
          projectId={projectId}
          onClose={() => setShowInvite(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
      {editingMembro && (
        <EditMemberModal
          membro={editingMembro}
          onClose={() => setEditingMembro(null)}
          onSave={handleEditSave}
        />
      )}
      {removingMembro && (
        <ConfirmRemoveModal
          membro={removingMembro}
          onClose={() => setRemovingMembro(null)}
          onConfirm={handleRemove}
        />
      )}
      {toast && <Toast message={toast} onClose={hideToast} />}
    </div>
  )
}
