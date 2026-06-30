import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { projetoService } from '../../services/projetoService'
import { useAuth } from '../../hooks/useAuth'
import styles from './ProjectsPage.module.css'

/* ── Icons ── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const MoreIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
)
const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const ChevronRightSmIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
const CubeIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)
const MobileIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
)
const DatabaseIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)
const BellIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
  </svg>
)
const ArchiveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="5" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><line x1="10" y1="13" x2="14" y2="13" />
  </svg>
)
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)
const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
)
const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="3" cy="6" r="1" fill="currentColor" /><circle cx="3" cy="12" r="1" fill="currentColor" /><circle cx="3" cy="18" r="1" fill="currentColor" />
  </svg>
)
const ExitIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)
const FolderOpenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

/* ── Card theme helpers ── */
const CARD_THEMES = [
  { bg: '#02214E', Icon: CubeIcon },
  { bg: '#051A3E', Icon: CubeIcon },
  { bg: '#0a1628', Icon: MobileIcon },
  { bg: '#0d1623', Icon: CubeIcon },
  { bg: '#0f4c29', Icon: DatabaseIcon },
  { bg: '#1a0a33', Icon: CubeIcon },
  { bg: '#1a2035', Icon: MobileIcon },
]
function getTheme(id) {
  return CARD_THEMES[(Number(id) || 0) % CARD_THEMES.length]
}

const AVATAR_COLORS = ['#0369a1', '#7c3aed', '#0891b2', '#02214E', '#475569']
function avatarColor(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

const FILTERS = ['Todos', 'Em Andamento', 'Concluídos', 'Planejamento']
const PAGE_SIZE = 8

/* ── Role icons for step 2 ── */
const GerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" /><circle cx="17" cy="21" r="3" /><path d="M17 18v-1" /><path d="M17 24v-1" /><path d="M20 21h-1" /><path d="M14 21h1" />
  </svg>
)
const MemIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const EyeSmIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
)
const LockSmIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const MailSmIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

// papel = PapelProjeto.getNomePapel() (lowercase). GERENTE not atribuível.
const ROLE_OPTIONS = [
  { label: 'Membro',       value: 'membro',       Icon: MemIcon },
  { label: 'Visualizador', value: 'visualizador',  Icon: EyeSmIcon },
]

const AVATAR_BG = ['#f97316', '#0891b2', '#7c3aed', '#0369a1', '#15803d']
function memberColor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_BG[h % AVATAR_BG.length]
}
function initials(name = '') {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'
}

/* ── Novo Projeto Modal (two-panel, two-step) ── */
function NovoProjetoModal({ onClose, onSuccess }) {
  const { user } = useAuth()
  const [step, setStep]           = useState(1)
  const [novoProjeto, setNovoProjeto] = useState(null)
  const [form, setForm]           = useState({ nome: '', descricao: '', metodologia: '' })
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  // step 2 — papel = PapelProjeto value, cargo = CargoProjeto default
  const [emailConvidado, setEmailConvidado] = useState('')
  const [roleSel, setRoleSel]     = useState('membro')
  const [staged, setStaged]       = useState([])   // { email, papel, nome }
  const [addingMember, setAddingMember] = useState(false)

  const leftNote = step === 1
    ? 'O nome do projeto deve ser único em sua organização para facilitar a rastreabilidade.'
    : 'Existem três papéis que você pode escolher como preferência padrão. Caso deseje alterar depois, você poderá fazer isso em configurações.'

  /* ── Step 1: create project ── */
  async function handleStep1(e) {
    e.preventDefault()
    if (!form.nome.trim()) { setError('Nome obrigatório.'); return }
    setLoading(true); setError('')
    try {
      const novo = await projetoService.criar({
        nome: form.nome.trim(),
        tipoEstimativa: form.metodologia === 'Horas' ? 'Horas' : 'Pontos',
      })
      setNovoProjeto(novo)
      setStep(2)
    } catch (err) {
      setError(err.body?.message ?? 'Erro ao criar projeto.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Step 2: stage member from input ── */
  function stageCurrentMember() {
    const e = emailConvidado.trim()
    if (!e) return
    if (staged.find(m => m.email === e)) return
    setStaged(prev => [...prev, { email: e, papel: roleSel, nome: e.split('@')[0] }])
    setEmailConvidado('')
  }

  /* ── Step 2: add staged members → finish ── */
  async function handleFinish() {
    setAddingMember(true)
    const extra = emailConvidado.trim()
    const toAdd = extra ? [...staged, { email: extra, papel: roleSel }] : staged

    try {
      await Promise.allSettled(
        toAdd.map(m => projetoService.adicionarMembro(novoProjeto.id, {
          emailUsuario: m.email,
          cargo: 'Desenvolvedor',   // default CargoProjeto — step 2 não coleta cargo
          papel: m.papel,
        }))
      )
    } finally {
      setAddingMember(false)
    }
    onSuccess(novoProjeto)
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalTwoPanel} onClick={e => e.stopPropagation()}>

        {/* ── Left panel ── */}
        <div className={styles.modalLeft}>
          <div className={styles.modalLeftContent}>
            <h2 className={styles.modalLeftTitle}>Novo Projeto</h2>
            <p className={styles.modalLeftDesc}>
              Crie um novo ambiente de trabalho arquitetônico. Defina o nome e comece a gerenciar suas metas técnicas hoje.
            </p>
          </div>
          <div className={styles.modalLeftNote}>
            <div className={styles.modalNoteHeader}>
              <BellIcon /><span className={styles.modalNoteLabel}>LEMBRETE</span>
            </div>
            <p className={styles.modalNoteText}>{leftNote}</p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className={styles.modalRight}>
          <button className={styles.modalClose} onClick={onClose}><XIcon /></button>

          {step === 1 ? (
            <form className={styles.modalForm} onSubmit={handleStep1} noValidate>
              <div className={styles.field}>
                <label htmlFor="nome">NOME DO PROJETO</label>
                <div className={styles.inputWithIcon}>
                  <input id="nome" type="text" placeholder="Ex.: Reestruturação Matriz"
                    value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                    autoFocus maxLength={255} />
                  <span className={styles.inputCheckIcon}><CheckCircleIcon /></span>
                </div>
                <span className={styles.fieldHint}>Disponibilidade verificada automaticamente</span>
              </div>
              <div className={styles.field}>
                <label htmlFor="descricao">DESCRIÇÃO</label>
                <textarea id="descricao" placeholder="Ex.: Esse projeto visa colaborar com..."
                  value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={3} />
              </div>
              <div className={styles.field}>
                <label htmlFor="metodologia">METODOLOGIA</label>
                <select id="metodologia" value={form.metodologia}
                  onChange={e => setForm(f => ({ ...f, metodologia: e.target.value }))}>
                  <option value="">Selecione a metodologia</option>
                  <option value="Scrum">Scrum</option>
                  <option value="Kanban">Kanban</option>
                  <option value="Horas">Baseado em Horas</option>
                </select>
              </div>
              {error && <p className={styles.modalError}>{error}</p>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary} disabled={loading}>
                  {loading ? 'Criando...' : 'Próximo →'}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.modalForm}>
              <p className={styles.teamSectionTitle}>ADIÇÃO DE EQUIPE</p>

              {/* Email input */}
              <div className={styles.field}>
                <label htmlFor="emailConv">E-MAIL DO CONVIDADO</label>
                <div className={styles.inputWithIcon}>
                  <span className={styles.inputPrefixIcon}><MailSmIcon /></span>
                  <input id="emailConv" type="email" placeholder="exemplo@avia.com.br"
                    className={styles.inputWithPrefix}
                    value={emailConvidado}
                    onChange={e => setEmailConvidado(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), stageCurrentMember())}
                    autoFocus />
                </div>
              </div>

              {/* Role selector */}
              <div className={styles.field}>
                <label>PAPEL NO PROJETO</label>
                <div className={styles.roleGrid}>
                  {ROLE_OPTIONS.map(({ label, value, Icon }) => (
                    <button key={value} type="button"
                      className={`${styles.roleCard} ${roleSel === value ? styles.roleCardActive : ''}`}
                      onClick={() => setRoleSel(value)}>
                      <Icon />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Already added */}
              <div className={styles.field}>
                <label>JÁ ADICIONADOS ({1 + staged.length})</label>
                <div className={styles.membersList}>
                  {/* Creator — locked */}
                  <div className={styles.memberRow}>
                    <span className={styles.memberAvatar} style={{ background: memberColor(user?.name || 'U') }}>
                      {initials(user?.name || user?.email || 'U')}
                    </span>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>{user?.name || user?.email}</span>
                      <span className={styles.memberRole}>Proprietário</span>
                    </div>
                    <span className={styles.memberLock}><LockSmIcon /></span>
                  </div>
                  {/* Staged members */}
                  {staged.map(m => (
                    <div key={m.email} className={styles.memberRow}>
                      <span className={styles.memberAvatar} style={{ background: memberColor(m.nome || m.email) }}>
                        {initials(m.nome || m.email)}
                      </span>
                      <div className={styles.memberInfo}>
                        <span className={styles.memberName}>{m.email}</span>
                        <span className={styles.memberRole}>
                          {ROLE_OPTIONS.find(r => r.value === m.papel)?.label || m.papel}
                        </span>
                      </div>
                      <button className={styles.memberRemove}
                        onClick={() => setStaged(prev => prev.filter(x => x.email !== m.email))}>
                        <XIcon />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => onSuccess(novoProjeto)}>
                  Pular por enquanto
                </button>
                <button type="button" className={styles.btnPrimary} disabled={addingMember} onClick={handleFinish}>
                  {addingMember ? 'Adicionando...' : 'Adicionar e Finalizar'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

/* ── Card context menu ── */
const STATUS_OPTIONS = [
  { label: 'Planejamento', Icon: CalendarIcon },
  { label: 'Em andamento', Icon: RefreshIcon },
  { label: 'Concluído',    Icon: CheckCircleIcon },
]

function CardMenu({ projetoId, projetoNome, onClose, onStatusChange }) {
  const navigate = useNavigate()
  const [showStatus, setShowStatus] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/project/${projetoId}`)
    onClose()
  }

  return (
    <div className={styles.contextMenu} ref={ref} onClick={e => e.stopPropagation()}>
      <button className={styles.contextItem} onClick={() => { navigate(`/project/${projetoId}`); onClose() }}>
        <FolderOpenIcon /> Abrir projeto
      </button>
      <button className={styles.contextItem} onClick={() => { alert('Em desenvolvimento'); onClose() }}>
        <ExitIcon /> Sair do projeto
      </button>

      <div
        className={`${styles.contextItem} ${styles.contextItemSub}`}
        onMouseEnter={() => setShowStatus(true)}
        onMouseLeave={() => setShowStatus(false)}
      >
        <span className={styles.contextItemLeft}><RefreshIcon /> Alterar status</span>
        <ChevronRightSmIcon />
        {showStatus && (
          <div className={styles.contextSubmenu}>
            {STATUS_OPTIONS.map(({ label, Icon }) => (
              <button
                key={label}
                className={styles.contextItem}
                onClick={() => { onStatusChange(projetoId, label); onClose() }}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.contextDivider} />

      <button className={styles.contextItem} onClick={() => { alert('Em desenvolvimento'); onClose() }}>
        <ArchiveIcon /> Arquivar projeto
      </button>
      <button className={styles.contextItem} onClick={copyLink}>
        <LinkIcon /> Copiar link
      </button>
      <button className={styles.contextItem} onClick={() => { navigate(`/project/${projetoId}/settings`); onClose() }}>
        <SettingsIcon /> Ir para configurações
      </button>
    </div>
  )
}

/* ── Project List Row ── */
function ProjectListRow({ projeto, onStatusChange }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const { bg } = getTheme(projeto.id)
  const ini = (projeto.nome || 'P').slice(0, 2).toUpperCase()
  const status = projeto._status || 'EM ANDAMENTO'

  return (
    <div className={styles.listRow} onClick={() => navigate(`/project/${projeto.id}`)}>
      <div className={styles.listRowDot} style={{ background: bg }}>
        <span className={styles.listRowIni}>{ini}</span>
      </div>
      <div className={styles.listRowMain}>
        <span className={styles.listRowName}>{projeto.nome}</span>
        <span className={styles.listRowDesc}>
          {projeto.tipoEstimativa === 'Pontos' ? 'Story points' : 'Horas'}
        </span>
      </div>
      <div className={styles.listRowMeta}>
        <span className={`${styles.listStatusBadge} ${status === 'PLANEJAMENTO' ? styles.listStatusPlanning : status === 'CONCLUÍDO' ? styles.listStatusDone : styles.listStatusActive}`}>
          {status === 'EM ANDAMENTO' ? 'Em andamento' : status === 'PLANEJAMENTO' ? 'Planejamento' : 'Concluído'}
        </span>
        <span className={styles.listBadge}>{projeto.tipoEstimativa}</span>
      </div>
      <div className={styles.listRowActions} onClick={e => e.stopPropagation()}>
        <button
          className={styles.cardMenuBtn}
          style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
          aria-label="Mais opções"
        >
          <MoreIcon />
        </button>
        {menuOpen && (
          <CardMenu
            projetoId={projeto.id}
            projetoNome={projeto.nome}
            onClose={() => setMenuOpen(false)}
            onStatusChange={onStatusChange}
          />
        )}
      </div>
      <ChevronRightSmIcon />
    </div>
  )
}

/* ── Project Card ── */
function ProjectCard({ projeto, onStatusChange }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const { bg, Icon } = getTheme(projeto.id)
  const initials = (projeto.nome || 'P').slice(0, 2).toUpperCase()
  const status = projeto._status || 'EM ANDAMENTO'

  return (
    <div className={styles.card} onClick={() => navigate(`/project/${projeto.id}`)}>
      <div className={styles.cardHeader} style={{ background: bg }}>
        <span className={`${styles.statusBadge} ${status === 'PLANEJAMENTO' ? styles.statusPlanning : status === 'CONCLUÍDO' ? styles.statusDone : ''}`}>
          {status}
        </span>
        <span className={styles.cardIcon}><Icon /></span>
      </div>
      <div className={styles.cardMenuWrap} onClick={e => e.stopPropagation()}>
        <button
          className={styles.cardMenuBtn}
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
          aria-label="Mais opções"
        >
          <MoreIcon />
        </button>
        {menuOpen && (
          <CardMenu
            projetoId={projeto.id}
            projetoNome={projeto.nome}
            onClose={() => setMenuOpen(false)}
            onStatusChange={onStatusChange}
          />
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{projeto.nome}</h3>
        <p className={styles.cardDesc}>
          {projeto.tipoEstimativa === 'Pontos' ? 'Estimativas em story points.' : 'Estimativas em horas.'}
          {' '}Clique para acessar.
        </p>

        <div className={styles.cardFooter}>
          <div className={styles.avatarStack}>
            <span className={styles.miniAvatar} style={{ background: avatarColor(initials) }}>
              {initials[0]}
            </span>
          </div>
          <span className={styles.cardBadge}>{projeto.tipoEstimativa}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Pagination ── */
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null
  const pages = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('…')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
    if (current < total - 2) pages.push('…')
    pages.push(total)
  }
  return (
    <div className={styles.pagination}>
      <button className={styles.pageBtn} disabled={current === 1} onClick={() => onChange(current - 1)}>
        <ChevronLeftIcon />
      </button>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`e${i}`} className={styles.pageEllipsis}>…</span>
          : <button key={p} className={`${styles.pageBtn} ${p === current ? styles.pageBtnActive : ''}`} onClick={() => onChange(p)}>{p}</button>
      )}
      <button className={styles.pageBtn} disabled={current === total} onClick={() => onChange(current + 1)}>
        <ChevronRightIcon />
      </button>
    </div>
  )
}

/* ── Main Page ── */
export default function ProjectsPage() {
  const [projetos, setProjetos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [view, setView] = useState('grid')

  const fetchProjetos = useCallback(async () => {
    setLoading(true); setError('')
    try { setProjetos(await projetoService.listar()) }
    catch { setError('Erro ao carregar projetos.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchProjetos() }, [fetchProjetos])

  const filtered = projetos.filter(p => {
    const matchQuery = p.nome.toLowerCase().includes(query.toLowerCase())
    const matchFilter = filter === 'Todos'
      || (filter === 'Em Andamento'  && (p._status || 'EM ANDAMENTO') === 'EM ANDAMENTO')
      || (filter === 'Planejamento'  && p._status === 'PLANEJAMENTO')
      || (filter === 'Concluídos'    && p._status === 'CONCLUÍDO')
    return matchQuery && matchFilter
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(e) { setQuery(e.target.value); setPage(1) }
  function handleFilter(f) { setFilter(f); setPage(1) }

  function handleNewProject(novo) {
    setProjetos(prev => [novo, ...prev])
    setShowModal(false)
  }

  function handleStatusChange(id, label) {
    const map = { 'Em andamento': 'EM ANDAMENTO', 'Planejamento': 'PLANEJAMENTO', 'Concluído': 'CONCLUÍDO' }
    setProjetos(prev => prev.map(p => p.id === id ? { ...p, _status: map[label] } : p))
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Projetos de Tecnologia</h1>
          <p className={styles.pageSubtitle}>Encontre e gerencie todos os seus projetos na AVIA.</p>
        </div>
        <button className={styles.newBtn} onClick={() => setShowModal(true)}>
          <PlusIcon /> Novo Projeto
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input className={styles.searchInput} placeholder="Pesquisar projetos..." value={query} onChange={handleSearch} />
        </div>
        <div className={styles.filterTabs}>
          {FILTERS.map(f => (
            <button key={f} className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ''}`} onClick={() => handleFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className={styles.viewToggle}>
          <button className={`${styles.viewBtn} ${view === 'grid' ? styles.viewBtnActive : ''}`} onClick={() => setView('grid')} title="Grade">
            <GridIcon />
          </button>
          <button className={`${styles.viewBtn} ${view === 'list' ? styles.viewBtnActive : ''}`} onClick={() => setView('list')} title="Lista">
            <ListIcon />
          </button>
        </div>
      </div>

      {query && (
        <p className={styles.resultCount}>
          {filtered.length} projeto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''} para: <strong>{query}</strong>
        </p>
      )}

      {loading ? (
        <div className={styles.stateBox}><p className={styles.stateText}>Carregando projetos...</p></div>
      ) : error ? (
        <div className={styles.stateBox}>
          <p className={styles.stateError}>{error}</p>
          <button className={styles.retryBtn} onClick={fetchProjetos}>Tentar novamente</button>
        </div>
      ) : paginated.length === 0 ? (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>{query ? `Nenhum projeto encontrado para "${query}".` : 'Nenhum projeto ainda. Crie o primeiro!'}</p>
        </div>
      ) : view === 'grid' ? (
        <div className={styles.grid}>
          {paginated.map(p => (
            <ProjectCard key={p.id} projeto={p} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : (
        <div className={styles.listView}>
          {paginated.map(p => (
            <ProjectListRow key={p.id} projeto={p} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      <Pagination current={page} total={totalPages} onChange={setPage} />

      {showModal && (
        <NovoProjetoModal onClose={() => setShowModal(false)} onSuccess={handleNewProject} />
      )}
    </div>
  )
}
