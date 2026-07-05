import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projetoService } from '../../services/projetoService'
import { createPokerClient } from '../../services/planningPokerSocket'
import styles from './BacklogPage.module.css'

/* ── Icons ── */
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
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 6 15 12 9 18" />
  </svg>
)
const MoveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5 9 2 12 5 15" /><polyline points="19 9 22 12 19 15" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
)
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const GripIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9"  cy="5"  r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="5"  r="1" fill="currentColor" stroke="none" />
    <circle cx="9"  cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="9"  cy="19" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none" />
  </svg>
)
const BlockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
)
const PokerIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="14" height="18" rx="2" />
    <path d="M8 9h2" /><path d="M8 13h4" /><path d="M8 17h2" />
    <path d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2" />
  </svg>
)

/* ── Assignee avatar ── */
const AVATAR_COLORS = ['#6366f1', '#0891b2', '#f97316', '#15803d', '#be123c', '#7c3aed']
function avatarColor(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || '?'
}
function AssigneeAvatar({ nome }) {
  return (
    <span
      className={styles.assigneeAvatar}
      style={{ background: avatarColor(nome) }}
      title={nome}
    >
      {initials(nome)}
    </span>
  )
}

/* ── Priority badge ── */
const PRIORIDADE_MAP = {
  ALTA:  { label: 'Alta',  cls: 'prioridadeAlta'  },
  MEDIA: { label: 'Média', cls: 'prioridadeMedia' },
  BAIXA: { label: 'Baixa', cls: 'prioridadeBaixa' },
}
function PrioridadeBadge({ value }) {
  if (!value) return null
  const cfg = PRIORIDADE_MAP[value.toUpperCase()] ?? { label: value, cls: 'prioridadeMedia' }
  return <span className={`${styles.badge} ${styles[cfg.cls]}`}>{cfg.label}</span>
}

/* ── Status badge ── */
const STATUS_MAP = {
  A_FAZER:   { label: 'A Fazer',   cls: 'statusAFazer'  },
  FAZENDO:   { label: 'Fazendo',   cls: 'statusFazendo' },
  TESTE:     { label: 'Em Teste',  cls: 'statusTeste'   },
  CONCLUIDA: { label: 'Concluída', cls: 'statusConcluida' },
}
function StatusBadge({ value }) {
  if (!value) return null
  const cfg = STATUS_MAP[value.toUpperCase()] ?? { label: value, cls: 'statusAFazer' }
  return <span className={`${styles.statusBadge} ${styles[cfg.cls]}`}>{cfg.label}</span>
}

/* ── Create sprint modal ── */
function CreateSprintModal({ projectId, onClose, onCreated }) {
  const [nome, setNome]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) { setError('Nome obrigatório.'); return }
    setLoading(true); setError('')
    try {
      await projetoService.criarSprint(projectId, { nome: nome.trim() })
      onCreated(); onClose()
    } catch {
      setError('Erro ao criar sprint.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Nova Sprint</h3>
          <button className={styles.modalClose} onClick={onClose}><XIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <label className={styles.formLabel}>Nome da sprint *</label>
          <input className={styles.formInput} placeholder="ex: Sprint 1" value={nome} onChange={e => setNome(e.target.value)} maxLength={100} autoFocus />
          {error && <p className={styles.formError}>{error}</p>}
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>{loading ? 'Criando...' : 'Criar Sprint'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Move task modal ── */
const BACKLOG_VAL = '__backlog__'

function MoveTaskModal({ tarefa, sprints, projectId, onClose, onMoved }) {
  const currentId = tarefa.sprintId ?? null

  const options = [
    { val: BACKLOG_VAL, label: 'Backlog Geral' },
    ...sprints.map(s => ({ val: String(s.id), label: s.nome })),
  ].filter(opt => {
    if (opt.val === BACKLOG_VAL) return currentId !== null
    return Number(opt.val) !== currentId
  })

  const [targetVal, setTargetVal] = useState(options[0]?.val ?? '')
  const [moving, setMoving]       = useState(false)
  const [error, setError]         = useState('')

  async function handleMove() {
    if (!targetVal) { setError('Selecione destino.'); return }
    setMoving(true); setError('')
    try {
      const sprintId = targetVal === BACKLOG_VAL ? null : Number(targetVal)
      await projetoService.moverTarefa(projectId, tarefa.id, { sprintId })
      onMoved(); onClose()
    } catch {
      setError('Erro ao mover tarefa.')
    } finally {
      setMoving(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Mover Card</h3>
          <button className={styles.modalClose} onClick={onClose}><XIcon /></button>
        </div>
        <p className={styles.moveTaskName}>"{tarefa.titulo}"</p>
        {options.length === 0 ? (
          <p className={styles.emptyNote}>Nenhum destino disponível.</p>
        ) : (
          <div className={styles.modalForm}>
            <label className={styles.formLabel}>Mover para</label>
            <select className={styles.formSelect} value={targetVal} onChange={e => setTargetVal(e.target.value)}>
              {options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
            </select>
            {error && <p className={styles.formError}>{error}</p>}
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
              <button type="button" className={styles.btnPrimary} onClick={handleMove} disabled={moving}>{moving ? 'Movendo...' : 'Mover'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Edit task modal ── */
function EditTaskModal({ tarefa, projectId, membros, onClose, onSaved }) {
  const [titulo, setTitulo]         = useState(tarefa.titulo)
  const [descricao, setDescricao]   = useState(tarefa.descricao ?? '')
  const [estimativa, setEstimativa] = useState(tarefa.estimativa ?? '')
  const [prioridade, setPrioridade] = useState(tarefa.prioridade ?? '')
  const [responsaveisIds, setResponsaveisIds] = useState(
    new Set(tarefa.responsaveis?.map(r => r.id) ?? [])
  )
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  function toggleResp(id) {
    setResponsaveisIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo.trim()) { setError('Título obrigatório.'); return }
    setLoading(true); setError('')
    try {
      await projetoService.editarTarefa(projectId, tarefa.id, {
        titulo:          titulo.trim(),
        descricao:       descricao.trim() || null,
        estimativa:      parseInt(estimativa, 10) || null,
        prioridade:      prioridade || null,
        responsaveisIds: Array.from(responsaveisIds),
      })
      onSaved(); onClose()
    } catch {
      setError('Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Editar Tarefa</h3>
          <button className={styles.modalClose} onClick={onClose}><XIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <label className={styles.formLabel}>Título *</label>
          <input className={styles.formInput} value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={255} autoFocus />
          <label className={styles.formLabel}>Descrição</label>
          <textarea className={`${styles.formInput} ${styles.formTextarea}`} value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} />
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Story Points</label>
              <input className={styles.formInput} type="number" min="0" value={estimativa} onChange={e => setEstimativa(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Prioridade</label>
              <select className={styles.formSelect} value={prioridade} onChange={e => setPrioridade(e.target.value)}>
                <option value="">—</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Média</option>
                <option value="BAIXA">Baixa</option>
              </select>
            </div>
          </div>
          {membros.length > 0 && (
            <>
              <label className={styles.formLabel}>Responsáveis</label>
              <div className={styles.checkList}>
                {membros.map(m => (
                  <label key={m.id} className={styles.checkItem}>
                    <input type="checkbox" checked={responsaveisIds.has(m.id)} onChange={() => toggleResp(m.id)} />
                    <span>{m.nome || m.email}</span>
                  </label>
                ))}
              </div>
            </>
          )}
          {error && <p className={styles.formError}>{error}</p>}
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Add task form (inline) ── */
function AddTaskForm({ sprintId, projectId, membros, onAdded }) {
  const [titulo, setTitulo]               = useState('')
  const [estimativa, setEstimativa]       = useState('')
  const [prioridade, setPrioridade]       = useState('')
  const [responsavelId, setResponsavelId] = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo.trim()) { setError('Título obrigatório.'); return }
    setLoading(true); setError('')
    try {
      await projetoService.criarTarefa(projectId, {
        titulo:        titulo.trim(),
        descricao:     titulo.trim(),
        status:        'A_FAZER',
        estimativa:    parseInt(estimativa, 10) || null,
        prioridade:    prioridade || null,
        sprintId:      sprintId ?? null,
        responsaveisIds: responsavelId ? [Number(responsavelId)] : [],
      })
      setTitulo(''); setEstimativa(''); setPrioridade(''); setResponsavelId('')
      onAdded()
    } catch {
      setError('Erro ao criar card.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.addForm} onSubmit={handleSubmit}>
      <div className={styles.addFormMain}>
        <input className={styles.addInput} placeholder="Título do card..." value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={255} />
        <input className={`${styles.addInput} ${styles.addInputPoints}`} placeholder="Pts" type="number" min="0" value={estimativa} onChange={e => setEstimativa(e.target.value)} />
        <select className={styles.addSelect} value={prioridade} onChange={e => setPrioridade(e.target.value)}>
          <option value="">Prioridade</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Média</option>
          <option value="BAIXA">Baixa</option>
        </select>
        {membros.length > 0 && (
          <select className={styles.addSelect} value={responsavelId} onChange={e => setResponsavelId(e.target.value)}>
            <option value="">Responsável</option>
            {membros.map(m => (
              <option key={m.id} value={m.id}>{m.nome || m.email}</option>
            ))}
          </select>
        )}
        <button type="submit" className={styles.addBtn} disabled={loading}>
          <PlusIcon />{loading ? '...' : 'Adicionar'}
        </button>
      </div>
      {error && <p className={styles.addError}>{error}</p>}
    </form>
  )
}

/* ── Task row — draggable ── */
function TaskRow({ tarefa, projectId, allSprints, membros, activePokerTasks, onRefresh, isGerente, canEditTarefas }) {
  const navigate = useNavigate()
  const hasActivePoker = activePokerTasks?.has(tarefa.id)
  const [editOpen, setEditOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [dragging, setDragging] = useState(false)

  function handleDragStart(e) {
    setDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({
      tarefaId:      tarefa.id,
      sourceSprintId: tarefa.sprintId ?? null,
    }))
  }

  function handleDragEnd() { setDragging(false) }

  async function handleRemove() {
    if (!window.confirm(`Remover "${tarefa.titulo}"?`)) return
    setRemoving(true)
    try {
      await projetoService.removerTarefa(projectId, tarefa.id)
      onRefresh()
    } finally {
      setRemoving(false)
    }
  }

  const rowCls = [
    styles.taskRow,
    tarefa.impedimento ? styles.taskImpedimento : '',
    dragging ? styles.taskRowDragging : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <div className={rowCls} draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className={styles.taskDragHandle} title="Arrastar"><GripIcon /></div>
        <div className={styles.taskLeft}>
          {tarefa.impedimento && (
            <span className={styles.impedimentoMark} title="Impedimento"><BlockIcon /> Impedimento</span>
          )}
          <span className={styles.taskTitle}>{tarefa.titulo}</span>
          <div className={styles.taskBadges}>
            <PrioridadeBadge value={tarefa.prioridade} />
            <StatusBadge value={tarefa.status} />
          </div>
        </div>
        <div className={styles.taskRight}>
          {tarefa.responsaveis?.map(r => <AssigneeAvatar key={r.id} nome={r.nome} />)}
          {tarefa.estimativa > 0 && <span className={styles.taskPoints}>{tarefa.estimativa} pts</span>}
          <button
            className={`${styles.iconBtn} ${hasActivePoker ? styles.iconBtnPokerActive : ''}`}
            title={hasActivePoker ? 'Estimativa Colaborativa — sessão ativa' : 'Estimativa Colaborativa'}
            onClick={() => navigate(`/project/${projectId}/planning-poker/${tarefa.id}`)}
          >
            <PokerIcon />
            {hasActivePoker && <span className={styles.pokerActiveDot} />}
          </button>
          {canEditTarefas !== false && <button className={styles.iconBtn} title="Detalhes" onClick={() => navigate(`/project/${projectId}/task/${tarefa.id}`)}><EditIcon /></button>}
          {canEditTarefas !== false && <button className={styles.iconBtn} title="Mover" onClick={() => setMoveOpen(true)}><MoveIcon /></button>}
          {isGerente && <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Remover" disabled={removing} onClick={handleRemove}><TrashIcon /></button>}
        </div>
      </div>

      {editOpen && <EditTaskModal tarefa={tarefa} projectId={projectId} membros={membros} onClose={() => setEditOpen(false)} onSaved={onRefresh} />}
      {moveOpen && <MoveTaskModal tarefa={tarefa} sprints={allSprints} projectId={projectId} onClose={() => setMoveOpen(false)} onMoved={onRefresh} />}
    </>
  )
}

/* ── Drop zone hook ── */
function useDropZone({ targetSprintId, projectId, onRefresh }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dropping, setDropping]     = useState(false)
  const counter = useRef(0)

  function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }

  function onDragEnter(e) { e.preventDefault(); counter.current++; setIsDragOver(true) }

  function onDragLeave() { counter.current--; if (counter.current === 0) setIsDragOver(false) }

  async function onDrop(e) {
    e.preventDefault()
    counter.current = 0; setIsDragOver(false)
    let data
    try { data = JSON.parse(e.dataTransfer.getData('text/plain')) } catch { return }
    const { tarefaId, sourceSprintId } = data
    if (sourceSprintId === targetSprintId) return
    setDropping(true)
    try {
      await projetoService.moverTarefa(projectId, tarefaId, { sprintId: targetSprintId })
      onRefresh()
    } finally {
      setDropping(false)
    }
  }

  return { isDragOver, dropping, onDragOver, onDragEnter, onDragLeave, onDrop }
}

/* ── Sprint section ── */
const SPRINT_STATUS_LABEL = {
  EM_PLANEJAMENTO: 'Planejada',
  EM_ANDAMENTO:    'Em andamento',
  CONCLUIDA:       'Concluída',
}
const SPRINT_STATUS_CLS = {
  EM_PLANEJAMENTO: 'sprintStatusPlanejada',
  EM_ANDAMENTO:    'sprintStatusAndamento',
  CONCLUIDA:       'sprintStatusConcluida',
}

function SprintSection({ sprint, tarefas, projectId, allSprints, membros, activePokerTasks, isGerente, canCreateTarefas, onRefresh }) {
  const [collapsed, setCollapsed]       = useState(false)
  const [updatingStatus, setUpdatingSt] = useState(false)

  const dropZone = useDropZone({ targetSprintId: sprint.id, projectId, onRefresh })

  const total    = tarefas.length
  const totalPts = tarefas.reduce((a, t) => a + (t.estimativa || 0), 0)
  const conclPts = tarefas.filter(t => t.status === 'CONCLUIDA').reduce((a, t) => a + (t.estimativa || 0), 0)
  const progPct  = totalPts > 0 ? Math.round((conclPts / totalPts) * 100) : 0

  const canStart  = sprint.status === 'EM_PLANEJAMENTO' && !allSprints.some(s => s.status === 'EM_ANDAMENTO')
  const canFinish = sprint.status === 'EM_ANDAMENTO'

  async function changeStatus(novoStatus) {
    setUpdatingSt(true)
    try {
      await projetoService.editarSprint(projectId, sprint.id, { status: novoStatus })
      onRefresh()
    } catch {
      alert('Sem permissão para alterar o status da sprint.')
    } finally {
      setUpdatingSt(false)
    }
  }

  const statusLabel = SPRINT_STATUS_LABEL[sprint.status] ?? sprint.status
  const statusCls   = styles[SPRINT_STATUS_CLS[sprint.status]] ?? ''

  const cardCls = [
    styles.sprintCard,
    dropZone.isDragOver ? styles.dropTargetActive   : '',
    dropZone.dropping   ? styles.dropTargetDropping : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={cardCls}
      onDragOver={dropZone.onDragOver}
      onDragEnter={dropZone.onDragEnter}
      onDragLeave={dropZone.onDragLeave}
      onDrop={dropZone.onDrop}
    >
      <div className={styles.sprintCardHeader}>
        <button className={styles.collapseBtn} onClick={() => setCollapsed(c => !c)} aria-label="toggle">
          {collapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
        </button>
        <div className={styles.sprintCardInfo}>
          <div className={styles.sprintCardTop}>
            <span className={styles.sprintCardName}>{sprint.nome}</span>
            <span className={`${styles.sprintStatusBadge} ${statusCls}`}>{statusLabel}</span>
          </div>
          <div className={styles.sprintCardMeta}>
            <span className={styles.sprintPts}>{conclPts}/{totalPts} pts</span>
            <span className={styles.sprintCards}>{total} card{total !== 1 ? 's' : ''}</span>
            <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${progPct}%` }} /></div>
            <span className={styles.progressPct}>{progPct}%</span>
          </div>
        </div>
        <div className={styles.sprintCardActions}>
          {isGerente && canStart  && <button className={styles.btnStart}  disabled={updatingStatus} onClick={() => changeStatus('EM_ANDAMENTO')}>{updatingStatus ? '...' : 'Iniciar Sprint'}</button>}
          {isGerente && canFinish && <button className={styles.btnFinish} disabled={updatingStatus} onClick={() => changeStatus('CONCLUIDA')}>{updatingStatus ? '...' : 'Encerrar Sprint'}</button>}
        </div>
      </div>

      {!collapsed && (
        <div className={styles.sprintCardBody}>
          {canCreateTarefas && (
            <AddTaskForm sprintId={sprint.id} projectId={projectId} membros={membros} onAdded={onRefresh} />
          )}
          {tarefas.length === 0 ? (
            dropZone.isDragOver
              ? <div className={styles.dropHint}>Soltar aqui para adicionar à sprint</div>
              : <p className={styles.emptyNote}>Nenhum card. Adicione acima ou arraste do backlog.</p>
          ) : (
            <div className={styles.taskList}>
              {tarefas.map(t => (
                <TaskRow key={t.id} tarefa={t} projectId={projectId} allSprints={allSprints} membros={membros} activePokerTasks={activePokerTasks} onRefresh={onRefresh} isGerente={isGerente} canEditTarefas={canCreateTarefas} />
              ))}
              {dropZone.isDragOver && <div className={styles.dropHint}>Soltar aqui</div>}
            </div>
          )}
        </div>
      )}

      {collapsed && dropZone.isDragOver && (
        <div className={styles.collapsedDropHint}>Soltar aqui para adicionar à "{sprint.nome}"</div>
      )}
    </div>
  )
}

/* ── Main page ── */
export default function BacklogPage() {
  const { projectId } = useParams()
  const [backlogTarefas, setBacklogTarefas] = useState([])
  const [sprints, setSprints]               = useState([])
  const [sprintTarefas, setSprintTarefas]   = useState({})
  const [membros, setMembros]               = useState([])
  const [currentUser, setCurrentUser]       = useState(null)
  const [activePokerTasks, setActivePokerTasks] = useState(new Set())
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState('')
  const [showCreateSprint, setShowCreateSprint] = useState(false)
  const [backlogCollapsed, setBacklogCollapsed] = useState(false)
  const pokerStompRef = useRef(null)

  /* ── WS: escuta sessões ativas em tempo real ── */
  useEffect(() => {
    const client = createPokerClient({
      onConnect: () => {
        client.subscribe(
          `/topic/projetos/${projectId}/planning-poker`,
          msg => {
            const evento = JSON.parse(msg.body)
            const tid = evento.sessao?.tarefaId
            if (!tid) return
            if (evento.tipo === 'SESSAO_CRIADA') {
              setActivePokerTasks(prev => new Set([...prev, tid]))
            } else if (evento.tipo === 'SESSAO_FINALIZADA' || evento.tipo === 'SESSAO_CANCELADA') {
              setActivePokerTasks(prev => { const n = new Set(prev); n.delete(tid); return n })
            }
          }
        )
      },
    })
    client.activate()
    pokerStompRef.current = client
    return () => client.deactivate()
  }, [projectId])

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [backlogData, sprintsData, membrosData, activePokerIds, userData] = await Promise.all([
        projetoService.getBacklog(projectId),
        projetoService.listarSprints(projectId),
        projetoService.listarMembros(projectId),
        projetoService.listarTarefasComSessaoAtiva(projectId).catch(() => []),
        projetoService.buscarUsuarioAtual().catch(() => null),
      ])
      setCurrentUser(userData)
      setActivePokerTasks(new Set(Array.isArray(activePokerIds) ? activePokerIds : []))
      setMembros(Array.isArray(membrosData) ? membrosData : [])
      setBacklogTarefas(Array.isArray(backlogData) ? backlogData : [])

      const allSprints = Array.isArray(sprintsData) ? sprintsData : []
      setSprints(allSprints)

      const tarefaMap = {}
      await Promise.all(
        allSprints.map(async s => {
          try {
            const t = await projetoService.listarTarefas(projectId, s.id)
            tarefaMap[s.id] = Array.isArray(t) ? t : []
          } catch {
            tarefaMap[s.id] = []
          }
        })
      )
      setSprintTarefas(tarefaMap)
    } catch {
      setError('Erro ao carregar backlog.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetchAll() }, [fetchAll])

  const backlogPts = backlogTarefas.reduce((a, t) => a + (t.estimativa || 0), 0)

  const myMembro = membros.find(m => m.id === currentUser?.id)
  const isGerente = myMembro?.papel === 'gerente'
  const canCreateTarefas = myMembro?.papel !== 'visualizador'

  const backlogDrop = useDropZone({ targetSprintId: null, projectId, onRefresh: fetchAll })

  if (loading) return <div className={styles.page}><p className={styles.stateText}>Carregando backlog...</p></div>
  if (error)   return <div className={styles.page}><p className={styles.stateError}>{error}</p></div>

  const backlogCardCls = [
    styles.backlogCard,
    backlogDrop.isDragOver ? styles.dropTargetActive   : '',
    backlogDrop.dropping   ? styles.dropTargetDropping : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Backlog</h1>
          <p className={styles.pageSubtitle}>Planeje sprints e gerencie os cards do produto.</p>
        </div>
        {isGerente && (
          <button className={styles.btnPrimary} onClick={() => setShowCreateSprint(true)}>
            <PlusIcon /> Criar Nova Sprint
          </button>
        )}
      </div>

      <div className={styles.content}>
        {sprints.length === 0 ? (
          <div className={styles.emptySprints}>
            <p>Nenhuma sprint criada.</p>
            {isGerente && (
              <button className={styles.btnPrimary} onClick={() => setShowCreateSprint(true)}>
                <PlusIcon /> Criar Sprint
              </button>
            )}
          </div>
        ) : (
          <div className={styles.sprintList}>
            {sprints.map(s => (
              <SprintSection
                key={s.id}
                sprint={s}
                tarefas={sprintTarefas[s.id] ?? []}
                projectId={projectId}
                allSprints={sprints}
                membros={membros}
                activePokerTasks={activePokerTasks}
                isGerente={isGerente}
                canCreateTarefas={canCreateTarefas}
                onRefresh={fetchAll}
              />
            ))}
          </div>
        )}

        <div
          className={backlogCardCls}
          onDragOver={backlogDrop.onDragOver}
          onDragEnter={backlogDrop.onDragEnter}
          onDragLeave={backlogDrop.onDragLeave}
          onDrop={backlogDrop.onDrop}
        >
          <div className={styles.backlogCardHeader}>
            <button className={styles.collapseBtn} onClick={() => setBacklogCollapsed(c => !c)}>
              {backlogCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
            </button>
            <div className={styles.sprintCardInfo}>
              <div className={styles.sprintCardTop}>
                <span className={styles.sprintCardName}>Backlog Geral</span>
                <span className={styles.backlogCountBadge}>{backlogTarefas.length} cards</span>
              </div>
              <div className={styles.sprintCardMeta}>
                <span className={styles.sprintPts}>{backlogPts} pts total</span>
              </div>
            </div>
          </div>

          {!backlogCollapsed && (
            <div className={styles.sprintCardBody}>
              {canCreateTarefas && (
                <AddTaskForm sprintId={null} projectId={projectId} membros={membros} onAdded={fetchAll} />
              )}
              {backlogTarefas.length === 0 ? (
                backlogDrop.isDragOver
                  ? <div className={styles.dropHint}>Soltar aqui para devolver ao backlog</div>
                  : <p className={styles.emptyNote}>Nenhum card no backlog.</p>
              ) : (
                <div className={styles.taskList}>
                  {backlogTarefas.map(t => (
                    <TaskRow key={t.id} tarefa={t} projectId={projectId} allSprints={sprints} membros={membros} activePokerTasks={activePokerTasks} onRefresh={fetchAll} isGerente={isGerente} canEditTarefas={canCreateTarefas} />
                  ))}
                  {backlogDrop.isDragOver && <div className={styles.dropHint}>Soltar aqui para devolver ao backlog</div>}
                </div>
              )}
            </div>
          )}

          {backlogCollapsed && backlogDrop.isDragOver && (
            <div className={styles.collapsedDropHint}>Soltar aqui para devolver ao backlog</div>
          )}
        </div>
      </div>

      {showCreateSprint && (
        <CreateSprintModal projectId={projectId} onClose={() => setShowCreateSprint(false)} onCreated={fetchAll} />
      )}
    </div>
  )
}
