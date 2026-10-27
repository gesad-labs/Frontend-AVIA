import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { projetoService } from '../../services/projetoService'
import { useNotificacoesCtx } from '../../contexts/NotificacoesContext'
import { getErrorMessage } from '../../utils/errors'
import styles from './BoardPage.module.css'

const COLUMNS = [
  { key: 'A_FAZER',   label: 'A Fazer'   },
  { key: 'FAZENDO',   label: 'Fazendo'   },
  { key: 'TESTE',     label: 'Em Teste'  },
  { key: 'CONCLUIDA', label: 'Concluída' },
]

const PRIORIDADE_ORDER = { ALTA: 0, MEDIA: 1, BAIXA: 2 }

const TIPO_COLORS = {
  'ARQUITETURA':   { bg: '#e0e7ff', color: '#3730a3' },
  'DESIGN SYSTEM': { bg: '#ccfbf1', color: '#0f766e' },
  'DESIGN':        { bg: '#ccfbf1', color: '#0f766e' },
  'BACKEND':       { bg: '#d1fae5', color: '#065f46' },
  'FRONTEND':      { bg: '#dbeafe', color: '#1d4ed8' },
  'MELHORIA':      { bg: '#ffedd5', color: '#9a3412' },
  'BUG':           { bg: '#fef2f2', color: '#991b1b' },
  'FEATURE':       { bg: '#ede9fe', color: '#5b21b6' },
  'DOC':           { bg: '#fef9c3', color: '#713f12' },
  'DOCUMENTAÇÃO':  { bg: '#fef9c3', color: '#713f12' },
  'CORE':          { bg: '#f1f5f9', color: '#334155' },
  'TESTE':         { bg: '#f0fdf4', color: '#166534' },
  'INFRA':         { bg: '#f0f9ff', color: '#0369a1' },
  'PESQUISA':      { bg: '#faf5ff', color: '#6b21a8' },
  'ALTA':          { bg: '#fef2f2', color: '#991b1b' },
  'MÉDIA':         { bg: '#fffbeb', color: '#92400e' },
  'BAIXA':         { bg: '#f0fdf4', color: '#166534' },
}

const PRIORIDADE_LABEL = { ALTA: 'Alta', MEDIA: 'Média', BAIXA: 'Baixa' }
const PRIORIDADE_STYLE = {
  ALTA:  { bg: '#fef2f2', color: '#991b1b' },
  MEDIA: { bg: '#fffbeb', color: '#92400e' },
  BAIXA: { bg: '#f0fdf4', color: '#166534' },
}

const STATUS_COLORS = {
  A_FAZER:   { bg: '#f1f5f9', color: '#64748b', label: 'A Fazer' },
  FAZENDO:   { bg: '#dbeafe', color: '#1d4ed8', label: 'Fazendo' },
  TESTE:     { bg: '#fef9c3', color: '#a16207', label: 'Em Teste' },
  CONCLUIDA: { bg: '#dcfce7', color: '#15803d', label: 'Concluída' },
}

const TIPO_OPTIONS = ['BUG', 'MELHORIA', 'TAREFA']
const STATUS_OPTIONS_BOARD = [
  { value: 'A_FAZER',   label: 'A Fazer' },
  { value: 'FAZENDO',   label: 'Fazendo' },
  { value: 'TESTE',     label: 'Em Teste' },
  { value: 'CONCLUIDA', label: 'Concluída' },
]

/* ── Helpers ── */
const AVATAR_COLORS = ['#6366f1', '#0891b2', '#f97316', '#15803d', '#be123c', '#7c3aed']
function avatarColor(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || '?'
}

function AvatarBubble({ nome, size = 26 }) {
  return (
    <div
      className={styles.avatarBubble}
      style={{ background: avatarColor(nome), width: size, height: size, fontSize: size * 0.38 }}
      title={nome}
    >
      {initials(nome)}
    </div>
  )
}

/* ── Icons ── */
function IconBolt() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}
function IconDots() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IconBlock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  )
}
function IconFilter() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}
function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function IconAttach() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  )
}
function IconCheckSquare() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  )
}
function IconBell() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

/* ── Card notification bell ── */
function CardNotifBell({ notifs }) {
  const [open, setOpen]       = useState(false)
  const [dropPos, setDropPos] = useState(null)
  const btnRef  = useRef(null)
  const dropRef = useRef(null)
  const { marcarLida }  = useNotificacoesCtx()
  const navigate        = useNavigate()
  const { projectId }   = useParams()

  useEffect(() => {
    if (!open) return
    function close(e) {
      if (btnRef.current?.contains(e.target)) return
      if (dropRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  function handleOpen(e) {
    e.stopPropagation()
    const rect = btnRef.current.getBoundingClientRect()
    const dropH = Math.min(notifs.length * 96 + 16, 300)
    if (window.innerHeight - rect.bottom < dropH) {
      setDropPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left })
    } else {
      setDropPos({ top: rect.bottom + 4, left: rect.left })
    }
    setOpen(v => !v)
  }

  if (notifs.length === 0) return null

  return (
    <>
      <button
        ref={btnRef}
        className={styles.cardNotifBtn}
        onClick={handleOpen}
        title={`${notifs.length} notificação(ões) não lida(s)`}
        type="button"
      >
        <IconBell />
        <span className={styles.cardNotifCount}>{notifs.length}</span>
      </button>
      {open && dropPos && createPortal(
        <div
          ref={dropRef}
          className={styles.cardNotifDropdown}
          style={{
            position: 'fixed',
            top:    dropPos.top    ?? 'auto',
            bottom: dropPos.bottom ?? 'auto',
            left:   dropPos.left,
            zIndex: 9999,
          }}
        >
          {notifs.map(n => (
            <div key={n.id} className={styles.cardNotifItem}>
              <p className={styles.cardNotifMsg}>{n.mensagem}</p>
              <div className={styles.cardNotifActions}>
                <button
                  className={styles.cardNotifVer}
                  onClick={() => {
                    marcarLida(n.id)
                    if (n.tarefaId) navigate(`/project/${projectId}/task/${n.tarefaId}`)
                    setOpen(false)
                  }}
                >
                  Ver notificação
                </button>
                <button
                  className={styles.cardNotifLida}
                  onClick={() => { marcarLida(n.id); setOpen(false) }}
                >
                  Marcar lido
                </button>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

/* ── Type tag ── */
function CardTypeTag({ tipo }) {
  if (!tipo) return null
  const key = tipo.toUpperCase()
  const cfg = TIPO_COLORS[key] ?? { bg: '#e2e8f0', color: '#475569' }
  return (
    <span className={styles.cardTypeTag} style={{ background: cfg.bg, color: cfg.color }}>
      {tipo.toUpperCase()}
    </span>
  )
}

function CardPrioridadeTag({ prioridade }) {
  if (!prioridade) return null
  const key = prioridade.toUpperCase()
  const cfg = PRIORIDADE_STYLE[key] ?? PRIORIDADE_STYLE.MEDIA
  return (
    <span className={styles.cardTypeTag} style={{ background: cfg.bg, color: cfg.color }}>
      {PRIORIDADE_LABEL[key] ?? prioridade}
    </span>
  )
}

function CardImpedimentoTag() {
  return (
    <span className={styles.cardImpedimentoTag}>
      <IconBlock /> Impedimento
    </span>
  )
}

/* Card com predecessor ainda não concluído (campo `bloqueada` vem do back). */
function CardBloqueioTag({ bloqueadaPorId }) {
  return (
    <span
      className={styles.cardBloqueioTag}
      title={`Só pode ir para "Fazendo" depois que APS-${bloqueadaPorId} for concluído`}
    >
      <IconBlock /> Bloqueado por APS-{bloqueadaPorId}
    </span>
  )
}

function CardSubcardTag({ paiId }) {
  return (
    <span className={styles.cardSubcardTag} title={`Este card é um subcard de APS-${paiId}`}>
      Subcard de APS-{paiId}
    </span>
  )
}

function CardStatusTag({ status }) {
  if (!status) return null
  const cfg = STATUS_COLORS[status]
  if (!cfg) return null
  return (
    <span className={styles.cardStatusTag} style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

/* ── Filter Panel ── */
function FilterPanel({
  membros,
  filterText, onFilterText,
  filterResponsaveis, onToggleResponsavel,
  filterPrioridades, onTogglePrioridade,
  filterImpedimento, onToggleImpedimento,
  onClear, onClose,
}) {
  return (
    <>
      <div className={styles.filterBackdrop} onClick={onClose} />
      <div className={styles.filterPanel}>
        <div className={styles.filterHeader}>
          <div className={styles.filterHeaderLeft}>
            <IconFilter />
            <span className={styles.filterTitle}>Filtros do Quadro</span>
          </div>
          <button className={styles.filterClose} onClick={onClose} type="button">×</button>
        </div>
        <div className={styles.filterContent}>
          <div className={styles.filterSection}>
            <p className={styles.filterSectionLabel}>BUSCAR CARD</p>
            <div className={styles.filterSearchWrap}>
              <IconSearch />
              <input
                className={styles.filterSearchInput}
                placeholder="Nome do card ou ID..."
                value={filterText}
                onChange={e => onFilterText(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          {membros.length > 0 && (
            <div className={styles.filterSection}>
              <p className={styles.filterSectionLabel}>RESPONSÁVEL</p>
              <div className={styles.filterCheckList}>
                {membros.map(m => (
                  <label key={m.id} className={styles.filterCheckItem}>
                    <input
                      type="checkbox"
                      checked={filterResponsaveis.has(m.id)}
                      onChange={() => onToggleResponsavel(m.id)}
                      className={styles.filterCheckbox}
                    />
                    <AvatarBubble nome={m.nome || m.email} size={28} />
                    <span className={styles.filterCheckLabel}>{m.nome || m.email}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className={styles.filterSection}>
            <p className={styles.filterSectionLabel}>PRIORIDADE</p>
            <div className={styles.filterChips}>
              {[
                { key: 'ALTA',  label: 'Alta',  dot: 'chipDotAlta'  },
                { key: 'MEDIA', label: 'Média', dot: 'chipDotMedia' },
                { key: 'BAIXA', label: 'Baixa', dot: 'chipDotBaixa' },
              ].map(({ key, label, dot }) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.filterChip} ${filterPrioridades.has(key) ? styles.filterChipActive : ''}`}
                  onClick={() => onTogglePrioridade(key)}
                >
                  <span className={`${styles.chipDot} ${styles[dot]}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterSection}>
            <p className={styles.filterSectionLabel}>STATUS CRÍTICO</p>
            <div className={styles.filterToggleRow}>
              <span className={styles.filterToggleIcon}>🚫</span>
              <span className={styles.filterToggleLabel}>Mostrar Impedimentos</span>
              <button
                type="button"
                className={`${styles.filterToggle} ${filterImpedimento ? styles.filterToggleOn : ''}`}
                onClick={() => onToggleImpedimento(!filterImpedimento)}
                role="switch"
                aria-checked={filterImpedimento}
              >
                <span className={`${styles.filterToggleThumb} ${filterImpedimento ? styles.filterToggleThumbActive : ''}`} />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.filterFooter}>
          <button type="button" className={styles.btnFilterClear} onClick={onClear}>Limpar Filtros</button>
          <button type="button" className={styles.btnFilterApply} onClick={onClose}>Aplicar Filtros</button>
        </div>
      </div>
    </>
  )
}

/* ── Edit Card Modal ── */
function EditCardModal({ tarefa, projectId, membros, onClose, onSaved }) {
  const [titulo, setTitulo]         = useState(tarefa.titulo)
  const [descricao, setDescricao]   = useState(tarefa.descricao ?? '')
  const [estimativa, setEstimativa] = useState(tarefa.estimativa ?? '')
  const [prioridade, setPrioridade] = useState(tarefa.prioridade ?? 'MEDIA')
  const [tipo, setTipo]             = useState(tarefa.tipo ?? '')
  const [status, setStatus]         = useState(tarefa.status ?? 'A_FAZER')
  const [impedimento, setImpedimento] = useState(!!tarefa.impedimento)
  const [responsaveisIds, setResponsaveisIds] = useState(
    new Set(tarefa.responsaveis?.map(r => r.id) ?? [])
  )
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function toggleResp(id) {
    setResponsaveisIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo.trim()) { setError('Título obrigatório'); return }
    setSaving(true); setError('')
    try {
      // Status primeiro: é onde o back aplica as regras (subcards pendentes / bloqueio).
      // Se for recusado, nada mais é salvo e o usuário vê o motivo.
      if (status !== tarefa.status) {
        await projetoService.atualizarStatus(projectId, tarefa.id, { status })
      }
      await projetoService.editarTarefa(projectId, tarefa.id, {
        titulo:          titulo.trim(),
        descricao:       descricao.trim() || titulo.trim(),
        estimativa:      estimativa !== '' ? Number(estimativa) : null,
        prioridade,
        responsaveisIds: Array.from(responsaveisIds),
        tipo:            tipo.trim() || null,
        impedimento,
      })
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar.'))
      setSaving(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Editar Tarefa</h2>
          <button className={styles.modalClose} onClick={onClose} type="button">×</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && <p className={styles.formError}>{error}</p>}
          <label className={styles.formLabel}>
            Título
            <input className={styles.formInput} value={titulo} onChange={e => setTitulo(e.target.value)} required autoFocus />
          </label>
          <label className={styles.formLabel}>
            Descrição
            <textarea className={`${styles.formInput} ${styles.formTextarea}`} value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} />
          </label>
          <div className={styles.formRow}>
            <label className={styles.formLabel} style={{ flex: 1 }}>
              Tipo / Etiqueta
              <select className={styles.formInput} value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="">Sem etiqueta</option>
                {TIPO_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className={styles.formLabel} style={{ flex: 1 }}>
              Prioridade
              <select className={styles.formInput} value={prioridade} onChange={e => setPrioridade(e.target.value)}>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Média</option>
                <option value="BAIXA">Baixa</option>
              </select>
            </label>
          </div>
          <div className={styles.formRow}>
            <label className={styles.formLabel} style={{ flex: 1 }}>
              Estimativa (pts)
              <input className={styles.formInput} type="number" min="0" value={estimativa} onChange={e => setEstimativa(e.target.value)} placeholder="—" />
            </label>
            <label className={styles.formLabel} style={{ flex: 1 }}>
              Status
              <select className={styles.formInput} value={status} onChange={e => setStatus(e.target.value)}>
                {STATUS_OPTIONS_BOARD.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>
          {membros.length > 0 && (
            <label className={styles.formLabel}>
              Responsáveis
              <div className={styles.checkList}>
                {membros.map(m => (
                  <label key={m.id} className={styles.checkItem}>
                    <input type="checkbox" checked={responsaveisIds.has(m.id)} onChange={() => toggleResp(m.id)} />
                    <span>{m.nome || m.email}</span>
                  </label>
                ))}
              </div>
            </label>
          )}
          <label className={styles.impedimentoCheckLabel}>
            <input type="checkbox" checked={impedimento} onChange={e => setImpedimento(e.target.checked)} />
            <span>Impedimento (bloqueado)</span>
          </label>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Add Card Modal ── */
function AddCardModal({ sprint, projectId, defaultStatus, membros, onClose, onSaved }) {
  const [titulo, setTitulo]         = useState('')
  const [estimativa, setEstimativa] = useState('')
  const [prioridade, setPrioridade] = useState('MEDIA')
  const [status, setStatus]         = useState(defaultStatus)
  const [tipo, setTipo]             = useState('')
  const [responsaveisIds, setResponsaveisIds] = useState(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function toggleResp(id) {
    setResponsaveisIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo.trim()) { setError('Título obrigatório'); return }
    setSaving(true); setError('')
    try {
      await projetoService.criarTarefa(projectId, {
        titulo:        titulo.trim(),
        descricao:     titulo.trim(),
        status,
        prioridade,
        estimativa:    estimativa !== '' ? Number(estimativa) : null,
        sprintId:      sprint.id,
        responsaveisIds: Array.from(responsaveisIds),
        tipo:          tipo || null,
      })
      onSaved()
    } catch {
      setError('Erro ao criar card.')
      setSaving(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Novo Card</h2>
          <button className={styles.modalClose} onClick={onClose} type="button">×</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && <p className={styles.formError}>{error}</p>}
          <label className={styles.formLabel}>
            Título
            <input className={styles.formInput} value={titulo} onChange={e => setTitulo(e.target.value)} required autoFocus />
          </label>
          <div className={styles.formRow}>
            <label className={styles.formLabel} style={{ flex: 1 }}>
              Tipo / Etiqueta
              <select className={styles.formInput} value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="">Sem etiqueta</option>
                {TIPO_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className={styles.formLabel} style={{ flex: 1 }}>
              Coluna
              <select className={styles.formInput} value={status} onChange={e => setStatus(e.target.value)}>
                {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </label>
          </div>
          <div className={styles.formRow}>
            <label className={styles.formLabel} style={{ flex: 1 }}>
              Prioridade
              <select className={styles.formInput} value={prioridade} onChange={e => setPrioridade(e.target.value)}>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Média</option>
                <option value="BAIXA">Baixa</option>
              </select>
            </label>
            <label className={styles.formLabel} style={{ flex: 1 }}>
              Estimativa (pts)
              <input className={styles.formInput} type="number" min="0" value={estimativa} onChange={e => setEstimativa(e.target.value)} placeholder="—" />
            </label>
          </div>
          {membros.length > 0 && (
            <label className={styles.formLabel}>
              Responsáveis
              <div className={styles.checkList}>
                {membros.map(m => (
                  <label key={m.id} className={styles.checkItem}>
                    <input type="checkbox" checked={responsaveisIds.has(m.id)} onChange={() => toggleResp(m.id)} />
                    <span>{m.nome || m.email}</span>
                  </label>
                ))}
              </div>
            </label>
          )}
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnSave} disabled={saving}>{saving ? 'Criando...' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Card context menu ── */
function CardMenu({ tarefa, onDetail, onEdit, onDelete, canEdit, canDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function close(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  function act(fn) { setOpen(false); fn() }

  return (
    <div className={styles.cardMenuWrap} ref={ref}>
      <button
        className={styles.cardMenuBtn}
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        title="Opções"
        type="button"
      >
        <IconDots />
      </button>
      {open && (
        <div className={styles.cardMenu}>
          <button onClick={() => act(onDetail)}>Detalhes</button>
          {canEdit && <button onClick={() => act(onEdit)}>Editar</button>}
          {canDelete && <button className={styles.cardMenuDanger} onClick={() => act(onDelete)}>Excluir</button>}
        </div>
      )}
    </div>
  )
}

/* ── Task card ── */
function TaskCard({ tarefa, projectId, notifs = [], onDetail, onEdit, onDelete, onRefresh, compact, altBg, canEdit, canDelete }) {
  const [dragging, setDragging] = useState(false)

  async function handleToggleImpedimento(e) {
    e.stopPropagation()
    try {
      await projetoService.editarTarefa(projectId, tarefa.id, { impedimento: !tarefa.impedimento })
      onRefresh?.()
    } catch { /* silencioso */ }
  }

  function handleDragStart(e) {
    setDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({
      tarefaId:     tarefa.id,
      sourceStatus: tarefa.status,
    }))
  }

  if (compact) {
    return (
      <div
        className={[
          styles.cardCompact,
          altBg ? styles.cardCompactAlt : '',
          dragging ? styles.cardDragging : '',
        ].filter(Boolean).join(' ')}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={() => setDragging(false)}
      >
        <span className={styles.cardCompactCheck}><IconCheck /></span>
        <div className={styles.cardCompactBody}>
          {tarefa.tipo && (
            <span className={styles.cardCompactType}>{tarefa.tipo.toUpperCase()}</span>
          )}
          <span className={styles.cardCompactTitle}>{tarefa.titulo}</span>
        </div>
        <div className={styles.cardCompactRight}>
          <CardNotifBell notifs={notifs} />
          <CardMenu tarefa={tarefa} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} canEdit={canEdit} canDelete={canDelete} />
        </div>
      </div>
    )
  }

  const hasAnexos    = (tarefa.anexosCount ?? 0) > 0
  const hasSubtarefas = (tarefa.subtarefasCount ?? 0) > 0

  return (
    <div
      className={[
        styles.card,
        tarefa.impedimento ? styles.cardImpedimento : '',
        dragging ? styles.cardDragging : '',
      ].filter(Boolean).join(' ')}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setDragging(false)}
    >
      {/* Top row: ID + notifications + menu */}
      <div className={styles.cardTopRow}>
        <span className={styles.cardId}>APS-{tarefa.id}</span>
        <div className={styles.cardTopRowActions}>
          <CardNotifBell notifs={notifs} />
          <CardMenu tarefa={tarefa} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} canEdit={canEdit} canDelete={canDelete} />
        </div>
      </div>

      {/* Tags side-by-side */}
      <div className={styles.cardTagRow}>
        <CardStatusTag status={tarefa.status} />
        <CardTypeTag tipo={tarefa.tipo} />
        <CardPrioridadeTag prioridade={tarefa.prioridade} />
        {tarefa.impedimento && <CardImpedimentoTag />}
        {tarefa.bloqueada && tarefa.bloqueadaPorId != null && <CardBloqueioTag bloqueadaPorId={tarefa.bloqueadaPorId} />}
        {tarefa.tarefaParenteId != null && <CardSubcardTag paiId={tarefa.tarefaParenteId} />}
      </div>

      {/* Impedimento toggle */}
      {canEdit && (
        <label className={styles.cardImpedimentoToggle} onClick={e => e.stopPropagation()}>
          <input type="checkbox" checked={!!tarefa.impedimento} onChange={handleToggleImpedimento} />
          <span>Impedimento</span>
        </label>
      )}

      {/* Title */}
      <p className={styles.cardTitle}>{tarefa.titulo}</p>

      {/* Description */}
      {tarefa.descricao && tarefa.descricao !== tarefa.titulo && (
        <p className={styles.cardDesc}>{tarefa.descricao}</p>
      )}

      {/* Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.cardFooterLeft}>
          {hasAnexos && (
            <span className={styles.cardMetaChip} title={`${tarefa.anexosCount} anexo(s)`}>
              <IconAttach /> {tarefa.anexosCount}
            </span>
          )}
          {hasSubtarefas && (
            <span
              className={styles.cardMetaChip}
              title={`${tarefa.subtarefasConcluidasCount ?? 0} de ${tarefa.subtarefasCount} subcard(s) concluído(s)`}
            >
              <IconCheckSquare /> {tarefa.subtarefasConcluidasCount ?? 0}/{tarefa.subtarefasCount}
            </span>
          )}
        </div>
        <div className={styles.cardFooterRight}>
          {tarefa.estimativa > 0 && (
            <span className={styles.cardPts}>{tarefa.estimativa} SP</span>
          )}
          {tarefa.responsaveis?.length > 0 && (
            <div className={styles.cardAvatars}>
              {tarefa.responsaveis.slice(0, 3).map(r => (
                <AvatarBubble key={r.id} nome={r.nome} size={24} />
              ))}
              {tarefa.responsaveis.length > 3 && (
                <div className={styles.cardAvatarMore}>+{tarefa.responsaveis.length - 3}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Board column ── */
function BoardColumn({ column, tarefas, projectId, onRefresh, onMoveStatus, onAddCard, onDetail, onEdit, onDelete, canCreateTarefas, canEdit, canDelete, notifsByTarefaId }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dropping, setDropping]     = useState(false)
  const counter = useRef(0)
  const isCompact = column.key === 'CONCLUIDA'

  function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  function onDragEnter(e) { e.preventDefault(); counter.current++; setIsDragOver(true) }
  function onDragLeave() { counter.current--; if (counter.current === 0) setIsDragOver(false) }

  async function onDrop(e) {
    e.preventDefault()
    counter.current = 0; setIsDragOver(false)
    let data
    try { data = JSON.parse(e.dataTransfer.getData('text/plain')) } catch { return }
    const { tarefaId, sourceStatus } = data
    if (sourceStatus === column.key) return
    setDropping(true)
    try {
      await onMoveStatus(tarefaId, column.key)
    } finally {
      setDropping(false)
    }
  }

  const colCls = [
    styles.column,
    isDragOver ? styles.columnDragOver : '',
    dropping   ? styles.columnDropping : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={colCls} onDragOver={onDragOver} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onDrop}>
      <div className={styles.columnHeader}>
        <span className={styles.columnTitle}>{column.label}</span>
        <div className={styles.columnHeaderRight}>
          <span className={styles.columnCount}>{tarefas.length}</span>
          {canCreateTarefas && (
            <button
              className={styles.columnAddBtn}
              onClick={() => onAddCard(column.key)}
              title={`Adicionar card em ${column.label}`}
              type="button"
            >
              +
            </button>
          )}
        </div>
      </div>

      <div className={styles.columnBody}>
        {tarefas.map((t, i) => (
          <TaskCard
            key={t.id}
            tarefa={t}
            projectId={projectId}
            notifs={notifsByTarefaId?.get(t.id) ?? []}
            compact={isCompact}
            altBg={isCompact && i % 2 === 1}
            onDetail={() => onDetail(t)}
            onEdit={() => onEdit(t)}
            onDelete={() => onDelete(t)}
            onRefresh={onRefresh}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ))}
        {isDragOver && <div className={styles.dropHint}>Soltar aqui</div>}
        {tarefas.length === 0 && !isDragOver && (
          <div className={styles.emptyColumn}>Nenhum card</div>
        )}
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function BoardPage() {
  const { projectId } = useParams()
  const navigate      = useNavigate()

  const { notificacoes } = useNotificacoesCtx()

  const cardNotifMap = useMemo(() => {
    const map = new Map()
    notificacoes.filter(n => !n.lida && n.tarefaId).forEach(n => {
      if (!map.has(n.tarefaId)) map.set(n.tarefaId, [])
      map.get(n.tarefaId).push(n)
    })
    return map
  }, [notificacoes])

  const [sprint, setSprint]               = useState(null)
  const [tarefas, setTarefas]             = useState([])
  const [projeto, setProjeto]             = useState(null)
  const [membros, setMembros]             = useState([])
  const [currentUser, setCurrentUser]     = useState(null)
  const [myPermissions, setMyPermissions] = useState(new Set())
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [noSprint, setNoSprint]           = useState(false)

  const [editingCard, setEditingCard]           = useState(null)
  const [addingCardStatus, setAddingCardStatus] = useState(null)
  const [closingSprint, setClosingSprint]       = useState(false)
  const [aviso, setAviso]                       = useState('')

  const [sortBy, setSortBy]   = useState('none')
  const [sortDir, setSortDir] = useState('asc')

  const [showFilters, setShowFilters]               = useState(false)
  const [filterText, setFilterText]                 = useState('')
  const [filterResponsaveis, setFilterResponsaveis] = useState(new Set())
  const [filterPrioridades, setFilterPrioridades]   = useState(new Set())
  const [filterImpedimento, setFilterImpedimento]   = useState(false)

  function toggleSet(setter, val) {
    setter(prev => {
      const next = new Set(prev)
      if (next.has(val)) next.delete(val); else next.add(val)
      return next
    })
  }

  function clearFilters() {
    setFilterText('')
    setFilterResponsaveis(new Set())
    setFilterPrioridades(new Set())
    setFilterImpedimento(false)
  }

  const activeFilterCount =
    (filterText.trim() ? 1 : 0) +
    filterResponsaveis.size +
    filterPrioridades.size +
    (filterImpedimento ? 1 : 0)

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(''); setNoSprint(false)
    try {
      const [sprints, proj, mems, userData] = await Promise.all([
        projetoService.listarSprints(projectId),
        projetoService.buscar(projectId),
        projetoService.listarMembros(projectId),
        projetoService.buscarUsuarioAtual().catch(() => null),
      ])
      setCurrentUser(userData)
      setProjeto(proj)
      const memList = Array.isArray(mems) ? mems : []
      setMembros(memList)

      if (userData) {
        projetoService.buscarPermissoesMembro(projectId, userData.id)
          .then(data => {
            const perms = Array.isArray(data?.permissoes) ? data.permissoes : []
            setMyPermissions(new Set(perms))
          })
          .catch(() => {})
      }

      const active = Array.isArray(sprints)
        ? sprints.find(s => s.status === 'EM_ANDAMENTO')
        : null

      if (!active) { setNoSprint(true); setLoading(false); return }

      setSprint(active)
      const t = await projetoService.listarTarefas(projectId, active.id)
      setTarefas(Array.isArray(t) ? t : [])
    } catch {
      setError('Erro ao carregar o board.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetchAll() }, [fetchAll])

  /* Regras (subcards pendentes, bloqueio por predecessor) são validadas no back;
     aqui só exibimos a mensagem que ele devolve (409). */
  async function handleMoveStatus(tarefaId, novoStatus) {
    setAviso('')
    try {
      await projetoService.atualizarStatus(projectId, tarefaId, { status: novoStatus })
      await fetchAll()
    } catch (err) {
      setAviso(getErrorMessage(err, 'Não foi possível mover o card.'))
    }
  }

  async function handleEncerrarSprint() {
    if (!sprint) return
    const incompletos = tarefas.filter(t => t.status !== 'CONCLUIDA').length
    const msg = incompletos > 0
      ? `Encerrar "${sprint.nome}"?\n\n${incompletos} card${incompletos > 1 ? 's' : ''} não concluído${incompletos > 1 ? 's' : ''} ${incompletos > 1 ? 'serão movidos' : 'será movido'} de volta ao backlog.\n\nCards concluídos também voltam ao backlog marcados como concluídos.`
      : `Encerrar "${sprint.nome}"?\n\nTodos os ${tarefas.length} cards estão concluídos e serão movidos para o backlog como concluídos.`
    if (!window.confirm(msg)) return
    setClosingSprint(true)
    try {
      await projetoService.editarSprint(projectId, sprint.id, { status: 'CONCLUIDA' })
      navigate(`/project/${projectId}/backlog`)
    } catch {
      alert('Sem permissão ou erro ao encerrar sprint.')
      setClosingSprint(false)
    }
  }

  async function handleDelete(tarefa) {
    if (!window.confirm(`Excluir "${tarefa.titulo}"?`)) return
    try {
      await projetoService.removerTarefa(projectId, tarefa.id)
      setTarefas(prev => prev.filter(t => t.id !== tarefa.id))
    } catch (err) {
      alert(getErrorMessage(err, 'Erro ao excluir.'))
    }
  }

  function applySort(list) {
    if (sortBy === 'none') return list
    const sorted = [...list]
    if (sortBy === 'prioridade') {
      sorted.sort((a, b) => {
        const d = (PRIORIDADE_ORDER[a.prioridade] ?? 1) - (PRIORIDADE_ORDER[b.prioridade] ?? 1)
        return sortDir === 'asc' ? d : -d
      })
    } else if (sortBy === 'estimativa') {
      sorted.sort((a, b) => {
        const d = (a.estimativa ?? 0) - (b.estimativa ?? 0)
        return sortDir === 'asc' ? d : -d
      })
    }
    return sorted
  }

  function applyFilters(list) {
    const txt = filterText.trim().toLowerCase()
    return list.filter(t => {
      if (txt && !t.titulo.toLowerCase().includes(txt)) return false
      if (filterResponsaveis.size > 0 && !t.responsaveis?.some(r => filterResponsaveis.has(r.id))) return false
      if (filterPrioridades.size > 0 && !filterPrioridades.has(t.prioridade)) return false
      if (filterImpedimento && !t.impedimento) return false
      return true
    })
  }

  if (loading) return (
    <div className={styles.page}>
      <p className={styles.stateText}>Carregando board...</p>
    </div>
  )

  if (error) return (
    <div className={styles.page}>
      <p className={styles.stateError}>{error}</p>
    </div>
  )

  if (noSprint) return (
    <div className={styles.page}>
      <div className={styles.noSprintBox}>
        <p className={styles.noSprintTitle}>Nenhuma sprint em andamento</p>
        <p className={styles.noSprintDesc}>Inicie uma sprint no backlog para visualizar o board.</p>
        <Link to={`/project/${projectId}/backlog`} className={styles.noSprintLink}>
          Ir para o Backlog →
        </Link>
      </div>
    </div>
  )

  const myMembro = membros.find(m => m.id === currentUser?.id)
  const isGerente = myMembro?.papel === 'gerente'

  const hasCustomPerms = myPermissions.size > 0
  const isMembro = myMembro?.papel === 'membro'

  const canCreateTarefas = isGerente || (hasCustomPerms ? myPermissions.has('Criar Tarefas') : isMembro)
  const canEditTarefas   = isGerente || (hasCustomPerms ? myPermissions.has('Editar Tarefas') : isMembro)
  const canDeleteTarefas = isGerente || (hasCustomPerms && myPermissions.has('Excluir Tarefas'))

  const tasksByStatus = Object.fromEntries(
    COLUMNS.map(col => [col.key, applySort(applyFilters(tarefas.filter(t => t.status === col.key)))])
  )

  const visibleMembros = membros.slice(0, 4)
  const extraMembros   = membros.length > 4 ? membros.length - 4 : 0

  return (
    <div className={styles.page}>
      {/* Sub-header ribbon */}
      <div className={styles.subHeader}>
        <div className={styles.subHeaderLeft}>
          <h1 className={styles.pageTitle}>Quadro {projeto?.nome}</h1>
          <span className={styles.sprintChip}>
            <IconBolt />
            {sprint.nome} · Em andamento
          </span>
        </div>

        <div className={styles.subHeaderRight}>
          {visibleMembros.length > 0 && (
            <div className={styles.memberAvatars}>
              {visibleMembros.map(m => (
                <AvatarBubble key={m.id} nome={m.nome || m.email} />
              ))}
              {extraMembros > 0 && (
                <div className={styles.avatarMore}>+{extraMembros}</div>
              )}
            </div>
          )}

          <button
            className={`${styles.btnFilter} ${activeFilterCount > 0 ? styles.btnFilterActive : ''}`}
            onClick={() => setShowFilters(true)}
            type="button"
          >
            <IconFilter />
            Filtros
            {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
          </button>

          <div className={styles.sortWrap}>
            <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="none">Ordenar</option>
              <option value="prioridade">Prioridade</option>
              <option value="estimativa">Estimativa</option>
            </select>
            {sortBy !== 'none' && (
              <button
                className={styles.sortDirBtn}
                onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                title={sortDir === 'asc' ? 'Crescente' : 'Decrescente'}
                type="button"
              >
                {sortDir === 'asc' ? '↑' : '↓'}
              </button>
            )}
          </div>

          <button className={styles.btnRefresh} onClick={fetchAll} title="Recarregar" type="button">↻</button>

          {isGerente && (
            <button
              className={styles.btnEncerrar}
              onClick={handleEncerrarSprint}
              disabled={closingSprint}
              type="button"
            >
              {closingSprint ? 'Encerrando...' : 'Encerrar Sprint'}
            </button>
          )}
        </div>
      </div>

      {aviso && (
        <div className={styles.avisoRegra} role="alert">
          <span>{aviso}</span>
          <button type="button" onClick={() => setAviso('')} aria-label="Fechar aviso">×</button>
        </div>
      )}

      {/* Board canvas */}
      <div className={styles.boardCanvas}>
        <div className={styles.board}>
          {COLUMNS.map(col => (
            <BoardColumn
              key={col.key}
              column={col}
              tarefas={tasksByStatus[col.key] ?? []}
              projectId={projectId}
              onRefresh={fetchAll}
              onMoveStatus={handleMoveStatus}
              onAddCard={status => navigate(`/project/${projectId}/card/new?sprintId=${sprint.id}&status=${status}`)}
              onDetail={t => navigate(`/project/${projectId}/task/${t.id}`)}
              onEdit={t => setEditingCard(t)}
              onDelete={handleDelete}
              canCreateTarefas={canCreateTarefas}
              canEdit={canEditTarefas}
              canDelete={canDeleteTarefas}
              notifsByTarefaId={cardNotifMap}
            />
          ))}
        </div>
      </div>

      {editingCard && (
        <EditCardModal
          tarefa={editingCard}
          projectId={projectId}
          membros={membros}
          onClose={() => setEditingCard(null)}
          onSaved={() => { setEditingCard(null); fetchAll() }}
        />
      )}

      {addingCardStatus && (
        <AddCardModal
          sprint={sprint}
          projectId={projectId}
          defaultStatus={addingCardStatus}
          membros={membros}
          onClose={() => setAddingCardStatus(null)}
          onSaved={() => { setAddingCardStatus(null); fetchAll() }}
        />
      )}

      {showFilters && (
        <FilterPanel
          membros={membros}
          filterText={filterText}
          onFilterText={setFilterText}
          filterResponsaveis={filterResponsaveis}
          onToggleResponsavel={id => toggleSet(setFilterResponsaveis, id)}
          filterPrioridades={filterPrioridades}
          onTogglePrioridade={p => toggleSet(setFilterPrioridades, p)}
          filterImpedimento={filterImpedimento}
          onToggleImpedimento={setFilterImpedimento}
          onClear={clearFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}