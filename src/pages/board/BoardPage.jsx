import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { projetoService } from '../../services/projetoService'
import styles from './BoardPage.module.css'

const COLUMNS = [
  { key: 'A_FAZER',   label: 'A Fazer'   },
  { key: 'FAZENDO',   label: 'Fazendo'   },
  { key: 'TESTE',     label: 'Em Teste'  },
  { key: 'CONCLUIDA', label: 'Concluída' },
]

const PRIORIDADE_ORDER = { ALTA: 0, MEDIA: 1, BAIXA: 2 }

const PRIORIDADE_CFG = {
  ALTA:  { label: 'Alta',  cls: 'prioridadeAlta'  },
  MEDIA: { label: 'Média', cls: 'prioridadeMedia' },
  BAIXA: { label: 'Baixa', cls: 'prioridadeBaixa' },
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

function AvatarBubble({ nome, size = 30 }) {
  const bg  = avatarColor(nome)
  const ini = initials(nome)
  return (
    <div
      className={styles.avatarBubble}
      style={{ background: bg, width: size, height: size, fontSize: size * 0.38 }}
      title={nome}
    >
      {ini}
    </div>
  )
}

function IconBolt() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
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
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12" />
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

function PrioridadeBadge({ value }) {
  if (!value) return null
  const cfg = PRIORIDADE_CFG[value.toUpperCase()] ?? { label: value, cls: 'prioridadeMedia' }
  return <span className={`${styles.badge} ${styles[cfg.cls]}`}>{cfg.label}</span>
}

/* ── Edit Card Modal ── */
function EditCardModal({ tarefa, projectId, membros, onClose, onSaved }) {
  const [titulo, setTitulo]               = useState(tarefa.titulo)
  const [descricao, setDescricao]         = useState(tarefa.descricao ?? '')
  const [estimativa, setEstimativa]       = useState(tarefa.estimativa ?? '')
  const [prioridade, setPrioridade]       = useState(tarefa.prioridade ?? 'MEDIA')
  const [responsavelId, setResponsavelId] = useState(tarefa.responsavelId ? String(tarefa.responsavelId) : '')
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo.trim()) { setError('Título obrigatório'); return }
    setSaving(true); setError('')
    try {
      await projetoService.editarTarefa(projectId, tarefa.id, {
        titulo:        titulo.trim(),
        descricao:     descricao.trim() || titulo.trim(),
        estimativa:    estimativa !== '' ? Number(estimativa) : null,
        prioridade,
        responsavelId: responsavelId ? Number(responsavelId) : -1,
      })
      onSaved()
    } catch {
      setError('Erro ao salvar.')
      setSaving(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Editar Card</h2>
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
            <textarea
              className={`${styles.formInput} ${styles.formTextarea}`}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={3}
            />
          </label>
          <div className={styles.formRow}>
            <label className={styles.formLabel} style={{ flex: 1 }}>
              Estimativa (pts)
              <input
                className={styles.formInput}
                type="number"
                min="0"
                value={estimativa}
                onChange={e => setEstimativa(e.target.value)}
                placeholder="—"
              />
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
          {membros.length > 0 && (
            <label className={styles.formLabel}>
              Responsável
              <select className={styles.formInput} value={responsavelId} onChange={e => setResponsavelId(e.target.value)}>
                <option value="">Sem responsável</option>
                {membros.map(m => (
                  <option key={m.id} value={m.id}>{m.nome || m.email}</option>
                ))}
              </select>
            </label>
          )}
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Add Card Modal ── */
function AddCardModal({ sprint, projectId, defaultStatus, membros, onClose, onSaved }) {
  const [titulo, setTitulo]               = useState('')
  const [estimativa, setEstimativa]       = useState('')
  const [prioridade, setPrioridade]       = useState('MEDIA')
  const [status, setStatus]               = useState(defaultStatus)
  const [responsavelId, setResponsavelId] = useState('')
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState('')

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
        responsavelId: responsavelId ? Number(responsavelId) : null,
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
              Coluna
              <select className={styles.formInput} value={status} onChange={e => setStatus(e.target.value)}>
                {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
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
          <label className={styles.formLabel}>
            Estimativa (pts)
            <input
              className={styles.formInput}
              type="number"
              min="0"
              value={estimativa}
              onChange={e => setEstimativa(e.target.value)}
              placeholder="—"
            />
          </label>
          {membros.length > 0 && (
            <label className={styles.formLabel}>
              Responsável
              <select className={styles.formInput} value={responsavelId} onChange={e => setResponsavelId(e.target.value)}>
                <option value="">Sem responsável</option>
                {membros.map(m => (
                  <option key={m.id} value={m.id}>{m.nome || m.email}</option>
                ))}
              </select>
            </label>
          )}
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnSave} disabled={saving}>
              {saving ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Card context menu ── */
function CardMenu({ tarefa, onEdit, onDelete }) {
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
          <button onClick={() => act(onEdit)}>Editar</button>
          <button className={styles.cardMenuDanger} onClick={() => act(onDelete)}>Excluir</button>
        </div>
      )}
    </div>
  )
}

/* ── Task card — draggable ── */
function TaskCard({ tarefa, projectId, onEdit, onDelete, compact }) {
  const [dragging, setDragging] = useState(false)

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
        className={`${styles.cardCompact} ${dragging ? styles.cardDragging : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={() => setDragging(false)}
      >
        <span className={styles.cardCompactCheck}><IconCheck /></span>
        <span className={styles.cardCompactTitle}>{tarefa.titulo}</span>
        <CardMenu tarefa={tarefa} onEdit={onEdit} onDelete={onDelete} />
      </div>
    )
  }

  return (
    <div
      className={`${styles.card} ${tarefa.impedimento ? styles.cardImpedimento : ''} ${dragging ? styles.cardDragging : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setDragging(false)}
    >
      {tarefa.impedimento && (
        <span className={styles.impedimentoBadge} title="Impedimento">!</span>
      )}
      <div className={styles.cardTopRow}>
        <PrioridadeBadge value={tarefa.prioridade} />
        <CardMenu tarefa={tarefa} onEdit={onEdit} onDelete={onDelete} />
      </div>
      <p className={styles.cardTitle}>{tarefa.titulo}</p>
      {tarefa.descricao && tarefa.descricao !== tarefa.titulo && (
        <p className={styles.cardDesc}>{tarefa.descricao}</p>
      )}
      <div className={styles.cardFooter}>
        {tarefa.estimativa > 0 && (
          <span className={styles.cardPts}>{tarefa.estimativa} SP</span>
        )}
        {tarefa.responsavelNome && (
          <AvatarBubble nome={tarefa.responsavelNome} size={22} />
        )}
      </div>
    </div>
  )
}

/* ── Board column — drop target ── */
function BoardColumn({ column, tarefas, projectId, onRefresh, onAddCard, onEdit, onDelete }) {
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
      await projetoService.atualizarStatus(projectId, tarefaId, { status: column.key })
      onRefresh()
    } finally {
      setDropping(false)
    }
  }

  const colCls = [
    styles.column,
    isCompact ? styles.columnCompact : '',
    isDragOver ? styles.columnDragOver : '',
    dropping   ? styles.columnDropping : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={colCls}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className={styles.columnHeader}>
        <span className={styles.columnTitle}>{column.label}</span>
        <div className={styles.columnHeaderRight}>
          <span className={styles.columnCount}>{tarefas.length}</span>
          <button
            className={styles.columnAddBtn}
            onClick={() => onAddCard(column.key)}
            title={`Adicionar card em ${column.label}`}
            type="button"
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.columnBody}>
        {tarefas.map(t => (
          <TaskCard
            key={t.id}
            tarefa={t}
            projectId={projectId}
            compact={isCompact}
            onEdit={() => onEdit(t)}
            onDelete={() => onDelete(t)}
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

  const [sprint, setSprint]     = useState(null)
  const [tarefas, setTarefas]   = useState([])
  const [projeto, setProjeto]   = useState(null)
  const [membros, setMembros]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [noSprint, setNoSprint] = useState(false)

  const [editingCard, setEditingCard]           = useState(null)
  const [addingCardStatus, setAddingCardStatus] = useState(null)
  const [closingSprint, setClosingSprint]       = useState(false)

  const [sortBy, setSortBy]   = useState('none')
  const [sortDir, setSortDir] = useState('asc')

  const [showFilters, setShowFilters]             = useState(false)
  const [filterText, setFilterText]               = useState('')
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
      const [sprints, proj, mems] = await Promise.all([
        projetoService.listarSprints(projectId),
        projetoService.buscar(projectId),
        projetoService.listarMembros(projectId),
      ])
      setProjeto(proj)
      setMembros(Array.isArray(mems) ? mems : [])

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

  async function handleEncerrarSprint() {
    if (!sprint) return
    if (!window.confirm(`Encerrar "${sprint.nome}"? Tarefas não concluídas voltarão ao backlog.`)) return
    setClosingSprint(true)
    try {
      await projetoService.editarSprint(projectId, sprint.id, { status: 'CONCLUIDA' })
      navigate(`/project/${projectId}/backlog`)
    } catch {
      alert('Erro ao encerrar sprint.')
      setClosingSprint(false)
    }
  }

  async function handleDelete(tarefa) {
    if (!window.confirm(`Excluir "${tarefa.titulo}"?`)) return
    try {
      await projetoService.removerTarefa(projectId, tarefa.id)
      setTarefas(prev => prev.filter(t => t.id !== tarefa.id))
    } catch {
      alert('Erro ao excluir.')
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
      if (filterResponsaveis.size > 0 && !filterResponsaveis.has(t.responsavelId)) return false
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

  const tasksByStatus = Object.fromEntries(
    COLUMNS.map(col => [col.key, applySort(applyFilters(tarefas.filter(t => t.status === col.key)))])
  )
  const totalConcluidas = tasksByStatus['CONCLUIDA']?.length ?? 0
  const progPct = tarefas.length > 0 ? Math.round((totalConcluidas / tarefas.length) * 100) : 0

  const visibleMembros = membros.slice(0, 4)
  const extraMembros   = membros.length > 4 ? membros.length - 4 : 0

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Quadro {projeto?.nome}</h1>
          <div className={styles.pageSubtitle}>
            <span className={styles.sprintChip}>
              <IconBolt />
              {sprint.nome} · Em andamento
            </span>
            <span className={styles.progText}>
              · {tarefas.length} card{tarefas.length !== 1 ? 's' : ''} · {progPct}% concluído
            </span>
          </div>
        </div>

        <div className={styles.pageActions}>
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
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="none">Ordenar por</option>
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

          <button className={styles.btnRefresh} onClick={fetchAll} title="Recarregar" type="button">
            ↻
          </button>

          <button
            className={styles.btnEncerrar}
            onClick={handleEncerrarSprint}
            disabled={closingSprint}
            type="button"
          >
            {closingSprint ? 'Encerrando...' : 'Encerrar Sprint'}
          </button>
        </div>
      </div>

      <div className={styles.board}>
        {COLUMNS.map(col => (
          <BoardColumn
            key={col.key}
            column={col}
            tarefas={tasksByStatus[col.key] ?? []}
            projectId={projectId}
            onRefresh={fetchAll}
            onAddCard={status => setAddingCardStatus(status)}
            onEdit={t => setEditingCard(t)}
            onDelete={handleDelete}
          />
        ))}
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
