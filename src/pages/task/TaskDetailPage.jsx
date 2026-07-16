import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { projetoService } from '../../services/projetoService'
import styles from './TaskDetailPage.module.css'

/* ─── Constants ─────────────────────────────────────────────────────── */
const STATUS_OPTIONS = [
  { value: 'A_FAZER',   label: 'A Fazer' },
  { value: 'FAZENDO',   label: 'Fazendo' },
  { value: 'TESTE',     label: 'Em Teste' },
  { value: 'CONCLUIDA', label: 'Concluída' },
]
const PRIORIDADE_OPTIONS = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA',  label: 'Alta' },
]
const STATUS_COLORS = {
  A_FAZER:   { bg: '#f1f5f9', color: '#64748b' },
  FAZENDO:   { bg: '#dbeafe', color: '#1d4ed8' },
  TESTE:     { bg: '#fef9c3', color: '#a16207' },
  CONCLUIDA: { bg: '#dcfce7', color: '#15803d' },
}
const PRIORIDADE_COLORS = {
  BAIXA: { bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' },
  MEDIA: { bg: '#fefce8', color: '#ca8a04', dot: '#eab308' },
  ALTA:  { bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
}

const AVATAR_COLORS = ['#6366f1', '#0891b2', '#f97316', '#15803d', '#be123c', '#7c3aed']
function avatarColor(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || '?'
}
function renderCommentText(text, membros = []) {
  if (!text) return text
  const names = membros.map(m => m.nome).filter(Boolean)
  if (!names.length) return text
  const escaped = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(@(?:${escaped.join('|')}))`, 'g')
  const parts = text.split(re)
  return parts.map((part, i) =>
    names.some(n => part === `@${n}`)
      ? <strong key={i}>{part}</strong>
      : part
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtRelative(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1)  return 'agora mesmo'
  if (diffMin < 60) return `${diffMin}m atrás`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)  return `${diffH}h atrás`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'ontem'
  return `${diffD} dias atrás`
}

/* ─── Icons ──────────────────────────────────────────────────────────── */
const IconAttach = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
)
const IconLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)
const IconPoker = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="14" height="18" rx="2"/>
    <path d="M8 9h2"/><path d="M8 13h4"/><path d="M8 17h2"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2"/>
  </svg>
)
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconChevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

/* ─── Small dropdown helper ──────────────────────────────────────────── */
function SideDropdown({ options, value, onChange, renderTrigger }) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState(null)
  const ref = useRef(null)
  const triggerRef = useRef(null)
  useEffect(() => {
    if (!open) return
    const h = (e) => {
      if (ref.current && ref.current.contains(e.target)) return
      if (triggerRef.current && triggerRef.current.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  function handleToggle() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    setOpen(o => !o)
  }

  return (
    <div className={styles.dropWrap}>
      <button type="button" ref={triggerRef} className={styles.dropTrigger} onClick={handleToggle}>
        {renderTrigger(value)}
        <span className={styles.dropArrow}><IconChevron open={open} /></span>
      </button>
      {open && menuPos && createPortal(
        <div
          ref={ref}
          className={styles.dropMenu}
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, width: menuPos.width, zIndex: 9999 }}
        >
          {options.map(opt => (
            <button key={opt.value} type="button" className={`${styles.dropOpt} ${opt.value === value ? styles.dropOptActive : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}>
              {opt.label}
              {opt.value === value && <span style={{ marginLeft: 'auto' }}><IconCheck /></span>}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

/* ─── Modal: Adicionar Anexo ─────────────────────────────────────────── */
function AnexarModal({ onClose, onAdd }) {
  const [nome, setNome] = useState('')
  const [url,  setUrl]  = useState('')
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim() || !url.trim()) { setErr('Preencha todos os campos.'); return }
    setBusy(true); setErr('')
    try {
      await onAdd({ nome: nome.trim(), tipoArquivo: 'link', url: url.trim() })
      onClose()
    } catch {
      setErr('Erro ao adicionar link.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Adicionar Link</h3>
          <button type="button" className={styles.modalClose} onClick={onClose}><IconX /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <label className={styles.fieldLabel}>Nome</label>
          <input className={styles.fieldInput} value={nome} onChange={e => setNome(e.target.value)}
            placeholder="ex: Documento de requisitos" autoFocus />
          <label className={styles.fieldLabel} style={{ marginTop: 14 }}>URL / Link</label>
          <input className={styles.fieldInput} value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://..." />
          {err && <p className={styles.fieldErr}>{err}</p>}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnPrimary} disabled={busy}>
              {busy ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Modal: Vincular Tarefa ─────────────────────────────────────────── */
function VincularModal({ projectId, currentTaskId, parentId, onClose, onLink }) {
  const [tasks,   setTasks]   = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [busy,    setBusy]    = useState(false)

  useEffect(() => {
    projetoService.listarTarefas(projectId)
      .then(data => setTasks(Array.isArray(data) ? data.filter(t => t.id !== Number(currentTaskId)) : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [projectId, currentTaskId])

  const filtered = tasks.filter(t =>
    t.titulo?.toLowerCase().includes(search.toLowerCase()) ||
    String(t.id).includes(search)
  )

  async function handleSelect(taskId) {
    setBusy(true)
    try {
      await onLink(taskId)
      onClose()
    } catch {
      setBusy(false)
    }
  }

  async function handleUnlink() {
    setBusy(true)
    try {
      await onLink(-1)
      onClose()
    } catch {
      setBusy(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Vincular Tarefa</h3>
          <button type="button" className={styles.modalClose} onClick={onClose}><IconX /></button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><IconSearch /></span>
            <input className={styles.searchInput} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar tarefa..." autoFocus />
          </div>
          {loading ? (
            <p className={styles.emptyNote}>Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className={styles.emptyNote}>Nenhuma tarefa encontrada.</p>
          ) : (
            <div className={styles.taskList}>
              {filtered.map(t => {
                const sc = STATUS_COLORS[t.status] || STATUS_COLORS.A_FAZER
                const isLinked = t.id === parentId
                return (
                  <button key={t.id} type="button" className={`${styles.taskOpt} ${isLinked ? styles.taskOptActive : ''}`}
                    onClick={() => handleSelect(t.id)} disabled={busy}>
                    <span className={styles.taskOptId}>#{t.id}</span>
                    <span className={styles.taskOptTitle}>{t.titulo}</span>
                    <span className={styles.taskOptStatus} style={{ background: sc.bg, color: sc.color }}>
                      {STATUS_OPTIONS.find(s => s.value === t.status)?.label ?? t.status}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
          {parentId && (
            <div className={styles.modalFooter}>
              <button type="button" className={styles.btnDanger} onClick={handleUnlink} disabled={busy}>
                Desvincular tarefa atual
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function TaskDetailPage() {
  const { projectId, taskId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  /* Core data */
  const [tarefa,    setTarefa]    = useState(null)
  const [membros,   setMembros]   = useState([])
  const [comentarios, setComentarios] = useState([])
  const [anexos,    setAnexos]    = useState([])
  const [parentTask, setParentTask] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  /* UI state */
  const [editingTitle,  setEditingTitle]  = useState(false)
  const [titleDraft,    setTitleDraft]    = useState('')
  const [editingDesc,   setEditingDesc]   = useState(false)
  const [descDraft,     setDescDraft]     = useState('')
  const [newComment,    setNewComment]    = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [showAnexar,    setShowAnexar]    = useState(false)
  const [showVincular,  setShowVincular]  = useState(false)
  const [savingField,   setSavingField]   = useState(null)
  const [storyEdit,     setStoryEdit]     = useState(false)
  const [storyDraft,    setStoryDraft]    = useState('')
  const [membrosOpen,   setMembrosOpen]   = useState(false)
  const [mentionQuery,  setMentionQuery]  = useState(null)
  const membrosRef  = useRef(null)
  const commentRef  = useRef(null)

  /* Load everything */
  const fetchAll = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [t, m, c, a] = await Promise.all([
        projetoService.buscarTarefa(projectId, taskId),
        projetoService.listarMembros(projectId),
        projetoService.listarComentarios(projectId, taskId).catch(() => []),
        projetoService.listarAnexos(projectId, taskId).catch(() => []),
      ])
      setTarefa(t)
      setMembros(Array.isArray(m) ? m : [])
      setComentarios(Array.isArray(c) ? c : [])
      setAnexos(Array.isArray(a) ? a : [])
      if (t.tarefaParenteId) {
        projetoService.buscarTarefa(projectId, t.tarefaParenteId)
          .then(setParentTask)
          .catch(() => {})
      }
    } catch {
      setError('Erro ao carregar tarefa.')
    } finally {
      setLoading(false)
    }
  }, [projectId, taskId])

  useEffect(() => { fetchAll() }, [fetchAll])

  /* Close membros dropdown on outside click */
  useEffect(() => {
    if (!membrosOpen) return
    const h = e => { if (membrosRef.current && !membrosRef.current.contains(e.target)) setMembrosOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [membrosOpen])

  /* ── Patch helpers ── */
  async function patchTarefa(fields) {
    const updated = await projetoService.editarTarefa(projectId, taskId, fields)
    setTarefa(updated)
    if (updated.tarefaParenteId && updated.tarefaParenteId !== tarefa?.tarefaParenteId) {
      projetoService.buscarTarefa(projectId, updated.tarefaParenteId)
        .then(setParentTask).catch(() => {})
    } else if (!updated.tarefaParenteId) {
      setParentTask(null)
    }
    return updated
  }

  async function patchStatus(val) {
    setSavingField('status')
    try {
      const updated = await projetoService.atualizarStatus(projectId, taskId, { status: val })
      setTarefa(updated)
    } finally { setSavingField(null) }
  }

  async function toggleImpedimento() {
    setSavingField('impedimento')
    try {
      const updated = await projetoService.editarTarefa(projectId, taskId, { impedimento: !tarefa.impedimento })
      setTarefa(updated)
    } finally { setSavingField(null) }
  }

  async function saveTitle() {
    if (!titleDraft.trim() || titleDraft === tarefa.titulo) { setEditingTitle(false); return }
    setSavingField('titulo')
    try { await patchTarefa({ titulo: titleDraft }) } finally {
      setSavingField(null); setEditingTitle(false)
    }
  }

  async function saveDesc() {
    if (descDraft === (tarefa.descricao ?? '')) { setEditingDesc(false); return }
    setSavingField('descricao')
    try { await patchTarefa({ descricao: descDraft }) } finally {
      setSavingField(null); setEditingDesc(false)
    }
  }

  async function saveStory() {
    const v = parseInt(storyDraft, 10)
    if (isNaN(v) || v === tarefa.estimativa) { setStoryEdit(false); return }
    setSavingField('estimativa')
    try { await patchTarefa({ estimativa: v }) } finally {
      setSavingField(null); setStoryEdit(false)
    }
  }

  async function toggleResponsavel(membro) {
    const current = tarefa.responsaveis || []
    const isSelected = current.some(r => r.id === membro.id)
    const newIds = isSelected
      ? current.filter(r => r.id !== membro.id).map(r => r.id)
      : [...current.map(r => r.id), membro.id]
    setSavingField('responsavel')
    try { await patchTarefa({ responsaveisIds: newIds }) }
    finally { setSavingField(null) }
  }

  async function setPrioridade(prioridade) {
    setSavingField('prioridade')
    try { await patchTarefa({ prioridade }) } finally { setSavingField(null) }
  }

  async function vincularTarefa(parentTaskId) {
    await patchTarefa({ tarefaParenteId: parentTaskId })
  }

  function parseEmailsMencionados(text) {
    return membros
      .filter(m => m.nome && m.email && text.includes(`@${m.nome}`))
      .map(m => m.email)
  }

  function handleCommentChange(e) {
    const val = e.target.value
    setNewComment(val)
    const cursor = e.target.selectionStart
    const before = val.slice(0, cursor)
    const match  = before.match(/@(\S*)$/)
    setMentionQuery(match ? match[1] : null)
  }

  function insertMention(membro) {
    const el     = commentRef.current
    const cursor = el ? el.selectionStart : newComment.length
    const before = newComment.slice(0, cursor)
    const after  = newComment.slice(cursor)
    const match  = before.match(/@(\S*)$/)
    const prefix = match ? before.slice(0, before.length - match[0].length) : before
    setNewComment(`${prefix}@${membro.nome} ${after}`)
    setMentionQuery(null)
    setTimeout(() => el?.focus(), 0)
  }

  async function postComment() {
    if (!newComment.trim()) return
    setPostingComment(true)
    try {
      const emailsMencionados = parseEmailsMencionados(newComment)
      const c = await projetoService.adicionarComentario(projectId, taskId, {
        descricao: newComment,
        emailsMencionados,
      })
      setComentarios(prev => [...prev, c])
      setNewComment('')
      setMentionQuery(null)
    } finally { setPostingComment(false) }
  }

  async function addAnexo(data) {
    const a = await projetoService.adicionarAnexo(projectId, taskId, data)
    setAnexos(prev => [...prev, a])
  }

  async function removeAnexo(anexoId) {
    await projetoService.removerAnexo(projectId, taskId, anexoId)
    setAnexos(prev => prev.filter(a => a.id !== anexoId))
  }

  /* ── Guards ── */
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Carregando tarefa...</div>
      </div>
    )
  }
  if (error || !tarefa) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>{error || 'Tarefa não encontrada.'}</div>
      </div>
    )
  }

  const statusMeta    = STATUS_COLORS[tarefa.status]    || STATUS_COLORS.A_FAZER
  const prioridadeMeta = tarefa.prioridade ? PRIORIDADE_COLORS[tarefa.prioridade] : null

  return (
    <div className={styles.page}>
      {/* ─── Left column ─── */}
      <div className={styles.main}>

        {/* Breadcrumb + back */}
        <div className={styles.breadcrumb}>
          <Link to={`/project/${projectId}/backlog`} className={styles.breadLink}>PROJETOS</Link>
          <span className={styles.breadSep}>›</span>
          <span className={styles.breadCurrent}>APS-{taskId}</span>
        </div>

        {/* Title */}
        <div className={styles.titleWrap}>
          {editingTitle ? (
            <div className={styles.titleEditRow}>
              <input
                autoFocus
                className={styles.titleInput}
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
              />
              <button className={styles.inlineBtn} onClick={saveTitle} disabled={savingField === 'titulo'}><IconCheck /></button>
              <button className={styles.inlineBtn} onClick={() => setEditingTitle(false)}><IconX /></button>
            </div>
          ) : (
            <h1 className={styles.title} onClick={() => { setTitleDraft(tarefa.titulo); setEditingTitle(true) }}>
              {tarefa.titulo}
              <span className={styles.titleEditHint}><IconEdit /></span>
            </h1>
          )}
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => setShowAnexar(true)}>
            <IconAttach /> Anexar
          </button>
          <button className={styles.actionBtn} onClick={() => setShowVincular(true)}>
            <IconLink /> Vincular Tarefa
          </button>
          <button className={styles.actionBtn}
            onClick={() => navigate(`/project/${projectId}/planning-poker/${taskId}`)}>
            <IconPoker /> Estimativa Colaborativa
          </button>
        </div>

        {/* Description */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Descrição</h2>
            {!editingDesc && (
              <button className={styles.sectionEditBtn}
                onClick={() => { setDescDraft(tarefa.descricao ?? ''); setEditingDesc(true) }}>
                <IconEdit /> Editar
              </button>
            )}
          </div>
          {editingDesc ? (
            <div className={styles.descEditWrap}>
              <textarea
                autoFocus
                className={styles.descTextarea}
                value={descDraft}
                onChange={e => setDescDraft(e.target.value)}
                rows={6}
              />
              <div className={styles.descActions}>
                <button className={styles.btnSecondary} onClick={() => setEditingDesc(false)}>Cancelar</button>
                <button className={styles.btnPrimary} onClick={saveDesc} disabled={savingField === 'descricao'}>
                  {savingField === 'descricao' ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          ) : (
            <p className={styles.descText}>
              {tarefa.descricao || <span className={styles.descEmpty}>Sem descrição. Clique em Editar para adicionar.</span>}
            </p>
          )}
        </section>

        {/* Anexos */}
        {anexos.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Anexos</h2>
            <div className={styles.anexosList}>
              {anexos.map(a => (
                <div key={a.id} className={styles.anexoItem}>
                  <div className={styles.anexoThumb}>
                    {a.tipoArquivo === 'imagem'
                      ? <img src={a.url} alt={a.nome} className={styles.anexoImg} />
                      : <span className={styles.anexoIcon}>📎</span>
                    }
                  </div>
                  <div className={styles.anexoInfo}>
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className={styles.anexoNomeLink}>
                      {a.nome}
                    </a>
                    {a.url && <span className={styles.anexoUrl}>{a.url}</span>}
                  </div>
                  <button className={styles.anexoAction} title="Remover" onClick={() => removeAnexo(a.id)}>
                    <IconX />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Atividade / Comentários */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Atividade</h2>

          {/* New comment */}
          <div className={styles.commentInputRow}>
            <div className={styles.commentAvatar} style={{ background: avatarColor(user?.name) }}>
              {initials(user?.name)}
            </div>
            <div className={styles.commentBox}>
              <textarea
                ref={commentRef}
                className={styles.commentInput}
                value={newComment}
                onChange={handleCommentChange}
                placeholder="Adicionar um comentário... Use @nome para mencionar"
                rows={3}
                onKeyDown={e => {
                  if (e.key === 'Escape') setMentionQuery(null)
                  if (e.key === 'Enter' && e.ctrlKey) postComment()
                }}
              />
              {mentionQuery !== null && (() => {
                const sugestoes = membros.filter(m =>
                  m.nome?.toLowerCase().startsWith(mentionQuery.toLowerCase())
                )
                return sugestoes.length > 0 ? (
                  <div className={styles.mentionList}>
                    {sugestoes.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        className={styles.mentionItem}
                        onMouseDown={e => { e.preventDefault(); insertMention(m) }}
                      >
                        <span className={styles.mentionAvatar} style={{ background: avatarColor(m.nome) }}>
                          {initials(m.nome)}
                        </span>
                        {m.nome}
                      </button>
                    ))}
                  </div>
                ) : null
              })()}
              <div className={styles.commentSubmitRow}>
                <button className={styles.btnPrimary} onClick={postComment}
                  disabled={!newComment.trim() || postingComment}>
                  {postingComment ? 'Enviando...' : 'Enviar comentário'}
                </button>
              </div>
            </div>
          </div>

          {/* Comment list */}
          <div className={styles.commentsList}>
            {comentarios.map(c => (
              <div key={c.id} className={styles.commentItem}>
                <div className={styles.commentAvatar} style={{ background: avatarColor(c.autorNome || '') }}>
                  {initials(c.autorNome || '?')}
                </div>
                <div className={styles.commentContent}>
                  <div className={styles.commentMeta}>
                    <span className={styles.commentAuthor}>{c.autorNome || 'Usuário'}</span>
                    <span className={styles.commentTime}>{fmtRelative(c.criadoEm)}</span>
                  </div>
                  <p className={styles.commentText}>{renderCommentText(c.descricao, membros)}</p>
                </div>
              </div>
            ))}
            {comentarios.length === 0 && (
              <p className={styles.descEmpty}>Nenhum comentário ainda.</p>
            )}
          </div>
        </section>
      </div>

      {/* ─── Right sidebar ─── */}
      <aside className={styles.sidebar}>

        {/* Status */}
        <div className={styles.sideSection}>
          <p className={styles.sideLabel}>STATUS</p>
          <SideDropdown
            options={STATUS_OPTIONS}
            value={tarefa.status}
            onChange={patchStatus}
            renderTrigger={val => {
              const opt = STATUS_OPTIONS.find(o => o.value === val)
              const sc  = STATUS_COLORS[val] || STATUS_COLORS.A_FAZER
              return (
                <span className={styles.statusChip} style={{ background: sc.bg, color: sc.color }}>
                  {opt?.label ?? val}
                </span>
              )
            }}
          />
        </div>

        {/* Impedimento */}
        <div className={styles.sideSection}>
          <p className={styles.sideLabel}>IMPEDIMENTO</p>
          <label className={styles.impedimentoCheck}>
            <input
              type="checkbox"
              checked={!!tarefa.impedimento}
              onChange={toggleImpedimento}
              disabled={savingField === 'impedimento'}
            />
            <span>{tarefa.impedimento ? 'Bloqueado' : 'Sem impedimento'}</span>
          </label>
        </div>

        {/* Responsáveis */}
        <div className={styles.sideSection}>
          <p className={styles.sideLabel}>RESPONSÁVEIS</p>
          <div className={styles.dropWrap} ref={membrosRef}>
            <button type="button" className={styles.dropTrigger} onClick={() => setMembrosOpen(o => !o)}>
              {tarefa.responsaveis?.length > 0 ? (
                <span className={styles.memberRow}>
                  <span className={styles.avatarStack}>
                    {tarefa.responsaveis.slice(0, 3).map(r => (
                      <span key={r.id} className={styles.memberAvatar} style={{ background: avatarColor(r.nome) }}>
                        {initials(r.nome)}
                      </span>
                    ))}
                  </span>
                  <span className={styles.memberName}>
                    {tarefa.responsaveis.length === 1
                      ? tarefa.responsaveis[0].nome
                      : `${tarefa.responsaveis.length} pessoas`}
                  </span>
                </span>
              ) : (
                <span className={styles.unassigned}>Não atribuído</span>
              )}
              <span className={styles.dropArrow}><IconChevron open={membrosOpen} /></span>
            </button>
            {membrosOpen && (
              <div className={styles.dropMenu}>
                {membros.map(m => {
                  const isSelected = tarefa.responsaveis?.some(r => r.id === m.id)
                  return (
                    <button key={m.id} type="button"
                      className={`${styles.dropOpt} ${isSelected ? styles.dropOptActive : ''}`}
                      onClick={() => toggleResponsavel(m)}>
                      <span className={styles.memberRow}>
                        <span className={styles.memberAvatar} style={{ background: avatarColor(m.nome) }}>
                          {initials(m.nome)}
                        </span>
                        <span className={styles.memberName}>{m.nome}</span>
                      </span>
                      {isSelected && <span style={{ marginLeft: 'auto' }}><IconCheck /></span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Prioridade */}
        <div className={styles.sideSection}>
          <p className={styles.sideLabel}>PRIORIDADE</p>
          <SideDropdown
            options={PRIORIDADE_OPTIONS}
            value={tarefa.prioridade ?? 'BAIXA'}
            onChange={setPrioridade}
            renderTrigger={val => {
              const opt = PRIORIDADE_OPTIONS.find(o => o.value === val)
              const pc  = PRIORIDADE_COLORS[val] || PRIORIDADE_COLORS.BAIXA
              return (
                <span className={styles.prioChip} style={{ background: pc.bg, color: pc.color }}>
                  <span className={styles.prioDot} style={{ background: pc.dot }} />
                  {opt?.label ?? val}
                </span>
              )
            }}
          />
        </div>

        {/* Story Points */}
        <div className={styles.sideSection}>
          <p className={styles.sideLabel}>STORY POINTS</p>
          {storyEdit ? (
            <div className={styles.storyEditRow}>
              <input type="number" min="0" className={styles.storyInput}
                value={storyDraft}
                onChange={e => setStoryDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveStory(); if (e.key === 'Escape') setStoryEdit(false) }}
                autoFocus
              />
              <button className={styles.inlineBtn} onClick={saveStory}><IconCheck /></button>
              <button className={styles.inlineBtn} onClick={() => setStoryEdit(false)}><IconX /></button>
            </div>
          ) : (
            <button type="button" className={styles.storyBtn}
              onClick={() => { setStoryDraft(String(tarefa.estimativa ?? '')); setStoryEdit(true) }}>
              <span className={styles.storyValue}>{tarefa.estimativa ?? '—'}</span>
              <span className={styles.storyUnit}>Story Points</span>
              <span className={styles.storyEditIcon}><IconEdit /></span>
            </button>
          )}
        </div>

        {/* Datas */}
        <div className={styles.sideSection}>
          <div className={styles.dateRow}>
            <div>
              <p className={styles.sideLabel}>CRIADO</p>
              <p className={styles.dateVal}>{tarefa.id ? `#${taskId}` : '—'}</p>
            </div>
          </div>
        </div>

        {/* Tarefas Vinculadas */}
        <div className={styles.sideSection}>
          <div className={styles.sideSectionHead}>
            <p className={styles.sideLabel}>TAREFAS VINCULADAS</p>
            <button className={styles.sidePlusBtn} onClick={() => setShowVincular(true)} title="Vincular tarefa">
              <IconPlus />
            </button>
          </div>
          {parentTask ? (
            <div className={styles.linkedTask}>
              <span className={styles.linkedTaskId}>#{parentTask.id}</span>
              <span className={styles.linkedTaskTitle}>{parentTask.titulo}</span>
              <span className={styles.linkedTaskStatus}
                style={{ background: (STATUS_COLORS[parentTask.status] || STATUS_COLORS.A_FAZER).bg,
                         color: (STATUS_COLORS[parentTask.status] || STATUS_COLORS.A_FAZER).color }}>
                {STATUS_OPTIONS.find(s => s.value === parentTask.status)?.label ?? parentTask.status}
              </span>
            </div>
          ) : (
            <p className={styles.descEmpty}>Nenhuma tarefa vinculada.</p>
          )}
        </div>

        {/* Histórico placeholder */}
        <div className={styles.sideSection}>
          <p className={styles.sideLabel}>HISTÓRICO</p>
          <div className={styles.historyList}>
            <div className={styles.historyItem}>
              <span className={styles.historyDot} />
              <p className={styles.historyText}>Tarefa criada</p>
            </div>
            {tarefa.status !== 'A_FAZER' && (
              <div className={styles.historyItem}>
                <span className={styles.historyDot} />
                <p className={styles.historyText}>
                  Status alterado para "{STATUS_OPTIONS.find(s => s.value === tarefa.status)?.label}"
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Modals ─── */}
      {showAnexar && (
        <AnexarModal onClose={() => setShowAnexar(false)} onAdd={addAnexo} />
      )}
      {showVincular && (
        <VincularModal
          projectId={projectId}
          currentTaskId={taskId}
          parentId={tarefa.tarefaParenteId}
          onClose={() => setShowVincular(false)}
          onLink={vincularTarefa}
        />
      )}
    </div>
  )
}
